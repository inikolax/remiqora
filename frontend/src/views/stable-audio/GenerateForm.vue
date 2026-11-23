<script setup lang="ts">
// Text-to-audio with Stable Audio 3: a kind (music or a sound), a checkpoint, a description, a length. The
// prompts that work best read like Freesound / AudioSparx metadata, so the help repeats that advice.
import { computed, nextTick, onMounted, reactive, ref, watch, watchEffect } from 'vue'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStableAudioStore } from '../../stores/stableAudio'
import type { Sa3GenerateParams, Sa3Kind, Sa3RefMode, Sa3Reference } from '../../stores/stableAudio'
import { useFormDraft } from '../../composables/useFormDraft'
import { offlineModel } from '../../api/stableAudio'
import type { Sa3Model, Sa3ModelId } from '../../api/stableAudio'
import { PromptCancelled, writePromptLive } from '../../api/assistant'
import type { WriteProgress } from '../../api/assistant'
import { useEnginesStore } from '../../stores/engines'
import { useOrchestratorStore } from '../../stores/orchestrator'
import { useFeaturesStore } from '../../stores/features'
import ChipGroup from '../../components/shared/ChipGroup.vue'
import HelpIconButton from '../../components/shared/HelpIconButton.vue'
import HelpModal from '../../components/shared/HelpModal.vue'
import MakeCoverOption from '../../components/shared/MakeCoverOption.vue'
import HelpBody from '../../components/shared/help/HelpBody.vue'
import HelpSection from '../../components/shared/help/HelpSection.vue'
import HelpList from '../../components/shared/help/HelpList.vue'
import HelpExamples from '../../components/shared/help/HelpExamples.vue'
import LibraryPicker from '../../components/editor/LibraryPicker.vue'
import ParamGroups from '../../components/shared/params/ParamGroups.vue'
import SimpleChoices from '../../components/shared/params/SimpleChoices.vue'
import type { SimpleChoice } from '../../components/shared/params/SimpleChoices.vue'
import ParamConsole from '../../components/shared/params/ParamConsole.vue'
import PresetMenu from '../../components/shared/PresetMenu.vue'
import { useEngineStart } from '../../composables/useEngineStart'
import { changedParts, resetRow, rowChanged } from '../../components/shared/params/types'
import type { ParamGroupSpec } from '../../components/shared/params/types'
import PulseIcon from '../../components/shared/icons/PulseIcon.vue'
import CoverIcon from '../../components/shared/icons/CoverIcon.vue'
import SlidersIcon from '../../components/shared/icons/SlidersIcon.vue'
import ClockIcon from '../../components/shared/icons/ClockIcon.vue'
import SparklesIcon from '../../components/shared/icons/SparklesIcon.vue'
import CheckIcon from '../../components/shared/icons/CheckIcon.vue'
import UndoIcon from '../../components/shared/icons/UndoIcon.vue'
import { withLength } from '../../utils/sa3Length'
import { defaultTitle } from '../../utils/songTitle'

const store = useStableAudioStore()
const features = useFeaturesStore()
const engines = useEnginesStore()
const orchestrator = useOrchestratorStore()
const { t, tm } = useI18n()

const kind = ref<Sa3Kind>('music')
const model = ref<Sa3ModelId>('medium')
const prompt = ref('')
const negativePrompt = ref('')
const duration = ref(30)
const count = ref(1)
const seed = ref(-1)
const steps = ref(8)
const cfgScale = ref(1)

// ---- Service tags: the model was trained with AudioSparx / Freesound metadata, so a TrackType prefix helps ----
const AUTO_TAGS_KEY = 'remiqora_sa3_auto_tags'
const autoTags = ref(localStorage.getItem(AUTO_TAGS_KEY) !== 'off')
watch(autoTags, (v) => {
  try {
    localStorage.setItem(AUTO_TAGS_KEY, v ? 'on' : 'off')
  } catch {
    // not remembered
  }
})
function withTags(text: string): string {
  const clean = text.trim()
  if (!autoTags.value || /TrackType\s*:/i.test(clean)) return clean
  return (kind.value === 'sfx' ? 'TrackType: SFX. ' : 'TrackType: Music, VocalType: Instrumental. ') + clean
}

// ---- The assistant: from words in any language to Stable Audio's own prompt (or a plain translation) ----
// Stable Audio reads only English and is picky about wording; the assistant's sa3 task rewrites the description in its
// style, for the kind picked above (music / sound), with a length it suits. "Only translate" keeps the user's words.
/** Letters beyond plain a-z: another script or accents. */
// any letter beyond plain a-z (Cyrillic, CJK, accents); \p{L} needs the u flag, \w in JS is ASCII only
const hasNonLatin = computed(() => /(?![a-zA-Z])\p{L}/u.test(prompt.value))
const assistantReady = computed(() => !!engines.assistant?.ready && !!engines.assistant?.models.some((m) => m.installed))
const translating = ref(false)
const translateStopping = ref(false)
const translateProgress = ref<WriteProgress | null>(null)
const translateError = ref('')
/** The text before the translation, until the user edits the field. */
const translatedFrom = ref<string | null>(null)
/** The length before a written prompt changed it, put back with the text. */
let durationBefore: number | null = null
/** What the last run did: a written prompt, or a translation. */
const assistMode = ref<'compose' | 'translate'>('compose')
let translatedText = ''
let cancelTranslate: (() => void) | null = null
onMounted(() => void engines.load())
watch(prompt, (v) => {
  if (v !== translatedText) translatedFrom.value = null
})
const translateStatus = computed(() => {
  if (translateStopping.value) return t('sa3Gen.translateStopping')
  if (translating.value) {
    const p = translateProgress.value
    if (!p) return t(assistMode.value === 'compose' ? 'sa3Gen.composeRunning' : 'sa3Gen.translateRunning')
    const s = t(`promptProgress.stage.${p.stage}`)
    return p.stage === 'writing' || p.stage === 'retrying' ? `${s}, ${p.percent}%` : s
  }
  if (translateError.value) return translateError.value
  return translatedFrom.value !== null ? t(assistMode.value === 'compose' ? 'sa3Gen.composeDone' : 'sa3Gen.translateDone') : ''
})
function stopTranslate(): void {
  translateStopping.value = true
  cancelTranslate?.()
}
async function assistPrompt(mode: 'compose' | 'translate'): Promise<void> {
  const text = prompt.value.trim()
  if (!text || translating.value || !assistantReady.value) return
  assistMode.value = mode
  translating.value = true
  translateStopping.value = false
  translateError.value = ''
  translatedFrom.value = null
  const onGpu = engines.assistant?.settings.device === 'cuda'
  const run = mode === 'compose'
    ? writePromptLive('sa3', text, { kind: kind.value }, (p) => { translateProgress.value = p }, { unloadsEngine: onGpu && !!orchestrator.activeModel })
    : writePromptLive('translate', text, {}, (p) => { translateProgress.value = p }, { unloadsEngine: onGpu && !!orchestrator.activeModel })
  cancelTranslate = run.cancel
  try {
    const fields = (await run.result).fields
    let out = String((mode === 'compose' ? fields.prompt : fields.text) ?? '').trim()
    if (out) {
      const before = prompt.value
      durationBefore = null
      if (mode === 'compose' && typeof fields.duration === 'number') {
        durationBefore = duration.value
        duration.value = clampDuration(Math.round(fields.duration))
      }
      // the model's "Length: N seconds" said the same as the length the form will make (cut to the model's limit)
      out = withLength(out, duration.value)
      translatedText = out
      prompt.value = out
      translatedFrom.value = before
    }
    void engines.load()
    if (onGpu) void orchestrator.refresh()
  } catch (e) {
    if (!(e instanceof PromptCancelled)) translateError.value = e instanceof Error ? e.message : String(e)
  } finally {
    translating.value = false
    translateStopping.value = false
    translateProgress.value = null
    cancelTranslate = null
  }
}
// the length is the form's: a "Length: N seconds" in the prompt follows it
watch(duration, (d) => {
  const next = withLength(prompt.value, d)
  if (next !== prompt.value) {
    if (prompt.value === translatedText) translatedText = next
    prompt.value = next
  }
})
function putBackPrompt(): void {
  if (translatedFrom.value === null) return
  prompt.value = translatedFrom.value
  translatedFrom.value = null
  if (durationBefore !== null) duration.value = durationBefore
  durationBefore = null
}

// ---- One description per variant: an A/B in one run ----
const perVariant = ref(false)
const variantPrompts = ref<string[]>(['', '', '', ''])

// ---- Two switches of the decoder: cut the silence a one-shot starts with; decode in chunks (less video memory) ----
const trimSilence = ref(false)
const chunkedDecode = ref<'auto' | 'on' | 'off'>('auto')
// ---- The sampler and the guidance, by hand: null (or the default) leaves each to the package ----
const sampler = ref<'auto' | 'pingpong' | 'euler' | 'rk4' | 'dpmpp'>('auto')
const saAdv = reactive({
  apg: null as number | null,
  cfgMin: null as number | null,
  cfgMax: null as number | null,
  scalePhi: null as number | null,
  normThreshold: null as number | null,
  padding: null as number | null,
})

