'use strict';
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const net = require('node:net');
const path = require('node:path');
const { EventEmitter } = require('node:events');
const { spawnTree, killTree, cleanEnv } = require('./proc');
const { IS_WINDOWS } = require('./paths');
const { ffmpegExecutable } = require('./bootstrap/components');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function listenOnce(port) {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once('error', reject);
    srv.listen(port, '127.0.0.1', () => {
      const bound = srv.address().port;
      srv.close(() => resolve(bound));
    });
  });
}

/**
 * A free local port. The UI runs at http://127.0.0.1:<port>, and the browser keeps localStorage (language,
 * saved presets, LoRA list) per origin, so the port has to be the same on every start: `preferred` is tried first.
 */
async function freePort(preferred) {
  if (preferred) {
    try { return await listenOnce(preferred); } catch { /* taken by something else: pick another */ }
  }
  return listenOnce(0);
}

/** Environment of the backend and, through it, of the model servers it starts. */
function backendEnv({ L, manifest, platform }) {
  const sep = path.delimiter;
  const ffmpegBin = path.dirname(ffmpegExecutable(L, manifest, platform));
  const pathParts = [L.uvDir, ffmpegBin, L.yue2Bin, process.env.PATH || ''];
  return cleanEnv({
    PATH: pathParts.filter(Boolean).join(sep),
    UV_CACHE_DIR: L.uvCache,
    UV_PYTHON_INSTALL_DIR: L.pythonDir,
    UV_PYTHON_PREFERENCE: 'only-managed',
    HF_HOME: L.hfHome,
    TORCH_HOME: L.torchHome,
    UV_NO_PROGRESS: '1',
    PYTHONUTF8: '1',
    ACE_STEP_DIR: L.aceStep,
    YUE2_DIR: L.yue2,
    DEMUCS_DIR: L.demucs,
    STABLE_AUDIO_DIR: L.stableAudio,
    PROMPT_ASSISTANT_DIR: L.promptAssistant,
    SDCPP_DIR: L.sdcpp,
    FFMPEG_BIN_DIR: ffmpegBin,
    // The prebuilt engine keeps its CUDA runtime DLLs next to the executable.
    CUDA_BIN_DIR: L.yue2Bin,
    REMIQORA_DATA_DIR: L.data,
    REMIQORA_LOG_DIR: L.logs,
  });
}

/** Owns the FastAPI backend process: start, wait until it answers, stop cleanly. */
class BackendServer extends EventEmitter {
  constructor(ctx) {
    super();
    this.ctx = ctx;
    this.child = null;
    this.url = null;
    this.port = null;
  }

  async start({ timeoutMs = 90000, preferredPort } = {}) {
    const { L, resources } = this.ctx;
    await fsp.mkdir(L.logs, { recursive: true });
    await fsp.mkdir(L.data, { recursive: true });
    const port = await freePort(preferredPort);
    this.port = port;
    const logStream = fs.createWriteStream(path.join(L.logs, 'backend-server.log'), { flags: 'a' });
    logStream.write(`\n--- start ${new Date().toISOString()} port ${port}\n`);

    const child = spawnTree(L.backendPython, ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', String(port)], {
      cwd: resources.backend,
      env: backendEnv(this.ctx),
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    this.child = child;
    child.stdout.pipe(logStream, { end: false });
    child.stderr.pipe(logStream, { end: false });
    let exitCode = null;
    child.on('exit', (code) => { exitCode = code ?? -1; logStream.end(); this.emit('exit', exitCode); });

    const base = `http://127.0.0.1:${port}/`;
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (exitCode !== null) throw new Error(`the backend exited with code ${exitCode} (see ${path.join(L.logs, 'backend-server.log')})`);
      try {
        const res = await fetch(`${base}api/orchestrator/status`, { signal: AbortSignal.timeout(2000) });
        if (res.ok) { this.url = base; return base; }
      } catch { /* not up yet */ }
      await sleep(400);
    }
    await this.stop();
    throw new Error('the backend did not answer in time');
  }

  /**
   * Stops the model servers through the backend first (otherwise a GPU process can outlive the app),
   * then ends the backend and everything left under it.
   */
  async stop() {
    const child = this.child;
    if (!child) return;
    if (this.url && child.exitCode === null) {
      try {
        await fetch(`${this.url}api/orchestrator/stop`, { method: 'POST', signal: AbortSignal.timeout(30000) });
      } catch { /* the backend may already be gone */ }
    }
    await killTree(child);
    for (let i = 0; i < 25 && child.exitCode === null; i++) await sleep(200);
    this.child = null;
    this.url = null;
  }
}

module.exports = { BackendServer, backendEnv, freePort };
