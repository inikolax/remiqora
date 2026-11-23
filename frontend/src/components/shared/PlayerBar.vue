<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { usePlayerStore } from '../../stores/player'
import { formatClock } from '../../composables/formatCreated'
import { downloadSavedTrack } from '../../composables/useTrackDownload'
import MiniWave from './MiniWave.vue'
import FavoriteStar from './FavoriteStar.vue'
import CoverThumb from './CoverThumb.vue'
import PlayIcon from './icons/PlayIcon.vue'
import PauseIcon from './icons/PauseIcon.vue'
import DownloadIcon from './icons/DownloadIcon.vue'

/** The player at the bottom of the window: what plays keeps playing while you move between pages. */
const { t } = useI18n()
const player = usePlayerStore()
// under a wide page (route meta, see App.vue) the player keeps that page's edges, not the narrow column's
const route = useRoute()
const wide = computed(() => route.meta.wide === true)

function toggle(): void {
  if (player.track) player.toggle(player.track)
}
function download(): void {
  const track = player.track
  if (!track) return
  const name = track.filename || `${track.title}.wav`
  if (track.dbId != null) {
    void downloadSavedTrack(track.dbId, name)
    return
  }
  const a = document.createElement('a')
  a.href = track.src
  a.download = name
  a.click()
}
// ---- the volume: a slider and mute, kept between visits; it is the bar's own element, other players keep theirs ----
const VOLUME_KEY = 'remiqora.player.volume'
const MUTED_KEY = 'remiqora.player.muted'
function readNumber(key: string, fallback: number): number {
  try { const v = Number(localStorage.getItem(key)); return localStorage.getItem(key) != null && Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : fallback } catch { return fallback }
}
function readFlag(key: string): boolean {
  try { return localStorage.getItem(key) === '1' } catch { return false }
}
const volume = ref(readNumber(VOLUME_KEY, 1))
const muted = ref(readFlag(MUTED_KEY))
function applyVolume(): void {
  const el = player._audio()
  el.volume = volume.value
  el.muted = muted.value
}
onMounted(applyVolume)
watch([volume, muted], () => {
  applyVolume()
  try {
    localStorage.setItem(VOLUME_KEY, String(Math.round(volume.value * 100) / 100))
    localStorage.setItem(MUTED_KEY, muted.value ? '1' : '0')
  } catch { /* private window */ }
})
function onVolume(e: Event): void {
  volume.value = Number((e.target as HTMLInputElement).value) / 100
  // moving the slider up brings the sound back
  if (volume.value > 0 && muted.value) muted.value = false
}
const silent = computed(() => muted.value || volume.value === 0)
function toggleMute(): void {
  if (silent.value && volume.value === 0) volume.value = 0.5
  muted.value = !silent.value
}

