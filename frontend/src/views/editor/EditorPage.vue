<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useEditorStore } from '../../stores/editor'
import { useAiPartsStore } from '../../stores/aiParts'
import { useTimelineEngine } from '../../composables/useTimelineEngine'
import { getSharedAudioCtx } from '../../composables/audioPlayback'
import { decodeStem, defaultMasterSettings, defaultChannelSettings } from '../../audio/mixerEngine'
import type { ChannelSettings } from '../../audio/mixerEngine'
import { clipDuration, stretchFactor } from '../../audio/timelineTypes'
import type { Clip } from '../../audio/timelineTypes'
import { encodeWav } from '../../audio/wavEncoder'
import { encodeMp3 } from '../../audio/mp3Encoder'
import { exportForDaw } from '../../utils/dawExport'
import { timeStretchBuffer } from '../../audio/timeStretchEngine'
import { TRACK_COLORS } from '../../utils/trackColors'
import { detectBpm } from '../../audio/bpmDetector'
import * as tracksApi from '../../api/tracks'
import ChannelStrip from '../../components/shared/ChannelStrip.vue'
import TimelineLane from '../../components/editor/TimelineLane.vue'
import LibraryPicker from '../../components/editor/LibraryPicker.vue'
import EditorHelpModal from '../../components/editor/EditorHelpModal.vue'
import AiPartPanel from '../../components/editor/AiPartPanel.vue'
import * as stemsApi from '../../api/stems'
import AiArrangerGuide from '../../components/editor/AiArrangerGuide.vue'
import EditorHotkeysModal from '../../components/editor/EditorHotkeysModal.vue'
import KeyboardIcon from '../../components/shared/icons/KeyboardIcon.vue'
import DockHandle from '../../components/editor/DockHandle.vue'
import { dockAt, loadDocks, RIGHT_ZONE_START, saveDocks } from '../../utils/dock'
import type { DockPanel, DockSide } from '../../utils/dock'
import PlayIcon from '../../components/shared/icons/PlayIcon.vue'
import PauseIcon from '../../components/shared/icons/PauseIcon.vue'
import ExportIcon from '../../components/shared/icons/ExportIcon.vue'
import FitIcon from '../../components/shared/icons/FitIcon.vue'
import LoopIcon from '../../components/shared/icons/LoopIcon.vue'
import MagnetIcon from '../../components/shared/icons/MagnetIcon.vue'
import MixerIcon from '../../components/shared/icons/MixerIcon.vue'
import PlusIcon from '../../components/shared/icons/PlusIcon.vue'
import RedoIcon from '../../components/shared/icons/RedoIcon.vue'
import SaveIcon from '../../components/shared/icons/SaveIcon.vue'
import SparklesIcon from '../../components/shared/icons/SparklesIcon.vue'
import UndoIcon from '../../components/shared/icons/UndoIcon.vue'

const props = defineProps<{ id: string }>()

const store = useEditorStore()
const aiParts = useAiPartsStore()
const engine = useTimelineEngine()
const router = useRouter()
const { t } = useI18n()

const buffers = ref<Map<string, AudioBuffer>>(new Map())
const loadingAudio = ref(true)
const pickerOpenForNewLane = ref(false)
const exportFormat = ref<'wav' | 'mp3' | 'stems' | 'dawproject'>('wav')
/** Stem export progress ("3/7"), shown on the export button. */
const exportProgress = ref('')
/** Which success note to show after an export. */
const exportedKind = ref<'mix' | 'daw'>('mix')
const exporting = ref(false)
const exportError = ref<string | null>(null)
const exportedOk = ref(false)
const showHelpModal = ref(false)
const showArrangerGuide = ref(false)
const showHotkeys = ref(false)
/** The AI part panel stays mounted once opened, so its jobs keep landing on lanes while it is hidden. */
const showAiPanel = ref(false)
const aiPanelMounted = ref(false)
/** The mixer under the timeline folds away to give the tracks the height; remembered in this browser. */
const MIXER_KEY = 'remiqora_editor_mixer'
function readMixerOpen(): boolean {
  try {
    return localStorage.getItem(MIXER_KEY) !== 'closed'
  } catch {
    return true
  }
}
const mixerOpen = ref(readMixerOpen())
watch(mixerOpen, (open) => {
  try {
    localStorage.setItem(MIXER_KEY, open ? 'open' : 'closed')
  } catch {
    // storage blocked: the choice just is not remembered
  }
})

// ---- Splitting a lane into stems (Demucs) ----
// A lane whose clips all play one whole library track can be split: Demucs runs for that track (or its stems
// already exist), then the lane becomes four stem lanes with the same clips (editor store splitLaneIntoStems).
type LaneSplit = { trackId: number; status: 'queued' | 'running' | 'failed'; error: string | null }
const splits = reactive<Record<string, LaneSplit>>({})
const TRACK_AUDIO_URL = /^\/api\/tracks\/(\d+)\/audio$/
const STEM_LANES = [
  { name: 'vocals', colorId: 'pink' },
  { name: 'drums', colorId: 'orange' },
  { name: 'bass', colorId: 'blue' },
  { name: 'other', colorId: 'purple' },
] as const
const STEM_POLL_MS = 2000

/** The library track a lane plays as a whole, or null (stems, mixed sources, MIDI, empty lanes cannot be split). */
function splittableTrackId(lane: { clips: Clip[] }): number | null {
  const first = lane.clips[0]
  if (!first?.sourceUrl || lane.clips.some((c) => c.sourceUrl !== first.sourceUrl || c.type === 'midi')) return null
  const m = TRACK_AUDIO_URL.exec(first.sourceUrl)
  return m ? Number(m[1]) : null
}

async function splitLane(laneId: string): Promise<void> {
  const lane = store.project.lanes.find((l) => l.id === laneId)
  const trackId = lane ? splittableTrackId(lane) : null
  if (!lane || trackId == null || (splits[laneId] && splits[laneId].status !== 'failed')) return
  const sourceUrl = lane.clips[0].sourceUrl as string
  splits[laneId] = { trackId, status: 'queued', error: null }
  // The reactive proxy, not the object written: that is what splits[laneId] gives back for the comparison below.
  const state = splits[laneId]
  const stillWanted = () => splits[laneId] === state
  try {
    // Stems made earlier (also before a backend restart, when only the DB knows them) are used as they are;
    // Demucs runs only when there are none and no run is in flight.
    let s = await stemsApi.getSeparationStatus(trackId)
    if (s.status !== 'done' && s.status !== 'queued' && s.status !== 'running') s = await stemsApi.startSeparation(trackId)
    while (s.status === 'queued' || s.status === 'running') {
      if (!stillWanted()) return
      state.status = s.status
      await new Promise((r) => setTimeout(r, STEM_POLL_MS))
      s = await stemsApi.getSeparationStatus(trackId)
    }
    if (!stillWanted()) return
    // POST answers without the stem URLs; the status call carries them.
    if (s.status === 'done' && !s.stems) s = await stemsApi.getSeparationStatus(trackId)
    const urls = s.stems
    if (s.status !== 'done' || !urls) throw new Error(s.error || t('timeline.splitFailed'))
    const stems = STEM_LANES.filter((x) => urls[x.name]).map((x) => ({ label: t(`library.stems.${x.name}`), url: urls[x.name], colorId: x.colorId }))
    // Decoded first, so the new lanes appear with their waveforms at once.
    await Promise.all(stems.map(async (x) => {
      if (!buffers.value.has(x.url)) buffers.value.set(x.url, await decodeStem(x.url))
    }))
    if (!stillWanted()) return
    store.splitLaneIntoStems(laneId, sourceUrl, stems)
    delete splits[laneId]
  } catch (e) {
    if (!stillWanted()) return
    state.status = 'failed'
    state.error = e instanceof Error ? e.message : String(e)
  }
}

