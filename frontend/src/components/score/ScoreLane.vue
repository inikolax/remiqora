<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { addNote, deleteNotes, eraseRange, moveNotes, noteName, resizeNote, resizeNoteStart, scalePitchClasses, snap, snapDown, snapToScale, splitNote, parseKey } from '../../audio/score'
import type { Note, Score, VoiceId } from '../../audio/score'
import { pianoKey } from '../../audio/pianoSynth'
import { useScoreEditor } from './useScoreEditor'
import { durLabel, isBlackKey } from './scoreUi'
import ScoreIcon from './ScoreIcon.vue'

/**
 * One voice of the score as a piano roll on a canvas: the keys down its left edge, rows tinted by the key, beats and
 * bars, the notes (only the ones in view are drawn, so a song of a thousand notes stays smooth), the out-of-range
 * zones of the voice, the ghost note under the pencil, the marquee. All the mouse work of the four tools is here.
 */
const props = defineProps<{
  voice: VoiceId
  height: number
  rowH: number
  headerW: number
  keysW: number
  compact?: boolean
}>()
const emit = defineEmits<{ keyNote: [pitch: number] }>()

const ed = useScoreEditor()
const { ui } = ed
const { t } = useI18n()

const LO = 36
const HI = 96
const contentH = computed(() => (HI - LO + 1) * props.rowH)
const notes = computed(() => ed.score.value.voices[props.voice])
const isVocal = computed(() => props.voice === 'vocal')
const collapsed = computed(() => props.voice === 'ins' && ui.insCollapsed)

const canvas = ref<HTMLCanvasElement | null>(null)
const wrap = ref<HTMLDivElement | null>(null)
const width = ref(600)

// ---- vertical scroll: centred on the notes when a score comes in ----
const maxY = computed(() => Math.max(0, contentH.value - props.height))
function centre(): void {
  const ns = notes.value.length ? notes.value : ed.score.value.voices.vocal
  let mid: number
  if (ns.length) {
    let lo = 127
    let hi = 0
    for (const n of ns) { if (n.pitch < lo) lo = n.pitch; if (n.pitch > hi) hi = n.pitch }
    mid = (lo + hi) / 2
  } else {
    const [lo, hi] = ed.vocalRange.value
    mid = isVocal.value ? (lo + hi) / 2 : (lo + hi) / 2 - 5
  }
  ui.scrollY[props.voice] = Math.max(0, Math.min(maxY.value, (HI - mid) * props.rowH - props.height / 2))
}
const top = computed(() => Math.max(0, Math.min(maxY.value, ui.scrollY[props.voice] < 0 ? 0 : ui.scrollY[props.voice])))
watch(() => ed.loadVersion.value, () => centre())
watch(() => [props.rowH, props.height], () => centre())

// ---- coordinates ----
const xOf = (tick: number): number => props.keysW + tick * ui.ppt - ui.scrollX
const yOf = (p: number): number => (HI - p) * props.rowH - top.value
const tickAt = (x: number): number => (x - props.keysW + ui.scrollX) / ui.ppt
const pitchAt = (y: number): number => Math.max(LO, Math.min(HI, HI - Math.floor((y + top.value) / props.rowH)))

function noteAt(tick: number, pitch: number, tol = 3 / Math.max(0.01, ui.ppt)): Note | null {
  let best: Note | null = null
  for (const n of notes.value) {
    if (n.start > tick + tol) break
    if (n.pitch === pitch && tick >= n.start - tol && tick < n.start + n.dur + tol) best = n
  }
  return best
}

// ---- drawing ----
let pending = false
function invalidate(): void {
  if (pending) return
  pending = true
  requestAnimationFrame(() => { pending = false; draw() })
}
const ghost = ref<{ start: number; pitch: number; dur: number } | null>(null)
const marquee = ref<{ x0: number; y0: number; x1: number; y1: number } | null>(null)
const keyFlash = ref<number | null>(null)

