<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { stretchFactor } from '../../audio/timelineTypes'
import type { Clip, EditorTool } from '../../audio/timelineTypes'
import { bufferPeaks, PEAK_BLOCK } from '../../audio/waveformPeaks'

const MIN_CLIP_SEC = 0.05
const SNAP_PX = 8

const props = defineProps<{
  clip: Clip
  pxPerSecond: number
  buffer: AudioBuffer | null
  /** Stretch factor `buffer` carries (1 while the stretched buffer is still being built). */
  bufferStretch: number
  /** Length of the source audio in source seconds, the cap for trimEnd. */
  sourceDuration?: number
  snapCandidates: number[]
  gridStepSec: number
  snapEnabled: boolean
  selected: boolean
  tool: EditorTool
  laneName: string
  theme: {
    baseHex: string
    rmsLight: string
    rmsMain: string
    rmsDark: string
    peakLight: string
    peakMain: string
  }
}>()

const emit = defineEmits<{
  move: [timelineStart: number]
  trim: [payload: { trimStart: number; trimEnd: number; timelineStart: number }]
  fade: [payload: { fadeInDuration: number; fadeOutDuration: number }]
  dragEnd: []
  select: []
  remove: []
  /** Knife: cut the clip at this timeline time. */
  cut: [time: number]
  /** Eraser: remove this timeline range from the clip. */
  erase: [payload: { from: number; to: number }]
  toggleWarp: [enabled: boolean]
  toggleMute: [enabled: boolean]
  toggleSolo: [enabled: boolean]
}>()

import { useI18n } from 'vue-i18n'
import { useEditorStore } from '../../stores/editor'
const { t } = useI18n()
const store = useEditorStore()

const effectiveStretchFactor = computed(() => {
  return stretchFactor(props.clip, store.project.bpm)
})

const maxTrimEnd = computed(() => props.sourceDuration ?? Infinity)

const canvasEl = ref<HTMLCanvasElement | null>(null)

/** Clip buttons that are not switched on stay out of the waveform's way until the clip is hovered, focused or selected. */
const idleButton = computed(() => (props.selected ? 'opacity-100' : 'opacity-0 group-hover/clip:opacity-100 group-focus-within/clip:opacity-100'))

const duration = computed(() => (props.clip.trimEnd - props.clip.trimStart) * effectiveStretchFactor.value)
const left = computed(() => props.clip.timelineStart * props.pxPerSecond)
const width = computed(() => Math.max(4, duration.value * props.pxPerSecond))

type DragMode = 'move' | 'trim-left' | 'trim-right' | 'fade-left' | 'fade-right'
let dragMode: DragMode | null = null
let dragStartClientX = 0
let dragStartTimelineStart = 0
let dragStartTrimStart = 0
let dragStartTrimEnd = 0
let dragStartFadeIn = 0
let dragStartFadeOut = 0
let dragCandidates: number[] = []

const fadeInPolygon = computed(() => {
  const dur = duration.value
  if (dur <= 0) return ''
  const pct = Math.min(100, ((props.clip.fadeInDuration || 0) / dur) * 100)
  return `0,0 ${pct},0 0,100`
})

const fadeOutPolygon = computed(() => {
  const dur = duration.value
  if (dur <= 0) return ''
  const pct = Math.min(100, ((props.clip.fadeOutDuration || 0) / dur) * 100)
  return `100,0 ${100 - pct},0 100,100`
})

function snap(value: number): number {
  const thresholdSec = SNAP_PX / props.pxPerSecond
  let best = value
  let bestDist = thresholdSec
  
  for (const c of dragCandidates) {
    const d = Math.abs(c - value)
    if (d < bestDist) {
      bestDist = d
      best = c
    }
  }
  
  if (props.snapEnabled && props.gridStepSec > 0) {
    const gridSnapped = Math.round(value / props.gridStepSec) * props.gridStepSec
    const d = Math.abs(gridSnapped - value)
    if (d < bestDist) {
      bestDist = d
      best = gridSnapped
    }
  }
  
  return best
}

