export interface EmscriptenModule {
    wasmBinary: ArrayBuffer;
    HEAPU8: Uint8Array;
    cwrap(ident: string, returnType: string, argTypes: string[]): (...args: number[]) => number;
    _rar_alloc_context: () => number;
    _rar_free_context: (ctx: number) => void;
    _rar_decompress: (ctx: number, ver: number, winSize: number, inPtr: number, inSize: number, outPtr: number, outSize: number, solid: number, isFirst: number) => number;
    _malloc: (size: number) => number;
    _free: (ptr: number) => void;
}
export default function createUnrarModule(moduleArg: {
    wasmBinary: ArrayBuffer;
}): Promise<EmscriptenModule>;