function draw(): void {
  const cv = canvas.value
  if (!cv || collapsed.value) return
  const w = width.value
  const h = props.height
  const dpr = window.devicePixelRatio || 1
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
    cv.width = Math.round(w * dpr)
    cv.height = Math.round(h * dpr)
  }
  cv.style.width = `${w}px`
  cv.style.height = `${h}px`
  const g = cv.getContext('2d')
  if (!g) return
  g.setTransform(dpr, 0, 0, dpr, 0, 0)
  const s = ed.score.value
  const rowH = props.rowH
  const kw = props.keysW
  const ppt = ui.ppt
  const tpb = ed.tpb.value
  const tpBeat = ed.tpBeat.value
  const total = ed.total.value
  const pFirst = pitchAt(h)
  const pLast = pitchAt(0)
  const scalePcs = new Set(scalePitchClasses(s.key))
  const tonic = parseKey(s.key)?.tonic ?? 0
  const [rlo, rhi] = ed.vocalRange.value

  g.fillStyle = '#14141b'
  g.fillRect(0, 0, w, h)
  // rows
  for (let p = pFirst; p <= pLast; p++) {
    const y = yOf(p)
    const pc = p % 12
    if (ui.snapKey) {
      if (pc === tonic) { g.fillStyle = 'rgba(168,85,247,.11)'; g.fillRect(kw, y, w, rowH) }
      else if (scalePcs.has(pc)) { g.fillStyle = 'rgba(168,85,247,.055)'; g.fillRect(kw, y, w, rowH) }
    } else if (isBlackKey(p)) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(kw, y, w, rowH) }
    if (pc === 0) { g.fillStyle = 'rgba(148,163,184,.10)'; g.fillRect(kw, y + rowH - 1, w, 1) }
  }
  // past the end of the score
  const endX = xOf(total)
  if (endX < w) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(Math.max(kw, endX), 0, w, h) }
  // the loop region and the bar being played
  if (ui.loopOn && ui.loop) {
    const a = xOf(ui.loop[0] * tpb)
    const b = xOf(ui.loop[1] * tpb)
    g.fillStyle = 'rgba(56,189,248,.05)'
    g.fillRect(Math.max(kw, a), 0, Math.max(0, b - Math.max(kw, a)), h)
  }
  const curTick = ui.playTick ?? (ui.hover?.voice === props.voice ? ui.hover.tick : null)
  if (curTick != null) {
    const b = Math.floor(curTick / tpb)
    const x = xOf(b * tpb)
    g.fillStyle = 'rgba(255,255,255,.028)'
    g.fillRect(Math.max(kw, x), 0, tpb * ppt, h)
  }
  // grid, beats, bars
  const t0 = Math.max(0, Math.floor(tickAt(kw)))
  const t1 = Math.ceil(tickAt(w))
  const gridStep = ui.grid * ppt >= 7 ? ui.grid : tpBeat * ppt >= 7 ? tpBeat : tpb
  for (let tk = Math.floor(t0 / gridStep) * gridStep; tk <= Math.min(t1, total); tk += gridStep) {
    const x = Math.round(xOf(tk)) + 0.5
    if (x < kw) continue
    g.fillStyle = tk % tpb === 0 ? '#3a3a4a' : tk % tpBeat === 0 ? '#262632' : '#1d1d26'
    g.fillRect(x - 0.5, 0, 1, h)
  }
  // out of the singer's range: hatched, with a word
  if (isVocal.value) {
    const zone = (yA: number, yB: number, label: string): void => {
      const a = Math.max(0, yA)
      const b = Math.min(h, yB)
      if (b <= a) return
      g.save()
      g.beginPath()
      g.rect(kw, a, w - kw, b - a)
      g.clip()
      g.strokeStyle = 'rgba(239,68,68,.10)'
      g.lineWidth = 4
      for (let x = kw - (b - a) - 20; x < w + 20; x += 12) { g.beginPath(); g.moveTo(x, b); g.lineTo(x + (b - a), a); g.stroke() }
      g.restore()
      g.setLineDash([3, 3])
      g.strokeStyle = 'rgba(239,68,68,.35)'
      g.lineWidth = 1
      g.beginPath()
      if (yA >= 0) { g.moveTo(kw, yA + 0.5); g.lineTo(w, yA + 0.5) }
      if (yB <= h) { g.moveTo(kw, yB - 0.5); g.lineTo(w, yB - 0.5) }
      g.stroke()
      g.setLineDash([])
      const ly = yA >= 0 ? yA + 2 : yB - 16
      if (ly > -2 && ly < h - 12) {
        g.font = '10px Inter, system-ui, sans-serif'
        const tw = g.measureText(label).width
        g.fillStyle = 'rgba(20,20,27,.85)'
        g.beginPath(); g.roundRect(kw + 6, ly, tw + 12, 14, 4); g.fill()
        g.fillStyle = '#fca5a5'
        g.fillText(label, kw + 12, ly + 10.5)
      }
    }
    zone(yOf(HI), yOf(rhi), t('score.lane.tooHigh', { note: noteName(rhi, s.key) }))
    zone(yOf(rlo - 1), yOf(LO - 1), t('score.lane.tooLow', { note: noteName(rlo, s.key) }))
  }
  // notes
  const sel = ed.selection.value
  const active = ui.activeVoice === props.voice
  const muted = ui.solo.vocal || ui.solo.ins ? !ui.solo[props.voice] : ui.mute[props.voice]
  const grad = g.createLinearGradient(kw, 0, w, 0)
  grad.addColorStop(0, '#a855f7')
  grad.addColorStop(1, '#ec4899')
  const tickLo = tickAt(kw) - 1
  const tickHi = tickAt(w) + 1
  const pad = rowH >= 9 ? 1 : 0.5
  g.globalAlpha = muted ? 0.35 : active ? 1 : 0.75
  g.font = '600 9px Inter, system-ui, sans-serif'
  for (const n of notes.value) {
    if (n.start > tickHi) break
    if (n.start + n.dur < tickLo || n.pitch < pFirst || n.pitch > pLast) continue
    const x = xOf(n.start) + 1
    const y = yOf(n.pitch) + pad
    const nw = Math.max(3, n.dur * ppt - 2)
    const nh = rowH - pad * 2
    g.fillStyle = isVocal.value ? grad : '#2dd4bf'
    g.beginPath()
    g.roundRect(x, y, nw, nh, Math.min(3, nh / 3))
    g.fill()
    const oor = isVocal.value && (n.pitch < rlo || n.pitch > rhi)
    if (sel.has(n.id)) {
      g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.stroke()
    } else if (oor) {
      g.strokeStyle = '#ef4444'; g.lineWidth = 1.5; g.stroke()
    }
    if (rowH >= 12 && nw >= 22) {
      g.fillStyle = isVocal.value ? 'rgba(255,255,255,.92)' : '#063b36'
      g.fillText(noteName(n.pitch, s.key, false), x + 3, y + nh / 2 + 3)
    }
  }
  g.globalAlpha = 1
  // ghost note under the pencil
  const gh = ghost.value
  if (gh) {
    const x = xOf(gh.start) + 1
    const y = yOf(gh.pitch) + pad
    const gw = Math.max(3, gh.dur * ppt - 2)
    g.setLineDash([3, 2])
    g.strokeStyle = '#ffffff'
    g.lineWidth = 1.5
    g.fillStyle = 'rgba(255,255,255,.12)'
    g.beginPath(); g.roundRect(x, y, gw, rowH - pad * 2, 3); g.fill(); g.stroke()
    g.setLineDash([])
    const label = ui.dur ? `${noteName(gh.pitch, s.key)} · ${durLabel(gh.dur)}` : `${t('score.tools.rest')} · ${durLabel(gh.dur)}`
    g.font = '10.5px Inter, system-ui, sans-serif'
    const tw = g.measureText(label).width
    const lx = Math.min(w - tw - 16, Math.max(kw + 2, x - 4))
    const ly = y - 22 < 0 ? y + rowH + 4 : y - 22
    g.fillStyle = '#0b0b10'
    g.strokeStyle = '#3a3a48'
    g.lineWidth = 1
    g.beginPath(); g.roundRect(lx, ly, tw + 14, 18, 6); g.fill(); g.stroke()
    g.fillStyle = '#e4e4ec'
    g.fillText(label, lx + 7, ly + 12.5)
  }
  // marquee
  const m = marquee.value
  if (m) {
    g.fillStyle = 'rgba(168,85,247,.12)'
    g.strokeStyle = 'rgba(216,180,254,.8)'
    g.lineWidth = 1
    const x = Math.min(m.x0, m.x1)
    const y = Math.min(m.y0, m.y1)
    g.fillRect(x, y, Math.abs(m.x1 - m.x0), Math.abs(m.y1 - m.y0))
    g.strokeRect(x + 0.5, y + 0.5, Math.abs(m.x1 - m.x0), Math.abs(m.y1 - m.y0))
  }
  // where playback starts, and where it is
  const cx = xOf(ui.cursorTick)
  if (cx >= kw) { g.fillStyle = 'rgba(239,68,68,.45)'; g.fillRect(cx, 0, 1.5, h) }
  if (ui.playTick != null) {
    const px = xOf(ui.playTick)
    if (px >= kw) { g.fillStyle = '#ef4444'; g.fillRect(px - 1, 0, 2, h) }
  }

  // the keys
  g.fillStyle = '#1a1a22'
  g.fillRect(0, 0, kw, h)
  const hot = keyFlash.value ?? (ui.hover?.voice === props.voice ? ui.hover.pitch : null)
  for (let p = pFirst; p <= pLast; p++) {
    const y = yOf(p)
    const black = isBlackKey(p)
    const isHot = hot === p
    if (!black) {
      g.fillStyle = isHot ? '#e9b8ff' : '#d6d6e0'
      g.fillRect(0, y, kw - 1, rowH)
      g.fillStyle = 'rgba(0,0,0,.25)'
      g.fillRect(0, y + rowH - 0.5, kw - 1, 0.5)
    }
  }
  for (let p = pFirst; p <= pLast; p++) {
    if (!isBlackKey(p)) continue
    const y = yOf(p)
    g.fillStyle = hot === p ? '#a855f7' : '#24242e'
    g.fillRect(0, y, kw * 0.62, rowH)
  }
  for (let p = pFirst; p <= pLast; p++) {
    const y = yOf(p)
    if (isVocal.value && (p < rlo || p > rhi)) { g.fillStyle = 'rgba(239,68,68,.75)'; g.fillRect(0, y, 3, rowH) }
    if (p % 12 === 0 && rowH >= 7) {
      g.fillStyle = '#3a3a48'
      g.font = `600 ${Math.min(9, rowH - 1)}px Inter, system-ui, sans-serif`
      const label = `C${p / 12 - 1}`
      g.fillText(label, kw - g.measureText(label).width - 4, y + rowH - 2)
    }
  }
  g.fillStyle = '#22222c'
  g.fillRect(kw - 1, 0, 1, h)
}

