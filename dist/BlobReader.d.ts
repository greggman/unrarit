import type { Reader } from './types.js';
export default class BlobReader implements Reader {
    blob: Blob;
    constructor(blob: Blob);
    getLength(): Promise<number>;
    read(offset: number, length: number): Promise<Uint8Array>;
    sliceAsBlob(offset: number, length: number, type?: string): Promise<Blob>;
}
