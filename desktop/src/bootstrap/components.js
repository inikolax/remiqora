'use strict';
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { downloadFile, withRetries } = require('./download');
const { extract, extractAtomic } = require('./extract');
const { applyGitPatch } = require('./patch');
const { runCommand, cleanEnv } = require('../proc');
const { IS_WINDOWS } = require('../paths');
const { PRECISIONS, weightPackages, excludedComponents } = require('./features');

const exists = (p) => fsp.access(p).then(() => true, () => false);
const sum = (list) => list.reduce((a, b) => a + b, 0);
const sha1 = (text) => crypto.createHash('sha1').update(text).digest('hex').slice(0, 12);

/** Environment for uv: everything (Python, wheel cache) stays under the data root the user chose. */
function uvEnv(L) {
  // only-managed: never bind the venvs to a system Python that the user may later remove or upgrade.
  return cleanEnv({ UV_CACHE_DIR: L.uvCache, UV_PYTHON_INSTALL_DIR: L.pythonDir, UV_PYTHON_PREFERENCE: 'only-managed', HF_HOME: L.hfHome, TORCH_HOME: L.torchHome, UV_NO_PROGRESS: '1', NO_COLOR: '1', PYTHONUTF8: '1' });
}

async function dirSize(dir) {
  let total = 0;
  let entries;
  try { entries = await fsp.readdir(dir, { withFileTypes: true }); } catch { return 0; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    total += e.isDirectory() ? await dirSize(p) : (await fsp.stat(p).catch(() => ({ size: 0 }))).size;
  }
  return total;
}

/**
 * `uv sync` reports no byte counts, but everything it downloads lands in the wheel cache, so the growth of that
 * folder is an honest progress signal. Capped below 100% because the estimate can only be approximate.
 */
async function withCacheGrowth(dir, total, report, task) {
  const baseline = await dirSize(dir);
  const timer = setInterval(async () => {
    const grown = Math.max(0, (await dirSize(dir)) - baseline);
    report({ done: Math.min(grown, total * 0.98), total });
  }, 3000);
  try {
    return await task();
  } finally {
    clearInterval(timer);
  }
}

/** Downloads one manifest file into the downloads cache and reports byte progress offset by `base`. */
function fetchTo(ctx, file, base, total, report) {
  return downloadFile({
    url: file.url,
    dest: path.join(ctx.L.downloads, path.basename(new URL(file.url).pathname)),
    sha256: file.sha256,
    signal: ctx.signal,
    onProgress: (done) => report({ done: base + done, total }),
  });
}

/** Demucs is a throwaway uv project. torch has to come from the CUDA wheel index, or it silently falls back to CPU. */
function demucsProject(platform) {
  const head = `[project]
name = "demucs-runner"
version = "0.1.0"
requires-python = ">=3.11,<3.13"
dependencies = [
    "demucs>=4.0.1",
    "numpy>=1.26.4",
    "torch>=2.11.0",
]

[tool.uv]
package = false
`;
  if (platform.startsWith('darwin')) return head; // the plain PyPI wheel is MPS-capable on Apple Silicon
  return `${head}
[[tool.uv.index]]
name = "pytorch-cu128"
url = "https://download.pytorch.org/whl/cu128"
explicit = true

[tool.uv.sources]
torch = { index = "pytorch-cu128" }
`;
}

/** First file called `name` anywhere under `dir` (archives differ: uv's zip is flat, its tarballs have a top folder). */
async function findFile(dir, name) {
  for (const entry of await fsp.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isFile() && entry.name === name) return p;
    if (entry.isDirectory()) {
      const inner = await findFile(p, name);
      if (inner) return inner;
    }
  }
  return null;
}

/** Moves the contents of an extracted engine archive into place: tools/ and model_specs/ next to bin/, the rest into bin/. */
async function placeEngineFiles(extracted, L) {
  for (const name of await fsp.readdir(extracted)) {
    const src = path.join(extracted, name);
    const dst = ['tools', 'model_specs'].includes(name) ? path.join(L.yue2, name) : path.join(L.yue2Bin, name);
    await fsp.mkdir(path.dirname(dst), { recursive: true });
    await fsp.cp(src, dst, { recursive: true, force: true });
  }
}

