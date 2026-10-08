<script setup lang="ts">
// "Add a clip": a file from the computer (dropped or chosen) or a library track, as one clip or as stems.
// Every row can be heard first: one shared <audio> plays the preview, with a seek bar under the row.
// AI arranger variants (working files of projects) are kept out of "All" under a filter of their own.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDialogA11y } from '../../composables/useDialogA11y'
import * as tracksApi from '../../api/tracks'
import type { SavedTrack } from '../../api/tracks'
import PauseIcon from '../shared/icons/PauseIcon.vue'
import PlayIcon from '../shared/icons/PlayIcon.vue'
import PlusIcon from '../shared/icons/PlusIcon.vue'
import SearchIcon from '../shared/icons/SearchIcon.vue'
import SplitStemsIcon from '../shared/icons/SplitStemsIcon.vue'
import UploadIcon from '../shared/icons/UploadIcon.vue'

const { t, locale } = useI18n()

/** asStems: add as stem lanes (the editor splits the new lane; Demucs runs if the track has no stems yet). */
const emit = defineEmits<{
  pick: [payload: { sourceUrl: string; sourceLabel: string; asStems?: boolean }]
  close: []
}>()

const dialogEl = ref<HTMLElement | null>(null)
const { onKeydown } = useDialogA11y(dialogEl, () => true, () => emit('close'))

const tracks = ref<SavedTrack[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    tracks.value = await tracksApi.listTracks()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
})

// ---- Search and source filter ----
type Filter = 'all' | SavedTrack['model'] | 'ai'
const FILTERS = ['all', 'ace_step', 'yue2', 'editor', 'ai', 'upload'] as const
/** A variant the AI arranger saved: a working file of a project, so it stays out of "All" and "Editor". */
function isAiVariant(trk: SavedTrack): boolean {
  return trk.model === 'editor' && !!trk.params?.ai_part
}
function groupOf(trk: SavedTrack): Exclude<Filter, 'all'> {
  return isAiVariant(trk) ? 'ai' : trk.model
}
const filter = ref<Filter>('all')
/** Only tracks already split into stems (they add as stems at once, without Demucs). */
const withStems = ref(false)
const query = ref('')
const counts = computed(() => {
  const c: Record<string, number> = { all: 0 }
  for (const trk of tracks.value) {
    const g = groupOf(trk)
    c[g] = (c[g] ?? 0) + 1
    if (g !== 'ai') c.all++
  }
  return c
})
function inFilter(trk: SavedTrack): boolean {
  return filter.value === 'all' ? !isAiVariant(trk) : groupOf(trk) === filter.value
}
/** Sources the library actually has; "all" always. */
const filters = computed(() => FILTERS.filter((f) => f === 'all' || counts.value[f]))
const visible = computed(() => {
  const q = query.value.trim().toLowerCase()
  return tracks.value.filter((trk) =>
    inFilter(trk)
    && (!withStems.value || hasStems(trk))
    && (!q || titleOf(trk).toLowerCase().includes(q)))
})

const STEM_ORDER = ['vocals', 'drums', 'bass', 'other']
const STEM_LABELS = computed<Record<string, string>>(() => ({
  vocals: t('library.stems.vocals'),
  drums: t('library.stems.drums'),
  bass: t('library.stems.bass'),
  other: t('library.stems.other'),
}))
function hasStems(trk: SavedTrack): boolean {
  return !!trk.stems && Object.keys(trk.stems).length > 0
}
const stemsCount = computed(() => tracks.value.filter((trk) => inFilter(trk) && hasStems(trk)).length)
function stemNames(trk: SavedTrack): string[] {
  const names = Object.keys(trk.stems ?? {})
  return [...STEM_ORDER.filter((n) => names.includes(n)), ...names.filter((n) => !STEM_ORDER.includes(n))]
}