watch(
  () => [ed.score.value, ed.selection.value, ui.ppt, ui.scrollX, top.value, ui.snapKey, ui.playTick, ui.cursorTick, ui.loopOn, ui.loop,
    ui.activeVoice, ui.mute[props.voice], ui.solo.vocal, ui.solo.ins, ui.rangePreset, ui.grid, ui.hover, props.height, props.rowH, width.value, collapsed.value],
  () => invalidate(),
)

let ro: ResizeObserver | null = null
onMounted(() => {
  if (wrap.value) {
    ro = new ResizeObserver(() => {
      width.value = Math.max(100, wrap.value?.clientWidth ?? 600)
      invalidate()
    })
    ro.observe(wrap.value)
  }
  if (ui.scrollY[props.voice] < 0) centre()
  invalidate()
})
onBeforeUnmount(() => ro?.disconnect())

// ---- the mouse ----
type Drag =
  | { mode: 'move'; base: Score; ids: string[]; anchor: Note; t0: number; p0: number; lastP: number; moved: boolean }
  | { mode: 'resize'; base: Score; id: string; start: number; moved: boolean }
  | { mode: 'resizeStart'; base: Score; id: string; end: number; moved: boolean }
  | { mode: 'draw'; base: Score; id: string; start: number; minDur: number; moved: boolean }
  | { mode: 'rest'; base: Score; start: number; moved: boolean }
  | { mode: 'erase'; moved: boolean }
  | { mode: 'marquee'; additive: Set<string>; moved: boolean; x0: number; y0: number }
