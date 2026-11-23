<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { fetchAndComputePeaks, peaksCache } from '../../composables/audioPlayback'

/**
 * A track's waveform as a row of bars: drawn once the row scrolls into view, the played part in the accent
 * gradient. A click or a drag seeks when `seekable`. The colours come from the theme tokens.
 */
const props = defineProps<{
  src: string
  progress?: number | null
  seekable?: boolean
  label?: string
  /** The track's length in seconds: the slider is then read as "1:05 of 3:20" instead of a percent. */
  duration?: number | null
}>()
const emit = defineEmits<{ seek: [fraction: number] }>()

const { t } = useI18n()
const BAR_COUNT = 140
const canvasEl = ref<HTMLCanvasElement | null>(null)
const peaks = ref<number[]>([])
let observer: IntersectionObserver | null = null
let resizeObserver: ResizeObserver | null = null

let retry: ReturnType<typeof setTimeout> | null = null
/** The peaks of `src`; a failed read (the file still being written, a busy backend) is tried twice more a little
 *  later before the row settles for a flat outline, so a fresh track does not stay without its picture. */
async function loadPeaks(attempt = 0): Promise<void> {
  const src = props.src
  const cached = peaksCache.get(src)
  if (cached) peaks.value = cached
  else {
    try {
      const got = await fetchAndComputePeaks(src, BAR_COUNT)
      if (src !== props.src) return
      peaks.value = got
    } catch {
      if (src !== props.src) return
      peaks.value = new Array(BAR_COUNT).fill(0.15)
      if (attempt < 2) retry = setTimeout(() => { retry = null; void loadPeaks(attempt + 1) }, 1500 * (attempt + 1))
    }
  }
  draw()
}

function draw(): void {
  const canvas = canvasEl.value
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  const width = Math.max(1, rect.width)
  const height = Math.max(1, rect.height)
  canvas.width = width * dpr
  canvas.height = height * dpr
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)
  const css = getComputedStyle(document.documentElement)
  const token = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback
  const source = peaks.value.length ? peaks.value : new Array(BAR_COUNT).fill(0.08)
  // Thin bars of one width whatever the canvas: on a wide player the 140 peaks stretched into fat squares.
  const BAR = 3
  const GAP = 2
  const target = Math.max(12, Math.floor((width + GAP) / (BAR + GAP)))
  const n = source.length
  const bars = Array.from({ length: target }, (_, i) => {
    if (target <= n) {
      // fewer bars than peaks: each bar is the mean of its share
      const from = Math.floor((i * n) / target)
      const to = Math.max(from + 1, Math.floor(((i + 1) * n) / target))
      let sum = 0
      for (let k = from; k < to; k++) sum += source[k]
      return sum / (to - from)
    }
    // more bars than peaks: an eased blend of the two nearest, so the outline flows instead of stepping
    const pos = (i / (target - 1)) * (n - 1)
    const a = Math.floor(pos)
    const b = Math.min(n - 1, a + 1)
    const f = (1 - Math.cos((pos - a) * Math.PI)) / 2
    return source[a] * (1 - f) + source[b] * f
  })
  // centred: the bars and gaps rarely fill the width exactly
  const left = (width - (target * (BAR + GAP) - GAP)) / 2
  const shape = () => {
    ctx.beginPath()
    bars.forEach((v, i) => {
      const h = Math.max(BAR, v * height)
      const x = left + i * (BAR + GAP)
      const y = (height - h) / 2
      if (ctx.roundRect) ctx.roundRect(x, y, BAR, h, BAR / 2)
      else ctx.rect(x, y, BAR, h)
    })
  }
  ctx.globalAlpha = 0.4
  ctx.fillStyle = token('--color-text-dim', '#9a9aab')
  shape()
  ctx.fill()
  ctx.globalAlpha = 1
  if (props.progress != null) {
    // the played part is the same shape under a clip: its edge moves evenly, not a bar at a time
    const played = width * Math.max(0, Math.min(1, props.progress))
    const gradient = ctx.createLinearGradient(0, 0, width, 0)
    gradient.addColorStop(0, token('--color-accent1', '#a855f7'))
    gradient.addColorStop(1, token('--color-accent2', '#ec4899'))
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 0, played, height)
    ctx.clip()
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = gradient
    shape()
    ctx.fill()
    ctx.restore()
  }
}

