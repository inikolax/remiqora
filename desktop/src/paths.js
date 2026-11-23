'use strict';
const path = require('node:path');
const os = require('node:os');

/** "win32-x64", "darwin-arm64", ... : the key used in manifest.json assets. */
const PLATFORM = `${process.platform}-${process.arch}`;

const IS_WINDOWS = process.platform === 'win32';

function repoRoot() {
  return path.resolve(__dirname, '..', '..');
}

/**
 * Where the backend sources, the built frontend, the ACE-Step patch and the Stable Audio 3 server sources live:
 * next to the app when installed, inside the repository when running from source.
 * The backend finds the frontend as ../frontend/dist relative to itself, so both
 * layouts keep that shape.
 */
function resourcePaths(isPackaged) {
  if (isPackaged) {
    const base = process.resourcesPath;
    return {
      backend: path.join(base, 'backend'),
      frontendDist: path.join(base, 'frontend', 'dist'),
      acePatch: path.join(base, 'patches', 'ace-step.patch'),
      sa3Server: path.join(base, 'sa3-server'),
      promptAssistant: path.join(base, 'prompt-assistant'),
    };
  }
  const root = repoRoot();
  return {
    backend: path.join(root, 'backend'),
    frontendDist: path.join(root, 'frontend', 'dist'),
    acePatch: path.join(root, 'external', 'patches', 'ace-step.patch'),
    sa3Server: path.join(root, 'external', 'sa3-server'),
    promptAssistant: path.join(root, 'external', 'prompt-assistant'),
  };
}

/** Default data root. Models and generated audio are large, so it is per-user and never inside the install dir. */
function defaultDataRoot() {
  if (process.env.REMIQORA_HOME) return path.resolve(process.env.REMIQORA_HOME);
  switch (process.platform) {
    case 'win32':
      return path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'Remiqora');
    case 'darwin':
      return path.join(os.homedir(), 'Library', 'Application Support', 'Remiqora');
    default:
      return path.join(process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share'), 'Remiqora');
  }
}

/** Every path the installer and the server use, all under one root the user can pick. */
function layout(root, platform = PLATFORM, manifest = null) {
  const engineAsset = manifest && manifest.engine.assets[platform];
  const preset = engineAsset ? engineAsset.preset : IS_WINDOWS ? 'windows-cuda-release' : 'macos-metal-release';
  const yue2 = path.join(root, 'engines', 'YuE2');
  const uvDir = path.join(root, 'tools', 'uv');
  const backendVenv = path.join(root, 'backend-venv');
  return {
    root,
    uvDir,
    uvBin: path.join(uvDir, IS_WINDOWS ? 'uv.exe' : 'uv'),
    ffmpegDir: path.join(root, 'tools', 'ffmpeg'),
    pythonDir: path.join(root, 'tools', 'python'),
    uvCache: path.join(root, 'cache', 'uv'),
    hfHome: path.join(root, 'cache', 'huggingface'),
    torchHome: path.join(root, 'cache', 'torch'),
    downloads: path.join(root, 'cache', 'downloads'),
    aceStep: path.join(root, 'engines', 'ACE-Step-1.5'),
    yue2,
    yue2Bin: path.join(yue2, 'build', preset, 'bin'),
    demucs: path.join(root, 'engines', 'Demucs'),
    stableAudio: path.join(root, 'engines', 'StableAudio'),
    promptAssistant: path.join(root, 'engines', 'PromptAssistant'),
    // the cover engine (stable-diffusion.cpp): bin/ with sd-server and its libraries, models/ with the weights
    sdcpp: path.join(root, 'engines', 'sdcpp'),
    backendVenv,
    backendPython: path.join(backendVenv, IS_WINDOWS ? 'Scripts' : 'bin', IS_WINDOWS ? 'python.exe' : 'python'),
    data: path.join(root, 'data'),
    logs: path.join(root, 'logs'),
    state: path.join(root, 'state.json'),
  };
}

module.exports = { PLATFORM, IS_WINDOWS, repoRoot, resourcePaths, defaultDataRoot, layout };
