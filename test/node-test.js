import {createHash} from 'node:crypto';
import {promises as fs} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {assert} from 'chai';
import {unrar, cleanup} from '../dist/unrarit.module.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function sha256(uint8view) {
  return createHash('sha256').update(uint8view).digest('hex');
}

async function checkRarEntriesMatchExpected(entries, expectedFiles) {
  const expected = Object.assign({}, expectedFiles);
  for (const [name, entry] of Object.entries(entries)) {
    const expect = expected[name];
    assert.isOk(expect, name);
    delete expected[name];
    assert.equal(entry.isDirectory, !!expect.isDir, name);
    if (!expect.isDir) {
      if (expect.sha256) {
        const data = await entry.arrayBuffer();
        const sig = sha256(new Uint8Array(data));
        assert.equal(sig, expect.sha256, name);
      } else {
        const data = await entry.text();
        assert.equal(data, expect.content, name);
      }
    }
  }
  assert.deepEqual(expected, {}, 'all content accounted for');
}

class StatelessFileReader {
  constructor(filename) {
    this.filename = filename;
  }
  async getLength() {
    if (this.length === undefined) {
      const stat = await fs.stat(this.filename);
      this.length = stat.size;
    }
    return this.length;
  }
  async read(offset, length) {
    const fh = await fs.open(this.filename);
    const data = new Uint8Array(length);
    await fh.read(data, 0, length, offset);
    await fh.close();
    return data;
  }
}

// It's up to you to call `close`
class FileReader {
  constructor(filename) {
    this.fhp = fs.open(filename);
  }
  async close() {
    const fh = await this.fhp;
    await fh.close();
  }
  async getLength() {
    if (this.length === undefined) {
      const fh = await this.fhp;
      const stat = await fh.stat();
      this.length = stat.size;
    }
    return this.length;
  }
  async read(offset, length) {
    const fh = await this.fhp;
    const data = new Uint8Array(length);
    await fh.read(data, 0, length, offset);
    return data;
  }
}

describe('unrarit', function() {
  // Decompressing large archives can take a moment on first run
  this.timeout(30000);

  after(() => {
    cleanup();
  });

  const longContent = `${new Array(200).fill('compress').join('')}\n`;
  const expectedStuff = {
    'stuff/': { isDir: true, },
    'stuff/dog.txt': { content: 'german shepard\n' },
    'stuff/birds/': { isDir: true, },
    'stuff/birds/bird.txt': { content: 'parrot\n' },
    'stuff/cat.txt': { content: 'siamese\n', },
    'stuff/json.txt': { content: '{"name":"homer","age":50}', },
    'stuff/long.txt': { content: longContent, },
    'stuff/ⓤⓝⓘⓒⓞⓓⓔ-𝖋𝖎𝖑𝖊𝖓𝖆𝖒𝖊-😱.txt': { content: 'Lookma! Unicode 😜', },
  };

  it('entries are correct', async() => {
    const buf = await fs.readFile(join(__dirname, 'data', 'stuff.rar'));
    const {entries} = await unrar(new Uint8Array(buf));
    await checkRarEntriesMatchExpected(entries, expectedStuff);
  });

  it('use StatelessFileReader', async() => {
    const reader = new StatelessFileReader(join(__dirname, 'data', 'stuff.rar'));
    const {entries} = await unrar(reader);
    await checkRarEntriesMatchExpected(entries, expectedStuff);
  });

  it('use FileReader', async() => {
    const reader = new FileReader(join(__dirname, 'data', 'stuff.rar'));
    const {entries} = await unrar(reader);
    await checkRarEntriesMatchExpected(entries, expectedStuff);
    reader.close();
  });

  it('use FileReader Large', async() => {
    const reader = new FileReader(join(__dirname, 'data', 'large.rar'));
    const {entries} = await unrar(reader);

    const expected = {
      'large/': { isDir: true, },
      'large/antwerp-central-station.jpg':   { sha256: '197246a6bba4570387bee455245a30c95329ed5538eaa2a3fec7df5e2aad53f7', },
      'large/phones-in-museum-in-milan.jpg': { sha256: '6465b0c16c76737bd0f74ab79d9b75fd7558f74364be422a37aec85c8612013c', },
      'large/colosseum.jpg':                 { sha256: '6081d144babcd0c2d3ea5c49de83811516148301d9afc6a83f5e63c3cd54d00a', },
      'large/chocolate-store-istanbul.jpg':  { sha256: '3ee7bc868e1bf1d647598a6e430d636424485f536fb50359e6f82ec24013308c', },
      'large/tokyo-from-skytree.jpg':        { sha256: 'd66f4ec1eef9bcf86371fe82f217cdd71e346c3e850b31d3e3c0c2f342af4ad2', },
      'large/LICENSE.txt':                   { sha256: '95be0160e771271be4015afc340ccf15f4e70e2581c5ca090d0a39be17395ac2', },
      'large/cherry-blossoms-tokyo.jpg':     { sha256: '07c398b3acc1edc5ef47bd7c1da2160d66f9c297d2967e30f2009f79b5e6eb0e', },
    };

    await checkRarEntriesMatchExpected(entries, expected);
    reader.close();
  });
});