// ---- Base checkpoints: ~50 steps and CFG; the user's own numbers win once touched ----
const stepsTouched = ref(false)
const cfgTouched = ref(false)
/** The sliders' ranges: a post-trained checkpoint goes bad past 50 steps and CFG 5. */
const stepsLimit = (id: string): number => (id.endsWith('-base') ? 150 : 50)
const cfgLimit = (id: string): number => (id.endsWith('-base') ? 15 : 5)
watch(model, (id, prev) => {
  const nowBase = id.endsWith('-base')
  const wasBase = (prev ?? '').endsWith('-base')
  if (nowBase !== wasBase) {
    if (!stepsTouched.value) steps.value = nowBase ? 50 : 8
    if (!cfgTouched.value) cfgScale.value = nowBase ? 7 : 1
  }
  // a base checkpoint's 100 steps / CFG 9 do not carry over out of a post-trained one's range
  steps.value = Math.min(steps.value, stepsLimit(id))
  cfgScale.value = Math.min(cfgScale.value, cfgLimit(id))
})
const submitting = ref(false)
const formError = ref('')
/** Shown next to Create after a take went to the queue. */
const queuedNote = ref('')
const helpOpen = ref<false | 'prompt' | 'ref'>(false)

// ---- Reference track: a file or a library track, remade (cover), partly redone (repaint) or carried on ----
const useRef = ref(false)
const refFile = ref<Blob | null>(null)
const refName = ref('')
const refDurationSec = ref(0)
const refTrackId = ref<number | null>(null)
const refLoading = ref(false)
const refMode = ref<Sa3RefMode>('cover')
// Measured on a drums stem with an organ prompt: at 0.5 the result is still the drums (the source's
// timbre survives), from about 0.3 down the words win. Upstream's own restyle example uses 0.1.
const closeness = ref(0.3)
/** What the slider's position does, in words: remake, change the instrument, or vary. */
const closenessBand = computed(() => (closeness.value < 0.35 ? 'remake' : closeness.value <= 0.6 ? 'timbre' : 'variation'))
/** A cover is as long as the source unless the user wants a length of their own. */
const lengthMode = ref<'source' | 'custom'>('source')
const customSec = ref(30)
/** The ranges a repaint redoes; several in one pass. */
const ranges = ref<{ start: number; end: number }[]>([{ start: 0, end: 10 }])
function addRange() {
  const last = ranges.value[ranges.value.length - 1]
  const start = Math.min(refDurationSec.value - 1, (last?.end ?? 0) + 4)
  ranges.value.push({ start: Math.max(0, start), end: Math.min(refDurationSec.value, Math.max(0, start) + 8) })
}
function removeRange(i: number) {
  if (ranges.value.length > 1) ranges.value.splice(i, 1)
}
const rangesValid = computed(() => {
  const dur = refDurationSec.value + 0.05
  const sorted = [...ranges.value].sort((a, b) => a.start - b.start)
  return sorted.every((r, i) => r.start >= 0 && r.end <= dur && r.end - r.start >= 1 && (i === 0 || r.start >= sorted[i - 1].end))
})
const extendSec = ref(15)
const pickerOpen = ref(false)
const refModeOptions = computed(() => (['cover', 'repaint', 'continue'] as Sa3RefMode[]).map((m) => ({ value: m, label: t(`sa3Gen.ref.modes.${m}`) })))

/** Reads the length through an <audio> element: no decoding, works for wav/mp3/flac alike. */
function audioDuration(blob: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const el = new Audio()
    el.preload = 'metadata'
    el.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      resolve(el.duration)
    }
    el.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('decode'))
    }
    el.src = url
  })
}
async function setReference(blob: Blob, name: string, trackId: number | null) {
  refLoading.value = true
  formError.value = ''
  try {
    const dur = await audioDuration(blob)
    if (!Number.isFinite(dur) || dur <= 0) throw new Error('decode')
    refFile.value = blob
    refName.value = name
    refDurationSec.value = dur
    refTrackId.value = trackId
    ranges.value = [{ start: 0, end: Math.min(10, Math.floor(dur)) }]
  } catch {
    formError.value = t('sa3Gen.ref.decodeError')
  } finally {
    refLoading.value = false
  }
}
function onRefFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) void setReference(file, file.name, null)
}
async function onPickFromLibrary(payload: { sourceUrl: string; sourceLabel: string }) {
  pickerOpen.value = false
  refLoading.value = true
  try {
    const resp = await fetch(payload.sourceUrl)
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const m = /\/api\/tracks\/(\d+)\/audio/.exec(payload.sourceUrl)
    await setReference(await resp.blob(), payload.sourceLabel, m ? Number(m[1]) : null)
  } catch (err) {
    formError.value = err instanceof Error ? err.message : String(err)
    refLoading.value = false
  }
}
/** Seconds the result will have with a reference: the source's, or the source plus the extension. */
const coverSec = computed(() => (lengthMode.value === 'custom' ? customSec.value : refDurationSec.value))
const resultSeconds = computed(() => (refMode.value === 'continue' ? refDurationSec.value + extendSec.value : refMode.value === 'cover' ? coverSec.value : refDurationSec.value))
const reference = computed<Sa3Reference | null>(() => (useRef.value && refFile.value
  ? {
      file: refFile.value, name: refName.value, durationSec: refDurationSec.value, trackId: refTrackId.value, mode: refMode.value,
      closeness: closeness.value, customSec: refMode.value === 'cover' && lengthMode.value === 'custom' ? customSec.value : null,
      ranges: ranges.value.map((r) => ({ ...r })), extendSec: extendSec.value,
    }
  : null))

const kindOptions = computed(() => [
  { value: 'music', label: t('sa3Gen.kinds.music') },
  { value: 'sfx', label: t('sa3Gen.kinds.sfx') },
])
const countOptions = [1, 2, 4].map((n) => ({ value: n, label: String(n) }))

/** What the engine reports; while it is stopped it reports nothing, so the installed checkpoints stand in. */
const knownModels = computed<Sa3Model[]>(() => (store.models.length ? store.models : (features.features.stable_audio_models as Sa3ModelId[]).map(offlineModel)))
/** Checkpoints that can run here and are meant for this kind; medium does both. */
const modelOptions = computed(() => knownModels.value.filter((m) => m.available && m.kinds.includes(kind.value)))
const selected = computed(() => knownModels.value.find((m) => m.id === model.value))
const maxSeconds = computed(() => selected.value?.max_seconds ?? 120)
const minSeconds = computed(() => (kind.value === 'sfx' ? 0.5 : 5))
const stepSeconds = computed(() => (kind.value === 'sfx' ? 0.5 : 1))
/** The server answers 400 to a length outside the model's range. */
const clampDuration = (d: number): number => Math.min(maxSeconds.value, Math.max(minSeconds.value, d))

// A model that is not there (or not for this kind): fall to the first that fits, small-sfx for sounds when installed.
// Compared by ids: the store replaces its list every few seconds, and that alone must not move anything.
const optionIds = computed(() => modelOptions.value.map((m) => m.id).join())
watch([optionIds, kind, model], () => {
  const opts = modelOptions.value
  if (!opts.length || opts.some((m) => m.id === model.value)) return
  const fallback = (kind.value === 'sfx' && opts.find((m) => m.id === 'small-sfx')) || opts[0]
  // numbers meant for the missing model do not hold for this one: its defaults again (the model watch clamps the rest)
  stepsTouched.value = false
  cfgTouched.value = false
  model.value = fallback.id
}, { immediate: true })
// The length follows a real change of the kind only: a sound is short, music longer.
watch(kind, (k, prev) => {
  if (k === prev) return
  if (k === 'sfx' && duration.value > 30) duration.value = 5
  if (k === 'music' && duration.value < 5) duration.value = 30
})
watch(maxSeconds, (max) => {
  if (duration.value > max) duration.value = max
})

// ---- The draft: what was typed survives a reload or a visit to another page (not the reference file) ----
// Restored here, before the mount, so a pending insert (a reuse, "From an idea") is applied after it and wins.
useFormDraft('stable_audio', {
  kind, model, prompt, variantPrompts, perVariant, negativePrompt, duration, steps, stepsTouched, cfgScale, cfgTouched, seed, count,
  sampler, saAdv, trimSilence, chunkedDecode,
} as Record<string, Ref<unknown> | Record<string, unknown>>)
{
  // an old or foreign draft must not put a value into the form that its controls cannot show
  if (!['music', 'sfx'].includes(kind.value)) kind.value = 'music'
  // a model that is not known here: the default, and the fallback watch above picks one that is available
  if (!knownModels.value.some((m) => m.id === model.value)) model.value = 'medium'
  if (!countOptions.some((o) => o.value === count.value)) count.value = 1
  if (!['auto', 'pingpong', 'euler', 'rk4', 'dpmpp'].includes(sampler.value)) sampler.value = 'auto'
  if (!['auto', 'on', 'off'].includes(chunkedDecode.value)) chunkedDecode.value = 'auto'
  while (variantPrompts.value.length < 4) variantPrompts.value.push('')
  duration.value = clampDuration(duration.value)
  steps.value = Math.min(Math.max(1, steps.value), stepsLimit(model.value))
  cfgScale.value = Math.min(Math.max(0, cfgScale.value), cfgLimit(model.value))
}

