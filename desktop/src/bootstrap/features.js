'use strict';
// The optional parts a user picks on the first run (and can add later from the app):
//   yue2    - the audio.cpp engine and the YuE2 / SheetSage2 / MuScriptor weights, in one or both precisions;
//   demucs  - stem separation;
//   aceBase - ACE-Step's base model, which the editor's AI arranger needs to add parts;
//   aceXl   - ACE-Step's XL base model (about 20 GB): better parts, but it wants a 16 GB card or more;
//   stableAudio - the Stable Audio 3 server environment, and the checkpoints picked with it (sa3Models). They are
//             gated on Hugging Face: the first-run screen takes the user's token and checks it before the download;
//   assistant - the prompt assistant's environment; its model comes from the app's Models page.
// ACE-Step itself and the tools are always installed. Nothing already on disk is ever unselected or removed:
// the selection is widened by what is installed, so a later run can only add.
const fs = require('node:fs');
const path = require('node:path');
const { IS_WINDOWS } = require('../paths');
const MANIFEST = require('../../manifest.json');

const PRECISIONS = ['q8_0', 'q4_0', 'bf16'];
// what installs from before the picker had: bf16 is only ever added by choice (it is the largest file)
const LEGACY_PRECISIONS = ['q8_0', 'q4_0'];
const SA3_MODELS = ['medium', 'small-music', 'small-sfx'];
const FEATURE_IDS = ['yue2', 'demucs', 'aceBase', 'aceXl', 'stableAudio', 'assistant'];

/** Which components each feature brings. */
const FEATURE_COMPONENTS = { yue2: ['engine', 'weights'], demucs: ['demucs'], aceBase: ['ace-base-model'], aceXl: ['ace-xl-model'], stableAudio: ['stable-audio', 'sa3-models'], assistant: ['prompt-assistant'] };

/** First-run defaults: everything but the arranger's base models and Stable Audio 3, YuE2 in q8_0 only. */
const DEFAULT_SELECTION = Object.freeze({ yue2: true, yue2Precisions: ['q8_0'], demucs: true, aceBase: false, aceXl: false, stableAudio: false, sa3Models: [], assistant: false });

/** The Stable Audio 3 checkpoints a platform can run: `medium` needs CUDA, so a Mac gets the small ones. */
function sa3Offered(manifest, platform) {
  return SA3_MODELS.filter((m) => !(manifest.stableAudio.models[m].gpuOnly && platform.startsWith('darwin')));
}

/** Ticked with Stable Audio 3: the model the app warms up (medium where it runs) and the sound model for samples. */
function sa3Defaults(manifest, platform) {
  const offered = sa3Offered(manifest, platform);
  return (offered.includes('medium') ? ['medium', 'small-sfx'] : ['small-music', 'small-sfx']).filter((m) => offered.includes(m));
}

/** A checkpoint is there when a snapshot in the Hugging Face cache has every file the engine loads (sa3_server/specs.py). */
function sa3ModelInstalled(L, manifest, id) {
  const snapshots = path.join(L.hfHome, 'hub', `models--${manifest.stableAudio.models[id].repo.replace('/', '--')}`, 'snapshots');
  let names;
  try { names = fs.readdirSync(snapshots); } catch { return false; }
  return names.some((s) => manifest.stableAudio.requiredFiles.every((f) => fs.existsSync(path.join(snapshots, s, f))));
}

/** What is on disk now, checked the way the backend checks it (backend/app/features.py). */
function detectInstalled(L, manifest = MANIFEST) {
  const models = path.join(L.yue2, 'models', 'Yue2-3B-GGUF');
  const precisions = PRECISIONS.filter((p) => fs.existsSync(path.join(models, `yue2-3b-${p}.gguf`)));
  const server = path.join(L.yue2Bin, IS_WINDOWS ? 'audiocpp_server.exe' : 'audiocpp_server');
  return {
    yue2: fs.existsSync(server) && precisions.length > 0,
    yue2Precisions: precisions,
    demucs: fs.existsSync(path.join(L.demucs, '.venv')),
    aceBase: fs.existsSync(path.join(L.aceStep, 'checkpoints', 'acestep-v15-base', 'model.safetensors')),
    aceXl: fs.existsSync(path.join(L.aceStep, 'checkpoints', 'acestep-v15-xl-base', 'model-00004-of-00004.safetensors')),
    stableAudio: fs.existsSync(path.join(L.stableAudio, '.venv')),
    sa3Models: SA3_MODELS.filter((m) => sa3ModelInstalled(L, manifest, m)),
    assistant: fs.existsSync(path.join(L.promptAssistant, '.venv')),
  };
}

