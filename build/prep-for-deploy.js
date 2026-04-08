import fs from 'node:fs';
import path from 'node:path';
import * as url from 'node:url';
const dirname = url.fileURLToPath(new url.URL('.', import.meta.url));

const ignoreFilename = path.join(dirname, '..', '.gitignore');
const ignore = fs.readFileSync(ignoreFilename, {encoding: 'utf8'});
const newIgnore = ignore.replace(/# -- clip-for-deploy-start --[\s\S]*?# -- clip-for-deploy-end --/, '');
fs.writeFileSync(ignoreFilename, newIgnore);
