<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { decodeStem } from '../../audio/mixerEngine'
import type { Clip } from '../../audio/timelineTypes'
import { useAceStepStore } from '../../stores/aceStep'
import { jobLabel, useAiPartsStore } from '../../stores/aiParts'
import type { AiPartJob, AiPartRequest } from '../../stores/aiParts'
import { useEditorStore } from '../../stores/editor'
import type { HeldClip } from '../../stores/editor'
import { useOrchestratorStore } from '../../stores/orchestrator'
import { TRACK_COLORS } from '../../utils/trackColors'
import {
  AI_MODE_TASK, AI_MODES, AI_TRACK_COLOR, AI_TRACKS, COPY_THRESHOLD, KEY_SCALES, MAX_CONTEXT_SEC, VOCAL_TRACKS,
  audioBufferToWavFile, correlationWithContext, renderContext,
} from '../../utils/aiParts'
import type { AiMode, AiTrack } from '../../utils/aiParts'
import type { DockSide } from '../../utils/dock'
import { guessVocalLanguage, VOCAL_LANGUAGES, vocalLanguageLabel } from '../../utils/vocalLanguages'
import ChipGroup from '../shared/ChipGroup.vue'
import AddPartIcon from '../shared/icons/AddPartIcon.vue'
import ContinueIcon from '../shared/icons/ContinueIcon.vue'
import CoverIcon from '../shared/icons/CoverIcon.vue'
import RepaintIcon from '../shared/icons/RepaintIcon.vue'
import SparklesIcon from '../shared/icons/SparklesIcon.vue'
import HelpIconButton from '../shared/HelpIconButton.vue'
import HelpModal from '../shared/HelpModal.vue'
import NotInstalled from '../shared/NotInstalled.vue'
import { useFeaturesStore } from '../../stores/features'

/** dock: where the editor put the panel; beside the timeline it is a narrow column, so it does not cap its height. */
const props = defineProps<{ buffers: Map<string, AudioBuffer>; dock?: DockSide }>()
/** Beside the timeline: the top row is laid out on purpose (title and close, modes 2x2, hint, action). */
const narrow = computed(() => props.dock === 'right')
const emit = defineEmits<{ close: []; 'play-from': [sec: number]; guide: [] }>()

const { t, tm } = useI18n()
const store = useEditorStore()
const aiStore = useAiPartsStore()
const aceStore = useAceStepStore()
const orchestrator = useOrchestratorStore()

// English examples: ACE-Step's text encoder follows English captions best.
const PART_PLACEHOLDERS: Record<AiTrack, string> = {
  drums: 'deep house drums, punchy kick, shuffled hi-hats, clap on 2 and 4',
  bass: 'deep warm sub bass, groovy rolling bassline',
  guitar: 'clean electric guitar, funky rhythm chords',
  keyboard: 'warm Rhodes electric piano, lush seventh chords',
  synth: 'soft warm analog pad, slow evolving chords',
  strings: 'staccato string section, short rhythmic stabs',
  brass: 'punchy brass section stabs',
  woodwinds: 'airy flute melody',
  percussion: 'shakers, congas, tambourine, groovy',
  fx: 'risers, sweeps and impacts',
  vocals: 'soulful female lead vocal',
  backing_vocals: 'airy female backing vocals, harmonies',
}
const MODE_PLACEHOLDERS: Record<Exclude<AiMode, 'lego'>, string> = {
  repaint: 'same style and instruments, a fresh take on this section',
  continue: 'the track continues naturally, same style and instruments',
  cover: 'acoustic guitar ballad, warm and intimate',
}
const DOWNLOAD_CMD = 'uv run acestep-download --model acestep-v15-base'
/** Crossfade where a repaint / continue variant meets the original (both sides carry the same audio there). */
const SEAM = 0.4
/** Cover output differs from the original everywhere, so its cuts are short. */
const COVER_SEAM = 0.05
/** Context around a repaint range and before a continue point (more = better fit, slower). */
const REPAINT_PAD = 60
const CONTINUE_CTX = 240

const mode = ref<AiMode>('lego')
const track = ref<AiTrack>('drums')
const captions = reactive<Record<AiMode, string>>({ lego: '', repaint: '', continue: '', cover: '' })
const lyrics = ref('')
/** '' = auto: read from the letters of the lyrics (ACE-Step itself would assume English). */
const vocalLanguage = ref('')
const autoLanguage = computed(() => guessVocalLanguage(lyrics.value))
const scope = ref<'whole' | 'loop'>('whole')
const lengthSec = ref(60)
const continueFrom = ref<'end' | 'loop'>('end')
const continueBars = ref(16)
const coverStrength = ref(0.5)
const keyScale = ref('')
const count = ref(3)
const models = reactive<Record<AiMode, string>>({ lego: '', repaint: '', continue: '', cover: '' })
const preparing = ref(false)
const formError = ref<string | null>(null)

const MODE_ICONS: Record<AiMode, Component> = { lego: AddPartIcon, repaint: RepaintIcon, continue: ContinueIcon, cover: CoverIcon }
const modeOptions = computed(() => AI_MODES.map((m) => ({ value: m, label: t(`aiPart.modes.${m}`), icon: MODE_ICONS[m] })))
const trackOptions = computed(() => AI_TRACKS.map((v) => ({ value: v, label: t(`aiPart.tracks.${v}`), color: laneColor(AI_TRACK_COLOR[v]) })))
/** A segment of a two-way switch (where the result goes): raised when chosen, quieter than the mode switch. */
function segmentClass(active: boolean): string {
  return `rounded-md px-2.5 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
    active ? 'bg-panel text-text shadow-sm ring-1 ring-border' : 'text-text-dim hover:text-text'
  }`
}
const placeholder = computed(() => (mode.value === 'lego' ? PART_PLACEHOLDERS[track.value] : MODE_PLACEHOLDERS[mode.value]))