let drag: Drag | null = null
/** The score and selection before the drag, for a cancelled pointer (the system took it: a touch scroll, a dialog). */
let dragOrigin: { score: Score; selection: Set<string> } | null = null

function local(e: PointerEvent | MouseEvent): { x: number; y: number } {
  const r = canvas.value!.getBoundingClientRect()
  return { x: e.clientX - r.left, y: e.clientY - r.top }
}
function flashKey(p: number): void {
  pianoKey(p)
  keyFlash.value = p
  invalidate()
  setTimeout(() => { if (keyFlash.value === p) { keyFlash.value = null; invalidate() } }, 180)
}
function pencilPitch(p: number, e: PointerEvent | MouseEvent): number {
  return ui.snapKey && !e.shiftKey ? snapToScale(p, ed.score.value.key) : p
}

function onDown(e: PointerEvent): void {
  if (e.button !== 0) return
  const { x, y } = local(e)
  ui.activeVoice = props.voice
  ;(e.currentTarget as HTMLElement).focus?.({ preventScroll: true })
  const pitch = pitchAt(y)
  if (x < props.keysW) {
    flashKey(pitch)
    emit('keyNote', pitch)
    return
  }
  if (ed.isEmpty.value) return
  const tick = Math.max(0, tickAt(x))
  const tool = e.altKey ? 'eraser' : ui.tool
  const hit = noteAt(tick, pitch)
  const s = ed.score.value
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  ghost.value = null
  dragOrigin = { score: s, selection: ed.selection.value }
  if (tool === 'eraser') {
    drag = { mode: 'erase', moved: false }
    if (hit) ed.preview(deleteNotes(ed.score.value, [hit.id]))
    return
  }
  if (tool === 'cut') {
    if (hit) {
      let at = snap(tick, ui.grid)
      if (at <= hit.start || at >= hit.start + hit.dur) at = Math.round(tick)
      if (at > hit.start && at < hit.start + hit.dur) {
        const r = splitNote(s, hit.id, at)
        ed.commit(r.score)
      }
    }
    return
  }
  if (hit && (tool === 'select' || tool === 'pencil')) {
    if (e.shiftKey && tool === 'select') { ed.toggleSelect(hit.id); return }
    if (!ed.selection.value.has(hit.id)) ed.select([hit.id])
    const xr = xOf(hit.start + hit.dur)
    const xl = xOf(hit.start)
    if (x >= xr - 6 && xr - xl > 10) drag = { mode: 'resize', base: s, id: hit.id, start: hit.start, moved: false }
    else if (tool === 'select' && x <= xl + 5 && xr - xl > 14) drag = { mode: 'resizeStart', base: s, id: hit.id, end: hit.start + hit.dur, moved: false }
    else drag = { mode: 'move', base: s, ids: [...ed.selection.value], anchor: hit, t0: tick, p0: pitch, lastP: pitch, moved: false }
    ui.dragging = true
    return
  }
  if (tool === 'pencil') {
    const start = snapDown(tick, ui.grid)
    if (ui.dur > 0) {
      const p = pencilPitch(pitch, e)
      const r = addNote(s, props.voice, p, start, ui.dur)
      ed.preview(r.score)
      ed.select(r.ids)
      drag = { mode: 'draw', base: r.score, id: r.ids[0], start, minDur: ui.dur, moved: false }
      pianoKey(p)
    } else {
      ed.preview(eraseRange(s, props.voice, start, start + ui.restDur))
      drag = { mode: 'rest', base: s, start, moved: false }
    }
    ui.dragging = true
    return
  }
  // select on empty space: a marquee, or a click that moves the playback cursor
  const additive = e.shiftKey ? new Set(ed.selection.value) : new Set<string>()
  if (!e.shiftKey) ed.clearSelection()
  drag = { mode: 'marquee', additive, moved: false, x0: x, y0: y }
}

