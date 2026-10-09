'use strict';
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { Readable } = require('node:stream');
const { pipeline } = require('node:stream/promises');

class HashMismatchError extends Error {
  constructor(file, expected, actual) {
    super(`sha256 mismatch for ${path.basename(file)}: expected ${expected}, got ${actual}`);
    this.name = 'HashMismatchError';
  }
}

const sleep = (ms, signal) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => { clearTimeout(t); reject(signal.reason); }, { once: true });
  });

/**
 * Runs `run` again when it fails, for downloaders that run as a child process: those stop at the
 * first dropped connection, and on a slow line one drop can end a 10 GB step (issue #39). They skip
 * what they already have, so a retry continues where the last try stopped. An abort is not retried.
 */
async function withRetries(run, { signal, attempts = 3, backoffMs = 5000, onRetry = () => {} } = {}) {
  for (let i = 1; ; i++) {
    signal?.throwIfAborted();
    try {
      return await run();
    } catch (err) {
      if (signal?.aborted) throw signal.reason ?? err;
      if (i >= attempts) throw err;
      onRetry(i + 1, attempts, err);
      await sleep(backoffMs * i, signal);
    }
  }
}

async function sha256File(file) {
  const hash = crypto.createHash('sha256');
  await pipeline(fs.createReadStream(file), hash);
  return hash.digest('hex');
}

async function sizeOrZero(file) {
  try { return (await fsp.stat(file)).size; } catch { return 0; }
}

/**
 * One HTTP attempt, appending to `part`. Resumes from the bytes already on disk.
 * Returns when the response body is fully written.
 */
async function attempt({ url, part, signal, onBytes, fetchImpl }) {
  const have = await sizeOrZero(part);
  const headers = have > 0 ? { Range: `bytes=${have}-` } : {};
  const res = await fetchImpl(url, { headers, signal, redirect: 'follow' });

  if (res.status === 416) {
    // Nothing left to send for that range: the part file is already complete (or stale).
    return 'range-satisfied';
  }
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status} for ${url}`);

  let flags = 'a';
  let offset = have;
  if (res.status === 200) {
    // The server ignored Range and is sending the whole file: start over.
    flags = 'w';
    offset = 0;
  }
  const total = Number(res.headers.get('content-length') || 0) + offset;
  onBytes(offset, total);

  const body = Readable.fromWeb(res.body);
  let written = offset;
  body.on('data', (chunk) => { written += chunk.length; onBytes(written, total); });
  await pipeline(body, fs.createWriteStream(part, { flags }), { signal });
  return 'ok';
}

/**
 * Downloads `url` to `dest`, resuming a previous partial download, retrying network
 * errors with backoff, and verifying the sha256. Idempotent: an existing file with the
 * right hash is left alone.
 *
 * @param {object} o
 * @param {string} o.url
 * @param {string} o.dest
 * @param {string} [o.sha256]           hex digest; omit only for sources verified another way
 * @param {(done:number,total:number)=>void} [o.onProgress]
 * @param {AbortSignal} [o.signal]      abort keeps the partial file so the next call resumes
 * @param {number} [o.retries]
 */
async function downloadFile({ url, dest, sha256, onProgress = () => {}, signal, retries = 4, fetchImpl = fetch, backoffMs = 1500 }) {
  await fsp.mkdir(path.dirname(dest), { recursive: true });

  if (sha256 && (await sizeOrZero(dest)) > 0 && (await sha256File(dest)) === sha256) {
    const size = await sizeOrZero(dest);
    onProgress(size, size);
    return dest;
  }

  const part = `${dest}.part`;
  let lastError;
  for (let i = 0; i <= retries; i++) {
    signal?.throwIfAborted();
    try {
      const outcome = await attempt({ url, part, signal, onBytes: onProgress, fetchImpl });
      if (outcome === 'range-satisfied' && sha256 && (await sha256File(part)) !== sha256) {
        await fsp.rm(part, { force: true }); // stale partial: begin again
        continue;
      }
      break;
    } catch (err) {
      if (signal?.aborted) throw signal.reason ?? err;
      lastError = err;
      if (i === retries) throw err;
      await sleep(backoffMs * 2 ** i, signal);
    }
  }

  if (sha256) {
    const actual = await sha256File(part);
    if (actual !== sha256) {
      await fsp.rm(part, { force: true });
      throw new HashMismatchError(dest, sha256, actual);
    }
  }
  await fsp.rename(part, dest);
  const size = await sizeOrZero(dest);
  onProgress(size, size);
  return dest;
}

module.exports = { downloadFile, withRetries, sha256File, HashMismatchError };
