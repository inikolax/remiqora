'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const manifest = require('../manifest.json');
const { DEFAULT_SELECTION, detectInstalled, resolveSelection, weightPackages, featureSizes, excludedComponents, sa3Offered, sa3Defaults, coverOffered, coverBytes } = require('../src/bootstrap/features');
const { buildComponents, treeHash } = require('../src/bootstrap/components');
const { runChecks } = require('../src/bootstrap/checks');
const { layout, IS_WINDOWS } = require('../src/paths');

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'remiqora-features-'));
const nothing = { yue2: false, yue2Precisions: [], demucs: false, aceBase: false, aceXl: false, stableAudio: false, sa3Models: [], assistant: false, cover: false };
const ids = (sel) => buildComponents({ L: layout(tmp(), 'win32-x64', manifest), manifest, platform: 'win32-x64', resources: { acePatch: 'x', backend: 'x' }, selection: sel }).map((c) => c.id);

test('a fresh install gets the defaults, an older one keeps everything', () => {
  assert.deepEqual(resolveSelection(null, nothing), { ...DEFAULT_SELECTION, yue2Precisions: ['q8_0'] });
  assert.deepEqual(resolveSelection(null, nothing, { legacyInstall: true }), { yue2: true, yue2Precisions: ['q8_0', 'q4_0'], demucs: true, aceBase: false, aceXl: false, stableAudio: false, sa3Models: [], assistant: false, cover: false });
});

test('the selection never drops what is installed, and YuE2 always has a precision', () => {
  const installed = { yue2: true, yue2Precisions: ['q4_0'], demucs: true, aceBase: false, aceXl: false, stableAudio: true, sa3Models: [], assistant: false, cover: false };
  const sel = resolveSelection({ yue2: false, yue2Precisions: [], demucs: false, aceBase: true }, installed);
  assert.deepEqual(sel, { yue2: true, yue2Precisions: ['q4_0'], demucs: true, aceBase: true, aceXl: false, stableAudio: true, sa3Models: [], assistant: false, cover: false });
  assert.deepEqual(resolveSelection({ yue2: true, yue2Precisions: [] }, nothing).yue2Precisions, ['q8_0']);
});

test('weights follow the precisions; both keep the version older installs recorded', () => {
  assert.deepEqual(weightPackages(manifest, { yue2Precisions: ['q4_0'] }), ['yue2_main_q4_0', 'yue2_vae_f16', 'sheetsage2_orig', 'muscriptor_small_f32']);
  // the version string before the choice existed: changing it would make every update re-run the weights step
  assert.equal(weightPackages(manifest, { yue2Precisions: ['q8_0', 'q4_0'] }).join('+'), 'yue2_main_q8_0+yue2_main_q4_0+yue2_vae_f16+sheetsage2_orig+muscriptor_small_f32');
});

test('components left out with their feature', () => {
  assert.deepEqual(ids(undefined), ['uv', 'ffmpeg', 'engine', 'backend-env', 'ace-step', 'ace-models', 'ace-base-model', 'demucs', 'stable-audio', 'prompt-assistant', 'weights']);
  assert.deepEqual(ids(nothing), ['uv', 'ffmpeg', 'backend-env', 'ace-step', 'ace-models']);
  assert.deepEqual(ids({ ...nothing, demucs: true }), ['uv', 'ffmpeg', 'backend-env', 'ace-step', 'ace-models', 'demucs']);
  assert.deepEqual(ids({ ...nothing, aceXl: true }), ['uv', 'ffmpeg', 'backend-env', 'ace-step', 'ace-models', 'ace-xl-model']);
  assert.deepEqual(ids({ ...nothing, stableAudio: true }), ['uv', 'ffmpeg', 'backend-env', 'ace-step', 'ace-models', 'stable-audio']);
  assert.deepEqual(ids({ ...nothing, assistant: true }), ['uv', 'ffmpeg', 'backend-env', 'ace-step', 'ace-models', 'prompt-assistant']);
  assert.deepEqual(ids({ ...nothing, cover: true }), ['uv', 'ffmpeg', 'backend-env', 'ace-step', 'ace-models', 'cover-server', 'cover-models']);
  assert.deepEqual(excludedComponents({ yue2: true, demucs: false, aceBase: false, aceXl: false, stableAudio: false, assistant: false, cover: false }), ['demucs', 'ace-base-model', 'ace-xl-model', 'stable-audio', 'sa3-models', 'prompt-assistant', 'cover-server', 'cover-models']);
  assert.ok(!excludedComponents({ ...nothing, cover: true }).includes('cover-server'));
});

