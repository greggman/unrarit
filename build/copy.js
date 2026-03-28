import {copyFileSync} from 'node:fs';

const src = process.argv[2];
const dst = process.argv[3];

console.log(src, dst);
copyFileSync(src, dst);