/** Arrow keys on the focused clip: move it (grid step with Magnet on, else
 * 0.1 s; Alt for 0.01 s), or with Shift move its end. Each press is one undo step. */
function onKeydown(e: KeyboardEvent): void {
  if (e.target !== e.currentTarget) return
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
  if (e.ctrlKey || e.metaKey) return
  e.preventDefault()
  e.stopPropagation()
  const dir = e.key === 'ArrowLeft' ? -1 : 1
  const grid = props.snapEnabled && props.gridStepSec > 0 && !e.altKey
  const step = e.altKey ? 0.01 : grid ? props.gridStepSec : 0.1
  if (e.shiftKey) {
    const sf = effectiveStretchFactor.value
    const maxEnd = maxTrimEnd.value
    const trimEnd = Math.max(props.clip.trimStart + MIN_CLIP_SEC, Math.min(props.clip.trimEnd + (dir * step) / sf, maxEnd))
    emit('trim', { trimStart: props.clip.trimStart, trimEnd, timelineStart: props.clip.timelineStart })
  } else {
    let start = props.clip.timelineStart + dir * step
    if (grid) start = Math.round(start / props.gridStepSec) * props.gridStepSec
    emit('move', Math.max(0, start))
  }
  emit('dragEnd')
}

/** Keyboard counterpart of dragging a trim or fade handle: arrows move it by the grid step, Alt = 0.01 s, Shift = 4x. */
function onHandleKeydown(handle: Exclude<DragMode, 'move'>, e: KeyboardEvent): void {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
  if (e.ctrlKey || e.metaKey) return
  e.preventDefault()
  e.stopPropagation()
  const dir = e.key === 'ArrowLeft' ? -1 : 1
  const base = e.altKey ? 0.01 : props.snapEnabled && props.gridStepSec > 0 ? props.gridStepSec : 0.1
  const step = base * (e.shiftKey ? 4 : 1)
  const sf = effectiveStretchFactor.value
  if (handle === 'fade-left') {
    emit('fade', { fadeInDuration: Math.max(0, Math.min((props.clip.fadeInDuration || 0) + dir * step, duration.value)), fadeOutDuration: props.clip.fadeOutDuration || 0 })
  } else if (handle === 'fade-right') {
    // The right handle sits at the fade's inner edge, so moving it left lengthens the fade.
    emit('fade', { fadeInDuration: props.clip.fadeInDuration || 0, fadeOutDuration: Math.max(0, Math.min((props.clip.fadeOutDuration || 0) - dir * step, duration.value)) })
  } else if (handle === 'trim-left') {
    const trimStart = Math.max(0, Math.min(props.clip.trimStart + (dir * step) / sf, props.clip.trimEnd - MIN_CLIP_SEC))
    emit('trim', { trimStart, trimEnd: props.clip.trimEnd, timelineStart: props.clip.timelineStart + (trimStart - props.clip.trimStart) * sf })
  } else {
    const maxEnd = maxTrimEnd.value
    const trimEnd = Math.max(props.clip.trimStart + MIN_CLIP_SEC, Math.min(props.clip.trimEnd + (dir * step) / sf, maxEnd))
    emit('trim', { trimStart: props.clip.trimStart, trimEnd, timelineStart: props.clip.timelineStart })
  }
  emit('dragEnd')
}

// ---- Knife and eraser ----
// While one of them is active a layer over the clip takes the pointer, so the
// clip is not moved or trimmed by accident. Both snap like a clip edge does.
const rootEl = ref<HTMLElement | null>(null)
/** Where the knife would cut, in px from the clip's left edge. */
const knifePx = ref<number | null>(null)
const eraseRange = ref<{ from: number; to: number } | null>(null)
const ERASE_CLICK_SLOP_PX = 4
let eraseAnchor = 0
let eraseStartX = 0
let eraseMoved = false

