import type { Reader } from './types.js';
export default class ArrayBufferReader implements Reader {
    typedArray: Uint8Array;
    constructor(arrayBufferOrView: ArrayBuffer | SharedArrayBuffer | ArrayBufferView);
    getLength(): Promise<number>;
    read(offset: number, length: number): Promise<Uint8Array>;
}
