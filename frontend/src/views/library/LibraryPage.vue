<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import type { Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import * as tracksApi from '../../api/tracks'
import { usePlayerStore } from '../../stores/player'
import type { PlayerTrack } from '../../stores/player'
import { sameTag, useMarksStore } from '../../stores/marks'
import { useCoversStore } from '../../stores/covers'
import { useGenQueueStore } from '../../stores/genQueue'
import { ENGINE_SHORT, useTakes } from '../../composables/useTakes'
import { formatClock, formatCreated } from '../../composables/formatCreated'
import { ENGINES, groupSongs, isEngine, playerKey, subtitleOf, toLibTrack } from './libraryTracks'
import type { LibSong, LibTrack } from './libraryTracks'
import type { TrackOrigin } from '../../types'
import { useSelection } from './useSelection'
import { useResizablePane } from '../../composables/useResizablePane'
import LibraryDetails from './LibraryDetails.vue'
import LibraryBulkBar from './LibraryBulkBar.vue'
import LibraryTrash from './LibraryTrash.vue'
import { confirmTrackDeletion } from '../../composables/useTrackUsage'
import SelectBox from './SelectBox.vue'
import TrashIcon from '../../components/shared/icons/TrashIcon.vue'
import FavoriteStar from '../../components/shared/FavoriteStar.vue'
import StarIcon from '../../components/shared/icons/StarIcon.vue'
import LibraryIcon from '../../components/shared/icons/LibraryIcon.vue'
import ClockIcon from '../../components/shared/icons/ClockIcon.vue'
import SplitStemsIcon from '../../components/shared/icons/SplitStemsIcon.vue'
import PianoKeysIcon from '../../components/shared/icons/PianoKeysIcon.vue'
import LyricsIcon from '../../components/shared/icons/LyricsIcon.vue'
import SearchIcon from '../../components/shared/icons/SearchIcon.vue'
import PlayIcon from '../../components/shared/icons/PlayIcon.vue'
import PauseIcon from '../../components/shared/icons/PauseIcon.vue'
import ChevronIcon from '../../components/shared/icons/ChevronIcon.vue'
import TakeCompare from '../../components/shared/TakeCompare.vue'
import CoverThumb from '../../components/shared/CoverThumb.vue'
import ImageIcon from '../../components/shared/icons/ImageIcon.vue'
import type { CompareTake } from '../../composables/useTakeCompare'

/**
 * The library: every saved track, whatever made it. Filters on the left, the list by day in the middle
 * (takes of one song fold under it), the chosen track on the right. Rows tick for bulk actions (the bar over the
 * list); a deleted track goes to the trash first, the last item of the filters.
 */
const { t, locale } = useI18n()
const router = useRouter()
const player = usePlayerStore()
const { takes, reuse, loadAll } = useTakes()
const marks = useMarksStore()
const covers = useCoversStore()
// With covers on, the queue is followed while the library is open: a cover made in another tab still lands here.
const genQueue = useGenQueueStore()
let following = false
watch(() => covers.enabled, (on) => {
  if (on && !following) { following = true; genQueue.acquire() }
  else if (!on && following) { following = false; genQueue.release() }
}, { immediate: true })
onBeforeUnmount(() => { if (following) genQueue.release() })
const coverRun = computed(() => (covers.enabled ? covers.batchProgress : null))

const tracks = ref<LibTrack[]>([])
const loaded = ref(false)
const loadError = ref(false)
async function load(): Promise<void> {
  try {
    // the stars and the collections come with the list
    tracks.value = (await marks.load()).map(toLibTrack)
    loadError.value = false
  } catch {
    loadError.value = true
  } finally {
    loaded.value = true
  }
}
onMounted(() => {
  void load()
  // the engines' own lists: Repeat hands a take back to its engine's form through them
  void loadAll()
})

const ORIGINS: TrackOrigin[] = [...ENGINES, 'editor', 'upload']
const originLabel = (o: TrackOrigin): string => (isEngine(o) ? ENGINE_SHORT[o] : t(`libraryPage.origins.${o}`))
const ORIGIN_DOT: Record<TrackOrigin, string> = { yue2: 'bg-accent1', ace_step: 'bg-accent2', stable_audio: 'bg-status-running', editor: 'bg-status-done', upload: 'bg-status-queued' }

// ---- filters: one at a time, the count beside each ----
type FilterId = 'all' | 'favorites' | 'today' | 'stems' | 'midi' | 'score' | 'trash' | `from:${TrackOrigin}` | `col:${number}` | `tag:${string}`
const startOfToday = (): number => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime() }
function passes(track: LibTrack, f: FilterId): boolean {
  if (f === 'all') return true
  if (f === 'today') return track.createdAt >= startOfToday()
  if (f === 'stems') return track.hasStems
  if (f === 'midi') return track.hasMidi
  if (f === 'score') return track.hasScore
  if (f === 'favorites') return marks.isFavorite(track.id)
  if (f === 'trash') return true
  if (f.startsWith('tag:')) return marks.hasTag(track.id, f.slice(4))
  if (f.startsWith('col:')) return marks.collections.find((c) => c.id === Number(f.slice(4)))?.track_ids.includes(track.id) ?? false
  return track.origin === f.slice(5)
}
const filter = ref<FilterId>('all')
const count = (f: FilterId): number => tracks.value.reduce((n, x) => n + Number(passes(x, f)), 0)
const FILTER_GROUPS = computed<{ title: string | null; items: { id: FilterId; label: string; icon?: Component; dot?: string }[] }[]>(() => [
  { title: null, items: [{ id: 'all', label: t('libraryPage.filters.all'), icon: LibraryIcon }, { id: 'favorites', label: t('libraryPage.filters.favorites'), icon: StarIcon }, { id: 'today', label: t('libraryPage.filters.today'), icon: ClockIcon }] },
  { title: t('libraryPage.groups.origin'), items: ORIGINS.map((o) => ({ id: `from:${o}` as FilterId, label: originLabel(o), dot: ORIGIN_DOT[o] })) },
  {
    title: t('libraryPage.groups.has'),
    items: [
      { id: 'stems', label: t('libraryPage.filters.stems'), icon: SplitStemsIcon },
      { id: 'midi', label: t('libraryPage.filters.midi'), icon: PianoKeysIcon },
      { id: 'score', label: t('libraryPage.filters.score'), icon: LyricsIcon },
    ],
  },
  { title: t('libraryPage.groups.collections'), items: marks.collections.map((c) => ({ id: `col:${c.id}` as FilterId, label: c.name, dot: 'bg-text-dim' })) },
  // the tags come after the collections and their New collection button (see the template)
])
const TAG_GROUP = computed(() => ({ title: t('libraryPage.groups.tags'), items: marks.tagList.map((x) => ({ id: `tag:${x.name}` as FilterId, label: `#${x.name}`, dot: 'bg-accent1/60' })) }))
const filterLabel = computed(() => (filter.value === 'trash' ? t('libraryPage.trash.title')
  : [...FILTER_GROUPS.value, TAG_GROUP.value].flatMap((g) => g.items).find((i) => i.id === filter.value)?.label ?? ''))
