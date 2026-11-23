<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../../stores/player'
import { cleanTag, sameTag, useMarksStore } from '../../stores/marks'
import { useCoversStore } from '../../stores/covers'
import { useDismiss } from '../../composables/useDismiss'
import { formatClock, formatCreated } from '../../composables/formatCreated'
import { downloadSavedTrack } from '../../composables/useTrackDownload'
import type { DownloadFormat } from '../../composables/useTrackDownload'
import { trackBpm } from '../../utils/bpmFromText'
import { PromptCancelled, titleIdeaOf, useAutoTitle } from '../../composables/useAutoTitle'
import { isEngine, playerKey } from './libraryTracks'
import type { LibTrack } from './libraryTracks'
import FavoriteStar from '../../components/shared/FavoriteStar.vue'
import EditableTitle from '../../components/shared/EditableTitle.vue'
import TrackDetails from '../../components/shared/TrackDetails.vue'
import StemsPanel from '../../components/shared/StemsPanel.vue'
import MidiPanel from '../../components/shared/MidiPanel.vue'
import PlayIcon from '../../components/shared/icons/PlayIcon.vue'
import PauseIcon from '../../components/shared/icons/PauseIcon.vue'
import ReuseIcon from '../../components/shared/icons/ReuseIcon.vue'
import TrashIcon from '../../components/shared/icons/TrashIcon.vue'
import SparklesIcon from '../../components/shared/icons/SparklesIcon.vue'
import LibraryIcon from '../../components/shared/icons/LibraryIcon.vue'
import PlusIcon from '../../components/shared/icons/PlusIcon.vue'
import CheckIcon from '../../components/shared/icons/CheckIcon.vue'
import CopyIcon from '../../components/shared/icons/CopyIcon.vue'
import SlidersIcon from '../../components/shared/icons/SlidersIcon.vue'
import DownloadSplit from './DownloadSplit.vue'
import CoverPanel from './CoverPanel.vue'
import CoverJobState from './CoverJobState.vue'
import ProgressLine from './ProgressLine.vue'
import { useCoverActions } from './useCoverActions'
import { projectFromTrack } from './openInEditor'
import * as tracksApi from '../../api/tracks'
import { useScoreWorkspace } from '../../stores/scoreWorkspace'
import { useNotesView } from '../../composables/useNotesView'
import ScoreIcon from '../../components/score/ScoreIcon.vue'
import DownloadIcon from '../../components/shared/icons/DownloadIcon.vue'

/**
 * The chosen track. The head: its cover (small; a click opens the cover studio) with play on it, the title, what made
 * it and when, and its collections and tags. Under it the actions: Repeat with these settings, Download, Open in the
 * editor, and Delete as a quiet icon. Then three tabs - about it, its text, its stems and notes. A track in the trash has Restore and Delete
 * for good in place of the form and Delete, and no marks to edit.
 */
const props = defineProps<{ track: LibTrack; originLabel: string; takeLabel: string; canReuse: boolean }>()
const emit = defineEmits<{ play: []; reuse: []; rename: [title: string]; remove: []; restore: []; purge: [] }>()
const { t } = useI18n()
const player = usePlayerStore()
const marks = useMarksStore()
const covers = useCoversStore()
const coverActions = useCoverActions(() => props.track)
const router = useRouter()
const ws = useScoreWorkspace()
const notesView = useNotesView()

// The panel's own width (the pane is resizable, and in a narrow window it sits under the row): a smaller cover and
// two columns of facts at 400 px and under, Download as an icon at 360. Not a CSS container: that would also switch
// the title's rename button (which keys on a container of its own) to always shown.
const root = ref<HTMLElement | null>(null)
const width = ref(480)
let ro: ResizeObserver | null = null
onMounted(() => {
  if (!root.value) return
  width.value = root.value.getBoundingClientRect().width
  ro = new ResizeObserver(([e]) => { width.value = e.borderBoxSize?.[0]?.inlineSize ?? e.contentRect.width })
  ro.observe(root.value)
})
onBeforeUnmount(() => ro?.disconnect())
const narrow = computed(() => width.value <= 400)
const tiny = computed(() => width.value <= 360)
/** Open in the editor is an icon until the panel has room for its words beside the other two. */
const editorIcon = computed(() => width.value <= 520)

