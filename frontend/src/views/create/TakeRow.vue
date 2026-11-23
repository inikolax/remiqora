<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePlayerStore } from '../../stores/player'
import type { PlayerTrack } from '../../stores/player'
import { useMarksStore } from '../../stores/marks'
import { useCoversStore } from '../../stores/covers'
import { useScoreWorkspace } from '../../stores/scoreWorkspace'
import { useNotesView } from '../../composables/useNotesView'
import { ENGINE_SHORT, useTakes } from '../../composables/useTakes'
import type { Take } from '../../composables/useTakes'
import type { ModelId } from '../../types'
import * as tracksApi from '../../api/tracks'
import { formatClock, formatDayTime } from '../../composables/formatCreated'
import { downloadFormat, downloadSavedTrack, setDownloadFormat } from '../../composables/useTrackDownload'
import type { DownloadFormat } from '../../composables/useTrackDownload'
import { useDismiss } from '../../composables/useDismiss'
import { confirmTrackDeletion } from '../../composables/useTrackUsage'
import { songName } from '../../utils/trackTitle'
import { trackBpm } from '../../utils/bpmFromText'
import FavoriteStar from '../../components/shared/FavoriteStar.vue'
import CoverThumb from '../../components/shared/CoverThumb.vue'
import StemsPanel from '../../components/shared/StemsPanel.vue'
import MidiPanel from '../../components/shared/MidiPanel.vue'
import PlayIcon from '../../components/shared/icons/PlayIcon.vue'
import PauseIcon from '../../components/shared/icons/PauseIcon.vue'
import ReuseIcon from '../../components/shared/icons/ReuseIcon.vue'
import DownloadIcon from '../../components/shared/icons/DownloadIcon.vue'
import MoreIcon from '../../components/shared/icons/MoreIcon.vue'
import TrashIcon from '../../components/shared/icons/TrashIcon.vue'
import MicIcon from '../../components/shared/icons/MicIcon.vue'
import WaveIcon from '../../components/shared/icons/WaveIcon.vue'
import PulseIcon from '../../components/shared/icons/PulseIcon.vue'
import SongMenu from './SongMenu.vue'
import StylePeek from './StylePeek.vue'

/**
 * A take of the session as one row of a track list: play, its name (the first sung line when it has no name of its
 * own) with the style under it, the engine and the time, the length, the star and a menu. `n` is the take's number
 * among the takes of the same prompt, when there are several, so rows of the same name are told apart. A click on
 * the style opens a card with the whole style and the words. Repeat and download show on hover; an unlit star only
 * on hover. The name is renamed in place: the pencil after it, a double click or F2, or the menu.
 */
/** `compare`: how many saved takes its song has to compare (0 for none); `compareLead`: this row carries the button;
 *  `otherDay`: the take was made on another day than the heading it sits under (its song's newest take's). */
const props = defineProps<{ take: Take; n: number | null; tracks: Map<string, PlayerTrack>; queue: PlayerTrack[]; compare?: number; compareLead?: boolean; otherDay?: boolean }>()
const emit = defineEmits<{ reuse: [take: Take]; compare: [] }>()
const { t } = useI18n()
const player = usePlayerStore()
const marks = useMarksStore()
const covers = useCoversStore()
const ws = useScoreWorkspace()
const notesView = useNotesView()
const { cancel, remove, rename, reuse } = useTakes()

const ENGINE_ICON: Record<ModelId, Component> = { yue2: MicIcon, ace_step: WaveIcon, stable_audio: PulseIcon }
const keyOf = (x: Take): string => (x.dbId != null ? `track:${x.dbId}` : x.key)

const named = computed(() => songName(props.take.title, props.take.style, props.take.lyrics))
const playable = computed(() => props.take.status === 'done' && props.take.audioUrl != null)
const active = computed(() => props.take.status === 'queued' || props.take.status === 'running')
const isCurrent = computed(() => player.isCurrent(keyOf(props.take)))
const isPlaying = computed(() => isCurrent.value && player.playing)
const fav = computed(() => marks.isFavorite(props.take.dbId))
/** Covers on and the saved take has one: the cover is the play button. */
const hasCover = computed(() => playable.value && !!covers.urlFor(props.take.dbId))
const when = computed(() => formatDayTime(props.take.createdAt))
/** When it was made, quieter than the length beside it and worded so it does not read as one: "at 02:29", or
 *  "yesterday, 20:40" under a heading of another day. */
