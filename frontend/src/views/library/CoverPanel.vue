<script setup lang="ts">
// The track's cover in the head of its details: a small square (captioned when it has a caption; a tile while it
// has none) that is also the player - a round play button at its bottom start, a thin line along its bottom edge
// while the track plays (click or arrows to seek). A click on the picture opens the cover studio (the big preview,
// another picture, remove, the caption); so does the pencil at its top end. While a cover is made the square pulses
// and shows how far it is. Only while covers are on (the parent checks); a track in the trash shows its cover and
// plays, nothing else.
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import CoverCaptioned from '../../components/shared/CoverCaptioned.vue'
import PlayIcon from '../../components/shared/icons/PlayIcon.vue'
import PauseIcon from '../../components/shared/icons/PauseIcon.vue'
import RepaintIcon from '../../components/shared/icons/RepaintIcon.vue'
import CoverStudio from './CoverStudio.vue'
import ProgressLine from './ProgressLine.vue'
import { useCoversStore } from '../../stores/covers'
import type { LibTrack } from './libraryTracks'

const props = defineProps<{ track: LibTrack; title: string; readonly?: boolean; current: boolean; playing: boolean }>()
const emit = defineEmits<{ play: [] }>()
const { t } = useI18n()
const covers = useCoversStore()

const savedCaption = computed(() => covers.captionFor(props.track.id))
const capDefaults = computed(() => covers.defaultsFor(props.track.id, { title: props.track.title, createdAt: props.track.createdAt }))
const job = computed(() => covers.busyFor(props.track.id))
const jobPct = computed(() => (job.value?.status === 'running' && job.value.progress != null ? Math.round(job.value.progress * 100) : null))

const studio = ref(false)
/** What the studio did, read out once it closes (saved, removed). */
const note = ref('')
function openStudio(): void {
  note.value = ''
  studio.value = true
}
function onStudioClose(text: string): void {
  studio.value = false
  note.value = text
}
watch(() => props.track.id, () => { note.value = '' })

const ROUND = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1'
</script>

<template>
  <div class="relative aspect-square overflow-hidden rounded-lg bg-panel-2 shadow-inner">
    <CoverCaptioned
      v-if="readonly" :track-id="track.id" :title="title" :caption="savedCaption" :defaults="capDefaults" placeholder class="absolute inset-0 h-full w-full"
    />
    <button
      v-else type="button" class="group absolute inset-0 block h-full w-full rounded-lg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent1"
      :aria-label="t('covers.studio.openFor', { title })" :title="t('covers.studio.open')" @click="openStudio"
    >
      <CoverCaptioned :track-id="track.id" :title="title" :caption="savedCaption" :defaults="capDefaults" placeholder decorative class="h-full w-full" />
      <span class="pointer-events-none absolute inset-0 transition-colors group-hover:bg-black/10 motion-reduce:transition-none" aria-hidden="true"></span>
    </button>

    <!-- a shade at the bottom so the round button reads on a light picture -->
    <span class="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" aria-hidden="true"></span>

    <!-- the cover being made: how far -->
    <span
      v-if="job" class="pointer-events-none absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium tabular-nums text-white rtl:translate-x-1/2"
      aria-hidden="true"
    >{{ jobPct != null ? `${jobPct}%` : '…' }}</span>

    <button
      v-if="!readonly" type="button"
      class="absolute end-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur-sm hover:bg-black/70"
      :class="ROUND" :aria-label="t('covers.studio.open')" :title="t('covers.studio.open')" @click="openStudio"
    ><RepaintIcon class="h-3.5 w-3.5" /></button>

    <button
      type="button" class="accent-gradient absolute bottom-[11px] start-2 flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md shadow-black/40"
      :class="ROUND" :aria-label="playing ? t('create.pause') : t('create.play')" :title="playing ? t('create.pause') : t('create.play')" @click="emit('play')"
    >
      <PauseIcon v-if="playing" class="h-4 w-4" />
      <PlayIcon v-else class="h-4 w-4" />
    </button>

    <!-- where the track is: a thin line along the bottom edge -->
    <ProgressLine v-if="current" on-cover class="absolute inset-x-0 bottom-0 h-2" />

    <p class="sr-only" role="status" aria-live="polite">{{ note }}</p>
    <CoverStudio v-if="studio" :track="track" :title="title" @close="onStudioClose" />
  </div>
</template>
