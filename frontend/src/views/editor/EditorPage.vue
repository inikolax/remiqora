<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useEditorStore } from '../../stores/editor'
import { useTimelineEngine } from '../../composables/useTimelineEngine'
import { getSharedAudioCtx } from '../../composables/audioPlayback'
import { decodeStem, defaultMasterSettings, defaultChannelSettings } from '../../audio/mixerEngine'
import type { ChannelSettings } from '../../audio/mixerEngine'
import { clipDuration, stretchFactor } from '../../audio/timelineTypes'
import type { Clip } from '../../audio/timelineTypes'
import { encodeWav } from '../../audio/wavEncoder'
import { encodeMp3 } from '../../audio/mp3Encoder'
import { timeStretchBuffer } from '../../audio/timeStretchEngine'
import { TRACK_COLORS } from '../../utils/trackColors'
import { detectBpm } from '../../audio/bpmDetector'
import * as tracksApi from '../../api/tracks'
import ChannelStrip from '../../components/shared/ChannelStrip.vue'
import TimelineLane from '../../components/editor/TimelineLane.vue'
import LibraryPicker from '../../components/editor/LibraryPicker.vue'
import EditorHelpModal from '../../components/editor/EditorHelpModal.vue'
import PlayIcon from '../../components/shared/icons/PlayIcon.vue'
import PauseIcon from '../../components/shared/icons/PauseIcon.vue'

const props = defineProps<{ id: string }>()

const store = useEditorStore()
const engine = useTimelineEngine()
const router = useRouter()
const { t } = useI18n()

const buffers = ref<Map<string, AudioBuffer>>(new Map())
const loadingAudio = ref(true)
const pickerOpenForNewLane = ref(false)
const exportFormat = ref<'wav' | 'mp3'>('wav')
const exporting = ref(false)
const exportError = ref<string | null>(null)
const exportedOk = ref(false)
const showHelpModal = ref(false)

const laneLevels = ref<{ peak: number; clipping: boolean; peakL: number; peakR: number }[]>([])
const masterLevel = ref<{ peak: number; clipping: boolean; peakL: number; peakR: number }>({ peak: 0, clipping: false, peakL: 0, peakR: 0 })

const timelineScrollEl = ref<HTMLElement | null>(null)

let rafId: number | null = null
let playStartCtxTime = 0
let playStartOffset = 0