const madeLabel = computed(() => (props.otherDay
  ? `${when.value.day.charAt(0).toLocaleLowerCase()}${when.value.day.slice(1)}, ${when.value.time}`
  : t('create.madeAt', { time: when.value.time })))

/** With nothing to play, the line under the name says why. */
const statusLine = computed(() => {
  const x = props.take
  if (playable.value) return null
  if (active.value) return { text: x.status === 'running' ? t('create.making') : t('create.queued'), cls: 'text-status-running' }
  if (x.status === 'failed') return { text: x.error || t('create.failed'), cls: 'text-status-failed' }
  return { text: t('create.stopped'), cls: 'text-text-dim' }
})
/** An error longer than what two lines hold for sure gets a Details toggle (the full text, readable on touch). */
const longError = computed(() => props.take.status === 'failed' && (props.take.error ?? '').length > 70)

// the time a take has run, for an engine that reports no progress (YuE2)
const now = ref(Date.now())
let ticker: ReturnType<typeof setInterval> | null = null
watch(() => props.take.status === 'running', (on) => {
  if (on && !ticker) { now.value = Date.now(); ticker = setInterval(() => { now.value = Date.now() }, 1000) }
  if (!on && ticker) { clearInterval(ticker); ticker = null }
}, { immediate: true })
onBeforeUnmount(() => { if (ticker) clearInterval(ticker) })
/** How far a running take is: the engine's percent, else the time it has run; nothing while it waits. */
const progressLabel = computed(() => {
  const x = props.take
  if (x.status !== 'running') return ''
  // a 0% from the queue is "no report yet", not progress: show the time then
  if (x.progress != null && x.progress > 0 && x.progress < 100) return `${Math.round(x.progress)}%`
  // counted from when the backend began it, so a reload or a second tab shows the same time
  return formatClock(Math.max(0, (now.value - (x.startedAt ?? x.createdAt)) / 1000))
})

function play(): void {
  const tr = props.tracks.get(props.take.key)
  if (tr) player.toggle(tr, props.queue)
}

const peekOpen = ref(false)
const menuOpen = ref(false)
const peekBox = ref<HTMLElement | null>(null)
const peekBtn = ref<HTMLElement | null>(null)
const menuBox = ref<HTMLElement | null>(null)
const menuBtn = ref<HTMLElement | null>(null)
/** Where the focus goes when the card closes on Escape: the line that opened it, or the ⋯ button if the menu did. */
let peekReturn: HTMLElement | null = null
useDismiss(peekOpen, () => [peekBox.value, peekBtn.value], () => { peekOpen.value = false }, { returnTo: () => peekReturn })
// Escape gives the focus back to ⋯, else it would fall to <body> with the menu gone
useDismiss(menuOpen, () => [menuBox.value], () => { menuOpen.value = false }, { returnTo: () => menuBtn.value })
function togglePeek(): void {
  peekReturn = peekBtn.value
  peekOpen.value = !peekOpen.value
}
/** From the menu the focus moves into the card (the menu item it came from is gone), so the keyboard is there. */
function peekFromMenu(): void {
  peekReturn = menuBtn.value
  peekOpen.value = true
  void nextTick(() => peekBox.value?.querySelector<HTMLElement>('[role=dialog]')?.focus())
}

/** A failed take's whole error, opened under its two lines. */
const errorOpen = ref(false)

/** Stopping a running take loses the minutes it has run: the first click asks ("Stop?"), the second stops. A take
 *  still waiting in the queue loses nothing and stops at once. */
