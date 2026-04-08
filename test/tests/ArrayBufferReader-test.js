function isSharedArrayBuffer(b) {
    return typeof SharedArrayBuffer !== 'undefined' && b instanceof SharedArrayBuffer;
}
(typeof process !== 'undefined') &&
    process.versions &&
    (typeof process.versions.node !== 'undefined') &&
    (typeof process.versions.electron === 'undefined');

class ArrayBufferReader {
    typedArray;
    constructor(arrayBufferOrView) {
        this.typedArray = (arrayBufferOrView instanceof ArrayBuffer || isSharedArrayBuffer(arrayBufferOrView))
            ? new Uint8Array(arrayBufferOrView)
            : new Uint8Array(arrayBufferOrView.buffer, arrayBufferOrView.byteOffset, arrayBufferOrView.byteLength);
    }
    async getLength() {
        return this.typedArray.byteLength;
    }
    async read(offset, length) {
        return new Uint8Array(this.typedArray.buffer, this.typedArray.byteOffset + offset, length);
    }
}

const assert = chai.assert;
describe('ArrayBufferReader', function () {
    describe('ArrayBuffer', function () {
        const ab = new ArrayBuffer(100);
        const f = new Uint8Array(ab);
        f.set([11, 22, 33], 0);
        f.set([44, 55, 66], 97);
        const reader = new ArrayBufferReader(ab);
        it('should have the correct length', async () => {
            const length = await reader.getLength();
            assert.equal(length, ab.byteLength);
        });
        it('should work at 0 offset', async () => {
            const data = await reader.read(0, 3);
            const view = new Uint8Array(data);
            assert.deepEqual(view, new Uint8Array([11, 22, 33]));
        });
        it('should work at non 0 offset', async () => {
            const data = await reader.read(97, 3);
            const view = new Uint8Array(data);
            assert.deepEqual(view, new Uint8Array([44, 55, 66]));
        });
        it('should be the same ArrayBuffer', async () => {
            const data = await reader.read(97, 3);
            assert.strictEqual(data.buffer, ab);
        });
    });
    describe('typedArray', function () {
        const ab = new ArrayBuffer(300);
        const f = new Float32Array(ab, 60, 100 / 4);
        f.set([11, 22, 33], 0);
        f.set([44, 55, 66], 100 / 4 - 12 / 4);
        const reader = new ArrayBufferReader(f);
        it('should have the correct length', async () => {
            const length = await reader.getLength();
            assert.equal(length, f.byteLength);
        });
        it('should work at 0 offset', async () => {
            const data = await reader.read(0, 12);
            const view = new Float32Array(data.buffer, data.byteOffset, data.length / 4);
            assert.deepEqual(view, new Float32Array([11, 22, 33]));
        });
        it('should work at non 0 offset', async () => {
            const data = await reader.read(100 - 12, 12);
            const view = new Float32Array(data.buffer, data.byteOffset, data.length / 4);
            assert.deepEqual(view, new Float32Array([44, 55, 66]));
        });
        it('should be the same ArrayBuffer', async () => {
            const data = await reader.read(97, 3);
            assert.strictEqual(data.buffer, ab);
        });
    });
});
