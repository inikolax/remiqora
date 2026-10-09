'use strict';
const { execFile } = require('node:child_process');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { IS_WINDOWS } = require('../paths');

/** Runs a command, never rejects: { ok, stdout, timedOut }. */
function run(cmd, args, timeout = 5000) {
  return new Promise((resolve) => {
    execFile(cmd, args, { timeout, windowsHide: true }, (err, stdout) =>
      resolve({ ok: !err, stdout: String(stdout || ''), timedOut: !!(err && err.killed) }));
  });
}

function nvidiaSmiCandidates() {
  const list = ['nvidia-smi'];
  if (IS_WINDOWS) {
    const sys = process.env.SystemRoot || 'C:\\Windows';
    list.push(
      path.join(sys, 'System32', 'nvidia-smi.exe'),
      path.join(process.env.ProgramFiles || 'C:\\Program Files', 'NVIDIA Corporation', 'NVSMI', 'nvidia-smi.exe'),
    );
  }
  return list;
}

/** First NVIDIA GPU as { name, driver, vramMiB, computeCap } or null. */
async function detectNvidiaGpu() {
  for (const smi of nvidiaSmiCandidates()) {
    if (path.isAbsolute(smi) && !fs.existsSync(smi)) continue;
    // compute_cap needs a fairly recent driver; fall back to the fields every driver has.
    for (const fields of ['name,driver_version,memory.total,compute_cap', 'name,driver_version,memory.total']) {
      const r = await run(smi, [`--query-gpu=${fields}`, '--format=csv,noheader,nounits']);
      // A hung driver query would hang again on the next candidate (usually the same binary): give up at once.
      if (r.timedOut) return null;
      const line = r.ok ? r.stdout.split(/\r?\n/).find((l) => l.trim()) : null;
      if (!line) continue;
      const [name, driver, vram, cap] = line.split(',').map((s) => s.trim());
      return { name, driver, vramMiB: Number(vram) || 0, computeCap: cap ? Number(cap) : null };
    }
  }
  return null;
}

/** Pure decision: does this GPU meet the engine's requirements? */
function evaluateGpu(gpu, req) {
  if (!gpu) return { ok: false, code: 'no-gpu' };
  const major = parseInt(gpu.driver, 10);
  if (!Number.isNaN(major) && major < req.minDriver) return { ok: false, code: 'old-driver' };
  if (gpu.computeCap !== null && gpu.computeCap < req.minComputeCapability) return { ok: false, code: 'old-gpu' };
  return { ok: true };
}

/** Free bytes on the volume that holds `dir` (the nearest existing parent is used). */
async function freeBytes(dir) {
  let probe = path.resolve(dir);
  for (;;) {
    try {
      const s = await fsp.statfs(probe);
      return Number(s.bavail) * Number(s.bsize);
    } catch {
      const parent = path.dirname(probe);
      if (parent === probe) return 0;
      probe = parent;
    }
  }
}

/** Any HTTP answer counts as "online"; only a network failure does not. */
async function isOnline(fetchImpl = fetch) {
  try {
    await fetchImpl('https://github.com', { method: 'HEAD', signal: AbortSignal.timeout(6000) });
    return true;
  } catch {
    return false;
  }
}

/**
 * Everything the first-run screen shows before downloading. `items` is the list of rows,
 * `blocking` is the first problem that stops the setup (or null). `requiredBytes`: the free space the chosen parts
 * need (main.js derives it from the plan); the manifest's figure is for everything.
 */
async function runChecks({ platform, dataRoot, manifest, requiredBytes, fetchImpl = fetch }) {
  const req = manifest.requirements;
  const needBytes = requiredBytes ?? req.minFreeBytes;
  const items = [];
  let blocking = null;
  const fail = (code, extra = {}) => { blocking ||= { code, ...extra }; };

  const supported = platform === 'win32-x64' || platform === 'darwin-arm64';
  if (!supported) {
    items.push({ id: 'platform', ok: false, platform });
    fail('unsupported-platform', { platform });
  }

  // Independent, so they run side by side: the screen waits for the slowest, not for the sum.
  const [gpu, free, online] = await Promise.all([
    platform === 'win32-x64' ? detectNvidiaGpu() : Promise.resolve(null),
    freeBytes(dataRoot),
    isOnline(fetchImpl),
  ]);

  if (platform === 'win32-x64') {
    const verdict = evaluateGpu(gpu, req);
    items.push({ id: 'gpu', ok: verdict.code !== 'no-gpu' && verdict.code !== 'old-gpu', name: gpu ? gpu.name : '', vramMiB: gpu ? gpu.vramMiB : 0 });
    items.push({ id: 'driver', ok: verdict.code !== 'old-driver' && !!gpu, driver: gpu ? gpu.driver : '', required: req.minDriver });
    if (!verdict.ok) fail(verdict.code, { gpu, required: req.minDriver });
  } else if (platform === 'darwin-arm64') {
    items.push({ id: 'gpu', ok: true, name: 'Apple Silicon', vramMiB: Math.round(os.totalmem() / 2 ** 20) });
  }

  const enoughDisk = free >= needBytes;
  items.push({ id: 'disk', ok: enoughDisk, freeBytes: free, requiredBytes: needBytes });
  if (!enoughDisk) fail('no-disk', { free, required: needBytes });

  items.push({ id: 'network', ok: online });
  if (!online) fail('offline');

  return { items, blocking };
}

module.exports = { detectNvidiaGpu, evaluateGpu, freeBytes, isOnline, runChecks };