const stopArmed = ref(false)
let stopTimer: ReturnType<typeof setTimeout> | null = null
function askStop(): void {
  if (stopTimer) clearTimeout(stopTimer)
  if (props.take.status !== 'running' || stopArmed.value) {
    stopArmed.value = false
    cancel(props.take)
    return
  }
  stopArmed.value = true
  stopTimer = setTimeout(() => { stopArmed.value = false }, 4000)
}
onBeforeUnmount(() => { if (stopTimer) clearTimeout(stopTimer) })

/** A tool opened from the menu, under the row: stems or MIDI. */
const tool = ref<'stems' | 'midi' | null>(null)

/** Only a saved take of an engine that keeps names can be renamed (ACE-Step has no rename on the server). */
const canRename = computed(() => props.take.dbId != null && props.take.engine !== 'ace_step')
/** The take being renamed, held from the start: the row's take object may be replaced while the name is typed. */
const editing = ref<Take | null>(null)
const draft = ref('')
let draftStart = ''
const nameInput = ref<HTMLInputElement | null>(null)
/** A take with a name of its own is edited as stored; one still called by its prompt starts from what the row
 *  shows (the first sung line or the first tags), so the user edits what they see, not a long prompt. */
function startRename(): void {
  const x = props.take
  if (!canRename.value || editing.value) return
  const own = !named.value.prompt
  draft.value = draftStart = own ? x.title : named.value.name
  editing.value = x
  void nextTick(() => { nameInput.value?.focus(); nameInput.value?.select() })
}
function commitRename(): void {
  const x = editing.value
  // Enter ends the edit and the blur that follows must not save it twice; nor may a blur after Escape
  if (!x) return
  editing.value = null
  const title = draft.value.trim()
  if (title && title !== draftStart && title !== x.title) void rename(x, title)
}
function cancelRename(): void {
  editing.value = null
}
/** F2 anywhere in the row renames, as on the name itself; not while typing in a field. */
function onF2(e: KeyboardEvent): void {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
  e.preventDefault()
  startRename()
}

/** A saved take through the server (the remembered format, or the one picked in the menu, which is then
 *  remembered); an unsaved one as its raw file. */
function download(format?: DownloadFormat): void {
  const x = props.take
  if (!x.audioUrl) return
  const name = x.filename || `${x.engine}_${x.seed ?? 1}.wav`
  if (x.dbId != null) {
    if (format) setDownloadFormat(format)
    void downloadSavedTrack(x.dbId, name)
    return
  }
  const a = document.createElement('a')
  a.href = x.audioUrl
  a.download = name
  a.click()
}
const downloadLabel = computed(() => (props.take.dbId != null
  ? t('create.downloadAs', { format: downloadFormat.value.toUpperCase() })
  : t('trackCard.downloadTagged')))
function repeat(): void {
  reuse(props.take)
  emit('reuse', props.take)
}
const hasScore = computed(() => props.take.engine === 'yue2' && (props.take.job as { abcPlan?: string | null }).abcPlan != null)
/** "Open notes": the take's score as a copy in Create's notes workspace; the form's score stays as it is until the
 *  copy's "To the form". */
async function openNotes(): Promise<void> {
  const x = props.take
  const job = x.job as { abcPlan?: string | null }
  try {
    const abc = job.abcPlan || (x.dbId != null ? await tracksApi.trackAbc(x.dbId) : '')
    if (!abc) return
    const name = named.value.name || t('create.untitled')
    ws.openCopy({ key: x.key, title: props.n != null ? t('create.notes.takeTitle', { title: name, n: props.n }) : name, lyrics: x.lyrics, style: x.style }, abc)
    void notesView.open({ keepCopy: true })
  } catch {
    // no score kept for this take: nothing to open
  }
}
/** A take with nothing to play (failed or stopped) can only be deleted: its bin is shown without hovering. */
const dead = computed(() => !playable.value && !active.value)

