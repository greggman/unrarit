import { spawnSync } from 'child_process';

// Don't run this in production
if (process.env.NODE_ENV === 'production') {
  console.log('Production environment detected; skipping dev setup.');
  process.exit(0);
}

// Your development-only logic here
console.log('Running development postinstall tasks...');
// e.g., require('child_process').execSync('some-dev-tool build');
process.chdir('emsdk');
spawnSync('./emsdk', ['install', '3.1.50'], { stdio: 'inherit' });
spawnSync('./emsdk', ['activate', '--embedded', '3.1.50'], { stdio: 'inherit' });