test('sizes: YuE2 grows with each precision', () => {
  const one = featureSizes(manifest, 'win32-x64', { yue2Precisions: ['q8_0'] });
  const both = featureSizes(manifest, 'win32-x64', { yue2Precisions: ['q8_0', 'q4_0'] });
  assert.equal(both.yue2 - one.yue2, manifest.weights.precisions.q4_0.bytes);
  assert.equal(one.demucs, manifest.demucs.approxBytes);
  assert.equal(one.stableAudio, manifest.stableAudio.approxBytes);
});

test('what is installed is read from disk', () => {
  const L = layout(tmp(), 'win32-x64', manifest);
  assert.deepEqual(detectInstalled(L), nothing);
  const put = (file) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, ''); };
  put(path.join(L.yue2Bin, IS_WINDOWS ? 'audiocpp_server.exe' : 'audiocpp_server'));
  put(path.join(L.yue2, 'models', 'Yue2-3B-GGUF', 'yue2-3b-q4_0.gguf'));
  fs.mkdirSync(path.join(L.demucs, '.venv'), { recursive: true });
  fs.mkdirSync(path.join(L.stableAudio, '.venv'), { recursive: true });
  assert.deepEqual(detectInstalled(L), { yue2: true, yue2Precisions: ['q4_0'], demucs: true, aceBase: false, aceXl: false, stableAudio: true, sa3Models: [], assistant: false, cover: false });
});

test('the Stable Audio 3 step follows its server sources', () => {
  const src = tmp();
  fs.writeFileSync(path.join(src, 'pyproject.toml'), '[project]\nname = "sa3-server"\n');
  fs.mkdirSync(path.join(src, 'sa3_server', '__pycache__'), { recursive: true });
  fs.writeFileSync(path.join(src, 'sa3_server', 'main.py'), 'print(1)\n');
  const before = treeHash(src, 'none');
  fs.writeFileSync(path.join(src, 'sa3_server', '__pycache__', 'main.pyc'), 'x');
  assert.equal(treeHash(src, 'none'), before, 'bytecode does not count');
  fs.writeFileSync(path.join(src, 'sa3_server', 'main.py'), 'print(2)\n');
  assert.notEqual(treeHash(src, 'none'), before, 'a changed server is copied again');
  assert.equal(treeHash(path.join(src, 'missing'), 'none'), 'none');
  const step = buildComponents({ L: layout(tmp(), 'win32-x64', manifest), manifest, platform: 'win32-x64', resources: { acePatch: 'x', backend: 'x', sa3Server: src }, selection: { ...nothing, stableAudio: true } })
    .find((c) => c.id === 'stable-audio');
  assert.equal(step.version, `stable-audio-${treeHash(src, 'none')}`);
});

test('the disk check asks for what the picked parts need', async () => {
  const dir = tmp();
  const online = async () => ({ status: 200 });
  const small = await runChecks({ platform: 'darwin-arm64', dataRoot: dir, manifest, requiredBytes: 1, fetchImpl: online });
  assert.equal(small.items.find((i) => i.id === 'disk').requiredBytes, 1);
  assert.equal(small.blocking, null);
  const huge = await runChecks({ platform: 'darwin-arm64', dataRoot: dir, manifest, requiredBytes: Number.MAX_SAFE_INTEGER, fetchImpl: online });
  assert.equal(huge.blocking.code, 'no-disk');
});

test('Stable Audio 3 checkpoints: picked with it, kept once on disk, medium only where CUDA runs', () => {
  assert.deepEqual(sa3Offered(manifest, 'win32-x64'), ['medium', 'small-music', 'small-sfx']);
  assert.deepEqual(sa3Offered(manifest, 'darwin-arm64'), ['small-music', 'small-sfx']);
  assert.deepEqual(sa3Defaults(manifest, 'win32-x64'), ['medium', 'small-sfx']);
  assert.deepEqual(sa3Defaults(manifest, 'darwin-arm64'), ['small-music', 'small-sfx']);
  // without Stable Audio itself the checkpoints are not picked, but the ones on disk stay
  assert.deepEqual(resolveSelection({ ...nothing, sa3Models: ['medium'] }, nothing).sa3Models, []);
  assert.deepEqual(resolveSelection({ ...nothing, stableAudio: true, sa3Models: ['small-sfx', 'medium'] }, nothing).sa3Models, ['medium', 'small-sfx']);
  assert.deepEqual(resolveSelection({ ...nothing, stableAudio: true, sa3Models: [] }, { ...nothing, stableAudio: true, sa3Models: ['small-music'] }).sa3Models, ['small-music']);
});