/** Cancels a running split (Demucs too), or dismisses a failed one. */
async function cancelSplit(laneId: string): Promise<void> {
  const state = splits[laneId]
  if (!state) return
  delete splits[laneId]
  if (state.status !== 'failed') {
    try {
      await stemsApi.cancelSeparation(state.trackId)
    } catch {
      // already finished: the result is simply not used
    }
  }
}

// ---- Docking: the AI arranger and the mixer sit above, beside or under the timeline ----
// Each panel is teleported into its dock target (#editor-dock-top / -right / -bottom), so moving it keeps its state.
const docks = reactive(loadDocks())
watch(docks, (d) => saveDocks(d), { deep: true })
/** A column beside the timeline needs width: below lg a panel docked right goes under the timeline. */
const wideScreen = ref(true)
let wideQuery: MediaQueryList | null = null
function onWideChange(): void {
  wideScreen.value = !!wideQuery?.matches
}
function placeOf(panel: DockPanel): DockSide {
  return docks[panel] === 'right' && !wideScreen.value ? 'bottom' : docks[panel]
}
const rightDockUsed = computed(() =>
  (aiPanelMounted.value && showAiPanel.value && placeOf('ai') === 'right') || (mixerOpen.value && placeOf('mixer') === 'right'),
)

const workAreaEl = ref<HTMLElement | null>(null)
const draggingPanel = ref<DockPanel | null>(null)
const dropSide = ref<DockSide | null>(null)
/** The zones drawn while a panel is dragged; they match dockAt. */
const DROP_ZONES: { side: DockSide; style: Record<string, string> }[] = [
  { side: 'top', style: { left: '0', top: '0', width: `calc(${RIGHT_ZONE_START * 100}% - 6px)`, height: 'calc(50% - 4px)' } },
  { side: 'bottom', style: { left: '0', bottom: '0', width: `calc(${RIGHT_ZONE_START * 100}% - 6px)`, height: 'calc(50% - 4px)' } },
  { side: 'right', style: { right: '0', top: '0', width: `${(1 - RIGHT_ZONE_START) * 100}%`, height: '100%' } },
]
function sideUnder(e: PointerEvent): DockSide | null {
  return workAreaEl.value ? dockAt(workAreaEl.value.getBoundingClientRect(), e.clientX, e.clientY) : null
}
function onDockDragStart(panel: DockPanel, e: PointerEvent): void {
  draggingPanel.value = panel
  dropSide.value = sideUnder(e)
  document.body.style.cursor = 'grabbing'
  window.addEventListener('pointermove', onDockDragMove)
  window.addEventListener('pointerup', onDockDrop)
  window.addEventListener('keydown', onDockDragKey)
}
function onDockDragMove(e: PointerEvent): void {
  dropSide.value = sideUnder(e)
}
function onDockDrop(): void {
  if (draggingPanel.value && dropSide.value) docks[draggingPanel.value] = dropSide.value
  endDockDrag()
}
function onDockDragKey(e: KeyboardEvent): void {
  if (e.key === 'Escape') endDockDrag()
}
function endDockDrag(): void {
  draggingPanel.value = null
  dropSide.value = null
  document.body.style.cursor = ''
  window.removeEventListener('pointermove', onDockDragMove)
  window.removeEventListener('pointerup', onDockDrop)
  window.removeEventListener('keydown', onDockDragKey)
}
onMounted(() => {
  wideQuery = window.matchMedia('(min-width: 1024px)')
  onWideChange()
  wideQuery.addEventListener('change', onWideChange)
})
onBeforeUnmount(() => {
  wideQuery?.removeEventListener('change', onWideChange)
  endDockDrag()
})

const laneLevels = ref<{ peak: number; clipping: boolean; peakL: number; peakR: number }[]>([])
/** The level of a lane the meters have not measured yet: on load, and for lanes added since playback stopped. */
const SILENT_LEVEL = Object.freeze({ peak: 0, clipping: false, peakL: 0, peakR: 0 })
const masterLevel = ref<{ peak: number; clipping: boolean; peakL: number; peakR: number }>({ peak: 0, clipping: false, peakL: 0, peakR: 0 })

const timelineScrollEl = ref<HTMLElement | null>(null)

let rafId: number | null = null
let playStartCtxTime = 0
let playStartOffset = 0
/** While looping: context time the current pass ends (the next one is already queued there). */
let passEndCtxTime: number | null = null

/** The enabled loop region, if playback at `sec` runs inside it (i.e. before its end). */
function activeLoop(sec: number): { start: number; end: number } | null {
  const r = store.project.loopRegion
  return r?.enabled && r.end > r.start && sec < r.end ? r : null
}

function stopTicking(): void {
  if (rafId != null) cancelAnimationFrame(rafId)
  rafId = null
  laneLevels.value = store.project.lanes.map(() => ({ peak: 0, clipping: false, peakL: 0, peakR: 0 }))
  masterLevel.value = { peak: 0, clipping: false, peakL: 0, peakR: 0 }
}
function tick(): void {
  const ctx = getSharedAudioCtx()
  const prevSec = store.playheadSec
  const loop = store.project.loopRegion
  // Loop wrap: the next pass was scheduled to start exactly when this one ends,
  // so the clock just moves its reference to the loop start.
  if (passEndCtxTime != null && loop && ctx.currentTime >= passEndCtxTime) {
    const len = loop.end - loop.start
    if (ctx.currentTime >= passEndCtxTime + len) {
      // Stalled (hidden tab) past the queued pass too: start over from the loop start.
      seek(loop.start)
      rafId = requestAnimationFrame(tick)
      return
    }
    playStartOffset = loop.start
    playStartCtxTime = passEndCtxTime
    passEndCtxTime += len
    engine.queuePass(store.project, buffers.value, loop.start, loop.end, passEndCtxTime)
  }
  // Held at the start position until the scheduled audio actually begins.
  const currentTime = Math.max(playStartOffset, ctx.currentTime - playStartCtxTime + playStartOffset)

  // The transport ends at the project end even when no source is scheduled to
  // fire onended (empty project, playing past the last clip, every clip muted).
  // A loop that runs past the project end plays on to the loop end.
  if (currentTime >= store.totalDuration && !activeLoop(currentTime)) {
    engine.stop()
    onEnded()
    return
  }

  store.playheadSec = currentTime
  followPlayhead(prevSec)
  laneLevels.value = store.project.lanes.map((_, i) => engine.getLaneLevel(i))
  masterLevel.value = engine.getMasterLevel()
  rafId = requestAnimationFrame(tick)
}
function startTicking(): void {
  stopTicking()
  rafId = requestAnimationFrame(tick)
}

function onEnded(): void {
  store.playing = false
  store.playheadSec = store.totalDuration
  stopTicking()
}

/** (Re)starts the engine at `from` and pins the transport clock to the time the audio starts. */
async function startEngine(from: number): Promise<void> {
  playStartOffset = from
  playStartCtxTime = Infinity // tick holds the playhead at `from` until the engine answers
  passEndCtxTime = null
  const loop = activeLoop(from)
  // No end callback: the last *scheduled* clip can end before the project does
  // (a later clip muted or not soloed), so tick() alone decides the end.
  const startAt = await engine.play(store.project, buffers.value, from, () => {}, loop?.end)
  if (startAt == null) return
  playStartCtxTime = startAt
  if (loop) {
    passEndCtxTime = startAt + (loop.end - from)
    engine.queuePass(store.project, buffers.value, loop.start, loop.end, passEndCtxTime)
  }
}

async function play(): Promise<void> {
  if (store.playing) return
  const from = store.playheadSec >= store.totalDuration && !activeLoop(store.playheadSec) ? 0 : store.playheadSec
  store.playing = true
  await startEngine(from)
  if (store.playing) startTicking()
}

