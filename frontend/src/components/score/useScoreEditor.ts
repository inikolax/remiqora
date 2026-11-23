import { computed, inject, markRaw, provide, reactive, ref, shallowRef, watch } from 'vue'
import type { ComputedRef, InjectionKey, ShallowRef } from 'vue'
import {
  History, abcToScore, addNote, deleteNotes, duplicate, emptyScore, lyricsSections, moveNotes, octave, pasteNotes, rangeOf,
  scoreTicks, scoreToAbc, secPerTick, setBars, snapDown, ticksPerBar, ticksPerBeat, transpose, validate,
} from '../../audio/score'
import type { Check, Note, ParseWarning, Score, VoiceId } from '../../audio/score'
import { countSyllables } from '../../audio/score/lyricsMap'
import { playPianoNotes } from '../../audio/pianoSynth'
import type { PianoPlayback } from '../../audio/pianoSynth'
import type { MidiNote } from '../../audio/miniMidiPlayer'
import { getSharedAudioCtx } from '../../composables/audioPlayback'

/**
 * The note editor's state, shared by every view of one score (one instance, provided by ScoreEditor and injected by
 * every part; the form's score lives in the score workspace store, so the form's card and the workspace share it). The Score itself is immutable and kept in a shallowRef; every committed
 * edit goes into the History and is written back to the form as ABC (the form and the backend only know ABC).
 */

export type Tool = 'select' | 'pencil' | 'eraser' | 'cut'
export type ViewMode = 'roll' | 'sheet' | 'simple'
export type RangePreset = 'male' | 'female'

export interface HoverInfo { voice: VoiceId; tick: number; pitch: number }

export interface ScoreEditorOptions {
  getAbc: () => string
  setAbc: (abc: string) => void
  lyrics: () => string
  style: () => string
}

