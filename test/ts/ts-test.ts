import {unrar, setOptions, cleanup} from '../../dist/unrarit.module.js';

interface TestPromiseInfo {
  resolve(failures: number): void;
};

declare global {
  interface Window {
    testsPromiseInfo: TestPromiseInfo;
  }
}

const assert: Chai.Assert = chai.assert;

describe('typescript', () => {
  before(() => {
    setOptions({ wasmURL: '../../src/unrar-wasm.js' });
  });

  after(() => {
    cleanup();
  });

  const longContent = `${new Array(200).fill('compress').join('')}\n`;
  const expectedStuff: {[name: string]: any} = {
    'stuff/': { isDir: true, },
    'stuff/dog.txt': { content: 'german shepard\n' },
    'stuff/birds/': { isDir: true, },
    'stuff/birds/bird.txt': { content: 'parrot\n' },
    'stuff/cat.txt': { content: 'siamese\n', },
    'stuff/json.txt': { content: '{"name":"homer","age":50}', },
    'stuff/long.txt': { content: longContent, },
    'stuff/ⓤⓝⓘⓒⓞⓓⓔ-𝖋𝖎𝖑𝖊𝖓𝖆𝖒𝖊-😱.txt': { content: 'Lookma! Unicode 😜', },
  };

  it('unrars', async() => {
    const utf8Encoder = new TextEncoder();
    const {rar, entries} = await unrar('../data/stuff.rar');

    assert.isTrue(rar.comment === null || typeof rar.comment === 'string');
    assert.typeOf(rar.dispose, 'function');

    for (const [name, entry] of Object.entries(entries)) {
      const expected = expectedStuff[name];
      assert.isOk(expected, name);
      if (expected.isDir) {
        assert.isTrue(entry.isDirectory);
      } else {
        const content = await entry.text();
        assert.equal(content, expected.content);
        const arrayBuffer = await entry.arrayBuffer();
        const expectedBytes = utf8Encoder.encode(content);
        assert.deepEqual(new Uint8Array(arrayBuffer), expectedBytes);
      }
    }
  });
});

const settings = Object.fromEntries(new URLSearchParams(window.location.search).entries());
if (settings.reporter) {
  mocha.reporter(settings.reporter);
}
mocha.run((failures) => {
  window.testsPromiseInfo.resolve(failures);
});