// Parameters put here from elsewhere (a card's reuse, "From an idea"). Applied on a change and on mount too: when
// they are sent while the engine is stopped, this form only appears once it runs, and they wait in the store.
// Fields lit up for a moment after an idea insert or its undo (the class is `idea-flash`).
const flash = reactive<Record<string, boolean>>({})
const flashTimers: Record<string, ReturnType<typeof setTimeout>> = {}
async function flashFields(keys: string[]) {
  for (const k of keys) flash[k] = false
  await nextTick() // so the class restarts the animation
  for (const k of keys) {
    flash[k] = true
    clearTimeout(flashTimers[k])
    flashTimers[k] = setTimeout(() => { flash[k] = false }, 1600)
  }
}

// What an idea insert would overwrite.
watchEffect(() => { store.formHasText = !!prompt.value.trim() })

/** The current values of the fields `p` will change, in the vocabulary applyInsert reads. */
function snapshotFor(p: NonNullable<typeof store.pendingParamsInsert>): NonNullable<typeof store.pendingParamsInsert> {
  const snap: NonNullable<typeof store.pendingParamsInsert> = {}
  if (p.kind) snap.kind = kind.value
  if (p.model) snap.model = model.value
  if (p.prompt != null) snap.prompt = prompt.value
  if (p.negativePrompt != null) snap.negativePrompt = negativePrompt.value
  if (p.duration != null) snap.duration = duration.value
  if (p.steps != null) snap.steps = steps.value
  if (p.cfgScale != null) snap.cfgScale = cfgScale.value
  if (p.seed != null) snap.seed = seed.value
  if (p.autoTags != null) snap.autoTags = autoTags.value
  if (p.trimSilence != null) snap.trimSilence = trimSilence.value
  if (p.chunkedDecode !== undefined) snap.chunkedDecode = chunkedDecode.value === 'auto' ? null : chunkedDecode.value === 'on'
  // the whole sampler/guidance set goes together, as applyInsert replaces it whole
  if (p.advanced) snap.advanced = currentAdvanced()
  if ((p as PresetExtras).perVariant != null) (snap as PresetExtras).perVariant = perVariant.value
  // the length may depend on the kind, and so may the model: an undo of a kind flip restores them too
  if (p.kind) { snap.duration = duration.value; snap.model = model.value }
  return snap
}
/** The sampler and guidance fields as an insert carries them (a field at its default is left out: applyInsert resets it). */
function currentAdvanced(): NonNullable<Sa3GenerateParams['advanced']> {
  return {
    sampler_type: sampler.value === 'auto' ? undefined : sampler.value,
    apg_scale: saAdv.apg ?? undefined, cfg_interval_min: saAdv.cfgMin ?? undefined, cfg_interval_max: saAdv.cfgMax ?? undefined,
    scale_phi: saAdv.scalePhi ?? undefined, cfg_norm_threshold: saAdv.normThreshold ?? undefined, duration_padding: saAdv.padding ?? undefined,
  } as NonNullable<Sa3GenerateParams['advanced']>
}
/** What a preset carries beyond the store's params: the switch of one description per variant. */
type PresetExtras = { perVariant?: boolean }

// Parameters put here from elsewhere (a card's reuse, "From an idea"). Applied on a change and on mount too: when
// they are sent while the engine is stopped, this form only appears once it runs, and they wait in the store.
function applyInsert(p: typeof store.pendingParamsInsert) {
  if (!p) return
  const undoable = store.pendingUndoable
  const lit = undoable || store.pendingFlash
  if (undoable) store.insertUndo = snapshotFor(p)
  const touched: string[] = []
  const kindFlips = !!p.kind && p.kind !== kind.value
  if (p.kind) { kind.value = p.kind; touched.push('kind') }
  if (p.model) { model.value = p.model; touched.push('model') }
  if (p.prompt != null) { prompt.value = p.prompt; touched.push('prompt') }
  if (p.negativePrompt != null) negativePrompt.value = p.negativePrompt
  if (p.duration != null) { duration.value = clampDuration(p.duration); touched.push('duration') }
  // the insert's own numbers: the model watch must not swap them for the checkpoint's defaults
  if (p.steps != null) { steps.value = p.steps; stepsTouched.value = true }
  if (p.cfgScale != null) { cfgScale.value = p.cfgScale; cfgTouched.value = true }
  if (p.seed != null) seed.value = p.seed
  if (p.autoTags != null) autoTags.value = p.autoTags
  if ((p as PresetExtras).perVariant != null) perVariant.value = !!(p as PresetExtras).perVariant
  if (p.trimSilence != null) trimSilence.value = p.trimSilence
  if (p.chunkedDecode !== undefined) chunkedDecode.value = p.chunkedDecode == null ? 'auto' : p.chunkedDecode ? 'on' : 'off'
  // a reuse carries the whole sampler/guidance set: a field the take did not set goes back to the package's default
  if (p.advanced) {
    const a = p.advanced
    sampler.value = a.sampler_type ?? 'auto'
    saAdv.apg = a.apg_scale ?? null
    saAdv.cfgMin = a.cfg_interval_min ?? null
    saAdv.cfgMax = a.cfg_interval_max ?? null
    saAdv.scalePhi = a.scale_phi ?? null
    saAdv.normThreshold = a.cfg_norm_threshold || null
    saAdv.padding = a.duration_padding ?? null
  }
  store.clearPendingParamsInsert()
  // The watch on kind resets model and length after a flip: say the wanted values again once it has run.
  if (kindFlips) {
    const { model: m, duration: d } = p
    nextTick(() => {
      if (m) model.value = m
      if (d != null) duration.value = clampDuration(d)
    })
  }
  if (lit) flashFields(touched)
}
watch(() => store.pendingParamsInsert, applyInsert)
onMounted(() => applyInsert(store.pendingParamsInsert))

const base = computed(() => (model.value.endsWith('-base')))
function formatClockShort(s: number): string {
  if (s < 60) return `${s % 1 ? s.toFixed(1) : s} ${t('common.secondsUnit')}`
  return `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`
}
const durationLabel = computed(() => formatClockShort(duration.value))

function randomSeed() {
  seed.value = Math.floor(Math.random() * 2147483647)
}

// Create works while the engine is stopped: the backend's queue starts it for the takes.
const { running: engineRunning, createLabel } = useEngineStart('stable_audio')

// ---- Presets: the form as it is, under a name, kept in this browser ----
// The fields after autoTags came later: a preset saved before them leaves those controls as they are.
interface Sa3Preset {
  name: string; kind: Sa3Kind; model: Sa3ModelId; prompt: string; negativePrompt: string; duration: number; steps: number; cfgScale: number; autoTags: boolean
  sampler?: typeof sampler.value; adv?: typeof saAdv; trimSilence?: boolean; chunkedDecode?: typeof chunkedDecode.value; perVariant?: boolean
}
const PRESETS_KEY = 'sa3_presets'
const presets = ref<Sa3Preset[]>([])
const selectedPresetName = ref('')
const newPresetName = ref('')
onMounted(() => {
  try {
    const raw = localStorage.getItem(PRESETS_KEY)
    if (raw) presets.value = JSON.parse(raw)
  } catch {
    // unreadable: start without presets
  }
})
function storePresets() {
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets.value))
  } catch {
    // not remembered
  }
}
function saveCurrentPreset() {
  const name = newPresetName.value.trim()
  if (!name) return
  const preset: Sa3Preset = {
    name, kind: kind.value, model: model.value, prompt: prompt.value, negativePrompt: negativePrompt.value, duration: duration.value, steps: steps.value, cfgScale: cfgScale.value, autoTags: autoTags.value,
    sampler: sampler.value, adv: { ...saAdv }, trimSilence: trimSilence.value, chunkedDecode: chunkedDecode.value, perVariant: perVariant.value,
  }
  const i = presets.value.findIndex((p) => p.name === name)
  if (i !== -1) presets.value[i] = preset
  else presets.value.push(preset)
  storePresets()
  selectedPresetName.value = name
  newPresetName.value = ''
}
function applyPreset(name: string) {
  const p = presets.value.find((x) => x.name === name)
  if (!p) return
  // Through the same insert as the idea line: the changed fields flash and "Put back" brings the old values back.
  // A preset saved without a description leaves the text as it is. The insert sets the preset's own steps and CFG
  // (not the checkpoint's defaults) and handles the length/model after a kind flip.
  const params: Partial<Sa3GenerateParams> & PresetExtras = {
    kind: p.kind, model: p.model, negativePrompt: p.negativePrompt || '',
    steps: p.steps, cfgScale: p.cfgScale, autoTags: p.autoTags !== false,
  }
  if (p.prompt) params.prompt = p.prompt
  if (p.duration) params.duration = p.duration
  if (p.sampler || p.adv) {
    const a = p.adv ?? saAdv
    params.advanced = {
      sampler_type: (p.sampler ?? sampler.value) === 'auto' ? undefined : (p.sampler ?? sampler.value),
      apg_scale: a.apg ?? undefined, cfg_interval_min: a.cfgMin ?? undefined, cfg_interval_max: a.cfgMax ?? undefined,
      scale_phi: a.scalePhi ?? undefined, cfg_norm_threshold: a.normThreshold ?? undefined, duration_padding: a.padding ?? undefined,
    } as Sa3GenerateParams['advanced']
  }
  if (p.trimSilence != null) params.trimSilence = p.trimSilence
  if (p.chunkedDecode) params.chunkedDecode = p.chunkedDecode === 'auto' ? null : p.chunkedDecode === 'on'
  if (p.perVariant != null) params.perVariant = p.perVariant
  store.requestInsertParams(params, { undoable: true })
}
function deletePreset(name: string) {
  presets.value = presets.value.filter((p) => p.name !== name)
  storePresets()
  if (selectedPresetName.value === name) selectedPresetName.value = ''
}