function toolTime(evt: PointerEvent): number {
  const rect = rootEl.value?.getBoundingClientRect()
  const raw = props.clip.timelineStart + (evt.clientX - (rect?.left ?? 0)) / props.pxPerSecond
  dragCandidates = props.snapCandidates
  return Math.max(props.clip.timelineStart, Math.min(snap(raw), props.clip.timelineStart + duration.value))
}

function onToolHover(evt: PointerEvent): void {
  knifePx.value = props.tool === 'knife' ? (toolTime(evt) - props.clip.timelineStart) * props.pxPerSecond : null
}

function onToolDown(evt: PointerEvent): void {
  if (evt.button !== 0 || evt.shiftKey) return // middle button and Shift+drag still scroll the timeline
  evt.stopPropagation()
  evt.preventDefault()
  if (props.tool === 'knife') {
    emit('cut', toolTime(evt))
    return
  }
  eraseAnchor = toolTime(evt)
  eraseStartX = evt.clientX
  eraseMoved = false
  eraseRange.value = { from: eraseAnchor, to: eraseAnchor }
  window.addEventListener('pointermove', onEraseMove)
  window.addEventListener('pointerup', onEraseUp)
}

function onEraseMove(evt: PointerEvent): void {
  if (Math.abs(evt.clientX - eraseStartX) > ERASE_CLICK_SLOP_PX) eraseMoved = true
  const time = toolTime(evt)
  eraseRange.value = { from: Math.min(eraseAnchor, time), to: Math.max(eraseAnchor, time) }
}

/** A drag erases the range under it; a plain click erases the whole clip. */
function onEraseUp(): void {
  window.removeEventListener('pointermove', onEraseMove)
  window.removeEventListener('pointerup', onEraseUp)
  const range = eraseRange.value
  eraseRange.value = null
  if (!range) return
  if (!eraseMoved) emit('remove')
  else if (range.to - range.from > 0.005) emit('erase', range)
}

function onPointerDown(mode: DragMode, evt: PointerEvent): void {
  evt.stopPropagation()
  emit('select')
  dragMode = mode
  dragStartClientX = evt.clientX
  dragStartTimelineStart = props.clip.timelineStart
  dragStartTrimStart = props.clip.trimStart
  dragStartTrimEnd = props.clip.trimEnd
  dragStartFadeIn = props.clip.fadeInDuration || 0
  dragStartFadeOut = props.clip.fadeOutDuration || 0
  const ownStart = props.clip.timelineStart
  const ownEnd = props.clip.timelineStart + duration.value
  dragCandidates = props.snapCandidates.filter((c) => Math.abs(c - ownStart) > 1e-6 && Math.abs(c - ownEnd) > 1e-6)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}