test('the checkpoints step follows the picked list, after the server', () => {
  assert.deepEqual(ids({ ...nothing, stableAudio: true, sa3Models: ['small-sfx'] }), ['uv', 'ffmpeg', 'backend-env', 'ace-step', 'ace-models', 'stable-audio', 'sa3-models']);
  const step = buildComponents({ L: layout(tmp(), 'win32-x64', manifest), manifest, platform: 'win32-x64', resources: { acePatch: 'x', backend: 'x' }, selection: { ...nothing, stableAudio: true, sa3Models: ['medium', 'small-sfx'] } })
    .find((c) => c.id === 'sa3-models');
  assert.equal(step.version, 'medium+small-sfx');
  assert.equal(step.weight, manifest.stableAudio.models.medium.bytes + manifest.stableAudio.models['small-sfx'].bytes);
  const sizes = featureSizes(manifest, 'win32-x64', { yue2Precisions: ['q8_0'], sa3Models: ['small-sfx'] });
  assert.equal(sizes.stableAudio, manifest.stableAudio.approxBytes + manifest.stableAudio.models['small-sfx'].bytes);
});

test('a checkpoint counts as installed only with its text encoder, in any snapshot', async () => {
  const L = layout(tmp(), 'win32-x64', manifest);
  const snap = path.join(L.hfHome, 'hub', 'models--stabilityai--stable-audio-3-small-sfx', 'snapshots', 'abc123');
  const put = (file) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, ''); };
  put(path.join(snap, 'model.safetensors'));
  assert.deepEqual(detectInstalled(L).sa3Models, [], 'the DiT alone is not enough');
  put(path.join(snap, 't5gemma-b-b-ul2', 'model.safetensors'));
  assert.deepEqual(detectInstalled(L).sa3Models, ['small-sfx']);
  const step = buildComponents({ L, manifest, platform: 'win32-x64', resources: { acePatch: 'x', backend: 'x' }, selection: { ...nothing, stableAudio: true, sa3Models: ['small-sfx'] } })
    .find((c) => c.id === 'sa3-models');
  assert.equal(await step.verify(), true);
});

test('bf16 is a choice only: installs from before the picker do not get it, and its weights follow the manifest', () => {
  const { PRECISIONS, LEGACY_PRECISIONS } = require('../src/bootstrap/features');
  assert.ok(PRECISIONS.includes('bf16'));
  assert.deepEqual(LEGACY_PRECISIONS, ['q8_0', 'q4_0']);
  assert.ok(weightPackages(manifest, { yue2Precisions: ['bf16'] }).includes('yue2_main_bf16'));
  const one = featureSizes(manifest, 'win32-x64', { yue2Precisions: ['q8_0'] });
  const withBf16 = featureSizes(manifest, 'win32-x64', { yue2Precisions: ['q8_0', 'bf16'] });
  assert.equal(withBf16.yue2 - one.yue2, manifest.weights.precisions.bf16.bytes);
});

test('album covers: off by default, kept by older installs only when on disk, widened by what is there', () => {
  assert.equal(DEFAULT_SELECTION.cover, false);
  assert.equal(resolveSelection(null, nothing).cover, false);
  // an install from before the choice is not handed a 10 GB download
  assert.equal(resolveSelection(null, nothing, { legacyInstall: true }).cover, false);
  assert.equal(resolveSelection(null, { ...nothing, cover: true }, { legacyInstall: true }).cover, true);
  // a pick saved before covers existed has no such key
  const old = { yue2: true, yue2Precisions: ['q8_0'], demucs: true, aceBase: false, aceXl: false, stableAudio: false, sa3Models: [], assistant: false };
  assert.equal(resolveSelection(old, nothing).cover, false);
  assert.equal(resolveSelection(old, { ...nothing, cover: true }).cover, true);
  assert.equal(resolveSelection({ ...old, cover: true }, nothing).cover, true);
});