function fractionAt(e: PointerEvent): number {
  const rect = canvasEl.value!.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width
  return Math.max(0, Math.min(1, document.documentElement.dir === 'rtl' ? 1 - x : x))
}
let dragging = false
function onDown(e: PointerEvent): void {
  if (!props.seekable) return
  dragging = true
  canvasEl.value?.setPointerCapture(e.pointerId)
  emit('seek', fractionAt(e))
}
function onMove(e: PointerEvent): void {
  if (dragging) emit('seek', fractionAt(e))
}
function onUp(): void {
  dragging = false
}
function onKey(e: KeyboardEvent): void {
  if (!props.seekable || e.altKey || e.ctrlKey || e.metaKey) return
  // in a right-to-left page the bars run from the right, as the pointer seek already mirrors
  const rtl = !!canvasEl.value && getComputedStyle(canvasEl.value).direction === 'rtl'
  const forward = rtl ? 'ArrowLeft' : 'ArrowRight'
  const back = rtl ? 'ArrowRight' : 'ArrowLeft'
  const now = props.progress ?? 0
  let to: number | null = null
  if (e.key === forward || e.key === 'ArrowUp') to = now + 0.02
  else if (e.key === back || e.key === 'ArrowDown') to = now - 0.02
  else if (e.key === 'PageUp') to = now + 0.1
  else if (e.key === 'PageDown') to = now - 0.1
  else if (e.key === 'Home') to = 0
  else if (e.key === 'End') to = 1
  if (to === null) return
  e.preventDefault()
  emit('seek', Math.max(0, Math.min(1, to)))
}

const clock = (sec: number): string => {
  const s = Math.max(0, Math.floor(sec))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
/** What a screen reader says for the position: the time when the length is known, else the percent. */
const valueText = computed(() => {
  const p = Math.max(0, Math.min(1, props.progress ?? 0))
  const d = props.duration
  if (d && Number.isFinite(d) && d > 0) return t('miniWave.timeOf', { pos: clock(p * d), total: clock(d) })
  return t('miniWave.percent', { n: Math.round(p * 100) })
})

onMounted(() => {
  const el = canvasEl.value
  if (!el) return
  draw()
  observer = new IntersectionObserver((entries) => {
    if (entries.some((x) => x.isIntersecting)) {
      observer?.disconnect()
      observer = null
      void loadPeaks()
    }
  }, { rootMargin: '200px' })
  observer.observe(el)
  resizeObserver = new ResizeObserver(draw)
  resizeObserver.observe(el)
})
onBeforeUnmount(() => {
  if (retry) clearTimeout(retry)
  observer?.disconnect()
  resizeObserver?.disconnect()
})
watch(() => props.progress, draw)
watch(() => props.src, () => { if (retry) clearTimeout(retry); retry = null; peaks.value = []; void loadPeaks() })
</script>

<template>
  <canvas
    ref="canvasEl" class="block h-8 w-full touch-none rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1" :class="seekable ? 'cursor-pointer' : ''"
    :role="seekable ? 'slider' : 'img'" :tabindex="seekable ? 0 : undefined" :aria-label="label"
    :aria-valuemin="seekable ? 0 : undefined" :aria-valuemax="seekable ? 100 : undefined" :aria-valuenow="seekable ? Math.round((progress ?? 0) * 100) : undefined"
    :aria-valuetext="seekable ? valueText : undefined"
    @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp" @keydown="onKey"
  ></canvas>
</template>
