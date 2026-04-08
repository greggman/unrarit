import type { Reader, RawEntry } from './types.js';
export declare function decompressEntry(reader: Reader, rawEntry: RawEntry): Promise<ArrayBuffer>;
export declare function decompressSolid(reader: Reader, rawEntries: RawEntry[]): Promise<(Blob | null)[]>;
export declare function cleanup(): void;