function pause(): void {
  engine.stop()
  store.playing = false
  stopTicking()
}

function seek(value: number): void {
  store.playheadSec = value
  if (store.playing) void startEngine(value)
}

/** "Listen" on an AI part variant: play from the start of the range it was generated for. */
function playFrom(sec: number): void {
  seek(sec)
  if (!store.playing) void play()
}

function toggleAiPanel(): void {
  aiPanelMounted.value = true
  showAiPanel.value = !showAiPanel.value
}

let loopDragMode: 'start' | 'end' | 'move' | null = null
let loopDragStartX = 0
let loopDragStartVal = 0
let loopDragStartKey = ''

function loopKey(): string {
  const r = store.project.loopRegion
  return r ? `${r.enabled}:${r.start}:${r.end}` : ''
}

// Loop passes are scheduled ahead, so a loop change during playback reschedules.
// A drag reschedules once on release: rescheduling on every pointermove would
// keep restarting the audio before it can start.
watch(loopKey, () => {
  if (store.playing && !loopDragMode) seek(store.playheadSec)
})

function onLoopPointerDown(mode: 'start' | 'end' | 'move', evt: PointerEvent) {
  evt.stopPropagation()
  if (!store.project.loopRegion) return
  loopDragMode = mode
  loopDragStartKey = loopKey()
  loopDragStartX = evt.clientX
  if (mode === 'start') loopDragStartVal = store.project.loopRegion.start
  if (mode === 'end') loopDragStartVal = store.project.loopRegion.end
  if (mode === 'move') loopDragStartVal = store.project.loopRegion.start
  
  window.addEventListener('pointermove', onLoopPointerMove)
  window.addEventListener('pointerup', onLoopPointerUp)
}

function onLoopPointerMove(evt: PointerEvent) {
  if (!loopDragMode || !store.project.loopRegion) return
  const deltaX = evt.clientX - loopDragStartX
  const deltaSec = deltaX / store.project.pxPerSecond
  
  let newVal = Math.max(0, loopDragStartVal + deltaSec)
  
  if (loopDragMode === 'start') {
    store.setLoopRegion(Math.min(newVal, store.project.loopRegion.end - 0.1), store.project.loopRegion.end)
  } else if (loopDragMode === 'end') {
    store.setLoopRegion(store.project.loopRegion.start, Math.max(store.project.loopRegion.start + 0.1, newVal))
  } else if (loopDragMode === 'move') {
    const duration = store.project.loopRegion.end - store.project.loopRegion.start
    store.setLoopRegion(newVal, newVal + duration)
  }
}

/** Keyboard counterpart of dragging a loop edge: arrows move it by the grid step (snapped when snapping is on), Alt = 0.01 s, Shift = 4x. */
function onLoopKeydown(edge: 'start' | 'end', e: KeyboardEvent) {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
  if (e.ctrlKey || e.metaKey) return
  const r = store.project.loopRegion
  if (!r) return
  e.preventDefault()
  e.stopPropagation()
  const dir = e.key === 'ArrowLeft' ? -1 : 1
  const grid = gridStepSec.value
  const snapped = store.project.snapEnabled && !e.altKey
  const step = (e.altKey ? 0.01 : grid) * (e.shiftKey ? 4 : 1)
  let value = (edge === 'start' ? r.start : r.end) + dir * step
  if (snapped) value = Math.round(value / grid) * grid
  if (edge === 'start') store.setLoopRegion(Math.min(Math.max(0, value), r.end - 0.1), r.end)
  else store.setLoopRegion(r.start, Math.max(r.start + 0.1, value))
  store.snapshot()
}

function onLoopPointerUp() {
  loopDragMode = null
  window.removeEventListener('pointermove', onLoopPointerMove)
  window.removeEventListener('pointerup', onLoopPointerUp)
  if (store.playing && loopKey() !== loopDragStartKey) seek(store.playheadSec)
  store.snapshot()
}

const timelineWidthPx = computed(() => Math.max(400, (store.totalDuration + 10) * store.project.pxPerSecond))

const rulerMarks = computed<number[]>(() => {
  const step = store.project.pxPerSecond < 20 ? 10 : store.project.pxPerSecond < 60 ? 5 : 1
  const maxT = timelineWidthPx.value / store.project.pxPerSecond
  const marks: number[] = []
  for (let t = 0; t <= maxT; t += step) marks.push(t)
  return marks
})

const selectedLane = computed(() => {
  if (store.selectedLaneId) {
    return store.project.lanes.find(l => l.id === store.selectedLaneId)
  }
  if (store.selectedClipId) {
    return store.project.lanes.find(l => l.clips.some(c => c.id === store.selectedClipId))
  }
  return null
})

const selectedLaneLevel = computed(() => {
  if (!selectedLane.value) return { peak: 0, clipping: false }
  const idx = store.project.lanes.findIndex(l => l.id === selectedLane.value!.id)
  return laneLevels.value[idx] || { peak: 0, clipping: false }
})

const gridStepSec = computed(() => {
  const bpm = store.project.bpm || 120
  const beatSec = 60 / bpm
  const beatPx = beatSec * store.project.pxPerSecond
  if (beatPx >= 80) return beatSec / 4 // 1/16 note
  if (beatPx >= 40) return beatSec / 2 // 1/8 note
  if (beatPx >= 20) return beatSec     // 1/4 note
  return beatSec * 4                   // 1 bar (4/4 time)
})

// Track header (w-56) plus the ml-3 gap before time 0 on the ruler and lanes.
const TIMELINE_ORIGIN_PX = 236

/** Scrolls the timeline so the playhead is on screen, a third of the way in. */
function revealPlayhead(): void {
  const el = timelineScrollEl.value
  if (!el) return
  const x = TIMELINE_ORIGIN_PX + store.playheadSec * store.project.pxPerSecond
  const viewStart = el.scrollLeft + TIMELINE_ORIGIN_PX
  const viewEnd = el.scrollLeft + el.clientWidth
  if (x < viewStart + 16 || x > viewEnd - 16) {
    el.scrollLeft = Math.max(0, x - TIMELINE_ORIGIN_PX - (el.clientWidth - TIMELINE_ORIGIN_PX) / 3)
  }
}

/** During playback: when the playhead leaves the view, turn the page so it
 * is back near the left edge. Only if it was on screen a frame ago, so
 * scrolling away to look at another part of the song is not undone. Paging
 * (rather than scrolling every frame) keeps repaints to one per screen. */
function followPlayhead(prevSec: number): void {
  const el = timelineScrollEl.value
  if (!el) return
  const pps = store.project.pxPerSecond
  const viewStart = el.scrollLeft
  const viewEnd = el.scrollLeft + el.clientWidth - TIMELINE_ORIGIN_PX
  const inView = (x: number) => x >= viewStart && x <= viewEnd
  const x = store.playheadSec * pps
  if (inView(prevSec * pps) && !inView(x)) el.scrollLeft = Math.max(0, x - 24)
}

/** Zooms by `factor` keeping the playhead at the same place on screen. */
function zoomAroundPlayhead(factor: number): void {
  const el = timelineScrollEl.value
  const screenX = store.playheadSec * store.project.pxPerSecond - (el?.scrollLeft ?? 0)
  store.setZoom(store.project.pxPerSecond * factor)
  void nextTick(() => {
    if (!el) return
    el.scrollLeft = Math.max(0, store.playheadSec * store.project.pxPerSecond - screenX)
    revealPlayhead()
  })
}

function onRulerClick(evt: MouseEvent): void {
  const rect = (evt.currentTarget as HTMLElement).getBoundingClientRect()
  const x = evt.clientX - rect.left
  seek(Math.max(0, x / store.project.pxPerSecond))
}

