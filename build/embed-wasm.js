import {readFileSync, writeFileSync} from 'node:fs';
import {gzipSync} from 'node:zlib';

const wasm = readFileSync('src/unrar-wasm.wasm');
const compressed = gzipSync(wasm);
const base64 = compressed.toString('base64');

writeFileSync('src/unrar-wasm-embedded.ts', `// Auto-generated — do not edit. Run: node build/embed-wasm.js
export const wasmBase64 = '${base64}';
`);

console.log(`embedded wasm: ${wasm.length} bytes -> ${compressed.length} gzipped -> ${base64.length} base64 chars`);
