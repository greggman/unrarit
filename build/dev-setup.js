import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

// Don't run in non-dev
if (!fs.existsSync('emsdk')) {
  console.log('no emsdk folder found; skipping dev setup.');
  process.exit(0);
}

// Your development-only logic here
console.log('Running development postinstall tasks...');
// e.g., require('child_process').execSync('some-dev-tool build');
process.chdir('emsdk');
spawnSync('./emsdk', ['install', '3.1.50'], { stdio: 'inherit' });
spawnSync('./emsdk', ['activate', '--embedded', '3.1.50'], { stdio: 'inherit' });
