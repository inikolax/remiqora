'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const manifest = require('../manifest.json');
const { evaluateGpu, freeBytes, runChecks } = require('../src/bootstrap/checks');
const { runSetup, isSetupComplete, describePlan } = require('../src/bootstrap/run');
const { buildComponents, demucsProject, ffmpegExecutable } = require('../src/bootstrap/components');
const { extract, tarBinary } = require('../src/bootstrap/extract');
const { layout, PLATFORM } = require('../src/paths');
const { backendEnv } = require('../src/server');

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'remiqora-setup-'));
const req = manifest.requirements;

test('GPU verdicts', () => {
  assert.deepEqual(evaluateGpu({ name: 'RTX 4080', driver: '610.47', vramMiB: 16376, computeCap: 8.9 }, req), { ok: true });
  assert.equal(evaluateGpu(null, req).code, 'no-gpu');
  assert.equal(evaluateGpu({ name: 'RTX 4080', driver: '552.44', vramMiB: 16376, computeCap: 8.9 }, req).code, 'old-driver');
  assert.equal(evaluateGpu({ name: 'GTX 1080', driver: '610.47', vramMiB: 8192, computeCap: 6.1 }, req).code, 'old-gpu');
  assert.equal(evaluateGpu({ name: 'RTX 4080', driver: '610.47', vramMiB: 16376, computeCap: null }, req).ok, true);
});

test('checks refuse unsupported platforms and report free space', async () => {
  const dir = tmp();
  assert.ok((await freeBytes(path.join(dir, 'not', 'created', 'yet'))) > 0);
  const linux = await runChecks({ platform: 'linux-x64', dataRoot: dir, manifest, fetchImpl: async () => ({}) });
  assert.equal(linux.blocking.code, 'unsupported-platform');
  // The real requirement is 50 GB, which a CI runner or a small disk may not have: take the disk out of this test.
  const roomy = { ...manifest, requirements: { ...manifest.requirements, minFreeBytes: 1 } };
  const offline = await runChecks({ platform: 'darwin-arm64', dataRoot: dir, manifest: roomy, fetchImpl: async () => { throw new Error('down'); } });
  assert.equal(offline.blocking.code, 'offline');
  const online = await runChecks({ platform: 'darwin-arm64', dataRoot: dir, manifest: roomy, fetchImpl: async () => ({ status: 200 }) });
  assert.equal(online.blocking, null);
  const full = await runChecks({ platform: 'darwin-arm64', dataRoot: dir, manifest: { ...manifest, requirements: { ...manifest.requirements, minFreeBytes: Number.MAX_SAFE_INTEGER } }, fetchImpl: async () => ({ status: 200 }) });
  assert.equal(full.blocking.code, 'no-disk');
});

/** Fake components: the runner does not care what a component installs. */
function fakeComponents(log, { failOn } = {}) {
  return ['a', 'b', 'c'].map((id) => ({
    id, weight: 10, version: '1',
    verify: async () => true,
    async install(_ctx, report) {
      log.push(id);
      report({ done: 5, total: 10 });
      if (id === failOn) throw new Error(`boom in ${id}`);
    },
  }));
}

test('runs components in order, persists state and skips finished ones on the next run', async () => {
  const L = layout(tmp(), PLATFORM, manifest);
  const log = [];
  const events = [];
  const ctx = { L, manifest, platform: PLATFORM, resources: {}, components: fakeComponents(log, { failOn: 'b' }) };
  await assert.rejects(runSetup(ctx, (e) => events.push(e)), (err) => err.componentId === 'b');
  assert.deepEqual(log, ['a', 'b']);
  assert.equal(await isSetupComplete(ctx), false);

  log.length = 0;
  ctx.components = fakeComponents(log);
  await runSetup(ctx, () => {});
  assert.deepEqual(log, ['b', 'c'], 'a is already installed and must not run again');
  assert.equal(await isSetupComplete(ctx), true);
  assert.deepEqual((await describePlan(ctx)).map((p) => p.done), [true, true, true]);
});

test('a new component version is installed again', async () => {
  const L = layout(tmp(), PLATFORM, manifest);
  const log = [];
  const ctx = { L, manifest, platform: PLATFORM, resources: {}, components: fakeComponents(log) };
  await runSetup(ctx, () => {});
  ctx.components = fakeComponents(log).map((c) => (c.id === 'c' ? { ...c, version: '2' } : c));
  log.length = 0;
  await runSetup(ctx, () => {});
  assert.deepEqual(log, ['c']);
});

