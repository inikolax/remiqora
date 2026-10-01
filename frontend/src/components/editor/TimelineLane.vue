<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ChannelSettings } from '../../audio/mixerEngine'
import type { Clip, TimelineLane } from '../../audio/timelineTypes'
import TimelineClip from './TimelineClip.vue'
import { TRACK_COLORS } from '../../utils/trackColors'

const props = defineProps<{
  lane: TimelineLane
  selected: boolean
  pxPerSecond: number
  buffers: Map<string, AudioBuffer>
  snapCandidates: number[]
  gridStepSec: number
  snapEnabled: boolean
  selectedClipId: string | null
  widthPx: number
  level: { peak: number; clipping: boolean; peakL: number; peakR: number }
}>()

const theme = computed(() => TRACK_COLORS.find(c => c.id === props.lane.colorId) || TRACK_COLORS[0])

const emit = defineEmits<{
  'update:settings': [settings: ChannelSettings]
  rename: [name: string]
  moveClip: [payload: { clipId: string; timelineStart: number }]
  trimClip: [payload: { clipId: string; trimStart: number; trimEnd: number; timelineStart: number }]
  fadeClip: [payload: { clipId: string; fadeInDuration?: number; fadeOutDuration?: number }]
  toggleWarp: [payload: { clipId: string; enabled: boolean }]
  toggleMute: [payload: { clipId: string; enabled: boolean }]
  toggleSolo: [payload: { clipId: string; enabled: boolean }]
  updateColor: [colorId: string]
  dragEnd: []
  selectClip: [clipId: string]
  removeClip: [clipId: string]
  removeLane: []
  dropAudio: [payload: { file: File; timelineStart: number }]
  selectLane: []
}>()

const { t } = useI18n()

const isDragOver = ref(false)

function onDrop(e: DragEvent) {
  isDragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const x = Math.max(0, e.clientX - rect.left)
  const timelineStart = Math.max(0, x / props.pxPerSecond)
  emit('dropAudio', { file, timelineStart })
}

import { useEditorStore } from '../../stores/editor'

const store = useEditorStore()

// Keyboard focus anywhere in the header selects the track, which is what
// brings up its channel strip. Mouse clicks on M/S/x keep not selecting it.
function onHeaderFocus(e: FocusEvent): void {
  const el = e.target as HTMLElement
  const isTextInput = el.tagName === 'INPUT' && (el as HTMLInputElement).type === 'text'
  if (isTextInput || el.matches(':focus-visible')) emit('selectLane')
}

function bufferFor(clip: Clip): AudioBuffer | null {
  if (!clip.sourceUrl) return null
  if (clip.warpEnabled && clip.originalBpm) {
    const key = `${clip.sourceUrl}_warp_${clip.originalBpm}_${store.project.bpm}`
    if (props.buffers.has(key)) return props.buffers.get(key) ?? null
  }
  return props.buffers.get(clip.sourceUrl) ?? null
}
</script>

