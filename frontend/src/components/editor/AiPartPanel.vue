<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { Component } from 'vue'
import { getAssistant, writePrompt } from '../../api/assistant'
import KeyScalePicker from '../shared/KeyScalePicker.vue'
import { useI18n } from 'vue-i18n'
import { decodeStem } from '../../audio/mixerEngine'
import type { Clip } from '../../audio/timelineTypes'
import { useAceStepStore } from '../../stores/aceStep'
import { jobLabel, useAiPartsStore } from '../../stores/aiParts'
import type { AiPartJob, AiPartRequest } from '../../stores/aiParts'
import { useEditorStore } from '../../stores/editor'
import type { HeldClip } from '../../stores/editor'
import { useOrchestratorStore } from '../../stores/orchestrator'
import { useStableAudioStore } from '../../stores/stableAudio'
import { shortLaneNames } from '../../utils/laneNames'
import { TRACK_COLORS } from '../../utils/trackColors'
import {
  AI_MODE_TASK, AI_MODES, AI_TRACK_COLOR, AI_TRACKS, COPY_THRESHOLD, ENGINE_MAX_CONTEXT_SEC, NOISE_EXEMPT_TRACKS, NOISE_THRESHOLD, ENGINE_MODEL_ID, ENGINE_MODES,
  SA3_ARRANGER_MODELS, VOCAL_TRACKS, audioBufferToWavFile, correlationWithContext, modelKey, noiseScore, parseModelKey, renderContext, variantVolume,
} from '../../utils/aiParts'
import type { AiEngine, AiMode, AiTrack } from '../../utils/aiParts'
import { MODEL_LABELS } from '../../composables/useModelSwitch'
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
import HelpBody from '../shared/help/HelpBody.vue'
import HelpSection from '../shared/help/HelpSection.vue'
import HelpList from '../shared/help/HelpList.vue'
import HelpTable from '../shared/help/HelpTable.vue'
import HelpExamples from '../shared/help/HelpExamples.vue'
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
const sa3Store = useStableAudioStore()
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
/**
 * Which engine each mode runs on, and the Stable Audio 3 checkpoint for it (`models` above keeps the
 * ACE-Step one). Remembered across sessions: a repaint can stay on Stable Audio while lego stays on ACE.
 */
const ENGINE_STORAGE_KEY = 'remiqora_arranger_engines'
const engines = reactive<Record<AiMode, AiEngine>>({ lego: 'ace', repaint: 'ace', continue: 'ace', cover: 'ace' })
const sa3Models = reactive<Record<AiMode, string>>({ lego: 'medium', repaint: 'medium', continue: 'medium', cover: 'medium' })
try {
  const saved = JSON.parse(localStorage.getItem(ENGINE_STORAGE_KEY) || '{}') as Partial<Record<AiMode, string>>
  for (const m of AI_MODES) {
    if (typeof saved[m] !== 'string') continue
    const { engine, model } = parseModelKey(saved[m] as string)
    if (!ENGINE_MODES[engine].includes(m)) continue
    engines[m] = engine
    if (engine === 'sa3' && (SA3_ARRANGER_MODELS as readonly string[]).includes(model)) sa3Models[m] = model
  }
} catch {
  // no storage, or a stale value: the defaults stand
}
watch([engines, sa3Models], () => {
  try {
    const out: Partial<Record<AiMode, string>> = {}
    for (const m of AI_MODES) out[m] = modelKey(engines[m], engines[m] === 'sa3' ? sa3Models[m] : '')
    localStorage.setItem(ENGINE_STORAGE_KEY, JSON.stringify(out))
  } catch {
    // private mode: nothing to remember
  }
})
const engine = computed<AiEngine>(() => engines[mode.value])
const engineLabel = computed(() => MODEL_LABELS[ENGINE_MODEL_ID[engine.value]])
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
const showLyrics = computed(() => engine.value === 'ace' && (mode.value === 'lego' ? VOCAL_TRACKS.has(track.value) : true))
/** Outside lego the lyrics are optional, so the field waits behind a button until it is needed. */
const lyricsOpen = ref(false)
const lyricsVisible = computed(() => showLyrics.value && (mode.value === 'lego' || lyricsOpen.value || !!lyrics.value.trim()))

