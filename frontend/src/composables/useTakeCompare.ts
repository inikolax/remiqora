import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { claimPlayback, releasePlaybackIfCurrent } from './audioPlayback'

/** One take as the comparison needs it: a saved track with its audio. */
export interface CompareTake {
  /** The saved track's id: the star and the trash work on it. */
  id: number
  src: string
  /** Its number among the song's takes (1-based), as the lists show it. */
  n: number
  seed: number | null
  durationSec: number | null
  createdAt: number
}

/** What each take's element reports, for its tile. */
export interface TakeState {
  ready: boolean
  failed: boolean
  /** The element's own length once its metadata is in; until then the length the library knows. */
  duration: number
}

/** How far a muted take may wander from the audible one before it is put back in step. */
const DRIFT_SEC = 0.06
/** How often the muted takes are checked against the audible one. */
const CHECK_MS = 250

/**
 * An A/B switch over 2–4 takes of one song, as in a studio: every take loads into its own <audio>, they all play
 * together from the same second and only the chosen one is heard. Switching the take is seamless: the newly chosen
 * element is already playing in step, it is only unmuted (and nudged when it has wandered). One transport for all:
 * play/pause, seek, the time; its length is the longest take's, and a shorter one is silent past its end.
 *
 * The clock is the audible element while it is inside its length, else the longest take still running (all muted
 * then); the others follow it and are put back in step when they drift more than 60 ms (inaudible: they are muted).
 */