const current = computed(() => player.isCurrent(playerKey(props.track.id)))
const playing = computed(() => current.value && player.playing)
const created = computed(() => formatCreated(props.track.createdAt))
const trashed = computed(() => props.track.deletedAt != null)
const deleted = computed(() => (props.track.deletedAt != null ? formatCreated(props.track.deletedAt) : null))
const title = computed(() => props.takeLabel || t('create.untitled'))

type Tab = 'about' | 'lyrics' | 'parts'
const tab = ref<Tab>('about')
const tabs = computed<Tab[]>(() => (props.track.lyrics ? ['about', 'lyrics', 'parts'] : ['about', 'parts']))
watch(() => props.track.id, () => { if (!tabs.value.includes(tab.value)) tab.value = 'about' })

/** How it was made, a cell a fact; facts with nothing to say are left out. The length is in the head, the file under. */
const facts = computed(() => {
  const tr = props.track
  const p = tr.params
  const rows: { label: string; value: string; copy?: boolean }[] = []
  if (typeof p.precision === 'string') rows.push({ label: t('libraryPage.facts.model'), value: `YuE2 ${p.precision}` })
  else if (typeof p.model === 'string') rows.push({ label: t('libraryPage.facts.model'), value: p.model })
  if (typeof p.cot === 'string' && p.cot !== 'off') rows.push({ label: t('libraryPage.facts.melody'), value: t(`libraryPage.cot.${p.cot === 'full' ? 'full' : 'melody'}`) })
  const bpm = trackBpm(p, tr.style, tr.title)
  if (bpm) rows.push({ label: 'BPM', value: String(bpm) })
  if (tr.seed != null) rows.push({ label: t('aceGen.seed'), value: String(tr.seed), copy: true })
  if (tr.wallSec) rows.push({ label: t('libraryPage.facts.madeIn'), value: `${tr.wallSec.toFixed(1)} ${t('trackCard.secondsShort')}` })
  return rows
})

// ---- copy: the seed, the file name; a tick for a moment, read out once ----
const copied = ref<string | null>(null)
let copyTimer: ReturnType<typeof setTimeout> | undefined
async function copyText(key: string, text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = key
    clearTimeout(copyTimer)
    copyTimer = setTimeout(() => { copied.value = null }, 1800)
  } catch {
    // clipboard not available (insecure context): nothing to confirm
  }
}
onBeforeUnmount(() => clearTimeout(copyTimer))

function download(format: DownloadFormat): void {
  void downloadSavedTrack(props.track.id, props.track.filename, format)
}

// Delete moves the track to the trash at once (the page offers an undo). Deleting for good, from the trash, takes
// two clicks on the same button: the first one arms it for a few seconds.
const deleteArmed = ref(false)
let disarmTimer: ReturnType<typeof setTimeout> | null = null
function disarm(): void {
  deleteArmed.value = false
  if (disarmTimer) clearTimeout(disarmTimer)
  disarmTimer = null
}
function onPurge(): void {
  if (deleteArmed.value) {
    disarm()
    emit('purge')
    return
  }
  deleteArmed.value = true
  disarmTimer = setTimeout(disarm, 4000)
}
watch(() => props.track.id, disarm)
onBeforeUnmount(disarm)