const inTrash = computed(() => filter.value === 'trash')

// ---- collections and tags: renamed and removed from the heading of their list (a collection is made here) ----
const activeCollection = computed(() => (filter.value.startsWith('col:') ? marks.collections.find((c) => c.id === Number(filter.value.slice(4))) ?? null : null))
const activeTag = computed(() => (filter.value.startsWith('tag:') ? marks.tagList.find((x) => sameTag(x.name, filter.value.slice(4)))?.name ?? null : null))
// a collection or a tag that is gone: back to all tracks
watch(() => marks.collections.length, () => { if (filter.value.startsWith('col:') && !activeCollection.value) filter.value = 'all' })
watch(() => marks.tagList, () => { if (filter.value.startsWith('tag:') && marks.loaded && !activeTag.value) filter.value = 'all' })
const adding = ref(false)
const newName = ref('')
const newInput = ref<HTMLInputElement | null>(null)
function openAdd(): void {
  adding.value = true
  void nextTick(() => newInput.value?.focus())
}
async function addCollection(): Promise<void> {
  const name = newName.value.trim()
  if (!adding.value) return
  adding.value = false
  newName.value = ''
  if (!name) return
  const created = await marks.createCollection(name)
  if (created) filter.value = `col:${created.id}`
}
const renaming = ref(false)
const renameText = ref('')
const renameInput = ref<HTMLInputElement | null>(null)
function startRename(): void {
  const name = activeCollection.value?.name ?? activeTag.value
  if (name == null) return
  renameText.value = name
  renaming.value = true
  void nextTick(() => renameInput.value?.select())
}
async function commitRename(): Promise<void> {
  const c = activeCollection.value
  const tag = activeTag.value
  const name = renameText.value.trim()
  if (!renaming.value) return
  renaming.value = false
  if (c && name && name !== c.name) await marks.renameCollection(c.id, name)
  if (tag && name && name !== tag) {
    const now = await marks.renameTag(tag, name)
    if (now) filter.value = `tag:${now}`
  }
}
// Removing a collection or a tag takes two clicks: the first one arms the button for a few seconds.
const dropArmed = ref(false)
let dropTimer: ReturnType<typeof setTimeout> | null = null
async function dropCollection(): Promise<void> {
  const c = activeCollection.value
  const tag = activeTag.value
  if (!c && !tag) return
  if (!dropArmed.value) {
    dropArmed.value = true
    dropTimer = setTimeout(() => { dropArmed.value = false }, 4000)
    return
  }
  dropArmed.value = false
  if (dropTimer) clearTimeout(dropTimer)
  if (c ? await marks.deleteCollection(c.id) : await marks.deleteTag(tag as string)) filter.value = 'all'
}
watch(filter, () => { dropArmed.value = false; renaming.value = false })

// ---- search and order ----
const query = ref('')
const order = ref<'newest' | 'oldest'>('newest')
/** Passing the filter and the search; the period narrows it further. */
const searched = computed(() => {
  const q = query.value.trim().toLowerCase()
  const source = inTrash.value ? trashTracks.value : tracks.value
  return source.filter((x) => passes(x, filter.value) && (!q || x.title.toLowerCase().includes(q) || x.style.toLowerCase().includes(q) || x.lyrics.toLowerCase().includes(q)))
})

// ---- the period: from a date to a date (local days), or the last 7 / 30 days in one click ----
const dateFrom = ref('')
const dateTo = ref('')
const dated = computed(() => dateFrom.value !== '' || dateTo.value !== '')
/** YYYY-MM-DD of the local day, the format <input type="date"> uses (toISOString() would give the UTC day). */
const dayValue = (d: Date): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const daysAgo = (n: number): Date => { const d = new Date(); d.setDate(d.getDate() - n); return d }
function lastDays(n: number): void {
  dateFrom.value = dayValue(daysAgo(n - 1))
  dateTo.value = dayValue(new Date())
}
/** 7 or 30 when the dates are exactly that preset, so its button shows as chosen. */
const activeDays = computed(() => (dateTo.value === dayValue(new Date()) ? [7, 30].find((n) => dateFrom.value === dayValue(daysAgo(n - 1))) ?? null : null))
/** On a phone the period folds behind a "Filters" button (open by itself while dates are set). */
const periodOpen = ref(false)
function clearDates(): void {
  dateFrom.value = ''
  dateTo.value = ''
}
const found = computed(() => {
  const from = dateFrom.value ? new Date(`${dateFrom.value}T00:00:00`).getTime() : -Infinity
  const to = dateTo.value ? new Date(`${dateTo.value}T23:59:59.999`).getTime() : Infinity
  return dated.value && !inTrash.value ? searched.value.filter((x) => x.createdAt >= from && x.createdAt <= to) : searched.value
})
const songs = computed(() => (inTrash.value ? [] : groupSongs(found.value).sort((a, b) => (order.value === 'newest' ? b.latest - a.latest : a.latest - b.latest))))

/** Favourites or a collection with nothing in it yet (not a search that found nothing): say how to fill it. */
const emptyMark = computed(() => (query.value.trim() || dated.value ? null : filter.value === 'favorites' ? 'emptyFavorites' : activeCollection.value ? 'emptyCollection' : activeTag.value ? 'emptyTag' : null))

// A long list comes a page at a time.
const PAGE = 40
const shown = ref(PAGE)
watch([filter, query, order, dateFrom, dateTo], () => { shown.value = PAGE })

// ---- the trash: read when it is opened; a flat list, the most recently deleted first ----
const trashTracks = ref<LibTrack[]>([])
/** The trash is being read: its rows are not "empty" yet. */
const trashLoading = ref(false)
async function loadTrash(): Promise<void> {
  trashLoading.value = true
  try {
    trashTracks.value = (await tracksApi.listTrash()).map(toLibTrack)
    marks.trashCount = trashTracks.value.length
  } catch (err) {
    actionError.value = t('libraryPage.trash.loadFailed', { error: err instanceof Error ? err.message : String(err) })
  } finally {
    trashLoading.value = false
  }
}
watch(inTrash, (on) => {
  selectedId.value = null
  if (on) void loadTrash()
})
const trashSorted = computed(() => [...found.value].sort((a, b) => ((b.deletedAt ?? 0) - (a.deletedAt ?? 0)) * (order.value === 'newest' ? 1 : -1)))
const trashRows = computed(() => trashSorted.value.slice(0, shown.value))

