'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { downloadFile, HashMismatchError } = require('../src/bootstrap/download');

const BODY = crypto.randomBytes(300_000);
const SHA = crypto.createHash('sha256').update(BODY).digest('hex');

/** A tiny server that can honour Range, ignore it, or drop the first connections. */
function serve({ ranges = true, failFirst = 0, slow = false } = {}) {
  const seen = [];
  let failures = failFirst;
  const server = http.createServer((req, res) => {
    seen.push(req.headers.range || null);
    if (failures > 0) { failures--; req.socket.destroy(); return; }
    const m = /bytes=(\d+)-/.exec(req.headers.range || '');
    if (ranges && m) {
      const start = Number(m[1]);
      if (start >= BODY.length) { res.writeHead(416); res.end(); return; }
      res.writeHead(206, { 'Content-Length': BODY.length - start, 'Content-Range': `bytes ${start}-${BODY.length - 1}/${BODY.length}` });
      res.end(BODY.subarray(start));
      return;
    }
    res.writeHead(200, { 'Content-Length': BODY.length });
    if (slow) { res.write(BODY.subarray(0, 100_000)); setTimeout(() => res.end(BODY.subarray(100_000)), 400); } else res.end(BODY);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, seen, url: `http://127.0.0.1:${server.address().port}/f.bin` })));
}

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'remiqora-dl-'));

test('downloads a file and verifies its sha256', async (t) => {
  const { server, url } = await serve();
  t.after(() => { server.closeAllConnections(); server.close(); });
  const dest = path.join(tmp(), 'a.bin');
  const progress = [];
  await downloadFile({ url, dest, sha256: SHA, onProgress: (d, t) => progress.push([d, t]) });
  assert.ok(fs.readFileSync(dest).equals(BODY));
  assert.deepEqual(progress.at(-1), [BODY.length, BODY.length]);
  assert.equal(fs.existsSync(`${dest}.part`), false);
});

test('resumes a partial download with a Range request', async (t) => {
  const { server, url, seen } = await serve();
  t.after(() => { server.closeAllConnections(); server.close(); });
  const dest = path.join(tmp(), 'a.bin');
  fs.writeFileSync(`${dest}.part`, BODY.subarray(0, 120_000));
  await downloadFile({ url, dest, sha256: SHA });
  assert.ok(fs.readFileSync(dest).equals(BODY));
  assert.deepEqual(seen, ['bytes=120000-']);
});

test('starts over when the server ignores Range', async (t) => {
  const { server, url } = await serve({ ranges: false });
  t.after(() => { server.closeAllConnections(); server.close(); });
  const dest = path.join(tmp(), 'a.bin');
  fs.writeFileSync(`${dest}.part`, Buffer.from('stale stale stale'));
  await downloadFile({ url, dest, sha256: SHA });
  assert.ok(fs.readFileSync(dest).equals(BODY));
});

test('rejects a wrong hash and removes the partial file', async (t) => {
  const { server, url } = await serve();
  t.after(() => { server.closeAllConnections(); server.close(); });
  const dest = path.join(tmp(), 'a.bin');
  await assert.rejects(downloadFile({ url, dest, sha256: 'ab'.repeat(32) }), HashMismatchError);
  assert.equal(fs.existsSync(dest), false);
  assert.equal(fs.existsSync(`${dest}.part`), false);
});

test('retries after dropped connections', async (t) => {
  const { server, url, seen } = await serve({ failFirst: 2 });
  t.after(() => { server.closeAllConnections(); server.close(); });
  const dest = path.join(tmp(), 'a.bin');
  await downloadFile({ url, dest, sha256: SHA, backoffMs: 5 });
  assert.ok(fs.readFileSync(dest).equals(BODY));
  assert.equal(seen.length, 3);
});

test('gives up after the retry budget', async (t) => {
  const { server, url } = await serve({ failFirst: 99 });
  t.after(() => { server.closeAllConnections(); server.close(); });
  await assert.rejects(downloadFile({ url, dest: path.join(tmp(), 'a.bin'), sha256: SHA, retries: 1, backoffMs: 5 }));
});

test('an abort keeps the partial file and the next call resumes', async (t) => {
  const { server, url, seen } = await serve({ slow: true });
  t.after(() => { server.closeAllConnections(); server.close(); });
  const dest = path.join(tmp(), 'a.bin');
  const controller = new AbortController();
  const first = downloadFile({ url, dest, sha256: SHA, signal: controller.signal });
  setTimeout(() => controller.abort(new Error('paused')), 200);
  await assert.rejects(first, /paused/);
  assert.ok(fs.existsSync(`${dest}.part`));
  const kept = fs.statSync(`${dest}.part`).size;
  assert.ok(kept > 0 && kept < BODY.length);
  await downloadFile({ url, dest, sha256: SHA });
  assert.ok(fs.readFileSync(dest).equals(BODY));
  assert.equal(seen.at(-1), `bytes=${kept}-`);
});

test('leaves a finished file alone', async (t) => {
  const { server, url, seen } = await serve();
  t.after(() => { server.closeAllConnections(); server.close(); });
  const dest = path.join(tmp(), 'a.bin');
  fs.writeFileSync(dest, BODY);
  await downloadFile({ url, dest, sha256: SHA });
  assert.equal(seen.length, 0);
});

test('withRetries runs a failing step again and gives up after the last attempt', async () => {
  const { withRetries } = require('../src/bootstrap/download');
  let calls = 0;
  const retries = [];
  const value = await withRetries(async () => { calls++; if (calls < 3) throw new Error('Broken pipe'); return 'ok'; },
    { backoffMs: 1, onRetry: (n, of) => retries.push(`${n}/${of}`) });
  assert.equal(value, 'ok');
  assert.deepEqual(retries, ['2/3', '3/3']);

  calls = 0;
  await assert.rejects(withRetries(async () => { calls++; throw new Error('still down'); }, { backoffMs: 1 }), /still down/);
  assert.equal(calls, 3);
});

test('withRetries does not retry after an abort', async () => {
  const { withRetries } = require('../src/bootstrap/download');
  const ac = new AbortController();
  let calls = 0;
  await assert.rejects(withRetries(async () => { calls++; ac.abort(new Error('cancelled')); throw new Error('killed'); },
    { signal: ac.signal, backoffMs: 1 }), /cancelled/);
  assert.equal(calls, 1);
});