// A failed check knows its tab and its field: the form switches to it, focuses it and points aria-describedby at the message.
const errField = ref('')
const FORM_ERROR_ID = 'sa3-form-error'
const invalid = (id: string): boolean => !!formError.value && errField.value === id
const describedBy = (id: string): string | undefined => (invalid(id) ? FORM_ERROR_ID : undefined)
async function fail(message: string, tab: (typeof FORM_TABS)[number], selector: string, id = '') {
  formError.value = message
  errField.value = id
  formTab.value = tab
  if (tab === 'tuning') tuningMode.value = 'manual'
  await nextTick() // the tab's panel is hidden until now
  document.querySelector<HTMLElement>(selector)?.focus()
}
// the message goes away once the user edits what it was about
watch([prompt, variantPrompts, count, perVariant, refFile, useRef, refMode, ranges, lengthMode, customSec, extendSec, cfgScale, saAdv], () => {
  if (errField.value) {
    formError.value = ''
    errField.value = ''
  }
}, { deep: true })

async function submit() {
  formError.value = ''
  errField.value = ''
  queuedNote.value = ''
  const text = prompt.value.trim()
  const perVariantTexts = perVariant.value && count.value > 1 ? variantPrompts.value.slice(0, count.value).map((s) => s.trim()) : null
  if (perVariantTexts ? perVariantTexts.some((s) => !s) : !text) {
    const id = perVariantTexts ? `sa3-variant-${perVariantTexts.findIndex((s) => !s) + 1}` : 'sa3-prompt'
    await fail(t(perVariantTexts ? 'sa3Gen.needPrompts' : 'sa3Gen.needPrompt'), 'sound', `#${id}`, id)
    return
  }
  if (useRef.value) {
    if (!refFile.value) {
      await fail(t('sa3Gen.ref.needRef'), 'ref', '#sa3-ref-file', 'sa3-ref-file')
      return
    }
    if (refMode.value === 'repaint' && !rangesValid.value) {
      await fail(t('sa3Gen.ref.badRanges'), 'ref', '#sa3-range-0-start', 'sa3-range-0-start')
      return
    }
    if (resultSeconds.value > maxSeconds.value) {
      const id = refMode.value === 'continue' ? 'sa3-extend-sec' : lengthMode.value === 'custom' ? 'sa3-custom-sec' : 'sa3-ref-file'
      await fail(t('sa3Gen.ref.tooLong', { v: Math.round(resultSeconds.value), max: maxSeconds.value }), 'ref', `#${id}`, id)
      return
    }
  }
  // the server refuses a window that stops before it starts
  if (guided.value && (saAdv.cfgMin ?? 0) > (saAdv.cfgMax ?? 1)) {
    await fail(t('sa3Gen.badGuidanceWindow'), 'tuning', '[data-group="guidance"] input, [data-group="guidance"] [role="slider"]', 'sa3-guidance')
    return
  }
  if (!useRef.value) duration.value = clampDuration(duration.value)
  submitting.value = true
  try {
    // the job goes to the backend's queue, which starts Stable Audio when it is its turn; the checkpoints are
    // known only while the engine runs, so a stopped engine is not asked and the queue reports what it cannot run
    if (engineRunning.value && !store.models.length) await store.refreshModels()
    await nextTick()
    if (store.models.length && !selected.value?.available) {
      formError.value = t('sa3Gen.noModel')
      return
    }
    await store.generate({
      kind: kind.value, model: model.value,
      // the title is the description as typed: with the service tags every track was called "TrackType: Music";
      // one description per variant names each variant after its own text
      title: perVariantTexts ? undefined : defaultTitle({ idea: text }),
      titles: perVariantTexts ? perVariantTexts.map((v) => defaultTitle({ idea: v })) : undefined,
      prompt: withTags(perVariantTexts ? perVariantTexts[0] : text),
      prompts: perVariantTexts ? perVariantTexts.map(withTags) : null,
      caption: perVariantTexts ? perVariantTexts.join(' | ') : text,
      autoTags: autoTags.value,
      // the engine reads the negative prompt only while guidance is on (CFG not 1); its row is off otherwise
      negativePrompt: guided.value ? negativePrompt.value.trim() : '',
      duration: duration.value, steps: steps.value, cfgScale: cfgScale.value, seed: seed.value, count: count.value,
      reference: reference.value,
      advanced: advancedFields(),
      trimSilence: trimSilence.value, chunkedDecode: chunkedDecode.value === 'auto' ? null : chunkedDecode.value === 'on',
    })
    // a polite line next to the button: on a phone the feed with the takes is far below the form
    queuedNote.value = t('sa3Gen.queuedNote', { n: count.value })
  } catch (err) {
    formError.value = err instanceof Error ? err.message : String(err)
  } finally {
    submitting.value = false
  }
}

function toSession() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  document.getElementById('create-session')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}
function applyExample(text: string) {
  prompt.value = text
  helpOpen.value = false
}
// ---- The form's tabs: the description first, a reference track, the tuning; a dot marks a tab that is in use ----
const FORM_TABS = ['sound', 'ref', 'tuning'] as const
const TAB_ICONS = { sound: PulseIcon, ref: CoverIcon, tuning: SlidersIcon } as const
const formTab = ref<(typeof FORM_TABS)[number]>('sound')
const tabChanged = computed<Record<(typeof FORM_TABS)[number], boolean>>(() => ({ sound: false, ref: useRef.value, tuning: manualChanged.value > 0 }))

// ---- Length as a choice; any other value is set with the slider in the tuning ----
const LENGTHS = computed(() => (kind.value === 'sfx' ? [1, 5, 15, 30] : [15, 30, 60, 120, 180]).filter((s) => s >= minSeconds.value && s <= maxSeconds.value))
const lengthLabel = (s: number): string => (s < 60 ? t('sa3Gen.lengthSeconds', { n: s }) : t('yueGen.length.minutes', { n: s / 60 }))
const modelLabel = (m: { base: boolean; label: string }): string => (m.base ? t('sa3Gen.baseLabel', { label: m.label.replace(/ Base$/, '') }) : m.label)

// ---- Seed: -1 lets the engine pick one for each take ----
const seedRandom = computed(() => seed.value === -1)
function toggleSeedRandom() {
  if (seedRandom.value) randomSeed()
  else seed.value = -1
}
/** An emptied (or unreadable) field means random again, not seed 0. */
function onSeedInput(raw: string) {
  const v = raw.trim() === '' ? NaN : Number(raw)
  seed.value = Number.isFinite(v) && v >= 0 ? Math.floor(v) : -1
}

// ---- The tuning: every parameter in groups (the same rows as the other engines' forms) ----
const stepsDefault = computed(() => (base.value ? 50 : 8))
const cfgDefault = computed(() => (base.value ? 7 : 1))
/** Guidance acts only when "closeness to the description" is not 1: the guidance rows wait for it. */
const guided = computed(() => Math.abs(cfgScale.value - 1) > 1e-9)
function advancedFields() {
  const f: Record<string, unknown> = {}
  if (sampler.value !== 'auto') f.sampler_type = sampler.value
  if (saAdv.padding != null) f.duration_padding = saAdv.padding
  if (guided.value) {
    if (saAdv.apg != null) f.apg_scale = saAdv.apg
    if (saAdv.cfgMin != null) f.cfg_interval_min = saAdv.cfgMin
    if (saAdv.cfgMax != null) f.cfg_interval_max = saAdv.cfgMax
    if (saAdv.scalePhi != null) f.scale_phi = saAdv.scalePhi
    if (saAdv.normThreshold != null && saAdv.normThreshold > 0) f.cfg_norm_threshold = saAdv.normThreshold
  }
  return f
}

