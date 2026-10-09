// Full end-to-end test of an INSTALLED desktop app (manual, Windows + NVIDIA GPU, about 46 GB and 25 minutes).
//
//   npm i --no-save playwright            (only the package is needed, no browsers)
//   set E2E_EXE=<install dir>/Remiqora.exe   and   set E2E_ROOT=<empty folder on a big drive>
//   set PHASE=setup      then: node test/e2e/full.js    first run with every component, no skips (deletes E2E_ROOT first)
//   set PHASE=generate   then: node test/e2e/full.js    YuE2 + MIDI + ACE-Step + Demucs, quit, restart
//   set PHASE=add        then: node test/e2e/full.js    from the app: open "add components", go back, then add the base model
//
// Everything runs against E2E_ROOT/home (data) and E2E_ROOT/user (Electron settings), never real profile data.
// Report: results-<phase>.json and screenshots in E2E_REPORT (default: system temp).
// What each phase does:
//   setup    : real first run with every component (no skips), then checks that the environments really see CUDA
//   generate : YuE2 track, MIDI, ACE-Step track, Demucs stems, quit without leftovers, restart with persisted tracks
//   add      : the parts left out at setup (the defaults leave out the base models) are reported as not installed; the
//              app's Install path opens the setup screen while the backend keeps running, "Back" returns without a
//              restart and without keeping the pick, then the ACE-Step base model is added and reported installed
const { _electron: electron } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { execFileSync } = require('node:child_process');

const PHASE = process.env.PHASE;
const ROOT = process.env.E2E_ROOT ? path.resolve(process.env.E2E_ROOT) : '';
const HOME = path.join(ROOT, 'home');
const USER = path.join(ROOT, 'user');
// every process started from the test home (uv, python, audiocpp_server) has this in its path
const NEEDLE = HOME;
const OUT = process.env.E2E_REPORT ? path.resolve(process.env.E2E_REPORT) : path.join(require('node:os').tmpdir(), 'remiqora-e2e-report');
const EXE = process.env.E2E_EXE;
const RESULTS = path.join(OUT, `results-${PHASE}.json`);
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.join(OUT, 'shots'), { recursive: true });

const t0 = Date.now();
const log = (...a) => console.log(`[${String(Math.round((Date.now() - t0) / 1000)).padStart(5)}s]`, ...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = {};
const save = () => fs.writeFileSync(RESULTS, JSON.stringify(results, null, 2));

function launchEnv() {
  const env = { ...process.env, REMIQORA_HOME: HOME, REMIQORA_USER_DATA: USER };
  delete env.ELECTRON_RUN_AS_NODE;
  delete env.REMIQORA_SKIP_COMPONENTS;
  return env;
}
async function launch() {
  const app = await electron.launch({ executablePath: EXE, args: [], env: launchEnv(), timeout: 120000 });
  const win = await app.firstWindow();
  return { app, win };
}

/** HTTP without any client timeout: generation calls can run for many minutes. */
function call(method, url, { json, form, timeoutMs = 45 * 60 * 1000 } = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const headers = {};
    let body = null;
    if (json !== undefined) { body = Buffer.from(JSON.stringify(json)); headers['content-type'] = 'application/json'; }
    const finish = (res, chunks) => {
      const buf = Buffer.concat(chunks);
      const text = res.headers['content-type']?.includes('json') || res.headers['content-type']?.startsWith('text') ? buf.toString('utf8') : null;
      resolve({ status: res.statusCode, headers: res.headers, buf, text, json: () => JSON.parse(buf.toString('utf8')) });
    };
    const start = (b, h) => {
      const req = http.request({ hostname: u.hostname, port: u.port, path: u.pathname + u.search, method, headers: { ...headers, ...h, ...(b ? { 'content-length': b.length } : {}) } }, (res) => {
        const chunks = []; res.on('data', (c) => chunks.push(c)); res.on('end', () => finish(res, chunks));
      });
      req.setTimeout(timeoutMs, () => req.destroy(new Error(`timeout after ${timeoutMs / 1000}s: ${method} ${u.pathname}`)));
      req.on('error', reject);
      if (b) req.write(b);
      req.end();
    };
    if (form) {
      // one Request object for both the body and the header: each Request picks its own multipart boundary
      const rq = new Request(url, { method, body: form });
      const ct = rq.headers.get('content-type');
      rq.arrayBuffer().then((ab) => start(Buffer.from(ab), { 'content-type': ct }), reject);
    } else start(body, {});
  });
}

