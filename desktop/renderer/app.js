'use strict';
// First-run screen: checks and the choice of parts, download progress, problems, hand-over to the app.
// Opened from the app with ?state=add it adds parts that were left out (the app keeps running meanwhile).
(() => {
  const api = window.remiqora;
  const view = document.getElementById('view');
  const live = document.getElementById('live');
  const stepsEl = document.getElementById('steps');
  const params = new URLSearchParams(location.search);

  let locale = 'en';
  let ctx = null;
  let rows = {};          // component id -> { status, done, total, note, weight }
  let paused = false;
  let samples = [];       // [time, overall bytes] for speed and ETA
  let checkResult = null; // the last checks, kept so a change of parts only re-renders the screen
  const adding = params.get('state') === 'add';

  const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
  const t = (key, vars = {}) => {
    const v = window.STRINGS[locale][key] ?? window.STRINGS.en[key] ?? key;
    return Array.isArray(v) ? v.map((s) => fill(s, vars)) : fill(v, vars);
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const $ = (sel) => view.querySelector(sel);

  const ICON = {
    ok: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-6.5"/></svg>',
    err: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 7v6M12 16.5v.5"/></svg>',
    run: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 7v5l3 2"/></svg>',
    wait: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>',
  };
  const icon = (kind) => `<span class="ico ${kind === 'wait' ? '' : kind}">${ICON[kind]}</span>`;

  const nf = (digits) => new Intl.NumberFormat(locale, { maximumFractionDigits: digits, minimumFractionDigits: digits });
  function fmtBytes(n) {
    return n >= 1e9 ? `${nf(1).format(n / 1e9)} ${t('unit.gb')}` : `${nf(0).format(n / 1e6)} ${t('unit.mb')}`;
  }
  function fmtEta(sec) {
    return sec >= 90 ? `${Math.ceil(sec / 60)} ${t('unit.min')}` : `${Math.max(5, Math.round(sec / 5) * 5)} ${t('unit.sec')}`;
  }

  function setSteps(current, state) {
    const names = ['check', 'download', 'done'];
    stepsEl.innerHTML = names.map((name, i) => {
      const n = i + 1;
      const cls = n < current ? 'done' : n === current && state === 'bad' ? 'bad' : '';
      const cur = n === current ? ' aria-current="step"' : '';
      return `<li class="${cls}"${cur}>${esc(t('steps.' + name))}</li>`;
    }).join('');
  }

  /** Replaces the whole view once per state; progress updates afterwards only touch existing nodes. */
  function render(html, title) {
    view.innerHTML = html;
    live.textContent = title;
    const h1 = view.querySelector('h1');
    if (h1) { h1.tabIndex = -1; h1.focus({ preventScroll: true }); }
  }

  function bind(selector, handler) {
    const el = $(selector);
    if (el) el.addEventListener('click', handler);
  }

  // ---------- 1. checks ----------
  async function runChecksAndShow() {
    setSteps(1);
    render(`<h1>${esc(t('check.title'))}</h1><p class="lead">${esc(t('check.lead'))}</p><ul class="rows" aria-busy="true"></ul>`, t('check.title'));
    const result = await api.checks(ctx.dataRoot);
    // Not enough space is fixed on the same screen, by picking fewer parts or another folder.
    if (result.blocking && result.blocking.code !== 'no-disk') return showProblem(result);
    checkResult = result;
    await fitDefaultsToCard();
    showCheckResult();
  }

  function checkRow(item) {
    let detail = '';
    if (item.id === 'gpu') detail = item.vramMiB ? `${item.name}, ${Math.round(item.vramMiB / 1024)} ${t('unit.gb')}` : item.name;
    if (item.id === 'driver') detail = t('row.driver.detail', { v: item.driver, r: item.required });
    if (item.id === 'disk') detail = t('row.disk.detail', { free: fmtBytes(item.freeBytes), req: fmtBytes(ctx.neededBytes) });
    if (item.id === 'network') detail = item.ok ? t('row.network.ok') : t('row.network.bad');
    if (item.id === 'platform') detail = item.platform;
    const ok = item.id === 'disk' ? diskOk() : item.ok;
    return `<li>${icon(ok ? 'ok' : 'err')}<span class="name">${esc(t('row.' + item.id))}</span><span class="state">${esc(detail)}</span></li>`;
  }

  function folderBlock() {
    return `<div class="folder"><span class="lbl">${esc(t('folder.label'))}</span><span class="path" id="path">${esc(ctx.dataRoot)}</span><button type="button" class="btn quiet" id="change">${esc(t('folder.change'))}</button></div>`;
  }

  const diskOk = () => {
    const disk = checkResult && checkResult.items.find((i) => i.id === 'disk');
    return !disk || disk.freeBytes >= ctx.neededBytes;
  };
  const pendingBytes = () => ctx.plan.filter((c) => !c.done).reduce((a, c) => a + c.weight, 0);

  // ---------- the parts to install ----------
  /** One option: a checkbox (or a fixed mark for what is always or already installed), what it gives, its size. */
  function pickRow({ id, checked, fixed, size, title, text, children = '' }) {
    const box = fixed
      ? `<span class="box fixed" aria-hidden="true">${ICON.ok}</span>`
      : `<input type="checkbox" class="box" id="pick-${id}" data-pick="${id}"${checked ? ' checked' : ''}>`;
    const state = fixed === 'installed' ? t('pick.installed') : fixed === 'always' ? t('pick.always', { size: fmtBytes(size) }) : fmtBytes(size);
    return `<li class="pick${checked ? ' on' : ''}">
      ${box}
      <label class="what"${fixed ? '' : ` for="pick-${id}"`}><span class="name">${esc(title)}</span><span class="text">${esc(text)}</span></label>
      <span class="size">${esc(state)}</span>
      ${children}
    </li>`;
  }

  function pickBlock() {
    const f = ctx.features;
    const sel = f.selection;
    const inst = f.installed;
    const precisions = f.precisions.map((p) => {
      const has = inst.yue2Precisions.includes(p);
      return `<label class="prec${has ? ' fixed' : ''}"><input type="checkbox" data-prec="${p}"${sel.yue2Precisions.includes(p) ? ' checked' : ''}${has || !sel.yue2 ? ' disabled' : ''}>
        <span><b>${esc(p)}</b> ${esc(has ? t('pick.installed') : fmtBytes(f.sizes.precisions[p]))}<br><span class="text">${esc(t('pick.prec.' + p))}</span></span></label>`;
    }).join('');
    return `<section class="pickbox" aria-labelledby="pick-title">
      <h2 id="pick-title">${esc(t(adding ? 'pick.titleAdd' : 'pick.title'))}</h2>
      <ul class="picks">
        ${pickRow({ id: 'ace', checked: true, fixed: adding ? 'installed' : 'always', size: f.baseBytes, title: t('pick.ace'), text: t('pick.ace.text') })}
        ${pickRow({ id: 'yue2', checked: sel.yue2, fixed: inst.yue2 && 'installed', size: f.sizes.yue2, title: t('pick.yue2'), text: t('pick.yue2.text'),
          children: `<div class="precs" role="group" aria-label="${esc(t('pick.prec'))}"><span class="lbl">${esc(t('pick.prec'))}</span>${precisions}</div>` })}
        ${pickRow({ id: 'demucs', checked: sel.demucs, fixed: inst.demucs && 'installed', size: f.sizes.demucs, title: t('pick.demucs'), text: t('pick.demucs.text') })}
        ${pickRow({ id: 'aceBase', checked: sel.aceBase, fixed: inst.aceBase && 'installed', size: f.sizes.aceBase, title: t('pick.aceBase'), text: t('pick.aceBase.text') })}
        ${pickRow({ id: 'aceXl', checked: sel.aceXl, fixed: inst.aceXl && 'installed', size: f.sizes.aceXl, title: t('pick.aceXl'), text: t('pick.aceXl.text'), children: xlWarning() })}
      </ul>
      <p class="note">${esc(t('pick.later'))}</p>
    </section>`;
  }

  /**
   * Before anything is picked by hand: on a card under 10 GB YuE2's q8_0 does not fit (it peaks near 9 GB and fails
   * with "bad allocation"), so the default becomes q4_0.
   */
  async function fitDefaultsToCard() {
    const gpu = checkResult.items.find((i) => i.id === 'gpu');
    const f = ctx.features;
    if (!f.untouched || ctx.platform !== 'win32-x64' || !gpu || !gpu.vramMiB || gpu.vramMiB >= 10000) return;
    if (f.installed.yue2Precisions.length || f.selection.yue2Precisions.join() !== 'q8_0') return;
    await api.setFeatures({ ...f.selection, yue2Precisions: ['q4_0'] });
    ctx = await api.context();
  }

  /** The XL model wants a big card: say so, and louder when the card found by the checks is smaller. */
  function xlWarning() {
    const gpu = checkResult && checkResult.items.find((i) => i.id === 'gpu');
    const vram = gpu && gpu.vramMiB && ctx.platform === 'win32-x64' ? gpu.vramMiB : 0;
    const small = vram > 0 && vram < ctx.features.xlVramMiB;
    const text = small
      ? t('pick.aceXl.small', { have: Math.round(vram / 1024), need: Math.round(ctx.features.xlVramMiB / 1000) })
      : t('pick.aceXl.warn', { need: Math.round(ctx.features.xlVramMiB / 1000) });
    return `<p class="warnline${small ? ' bad' : ''}">${esc(text)}</p>`;
  }

  /** A change of parts: save it, get the new plan and sizes, re-render keeping the focus on the same box. */
  async function onPick(ev) {
    const el = ev.target;
    if (!(el instanceof HTMLInputElement)) return;
    const sel = { ...ctx.features.selection, yue2Precisions: [...ctx.features.selection.yue2Precisions] };
    if (el.dataset.pick) sel[el.dataset.pick] = el.checked;
    if (el.dataset.prec) {
      sel.yue2Precisions = el.checked ? [...sel.yue2Precisions, el.dataset.prec] : sel.yue2Precisions.filter((p) => p !== el.dataset.prec);
      // YuE2 needs one precision at least: unticking the last one keeps it
      if (sel.yue2Precisions.length === 0) { el.checked = true; return; }
    }
    const focusId = el.dataset.pick ? `[data-pick="${el.dataset.pick}"]` : `[data-prec="${el.dataset.prec}"]`;
    await api.setFeatures(sel);
    ctx = await api.context();
    showCheckResult();
    const again = $(focusId);
    if (again) again.focus();
  }

  function showCheckResult() {
    const nothing = pendingBytes() === 0;
    const title = t(adding ? 'add.title' : 'check.title');
    render(`
      <h1>${esc(title)}</h1>
      <p class="lead">${esc(t(adding ? 'add.lead' : 'check.lead'))}</p>
      <ul class="rows">${checkResult.items.map((i) => checkRow(i)).join('')}</ul>
      ${pickBlock()}
      ${adding ? '' : folderBlock()}
      <p class="note">${esc(nothing ? t('pick.nothing') : t(adding ? 'add.note' : 'check.note', { size: fmtBytes(pendingBytes()) }))}</p>
      ${diskOk() ? '' : `<p class="note bad" role="alert">${esc(t('pick.noDisk', { need: fmtBytes(ctx.neededBytes) }))}</p>`}
      <div class="actions">
        <button type="button" class="btn primary" id="start"${diskOk() && !(adding && nothing) ? '' : ' disabled'}>${esc(t(adding ? 'btn.add' : 'btn.start'))}</button>
        ${adding ? `<button type="button" class="btn" id="back">${esc(t('btn.back'))}</button>` : ''}
      </div>`, title);
    bind('#start', startDownload);
    bind('#change', chooseFolder);
    bind('#back', () => api.launch());
    const box = $('.pickbox');
    if (box) box.addEventListener('change', onPick);
  }

  async function chooseFolder() {
    const dir = await api.chooseFolder();
    if (!dir) return;
    const res = await api.setRoot(dir);
    if (!res.ok) { live.textContent = res.message; return; }
    ctx = await api.context();
    runChecksAndShow();
  }

  // ---------- problems ----------
  function showProblem(result) {
    const b = result.blocking;
    const vars = {
      v: b.gpu ? b.gpu.driver : '', r: b.required ?? '', gpu: b.gpu ? b.gpu.name : '',
      free: b.free !== undefined ? fmtBytes(b.free) : '', req: b.required && b.code === 'no-disk' ? fmtBytes(b.required) : '',
    };
    const steps = t(`p.${b.code}.steps`, vars);
    const primary = {
      'no-gpu': ['btn.drivers', () => api.openExternal('nvidia-drivers')],
      'old-driver': ['btn.drivers', () => api.openExternal('nvidia-drivers')],
      'old-gpu': ['btn.report', () => api.openExternal('issues')],
      'unsupported-platform': ['btn.report', () => api.openExternal('issues')],
      'no-disk': ['btn.folder', chooseFolder],
      offline: ['btn.recheck', runChecksAndShow],
    }[b.code];
    const showRecheck = b.code !== 'offline';
    setSteps(1, 'bad');
    render(`
      <h1>${esc(t(`p.${b.code}.title`, vars))}</h1>
      <p class="lead">${esc(t(`p.${b.code}.lead`, vars))}</p>
      ${steps.length ? `<ol class="steplist">${steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>` : ''}
      <details><summary>${esc(t('error.details'))}</summary><pre>${esc(JSON.stringify(result, null, 2))}</pre></details>
      <div class="actions">
        <button type="button" class="btn primary" id="primary">${esc(t(primary[0]))}</button>
        ${showRecheck ? `<button type="button" class="btn" id="recheck">${esc(t('btn.recheck'))}</button>` : ''}
      </div>`, t(`p.${b.code}.title`, vars));
    bind('#primary', primary[1]);
    bind('#recheck', runChecksAndShow);
  }

  // ---------- 2. download ----------
  function initRows() {
    rows = {};
    for (const c of ctx.plan) rows[c.id] = { status: c.done ? 'done' : 'queued', done: 0, total: 0, note: '', weight: c.weight };
    samples = [];
    paused = false;
  }

  function startDownload() {
    initRows();
    setSteps(2);
    render(`
      <h1>${esc(t('download.title'))}</h1>
      <p class="lead">${esc(t('download.lead'))}</p>
      <div class="bigbar">
        <div class="top"><span class="pct" id="pct">0%</span><span class="meta" id="meta"></span></div>
        <div class="track" role="progressbar" aria-label="${esc(t('download.title'))}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" id="bigtrack"><i id="bigfill"></i></div>
      </div>
      <ul class="rows" id="comps">${ctx.plan.map((c) => `<li id="row-${c.id}"><span class="ico-slot"></span><span class="name">${esc(t('comp.' + c.id))}</span><span class="state"></span><div class="track thin" role="progressbar" aria-label="${esc(t('comp.' + c.id))}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" hidden><i></i></div><div class="note-line" hidden></div></li>`).join('')}</ul>
      <div class="actions"><button type="button" class="btn" id="pause">${esc(t('btn.pause'))}</button><button type="button" class="btn quiet" id="logs">${esc(t('btn.logs'))}</button></div>`, t('download.title'));
    for (const c of ctx.plan) renderRow(c.id);
    renderOverall();
    bind('#pause', togglePause);
    bind('#logs', () => api.openLogs());
    api.start();
  }

  function togglePause() {
    const btn = $('#pause');
    if (!paused) { btn.disabled = true; api.pause(); return; } // the "paused" event finishes the switch
    paused = false;
    btn.textContent = t('btn.pause');
    api.start();
    renderOverall();
  }

  const fraction = (r) => (r.status === 'done' ? 1 : r.total > 0 ? Math.min(1, r.done / r.total) : 0);

  function renderRow(id) {
    const r = rows[id];
    const li = document.getElementById(`row-${id}`);
    if (!li) return;
    const slot = li.querySelector('.ico, .ico-slot');
    const state = li.querySelector('.state');
    const bar = li.querySelector('.track');
    const noteLine = li.querySelector('.note-line');
    const size = fmtBytes(r.weight);
    const kind = { done: 'ok', running: 'run', error: 'err' }[r.status] || 'wait';
    slot.outerHTML = icon(kind);
    if (r.status === 'done') state.textContent = `${t('status.done')}, ${size}`;
    else if (r.status === 'skipped') state.textContent = t('status.skipped');
    else if (r.status === 'error') state.textContent = t('status.error');
    else if (r.status === 'running') state.textContent = r.total > 0 ? `${Math.round(fraction(r) * 100)}%, ${size}` : `${t('status.working')}, ${size}`;
    else state.textContent = `${t('status.queued')}, ${size}`;

    const running = r.status === 'running';
    bar.hidden = !(running && r.total > 0);
    if (!bar.hidden) {
      bar.firstElementChild.style.width = `${fraction(r) * 100}%`;
      bar.setAttribute('aria-valuenow', String(Math.round(fraction(r) * 100)));
    }
    noteLine.hidden = !(running && r.note);
    if (!noteLine.hidden) noteLine.textContent = r.note;
  }

  function renderOverall() {
    const totalWeight = Object.values(rows).reduce((a, r) => a + r.weight, 0) || 1;
    const bytes = Object.values(rows).reduce((a, r) => a + r.weight * fraction(r), 0);
    const pct = Math.min(100, Math.round((bytes / totalWeight) * 100));
    const now = Date.now();
    samples.push([now, bytes]);
    samples = samples.filter(([time]) => now - time < 8000);
    let speed = 0;
    if (samples.length > 1) {
      const [t0, b0] = samples[0];
      if (now - t0 > 1500) speed = ((bytes - b0) / (now - t0)) * 1000;
    }
    const parts = [t('meta.progress', { done: fmtBytes(bytes), total: fmtBytes(totalWeight) })];
    if (paused) parts.push(t('meta.paused'));
    else if (speed > 1e5) parts.push(t('meta.speed', { speed: fmtBytes(speed) }), t('meta.eta', { eta: fmtEta((totalWeight - bytes) / speed) }));
    const pctEl = $('#pct');
    if (!pctEl) return;
    pctEl.textContent = `${pct}%`;
    $('#bigfill').style.width = `${pct}%`;
    $('#bigtrack').setAttribute('aria-valuenow', String(pct));
    $('#meta').textContent = parts.join(' · ');
  }

  // ---------- 3. done, failure, start ----------
  function showDone(complete) {
    setSteps(3);
    render(`
      <h1>${esc(t('done.title'))}</h1>
      <p class="lead">${esc(t('done.lead'))}</p>
      <ul class="rows">${ctx.plan.map((c) => `<li>${icon(rows[c.id] && rows[c.id].status === 'skipped' ? 'wait' : 'ok')}<span class="name">${esc(t('comp.' + c.id))}</span><span class="state">${esc(rows[c.id] && rows[c.id].status === 'skipped' ? t('status.skipped') : t('status.done'))}</span></li>`).join('')}</ul>
      ${complete ? '' : `<p class="note">${esc(t('done.partial'))}</p>`}
      <p class="note">${esc(t('done.note'))}</p>
      <div class="actions"><button type="button" class="btn primary" id="open">${esc(t('btn.open'))}</button><button type="button" class="btn quiet" id="data">${esc(t('btn.showdata'))}</button></div>`, t('done.title'));
    bind('#open', () => api.launch());
    bind('#data', () => api.showData());
  }

  function showFailure(message, componentId) {
    setSteps(2, 'bad');
    const comp = componentId ? t('comp.' + componentId) : '';
    render(`
      <h1>${esc(t('error.title'))}</h1>
      <p class="lead">${esc(t('error.lead', { comp }))}</p>
      <details open><summary>${esc(t('error.details'))}</summary><pre>${esc(message)}</pre></details>
      <div class="actions"><button type="button" class="btn primary" id="retry">${esc(t('btn.retry'))}</button><button type="button" class="btn" id="logs">${esc(t('btn.logs'))}</button><button type="button" class="btn quiet" id="report">${esc(t('btn.report'))}</button></div>`, t('error.title'));
    bind('#retry', startDownload);
    bind('#logs', () => api.openLogs());
    bind('#report', () => api.openExternal('issues'));
  }

  function showStarting() {
    setSteps(3);
    render(`<h1>${esc(t('starting.title'))}</h1><p class="lead">${esc(t('starting.lead'))}</p><div class="spinner" role="presentation"></div>`, t('starting.title'));
  }

  function showCrashed(message) {
    setSteps(3, 'bad');
    render(`
      <h1>${esc(t('crashed.title'))}</h1>
      <p class="lead">${esc(t('crashed.lead'))}</p>
      <details open><summary>${esc(t('error.details'))}</summary><pre>${esc(message)}</pre></details>
      <div class="actions"><button type="button" class="btn primary" id="retry">${esc(t('btn.retry'))}</button><button type="button" class="btn" id="logs">${esc(t('btn.logs'))}</button><button type="button" class="btn quiet" id="report">${esc(t('btn.report'))}</button></div>`, t('crashed.title'));
    bind('#retry', () => api.launch());
    bind('#logs', () => api.openLogs());
    bind('#report', () => api.openExternal('issues'));
  }

  function onEvent(ev) {
    if (ev.type === 'component' && rows[ev.id]) {
      const r = rows[ev.id];
      r.status = ev.status;
      if (ev.done !== undefined) { r.done = ev.done; r.total = ev.total; }
      if (ev.note) r.note = ev.note;
      if (ev.status === 'done') { r.done = r.total = 1; r.note = ''; }
      renderRow(ev.id);
      renderOverall();
    } else if (ev.type === 'finished') showDone(ev.complete);
    else if (ev.type === 'paused') {
      paused = true;
      const btn = $('#pause');
      if (btn) { btn.disabled = false; btn.textContent = t('btn.resume'); }
      renderOverall();
    } else if (ev.type === 'failed') showFailure(ev.message, ev.componentId);
    else if (ev.type === 'starting') showStarting();
  }

  (async function init() {
    ctx = await api.context();
    locale = ctx.languages.some((lang) => String(lang).toLowerCase().startsWith('ru')) ? 'ru' : 'en';
    document.documentElement.lang = locale;
    api.onEvent(onEvent);
    if (params.get('state') === 'crashed') return showCrashed(params.get('message') || '');
    runChecksAndShow();
  })();
})();
