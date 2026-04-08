import {isSharedArrayBuffer} from './utils.js';
import type {Reader} from './types.js';

export default class ArrayBufferReader implements Reader {
  typedArray: Uint8Array;

  constructor(arrayBufferOrView: ArrayBuffer | SharedArrayBuffer | ArrayBufferView) {
    this.typedArray = (arrayBufferOrView instanceof ArrayBuffer || isSharedArrayBuffer(arrayBufferOrView))
       ? new Uint8Array(arrayBufferOrView)
       : new Uint8Array(arrayBufferOrView.buffer, arrayBufferOrView.byteOffset, arrayBufferOrView.byteLength);
  }
  async getLength(): Promise<number> {
    return this.typedArray.byteLength;
  }
  async read(offset: number, length: number): Promise<Uint8Array> {
    return new Uint8Array(this.typedArray.buffer, this.typedArray.byteOffset + offset, length);
  }
}