function onPointerMove(evt: PointerEvent): void {
  if (!dragMode) return
  const deltaSec = (evt.clientX - dragStartClientX) / props.pxPerSecond

  if (dragMode === 'move') {
    const raw = Math.max(0, dragStartTimelineStart + deltaSec)
    emit('move', snap(raw))
  } else if (dragMode === 'trim-left') {
    const maxStart = dragStartTrimEnd - MIN_CLIP_SEC
    // delta is in stretched time, we must scale it back to original time for trimStart
    const originalDeltaSec = deltaSec / effectiveStretchFactor.value
    const rawTrimStart = Math.max(0, Math.min(dragStartTrimStart + originalDeltaSec, maxStart))
    
    // timelineStart moves by the stretched amount
    const stretchedDelta = (rawTrimStart - dragStartTrimStart) * effectiveStretchFactor.value
    const rawTimelineStart = dragStartTimelineStart + stretchedDelta
    const snappedTimelineStart = snap(rawTimelineStart)
    const appliedStretchedDelta = snappedTimelineStart - dragStartTimelineStart
    const appliedOriginalDelta = appliedStretchedDelta / effectiveStretchFactor.value

    // Snapping can pull the edge earlier than the source start (or later than
    // maxStart), so clamp again AFTER the snap and derive timelineStart from the
    // clamped value. A negative trimStart would reach start() as a RangeError.
    const trimStart = Math.max(0, Math.min(dragStartTrimStart + appliedOriginalDelta, maxStart))
    emit('trim', {
      trimStart,
      trimEnd: dragStartTrimEnd,
      timelineStart: dragStartTimelineStart + (trimStart - dragStartTrimStart) * effectiveStretchFactor.value,
    })
  } else if (dragMode === 'trim-right') {
    const minEnd = dragStartTrimStart + MIN_CLIP_SEC
    const maxEnd = maxTrimEnd.value
    const originalDeltaSec = deltaSec / effectiveStretchFactor.value
    const rawTrimEnd = Math.max(minEnd, Math.min(dragStartTrimEnd + originalDeltaSec, maxEnd))
    
    const stretchedDelta = (rawTrimEnd - dragStartTrimStart) * effectiveStretchFactor.value
    const rawEndOnTimeline = dragStartTimelineStart + stretchedDelta
    const snappedEndOnTimeline = snap(rawEndOnTimeline)
    
    const appliedStretchedDelta = snappedEndOnTimeline - dragStartTimelineStart
    const appliedOriginalDelta = appliedStretchedDelta / effectiveStretchFactor.value

    // Clamp again after snapping: the snapped end must stay within the source
    // and at least MIN_CLIP_SEC after trimStart.
    emit('trim', {
      trimStart: dragStartTrimStart,
      trimEnd: Math.max(minEnd, Math.min(dragStartTrimStart + appliedOriginalDelta, maxEnd)),
      timelineStart: dragStartTimelineStart,
    })
  } else if (dragMode === 'fade-left') {
    const rawFadeIn = Math.max(0, dragStartFadeIn + deltaSec)
    emit('fade', {
      fadeInDuration: Math.min(rawFadeIn, duration.value),
      fadeOutDuration: props.clip.fadeOutDuration || 0,
    })
  } else if (dragMode === 'fade-right') {
    const rawFadeOut = Math.max(0, dragStartFadeOut - deltaSec)
    emit('fade', {
      fadeInDuration: props.clip.fadeInDuration || 0,
      fadeOutDuration: Math.min(rawFadeOut, duration.value),
    })
  }
}

function onPointerUp(): void {
  dragMode = null
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  emit('dragEnd')
}

// The waveform always shows exactly the trimmed range at the clip's current
// size: it is redrawn (from cached block peaks, so cheaply) on every trim step,
// zoom change and resize. Trimming therefore uncovers or hides audio instead of
// squeezing the old picture, which read as time-stretching.
const MAX_CANVAS_PX = 16384

