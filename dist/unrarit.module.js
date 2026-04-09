/* unrarit@0.0.6, license MIT */
function readBlobAsArrayBuffer(blob) {
    if (blob.arrayBuffer) {
        return blob.arrayBuffer();
    }
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('loadend', () => {
            resolve(reader.result);
        });
        reader.addEventListener('error', reject);
        reader.readAsArrayBuffer(blob);
    });
}
function isSharedArrayBuffer(b) {
    return typeof SharedArrayBuffer !== 'undefined' && b instanceof SharedArrayBuffer;
}
(typeof process !== 'undefined') &&
    process.versions &&
    (typeof process.versions.node !== 'undefined') &&
    (typeof process.versions.electron === 'undefined');

class ArrayBufferReader {
    typedArray;
    constructor(arrayBufferOrView) {
        this.typedArray = (arrayBufferOrView instanceof ArrayBuffer || isSharedArrayBuffer(arrayBufferOrView))
            ? new Uint8Array(arrayBufferOrView)
            : new Uint8Array(arrayBufferOrView.buffer, arrayBufferOrView.byteOffset, arrayBufferOrView.byteLength);
    }
    async getLength() {
        return this.typedArray.byteLength;
    }
    async read(offset, length) {
        return new Uint8Array(this.typedArray.buffer, this.typedArray.byteOffset + offset, length);
    }
}

class BlobReader {
    blob;
    constructor(blob) {
        this.blob = blob;
    }
    async getLength() {
        return this.blob.size;
    }
    async read(offset, length) {
        const blob = this.blob.slice(offset, offset + length);
        const arrayBuffer = await readBlobAsArrayBuffer(blob);
        return new Uint8Array(arrayBuffer);
    }
    async sliceAsBlob(offset, length, type = '') {
        return this.blob.slice(offset, offset + length, type);
    }
}

class HTTPRangeReader {
    url;
    length;
    constructor(url) {
        this.url = url;
    }
    async getLength() {
        if (this.length === undefined) {
            const req = await fetch(this.url, { method: 'HEAD' });
            if (!req.ok) {
                throw new Error(`failed http request ${this.url}, status: ${req.status}: ${req.statusText}`);
            }
            this.length = parseInt(req.headers.get('content-length'));
            if (Number.isNaN(this.length)) {
                throw Error('could not get length');
            }
        }
        return this.length;
    }
    async read(offset, size) {
        if (size === 0) {
            return new Uint8Array(0);
        }
        const req = await fetch(this.url, {
            headers: {
                Range: `bytes=${offset}-${offset + size - 1}`,
            },
        });
        if (!req.ok) {
            throw new Error(`failed http request ${this.url}, status: ${req.status} offset: ${offset} size: ${size}: ${req.statusText}`);
        }
        const buffer = await req.arrayBuffer();
        return new Uint8Array(buffer);
    }
}