const snapCandidates = computed<number[]>(() => {
  const edges = [0]
  for (const lane of store.project.lanes) {
    for (const clip of lane.clips) {
      edges.push(clip.timelineStart, clip.timelineStart + clipDuration(clip, store.project.bpm))
    }
  }
  return edges
})

const masterAsChannel = computed<ChannelSettings>({
  get: () => ({ ...store.project.master, pan: 0, muted: false, solo: false }),
  set: (v) => {
    const { pan: _pan, muted: _muted, solo: _solo, ...rest } = v
    // Live value; the strip's commit event records the undo step on release.
    store.updateMasterSettings(rest, false)
  },
})

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function onAddLaneClick(): void {
  pickerOpenForNewLane.value = true
}

async function onPickForNewLane(payload: { sourceUrl: string; sourceLabel: string; asStems?: boolean }): Promise<void> {
  pickerOpenForNewLane.value = false
  let buffer = buffers.value.get(payload.sourceUrl)
  if (!buffer) {
    try {
      buffer = await decodeStem(payload.sourceUrl)
    } catch (e) {
      // The library entry's file is gone or does not decode: say so instead
      // of the click silently doing nothing.
      store.error = e instanceof Error ? e.message : String(e)
      return
    }
    buffers.value.set(payload.sourceUrl, buffer)
  }
  store.error = null
  const lane = store.addLane()
  store.renameLane(lane.id, payload.sourceLabel)

  // Auto-detect BPM
  const detectedBpm = await detectBpm(buffer)

  const clip: Clip = {
    id: crypto.randomUUID(),
    sourceUrl: payload.sourceUrl,
    sourceLabel: payload.sourceLabel,
    timelineStart: 0,
    trimStart: 0,
    trimEnd: buffer.duration,
    originalBpm: detectedBpm || store.project.bpm || 120,
  }
  store.addClip(lane.id, clip)
  // "As stems": the same split as the lane's own button (instant when the stems exist, Demucs otherwise).
  if (payload.asStems) void splitLane(lane.id)
}

let unmounted = false
// Set when Save on a new project is about to rewrite the URL from /editor/new
// to /editor/<id>: that is the same project, so the id watcher must not reload
// it (which would re-decode every source and wipe the undo history). Holds the
// id so it can only skip that exact route, and only while the store still has
// that project.
let skipIdLoad: string | null = null

