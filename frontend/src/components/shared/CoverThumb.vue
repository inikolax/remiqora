<script setup lang="ts">
// A track's album cover at any size (the size and rounding come from the class the parent gives). Covers off:
// nothing at all. No cover: a neutral tile in the app's purple-pink with five bars from the track's id (as
// TrackCover), or nothing when `placeholder` is not asked for. A broken image falls back to the tile too.
// While a cover is being made for the track, the tile pulses.
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCoversStore } from '../../stores/covers'
import { thumbUrl } from '../../api/covers'

const props = withDefaults(defineProps<{
  trackId: number | null | undefined
  /** The track's title, for the image's alt text. */
  title: string
  /** Show the tile when the track has no cover. */
  placeholder?: boolean
  /** The full picture instead of the 256 px thumbnail. */
  full?: boolean
}>(), { placeholder: false, full: false })

const { t } = useI18n()
const covers = useCoversStore()
const url = computed(() => covers.urlFor(props.trackId))
const broken = ref(false)
watch(url, () => { broken.value = false })
const src = computed(() => (url.value && !broken.value ? (props.full ? url.value : thumbUrl(url.value)) : null))
const busy = computed(() => !!covers.busyFor(props.trackId))
const shown = computed(() => covers.enabled && (!!src.value || props.placeholder || busy.value))

const bars = computed(() => {
  let h = 2166136261
  for (const ch of String(props.trackId ?? 0)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0
  return Array.from({ length: 5 }, () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0
    return 0.3 + ((h >>> 9) % 70) / 100 // 0.3 .. 1.0
  })
})
/** A turn of the gradient's hue from the id, within the app's purple-pink, so neighbouring tiles differ. */
const hue = computed(() => (((Number(props.trackId ?? 0) * 47) % 70) - 35))
</script>

<template>
  <span v-if="shown" class="relative block shrink-0 overflow-hidden bg-panel-2">
    <img v-if="src" :src="src" :alt="t('covers.alt', { title })" class="h-full w-full object-cover" loading="lazy" decoding="async" draggable="false" @error="broken = true" />
    <span v-else class="accent-gradient flex h-full w-full items-end justify-center gap-[12%] p-[22%] opacity-80" :style="{ filter: `hue-rotate(${hue}deg)` }" aria-hidden="true">
      <span v-for="(b, i) in bars" :key="i" class="w-[10%] rounded-full bg-white/80" :style="{ height: `${Math.round(b * 100)}%` }"></span>
    </span>
    <span v-if="busy" class="absolute inset-0 animate-pulse bg-white/25 motion-reduce:animate-none" aria-hidden="true"></span>
  </span>
</template>
