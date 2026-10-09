// Remiqora landing: the playable session, the prompt clips, copy buttons. No tracking, no external calls:
// the audio comes from this site and loads only when someone presses play.
(() => {
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const VIEW = 1200; // the viewBox width of every waveform

  // Only one thing plays at a time: starting a player pauses the one that was playing.
  let current = null;
  const claim = (player) => { if (current && current !== player) current.pause(); current = player; };

  // A slider (the session ruler or a prompt waveform): click or drag to seek, arrows and Home / End from the keyboard.
  function seekable(el, length, onSeek) {
    const at = (e) => { const r = el.getBoundingClientRect(); return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * length; };
    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      el.setPointerCapture(e.pointerId);
      onSeek(at(e));
      const move = (ev) => onSeek(at(ev));
      const up = () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
    });
    return (now) => (e) => {
      const step = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5 }[e.key];
      if (step !== undefined) onSeek(Math.min(length, Math.max(0, now() + step)));
      else if (e.key === 'Home') onSeek(0);
      else if (e.key === 'End') onSeek(Math.max(0, length - 0.1));
      else return;
      e.preventDefault();
    };
  }
  const setSlider = (el, t) => { el.setAttribute('aria-valuenow', String(Math.round(t))); el.setAttribute('aria-valuetext', fmt(t)); };

  /* ---------- the session: four stems and three string takes, started together on one clock ---------- */
  const root = document.getElementById('session');
  if (root) {
    const section = root.closest('.session');
    const length = Number(root.dataset.len);
    const names = root.dataset.files.split(',');
    const playBtn = root.querySelector('.play');
    const ruler = root.querySelector('.ruler');
    const nowEl = root.querySelector('.time__now');
    const clipRect = root.querySelector('#played rect');
    const lanes = [...root.querySelectorAll('.lane')];
    const aiLane = root.querySelector('.lane--ai');
    const takeBtns = [...root.querySelectorAll('.take')];
    let ctx = null, master = null, buffers = null, loading = null;
    let sources = [], gains = {}, startedAt = 0, offset = 0, playing = false, raf = 0, take = 0;

    const state = { mute: new Set(), solo: new Set() };
    const audible = (lane) => !state.mute.has(lane) && (state.solo.size === 0 || state.solo.has(lane));

    function paintLanes() {
      for (const el of lanes) el.classList.toggle('is-silent', !audible(el.dataset.lane));
      aiLane.classList.toggle('is-off', take === 0);
    }
    // Every file has its own gain; a stem follows mute / solo, a take also needs to be the chosen one.
    function applyGains(smooth = true) {
      if (!ctx) return;
      for (const name of names) {
        const n = name.match(/strings-(\d)$/);
        const on = n ? audible('strings') && Number(n[1]) === take : audible(name.slice(name.lastIndexOf('-') + 1));
        const g = gains[name].gain;
        if (smooth) g.setTargetAtTime(on ? 1 : 0, ctx.currentTime, 0.015);
        else g.value = on ? 1 : 0;
      }
    }
    // the sources start 40 ms ahead of the clock, so clamp the gap before the first sample
    const position = () => (playing ? Math.min(length, Math.max(0, ctx.currentTime - startedAt)) : offset);
    function paintTime(t) {
      root.style.setProperty('--p', String(t / length));
      clipRect.setAttribute('width', String((t / length) * VIEW));
      nowEl.textContent = fmt(t);
      setSlider(ruler, t);
    }

    async function load() {
      if (buffers) return;
      if (!loading) {
        loading = (async () => {
          ctx = new (window.AudioContext || window.webkitAudioContext)();
          master = ctx.createGain();
          master.connect(ctx.destination);
          const base = root.dataset.audio;
          const decoded = await Promise.all(names.map(async (name) => {
            const res = await fetch(`${base}${name}.mp3`);
            if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
            const data = await res.arrayBuffer();
            return new Promise((ok, fail) => ctx.decodeAudioData(data, ok, fail));
          }));
          buffers = Object.fromEntries(names.map((n, i) => [n, decoded[i]]));
          for (const name of names) { gains[name] = ctx.createGain(); gains[name].connect(master); }
          applyGains(false);
        })();
      }
      await loading;
    }

    function stopSources() {
      for (const s of sources) { s.onended = null; try { s.stop(); } catch { /* already stopped */ } }
      sources = [];
    }
    function startAt(t) {
      stopSources();
      const when = ctx.currentTime + 0.04;
      for (const name of names) {
        const src = ctx.createBufferSource();
        src.buffer = buffers[name];
        src.connect(gains[name]);
        src.start(when, t);
        sources.push(src);
      }
      sources[0].onended = () => { if (playing && position() >= length - 0.05) { pause(); offset = 0; paintTime(0); } };
      startedAt = when - t;
    }
    function tick() { paintTime(position()); raf = requestAnimationFrame(tick); }

    async function play() {
      claim(player);
      playBtn.setAttribute('aria-busy', 'true');
      playBtn.setAttribute('aria-label', root.dataset.loading);
      try {
        await load();
      } catch (err) {
        playBtn.removeAttribute('aria-busy');
        playBtn.setAttribute('aria-label', root.dataset.play);
        console.error(err);
        return;
      }
      playBtn.removeAttribute('aria-busy');
      if (current !== player) return; // something else started while the stems were loading
      if (ctx.state === 'suspended') await ctx.resume();
      if (offset >= length - 0.05) offset = 0;
      startAt(offset);
      playing = true;
      root.classList.add('is-playing');
      playBtn.setAttribute('aria-label', root.dataset.pause);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    }
    function pause() {
      if (!playing) return;
      offset = position();
      playing = false;
      stopSources();
      cancelAnimationFrame(raf);
      root.classList.remove('is-playing');
      playBtn.setAttribute('aria-label', root.dataset.play);
      paintTime(offset);
    }
    function seek(t) {
      offset = t;
      if (playing) startAt(t);
      paintTime(t);
    }
    const player = { pause };

    playBtn.addEventListener('click', () => (playing ? pause() : play()));
    ruler.addEventListener('keydown', seekable(ruler, length, seek)(position));
    for (const w of root.querySelectorAll('.lane__wave')) seekable(w, length, seek);

    root.querySelector('.lanes').addEventListener('click', (e) => {
      const btn = e.target.closest('.ms');
      if (!btn) return;
      const lane = btn.closest('.lane').dataset.lane;
      const set = state[btn.dataset.act];
      set.has(lane) ? set.delete(lane) : set.add(lane);
      btn.setAttribute('aria-pressed', String(set.has(lane)));
      paintLanes();
      applyGains();
    });

    // the takes are a radio group: click, or arrows to move the choice
    function choose(n, focus) {
      take = n;
      takeBtns.forEach((b, i) => { b.setAttribute('aria-checked', String(i === n)); b.tabIndex = i === n ? 0 : -1; });
      if (focus) takeBtns[n].focus();
      for (const w of aiLane.querySelectorAll('.wave--take')) w.classList.toggle('is-shown', Number(w.dataset.take) === (n || 1));
      paintLanes();
      applyGains();
    }
    takeBtns.forEach((b, i) => {
      b.addEventListener('click', () => choose(i, false));
      b.addEventListener('keydown', (e) => {
        const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (d === undefined) return;
        e.preventDefault();
        choose((take + d + takeBtns.length) % takeBtns.length, true);
      });
    });
    paintLanes();

    // the one staged moment: the stems slide apart when the session first comes into view
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((en) => en.isIntersecting)) { section.classList.add('is-split'); io.disconnect(); }
      }, { threshold: 0.35 });
      io.observe(root);
    }
  }

  /* ---------- the prompt clips: one <audio> each, loaded on the first press ---------- */
  for (const row of document.querySelectorAll('.prompt')) {
    const btn = row.querySelector('.play');
    const slider = row.querySelector('.prompt__wave');
    const rect = slider.querySelector('clipPath rect');
    const length = Number(row.dataset.len);
    const audio = new Audio();
    audio.preload = 'none';
    let raf = 0;
    const paint = () => {
      const t = audio.currentTime || 0;
      rect.setAttribute('width', String((t / length) * VIEW));
      setSlider(slider, t);
    };
    const loop = () => { paint(); raf = requestAnimationFrame(loop); };
    const player = { pause: () => audio.pause() };
    const play = () => {
      claim(player);
      if (!audio.src) audio.src = row.dataset.src;
      audio.play().catch((err) => console.error(err));
    };
    audio.addEventListener('play', () => { row.classList.add('is-playing'); btn.setAttribute('aria-label', btn.dataset.pause); raf = requestAnimationFrame(loop); });
    audio.addEventListener('pause', () => { row.classList.remove('is-playing'); btn.setAttribute('aria-label', btn.dataset.play); cancelAnimationFrame(raf); paint(); });
    audio.addEventListener('ended', () => { audio.currentTime = 0; paint(); });
    btn.addEventListener('click', () => (audio.paused ? play() : audio.pause()));
    const seek = (t) => {
      if (!audio.src) { audio.src = row.dataset.src; audio.load(); }
      audio.currentTime = t;
      paint();
    };
    slider.addEventListener('keydown', seekable(slider, length, seek)(() => audio.currentTime || 0));
  }

  /* ---------- copy buttons for the install commands ---------- */
  const status = document.getElementById('copy-status');
  document.querySelectorAll('.copy').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const pre = document.getElementById(btn.dataset.target);
      if (!pre) return;
      const text = pre.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const r = document.createRange();
        r.selectNodeContents(pre);
        const s = window.getSelection();
        s.removeAllRanges();
        s.addRange(r);
        document.execCommand && document.execCommand('copy');
      }
      const label = btn.dataset.label;
      btn.textContent = btn.dataset.copied;
      if (status) status.textContent = btn.dataset.copied;
      setTimeout(() => { btn.textContent = label; if (status) status.textContent = ''; }, 1800);
    });
  });
})();
