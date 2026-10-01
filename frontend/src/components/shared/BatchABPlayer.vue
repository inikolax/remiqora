<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { claimPlayback, releasePlaybackIfCurrent } from '../../composables/audioPlayback'
import PlayIcon from './icons/PlayIcon.vue'
import PauseIcon from './icons/PauseIcon.vue'

const { t } = useI18n()

const props = defineProps<{
  sources: string[]
  labels?: string[]
  durationSec?: number | null
  /** The card has its own tagged download buttons, so this player's plain link is hidden. */
  hideDownload?: boolean
}>()

const activeIndex = ref(0)
const playing = ref(false)
const currentTime = ref(0)
const duration = ref(props.durationSec || 0)
const audioEls = ref<(HTMLAudioElement | null)[]>([])

const currentSrc = computed(() => props.sources[activeIndex.value] || '')

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function getAudio(index: number): HTMLAudioElement | null {
  return audioEls.value[index] ?? null
}

function onLoadedMetadata(index: number) {
  const el = getAudio(index)
  if (el && el.duration && (!duration.value || index === activeIndex.value)) {
    duration.value = el.duration
  }
}

function onTimeUpdate(index: number) {
  if (index === activeIndex.value) {
    const el = getAudio(index)
    if (el) currentTime.value = el.currentTime
  }
}

function onEnded() {
  playing.value = false
  currentTime.value = 0
  const el = getAudio(activeIndex.value)
  if (el) releasePlaybackIfCurrent(el)
}

function togglePlay() {
  const el = getAudio(activeIndex.value)
  if (!el) return
  if (playing.value) {
    el.pause()
    playing.value = false
    releasePlaybackIfCurrent(el)
  } else {
    claimPlayback(el)
    el.play().then(() => {
      playing.value = true
    }).catch(() => {
      playing.value = false
    })
  }
}

function switchVariant(newIndex: number) {
  if (newIndex === activeIndex.value || newIndex < 0 || newIndex >= props.sources.length) return
  const prevIndex = activeIndex.value
  const prevAudio = getAudio(prevIndex)
  const nextAudio = getAudio(newIndex)
  const pos = prevAudio ? prevAudio.currentTime : currentTime.value

  activeIndex.value = newIndex

  if (nextAudio) {
    try {
      nextAudio.currentTime = pos
    } catch {}

    if (playing.value) {
      claimPlayback(nextAudio)
      nextAudio.play().catch(() => {})
      if (prevAudio) prevAudio.pause()
    }
  } else if (prevAudio && playing.value) {
    prevAudio.pause()
    playing.value = false
  }
}

function onSeek(e: Event) {
  const val = Number((e.target as HTMLInputElement).value)
  currentTime.value = val
  const el = getAudio(activeIndex.value)
  if (el) el.currentTime = val
}

function downloadCurrent() {
  const url = currentSrc.value
  if (!url) return
  const a = document.createElement('a')
  a.href = url
  a.download = `variant_${activeIndex.value + 1}_${Date.now()}.mp3`
  a.click()
}

watch(
  () => props.sources,
  () => {
    if (activeIndex.value >= props.sources.length) {
      activeIndex.value = 0
    }
  },
)

onBeforeUnmount(() => {
  for (const el of audioEls.value) {
    if (el) {
      el.pause()
      releasePlaybackIfCurrent(el)
      el.src = ''
    }
  }
})
</script>

<template>
  <div class="space-y-2 rounded-xl border border-border bg-panel-2 p-3">
    <!-- Hidden audio elements for zero-latency seamless A/B switching -->
    <audio
      v-for="(src, idx) in sources"
      :key="src"
      :ref="(el) => (audioEls[idx] = el as HTMLAudioElement)"
      :src="src"
      preload="auto"
      @loadedmetadata="onLoadedMetadata(idx)"
      @timeupdate="onTimeUpdate(idx)"
      @ended="onEnded"
    />

    <div class="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
      <div class="flex items-center gap-1.5">
        <span class="text-xs font-medium text-text-dim">{{ t('batchAB.compareLabel') }}</span>
        <div class="flex flex-wrap gap-1">
          <button
            v-for="(src, idx) in sources"
            :key="src"
            type="button"
            class="rounded-lg px-2.5 py-1 text-xs font-medium transition-all"
            :class="
              idx === activeIndex
                ? 'accent-gradient text-white shadow-sm ring-1 ring-accent1/50'
                : 'border border-border bg-panel text-text-dim hover:text-text'
            "
            @click="switchVariant(idx)"
          >
            {{ labels?.[idx] || t('batchAB.variant', { n: idx + 1 }) }}
          </button>
        </div>
      </div>

      <button
        v-if="!hideDownload"
        type="button"
        class="text-xs text-accent1 hover:underline"
        :title="t('batchAB.downloadTitle')"
        @click="downloadCurrent"
      >
        {{ t('batchAB.downloadVariant', { n: activeIndex + 1 }) }}
      </button>
    </div>

    <!-- Playback bar -->
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full accent-gradient text-white transition hover:opacity-90"
        @click="togglePlay"
      >
        <PlayIcon v-if="!playing" class="w-[13px] h-[13px]" />
        <PauseIcon v-else class="w-[13px] h-[13px]" />
      </button>

      <span class="w-20 shrink-0 text-xs tabular-nums text-text-dim">
        {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
      </span>

      <input
        type="range"
        min="0"
        :max="duration || 1"
        step="0.05"
        :value="currentTime"
        class="h-2 flex-1 cursor-pointer accent-current"
        @input="onSeek"
      />
    </div>
  </div>
</template>