function stopTicking(): void {
  if (rafId != null) cancelAnimationFrame(rafId)
  rafId = null
  laneLevels.value = store.project.lanes.map(() => ({ peak: 0, clipping: false, peakL: 0, peakR: 0 }))
  masterLevel.value = { peak: 0, clipping: false, peakL: 0, peakR: 0 }
}
function tick(): void {
  const ctx = getSharedAudioCtx()
  const currentTime = ctx.currentTime - playStartCtxTime + playStartOffset
  
  const prevSec = store.playheadSec
  if (store.project.loopRegion?.enabled && currentTime >= store.project.loopRegion.end) {
    seek(store.project.loopRegion.start)
    followPlayhead(prevSec)
    rafId = requestAnimationFrame(tick)
    return
  }

  store.playheadSec = Math.min(store.totalDuration, currentTime)
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

async function play(): Promise<void> {
  if (store.playing) return
  const from = store.playheadSec >= store.totalDuration ? 0 : store.playheadSec
  playStartOffset = from
  playStartCtxTime = getSharedAudioCtx().currentTime
  store.playing = true
  await engine.play(store.project, buffers.value, from, onEnded)
  startTicking()
}

function pause(): void {
  engine.stop()
  store.playing = false
  stopTicking()
}

function seek(value: number): void {
  store.playheadSec = value
  if (store.playing) {
    playStartOffset = value
    playStartCtxTime = getSharedAudioCtx().currentTime
    void engine.play(store.project, buffers.value, value, onEnded)
  }
}

let loopDragMode: 'start' | 'end' | 'move' | null = null
let loopDragStartX = 0
let loopDragStartVal = 0

function onLoopPointerDown(mode: 'start' | 'end' | 'move', evt: PointerEvent) {
  evt.stopPropagation()
  if (!store.project.loopRegion) return
  loopDragMode = mode
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

function onLoopPointerUp() {
  loopDragMode = null
  window.removeEventListener('pointermove', onLoopPointerMove)
  window.removeEventListener('pointerup', onLoopPointerUp)
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
    store.updateMasterSettings(rest)
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

async function onPickForNewLane(payload: { sourceUrl: string; sourceLabel: string }): Promise<void> {
  pickerOpenForNewLane.value = false
  let buffer = buffers.value.get(payload.sourceUrl)
  if (!buffer) {
    buffer = await decodeStem(payload.sourceUrl)
    buffers.value.set(payload.sourceUrl, buffer)
  }
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
}

async function doSave(): Promise<void> {
  const wasNew = store.projectId == null
  await store.save()
  if (wasNew && store.projectId != null) {
    await router.replace(`/editor/${store.projectId}`)
  }
}

async function doExport(): Promise<void> {
  exporting.value = true
  exportError.value = null
  exportedOk.value = false
  try {
    const rendered = await engine.render(store.project, buffers.value, store.totalDuration)
    const blob = exportFormat.value === 'wav' ? encodeWav(rendered) : encodeMp3(rendered)
    
    // Automatically trigger file download
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${store.projectName || 'mix'}.${exportFormat.value}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    await tracksApi.saveTrack(
      { model: 'editor', title: store.projectName, lyrics: '', params: { project_export: true, project_id: store.projectId } },
      blob,
      exportFormat.value,
    )
    exportedOk.value = true
  } catch (e) {
    exportError.value = e instanceof Error ? e.message : String(e)
  } finally {
    exporting.value = false
  }
}

async function load(): Promise<void> {
  pause()
  engine.teardown()
  loadingAudio.value = true
  if (props.id === 'new') {
    store.newProject()
  } else {
    await store.loadProject(Number(props.id))
  }
  buffers.value = await engine.decodeAll(store.project)
  engine.ensureGraph(store.project.lanes.length)
  engine.applySettings(store.project)
  loadingAudio.value = false
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
  if (store.playing) engine.play(store.project, buffers.value, store.playheadSec, () => { store.playing = false })
}

function onToggleSolo(laneId: string, payload: { clipId: string; enabled: boolean }): void {
  const lane = store.project.lanes.find((l) => l.id === laneId)
  if (!lane) return
  const clip = lane.clips.find((c) => c.id === payload.clipId)
  if (!clip) return
  clip.solo = payload.enabled
  store.snapshot()
  if (store.playing) engine.play(store.project, buffers.value, store.playheadSec, () => { store.playing = false })
}

watch(() => props.id, load, { immediate: true })

watch(
  () => store.project,
  async () => {
    engine.ensureGraph(store.project.lanes.length)
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
  // Ctrl+S saves the project (also from the name field) instead of opening
  // the browser's Save Page dialog.
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.code === 'KeyS') {
    e.preventDefault()
    if (!store.saving) void doSave()
    return
  }

  const tag = (e.target as HTMLElement)?.tagName?.toUpperCase()
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

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
          const newClip: Clip = {
            id: crypto.randomUUID(),
            sourceUrl: clip.sourceUrl,
            sourceLabel: clip.sourceLabel,
            timelineStart: clip.timelineStart + dur,
            trimStart: clip.trimStart,
            trimEnd: clip.trimEnd,
            originalBpm: clip.originalBpm,
            warpEnabled: clip.warpEnabled,
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
          
          const rightClip: Clip = {
            id: crypto.randomUUID(),
            sourceUrl: clip.sourceUrl,
            sourceLabel: clip.sourceLabel,
            timelineStart: currentPlayhead,
            trimStart: newLeftTrimEnd,
            trimEnd: clip.trimEnd,
            originalBpm: clip.originalBpm,
            warpEnabled: clip.warpEnabled,
          }
          
          clip.trimEnd = newLeftTrimEnd
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

function onPanEnd() {
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
  <div class="mx-auto max-w-[1920px] min-h-[100svh] flex flex-col p-4 pb-12 gap-4">
    <!-- Top toolbar -->
    <div class="flex flex-wrap items-center gap-3 shrink-0">
      <router-link to="/editor" class="text-xs text-text-dim hover:underline">{{ t('editor.backToProjects') }}</router-link>
      <div class="flex items-center gap-1.5">
        <input v-model="store.projectName" class="rounded-lg border border-border bg-panel-2 px-2 py-1 text-sm text-text" />
        <span v-if="store.dirty" class="text-xs font-bold text-accent" :title="t('editor.unsavedTitle')">●</span>
      </div>
      <button
        type="button"
        class="rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
        :class="store.dirty ? 'accent-gradient text-white shadow-md shadow-accent1/20' : 'border border-border text-text hover:bg-panel'"
        :disabled="store.saving"
        @click="doSave"
      >
        {{ store.saving ? t('editor.saving') : t('common.save') }}
      </button>

      <!-- Undo / Redo controls -->
      <div class="flex items-center gap-1 border-l border-border/60 pl-2">
        <button
          type="button"
          class="rounded border border-border px-2 py-1 text-xs text-text hover:bg-panel disabled:opacity-40"
          :disabled="!store.canUndo"
          :title="t('editor.undoTitle')"
          @click="store.undo()"
        >
          {{ t('editor.undoBtn') }}
        </button>
        <button
          type="button"
          class="rounded border border-border px-2 py-1 text-xs text-text hover:bg-panel disabled:opacity-40"
          :disabled="!store.canRedo"
          :title="t('editor.redoTitle')"
          @click="store.redo()"
        >
          {{ t('editor.redoBtn') }}
        </button>
      </div>

      <!-- Help Button -->
      <button
        type="button"
        class="flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-panel text-text-dim hover:bg-border/50 hover:text-text transition-all ml-1"
        :title="t('editor.help.title')"
        @click="showHelpModal = true"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path></svg>
      </button>

      <!-- Export controls -->
      <div class="flex items-center gap-2 ml-auto border-l border-border/60 pl-3">
        <select v-model="exportFormat" class="rounded-lg border border-border bg-panel-2 px-2 py-1 text-xs text-text">
          <option value="wav">WAV</option>
          <option value="mp3">MP3</option>
        </select>
        <button
          type="button"
          class="accent-gradient rounded-lg px-3 py-1.5 text-xs font-medium text-white shadow-md shadow-accent1/20 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          :disabled="exporting"
          @click="doExport"
        >
          {{ exporting ? t('editor.exporting') : t('editor.export') }}
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
          <button type="button" class="px-1.5 py-0.5 rounded border border-border text-[10px] hover:bg-panel transition-colors active:scale-95" :title="t('editor.fitZoomTitle')" @click="fitZoom">{{ t('editor.fitZoom') }}</button>
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
          class="rounded border px-2 py-1 text-xs font-medium"
          :class="store.project.snapEnabled ? 'border-accent1 text-accent1 bg-accent1/10' : 'border-border text-text-dim hover:bg-panel'"
          :aria-pressed="store.project.snapEnabled"
          :title="t('editor.snapTitle')"
          @click="store.toggleSnap()"
        >
          {{ t('editor.snap') }}
        </button>
        <button
          type="button"
          class="rounded border px-2 py-1 text-xs font-medium"
          :class="store.project.loopRegion?.enabled ? 'border-status-done text-status-done bg-status-done/10' : 'border-border text-text-dim hover:bg-panel'"
          :aria-pressed="!!store.project.loopRegion?.enabled"
          :title="t('editor.loopTitle')"
          @click="store.toggleLoop()"
        >
          {{ t('editor.loop') }}
        </button>

        <div class="ml-auto flex items-center gap-4">
          <!-- Stereo Master Meter -->
          <div class="flex flex-col gap-1.5 w-28" :title="t('editor.masterLevels')" role="img" :aria-label="t('editor.masterLevels')">
            <!-- Left Channel -->
            <div class="flex items-center gap-1.5">
              <span class="text-[9px] font-bold text-text-dim w-2 text-right">L</span>
              <div class="flex-1 h-1.5 rounded-full overflow-hidden bg-panel-2 shadow-inner relative border border-border/50">
                <div 
                  class="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-accent1 to-accent2 transition-all duration-75 shadow-[0_0_8px_var(--color-accent1)]"
                  :style="{ width: Math.min(100, Math.pow(masterLevel.peakL, 0.5) * 100) + '%' }"
                ></div>
              </div>
            </div>
            <!-- Right Channel -->
            <div class="flex items-center gap-1.5">
              <span class="text-[9px] font-bold text-text-dim w-2 text-right">R</span>
              <div class="flex-1 h-1.5 rounded-full overflow-hidden bg-panel-2 shadow-inner relative border border-border/50">
                <div 
                  class="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-accent1 to-accent2 transition-all duration-75 shadow-[0_0_8px_var(--color-accent1)]"
                  :style="{ width: Math.min(100, Math.pow(masterLevel.peakR, 0.5) * 100) + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <button type="button" class="rounded-lg border border-border/60 px-3 py-1.5 text-xs font-medium text-text hover:bg-panel transition-all duration-200 active:scale-95" @click="onAddLaneClick">
            {{ t('editor.addTrack') }}
          </button>
        </div>
      </div>


      <!-- Timeline Container -->
      <div 
        ref="timelineScrollEl"
        class="overflow-x-auto flex-1 rounded-xl border border-border/60 bg-gradient-to-b from-panel-2/80 to-panel-2 shadow-inner" 
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
                  class="w-2.5 h-2.5 rounded-full transition-all focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-panel-2 hover:scale-125"
                  :class="selectedLane.colorId === c.id ? 'scale-125 ring-1 ring-white shadow-sm' : 'opacity-60 hover:opacity-100'"
                  :style="{ backgroundColor: c.baseHex, boxShadow: selectedLane.colorId === c.id ? `0 0 6px ${c.baseHex}80` : '' }"
                  :title="c.name"
                  @click="store.updateLaneColor(selectedLane!.id, c.id)"
                ></button>
              </template>
              <div v-else class="text-[9px] text-text-dim/70">{{ t('editor.selectTrackToPickColor') }}</div>
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
                class="absolute top-0 bottom-0 border-l border-border/40 pl-1 text-[10px] text-text-dim"
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
                <div class="absolute top-0 bottom-0 left-0 w-1.5 cursor-ew-resize bg-status-done/50 hover:bg-status-done" @pointerdown="onLoopPointerDown('start', $event)"></div>
                <div class="absolute top-0 bottom-0 right-0 w-1.5 cursor-ew-resize bg-status-done/50 hover:bg-status-done" @pointerdown="onLoopPointerDown('end', $event)"></div>
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
            :level="laneLevels[idx]"
            @update:settings="(v) => store.updateLaneSettings(lane.id, v)"
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

      <!-- Channel Strip Panel -->
      <div class="flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-panel/70 backdrop-blur-md p-3 shadow-sm w-full overflow-hidden shrink-0 z-20">
        <div class="flex flex-1 items-start gap-4 min-w-0">
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
              @update:model-value="(v) => store.updateLaneSettings(selectedLane!.id, v)"
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
              @reset="store.updateMasterSettings(defaultMasterSettings())"
            />
          </div>
        </div>
      </div>

      <!-- Panels moved to top -->
      <p v-if="exportError" class="rounded-lg bg-status-failed/10 p-2 text-xs text-status-failed">{{ exportError }}</p>
      <p v-if="exportedOk" class="rounded-lg bg-panel-2 p-2 text-xs text-text-dim">{{ t('editor.exportedAsNewTrack') }}</p>
    </template>

    <LibraryPicker v-if="pickerOpenForNewLane" @pick="onPickForNewLane" @close="pickerOpenForNewLane = false" />
    <EditorHelpModal :show="showHelpModal" @close="showHelpModal = false" />
  </div>
</template>
