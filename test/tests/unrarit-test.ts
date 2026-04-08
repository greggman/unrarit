/* global chai, describe, it, before, after */
declare const chai: Chai.ChaiStatic;
const assert: Chai.Assert = chai.assert;

import {unrar, unrarRaw, setOptions, cleanup, HTTPRangeReader} from '../../src/unrarit.js';

async function sha256(uint8View: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', uint8View as unknown as ArrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface ExpectedEntry {
  isDir?: boolean;
  content?: string;
  sha256?: string;
}

async function checkRarEntriesMatchExpected(
  entries: Record<string, { isDirectory: boolean; arrayBuffer(): Promise<ArrayBuffer>; text(): Promise<string> }>,
  expectedFiles: Record<string, ExpectedEntry>,
): Promise<void> {
  const expected: Record<string, ExpectedEntry> = Object.assign({}, expectedFiles);
  for (const [name, entry] of Object.entries(entries)) {
    const expect = expected[name];
    assert.isOk(expect, name);
    delete expected[name];
    assert.equal(entry.isDirectory, !!expect.isDir, name);
    if (!expect.isDir) {
      if (expect.sha256) {
        const data = await entry.arrayBuffer();
        const sig = await sha256(new Uint8Array(data));
        assert.equal(sig, expect.sha256, name);
      } else {
        const data = await entry.text();
        assert.equal(data, expect.content, name);
      }
    }
  }
  assert.deepEqual(expected, {}, 'all content accounted for');
}

describe('unrarit', function() {
  this.timeout(30000);

  before(() => {
    setOptions({ wasmURL: '../../src/unrar-wasm.js' });
  });

  after(() => {
    cleanup();
  });

  const longContent = `${new Array(200).fill('compress').join('')}\n`;

  const expectedStuff: Record<string, ExpectedEntry> = {
    'stuff/': { isDir: true },
    'stuff/dog.txt': { content: 'german shepard\n' },
    'stuff/birds/': { isDir: true },
    'stuff/birds/bird.txt': { content: 'parrot\n' },
    'stuff/cat.txt': { content: 'siamese\n' },
    'stuff/json.txt': { content: '{"name":"homer","age":50}' },
    'stuff/long.txt': { content: longContent },
    'stuff/ⓤⓝⓘⓒⓞⓓⓔ-𝖋𝖎𝖑𝖊𝖓𝖆𝖒𝖊-😱.txt': { content: 'Lookma! Unicode 😜' },
  };

  const expectedLarge: Record<string, ExpectedEntry> = {
    'large/': { isDir: true },
    'large/antwerp-central-station.jpg':   { sha256: '197246a6bba4570387bee455245a30c95329ed5538eaa2a3fec7df5e2aad53f7' },
    'large/phones-in-museum-in-milan.jpg': { sha256: '6465b0c16c76737bd0f74ab79d9b75fd7558f74364be422a37aec85c8612013c' },
    'large/colosseum.jpg':                 { sha256: '6081d144babcd0c2d3ea5c49de83811516148301d9afc6a83f5e63c3cd54d00a' },
    'large/chocolate-store-istanbul.jpg':  { sha256: '3ee7bc868e1bf1d647598a6e430d636424485f536fb50359e6f82ec24013308c' },
    'large/tokyo-from-skytree.jpg':        { sha256: 'd66f4ec1eef9bcf86371fe82f217cdd71e346c3e850b31d3e3c0c2f342af4ad2' },
    'large/LICENSE.txt':                   { sha256: '95be0160e771271be4015afc340ccf15f4e70e2581c5ca090d0a39be17395ac2' },
    'large/cherry-blossoms-tokyo.jpg':     { sha256: '07c398b3acc1edc5ef47bd7c1da2160d66f9c297d2967e30f2009f79b5e6eb0e' },
  };

  it('entries are correct (Uint8Array)', async() => {
    const req = await fetch('./data/stuff.rar');
    const buf = await req.arrayBuffer();
    const {entries} = await unrar(new Uint8Array(buf));
    await checkRarEntriesMatchExpected(entries, expectedStuff);
  });

  it('entries are correct (ArrayBuffer)', async() => {
    const req = await fetch('./data/stuff.rar');
    const buf = await req.arrayBuffer();
    const {entries} = await unrar(buf);
    await checkRarEntriesMatchExpected(entries, expectedStuff);
  });

  it('entries are correct (Blob)', async() => {
    const req = await fetch('./data/stuff.rar');
    const blob = await req.blob();
    const {entries} = await unrar(blob);
    await checkRarEntriesMatchExpected(entries, expectedStuff);
  });

  it('entries are correct (URL string)', async() => {
    const {entries} = await unrar('./data/stuff.rar');
    await checkRarEntriesMatchExpected(entries, expectedStuff);
  });

  it('entries are correct (HTTPRangeReader)', async() => {
    const reader = new HTTPRangeReader('./data/stuff.rar');
    const {entries} = await unrar(reader);
    await checkRarEntriesMatchExpected(entries, expectedStuff);
  });

  it('unrarRaw returns array of entries', async() => {
    const req = await fetch('./data/stuff.rar');
    const buf = await req.arrayBuffer();
    const {entries} = await unrarRaw(buf);
    const map = Object.fromEntries(entries.map(e => [e.name, e]));
    await checkRarEntriesMatchExpected(map, expectedStuff);
  });

  it('can get blob', async() => {
    const req = await fetch('./data/stuff.rar');
    const buf = await req.arrayBuffer();
    const {entries} = await unrar(buf);
    const blob = await entries['stuff/dog.txt'].blob();
    assert.instanceOf(blob, Blob);
    const text = await blob.text();
    assert.equal(text, 'german shepard\n');
  });

  it('can get json', async() => {
    const req = await fetch('./data/stuff.rar');
    const buf = await req.arrayBuffer();
    const {entries} = await unrar(buf);
    const data = await entries['stuff/json.txt'].json();
    assert.deepEqual(data, {name: 'homer', age: 50});
  });

  it('large rar entries are correct', async() => {
    const {entries} = await unrar('./data/large.rar');
    await checkRarEntriesMatchExpected(entries, expectedLarge);
  });

  it('rar object has dispose method', async() => {
    const req = await fetch('./data/stuff.rar');
    const buf = await req.arrayBuffer();
    const {rar} = await unrar(buf);
    assert.typeOf(rar.dispose, 'function');
    rar.dispose();
  });
});
