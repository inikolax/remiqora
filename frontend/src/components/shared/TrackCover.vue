<script setup lang="ts">
// A stand-in for cover art: a rounded tile in the app's purple-pink with five equalizer bars whose heights
// come from the track's id, so every track gets its own recognisable mark. A real cover can replace it later.
import { computed } from 'vue'

const props = defineProps<{ seed: string | number; busy?: boolean; failed?: boolean }>()

const bars = computed(() => {
  let h = 2166136261
  for (const ch of String(props.seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0
  return Array.from({ length: 5 }, () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0
    return 0.3 + ((h >>> 9) % 70) / 100 // 0.3 .. 1.0
  })
})
</script>

<template>
  <div
    class="flex h-12 w-12 shrink-0 items-end justify-center gap-[3px] overflow-hidden rounded-xl p-2.5 shadow-inner @min-[640px]:h-20 @min-[640px]:w-20 @min-[640px]:gap-1 @min-[640px]:rounded-2xl @min-[640px]:p-4"
    :class="[failed ? 'bg-status-failed/80' : 'accent-gradient', busy ? 'animate-pulse' : '']"
    aria-hidden="true"
  >
    <span v-for="(b, i) in bars" :key="i" class="w-[4px] rounded-full bg-white/85 @min-[640px]:w-1.5" :style="{ height: `${Math.round(b * 100)}%` }"></span>
  </div>
</template>
