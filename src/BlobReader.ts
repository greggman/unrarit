import {readBlobAsArrayBuffer} from './utils.js';
import type {Reader} from './types.js';

export default class BlobReader implements Reader {
  blob: Blob;

  constructor(blob: Blob) {
    this.blob = blob;
  }
  async getLength(): Promise<number> {
    return this.blob.size;
  }
  async read(offset: number, length: number): Promise<Uint8Array> {
    const blob = this.blob.slice(offset, offset + length);
    const arrayBuffer = await readBlobAsArrayBuffer(blob);
    return new Uint8Array(arrayBuffer);
  }
  async sliceAsBlob(offset: number, length: number, type = ''): Promise<Blob> {
    return this.blob.slice(offset, offset + length, type);
  }
}
