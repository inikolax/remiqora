'use strict';
const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { PLATFORM, resourcePaths, defaultDataRoot, layout } = require('./paths');
const manifest = require('../manifest.json');
const { runChecks } = require('./bootstrap/checks');
const { describePlan, runSetup, isSetupComplete } = require('./bootstrap/run');
const { BackendServer } = require('./server');
const { loadConfig, updateConfig, ensureWritableDir } = require('./config');
const { FEATURE_IDS, PRECISIONS, detectInstalled, resolveSelection, featureSizes } = require('./bootstrap/features');

// Only these links can be opened from the first-run screen.
const EXTERNAL = {
  'nvidia-drivers': 'https://www.nvidia.com/drivers',
  issues: 'https://github.com/inikolax/remiqora/issues/new',
};
const SETUP_PAGE = path.join(__dirname, '..', 'renderer', 'index.html');

// Tests point the app at throwaway folders.
if (process.env.REMIQORA_USER_DATA) app.setPath('userData', process.env.REMIQORA_USER_DATA);

let win = null;
let ctx = null;
let server = null;
let setupAbort = null;
let quitting = false;
let savedPort = null;
let savedFeatures = null;

/** The context every setup call works with; `selection` is what the user picked, widened by what is installed. */
function buildContext(dataRoot) {
  const L = layout(dataRoot, PLATFORM, manifest);
  const installed = detectInstalled(L);
  return {
    L,
    manifest,
    platform: PLATFORM,
    resources: resourcePaths(app.isPackaged),
    installed,
    // An install from before the choice existed has a state.json and got everything: it keeps everything.
    selection: resolveSelection(savedFeatures, installed, { legacyInstall: fs.existsSync(L.state) }),
    // Test switch: skip the multi-gigabyte components, e.g. REMIQORA_SKIP_COMPONENTS=ace-step,demucs,weights
    skip: (process.env.REMIQORA_SKIP_COMPONENTS || '').split(',').map((s) => s.trim()).filter(Boolean),
  };
}

/** Keeps the picked parts (only ids and precisions we know) and rebuilds the context from them. */
async function saveFeatures(picked) {
  const clean = {
    yue2: !!picked.yue2,
    yue2Precisions: PRECISIONS.filter((p) => Array.isArray(picked.yue2Precisions) && picked.yue2Precisions.includes(p)),
    demucs: !!picked.demucs,
    aceBase: !!picked.aceBase,
    aceXl: !!picked.aceXl,
  };
  savedFeatures = clean;
  await updateConfig(app.getPath('userData'), { features: clean });
  ctx = buildContext(ctx.L.root);
}

/**
 * The same context with only what is installed picked: the app can start once that is complete. An optional part that
 * was picked but not finished (an "add" left half way) does not hold the app back; its Install button resumes it.
 */
function coreContext() {
  const none = { yue2: false, yue2Precisions: [], demucs: false, aceBase: false, aceXl: false };
  return { ...ctx, selection: resolveSelection(none, ctx.installed) };
}

/** Free space the pending part of the plan needs: downloads plus unpacking and caches, about a third more. */
const neededBytes = (plan) => Math.ceil(plan.filter((c) => !c.done).reduce((a, c) => a + c.weight, 0) * 1.3);

const send = (payload) => { if (win && !win.isDestroyed()) win.webContents.send('setup:event', payload); };

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 620,
    show: false,
    title: 'Remiqora',
    backgroundColor: '#0f0f14',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: true, nodeIntegration: false },
  });
  win.once('ready-to-show', () => win.show());
  win.on('closed', () => { win = null; });

  // External links open in the system browser; the window only ever shows the setup page or our own backend.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    const own = url.startsWith('file:') || (server && server.url && url.startsWith(server.url));
    if (!own) {
      event.preventDefault();
      if (/^https?:\/\//.test(url)) shell.openExternal(url);
    }
  });
  if (!app.isPackaged && process.env.REMIQORA_DEVTOOLS) win.webContents.openDevTools({ mode: 'detach' });
}

function showSetup(query = {}) {
  return win.loadFile(SETUP_PAGE, { query });
}

/** Starts the backend, then swaps the window over to the real app. */
async function launch() {
  // Back from adding parts while the app ran: the backend is still up, just show it again. What was picked but not
  // installed is dropped, so a later start does not stop at the setup screen for it.
  if (server && server.url) {
    ctx = buildContext(ctx.L.root);
    await saveFeatures(ctx.installed);
    await win.loadURL(server.url);
    return;
  }
  send({ type: 'starting' });
  server = new BackendServer(ctx);
  server.on('exit', (code) => {
    if (quitting) return;
    showSetup({ state: 'crashed', message: `The backend stopped (exit code ${code}).` });
  });
  try {
    const url = await server.start({ preferredPort: savedPort });
    if (server.port !== savedPort) {
      savedPort = server.port;
      await updateConfig(app.getPath('userData'), { port: savedPort });
    }
    await win.loadURL(url);
  } catch (err) {
    showSetup({ state: 'crashed', message: err.message });
  }
}

async function startSetup() {
  if (setupAbort) return;
  setupAbort = new AbortController();
  const run = { ...ctx, signal: setupAbort.signal };
  try {
    await runSetup(run, send);
    send({ type: 'finished', complete: await isSetupComplete(ctx) });
  } catch (err) {
    if (setupAbort.signal.aborted) send({ type: 'paused' });
    else send({ type: 'failed', componentId: err.componentId || null, message: err.message });
  } finally {
    setupAbort = null;
  }
}