/**
 * A saved selection widened by what is installed. With no saved selection: an install made before the choice
 * existed (it has a state.json) installed everything, so it keeps everything; a fresh one gets the defaults.
 */
function resolveSelection(saved, installed, { legacyInstall = false } = {}) {
  const base = saved && typeof saved === 'object'
    ? saved
    : legacyInstall ? { yue2: true, yue2Precisions: [...LEGACY_PRECISIONS], demucs: true, aceBase: installed.aceBase, aceXl: installed.aceXl, stableAudio: installed.stableAudio, assistant: installed.assistant } : DEFAULT_SELECTION;
  const precisions = new Set([...(Array.isArray(base.yue2Precisions) ? base.yue2Precisions : []), ...installed.yue2Precisions]);
  // the checkpoints count only with Stable Audio itself picked; the ones on disk always do
  const sa3 = new Set([...(base.stableAudio && Array.isArray(base.sa3Models) ? base.sa3Models : []), ...(installed.sa3Models || [])]);
  const sel = {
    yue2: !!base.yue2 || installed.yue2,
    yue2Precisions: PRECISIONS.filter((p) => precisions.has(p)),
    demucs: !!base.demucs || installed.demucs,
    aceBase: !!base.aceBase || installed.aceBase,
    aceXl: !!base.aceXl || installed.aceXl,
    stableAudio: !!base.stableAudio || installed.stableAudio,
    sa3Models: SA3_MODELS.filter((m) => sa3.has(m)),
    assistant: !!base.assistant || installed.assistant,
  };
  // YuE2 without a precision cannot run: fall back to q8_0.
  if (sel.yue2 && sel.yue2Precisions.length === 0) sel.yue2Precisions = ['q8_0'];
  return sel;
}

/** The weight packages to install for a selection, in the manifest's order (its version string depends on it). */
function weightPackages(manifest, selection) {
  const w = manifest.weights;
  const mains = selection.yue2Precisions.map((p) => w.precisions[p].package);
  return w.packageOrder.filter((pkg) => mains.includes(pkg) || w.common.includes(pkg));
}

/** Bytes per feature for the selection screen; YuE2's depends on the precisions. */
function featureSizes(manifest, platform, selection) {
  const engine = manifest.engine.assets[platform];
  const engineBytes = engine ? engine.files.reduce((a, f) => a + f.bytes, 0) : 0;
  const w = manifest.weights;
  return {
    yue2: engineBytes + w.commonBytes + selection.yue2Precisions.reduce((a, p) => a + w.precisions[p].bytes, 0),
    precisions: Object.fromEntries(PRECISIONS.map((p) => [p, w.precisions[p].bytes])),
    demucs: manifest.demucs.approxBytes,
    aceBase: manifest.aceBaseModel.approxBytes,
    aceXl: manifest.aceXlModel.approxBytes,
    stableAudio: manifest.stableAudio.approxBytes + sa3Bytes(manifest, selection.sa3Models),
    sa3Models: Object.fromEntries(SA3_MODELS.map((m) => [m, manifest.stableAudio.models[m].bytes])),
    assistant: manifest.promptAssistant.approxBytes,
  };
}

const sa3Bytes = (manifest, models) => (models || []).reduce((a, m) => a + manifest.stableAudio.models[m].bytes, 0);

/** Component ids a selection leaves out. */
function excludedComponents(selection) {
  const left = FEATURE_IDS.filter((f) => !selection[f]).flatMap((f) => FEATURE_COMPONENTS[f]);
  if (selection.stableAudio && !(selection.sa3Models || []).length) left.push('sa3-models');
  return left;
}

module.exports = {
  PRECISIONS, LEGACY_PRECISIONS, SA3_MODELS, FEATURE_IDS, FEATURE_COMPONENTS, DEFAULT_SELECTION,
  sa3Offered, sa3Defaults, sa3ModelInstalled, sa3Bytes,
  detectInstalled, resolveSelection, weightPackages, featureSizes, excludedComponents,
};
