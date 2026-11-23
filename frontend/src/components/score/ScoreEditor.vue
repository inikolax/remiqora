<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import './score.css'
import { abcToScore, listMidiParts, lyricsSections, midiToScore, readMidiFile, sectionsFromLyrics } from '../../audio/score'
import type { MidiFileInfo, MidiPart } from '../../audio/score'
import { createScoreEditor, provideScoreEditor } from './useScoreEditor'
import type { ScoreEditorCtx } from './useScoreEditor'
import ScoreToolbar from './ScoreToolbar.vue'
import ToolPalette from './ToolPalette.vue'
import TransportBar from './TransportBar.vue'
import ScoreGrid from './ScoreGrid.vue'
import StatusBar from './StatusBar.vue'
import ChecksPanel from './ChecksPanel.vue'
import AbcTextPane from './AbcTextPane.vue'
import EmptyState from './EmptyState.vue'
import MidiTrackPicker from './MidiTrackPicker.vue'
import FullscreenEditor from './FullscreenEditor.vue'
import SheetView from './SheetView.vue'
import PianoInput from './PianoInput.vue'
import SimpleView from './SimpleView.vue'
import SimpleControls from './SimpleControls.vue'
import SongChips from './SongChips.vue'
import ImportMenu from './ImportMenu.vue'
import OverviewStrip from './OverviewStrip.vue'
import ScoreIcon from './ScoreIcon.vue'
import { checkText } from './checkText'
import { trackBpm } from './scoreUi'
import type { MidiPick } from './scoreUi'
import { listTracks } from '../../api/tracks'

/**
 * The YuE2 melody editor (variant A): the form's ABC score as a piano roll with two voices, sections and chords,
 * drawn and edited with four tools, played on a small piano, checked for YuE2. v-model stays the ABC text, the only
 * thing the form and the backend know; the editor reads it and writes every committed edit back.
 *
 * The views ("roll", "sheet", and "simple", the melody over the lyrics) all work on the one Score
 * of the shared editor state (useScoreEditor), so another view plugs in as one more component reading it.
 *
 * Two layouts of the same parts: "panel" (a column of the form, its own editor over v-model) and "workspace" (Create's
 * wide "Notes" in the session's place: a header with the views, the song's chips, tools and transport, the overview,
 * a grid as tall as the room, the checks and the ABC text folded at the bottom). The workspace gets its editor from
 * the score workspace store (`editor`), so it is the form's own score, not a copy; slots put the page's parts into
 * its header (`lead`, `tools`) and under it (`banner`).
 */
const props = withDefaults(defineProps<{
  modelValue?: string
  /** An editor made elsewhere (the workspace store's); without it the panel makes its own over v-model. */
  editor?: ScoreEditorCtx | null
  layout?: 'panel' | 'workspace'
  /** The song's lyrics: its section tags shape a new score and are checked against the score's sections. */
  lyrics?: string
  /** The style text: a female singer named there picks the female range. */
  styleText?: string
  /** The form's plan: 'melody' means YuE2 leaves the chords out. */
  plan?: 'off' | 'melody' | 'full'
  /** "From a song..." is running in the form. */
  extracting?: boolean
  /** For the full-screen header. */
  title?: string
}>(), { modelValue: '', editor: null, layout: 'panel', lyrics: '', styleText: '', plan: 'full', extracting: false, title: '' })
const emit = defineEmits<{ 'update:modelValue': [value: string]; fromSong: [] }>()
const { t } = useI18n()

const own = !props.editor
const ed = props.editor ?? createScoreEditor({
  getAbc: () => props.modelValue,
  setAbc: (v) => emit('update:modelValue', v),
  lyrics: () => props.lyrics,
  style: () => props.styleText,
})
provideScoreEditor(ed)
const abc = computed(() => ed.abc.value)
const wide = computed(() => props.layout === 'workspace')
const VIEWS = ['roll', 'sheet', 'simple'] as const
const { ui } = ed

// ---- width: the form is 440-640 px wide, the full screen much more ----
const root = ref<HTMLDivElement | null>(null)
const width = ref(600)
const compact = computed(() => width.value < 760)
let ro: ResizeObserver | null = null
onMounted(() => {
  if (root.value) {
    width.value = root.value.clientWidth || 600
    ro = new ResizeObserver(() => { width.value = root.value?.clientWidth || width.value })
    ro.observe(root.value)
  }
})
onBeforeUnmount(() => {
  ro?.disconnect()
  mainRo?.disconnect()
  // an editor of the store outlives this view: only what plays stops
  if (own) ed.dispose()
  else { ed.stop(); ui.fullscreen = false }
})