test('skipped components are reported and do not count as installed', async () => {
  const L = layout(tmp(), PLATFORM, manifest);
  const log = [];
  const events = [];
  const ctx = { L, manifest, platform: PLATFORM, resources: {}, skip: ['b'], components: fakeComponents(log).map((c) => ({ ...c, verify: async () => false })) };
  await runSetup(ctx, (e) => events.push(e));
  assert.deepEqual(log, ['a', 'c']);
  assert.ok(events.some((e) => e.id === 'b' && e.status === 'skipped'));
});

test('the real plan has every component, in dependency order', () => {
  const L = layout(tmp(), 'win32-x64', manifest);
  const resources = { backend: path.join(__dirname, '..', '..', 'backend'), acePatch: path.join(__dirname, '..', '..', 'external', 'patches', 'ace-step.patch') };
  const ids = buildComponents({ L, manifest, platform: 'win32-x64', resources }).map((c) => c.id);
  assert.deepEqual(ids, ['uv', 'ffmpeg', 'engine', 'backend-env', 'ace-step', 'ace-models', 'ace-base-model', 'demucs', 'stable-audio', 'prompt-assistant', 'weights']);
});

test('Demucs gets the CUDA torch index off macOS only', () => {
  assert.match(demucsProject('win32-x64'), /pytorch-cu128/);
  assert.doesNotMatch(demucsProject('darwin-arm64'), /pytorch-cu128/);
});

test('the backend keeps its port between starts so localStorage survives, and moves only when it must', async () => {
  const net = require('node:net');
  const { freePort } = require('../src/server');
  const first = await freePort();
  assert.equal(await freePort(first), first, 'a free preferred port is reused');
  const blocker = net.createServer();
  await new Promise((r) => blocker.listen(first, '127.0.0.1', r));
  try {
    const moved = await freePort(first);
    assert.notEqual(moved, first, 'a taken port is replaced');
    assert.ok(moved > 0);
  } finally {
    blocker.close();
  }
});

test('the backend environment points every path at the data root', () => {
  const L = layout(tmp(), 'win32-x64', manifest);
  const env = backendEnv({ L, manifest, platform: 'win32-x64' });
  assert.equal(env.REMIQORA_DATA_DIR, L.data);
  assert.equal(env.REMIQORA_LOG_DIR, L.logs);
  assert.equal(env.YUE2_DIR, L.yue2);
  assert.equal(env.HF_HOME, L.hfHome, 'model caches stay inside the chosen folder');
  assert.equal(env.TORCH_HOME, L.torchHome);
  assert.equal(env.CUDA_BIN_DIR, L.yue2Bin);
  assert.ok(env.PATH.split(path.delimiter).includes(L.uvDir));
  assert.equal(env.ELECTRON_RUN_AS_NODE, undefined);
});

test('the uv component finds the binary inside a tarball with a top-level folder (the macOS layout)', async (t) => {
  const http = require('node:http');
  const crypto = require('node:crypto');
  const src = tmp();
  fs.mkdirSync(path.join(src, 'uv-aarch64-apple-darwin'), { recursive: true });
  fs.writeFileSync(path.join(src, 'uv-aarch64-apple-darwin', 'uv'), 'fake uv binary');
  fs.writeFileSync(path.join(src, 'uv-aarch64-apple-darwin', 'uvx'), 'fake uvx');
  const archive = path.join(tmp(), 'uv.tar.gz');
  execFileSync(tarBinary(), ['-czf', archive, '-C', src, 'uv-aarch64-apple-darwin']);
  const body = fs.readFileSync(archive);
  const server = http.createServer((_req, res) => { res.writeHead(200, { 'content-length': body.length }); res.end(body); });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  t.after(() => { server.closeAllConnections(); server.close(); });

  const fake = JSON.parse(JSON.stringify(manifest));
  fake.uv.assets['darwin-arm64'] = {
    url: `http://127.0.0.1:${server.address().port}/uv-aarch64-apple-darwin.tar.gz`,
    sha256: crypto.createHash('sha256').update(body).digest('hex'), bytes: body.length, bin: 'uv-aarch64-apple-darwin/uv',
  };
  const L = layout(tmp(), 'darwin-arm64', fake);
  const resources = { backend: path.join(__dirname, '..', '..', 'backend'), acePatch: path.join(__dirname, '..', '..', 'external', 'patches', 'ace-step.patch') };
  const uv = buildComponents({ L, manifest: fake, platform: 'darwin-arm64', resources }).find((c) => c.id === 'uv');
  await uv.install({ L, manifest: fake, platform: 'darwin-arm64', signal: undefined }, () => {});
  assert.equal(fs.readFileSync(L.uvBin, 'utf8'), 'fake uv binary');
});

