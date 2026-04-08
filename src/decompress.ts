import type {Reader, RawEntry, Options} from './types.js';

// ─── Configuration ────────────────────────────────────────────────────────────

const config: { wasmURL: string } = {
  wasmURL: '',
};

// ─── WASM module types ───────────────────────────────────────────────────────

interface EmscriptenInstance {
  cwrap(name: string, returnType: string, argTypes: string[]): (...args: number[]) => number;
  _malloc(size: number): number;
  _free(ptr: number): void;
  HEAPU8: Uint8Array;
}

interface WasmModule {
  _instance: EmscriptenInstance;
  allocContext: () => number;
  freeContext: (ctx: number) => void;
  decompress: (...args: number[]) => number;
  malloc: (size: number) => number;
  free: (ptr: number) => void;
  heap: () => Uint8Array;
}

// ─── WASM module cache ────────────────────────────────────────────────────────

let wasmModule: WasmModule | null = null;
let wasmLoadPromise: Promise<WasmModule> | null = null;

async function loadWasmModule(): Promise<WasmModule> {
  const url = config.wasmURL;
  if (!url) {
    throw new Error(
      'RAR decompression requires the WASM module.\n' +
      '1. Compile it: npm run build-wasm (requires Emscripten)\n' +
      '2. Point to it: setOptions({ wasmURL: "path/to/unrar-wasm.js" })',
    );
  }

  const mod = await import(/* webpackIgnore: true */ url);
  const factory = mod.default || mod;
  const instance: EmscriptenInstance = await factory();

  return {
    _instance: instance,
    allocContext:  instance.cwrap('rar_alloc_context',  'number', []) as unknown as () => number,
    freeContext:   instance.cwrap('rar_free_context',   'void',   ['number']) as unknown as (ctx: number) => void,
    decompress:    instance.cwrap('rar_decompress', 'number',
      ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number']) as unknown as (...args: number[]) => number,
    malloc: instance._malloc,
    free:   instance._free,
    heap:   () => instance.HEAPU8,
  };
}

async function getWasm(): Promise<WasmModule> {
  if (wasmModule) {
    return wasmModule;
  }
  if (wasmLoadPromise) {
    return wasmLoadPromise;
  }
  wasmLoadPromise = loadWasmModule().then(m => {
    wasmModule = m;
    wasmLoadPromise = null;
    return m;
  });
  return wasmLoadPromise;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isStore(rawEntry: RawEntry): boolean {
  return rawEntry.method === 0 || rawEntry.method === 0x30;
}

function copyToWasm(wasm: WasmModule, src: Uint8Array): number {
  const ptr = wasm.malloc(src.byteLength);
  if (!ptr) {
    throw new Error('WASM malloc failed');
  }
  wasm.heap().set(src, ptr);
  return ptr;
}

async function wasmDecompress(
  wasm: WasmModule,
  ctx: number,
  compressedBytes: Uint8Array,
  rawEntry: RawEntry,
  isSolid: boolean,
  isFirst: boolean,
): Promise<ArrayBuffer> {
  const inPtr  = copyToWasm(wasm, compressedBytes);
  const outPtr = wasm.malloc(rawEntry.uncompressedSize);
  if (!outPtr) {
    wasm.free(inPtr);
    throw new Error('WASM malloc failed for output buffer');
  }

  try {
    const result = wasm.decompress(
      ctx,
      rawEntry.unpVer,
      rawEntry.winSize,
      inPtr,  compressedBytes.byteLength,
      outPtr, rawEntry.uncompressedSize,
      isSolid  ? 1 : 0,
      isFirst  ? 1 : 0,
    );

    if (result !== 0) {
      throw new Error(`WASM decompression failed (code ${result})`);
    }

    const out = new Uint8Array(rawEntry.uncompressedSize);
    out.set(wasm.heap().subarray(outPtr, outPtr + rawEntry.uncompressedSize));
    return out.buffer;
  } finally {
    wasm.free(inPtr);
    wasm.free(outPtr);
  }
}

// ─── Public decompression API ─────────────────────────────────────────────────

export async function decompressEntry(reader: Reader, rawEntry: RawEntry): Promise<ArrayBuffer> {
  if (rawEntry.encrypted) {
    throw new Error(`encrypted entries are not supported: "${rawEntry.name}"`);
  }
  if (rawEntry.isDirectory) {
    return new ArrayBuffer(0);
  }

  const src = await reader.read(rawEntry.dataOffset, rawEntry.compressedSize);

  if (isStore(rawEntry)) {
    return (src.buffer as ArrayBuffer).slice(src.byteOffset, src.byteOffset + src.byteLength);
  }

  const wasm = await getWasm();
  const ctx  = wasm.allocContext();
  try {
    return await wasmDecompress(wasm, ctx, src, rawEntry, false, true);
  } finally {
    wasm.freeContext(ctx);
  }
}

export async function decompressSolid(reader: Reader, rawEntries: RawEntry[]): Promise<(Blob | null)[]> {
  if (rawEntries.length === 0) {
    return [];
  }

  const results: (Blob | null)[] = new Array(rawEntries.length).fill(null);
  const needsDecomp = rawEntries.some(e => !e.isDirectory && !isStore(e));

  let wasm: WasmModule | null = null;
  let ctx: number | null = null;

  if (needsDecomp) {
    wasm = await getWasm();
    ctx  = wasm.allocContext();
  }

  try {
    let isFirst = true;
    for (let i = 0; i < rawEntries.length; i++) {
      const raw = rawEntries[i];

      if (raw.isDirectory || raw.compressedSize === 0) {
        if (!raw.isDirectory) {
          results[i] = new Blob([]);
        }
        continue;
      }

      if (raw.encrypted) {
        throw new Error(`encrypted entries are not supported: "${raw.name}"`);
      }

      const src = await reader.read(raw.dataOffset, raw.compressedSize);

      let buf: ArrayBuffer;
      if (isStore(raw)) {
        buf = (src.buffer as ArrayBuffer).slice(src.byteOffset, src.byteOffset + src.byteLength);
      } else {
        buf = await wasmDecompress(wasm!, ctx!, src, raw, true, isFirst);
        isFirst = false;
      }

      results[i] = new Blob([buf]);
    }
  } finally {
    if (ctx !== null) {
      wasm!.freeContext(ctx);
    }
  }

  return results;
}

// ─── Module lifecycle ─────────────────────────────────────────────────────────

export function setOptions(options: Options): void {
  if (options.wasmURL !== undefined) {
    config.wasmURL = options.wasmURL;
    wasmModule = null;
    wasmLoadPromise = null;
  }
}

export function cleanup(): void {
  wasmModule = null;
  wasmLoadPromise = null;
}
