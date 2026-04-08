function readBlobAsArrayBuffer(blob) {
    if (blob.arrayBuffer) {
        return blob.arrayBuffer();
    }
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('loadend', () => {
            resolve(reader.result);
        });
        reader.addEventListener('error', reject);
        reader.readAsArrayBuffer(blob);
    });
}
(typeof process !== 'undefined') &&
    process.versions &&
    (typeof process.versions.node !== 'undefined') &&
    (typeof process.versions.electron === 'undefined');

class BlobReader {
    blob;
    constructor(blob) {
        this.blob = blob;
    }
    async getLength() {
        return this.blob.size;
    }
    async read(offset, length) {
        const blob = this.blob.slice(offset, offset + length);
        const arrayBuffer = await readBlobAsArrayBuffer(blob);
        return new Uint8Array(arrayBuffer);
    }
    async sliceAsBlob(offset, length, type = '') {
        return this.blob.slice(offset, offset + length, type);
    }
}

const assert = chai.assert;
describe('BlobReader', function () {
    describe('Blob', function () {
        const ab = new ArrayBuffer(100);
        const f = new Uint8Array(ab);
        f.set([11, 22, 33], 0);
        f.set([44, 55, 66], 97);
        const blob = new Blob([ab]);
        const reader = new BlobReader(blob);
        it('should have the correct length', async () => {
            const length = await reader.getLength();
            assert.equal(length, ab.byteLength);
        });
        it('should work at 0 offset', async () => {
            const view = await reader.read(0, 3);
            assert.deepEqual(view, new Uint8Array([11, 22, 33]));
        });
        it('should work at non 0 offset', async () => {
            const view = await reader.read(97, 3);
            assert.deepEqual(view, new Uint8Array([44, 55, 66]));
        });
    });
});