export function useTakeCompare(list: () => CompareTake[]) {
  const takes = computed(list)
  const els: HTMLAudioElement[] = []
  const state = reactive<TakeState[]>([])
  const active = ref(0)
  const playing = ref(false)
  const time = ref(0)
  const total = computed(() => state.reduce((m, s) => Math.max(m, s.duration || 0), 0))

  const durOf = (i: number): number => {
    const d = els[i]?.duration
    return Number.isFinite(d) && d > 0 ? d : state[i]?.duration || 0
  }
  /** Inside its length: a take past its end is silent and waits. */
  const inside = (i: number, at: number): boolean => at < durOf(i) - 0.02

  function build(): void {
    teardown()
    takes.value.forEach((tk, i) => {
      const el = new Audio()
      el.preload = 'auto'
      el.muted = i !== active.value
      el.src = tk.src
      state.push({ ready: false, failed: false, duration: tk.durationSec ?? 0 })
      el.addEventListener('loadedmetadata', () => { if (Number.isFinite(el.duration)) state[i].duration = el.duration })
      el.addEventListener('canplay', () => { state[i].ready = true })
      el.addEventListener('error', () => { state[i].failed = true })
      // a take that reaches its end goes silent; the transport goes on while a longer one runs
      el.addEventListener('ended', () => { if (playing.value && !els.some((x, j) => j !== i && !x.paused && !x.ended)) finish() })
      // something outside paused a take inside its length (another player claimed the output): pause them all.
      // The composable itself pauses a take while playing only to park it at its end, which this skips.
      el.addEventListener('pause', () => { if (playing.value && !el.ended && inside(i, el.currentTime)) pause() })
      els.push(el)
    })
    if (active.value >= els.length) active.value = 0
  }
  function teardown(): void {
    for (const el of els) {
      el.pause()
      releasePlaybackIfCurrent(el)
      el.removeAttribute('src')
      el.load()
    }
    els.length = 0
    state.splice(0)
    stopLoop()
    playing.value = false
  }

  /** The element whose time is the transport's. */
  function clock(): HTMLAudioElement | null {
    const a = els[active.value]
    if (a && !a.paused && !a.ended) return a
    let best: HTMLAudioElement | null = null
    for (const el of els) if (!el.paused && !el.ended && (!best || el.duration > best.duration)) best = el
    return best
  }

  function playFrom(at: number): void {
    for (let i = 0; i < els.length; i++) {
      const el = els[i]
      if (inside(i, at)) {
        if (Math.abs(el.currentTime - at) > 0.02) el.currentTime = at
        void el.play().catch(() => { /* a take that cannot play stays silent */ })
      } else {
        el.pause()
        // parked at its end: silent until the transport comes back inside it
        if (Number.isFinite(el.duration)) el.currentTime = el.duration
      }
    }
    // always the first element holds the app's "one thing plays" slot: claiming another one of ours would pause
    // the one that held it. Another player claiming the slot pauses it, and its 'pause' stops the comparison.
    if (els[0]) claimPlayback(els[0])
  }

  function play(): void {
    if (!els.length) return
    if (time.value >= total.value - 0.05) time.value = 0
    playing.value = true
    playFrom(time.value)
    startLoop()
  }
  function pause(): void {
    const at = clockTime()
    playing.value = false
    for (const el of els) el.pause()
    stopLoop()
    time.value = at
  }
  function finish(): void {
    pause()
    time.value = total.value
  }
  function toggle(): void {
    if (playing.value) pause()
    else play()
  }
  function clockTime(): number {
    const c = clock()
    return c ? c.currentTime : time.value
  }

  /** `sec` from the start; while playing, every take moves there and plays on. */
  function seek(sec: number): void {
    const at = Math.max(0, Math.min(total.value || 0, sec))
    time.value = at
    if (playing.value) playFrom(at)
    else {
      for (let i = 0; i < els.length; i++) {
        const el = els[i]
        el.currentTime = inside(i, at) ? at : Number.isFinite(el.duration) ? el.duration : at
      }
    }
  }
  const seekBy = (delta: number): void => seek(time.value + delta)

  /** The take heard from now on, from the same second: unmuted, the one before muted, both in the same task. */
  function pick(i: number): void {
    if (i < 0 || i >= els.length || i === active.value) return
    const at = playing.value ? clockTime() : time.value
    const next = els[i]
    if (inside(i, at)) {
      // re-sync on the switch: only when it has wandered, a seek on a playing element is a click
      if (Math.abs(next.currentTime - at) > 0.02) next.currentTime = at
      if (playing.value && next.paused) void next.play().catch(() => {})
    }
    next.muted = false
    els[active.value].muted = true
    active.value = i
  }

  // ---- while playing: the time for the transport on every frame, and the drift check on a timer ----
  // (a timer, not the frame loop: a hidden window stops the frames, and the takes must stay in step while heard)
  let raf = 0
  let timer: ReturnType<typeof setInterval> | null = null
  function frame(): void {
    const c = clock()
    if (c) time.value = c.currentTime
    raf = requestAnimationFrame(frame)
  }
  function check(): void {
    const c = clock()
    if (!c) return
    const at = c.currentTime
    time.value = at
    for (let i = 0; i < els.length; i++) {
      const el = els[i]
      // one still moving to where it was sent is left alone: sending it again would only restart the seek
      if (el === c || el.seeking || !inside(i, at)) continue
      // a take that had ended comes back in when the transport is inside it again
      if (el.paused) { el.currentTime = at; void el.play().catch(() => {}); continue }
      if (Math.abs(el.currentTime - at) > DRIFT_SEC) el.currentTime = at
    }
  }
  function startLoop(): void {
    stopLoop()
    raf = requestAnimationFrame(frame)
    timer = setInterval(check, CHECK_MS)
  }
  function stopLoop(): void {
    if (raf) cancelAnimationFrame(raf)
    raf = 0
    if (timer) clearInterval(timer)
    timer = null
  }

  // the takes are fixed for one opening; a new list (after the trash's undo) rebuilds the elements
  watch(() => takes.value.map((x) => x.src).join('|'), build, { immediate: true })
  onBeforeUnmount(teardown)

  return { takes, state, active, playing, time, total, play, pause, toggle, seek, seekBy, pick, stop: teardown }
}