/** Deleting takes two clicks on the same button: the first turns it into a red "Delete?" for a few seconds. */
const armed = ref(false)
let disarmTimer: ReturnType<typeof setTimeout> | null = null
async function deleteTake(): Promise<void> {
  if (props.take.dbId != null && !(await confirmTrackDeletion([props.take.dbId], t))) return
  if (isCurrent.value) player.close()
  void remove(props.take)
}
function askDelete(): void {
  if (disarmTimer) clearTimeout(disarmTimer)
  if (armed.value) {
    armed.value = false
    deleteTake()
    return
  }
  armed.value = true
  disarmTimer = setTimeout(() => { armed.value = false }, 4000)
}
onBeforeUnmount(() => { if (disarmTimer) clearTimeout(disarmTimer) })

function act(what: 'reuse' | 'notes' | 'download' | 'stems' | 'midi' | 'rename' | 'style' | 'delete' | 'compare', format?: DownloadFormat): void {
  menuOpen.value = false
  if (what === 'compare') emit('compare')
  else if (what === 'reuse') repeat()
  else if (what === 'notes') void openNotes()
  else if (what === 'style') peekFromMenu()
  else if (what === 'rename') startRename()
  else if (what === 'delete') deleteTake()
  else {
    // the item that had the focus is gone with the menu: ⋯ gets it back (reuse moves it to the form, rename to the field)
    if (what === 'download') download(format)
    else tool.value = what
    void nextTick(() => menuBtn.value?.focus())
  }
}
const BIN = 'flex h-8 w-8 items-center justify-center rounded-lg text-text-dim hover:bg-status-failed/10 hover:text-status-failed'
const BIN_ARMED = 'flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg border border-status-failed/60 bg-status-failed/15 px-2 text-xs font-medium text-status-failed'
</script>