function registerIpc() {
  ipcMain.handle('setup:context', async () => {
    const plan = await describePlan(ctx);
    const always = plan.filter((c) => ['uv', 'ffmpeg', 'backend-env', 'ace-step', 'ace-models'].includes(c.id));
    return {
      // The parts to choose from: what is picked, what is already on disk (shown as installed, not removable),
      // and how much each weighs.
      features: {
        ids: FEATURE_IDS,
        precisions: PRECISIONS,
        selection: ctx.selection,
        installed: ctx.installed,
        sizes: featureSizes(manifest, PLATFORM, ctx.selection),
        baseBytes: always.reduce((a, c) => a + c.weight, 0),
        // the XL model's video memory hint, compared on screen with the card found by the checks
        xlVramMiB: manifest.aceXlModel.recommendedVramMiB,
        // nothing picked yet: the screen may still adjust the defaults to the card (q4_0 on a small one)
        untouched: savedFeatures === null,
      },
      neededBytes: neededBytes(plan),
      // Opened from the app to add parts: the server is running, setup is not a first run.
      adding: !!(server && server.url),
      version: app.getVersion(),
      platform: PLATFORM,
      // Every preferred language, like the app itself: Russian anywhere in the list selects Russian.
      // REMIQORA_LANG=en|ru forces the language (screenshots, trying another language on this machine).
      languages: process.env.REMIQORA_LANG ? [process.env.REMIQORA_LANG] : [app.getLocale(), ...app.getPreferredSystemLanguages()],
      dataRoot: ctx.L.root,
      plan,
      totalBytes: plan.reduce((sum, c) => sum + c.weight, 0),
    };
  });
  ipcMain.handle('setup:checks', async (_e, dataRoot) =>
    runChecks({ platform: PLATFORM, dataRoot: dataRoot || ctx.L.root, manifest, requiredBytes: neededBytes(await describePlan(ctx)) }));
  ipcMain.handle('setup:set-features', async (_e, picked) => { await saveFeatures(picked || {}); });
  // From the app: a "not installed" screen asks to add a part. Pick it and show the setup screen to download it.
  ipcMain.handle('app:add-features', async (_e, ids) => {
    if (setupAbort) return;
    const next = { ...ctx.selection };
    for (const id of Array.isArray(ids) ? ids : []) {
      if (FEATURE_IDS.includes(id)) next[id] = true;
      if (PRECISIONS.includes(id)) { next.yue2 = true; next.yue2Precisions = [...new Set([...next.yue2Precisions, id])]; }
    }
    await saveFeatures(next);
    await showSetup({ state: 'add' });
  });
  ipcMain.handle('app:features', () => ({ installed: detectInstalled(ctx.L), selection: ctx.selection }));
  ipcMain.handle('setup:choose-folder', async () => {
    const r = await dialog.showOpenDialog(win, { properties: ['openDirectory', 'createDirectory'] });
    if (r.canceled || !r.filePaths[0]) return null;
    const picked = r.filePaths[0];
    return path.basename(picked).toLowerCase() === 'remiqora' ? picked : path.join(picked, 'Remiqora');
  });
  ipcMain.handle('setup:set-root', async (_e, dir) => {
    try {
      await ensureWritableDir(dir);
    } catch (err) {
      return { ok: false, message: err.message };
    }
    ctx = buildContext(dir);
    await updateConfig(app.getPath('userData'), { dataRoot: dir });
    return { ok: true };
  });
  ipcMain.handle('setup:start', async () => {
    // Remember the chosen folder right away: an interrupted setup resumes there on the next start.
    await ensureWritableDir(ctx.L.root);
    await updateConfig(app.getPath('userData'), { dataRoot: ctx.L.root });
    // and the parts as they stand, defaults included: without a saved pick the next start would take this for an
    // install from before the choice existed and pick everything
    await saveFeatures(ctx.selection);
    startSetup();
  });
  ipcMain.handle('setup:pause', () => { if (setupAbort) setupAbort.abort(new Error('paused')); });
  ipcMain.handle('setup:launch', () => launch());
  ipcMain.handle('setup:open-external', (_e, key) => { if (EXTERNAL[key]) shell.openExternal(EXTERNAL[key]); });
  ipcMain.handle('setup:open-logs', () => shell.openPath(ctx.L.logs));
  ipcMain.handle('setup:show-data', () => shell.openPath(ctx.L.root));
}

async function boot() {
  const config = await loadConfig(app.getPath('userData'));
  savedPort = config.port || null;
  savedFeatures = config.features || null;
  ctx = buildContext(config.dataRoot || defaultDataRoot());
  registerIpc();
  Menu.setApplicationMenu(process.platform === 'darwin'
    ? Menu.buildFromTemplate([{ role: 'appMenu' }, { role: 'editMenu' }, { role: 'viewMenu' }, { role: 'windowMenu' }])
    : null);
  createWindow();
  // A saved data root means the user already went through the first run; go straight in when nothing is missing.
  if (config.dataRoot && (await isSetupComplete(coreContext(), { ignoreSkipped: true }))) await launch();
  else await showSetup();
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!win) return;
    if (win.isMinimized()) win.restore();
    win.focus();
  });
  app.whenReady().then(boot).catch((err) => { dialog.showErrorBox('Remiqora', err.stack || String(err)); app.exit(1); });

  app.on('window-all-closed', () => app.quit());

  // Stop the model servers through the backend before the process goes away, otherwise a GPU process can be left behind.
  app.on('before-quit', (event) => {
    if (quitting) return;
    quitting = true;
    if (setupAbort) setupAbort.abort(new Error('quit'));
    if (server) {
      event.preventDefault();
      server.stop().finally(() => app.quit());
    }
  });
}