test('album covers: sizes and steps follow the platform pinned in the manifest', () => {
  assert.ok(coverOffered(manifest, 'win32-x64'));
  assert.ok(coverOffered(manifest, 'darwin-arm64'));
  assert.ok(!coverOffered(manifest, 'darwin-x64'));
  const models = manifest.cover.models.reduce((a, m) => a + m.bytes, 0);
  for (const platform of ['win32-x64', 'darwin-arm64']) {
    const server = manifest.cover.assets[platform].files.reduce((a, f) => a + f.bytes, 0);
    assert.equal(featureSizes(manifest, platform, { yue2Precisions: ['q8_0'] }).cover, server + models);
    const steps = buildComponents({ L: layout(tmp(), platform, manifest), manifest, platform, resources: { acePatch: 'x', backend: 'x' }, selection: { ...nothing, cover: true } });
    assert.equal(steps.find((c) => c.id === 'cover-server').weight, server);
    assert.equal(steps.find((c) => c.id === 'cover-models').weight, models);
    assert.equal(steps.find((c) => c.id === 'cover-server').version, manifest.cover.release);
  }
  assert.equal(manifest.cover.assets['win32-x64'].files.length, 2, 'the CUDA build and its runtime');
  assert.equal(coverBytes(manifest, 'darwin-x64'), 0);
});

test('album covers: the files are the ones the backend pins and checks', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', '..', 'backend', 'app', 'engine_parts.py'), 'utf8');
  const num = (s) => Number(s.replace(/_/g, ''));
  assert.equal(src.match(/SDCPP_RELEASE = "([^"]+)"/)[1], manifest.cover.release);
  const zips = Object.fromEntries([...src.matchAll(/\("([^"]+\.zip)", ([\d_]+), [\d_]+\)/g)].map((m) => [m[1], num(m[2])]));
  for (const asset of Object.values(manifest.cover.assets)) {
    for (const f of asset.files) {
      const name = path.basename(new URL(f.url).pathname);
      assert.equal(zips[name], f.bytes, `${name} as in engine_parts.py`);
      assert.ok(f.url.includes(`/${manifest.cover.release}/`));
      assert.match(f.sha256, /^[0-9a-f]{64}$/);
    }
  }
  for (const m of manifest.cover.models) {
    const at = src.indexOf(`"${m.name}": (`);
    const row = at < 0 ? null : src.slice(at).match(/^"[^"]+": \(\s*"([^"]+)",\s*([\d_]+)/);
    assert.ok(row, `${m.name} is in COVER_FILES`);
    assert.equal(row[1], m.url);
    assert.equal(num(row[2]), m.bytes);
    assert.match(m.sha256, /^[0-9a-f]{64}$/);
  }
});

test('album covers count as installed with the server and every weight at its size', async () => {
  const L = layout(tmp(), 'win32-x64', manifest);
  // small stand-ins for the weights: the real ones are 9 GB
  const fake = { ...manifest, cover: { ...manifest.cover, models: [{ name: 'a.gguf', bytes: 3 }, { name: 'b.safetensors', bytes: 2 }] } };
  const put = (file, bytes) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, Buffer.alloc(bytes)); };
  assert.equal(detectInstalled(L, fake).cover, false);
  put(path.join(L.sdcpp, 'bin', IS_WINDOWS ? 'sd-server.exe' : 'sd-server'), 1);
  put(path.join(L.sdcpp, 'models', 'a.gguf'), 3);
  put(path.join(L.sdcpp, 'models', 'b.safetensors'), 1);
  assert.equal(detectInstalled(L, fake).cover, false, 'a weight cut short does not count');
  const step = () => buildComponents({ L, manifest: fake, platform: 'win32-x64', resources: { acePatch: 'x', backend: 'x' }, selection: { ...nothing, cover: true } });
  assert.equal(await step().find((c) => c.id === 'cover-models').verify(), false);
  put(path.join(L.sdcpp, 'models', 'b.safetensors'), 2);
  assert.equal(detectInstalled(L, fake).cover, true);
  assert.equal(await step().find((c) => c.id === 'cover-server').verify(), true);
  assert.equal(await step().find((c) => c.id === 'cover-models').verify(), true);
  // files already there are kept: nothing is downloaded
  const events = [];
  await step().find((c) => c.id === 'cover-models').install({ signal: undefined }, (e) => events.push(e));
  assert.equal(events.at(-1).done, 5);
});