function psLines(command) {
  return execFileSync('powershell', ['-NoProfile', '-Command', command + '; exit 0'], { encoding: 'utf8' }).split(String.fromCharCode(10)).map((x) => x.trim()).filter(Boolean);
}
function procsUnder(needle) {
  // never match this very PowerShell (its command line contains the needle)
  const own = psLines(`Get-CimInstance Win32_Process | Where-Object { $_.ProcessId -ne $PID -and (($_.ExecutablePath -like '*${needle}*') -or ($_.CommandLine -like '*${needle}*')) } | ForEach-Object { $_.Name + ' (' + $_.ProcessId + ')' }`);
  const app = psLines("Get-Process Remiqora -ErrorAction SilentlyContinue | ForEach-Object { 'Remiqora (' + $_.Id + ')' }");
  return [...own, ...app];
}
async function portFree(port) { try { await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(1500) }); return false; } catch { return true; } }
function dirSize(dir) { let n = 0; try { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); n += e.isDirectory() ? dirSize(p) : fs.statSync(p).size; } } catch {} return n; }
const gb = (n) => (n / 1e9).toFixed(2) + ' GB';

async function step(name, fn) {
  const s = Date.now();
  log(`>>> ${name}`);
  try {
    const detail = await fn();
    results[name] = { ok: true, seconds: Math.round((Date.now() - s) / 1000), detail };
    log(`<<< ${name}: OK (${results[name].seconds}s)`, typeof detail === 'string' ? detail : JSON.stringify(detail));
  } catch (err) {
    results[name] = { ok: false, seconds: Math.round((Date.now() - s) / 1000), error: String(err.message || err).slice(0, 600) };
    log(`<<< ${name}: FAILED (${results[name].seconds}s)`, results[name].error);
  }
  save();
  return results[name];
}

