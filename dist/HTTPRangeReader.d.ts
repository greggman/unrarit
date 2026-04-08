import type { Reader } from './types.js';
export declare class HTTPRangeReader implements Reader {
    url: string;
    length: number | undefined;
    constructor(url: string);
    getLength(): Promise<number>;
    read(offset: number, size: number): Promise<Uint8Array>;
}