<template>
  <div class="flex flex-1 min-h-[80px] border-b border-border/40 group hover:bg-white/[0.02] transition-colors">
    <div 
      class="w-56 min-w-0 shrink-0 flex flex-col justify-center gap-1.5 overflow-hidden border-r p-1.5 transition-colors cursor-pointer track-header sticky left-0 z-10 bg-panel-2"
      :class="selected ? '' : 'border-border/40'"
      @click="emit('selectLane')"
      @focusin="onHeaderFocus"
    >
      <div v-if="selected" class="absolute left-0 top-0 bottom-0 w-1 shadow-lg" :style="{ backgroundColor: theme.baseHex, boxShadow: `0 0 10px ${theme.baseHex}` }"></div>
      
      <!-- Row 1: Name, Mute, Solo -->
      <div class="flex items-center gap-1">
        <input
          :value="lane.name"
          :placeholder="t('timeline.trackNamePlaceholder')"
          class="flex-1 min-w-0 rounded border border-transparent bg-panel/50 px-1 py-0.5 text-[11px] font-medium text-text focus:border-accent1/50 focus:bg-panel focus:outline-none transition-colors"
          @input="emit('rename', ($event.target as HTMLInputElement).value)"
        />
        <button
          type="button"
          class="w-5 h-5 flex items-center justify-center rounded text-[9px] font-medium transition-all active:scale-95"
          :class="lane.settings.muted ? 'bg-status-failed text-white shadow-[0_0_8px_var(--color-status-failed)]' : 'bg-panel text-text-dim hover:text-white'"
          :aria-pressed="!!lane.settings.muted"
          :aria-label="t('timeline.muteTrack')"
          :title="t('timeline.muteTrack')"
          @click.stop="emit('update:settings', { ...lane.settings, muted: !lane.settings.muted })"
        >
          M
        </button>
        <button
          type="button"
          class="w-5 h-5 flex items-center justify-center rounded text-[9px] font-medium transition-all active:scale-95"
          :class="lane.settings.solo ? 'accent-gradient text-white shadow-[0_0_8px_var(--color-accent1)]' : 'bg-panel text-text-dim hover:text-white'"
          :aria-pressed="!!lane.settings.solo"
          :aria-label="t('timeline.soloTrack')"
          :title="t('timeline.soloTrack')"
          @click.stop="emit('update:settings', { ...lane.settings, solo: !lane.settings.solo })"
        >
          S
        </button>
      </div>

      <!-- Row 2: Vol, Range, Delete -->
      <div class="flex items-center gap-1.5 px-0.5">
        <span class="text-[8px] text-text-dim font-bold tracking-wider">{{ t('timeline.volume') }}</span>
        <input
          type="range"
          min="0" max="1.5" step="0.01"
          :value="lane.settings.volume"
          :aria-label="t('timeline.trackVolume', { name: lane.name })"
          @input="emit('update:settings', { ...lane.settings, volume: Number(($event.target as HTMLInputElement).value) })"
          class="flex-1 min-w-0 h-1 bg-panel-2 rounded-full appearance-none accent-accent1"
          @click.stop
        />
        <button
          type="button"
          class="w-4 h-4 flex items-center justify-center text-[10px] text-status-failed/60 hover:text-status-failed transition-colors ml-1"
          :aria-label="t('timeline.removeTrack')"
          :title="t('timeline.removeTrack')"
          @click.stop="emit('removeLane')"
        >
          ✕
        </button>
      </div>
    </div>

    <div
      class="relative isolate flex-1 overflow-hidden transition-colors ml-3"
      :class="isDragOver ? 'bg-accent1/10 ring-2 ring-inset ring-accent1' : ''"
      :style="{ minWidth: widthPx + 'px' }"
      @dragover.prevent="isDragOver = true"
      @dragleave="isDragOver = false"
      @drop.prevent="onDrop"
    >
      <!-- Grid background -->
      <div 
        class="pointer-events-none absolute inset-0 w-full"
        :style="{
          backgroundSize: (gridStepSec * pxPerSecond) + 'px 100%',
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px)'
        }"
      ></div>

      <!-- Drop hint overlay -->
      <div v-if="isDragOver" class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <span class="rounded-lg bg-accent1/80 px-4 py-2 text-sm font-medium text-white shadow-lg">
          {{ t('timeline.dropHint') }}
        </span>
      </div>
      <TimelineClip
        v-for="clip in lane.clips"
        :key="clip.id"
        :clip="clip"
        :px-per-second="pxPerSecond"
        :buffer="bufferFor(clip)"
        :snap-candidates="snapCandidates"
        :grid-step-sec="gridStepSec"
        :snap-enabled="snapEnabled"
        :selected="selectedClipId === clip.id"
        :lane-name="lane.name"
        :theme="theme"
        @move="(timelineStart) => emit('moveClip', { clipId: clip.id, timelineStart })"
        @trim="(payload) => emit('trimClip', { clipId: clip.id, ...payload })"
        @fade="(payload) => emit('fadeClip', { clipId: clip.id, ...payload })"
        @toggle-warp="(enabled) => emit('toggleWarp', { clipId: clip.id, enabled })"
        @toggle-mute="(enabled) => emit('toggleMute', { clipId: clip.id, enabled })"
        @toggle-solo="(enabled) => emit('toggleSolo', { clipId: clip.id, enabled })"
        @drag-end="emit('dragEnd')"
        @select="emit('selectClip', clip.id)"
        @remove="emit('removeClip', clip.id)"
      />
    </div>
  </div>
</template>