function titleOf(trk: SavedTrack): string {
  return trk.title || t('library.untitled')
}
function labelOf(trk: SavedTrack): string {
  return trk.title || t('library.trackFallback')
}
function fmtDuration(ms: number): string {
  const s = Math.round(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
function fmtDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(locale.value, { day: 'numeric', month: 'short' })
}

function pick(sourceUrl: string, sourceLabel: string, asStems = false) {
  stopPreview()
  emit('pick', { sourceUrl, sourceLabel, asStems })
}

// ---- Preview ----
let audio: HTMLAudioElement | null = null
const playingId = ref<number | null>(null)
const position = ref(0)
const length = ref(0)
function togglePreview(trk: SavedTrack) {
  if (playingId.value === trk.id) return stopPreview()
  if (!audio) {
    audio = new Audio()
    audio.addEventListener('timeupdate', () => {
      position.value = audio?.currentTime ?? 0
    })
    audio.addEventListener('loadedmetadata', () => {
      length.value = audio && Number.isFinite(audio.duration) ? audio.duration : 0
    })
    audio.addEventListener('ended', stopPreview)
  }
  audio.src = trk.audio_url
  position.value = 0
  length.value = trk.duration_ms ? trk.duration_ms / 1000 : 0
  playingId.value = trk.id
  audio.play().catch(() => stopPreview())
}
/** The seek bar under the playing row. */
function seek(sec: number) {
  if (!audio) return
  audio.currentTime = sec
  position.value = sec
}
function stopPreview() {
  audio?.pause()
  playingId.value = null
  position.value = 0
}
function fmtSec(sec: number): string {
  const s = Math.max(0, Math.floor(sec))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
onBeforeUnmount(() => {
  stopPreview()
  if (audio) audio.src = ''
})

// ---- A file from the computer ----
const uploading = ref(false)
const splitUpload = ref(false)
const dragOver = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

async function addFile(file: File) {
  uploading.value = true
  error.value = null
  try {
    const uploaded = await tracksApi.uploadTrack(file)
    tracks.value.unshift(uploaded)
    pick(uploaded.audio_url, uploaded.title || file.name, splitUpload.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}
function onFileSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) void addFile(file)
}
function onDrop(e: DragEvent) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file && !uploading.value) void addFile(file)
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" @mousedown.self="emit('close')">
      <div
        ref="dialogEl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="library-picker-title"
        class="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-panel shadow-2xl"
        @keydown="onKeydown"
      >
        <div class="flex shrink-0 items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
          <h2 id="library-picker-title" class="text-base font-semibold text-text">{{ t('library.title') }}</h2>
          <button type="button" class="rounded-full p-1 text-text-dim hover:bg-panel-2 hover:text-text" :aria-label="t('common.close')" :title="t('common.close')" @click="emit('close')">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <!-- A file from the computer: dropped here or chosen -->
        <div class="shrink-0 px-4 pt-3">
          <div
            class="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-dashed px-3 py-2.5 transition-colors"
            :class="dragOver ? 'border-accent1 bg-accent1/10' : 'border-border'"
            @dragover.prevent="dragOver = true"
            @dragleave="dragOver = false"
            @drop.prevent="onDrop"
          >
            <UploadIcon class="h-5 w-5 shrink-0 text-accent1" />
            <p class="min-w-[12rem] flex-1 text-sm text-text-dim" role="status">{{ uploading ? t('library.uploading') : t('library.dropHint') }}</p>
            <label class="flex items-center gap-1.5 text-xs text-text-dim">
              <input v-model="splitUpload" type="checkbox" class="accent-accent1" />
              {{ t('library.splitOnAdd') }}
            </label>
            <button
              type="button"
              class="rounded-lg border border-border bg-panel-2 px-3 py-1.5 text-xs font-medium text-text hover:border-accent1/60 disabled:opacity-50"
              :disabled="uploading"
              @click="fileInput?.click()"
            >
              {{ t('library.chooseFile') }}
            </button>
            <input ref="fileInput" type="file" accept="audio/wav,audio/mp3,audio/mpeg,audio/flac,audio/ogg,audio/aac" class="hidden" @change="onFileSelected" />
          </div>
        </div>

        <!-- Search with the stems toggle, then the sources as tabs -->
        <div class="flex shrink-0 items-center gap-2 px-4 pt-3">
          <label class="relative min-w-0 flex-1">
            <span class="sr-only">{{ t('library.search') }}</span>
            <SearchIcon class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dim" />
            <input
              v-model="query"
              type="search"
              data-autofocus
              :placeholder="t('library.searchPlaceholder')"
              class="w-full rounded-lg border border-border bg-panel-2 py-2 pl-9 pr-3 text-sm text-text outline-none transition-colors placeholder:text-text-dim focus:border-accent1/60 focus:ring-2 focus:ring-accent1/20"
            />
          </label>
          <button
            type="button"
            class="flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition-colors"
            :class="withStems ? 'border-accent1/60 bg-accent1/10 text-text' : 'border-border text-text-dim hover:text-text'"
            :aria-pressed="withStems"
            :title="t('library.withStemsTitle')"
            @click="withStems = !withStems"
          >
            <SplitStemsIcon class="h-3.5 w-3.5" :class="withStems && 'text-accent1'" />
            {{ t('library.withStems') }}
            <span class="tabular-nums text-text-dim">{{ stemsCount }}</span>
          </button>
        </div>
        <!-- shrink-0: a scroll container may otherwise be squeezed to nothing by the list below -->
        <div class="mt-2 flex shrink-0 gap-5 overflow-x-auto border-b border-border/60 px-4" role="group" :aria-label="t('library.filterLabel')">
          <button
            v-for="f in filters"
            :key="f"
            type="button"
            class="-mb-px shrink-0 whitespace-nowrap border-b-2 pb-2 pt-1 text-xs transition-colors"
            :class="filter === f ? 'border-accent1 text-text' : 'border-transparent text-text-dim hover:text-text'"
            :aria-pressed="filter === f"
            @click="filter = f"
          >
            {{ t(`library.filters.${f}`) }}
            <span class="ml-1 tabular-nums text-text-dim">{{ counts[f] ?? 0 }}</span>
          </button>
        </div>

        <!-- Tracks -->
        <div class="min-h-0 flex-1 overflow-y-auto px-2 pb-2 pt-1">
          <p v-if="loading" class="px-2 py-6 text-center text-sm text-text-dim">{{ t('common.loading') }}</p>
          <p v-else-if="error" class="mx-2 rounded-lg bg-status-failed/10 p-2 text-xs text-status-failed">{{ error }}</p>
          <p v-else-if="tracks.length === 0" class="px-2 py-6 text-center text-sm text-text-dim">{{ t('library.noTracks') }}</p>
          <p v-else-if="visible.length === 0" class="px-2 py-6 text-center text-sm text-text-dim">{{ t('library.noMatches') }}</p>

          <ul v-else class="divide-y divide-border/40">
            <li
              v-for="trk in visible"
              :key="trk.id"
              class="relative flex flex-col gap-1.5 rounded-lg px-2 py-2 transition-colors hover:bg-panel-2/60"
              :class="playingId === trk.id && 'bg-accent1/[0.07]'"
            >
              <!-- on a phone the buttons wrap under the title -->
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <button
                  type="button"
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors"
                  :class="playingId === trk.id ? 'accent-gradient border-transparent text-white' : 'border-border text-text-dim hover:border-accent1/60 hover:text-text'"
                  :aria-label="playingId === trk.id ? t('library.stopPreview', { title: titleOf(trk) }) : t('library.preview', { title: titleOf(trk) })"
                  :title="playingId === trk.id ? t('library.stopPreview', { title: titleOf(trk) }) : t('library.preview', { title: titleOf(trk) })"
                  @click="togglePreview(trk)"
                >
                  <PauseIcon v-if="playingId === trk.id" class="h-3.5 w-3.5" />
                  <PlayIcon v-else class="ml-0.5 h-3.5 w-3.5" />
                </button>
                <div class="min-w-0 flex-1 basis-[10rem]">
                  <p class="truncate text-sm text-text" :title="titleOf(trk)">{{ titleOf(trk) }}</p>
                  <p class="mt-0.5 flex items-center gap-2 text-[11px] text-text-dim">
                    <span class="rounded border border-border/70 px-1.5 leading-4">{{ t(`library.origin.${groupOf(trk)}`) }}</span>
                    <span v-if="trk.duration_ms" class="tabular-nums">{{ fmtDuration(trk.duration_ms) }}</span>
                    <span class="whitespace-nowrap">{{ fmtDate(trk.created_at) }}</span>
                  </p>
                </div>
                <div class="flex shrink-0 items-center gap-1.5 max-sm:w-full max-sm:pl-11">
                  <button
                    type="button"
                    class="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs text-text-dim transition-colors hover:border-accent1/60 hover:text-text"
                    :title="hasStems(trk) ? t('library.addStemsReady') : t('library.addStemsSplit')"
                    @click="pick(trk.audio_url, labelOf(trk), true)"
                  >
                    <SplitStemsIcon class="h-3.5 w-3.5" />
                    {{ t('library.addStems') }}
                  </button>
                  <button
                    type="button"
                    class="flex items-center gap-1.5 rounded-lg border border-border bg-panel-2 px-2.5 py-1 text-xs font-medium text-text transition-colors hover:border-accent1 hover:bg-accent1/15"
                    :title="t('library.addTitle')"
                    @click="pick(trk.audio_url, labelOf(trk))"
                  >
                    <PlusIcon class="h-3.5 w-3.5" />
                    {{ t('library.add') }}
                  </button>
                </div>
              </div>
              <!-- The stems already made: one of them on its own -->
              <div v-if="hasStems(trk)" class="flex flex-wrap items-center gap-1.5 pl-11 text-[11px] text-text-dim">
                <span>{{ t('library.oneStem') }}</span>
                <button
                  v-for="name in stemNames(trk)"
                  :key="name"
                  type="button"
                  class="rounded-full border border-border px-2 py-0.5 text-text transition-colors hover:border-accent1/60"
                  @click="pick(trk.stems![name], `${labelOf(trk)}: ${STEM_LABELS[name] || name}`)"
                >
                  {{ STEM_LABELS[name] || name }}
                </button>
              </div>
              <!-- the preview: drag or click to seek, arrow keys too -->
              <div v-if="playingId === trk.id" class="flex items-center gap-2 pl-11 text-[11px] tabular-nums text-text-dim">
                <span class="w-8 text-right">{{ fmtSec(position) }}</span>
                <input
                  type="range"
                  min="0"
                  :max="length || 0"
                  step="0.1"
                  :value="position"
                  :disabled="!length"
                  class="h-1 min-w-0 flex-1 cursor-pointer accent-accent1"
                  :aria-label="t('library.seek', { title: titleOf(trk) })"
                  @input="seek(Number(($event.target as HTMLInputElement).value))"
                />
                <span class="w-8">{{ fmtSec(length) }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </Teleport>
</template>
