// Minimal WASM glue for unrar — replaces the emscripten-generated loader.
// Only handles instantiation from a provided wasmBinary (no file loading).

export interface EmscriptenModule {
  wasmBinary: ArrayBuffer;
  HEAPU8: Uint8Array;
  cwrap(ident: string, returnType: string, argTypes: string[]): (...args: number[]) => number;
  _rar_alloc_context: () => number;
  _rar_free_context: (ctx: number) => void;
  _rar_decompress: (ctx: number, ver: number, winSize: number, inPtr: number, inSize: number, outPtr: number, outSize: number, solid: number, isFirst: number) => number;
  _malloc: (size: number) => number;
  _free: (ptr: number) => void;
}

interface WasmExports {
  memory: WebAssembly.Memory;
  __indirect_function_table: WebAssembly.Table;
  __wasm_call_ctors: () => void;
  rar_alloc_context: () => number;
  rar_free_context: (a0: number) => void;
  rar_decompress: (a0: number, a1: number, a2: number, a3: number, a4: number, a5: number, a6: number, a7: number, a8: number) => number;
  malloc: (a0: number) => number;
  free: (a0: number) => void;
  setThrew: (a0: number, a1: number) => void;
  setTempRet0: (a0: number) => void;
  stackSave: () => number;
  stackRestore: (a0: number) => void;
  stackAlloc: (a0: number) => number;
  __cxa_increment_exception_refcount: (a0: number) => void;
  __cxa_decrement_exception_refcount: (a0: number) => void;
  __cxa_can_catch: (a0: number, a1: number, a2: number) => number;
  __cxa_is_pointer_type: (a0: number) => number;
  __cxa_free_exception: (a0: number) => void;
  dynCall_viji: (a0: number, a1: number, a2: number, a3: number, a4: number) => void;
}

// Wasm exports — set once during instantiation, referenced by closures above.
let ex: WasmExports;

let wasmMemory: WebAssembly.Memory;
let HEAP8: Int8Array;
let HEAPU8: Uint8Array;
let HEAPU32: Uint32Array;

function updateMemoryViews(): void {
  const b = wasmMemory.buffer;
  HEAP8 = new Int8Array(b);
  HEAPU8 = new Uint8Array(b);
  HEAPU32 = new Uint32Array(b);
}

// ─── C++ exception support ─────────────────────────────────────────────────

interface ExcInfo {
  excPtr: number;
  ptr: number;
  setType(type: number): void;
  getType(): number;
  setCaught(caught: boolean): void;
  getCaught(): boolean;
  setRethrown(rethrown: boolean): void;
  getRethrown(): boolean;
  init(type: number, destructor: number): void;
  setAdjustedPtr(adjustedPtr: number): void;
  getAdjustedPtr(): number;
  getExceptionPtr(): number;
}

function makeExcInfo(excPtr: number): ExcInfo {
  const ptr = excPtr - 24;
  return {
    excPtr,
    ptr,
    setType(type: number) {
      HEAPU32[ptr + 4 >> 2] = type;
    },
    getType() {
      return HEAPU32[ptr + 4 >> 2];
    },
    setCaught(caught: boolean) {
      HEAP8[ptr + 12] = caught ? 1 : 0;
    },
    getCaught() {
      return HEAP8[ptr + 12] !== 0;
    },
    setRethrown(rethrown: boolean) {
      HEAP8[ptr + 13] = rethrown ? 1 : 0;
    },
    getRethrown() {
      return HEAP8[ptr + 13] !== 0;
    },
    init(type: number, destructor: number) {
      this.setAdjustedPtr(0);
      this.setType(type);
      HEAPU32[ptr + 8 >> 2] = destructor;
    },
    setAdjustedPtr(adjustedPtr: number) {
      HEAPU32[ptr + 16 >> 2] = adjustedPtr;
    },
    getAdjustedPtr() {
      return HEAPU32[ptr + 16 >> 2];
    },
    getExceptionPtr() {
      if (ex.__cxa_is_pointer_type(this.getType())) {
        return HEAPU32[excPtr >> 2];
      }
      const adjusted = this.getAdjustedPtr();
      return adjusted !== 0 ? adjusted : excPtr;
    },
  };
}

const exceptionCaught: ExcInfo[] = [];
let exceptionLast = 0;
let uncaughtExceptionCount = 0;

function cxaBeginCatch(ptr: number): number {
  const info = makeExcInfo(ptr);
  if (!info.getCaught()) {
    info.setCaught(true);
    uncaughtExceptionCount--;
  }
  info.setRethrown(false);
  exceptionCaught.push(info);
  ex.__cxa_increment_exception_refcount(info.excPtr);
  return info.getExceptionPtr();
}

function cxaEndCatch(): void {
  ex.setThrew(0, 0);
  const info = exceptionCaught.pop()!;
  ex.__cxa_decrement_exception_refcount(info.excPtr);
  exceptionLast = 0;
}

