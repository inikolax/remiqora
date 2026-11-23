<script setup lang="ts">
// Where the playing track is, as a thin line (3 px) on a taller strip to hit: a click or a drag puts the track
// there, the arrows move it 5 s, Page Up/Down 30 s, Home/End to the ends. The parent places and sizes the strip;
// `onCover` draws the track's rest in white over a picture instead of the slider tone.
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePlayerStore } from '../../stores/player'
import { formatClock } from '../../composables/formatCreated'

defineProps<{ onCover?: boolean }>()
const { t } = useI18n()
const player = usePlayerStore()
const el = ref<HTMLElement | null>(null)

const rtl = (): boolean => !!el.value && getComputedStyle(el.value).direction === 'rtl'
function seekAt(e: PointerEvent): void {
  if (!el.value) return
  const r = el.value.getBoundingClientRect()
  const x = rtl() ? r.right - e.clientX : e.clientX - r.left
  player.seek(Math.max(0, Math.min(1, x / r.width)))
}
function onDown(e: PointerEvent): void {
  el.value?.setPointerCapture(e.pointerId)
  seekAt(e)
}
function onMove(e: PointerEvent): void {
  if (el.value?.hasPointerCapture(e.pointerId)) seekAt(e)
}
function onKey(e: KeyboardEvent): void {
  const total = player.total
  if (!total) return
  const s = 5 / total
  let d: number | null = null
  if (e.key === 'ArrowRight') d = rtl() ? -s : s
  else if (e.key === 'ArrowLeft') d = rtl() ? s : -s
  else if (e.key === 'ArrowUp') d = s
  else if (e.key === 'ArrowDown') d = -s
  else if (e.key === 'PageUp') d = 6 * s
  else if (e.key === 'PageDown') d = -6 * s
  if (e.key === 'Home') player.seek(0)
  else if (e.key === 'End') player.seek(0.999)
  else if (d != null) player.seek(Math.max(0, Math.min(1, player.progress + d)))
  else return
  e.preventDefault()
}
</script>

<template>
  <div
    ref="el" role="slider" tabindex="0" :aria-label="t('create.position')"
    :aria-valuemin="0" :aria-valuemax="Math.round(player.total)" :aria-valuenow="Math.round(player.time)"
    :aria-valuetext="`${formatClock(player.time)} / ${formatClock(player.total)}`"
    class="group/bar cursor-pointer touch-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent1"
    @pointerdown.prevent="onDown" @pointermove="onMove" @keydown="onKey"
  >
    <span
      class="absolute inset-x-0 bottom-0 h-[3px] overflow-hidden transition-[height] group-hover/bar:h-1 motion-reduce:transition-none"
      :class="onCover ? 'bg-white/20' : 'rounded-full bg-slider-track/50'" aria-hidden="true"
    >
      <span class="absolute inset-y-0 start-0 bg-gradient-to-r from-accent1 to-accent2 rtl:bg-gradient-to-l" :style="{ width: `${player.progress * 100}%` }"></span>
    </span>
  </div>
</template>
