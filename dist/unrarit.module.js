/* unrarit@0.0.1, license MIT */
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

// ─── Configuration ────────────────────────────────────────────────────────────
const config = {
    wasmURL: '',
};
// ─── WASM module cache ────────────────────────────────────────────────────────
let wasmModule = null;
let wasmLoadPromise = null;
async function loadWasmModule() {
    const url = config.wasmURL;
    if (!url) {
        throw new Error('RAR decompression requires the WASM module.\n' +
            '1. Compile it: npm run build-wasm (requires Emscripten)\n' +
            '2. Point to it: setOptions({ wasmURL: "path/to/unrar-wasm.js" })');
    }
    const mod = await import(/* webpackIgnore: true */ url);
    const factory = mod.default || mod;
    const instance = await factory();
    return {
        _instance: instance,
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
function setOptions$1(options) {
    if (options.wasmURL !== undefined) {
        config.wasmURL = options.wasmURL;
        wasmModule = null;
        wasmLoadPromise = null;
    }
}
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
    _blobs = [];
    _trackBlob(blob) {
        this._blobs.push(blob);
    }
    dispose() {
        this._blobs = [];
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
    _reader;
    _rawEntry;
    _solidBlob;
    constructor(reader, rawEntry, solidBlob) {
        this._reader = reader;
        this._rawEntry = rawEntry;
        this._solidBlob = solidBlob;
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
        if (this._solidBlob) {
            return this._solidBlob.arrayBuffer();
        }
        return decompressEntry(this._reader, this._rawEntry);
    }
    async blob(type = 'application/octet-stream') {
        if (this._solidBlob) {
            return type === 'application/octet-stream'
                ? this._solidBlob
                : new Blob([this._solidBlob], { type });
        }
        const buf = await decompressEntry(this._reader, this._rawEntry);
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
function setOptions(options) {
    setOptions$1(options);
}
function cleanup() {
    cleanup$1();
}

export { HTTPRangeReader, Rar, RarEntry, cleanup, setOptions, unrar, unrarRaw };