function cxaGetExceptionPtr(ptr: number): number {
  return makeExcInfo(ptr).getExceptionPtr();
}

function cxaThrow(ptr: number, type: number, destructor: number): never {
  const info = makeExcInfo(ptr);
  info.init(type, destructor);
  exceptionLast = ptr;
  uncaughtExceptionCount++;
  throw exceptionLast;
}

function resumeException(ptr: number): never {
  if (!exceptionLast) {
    exceptionLast = ptr;
  }
  throw exceptionLast;
}

function findMatchingCatch(args: number[]): number {
  const thrown = exceptionLast;
  if (!thrown) {
    ex.setTempRet0(0);
    return 0;
  }
  const info = makeExcInfo(thrown);
  info.setAdjustedPtr(thrown);
  const thrownType = info.getType();
  if (!thrownType) {
    ex.setTempRet0(0);
    return thrown;
  }
  for (let i = 0; i < args.length; i++) {
    const caughtType = args[i];
    if (caughtType === 0 || caughtType === thrownType) {
      break;
    }
    if (ex.__cxa_can_catch(caughtType, thrownType, info.ptr + 16)) {
      ex.setTempRet0(caughtType);
      return thrown;
    }
  }
  ex.setTempRet0(thrownType);
  return thrown;
}

// ─── Runtime imports ───────────────────────────────────────────────────────

function emscriptenMemcpyJs(dest: number, src: number, num: number): void {
  HEAPU8.copyWithin(dest, src, src + num);
}

function emscriptenResizeHeap(requestedSize: number): boolean {
  const oldSize = HEAPU8.length;
  requestedSize >>>= 0;
  const maxHeapSize = 2147483648;
  if (requestedSize > maxHeapSize) {
    return false;
  }
  const alignUp = (x: number, multiple: number) => x + (multiple - x % multiple) % multiple;
  for (let cutDown = 1; cutDown <= 4; cutDown *= 2) {
    let overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
    overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
    const newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
    const pages = (newSize - wasmMemory.buffer.byteLength + 65535) / 65536;
    try {
      wasmMemory.grow(pages);
      updateMemoryViews();
      return true;
    } catch {
      // continue
    }
  }
  return false;
}

// ─── Wasm table (for invoke trampolines) ──────────────────────────────────

let wasmTable: WebAssembly.Table;
const wasmTableMirror: (Function | undefined)[] = [];

function getWasmTableEntry(funcPtr: number): Function {
  let func = wasmTableMirror[funcPtr];
  if (!func) {
    if (funcPtr >= wasmTableMirror.length) {
      wasmTableMirror.length = funcPtr + 1;
    }
    wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr) as Function;
  }
  return func;
}

// ─── invoke trampoline (C++ exception unwinding through JS) ──────────────

function invoke(fn: () => number | void): number | undefined {
  const sp = ex.stackSave();
  try {
    return fn() as number | undefined;
  } catch (e) {
    ex.stackRestore(sp);
    if (e !== (e as number) + 0) {
      throw e;
    }
    ex.setThrew(1, 0);
    return undefined;
  }
}

// ─── cwrap ─────────────────────────────────────────────────────────────────

const utf8Decoder = new TextDecoder('utf8');

function utf8ToString(ptr: number): string {
  if (!ptr) {
    return '';
  }
  let endPtr = ptr;
  while (HEAPU8[endPtr]) {
    endPtr++;
  }
  return utf8Decoder.decode(HEAPU8.subarray(ptr, endPtr));
}

function lengthBytesUTF8(str: string): number {
  let len = 0;
  for (let i = 0; i < str.length; ++i) {
    const c = str.charCodeAt(i);
    if (c <= 0x7F) {
      len++;
    } else if (c <= 0x7FF) {
      len += 2;
    } else if (c >= 0xD800 && c <= 0xDFFF) {
      len += 4;
      ++i;
    } else {
      len += 3;
    }
  }
  return len;
}

function stringToUTF8(str: string, outPtr: number, maxBytesToWrite: number): void {
  let outIdx = outPtr;
  const endIdx = outIdx + maxBytesToWrite - 1;
  for (let i = 0; i < str.length; ++i) {
    let u = str.charCodeAt(i);
    if (u >= 0xD800 && u <= 0xDFFF) {
      u = 0x10000 + ((u & 0x3FF) << 10) | (str.charCodeAt(++i) & 0x3FF);
    }
    if (u <= 0x7F) {
      if (outIdx >= endIdx) {
        break;
      }
      HEAPU8[outIdx++] = u;
    } else if (u <= 0x7FF) {
      if (outIdx + 1 >= endIdx) {
        break;
      }
      HEAPU8[outIdx++] = 0xC0 | (u >> 6);
      HEAPU8[outIdx++] = 0x80 | (u & 0x3F);
    } else if (u <= 0xFFFF) {
      if (outIdx + 2 >= endIdx) {
        break;
      }
      HEAPU8[outIdx++] = 0xE0 | (u >> 12);
      HEAPU8[outIdx++] = 0x80 | ((u >> 6) & 0x3F);
      HEAPU8[outIdx++] = 0x80 | (u & 0x3F);
    } else {
      if (outIdx + 3 >= endIdx) {
        break;
      }
      HEAPU8[outIdx++] = 0xF0 | (u >> 18);
      HEAPU8[outIdx++] = 0x80 | ((u >> 12) & 0x3F);
      HEAPU8[outIdx++] = 0x80 | ((u >> 6) & 0x3F);
      HEAPU8[outIdx++] = 0x80 | (u & 0x3F);
    }
  }
  HEAPU8[outIdx] = 0;
}