async function doSave(): Promise<void> {
  const wasNew = store.projectId == null
  const ok = await store.save()
  if (ok) {
    // AI variants thrown away before this save are no longer reachable by undo from a saved state.
    const used = new Set(store.project.lanes.flatMap((l) => l.clips.map((c) => c.sourceUrl).filter((u): u is string => !!u)))
    void aiParts.purgeDiscarded(used)
  }
  // save() returns false when another project was opened meanwhile; the route
  // check covers a navigation that has started but not loaded yet.
  if (ok && wasNew && store.projectId != null && props.id === 'new' && !unmounted) {
    skipIdLoad = String(store.projectId)
    await router.replace(`/editor/${store.projectId}`)
  }
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function doExport(): Promise<void> {
  exporting.value = true
  exportError.value = null
  exportedOk.value = false
  try {
    const fmt = exportFormat.value
    if (fmt === 'stems' || fmt === 'dawproject') {
      const out = await exportForDaw(fmt, store.project, buffers.value, engine.render, store.projectName,
        (bpm, files) => t('editor.dawReadme', { name: store.projectName, bpm, files: files.join('\n') }),
        (done, total) => { exportProgress.value = `${done}/${total}` })
      downloadBlob(out.blob, out.fileName)
      exportedKind.value = 'daw'
      exportedOk.value = true
      return
    }
    const rendered = await engine.render(store.project, buffers.value, store.totalDuration)
    const blob = fmt === 'wav' ? encodeWav(rendered) : encodeMp3(rendered)
    downloadBlob(blob, `${store.projectName || 'mix'}.${fmt}`)

    await tracksApi.saveTrack(
      { model: 'editor', title: store.projectName, lyrics: '', params: { project_export: true, project_id: store.projectId } },
      blob,
      fmt,
    )
    exportedKind.value = 'mix'
    exportedOk.value = true
  } catch (e) {
    exportError.value = e instanceof Error ? e.message : String(e)
  } finally {
    exporting.value = false
    exportProgress.value = ''
  }
}

// Only the most recent load() may write buffers or clear the loading state
// (same idea as seekToken in useTimelineEngine).
let loadToken = 0

async function load(): Promise<void> {
  const token = ++loadToken
  pause()
  engine.teardown()
  loadingAudio.value = true
  try {
    if (props.id === 'new') {
      store.newProject()
    } else {
      await store.loadProject(Number(props.id))
      if (token !== loadToken) return
      // The fetch failed: store.error is shown above the editor. Whatever
      // project was in the store before stays as it was (undecoded, so it does
      // not play); do not treat it as the project this URL asked for.
      if (store.error) return
    }
    const decoded = await engine.decodeAll(store.project)
    if (token !== loadToken) return
    buffers.value = decoded
    engine.ensureGraph(store.project.lanes.map((l) => l.id))
    engine.applySettings(store.project)
  } catch (e) {
    if (token === loadToken) store.error = e instanceof Error ? e.message : String(e)
  } finally {
    if (token === loadToken) loadingAudio.value = false
  }
}

async function onDropAudio(laneId: string, payload: { file: File; timelineStart: number }): Promise<void> {
  try {
    const uploaded = await tracksApi.uploadTrack(payload.file)
    let buffer = buffers.value.get(uploaded.audio_url)
    if (!buffer) {
      buffer = await decodeStem(uploaded.audio_url)
      buffers.value.set(uploaded.audio_url, buffer)
    }

    // Auto-detect BPM
    const detectedBpm = await detectBpm(buffer)

    const clip: Clip = {
      id: crypto.randomUUID(),
      type: 'audio',
      sourceUrl: uploaded.audio_url,
      sourceLabel: uploaded.title || payload.file.name,
      timelineStart: payload.timelineStart,
      trimStart: 0,
      trimEnd: buffer.duration,
      originalBpm: detectedBpm || store.project.bpm || 120,
    }
    const isFirstClip = store.totalDuration === 0
    store.error = null
    store.addClip(laneId, clip)
    
    if (isFirstClip) {
      setTimeout(fitZoom, 50)
    }
  } catch (e) {
    store.error = e instanceof Error ? e.message : String(e)
  }
}

function onToggleWarp(laneId: string, payload: { clipId: string; enabled: boolean }): void {
  const lane = store.project.lanes.find((l) => l.id === laneId)
  if (!lane) return
  const clip = lane.clips.find((c) => c.id === payload.clipId)
  if (!clip) return
  
  if (payload.enabled && !clip.originalBpm) {
    clip.originalBpm = 120
  }
  clip.warpEnabled = payload.enabled
  store.snapshot()
}

function onToggleMute(laneId: string, payload: { clipId: string; enabled: boolean }): void {
  const lane = store.project.lanes.find((l) => l.id === laneId)
  if (!lane) return
  const clip = lane.clips.find((c) => c.id === payload.clipId)
  if (!clip) return
  clip.muted = payload.enabled
  store.snapshot()
  if (store.playing) seek(store.playheadSec) // reschedule without the clip, same transport clock
}

function onToggleSolo(laneId: string, payload: { clipId: string; enabled: boolean }): void {
  const lane = store.project.lanes.find((l) => l.id === laneId)
  if (!lane) return
  const clip = lane.clips.find((c) => c.id === payload.clipId)
  if (!clip) return
  clip.solo = payload.enabled
  store.snapshot()
  if (store.playing) seek(store.playheadSec)
}

watch(
  () => props.id,
  () => {
    const skip = skipIdLoad
    skipIdLoad = null
    if (skip != null && props.id === skip && store.projectId === Number(skip)) return
    void load()
  },
  { immediate: true },
)

watch(
  () => store.project,
  async () => {
    engine.ensureGraph(store.project.lanes.map((l) => l.id))
    engine.applySettings(store.project)
    
    for (const lane of store.project.lanes) {
      for (const clip of lane.clips) {
        if (!clip.sourceUrl) continue
        
        if (!buffers.value.has(clip.sourceUrl)) {
          try {
            const buf = await decodeStem(clip.sourceUrl)
            buffers.value.set(clip.sourceUrl, buf)
          } catch {}
        }
        
        if (clip.warpEnabled && clip.originalBpm) {
          const bpm = store.project.bpm || 120
          if (clip.originalBpm !== bpm) {
            const key = `${clip.sourceUrl}_warp_${clip.originalBpm}_${bpm}`
            if (!buffers.value.has(key)) {
              const baseBuf = buffers.value.get(clip.sourceUrl)
              if (baseBuf) {
                try {
                  const tempoFactor = bpm / clip.originalBpm
                  const stretched = await timeStretchBuffer(baseBuf, tempoFactor)
                  buffers.value.set(key, stretched)
                } catch (e) {
                  console.error('Stretch failed', e)
                }
              }
            }
          }
        }
      }
    }
  },
  { deep: true },
)

function onKeydown(e: KeyboardEvent) {
  // A modal dialog (help, library picker) owns the keyboard while it is open.
  if (document.querySelector('[aria-modal="true"]')) return

  // Ctrl+S saves the project (also from the name field) instead of opening
  // the browser's Save Page dialog.
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.code === 'KeyS') {
    e.preventDefault()
    if (!store.saving) void doSave()
    return
  }

  const tag = (e.target as HTMLElement)?.tagName?.toUpperCase()
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

  // "?" opens the shortcut sheet.
  if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault()
    showHotkeys.value = true
    return
  }

  // Playhead and zoom. A focused clip handles its own arrow keys (nudge/trim)
  // and stops them before they get here.
  if (!e.ctrlKey && !e.metaKey && !e.altKey) {
    if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault()
      seek(e.key === 'Home' ? 0 : store.totalDuration)
      revealPlayhead()
      return
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      const step = gridStepSec.value * (e.shiftKey ? 4 : 1)
      seek(Math.max(0, store.playheadSec + (e.key === 'ArrowLeft' ? -step : step)))
      revealPlayhead()
      return
    }
    if (e.key === '+' || e.key === '=' || e.key === '-' || e.key === '_') {
      e.preventDefault()
      zoomAroundPlayhead(e.key === '-' || e.key === '_' ? 1 / 1.25 : 1.25)
      return
    }
  }

  // ────── DAW Hotkeys ──────
  if (e.key === 'Escape') {
    store.clearSelection()
    return
  }
  if (e.key === ' ') {
    e.preventDefault()
    store.playing ? pause() : play()
    return
  }
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (store.selectedClipId) {
      e.preventDefault()
      store.removeClip(store.selectedClipId)
    }
    return
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
    if (store.selectedClipId) {
      e.preventDefault()
      for (const lane of store.project.lanes) {
        const clip = lane.clips.find(c => c.id === store.selectedClipId)
        if (clip) {
          const dur = clipDuration(clip, store.project.bpm)
          // Copy every field (fades, mute/solo, MIDI notes and instrument), not a hand-picked subset.
          const newClip: Clip = {
            ...clip,
            notes: clip.notes?.map((n) => ({ ...n })),
            id: crypto.randomUUID(),
            timelineStart: clip.timelineStart + dur,
          }
          store.addClip(lane.id, newClip)
          store.selectedClipId = newClip.id
          break
        }
      }
    }
    return
  }
  if (!e.ctrlKey && !e.metaKey && (e.code === 'KeyS' || e.key.toLowerCase() === 's' || e.key.toLowerCase() === 'ы')) {
    e.preventDefault()
    let splitOccurred = false
    const currentPlayhead = store.playheadSec

    for (const lane of store.project.lanes) {
      const newClips: Clip[] = []
      for (const clip of lane.clips) {
        if (store.selectedClipId && clip.id !== store.selectedClipId) continue
        
        const sf = stretchFactor(clip, store.project.bpm)
        const clipEnd = clip.timelineStart + (clip.trimEnd - clip.trimStart) * sf
        
        // 0.001 margin to prevent splitting exactly at boundaries
        if (currentPlayhead > clip.timelineStart + 0.001 && currentPlayhead < clipEnd - 0.001) {
          const splitOffset = (currentPlayhead - clip.timelineStart) / sf
          const newLeftTrimEnd = clip.trimStart + splitOffset
          
          // The right half inherits everything (fades, mute/solo, MIDI data);
          // only the fades that sat at the cut are reset so the two new edges
          // get the automatic micro-fade instead of the original clip's fade.
          const rightClip: Clip = {
            ...clip,
            notes: clip.notes?.map((n) => ({ ...n })),
            id: crypto.randomUUID(),
            timelineStart: currentPlayhead,
            trimStart: newLeftTrimEnd,
            fadeInDuration: undefined,
          }

          clip.trimEnd = newLeftTrimEnd
          clip.fadeOutDuration = undefined
          newClips.push(rightClip)
          splitOccurred = true
          
          if (store.selectedClipId === clip.id) {
            store.selectedClipId = rightClip.id
          }
        }
      }
      if (newClips.length > 0) {
        lane.clips.push(...newClips)
      }
    }
    
    if (splitOccurred) {
      store.commitSnapshot()
    }
    return
  }
  // ─────────────────────────

  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
    e.preventDefault()
    store.undo()
  } else if (
    ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
    ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
  ) {
    e.preventDefault()
    store.redo()
  }
}

function onTimelineWheel(e: WheelEvent) {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -5 : 5
    store.setZoom(store.project.pxPerSecond + delta)
  }
}

let isPanning = false
let panClearsSelection = false
/** Pointer travel below this still counts as a click, not a pan. */
const PAN_CLICK_SLOP_PX = 4
let panStartX = 0
let panStartY = 0
let panScrollStartX = 0
let panScrollStartY = 0

function onTimelinePointerDown(e: PointerEvent) {
  const target = e.target as HTMLElement
  const isInteractive = target.closest('button, input, select, canvas, .cursor-ew-resize, .track-header, .ruler')
  
  // Middle click (1), Shift+Left click, or Left click on empty background
  if (e.button === 1 || (e.button === 0 && e.shiftKey) || (e.button === 0 && !isInteractive)) {
    if (timelineScrollEl.value) {
      const rect = timelineScrollEl.value.getBoundingClientRect()
      // Exclude clicks on the native scrollbar area
      if (e.clientX > rect.right - 14 || e.clientY > rect.bottom - 14) return
    }
    
    e.preventDefault()
    // A plain click (not a pan) on empty timeline drops the selection, so
    // Delete, S and Ctrl+D stop acting on a clip that may have scrolled out of
    // view. Decided on release so dragging to scroll keeps the selected track
    // and its channel strip.
    panClearsSelection = e.button === 0 && !e.shiftKey && !isInteractive
    isPanning = true
    panStartX = e.clientX
    panStartY = e.clientY
    panScrollStartX = timelineScrollEl.value?.scrollLeft || 0
    panScrollStartY = timelineScrollEl.value?.scrollTop || 0
    window.addEventListener('pointermove', onPanMove)
    window.addEventListener('pointerup', onPanEnd)
  }
}

