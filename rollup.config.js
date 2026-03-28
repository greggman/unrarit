import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf8' }));
const banner = `/* unrarit@${pkg.version}, license MIT */`;

const resolvePlugin = resolve({ modulesOnly: true });

export default [
  // ─── ESM ──────────────────────────────────────────────────────────────────
  {
    input: 'src/unrarit.ts',
    plugins: [resolvePlugin, typescript({ declaration: true, declarationDir: 'dist' })],
    output: {
      format: 'es',
      file: 'dist/unrarit.module.js',
      indent: '  ',
      banner,
    },
  },

  // ─── ESM minified ─────────────────────────────────────────────────────────
  {
    input: 'src/unrarit.ts',
    plugins: [resolvePlugin, typescript(), terser({ format: { comments: /^!|license|@license/ } })],
    output: {
      format: 'es',
      file: 'dist/unrarit.module.min.js',
      banner,
    },
  },

  // ─── UMD ──────────────────────────────────────────────────────────────────
  {
    input: 'src/unrarit.ts',
    plugins: [resolvePlugin, typescript()],
    output: {
      format: 'umd',
      name: 'unrarit',
      file: 'dist/unrarit.umd.js',
      indent: '  ',
      banner,
    },
  },

  // ─── UMD minified ─────────────────────────────────────────────────────────
  {
    input: 'src/unrarit.ts',
    plugins: [resolvePlugin, typescript(), terser({ format: { comments: /^!|license|@license/ } })],
    output: {
      format: 'umd',
      name: 'unrarit',
      file: 'dist/unrarit.umd.min.js',
      banner,
    },
  },
];