// ---- Help on writing the description and the lyrics ----
const helpOpen = ref<null | 'description' | 'lyrics'>(null)
/** An example from the help goes into the "Add a part" description, with its instrument picked. */
function applyExample(ex: { track: AiTrack; text: string }) {
  mode.value = 'lego'
  track.value = ex.track
  captions.lego = ex.text
  helpOpen.value = null
}
const showLyrics = computed(() => (mode.value === 'lego' ? VOCAL_TRACKS.has(track.value) : true))
/** Outside lego the lyrics are optional, so the field waits behind a button until it is needed. */
const lyricsOpen = ref(false)
const lyricsVisible = computed(() => showLyrics.value && (mode.value === 'lego' || lyricsOpen.value || !!lyrics.value.trim()))

// ---- ACE-Step state ----
const aceStatus = computed(() => orchestrator.statuses.ace_step?.status ?? 'stopped')
const aceRunning = computed(() => orchestrator.activeModel === 'ace_step' && aceStatus.value === 'running')
const inventoryModels = computed(() => aceStore.inventory?.models ?? [])
const modeModels = computed(() => inventoryModels.value.filter((m) => m.supported_task_types.includes(AI_MODE_TASK[mode.value])))
const selectedModelLoaded = computed(() => modeModels.value.find((m) => m.name === models[mode.value])?.is_loaded ?? false)
const missingLegoModel = computed(() => mode.value === 'lego' && !!aceStore.inventory && modeModels.value.length === 0)
/** The base model left out at install: known from the disk, before ACE-Step is even running. */
const features = useFeaturesStore()
const baseNotInstalled = computed(() => mode.value === 'lego' && !features.has('aceBase'))

watch(aceRunning, (running) => { if (running) void aceStore.loadInventory() }, { immediate: true })
// Default model per mode: base for lego (turbo cannot), turbo for the rest. Not the inventory's
// default_model: that follows whichever DiT is loaded, so after a lego job it says "base".
watch(inventoryModels, (list) => {
  for (const m of AI_MODES) {
    const ok = list.filter((x) => x.supported_task_types.includes(AI_MODE_TASK[m]))
    if (ok.some((x) => x.name === models[m])) continue
    const prefer = m === 'lego'
      ? ok.find((x) => x.name === 'acestep-v15-base')
      : ok.find((x) => x.name === 'acestep-v15-turbo') ?? ok.find((x) => /turbo/.test(x.name))
    models[m] = (prefer ?? ok[0])?.name ?? ''
  }
}, { immediate: true })

async function startAce() {
  try {
    await orchestrator.switchModel('ace_step')
  } catch {
    // orchestrator.switchError is shown in the header
  }
}

// ---- Source lanes ----
const jobs = computed(() => aiStore.jobs.filter((j) => j.session === store.session))
/** Variant lanes still waiting for "Keep": they are alternatives, not part of the arrangement yet. */
const pendingVariantLanes = computed(() => new Set(
  jobs.value.filter((j) => j.kept == null).flatMap((j) => j.variants.map((v) => v.laneId).filter((id): id is string => !!id)),
))
const candidateLanes = computed(() => store.project.lanes.filter((l) => l.clips.length > 0 && !pendingVariantLanes.value.has(l.id)))
const listenIds = ref<string[]>([])
const knownLanes = new Set<string>()
let knownSession = -1
watch([() => store.session, candidateLanes], ([session, lanes]) => {
  if (session !== knownSession) {
    knownSession = session
    knownLanes.clear()
    listenIds.value = []
  }
  for (const l of lanes) {
    if (knownLanes.has(l.id)) continue
    knownLanes.add(l.id)
    if (!l.settings.muted) listenIds.value.push(l.id)
  }
  listenIds.value = listenIds.value.filter((id) => lanes.some((l) => l.id === id))
}, { immediate: true })

function laneColor(colorId?: string): string {
  return TRACK_COLORS.find((c) => c.id === colorId)?.baseHex ?? '#a855f7'
}

// ---- Where ----
const loop = computed(() => (store.project.loopRegion?.enabled ? store.project.loopRegion : null))
const projectEmpty = computed(() => store.totalDuration < 0.1)
watch(loop, (l) => {
  if (!l && scope.value === 'loop') scope.value = 'whole'
  if (!l && continueFrom.value === 'loop') continueFrom.value = 'end'
})
const barSec = computed(() => (4 * 60) / (store.project.bpm || 120))