const manualGroups = computed<ParamGroupSpec[]>(() => [
  {
    id: 'sound', title: t('yueGen.manual.groups.sound.title'), sub: t('yueGen.manual.groups.sound.sub'), column: 0,
    quick: modelOptions.value.length > 1
      ? { options: modelOptions.value.map((m) => ({ id: m.id, label: modelLabel(m) })), active: model.value, pick: (id) => { model.value = id as Sa3ModelId } }
      : undefined,
    rows: [
      {
        kind: 'select', id: 'model', label: t('sa3Gen.model'), tech: 'model', value: model.value, def: modelOptions.value[0]?.id ?? model.value,
        options: modelOptions.value.map((m) => ({ value: m.id, label: `${modelLabel(m)} · ${m.params}` })), set: (v) => { model.value = v as Sa3ModelId },
      },
      {
        kind: 'slider', id: 'steps', label: t('yueGen.manual.params.steps'), tech: 'steps', value: steps.value, def: stepsDefault.value, min: 1, max: stepsLimit(model.value), step: 1,
        set: (v) => { steps.value = v ?? stepsDefault.value; stepsTouched.value = true },
      },
      {
        kind: 'slider', id: 'cfg', label: t('sa3Gen.manual.cfg'), tech: 'cfg_scale', value: cfgScale.value, def: cfgDefault.value, min: 0, max: cfgLimit(model.value), step: 0.1,
        set: (v) => { cfgScale.value = v ?? cfgDefault.value; cfgTouched.value = true },
      },
      {
        kind: 'text', id: 'negative', label: t('sa3Gen.manual.negative'), tech: 'negative_prompt', value: negativePrompt.value, def: '', placeholder: t('sa3Gen.negativePlaceholder'),
        // upstream reads it on any checkpoint while CFG is not 1 (dit.py: the negative takes the null embed's place)
        disabled: !guided.value, why: t('sa3Gen.manual.needCfg'), set: (v) => { negativePrompt.value = v },
      },
    ],
  },
  {
    id: 'guidance', title: t('sa3Gen.manual.guidanceTitle'), sub: t('sa3Gen.manual.guidanceSub'), column: 1,
    rows: (() => {
      const off = !guided.value
      const why = t('sa3Gen.manual.needCfg')
      const rows: ParamGroupSpec['rows'] = [
        { kind: 'slider', id: 'apg', label: t('sa3Gen.manual.apg'), tech: 'apg_scale', value: saAdv.apg, def: 1, min: 0, max: 1, step: 0.05, disabled: off, why, set: (v) => { saAdv.apg = v } },
        // The window is a noise level that falls from 1 to 0 during the run (dit.py compares it with sigma = t):
        // guidance starts at the max and stops at the min. Each slider pushes the other so the window never inverts.
        {
          kind: 'slider', id: 'cfgMax', label: t('sa3Gen.manual.cfgStartsAt'), tech: 'cfg_interval_max', value: saAdv.cfgMax, def: 1, min: 0, max: 1, step: 0.01, disabled: off, why,
          set: (v) => { saAdv.cfgMax = v; if (v != null && saAdv.cfgMin != null && saAdv.cfgMin > v) saAdv.cfgMin = v },
        },
        {
          kind: 'slider', id: 'cfgMin', label: t('sa3Gen.manual.cfgStopsAt'), tech: 'cfg_interval_min', value: saAdv.cfgMin, def: 0, min: 0, max: 1, step: 0.01, disabled: off, why,
          set: (v) => { saAdv.cfgMin = v; if (v != null && v > (saAdv.cfgMax ?? 1)) saAdv.cfgMax = v },
        },
        { kind: 'slider', id: 'scalePhi', label: t('sa3Gen.manual.scalePhi'), tech: 'scale_phi', value: saAdv.scalePhi, def: 0, min: 0, max: 1, step: 0.05, disabled: off, why, set: (v) => { saAdv.scalePhi = v } },
        // 0 is "off" and is not sent: kept as unset so it does not count as a change
        { kind: 'slider', id: 'normThreshold', label: t('sa3Gen.manual.normThreshold'), tech: 'cfg_norm_threshold', value: saAdv.normThreshold, def: 0, min: 0, max: 20, step: 0.5, auto: t('aceGen.manual.off'), disabled: off, why, set: (v) => { saAdv.normThreshold = v && v > 0 ? v : null } },
      ]
      return rows
    })(),
  },
  {
    id: 'sampler', title: t('sa3Gen.manual.samplerTitle'), sub: t('sa3Gen.manual.samplerSub'), column: 1,
    rows: [
      {
        kind: 'select', id: 'samplerType', label: t('sa3Gen.manual.sampler'), tech: 'sampler_type', value: sampler.value, def: 'auto',
        // the package's default is pingpong for the post-trained (rf_denoiser) checkpoints and euler for the base ones
        // (sampling.py); pingpong is a choice of its own only where it is not already the default
        options: [
          { value: 'auto', label: base.value ? t('sa3Gen.manual.samplerAutoBase') : t('sa3Gen.manual.samplerAuto') },
          ...(base.value || sampler.value === 'pingpong' ? (['pingpong'] as const) : []).map((x) => ({ value: x, label: x })),
          ...(['euler', 'rk4', 'dpmpp'] as const).map((x) => ({ value: x, label: x })),
        ],
        // measured on post-trained medium: euler and dpmpp come out louder with clipped peaks, rk4 about 7 dB quieter
        warn: base.value ? undefined : sampler.value === 'euler' || sampler.value === 'dpmpp' ? t('sa3Gen.manual.samplerLoud') : sampler.value === 'rk4' ? t('sa3Gen.manual.samplerQuiet') : undefined,
        set: (v) => { sampler.value = v as typeof sampler.value },
      },
      {
        kind: 'slider', id: 'padding', label: t('sa3Gen.manual.padding'), tech: 'duration_padding', value: saAdv.padding, def: 6, min: 0, max: 20, step: 0.5,
        note: (v) => t('yueGen.manual.seconds', { n: v }), set: (v) => { saAdv.padding = v },
      },
    ],
  },
  {
    id: 'result', title: t('sa3Gen.manual.resultTitle'), sub: t('sa3Gen.manual.resultSub'), column: 0,
    rows: [
      {
        kind: 'slider', id: 'duration', label: t('sa3Gen.manual.duration'), tech: 'duration', value: duration.value, def: kind.value === 'sfx' ? 5 : 30,
        min: minSeconds.value, max: maxSeconds.value, step: stepSeconds.value, note: formatClockShort,
        disabled: useRef.value, why: t('sa3Gen.manual.fromRef'), set: (v) => { duration.value = v ?? (kind.value === 'sfx' ? 5 : 30) },
      },
      { kind: 'toggle', id: 'autoTags', label: t('sa3Gen.manual.autoTags'), tech: 'TrackType, VocalType', value: autoTags.value, def: true, set: (v) => { autoTags.value = v } },
      {
        kind: 'toggle', id: 'perVariant', label: t('sa3Gen.manual.perVariant'), tech: 'prompts[]', value: perVariant.value, def: false,
        disabled: count.value < 2, why: t('sa3Gen.manual.needTwo'), set: (v) => { perVariant.value = v },
      },
      {
        kind: 'toggle', id: 'trim', label: t('sa3Gen.manual.trim'), tech: 'trim_silence', value: trimSilence.value, def: false,
        disabled: useRef.value, why: t('sa3Gen.manual.textOnly'), set: (v) => { trimSilence.value = v },
      },
      {
        kind: 'select', id: 'chunked', label: t('sa3Gen.manual.chunked'), tech: 'chunked_decode', value: chunkedDecode.value, def: 'auto',
        options: [{ value: 'auto', label: t('sa3Gen.manual.chunkedAuto') }, { value: 'on', label: t('sa3Gen.manual.on') }, { value: 'off', label: t('sa3Gen.manual.off') }],
        set: (v) => { chunkedDecode.value = v as 'auto' | 'on' | 'off' },
      },
    ],
  },
])
const manualRows = computed(() => manualGroups.value.flatMap((g) => g.rows))
// The model, the length and the description tab's switch (a text per variant) are what to make, not tuning: they
// neither count as a change nor go back on Reset (which would change the other tab). The service tags live in the
// tuning only, so they are tuning.
const NOT_TUNING = new Set(['model', 'duration', 'perVariant'])
const manualChanged = computed(() => manualRows.value.filter((r) => !NOT_TUNING.has(r.id) && !r.disabled && rowChanged(r)).length)
function resetManual() {
  for (const r of manualRows.value) if (!NOT_TUNING.has(r.id) && !r.disabled) resetRow(r)
  stepsTouched.value = false
  cfgTouched.value = false
}
// ---- The tuning tab: a few plain choices, or every parameter by hand; the console shows them all at once ----
const TUNING_MODE_KEY = 'remiqora_sa3_tuning_mode'
const readTuningMode = (): 'simple' | 'manual' => { try { return localStorage.getItem(TUNING_MODE_KEY) === 'manual' ? 'manual' : 'simple' } catch { return 'simple' } }
const tuningMode = ref<'simple' | 'manual'>(readTuningMode())
watch(tuningMode, (m) => { try { localStorage.setItem(TUNING_MODE_KEY, m) } catch { /* private window */ } })
const consoleOpen = ref(false)
const moreSteps = computed(() => stepsDefault.value * 2)
const simpleRows = computed<SimpleChoice[]>(() => [
  {
    id: 'steps', label: t('params.simple.steps'), hint: t('params.simple.stepsHint'),
    options: [{ id: 'normal', label: t('params.simple.normal', { n: stepsDefault.value }) }, { id: 'more', label: t('params.simple.more', { n: moreSteps.value }) }],
    active: steps.value === stepsDefault.value ? 'normal' : steps.value === moreSteps.value ? 'more' : null,
    pick: (id) => { steps.value = id === 'more' ? moreSteps.value : stepsDefault.value; stepsTouched.value = id === 'more' },
  },
  {
    id: 'tags', label: t('sa3Gen.manual.autoTags'), hint: t('sa3Gen.autoTagsHint'),
    options: [{ id: 'on', label: t('sa3Gen.simple.tagsOn') }, { id: 'off', label: t('sa3Gen.simple.tagsOff') }], active: autoTags.value ? 'on' : 'off',
    pick: (id) => { autoTags.value = id === 'on' },
  },
])
/** What the request will carry: the takes and the seed, then what was set by hand. */
const requestLine = computed(() => [
  { k: 'batch_size', v: String(count.value), set: false },
  { k: 'seed', v: seed.value === -1 ? t('yueGen.manual.seedRandom') : String(seed.value), set: false },
  ...changedParts(manualRows.value),
])
</script>