test('ffmpeg: a single static binary (the macOS build) is installed where the backend looks for it', async (t) => {
  const http = require('node:http');
  const crypto = require('node:crypto');
  const body = Buffer.from('fake static ffmpeg');
  const server = http.createServer((_req, res) => { res.writeHead(200, { 'content-length': body.length }); res.end(body); });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  t.after(() => { server.closeAllConnections(); server.close(); });

  const fake = JSON.parse(JSON.stringify(manifest));
  fake.ffmpeg.assets['darwin-arm64'] = {
    version: 'test-1', kind: 'binary', url: `http://127.0.0.1:${server.address().port}/ffmpeg-osx-arm64`,
    sha256: crypto.createHash('sha256').update(body).digest('hex'), bytes: body.length,
  };
  const L = layout(tmp(), 'darwin-arm64', fake);
  const resources = { backend: path.join(__dirname, '..', '..', 'backend'), acePatch: path.join(__dirname, '..', '..', 'external', 'patches', 'ace-step.patch') };
  const ffmpeg = buildComponents({ L, manifest: fake, platform: 'darwin-arm64', resources }).find((c) => c.id === 'ffmpeg');
  assert.equal(await ffmpeg.verify({}), false);
  await ffmpeg.install({ L, manifest: fake, platform: 'darwin-arm64' }, () => {});
  const exe = ffmpegExecutable(L, fake, 'darwin-arm64');
  assert.equal(fs.readFileSync(exe, 'utf8'), 'fake static ffmpeg');
  assert.equal(path.dirname(exe), path.join(L.ffmpegDir, 'bin'));
  assert.equal(await ffmpeg.verify({}), true);
  assert.equal(ffmpeg.version, 'test-1', 'the recorded version follows the platform asset');
  if (process.platform !== 'win32') assert.ok(fs.statSync(exe).mode & 0o100, 'executable bit set');
});

test('the Windows FFmpeg asset keeps its recorded version and folder layout', () => {
  const L = layout(tmp(), 'win32-x64', manifest);
  const resources = { backend: path.join(__dirname, '..', '..', 'backend'), acePatch: path.join(__dirname, '..', '..', 'external', 'patches', 'ace-step.patch') };
  const ffmpeg = buildComponents({ L, manifest, platform: 'win32-x64', resources }).find((c) => c.id === 'ffmpeg');
  assert.equal(ffmpeg.version, manifest.ffmpeg.version, 'unchanged, so existing installs are not re-downloaded');
  assert.match(ffmpegExecutable(L, manifest, 'win32-x64'), /ffmpeg-9\.0\.1-essentials_build[\\/]bin[\\/]ffmpeg\.exe$/);
});

test('every uv asset in the manifest names a binary that is "uv" or ends in "/uv"', () => {
  for (const [platform, asset] of Object.entries(manifest.uv.assets)) {
    assert.match(asset.bin, /(^|\/)uv(\.exe)?$/, platform);
  }
});

test('extracts a tar.gz archive', async () => {
  const src = tmp();
  fs.mkdirSync(path.join(src, 'top', 'sub'), { recursive: true });
  fs.writeFileSync(path.join(src, 'top', 'sub', 'f.txt'), 'hello');
  const archive = path.join(tmp(), 'a.tar.gz');
  execFileSync(tarBinary(), ['-czf', archive, '-C', src, 'top']); // the same bsdtar the app uses; GNU tar reads "E:\..." as a remote host
  const out = tmp();
  await extract(archive, out, { stripComponents: 1 });
  assert.equal(fs.readFileSync(path.join(out, 'sub', 'f.txt'), 'utf8'), 'hello');
});

test('re-patching ACE-Step keeps the environment and the models, and takes the new source', async () => {
  const { carryOver } = require('../src/bootstrap/components');
  const old = tmp();
  const fresh = tmp();
  const put = (root, rel, text) => { fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); fs.writeFileSync(path.join(root, rel), text); };
  put(old, 'acestep/handler.py', 'old source');
  put(old, '.venv/pyvenv.cfg', 'env');
  put(old, 'checkpoints/acestep-v15-turbo/model.safetensors', 'weights');
  put(old, 'checkpoints/README.md', 'old readme');
  put(old, 'lora_output/mine/adapter.safetensors', 'my lora');
  put(fresh, 'acestep/handler.py', 'patched source');
  put(fresh, 'checkpoints/README.md', 'new readme');
  await carryOver(old, fresh);
  const read = (rel) => fs.readFileSync(path.join(fresh, rel), 'utf8');
  assert.equal(read('acestep/handler.py'), 'patched source', 'the new source wins');
  assert.equal(read('checkpoints/README.md'), 'new readme');
  assert.equal(read('.venv/pyvenv.cfg'), 'env', 'the environment is kept');
  assert.equal(read('checkpoints/acestep-v15-turbo/model.safetensors'), 'weights', 'the models are kept');
  assert.equal(read('lora_output/mine/adapter.safetensors'), 'my lora', 'user files are kept');
});