function cwrap(
  ident: string,
  returnType: string,
  argTypes?: string[],
): (...args: number[]) => number {
  const func = (ex as unknown as Record<string, (...args: number[]) => number>)[ident];
  if (returnType !== 'string' && (!argTypes || argTypes.every(t => t === 'number' || t === 'boolean'))) {
    return func;
  }
  return function(...args: unknown[]): number {
    const stack = ex.stackSave();
    try {
      const cArgs: number[] = [];
      for (let i = 0; i < args.length; i++) {
        if (argTypes && argTypes[i] === 'string') {
          const s = args[i] as string;
          const size = lengthBytesUTF8(s) + 1;
          const ptr = ex.stackAlloc(size);
          stringToUTF8(s, ptr, size);
          cArgs[i] = ptr;
        } else {
          cArgs[i] = args[i] as number;
        }
      }
      const ret = func(...cArgs);
      return returnType === 'string' ? utf8ToString(ret) as unknown as number : ret;
    } finally {
      ex.stackRestore(stack);
    }
  };
}

// ─── Instantiate WASM ──────────────────────────────────────────────────────

export default async function createUnrarModule(moduleArg: { wasmBinary: ArrayBuffer }): Promise<EmscriptenModule> {
  const Module = moduleArg as EmscriptenModule;

  const wasmImports: WebAssembly.Imports = {
    env: {
      __cxa_begin_catch: cxaBeginCatch,
      __cxa_end_catch: cxaEndCatch,
      __cxa_find_matching_catch_2: () => findMatchingCatch([]),
      __cxa_find_matching_catch_3: (a0: number) => findMatchingCatch([a0]),
      __cxa_find_matching_catch_5: (a0: number, a1: number, a2: number) => findMatchingCatch([a0, a1, a2]),
      __cxa_get_exception_ptr: cxaGetExceptionPtr,
      __cxa_throw: cxaThrow,
      __resumeException: resumeException,
      abort: () => {
        throw new WebAssembly.RuntimeError('abort');
      },
      emscripten_memcpy_js: emscriptenMemcpyJs,
      emscripten_resize_heap: emscriptenResizeHeap,
      invoke_ii: (i: number, a1: number) => invoke(() => getWasmTableEntry(i)(a1)),
      invoke_iii: (i: number, a1: number, a2: number) => invoke(() => getWasmTableEntry(i)(a1, a2)),
      invoke_iiii: (i: number, a1: number, a2: number, a3: number) => invoke(() => getWasmTableEntry(i)(a1, a2, a3)),
      invoke_iiiii: (i: number, a1: number, a2: number, a3: number, a4: number) => invoke(() => getWasmTableEntry(i)(a1, a2, a3, a4)),
      invoke_v: (i: number) => invoke(() => getWasmTableEntry(i)()),
      invoke_vi: (i: number, a1: number) => invoke(() => getWasmTableEntry(i)(a1)),
      invoke_vii: (i: number, a1: number, a2: number) => invoke(() => getWasmTableEntry(i)(a1, a2)),
      invoke_viii: (i: number, a1: number, a2: number, a3: number) => invoke(() => getWasmTableEntry(i)(a1, a2, a3)),
      invoke_viiii: (i: number, a1: number, a2: number, a3: number, a4: number) => invoke(() => getWasmTableEntry(i)(a1, a2, a3, a4)),
      invoke_viji: (i: number, a1: number, a2: number, a3: number, a4: number) => invoke(() => ex.dynCall_viji(i, a1, a2, a3, a4)),
      llvm_eh_typeid_for: (type: number) => type,
    },
    wasi_snapshot_preview1: {},
  };

  const { instance } = await WebAssembly.instantiate(Module.wasmBinary, wasmImports);
  ex = instance.exports as unknown as WasmExports;

  wasmMemory = ex.memory;
  wasmTable = ex.__indirect_function_table;
  updateMemoryViews();

  Module._rar_alloc_context = ex.rar_alloc_context;
  Module._rar_free_context = ex.rar_free_context;
  Module._rar_decompress = ex.rar_decompress;
  Module._malloc = ex.malloc;
  Module._free = ex.free;
  Module.HEAPU8 = HEAPU8;
  Module.cwrap = cwrap;

  ex.__wasm_call_ctors();

  return Module;
}
