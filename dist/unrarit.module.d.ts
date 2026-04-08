export { HTTPRangeReader } from './HTTPRangeReader.js';
export type { Reader, Options, RawEntry, Source } from './types.js';
import type { Reader, Options, RawEntry, Source } from './types.js';
export interface UnrarRawResult {
    rar: Rar;
    entries: RarEntry[];
}
export interface UnrarResult {
    rar: Rar;
    entries: Record<string, RarEntry>;
}
export declare class Rar {
    comment: string | null;
    commentBytes: Uint8Array | null;
    private _blobs;
    _trackBlob(blob: Blob): void;
    dispose(): void;
    [Symbol.dispose](): void;
}
export declare class RarEntry {
    name: string;
    nameBytes: Uint8Array;
    size: number;
    compressedSize: number;
    comment: string | null;
    commentBytes: Uint8Array | null;
    lastModDate: Date;
    isDirectory: boolean;
    encrypted: boolean;
    private _reader;
    private _rawEntry;
    private _solidBlob;
    constructor(reader: Reader, rawEntry: RawEntry, solidBlob: Blob | null);
    arrayBuffer(): Promise<ArrayBuffer>;
    blob(type?: string): Promise<Blob>;
    text(): Promise<string>;
    json(): Promise<unknown>;
}
export declare function unrarRaw(source: Source): Promise<UnrarRawResult>;
export declare function unrar(source: Source): Promise<UnrarResult>;
export declare function setOptions(options: Options): void;
export declare function cleanup(): void;
