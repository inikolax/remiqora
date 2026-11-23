<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatClock, formatCreated } from '../../composables/formatCreated'
import type { LibTrack } from './libraryTracks'
import SelectBox from './SelectBox.vue'
import PlayIcon from '../../components/shared/icons/PlayIcon.vue'
import PauseIcon from '../../components/shared/icons/PauseIcon.vue'
import ReuseIcon from '../../components/shared/icons/ReuseIcon.vue'

/**
 * The trash: deleted tracks, the most recently deleted first, until they go for good after 30 days. A row plays,
 * opens the details (restore, delete for good) and ticks for the bulk bar; the details of the chosen row come
 * through the `details` slot on a narrow window.
 */
defineProps<{
  rows: LibTrack[]
  /** Tracks the search finds, and all the tracks in the trash. */
  total: number
  inTrash: number
  selectedId: number | null
  checked: (id: number) => boolean
  anySelected: boolean
  playing: (track: LibTrack) => boolean
  originLabel: (track: LibTrack) => string
  showDetails: boolean
  /** The trash is still being read: a skeleton, not "The trash is empty". */
  loading?: boolean
}>()
const emit = defineEmits<{ open: [track: LibTrack]; play: [track: LibTrack]; restore: [track: LibTrack]; check: [track: LibTrack, shift: boolean]; empty: []; more: [] }>()
const { t } = useI18n()

// Emptying the trash takes two clicks: the first one arms the button for a few seconds.
const armed = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null
function disarm(): void {
  armed.value = false
  if (timer) clearTimeout(timer)
  timer = null
}
function onEmpty(): void {
  if (armed.value) {
    disarm()
    emit('empty')
    return
  }
  armed.value = true
  timer = setTimeout(disarm, 4000)
}
onBeforeUnmount(disarm)
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-4 py-2 text-xs">
      <p class="min-w-0 flex-1 text-text-dim">{{ t('libraryPage.trash.note') }}</p>
      <button
        v-if="inTrash" type="button" class="rounded-lg border px-2.5 py-1 transition-colors"
        :class="armed ? 'border-status-failed/60 bg-status-failed/10 font-medium text-status-failed' : 'border-border text-text-dim hover:text-status-failed'"
        @click="onEmpty" @blur="disarm"
      >{{ armed ? t('libraryPage.trash.confirmEmpty') : t('libraryPage.trash.empty') }}</button>
    </div>

    <!-- loading: still rows, no animation, and the words for a screen reader -->
    <div v-if="loading" class="p-2">
      <p class="px-2.5 py-1 text-xs text-text-dim" role="status">{{ t('libraryPage.trash.loading') }}</p>
      <div v-for="n in 3" :key="n" class="flex h-12 items-center gap-3 px-2" aria-hidden="true">
        <span class="h-8 w-8 shrink-0 rounded-full bg-panel-2"></span>
        <span class="h-3 w-1/3 rounded bg-panel-2"></span>
        <span class="h-3 flex-1 rounded bg-panel-2"></span>
      </div>
    </div>
    <div v-else-if="!rows.length" class="p-10 text-center">
      <p class="text-sm font-medium text-text">{{ inTrash ? t('libraryPage.nothingFound') : t('libraryPage.trash.emptyHere') }}</p>
      <p class="mt-1 text-sm text-text-dim">{{ inTrash ? t('libraryPage.nothingFoundHint') : t('libraryPage.trash.emptyHint') }}</p>
    </div>

    <div v-else class="p-2">
      <template v-for="track in rows" :key="track.id">
        <div
          class="group flex min-h-12 max-w-[56rem] cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1.5"
          :class="selectedId === track.id ? 'bg-accent1/15' : checked(track.id) ? 'bg-accent1/[0.07]' : 'hover:bg-panel-2/70'"
          @click="emit('open', track)"
        >
          <SelectBox
            class="transition-opacity" :class="anySelected || checked(track.id) ? '' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 max-sm:opacity-100 pointer-coarse:opacity-100'"
            :state="checked(track.id)" :label="t('libraryPage.bulk.selectTrack', { title: track.shortTitle || t('create.untitled') })"
            @toggle="(shift) => emit('check', track, shift)"
          />
          <button
            type="button" class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors"
            :class="playing(track) ? 'accent-gradient text-white' : 'border border-border text-text hover:border-accent1/60'"
            :aria-label="playing(track) ? t('create.pause') : t('create.play')" @click.stop="emit('play', track)"
          >
            <PauseIcon v-if="playing(track)" class="h-3.5 w-3.5" />
            <PlayIcon v-else class="h-3.5 w-3.5" />
          </button>
          <div class="ms-1 min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-text">{{ track.shortTitle || t('create.untitled') }}</p>
            <p class="truncate text-xs text-text-dim">
              <span v-if="track.deletedAt" :title="formatCreated(track.deletedAt).full">{{ t('libraryPage.trash.deleted', { when: formatCreated(track.deletedAt).label }) }}</span>
            </p>
          </div>
          <!-- Restore on hover (always on touch); the details hold it too -->
          <button
            type="button" class="restore inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border px-2 text-xs text-text hover:bg-panel focus-visible:outline-2 focus-visible:outline-accent1"
            :title="t('libraryPage.trash.restore')" :aria-label="`${t('libraryPage.trash.restore')}: ${track.shortTitle || t('create.untitled')}`" @click.stop="emit('restore', track)"
          ><ReuseIcon class="h-3.5 w-3.5" /><span class="hidden sm:inline">{{ t('libraryPage.trash.restore') }}</span></button>
          <span class="hidden w-24 shrink-0 sm:block"><span class="rounded-md border border-border px-1.5 py-px text-xs font-medium leading-4 text-text-dim">{{ originLabel(track) }}</span></span>
          <span class="w-10 shrink-0 text-end text-xs tabular-nums text-text-dim">{{ track.durationSec ? formatClock(track.durationSec) : '' }}</span>
        </div>
        <slot v-if="showDetails && selectedId === track.id" name="details" :track="track" />
      </template>
      <button v-if="total > rows.length" type="button" class="mt-2 w-full rounded-lg border border-border py-2.5 text-sm text-text-dim hover:bg-panel-2 hover:text-text" @click="emit('more')">
        {{ t('create.showMore', { n: total - rows.length }) }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* with a mouse, Restore waits for the pointer or the keyboard on its row */
@media (hover: hover) {
  .restore { opacity: 0; transition: opacity 0.12s; }
  .group:hover .restore, .group:focus-within .restore { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .restore { transition: none; }
}
</style>