/** The songs on show, under a heading a day. */
const days = computed(() => {
  const today = startOfToday()
  const out: { key: number; label: string; songs: LibSong[] }[] = []
  for (const song of songs.value.slice(0, shown.value)) {
    const d = new Date(song.latest)
    d.setHours(0, 0, 0, 0)
    const key = d.getTime()
    let day = out[out.length - 1]
    if (!day || day.key !== key) {
      const label = key === today ? t('libraryPage.today') : key === today - 86400000 ? t('libraryPage.yesterday')
        : d.toLocaleDateString(locale.value, { day: 'numeric', month: 'long', ...(d.getFullYear() !== new Date().getFullYear() ? { year: 'numeric' } : {}) })
      day = { key, label, songs: [] }
      out.push(day)
    }
    day.songs.push(song)
  }
  return out
})

// ---- the chosen track ----
const selectedId = ref<number | null>(null)
const selected = computed(() => (inTrash.value ? trashTracks.value : tracks.value).find((x) => x.id === selectedId.value) ?? null)
const songOf = (id: number): LibSong | undefined => songs.value.find((s) => s.takes.some((x) => x.id === id))
const takeLabel = (track: LibTrack): string => {
  const song = songOf(track.id)
  const title = track.shortTitle || t('create.untitled')
  return song && song.takes.length > 1 ? t('create.takeTitle', { title, n: song.takes.indexOf(track) + 1 }) : title
}
const unfolded = reactive(new Set<string>())
function toggleSong(song: LibSong): void {
  if (unfolded.has(song.key)) unfolded.delete(song.key)
  else unfolded.add(song.key)
}
// ---- compare takes: the 4 newest takes of a song on an A/B switch; its trash has its own undo ----
const comparing = ref<{ title: string; takes: CompareTake[]; total: number } | null>(null)
function openCompare(song: LibSong): void {
  const list = song.takes.map((x, i): CompareTake => ({ id: x.id, src: x.audioUrl, n: i + 1, seed: x.seed, durationSec: x.durationSec, createdAt: x.createdAt }))
  comparing.value = { title: song.lead.shortTitle || t('create.untitled'), takes: list.slice(-4), total: list.length }
}
function onCompareTrashed(ids: number[]): void {
  if (ids.some((id) => player.isCurrent(playerKey(id)))) player.close()
  if (selectedId.value != null && ids.includes(selectedId.value)) selectedId.value = null
  const gone = new Set(ids)
  tracks.value = tracks.value.filter((x) => !gone.has(x.id))
  void loadAll()
}
async function onCompareRestored(): Promise<void> {
  await load()
  void loadAll()
}
function select(track: LibTrack): void {
  selectedId.value = selectedId.value === track.id && !wide.value ? null : track.id
}

// The panel sits beside the list on a wide window and under the chosen row on a narrow one.
const media = window.matchMedia('(min-width: 1280px)')
const wide = ref(media.matches)
const onMedia = (e: MediaQueryListEvent): void => { wide.value = e.matches }
media.addEventListener('change', onMedia)
onBeforeUnmount(() => media.removeEventListener('change', onMedia))

// The panel's width on a wide window: dragged by its edge (or with the arrow keys on it), kept between visits.
const pageEl = ref<HTMLElement | null>(null)
const pane = useResizablePane({
  key: 'remiqora.library.detailsWidth', min: 360, max: 720, maxShare: 0.5,
  initial: () => (window.innerWidth >= 1536 ? 480 : 440),
  pageWidth: () => pageEl.value?.clientWidth ?? window.innerWidth - 64,
})
onMounted(pane.measure)

const toPlayer = (track: LibTrack): PlayerTrack => ({
  key: playerKey(track.id), title: takeLabel(track), sub: `${originLabel(track.origin)} · ${formatCreated(track.createdAt).label}`,
  src: track.audioUrl, durationSec: track.durationSec, dbId: track.id, filename: track.filename,
})
/** What Next and Previous walk through: the rows on show, in their order (a folded song is its newest take). */
const queue = computed(() => (inTrash.value ? trashRows.value
  : songs.value.slice(0, shown.value).flatMap((song) => (song.takes.length > 1 && unfolded.has(song.key) ? song.takes : [song.lead]))).map(toPlayer))
function play(track: LibTrack): void {
  player.toggle(toPlayer(track), queue.value)
}
const isPlaying = (track: LibTrack): boolean => player.playing && player.isCurrent(playerKey(track.id))

/** The engine's own record of the track: what Repeat puts back into the form. */
const takeOf = (track: LibTrack) => takes.value.find((x) => x.dbId === track.id)
function onReuse(track: LibTrack): void {
  const take = takeOf(track)
  if (!take) return
  reuse(take)
  void router.push({ name: 'create', query: { engine: take.engine } })
}
async function onRename(track: LibTrack, title: string): Promise<void> {
  await tracksApi.renameTrack(track.id, title)
  await load()
  void loadAll()
}
const actionError = ref('')