<template>
  <div class="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
    <div class="flex flex-col rounded-xl border border-border bg-panel lg:min-h-0 lg:flex-1">
      <!-- Tabs: what is changed every time first; a dot marks a tab that is in use -->
      <div v-roving class="flex shrink-0 gap-1 border-b border-border px-3 pt-2.5" role="tablist" :aria-label="t('sa3Gen.formTabs')">
        <button
          v-for="tab in FORM_TABS" :id="`sa3-tab-${tab}`" :key="tab" type="button" role="tab" :aria-selected="formTab === tab" :aria-controls="`sa3-panel-${tab}`"
          class="relative -mb-px inline-flex items-center gap-1.5 rounded-t-lg border-b-2 px-3 py-2.5 text-[13px] transition-colors"
          :class="formTab === tab ? 'border-accent1 font-medium text-text' : 'border-transparent text-text-dim hover:text-text'"
          @click="formTab = tab"
        >
          <component :is="TAB_ICONS[tab]" class="hidden h-4 w-4 sm:block" />{{ t(`sa3Gen.tabs.${tab}`) }}
          <template v-if="tabChanged[tab]">
            <span class="h-1.5 w-1.5 rounded-full bg-accent2" aria-hidden="true"></span>
            <span class="sr-only">{{ t('sa3Gen.tabChanged') }}</span>
          </template>
        </button>
        <!-- the presets: a menu at the end of the row of tabs -->
        <PresetMenu
          class="mb-1.5 ms-auto self-center" :presets="presets" :selected="selectedPresetName"
          @apply="(name) => { selectedPresetName = name; applyPreset(name) }" @save="(name) => { newPresetName = name; saveCurrentPreset() }" @remove="deletePreset"
        />
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto p-4">
        <!-- What should sound: the kind, the description, the length and the checkpoint -->
        <div v-show="formTab === 'sound'" id="sa3-panel-sound" role="tabpanel" aria-labelledby="sa3-tab-sound" class="space-y-4">
          <div class="flex items-center justify-between gap-3">
            <ChipGroup v-model="kind" :options="kindOptions" :aria-label="t('sa3Gen.kindLabel')" :class="{ 'idea-flash': flash.kind }" />
            <HelpIconButton :title="t('sa3Gen.help.title')" :topic="t('sa3Gen.promptLabel')" @click="helpOpen = 'prompt'" />
          </div>

          <div class="space-y-1.5">
            <label class="block text-[13px] font-medium text-text" :for="perVariant && count > 1 ? 'sa3-variant-1' : 'sa3-prompt'">{{ t('sa3Gen.promptLabel') }}</label>
            <!-- one text for the run, or one per variant (an A/B in one go) -->
            <template v-if="perVariant && count > 1">
              <div v-for="i in count" :key="i" class="space-y-0.5">
                <label class="block text-xs text-text-dim" :for="`sa3-variant-${i}`">{{ t('sa3Gen.variantPrompt', { n: i }) }}</label>
                <textarea
                  :id="`sa3-variant-${i}`"
                  v-model="variantPrompts[i - 1]"
                  rows="2"
                  :aria-invalid="invalid(`sa3-variant-${i}`) || undefined"
                  :aria-describedby="describedBy(`sa3-variant-${i}`)"
                  class="w-full resize-y rounded-lg border border-border bg-panel-2 px-3 py-2 text-sm text-text placeholder:text-text-dim/70 focus:border-accent1 focus:outline-none"
                  :placeholder="t(`sa3Gen.promptPlaceholder.${kind}`)"
                ></textarea>
              </div>
            </template>
            <textarea
              v-else
              id="sa3-prompt"
              v-model="prompt"
              rows="8"
              :aria-invalid="invalid('sa3-prompt') || undefined"
              :aria-describedby="describedBy('sa3-prompt')"
              :class="{ 'idea-flash': flash.prompt }"
              class="w-full resize-y rounded-lg border border-border bg-panel-2 px-3 py-2 text-sm text-text placeholder:text-text-dim/70 focus:border-accent1 focus:outline-none"
              :placeholder="t(`sa3Gen.promptPlaceholder.${kind}`)"
            ></textarea>
            <!-- one hint: in another language, what to do about it; in English, how to describe -->
            <p class="text-xs leading-relaxed text-text-dim">{{ hasNonLatin && !(perVariant && count > 1) ? t('sa3Gen.translateHint') : t('sa3Gen.promptHint') }}</p>
            <!-- the assistant: words in any language in, a Stable Audio prompt out -->
            <div
              v-if="!(perVariant && count > 1) && (prompt.trim() || translating || translatedFrom !== null || translateError)"
              class="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-accent1/25 bg-accent1/[0.06] px-2.5 py-2 text-xs"
            >
              <template v-if="!translating">
                <button
                  type="button"
                  :disabled="!prompt.trim() || !assistantReady"
                  :title="assistantReady ? t('sa3Gen.composeTitle') : t('sa3Gen.translateNoAssistant')"
                  class="inline-flex min-h-7 items-center gap-1.5 rounded-md bg-accent1-strong px-2.5 py-1 font-medium text-white transition-[filter] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100"
                  @click="assistPrompt('compose')"
                ><SparklesIcon class="h-3.5 w-3.5" />{{ t('sa3Gen.composeBtn') }}</button>
                <button
                  v-if="hasNonLatin"
                  type="button"
                  :disabled="!assistantReady"
                  :title="assistantReady ? undefined : t('sa3Gen.translateNoAssistant')"
                  class="min-h-7 rounded-md px-1.5 py-1 text-text-dim underline-offset-2 transition-colors hover:text-text hover:underline focus-visible:outline-2 focus-visible:outline-accent1 disabled:cursor-not-allowed disabled:opacity-50"
                  @click="assistPrompt('translate')"
                >{{ t('sa3Gen.translateBtn') }}</button>
              </template>
              <template v-else>
                <span class="inline-flex items-center gap-1.5 text-text">
                  <SparklesIcon class="h-3.5 w-3.5 animate-pulse text-accent1-text motion-reduce:animate-none" />
                </span>
                <button
                  type="button"
                  :disabled="translateStopping"
                  class="min-h-7 rounded-md border border-border bg-panel px-2.5 py-1 text-text transition-colors hover:border-status-failed/60 hover:text-status-failed focus-visible:outline-2 focus-visible:outline-accent1 disabled:opacity-50"
                  @click="stopTranslate"
                >{{ t('sa3Gen.translateStop') }}</button>
              </template>
              <span
                aria-live="polite"
                class="inline-flex min-w-0 items-center gap-1.5"
                :class="translateError ? 'text-status-failed' : translatedFrom !== null && !translating ? 'text-status-done' : 'text-text-dim'"
              >
                <CheckIcon v-if="translatedFrom !== null && !translating && !translateError" class="h-3.5 w-3.5 shrink-0" />
                <span class="min-w-0">{{ translateStatus }}</span>
              </span>
              <button
                v-if="translatedFrom !== null && !translating"
                type="button"
                class="ms-auto inline-flex min-h-7 items-center gap-1 rounded-md px-1.5 py-1 text-text-dim transition-colors hover:bg-panel-2 hover:text-text focus-visible:outline-2 focus-visible:outline-accent1"
                @click="putBackPrompt"
              ><UndoIcon class="h-3.5 w-3.5" />{{ t('sa3Gen.translateUndo') }}</button>
            </div>
            <!-- one description per variant; the service tags are a setting of the Tuning tab (Simple and Manual) -->
            <div v-if="count > 1" class="grid gap-x-4 gap-y-2 pt-1 text-xs">
              <label v-if="count > 1" class="flex cursor-pointer items-start gap-2.5 rounded-lg px-1 py-1">
                <input v-model="perVariant" type="checkbox" class="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-accent1" aria-describedby="sa3-per-variant-hint" />
                <span class="min-w-0">
                  <span class="block font-medium text-text">{{ t('sa3Gen.perVariant') }}</span>
                  <span id="sa3-per-variant-hint" class="mt-0.5 block leading-relaxed text-text-dim">{{ t('sa3Gen.perVariantHint') }}</span>
                </span>
              </label>
            </div>
          </div>

          <!-- with a reference track the length comes from it -->
          <div v-if="!useRef" class="space-y-1.5">
            <div class="flex items-baseline justify-between">
              <span class="inline-flex items-center gap-1.5 text-[13px] font-medium text-text"><ClockIcon class="h-4 w-4 text-text-dim" />{{ t('sa3Gen.duration') }}</span>
              <span v-if="!LENGTHS.includes(duration)" class="text-xs tabular-nums text-text-dim">{{ t('sa3Gen.lengthOwn', { v: durationLabel }) }}</span>
            </div>
            <div v-roving class="flex overflow-hidden rounded-lg border border-border text-xs" :class="{ 'idea-flash': flash.duration }" role="radiogroup" :aria-label="t('sa3Gen.duration')">
              <button
                v-for="s in LENGTHS" :key="s" type="button" role="radio" :aria-checked="duration === s"
                class="flex-1 px-1 py-2 tabular-nums transition-colors" :class="duration === s ? 'bg-accent1/20 font-medium text-text' : 'text-text-dim hover:bg-panel-2 hover:text-text'"
                @click="duration = s"
              >{{ lengthLabel(s) }}</button>
            </div>
            <p class="text-xs text-text-dim">{{ t(`sa3Gen.durationHint.${kind}`) }}</p>
          </div>
          <p v-else class="rounded-lg border border-border bg-panel-2/50 px-3 py-2 text-xs text-text-dim">
            {{ t('sa3Gen.lengthFromRef') }}
            <button type="button" class="min-h-6 py-1 text-accent1 hover:underline" @click="formTab = 'ref'">{{ t('sa3Gen.tabs.ref') }}</button>
          </p>

          <div class="space-y-1.5">
            <span class="block text-[13px] font-medium text-text">{{ t('sa3Gen.model') }}</span>
            <div v-if="modelOptions.length" v-roving class="flex flex-wrap overflow-hidden rounded-lg border border-border text-xs" :class="{ 'idea-flash': flash.model }" role="radiogroup" :aria-label="t('sa3Gen.model')" aria-describedby="sa3-model-info">
              <button
                v-for="m in modelOptions" :key="m.id" type="button" role="radio" :aria-checked="model === m.id"
                class="flex-1 whitespace-nowrap px-2.5 py-2 transition-colors" :class="model === m.id ? 'bg-accent1/20 font-medium text-text' : 'text-text-dim hover:bg-panel-2 hover:text-text'"
                @click="model = m.id"
              >{{ modelLabel(m) }}</button>
            </div>
            <!-- the size of the chosen checkpoint, visible (it was only a tooltip) -->
            <p v-if="modelOptions.length && selected && modelOptions.some((m) => m.id === selected?.id)" id="sa3-model-info" class="text-xs text-text-dim">{{ modelLabel(selected) }} · {{ selected.params }}</p>
            <p v-else-if="!modelOptions.length" class="text-xs" :class="engineRunning ? 'text-status-failed' : 'text-text-dim'">{{ engineRunning ? t('sa3Gen.noModel') : t('sa3Gen.modelsAfterStart') }}</p>
            <p v-if="base" class="text-xs text-text-dim">{{ t('sa3Gen.baseNote') }}</p>
            <p v-else-if="selected && !selected.loaded" class="text-xs text-text-dim">{{ selected.loading ? t('sa3Gen.modelLoading') : t('sa3Gen.modelCold') }}</p>
          </div>
        </div>

        <!-- A reference track: remade, partly redone or carried on -->
        <div v-show="formTab === 'ref'" id="sa3-panel-ref" role="tabpanel" aria-labelledby="sa3-tab-ref" class="space-y-3">
          <label class="flex items-center justify-between text-sm">
            <span class="flex items-center gap-2 font-medium text-text">
              <input v-model="useRef" type="checkbox" class="rounded border-border" />
              {{ t('sa3Gen.ref.toggle') }}
            </span>
            <HelpIconButton :topic="t('sa3Gen.ref.toggle')" @click="helpOpen = 'ref'" />
          </label>
          <p v-if="!useRef" class="text-xs text-text-dim">{{ t('sa3Gen.ref.off') }}</p>
          <div v-else class="space-y-3">
            <div class="flex flex-wrap items-center gap-2">
              <!-- the real input is sr-only: the label shows where the keyboard focus is -->
              <label class="cursor-pointer rounded-md border border-border px-3 py-1.5 text-xs text-text hover:bg-panel-2 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent1">
                {{ t('sa3Gen.ref.chooseFile') }}
                <input
                  id="sa3-ref-file" type="file" accept="audio/*" class="sr-only" :aria-invalid="invalid('sa3-ref-file') || undefined"
                  :aria-describedby="describedBy('sa3-ref-file')" @change="onRefFileChange"
                />
              </label>
              <button type="button" class="rounded-md border border-border px-3 py-1.5 text-xs text-text hover:bg-panel-2" @click="pickerOpen = true">{{ t('sa3Gen.ref.fromLibrary') }}</button>
              <span v-if="refLoading" class="text-xs text-text-dim">{{ t('sa3Gen.ref.loading') }}</span>
              <span v-else-if="refFile" class="min-w-0 truncate text-xs text-text" :title="refName">{{ t('sa3Gen.ref.source', { name: refName, dur: formatClockShort(refDurationSec) }) }}</span>
              <span v-else class="text-xs text-text-dim">{{ t('sa3Gen.ref.none') }}</span>
            </div>
            <ChipGroup v-model="refMode" :options="refModeOptions" :aria-label="t('sa3Gen.ref.modeLabel')" />
            <p class="text-xs text-text-dim">{{ t(`sa3Gen.ref.modeHints.${refMode}`) }}</p>
            <template v-if="refMode === 'cover'">
              <label class="block space-y-1">
                <span class="text-xs text-text">{{ t('sa3Gen.ref.closeness', { v: closeness.toFixed(2) }) }}</span>
                <input v-model.number="closeness" type="range" min="0" max="1" step="0.05" class="w-full accent-accent1" />
                <span class="flex justify-between text-xs text-text-dim"><span>{{ t('sa3Gen.ref.closenessLow') }}</span><span>{{ t('sa3Gen.ref.closenessHigh') }}</span></span>
              </label>
              <p class="text-xs" :class="closenessBand === 'variation' ? 'text-status-queued' : 'text-text-dim'">{{ t(`sa3Gen.ref.closenessBands.${closenessBand}`) }}</p>
              <!-- the result's length: the source's, or one of your own (shorter covers the start, longer carries on) -->
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-xs text-text">{{ t('sa3Gen.ref.lengthMode') }}</span>
                  <div class="inline-flex rounded-lg border border-border bg-panel-2 p-0.5" role="group" :aria-label="t('sa3Gen.ref.lengthMode')">
                    <button type="button" class="rounded-md px-2.5 py-1 text-xs transition-colors" :class="lengthMode === 'source' ? 'bg-panel text-text shadow-sm ring-1 ring-border' : 'text-text-dim hover:text-text'" :aria-pressed="lengthMode === 'source'" @click="lengthMode = 'source'">{{ t('sa3Gen.ref.lengthSource') }}</button>
                    <button type="button" class="rounded-md px-2.5 py-1 text-xs transition-colors" :class="lengthMode === 'custom' ? 'bg-panel text-text shadow-sm ring-1 ring-border' : 'text-text-dim hover:text-text'" :aria-pressed="lengthMode === 'custom'" @click="lengthMode = 'custom'">{{ t('sa3Gen.ref.lengthCustom') }}</button>
                  </div>
                  <span v-if="lengthMode === 'custom'" class="text-xs tabular-nums text-text-dim">{{ formatClockShort(customSec) }}</span>
                </div>
                <input v-if="lengthMode === 'custom'" id="sa3-custom-sec" v-model.number="customSec" type="range" :aria-invalid="invalid('sa3-custom-sec') || undefined" :aria-describedby="describedBy('sa3-custom-sec')" :min="minSeconds" :max="maxSeconds" :step="stepSeconds" class="w-full accent-accent1" />
                <p v-if="lengthMode === 'custom'" class="text-xs text-text-dim">{{ t('sa3Gen.ref.lengthCustomHint') }}</p>
              </div>
            </template>
            <div v-else-if="refMode === 'repaint'" class="space-y-2">
              <span class="block text-xs text-text">{{ t('sa3Gen.ref.ranges') }}</span>
              <!-- several ranges are redone in one pass; each is from/to seconds into the reference -->
              <div v-for="(r, i) in ranges" :key="i" class="flex items-end gap-2">
                <label class="flex-1 space-y-1">
                  <span class="block text-xs text-text-dim">{{ t('sa3Gen.ref.rangeFrom') }}</span>
                  <input :id="`sa3-range-${i}-start`" v-model.number="r.start" type="number" min="0" :aria-invalid="(i === 0 && invalid('sa3-range-0-start')) || undefined" :aria-describedby="i === 0 ? describedBy('sa3-range-0-start') : undefined" :max="refDurationSec" step="0.5" class="w-full rounded-lg border border-border bg-panel-2 px-2 py-1.5 text-sm text-text" />
                </label>
                <label class="flex-1 space-y-1">
                  <span class="block text-xs text-text-dim">{{ t('sa3Gen.ref.rangeTo') }}</span>
                  <input v-model.number="r.end" type="number" min="0" :max="refDurationSec" step="0.5" class="w-full rounded-lg border border-border bg-panel-2 px-2 py-1.5 text-sm text-text" />
                </label>
                <button type="button" class="h-9 w-9 shrink-0 rounded-lg border border-border text-text-dim hover:text-status-failed disabled:opacity-40" :disabled="ranges.length === 1" :aria-label="t('sa3Gen.ref.removeRange')" :title="t('sa3Gen.ref.removeRange')" @click="removeRange(i)">✕</button>
              </div>
              <button type="button" class="min-h-6 py-1 text-xs text-accent1 hover:underline" @click="addRange">{{ t('sa3Gen.ref.addRange') }}</button>
              <p v-if="!rangesValid" class="text-xs text-status-failed">{{ t('sa3Gen.ref.badRanges') }}</p>
            </div>
            <label v-else class="block space-y-1">
              <span class="text-xs text-text">{{ t('sa3Gen.ref.extend', { v: formatClockShort(extendSec) }) }}</span>
              <input id="sa3-extend-sec" v-model.number="extendSec" type="range" :aria-invalid="invalid('sa3-extend-sec') || undefined" :aria-describedby="describedBy('sa3-extend-sec')" min="2" :max="Math.max(2, maxSeconds - Math.ceil(refDurationSec))" step="1" class="w-full accent-accent1" />
            </label>
            <p v-if="refFile" class="text-xs tabular-nums text-text-dim">{{ t('sa3Gen.ref.length', { v: formatClockShort(resultSeconds) }) }}</p>
          </div>
        </div>

        <!-- The tuning: every parameter, in groups -->
        <div v-show="formTab === 'tuning'" id="sa3-panel-tuning" role="tabpanel" aria-labelledby="sa3-tab-tuning" class="space-y-5">
          <div class="flex flex-wrap items-center gap-2">
            <div v-roving class="inline-flex overflow-hidden rounded-lg border border-border text-xs" role="radiogroup" :aria-label="t('yueGen.tuningTitle')">
              <button
                v-for="m in (['simple', 'manual'] as const)" :key="m" type="button" role="radio" :aria-checked="tuningMode === m"
                class="px-3 py-1.5 transition-colors" :class="tuningMode === m ? 'bg-accent1/20 font-medium text-text' : 'text-text-dim hover:bg-panel-2 hover:text-text'"
                @click="tuningMode = m"
              >{{ t(`yueGen.manual.${m}`) }}</button>
            </div>
            <template v-if="tuningMode === 'manual'">
              <span class="ms-auto text-xs text-text-dim">{{ t('yueGen.manual.changed', { n: manualChanged, total: manualRows.length }) }}</span>
              <button type="button" class="rounded-lg border border-border px-2 py-1 text-xs text-text-dim hover:text-text disabled:opacity-40" :disabled="!manualChanged" @click="resetManual">{{ t('yueGen.manual.reset') }}</button>
              <button type="button" class="min-w-6 rounded-lg border border-border px-2 py-1 text-xs text-text-dim hover:text-text" :title="t('yueGen.manual.console')" :aria-label="t('yueGen.manual.console')" @click="consoleOpen = true"><span aria-hidden="true">⤢</span></button>
            </template>
          </div>
          <SimpleChoices v-if="tuningMode === 'simple'" :rows="simpleRows" />
          <ParamGroups v-else :groups="manualGroups"></ParamGroups>
          <p class="text-xs text-text-dim">{{ base ? t('sa3Gen.advancedHintBase') : t('sa3Gen.advancedHint') }}</p>
        </div>
      </div>

      <!-- Always in view: how many takes, the seed, and Create -->
      <!-- sticky on a phone too (the form is long there), with room for the home indicator -->
      <div class="sticky bottom-0 z-10 shrink-0 space-y-2.5 rounded-b-xl border-t border-border bg-panel p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:static lg:bg-panel-2/60">
        <p v-if="formError" :id="FORM_ERROR_ID" role="alert" class="rounded-lg bg-status-failed/10 p-2 text-xs text-status-failed">{{ formError }}</p>
        <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs">
          <div class="flex items-center gap-2">
            <span id="sa3-takes-label" class="text-text-dim">{{ t('yueGen.takes') }}</span>
            <!-- named by the visible label (WCAG 2.5.3) -->
            <div v-roving class="inline-flex overflow-hidden rounded-lg border border-border" role="radiogroup" aria-labelledby="sa3-takes-label">
              <button
                v-for="o in countOptions" :key="o.value" type="button" role="radio" :aria-checked="count === o.value"
                class="min-w-8 px-2 py-1.5 tabular-nums" :class="count === o.value ? 'bg-accent1/20 font-medium text-text' : 'text-text-dim hover:bg-panel-2'"
                @click="count = o.value"
              >{{ o.label }}</button>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <label for="sa3-seed" class="text-text-dim">{{ t('sa3Gen.seed') }}</label>
            <input
              id="sa3-seed" type="number" :value="seedRandom ? '' : seed" :disabled="seedRandom" :placeholder="t('yueGen.manual.seedRandom')"
              class="w-28 rounded-lg border border-border bg-panel-2 px-2 py-1.5 text-xs tabular-nums text-text disabled:opacity-60"
              @change="onSeedInput(($event.target as HTMLInputElement).value)"
            />
            <button
              type="button" class="rounded-lg border px-2 py-1.5" :class="seedRandom ? 'border-accent1/60 bg-accent1/15 text-text' : 'border-border text-text-dim hover:text-text'"
              :aria-pressed="seedRandom" :title="t('yueGen.randomSeed')" :aria-label="t('yueGen.randomSeed')" @click="toggleSeedRandom"
            ><span aria-hidden="true">🎲</span></button>
          </div>
        </div>
        <MakeCoverOption v-if="kind === 'music'" />
        <button type="button" class="accent-gradient w-full rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-50" :disabled="submitting" @click="submit">
          {{ submitting ? t('sa3Gen.submitting') : createLabel(t(`sa3Gen.submitKind.${kind}`)) }}<span v-if="!submitting && count > 1" class="ms-1.5 font-normal opacity-80">× {{ count }}</span>
        </button>
        <!-- after Create: the feed is far below the form on a phone, so say where the take went -->
        <p role="status" aria-live="polite" class="text-xs text-text-dim lg:sr-only">
          <a v-if="queuedNote" href="#create-session" class="text-accent1 underline" @click.prevent="toSession">{{ queuedNote }}</a>
        </p>
      </div>
    </div>

    <ParamConsole
      :open="consoleOpen" :title="t('params.consoleTitle', { name: 'Stable Audio' })" :groups="manualGroups" :changed="manualChanged" :total="manualRows.length"
      :request="requestLine" :note="t('params.consoleNote')" @close="consoleOpen = false" @reset="resetManual"
    />

    <LibraryPicker v-if="pickerOpen" @pick="onPickFromLibrary" @close="pickerOpen = false" />

    <!-- The help windows, in the editor guide's look -->
    <HelpModal :open="helpOpen === 'ref'" :title="t('sa3Gen.ref.help.title')" @close="helpOpen = false">
      <HelpBody :lead="t('sa3Gen.ref.help.text')" />
    </HelpModal>
    <HelpModal :open="helpOpen === 'prompt'" :title="t('sa3Gen.help.title')" wide @close="helpOpen = false">
      <HelpBody :lead="t('sa3Gen.help.intro')">
        <HelpSection :title="t('sa3Gen.help.tipsTitle')" tone="tips">
          <HelpList :items="tm('sa3Gen.help.tips') as string[]" />
        </HelpSection>
        <HelpSection :title="t('sa3Gen.help.examplesTitle')">
          <HelpExamples
            :items="(tm('sa3Gen.help.examples') as string[]).map((text) => ({ text }))"
            pickable
            @pick="(i) => applyExample((tm('sa3Gen.help.examples') as string[])[i])"
          />
        </HelpSection>
      </HelpBody>
    </HelpModal>
  </div>
</template>