// ---- the workspace's grid fills the room left: the Vocal lane takes what the other rows do not ----
const main = ref<HTMLDivElement | null>(null)
const vocalH = ref(360)
let mainRo: ResizeObserver | null = null
function fit(): void {
  const el = main.value
  if (!el) return
  // the grid's other rows: sections, bars, chords (80), the instrument (110 + 6), the scroll bar (14), borders
  vocalH.value = Math.max(140, el.clientHeight - (80 + 116 + 14 + 4))
}
watch(main, (el) => {
  mainRo?.disconnect()
  mainRo = null
  if (el) { mainRo = new ResizeObserver(fit); mainRo.observe(el); fit() }
})

// ---- the workspace's bottom drawer: the checks and the ABC text, one summary line until opened ----
const drawer = ref(false)
const drawerId = `se-drawer-${Math.random().toString(36).slice(2, 8)}`
const hasNotes = computed(() => ed.score.value.voices.vocal.length + ed.score.value.voices.ins.length > 0)
const warnCount = computed(() => ed.checks.value.filter((c) => c.level === 'warn').length)
const okCount = computed(() => ed.checks.value.filter((c) => c.level === 'ok').length)
const remarkText = computed(() => ed.checks.value.filter((c) => c.level === 'warn').map((c) => checkText(c, ed.score.value.key, t).title).join(', '))
// the notes help's "Show the check": the drawer opens (the panel shows its checks anyway); asked before this view
// was up (from the form's card), it is taken on mounting
watch(() => ui.showChecks, (on) => {
  if (!on) return
  ui.showChecks = false
  if (wide.value) drawer.value = true
}, { immediate: true })

// ---- MIDI import ----
const midi = shallowRef<{ info: MidiFileInfo; parts: MidiPart[]; name: string; track: { title: string; bpm: number } | null } | null>(null)
/** After a MIDI import without sections: the offer to mark the song's parts by the lyrics' tags. */
const sectionsOffer = ref(false)
const lyricTags = computed(() => lyricsSections(ed.lyrics()).map((s) => s.tag || s.type))
/** A MIDI saved from the library is named "<source>_<track id>.mid": that track's tempo, when its params name one. */
async function trackOfFile(name: string): Promise<{ title: string; bpm: number } | null> {
  const id = Number(name.match(/_(\d+)\.midi?$/i)?.[1])
  if (!id) return null
  try {
    const tr = (await listTracks()).find((x) => x.id === id)
    const bpm = trackBpm(tr?.params as Record<string, unknown> | undefined)
    return tr && bpm ? { title: tr.title, bpm } : null
  } catch {
    return null
  }
}
const notice = ref('')
const noticeError = ref(false)
function say(text: string, error = false): void {
  notice.value = text
  noticeError.value = error
}
async function onMidiFile(file: File): Promise<void> {
  say('')
  sectionsOffer.value = false
  try {
    const info = readMidiFile(await file.arrayBuffer())
    const parts = listMidiParts(info)
    if (!parts.some((p) => !p.isDrums && p.noteCount)) { say(t('score.midi.empty'), true); return }
    midi.value = { info, parts, name: file.name, track: await trackOfFile(file.name) }
  } catch {
    say(t('score.midi.failed'), true)
  }
}
function onMidiConfirm(pick: MidiPick): void {
  const m = midi.value
  midi.value = null
  if (!m) return
  if (pick.voice !== ui.rangePreset) { ui.rangePreset = pick.voice; ui.rangeTouched = true }
  let r: ReturnType<typeof midiToScore>
  try {
    r = midiToScore(m.info, { vocalPart: pick.vocal, insPart: pick.ins, tempo: pick.tempo, fitOctave: pick.fitOctave ? pick.voice : null })
  } catch {
    say(t('score.midi.failed'), true)
    return
  }
  const title = m.name.replace(/\.midi?$/i, '')
  ed.replaceScore({ ...r.score, title })
  const oct = Math.abs(r.octaveShift) / 12
  say(t('score.midi.done', { notes: r.score.voices.vocal.length + r.score.voices.ins.length, bars: r.score.bars })
    + (oct ? ' ' + t(r.octaveShift > 0 ? 'score.midi.movedUp' : 'score.midi.movedDown', { n: oct }, oct) : '')
    + (r.dropped ? ' ' + t('score.midi.dropped', { n: r.dropped }) : ''))
  sectionsOffer.value = !r.score.sections.length && lyricTags.value.length > 0
}
function markSections(): void {
  sectionsOffer.value = false
  ed.commit(sectionsFromLyrics(ed.score.value, ed.lyrics()))
}
// the offer goes once the score has sections some other way
watch(() => ed.score.value.sections.length, (n) => { if (n) sectionsOffer.value = false })

