'use strict';
// The optional parts a user picks on the first run (and can add later from the app):
//   yue2    - the audio.cpp engine and the YuE2 / SheetSage2 / MuScriptor weights, in one or both precisions;
//   demucs  - stem separation;
//   aceBase - ACE-Step's base model, which the editor's AI arranger needs to add parts;
//   aceXl   - ACE-Step's XL base model (about 20 GB): better parts, but it wants a 16 GB card or more.
// ACE-Step itself and the tools are always installed. Nothing already on disk is ever unselected or removed:
// the selection is widened by what is installed, so a later run can only add.
const fs = require('node:fs');
const path = require('node:path');
const { IS_WINDOWS } = require('../paths');

const PRECISIONS = ['q8_0', 'q4_0'];
const FEATURE_IDS = ['yue2', 'demucs', 'aceBase', 'aceXl'];

/** Which components each feature brings. */
const FEATURE_COMPONENTS = { yue2: ['engine', 'weights'], demucs: ['demucs'], aceBase: ['ace-base-model'], aceXl: ['ace-xl-model'] };

/** First-run defaults: everything but the arranger's base models, YuE2 in q8_0 only. */
const DEFAULT_SELECTION = Object.freeze({ yue2: true, yue2Precisions: ['q8_0'], demucs: true, aceBase: false, aceXl: false });

/** What is on disk now, checked the way the backend checks it (backend/app/features.py). */
function detectInstalled(L) {
  const models = path.join(L.yue2, 'models', 'Yue2-3B-GGUF');
  const precisions = PRECISIONS.filter((p) => fs.existsSync(path.join(models, `yue2-3b-${p}.gguf`)));
  const server = path.join(L.yue2Bin, IS_WINDOWS ? 'audiocpp_server.exe' : 'audiocpp_server');
  return {
    yue2: fs.existsSync(server) && precisions.length > 0,
    yue2Precisions: precisions,
    demucs: fs.existsSync(path.join(L.demucs, '.venv')),
    aceBase: fs.existsSync(path.join(L.aceStep, 'checkpoints', 'acestep-v15-base', 'model.safetensors')),
    aceXl: fs.existsSync(path.join(L.aceStep, 'checkpoints', 'acestep-v15-xl-base', 'model-00004-of-00004.safetensors')),
  };
}

/**
 * A saved selection widened by what is installed. With no saved selection: an install made before the choice
 * existed (it has a state.json) installed everything, so it keeps everything; a fresh one gets the defaults.
 */
function resolveSelection(saved, installed, { legacyInstall = false } = {}) {
  const base = saved && typeof saved === 'object'
    ? saved
    : legacyInstall ? { yue2: true, yue2Precisions: [...PRECISIONS], demucs: true, aceBase: installed.aceBase, aceXl: installed.aceXl } : DEFAULT_SELECTION;
  const precisions = new Set([...(Array.isArray(base.yue2Precisions) ? base.yue2Precisions : []), ...installed.yue2Precisions]);
  const sel = {
    yue2: !!base.yue2 || installed.yue2,
    yue2Precisions: PRECISIONS.filter((p) => precisions.has(p)),
    demucs: !!base.demucs || installed.demucs,
    aceBase: !!base.aceBase || installed.aceBase,
    aceXl: !!base.aceXl || installed.aceXl,
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
  };
}

/** Component ids a selection leaves out. */
function excludedComponents(selection) {
  return FEATURE_IDS.filter((f) => !selection[f]).flatMap((f) => FEATURE_COMPONENTS[f]);
}

module.exports = {
  PRECISIONS, FEATURE_IDS, FEATURE_COMPONENTS, DEFAULT_SELECTION,
  detectInstalled, resolveSelection, weightPackages, featureSizes, excludedComponents,
};