/**
 * The ordered list of things the first run installs. Each component:
 *   id, weight (bytes, for the overall bar), version (a change re-runs it),
 *   verify(ctx) -> bool (sanity check on disk), install(ctx, report).
 * report({ done, total, note }): byte progress is optional, `note` is a human line (uv output, ...).
 * `selection` (bootstrap/features.js) leaves out the optional parts the user did not pick; without one, all of them.
 */
function buildComponents({ L, manifest, platform, resources, selection }) {
  const sel = selection || { yue2: true, yue2Precisions: [...PRECISIONS], demucs: true, aceBase: true, aceXl: false };
  const engine = manifest.engine.assets[platform];
  const uvAsset = manifest.uv.assets[platform];
  const ffAsset = manifest.ffmpeg.assets[platform];
  const logFile = path.join(L.logs, 'setup.log');
  const retrying = (ctx, report, run) =>
    withRetries(run, { signal: ctx.signal, onRetry: (n, of) => report({ note: `connection lost, trying again (${n}/${of})` }) });
  const patchHash = () => fsp.readFile(resources.acePatch, 'utf8').then(sha1).catch(() => 'nopatch');

  const uv = {
    id: 'uv',
    weight: uvAsset.bytes,
    version: manifest.uv.version,
    verify: () => exists(L.uvBin),
    async install(ctx, report) {
      const archive = await fetchTo(ctx, uvAsset, 0, uvAsset.bytes, report);
      const tmp = path.join(L.downloads, 'uv-extract');
      await fsp.rm(tmp, { recursive: true, force: true });
      await extract(archive, tmp);
      await fsp.mkdir(L.uvDir, { recursive: true });
      const found = await findFile(tmp, path.basename(uvAsset.bin));
      if (!found) throw new Error(`${path.basename(uvAsset.bin)} was not found inside the uv archive`);
      await fsp.copyFile(found, L.uvBin);
      if (!IS_WINDOWS) await fsp.chmod(L.uvBin, 0o755);
      await fsp.rm(tmp, { recursive: true, force: true });
      await fsp.rm(archive, { force: true });
    },
  };

  const ffmpeg = {
    id: 'ffmpeg',
    weight: ffAsset ? ffAsset.bytes : 0,
    version: (ffAsset && ffAsset.version) || manifest.ffmpeg.version,
    verify: () => exists(ffmpegExecutable(L, manifest, platform)),
    async install(ctx, report) {
      if (!ffAsset) throw new Error('No FFmpeg build is pinned for this system. Install ffmpeg yourself and put it on PATH.');
      const download = await fetchTo(ctx, ffAsset, 0, ffAsset.bytes, report);
      if (ffAsset.kind === 'binary') {
        // A single static executable (macOS): nothing to unpack, just put it where the backend looks for it.
        const dest = ffmpegExecutable(L, manifest, platform);
        await fsp.mkdir(path.dirname(dest), { recursive: true });
        await fsp.copyFile(download, dest);
        await fsp.chmod(dest, 0o755);
      } else {
        await extractAtomic(download, L.ffmpegDir);
      }
      await fsp.rm(download, { force: true });
    },
  };

  const engineStep = {
    id: 'engine',
    weight: sum(engine.files.map((f) => f.bytes)),
    version: manifest.engine.tag,
    verify: () => exists(path.join(L.yue2Bin, IS_WINDOWS ? 'audiocpp_server.exe' : 'audiocpp_server')),
    async install(ctx, report) {
      const total = sum(engine.files.map((f) => f.bytes));
      const staging = path.join(L.downloads, 'engine-staging');
      await fsp.rm(staging, { recursive: true, force: true });
      let base = 0;
      for (const [i, file] of engine.files.entries()) {
        const archive = await fetchTo(ctx, file, base, total, report);
        base += file.bytes;
        const out = path.join(staging, String(i));
        await extract(archive, out);
        await placeEngineFiles(out, L);
        await fsp.rm(archive, { force: true });
      }
      if (!IS_WINDOWS) await fsp.chmod(path.join(L.yue2Bin, 'audiocpp_server'), 0o755);
      await fsp.rm(staging, { recursive: true, force: true });
    },
  };

  const backendEnv = {
    id: 'backend-env',
    weight: 60e6,
    // Re-run when a new app version changes the backend's requirements.
    version: `py3.12-${sha1(fs.existsSync(path.join(resources.backend, 'requirements.txt')) ? fs.readFileSync(path.join(resources.backend, 'requirements.txt'), 'utf8') : '')}`,
    verify: () => exists(L.backendPython),
    async install(ctx, report) {
      const env = uvEnv(L);
      const note = (line) => report({ note: line });
      await runCommand(L.uvBin, ['venv', '--python', '3.12', '--allow-existing', L.backendVenv], { env, onLine: note, signal: ctx.signal, logFile });
      await runCommand(L.uvBin, ['pip', 'install', '--python', L.backendPython, '-r', path.join(resources.backend, 'requirements.txt')], { env, onLine: note, signal: ctx.signal, logFile });
    },
  };

  const aceStep = {
    id: 'ace-step',
    weight: manifest.aceStep.approxBytes,
    version: manifest.aceStep.commit.slice(0, 7),
    verify: async () => (await exists(path.join(L.aceStep, '.remiqora-patched'))) && (await exists(path.join(L.aceStep, '.venv'))),
    async install(ctx, report) {
      const marker = path.join(L.aceStep, '.remiqora-patched');
      const wanted = await patchHash();
      const patched = (await exists(marker)) && (await fsp.readFile(marker, 'utf8')).trim() === wanted;
      if (!patched) {
        // The source archive is a sliver of this component's weight; `uv sync` below is the bulk.
        const archive = await fetchTo(ctx, { url: manifest.aceStep.url }, 0, manifest.aceStep.approxBytes, report);
        const tmp = `${L.aceStep}.tmp`;
        await fsp.rm(tmp, { recursive: true, force: true });
        await extract(archive, tmp, { stripComponents: 1 });
        await applyGitPatch(await fsp.readFile(resources.acePatch, 'utf8'), tmp);
        await fsp.writeFile(path.join(tmp, '.remiqora-patched'), wanted);
        await fsp.rm(L.aceStep, { recursive: true, force: true });
        await fsp.rename(tmp, L.aceStep);
        await fsp.rm(archive, { force: true });
      }
      await withCacheGrowth(L.uvCache, manifest.aceStep.approxBytes, report, () =>
        runCommand(L.uvBin, ['sync'], { cwd: L.aceStep, env: uvEnv(L), onLine: (line) => report({ note: line }), signal: ctx.signal, logFile }));
    },
  };

  // ACE-Step downloads its models on the first generation; doing it here keeps the first "Generate" instant.
  const aceModels = {
    id: 'ace-models',
    weight: manifest.aceModels.approxBytes,
    version: 'ace-main-model-v1',
    verify: async () => {
      for (const folder of manifest.aceModels.requiredFolders) if (!(await exists(path.join(L.aceStep, 'checkpoints', folder)))) return false;
      return true;
    },
    async install(ctx, report) {
      const checkpoints = path.join(L.aceStep, 'checkpoints');
      await withCacheGrowth(checkpoints, manifest.aceModels.approxBytes, report, () =>
        retrying(ctx, report, () => runCommand(L.uvBin, ['run', 'acestep-download'], { cwd: L.aceStep, env: uvEnv(L), onLine: (line) => report({ note: line }), signal: ctx.signal, logFile })));
    },
  };

  // The editor's AI arranger adds parts with ACE-Step's lego task, which only the base DiT can do
  // (turbo cannot). The backend loads it on demand when such a request comes in.
  const aceBaseModel = {
    id: 'ace-base-model',
    weight: manifest.aceBaseModel.approxBytes,
    version: 'ace-base-model-v1',
    verify: () => exists(path.join(L.aceStep, 'checkpoints', manifest.aceBaseModel.folder, 'model.safetensors')),
    async install(ctx, report) {
      const checkpoints = path.join(L.aceStep, 'checkpoints');
      await withCacheGrowth(checkpoints, manifest.aceBaseModel.approxBytes, report, () =>
        retrying(ctx, report, () => runCommand(L.uvBin, ['run', 'acestep-download', '--model', manifest.aceBaseModel.folder], { cwd: L.aceStep, env: uvEnv(L), onLine: (line) => report({ note: line }), signal: ctx.signal, logFile })));
    },
  };

  // The XL base model: an optional, bigger alternative for the arranger's parts (four weight shards, about 20 GB).
  const aceXlModel = {
    id: 'ace-xl-model',
    weight: manifest.aceXlModel.approxBytes,
    version: 'ace-xl-model-v1',
    verify: () => exists(path.join(L.aceStep, 'checkpoints', manifest.aceXlModel.folder, manifest.aceXlModel.lastFile)),
    async install(ctx, report) {
      const checkpoints = path.join(L.aceStep, 'checkpoints');
      await withCacheGrowth(checkpoints, manifest.aceXlModel.approxBytes, report, () =>
        retrying(ctx, report, () => runCommand(L.uvBin, ['run', 'acestep-download', '--model', manifest.aceXlModel.folder], { cwd: L.aceStep, env: uvEnv(L), onLine: (line) => report({ note: line }), signal: ctx.signal, logFile })));
    },
  };

  const demucs = {
    id: 'demucs',
    weight: manifest.demucs.approxBytes,
    version: `demucs-${sha1(demucsProject(platform))}`,
    verify: () => exists(path.join(L.demucs, '.venv')),
    async install(ctx, report) {
      await fsp.mkdir(L.demucs, { recursive: true });
      await fsp.writeFile(path.join(L.demucs, 'pyproject.toml'), demucsProject(platform));
      await withCacheGrowth(L.uvCache, manifest.demucs.approxBytes, report, () =>
        runCommand(L.uvBin, ['sync'], { cwd: L.demucs, env: uvEnv(L), onLine: (line) => report({ note: line }), signal: ctx.signal, logFile }));
      // Fetch the separation model now (about 80 MB), so the first "split into stems" does not stall on a download.
      const fetchModel = `from demucs.pretrained import get_model; get_model('${manifest.demucs.model}')`;
      await retrying(ctx, report, () => runCommand(L.uvBin, ['run', 'python', '-c', fetchModel], { cwd: L.demucs, env: uvEnv(L), onLine: (line) => report({ note: line }), signal: ctx.signal, logFile }));
    },
  };

  // The common weights plus the YuE2 precisions picked. The version is the package list, so adding a precision later
  // re-runs this step; the downloader skips packages that are already there.
  const packages = weightPackages(manifest, sel);
  const weightsBytes = manifest.weights.commonBytes + sel.yue2Precisions.reduce((a, p) => a + manifest.weights.precisions[p].bytes, 0);
  const weights = {
    id: 'weights',
    weight: weightsBytes,
    version: packages.join('+'),
    verify: async () => {
      for (const p of sel.yue2Precisions) if (!(await exists(path.join(L.yue2, 'models', 'Yue2-3B-GGUF', `yue2-3b-${p}.gguf`)))) return false;
      return exists(path.join(L.yue2, 'models'));
    },
    async install(ctx, report) {
      const total = weightsBytes;
      const modelsDir = path.join(L.yue2, 'models');
      // The downloader prints little; growth of the models folder is the honest progress signal.
      const timer = setInterval(async () => report({ done: Math.min(await dirSize(modelsDir), total), total }), 1500);
      try {
        for (const pkg of packages) {
          report({ note: pkg });
          await retrying(ctx, report, () => runCommand(L.backendPython, [path.join('tools', 'model_manager_v2.py'), 'install', pkg], { cwd: L.yue2, env: uvEnv(L), onLine: (line) => report({ note: line }), signal: ctx.signal, logFile }));
        }
      } finally {
        clearInterval(timer);
      }
    },
  };

  // Order matters: the backend venv provides the Python that runs the weights downloader.
  const left = new Set(excludedComponents(sel));
  return [uv, ffmpeg, engineStep, backendEnv, aceStep, aceModels, aceBaseModel, aceXlModel, demucs, weights].filter((c) => !left.has(c.id));
}

/** Path of ffmpeg: a pinned build under tools/ffmpeg where there is one, otherwise whatever the system has. */
function ffmpegExecutable(L, manifest, platform) {
  const asset = manifest.ffmpeg.assets[platform];
  const exe = platform.startsWith('win32') ? 'ffmpeg.exe' : 'ffmpeg';   // by the platform asked for, not by the host running the code
  if (asset && asset.kind === 'binary') return path.join(L.ffmpegDir, 'bin', exe);
  if (asset) return path.join(L.ffmpegDir, asset.binDir, exe);
  for (const dir of ['/opt/homebrew/bin', '/usr/local/bin', '/usr/bin']) {
    if (fs.existsSync(path.join(dir, 'ffmpeg'))) return path.join(dir, 'ffmpeg');
  }
  return path.join('/usr/local/bin', 'ffmpeg');
}

module.exports = { buildComponents, ffmpegExecutable, demucsProject, dirSize };
