# unrarit.js

<img src="./unrarit-no-anim.png" style="max-width: 640px">

unrar library for browser and node based JavaScript

[![Build Status](https://travis-ci.org/greggman/unrarit.svg?branch=master)](https://travis-ci.org/greggman/unrarit)
[[Live Tests](https://greggman.github.io/unrarit/test/)]

# How to use

Live Example: [https://jsfiddle.net/greggman/awez4sd7/](https://jsfiddle.net/greggman/awez4sd7/)

## without workers

```js
import {unrar} from 'unrarit';

async function readFiles(url) {
  const {entries} = await unrar(url);

  // print all entries and their sizes
  for (const [name, entry] in Object.entries(entries)) {
    console.log(name, entry.size);
  }

  // read an entry as an ArrayBuffer
  const arrayBuffer = await entries['path/to/file'].arrayBuffer();

  // read an entry as a blob and tag it with mime type 'image/png'
  const blob = await entries['path/to/otherFile'].blob('image/png');
}
```

## with workers

```js
import {unrar, setOptions} from 'unrarit';

setOptions({workerURL: 'path/to/unrarit-worker.module.js'});

async function readFiles(url) {
  const {entries} = await unrar(url);
  ...
}
```

or if you prefer

```js
import * as unrarit from 'unrarit';

unrarit.setOptions({workerURL: 'path/to/unrarit-worker.module.js'});

async function readFiles(url) {
  const {entries} = await unrarit.unrar(url);
  ...
}
```


You can also pass a [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob),
[`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer),
[`SharedArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer),
[`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray),
or your own `Reader`

## Node

For node you need to make your own `Reader` or pass in an
[`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer),
[`SharedArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer),
or [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray).

### Load a file as an ArrayBuffer

```js
const unrarit = require('unrarit');
const fsPromises = require('fs').promises;

async function readFiles(filename) {
  const buf = await fsPromises.readFile(filename);
  const {rar, entries} = await unrarit.unrar(new Uint8Array(buf));
  ... (see code above)
}
```

You can also pass your own reader. Here's 2 examples. This first one
is stateless. That means there is never anything to clean up. But,
it has the overhead of opening the source file once for each time
you get the contents of an entry. I have no idea what the overhead
of that is.

```js
const unrarit = require('unrarit');
const fsPromises = require('fs').promises;

class StatelessFileReader {
  constructor(filename) {
    this.filename = filename;
  }
  async getLength() {
    if (this.length === undefined) {
      const stat = await fsPromises.stat(this.filename);
      this.length = stat.size;
    }
    return this.length;
  }
  async read(offset, length) {
    const fh = await fsPromises.open(this.filename);
    const data = new Uint8Array(length);
    await fh.read(data, 0, length, offset);
    await fh.close();
    return data;
  }
}

async function readFiles(filename) {
  const reader = new StatelessFileReader(filename);
  const {rar, entries} = await unrarit.unrar(reader);
  ... (see code above)
}
```

Here's also an example of one that only opens the file a single time
but that means the file stays open until you manually call close.

```js
class FileReader {
  constructor(filename) {
    this.fhp = fsPromises.open(filename);
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

async function doStuff() {
  // ...

  const reader = new FileReader(filename);
  const {rar, entries} = await unrarit.unrar(reader);

  // ... do stuff with entries ...

  // you must call reader.close for the file to close
  await reader.close();
}
```

### Workers in Node

```js
const unrarit = require('unrarit');

unrarit.setOptions({workerURL: require.resolve('unrarit/dist/unrarit-worker.js')});

...

// Only if you need node to exit you need to shut down the workers.
unrarit.cleanup();
```

# API

```js
import { unrarit, unraritRaw, setOptions, cleanup } from 'unrarit';
```

# unrar, unrarRaw

```js
async unrar(url: string): RarInfo
async unrar(src: Blob): RarInfo
async unrar(src: TypedArray): RarInfo
async unrar(src: ArrayBuffer): RarInfo
async unrar(src: Reader): RarInfo

async unrarRaw(url: string): RarIInfoRaw
async unrarRaw(src: Blob): RarIInfoRaw
async unrarRaw(src: TypedArray): RarIInfoRaw
async unrarRaw(src: ArrayBuffer): RarIInfoRaw
async unrarRaw(src: Reader): RarIInfoRaw
```

`unrar` and `unrarRaw` are async functions that take a url, `Blob`, `TypedArray`, or `ArrayBuffer` or a `Reader`.
Both functions return an object with fields `rar` and `entries`.
The difference is with `unrar` the `entries` is an object mapping filenames to `RarEntry`s where as `unrarRaw` it's
an array of `RarEntry`s. The reason to use `unrarRaw` over `unrar` is if the filenames are not utf8
then the library can't make an object from the names. In that case you get an array of entries, use `entry.nameBytes`
and decode the names as you please.

```js
type RarInfo = {
  rar: Rar,
  entries: {[key: string]: RarEntry},
};
```

```js
type RarIInfoRaw = {
  rar: Rar,
  entries: [RarEntry],
};
```

```js
class Rar {
  comment: string,           // the comment for the rar file
  commentBytes: Uint8Array,  // the raw data for comment, see nameBytes
}
```

```js
class RarEntry {
  async blob(type?: string): Blob,  // returns a Blob for this entry
                                    //  (optional type as in 'image/jpeg')
  async arrayBuffer(): ArrayBuffer, // returns an ArrayBuffer for this entry
  async text(): string,             // returns text, assumes the text is valid utf8.
                                    // If you want more options decode arrayBuffer yourself
  async json(): any,                // returns text with JSON.parse called on it.
                                    // If you want more options decode arrayBuffer yourself
  name: string,                     // name of entry
  nameBytes: Uint8Array,            // raw name of entry (see notes)
  size: number,                     // size in bytes
  compressedSize: number,           // size before decompressing
  comment: string,                  // the comment for this entry
  commentBytes: Uint8Array,         // the raw comment for this entry
  lastModDate: Date,                // a Date
  isDirectory: bool,                // True if directory
  encrypted: bool,                  // True if encrypted
}
```

```js
interface Reader {
  async getLength(): number,
  async read(offset, size): Uint8Array,
}
```

## setOptions

```js
setOptions(options: unraritOptions)
```

The options are

* `useWorkers`: true/false (default: false)

* `workerURL`: string

  The URL to use to load the worker script. Note setting this automatically sets `useWorkers` to true

* `numWorkers`: number (default: 1)

  How many workers to use. You can inflate more files in parallel with more workers.

## cleanup

```js
cleanup()
```

Shuts down the workers. You would only need to call this if you want node
to exit since it will wait for the workers to exit.

# Notes:

## Supporting old browsers

Use a transpiler like [Babel](https://babeljs.io).

## Caching

If you ask for the same entry twice it will be read twice and decompressed twice.
If you want to cache entires implement that at a level above unrarit

## Streaming

You can't stream rar files. The only valid way to read a rar file is to read the
central directory which is at the end of the rar file. Sure there are rar files
where you can cheat and read the local headers of each file but that is an invalid
way to read a rar file and it's trivial to create rar files that will fail when
read that way but are perfectly valid rar files.

If your server supports http range requests you can do this.

```js
import {unrar, HTTPRangeReader} from 'unrarit';

async function readFiles(url) {
  const reader = new HTTPRangeReader(url);
  const {rar, entries} = await unrar(reader);
  // ... access the entries as normal
}
```

## Special headers and options for network requests

The library takes a URL but there are no options for cors, or credentials etc.
If you need that pass in a Blob or ArrayBuffer you fetched yourself.

```js
import {unrar} from 'unrarit';

...

const req = await fetch(url, { mode: 'cors' });
const blob = await req.blob();
const {entries} = await unrar(blob);
```

## ArrayBuffer and SharedArrayBuffer caveats

If you pass in an `ArrayBuffer` or `SharedArrayBuffer` you need to keep the data unchanged
until you're finished using the data. The library doesn't make a copy, it uses the buffer directly.

## Handling giant entries

There is no way for the library to know what "too large" means to you.
The simple way to handle entries that are too large is to check their
size before asking for their content.

```js
  const kMaxSize = 1024*1024*1024*2;  // 2gig
  if (entry.size > kMaxSize) {
    throw new Error('this entry is larger than your max supported size');
  }
  const data = await entry.arrayBuffer();
  ...
```

## Encrypted, Password protected Files

unrarit does not currently support encrypted rar files and will throw if you try to get the data for one.
Put it on the TODO list 😅

# Testing

When writing tests serve the folder with your favorite web server (recommend [`servez`](https://www.npmjs.com/package/servez))
then go to `http://localhost:8080/test/` to easily re-run the tests. You can set a grep regular expression to only run certain tests
`http://localhost:8080/test/?grep=json`. It's up to you to encode the regular expression for a URL. For example

```js
encodeURIComponent('j(.*?)son')
"j(.*%3F)son"
```

so `http://localhost:8080/test/?grep=j(.*%3F)son`. The regular expression will be marked as case insensitive.

Of course you can also `npm test` to run the tests from the command line.

## Live Browser Tests

[https://greggman.github.io/unrarit/test/](https://greggman.github.io/unrarit/test/)

# Licence

MIT