// Minimal WASM glue for unrar — replaces the emscripten-generated loader.
// Only handles instantiation from a provided wasmBinary (no file loading).
// Wasm exports — set once during instantiation, referenced by closures above.
let ex;
let wasmMemory;
let HEAP8;
let HEAPU8;
let HEAPU32;
function updateMemoryViews() {
    const b = wasmMemory.buffer;
    HEAP8 = new Int8Array(b);
    HEAPU8 = new Uint8Array(b);
    HEAPU32 = new Uint32Array(b);
}
function makeExcInfo(excPtr) {
    const ptr = excPtr - 24;
    return {
        excPtr,
        ptr,
        setType(type) {
            HEAPU32[ptr + 4 >> 2] = type;
        },
        getType() {
            return HEAPU32[ptr + 4 >> 2];
        },
        setCaught(caught) {
            HEAP8[ptr + 12] = caught ? 1 : 0;
        },
        getCaught() {
            return HEAP8[ptr + 12] !== 0;
        },
        setRethrown(rethrown) {
            HEAP8[ptr + 13] = rethrown ? 1 : 0;
        },
        getRethrown() {
            return HEAP8[ptr + 13] !== 0;
        },
        init(type, destructor) {
            this.setAdjustedPtr(0);
            this.setType(type);
            HEAPU32[ptr + 8 >> 2] = destructor;
        },
        setAdjustedPtr(adjustedPtr) {
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
const exceptionCaught = [];
let exceptionLast = 0;
function cxaBeginCatch(ptr) {
    const info = makeExcInfo(ptr);
    if (!info.getCaught()) {
        info.setCaught(true);
    }
    info.setRethrown(false);
    exceptionCaught.push(info);
    ex.__cxa_increment_exception_refcount(info.excPtr);
    return info.getExceptionPtr();
}
function cxaEndCatch() {
    ex.setThrew(0, 0);
    const info = exceptionCaught.pop();
    ex.__cxa_decrement_exception_refcount(info.excPtr);
    exceptionLast = 0;
}
function cxaGetExceptionPtr(ptr) {
    return makeExcInfo(ptr).getExceptionPtr();
}
function cxaThrow(ptr, type, destructor) {
    const info = makeExcInfo(ptr);
    info.init(type, destructor);
    exceptionLast = ptr;
    throw exceptionLast;
}
function resumeException(ptr) {
    if (!exceptionLast) {
        exceptionLast = ptr;
    }
    throw exceptionLast;
}
function findMatchingCatch(args) {
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
function emscriptenMemcpyJs(dest, src, num) {
    HEAPU8.copyWithin(dest, src, src + num);
}
function emscriptenResizeHeap(requestedSize) {
    const oldSize = HEAPU8.length;
    requestedSize >>>= 0;
    const maxHeapSize = 2147483648;
    if (requestedSize > maxHeapSize) {
        return false;
    }
    const alignUp = (x, multiple) => x + (multiple - x % multiple) % multiple;
    for (let cutDown = 1; cutDown <= 4; cutDown *= 2) {
        let overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
        overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
        const newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
        const pages = (newSize - wasmMemory.buffer.byteLength + 65535) / 65536;
        try {
            wasmMemory.grow(pages);
            updateMemoryViews();
            return true;
        }
        catch {
            // continue
        }
    }
    return false;
}
// ─── Wasm table (for invoke trampolines) ──────────────────────────────────
let wasmTable;
const wasmTableMirror = [];
function getWasmTableEntry(funcPtr) {
    let func = wasmTableMirror[funcPtr];
    if (!func) {
        if (funcPtr >= wasmTableMirror.length) {
            wasmTableMirror.length = funcPtr + 1;
        }
        wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
    }
    return func;
}
// ─── invoke trampoline (C++ exception unwinding through JS) ──────────────
function invoke(fn) {
    const sp = ex.stackSave();
    try {
        return fn();
    }
    catch (e) {
        ex.stackRestore(sp);
        if (e !== e + 0) {
            throw e;
        }
        ex.setThrew(1, 0);
        return undefined;
    }
}
// ─── cwrap ─────────────────────────────────────────────────────────────────
const utf8Decoder$1 = new TextDecoder('utf8');
function utf8ToString(ptr) {
    if (!ptr) {
        return '';
    }
    let endPtr = ptr;
    while (HEAPU8[endPtr]) {
        endPtr++;
    }
    return utf8Decoder$1.decode(HEAPU8.subarray(ptr, endPtr));
}
function lengthBytesUTF8(str) {
    let len = 0;
    for (let i = 0; i < str.length; ++i) {
        const c = str.charCodeAt(i);
        if (c <= 0x7F) {
            len++;
        }
        else if (c <= 0x7FF) {
            len += 2;
        }
        else if (c >= 0xD800 && c <= 0xDFFF) {
            len += 4;
            ++i;
        }
        else {
            len += 3;
        }
    }
    return len;
}
function stringToUTF8(str, outPtr, maxBytesToWrite) {
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
        }
        else if (u <= 0x7FF) {
            if (outIdx + 1 >= endIdx) {
                break;
            }
            HEAPU8[outIdx++] = 0xC0 | (u >> 6);
            HEAPU8[outIdx++] = 0x80 | (u & 0x3F);
        }
        else if (u <= 0xFFFF) {
            if (outIdx + 2 >= endIdx) {
                break;
            }
            HEAPU8[outIdx++] = 0xE0 | (u >> 12);
            HEAPU8[outIdx++] = 0x80 | ((u >> 6) & 0x3F);
            HEAPU8[outIdx++] = 0x80 | (u & 0x3F);
        }
        else {
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
function cwrap(ident, returnType, argTypes) {
    const func = ex[ident];
    if (returnType !== 'string' && (!argTypes || argTypes.every(t => t === 'number' || t === 'boolean'))) {
        return func;
    }
    return function (...args) {
        const stack = ex.stackSave();
        try {
            const cArgs = [];
            for (let i = 0; i < args.length; i++) {
                if (argTypes && argTypes[i] === 'string') {
                    const s = args[i];
                    const size = lengthBytesUTF8(s) + 1;
                    const ptr = ex.stackAlloc(size);
                    stringToUTF8(s, ptr, size);
                    cArgs[i] = ptr;
                }
                else {
                    cArgs[i] = args[i];
                }
            }
            const ret = func(...cArgs);
            return returnType === 'string' ? utf8ToString(ret) : ret;
        }
        finally {
            ex.stackRestore(stack);
        }
    };
}
// ─── Instantiate WASM ──────────────────────────────────────────────────────
async function createUnrarModule(moduleArg) {
    const Module = moduleArg;
    const wasmImports = {
        env: {
            __cxa_begin_catch: cxaBeginCatch,
            __cxa_end_catch: cxaEndCatch,
            __cxa_find_matching_catch_2: () => findMatchingCatch([]),
            __cxa_find_matching_catch_3: (a0) => findMatchingCatch([a0]),
            __cxa_find_matching_catch_5: (a0, a1, a2) => findMatchingCatch([a0, a1, a2]),
            __cxa_get_exception_ptr: cxaGetExceptionPtr,
            __cxa_throw: cxaThrow,
            __resumeException: resumeException,
            abort: () => {
                throw new WebAssembly.RuntimeError('abort');
            },
            emscripten_memcpy_js: emscriptenMemcpyJs,
            emscripten_resize_heap: emscriptenResizeHeap,
            invoke_ii: (i, a1) => invoke(() => getWasmTableEntry(i)(a1)),
            invoke_iii: (i, a1, a2) => invoke(() => getWasmTableEntry(i)(a1, a2)),
            invoke_iiii: (i, a1, a2, a3) => invoke(() => getWasmTableEntry(i)(a1, a2, a3)),
            invoke_iiiii: (i, a1, a2, a3, a4) => invoke(() => getWasmTableEntry(i)(a1, a2, a3, a4)),
            invoke_v: (i) => invoke(() => getWasmTableEntry(i)()),
            invoke_vi: (i, a1) => invoke(() => getWasmTableEntry(i)(a1)),
            invoke_vii: (i, a1, a2) => invoke(() => getWasmTableEntry(i)(a1, a2)),
            invoke_viii: (i, a1, a2, a3) => invoke(() => getWasmTableEntry(i)(a1, a2, a3)),
            invoke_viiii: (i, a1, a2, a3, a4) => invoke(() => getWasmTableEntry(i)(a1, a2, a3, a4)),
            invoke_viji: (i, a1, a2, a3, a4) => invoke(() => ex.dynCall_viji(i, a1, a2, a3, a4)),
            llvm_eh_typeid_for: (type) => type,
        },
        wasi_snapshot_preview1: {},
    };
    const { instance } = await WebAssembly.instantiate(Module.wasmBinary, wasmImports);
    ex = instance.exports;
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

// Auto-generated — do not edit. Run: node build/embed-wasm.js
const wasmBase64 = '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';

// ─── Embedded WASM decompression ─────────────────────────────────────────────
async function decodeEmbeddedWasm() {
    const compressed = Uint8Array.from(atob(wasmBase64), c => c.charCodeAt(0));
    const ds = new DecompressionStream('gzip');
    const decompressedStream = new Blob([compressed]).stream().pipeThrough(ds);
    return await new Response(decompressedStream).arrayBuffer();
}
// ─── WASM module cache ────────────────────────────────────────────────────────
let wasmModule = null;
let wasmLoadPromise = null;
async function loadWasmModule() {
    const wasmBinary = await decodeEmbeddedWasm();
    const instance = await createUnrarModule({ wasmBinary });
    return {
        allocContext: instance.cwrap('rar_alloc_context', 'number', []),
        freeContext: instance.cwrap('rar_free_context', 'void', ['number']),
        decompress: instance.cwrap('rar_decompress', 'number', ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number']),
        malloc: instance._malloc,
        free: instance._free,
        heap: () => instance.HEAPU8,
    };
}
async function getWasm() {
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
function isStore(rawEntry) {
    return rawEntry.method === 0 || rawEntry.method === 0x30;
}
function copyToWasm(wasm, src) {
    const ptr = wasm.malloc(src.byteLength);
    if (!ptr) {
        throw new Error('WASM malloc failed');
    }
    wasm.heap().set(src, ptr);
    return ptr;
}
async function wasmDecompress(wasm, ctx, compressedBytes, rawEntry, isSolid, isFirst) {
    const inPtr = copyToWasm(wasm, compressedBytes);
    const outPtr = wasm.malloc(rawEntry.uncompressedSize);
    if (!outPtr) {
        wasm.free(inPtr);
        throw new Error('WASM malloc failed for output buffer');
    }
    try {
        const result = wasm.decompress(ctx, rawEntry.unpVer, rawEntry.winSize, inPtr, compressedBytes.byteLength, outPtr, rawEntry.uncompressedSize, isSolid ? 1 : 0, isFirst ? 1 : 0);
        if (result !== 0) {
            throw new Error(`WASM decompression failed (code ${result})`);
        }
        const out = new Uint8Array(rawEntry.uncompressedSize);
        out.set(wasm.heap().subarray(outPtr, outPtr + rawEntry.uncompressedSize));
        return out.buffer;
    }
    finally {
        wasm.free(inPtr);
        wasm.free(outPtr);
    }
}
// ─── Public decompression API ─────────────────────────────────────────────────
async function decompressEntry(reader, rawEntry) {
    if (rawEntry.encrypted) {
        throw new Error(`encrypted entries are not supported: "${rawEntry.name}"`);
    }
    if (rawEntry.isDirectory) {
        return new ArrayBuffer(0);
    }
    const src = await reader.read(rawEntry.dataOffset, rawEntry.compressedSize);
    if (isStore(rawEntry)) {
        return src.buffer.slice(src.byteOffset, src.byteOffset + src.byteLength);
    }
    const wasm = await getWasm();
    const ctx = wasm.allocContext();
    try {
        return await wasmDecompress(wasm, ctx, src, rawEntry, false, true);
    }
    finally {
        wasm.freeContext(ctx);
    }
}
async function decompressSolid(reader, rawEntries) {
    if (rawEntries.length === 0) {
        return [];
    }
    const results = new Array(rawEntries.length).fill(null);
    const needsDecomp = rawEntries.some(e => !e.isDirectory && !isStore(e));
    let wasm = null;
    let ctx = null;
    if (needsDecomp) {
        wasm = await getWasm();
        ctx = wasm.allocContext();
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
            let buf;
            if (isStore(raw)) {
                buf = src.buffer.slice(src.byteOffset, src.byteOffset + src.byteLength);
            }
            else {
                buf = await wasmDecompress(wasm, ctx, src, raw, true, isFirst);
                isFirst = false;
            }
            results[i] = new Blob([buf]);
        }
    }
    finally {
        if (ctx !== null) {
            wasm.freeContext(ctx);
        }
    }
    return results;
}
// ─── Module lifecycle ─────────────────────────────────────────────────────────
function cleanup$1() {
    wasmModule = null;
    wasmLoadPromise = null;
}

// ─── RAR4 constants ──────────────────────────────────────────────────────────
const BLOCK4_MARKER = 0x72;
const BLOCK4_ARCHIVE = 0x73;
const BLOCK4_FILE = 0x74;
const BLOCK4_SERVICE = 0x7a;
const BLOCK4_END = 0x7b;
const MHD_VOLUME = 0x0001;
const MHD_SOLID = 0x0008;
const MHD_PASSWORD = 0x0080;
const LHD_PASSWORD = 0x0004;
const LHD_SOLID = 0x0010;
const LHD_WINDOWMASK = 0x00e0;
const LHD_DIRECTORY = 0x00e0;
const LHD_LARGE = 0x0100;
const LHD_UNICODE = 0x0200;
const LONG_BLOCK = 0x8000;
// ─── RAR5 constants ──────────────────────────────────────────────────────────
const HEAD5_MAIN = 0x01;
const HEAD5_FILE = 0x02;
const HEAD5_SERVICE = 0x03;
const HEAD5_CRYPT = 0x04;
const HEAD5_ENDARC = 0x05;
const HFL_EXTRA = 0x0001;
const HFL_DATA = 0x0002;
const HFL_SPLITBEFORE = 0x0008;
const HFL_SPLITAFTER = 0x0010;
const MHFL_VOLUME = 0x0001;
const MHFL_SOLID = 0x0004;
const FHFL_DIRECTORY = 0x0001;
const FHFL_UTIME = 0x0002;
const FHFL_CRC32 = 0x0004;
const FHFL_UNPUNKNOWN = 0x0008;
const FCI_SOLID = 0x0040;
const FCI_METHOD_SHIFT = 7;
const FCI_METHOD_MASK = 0x7;
// ─── Binary reading helpers ───────────────────────────────────────────────────
function u16(data, offset) {
    return (data[offset] | (data[offset + 1] << 8)) >>> 0;
}
function u32(data, offset) {
    return ((data[offset]) +
        (data[offset + 1] * 0x100) +
        (data[offset + 2] * 0x10000) +
        (data[offset + 3] * 0x1000000)) >>> 0;
}
function readVint(data, pos) {
    let value = 0;
    let multiplier = 1;
    let bytesRead = 0;
    for (let i = 0; i < 8; i++) {
        if (pos + i >= data.length) {
            throw new Error('unexpected end reading vint');
        }
        const byte = data[pos + i];
        value += (byte & 0x7F) * multiplier;
        multiplier *= 128;
        bytesRead++;
        if ((byte & 0x80) === 0) {
            break;
        }
    }
    return { value, bytesRead };
}
// ─── Filename decoding ────────────────────────────────────────────────────────
const utf8Decoder = new TextDecoder('utf-8');
function decodeRar4Name(nameBytes, flags) {
    if (!(flags & LHD_UNICODE)) {
        return utf8Decoder.decode(nameBytes);
    }
    let oemLen = 0;
    while (oemLen < nameBytes.length && nameBytes[oemLen] !== 0) {
        oemLen++;
    }
    const oemName = nameBytes.slice(0, oemLen);
    const encData = nameBytes.slice(oemLen + 1);
    if (encData.length === 0) {
        return utf8Decoder.decode(oemName);
    }
    let encPos = 0;
    let decPos = 0;
    const chars = [];
    const highByte = encData[encPos++];
    let flags8 = 0;
    let flagBits = 0;
    while (encPos < encData.length) {
        if (flagBits === 0) {
            flags8 = encData[encPos++];
            flagBits = 8;
        }
        const flag = flags8 >>> 6;
        flags8 = (flags8 << 2) & 0xFF;
        flagBits -= 2;
        switch (flag) {
            case 0:
                if (encPos < encData.length) {
                    chars[decPos++] = encData[encPos++];
                }
                break;
            case 1:
                if (encPos < encData.length) {
                    chars[decPos++] = encData[encPos++] | (highByte << 8);
                }
                break;
            case 2:
                if (encPos + 1 < encData.length) {
                    chars[decPos++] = encData[encPos] | (encData[encPos + 1] << 8);
                    encPos += 2;
                }
                break;
            case 3: {
                if (encPos >= encData.length) {
                    break;
                }
                let length = encData[encPos++];
                if (length & 0x80) {
                    if (encPos >= encData.length) {
                        break;
                    }
                    const correction = encData[encPos++];
                    for (length = (length & 0x7F) + 2; length > 0 && decPos < oemLen; length--, decPos++) {
                        chars[decPos] = ((oemName[decPos] + correction) & 0xFF) | (highByte << 8);
                    }
                }
                else {
                    for (length += 2; length > 0 && decPos < oemLen; length--, decPos++) {
                        chars[decPos] = oemName[decPos];
                    }
                }
                break;
            }
        }
    }
    return String.fromCharCode(...chars);
}
// ─── Date helpers ─────────────────────────────────────────────────────────────
function dosDateTimeToDate(dosDateTime) {
    const time = dosDateTime & 0xFFFF;
    const date = (dosDateTime >>> 16) & 0xFFFF;
    const day = date & 0x1f;
    const month = ((date >>> 5) & 0xf) - 1;
    const year = ((date >>> 9) & 0x7f) + 1980;
    const second = (time & 0x1f) * 2;
    const minute = (time >>> 5) & 0x3f;
    const hour = (time >>> 11) & 0x1f;
    return new Date(year, month, day, hour, minute, second);
}
async function parseRar4(reader, totalLength) {
    let pos = 7;
    let isSolid = false;
    let isVolume = false;
    const rawEntries = [];
    while (pos < totalLength) {
        if (pos + 7 > totalLength) {
            break;
        }
        const minHeader = await reader.read(pos, Math.min(7, totalLength - pos));
        if (minHeader.length < 7) {
            break;
        }
        const headType = minHeader[2];
        const headFlags = u16(minHeader, 3);
        const headSize = u16(minHeader, 5);
        if (headSize < 7) {
            throw new Error(`corrupt RAR4: block header too small (${headSize}) at offset ${pos}`);
        }
        if (pos + headSize > totalLength) {
            throw new Error('corrupt RAR4: block header extends past end of file');
        }
        const header = await reader.read(pos, headSize);
        let blockDataSize = 0;
        switch (headType) {
            case BLOCK4_MARKER:
                break;
            case BLOCK4_ARCHIVE: {
                if (headFlags & MHD_PASSWORD) {
                    throw new Error('encrypted RAR archives are not supported');
                }
                isSolid = (headFlags & MHD_SOLID) !== 0;
                isVolume = (headFlags & MHD_VOLUME) !== 0;
                break;
            }
            case BLOCK4_FILE:
            case BLOCK4_SERVICE: {
                if (headSize < 32) {
                    throw new Error(`corrupt RAR4: file header too small (${headSize})`);
                }
                let packSize = u32(header, 7);
                let unpSize = u32(header, 11);
                const crc32 = u32(header, 16);
                const fileTime = u32(header, 20);
                const unpVer = header[24];
                const method = header[25];
                const nameSize = u16(header, 26);
                const fileAttr = u32(header, 28);
                let nameOffset = 32;
                const isLarge = (headFlags & LHD_LARGE) !== 0;
                if (isLarge) {
                    if (headSize < 40) {
                        throw new Error('corrupt RAR4: LHD_LARGE but header too small');
                    }
                    const highPack = u32(header, 32);
                    const highUnp = u32(header, 36);
                    packSize = packSize + highPack * 0x100000000;
                    unpSize = (unpSize === 0xFFFFFFFF && highUnp === 0xFFFFFFFF)
                        ? -1
                        : unpSize + highUnp * 0x100000000;
                    nameOffset = 40;
                }
                if (headSize < nameOffset + nameSize) {
                    throw new Error('corrupt RAR4: header too small for filename');
                }
                const nameBytes = header.slice(nameOffset, nameOffset + nameSize);
                let name = decodeRar4Name(nameBytes, headFlags).replace(/\\/g, '/');
                const isDir = (headFlags & LHD_WINDOWMASK) === LHD_DIRECTORY ||
                    (unpVer < 20 && (fileAttr & 0x10) !== 0);
                if (isDir && !name.endsWith('/')) {
                    name += '/';
                }
                const encrypted = (headFlags & LHD_PASSWORD) !== 0;
                const isSolidEntry = (headFlags & LHD_SOLID) !== 0 || (isSolid && unpVer < 20);
                if (headType === BLOCK4_FILE) {
                    rawEntries.push({
                        name,
                        nameBytes,
                        uncompressedSize: unpSize,
                        compressedSize: packSize,
                        method,
                        unpVer,
                        winSize: isDir ? 0 : (0x10000 << ((headFlags & LHD_WINDOWMASK) >>> 5)),
                        dataOffset: pos + headSize,
                        isDirectory: isDir,
                        encrypted,
                        isSolid: isSolidEntry,
                        crc32,
                        mtime: dosDateTimeToDate(fileTime),
                        comment: null,
                        commentBytes: null,
                        format: 4,
                    });
                }
                blockDataSize = packSize;
                break;
            }
            case BLOCK4_END:
                pos = totalLength;
                break;
            default:
                if ((headFlags & LONG_BLOCK) && headSize >= 11) {
                    blockDataSize = u32(header, 7);
                }
                break;
        }
        if (headType === BLOCK4_END) {
            break;
        }
        pos += headSize + blockDataSize;
    }
    return { isSolid, isVolume, rawEntries };
}
// ─── RAR5 parser ─────────────────────────────────────────────────────────────
async function parseRar5(reader, totalLength) {
    let pos = 8;
    let isSolid = false;
    let isVolume = false;
    const rawEntries = [];
    while (pos < totalLength) {
        if (pos + 7 > totalLength) {
            break;
        }
        const initial = await reader.read(pos, Math.min(7, totalLength - pos));
        if (initial.length < 7) {
            break;
        }
        let blockSize = 0;
        let vintFactor = 1;
        let vintBytes = 0;
        for (let i = 0; i < 3; i++) {
            const byte = initial[4 + i];
            blockSize += (byte & 0x7F) * vintFactor;
            vintFactor *= 128;
            vintBytes++;
            if ((byte & 0x80) === 0) {
                break;
            }
        }
        if (blockSize === 0) {
            throw new Error('corrupt RAR5: zero block size');
        }
        const totalHeaderSize = 4 + vintBytes + blockSize;
        if (totalHeaderSize > 2 * 1024 * 1024 + 7) {
            throw new Error(`corrupt RAR5: header too large (${totalHeaderSize})`);
        }
        const alreadyRead = Math.min(7 - 4 - vintBytes, blockSize);
        const contentStart = 4 + vintBytes;
        let content;
        if (alreadyRead >= blockSize) {
            content = initial.slice(contentStart, contentStart + blockSize);
        }
        else {
            content = new Uint8Array(blockSize);
            content.set(initial.slice(contentStart, contentStart + alreadyRead));
            const rest = await reader.read(pos + 4 + vintBytes + alreadyRead, blockSize - alreadyRead);
            content.set(rest, alreadyRead);
        }
        let cpos = 0;
        const getV = () => {
            const r = readVint(content, cpos);
            cpos += r.bytesRead;
            return r.value;
        };
        const get4 = () => {
            const v = u32(content, cpos);
            cpos += 4;
            return v;
        };
        const getBytes = (n) => {
            const v = content.slice(cpos, cpos + n);
            cpos += n;
            return v;
        };
        const blockType = getV();
        const blockFlags = getV();
        if (blockFlags & HFL_EXTRA) {
            getV();
        }
        const dataAreaSize = (blockFlags & HFL_DATA) ? getV() : 0;
        const dataOffset = pos + totalHeaderSize;
        switch (blockType) {
            case HEAD5_CRYPT:
                throw new Error('encrypted RAR5 archives are not supported');
            case HEAD5_MAIN: {
                const arcFlags = getV();
                isSolid = (arcFlags & MHFL_SOLID) !== 0;
                isVolume = (arcFlags & MHFL_VOLUME) !== 0;
                break;
            }
            case HEAD5_FILE: {
                const fileFlags = getV();
                const unpSize = getV();
                /* fileAttr = */ getV();
                let mtime = null;
                if (fileFlags & FHFL_UTIME) {
                    mtime = new Date(get4() * 1000);
                }
                let crc32 = 0;
                if (fileFlags & FHFL_CRC32) {
                    crc32 = get4();
                }
                const compInfo = getV();
                const method = (compInfo >>> FCI_METHOD_SHIFT) & FCI_METHOD_MASK;
                const isSolidEntry = (compInfo & FCI_SOLID) !== 0;
                const unpVerRaw = compInfo & 0x3F;
                const unpVer = unpVerRaw === 0 ? 50 : 70;
                /* hostOS = */ getV();
                const nameSize = getV();
                const nameBytes = getBytes(nameSize);
                let name = utf8Decoder.decode(nameBytes).replace(/\\/g, '/');
                const isDir = (fileFlags & FHFL_DIRECTORY) !== 0;
                const unknownSz = (fileFlags & FHFL_UNPUNKNOWN) !== 0;
                if (isDir && !name.endsWith('/')) {
                    name += '/';
                }
                const splitBefore = (blockFlags & HFL_SPLITBEFORE) !== 0;
                const splitAfter = (blockFlags & HFL_SPLITAFTER) !== 0;
                const dictLog = (compInfo >>> 10) & 0x0F;
                const winSize = isDir ? 0 : (0x20000 << dictLog);
                rawEntries.push({
                    name,
                    nameBytes,
                    uncompressedSize: unknownSz ? -1 : unpSize,
                    compressedSize: dataAreaSize,
                    method,
                    unpVer,
                    winSize,
                    dataOffset,
                    isDirectory: isDir,
                    encrypted: false,
                    isSolid: isSolidEntry || isSolid,
                    crc32,
                    mtime: mtime || new Date(0),
                    comment: null,
                    commentBytes: null,
                    format: 5,
                    splitBefore,
                    splitAfter,
                });
                break;
            }
            case HEAD5_SERVICE:
                break;
            case HEAD5_ENDARC:
                pos = totalLength;
                break;
        }
        if (blockType === HEAD5_ENDARC) {
            break;
        }
        pos += totalHeaderSize + dataAreaSize;
    }
    return { isSolid, isVolume, rawEntries };
}
// ─── Format detection ─────────────────────────────────────────────────────────
async function detectFormat(reader) {
    const sig = await reader.read(0, 8);
    if (sig[0] === 0x52 && sig[1] === 0x61 && sig[2] === 0x72 && sig[3] === 0x21 &&
        sig[4] === 0x1A && sig[5] === 0x07 && sig[6] === 0x01 && sig[7] === 0x00) {
        return 5;
    }
    if (sig[0] === 0x52 && sig[1] === 0x61 && sig[2] === 0x72 && sig[3] === 0x21 &&
        sig[4] === 0x1A && sig[5] === 0x07 && sig[6] === 0x00) {
        return 4;
    }
    throw new Error('not a RAR archive (unrecognised signature)');
}
// ─── Rar archive object ───────────────────────────────────────────────────────
class Rar {
    comment = null;
    commentBytes = null;
    #blobs = [];
    _trackBlob(blob) {
        this.#blobs.push(blob);
    }
    dispose() {
        this.#blobs = [];
    }
    [Symbol.dispose]() {
        this.dispose();
    }
}
// ─── RarEntry ─────────────────────────────────────────────────────────────────
class RarEntry {
    name;
    nameBytes;
    size;
    compressedSize;
    comment;
    commentBytes;
    lastModDate;
    isDirectory;
    encrypted;
    #reader;
    #rawEntry;
    #solidBlob;
    constructor(reader, rawEntry, solidBlob) {
        this.#reader = reader;
        this.#rawEntry = rawEntry;
        this.#solidBlob = solidBlob;
        this.name = rawEntry.name;
        this.nameBytes = rawEntry.nameBytes;
        this.size = rawEntry.uncompressedSize;
        this.compressedSize = rawEntry.compressedSize;
        this.comment = rawEntry.comment;
        this.commentBytes = rawEntry.commentBytes;
        this.lastModDate = rawEntry.mtime;
        this.isDirectory = rawEntry.isDirectory;
        this.encrypted = rawEntry.encrypted;
    }
    async arrayBuffer() {
        if (this.#solidBlob) {
            return this.#solidBlob.arrayBuffer();
        }
        return decompressEntry(this.#reader, this.#rawEntry);
    }
    async blob(type = 'application/octet-stream') {
        if (this.#solidBlob) {
            return type === 'application/octet-stream'
                ? this.#solidBlob
                : new Blob([this.#solidBlob], { type });
        }
        const buf = await decompressEntry(this.#reader, this.#rawEntry);
        return new Blob([buf], { type });
    }
    async text() {
        const buf = await this.arrayBuffer();
        return utf8Decoder.decode(new Uint8Array(buf));
    }
    async json() {
        return JSON.parse(await this.text());
    }
}
// ─── Reader factory ───────────────────────────────────────────────────────────
async function makeReader(source) {
    if (typeof Blob !== 'undefined' && source instanceof Blob) {
        return new BlobReader(source);
    }
    if (source instanceof ArrayBuffer) {
        return new ArrayBufferReader(source);
    }
    if (isSharedArrayBuffer(source)) {
        return new ArrayBufferReader(source);
    }
    if (typeof source === 'object' && source !== null && 'buffer' in source) {
        if (isSharedArrayBuffer(source.buffer) || source.buffer instanceof ArrayBuffer) {
            return new ArrayBufferReader(source);
        }
    }
    if (typeof source === 'string') {
        const req = await fetch(source);
        if (!req.ok) {
            throw new Error(`failed http request ${source}, status: ${req.status}: ${req.statusText}`);
        }
        return new BlobReader(await req.blob());
    }
    if (typeof source === 'object' && source !== null &&
        'getLength' in source && typeof source.getLength === 'function' &&
        'read' in source && typeof source.read === 'function') {
        return source;
    }
    throw new Error('unsupported source type');
}
// ─── Public API ───────────────────────────────────────────────────────────────
async function unrarRaw(source) {
    const reader = await makeReader(source);
    const totalLength = await reader.getLength();
    if (totalLength > Number.MAX_SAFE_INTEGER) {
        throw new Error(`file too large (${totalLength} bytes)`);
    }
    const format = await detectFormat(reader);
    const { isSolid, isVolume, rawEntries } = format === 5
        ? await parseRar5(reader, totalLength)
        : await parseRar4(reader, totalLength);
    if (isVolume) {
        throw new Error('multi-volume RAR archives are not supported');
    }
    const rar = new Rar();
    let entries;
    if (isSolid) {
        const blobs = await decompressSolid(reader, rawEntries);
        entries = rawEntries.map((raw, i) => {
            const blob = blobs[i];
            if (blob) {
                rar._trackBlob(blob);
            }
            return new RarEntry(reader, raw, blob);
        });
    }
    else {
        entries = rawEntries.map(raw => new RarEntry(reader, raw, null));
    }
    return { rar, entries };
}
async function unrar(source) {
    const { rar, entries } = await unrarRaw(source);
    return {
        rar,
        entries: Object.fromEntries(entries.map(e => [e.name, e])),
    };
}
function cleanup() {
    cleanup$1();
}

export { HTTPRangeReader, Rar, RarEntry, cleanup, unrar, unrarRaw };