function drawPeaks(): void {
  const canvas = canvasEl.value
  if (!canvas) return

  const isMidi = props.clip.type === 'midi'
  const buffer = props.buffer
  if (!isMidi && !buffer) return

  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  const w = Math.max(1, rect.width)
  const h = Math.max(1, rect.height || 28)
  const cw = Math.max(1, Math.min(MAX_CANVAS_PX, Math.round(w * dpr)))
  const ch = Math.max(1, Math.round(h * dpr))
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(cw / w, 0, 0, ch / h, 0, 0)
  ctx.clearRect(0, 0, w, h)

  const sf = effectiveStretchFactor.value

  if (isMidi && props.clip.notes) {
    const notes = props.clip.notes
    if (notes.length === 0) return
    
    // Find min and max note to scale vertically
    let minNote = 127
    let maxNote = 0
    for (const n of notes) {
      if (n.note < minNote) minNote = n.note
      if (n.note > maxNote) maxNote = n.note
    }
    const noteRange = Math.max(12, maxNote - minNote + 2) // at least an octave
    
    const clipDuration = (props.clip.trimEnd - props.clip.trimStart) * sf
    if (clipDuration <= 0) return
    
    ctx.fillStyle = '#6366f1' // accent color
    
    for (const n of notes) {
      const startSec = n.startSec * sf
      const durSec = n.durationSec * sf
      // Only draw if it's within trim range
      if (startSec + durSec <= props.clip.trimStart * sf || startSec >= props.clip.trimEnd * sf) continue
      
      const pxPerSec = w / clipDuration
      const startPx = (startSec - props.clip.trimStart * sf) * pxPerSec
      const widthPx = Math.max(2, durSec * pxPerSec - 1)
      
      // Vertical placement
      const normalizedPitch = 1.0 - (n.note - minNote + 1) / noteRange
      const y = normalizedPitch * h
      const noteHeight = Math.max(2, h / noteRange - 1)
      
      // opacity based on velocity
      ctx.globalAlpha = Math.max(0.3, n.velocity)
      ctx.fillRect(startPx, y, widthPx, noteHeight)
    }
    ctx.globalAlpha = 1.0
    return
  }

  // Audio: one crisp min/max column per device pixel around the centre line.
  if (!buffer) return
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  const { min, max } = bufferPeaks(buffer)
  // Address the buffer with the factor it carries (see bufferStretch).
  const bsf = props.bufferStretch || 1
  const blocksPerSec = buffer.sampleRate / PEAK_BLOCK
  const startBlock = Math.max(0, props.clip.trimStart * bsf * blocksPerSec)
  const endBlock = Math.min(min.length, props.clip.trimEnd * bsf * blocksPerSec)
  const span = Math.max(0, endBlock - startBlock)
  const mid = ch / 2
  const amp = mid * 0.94

  ctx.fillStyle = props.theme.rmsLight || 'rgba(216, 180, 254, 0.9)'
  ctx.beginPath()
  for (let x = 0; x < cw; x++) {
    const b0 = Math.floor(startBlock + (x * span) / cw)
    const b1 = Math.max(b0 + 1, Math.ceil(startBlock + ((x + 1) * span) / cw))
    let lo = 0
    let hi = 0
    for (let b = b0; b < b1 && b < min.length; b++) {
      if (min[b] < lo) lo = min[b]
      if (max[b] > hi) hi = max[b]
    }
    const top = mid - Math.min(1, hi) * amp
    const bottom = mid - Math.max(-1, lo) * amp
    // At least one pixel, so silence still draws the centre line.
    ctx.rect(x, Math.min(top, mid - 0.5), 1, Math.max(1, bottom - top))
  }
  ctx.fill()
}

let drawFrame = 0
function scheduleDraw(): void {
  if (drawFrame) return
  drawFrame = requestAnimationFrame(() => {
    drawFrame = 0
    drawPeaks()
  })
}

let resizeObserver: ResizeObserver | null = null

watch(() => [props.buffer, props.bufferStretch, props.clip.trimStart, props.clip.trimEnd, props.clip.notes], scheduleDraw)
watch(() => props.theme, scheduleDraw, { deep: true })
onMounted(() => {
  drawPeaks()
  if (canvasEl.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(scheduleDraw)
    resizeObserver.observe(canvasEl.value)
  }
})
onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('pointermove', onEraseMove)
  window.removeEventListener('pointerup', onEraseUp)
  if (drawFrame) cancelAnimationFrame(drawFrame)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
})
</script>