function onMove(e: PointerEvent): void {
  const { x, y } = local(e)
  const tick = Math.max(0, tickAt(x))
  const pitch = pitchAt(y)
  if (x >= props.keysW) ui.hover = { voice: props.voice, tick, pitch }
  else ui.hover = { voice: props.voice, tick: ui.hover?.tick ?? 0, pitch }
  if (!drag) {
    const hit = x >= props.keysW ? noteAt(tick, pitch) : null
    const pencil = ui.tool === 'pencil' && !e.altKey
    ghost.value = pencil && !hit && x >= props.keysW && !ed.isEmpty.value
      ? { start: snapDown(tick, ui.grid), pitch: ui.dur ? pencilPitch(pitch, e) : pitch, dur: ui.dur || ui.restDur }
      : null
    const cv = canvas.value
    if (cv) {
      const xr = hit ? xOf(hit.start + hit.dur) : 0
      cv.style.cursor = x < props.keysW ? 'pointer'
        : ui.tool === 'pencil' && !hit ? 'crosshair'
        : ui.tool === 'eraser' || e.altKey ? 'cell'
        : ui.tool === 'cut' ? (hit ? 'col-resize' : 'default')
        : hit && x >= xr - 6 ? 'ew-resize' : hit ? 'grab' : 'default'
    }
    invalidate()
    return
  }
  drag.moved = true
  const d = drag
  if (d.mode === 'erase') {
    const hit = noteAt(tick, pitch)
    if (hit) ed.preview(deleteNotes(ed.score.value, [hit.id]))
  } else if (d.mode === 'move') {
    const newStart = Math.max(0, snap(d.anchor.start + (tick - d.t0), ui.grid))
    const dT = newStart - d.anchor.start
    const dP = pitch - d.p0
    ed.preview(moveNotes(d.base, d.ids, dT, dP))
    if (pitch !== d.lastP) { d.lastP = pitch; pianoKey(d.anchor.pitch + dP) }
  } else if (d.mode === 'resize') {
    const end = Math.max(d.start + Math.min(ui.grid, 2), snap(tick, ui.grid))
    ed.preview(resizeNote(d.base, d.id, end - d.start))
  } else if (d.mode === 'resizeStart') {
    const st = Math.min(d.end - 1, Math.max(0, snap(tick, ui.grid)))
    ed.preview(resizeNoteStart(d.base, d.id, st))
  } else if (d.mode === 'draw') {
    const end = Math.ceil(tick / ui.grid) * ui.grid
    ed.preview(resizeNote(d.base, d.id, Math.max(d.minDur, end - d.start)))
  } else if (d.mode === 'rest') {
    const end = Math.max(d.start + ui.restDur, Math.ceil(tick / ui.grid) * ui.grid)
    ed.preview(eraseRange(d.base, props.voice, d.start, end))
  } else if (d.mode === 'marquee') {
    marquee.value = { x0: d.x0, y0: d.y0, x1: x, y1: y }
    const ta = tickAt(Math.min(d.x0, x))
    const tb = tickAt(Math.max(d.x0, x))
    const pa = pitchAt(Math.max(d.y0, y))
    const pb = pitchAt(Math.min(d.y0, y))
    const ids = new Set(d.additive)
    for (const n of notes.value) {
      if (n.start > tb) break
      if (n.start + n.dur > ta && n.pitch >= pa && n.pitch <= pb) ids.add(n.id)
    }
    ed.selection.value = ids
    invalidate()
  }
}