type Spans = Pick<AiPartRequest, 'ctxStart' | 'ctxEnd' | 'regionStart' | 'regionEnd'>
/** Audio span sent to the model and where its result goes, for the current mode; or why it cannot run. */
const spans = computed<Spans | { error: string }>(() => {
  const total = store.totalDuration
  const l = loop.value
  switch (mode.value) {
    case 'lego': {
      const s = scope.value === 'loop' && l ? l.start : 0
      const e = scope.value === 'loop' && l ? l.end : projectEmpty.value ? lengthSec.value : total
      return { ctxStart: s, ctxEnd: e, regionStart: s, regionEnd: e }
    }
    case 'cover': {
      if (projectEmpty.value) return { error: t('aiPart.nothingToUse') }
      const s = scope.value === 'loop' && l ? l.start : 0
      const e = scope.value === 'loop' && l ? Math.min(l.end, total) : total
      return { ctxStart: s, ctxEnd: e, regionStart: s, regionEnd: e }
    }
    case 'repaint': {
      if (!l) return { error: t('aiPart.regionRequired') }
      const e = Math.min(l.end, total)
      if (e - l.start < 1) return { error: t('aiPart.tooShort') }
      return { ctxStart: Math.max(0, l.start - REPAINT_PAD), ctxEnd: Math.min(total, e + REPAINT_PAD), regionStart: l.start, regionEnd: e }
    }
    case 'continue': {
      const from = continueFrom.value === 'loop' && l ? Math.min(l.end, total) : total
      if (from < 2) return { error: t('aiPart.nothingToContinue') }
      const len = continueBars.value * barSec.value
      const ctxLen = Math.max(0, Math.min(CONTINUE_CTX, MAX_CONTEXT_SEC - len, from))
      return { ctxStart: from - ctxLen, ctxEnd: from, regionStart: from, regionEnd: from + len }
    }
  }
  return { error: '' }
})
const spanError = computed(() => ('error' in spans.value ? spans.value.error : null))