// ---- Engine state (ACE-Step or Stable Audio 3; one of them runs on the GPU) ----
const aceStatus = computed(() => orchestrator.statuses.ace_step?.status ?? 'stopped')
const aceRunning = computed(() => orchestrator.activeModel === 'ace_step' && aceStatus.value === 'running')
const sa3Status = computed(() => orchestrator.statuses.stable_audio?.status ?? 'stopped')
const sa3Running = computed(() => orchestrator.activeModel === 'stable_audio' && sa3Status.value === 'running')
const engineStatus = computed(() => (engine.value === 'sa3' ? sa3Status.value : aceStatus.value))
const engineRunning = computed(() => (engine.value === 'sa3' ? sa3Running.value : aceRunning.value))
const inventoryModels = computed(() => aceStore.inventory?.models ?? [])
const modeModels = computed(() => inventoryModels.value.filter((m) => m.supported_task_types.includes(AI_MODE_TASK[mode.value])))
/** The base model left out at install: known from the disk, before ACE-Step is even running. */
const features = useFeaturesStore()
/** Stable Audio checkpoints the arranger can offer: the downloaded ones (known from the disk), or what its server reports. */
const sa3Choices = computed(() => {
  const reported = sa3Store.models.filter((m) => m.available).map((m) => m.id)
  const known = reported.length ? reported : features.features.stable_audio_models
  return SA3_ARRANGER_MODELS.filter((id) => (known as string[]).includes(id))
})
const sa3Installed = computed(() => features.has('stableAudio') && sa3Choices.value.length > 0)
/** The "engine · model" select: ACE-Step's checkpoints for the mode, then Stable Audio's (not for lego). */
const modelChoices = computed(() => {
  const groups: { engine: AiEngine; label: string; options: { key: string; label: string }[] }[] = [
    { engine: 'ace', label: MODEL_LABELS.ace_step, options: modeModels.value.map((m) => ({ key: modelKey('ace', m.name), label: m.name.replace('acestep-v15-', '') })) },
  ]
  if (ENGINE_MODES.sa3.includes(mode.value) && sa3Installed.value) {
    groups.push({ engine: 'sa3', label: MODEL_LABELS.stable_audio, options: sa3Choices.value.map((id) => ({ key: modelKey('sa3', id), label: id })) })
  }
  // An engine with nothing to offer yet (ACE-Step's inventory arrives once it runs) keeps its group only while chosen.
  return groups.filter((g) => g.options.length > 0 || g.engine === engine.value)
})
const modelChoice = computed({
  get: () => (engine.value === 'sa3' ? modelKey('sa3', sa3Models[mode.value]) : modelKey('ace', models[mode.value])),
  set: (key: string) => {
    const { engine: e, model } = parseModelKey(key)
    const m = mode.value
    if (!ENGINE_MODES[e].includes(m)) return
    engines[m] = e
    if (e === 'sa3') sa3Models[m] = model
    else models[m] = model
  },
})
const selectedModelLoaded = computed(() => (engine.value === 'sa3'
  ? (sa3Store.models.find((m) => m.id === sa3Models[mode.value])?.loaded ?? true)
  : (modeModels.value.find((m) => m.name === models[mode.value])?.is_loaded ?? false)))
const missingLegoModel = computed(() => mode.value === 'lego' && !!aceStore.inventory && modeModels.value.length === 0)
const baseNotInstalled = computed(() => mode.value === 'lego' && engine.value === 'ace' && !features.has('aceBase'))

watch(aceRunning, (running) => { if (running) void aceStore.loadInventory() }, { immediate: true })
watch(sa3Running, (running) => { if (running) void sa3Store.refreshModels() }, { immediate: true })
// Lego has no Stable Audio equivalent, and an engine whose weights went away falls back to ACE-Step.
watch([mode, sa3Installed], () => {
  for (const m of AI_MODES) if (engines[m] === 'sa3' && (!ENGINE_MODES.sa3.includes(m) || !sa3Installed.value)) engines[m] = 'ace'
}, { immediate: true })
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