// ---- the tags: a chip each with its ×; "+ Tag" turns into a field that adds one on Enter (suggesting the tags there are) ----
const uid = useId()
const tags = computed(() => marks.tagsOf(props.track.id))
const tagText = ref('')
const tagEditing = ref(false)
const tagInput = ref<HTMLInputElement | null>(null)
const tagAddBtn = ref<HTMLButtonElement | null>(null)
const tagNote = ref('')
const suggestions = computed(() => marks.tagList.filter((x) => !tags.value.some((y) => sameTag(x.name, y))).map((x) => x.name))
async function openTagInput(): Promise<void> {
  tagEditing.value = true
  tagText.value = ''
  await nextTick()
  tagInput.value?.focus()
}
async function closeTagInput(refocus: boolean): Promise<void> {
  tagEditing.value = false
  tagText.value = ''
  if (!refocus) return
  await nextTick()
  tagAddBtn.value?.focus()
}
async function addTag(): Promise<void> {
  const tag = cleanTag(tagText.value)
  tagText.value = ''
  if (!tag || tags.value.some((x) => sameTag(x, tag))) return
  if (await marks.setTags(props.track.id, [...tags.value, tag])) tagNote.value = t('libraryPage.tags.added', { tag })
}
/** Leaving the field adds what was typed and folds it back into "+ Tag". */
async function onTagBlur(): Promise<void> {
  if (tagText.value.trim()) await addTag()
  tagEditing.value = false
}
async function removeTag(tag: string): Promise<void> {
  if (await marks.setTags(props.track.id, tags.value.filter((x) => !sameTag(x, tag)))) tagNote.value = t('libraryPage.tags.removed', { tag })
  // the × that had the focus is gone with its chip: keep the keyboard on "+ Tag"
  await nextTick()
  if (tagEditing.value) tagInput.value?.focus()
  else tagAddBtn.value?.focus()
}
watch(() => props.track.id, () => { tagText.value = ''; tagNote.value = ''; tagEditing.value = false })

// ---- the collections: the ones it is in as chips; "+ Collection" lists them all to tick ----
const inCollections = computed(() => marks.collectionsOf(props.track.id))
const colOpen = ref(false)
const colTrigger = ref<HTMLButtonElement | null>(null)
const colPanel = ref<HTMLElement | null>(null)
/** The list opens toward the side with room: from the trigger's start, or back from its end near the panel's edge. */
const colAlignEnd = ref(false)
const closeCol = (): void => { colOpen.value = false }
useDismiss(colOpen, () => [colTrigger.value, colPanel.value], closeCol, { returnTo: () => colTrigger.value })
async function toggleCol(): Promise<void> {
  if (colOpen.value) { closeCol(); return }
  const tr = colTrigger.value?.getBoundingClientRect()
  const box = root.value?.getBoundingClientRect()
  if (tr && box) {
    const rtl = getComputedStyle(root.value!).direction === 'rtl'
    const room = rtl ? tr.right - box.left : box.right - tr.left
    colAlignEnd.value = room < 240
  }
  colOpen.value = true
  await nextTick()
  colPanel.value?.querySelector<HTMLElement>('[role^=menuitem]')?.focus()
}
function onColKey(e: KeyboardEvent): void {
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key) || !colPanel.value) return
  const items = [...colPanel.value.querySelectorAll<HTMLElement>('[role^=menuitem]')]
  if (!items.length) return
  e.preventDefault()
  const i = items.indexOf(document.activeElement as HTMLElement)
  const to = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1
    : i === -1 ? 0 : (i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length
  items[to]?.focus()
}
watch(() => props.track.id, closeCol)

// ---- a name from the prompt assistant: shown here, the track is renamed only when it is accepted ----
const autoTitle = useAutoTitle()
const proposal = ref<string | null>(null)
const proposalError = ref('')
const canName = computed(() => autoTitle.ready.value && !!titleIdeaOf(props.track))
// the names offered for this track so far: "Another one" tells the assistant not to give them (nor the title) again
let offered: string[] = []
const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()
async function proposeTitle(): Promise<void> {
  if (autoTitle.busy.value || !canName.value) return
  const id = props.track.id
  proposalError.value = ''
  try {
    const avoid = [props.track.title, ...offered]
    let out = await autoTitle.suggest(props.track, avoid)
    // still one given before: ask once more, then show whatever comes
    if (id === props.track.id && avoid.some((n) => sameName(n, out.title))) out = await autoTitle.suggest(props.track, avoid)
    if (id !== props.track.id) return
    if (!offered.some((n) => sameName(n, out.title))) offered.push(out.title)
    proposal.value = out.title
  } catch (e) {
    if (!(e instanceof PromptCancelled) && id === props.track.id) proposalError.value = e instanceof Error ? e.message : String(e)
  }
}
function acceptTitle(): void {
  if (proposal.value) emit('rename', proposal.value)
  proposal.value = null
}
function dropProposal(): void {
  autoTitle.cancel()
  proposal.value = null
  proposalError.value = ''
}
watch(() => props.track.id, () => { dropProposal(); offered = [] })
onBeforeUnmount(() => autoTitle.cancel())

