import type { Reader, RawEntry, Options } from './types.js';
export declare function decompressEntry(reader: Reader, rawEntry: RawEntry): Promise<ArrayBuffer>;
export declare function decompressSolid(reader: Reader, rawEntries: RawEntry[]): Promise<(Blob | null)[]>;
export declare function setOptions(options: Options): void;
export declare function cleanup(): void;