function onPanMove(e: PointerEvent) {
  if (!isPanning || !timelineScrollEl.value) return
  const dx = e.clientX - panStartX
  const dy = e.clientY - panStartY
  timelineScrollEl.value.scrollLeft = panScrollStartX - dx
  timelineScrollEl.value.scrollTop = panScrollStartY - dy
}

function onPanEnd(e: PointerEvent) {
  const moved = Math.abs(e.clientX - panStartX) > PAN_CLICK_SLOP_PX || Math.abs(e.clientY - panStartY) > PAN_CLICK_SLOP_PX
  if (panClearsSelection && !moved) store.clearSelection()
  panClearsSelection = false
  isPanning = false
  window.removeEventListener('pointermove', onPanMove)
  window.removeEventListener('pointerup', onPanEnd)
}

function fitZoom() {
  if (!timelineScrollEl.value || store.totalDuration <= 0) return
  const availableWidth = timelineScrollEl.value.clientWidth - 260 // 224px for track header + padding
  const newZoom = Math.max(10, Math.min(200, availableWidth / (store.totalDuration + 1)))
  store.setZoom(newZoom)
}

watch(loadingAudio, (loading) => {
  if (!loading && store.totalDuration > 0) {
    // Small delay to ensure DOM is updated and container has width
    setTimeout(fitZoom, 50)
  }
})

function onBeforeUnload(e: BeforeUnloadEvent) {
  if (store.dirty) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('beforeunload', onBeforeUnload)
})

onBeforeUnmount(() => {
  unmounted = true
  stopTicking()
  engine.teardown()
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('beforeunload', onBeforeUnload)
})

onBeforeRouteLeave((_to, _from, next) => {
  if (store.dirty) {
    const confirmLeave = window.confirm(t('editor.confirmLeave'))
    if (!confirmLeave) {
      next(false)
      return
    }
  }
  next()
})
</script>