<template>
  <!-- capped on a wide screen: past ~900px the title and the time drift too far apart to read as one row -->
  <div class="take-row relative" :class="[isCurrent ? 'is-current bg-accent1/[0.06]' : '', armed ? 'is-armed' : '']">
    <span
      v-if="isCurrent || active" class="absolute inset-y-2 start-0 w-[3px] rounded-e-full"
      :class="isCurrent ? 'accent-gradient' : 'bg-status-running'" aria-hidden="true"
    ></span>

    <div
      class="grid grid-cols-[2.75rem_minmax(0,1fr)_1.75rem] items-center gap-x-3 py-2 pe-2 ps-3 @lg:grid-cols-[2.75rem_minmax(0,1fr)_7.5rem_2.5rem_1.75rem_1.75rem]"
      @keydown.f2="onF2"
    >
      <button
        v-if="hasCover" type="button" class="group/play relative h-11 w-11 overflow-hidden rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1"
        :aria-label="isPlaying ? t('create.pause') : t('create.play')" :title="isPlaying ? t('create.pause') : t('create.play')" @click="play"
      >
        <CoverThumb :track-id="take.dbId" :title="named.name || t('create.untitled')" class="h-full w-full" />
        <span
          class="absolute inset-0 flex items-center justify-center bg-black/40 text-white transition-opacity motion-reduce:transition-none"
          :class="isPlaying ? 'opacity-100' : 'opacity-0 group-hover/play:opacity-100 group-focus-visible/play:opacity-100 pointer-coarse:opacity-100 pointer-coarse:bg-black/25'" aria-hidden="true"
        >
          <PauseIcon v-if="isPlaying" class="h-4 w-4" />
          <PlayIcon v-else class="h-4 w-4" />
        </span>
      </button>
      <button
        v-else type="button" class="flex h-8 w-8 items-center justify-center justify-self-center rounded-full transition-colors disabled:opacity-40"
        :class="isPlaying ? 'accent-gradient text-white' : 'border border-border text-text hover:border-accent1/60'"
        :disabled="!playable" :aria-label="isPlaying ? t('create.pause') : t('create.play')" :title="isPlaying ? t('create.pause') : t('create.play')" @click="play"
      >
        <PauseIcon v-if="isPlaying" class="h-3.5 w-3.5" />
        <PlayIcon v-else class="h-3.5 w-3.5" />
      </button>

      <div class="relative min-w-0">
        <!-- the input keeps the name's line height and its text where the name was, so the row does not move -->
        <input
          v-if="editing" ref="nameInput" v-model="draft" type="text" dir="auto"
          class="-ms-[5px] block h-5 w-full min-w-0 rounded border border-accent1/60 bg-panel-2 px-1 py-0 text-sm font-semibold leading-5 text-text outline-none"
          :placeholder="t('create.untitled')" :aria-label="t('create.menu.rename')"
          @keydown.enter.prevent="commitRename" @keydown.escape.stop.prevent="cancelRename" @blur="commitRename"
        />
        <div v-else class="flex min-w-0 items-center gap-1.5">
          <!-- plain text: the pencil and the menu are the keyboard's way to rename -->
          <span class="block min-w-0 truncate text-sm font-semibold leading-5 text-text" :title="named.name || undefined" @dblclick="startRename"><bdi>{{ named.name || t('create.untitled') }}</bdi></span>
          <span v-if="n != null" class="shrink-0 text-xs text-text-dim">{{ t('create.takeN', { n }) }}</span>
          <!-- the song's newest saved take carries Compare; every take has it in its menu -->
          <button
            v-if="compareLead && (compare ?? 0) > 1" type="button"
            class="shrink-0 rounded-md border border-border px-1.5 py-px text-[11px] text-text-dim hover:border-accent1/50 hover:text-text"
            :title="t('takeCompare.openTitle')" @click="emit('compare')"
          >{{ t('takeCompare.open') }}</button>
          <button
            v-if="canRename" type="button" class="pen -my-0.5 -ms-1 flex h-6 w-6 shrink-0 items-center justify-center rounded text-text-dim hover:bg-panel-2 hover:text-text"
            :title="t('create.menu.rename')" :aria-label="t('create.menu.rename')" @click="startRename"
          ><svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z" /></svg></button>
        </div>
        <!-- each status has its words and its own mark, not only a colour: a spinner, a clock, a "!", a square -->
        <div v-if="statusLine" class="min-w-0 text-xs" :class="statusLine.cls">
          <p class="flex min-w-0 items-start gap-1.5">
            <span v-if="take.status === 'running'" class="mt-[3px] h-2.5 w-2.5 shrink-0 animate-spin rounded-full border-[1.5px] border-status-running/30 border-t-status-running motion-reduce:animate-none" aria-hidden="true"></span>
            <svg v-else-if="take.status === 'queued'" viewBox="0 0 24 24" class="mt-0.5 h-3 w-3 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
            <svg v-else-if="take.status === 'failed'" viewBox="0 0 24 24" class="mt-0.5 h-3 w-3 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5v.01" /></svg>
            <svg v-else viewBox="0 0 24 24" class="mt-0.5 h-3 w-3 shrink-0" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
            <!-- an error gets two lines, and all of it behind Details: a title alone is unreadable on touch -->
            <span class="min-w-0 break-words" :class="take.status !== 'failed' ? 'truncate' : errorOpen ? 'whitespace-pre-wrap' : 'line-clamp-2'">{{ statusLine.text }}</span>
            <!-- an ACE-Step batch is one row until it is done -->
            <span v-if="active && take.pending > 1" class="shrink-0 tabular-nums">×{{ take.pending }}</span>
          </p>
          <div v-if="take.status === 'failed'" class="ms-[18px] flex flex-wrap items-center gap-x-3">
            <button
              v-if="longError" type="button" class="min-h-6 rounded text-text-dim underline-offset-2 hover:text-text hover:underline focus-visible:outline-2 focus-visible:outline-accent1"
              :aria-expanded="errorOpen" @click="errorOpen = !errorOpen"
            >{{ errorOpen ? t('create.lessDetails') : t('create.details') }}</button>
            <!-- no resubmit of its own: the take's settings go into the form, Create makes it again -->
            <button
              type="button" class="inline-flex min-h-6 items-center gap-1 rounded text-accent1-text underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-accent1"
              @click="repeat"
            ><ReuseIcon class="h-3.5 w-3.5" />{{ t('create.reuseInForm') }}</button>
          </div>
        </div>
        <!-- 24px high for a finger or a pointer; the negative margin keeps the row as it was below it -->
        <button
          v-else-if="named.sub || take.lyrics" ref="peekBtn" type="button"
          class="-mb-1 block max-w-full truncate py-1 text-start text-xs leading-4 underline-offset-[3px] hover:text-text"
          :class="peekOpen ? 'text-accent underline decoration-accent/40' : 'text-text-dim'"
          :aria-expanded="peekOpen" :title="t('create.styleAndLyrics')" @click="togglePeek"
        >{{ named.sub || t('create.peek.lyrics') }}</button>
        <div v-if="peekOpen" ref="peekBox" class="absolute start-0 top-full z-30 mt-1">
          <StylePeek :style-text="take.style" :lyrics="take.lyrics" />
        </div>

        <!-- a narrow column: the engine, the time (or the progress) and the length go under the name -->
        <div class="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-text-dim @lg:hidden">
          <span class="inline-flex items-center gap-1" :title="ENGINE_SHORT[take.engine]">
            <component :is="ENGINE_ICON[take.engine]" class="h-3.5 w-3.5" />
            <span class="tabular-nums" :class="active ? 'text-status-running' : 'text-text-dim/80'">{{ active ? progressLabel : madeLabel }}</span>
          </span>
          <span v-if="playable" class="tabular-nums text-text">{{ formatClock(take.durationSec) }}</span>
          <FavoriteStar v-if="fav" :track-id="take.dbId" class="!h-6 !w-6" />
          <button
            v-if="active" type="button" class="ms-auto inline-flex min-h-6 items-center rounded-md border px-2 py-1"
            :class="stopArmed ? 'border-status-failed/60 bg-status-failed/15 font-medium text-status-failed' : 'border-border hover:border-status-failed/50 hover:text-status-failed'"
            :title="stopArmed ? t('create.stopConfirm') : undefined" @click="askStop" @blur="stopArmed = false"
          >{{ stopArmed ? t('create.stopAsk') : t('create.stop') }}</button>
          <button
            v-else-if="dead" type="button" class="ms-auto" :class="armed ? BIN_ARMED : BIN"
            :title="armed ? t('trackCard.confirmDelete') : t('trackCard.deleteTrack')" :aria-label="armed ? t('trackCard.confirmDelete') : t('trackCard.deleteTrack')"
            @click="askDelete" @blur="armed = false"
          ><TrashIcon class="h-4 w-4" /><span v-if="armed">{{ t('create.deleteAsk') }}</span></button>
        </div>
      </div>

      <!-- the engine and the time; under the pointer, repeat, download and the bin in their place -->
      <div class="relative hidden h-8 items-center justify-end @lg:flex">
        <button
          v-if="active" type="button" class="min-h-6 whitespace-nowrap rounded-md border px-2 py-1 text-xs"
          :class="stopArmed ? 'border-status-failed/60 bg-status-failed/15 font-medium text-status-failed' : 'border-border text-text-dim hover:border-status-failed/50 hover:text-status-failed'"
          :title="stopArmed ? t('create.stopConfirm') : undefined" @click="askStop" @blur="stopArmed = false"
        >{{ stopArmed ? t('create.stopAsk') : t('create.stop') }}</button>
        <button
          v-else-if="dead" type="button" :class="armed ? BIN_ARMED : BIN"
          :title="armed ? t('trackCard.confirmDelete') : t('trackCard.deleteTrack')" :aria-label="armed ? t('trackCard.confirmDelete') : t('trackCard.deleteTrack')"
          @click="askDelete" @blur="armed = false"
        ><TrashIcon class="h-4 w-4" /><span v-if="armed">{{ t('create.deleteAsk') }}</span></button>
        <template v-else>
          <span class="meta inline-flex min-w-0 items-center gap-1.5 text-[11px] text-text-dim/80" :title="`${ENGINE_SHORT[take.engine]}, ${when.full}`">
            <component :is="ENGINE_ICON[take.engine]" class="h-3.5 w-3.5 shrink-0" />
            <span class="truncate tabular-nums">{{ madeLabel }}</span>
          </span>
          <span class="acts absolute inset-y-0 end-0 flex items-center gap-0.5">
            <button v-if="!armed" type="button" class="flex h-8 w-8 items-center justify-center rounded-lg text-text-dim hover:bg-panel-2 hover:text-text" :title="t('create.reuseInForm')" :aria-label="t('create.reuseInForm')" @click="repeat"><ReuseIcon class="h-4 w-4" /></button>
            <button v-if="!armed" type="button" class="flex h-8 w-8 items-center justify-center rounded-lg text-text-dim hover:bg-panel-2 hover:text-text" :title="downloadLabel" :aria-label="downloadLabel" @click="download()"><DownloadIcon class="h-4 w-4" /></button>
            <button
              type="button" :class="armed ? BIN_ARMED : BIN"
              :title="armed ? t('trackCard.confirmDelete') : t('trackCard.deleteTrack')" :aria-label="armed ? t('trackCard.confirmDelete') : t('trackCard.deleteTrack')"
              @click="askDelete" @blur="armed = false"
            ><TrashIcon class="h-4 w-4" /><span v-if="armed">{{ t('create.deleteAsk') }}</span></button>
          </span>
        </template>
      </div>
      <!-- the length; while a take is made, how far it is -->
      <span class="hidden text-end text-xs tabular-nums @lg:block" :class="active ? 'text-status-running' : 'text-text'">{{ active ? progressLabel : playable ? formatClock(take.durationSec) : '' }}</span>
      <span class="hidden @lg:block"><FavoriteStar :track-id="take.dbId" class="!h-7 !w-7" :class="fav ? '' : 'quiet'" /></span>

      <div ref="menuBox" class="relative">
        <button
          ref="menuBtn" type="button" class="flex h-7 w-7 items-center justify-center rounded-lg text-text-dim hover:bg-panel-2 hover:text-text" :class="menuOpen ? 'bg-panel-2 text-text' : ''"
          :aria-expanded="menuOpen" aria-haspopup="menu" :title="t('create.more')" :aria-label="t('create.more')" @click="menuOpen = !menuOpen"
        ><MoreIcon class="h-4 w-4" /></button>
        <SongMenu
          v-if="menuOpen" :take="take" :has-score="hasScore" :can-rename="canRename"
          :can-midi="take.engine !== 'stable_audio'" :can-compare="(compare ?? 0) > 1" @act="act"
        />
      </div>
    </div>

    <div v-if="tool && take.dbId != null" class="relative mb-2.5 me-2 ms-3 @lg:ms-14">
      <button type="button" class="absolute end-2 top-2 z-10 rounded-md px-1.5 text-text-dim hover:text-text" :aria-label="t('create.closeTool')" :title="t('create.closeTool')" @click="tool = null">✕</button>
      <StemsPanel v-if="tool === 'stems'" :track-id="take.dbId" :title="take.title" :lyrics="take.lyrics" :model="take.engine" />
      <MidiPanel v-else-if="tool === 'midi'" :track-id="take.dbId" :bpm="trackBpm(take.params, take.style, take.title)" />
    </div>
  </div>
</template>

<style scoped>
/* with a mouse, repeat, download, the rename pencil and an unlit star wait for the pointer (or the keyboard) */
@media (hover: hover) {
  .quiet, .acts, .pen { opacity: 0; transition: opacity 0.12s; }
  .meta { transition: opacity 0.12s; }
  .take-row:hover .quiet, .take-row:focus-within .quiet, .take-row.is-current .quiet,
  .take-row:hover .acts, .take-row:focus-within .acts,
  .take-row:hover .pen, .take-row:focus-within .pen { opacity: 1; }
  .take-row:hover .meta, .take-row:focus-within .meta { opacity: 0; }
}
/* a bin asked once stays in sight until the second click or its few seconds run out */
.take-row.is-armed .acts { opacity: 1; }
.take-row.is-armed .meta { opacity: 0; }
@media (hover: none) {
  .acts { display: none; }
  /* no hover on a touch screen: the pencil is always there, but quiet */
  .pen { opacity: 0.5; }
}
@media (prefers-reduced-motion: reduce) {
  .quiet, .acts, .pen, .meta { transition: none; }
}
</style>