export function createScoreEditor(opts: ScoreEditorOptions) {
  const score: ShallowRef<Score> = shallowRef(emptyScore())
  const history = markRaw(new History(score.value, 200))
  const historyVersion = ref(0)
  const warnings = shallowRef<ParseWarning[]>([])
  const selection = shallowRef<Set<string>>(new Set())

  const ui = reactive({
    tool: 'pencil' as Tool,
    /** Length of a new note in ticks; 0 = the pencil draws a rest. */
    dur: 4,
    /** Rest length when dur is 0. */
    restDur: 4,
    grid: 4,
    snapKey: true,
    activeVoice: 'vocal' as VoiceId,
    insCollapsed: false,
    mute: { vocal: false, ins: false } as Record<VoiceId, boolean>,
    solo: { vocal: false, ins: false } as Record<VoiceId, boolean>,
    rangePreset: 'male' as RangePreset,
    rangeTouched: false,
    view: 'roll' as ViewMode,
    /** Pixels per tick. */
    ppt: 3,
    scrollX: 0,
    /** Top of each lane, in pixels of its content. */
    scrollY: { vocal: -1, ins: -1 } as Record<VoiceId, number>,
    cursorTick: 0,
    playTick: null as number | null,
    playing: false,
    loopOn: false,
    loop: null as [number, number] | null,
    follow: true,
    metronome: false,
    hover: null as HoverInfo | null,
    fullscreen: false,
    pianoOpen: false,
    /** The piano writes what is played at the cursor (off: it only sounds). */
    recording: true,
    abcTyping: false,
    /** Notes being dragged: the mini toolbar hides meanwhile. */
    dragging: false,
    /** Width of the note area (set by the grid), for zoom-to-fit and follow. */
    areaW: 600,
    /** The simple view's current section (its id): "Play the section" plays it. */
    simpleSection: null as string | null,
    /** The simple view's line last touched or playing: its text and which line of that text it is (the n-th, from
     *  0), so the form can light the same line in the lyrics. */
    simpleLine: null as { key: string; text: string; nth: number } | null,
    /** "Show the check", asked from the notes help: the workspace opens its bottom drawer once and clears it. */
    showChecks: false,
  })

  // ---- the score and its history ----
  const canUndo = computed(() => (historyVersion.value, history.canUndo))
  const canRedo = computed(() => (historyVersion.value, history.canRedo))
  let lastWritten: string | null = null

  function writeAbc(): void {
    const s = score.value
    const empty = s.bars === 0 && !s.voices.vocal.length && !s.voices.ins.length
    const text = empty ? '' : scoreToAbc(s)
    lastWritten = text
    opts.setAbc(text)
  }

  /** Shows a score without making it a step (a drag in progress). */
  function preview(next: Score): void {
    score.value = next
  }

  /** Makes the score shown a step of its own (the end of a drag) and writes it. An edit made while text typed in
   *  the ABC pane still waits to be read was built on the old score: the text is read and that edit dropped, so
   *  what was typed is not overwritten (the edit entry points read the text first; this is the safety net). */
  function commit(next: Score = score.value, coalesceKey?: string): void {
    if (flushTyping()) return
    score.value = next
    if (next === history.present) return
    history.push(next, coalesceKey)
    historyVersion.value++
    pruneSelection()
    writeAbc()
  }

  function pruneSelection(): void {
    if (!selection.value.size) return
    const ids = new Set([...score.value.voices.vocal, ...score.value.voices.ins].map((n) => n.id))
    const kept = [...selection.value].filter((id) => ids.has(id))
    if (kept.length !== selection.value.size) selection.value = new Set(kept)
  }

  function undo(): void {
    flushTyping()
    const s = history.undo()
    if (!s) return
    score.value = s
    historyVersion.value++
    pruneSelection()
    writeAbc()
  }
  function redo(): void {
    flushTyping()
    const s = history.redo()
    if (!s) return
    score.value = s
    historyVersion.value++
    pruneSelection()
    writeAbc()
  }

  /** Reads the form's ABC. `initial`: no undo step and the history starts over (the panel opening, a new song).
   *  `fromTyping`: text typed in the ABC pane, the view (zoom, scroll, cursor) stays where it is. */
  function loadAbc(text: string, how: { initial?: boolean; fromTyping?: boolean } = {}): void {
    let next: Score
    if (!text.trim()) {
      next = emptyScore()
      warnings.value = []
    } else {
      const r = abcToScore(text)
      next = r.score
      warnings.value = r.warnings
    }
    score.value = next
    selection.value = new Set()
    if (how.initial) history.reset(next)
    else history.push(next)
    historyVersion.value++
    lastWritten = text
    if (!how.fromTyping) loadVersion.value++
  }
  /** Counts loads from outside (a new song, an import): the grid recentres on them. */
  const loadVersion = ref(0)

  let parseTimer: ReturnType<typeof setTimeout> | null = null
  /** The next text from outside is a new song (a reuse, an idea, "From a song"): undo does not cross into it. */
  let newSongNext = false
  function expectNewSong(): void {
    newSongNext = true
  }
  watch(opts.getAbc, (v) => {
    const newSong = newSongNext
    newSongNext = false
    if (v === lastWritten) return
    if (parseTimer) clearTimeout(parseTimer)
    parseTimer = null
    if (ui.abcTyping && !newSong) parseTimer = setTimeout(() => { parseTimer = null; loadAbc(opts.getAbc(), { fromTyping: true }) }, 300)
    else loadAbc(v, { initial: newSong })
  })
  /** Reads text typed in the ABC pane that still waits for its pause; true when there was some. */
  function flushTyping(): boolean {
    if (!parseTimer) return false
    clearTimeout(parseTimer)
    parseTimer = null
    if (opts.getAbc() === lastWritten) return false
    loadAbc(opts.getAbc(), { fromTyping: true })
    return true
  }
  // leaving the text pane reads what was typed right away (sync: the click that left it may edit the score next)
  watch(() => ui.abcTyping, (typing) => {
    if (!typing) flushTyping()
  }, { flush: 'sync' })
  loadAbc(opts.getAbc(), { initial: true })

  /** Replaces the whole score (an import, a scaffold) as one undoable step. */
  function replaceScore(next: Score): void {
    flushTyping()
    stop()
    selection.value = new Set()
    warnings.value = []
    commit(next)
    loadVersion.value++
  }

  const isEmpty = computed(() => {
    const s = score.value
    return s.bars === 0 && !s.voices.vocal.length && !s.voices.ins.length
  })

  // ---- derived ----
  const tpb = computed(() => ticksPerBar(score.value.meter))
  const tpBeat = computed(() => ticksPerBeat(score.value.meter))
  const total = computed(() => scoreTicks(score.value))
  const spt = computed(() => secPerTick(score.value))
  const vocalRange = computed<[number, number]>(() => rangeOf(ui.rangePreset))
  const lyricsTags = computed(() => lyricsSections(opts.lyrics()).map((s) => s.tag || s.type))
  const lyricsSyllables = computed(() => countSyllables(opts.lyrics()))
  const checks: ComputedRef<Check[]> = computed(() => validate(score.value, {
    vocalRange: ui.rangePreset,
    ...(opts.lyrics().trim() ? { lyricsSections: lyricsTags.value, lyricsSyllables: lyricsSyllables.value } : {}),
    abc: opts.getAbc(),
  }))

  // the singer named in the style picks the range, until the user picks one
  watch(opts.style, (s) => {
    if (ui.rangeTouched) return
    const text = (s || '').toLowerCase()
    ui.rangePreset = /female|женск|woman|girl|девуш/.test(text) ? 'female' : 'male'
  }, { immediate: true })

  const selectedNotes = computed(() => {
    const sel = selection.value
    const out: { voice: VoiceId; note: Note }[] = []
    if (!sel.size) return out
    for (const v of ['vocal', 'ins'] as const) for (const n of score.value.voices[v]) if (sel.has(n.id)) out.push({ voice: v, note: n })
    return out
  })

  function select(ids: Iterable<string>, add = false): void {
    const next = add ? new Set(selection.value) : new Set<string>()
    for (const id of ids) next.add(id)
    selection.value = next
  }
  function toggleSelect(id: string): void {
    const next = new Set(selection.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    selection.value = next
  }
  function clearSelection(): void {
    if (selection.value.size) selection.value = new Set()
  }
  function selectAll(): void {
    select(score.value.voices[ui.activeVoice].map((n) => n.id))
  }

  // ---- edits of the selection ----
  const selIds = (): string[] => [...selection.value]
  function editSel(fn: (s: Score, ids: string[]) => Score, key?: string): void {
    flushTyping()
    const ids = selIds()
    if (!ids.length) return
    commit(fn(score.value, ids), key)
  }
  const nudgePitch = (d: number): void => editSel((s, ids) => transpose(s, ids, d), 'nudge')
  const nudgeOctave = (d: 1 | -1): void => editSel((s, ids) => octave(s, ids, d), 'nudge')
  const nudgeTime = (d: number): void => editSel((s, ids) => moveNotes(s, ids, d, 0), 'nudge')
  function deleteSelection(): void {
    flushTyping()
    const ids = selIds()
    if (!ids.length) return
    commit(deleteNotes(score.value, ids))
    selection.value = new Set()
  }
  function duplicateSelection(): void {
    flushTyping()
    const ids = selIds()
    if (!ids.length) return
    const r = duplicate(score.value, ids, ui.grid)
    commit(r.score)
    select(r.ids)
  }
  let clipboard: { voice: VoiceId; pitch: number; start: number; dur: number }[] = []
  function copySelection(): void {
    const notes = selectedNotes.value
    if (!notes.length) return
    const t0 = notes.reduce((m, n) => Math.min(m, n.note.start), Infinity)
    clipboard = notes.map(({ voice, note }) => ({ voice, pitch: note.pitch, start: note.start - t0, dur: note.dur }))
  }
  function paste(): void {
    if (!clipboard.length) return
    const at = ui.cursorTick
    const span = clipboard.reduce((m, n) => Math.max(m, n.start + n.dur), 0)
    const r = pasteNotes(ensureRoom(at + span), clipboard.map((n) => ({ ...n, start: n.start + at })))
    commit(r.score)
    select(r.ids)
  }

  // ---- the piano: a played note goes in at the cursor and the cursor moves on ----
  function ensureRoom(end: number): Score {
    flushTyping()
    let s = score.value
    if (isEmpty.value) s = { ...emptyScore({ key: 'C', tempo: 100 }), bars: 8 }
    const need = Math.ceil(end / ticksPerBar(s.meter))
    if (need > s.bars) s = setBars(s, Math.ceil(need / 4) * 4)
    return s
  }
  function typeNote(pitch: number): void {
    const dur = ui.dur || 4
    const at = ui.cursorTick
    const r = addNote(ensureRoom(at + dur), 'vocal', pitch, at, dur)
    commit(r.score)
    select(r.ids)
    ui.cursorTick = at + dur
    scrollToTick(ui.cursorTick)
  }
  function typeRest(): void {
    const dur = ui.dur || ui.restDur
    const s = ensureRoom(ui.cursorTick + dur)
    if (s !== score.value) commit(s)
    ui.cursorTick += dur
    scrollToTick(ui.cursorTick)
  }

  // ---- view ----
  function setZoom(ppt: number, anchorX?: number): void {
    const next = Math.max(0.4, Math.min(16, ppt))
    const ax = anchorX ?? ui.areaW / 2
    const tick = (ui.scrollX + ax) / ui.ppt
    ui.ppt = next
    ui.scrollX = Math.max(0, tick * next - ax)
  }
  function zoomFit(): void {
    const ticks = Math.max(tpb.value * 2, total.value)
    ui.ppt = Math.max(0.4, Math.min(16, (ui.areaW - 8) / ticks))
    ui.scrollX = 0
  }
  function showBars(from: number, to: number): void {
    const ticks = Math.max(1, to - from) * tpb.value
    ui.ppt = Math.max(0.4, Math.min(16, (ui.areaW - 16) / ticks))
    ui.scrollX = Math.max(0, from * tpb.value * ui.ppt - 8)
  }
  function scrollToTick(tick: number): void {
    const x = tick * ui.ppt
    if (x < ui.scrollX || x > ui.scrollX + ui.areaW - 24) ui.scrollX = Math.max(0, x - ui.areaW * 0.25)
  }

  // ---- playback ----
  let playback: PianoPlayback | null = null
  let raf = 0
  let nextBeat = 0
  let playFrom = 0
  const audibleVoices = (): VoiceId[] => {
    const solo = (['vocal', 'ins'] as const).filter((v) => ui.solo[v])
    if (solo.length) return solo
    return (['vocal', 'ins'] as const).filter((v) => !ui.mute[v])
  }
  function midiNotes(fromTick: number, toTick: number): MidiNote[] {
    const k = spt.value
    const out: MidiNote[] = []
    for (const v of audibleVoices()) {
      for (const n of score.value.voices[v]) {
        if (n.start >= toTick || n.start + n.dur <= fromTick) continue
        const end = Math.min(n.start + n.dur, toTick)
        out.push({ note: n.pitch, startSec: n.start * k, durationSec: (end - n.start) * k, velocity: v === 'vocal' ? 100 : 78, channel: v === 'vocal' ? 0 : 1 })
      }
    }
    return out.sort((a, b) => a.startSec - b.startSec)
  }
  /** The metronome's clicks of one playback go through this, so a stop silences the ones already scheduled. */
  let clickBus: GainNode | null = null
  function click(when: number, accent: boolean): void {
    const ctx = getSharedAudioCtx()
    if (!clickBus) { clickBus = ctx.createGain(); clickBus.connect(ctx.destination) }
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.frequency.value = accent ? 1500 : 1000
    g.gain.setValueAtTime(0.0001, when)
    g.gain.exponentialRampToValueAtTime(accent ? 0.35 : 0.2, when + 0.002)
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.04)
    o.connect(g).connect(clickBus)
    o.start(when)
    o.stop(when + 0.05)
  }
  const loopRange = (): [number, number] | null => {
    if (!ui.loopOn || !ui.loop) return null
    const a = ui.loop[0] * tpb.value
    const b = Math.min(total.value, ui.loop[1] * tpb.value)
    return b > a ? [a, b] : null
  }
  function halt(): void {
    playback?.stop()
    playback = null
    if (clickBus) {
      const bus = clickBus
      clickBus = null
      bus.gain.setValueAtTime(0, getSharedAudioCtx().currentTime)
      bus.disconnect()
    }
    cancelAnimationFrame(raf)
    ui.playing = false
  }
  function play(): void {
    if (isEmpty.value || total.value <= 0) return
    halt()
    const lr = loopRange()
    let from = ui.cursorTick
    if (lr && (from < lr[0] || from >= lr[1])) from = lr[0]
    if (!lr && from >= total.value - 1) from = 0
    const to = lr ? lr[1] : total.value
    playFrom = from
    ui.playing = true
    ui.playTick = from
    // the end is the song's (or the loop's), not the last note's: the frame loop below stops or loops there
    playback = playPianoNotes(midiNotes(from, to), from * spt.value)
    nextBeat = Math.ceil(from / tpBeat.value) * tpBeat.value
    const tick = (): void => {
      if (!playback) return
      const ctx = getSharedAudioCtx()
      const t = (ctx.currentTime - playback.startedAt) / spt.value
      ui.playTick = Math.max(playFrom, t)
      if (ui.metronome) {
        while ((nextBeat * spt.value + playback.startedAt) < ctx.currentTime + 0.15 && nextBeat < to) {
          const when = nextBeat * spt.value + playback.startedAt
          if (when >= ctx.currentTime - 0.01) click(Math.max(when, ctx.currentTime), nextBeat % tpb.value === 0)
          nextBeat += tpBeat.value
        }
      } else {
        nextBeat = Math.ceil(t / tpBeat.value) * tpBeat.value
      }
      const lr2 = loopRange()
      if (lr2 && t >= lr2[1]) { ui.cursorTick = lr2[0]; play(); return }
      if (!lr2 && t >= total.value) { stop(true); return }
      if (ui.follow) {
        const x = ui.playTick * ui.ppt
        if (x > ui.scrollX + ui.areaW - 30 || x < ui.scrollX) ui.scrollX = Math.max(0, x - 40)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
  }
  /** Stops; `toStart` leaves the cursor where it was (the end of the song), a pause keeps the place. */
  function stop(ended = false): void {
    const at = ui.playTick
    halt()
    ui.playTick = null
    if (!ended && at != null) ui.cursorTick = Math.max(0, Math.round(at))
  }
  function togglePlay(): void {
    if (ui.playing) stop()
    else play()
  }
  function toStart(): void {
    const was = ui.playing
    halt()
    ui.playTick = null
    const lr = loopRange()
    ui.cursorTick = lr ? lr[0] : 0
    ui.scrollX = Math.max(0, ui.cursorTick * ui.ppt - 8)
    if (was) play()
  }
  /** Plays bars [fromBar, toBar) over and over from `startTick` (a line or a section of the simple view). */
  function playRegion(fromBar: number, toBar: number, startTick = fromBar * tpb.value): void {
    halt()
    ui.loop = [fromBar, Math.max(fromBar + 1, toBar)]
    ui.loopOn = true
    ui.cursorTick = Math.max(0, Math.round(startTick))
    play()
  }
  function seek(tick: number): void {
    ui.cursorTick = Math.max(0, Math.min(total.value, Math.round(tick)))
    if (ui.playing) play()
  }

  // ---- keyboard ----
  const DUR_KEYS: Record<string, number> = { '1': 2, '2': 4, '3': 8, '4': 16, '5': 32, '6': 0 }
  function onKey(e: KeyboardEvent): boolean {
    const el = e.target as HTMLElement | null
    const typing = !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)
    if (typing) return false
    // Space and the arrows belong to a focused control (a button, a radio group, tabs, a menu, a slider)
    const control = !!el && (el.tagName === 'BUTTON' || el.tagName === 'A' || el.tagName === 'SELECT'
      || !!el.closest?.('[role=radio],[role=tab],[role=menuitem],[role=menuitemradio],[role=menuitemcheckbox],[role=slider],[role=option],[role=switch],[role=checkbox]'))
    if (control && (e.key === ' ' || e.key.startsWith('Arrow'))) return false
    const mod = e.ctrlKey || e.metaKey
    const k = e.key
    const lower = k.length === 1 ? k.toLowerCase() : k
    let handled = true
    if (mod && lower === 'z' && !e.shiftKey) undo()
    else if (mod && ((lower === 'z' && e.shiftKey) || lower === 'y')) redo()
    else if (mod && lower === 'd') duplicateSelection()
    else if (mod && lower === 'a') selectAll()
    else if (mod && lower === 'c') { copySelection(); handled = selection.value.size > 0 }
    else if (mod && lower === 'v') { paste(); handled = clipboard.length > 0 }
    else if (mod) handled = false
    else if (k === ' ') togglePlay()
    else if (k === 'Delete' || k === 'Backspace') { handled = selection.value.size > 0; deleteSelection() }
    else if (lower === 'v') ui.tool = 'select'
    else if (lower === 'b') ui.tool = 'pencil'
    else if (lower === 'e') ui.tool = 'eraser'
    else if (lower === 'c') ui.tool = 'cut'
    else if (lower === 'k') ui.snapKey = !ui.snapKey
    else if (lower === 'l') ui.loopOn = !ui.loopOn
    else if (lower === 'f') ui.fullscreen = !ui.fullscreen
    else if (k === 'Home') toStart()
    else if (k in DUR_KEYS) ui.dur = DUR_KEYS[k]
    else if (k === 'ArrowUp' || k === 'ArrowDown') {
      if (!selection.value.size) handled = false
      else if (e.shiftKey || e.altKey) nudgeOctave(k === 'ArrowUp' ? 1 : -1)
      else nudgePitch(k === 'ArrowUp' ? 1 : -1)
    } else if (k === 'ArrowLeft' || k === 'ArrowRight') {
      const step = (e.shiftKey || e.altKey ? tpb.value : ui.grid) * (k === 'ArrowLeft' ? -1 : 1)
      if (selection.value.size) nudgeTime(step)
      else { ui.cursorTick = Math.max(0, Math.min(total.value, snapDown(ui.cursorTick, Math.abs(step)) + step)); scrollToTick(ui.cursorTick) }
    } else if (k === 'Escape' && selection.value.size) clearSelection()
    else handled = false
    if (handled) { e.preventDefault(); e.stopPropagation() }
    return handled
  }

  function dispose(): void {
    halt()
    if (parseTimer) clearTimeout(parseTimer)
  }

  return {
    score, history, historyVersion, warnings, selection, ui, canUndo, canRedo, isEmpty, loadVersion,
    tpb, tpBeat, total, spt, vocalRange, checks, selectedNotes, lyricsTags,
    preview, commit, undo, redo, loadAbc, replaceScore, writeAbc, flushTyping, expectNewSong,
    select, toggleSelect, clearSelection, selectAll,
    nudgePitch, nudgeOctave, nudgeTime, deleteSelection, duplicateSelection, copySelection, paste,
    setZoom, zoomFit, showBars, scrollToTick, typeNote, typeRest,
    play, stop, togglePlay, toStart, seek, playRegion,
    onKey, dispose,
    lyrics: opts.lyrics,
    /** The ABC this editor reads and writes (the form's, or a take's copy). */
    abc: computed(() => opts.getAbc()),
    setAbc: opts.setAbc,
  }
}

export type ScoreEditorCtx = ReturnType<typeof createScoreEditor>
const KEY: InjectionKey<ScoreEditorCtx> = Symbol('scoreEditor')

export function provideScoreEditor(ctx: ScoreEditorCtx): void {
  provide(KEY, ctx)
}
export function useScoreEditor(): ScoreEditorCtx {
  const ctx = inject(KEY)
  if (!ctx) throw new Error('useScoreEditor outside ScoreEditor')
  return ctx
}