// ---------------------------------------------------------------- phase 1
async function setupPhase() {
  const profileHf = path.join(require('node:os').homedir(), '.cache', 'huggingface');
  const hfBefore = dirSize(profileHf);
  fs.rmSync(ROOT, { recursive: true, force: true });
  fs.mkdirSync(HOME, { recursive: true });
  fs.mkdirSync(USER, { recursive: true });
  const { app, win } = await launch();
  await win.waitForSelector('#start', { timeout: 90000 });
  log('checks:', (await win.locator('.rows li').allInnerTexts()).map((s) => s.replace(/\s+/g, ' ')).join(' | '));
  results.picked = await win.locator('.pick').evaluateAll((els) => els.map((e) => `${e.querySelector('.name').textContent}=${e.querySelector('input.box') ? e.querySelector('input.box').checked : 'fixed'}`).join(' | '));
  log('parts picked by default:', results.picked);
  await win.screenshot({ path: path.join(OUT, 'shots', 'setup-1-check.png') });
  await win.click('#start');
  await win.waitForSelector('#comps', { timeout: 15000 });

  let last = '';
  let lastPrint = 0;
  let shots = 0;
  for (let i = 0; i < 1080; i++) { // up to 90 minutes
    if (await win.locator('#open').count()) break;
    if (await win.locator('#retry').count()) {
      const detail = await win.locator('pre').innerText().catch(() => '');
      log('SETUP FAILED:', detail.slice(0, 1200));
      results.setup = { ok: false, error: detail.slice(0, 800) };
      save();
      await win.screenshot({ path: path.join(OUT, 'shots', 'setup-failed.png') });
      await app.close();
      return;
    }
    const rows = await win.locator('#comps li').evaluateAll((els) => els.map((e) => `${e.querySelector('.name').textContent.slice(0, 22)}=${e.querySelector('.state').textContent}`).join(' | ')).catch(() => '');
    const meta = await win.locator('#meta').innerText().catch(() => '');
    if (rows !== last && Date.now() - lastPrint > 15000) { last = rows; lastPrint = Date.now(); log(meta, '\n         ', rows); }
    if (Date.now() - t0 > (shots + 1) * 300000) { shots++; await win.screenshot({ path: path.join(OUT, 'shots', `setup-2-progress-${shots}.png`) }).catch(() => {}); }
    await sleep(5000);
  }
  log('done screen:', await win.locator('h1').innerText());
  await win.screenshot({ path: path.join(OUT, 'shots', 'setup-3-done.png') });
  results.setup = { ok: true, minutes: Math.round((Date.now() - t0) / 60000) };
  results.profileHfGrowthMB = Math.round((dirSize(profileHf) - hfBefore) / 1e6);
  log('HF cache growth in the user profile during setup:', results.profileHfGrowthMB, 'MB');

  // what was installed
  const exists = (p) => fs.existsSync(path.join(HOME, p));
  const py = (rel) => path.join(HOME, rel, '.venv', 'Scripts', 'python.exe');
  results.files = {
    uv: exists('tools/uv/uv.exe'), ffmpeg: exists('tools/ffmpeg'), engine: exists('engines/YuE2/build/windows-cuda-release/bin/audiocpp_server.exe'),
    aceCheckpoints: ['acestep-v15-turbo', 'acestep-5Hz-lm-1.7B', 'vae'].every((d) => exists('engines/ACE-Step-1.5/checkpoints/' + d)), demucsModelCached: exists('cache/huggingface') || exists('cache/torch'),
    aceStepPatched: exists('engines/ACE-Step-1.5/.remiqora-patched'), aceVenv: exists('engines/ACE-Step-1.5/.venv'), demucsVenv: exists('engines/Demucs/.venv'),
    weights: ['Yue2-3B-GGUF', 'SheetSage2-GGUF', 'MuScriptor-Small-GGUF'].map((m) => `${m}:${exists('engines/YuE2/models/' + m)}`).join(' '),
  };
  results.sizes = { total: gb(dirSize(HOME)), models: gb(dirSize(path.join(HOME, 'engines/YuE2/models'))), aceStep: gb(dirSize(path.join(HOME, 'engines/ACE-Step-1.5'))), demucs: gb(dirSize(path.join(HOME, 'engines/Demucs'))), pythonAndCache: gb(dirSize(path.join(HOME, 'tools')) + dirSize(path.join(HOME, 'cache'))) };
  log('files', JSON.stringify(results.files), '\nsizes', JSON.stringify(results.sizes));

  // the silent-CPU pitfall: do both torch environments really see CUDA?
  for (const [name, rel] of [['ace-step', 'engines/ACE-Step-1.5'], ['demucs', 'engines/Demucs']]) {
    try {
      const out = execFileSync(py(rel), ['-c', 'import torch;print(torch.__version__, "cuda_available=" + str(torch.cuda.is_available()), torch.cuda.get_device_name(0) if torch.cuda.is_available() else "-")'], { encoding: 'utf8', timeout: 180000 }).trim();
      results['torch-' + name] = out; log('torch in', name, ':', out);
    } catch (e) { results['torch-' + name] = 'FAILED: ' + String(e.message).slice(0, 300); log('torch check failed', name, e.message.slice(0, 200)); }
  }
  save();

  await win.click('#open');
  await win.waitForURL(/^http:\/\/127\.0\.0\.1:\d+\//, { timeout: 180000 });
  await sleep(2000);
  await win.screenshot({ path: path.join(OUT, 'shots', 'setup-4-app.png') });
  log('app opened:', win.url());
  const feats = await call('GET', new URL(win.url()).origin + '/api/system/features');
  results.features = feats.text;
  log('features after setup:', feats.text);
  await app.close();
  await sleep(3000);
  log('leftovers after quit:', procsUnder(NEEDLE).join(', ') || 'none');
}

// ---------------------------------------------------------------- phase 2
async function generatePhase() {
  const { app, win } = await launch();
  await win.waitForURL(/^http:\/\/127\.0\.0\.1:\d+\//, { timeout: 120000 });
  const base = new URL(win.url()).origin;
  log('app at', base);
  const api = (p) => base + p;
  const saved = {};

  const saveTrack = async (model, title, lyrics, audioBuf, ext, extra = {}) => {
    const form = new FormData();
    form.append('model', model); form.append('title', title); form.append('lyrics', lyrics);
    form.append('params', JSON.stringify(extra.params || {}));
    if (extra.seed != null) form.append('seed', String(extra.seed));
    if (extra.duration_ms != null) form.append('duration_ms', String(extra.duration_ms));
    form.append('audio', new Blob([audioBuf]), `track.${ext}`);
    const r = await call('POST', api('/api/tracks'), { form });
    if (r.status !== 200) throw new Error(`save track -> ${r.status} ${r.text}`);
    return r.json();
  };

  await step('yue2-start', async () => {
    const r = await call('POST', api('/api/orchestrator/switch'), { json: { model: 'yue2' }, timeoutMs: 10 * 60 * 1000 });
    const st = r.json();
    if (r.status !== 200 || st.models.yue2.status !== 'running') throw new Error(`switch -> ${r.status} ${r.text}`);
    return `status=${st.models.yue2.status}`;
  });

  await step('yue2-generate', async () => {
    const cfg = (await call('GET', api('/api/orchestrator/config'))).json();
    const spec = cfg.yue2_specs.yue2;
    let r = await call('POST', api('/api/yue2/v1/models/load'), { json: { id: spec.id, path: spec.path, family: spec.family, task: spec.task, mode: spec.mode, load_options: {}, session_options: {} } });
    if (r.status !== 200) throw new Error(`load yue2 -> ${r.status} ${r.text}`);
    const lyrics = '[verse]\nSoft light on the water tonight\nWe drift where the quiet is bright\n[chorus]\nOh, hold on, hold on';
    const t = Date.now();
    r = await call('POST', api('/api/yue2/v1/tasks/run'), { json: { model: spec.id, request: { lyrics, seed: 12345, options: { style: 'calm ambient pop, soft female vocal, piano', cot: 'off', semantic_max_tokens: 500 } } } });
    if (r.status !== 200) throw new Error(`run yue2 -> ${r.status} ${(r.text || '').slice(0, 400)}`);
    const res = r.json();
    if (!res.audio) throw new Error('no audio in result: ' + JSON.stringify(res).slice(0, 300));
    const wav = Buffer.from(res.audio, 'base64');
    if (wav.subarray(0, 4).toString() !== 'RIFF') throw new Error('result is not a WAV');
    const wall = Date.now() - t;
    const track = await saveTrack('yue2', 'E2E YuE2', lyrics, wav, 'wav', { seed: 12345, duration_ms: res.timing?.audio_duration_ms, params: { e2e: true } });
    saved.yue2 = track.id;
    const fetched = await call('GET', api(track.audio_url));
    if (fetched.status !== 200 || fetched.buf.length < 1000) throw new Error('saved audio is not retrievable');
    return `track ${track.id}: ${(wav.length / 1e6).toFixed(1)} MB wav, audio ${res.timing?.audio_duration_ms ?? '?'} ms, generated in ${(wall / 1000).toFixed(0)} s`;
  });

  await step('midi-muscriptor', async () => {
    if (!saved.yue2) throw new Error('no YuE2 track to transcribe');
    let r = await call('POST', api(`/api/tracks/${saved.yue2}/midi/full`));
    if (r.status !== 200) throw new Error(`start midi -> ${r.status} ${r.text}`);
    for (let i = 0; i < 240; i++) {
      const st = (await call('GET', api(`/api/tracks/${saved.yue2}/midi/status`))).json().sources.full;
      if (st.status === 'done') break;
      if (['failed', 'cancelled'].includes(st.status)) throw new Error(`midi ${st.status}: ${st.error}`);
      await sleep(5000);
      if (i === 239) throw new Error('midi timed out');
    }
    const midi = await call('GET', api(`/api/tracks/${saved.yue2}/midi/full`));
    if (midi.status !== 200 || midi.buf.subarray(0, 4).toString() !== 'MThd') throw new Error('not a MIDI file');
    return `${midi.buf.length} bytes, valid MThd header`;
  });

  await step('ace-start', async () => {
    const r = await call('POST', api('/api/orchestrator/switch'), { json: { model: 'ace_step' }, timeoutMs: 25 * 60 * 1000 });
    const st = r.json?.() ?? {};
    if (r.status !== 200) throw new Error(`switch -> ${r.status} ${(r.text || '').slice(0, 500)}`);
    if (st.models.ace_step.status !== 'running') throw new Error(`ace status ${st.models.ace_step.status}: ${st.models.ace_step.error}`);
    const h = (await call('GET', api('/api/ace/health'))).text;
    return `running; health ${String(h).slice(0, 160)}`;
  });

  await step('ace-generate', async () => {
    let r = await call('POST', api('/api/ace/release_task'), { json: { prompt: 'calm ambient piano, soft pads, slow tempo', lyrics: '[Instrumental]', audio_duration: 12, batch_size: 1, audio_format: 'mp3', use_random_seed: true, vocal_language: 'en' } });
    if (r.status !== 200) throw new Error(`release_task -> ${r.status} ${(r.text || '').slice(0, 400)}`);
    const env = r.json(); const task = env.data ?? env;
    const id = task && task.task_id;
    log('release_task ->', r.text && r.text.slice(0, 200));
    if (!id) throw new Error('release_task returned no task_id: ' + (r.text || '').slice(0, 300));
    const t = Date.now();
    let entry;
    for (let i = 0; i < 400; i++) { // up to ~33 min: the first request also downloads ACE-Step's own checkpoints
      const q = (await call('POST', api('/api/ace/query_result'), { json: { task_id_list: [id] } })).json();
      entry = (q.data ?? q)[0];
      if (entry && entry.status !== 0) break;
      await sleep(5000);
    }
    if (!entry || entry.status !== 1) throw new Error(`task ended with status ${entry && entry.status}: ${String(entry && entry.result).slice(0, 400)}`);
    const files = JSON.parse(entry.result).filter((p) => p.file);
    if (!files.length) throw new Error('no audio file in result: ' + entry.result.slice(0, 300));
    const audio = await call('GET', api(`/api/ace${files[0].file}`));
    if (audio.status !== 200 || audio.buf.length < 2000) throw new Error(`audio download -> ${audio.status}, ${audio.buf.length} bytes`);
    const track = await saveTrack('ace_step', 'E2E ACE-Step', '[Instrumental]', audio.buf, 'mp3', { duration_ms: 12000, params: { e2e: true } });
    saved.ace = track.id;
    return `track ${track.id}: ${(audio.buf.length / 1e3).toFixed(0)} kB mp3, ${((Date.now() - t) / 1000).toFixed(0)} s (includes first-request checkpoint download)`;
  });

  await step('stems-demucs', async () => {
    const id = saved.ace || saved.yue2;
    if (!id) throw new Error('no track to separate');
    let r = await call('POST', api(`/api/tracks/${id}/stems`));
    if (r.status !== 200) throw new Error(`start stems -> ${r.status} ${r.text}`);
    let st;
    for (let i = 0; i < 360; i++) {
      st = (await call('GET', api(`/api/tracks/${id}/stems/status`))).json();
      if (st.status === 'done') break;
      if (['failed', 'cancelled'].includes(st.status)) throw new Error(`stems ${st.status}: ${st.error}`);
      await sleep(5000);
    }
    if (!st || st.status !== 'done') throw new Error('stems timed out');
    const names = Object.keys(st.stems || {});
    const sizes = [];
    for (const n of names) { const f = await call('GET', api(st.stems[n])); sizes.push(`${n}:${(f.buf.length / 1e6).toFixed(1)}MB`); if (f.status !== 200 || f.buf.length < 1000) throw new Error(`stem ${n} not retrievable`); }
    if (names.length < 4) throw new Error(`expected 4 stems, got ${names.join(',')}`);
    return `track ${id}: ${sizes.join(' ')}`;
  });

  await step('logs-evidence', async () => {
    const logs = path.join(HOME, 'logs');
    const out = {};
    const aceLog = fs.existsSync(path.join(logs, 'ace_step_api.log')) ? fs.readFileSync(path.join(logs, 'ace_step_api.log'), 'utf8') : '';
    out.aceDownloadLines = (aceLog.match(/Model Download/g) || []).length;
    for (const f of fs.existsSync(logs) ? fs.readdirSync(logs) : []) {
      const text = fs.readFileSync(path.join(logs, f), 'utf8');
      out[f] = { kb: Math.round(text.length / 1024), cuda: (text.match(/cuda/gi) || []).length, errors: (text.match(/\b(traceback|error)\b/gi) || []).length };
    }
    return out;
  });

  await step('quit-clean', async () => {
    await app.close();
    await sleep(4000);
    const left = procsUnder(NEEDLE);
    const ports = { 8001: await portFree(8001), 8080: await portFree(8080) };
    if (left.length) throw new Error(`processes left: ${left.join(', ')}`);
    if (!ports[8001] || !ports[8080]) throw new Error(`ports still busy: ${JSON.stringify(ports)}`);
    return 'no processes left, :8001 and :8080 free';
  });

  await step('restart-persistence', async () => {
    const second = await launch();
    await second.win.waitForURL(/^http:\/\/127\.0\.0\.1:\d+\//, { timeout: 120000 });
    const b2 = new URL(second.win.url()).origin;
    const list = (await call('GET', b2 + '/api/tracks')).json().data;
    const ids = list.map((t) => t.id);
    for (const [k, id] of Object.entries(saved)) if (!ids.includes(id)) throw new Error(`track ${k}#${id} missing after restart`);
    const withStems = list.filter((t) => t.stems && Object.keys(t.stems).length).length;
    const audio = await call('GET', b2 + list[0].audio_url);
    await second.win.screenshot({ path: path.join(OUT, 'shots', 'generate-restart.png') });
    await second.app.close();
    await sleep(3000);
    if (audio.status !== 200) throw new Error('audio not served after restart');
    const left = procsUnder(NEEDLE);
    return `${list.length} tracks kept, ${withStems} with stems; leftovers: ${left.length ? left.join(', ') : 'none'}`;
  });
}

// ---------------------------------------------------------------- phase 3
async function addPhase() {
  const { app, win } = await launch();
  await win.waitForURL(/^http:\/\/127\.0\.0\.1:\d+\//, { timeout: 120000 });
  const base = new URL(win.url()).origin;
  const features = async () => (await call('GET', base + '/api/system/features')).json();
  log('app at', base);

  await step('add-reported-missing', async () => {
    const f = await features();
    if (f.ace_base) throw new Error('the base model is already installed: run the setup phase first');
    return JSON.stringify(f);
  });

  await step('add-back-without-installing', async () => {
    // not awaited: the main process swaps this page for the setup screen before the call returns
    await win.evaluate(() => { void window.remiqora.addFeatures(['aceXl']); });
    await win.waitForSelector('#back', { timeout: 60000 });
    const picked = await win.locator('[data-pick="aceXl"]').isChecked();
    // only what was asked for: the precision left out at setup must not come pre-ticked
    const extra = await win.locator('[data-prec="q4_0"]:checked:not(:disabled)').count();
    if (extra) throw new Error('q4_0 is ticked on the add screen though setup left it out');
    await win.screenshot({ path: path.join(OUT, 'shots', 'add-1-screen.png') });
    await win.click('#back');
    await win.waitForURL((u) => u.origin === base, { timeout: 30000 });
    const cfg = JSON.parse(fs.readFileSync(path.join(USER, 'config.json'), 'utf8'));
    if (!picked) throw new Error('XL was not picked on the add screen');
    if (cfg.features && cfg.features.aceXl) throw new Error('going back kept XL picked: ' + JSON.stringify(cfg.features));
    return `same backend ${base}, pick dropped: ${JSON.stringify(cfg.features)}`;
  });

  await step('add-base-model', async () => {
    // not awaited: the main process swaps this page for the setup screen before the call returns
    await win.evaluate(() => { void window.remiqora.addFeatures(['aceBase']); });
    await win.waitForSelector('#start', { timeout: 60000 });
    const note = await win.locator('.note').first().innerText();
    await win.click('#start');
    await win.waitForSelector('#comps', { timeout: 15000 });
    for (let i = 0; i < 720; i++) { // up to 60 minutes
      if (await win.locator('#open').count()) break;
      if (await win.locator('#retry').count()) throw new Error('add failed: ' + (await win.locator('pre').innerText().catch(() => '')).slice(0, 800));
      await sleep(5000);
    }
    await win.screenshot({ path: path.join(OUT, 'shots', 'add-2-done.png') });
    await win.click('#open');
    await win.waitForURL((u) => u.origin === base, { timeout: 60000 });
    const f = await features();
    if (!f.ace_base) throw new Error('not reported installed after the add: ' + JSON.stringify(f));
    return `${note} -> ${JSON.stringify(f)}`;
  });

  await app.close();
  await sleep(3000);
  results.addLeftovers = procsUnder(NEEDLE);
  log('leftovers after quit:', results.addLeftovers.join(', ') || 'none');
}

(async () => {
  if (!EXE || !ROOT || !['setup', 'generate', 'add'].includes(PHASE)) { console.log('usage: set E2E_EXE, E2E_ROOT and PHASE=setup|generate|add, then: node test/e2e/full.js'); process.exit(2); }
  log(`phase ${PHASE} with ${EXE}`);
  if (PHASE === 'setup') await setupPhase(); else if (PHASE === 'add') await addPhase(); else await generatePhase();
  save();
  log('PHASE COMPLETE');
})().catch((e) => { log('PHASE CRASHED:', e && e.stack ? e.stack.slice(0, 900) : e); process.exit(1); });