// ---- the score (a YuE2 track sung from ABC notes): open a copy in Create's notes workspace, or download it ----
const scoreError = ref('')
watch(() => props.track.id, () => { scoreError.value = '' })
async function openScore(): Promise<void> {
  const tr = props.track
  try {
    const abc = await tracksApi.trackAbc(tr.id)
    if (!abc) return
    ws.openCopy({ key: `track:${tr.id}`, title: title.value, lyrics: tr.lyrics, style: tr.style }, abc)
    await notesView.open({ keepCopy: true })
  } catch (e) {
    scoreError.value = t('libraryPage.score.failed', { error: e instanceof Error ? e.message : String(e) })
  }
}
async function downloadScore(): Promise<void> {
  const tr = props.track
  try {
    const abc = await tracksApi.trackAbc(tr.id)
    const url = URL.createObjectURL(new Blob([abc], { type: 'text/vnd.abc;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${(tr.filename || `track_${tr.id}`).replace(/\.[^.]+$/, '')}.abc`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch (e) {
    scoreError.value = t('libraryPage.score.failed', { error: e instanceof Error ? e.message : String(e) })
  }
}

// ---- Open in the editor: a new project with this track on a lane ----
const openingEditor = ref(false)
const editorError = ref('')
watch(() => props.track.id, () => { editorError.value = '' })
async function openInEditor(): Promise<void> {
  if (openingEditor.value) return
  openingEditor.value = true
  editorError.value = ''
  try {
    const id = await projectFromTrack(props.track, title.value)
    await router.push(`/editor/${id}`)
  } catch (e) {
    editorError.value = t('libraryPage.openEditorFailed', { error: e instanceof Error ? e.message : String(e) })
  } finally {
    openingEditor.value = false
  }
}

const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1'
const ICON_BTN = `flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-dim hover:bg-panel-2 hover:text-text ${FOCUS}`
const CHIP = 'inline-flex h-[26px] items-center gap-1 whitespace-nowrap rounded-full text-xs leading-none'
const ADD_CHIP = `${CHIP} border border-dashed border-slider-track/60 px-2.5 text-text-dim hover:border-slider-track hover:text-text ${FOCUS}`
const BTN = `inline-flex h-9 min-w-0 items-center justify-center gap-2 rounded-lg px-3.5 text-[13px] font-medium whitespace-nowrap ${FOCUS}`
const QUIET = `ms-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-dim hover:bg-status-failed/10 hover:text-status-failed focus-visible:bg-status-failed/10 focus-visible:text-status-failed ${FOCUS}`
const ITEM = 'flex min-h-8 w-full items-center gap-2 rounded-md px-2 py-1 text-start text-xs text-text hover:bg-accent1/15 focus:bg-accent1/15 focus:outline-none'
</script>

<template>
  <div ref="root" class="rounded-xl border border-border bg-panel">
    <div class="space-y-3 p-4">
      <!-- the head: the cover (covers on) beside the title, what made it, and its marks -->
      <div :class="covers.enabled ? ['grid items-start', narrow ? 'grid-cols-[112px_minmax(0,1fr)] gap-3' : 'grid-cols-[150px_minmax(0,1fr)] gap-4'] : ''">
        <CoverPanel v-if="covers.enabled" :track="track" :title="title" :readonly="trashed" :current="current" :playing="playing" @play="emit('play')" />
        <div class="min-w-0 space-y-3">
          <div>
            <div class="flex items-start gap-1">
              <!-- covers off: play sits before the title -->
              <button
                v-if="!covers.enabled" type="button" class="accent-gradient me-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                :class="FOCUS" :aria-label="playing ? t('create.pause') : t('create.play')" :title="playing ? t('create.pause') : t('create.play')" @click="emit('play')"
              >
                <PauseIcon v-if="playing" class="h-4 w-4" />
                <PlayIcon v-else class="h-4 w-4" />
              </button>
              <div class="min-w-0 flex-1" :class="!covers.enabled ? 'pt-1.5' : ''">
                <EditableTitle class="text-base font-semibold" wrap :model-value="track.title" :display-text="takeLabel" :placeholder="t('create.untitled')" :editable="!trashed" @rename="(v) => emit('rename', v)" />
              </div>
              <button
                v-if="!trashed" type="button" :disabled="!canName || autoTitle.busy.value"
                :class="[ICON_BTN, 'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent']"
                :title="autoTitle.ready.value ? t('autoTitle.suggest') : t('autoTitle.noAssistant')" :aria-label="t('autoTitle.suggest')" @click="proposeTitle"
              ><SparklesIcon class="h-4 w-4" :class="autoTitle.busy.value ? 'animate-pulse motion-reduce:animate-none' : ''" /></button>
              <FavoriteStar v-if="!trashed" :track-id="track.id" class="-mt-0.5" />
            </div>
            <p class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-dim">
              <span class="rounded-md border border-border px-1.5 py-px font-medium leading-4 text-text">{{ originLabel }}</span>
              <span :title="created.full">{{ created.label }}</span>
              <template v-if="track.durationSec">
                <span class="h-[3px] w-[3px] rounded-full bg-text-dim/60" aria-hidden="true"></span>
                <span class="tabular-nums">{{ formatClock(track.durationSec) }}</span>
              </template>
              <span v-if="deleted" class="text-status-failed" :title="deleted.full">{{ t('libraryPage.trash.deleted', { when: deleted.label }) }}</span>
            </p>
            <!-- still called by its prompt: say so, and offer a name from the assistant -->
            <p v-if="track.promptTitle && !trashed && !proposal && !autoTitle.busy.value" class="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-text-dim">
              <span>{{ t('libraryPage.promptTitle') }}</span>
              <button
                v-if="canName" type="button" class="inline-flex min-h-6 items-center gap-1 rounded font-medium text-accent1-text underline-offset-2 hover:underline" :class="FOCUS"
                @click="proposeTitle"
              ><SparklesIcon class="h-3.5 w-3.5" />{{ t('autoTitle.suggest') }}</button>
            </p>
            <p v-if="current" class="mt-0.5 flex items-center gap-1 text-xs tabular-nums text-accent">
              <PlayIcon v-if="playing" class="h-2.5 w-2.5" />
              <PauseIcon v-else class="h-2.5 w-2.5" />
              <span>{{ formatClock(player.time) }} / {{ formatClock(player.total) }}</span>
            </p>
          </div>

          <!-- the marks: the collections it is in, its tags, and the two ways to add -->
          <div v-if="!trashed" class="flex flex-wrap items-center gap-1.5" role="group" :aria-label="t('libraryPage.marks')">
            <span v-for="c in inCollections" :key="`c${c.id}`" :class="[CHIP, 'bg-accent1/20 px-2.5 font-medium text-text']" :title="t('libraryPage.groups.collections')">
              <LibraryIcon class="h-3 w-3 shrink-0" /><span class="max-w-40 truncate">{{ c.name }}</span>
            </span>
            <span v-for="tag in tags" :key="`t${tag}`" :class="[CHIP, 'border border-border ps-2.5 text-text']">
              <span class="max-w-40 truncate">#{{ tag }}</span>
              <button
                type="button" class="-ms-0.5 flex h-6 w-6 items-center justify-center rounded-full text-sm text-text-dim hover:text-status-failed focus-visible:outline-2 focus-visible:outline-accent1"
                :title="t('libraryPage.tags.remove', { tag })" :aria-label="t('libraryPage.tags.remove', { tag })" @click="removeTag(tag)"
              >×</button>
            </span>
            <form v-if="tagEditing" @submit.prevent="addTag">
              <input
                ref="tagInput" v-model="tagText" type="text" maxlength="40" :list="`${uid}-tag-list`" dir="auto"
                class="h-[26px] w-36 rounded-full border border-accent1/60 bg-panel-2 px-2.5 text-xs text-text outline-none placeholder:text-text-dim/70"
                :placeholder="t('libraryPage.tags.add')" :aria-label="t('libraryPage.tags.add')"
                @keydown.esc.stop.prevent="closeTagInput(true)" @blur="onTagBlur"
              />
              <datalist :id="`${uid}-tag-list`">
                <option v-for="name in suggestions" :key="name" :value="name" />
              </datalist>
            </form>
            <button v-else ref="tagAddBtn" type="button" :class="ADD_CHIP" :aria-label="t('libraryPage.addTagHint')" :title="t('libraryPage.addTagHint')" @click="openTagInput">
              <PlusIcon class="h-3 w-3" />{{ t('libraryPage.bulk.tag') }}
            </button>
            <div class="relative">
              <button
                ref="colTrigger" type="button" :class="ADD_CHIP" aria-haspopup="menu" :aria-expanded="colOpen"
                :aria-label="t('libraryPage.addToCollection')" :title="t('libraryPage.addToCollection')" @click="toggleCol"
              ><PlusIcon class="h-3 w-3" />{{ t('libraryPage.bulk.collection') }}</button>
              <div
                v-if="colOpen" ref="colPanel" class="absolute top-full z-30 mt-1 w-56 rounded-lg border border-border bg-panel p-1.5 shadow-xl shadow-black/40"
                :class="colAlignEnd ? 'end-0' : 'start-0'" @keydown="onColKey"
              >
                <div v-if="marks.collections.length" role="menu" :aria-label="t('libraryPage.groups.collections')" class="max-h-60 overflow-y-auto">
                  <button
                    v-for="c in marks.collections" :key="c.id" type="button" role="menuitemcheckbox" :aria-checked="c.track_ids.includes(track.id)" :class="ITEM"
                    @click="marks.setInCollection(c.id, track.id, !c.track_ids.includes(track.id))"
                  >
                    <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded border" :class="c.track_ids.includes(track.id) ? 'border-transparent bg-accent1-strong text-white' : 'border-text-dim/70'" aria-hidden="true">
                      <CheckIcon v-if="c.track_ids.includes(track.id)" class="h-3 w-3" />
                    </span>
                    <span class="min-w-0 flex-1 truncate">{{ c.name }}</span>
                  </button>
                </div>
                <p v-else class="px-2 py-1.5 text-xs text-text-dim">{{ t('libraryPage.noCollections') }}</p>
              </div>
            </div>
            <p class="sr-only" role="status" aria-live="polite">{{ tagNote }}</p>
          </div>
        </div>
      </div>

      <!-- covers off: where the track is, under the head -->
      <ProgressLine v-if="!covers.enabled && current" class="relative h-2" />

      <!-- the proposal: nothing is renamed until it is accepted -->
      <div v-if="autoTitle.busy.value || proposal || proposalError" class="flex flex-wrap items-center gap-x-2 gap-y-1.5 rounded-lg border border-border bg-panel-2 px-2.5 py-1.5 text-xs" role="status">
        <template v-if="autoTitle.busy.value">
          <span class="min-w-0 flex-1 text-text-dim">{{ t('autoTitle.working') }}</span>
          <button type="button" class="rounded-md px-1.5 py-1 text-text-dim hover:text-text" @click="autoTitle.cancel()">{{ t('autoTitle.cancel') }}</button>
        </template>
        <template v-else-if="proposal">
          <span class="min-w-0 flex-1 truncate text-sm font-medium text-text" dir="auto" :title="proposal">{{ proposal }}</span>
          <button type="button" class="rounded-md bg-accent1-strong px-2 py-1 font-medium text-white hover:brightness-110" @click="acceptTitle">{{ t('autoTitle.accept') }}</button>
          <button type="button" class="rounded-md px-1.5 py-1 text-accent1-text hover:underline" @click="proposeTitle">{{ t('autoTitle.another') }}</button>
          <button type="button" class="rounded-md px-1.5 py-1 text-text-dim hover:text-text" @click="dropProposal">{{ t('autoTitle.cancel') }}</button>
        </template>
        <template v-else>
          <span class="min-w-0 flex-1 text-status-failed">{{ t('autoTitle.failed', { error: proposalError }) }}</span>
          <button type="button" class="rounded-md px-1.5 py-1 text-text-dim hover:text-text" @click="dropProposal">✕</button>
        </template>
      </div>

      <p v-if="editorError" class="text-xs text-status-failed" role="alert">{{ editorError }}</p>
      <!-- the cover being made (its state, Stop) or a failure -->
      <CoverJobState v-if="covers.enabled && !trashed" :actions="coverActions" />

      <!-- the actions: the main one, Download, and Delete as a quiet icon at the end -->
      <div v-if="trashed" class="flex items-center gap-2">
        <button type="button" :class="[BTN, 'accent-gradient text-white']" @click="emit('restore')"><ReuseIcon class="h-4 w-4 shrink-0" /><span class="truncate">{{ t('libraryPage.trash.restore') }}</span></button>
        <DownloadSplit :icon="tiny" :yue2="track.origin === 'yue2'" @download="download" />
        <button
          type="button" :class="deleteArmed ? `ms-auto inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-status-failed/60 bg-status-failed/10 px-3 text-[13px] font-medium text-status-failed ${FOCUS}` : QUIET"
          :aria-label="deleteArmed ? t('libraryPage.trash.confirmPurge') : t('libraryPage.trash.purge')" :title="t('libraryPage.trash.purge')"
          @click="onPurge" @blur="disarm"
        ><TrashIcon class="h-4 w-4 shrink-0" /><span v-if="deleteArmed">{{ t('libraryPage.trash.confirmPurge') }}</span></button>
      </div>
      <div v-else class="flex flex-wrap items-center gap-2">
        <button v-if="canReuse" type="button" :class="[BTN, 'accent-gradient text-white']" :title="t('libraryPage.reuseHint')" @click="emit('reuse')">
          <ReuseIcon class="h-4 w-4 shrink-0" /><span class="truncate">{{ t('create.reuse') }}</span>
        </button>
        <DownloadSplit :icon="tiny" :yue2="track.origin === 'yue2'" @download="download" />
        <button
          type="button" :class="[BTN, 'border border-border text-text hover:bg-panel-2 disabled:opacity-60', editorIcon ? 'w-9 !px-0' : '']" :disabled="openingEditor"
          :title="t('libraryPage.openEditorHint')" :aria-label="t('libraryPage.openEditor')" @click="openInEditor"
        ><SlidersIcon class="h-4 w-4 shrink-0" /><span v-if="!editorIcon" class="truncate">{{ openingEditor ? '…' : t('libraryPage.openEditor') }}</span></button>
        <button type="button" :class="QUIET" :aria-label="t('libraryPage.delete')" :title="t('libraryPage.trash.moveHint')" @click="emit('remove')"><TrashIcon class="h-4 w-4" /></button>
      </div>
      <p v-if="track.origin === 'yue2'" class="-mt-1 text-[11px] leading-snug text-text-dim" :title="t('libraryPage.yueLicenceHint')">{{ t('libraryPage.yueLicence') }}</p>
    </div>

    <div class="flex gap-1 border-y border-border px-3" role="tablist">
      <button
        v-for="id in tabs" :key="id" type="button" role="tab" :aria-selected="tab === id"
        class="relative px-2 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent1 motion-reduce:transition-none"
        :class="tab === id ? 'font-semibold text-text' : 'text-text-dim hover:text-text'" @click="tab = id"
      >
        {{ t(`libraryPage.tabs.${id}`) }}
        <span v-if="tab === id" class="accent-gradient absolute inset-x-2 bottom-0 h-0.5 rounded-full" aria-hidden="true"></span>
      </button>
    </div>

    <div class="p-4" role="tabpanel">
      <div v-if="tab === 'about'" class="space-y-4">
        <TrackDetails v-if="track.style" :style-text="track.style" icon-copy />
        <section v-if="facts.length" :aria-labelledby="`${uid}-made`">
          <h4 :id="`${uid}-made`" class="mb-2 flex items-center gap-1.5 text-xs font-semibold text-text-dim"><SlidersIcon class="h-3 w-3" />{{ t('libraryPage.howMade') }}</h4>
          <dl class="grid gap-x-4 gap-y-3" :class="narrow ? 'grid-cols-2' : 'grid-cols-3'">
            <div v-for="row in facts" :key="row.label" class="min-w-0" :class="row.copy ? 'col-span-2' : ''">
              <dt class="mb-0.5 text-xs text-text-dim">{{ row.label }}</dt>
              <dd class="flex min-w-0 items-center gap-1 text-sm tabular-nums text-text">
                <span class="min-w-0" :class="row.copy ? 'whitespace-nowrap' : '[overflow-wrap:anywhere]'">{{ row.value }}</span>
                <button
                  v-if="row.copy" type="button" :class="[ICON_BTN, 'h-6 w-6', copied === row.label ? 'text-status-done hover:text-status-done' : '']"
                  :aria-label="t('libraryPage.copyValue', { name: row.label })" :title="t('libraryPage.copyValue', { name: row.label })" @click="copyText(row.label, row.value)"
                >
                  <CheckIcon v-if="copied === row.label" class="h-3.5 w-3.5" />
                  <CopyIcon v-else class="h-3.5 w-3.5" />
                </button>
              </dd>
            </div>
          </dl>
        </section>
        <!-- the file: one muted line, the full name on hover, a copy button -->
        <div class="flex items-center gap-1 border-t border-border pt-3 text-xs text-text-dim">
          <span class="sr-only">{{ t('libraryPage.facts.file') }}:</span>
          <span class="min-w-0 flex-1 truncate" dir="auto" :title="track.filename">{{ track.filename }}</span>
          <button
            type="button" :class="[ICON_BTN, 'h-6 w-6', copied === 'file' ? 'text-status-done hover:text-status-done' : '']"
            :aria-label="t('libraryPage.copyFile')" :title="t('libraryPage.copyFile')" @click="copyText('file', track.filename)"
          >
            <CheckIcon v-if="copied === 'file'" class="h-3.5 w-3.5" />
            <CopyIcon v-else class="h-3.5 w-3.5" />
          </button>
        </div>
        <p class="sr-only" role="status" aria-live="polite">{{ copied ? t('trackDetails.copied') : '' }}</p>
      </div>
      <TrackDetails v-else-if="tab === 'lyrics'" :lyrics="track.lyrics" />
      <div v-else class="space-y-1.5">
        <!-- the notes YuE2 sang it from: a copy into Create's notes workspace, or the .abc file -->
        <section v-if="track.hasScore" class="rounded-lg border border-border bg-panel-2 px-3 py-2.5" :aria-labelledby="`${uid}-score`">
          <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div class="min-w-0 flex-1">
              <h4 :id="`${uid}-score`" class="flex items-center gap-1.5 text-sm font-semibold text-text"><ScoreIcon name="notes" class="h-4 w-4 text-text-dim" />{{ t('libraryPage.score.title') }}</h4>
              <p class="text-xs text-text-dim">{{ t('libraryPage.score.hint') }}</p>
            </div>
            <button type="button" class="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-text hover:bg-panel" :class="FOCUS" :title="t('libraryPage.score.openHint')" @click="openScore">{{ t('libraryPage.score.open') }}</button>
            <button type="button" class="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs text-text-dim hover:bg-panel hover:text-text" :class="FOCUS" @click="downloadScore"><DownloadIcon class="h-3.5 w-3.5" />{{ t('libraryPage.score.download') }}</button>
          </div>
          <p v-if="scoreError" class="mt-1.5 text-xs text-status-failed" role="alert">{{ scoreError }}</p>
        </section>
        <StemsPanel :key="`s${track.id}`" :track-id="track.id" :title="track.title" :lyrics="track.lyrics" :model="isEngine(track.origin) ? track.origin : 'ace_step'" />
        <MidiPanel :key="`m${track.id}`" :track-id="track.id" :bpm="trackBpm(track.params, track.style, track.title)" />
      </div>
    </div>
  </div>
</template>