<template>
  <div class="flex min-h-0 w-full flex-1 flex-col gap-3 px-3 py-3 sm:px-4">
    <!-- Top toolbar -->
    <div class="flex flex-wrap items-center gap-3 shrink-0">
      <router-link to="/editor" class="text-xs text-text-dim hover:underline">{{ t('editor.backToProjects') }}</router-link>
      <div class="flex items-center gap-1.5">
        <input
          :value="store.projectName"
          class="rounded-lg border border-border bg-panel-2 px-2 py-1 text-sm text-text"
          @input="store.setProjectName(($event.target as HTMLInputElement).value)"
        />
        <span v-if="store.dirty" class="text-xs font-bold text-accent" :title="t('editor.unsavedTitle')">●</span>
      </div>
      <button
        type="button"
        class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
        :class="store.dirty ? 'accent-gradient text-white shadow-md shadow-accent1/20' : 'border border-border text-text hover:bg-panel'"
        :disabled="store.saving"
        @click="doSave"
      >
        <SaveIcon class="h-3.5 w-3.5 shrink-0" />
        {{ store.saving ? t('editor.saving') : t('common.save') }}
      </button>

      <!-- Undo / Redo controls -->
      <div class="flex items-center gap-1 border-l border-border/60 pl-2">
        <button
          type="button"
          class="flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-text hover:bg-panel disabled:opacity-40"
          :disabled="!store.canUndo"
          :title="t('editor.undoTitle')"
          @click="store.undo()"
        >
          <UndoIcon class="h-3.5 w-3.5 shrink-0" />
          {{ t('editor.undoBtn') }}
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-text hover:bg-panel disabled:opacity-40"
          :disabled="!store.canRedo"
          :title="t('editor.redoTitle')"
          @click="store.redo()"
        >
          <RedoIcon class="h-3.5 w-3.5 shrink-0" />
          {{ t('editor.redoBtn') }}
        </button>
      </div>

      <!-- Help and the shortcut sheet -->
      <button
        type="button"
        class="flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-panel text-text-dim hover:bg-border/50 hover:text-text transition-all ml-1"
        :title="t('editor.help.title')"
        :aria-label="t('editor.help.title')"
        @click="showHelpModal = true"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path></svg>
      </button>
      <button
        type="button"
        class="flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-panel text-text-dim hover:bg-border/50 hover:text-text transition-all"
        :title="t('editor.hotkeys.buttonTitle')"
        :aria-label="t('editor.hotkeys.buttonTitle')"
        @click="showHotkeys = true"
      >
        <KeyboardIcon class="h-3.5 w-3.5" />
      </button>

      <!-- Export controls -->
      <div class="ml-auto flex min-w-0 flex-wrap items-center gap-2 border-l border-border/60 pl-3">
        <select v-model="exportFormat" class="min-w-0 max-w-[14rem] rounded-lg border border-border bg-panel-2 px-2 py-1 text-xs text-text">
          <option value="wav">WAV</option>
          <option value="mp3">MP3</option>
          <option value="stems">{{ t('editor.exportStems') }}</option>
          <option value="dawproject">{{ t('editor.exportDawproject') }}</option>
        </select>
        <button
          type="button"
          class="accent-gradient flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white shadow-md shadow-accent1/20 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          :disabled="exporting"
          @click="doExport"
        >
          <ExportIcon class="h-3.5 w-3.5 shrink-0" />
          {{ exporting ? `${t('editor.exporting')} ${exportProgress}` : t('editor.export') }}
        </button>
      </div>
    </div>

    <p v-if="store.loading || loadingAudio" class="text-xs text-text-dim">{{ t('common.loading') }}</p>
    <p v-if="store.error" class="rounded-lg bg-status-failed/10 p-2 text-xs text-status-failed">{{ store.error }}</p>

    <template v-if="!store.loading && !loadingAudio">
      <!-- Playback toolbar -->
      <div class="flex flex-wrap items-center gap-3 rounded-lg border border-border/50 bg-panel/70 backdrop-blur-md p-2 shadow-sm shrink-0 z-30">
        <button
          type="button"
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full accent-gradient text-white shadow-md shadow-accent1/30 transition-all duration-200 hover:scale-110 active:scale-95"
          :aria-label="store.playing ? t('editor.pause') : t('editor.play')"
          :title="store.playing ? t('editor.pause') : t('editor.play')"
          @click="store.playing ? pause() : play()"
        >
          <PlayIcon v-if="!store.playing" class="w-[13px] h-[13px]" />
          <PauseIcon v-else class="w-[13px] h-[13px]" />
        </button>
        <span class="w-24 shrink-0 text-xs tabular-nums text-text-dim">{{ formatTime(store.playheadSec) }} / {{ formatTime(store.totalDuration) }}</span>
        <label class="flex items-center gap-2 text-xs text-text-dim">
          {{ t('editor.zoom') }}
          <input
            type="range"
            min="10"
            max="200"
            :value="store.project.pxPerSecond"
            @input="store.setZoom(Number(($event.target as HTMLInputElement).value))"
          />
          <button type="button" class="flex items-center gap-1 px-1.5 py-0.5 rounded border border-border text-[11px] hover:bg-panel transition-colors active:scale-95" :title="t('editor.fitZoomTitle')" @click="fitZoom"><FitIcon class="h-3 w-3 shrink-0" />{{ t('editor.fitZoom') }}</button>
        </label>

        <label class="flex items-center gap-2 text-xs text-text-dim border-l border-border/60 pl-3">
          {{ t('editor.bpm') }}
          <input
            type="number"
            min="20"
            max="999"
            class="w-14 rounded border border-border bg-panel-2 px-1 py-0.5"
            :value="store.project.bpm || 120"
            @change="store.setBpm(Number(($event.target as HTMLInputElement).value))"
          />
        </label>
        
        <button
          type="button"
          class="flex items-center gap-1.5 rounded border px-2 py-1 text-xs font-medium"
          :class="store.project.snapEnabled ? 'border-accent1 text-accent1 bg-accent1/10' : 'border-border text-text-dim hover:bg-panel'"
          :aria-pressed="store.project.snapEnabled"
          :title="t('editor.snapTitle')"
          @click="store.toggleSnap()"
        >
          <MagnetIcon class="h-3.5 w-3.5 shrink-0" />
          {{ t('editor.snap') }}
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 rounded border px-2 py-1 text-xs font-medium"
          :class="store.project.loopRegion?.enabled ? 'border-status-done text-status-done bg-status-done/10' : 'border-border text-text-dim hover:bg-panel'"
          :aria-pressed="!!store.project.loopRegion?.enabled"
          :title="t('editor.loopTitle')"
          @click="store.toggleLoop()"
        >
          <LoopIcon class="h-3.5 w-3.5 shrink-0" />
          {{ t('editor.loop') }}
        </button>

        <div class="ml-auto flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
          <!-- Stereo Master Meter -->
          <div class="flex flex-col gap-1.5 w-28" :title="t('editor.masterLevels')" role="img" :aria-label="t('editor.masterLevels')">
            <!-- Left Channel -->
            <div class="flex items-center gap-1.5">
              <span class="text-[11px] font-bold text-text-dim w-2 text-right">L</span>
              <div class="flex-1 h-1.5 rounded-full overflow-hidden bg-panel-2 shadow-inner relative border border-border/50">
                <div 
                  class="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-accent1 to-accent2 transition-all duration-75 shadow-[0_0_8px_var(--color-accent1)]"
                  :style="{ width: Math.min(100, Math.pow(masterLevel.peakL, 0.5) * 100) + '%' }"
                ></div>
              </div>
            </div>
            <!-- Right Channel -->
            <div class="flex items-center gap-1.5">
              <span class="text-[11px] font-bold text-text-dim w-2 text-right">R</span>
              <div class="flex-1 h-1.5 rounded-full overflow-hidden bg-panel-2 shadow-inner relative border border-border/50">
                <div 
                  class="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-accent1 to-accent2 transition-all duration-75 shadow-[0_0_8px_var(--color-accent1)]"
                  :style="{ width: Math.min(100, Math.pow(masterLevel.peakR, 0.5) * 100) + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <button
            type="button"
            class="flex items-center gap-1.5 rounded border px-2 py-1 text-xs font-medium"
            :class="mixerOpen ? 'border-accent1 text-accent1 bg-accent1/10' : 'border-border text-text-dim hover:bg-panel'"
            :aria-pressed="mixerOpen"
            :title="t('editor.mixerTitle')"
            @click="mixerOpen = !mixerOpen"
          >
            <MixerIcon class="h-3.5 w-3.5 shrink-0" />
            {{ t('editor.mixer') }}
          </button>
          <button
            type="button"
            class="flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 active:scale-95"
            :class="showAiPanel ? 'border-accent1 bg-accent1/10 text-accent1' : 'border-accent1/50 text-text hover:bg-panel'"
            :aria-pressed="showAiPanel"
            :title="t('aiPart.buttonTitle')"
            @click="toggleAiPanel"
          >
            <SparklesIcon class="h-3.5 w-3.5 shrink-0" />
            {{ t('aiPart.button') }}
          </button>
          <button type="button" class="flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-xs font-medium text-text hover:bg-panel transition-all duration-200 active:scale-95" @click="onAddLaneClick">
            <PlusIcon class="h-3.5 w-3.5 shrink-0" />
            {{ t('editor.addTrack') }}
          </button>
        </div>
      </div>


      <!-- Work area: the timeline, with the AI arranger and the mixer docked above, beside or under it
           (drag a panel by its grip). The panels are teleported into these targets below. -->
      <div ref="workAreaEl" class="relative flex min-h-0 flex-1 gap-3">
        <div class="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
          <div id="editor-dock-top" class="contents"></div>
          <!-- Timeline Container -->
          <div 
            ref="timelineScrollEl"
            class="min-h-[14rem] flex-1 overflow-x-auto rounded-xl border border-border/60 bg-gradient-to-b from-panel-2/80 to-panel-2 shadow-inner lg:overflow-auto"
            @wheel="onTimelineWheel"
            @pointerdown="onTimelinePointerDown"
          >
            <div class="min-w-max min-h-full flex flex-col relative">
              <!-- Timeline Ruler -->
              <div class="flex border-b border-border/60 bg-panel/60 backdrop-blur-md sticky top-0 z-20">
                <!-- Left empty corner (above track headers) -->
                <div class="w-56 shrink-0 border-r border-border/60 bg-panel-2/90 sticky left-0 z-30 flex items-center justify-center gap-1.5 px-2">
                  <template v-if="selectedLane">
                    <button
                      v-for="c in TRACK_COLORS"
                      :key="c.id"
                      class="w-2.5 h-2.5 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent1 focus-visible:ring-offset-2 focus-visible:ring-offset-panel-2 hover:scale-125"
                      :class="selectedLane.colorId === c.id ? 'scale-125 ring-1 ring-white shadow-sm' : 'opacity-60 hover:opacity-100'"
                      :style="{ backgroundColor: c.baseHex, boxShadow: selectedLane.colorId === c.id ? `0 0 6px ${c.baseHex}80` : '' }"
                      :title="c.name"
                      :aria-label="c.name"
                      :aria-pressed="selectedLane.colorId === c.id"
                      @click="store.updateLaneColor(selectedLane!.id, c.id)"
                    ></button>
                  </template>
                  <div v-else class="text-[11px] text-text-dim/70">{{ t('editor.selectTrackToPickColor') }}</div>
                </div>
                <!-- Ruler Area -->
                <div
                  class="relative h-6 flex-1 cursor-pointer ml-3 ruler"
                  :style="{ minWidth: timelineWidthPx + 'px' }"
                  @click="onRulerClick"
                >
                  <div
                    v-for="mark in rulerMarks"
                    :key="mark"
                    class="absolute top-0 bottom-0 border-l border-border/40 pl-1 text-[11px] text-text-dim"
                    :style="{ left: mark * store.project.pxPerSecond + 'px' }"
                  >
                    {{ formatTime(mark) }}
                  </div>
                  <div
                    v-if="store.project.loopRegion?.enabled"
                    class="absolute top-0 bottom-0 z-10 bg-status-done/20 group cursor-grab"
                    :style="{ 
                      left: store.project.loopRegion.start * store.project.pxPerSecond + 'px',
                      width: (store.project.loopRegion.end - store.project.loopRegion.start) * store.project.pxPerSecond + 'px'
                    }"
                    @pointerdown="onLoopPointerDown('move', $event)"
                  >
                    <!-- Drag handles -->
                    <div
                      class="absolute top-0 bottom-0 left-0 w-1.5 cursor-ew-resize bg-status-done/50 hover:bg-status-done focus-visible:bg-status-done focus-visible:outline-2 focus-visible:outline-white"
                      role="slider"
                      tabindex="0"
                      :aria-label="t('editor.loopStart')"
                      :aria-valuemin="0"
                      :aria-valuemax="Number(store.project.loopRegion.end.toFixed(2))"
                      :aria-valuenow="Number(store.project.loopRegion.start.toFixed(2))"
                      @keydown="onLoopKeydown('start', $event)"
                      @pointerdown="onLoopPointerDown('start', $event)"
                    ></div>
                    <div
                      class="absolute top-0 bottom-0 right-0 w-1.5 cursor-ew-resize bg-status-done/50 hover:bg-status-done focus-visible:bg-status-done focus-visible:outline-2 focus-visible:outline-white"
                      role="slider"
                      tabindex="0"
                      :aria-label="t('editor.loopEnd')"
                      :aria-valuemin="Number(store.project.loopRegion.start.toFixed(2))"
                      :aria-valuemax="Number(Math.max(store.totalDuration, store.project.loopRegion.end).toFixed(2))"
                      :aria-valuenow="Number(store.project.loopRegion.end.toFixed(2))"
                      @keydown="onLoopKeydown('end', $event)"
                      @pointerdown="onLoopPointerDown('end', $event)"
                    ></div>
                  </div>
                  <div
                    class="absolute top-0 bottom-0 z-20 w-[2px] bg-accent1 shadow-[0_0_8px_var(--color-accent1)] pointer-events-none"
                    :style="{ left: store.playheadSec * store.project.pxPerSecond + 'px' }"
                  >
                    <div class="absolute -top-1 -left-1.5 h-3.5 w-3.5 rounded-full bg-accent1 shadow-[0_0_12px_var(--color-accent1)]"></div>
                  </div>
                </div>
              </div>

              <TimelineLane
                v-for="(lane, idx) in store.project.lanes"
                :key="lane.id"
                :lane="lane"
                :selected="selectedLane?.id === lane.id"
                :px-per-second="store.project.pxPerSecond"
                :buffers="buffers"
                :snap-candidates="snapCandidates"
                :grid-step-sec="gridStepSec"
                :snap-enabled="store.project.snapEnabled"
                :selected-clip-id="store.selectedClipId"
                :width-px="timelineWidthPx"
                :level="laneLevels[idx] ?? SILENT_LEVEL"
                :can-split="splittableTrackId(lane) != null"
                :split="splits[lane.id] ?? null"
                @split-stems="splitLane(lane.id)"
                @cancel-split="cancelSplit(lane.id)"
                @update:settings="(v) => store.updateLaneSettings(lane.id, v, false)"
                @rename="(name) => store.renameLane(lane.id, name)"
                @move-clip="(p) => store.updateClip(p.clipId, { timelineStart: p.timelineStart })"
                @trim-clip="(p) => store.updateClip(p.clipId, { trimStart: p.trimStart, trimEnd: p.trimEnd, timelineStart: p.timelineStart })"
                @fade-clip="(p) => store.updateClip(p.clipId, { fadeInDuration: p.fadeInDuration, fadeOutDuration: p.fadeOutDuration })"
                @drag-end="store.commitSnapshot()"
                @drop-audio="(p) => onDropAudio(lane.id, p)"
                @select-lane="store.selectedLaneId = lane.id"
                @select-clip="(id) => { store.selectedClipId = id; store.selectedLaneId = lane.id; }"
                @remove-clip="(id) => store.removeClip(id)"
                @remove-lane="store.removeLane(lane.id)"
                @toggle-warp="(payload) => onToggleWarp(lane.id, payload)"
                @toggle-mute="(payload) => onToggleMute(lane.id, payload)"
                @toggle-solo="(payload) => onToggleSolo(lane.id, payload)"
                @update-color="(colorId) => store.updateLaneColor(lane.id, colorId)"
              />

              <!-- Spacer to prevent the last track from touching the scrollbar -->
              <div class="h-8 shrink-0 w-full"></div>
            </div>
          </div>
          <div id="editor-dock-bottom" class="contents"></div>
          <p v-if="exportError" class="rounded-lg bg-status-failed/10 p-2 text-xs text-status-failed">{{ exportError }}</p>
          <p v-if="exportedOk" class="rounded-lg bg-panel-2 p-2 text-xs text-text-dim">{{ exportedKind === 'daw' ? t('editor.exportedForDaw') : t('editor.exportedAsNewTrack') }}</p>
        </div>
        <div v-show="rightDockUsed" id="editor-dock-right" class="flex min-h-0 w-[26rem] shrink-0 flex-col gap-3 overflow-y-auto"></div>

        <!-- Drop zones while a panel is dragged by its grip -->
        <div v-if="draggingPanel" class="pointer-events-none absolute inset-0 z-40" aria-hidden="true">
          <div
            v-for="z in DROP_ZONES"
            :key="z.side"
            class="absolute flex items-center justify-center rounded-xl border-2 border-dashed text-sm font-medium transition-colors"
            :class="dropSide === z.side ? 'border-accent1 bg-accent1/15 text-text' : 'border-border/70 bg-bg/50 text-text-dim'"
            :style="z.style"
          >
            {{ t(`editor.dock.${z.side}`) }}
          </div>
        </div>
      </div>

      <Teleport v-if="aiPanelMounted" defer :to="`#editor-dock-${placeOf('ai')}`">
        <AiPartPanel v-show="showAiPanel" :dock="placeOf('ai')" :buffers="buffers" @play-from="playFrom" @close="showAiPanel = false" @guide="showArrangerGuide = true">
          <template #handle>
            <DockHandle :side="docks.ai" :label="t('editor.dock.moveArranger')" @move="(side) => (docks.ai = side)" @drag-start="(e) => onDockDragStart('ai', e)" />
          </template>
        </AiPartPanel>
      </Teleport>
      <Teleport defer :to="`#editor-dock-${placeOf('mixer')}`">
        <!-- Channel Strip Panel: the mixer with its effects -->
        <div
          v-show="mixerOpen"
          class="flex w-full gap-2 rounded-lg border border-border/60 bg-panel/70 p-3 shadow-sm backdrop-blur-md"
          :class="placeOf('mixer') === 'right' ? 'shrink-0 flex-col' : 'items-start overflow-x-hidden lg:max-h-[42svh] lg:min-h-[7rem] lg:overflow-y-auto'"
        >
          <DockHandle class="self-start" :side="docks.mixer" :label="t('editor.dock.moveMixer')" @move="(side) => (docks.mixer = side)" @drag-start="(e) => onDockDragStart('mixer', e)" />
          <div class="flex min-w-0 flex-1 gap-4" :class="placeOf('mixer') === 'right' ? 'flex-col' : 'items-start'">
            <!-- Left sidebar (Channel Strip) -->
            <div class="flex-1 min-w-0 flex flex-col gap-2">
              <ChannelStrip
                v-if="selectedLane"
                :model-value="selectedLane.settings"
                :label="(selectedLane?.name || '') + ' ' + t('editor.settings')"
                show-pan-mute-solo
                show-meter
                :level="selectedLaneLevel.peak || 0"
                :clipping="selectedLaneLevel.clipping || false"
                @update:model-value="(v) => store.updateLaneSettings(selectedLane!.id, v, false)"
                @commit="store.commitSnapshot()"
                @reset="store.updateLaneSettings(selectedLane!.id, defaultChannelSettings())"
              />
              <div v-else class="flex h-24 items-center justify-center rounded-xl border border-border/50 bg-panel-2/30 p-4 text-xs text-text-dim text-center w-full">
                {{ t('editor.selectTrackToEdit') }}
              </div>
            </div>
      
            <!-- Master Channel -->
            <div class="flex-1 min-w-0">
              <ChannelStrip
                :model-value="masterAsChannel"
                :label="t('editor.master')"
                @update:model-value="(v) => (masterAsChannel = v)"
                @commit="store.commitSnapshot()"
                @reset="store.updateMasterSettings(defaultMasterSettings())"
              />
            </div>
          </div>
        </div>
      </Teleport>
    </template>

    <LibraryPicker v-if="pickerOpenForNewLane" @pick="onPickForNewLane" @close="pickerOpenForNewLane = false" />
    <EditorHelpModal
      :show="showHelpModal"
      @close="showHelpModal = false"
      @open-guide="showHelpModal = false; showArrangerGuide = true"
      @open-hotkeys="showHelpModal = false; showHotkeys = true"
    />
    <EditorHotkeysModal :show="showHotkeys" @close="showHotkeys = false" />
    <AiArrangerGuide :open="showArrangerGuide" @close="showArrangerGuide = false" />
  </div>
</template>