async function startEngine() {
  try {
    await orchestrator.switchModel(ENGINE_MODEL_ID[engine.value])
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
/** Chip labels: stems of one track differ only after the colon, so the shared start is dropped. */
const laneLabels = computed(() => {
  const short = shortLaneNames(candidateLanes.value.map((l) => l.name))
  return Object.fromEntries(candidateLanes.value.map((l, i) => [l.id, short[i]]))
})
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
      const ctxLen = Math.max(0, Math.min(CONTINUE_CTX, ENGINE_MAX_CONTEXT_SEC[engine.value] - len, from))
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

// ---- Description in any language -> English (the prompt assistant's "ace-part" task) ----
const translating = ref(false)
const translateError = ref<string | null>(null)
/** What the user typed before the assistant rewrote it, per mode, for "undo". */
const translatedFrom = reactive<Record<AiMode, string>>({ lego: '', repaint: '', continue: '', cover: '' })

async function toEnglish() {
  const m = mode.value
  const idea = captions[m].trim()
  if (!idea || translating.value) return
  translating.value = true
  translateError.value = null
  try {
    // Set to "GPU" the assistant would unload the engine the arranger is about to use: say so instead.
    const state = await getAssistant()
    if (state.settings.device === 'cuda' && state.status !== 'running' && engineRunning.value) {
      translateError.value = t('aiPart.toEnglishGpu')
      return
    }
    // A part is described by its instrument; a range (repaint, continue, cover) as music.
    const res = await writePrompt('ace-part', idea, m === 'lego' ? { kind: track.value } : {})
    const text = String(res.fields.caption ?? '').trim()
    if (!text) throw new Error(t('aiPart.toEnglishFailed'))
    // Only if the field still holds what was sent: the user may have typed on meanwhile.
    if (captions[m].trim() === idea) {
      translatedFrom[m] = idea
      captions[m] = text
    }
  } catch (e) {
    translateError.value = e instanceof Error && e.message ? e.message : t('aiPart.toEnglishFailed')
  } finally {
    translating.value = false
  }
}

function undoEnglish() {
  const m = mode.value
  if (translatedFrom[m]) captions[m] = translatedFrom[m]
  translatedFrom[m] = ''
}

// ---- Generate ----
/** Context audio per job, kept for the lego copy check and the repaint / continue level match. */
const contexts = new Map<string, AudioBuffer>()
const canGenerate = computed(() => engineRunning.value && !preparing.value && !spanError.value
  && (engine.value === 'sa3' ? !!sa3Models[mode.value] : !baseNotInstalled.value && !!models[mode.value])
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
  if (total > ENGINE_MAX_CONTEXT_SEC[engine.value]) {
    formError.value = t('aiPart.tooLong', { max: ENGINE_MAX_CONTEXT_SEC[engine.value] })
    return
  }
  preparing.value = true
  try {
    const { buffer: ctx, gain: contextGain } = renderContext(store.project, props.buffers, listenIds.value, sp.ctxStart, sp.ctxEnd)
    const m = mode.value
    const job = await aiStore.submit(
      {
        mode: m,
        engine: engine.value,
        track: track.value,
        caption: captions[m].trim() || placeholder.value,
        lyrics: showLyrics.value ? lyrics.value.trim() : '',
        vocalLanguage: showLyrics.value && lyrics.value.trim() ? vocalLanguage.value || autoLanguage.value : '',
        laneIds: [...listenIds.value],
        ...sp,
        model: engine.value === 'sa3' ? sa3Models[m] : models[m],
        keyScale: keyScale.value,
        bpm: store.project.bpm || 120,
        count: count.value,
        coverStrength: coverStrength.value,
        contextGain,
      },
      audioBufferToWavFile(ctx, 'context.wav'),
      store.session,
    )
    if (m !== 'cover') contexts.set(job.id, ctx)
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
      else if (job.status === 'failed' || job.status === 'cancelled') contexts.delete(job.id)
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
      v.noiseScore = buf && !NOISE_EXEMPT_TRACKS.has(r.track) ? noiseScore(buf) : null
    })
  }
  if (job.session !== store.session) return
  // Silence the originals under the range; one undo step together with the variant lanes below.
  let held: HeldClip[] = []
  if (r.mode === 'repaint') held = store.holdRange(r.laneIds, r.regionStart, r.regionEnd, SEAM, SEAM)
  else if (r.mode === 'continue') held = store.holdRange(r.laneIds, r.regionStart, r.regionEnd, SEAM, COVER_SEAM)
  else if (r.mode === 'cover') held = store.holdRange(r.laneIds, r.regionStart, r.regionEnd, COVER_SEAM, COVER_SEAM)
  job.held = held
  // Play a real part first: not a copy of the context and not hiss.
  const firstGood = job.variants.findIndex((v) => (v.copyScore ?? 0) < COPY_THRESHOLD && (v.noiseScore ?? 0) < NOISE_THRESHOLD)
  const audible = firstGood >= 0 ? firstGood : 0
  const label = jobLabel(r)
  const color = r.mode === 'lego' ? AI_TRACK_COLOR[r.track] : 'pink'
  const ids = store.insertLanes(job.variants.map((v, i) => {
    const name = `${label} · ${t('aiPart.variantShort', { n: i + 1 })}`
    const buf = decoded[i]
    // The model heard the context normalised: the lane volume brings the variant back to the original's level.
    const volume = buf ? Math.round(variantVolume(r, buf, ctx ?? null) * 100) / 100 : undefined
    return { name, colorId: color, muted: i !== audible, volume, clips: buf ? [variantClip(r, v.url, name, buf)] : [] }
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
      <p class="min-w-[12rem] flex-1 text-xs text-text-dim" :class="narrow && 'order-3 basis-full'">{{ engine === 'sa3' ? t(`aiPart.modeHintsSa3.${mode}`) : t(`aiPart.modeHints.${mode}`) }}</p>
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
    <p v-if="engineRunning && !selectedModelLoaded" class="-mt-1 text-right text-[11px] text-text-dim">{{ t('aiPart.firstLoadNote') }}</p>
    <p v-if="formError" class="rounded-lg bg-status-failed/10 p-2 text-xs text-status-failed">{{ formError }}</p>

    <!-- The chosen engine must be running (starting it stops the other one) -->
    <div v-if="!engineRunning" class="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-panel-2 p-3 text-sm">
      <p v-if="engineStatus === 'starting'" class="flex items-center gap-2 text-text-dim">
        <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-accent1 border-t-transparent"></span>
        {{ t('aiPart.engineStarting', { engine: engineLabel }) }}
      </p>
      <template v-else>
        <p class="text-text-dim">{{ t('aiPart.engineOffline', { engine: engineLabel }) }}</p>
        <button type="button" class="accent-gradient rounded-lg px-3 py-1.5 text-xs font-medium text-white" :disabled="orchestrator.switching" @click="startEngine">{{ t('aiPart.startEngine', { engine: engineLabel }) }}</button>
        <span v-if="orchestrator.activeModel && orchestrator.activeModel !== ENGINE_MODEL_ID[engine]" class="text-[11px] text-text-dim">{{ t('aiPart.engineSwitchNote', { running: MODEL_LABELS[orchestrator.activeModel] }) }}</span>
      </template>
    </div>
    <NotInstalled v-if="baseNotInstalled" feature="aceBase" compact />
    <p v-else-if="aceRunning && engine === 'ace' && missingLegoModel" class="rounded-lg bg-status-failed/10 p-3 text-xs text-status-failed">
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
            <!-- Any language in, the English the model reads best out (the prompt assistant) -->
            <button
              type="button"
              class="ml-auto flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[11px] text-text-dim hover:bg-panel hover:text-text disabled:opacity-50"
              :disabled="translating || !captions[mode].trim()"
              :title="t('aiPart.toEnglishTitle')"
              @click="toEnglish"
            >
              <span v-if="translating" class="inline-block h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-accent1 border-t-transparent" aria-hidden="true"></span>
              <SparklesIcon v-else class="h-3 w-3 shrink-0" />
              {{ translating ? t('aiPart.toEnglishBusy') : t('aiPart.toEnglish') }}
            </button>
          </div>
          <textarea id="ai-part-description" v-model="captions[mode]" rows="2" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text" :placeholder="placeholder"></textarea>
          <span v-if="translateError" class="text-[11px] text-status-failed" role="alert">{{ translateError }}</span>
          <span v-else-if="translatedFrom[mode]" class="text-[11px] text-text-dim">
            {{ t('aiPart.toEnglishDone') }}
            <button type="button" class="text-accent1 hover:underline" @click="undoEnglish">{{ t('aiPart.toEnglishUndo') }}</button>
          </span>
          <span v-else class="text-[11px] text-text-dim">{{ t('aiPart.descriptionHint') }}</span>
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
            <span class="max-w-[10rem] truncate" :title="lane.name">{{ laneLabels[lane.id] }}</span>
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
              <input v-model.number="lengthSec" type="number" min="5" :max="ENGINE_MAX_CONTEXT_SEC[engine]" class="w-20 rounded border border-border bg-panel-2 px-1.5 py-0.5 text-text" />
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
          <div class="flex flex-col gap-1">
            <span class="text-[13px] font-medium text-text">{{ t('aiPart.key') }}</span>
            <KeyScalePicker v-model="keyScale" :empty-label="t('aiPart.keyAuto')" />
          </div>
          <label class="flex flex-col gap-1">
            <span class="text-[13px] font-medium text-text">{{ modelChoices.length > 1 ? t('aiPart.engineModel') : t('aiPart.model') }}</span>
            <!-- one decision, "who renders it": the engine's checkpoints grouped under the engine's name -->
            <select v-model="modelChoice" class="rounded-lg border border-border bg-panel-2 px-2 py-1.5 text-sm text-text" :disabled="modelChoices.every((g) => g.options.length === 0)">
              <template v-for="g in modelChoices" :key="g.engine">
                <optgroup v-if="modelChoices.length > 1" :label="g.label">
                  <option v-for="o in g.options" :key="o.key" :value="o.key">{{ o.label }}</option>
                </optgroup>
                <option v-for="o in g.options" v-else :key="o.key" :value="o.key">{{ o.label }}</option>
              </template>
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
            <span
              v-else-if="(v.noiseScore ?? 0) >= NOISE_THRESHOLD"
              class="rounded bg-status-failed/15 px-1.5 py-0.5 text-[11px] text-status-failed"
              :title="t('aiPart.noiseWarningTitle')"
            >{{ t('aiPart.noiseWarning') }}</span>
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

    <!-- The help windows, in the editor guide's look (HelpBody, HelpSection, HelpTable) -->
    <HelpModal :open="helpOpen === 'description'" :title="t('aiPart.help.title')" wide @close="helpOpen = null">
      <HelpBody :lead="t('aiPart.help.intro')">
        <!-- the mode the panel is in is highlighted -->
        <HelpTable
          :columns="[
            { key: 'name', label: t('aiPart.help.modeHeader'), nowrap: true },
            { key: 'what', label: t('aiPart.help.whatHeader') },
            { key: 'example', label: t('aiPart.help.exampleHeader'), mono: true },
          ]"
          :rows="(tm('aiPart.help.modes') as { mode: AiMode; what: string; example: string }[]).map((r) => ({ ...r, name: t(`aiPart.modes.${r.mode}`) }))"
          :current="(r) => r.mode === mode"
          min-width="34rem"
        />
        <HelpSection :title="t('aiPart.help.partTitle')">
          <HelpTable
            :columns="[{ key: 'dim', label: t('aiPart.help.dimHeader'), nowrap: true }, { key: 'words', label: t('aiPart.help.wordsHeader') }]"
            :rows="tm('aiPart.help.dims') as { dim: string; words: string }[]"
          />
        </HelpSection>
        <HelpSection :title="t('aiPart.help.tipsTitle')" tone="tips">
          <HelpList :items="tm('aiPart.help.tips') as string[]" />
        </HelpSection>
        <HelpSection :title="t('aiPart.help.examplesTitle')">
          <HelpExamples
            :items="(tm('aiPart.help.examples') as { track: AiTrack; text: string }[]).map((x) => ({ label: t(`aiPart.tracks.${x.track}`), text: x.text }))"
            mono
            pickable
            @pick="(i) => applyExample((tm('aiPart.help.examples') as { track: AiTrack; text: string }[])[i])"
          />
        </HelpSection>
      </HelpBody>
    </HelpModal>

    <!-- The tag tables and the example are the ones from ACE-Step generation: the same model reads the lyrics. -->
    <HelpModal :open="helpOpen === 'lyrics'" :title="t('aiPart.lyricsHelp.title')" wide @close="helpOpen = null">
      <HelpBody :lead="t('aiPart.lyricsHelp.intro')">
        <HelpTable
          :columns="[{ key: 'tag', label: t('aceGen.help.lyrics.tagHeader'), mono: true, nowrap: true }, { key: 'purpose', label: t('aceGen.help.lyrics.purposeHeader') }]"
          :rows="tm('aceGen.help.lyrics.rows') as { tag: string; purpose: string }[]"
        />
        <HelpSection :title="t('aceGen.help.lyrics.marksTitle')" :intro="t('aceGen.help.lyrics.marksIntro')">
          <HelpTable :columns="[{ key: 'tag', mono: true, nowrap: true }, { key: 'purpose' }]" :rows="tm('aceGen.help.lyrics.marks') as { tag: string; purpose: string }[]" />
        </HelpSection>
        <HelpSection :title="t('aiPart.lyricsHelp.tipsTitle')" tone="tips">
          <HelpList :items="tm('aiPart.lyricsHelp.tips') as string[]" />
        </HelpSection>
        <HelpSection :title="t('aceGen.help.lyrics.exampleTitle')">
          <HelpExamples :items="[{ text: t('aceGen.help.lyrics.example') }]" mono />
        </HelpSection>
      </HelpBody>
    </HelpModal>
  </section>
</template>