// ---- paste ABC ----
const abcPane = ref<InstanceType<typeof AbcTextPane> | null>(null)
async function onPasteAbc(): Promise<void> {
  say('')
  let text = ''
  try { text = await navigator.clipboard.readText() } catch { /* not allowed: fall back to the text pane */ }
  if (!text.trim() || !/(^|\n)\s*(K:|X:|V:|\|)/.test(text)) {
    say(t('score.import.pasteFallback'))
    drawer.value = true
    void nextTick(() => abcPane.value?.focus())
    return
  }
  if (!ed.isEmpty.value && !window.confirm(t('score.import.replaceConfirm'))) return
  const r = abcToScore(text)
  ed.replaceScore(r.score)
  ed.warnings.value = r.warnings
}

// a message about the last import goes when the score is cleared
watch(() => ed.isEmpty.value, (empty) => { if (empty) say('') })

function openPiano(): void {
  ui.pianoOpen = true
  if (ui.view !== 'roll') ui.view = 'roll'
}
function drawInRoll(): void {
  ui.view = 'roll'
  ui.tool = 'pencil'
  ui.activeVoice = 'vocal'
}
function onKeyNote(p: number): void {
  if (ui.pianoOpen && ui.recording) ed.typeNote(p)
}
const setAbc = (v: string): void => ed.setAbc(v)

defineExpose({ importMidi: onMidiFile })
</script>

