<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { claimPlayback, fetchAndComputePeaks, peaksCache, releasePlaybackIfCurrent } from '../../composables/audioPlayback'
import { formatClock } from '../../composables/formatCreated'
import PlayIcon from './icons/PlayIcon.vue'
import PauseIcon from './icons/PauseIcon.vue'

const { t } = useI18n()

const props = defineProps<{ src: string; compact?: boolean; durationHint?: number | null; totalClass?: string }>()

const BAR_COUNT = 140

const audioEl = ref<HTMLAudioElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)
const playing = ref(false)
const duration = ref(0)
const currentTime = ref(0)
const peaks = ref<number[]>([])

const total = computed(() => duration.value || props.durationHint || 0)
// The elapsed time appears once playback has started; before that the label is the length alone.
const started = computed(() => playing.value || currentTime.value > 0)
const elapsedLabel = computed(() => formatTime(currentTime.value))
const totalLabel = computed(() => (total.value ? formatTime(total.value) : ''))

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00'
  return formatClock(Math.floor(sec))
}

async function loadPeaks(priority = false): Promise<void> {
  if (peaks.value.length > 0) return
  const cached = peaksCache.get(props.src)
  if (cached) {
    peaks.value = cached
    draw()
    return
  }
  try {
    peaks.value = await fetchAndComputePeaks(props.src, BAR_COUNT, priority)
  } catch {
    peaks.value = new Array(BAR_COUNT).fill(0.15)
  }
  draw()
}

function draw() {
  const canvas = canvasEl.value
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  const width = Math.max(1, rect.width)
  const height = Math.max(1, rect.height || 40)
  canvas.width = width * dpr
  canvas.height = height * dpr
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)

  const source = peaks.value.length ? peaks.value : new Array(BAR_COUNT).fill(0.1)
  // Show no more bars than fit at about 4 px apiece: a narrow waveform stays readable instead of overflowing.
  const target = Math.max(12, Math.floor(width / 4))
  const bars =
    target >= source.length
      ? source
      : Array.from({ length: target }, (_, i) => {
          const from = Math.floor((i * source.length) / target)
          const to = Math.max(from + 1, Math.floor(((i + 1) * source.length) / target))
          const slice = source.slice(from, to)
          return slice.reduce((a, b) => a + b, 0) / slice.length
        })
  const gap = 2
  const barWidth = Math.max(1, width / bars.length - gap)
  const progress = duration.value ? currentTime.value / duration.value : 0
  const progressX = width * progress

  const gradient = ctx.createLinearGradient(0, 0, width, 0)
  gradient.addColorStop(0, '#a855f7')
  gradient.addColorStop(1, '#ec4899')

  bars.forEach((v, i) => {
    const x = i * (barWidth + gap)
    const barHeight = Math.max(2, v * height)
    const y = (height - barHeight) / 2
    ctx.fillStyle = x <= progressX ? gradient : 'rgba(255,255,255,0.18)'
    ctx.fillRect(x, y, barWidth, barHeight)
  })
}

function togglePlay() {
  const audio = audioEl.value
  if (!audio) return
  if (playing.value) {
    audio.pause()
  } else {
    claimPlayback(audio)
    void audio.play()
    if (!peaks.value.length) {
      void loadPeaks(true)
    }
  }
}

function onLoaded() {
  if (audioEl.value) duration.value = audioEl.value.duration || 0
  draw()
}
function onTimeUpdate() {
  if (audioEl.value) currentTime.value = audioEl.value.currentTime
  draw()
}
function onEnded() {
  playing.value = false
  draw()
}

function onSeekClick(evt: MouseEvent) {
  const audio = audioEl.value
  const canvas = canvasEl.value
  if (!audio || !canvas || !duration.value) return
  const rect = canvas.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (evt.clientX - rect.left) / rect.width))
  audio.currentTime = ratio * duration.value
}

let resizeObserver: ResizeObserver | null = null
let intersectionObserver: IntersectionObserver | null = null

function observeVisibility() {
  intersectionObserver?.disconnect()
  intersectionObserver = null
  if (!canvasEl.value) return

  const cached = peaksCache.get(props.src)
  if (cached) {
    peaks.value = cached
    draw()
    return
  }

  if (typeof IntersectionObserver !== 'undefined') {
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          intersectionObserver?.disconnect()
          intersectionObserver = null
          void loadPeaks()
        }
      },
      { rootMargin: '200px' },
    )
    intersectionObserver.observe(canvasEl.value)
  } else {
    void loadPeaks()
  }
}

watch(
  () => props.src,
  () => {
    peaks.value = []
    duration.value = 0
    currentTime.value = 0
    draw()
    observeVisibility()
  },
)

onMounted(() => {
  draw()
  const audio = audioEl.value
  if (audio) {
    audio.addEventListener('play', () => {
      playing.value = true
    })
    audio.addEventListener('pause', () => {
      playing.value = false
    })
  }
  if (canvasEl.value) {
    resizeObserver = new ResizeObserver(() => draw())
    resizeObserver.observe(canvasEl.value)
    observeVisibility()
  }
})

onBeforeUnmount(() => {
  intersectionObserver?.disconnect()
  resizeObserver?.disconnect()
  if (audioEl.value) releasePlaybackIfCurrent(audioEl.value)
})
</script>

<template>
  <div class="flex items-center" :class="compact ? 'gap-2' : 'gap-3'">
    <button
      type="button"
      class="flex shrink-0 items-center justify-center rounded-full accent-gradient text-white"
      :class="compact ? 'h-7 w-7' : 'h-9 w-9'"
      :aria-label="playing ? t('waveformPlayer.pause') : t('waveformPlayer.play')"
      @click="togglePlay"
    >
      <PlayIcon v-if="!playing" :width="compact ? 11 : 14" :height="compact ? 11 : 14" />
      <PauseIcon v-else :width="compact ? 11 : 14" :height="compact ? 11 : 14" />
    </button>
    <canvas ref="canvasEl" class="min-w-0 flex-1 cursor-pointer rounded bg-panel-2" :class="compact ? 'h-7' : 'h-10'" @click="onSeekClick"></canvas>
    <span class="shrink-0 whitespace-nowrap text-right text-xs tabular-nums text-text-dim" :class="started ? (compact ? 'min-w-[3.75rem]' : 'min-w-[4.5rem]') : ''">
      <template v-if="started">{{ elapsedLabel }}</template>
      <span v-if="totalLabel" :class="totalClass">{{ started ? ` / ${totalLabel}` : totalLabel }}</span>
    </span>
    <audio ref="audioEl" :src="src" preload="none" class="hidden" @timeupdate="onTimeUpdate" @ended="onEnded" @loadedmetadata="onLoaded"></audio>
  </div>
</template>