<template>
  <div
    ref="rootEl"
    class="group/clip absolute top-1.5 bottom-1.5 overflow-hidden rounded-lg border select-none transition-[border-color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    tabindex="0"
    :aria-label="t('timeline.clipLabel', { name: laneName, start: clip.timelineStart.toFixed(2), length: duration.toFixed(2) })"
    @focus="emit('select')"
    @keydown="onKeydown"
    :class="selected ? 'shadow-md' : 'shadow-sm'"
    :style="{
      left: left + 'px',
      width: width + 'px',
      // Translucent, so the timeline grid stays visible through the clip.
      backgroundColor: theme.baseHex + (selected ? '3d' : '26'),
      borderColor: theme.baseHex + (selected ? '' : '99'),
      boxShadow: selected ? `0 0 10px ${theme.baseHex}33` : ''
    }"
  >
    <div class="relative h-full cursor-grab" @pointerdown="onPointerDown('move', $event)">
      <canvas ref="canvasEl" class="absolute inset-0 h-full w-full" :class="clip.muted ? 'opacity-40' : ''"></canvas>
      <!-- Name and buttons lie over the waveform, which keeps the whole clip height. -->
      <div class="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-1 pl-3 pr-3.5 pt-0.5 text-[11px] font-medium">
        <span class="truncate text-text/90 [text-shadow:0_1px_2px_rgb(0_0_0/0.9)]">{{ laneName }}</span>
        <div class="pointer-events-auto z-10 flex items-center gap-0.5 text-white/85">
          <!-- Each button carries its own dark backing: readable on any waveform, and nothing is drawn while they are hidden. -->
          <button
            type="button"
            class="shrink-0 rounded bg-black/55 px-1 transition-opacity hover:text-white focus-visible:opacity-100"
            :class="clip.muted ? '!bg-accent1 font-bold text-white' : idleButton"
            :aria-pressed="!!clip.muted"
            :aria-label="t('timeline.muteClip')"
            :title="t('timeline.muteClip')"
            @pointerdown.stop
            @click="emit('toggleMute', !clip.muted)"
          >M</button>
          <button
            type="button"
            class="shrink-0 rounded bg-black/55 px-1 transition-opacity hover:text-white focus-visible:opacity-100"
            :class="clip.solo ? '!bg-accent1 font-bold text-white' : idleButton"
            :aria-pressed="!!clip.solo"
            :aria-label="t('timeline.soloClip')"
            :title="t('timeline.soloClip')"
            @pointerdown.stop
            @click="emit('toggleSolo', !clip.solo)"
          >S</button>
          <button
            type="button"
            class="shrink-0 rounded bg-black/55 px-1 transition-opacity hover:text-white focus-visible:opacity-100"
            :class="clip.warpEnabled ? '!bg-accent1 font-bold text-white' : idleButton"
            :aria-pressed="!!clip.warpEnabled"
            :aria-label="t('timeline.warpClip')"
            :title="t('timeline.warpClip')"
            @pointerdown.stop
            @click="emit('toggleWarp', !clip.warpEnabled)"
          >W</button>
          <button
            type="button"
            class="shrink-0 rounded bg-black/55 px-1 transition-opacity hover:text-status-failed focus-visible:opacity-100"
            :class="idleButton"
            :aria-label="t('timeline.removeClip')"
            :title="t('timeline.removeClip')"
            @pointerdown.stop
            @click="emit('remove')"
          >✕</button>
        </div>
      </div>
      <div
        v-if="!buffer && clip.type !== 'midi'"
        class="absolute inset-x-0 bottom-0.5 truncate px-2 text-[11px] text-status-failed"
        :title="clip.sourceLabel"
      >
        {{ t('editor.sourceMissing') }}
      </div>
    </div>

    <svg class="pointer-events-none absolute inset-0 h-full w-full opacity-40 mix-blend-overlay" preserveAspectRatio="none" viewBox="0 0 100 100">
      <polygon :points="fadeInPolygon" fill="black" />
      <polygon :points="fadeOutPolygon" fill="black" />
    </svg>

    <div
      class="absolute top-0 left-0 h-full w-2 cursor-ew-resize hover:bg-accent1/30 focus-visible:bg-accent1/30 focus-visible:outline-2 focus-visible:outline-accent1 transition-colors"
      role="slider"
      tabindex="0"
      :aria-label="t('timeline.trimStart')"
      :aria-valuemin="0"
      :aria-valuemax="Number((clip.timelineStart + duration).toFixed(2))"
      :aria-valuenow="Number(clip.timelineStart.toFixed(2))"
      @focus="emit('select')"
      @keydown="onHandleKeydown('trim-left', $event)"
      @pointerdown="onPointerDown('trim-left', $event)"
    >
      <div class="absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-r-sm bg-white/40 shadow-sm"></div>
    </div>
    <div
      class="absolute top-0 right-0 h-full w-2 cursor-ew-resize hover:bg-accent1/30 focus-visible:bg-accent1/30 focus-visible:outline-2 focus-visible:outline-accent1 transition-colors"
      role="slider"
      tabindex="0"
      :aria-label="t('timeline.trimEnd')"
      :aria-valuemin="Number(clip.timelineStart.toFixed(2))"
      :aria-valuemax="Number((clip.timelineStart + duration).toFixed(2))"
      :aria-valuenow="Number((clip.timelineStart + duration).toFixed(2))"
      @focus="emit('select')"
      @keydown="onHandleKeydown('trim-right', $event)"
      @pointerdown="onPointerDown('trim-right', $event)"
    >
      <div class="absolute right-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-l-sm bg-white/40 shadow-sm"></div>
    </div>
    
    <div
      class="group absolute top-0 z-20 flex h-6 w-6 -translate-x-1/2 cursor-ew-resize items-start justify-center rounded focus-visible:outline-2 focus-visible:outline-accent1"
      :style="{ left: (props.clip.fadeInDuration || 0) * props.pxPerSecond + 'px' }"
      role="slider"
      tabindex="0"
      :aria-label="t('timeline.fadeIn')"
      :aria-valuemin="0"
      :aria-valuemax="Number(duration.toFixed(2))"
      :aria-valuenow="Number((clip.fadeInDuration || 0).toFixed(2))"
      @focus="emit('select')"
      @keydown="onHandleKeydown('fade-left', $event)"
      @pointerdown="onPointerDown('fade-left', $event)"
    >
      <div class="mt-1 h-2.5 w-2.5 rounded-full bg-accent1 shadow-[0_0_8px_var(--color-accent1)] transition-all group-hover:scale-125 group-hover:bg-white"></div>
    </div>
    <div
      class="group absolute top-0 z-20 flex h-6 w-6 translate-x-1/2 cursor-ew-resize items-start justify-center rounded focus-visible:outline-2 focus-visible:outline-accent1"
      :style="{ right: (props.clip.fadeOutDuration || 0) * props.pxPerSecond + 'px' }"
      role="slider"
      tabindex="0"
      :aria-label="t('timeline.fadeOut')"
      :aria-valuemin="0"
      :aria-valuemax="Number(duration.toFixed(2))"
      :aria-valuenow="Number((clip.fadeOutDuration || 0).toFixed(2))"
      @focus="emit('select')"
      @keydown="onHandleKeydown('fade-right', $event)"
      @pointerdown="onPointerDown('fade-right', $event)"
    >
      <div class="mt-1 h-2.5 w-2.5 rounded-full bg-accent1 shadow-[0_0_8px_var(--color-accent1)] transition-all group-hover:scale-125 group-hover:bg-white"></div>
    </div>

    <!-- Knife / eraser layer: above the handles and buttons, so a click always means the tool. -->
    <div
      v-if="tool !== 'select'"
      class="absolute inset-0 z-30 touch-none"
      :class="tool === 'knife' ? 'cursor-col-resize' : 'cursor-crosshair'"
      @pointerdown="onToolDown"
      @pointermove="onToolHover"
      @pointerleave="knifePx = null"
    >
      <div
        v-if="tool === 'knife' && knifePx != null"
        class="pointer-events-none absolute top-0 bottom-0 w-px bg-white shadow-[0_0_4px_rgb(0_0_0)]"
        :style="{ left: knifePx + 'px' }"
      ></div>
      <div
        v-if="eraseRange"
        class="pointer-events-none absolute top-0 bottom-0 border-x border-status-failed bg-status-failed/45"
        :style="{ left: (eraseRange.from - clip.timelineStart) * pxPerSecond + 'px', width: (eraseRange.to - eraseRange.from) * pxPerSecond + 'px' }"
      ></div>
    </div>
  </div>
</template>