// ---- ticked rows: a folded song's box stands for all its takes ----
const sel = useSelection(
  () => found.value.map((x) => x.id),
  () => (inTrash.value ? trashRows.value.map((x) => x.id)
    : songs.value.slice(0, shown.value).flatMap((song) => song.takes.map((x) => x.id))),
)
watch(filter, () => sel.clear())
const songIds = (song: LibSong): number[] => song.takes.map((x) => x.id)
/** The box shows on hover and focus; always once something is ticked, and on a touch or narrow screen. */
const boxClass = (on: boolean): string => (sel.any.value || on ? '' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 max-sm:opacity-100 pointer-coarse:opacity-100')
/** A song row's first two tags, from all its takes. */
function songTags(song: LibSong): string[] {
  const out: string[] = []
  for (const take of song.takes) for (const tag of marks.tagsOf(take.id)) if (!out.some((x) => sameTag(x, tag))) out.push(tag)
  return out.slice(0, 2)
}

// ---- what a screen reader hears after an action; the same words again are heard again ----
const announcement = ref('')
function announce(text: string): void {
  announcement.value = ''
  void nextTick(() => { announcement.value = text })
}

// ---- the trash and its undo: a notice for 8 seconds that puts the tracks back ----
const undo = ref<{ ids: number[]; text: string } | null>(null)
let undoTimer: ReturnType<typeof setTimeout> | null = null
function dropUndo(): void {
  undo.value = null
  if (undoTimer) clearTimeout(undoTimer)
  undoTimer = null
}
onBeforeUnmount(dropUndo)
const playingOneOf = (ids: number[]): boolean => ids.some((id) => player.isCurrent(playerKey(id)))
/** The tracks have gone to the trash: out of the list and the player, with the undo on offer. */
function trashed(ids: number[]): void {
  if (!ids.length) return
  if (playingOneOf(ids)) player.close()
  if (selectedId.value != null && ids.includes(selectedId.value)) selectedId.value = null
  const gone = new Set(ids)
  tracks.value = tracks.value.filter((x) => !gone.has(x.id))
  const text = t('libraryPage.trash.moved', { n: ids.length }, ids.length)
  dropUndo()
  undo.value = { ids, text }
  undoTimer = setTimeout(dropUndo, 8000)
  announce(text)
  void loadAll()
}
async function onRemove(track: LibTrack): Promise<void> {
  if (!(await confirmTrackDeletion([track.id], t))) return
  try {
    await tracksApi.deleteTrack(track.id)
  } catch (err) {
    actionError.value = t('libraryPage.deleteFailed', { error: err instanceof Error ? err.message : String(err) })
    return
  }
  actionError.value = ''
  marks.forget(track.id)
  marks.trashCount += 1
  void marks.refreshTags()
  trashed([track.id])
}
async function onBulkTrash(): Promise<void> {
  if (!(await confirmTrackDeletion(sel.list.value, t))) return
  const done = await marks.bulk(sel.list.value, 'trash')
  if (done) trashed(done.map((x) => x.id))
}
async function onUndo(): Promise<void> {
  const ids = undo.value?.ids ?? []
  dropUndo()
  const done = await marks.bulk(ids, 'restore')
  if (!done) return
  announce(t('libraryPage.trash.restored', { n: done.length }, done.length))
  await load()
  void loadAll()
  if (inTrash.value) void loadTrash()
}
/** Restore or delete for good, from the trash: the selection or the one track in the details. */
async function fromTrash(ids: number[], action: 'restore' | 'purge'): Promise<void> {
  if (action === 'purge' && !(await confirmTrackDeletion(ids, t, true))) return
  const done = await marks.bulk(ids, action)
  if (!done) return
  const gone = new Set(action === 'restore' ? done.map((x) => x.id) : ids)
  if (action === 'purge' && playingOneOf([...gone])) player.close()
  if (selectedId.value != null && gone.has(selectedId.value)) selectedId.value = null
  trashTracks.value = trashTracks.value.filter((x) => !gone.has(x.id))
  announce(t(action === 'restore' ? 'libraryPage.trash.restored' : 'libraryPage.trash.purged', { n: gone.size }, gone.size))
  if (action === 'restore') {
    await load()
    void loadAll()
  }
}
async function onEmptyTrash(): Promise<void> {
  if (!(await confirmTrackDeletion(trashTracks.value.map((x) => x.id), t, true))) return
  try {
    await tracksApi.emptyTrash()
  } catch (err) {
    actionError.value = t('libraryPage.deleteFailed', { error: err instanceof Error ? err.message : String(err) })
    return
  }
  actionError.value = ''
  if (playingOneOf(trashTracks.value.map((x) => x.id))) player.close()
  trashTracks.value = []
  marks.trashCount = 0
  selectedId.value = null
  announce(t('libraryPage.trash.emptied'))
}
</script>

<template>
  <div
    ref="pageEl" class="grid grid-cols-1 items-start gap-5 lg:grid-cols-[12.5rem_minmax(0,1fr)] xl:grid-cols-[12.5rem_minmax(0,1fr)_var(--details-w)] 2xl:grid-cols-[13.5rem_minmax(0,1fr)_var(--details-w)]"
    :class="pane.dragging.value ? 'cursor-col-resize select-none' : ''" :style="{ '--details-w': `${pane.width.value}px` }"
  >
    <!-- the filters: a column on a wide window, a row that scrolls sideways on a narrow one -->
    <nav class="flex gap-1.5 overflow-x-auto pb-1 lg:sticky lg:top-[calc(var(--header-h,4rem)+1.5rem)] lg:block lg:space-y-4 lg:overflow-visible lg:pb-0" :aria-label="t('libraryPage.filtersLabel')">
      <div v-for="(group, gi) in FILTER_GROUPS" :key="gi" class="flex shrink-0 gap-1.5 lg:block lg:space-y-0.5">
        <p v-if="group.title" class="hidden px-2.5 pb-1 text-xs font-semibold text-text-dim lg:block">{{ group.title }}</p>
        <button
          v-for="item in group.items" :key="item.id" type="button" :aria-pressed="filter === item.id"
          class="flex shrink-0 items-center gap-2 rounded-lg border px-2.5 py-1.5 text-start text-sm transition-colors lg:w-full lg:border-transparent"
          :class="filter === item.id ? 'border-transparent bg-accent1/15 font-semibold text-text' : 'border-border text-text-dim hover:bg-panel hover:text-text'"
          @click="filter = item.id"
        >
          <component :is="item.icon" v-if="item.icon" class="h-4 w-4 shrink-0" :class="filter === item.id ? 'text-accent1' : ''" />
          <span v-else class="mx-1 h-2 w-2 shrink-0 rounded-full" :class="item.dot" aria-hidden="true"></span>
          <span class="min-w-0 truncate whitespace-nowrap">{{ item.label }}</span>
          <span class="ms-auto ps-1 text-xs font-normal tabular-nums text-text-dim">{{ count(item.id) }}</span>
        </button>
      </div>
      <form v-if="adding" class="shrink-0 lg:px-1" @submit.prevent="addCollection">
        <input
          ref="newInput" v-model="newName" type="text" maxlength="80" class="w-40 rounded-lg border border-accent1/60 bg-panel-2 px-2.5 py-1.5 text-sm text-text outline-none lg:w-full"
          :placeholder="t('libraryPage.collectionName')" :aria-label="t('libraryPage.collectionName')" @blur="addCollection" @keydown.esc="newName = ''; adding = false"
        />
      </form>
      <button v-else type="button" class="shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-start text-sm text-text-dim hover:bg-panel hover:text-text lg:w-full" @click="openAdd">
        {{ t('libraryPage.newCollection') }}
      </button>
      <div v-if="TAG_GROUP.items.length" class="flex shrink-0 gap-1.5 lg:block lg:space-y-0.5">
        <p class="hidden px-2.5 pb-1 text-xs font-semibold text-text-dim lg:block">{{ TAG_GROUP.title }}</p>
        <button
          v-for="item in TAG_GROUP.items" :key="item.id" type="button" :aria-pressed="filter === item.id"
          class="flex shrink-0 items-center gap-2 rounded-lg border px-2.5 py-1.5 text-start text-sm transition-colors lg:w-full lg:border-transparent"
          :class="filter === item.id ? 'border-transparent bg-accent1/15 font-semibold text-text' : 'border-border text-text-dim hover:bg-panel hover:text-text'"
          @click="filter = item.id"
        >
          <span class="mx-1 h-2 w-2 shrink-0 rounded-full" :class="item.dot" aria-hidden="true"></span>
          <span class="min-w-0 truncate whitespace-nowrap">{{ item.label }}</span>
          <span class="ms-auto ps-1 text-xs font-normal tabular-nums text-text-dim">{{ count(item.id) }}</span>
        </button>
      </div>
      <!-- the trash, last: deleted tracks wait here 30 days -->
      <div class="shrink-0 lg:border-t lg:border-border lg:pt-3">
        <button
          type="button" :aria-pressed="inTrash"
          class="flex shrink-0 items-center gap-2 rounded-lg border px-2.5 py-1.5 text-start text-sm transition-colors lg:w-full lg:border-transparent"
          :class="inTrash ? 'border-transparent bg-accent1/15 font-semibold text-text' : 'border-border text-text-dim hover:bg-panel hover:text-text'"
          @click="filter = 'trash'"
        >
          <TrashIcon class="h-4 w-4 shrink-0" :class="inTrash ? 'text-accent1' : ''" />
          <span class="min-w-0 truncate whitespace-nowrap">{{ t('libraryPage.trash.title') }}</span>
          <span class="ms-auto ps-1 text-xs font-normal tabular-nums text-text-dim">{{ marks.trashCount }}</span>
        </button>
      </div>
    </nav>

    <section class="min-w-0 rounded-xl border border-border bg-panel" :aria-label="t('libraryPage.title')">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-4 py-3">
        <h1 v-if="!renaming" class="text-lg font-semibold text-text">{{ filterLabel }}</h1>
        <!-- a collection's or a tag's own heading: rename it, remove it (its tracks stay) -->
        <template v-if="activeCollection || activeTag">
          <form v-if="renaming" @submit.prevent="commitRename">
            <input
              ref="renameInput" v-model="renameText" type="text" maxlength="80" class="w-44 rounded-lg border border-accent1/60 bg-panel-2 px-2 py-1 text-sm text-text outline-none"
              :aria-label="activeTag ? t('libraryPage.tags.rename') : t('libraryPage.renameCollection')" @blur="commitRename" @keydown.esc="renaming = false"
            />
          </form>
          <template v-else>
            <button
              type="button" class="rounded-lg px-1.5 py-1 text-sm text-text-dim hover:bg-panel-2 hover:text-text"
              :title="activeTag ? t('libraryPage.tags.rename') : t('libraryPage.renameCollection')" :aria-label="activeTag ? t('libraryPage.tags.rename') : t('libraryPage.renameCollection')" @click="startRename"
            >✎</button>
            <button
              type="button" class="rounded-lg px-1.5 py-1 text-xs" :class="dropArmed ? 'bg-status-failed/15 font-medium text-status-failed' : 'text-text-dim hover:bg-panel-2 hover:text-status-failed'"
              :title="activeTag ? t('libraryPage.tags.delete') : t('libraryPage.deleteCollection')" :aria-label="activeTag ? t('libraryPage.tags.delete') : t('libraryPage.deleteCollection')"
              @click="dropCollection" @blur="dropArmed = false"
            >{{ dropArmed ? (activeTag ? t('libraryPage.tags.confirmDelete') : t('libraryPage.confirmDeleteCollection')) : '✕' }}</button>
          </template>
        </template>
        <label class="flex min-w-0 flex-1 basis-56 items-center gap-2 rounded-lg border border-border bg-panel-2 px-2.5 focus-within:border-accent1/60">
          <SearchIcon class="h-4 w-4 shrink-0 text-text-dim" />
          <input v-model="query" type="search" class="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-text outline-none placeholder:text-text-dim/70" :placeholder="t('libraryPage.search')" :aria-label="t('libraryPage.search')" />
        </label>
        <button
          v-if="!inTrash" type="button" class="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm sm:hidden"
          :class="periodOpen || dated ? 'border-accent1/60 text-text' : 'border-border text-text-dim'"
          :aria-expanded="periodOpen || dated" aria-controls="library-period" @click="periodOpen = !periodOpen"
        >
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
          {{ t('libraryPage.filtersToggle') }}<span v-if="dated" class="h-1.5 w-1.5 rounded-full bg-accent1" aria-hidden="true"></span>
        </button>
        <select v-model="order" class="rounded-lg border border-border bg-panel-2 px-2 py-1.5 text-sm text-text" :aria-label="t('libraryPage.order')">
          <option value="newest">{{ t('libraryPage.newest') }}</option>
          <option value="oldest">{{ t('libraryPage.oldest') }}</option>
        </select>
      </div>
      <!-- the period: two dates, or the last week / month in one click -->
      <div v-if="!inTrash" id="library-period" class="flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-4 py-2 text-xs" :class="periodOpen || dated ? 'flex' : 'hidden sm:flex'">
        <span class="text-text-dim">{{ t('libraryPage.period') }}</span>
        <div class="flex items-center gap-1.5">
          <input v-model="dateFrom" type="date" :max="dateTo || undefined" :aria-label="t('filterSort.from')" :title="t('filterSort.from')" class="rounded-md border border-border bg-panel-2 px-1.5 py-1 text-text" />
          <span class="text-text-dim">—</span>
          <input v-model="dateTo" type="date" :min="dateFrom || undefined" :aria-label="t('filterSort.to')" :title="t('filterSort.to')" class="rounded-md border border-border bg-panel-2 px-1.5 py-1 text-text" />
        </div>
        <div class="flex items-center gap-1">
          <button
            v-for="n in [7, 30]" :key="n" type="button" :aria-pressed="activeDays === n"
            class="rounded-full border px-2 py-1 transition-colors" :class="activeDays === n ? 'border-transparent bg-accent1/20 font-medium text-text' : 'border-border text-text-dim hover:text-text'"
            @click="lastDays(n)"
          >{{ t(n === 7 ? 'filterSort.days7' : 'filterSort.days30') }}</button>
        </div>
        <span v-if="dated" class="ms-auto flex items-center gap-2 text-text-dim">
          {{ t('filterSort.shownOf', { shown: found.length, total: searched.length }) }}
          <button type="button" class="text-accent1 hover:underline" @click="clearDates">{{ t('filterSort.reset') }}</button>
        </span>
      </div>

      <p v-if="actionError || marks.error" class="border-b border-status-failed/30 bg-status-failed/10 px-4 py-2 text-xs text-status-failed">{{ actionError || marks.error }}</p>
      <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">{{ announcement }}</p>

      <!-- over the list while it scrolls: the bulk bar for the ticked tracks, and the undo of the last delete -->
      <div v-if="sel.any.value || undo || coverRun" class="sticky top-[var(--header-h,4rem)] z-20">
        <LibraryBulkBar
          v-if="sel.any.value" :ids="sel.list.value" :mode="inTrash ? 'trash' : 'library'" :all-count="found.length" :all-state="sel.allState.value"
          @clear="sel.clear()" @toggle-all="sel.toggleAll()" @trash="onBulkTrash" @restore="fromTrash(sel.list.value, 'restore')" @purge="fromTrash(sel.list.value, 'purge')"
          :track-of="(id) => tracks.find((x) => x.id === id)" @renamed="() => { void load(); void loadAll() }" @announce="announce"
        />
        <!-- covers for a selection: "2 of 5" while they are made (the selection may be gone by then), then how it went -->
        <div v-if="coverRun" class="flex items-center gap-3 border-b border-border bg-panel-2 px-4 py-2 text-xs text-text" role="status">
          <ImageIcon class="h-3.5 w-3.5 shrink-0 text-text-dim" :class="coverRun.running ? 'animate-pulse motion-reduce:animate-none' : ''" />
          <span class="min-w-0 flex-1 tabular-nums">
            {{ coverRun.running ? t('covers.bulkProgress', { done: Math.min(coverRun.done + 1, coverRun.total), total: coverRun.total }) : t('covers.bulkDone', { n: coverRun.done - coverRun.failed }, coverRun.done - coverRun.failed) }}
            <span v-if="coverRun.failed" class="ms-2 text-status-failed">{{ t('covers.bulkFailed', { n: coverRun.failed }) }}</span>
          </span>
          <button v-if="coverRun.running" type="button" class="min-h-6 rounded-md px-1.5 font-medium text-accent1-text hover:underline" @click="covers.cancelBatch()">{{ t('covers.stop') }}</button>
          <button v-else type="button" class="flex h-6 w-6 items-center justify-center rounded-md text-text-dim hover:text-text" :aria-label="t('covers.dismiss')" :title="t('covers.dismiss')" @click="covers.clearBatch()">✕</button>
        </div>
        <div v-if="undo" class="flex items-center gap-3 border-b border-border bg-panel-2 px-4 py-2 text-xs text-text">
          <TrashIcon class="h-3.5 w-3.5 shrink-0 text-text-dim" />
          <span class="min-w-0 flex-1">{{ undo.text }}</span>
          <button type="button" class="font-medium text-accent1-text hover:underline" @click="onUndo">{{ t('libraryPage.trash.undo') }}</button>
          <button type="button" class="flex h-6 w-6 items-center justify-center rounded-md text-text-dim hover:text-text" :aria-label="t('libraryPage.trash.dismiss')" :title="t('libraryPage.trash.dismiss')" @click="dropUndo">✕</button>
        </div>
      </div>
      <div v-if="loaded && !loadError && !sel.any.value && found.length" class="flex items-center gap-1 px-3.5 pt-2 text-xs text-text-dim">
        <SelectBox size="sm" :state="sel.allState.value" :label="t('libraryPage.bulk.selectAll', { n: found.length })" @toggle="sel.toggleAll()" />
        <span aria-hidden="true">{{ t('libraryPage.bulk.selectAll', { n: found.length }) }}</span>
      </div>

      <LibraryTrash
        v-if="inTrash" :rows="trashRows" :total="trashSorted.length" :in-trash="trashTracks.length" :loading="trashLoading && !trashTracks.length" :selected-id="selectedId" :checked="sel.has" :any-selected="sel.any.value"
        :playing="isPlaying" :origin-label="(x) => originLabel(x.origin)" :show-details="!wide"
        @open="select" @play="play" @restore="(x) => fromTrash([x.id], 'restore')" @check="(x, shift) => sel.toggle([x.id], shift)" @empty="onEmptyTrash" @more="shown += PAGE"
      >
        <template #details="{ track }">
          <LibraryDetails
            class="my-1.5" :track="track" :origin-label="originLabel(track.origin)" :take-label="takeLabel(track)" :can-reuse="false"
            @play="play(track)" @restore="fromTrash([track.id], 'restore')" @purge="fromTrash([track.id], 'purge')"
          />
        </template>
      </LibraryTrash>
      <p v-else-if="!loaded" class="p-6 text-sm text-text-dim">{{ t('create.loading') }}</p>
      <div v-else-if="loadError" class="p-6 text-sm text-text-dim">
        {{ t('libraryPage.loadFailed') }}
        <button type="button" class="ms-2 text-accent1 hover:underline" @click="load">{{ t('libraryPage.retry') }}</button>
      </div>
      <div v-else-if="!songs.length" class="p-10 text-center">
        <p class="text-sm font-medium text-text">{{ !tracks.length ? t('create.emptyAll') : emptyMark ? t('libraryPage.emptyHere') : t('libraryPage.nothingFound') }}</p>
        <p class="mt-1 text-sm text-text-dim">{{ !tracks.length ? t('libraryPage.emptyHint') : emptyMark ? t(`libraryPage.${emptyMark}`) : t('libraryPage.nothingFoundHint') }}</p>
        <button v-if="tracks.length && (query || filter !== 'all' || dated)" type="button" class="mt-4 rounded-lg border border-border px-3 py-1.5 text-xs text-text hover:bg-panel-2" @click="query = ''; filter = 'all'; clearDates()">{{ t('libraryPage.showAll') }}</button>
        <router-link v-else-if="!tracks.length" to="/create" class="mt-4 inline-block rounded-lg border border-border px-3 py-1.5 text-xs text-text hover:bg-panel-2">{{ t('libraryPage.toCreate') }}</router-link>
      </div>

      <div v-else class="p-2">
        <template v-for="day in days" :key="day.key">
          <h2 class="px-2.5 pb-1 pt-3 text-xs font-semibold text-text-dim">{{ day.label }}</h2>
          <template v-for="song in day.songs" :key="song.key">
            <!-- the song's row shows its newest take; unfolded, a row a take follows. Capped at ~900px on a wide
                 screen, like the session's rows: past that the title and the time drift too far apart -->
            <div
              class="group flex min-h-12 max-w-[56rem] cursor-pointer items-center gap-3 rounded-lg py-1.5 pe-2.5 ps-1"
              :class="selectedId === song.lead.id && !(song.takes.length > 1 && unfolded.has(song.key)) ? 'bg-accent1/15' : sel.stateOf(songIds(song)) ? 'bg-accent1/[0.07]' : 'hover:bg-panel-2/70'"
              @click="select(song.lead)"
            >
              <SelectBox
                class="-me-1.5 transition-opacity" :class="boxClass(!!sel.stateOf(songIds(song)))" :state="sel.stateOf(songIds(song))"
                :label="song.takes.length > 1 ? t('libraryPage.bulk.selectSong', { title: song.lead.shortTitle || t('create.untitled'), n: song.takes.length }) : t('libraryPage.bulk.selectTrack', { title: song.lead.shortTitle || t('create.untitled') })"
                @toggle="(shift) => sel.toggle(songIds(song), shift)"
              />
              <!-- covers on: the song's cover (its newest take's) is the play button, the icon over it on hover -->
              <button
                v-if="covers.enabled" type="button" class="group/play relative h-10 w-10 shrink-0 overflow-hidden rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1"
                :aria-label="isPlaying(song.lead) ? t('create.pause') : t('create.play')" @click.stop="play(song.lead)"
              >
                <CoverThumb :track-id="song.lead.id" :title="song.lead.shortTitle || t('create.untitled')" placeholder class="h-full w-full" />
                <span
                  class="absolute inset-0 flex items-center justify-center bg-black/40 text-white transition-opacity motion-reduce:transition-none"
                  :class="isPlaying(song.lead) ? 'opacity-100' : 'opacity-0 group-hover/play:opacity-100 group-focus-visible/play:opacity-100 pointer-coarse:opacity-100 pointer-coarse:bg-black/25'" aria-hidden="true"
                >
                  <PauseIcon v-if="isPlaying(song.lead)" class="h-4 w-4" />
                  <PlayIcon v-else class="h-4 w-4" />
                </span>
              </button>
              <button
                v-else type="button" class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors"
                :class="isPlaying(song.lead) ? 'accent-gradient text-white' : 'border border-border text-text hover:border-accent1/60'"
                :aria-label="isPlaying(song.lead) ? t('create.pause') : t('create.play')" @click.stop="play(song.lead)"
              >
                <PauseIcon v-if="isPlaying(song.lead)" class="h-3.5 w-3.5" />
                <PlayIcon v-else class="h-3.5 w-3.5" />
              </button>
              <div class="min-w-0 flex-1">
                <p class="flex items-center gap-2">
                  <span class="min-w-0 truncate text-sm font-semibold text-text" :title="song.lead.shortTitle || undefined"><bdi>{{ song.lead.shortTitle || t('create.untitled') }}</bdi></span>
                  <!-- the takes and Compare: beside the title, under it on a phone where they would push the title out -->
                  <span v-if="song.takes.length > 1" class="hidden shrink-0 items-center gap-2 sm:inline-flex">
                    <button
                      type="button" class="inline-flex shrink-0 items-center gap-1 rounded-md border border-border px-1.5 py-px text-[11px] text-text-dim hover:border-accent1/50 hover:text-text"
                      :aria-expanded="unfolded.has(song.key)" @click.stop="toggleSong(song)"
                    >{{ t('create.takes', { n: song.takes.length }) }}<ChevronIcon class="h-3 w-3 transition-transform" :class="unfolded.has(song.key) ? 'rotate-180' : ''" /></button>
                    <button
                      type="button" class="inline-flex shrink-0 items-center rounded-md border border-border px-1.5 py-px text-[11px] text-text-dim hover:border-accent1/50 hover:text-text"
                      :title="t('takeCompare.openTitle')" @click.stop="openCompare(song)"
                    >{{ t('takeCompare.open') }}</button>
                  </span>
                </p>
                <p class="truncate text-xs text-text-dim">{{ song.lead.aiPart ? t('libraryPage.aiPart') : subtitleOf(song.lead) || t(`libraryPage.sub.${isEngine(song.lead.origin) ? 'engine' : song.lead.origin}`) }}</p>
                <p v-if="song.takes.length > 1" class="mt-1 flex items-center gap-2 sm:hidden">
                  <button
                    type="button" class="inline-flex min-h-6 shrink-0 items-center gap-1 rounded-md border border-border px-1.5 py-px text-[11px] text-text-dim hover:border-accent1/50 hover:text-text"
                    :aria-expanded="unfolded.has(song.key)" @click.stop="toggleSong(song)"
                  >{{ t('create.takes', { n: song.takes.length }) }}<ChevronIcon class="h-3 w-3 transition-transform" :class="unfolded.has(song.key) ? 'rotate-180' : ''" /></button>
                  <button
                    type="button" class="inline-flex min-h-6 shrink-0 items-center rounded-md border border-border px-1.5 py-px text-[11px] text-text-dim hover:border-accent1/50 hover:text-text"
                    :title="t('takeCompare.openTitle')" @click.stop="openCompare(song)"
                  >{{ t('takeCompare.open') }}</button>
                </p>
              </div>
              <span v-if="songTags(song).length" class="hidden max-w-[11rem] shrink-0 gap-1 md:flex">
                <span v-for="tag in songTags(song)" :key="tag" class="min-w-0 truncate rounded-full bg-accent1/15 px-1.5 py-px text-[11px] text-text-dim">#{{ tag }}</span>
              </span>
              <span class="hidden shrink-0 gap-1 text-text-dim sm:flex">
                <SplitStemsIcon v-if="song.lead.hasStems" class="h-3.5 w-3.5" :title="t('libraryPage.filters.stems')" />
                <PianoKeysIcon v-if="song.lead.hasMidi" class="h-3.5 w-3.5" :title="t('libraryPage.filters.midi')" />
              </span>
              <span class="hidden w-24 shrink-0 sm:block"><span class="rounded-md border border-border px-1.5 py-px text-xs font-medium leading-4 text-text-dim">{{ originLabel(song.lead.origin) }}</span></span>
              <span class="w-10 shrink-0 text-end text-xs tabular-nums text-text-dim">{{ song.lead.durationSec ? formatClock(song.lead.durationSec) : '' }}</span>
              <FavoriteStar :track-id="song.lead.id" />
            </div>
            <LibraryDetails
              v-if="!wide && selected && selected.id === song.lead.id && !(song.takes.length > 1 && unfolded.has(song.key))" class="my-1.5"
              :track="selected" :origin-label="originLabel(selected.origin)" :take-label="takeLabel(selected)" :can-reuse="!!takeOf(selected)"
              @play="play(selected)" @reuse="onReuse(selected)" @rename="(title) => onRename(selected!, title)" @remove="onRemove(selected)"
            />

            <template v-if="song.takes.length > 1 && unfolded.has(song.key)">
              <template v-for="(take, n) in song.takes" :key="take.id">
                <div
                  class="group ms-8 flex min-h-10 max-w-[54rem] cursor-pointer items-center gap-3 rounded-lg py-1 pe-2.5 ps-1"
                  :class="selectedId === take.id ? 'bg-accent1/15' : sel.has(take.id) ? 'bg-accent1/[0.07]' : 'hover:bg-panel-2/70'" @click="select(take)"
                >
                  <SelectBox
                    size="sm" class="-me-1.5 transition-opacity" :class="boxClass(sel.has(take.id))" :state="sel.has(take.id)"
                    :label="t('libraryPage.bulk.selectTrack', { title: t('libraryPage.take', { n: n + 1 }) })" @toggle="(shift) => sel.toggle([take.id], shift)"
                  />
                  <button
                    v-if="covers.enabled" type="button" class="group/play relative h-7 w-7 shrink-0 overflow-hidden rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1"
                    :aria-label="isPlaying(take) ? t('create.pause') : t('create.play')" @click.stop="play(take)"
                  >
                    <CoverThumb :track-id="take.id" :title="t('libraryPage.take', { n: n + 1 })" placeholder class="h-full w-full" />
                    <span
                      class="absolute inset-0 flex items-center justify-center bg-black/40 text-white transition-opacity motion-reduce:transition-none"
                      :class="isPlaying(take) ? 'opacity-100' : 'opacity-0 group-hover/play:opacity-100 group-focus-visible/play:opacity-100 pointer-coarse:opacity-100 pointer-coarse:bg-black/25'" aria-hidden="true"
                    >
                      <PauseIcon v-if="isPlaying(take)" class="h-3 w-3" />
                      <PlayIcon v-else class="h-3 w-3" />
                    </span>
                  </button>
                  <button
                    v-else type="button" class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors"
                    :class="isPlaying(take) ? 'accent-gradient text-white' : 'border border-border text-text hover:border-accent1/60'"
                    :aria-label="isPlaying(take) ? t('create.pause') : t('create.play')" @click.stop="play(take)"
                  >
                    <PauseIcon v-if="isPlaying(take)" class="h-3 w-3" />
                    <PlayIcon v-else class="h-3 w-3" />
                  </button>
                  <p class="min-w-0 flex-1 truncate text-sm text-text">
                    {{ t('libraryPage.take', { n: n + 1 }) }}<span v-if="take.seed != null" class="text-text-dim">, Seed {{ take.seed }}</span>
                    <span class="ms-2 text-xs text-text-dim">{{ formatCreated(take.createdAt).label }}</span>
                  </p>
                  <span class="w-10 shrink-0 text-end text-xs tabular-nums text-text-dim">{{ take.durationSec ? formatClock(take.durationSec) : '' }}</span>
                  <FavoriteStar :track-id="take.id" />
                </div>
                <LibraryDetails
                  v-if="!wide && selected && selected.id === take.id" class="my-1.5 ms-8"
                  :track="selected" :origin-label="originLabel(selected.origin)" :take-label="takeLabel(selected)" :can-reuse="!!takeOf(selected)"
                  @play="play(selected)" @reuse="onReuse(selected)" @rename="(title) => onRename(selected!, title)" @remove="onRemove(selected)"
                />
              </template>
            </template>
          </template>
        </template>
        <button v-if="songs.length > shown" type="button" class="mt-2 w-full rounded-lg border border-border py-2.5 text-sm text-text-dim hover:bg-panel-2 hover:text-text" @click="shown += PAGE">
          {{ t('create.showMore', { n: songs.length - shown }) }}
        </button>
      </div>
    </section>

    <aside v-if="wide" class="sticky top-[calc(var(--header-h,4rem)+1.5rem)]">
      <!-- the panel's edge: drag it, or focus it and use the arrows; a double click goes back to the default width -->
      <div
        role="separator" aria-orientation="vertical" tabindex="0" :aria-label="t('libraryPage.resizeDetails')" :title="t('libraryPage.resizeDetailsHint')"
        :aria-valuenow="pane.width.value" :aria-valuemin="pane.min" :aria-valuemax="pane.max.value"
        class="group absolute inset-y-0 -start-4 z-10 flex w-3 cursor-col-resize touch-none justify-center rounded focus-visible:outline-2 focus-visible:outline-accent1"
        @pointerdown="pane.onPointerDown" @pointermove="pane.onPointerMove" @pointerup="pane.onPointerUp" @pointercancel="pane.onPointerUp"
        @keydown="pane.onKeydown" @dblclick="pane.reset"
      >
        <span
          class="my-6 w-0.5 rounded-full transition-colors motion-reduce:transition-none"
          :class="pane.dragging.value ? 'bg-accent1' : 'bg-transparent group-hover:bg-border group-focus-visible:bg-accent1'" aria-hidden="true"
        ></span>
      </div>
      <div class="max-h-[calc(100svh-var(--header-h,4rem)-7rem)] overflow-y-auto">
      <LibraryDetails
        v-if="selected" :track="selected" :origin-label="originLabel(selected.origin)" :take-label="takeLabel(selected)" :can-reuse="!!takeOf(selected)"
        @play="play(selected)" @reuse="onReuse(selected)" @rename="(title) => onRename(selected!, title)" @remove="onRemove(selected)"
        @restore="fromTrash([selected.id], 'restore')" @purge="fromTrash([selected.id], 'purge')"
      />
      <p v-else class="rounded-xl border border-dashed border-border p-6 text-center text-sm text-text-dim">{{ t('libraryPage.pick') }}</p>
      </div>
    </aside>
    <TakeCompare
      v-if="comparing" :title="comparing.title" :takes="comparing.takes" :total="comparing.total"
      @close="comparing = null" @trashed="onCompareTrashed" @restored="onCompareRestored"
    />
  </div>
</template>