test('ACE-Step is installed again when the patch changed', async () => {
  const L = layout(tmp(), 'win32-x64', manifest);
  const patch = path.join(tmp(), 'ace-step.patch');
  fs.writeFileSync(patch, 'patch one');
  const resources = { backend: path.join(__dirname, '..', '..', 'backend'), acePatch: patch };
  const ace = buildComponents({ L, manifest, platform: 'win32-x64', resources }).find((c) => c.id === 'ace-step');
  fs.mkdirSync(path.join(L.aceStep, '.venv'), { recursive: true });
  const crypto = require('node:crypto');
  const hash = (text) => crypto.createHash('sha1').update(text).digest('hex').slice(0, 12);
  fs.writeFileSync(path.join(L.aceStep, '.remiqora-patched'), hash('patch one'));
  assert.equal(await ace.verify({}), true);
  fs.writeFileSync(patch, 'patch two');
  assert.equal(await ace.verify({}), false, 'a changed patch makes the component due');
});

test('what an interrupted re-patch left in the temporary folder goes back, however deep', async () => {
  const { carryOver } = require('../src/bootstrap/components');
  const install = tmp();
  const stranded = tmp();
  const put = (root, rel, text) => { fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); fs.writeFileSync(path.join(root, rel), text); };
  put(install, 'acestep/handler.py', 'old source');                    // the run stopped before the folders were swapped
  put(stranded, 'acestep/handler.py', 'patched source');
  put(stranded, '.venv/pyvenv.cfg', 'env');
  put(stranded, 'checkpoints/acestep-v15-turbo/model.safetensors', 'weights');
  put(stranded, 'acestep/a/b/c/d/user.txt', 'deep user file');
  await carryOver(stranded, install);
  const read = (rel) => fs.readFileSync(path.join(install, rel), 'utf8');
  assert.equal(read('.venv/pyvenv.cfg'), 'env');
  assert.equal(read('checkpoints/acestep-v15-turbo/model.safetensors'), 'weights');
  assert.equal(read('acestep/a/b/c/d/user.txt'), 'deep user file', 'no depth limit');
  assert.equal(read('acestep/handler.py'), 'old source', 'files both have are left alone');
});

test('the note under the progress bar leaves out the hf_xet advice', () => {
  const { quietNote } = require('../src/bootstrap/components');
  const advice = "Xet Storage is enabled for this repo, but the 'hf_xet' package is not installed. Falling back to regular HTTP download.";
  assert.equal(quietNote(advice), '', 'a line that is only the advice is dropped');
  assert.equal(quietNote(`Fetching 28 files:  18%|#8        | 5/28 [00:00<00:03,  6.34it/s]${advice}`), 'Fetching 28 files:  18%|#8        | 5/28 [00:00<00:03,  6.34it/s]');
  assert.equal(quietNote('Resolved 212 packages in 1.2s'), 'Resolved 212 packages in 1.2s');
});

test('a model folder with a half-downloaded file is not a finished model', async () => {
  const { downloadComplete } = require('../src/bootstrap/components');
  const folder = path.join(tmp(), 'acestep-v15-base');
  assert.equal(await downloadComplete(folder), false, 'no folder yet');
  fs.mkdirSync(path.join(folder, '.cache', 'huggingface', 'download'), { recursive: true });
  fs.writeFileSync(path.join(folder, 'config.json'), '{}');
  fs.writeFileSync(path.join(folder, '.cache', 'huggingface', 'download', 'abc.incomplete'), 'half');
  assert.equal(await downloadComplete(folder), false, 'interrupted');
  fs.rmSync(path.join(folder, '.cache', 'huggingface', 'download', 'abc.incomplete'));
  fs.writeFileSync(path.join(folder, '.cache', 'huggingface', 'download', 'model.safetensors.lock'), '');
  assert.equal(await downloadComplete(folder), true, 'finished: lock files do not count');
});
