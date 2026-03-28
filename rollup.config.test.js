import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

const resolvePlugin = resolve({ modulesOnly: true });
const tsPlugin = typescript({ tsconfig: './tsconfig.test.json' });

export default [
  {
    input: 'test/tests/ArrayBufferReader-test.ts',
    plugins: [resolvePlugin, tsPlugin],
    output: {
      format: 'es',
      file: 'test/tests/ArrayBufferReader-test.js',
    },
  },
  {
    input: 'test/tests/BlobReader-test.ts',
    plugins: [resolvePlugin, tsPlugin],
    output: {
      format: 'es',
      file: 'test/tests/BlobReader-test.js',
    },
  },
  {
    input: 'test/tests/unrarit-test.ts',
    plugins: [resolvePlugin, tsPlugin],
    output: {
      format: 'es',
      file: 'test/tests/unrarit-test.js',
    },
  },
];