function fmt(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

// ---- Generate ----
/** Context audio per lego job, kept for the copy check when the variants arrive. */
const contexts = new Map<string, AudioBuffer>()
const canGenerate = computed(() => aceRunning.value && !baseNotInstalled.value && !!models[mode.value] && !preparing.value && !spanError.value
  && (mode.value === 'lego' || listenIds.value.length > 0))

async function generate() {
  formError.value = null
  const sp = spans.value
  if ('error' in sp) {
    formError.value = sp.error
    return
  }
  if (mode.value !== 'lego' && listenIds.value.length === 0) {
    formError.value = t('aiPart.needLanes')
    return
  }
  const total = Math.max(sp.ctxEnd, sp.regionEnd) - sp.ctxStart
  if (sp.regionEnd - sp.regionStart < 1) {
    formError.value = t('aiPart.tooShort')
    return
  }
  if (total > MAX_CONTEXT_SEC) {
    formError.value = t('aiPart.tooLong', { max: MAX_CONTEXT_SEC })
    return
  }
  preparing.value = true
  try {
    const ctx = renderContext(store.project, props.buffers, listenIds.value, sp.ctxStart, sp.ctxEnd)
    const m = mode.value
    const job = await aiStore.submit(
      {
        mode: m,
        track: track.value,
        caption: captions[m].trim() || placeholder.value,
        lyrics: showLyrics.value ? lyrics.value.trim() : '',
        vocalLanguage: showLyrics.value && lyrics.value.trim() ? vocalLanguage.value || autoLanguage.value : '',
        laneIds: [...listenIds.value],
        ...sp,
        model: models[m],
        keyScale: keyScale.value,
        bpm: store.project.bpm || 120,
        count: count.value,
        coverStrength: coverStrength.value,
      },
      audioBufferToWavFile(ctx, 'context.wav'),
      store.session,
    )
    if (m === 'lego') contexts.set(job.id, ctx)
  } catch (e) {
    formError.value = e instanceof Error ? e.message : String(e)
  } finally {
    preparing.value = false
  }
}

// ---- Results -> lanes ----
watch(
  () => aiStore.jobs.map((j) => `${j.id}:${j.status}`).join(','),
  () => {
    for (const job of aiStore.jobs) {
      if (job.status === 'done' && !job.inserted && job.session === store.session) void insertVariants(job)
    }
  },
)

/** Where a variant's audio sits on the timeline (repaint / continue output spans the whole context). */
function variantClip(r: AiPartRequest, url: string, name: string, buf: AudioBuffer): Clip {
  const base = { id: crypto.randomUUID(), type: 'audio' as const, sourceUrl: url, sourceLabel: name, originalBpm: store.project.bpm || 120 }
  if (r.mode === 'lego') {
    return { ...base, timelineStart: r.regionStart, trimStart: 0, trimEnd: buf.duration }
  }
  if (r.mode === 'cover') {
    return { ...base, timelineStart: r.regionStart, trimStart: 0, trimEnd: Math.min(buf.duration, r.regionEnd - r.regionStart),
      fadeInDuration: COVER_SEAM, fadeOutDuration: COVER_SEAM }
  }
  // Repaint / continue keep the original outside the range, so the variant starts a little early and
  // crossfades with it on identical audio.
  const pre = Math.min(SEAM, r.regionStart - r.ctxStart)
  const post = r.mode === 'repaint' ? Math.min(SEAM, r.ctxEnd - r.regionEnd) : 0
  const from = r.regionStart - pre
  return { ...base, timelineStart: from, trimStart: from - r.ctxStart,
    trimEnd: Math.min(buf.duration, r.regionEnd + post - r.ctxStart),
    fadeInDuration: Math.max(0.01, pre), fadeOutDuration: r.mode === 'repaint' ? Math.max(0.01, post) : 0.3 }
}

async function insertVariants(job: AiPartJob) {
  job.inserted = true
  const r = job.request
  const ctx = contexts.get(job.id)
  contexts.delete(job.id)
  const decoded = await Promise.all(job.variants.map(async (v) => {
    try {
      const buf = await decodeStem(v.url)
      props.buffers.set(v.url, buf)
      return buf
    } catch {
      return null
    }
  }))
  if (r.mode === 'lego') {
    job.variants.forEach((v, i) => {
      const buf = decoded[i]
      v.copyScore = buf && ctx ? correlationWithContext(buf, ctx) : null
    })
  }
  if (job.session !== store.session) return
  // Silence the originals under the range; one undo step together with the variant lanes below.
  let held: HeldClip[] = []
  if (r.mode === 'repaint') held = store.holdRange(r.laneIds, r.regionStart, r.regionEnd, SEAM, SEAM)
  else if (r.mode === 'continue') held = store.holdRange(r.laneIds, r.regionStart, r.regionEnd, SEAM, COVER_SEAM)
  else if (r.mode === 'cover') held = store.holdRange(r.laneIds, r.regionStart, r.regionEnd, COVER_SEAM, COVER_SEAM)
  job.held = held
  const firstGood = job.variants.findIndex((v) => (v.copyScore ?? 0) < COPY_THRESHOLD)
  const audible = firstGood >= 0 ? firstGood : 0
  const label = jobLabel(r)
  const color = r.mode === 'lego' ? AI_TRACK_COLOR[r.track] : 'pink'
  const ids = store.insertLanes(job.variants.map((v, i) => {
    const name = `${label} · ${t('aiPart.variantShort', { n: i + 1 })}`
    const buf = decoded[i]
    return { name, colorId: color, muted: i !== audible, clips: buf ? [variantClip(r, v.url, name, buf)] : [] }
  }))
  ids.forEach((id, i) => { job.variants[i].laneId = id })
}

function laneOf(id: string | null) {
  return id ? store.project.lanes.find((l) => l.id === id) : undefined
}

function isAudible(job: AiPartJob, i: number): boolean {
  const lane = laneOf(job.variants[i].laneId)
  return !!lane && !lane.settings.muted
}

function listen(job: AiPartJob, k: number) {
  job.variants.forEach((v, i) => {
    const lane = laneOf(v.laneId)
    if (lane) store.updateLaneSettings(lane.id, { ...lane.settings, muted: i !== k }, false)
  })
  // Lego plays the new part from its start; the others start a bit earlier to hear the seam.
  const r = job.request
  emit('play-from', r.mode === 'lego' ? r.regionStart : Math.max(0, r.regionStart - 4))
}

function keptName(r: AiPartRequest): string {
  return r.mode === 'lego' ? jobLabel(r) : `${jobLabel(r)} ${fmt(r.regionStart)}–${fmt(r.regionEnd)}`
}

function keep(job: AiPartJob, k: number) {
  const others = job.variants.filter((_, i) => i !== k)
  store.resolveVariantLanes(
    job.variants[k].laneId,
    others.map((v) => v.laneId).filter((id): id is string => !!id),
    keptName(job.request),
    job.held,
  )
  aiStore.discardVariants(others)
  job.kept = k
}

function discardAll(job: AiPartJob) {
  store.resolveVariantLanes(null, job.variants.map((v) => v.laneId).filter((id): id is string => !!id), undefined, job.held)
  aiStore.discardVariants(job.variants)
  aiStore.removeJob(job.id)
}

function statusText(job: AiPartJob): string {
  return job.status === 'running' ? t('aiPart.status.running', { p: job.progress }) : t(`aiPart.status.${job.status}`)
}
</script>

<template>
  <section
    class="flex flex-col gap-2.5 rounded-xl border border-border/60 bg-panel/70 p-3 shadow-sm backdrop-blur-md"
    :class="props.dock === 'right' ? 'shrink-0' : 'lg:max-h-[48svh] lg:min-h-[8rem] lg:overflow-y-auto'"
    :aria-label="t('aiPart.title')"
  >
    <!-- A horizontal panel above the timeline: the mode in the top row, the form in columns, the jobs as a strip of
         cards. The comment sits inside <section>: at the template root it would make the component a fragment and
         break v-show. -->
    <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div class="flex items-center gap-1">
        <!-- the editor's grip for moving the panel (DockHandle) -->
        <slot name="handle" />
        <h2 class="flex items-center gap-1.5 text-sm font-semibold text-text"><SparklesIcon class="h-4 w-4 shrink-0 text-accent1" />{{ t('aiPart.title') }}</h2>
        <HelpIconButton class="ml-0.5" :title="t('aiPart.guide.open')" :aria-label="t('aiPart.guide.open')" @click="emit('guide')" />
      </div>
      <div
        class="rounded-lg border border-border bg-panel-2 p-0.5"
        :class="narrow ? 'order-2 flex w-full' : 'inline-flex flex-wrap'"
        role="group"
        :aria-label="t('aiPart.modeLabel')"
      >
        <button
          v-for="o in modeOptions"
          :key="o.value"
          type="button"
          class="flex items-center justify-center gap-1.5 rounded-md py-1 transition-colors"
          :class="[
            narrow ? 'flex-auto whitespace-nowrap px-2 text-xs' : 'px-3 text-sm',
            mode === o.value ? 'accent-gradient text-white shadow-sm' : 'text-text-dim hover:text-text',
          ]"
          :aria-pressed="mode === o.value"
          @click="mode = o.value"
        >
          <!-- no icons in the narrow column: the four labels only just fit there -->
          <component :is="o.icon" v-if="!narrow" class="h-3.5 w-3.5 shrink-0" />
          {{ o.label }}
        </button>
      </div>
      <p class="min-w-[12rem] flex-1 text-xs text-text-dim" :class="narrow && 'order-3 basis-full'">{{ t(`aiPart.modeHints.${mode}`) }}</p>
      <!-- the action stays in view however small the panel gets -->
      <div class="flex items-center gap-2" :class="narrow && 'order-4'">
        <span class="text-[13px] font-medium text-text">{{ t('aiPart.variants') }}</span>
        <ChipGroup v-model="count" small :options="[{ value: 2, label: '2' }, { value: 3, label: '3' }, { value: 4, label: '4' }]" />
      </div>
      <button
        type="button"
        class="accent-gradient flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium text-white shadow-md shadow-accent1/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
        :class="narrow && 'order-5'"
        :disabled="!canGenerate"
        @click="generate"
      >
        <SparklesIcon class="h-4 w-4 shrink-0" />
        {{ preparing ? t('aiPart.preparing') : t(`aiPart.generateBtn.${mode}`) }}
      </button>
      <button
        type="button"
        class="rounded-lg border border-border px-2 py-1 text-xs text-text-dim hover:bg-panel-2"
        :class="narrow && 'order-1 ml-auto'"
        :aria-label="t('aiPart.close')"
        @click="emit('close')"
      >✕</button>
    </div>
    <p v-if="aceRunning && models[mode] && !selectedModelLoaded" class="-mt-1 text-right text-[11px] text-text-dim">{{ t('aiPart.firstLoadNote') }}</p>
    <p v-if="formError" class="rounded-lg bg-status-failed/10 p-2 text-xs text-status-failed">{{ formError }}</p>

    <!-- ACE-Step must be running -->
    <div v-if="!aceRunning" class="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-panel-2 p-3 text-sm">
      <p v-if="aceStatus === 'starting'" class="flex items-center gap-2 text-text-dim">
        <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-accent1 border-t-transparent"></span>
        {{ t('aiPart.aceStarting') }}
      </p>
      <template v-else>
        <p class="text-text-dim">{{ t('aiPart.aceOffline') }}</p>
        <button type="button" class="accent-gradient rounded-lg px-3 py-1.5 text-xs font-medium text-white" :disabled="orchestrator.switching" @click="startAce">{{ t('aiPart.startAce') }}</button>
      </template>
    </div>
    <NotInstalled v-if="baseNotInstalled" feature="aceBase" compact />
    <p v-else-if="aceRunning && missingLegoModel" class="rounded-lg bg-status-failed/10 p-3 text-xs text-status-failed">
      {{ t('aiPart.noModel', { cmd: DOWNLOAD_CMD }) }}
    </p>

    <!-- The form reads left to right: what to make, how to describe it, what the model hears and where it goes.
         Columns wrap on a narrow window. -->
    <div class="flex flex-wrap items-start gap-x-6 gap-y-3">
      <!-- Instrument (lego): each chip carries the color its new lane will get -->
      <div v-if="mode === 'lego'" class="flex min-w-[15rem] flex-[1.2] flex-col gap-1">
        <span id="ai-part-instrument" class="text-[13px] font-medium text-text" :title="t('aiPart.instrumentHint')">{{ t('aiPart.instrument') }}</span>
        <div class="flex flex-wrap gap-1.5" role="group" aria-labelledby="ai-part-instrument">
          <button
            v-for="o in trackOptions"
            :key="o.value"
            type="button"
            class="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors"
            :class="track === o.value ? 'text-text' : 'border-border bg-panel-2 text-text-dim hover:text-text'"
            :style="track === o.value ? { borderColor: o.color, backgroundColor: `${o.color}2e` } : undefined"
            :aria-pressed="track === o.value"
            @click="track = o.value"
          >
            <span class="h-2 w-2 shrink-0 rounded-full" :style="{ backgroundColor: o.color }" aria-hidden="true"></span>
            {{ o.label }}
          </button>
        </div>
      </div>

      <!-- Description and lyrics (not wrapping <label>s: they would label the help button, the first control inside) -->
      <div class="flex min-w-[16rem] flex-[1.4] flex-col gap-2.5">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-1.5">
            <label for="ai-part-description" class="text-[13px] font-medium text-text">{{ t(`aiPart.descriptionLabel.${mode}`) }}</label>
            <HelpIconButton @click="helpOpen = 'description'" />
          </div>
          <textarea id="ai-part-description" v-model="captions[mode]" rows="2" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text" :placeholder="placeholder"></textarea>
          <span class="text-[11px] text-text-dim">{{ t('aiPart.descriptionHint') }}</span>
        </div>
        <button v-if="showLyrics && !lyricsVisible" type="button" class="self-start text-xs text-accent1 hover:underline" @click="lyricsOpen = true">
          + {{ t('aiPart.addLyrics') }}
        </button>
        <div v-if="lyricsVisible" class="flex flex-col gap-1">
          <div class="flex items-center gap-1.5">
            <label for="ai-part-lyrics" class="text-[13px] font-medium text-text">{{ mode === 'lego' ? t('aiPart.lyrics') : t('aiPart.lyricsOptional') }}</label>
            <HelpIconButton @click="helpOpen = 'lyrics'" />
          </div>
          <textarea id="ai-part-lyrics" v-model="lyrics" :rows="mode === 'lego' ? 3 : 2" class="w-full rounded-lg border border-border bg-panel-2 p-2 font-mono text-sm text-text" :placeholder="t('aceGen.lyricsPlaceholder')"></textarea>
          <label class="flex items-center gap-2 text-xs text-text-dim">
            <span class="shrink-0">{{ t('aiPart.vocalLanguage') }}</span>
            <select v-model="vocalLanguage" class="min-w-0 flex-1 rounded-lg border border-border bg-panel-2 px-2 py-1 text-xs text-text">
              <option value="">{{ t('aiPart.vocalLanguageAuto', { lang: vocalLanguageLabel(autoLanguage) }) }}</option>
              <option v-for="l in VOCAL_LANGUAGES" :key="l.code" :value="l.code">{{ l.label }}</option>
            </select>
          </label>
        </div>
      </div>

      <!-- What the model hears -->
      <div class="flex min-w-[13rem] flex-1 flex-col gap-1">
        <span id="ai-part-sources" class="text-[13px] font-medium text-text">{{ t(`aiPart.sourceLabel.${mode}`) }}</span>
        <p v-if="candidateLanes.length === 0" class="text-xs text-text-dim">{{ mode === 'lego' ? t('aiPart.noLanes') : t('aiPart.nothingToUse') }}</p>
        <!-- lanes as toggles in their own colors: a filled dot is heard, a hollow one is not -->
        <div v-else class="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto" role="group" aria-labelledby="ai-part-sources">
          <label
            v-for="lane in candidateLanes"
            :key="lane.id"
            class="flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent1"
            :class="listenIds.includes(lane.id) ? 'border-text-dim/50 bg-panel-2 text-text' : 'border-border/60 text-text-dim hover:text-text'"
          >
            <input v-model="listenIds" type="checkbox" :value="lane.id" class="sr-only" />
            <span
              class="h-2 w-2 shrink-0 rounded-full border"
              :style="{ borderColor: laneColor(lane.colorId), backgroundColor: listenIds.includes(lane.id) ? laneColor(lane.colorId) : 'transparent' }"
              aria-hidden="true"
            ></span>
            <span class="max-w-[10rem] truncate">{{ lane.name }}</span>
          </label>
        </div>
        <p v-if="candidateLanes.length" class="text-[11px] text-text-dim">{{ t(`aiPart.sourceHint.${mode}`) }}</p>
      </div>

      <!-- Where the result goes, key and model -->
      <div class="flex min-w-[15rem] flex-1 flex-col gap-2.5">
        <div class="flex flex-col gap-1">
          <span id="ai-part-where" class="text-[13px] font-medium text-text">{{ t('aiPart.where') }}</span>
          <template v-if="mode === 'lego' || mode === 'cover'">
            <div class="inline-flex flex-wrap self-start rounded-lg border border-border bg-panel-2 p-0.5" role="group" aria-labelledby="ai-part-where">
              <button type="button" :class="segmentClass(scope === 'whole')" :aria-pressed="scope === 'whole'" @click="scope = 'whole'">
                {{ t('aiPart.whole', { range: `0:00–${fmt(projectEmpty && mode === 'lego' ? lengthSec : store.totalDuration)}` }) }}
              </button>
              <button type="button" :class="segmentClass(scope === 'loop')" :aria-pressed="scope === 'loop'" :disabled="!loop" @click="scope = 'loop'">
                {{ loop ? t('aiPart.selection', { range: `${fmt(loop.start)}–${fmt(loop.end)}` }) : t('aiPart.loopOff') }}
              </button>
            </div>
            <p v-if="!loop" class="text-[11px] text-text-dim">{{ t('aiPart.selectionOff') }}</p>
            <label v-if="mode === 'lego' && projectEmpty && scope === 'whole'" class="flex items-center gap-2 text-xs text-text-dim">
              {{ t('aiPart.length') }}
              <input v-model.number="lengthSec" type="number" min="5" :max="MAX_CONTEXT_SEC" class="w-20 rounded border border-border bg-panel-2 px-1.5 py-0.5 text-text" />
            </label>
          </template>
          <p v-else-if="mode === 'repaint'" class="text-sm" :class="loop ? 'text-text' : 'text-text-dim'">
            {{ loop ? t('aiPart.selection', { range: `${fmt(loop.start)}–${fmt(loop.end)}` }) : t('aiPart.selectionOff') }}
          </p>
          <template v-else>
            <div class="inline-flex flex-wrap self-start rounded-lg border border-border bg-panel-2 p-0.5" role="group" aria-labelledby="ai-part-where">
              <button type="button" :class="segmentClass(continueFrom === 'end')" :aria-pressed="continueFrom === 'end'" @click="continueFrom = 'end'">
                {{ t('aiPart.fromEnd', { t: fmt(store.totalDuration) }) }}
              </button>
              <button type="button" :class="segmentClass(continueFrom === 'loop')" :aria-pressed="continueFrom === 'loop'" :disabled="!loop" @click="continueFrom = 'loop'">
                {{ loop ? t('aiPart.fromLoop', { t: fmt(loop.end) }) : t('aiPart.loopOff') }}
              </button>
            </div>
            <label class="flex items-center gap-2 text-xs text-text-dim">
              {{ t('aiPart.continueBars') }}
              <input v-model.number="continueBars" type="number" min="1" max="128" class="w-16 rounded border border-border bg-panel-2 px-1.5 py-0.5 text-text" />
              {{ t('aiPart.continueLength', { sec: Math.round(continueBars * barSec) }) }}
            </label>
          </template>
          <p v-if="spanError" class="text-xs text-status-failed">{{ spanError }}</p>
        </div>

        <!-- Cover closeness -->
        <label v-if="mode === 'cover'" class="flex max-w-md flex-col gap-1.5">
          <span class="text-[13px] font-medium text-text">{{ t('aiPart.closeness', { v: coverStrength.toFixed(2) }) }}</span>
          <input v-model.number="coverStrength" type="range" min="0" max="1" step="0.05" class="w-full accent-accent1" />
          <span class="text-[11px] text-text-dim">{{ t('aiPart.closenessHint') }}</span>
        </label>

        <!-- Key and model in one row, the tempo after them -->
        <div class="flex flex-wrap items-end gap-x-3 gap-y-2">
          <label class="flex flex-col gap-1">
            <span class="text-[13px] font-medium text-text">{{ t('aiPart.key') }}</span>
            <select v-model="keyScale" class="rounded-lg border border-border bg-panel-2 px-2 py-1.5 text-sm text-text">
              <option value="">{{ t('aiPart.keyAuto') }}</option>
              <option v-for="k in KEY_SCALES" :key="k" :value="k">{{ k }}</option>
            </select>
          </label>
          <label class="flex flex-col gap-1">
            <span class="text-[13px] font-medium text-text">{{ t('aiPart.model') }}</span>
            <select v-model="models[mode]" class="rounded-lg border border-border bg-panel-2 px-2 py-1.5 text-sm text-text" :disabled="modeModels.length === 0">
              <option v-for="m in modeModels" :key="m.name" :value="m.name">{{ m.name.replace('acestep-v15-', '') }}</option>
            </select>
          </label>
          <span class="pb-2 text-xs text-text-dim">{{ t('aiPart.tempo', { bpm: store.project.bpm || 120 }) }}</span>
        </div>
      </div>
    </div>

    <!-- Jobs, newest first, as a strip of cards -->
    <div v-if="jobs.length" class="flex gap-3 overflow-x-auto pb-1">
      <div v-for="job in jobs" :key="job.id" class="flex w-80 shrink-0 flex-col gap-2 rounded-lg border border-border bg-panel-2 p-3">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="flex items-center gap-1.5 text-sm font-medium text-text">
              <span class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ backgroundColor: laneColor(job.request.mode === 'lego' ? AI_TRACK_COLOR[job.request.track] : 'pink') }"></span>
              {{ jobLabel(job.request) }}
              <span class="text-xs font-normal text-text-dim">{{ fmt(job.request.regionStart) }}–{{ fmt(job.request.regionEnd) }}</span>
            </p>
            <p class="truncate text-xs text-text-dim" :title="job.request.caption">{{ job.request.caption }}</p>
          </div>
          <span class="shrink-0 text-xs" :class="job.status === 'failed' ? 'text-status-failed' : 'text-text-dim'">{{ statusText(job) }}</span>
        </div>
        <div v-if="job.status === 'queued' || job.status === 'running'" class="h-1.5 overflow-hidden rounded-full bg-panel">
          <div class="h-full bg-gradient-to-r from-accent1 to-accent2 transition-all" :style="{ width: Math.max(4, job.progress) + '%' }"></div>
        </div>
        <p v-if="job.error" class="text-xs text-status-failed">{{ job.error }}</p>

        <template v-if="job.inserted && job.kept == null && job.session === store.session">
          <div v-for="(v, i) in job.variants" :key="i" class="flex items-center gap-2 text-xs">
            <span class="w-14 shrink-0 text-text">{{ t('aiPart.variantShort', { n: i + 1 }) }}</span>
            <span
              v-if="(v.copyScore ?? 0) >= COPY_THRESHOLD"
              class="rounded bg-status-failed/15 px-1.5 py-0.5 text-[11px] text-status-failed"
              :title="t('aiPart.copyWarningTitle')"
            >{{ t('aiPart.copyWarning') }}</span>
            <div class="ml-auto flex gap-1.5">
              <button
                type="button"
                class="rounded border px-2 py-1"
                :class="isAudible(job, i) ? 'border-accent1 text-accent1' : 'border-border text-text hover:bg-panel'"
                :aria-pressed="isAudible(job, i)"
                :disabled="!v.laneId"
                @click="listen(job, i)"
              >▶ {{ t('aiPart.listenVariant') }}</button>
              <button type="button" class="rounded border border-border px-2 py-1 text-text hover:bg-panel" :disabled="!v.laneId" @click="keep(job, i)">{{ t('aiPart.keep') }}</button>
            </div>
          </div>
          <button type="button" class="self-start text-xs text-text-dim hover:underline" @click="discardAll(job)">{{ job.held.length ? t('aiPart.discardRestore') : t('aiPart.discardAll') }}</button>
        </template>
        <div v-else-if="job.kept != null || job.status === 'failed' || job.status === 'cancelled'" class="flex items-center justify-between gap-2 text-xs text-text-dim">
          <span v-if="job.kept != null">{{ t('aiPart.keptNote', { n: job.kept + 1 }) }}</span>
          <button type="button" class="ml-auto hover:underline" @click="aiStore.removeJob(job.id)">{{ t('aiPart.dismiss') }}</button>
        </div>
        <button
          v-if="job.status === 'queued' || job.status === 'running'"
          type="button"
          class="self-start rounded border border-border px-2 py-1 text-xs text-text hover:bg-panel"
          @click="aiStore.cancel(job.id)"
        >{{ t('aiPart.cancel') }}</button>
      </div>
    </div>

    <HelpModal :open="helpOpen === 'description'" :title="t('aiPart.help.title')" @close="helpOpen = null">
      <p>{{ t('aiPart.help.intro') }}</p>
      <table class="w-full border-collapse text-xs">
        <thead>
          <tr class="border-b border-border text-left text-text">
            <th class="py-1 pl-1 pr-2">{{ t('aiPart.help.modeHeader') }}</th>
            <th class="py-1 pr-2">{{ t('aiPart.help.whatHeader') }}</th>
            <th class="py-1">{{ t('aiPart.help.exampleHeader') }}</th>
          </tr>
        </thead>
        <tbody class="align-top">
          <!-- the mode the panel is in is highlighted -->
          <tr
            v-for="row in (tm('aiPart.help.modes') as { mode: AiMode; what: string; example: string }[])"
            :key="row.mode"
            class="border-b border-border/60"
            :class="row.mode === mode ? 'bg-accent1/10' : ''"
          >
            <td class="whitespace-nowrap py-1.5 pl-1 pr-2 font-medium text-text">{{ t(`aiPart.modes.${row.mode}`) }}</td>
            <td class="py-1.5 pr-2">{{ row.what }}</td>
            <td class="py-1.5 pr-1 font-mono text-[11px]">{{ row.example }}</td>
          </tr>
        </tbody>
      </table>
      <p class="font-medium text-text">{{ t('aiPart.help.partTitle') }}</p>
      <table class="w-full border-collapse text-xs">
        <thead>
          <tr class="border-b border-border text-left text-text">
            <th class="py-1 pr-2">{{ t('aiPart.help.dimHeader') }}</th>
            <th class="py-1">{{ t('aiPart.help.wordsHeader') }}</th>
          </tr>
        </thead>
        <tbody class="align-top">
          <tr v-for="row in (tm('aiPart.help.dims') as { dim: string; words: string }[])" :key="row.dim" class="border-b border-border/60">
            <td class="whitespace-nowrap py-1.5 pr-2 font-medium text-text">{{ row.dim }}</td>
            <td class="py-1.5">{{ row.words }}</td>
          </tr>
        </tbody>
      </table>
      <p class="font-medium text-text">{{ t('aiPart.help.tipsTitle') }}</p>
      <ul class="list-disc space-y-1 pl-4">
        <li v-for="tip in (tm('aiPart.help.tips') as string[])" :key="tip">{{ tip }}</li>
      </ul>
      <p class="font-medium text-text">{{ t('aiPart.help.examplesTitle') }}</p>
      <p class="text-xs">{{ t('aiPart.help.useExample') }}</p>
      <div class="flex flex-col gap-1.5">
        <button
          v-for="ex in (tm('aiPart.help.examples') as { track: AiTrack; text: string }[])"
          :key="ex.track"
          type="button"
          class="rounded bg-panel-2 p-2 text-left text-xs hover:bg-accent1/10"
          @click="applyExample(ex)"
        >
          <span class="mr-1.5 font-medium text-text">{{ t(`aiPart.tracks.${ex.track}`) }}:</span>
          <span class="font-mono">{{ ex.text }}</span>
        </button>
      </div>
    </HelpModal>

    <!-- The tag tables and the example are the ones from ACE-Step generation: the same model reads the lyrics. -->
    <HelpModal :open="helpOpen === 'lyrics'" :title="t('aiPart.lyricsHelp.title')" @close="helpOpen = null">
      <p>{{ t('aiPart.lyricsHelp.intro') }}</p>
      <table class="w-full border-collapse text-xs">
        <thead>
          <tr class="border-b border-border text-left text-text">
            <th class="py-1 pr-2">{{ t('aceGen.help.lyrics.tagHeader') }}</th>
            <th class="py-1">{{ t('aceGen.help.lyrics.purposeHeader') }}</th>
          </tr>
        </thead>
        <tbody class="align-top">
          <tr v-for="row in (tm('aceGen.help.lyrics.rows') as { tag: string; purpose: string }[])" :key="row.tag" class="border-b border-border/60">
            <td class="py-1.5 pr-2 font-mono text-text">{{ row.tag }}</td>
            <td class="py-1.5">{{ row.purpose }}</td>
          </tr>
        </tbody>
      </table>
      <p class="font-medium text-text">{{ t('aceGen.help.lyrics.marksTitle') }}</p>
      <p>{{ t('aceGen.help.lyrics.marksIntro') }}</p>
      <table class="w-full border-collapse text-xs">
        <tbody class="align-top">
          <tr v-for="row in (tm('aceGen.help.lyrics.marks') as { tag: string; purpose: string }[])" :key="row.tag" class="border-b border-border/60">
            <td class="py-1.5 pr-2 font-mono text-text">{{ row.tag }}</td>
            <td class="py-1.5">{{ row.purpose }}</td>
          </tr>
        </tbody>
      </table>
      <p class="font-medium text-text">{{ t('aiPart.lyricsHelp.tipsTitle') }}</p>
      <ul class="list-disc space-y-1 pl-4">
        <li v-for="tip in (tm('aiPart.lyricsHelp.tips') as string[])" :key="tip">{{ tip }}</li>
      </ul>
      <p class="font-medium text-text">{{ t('aceGen.help.lyrics.exampleTitle') }}</p>
      <p class="whitespace-pre-line rounded bg-panel-2 p-2 font-mono text-xs">{{ t('aceGen.help.lyrics.example') }}</p>
    </HelpModal>
  </section>
</template>
