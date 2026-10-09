'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const manifest = require('../manifest.json');
const { DEFAULT_SELECTION, detectInstalled, resolveSelection, weightPackages, featureSizes, excludedComponents } = require('../src/bootstrap/features');
const { buildComponents } = require('../src/bootstrap/components');
const { runChecks } = require('../src/bootstrap/checks');
const { layout, IS_WINDOWS } = require('../src/paths');

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'remiqora-features-'));
const nothing = { yue2: false, yue2Precisions: [], demucs: false, aceBase: false, aceXl: false };
const ids = (sel) => buildComponents({ L: layout(tmp(), 'win32-x64', manifest), manifest, platform: 'win32-x64', resources: { acePatch: 'x', backend: 'x' }, selection: sel }).map((c) => c.id);

test('a fresh install gets the defaults, an older one keeps everything', () => {
  assert.deepEqual(resolveSelection(null, nothing), { ...DEFAULT_SELECTION, yue2Precisions: ['q8_0'] });
  assert.deepEqual(resolveSelection(null, nothing, { legacyInstall: true }), { yue2: true, yue2Precisions: ['q8_0', 'q4_0'], demucs: true, aceBase: false, aceXl: false });
});

test('the selection never drops what is installed, and YuE2 always has a precision', () => {
  const installed = { yue2: true, yue2Precisions: ['q4_0'], demucs: true, aceBase: false, aceXl: false };
  const sel = resolveSelection({ yue2: false, yue2Precisions: [], demucs: false, aceBase: true }, installed);
  assert.deepEqual(sel, { yue2: true, yue2Precisions: ['q4_0'], demucs: true, aceBase: true, aceXl: false });
  assert.deepEqual(resolveSelection({ yue2: true, yue2Precisions: [] }, nothing).yue2Precisions, ['q8_0']);
});

test('weights follow the precisions; both keep the version older installs recorded', () => {
  assert.deepEqual(weightPackages(manifest, { yue2Precisions: ['q4_0'] }), ['yue2_main_q4_0', 'yue2_vae_f16', 'sheetsage2_orig', 'muscriptor_small_f32']);
  // the version string before the choice existed: changing it would make every update re-run the weights step
  assert.equal(weightPackages(manifest, { yue2Precisions: ['q8_0', 'q4_0'] }).join('+'), 'yue2_main_q8_0+yue2_main_q4_0+yue2_vae_f16+sheetsage2_orig+muscriptor_small_f32');
});

test('components left out with their feature', () => {
  assert.deepEqual(ids(undefined), ['uv', 'ffmpeg', 'engine', 'backend-env', 'ace-step', 'ace-models', 'ace-base-model', 'demucs', 'weights']);
  assert.deepEqual(ids(nothing), ['uv', 'ffmpeg', 'backend-env', 'ace-step', 'ace-models']);
  assert.deepEqual(ids({ ...nothing, demucs: true }), ['uv', 'ffmpeg', 'backend-env', 'ace-step', 'ace-models', 'demucs']);
  assert.deepEqual(ids({ ...nothing, aceXl: true }), ['uv', 'ffmpeg', 'backend-env', 'ace-step', 'ace-models', 'ace-xl-model']);
  assert.deepEqual(excludedComponents({ yue2: true, demucs: false, aceBase: false, aceXl: false }), ['demucs', 'ace-base-model', 'ace-xl-model']);
});

test('sizes: YuE2 grows with each precision', () => {
  const one = featureSizes(manifest, 'win32-x64', { yue2Precisions: ['q8_0'] });
  const both = featureSizes(manifest, 'win32-x64', { yue2Precisions: ['q8_0', 'q4_0'] });
  assert.equal(both.yue2 - one.yue2, manifest.weights.precisions.q4_0.bytes);
  assert.equal(one.demucs, manifest.demucs.approxBytes);
});

test('what is installed is read from disk', () => {
  const L = layout(tmp(), 'win32-x64', manifest);
  assert.deepEqual(detectInstalled(L), nothing);
  const put = (file) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, ''); };
  put(path.join(L.yue2Bin, IS_WINDOWS ? 'audiocpp_server.exe' : 'audiocpp_server'));
  put(path.join(L.yue2, 'models', 'Yue2-3B-GGUF', 'yue2-3b-q4_0.gguf'));
  fs.mkdirSync(path.join(L.demucs, '.venv'), { recursive: true });
  assert.deepEqual(detectInstalled(L), { yue2: true, yue2Precisions: ['q4_0'], demucs: true, aceBase: false, aceXl: false });
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