function onCancel(): void {
  const d = drag
  const o = dragOrigin
  drag = null
  dragOrigin = null
  ui.dragging = false
  marquee.value = null
  if (!d || !o) return
  ed.preview(o.score)
  ed.selection.value = o.selection
  invalidate()
}
function onUp(e: PointerEvent): void {
  const d = drag
  drag = null
  dragOrigin = null
  ui.dragging = false
  marquee.value = null
  if (!d) return
  if (d.mode === 'marquee') {
    if (!d.moved) ed.seek(snapDown(Math.max(0, tickAt(local(e).x)), ui.grid))
    invalidate()
    return
  }
  ed.commit()
  invalidate()
}
function onLeave(): void {
  if (drag) return
  ghost.value = null
  ui.hover = null
  invalidate()
}

function onWheel(e: WheelEvent): void {
  if (e.ctrlKey || e.metaKey || e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return // the grid handles these
  const next = Math.max(0, Math.min(maxY.value, top.value + e.deltaY * 0.6))
  if (next === top.value) return // at the edge: let the page scroll
  e.preventDefault()
  e.stopPropagation()
  ui.scrollY[props.voice] = next
}

// ---- the header ----
const rangeText = computed(() => {
  const [lo, hi] = ed.vocalRange.value
  return `${noteName(lo, ed.score.value.key)}–${noteName(hi, ed.score.value.key)}`
})
function setPreset(p: 'male' | 'female'): void {
  ui.rangePreset = p
  ui.rangeTouched = true
}
function onHeaderName(): void {
  ui.activeVoice = props.voice
  if (!isVocal.value) ui.insCollapsed = !ui.insCollapsed
}
const laneLabel = computed(() => t(isVocal.value ? 'score.lane.vocal' : 'score.lane.ins'))
</script>

<template>
  <div class="flex">
    <!-- header: name, M/S, the range preset; a click makes this the voice the pencil writes into -->
    <div
      class="relative flex shrink-0 flex-col gap-1 border-e border-border bg-panel py-1.5 pe-1.5 ps-2.5"
      :style="{ width: `${headerW}px`, height: collapsed ? '30px' : `${height}px` }"
      @pointerdown="ui.activeVoice = voice"
    >
      <span class="absolute inset-y-0 start-0 w-[3px]" :style="{ background: isVocal ? 'linear-gradient(180deg,#a855f7,#ec4899)' : '#2dd4bf' }" aria-hidden="true"></span>
      <button
        type="button" class="flex min-w-0 items-center gap-1 text-start text-[12px] font-semibold"
        :class="ui.activeVoice === voice ? 'text-text' : 'text-text-dim'"
        :aria-pressed="ui.activeVoice === voice" :title="t('score.lane.activeHint')"
        @click="onHeaderName"
      >
        <ScoreIcon v-if="!isVocal" :name="ui.insCollapsed ? 'right' : 'down'" class="h-3 w-3 shrink-0 text-text-dim" />
        <span class="truncate">{{ laneLabel }}</span>
      </button>
      <template v-if="!collapsed">
        <span v-if="!compact" class="text-[10.5px] leading-snug text-[#8a8a9c]">{{ isVocal ? t('score.lane.vocalSub') : t('score.lane.insSub') }}<template v-if="isVocal"><br />{{ rangeText }}</template></span>
        <div class="flex flex-wrap gap-[3px]">
          <button
            type="button" class="h-5 w-[22px] rounded-[5px] border text-[10.5px] font-bold"
            :class="ui.mute[voice] ? 'border-[#eab308] bg-[#eab308] text-[#111]' : 'border-border text-text-dim'"
            :aria-pressed="ui.mute[voice]" :title="t('score.lane.mute')" :aria-label="`${t('score.lane.mute')}: ${laneLabel}`"
            @click="ui.mute[voice] = !ui.mute[voice]"
          >M</button>
          <button
            type="button" class="h-5 w-[22px] rounded-[5px] border text-[10.5px] font-bold"
            :class="ui.solo[voice] ? 'border-[#38bdf8] bg-[#38bdf8] text-[#111]' : 'border-border text-text-dim'"
            :aria-pressed="ui.solo[voice]" :title="t('score.lane.solo')" :aria-label="`${t('score.lane.solo')}: ${laneLabel}`"
            @click="ui.solo[voice] = !ui.solo[voice]"
          >S</button>
        </div>
        <!-- the singer's range: a select of its own, apart from M/S -->
        <div v-if="isVocal" class="relative min-w-0">
          <select
            :value="ui.rangePreset" class="h-5 w-full min-w-0 cursor-pointer appearance-none truncate rounded-md border border-border bg-panel-2 pe-3 ps-1 text-[10px] text-text-dim hover:text-text"
            :aria-label="t('score.lane.rangePreset')" :title="`${t('score.lane.rangePreset')}: ${rangeText}`"
            @change="setPreset(($event.target as HTMLSelectElement).value as 'male' | 'female')"
          >
            <option v-for="p in (['male', 'female'] as const)" :key="p" :value="p" class="bg-panel">{{ t(`score.lane.${p}Abbr`) }}</option>
          </select>
          <ScoreIcon name="down" class="pointer-events-none absolute end-0.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-text-dim" />
        </div>
      </template>
    </div>
    <div ref="wrap" class="relative min-w-0 flex-1" :style="{ height: collapsed ? '30px' : `${height}px` }">
      <button
        v-if="collapsed" type="button" class="flex h-full w-full items-center ps-3 text-[11px] text-text-dim hover:text-text"
        @click="ui.insCollapsed = false"
      >{{ t('score.lane.collapsedNote', { n: notes.length }) }}</button>
      <canvas
        v-else ref="canvas" class="block touch-none" tabindex="-1"
        :aria-label="t('score.lane.canvasLabel', { voice: laneLabel })"
        @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="onCancel" @pointerleave="onLeave" @wheel="onWheel"
      ></canvas>
    </div>
  </div>
</template>
