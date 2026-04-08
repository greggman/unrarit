export interface Reader {
  getLength(): Promise<number>;
  read(offset: number, size: number): Promise<Uint8Array>;
}

export interface Options {
  wasmURL?: string;
}

export interface RawEntry {
  name: string;
  nameBytes: Uint8Array;
  uncompressedSize: number;
  compressedSize: number;
  method: number;
  unpVer: number;
  winSize: number;
  dataOffset: number;
  isDirectory: boolean;
  encrypted: boolean;
  isSolid: boolean;
  crc32: number;
  mtime: Date;
  comment: string | null;
  commentBytes: Uint8Array | null;
  format: number;
  splitBefore?: boolean;
  splitAfter?: boolean;
}

export type Source = string | ArrayBuffer | SharedArrayBuffer | Blob | Uint8Array | Reader;