/** ← and → move 5 s while the focus is in the player (mirrored right to left); the volume slider keeps its arrows. */
function onKey(e: KeyboardEvent): void {
  if (e.altKey || e.ctrlKey || e.metaKey || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return
  const target = e.target as HTMLElement | null
  if (target instanceof HTMLInputElement && target.dataset.volume != null) return
  const total = player.total
  if (!total) return
  e.preventDefault()
  e.stopPropagation()
  const rtl = !!target && getComputedStyle(target).direction === 'rtl'
  const step = (e.key === 'ArrowRight') !== rtl ? 5 : -5
  player.seek(Math.max(0, Math.min(total, player.time + step)) / total)
}

const ICON_BTN = 'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-text-dim hover:bg-panel-2 hover:text-text disabled:opacity-40 disabled:hover:bg-transparent'
</script>

<template>
  <div v-if="player.track" class="sticky bottom-0 z-30 border-t border-border bg-bg/95 backdrop-blur" role="region" :aria-label="t('player.label')" @keydown.capture="onKey">
    <!-- a phone has no room for the waveform: a thin seek bar with the time and the length keeps both in reach -->
    <div class="flex items-center gap-2 px-4 pt-2 text-[11px] tabular-nums text-text-dim sm:hidden">
      <span class="w-9 shrink-0">{{ formatClock(Math.floor(player.time)) }}</span>
      <input
        type="range" class="player-seek h-6 min-w-0 flex-1" min="0" max="1000" step="1"
        :value="Math.round(player.progress * 1000)" :disabled="!player.total"
        :aria-label="t('create.position')" :aria-valuetext="`${formatClock(Math.floor(player.time))} / ${formatClock(Math.floor(player.total))}`"
        :style="{ '--seek': `${player.progress * 100}%` }"
        @input="player.seek(Number(($event.target as HTMLInputElement).value) / 1000)"
      />
      <span class="w-9 shrink-0 text-end">{{ player.total ? formatClock(Math.floor(player.total)) : '' }}</span>
    </div>
    <div class="mx-auto flex w-full items-center gap-3 px-4 py-2.5 sm:gap-4 sm:px-6" :class="wide ? 'max-w-[1920px] 2xl:px-8' : 'max-w-7xl'">
      <button type="button" :class="[ICON_BTN, 'hidden border-transparent sm:flex']" :title="t('player.prev')" :aria-label="t('player.prev')" @click="player.prev()">
        <svg viewBox="0 0 24 24" class="h-4 w-4 rtl:-scale-x-100" fill="currentColor" aria-hidden="true"><path d="M18 5.5v13l-9-6.5z" /><rect x="5.3" y="5" width="2.2" height="14" rx="1" /></svg>
      </button>
      <button
        type="button" class="accent-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
        :aria-label="player.playing ? t('create.pause') : t('create.play')" :title="player.playing ? t('create.pause') : t('create.play')" @click="toggle"
      >
        <PauseIcon v-if="player.playing" class="h-4 w-4" />
        <PlayIcon v-else class="h-4 w-4" />
      </button>
      <button type="button" :class="[ICON_BTN, 'border-transparent']" :disabled="!player.hasNext" :title="t('player.next')" :aria-label="t('player.next')" @click="player.next()">
        <svg viewBox="0 0 24 24" class="h-4 w-4 rtl:-scale-x-100" fill="currentColor" aria-hidden="true"><path d="M6 5.5v13l9-6.5z" /><rect x="16.5" y="5" width="2.2" height="14" rx="1" /></svg>
      </button>
      <!-- the track's cover, when it has one and covers are on -->
      <CoverThumb :track-id="player.track.dbId" :title="player.track.title" class="h-10 w-10 rounded-md" />
      <div class="min-w-0 flex-1 sm:w-56 sm:flex-none">
        <p class="truncate text-sm font-semibold text-text">{{ player.track.title }}</p>
        <p class="truncate text-xs text-text-dim">{{ player.track.sub }}</p>
      </div>
      <span class="hidden w-10 shrink-0 text-end text-xs tabular-nums text-text-dim sm:block">{{ formatClock(Math.floor(player.time)) }}</span>
      <MiniWave class="hidden min-w-0 flex-1 sm:block" :src="player.track.src" :progress="player.progress" :duration="player.total || undefined" seekable :label="t('create.position')" @seek="player.seek" />
      <span class="hidden shrink-0 text-xs tabular-nums text-text-dim sm:block sm:w-10">{{ player.total ? formatClock(Math.floor(player.total)) : '' }}</span>
      <!-- the volume: mute, and a slider from md (a phone has its own buttons for that) -->
      <div class="hidden shrink-0 items-center gap-1 sm:flex">
        <button type="button" :class="[ICON_BTN, 'border-transparent']" :aria-pressed="silent" :title="silent ? t('player.unmute') : t('player.mute')" :aria-label="silent ? t('player.unmute') : t('player.mute')" @click="toggleMute">
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" stroke="none" />
            <template v-if="silent"><path d="m16 9 5 6M21 9l-5 6" /></template>
            <template v-else><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path v-if="volume > 0.5" d="M18.5 5.5a9 9 0 0 1 0 13" /></template>
          </svg>
        </button>
        <input
          type="range" data-volume class="player-seek hidden h-6 w-20 md:block" min="0" max="100" step="1"
          :value="Math.round((muted ? 0 : volume) * 100)" :aria-label="t('player.volume')" :aria-valuetext="`${Math.round((muted ? 0 : volume) * 100)}%`"
          :style="{ '--seek': `${(muted ? 0 : volume) * 100}%` }" @input="onVolume"
        />
      </div>
      <FavoriteStar :track-id="player.track.dbId" bordered />
      <button type="button" :class="ICON_BTN" :title="t('trackCard.downloadTagged')" :aria-label="t('trackCard.downloadTagged')" @click="download"><DownloadIcon class="h-4 w-4" /></button>
      <button type="button" :class="ICON_BTN" :title="t('player.close')" :aria-label="t('player.close')" @click="player.close()">✕</button>
    </div>
  </div>
</template>

<style scoped>
/* The phone's seek bar: the played part in the accent, the rest the slider track (the global range style). */
.player-seek::-webkit-slider-runnable-track {
  background: linear-gradient(to right, var(--color-accent1) var(--seek, 0%), var(--color-slider-track) var(--seek, 0%));
}
.player-seek:dir(rtl)::-webkit-slider-runnable-track {
  background: linear-gradient(to left, var(--color-accent1) var(--seek, 0%), var(--color-slider-track) var(--seek, 0%));
}
.player-seek::-moz-range-track { background: var(--color-slider-track); height: 4px; border-radius: 99px; }
.player-seek::-moz-range-progress { background: var(--color-accent1); height: 4px; border-radius: 99px; }
</style>