<template>
  <!-- the workspace: Create's wide "Notes" -->
  <div v-if="wide" ref="root" class="se-root flex h-full min-h-0 flex-col gap-2.5" @keydown="ed.onKey">
    <div class="flex flex-wrap items-center gap-2">
      <slot name="lead" />
      <span class="flex-1"></span>
      <slot name="tools" />
      <ImportMenu :extracting="extracting" @from-song="emit('fromSong')" @midi-file="onMidiFile" @piano="openPiano" @paste-abc="onPasteAbc" />
      <button type="button" class="se-btn icon" :disabled="!ed.canUndo.value" :title="`${t('score.toolbar.undo')} · Ctrl+Z`" :aria-label="t('score.toolbar.undo')" @click="ed.undo()"><ScoreIcon name="undo" /></button>
      <button type="button" class="se-btn icon" :disabled="!ed.canRedo.value" :title="`${t('score.toolbar.redo')} · Ctrl+Shift+Z`" :aria-label="t('score.toolbar.redo')" @click="ed.redo()"><ScoreIcon name="redo" /></button>
      <div class="se-seg" role="radiogroup" :aria-label="t('score.toolbar.view')">
        <button v-for="v in VIEWS" :key="v" type="button" role="radio" :aria-checked="ui.view === v" :class="{ on: ui.view === v }" :disabled="ed.isEmpty.value && !ui.pianoOpen" @click="ui.view = v">{{ t(`score.toolbar.views.${v}`) }}</button>
      </div>
      <button type="button" class="se-btn icon" :title="`${t('score.toolbar.fullscreen')} · F`" :aria-label="t('score.toolbar.fullscreen')" @click="ui.fullscreen = true"><ScoreIcon name="max" /></button>
    </div>
    <slot name="banner" />
    <div v-if="notice" class="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg p-2 text-xs" :class="noticeError ? 'bg-status-failed/10 text-status-failed' : 'bg-panel-2 text-text-dim'">
      <p class="m-0 w-full" role="status">{{ notice }}</p>
      <template v-if="sectionsOffer">
        <span class="min-w-0 flex-1 truncate text-text-dim">{{ t('score.midi.noSections', { tags: lyricTags.slice(0, 4).join(', ') + (lyricTags.length > 4 ? '…' : '') }) }}</span>
        <button type="button" class="se-btn h-7" @click="markSections">{{ t('score.midi.markSections') }}</button>
      </template>
    </div>

    <div v-if="ui.fullscreen" class="grid flex-1 place-items-center rounded-lg border border-dashed border-border p-4 text-center text-xs text-text-dim">{{ t('score.full.openNote') }}</div>
    <div v-else-if="ed.isEmpty.value && !ui.pianoOpen" class="min-h-0 flex-1 overflow-y-auto">
      <EmptyState :extracting="extracting" :compact="compact" @from-song="emit('fromSong')" @midi-file="onMidiFile" @piano="openPiano" />
    </div>
    <template v-else>
      <div class="flex flex-wrap items-center gap-2">
        <SongChips />
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <SimpleControls v-if="ui.view === 'simple'" />
        <ToolPalette v-else-if="ui.view === 'roll'" :compact="compact" />
        <span class="flex-1"></span>
        <TransportBar full />
      </div>
      <p v-if="plan === 'melody'" class="text-[11.5px] text-text-dim">{{ t('score.chords.planHint') }}</p>
      <template v-if="ui.view === 'roll'">
        <OverviewStrip v-if="hasNotes" />
        <div ref="main" class="min-h-0 flex-1 overflow-hidden">
          <ScoreGrid size="full" :vocal-height="vocalH" :compact="compact" @key-note="onKeyNote" />
        </div>
        <StatusBar :compact="compact" :toggles="false" />
      </template>
      <SimpleView v-else-if="ui.view === 'simple'" large @from-song="emit('fromSong')" @piano="openPiano" @draw="drawInRoll" />
      <div v-else class="flex min-h-0 flex-1 flex-col"><SheetView :abc="abc" large /></div>
      <PianoInput v-if="ui.pianoOpen" large />
    </template>

    <!-- the checks and the ABC text: a drawer at the bottom, one summary line; opened, it rises over the grid
         rather than squeezing it -->
    <div v-if="!ui.fullscreen" class="relative shrink-0 rounded-[10px] border border-border bg-panel-2">
      <button type="button" class="flex h-9 w-full min-w-0 items-center gap-2 overflow-hidden px-3 text-start text-[12px] hover:bg-white/[0.03]" :aria-expanded="drawer" :aria-controls="drawerId" @click="drawer = !drawer">
        <ScoreIcon :name="drawer ? 'down' : 'up'" class="h-3.5 w-3.5 shrink-0 text-text-dim" />
        <template v-if="!ed.isEmpty.value">
          <b class="shrink-0 font-semibold">{{ t('score.checks.title') }}</b>
          <span v-if="warnCount" class="shrink-0 rounded-md bg-[#eab308]/15 px-1.5 text-[11px] font-semibold text-[#facc15]">! {{ warnCount }}</span>
          <span v-if="okCount" class="shrink-0 rounded-md bg-[#22c55e]/15 px-1.5 text-[11px] font-semibold text-[#4ade80]">✓ {{ okCount }}</span>
          <span class="min-w-0 truncate text-[11.5px] text-[#8a8a9c]">{{ remarkText || t('score.checks.allOk') }}</span>
          <span class="se-sep mx-1"></span>
        </template>
        <b class="shrink-0 font-semibold">{{ t('score.abc.title') }}</b>
        <span v-if="ui.abcTyping" class="shrink-0 text-[11px] text-text-dim">{{ t('score.abc.reading') }}</span>
        <span v-else-if="ed.warnings.value.length" class="inline-flex shrink-0 items-center gap-1 text-[11px] text-[#facc15]"><ScoreIcon name="warn" class="h-3 w-3" />{{ t('score.abc.warnings', { n: ed.warnings.value.length }, ed.warnings.value.length) }}</span>
        <span v-else-if="abc.trim()" class="inline-flex shrink-0 items-center gap-1 text-[11px] text-[#4ade80]"><ScoreIcon name="check" class="h-3 w-3" />{{ t('score.abc.synced') }}</span>
      </button>
      <div
        v-show="drawer" :id="drawerId" class="absolute inset-x-0 bottom-full z-20 mb-1.5 grid h-[min(340px,45vh)] gap-2.5 rounded-[10px] border border-border bg-panel p-2.5 shadow-2xl"
        :class="ed.isEmpty.value ? 'grid-cols-1' : compact ? 'grid-cols-1 grid-rows-2' : 'grid-cols-2'"
        @keydown.esc.stop="drawer = false"
      >
        <ChecksPanel v-if="!ed.isEmpty.value" class="min-h-0 overflow-y-auto" />
        <AbcTextPane ref="abcPane" fill :model-value="abc" class="min-h-0" @update:model-value="setAbc" />
      </div>
    </div>

    <MidiTrackPicker v-if="midi" :parts="midi.parts" :file-name="midi.name" :replacing="!ed.isEmpty.value" :src="midi.info" :voice="ui.rangePreset" :track="midi.track" @confirm="onMidiConfirm" @cancel="midi = null" />
    <FullscreenEditor v-if="ui.fullscreen" :title="title" :abc="abc" :extracting="extracting" @from-song="emit('fromSong')" @midi-file="onMidiFile" @paste-abc="onPasteAbc" />
  </div>

  <!-- the panel: a column of a form -->
  <div v-else ref="root" class="se-root flex flex-col gap-2.5" @keydown="ed.onKey">
    <ScoreToolbar
      :extracting="extracting" :disabled="ed.isEmpty.value && !ui.pianoOpen"
      @from-song="emit('fromSong')" @midi-file="onMidiFile" @piano="openPiano" @paste-abc="onPasteAbc"
    />
    <div v-if="notice" class="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg p-2 text-xs" :class="noticeError ? 'bg-status-failed/10 text-status-failed' : 'bg-panel-2 text-text-dim'">
      <p class="m-0 w-full" role="status">{{ notice }}</p>
      <template v-if="sectionsOffer">
        <span class="min-w-0 flex-1 truncate text-text-dim">{{ t('score.midi.noSections', { tags: lyricTags.slice(0, 4).join(', ') + (lyricTags.length > 4 ? '…' : '') }) }}</span>
        <button type="button" class="se-btn h-7" @click="markSections">{{ t('score.midi.markSections') }}</button>
      </template>
    </div>

    <template v-if="ui.fullscreen">
      <p class="rounded-lg border border-dashed border-border p-4 text-center text-xs text-text-dim">{{ t('score.full.openNote') }}</p>
    </template>
    <EmptyState v-else-if="ed.isEmpty.value && !ui.pianoOpen" :extracting="extracting" :compact="compact" @from-song="emit('fromSong')" @midi-file="onMidiFile" @piano="openPiano" />
    <template v-else>
      <div class="flex flex-wrap items-center gap-2">
        <SimpleControls v-if="ui.view === 'simple'" />
        <ToolPalette v-else :compact="compact" />
        <span class="flex-1"></span>
        <TransportBar />
      </div>
      <p v-if="plan === 'melody'" class="text-[11.5px] text-text-dim">{{ t('score.chords.planHint') }}</p>
      <template v-if="ui.view === 'roll'">
        <ScoreGrid size="panel" :compact="compact" @key-note="onKeyNote" />
        <StatusBar :compact="compact" />
      </template>
      <SimpleView v-else-if="ui.view === 'simple'" @from-song="emit('fromSong')" @piano="openPiano" @draw="drawInRoll" />
      <SheetView v-else :abc="abc" />
      <PianoInput v-if="ui.pianoOpen" />
    </template>

    <div v-if="!ed.isEmpty.value || abc.trim()" class="grid gap-2.5" :class="compact ? 'grid-cols-1' : 'grid-cols-[minmax(0,400px)_minmax(0,1fr)]'">
      <ChecksPanel v-if="!ed.isEmpty.value" />
      <AbcTextPane ref="abcPane" :model-value="abc" :default-open="!compact" @update:model-value="setAbc" />
    </div>
    <AbcTextPane v-else ref="abcPane" :model-value="abc" :default-open="false" @update:model-value="setAbc" />

    <MidiTrackPicker v-if="midi" :parts="midi.parts" :file-name="midi.name" :replacing="!ed.isEmpty.value" :src="midi.info" :voice="ui.rangePreset" :track="midi.track" @confirm="onMidiConfirm" @cancel="midi = null" />
    <FullscreenEditor v-if="ui.fullscreen" :title="title" :abc="abc" :extracting="extracting" @from-song="emit('fromSong')" @midi-file="onMidiFile" @paste-abc="onPasteAbc" />
  </div>
</template>
