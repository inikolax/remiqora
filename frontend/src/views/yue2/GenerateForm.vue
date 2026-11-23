<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useYue2Store } from '../../stores/yue2'
import { useScoreWorkspace } from '../../stores/scoreWorkspace'
import { useNotesView } from '../../composables/useNotesView'
import { useFeaturesStore } from '../../stores/features'
import * as api from '../../api/yue2'
import type { CotMode, GenerateOptions } from '../../api/yue2'
import CollapsibleDetails from '../../components/shared/CollapsibleDetails.vue'
import HelpModal from '../../components/shared/HelpModal.vue'
import MakeCoverOption from '../../components/shared/MakeCoverOption.vue'
import HelpIconButton from '../../components/shared/HelpIconButton.vue'
import HelpBody from '../../components/shared/help/HelpBody.vue'
import HelpSection from '../../components/shared/help/HelpSection.vue'
import HelpList from '../../components/shared/help/HelpList.vue'
import HelpTable from '../../components/shared/help/HelpTable.vue'
import HelpExamples from '../../components/shared/help/HelpExamples.vue'
import TagInput from '../../components/shared/TagInput.vue'
import LyricsIcon from '../../components/shared/icons/LyricsIcon.vue'
import PianoKeysIcon from '../../components/shared/icons/PianoKeysIcon.vue'
import SlidersIcon from '../../components/shared/icons/SlidersIcon.vue'
import ClockIcon from '../../components/shared/icons/ClockIcon.vue'
import ScoreCard from './ScoreCard.vue'
import ParamGroups from '../../components/shared/params/ParamGroups.vue'
import ParamConsole from '../../components/shared/params/ParamConsole.vue'
import PresetMenu from '../../components/shared/PresetMenu.vue'
import { useEngineStart } from '../../composables/useEngineStart'
import { useFormDraft } from '../../composables/useFormDraft'
import { resetRow, rowChanged } from '../../components/shared/params/types'
import type { ParamGroupSpec, ParamQuick, ParamSlider } from '../../components/shared/params/types'
import { defaultTitle } from '../../utils/songTitle'

const store = useYue2Store()
const { t, tm } = useI18n()

interface Yue2Preset {
  name: string
  lyrics: string
  style: string
  cot: CotMode
  precision: 'q8_0' | 'q4_0' | 'bf16'
  abc: string
  cfgScale: number | null
  numInferenceSteps: number | null
  semantic: Record<string, number | null>
  abcSampling: Record<string, number | null>
}

const presets = ref<Yue2Preset[]>([])
const selectedPresetName = ref('')
const newPresetName = ref('')
const showPresetInput = ref(false)

function loadPresets() {
  try {
    const raw = localStorage.getItem('yue2_presets')
    if (raw) presets.value = JSON.parse(raw)
  } catch {}
}

function saveCurrentPreset() {
  const name = newPresetName.value.trim()
  if (!name) return
  const preset: Yue2Preset = {
    name,
    lyrics: lyrics.value,
    style: style.value,
    cot: cot.value,
    precision: precision.value,
    abc: abc.value,
    cfgScale: cfgScale.value,
    numInferenceSteps: numInferenceSteps.value,
    semantic: { ...semantic },
    abcSampling: { ...abcSampling },
  }
  const idx = presets.value.findIndex((p) => p.name === preset.name)
  if (idx !== -1) presets.value[idx] = preset
  else presets.value.push(preset)
  localStorage.setItem('yue2_presets', JSON.stringify(presets.value))
  selectedPresetName.value = name
  newPresetName.value = ''
  showPresetInput.value = false
}

function applyPreset(name: string) {
  const p = presets.value.find((x) => x.name === name)
  if (!p) return
  // Through the idea line's undo: the changed fields flash and "Put back" brings the old values back. A preset saved
  // with an empty lyrics or style leaves the current text alone.
  const params: Record<string, any> = { cot: p.cot || 'off', precision: p.precision || 'q8_0', abc: p.abc || '' }
  if (p.lyrics?.trim()) params.lyrics = p.lyrics
  if (p.style?.trim()) params.style = p.style
  const reset: string[] = []
  if (p.cfgScale != null) params.cfg_scale = p.cfgScale; else reset.push('cfg_scale')
  if (p.numInferenceSteps != null) params.num_inference_steps = p.numInferenceSteps; else reset.push('num_inference_steps')
  params.reset = reset
  if (p.semantic) params.semantic = { ...p.semantic }
  if (p.abcSampling) params.abc_sampling = { ...p.abcSampling }
  store.requestInsertParams(params, { undoable: true })
}

function deletePreset(name: string) {
  presets.value = presets.value.filter((p) => p.name !== name)
  localStorage.setItem('yue2_presets', JSON.stringify(presets.value))
  if (selectedPresetName.value === name) selectedPresetName.value = ''
}

onMounted(loadPresets)

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

/** The current values of the fields `params` will change, in the vocabulary applyInsert reads. */
function snapshotFor(params: Record<string, any>): Record<string, any> {
  const snap: Record<string, any> = {}
  const reset: string[] = []
  if (params.lyrics != null) snap.lyrics = lyrics.value
  if (params.style != null) snap.style = style.value
  if (params.cot != null) snap.cot = cot.value
  if (params.precision != null) snap.precision = precision.value
  if (params.seed != null) snap.seed = seed.value
  if (params.abc != null) snap.abc = abc.value
  // a field the insert sets or resets: undo puts back its value, or the default when it had none
  const touchesReset = (k: string) => params[k] != null || (Array.isArray(params.reset) && params.reset.includes(k))
  if (touchesReset('cfg_scale')) { if (cfgScale.value != null) snap.cfg_scale = cfgScale.value; else reset.push('cfg_scale') }
  if (touchesReset('num_inference_steps')) { if (numInferenceSteps.value != null) snap.num_inference_steps = numInferenceSteps.value; else reset.push('num_inference_steps') }
  if (params.randomSeed != null) snap.randomSeed = randomSeed.value
  if (params.semantic) snap.semantic = { ...semantic }
  if (params.abc_sampling) snap.abc_sampling = { ...abcSampling }
  if (reset.length) snap.reset = reset
  return snap
}

function applyInsert(params: typeof store.pendingParamsInsert) {
  if (!params) return
  const undoable = store.pendingUndoable
  const lit = undoable || store.pendingFlash
  if (undoable) store.insertUndo = snapshotFor(params)
  const touched: string[] = []
  if (params.lyrics != null) { lyrics.value = params.lyrics; touched.push('lyrics') }
  if (params.style != null) { style.value = params.style; touched.push('style') }
  if (params.cot != null) cot.value = params.cot
  if (params.precision != null) precision.value = params.precision
  if (params.seed != null) seed.value = params.seed
  // a reused take wants its own seed, not a random one
  if (typeof params.randomSeed === 'boolean') randomSeed.value = params.randomSeed
  // a reused take or an idea brings a new song: undo in the score does not go back into the old one
  if (params.abc != null && params.abc !== abc.value) { ws.formEditor().expectNewSong(); abc.value = params.abc }
  if (params.cfg_scale != null) cfgScale.value = params.cfg_scale
  if (params.num_inference_steps != null) numInferenceSteps.value = params.num_inference_steps
  if (params.semantic) Object.assign(semantic, params.semantic)
  if (params.abc_sampling) Object.assign(abcSampling, params.abc_sampling)
  if (Array.isArray(params.reset)) {
    for (const k of params.reset) {
      if (k === 'cfg_scale') cfgScale.value = null
      else if (k === 'num_inference_steps') numInferenceSteps.value = null
    }
  }
  store.clearPendingParamsInsert()
  if (lit) flashFields(touched)
}
watch(() => store.pendingParamsInsert, applyInsert)
onMounted(() => applyInsert(store.pendingParamsInsert))

const lyrics = ref('')
const style = ref('')
const cot = ref<CotMode>('off')
const precision = ref<'q8_0' | 'q4_0' | 'bf16'>('q8_0')
// What an idea insert would overwrite.
watchEffect(() => { store.formHasText = !!(lyrics.value.trim() || style.value.trim()) })
// Only the precisions installed (the installer may have fetched one); a remembered one that is gone falls back.
const features = useFeaturesStore()
const precisions = computed(() => (features.features.yue2_precisions.length ? features.features.yue2_precisions : (['q8_0', 'q4_0', 'bf16'] as const)))
watch([precision, precisions], () => {
  if (!precisions.value.includes(precision.value)) precision.value = precisions.value[0]
}, { immediate: true })
// The score is the notes workspace's (Create's "Notes"): the form's card and the wide editor share it, and the
// draft below keeps it like any other field.
const ws = useScoreWorkspace()
const { formAbc: abc } = storeToRefs(ws)
// A given score replaces the plan, so the planner's sampling (abc_*) does nothing (the engine skips the planner).
const scoreGiven = computed(() => !!abc.value.trim())

const coverFile = ref<File | null>(null)
const unloadSheetSage = ref(true)
const extracting = ref(false)
const coverStatus = ref('')
const coverError = ref('')

const seed = ref(831001)
// random by default like the other engines: a fixed seed made two presses of Create give the same song
const randomSeed = ref(true)
const batchSize = ref<1 | 2 | 3 | 4>(1)

const cfgScale = ref<number | null>(null)
const numInferenceSteps = ref<number | null>(null)

// ---- Tabs: Song (changed every time), Melody (the plan and the score), Tuning (the sampling) ----
const FORM_TABS = ['song', 'melody', 'tuning'] as const
const TAB_ICONS = { song: LyricsIcon, melody: PianoKeysIcon, tuning: SlidersIcon } as const
const formTab = ref<(typeof FORM_TABS)[number]>('song')
const tabChanged = computed<Record<(typeof FORM_TABS)[number], boolean>>(() => ({
  song: false,
  melody: cot.value !== 'off' || !!abc.value.trim(),
  // the token limits a Length choice set belong to the Song tab
  tuning: [
    ...Object.entries(semantic).filter(([k]) => songLength.value === null || (k !== 'min_tokens' && k !== 'max_tokens')).map(([, v]) => v),
    // the score's sampling is not sent without a plan to sample (cot off) or with a given score
    ...(cot.value !== 'off' && !scoreGiven.value ? Object.values(abcSampling) : []),
  ].some((v) => v != null && (v as unknown) !== ''),
}))

// ---- Length: minutes as the semantic token limits ----
// YuE2 makes 25 semantic tokens a second (measured: a 1000-token cap cut a song at 40.0 s). A length sets the cap a
// little above the target and the floor at 85 % of it: a shorter lyric is sung and played on to about that length,
// a longer one is cut there. "By the lyrics" keeps the engine's own limits (a 200-token floor, about 6 min at most).
const LENGTHS = [0, 1, 2, 3, 4, 6, 8] as const
const TOKENS_PER_SECOND = 25
const lengthTokens = (minutes: number) => ({ min: Math.round(minutes * 60 * TOKENS_PER_SECOND * 0.85), max: minutes * 60 * TOKENS_PER_SECOND + 2 * TOKENS_PER_SECOND })
const songLength = computed<number | null>(() => {
  const lo = semantic.min_tokens
  const hi = semantic.max_tokens
  const unset = (v: number | null | undefined) => v == null || (v as unknown) === ''
  if (unset(lo) && unset(hi)) return 0
  return LENGTHS.find((m) => m > 0 && lengthTokens(m).min === Number(lo) && lengthTokens(m).max === Number(hi)) ?? null
})
function setLength(minutes: number) {
  if (minutes === 0) { semantic.min_tokens = null; semantic.max_tokens = null; return }
  const t = lengthTokens(minutes)
  semantic.min_tokens = t.min
  semantic.max_tokens = t.max
}

// ---- Quality: the precision, the decoding steps and CFG as one choice ----
// From the field help: 8 steps is a quick sketch and 32 a clean final layer (~4 s more a track on an RTX 4080);
// CFG 1.2 follows the style tags more strictly (above 1.5 the sound turns plastic); q4_0 saves video memory for a
// little quality, bf16 is the model unquantized. "Own" opens the three fields.
type Quality = 'draft' | 'normal' | 'final' | 'own'
type QualityPreset = { precision: 'q8_0' | 'q4_0' | 'bf16'; steps: number | null; cfg: number | null }
const QUALITIES = ['draft', 'normal', 'final', 'own'] as const
function firstInstalled(...wanted: ('q8_0' | 'q4_0' | 'bf16')[]): 'q8_0' | 'q4_0' | 'bf16' {
  return wanted.find((w) => (precisions.value as readonly string[]).includes(w)) ?? precisions.value[0]
}
const qualityPresets = computed<Record<Exclude<Quality, 'own'>, QualityPreset>>(() => ({
  draft: { precision: firstInstalled('q4_0', 'q8_0', 'bf16'), steps: null, cfg: null },
  normal: { precision: firstInstalled('q8_0', 'bf16', 'q4_0'), steps: null, cfg: null },
  final: { precision: firstInstalled('bf16', 'q8_0', 'q4_0'), steps: 32, cfg: 1.2 },
}))
// Draft equals Normal when q4_0 is not installed, and Normal is checked first: it could never show as chosen
const qualityOptions = computed(() => QUALITIES.filter((q) => q !== 'draft' || qualityPresets.value.draft.precision !== qualityPresets.value.normal.precision))
const ownQuality = ref(false)
const quality = computed<Quality>(() => {
  if (ownQuality.value) return 'own'
  const steps = numInferenceSteps.value ?? null
  const cfg = cfgScale.value ?? null
  for (const q of ['normal', 'draft', 'final'] as const) {
    const p = qualityPresets.value[q]
    if (p.precision === precision.value && p.steps === steps && p.cfg === cfg) return q
  }
  return 'own'
})
function setQuality(q: Quality) {
  if (q === 'own') { ownQuality.value = true; return }
  ownQuality.value = false
  const p = qualityPresets.value[q]
  precision.value = p.precision
  numInferenceSteps.value = p.steps
  cfgScale.value = p.cfg
}
const qualityHint = computed(() => {
  if (quality.value === 'own') return t('yueGen.qualityHints.own')
  return t(`yueGen.qualityHints.${quality.value}`, { model: qualityPresets.value[quality.value].precision })
})
const semantic = reactive<Record<string, number | null>>({
  temperature: null, top_p: null, top_k: null, repetition_penalty: null, penalty_window: null, min_tokens: null, max_tokens: null,
})
const abcSampling = reactive<Record<string, number | null>>({
  temperature: null, top_p: null, top_k: null, repetition_penalty: null, penalty_window: null, min_tokens: null, max_tokens: null,
})

// What is typed survives a reload and a visit to another page. Set up here, during setup and so before the mount
// (where a pending insert is applied): a reuse or an idea insert wins over the draft.
useFormDraft('yue2', { lyrics, style, cot, precision, abc, seed, randomSeed, batchSize, cfgScale, numInferenceSteps, ownQuality, unloadSheetSage, semantic, abcSampling })
// the editor starts from the restored score (not an undo step away from an empty one)
ws.formEditor()
// what the workspace shows of the form: the words (sections, the simple view), the style (the singer's range), the
// name, the plan, the tab and the extraction
watchEffect(() => {
  ws.lyrics = lyrics.value
  ws.style = style.value
  ws.title = lyrics.value.trim() ? defaultTitle({ lyrics: lyrics.value, style: style.value }) : ''
  ws.plan = cot.value
  ws.formTab = formTab.value
  ws.extracting = extracting.value
})
// "From a song..." asked for in the workspace: the file picker of this form
watch(() => ws.fromSongRequest, () => songFile.value?.click())

const submitting = ref(false)
const formError = ref('')
/** After a successful Create: the status line next to the button shows the takes still in the queue. */
const justCreated = ref(false)
const queuedTakes = computed(() => store.jobs.filter((j) => j.status === 'queued' || j.status === 'running').length)
const helpOpen = ref<null | 'style' | 'lyrics' | 'cot' | 'advanced' | 'melody'>(null)
const helpStyleExamples = computed(() => (tm('yueGen.help.style.examples') as string[]).map((text) => ({ text })))
/** An example from the help goes into its field (undoable like the idea line), and the help closes. */
function useStyleExample(i: number) {
  const text = (tm('yueGen.help.style.examples') as string[])[i]
  if (text != null) store.requestInsertParams({ style: text }, { undoable: true })
  helpOpen.value = null
}
function useLyricsExample() {
  store.requestInsertParams({ lyrics: t('yueGen.help.lyrics.example') }, { undoable: true })
  helpOpen.value = null
}
/** The CoT modes with what each is for, as rows of the help's table. */
const cotHelpRows = computed(() => (['off', 'melody', 'full'] as const).map((mode) => ({
  mode: t(`yueGen.planNames.${mode}`),
  key: mode,
  when: `${COT_HINTS.value[mode].replace(/^\w+:\s*/, '')} ${t(`yueGen.help.cot.${mode}Note`)}`,
})))

const COT_OPTIONS: { value: CotMode; label: string }[] = [
  { value: 'off', label: 'off' },
  { value: 'melody', label: 'melody' },
  { value: 'full', label: 'full' },
]
const COT_HINTS = computed<Record<CotMode, string>>(() => ({
  off: t('yueGen.cotHints.off'),
  melody: t('yueGen.cotHints.melody'),
  full: t('yueGen.cotHints.full'),
}))
/** The plan's description under its switch: without the "off:" prefix, as a sentence starting with a capital. */
const planHint = computed(() => {
  const s = COT_HINTS.value[cot.value].replace(/^\w+:\s*/, '')
  return s.charAt(0).toLocaleUpperCase() + s.slice(1)
})
// min/max are what audio.cpp's request validation accepts (src/models/yue2/request.cpp); it rejects the
// whole request otherwise, so the form checks them before sending. max_tokens additionally must be
// >= min_tokens of the same stage.
// (the names in messages are the localized row labels, yueGen.manual.params.*)
type NumberField = { key: string; step: string; min: number; max?: number }
const SAMPLING_FIELDS: NumberField[] = [
  { key: 'temperature', step: '0.01', min: 0.01, max: 5 },
  { key: 'top_p', step: '0.01', min: 0.01, max: 1 },
  { key: 'top_k', step: '1', min: 1 },
  { key: 'repetition_penalty', step: '0.01', min: 0.01 },
  { key: 'penalty_window', step: '1', min: 1 },
  { key: 'min_tokens', step: '1', min: 0 },
  { key: 'max_tokens', step: '1', min: 0 },
]
// The model's context is 24576 tokens; the semantic stage stops being useful well before it, as the slider does.
const SEMANTIC_MAX_TOKENS_CAP = 15000
const CFG_FIELD: NumberField = { key: 'cfg_scale', step: '0.01', min: 0, max: 20 }
const STEPS_FIELD: NumberField = { key: 'num_inference_steps', step: '1', min: 1 }
const rangeLabel = (f: NumberField) => (f.max == null ? `≥ ${f.min}` : `${f.min} – ${f.max}`)
// A cleared number input leaves '' (v-model.number keeps what it cannot parse), which must count as
// "not set" rather than be sent to the engine.
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)
// A failed check knows where the field is: its tab and a selector, so the form can take the user to it.
type FormFail = { msg: string; tab: (typeof FORM_TABS)[number]; sel: string }
// the manual-tuning groups the sampling rows sit in (the rows carry no ids of their own: found by group and label)
const STAGE_GROUP: Record<string, string> = {
  temperature: 'character', top_p: 'character', top_k: 'character', repetition_penalty: 'repeats', penalty_window: 'repeats', min_tokens: 'length', max_tokens: 'length',
}
const rowSel = (stage: PerfTarget, key: string) =>
  `[data-group="${stage === 'abc' ? 'score' : STAGE_GROUP[key]}"] input[type=number][aria-label="${t(`yueGen.manual.params.${key}`).replace(/"/g, '\\"')}"]`
// The first out-of-range field as a user-facing failure, or null when everything is fine.
function rangeError(): FormFail | null {
  // the same names the rows show
  const label = (f: NumberField) => t(`yueGen.manual.params.${f === CFG_FIELD ? 'cfg' : f === STEPS_FIELD ? 'steps' : f.key}`)
  const check = (group: string, f: NumberField, raw: number | null, tab: FormFail['tab'], sel: string): FormFail | null => {
    const v = num(raw)
    if (v == null) return null
    const integer = f.step === '1'
    if (v < f.min || (f.max != null && v > f.max) || (integer && !Number.isInteger(v))) {
      return { msg: t('yueGen.outOfRange', { field: group ? `${group} → ${label(f)}` : label(f), range: rangeLabel(f) }), tab, sel }
    }
    return null
  }
  const checkStage = (stage: PerfTarget, group: string, values: Record<string, number | null>, capped = false): FormFail | null => {
    for (const f of SAMPLING_FIELDS) {
      const err = check(group, f, values[f.key], 'tuning', rowSel(stage, f.key))
      if (err) return err
    }
    if (capped) {
      const m = num(values.max_tokens)
      if (m != null && m > SEMANTIC_MAX_TOKENS_CAP) {
        return { msg: t('yueGen.outOfRange', { field: `${group} → ${t('yueGen.manual.params.max_tokens')}`, range: `0 – ${SEMANTIC_MAX_TOKENS_CAP}` }), tab: 'tuning', sel: rowSel(stage, 'max_tokens') }
      }
    }
    const lo = num(values.min_tokens) ?? YUE2_DEFAULTS_NUM(group, 'min_tokens')
    const hi = num(values.max_tokens) ?? YUE2_DEFAULTS_NUM(group, 'max_tokens')
    if (hi < lo) return { msg: t('yueGen.maxBelowMin', { group }), tab: 'tuning', sel: rowSel(stage, 'max_tokens') }
    return null
  }
  const s = seed.value as unknown
  if (!randomSeed.value && !(typeof s === 'number' && Number.isInteger(s) && s >= 0 && s <= 2147483647)) {
    return { msg: t('yueGen.outOfRange', { field: t('aceGen.seed'), range: '0 – 2147483647' }), tab: formTab.value, sel: '#yue-seed' }
  }
  return (
    check('', CFG_FIELD, cfgScale.value, 'song', '#yue-cfg') ||
    check('', STEPS_FIELD, numInferenceSteps.value, 'song', '#yue-steps') ||
    checkStage('semantic', t('yueGen.semanticSampling'), semantic, true) ||
    (cot.value !== 'off' && !scoreGiven.value ? checkStage('abc', t('yueGen.abcPlannerSampling'), abcSampling) : null)
  )
}
// What audio.cpp uses when a field is left empty — shown as the placeholder so the user sees the
// real number, not just "default". Mirrors external/audio.cpp/docs/models/yue2.md and the model's
// sidecars/yue2-generation-config.json; semantic CFG depends on the cot mode.
const YUE2_DEFAULTS = {
  cfgScale: { off: '1.01', melody: '1.0', full: '1.0' } as Record<CotMode, string>,
  numInferenceSteps: '8',
  semantic: { temperature: '1.0', top_p: '0.95', top_k: '100', repetition_penalty: '1.2', penalty_window: '50', min_tokens: '200', max_tokens: '9000' } as Record<string, string>,
  abc: { temperature: '0.7', top_p: '0.9', top_k: '30', repetition_penalty: '1.005', penalty_window: '100', min_tokens: '32', max_tokens: '4096' } as Record<string, string>,
}

// ---- Performance: the sampling fields as the fixes the help gives for each problem ----
// Off notes -> temperature 0.85, every take alike -> 1.1; a phrase looping -> repetition penalty 1.3 with a window
// of 80; a song cut off -> max tokens 12000 (about 8 min instead of 6); a rambling melody -> score temperature 0.55.
type PerfTarget = 'semantic' | 'abc'
type PerfOption = { id: string; values: Record<string, number | null> }
type PerfRow = { id: string; target: PerfTarget; options: PerfOption[] }
const PERF_ROWS: PerfRow[] = [
  { id: 'temperature', target: 'semantic', options: [
    { id: 'steady', values: { temperature: 0.85 } },
    { id: 'normal', values: { temperature: null } },
    { id: 'varied', values: { temperature: 1.1 } },
  ] },
  { id: 'repeats', target: 'semantic', options: [
    { id: 'normal', values: { repetition_penalty: null, penalty_window: null } },
    { id: 'fewer', values: { repetition_penalty: 1.3, penalty_window: 80 } },
  ] },
  { id: 'score', target: 'abc', options: [
    { id: 'normal', values: { temperature: null } },
    { id: 'careful', values: { temperature: 0.55 } },
  ] },
]
const perfStore = (target: PerfTarget) => (target === 'abc' ? abcSampling : semantic)
const perfDefault = (target: PerfTarget, key: string) => Number((target === 'abc' ? YUE2_DEFAULTS.abc : YUE2_DEFAULTS.semantic)[key])
/** The option the fields hold now (a value equal to the engine default counts as the default), or null. */
function perfActive(row: PerfRow): string | null {
  const store = perfStore(row.target)
  const same = (key: string, v: number | null) => {
    const cur = store[key]
    const a = cur == null || (cur as unknown) === '' ? perfDefault(row.target, key) : Number(cur)
    const b = v == null ? perfDefault(row.target, key) : v
    return Math.abs(a - b) < 1e-9
  }
  return row.options.find((o) => Object.entries(o.values).every(([k, v]) => same(k, v)))?.id ?? null
}
function perfSet(row: PerfRow, option: PerfOption) {
  const store = perfStore(row.target)
  for (const [k, v] of Object.entries(option.values)) store[k] = v
}

// --- The advanced-settings help -------------------------------------------------------------
// Each field card draws the engine defaults on a short scale (the span worth showing, not the
// allowed range, which is often unbounded). Sampling keys have two defaults: semantic and ABC.
const HELP_SCALES: Record<string, { lo: number; hi: number }> = {
  cfg_scale: { lo: 0, hi: 3 },
  num_inference_steps: { lo: 1, hi: 48 },
  temperature: { lo: 0, hi: 2 },
  repetition_penalty: { lo: 1, hi: 1.5 },
  min_tokens: { lo: 0, hi: 1000 },
  max_tokens: { lo: 0, hi: 24000 },
}
const scalePct = (key: string, value: string) => {
  const s = HELP_SCALES[key]
  return Math.min(100, Math.max(0, ((Number(value) - s.lo) / (s.hi - s.lo)) * 100))
}
// A tick's label is centred on it, except near the ends where it would spill out of the card.
const tickStyle = (pct: number) => ({ left: `${pct}%`, transform: pct < 12 ? 'none' : pct > 88 ? 'translateX(-100%)' : 'translateX(-50%)' })
const tickAlign = (pct: number) => (pct < 12 ? 'items-start' : pct > 88 ? 'items-end' : 'items-center')
const helpDefaults = (key: string): { semantic: string; abc?: string } => {
  if (key === 'cfg_scale') return { semantic: YUE2_DEFAULTS.cfgScale[cot.value] }
  if (key === 'num_inference_steps') return { semantic: YUE2_DEFAULTS.numInferenceSteps }
  return { semantic: YUE2_DEFAULTS.semantic[key], abc: YUE2_DEFAULTS.abc[key] }
}
const helpRange = (key: string) => rangeLabel([CFG_FIELD, STEPS_FIELD, ...SAMPLING_FIELDS].find((f) => f.key === key)!)
// One-click fixes for the "what to do if…" cards; the locale text says what each one sets.
const HELP_FIXES: Record<string, () => void> = {
  cutoff: () => { semantic.max_tokens = 12000 },
  offbrief: () => { cfgScale.value = 1.2 },
  loop: () => { semantic.repetition_penalty = 1.3; semantic.penalty_window = 80 },
  offkey: () => { semantic.temperature = 0.85; numInferenceSteps.value = 32 },
  // a given score replaces the plan, so there is nothing to make careful
  melody: () => { if (cot.value === 'off') cot.value = 'full'; if (!scoreGiven.value) abcSampling.temperature = 0.55 },
  same: () => { randomSeed.value = true },
  final: () => { setQuality('final') },
}
/** The tab where a fix shows, so the change is in view once the help closes. */
const FIX_TABS: Record<string, (typeof FORM_TABS)[number]> = {
  cutoff: 'song', offbrief: 'song', final: 'song', melody: 'melody', loop: 'tuning', offkey: 'tuning',
}
function applyHelpFix(id: string) {
  HELP_FIXES[id]?.()
  if (FIX_TABS[id]) formTab.value = FIX_TABS[id]
  // a fix the simple choices cannot show is shown where every value is in view
  if (FIX_TABS[id] === 'tuning' && PERF_ROWS.some((row) => perfActive(row) === null)) tuningMode.value = 'manual'
  helpOpen.value = null
}
// The engine default as a number, for the min/max-tokens cross-check when one side is left empty.
const YUE2_DEFAULTS_NUM = (group: string, key: string) =>
  Number(group === t('yueGen.abcPlannerSampling') ? YUE2_DEFAULTS.abc[key] : YUE2_DEFAULTS.semantic[key])

watch(
  () => store.pendingAbcInsert,
  (val) => {
    if (!val) return
    abc.value = val
    if (cot.value === 'off') cot.value = 'melody'
    formTab.value = 'melody'
    store.clearPendingAbcInsert()
  },
  // a score sent from another page (the MIDI panel of an ACE-Step track) is waiting when this form mounts
  { immediate: true },
)

/** "From a song...": picking the file starts the extraction, no separate button. */
const songFile = ref<HTMLInputElement | null>(null)
function onSongPicked(e: Event) {
  const input = e.target as HTMLInputElement
  coverFile.value = input.files?.[0] ?? null
  input.value = ''
  if (coverFile.value) void extractAbc()
}

async function extractAbc() {
  if (!coverFile.value) return
  coverError.value = ''
  extracting.value = true
  coverStatus.value = t('yueGen.loadingSheetSage')
  try {
    const sheetSage = await api.getSheetSageModelSpec()
    await api.ensureLoaded(sheetSage)
    coverStatus.value = t('yueGen.uploadingAudio')
    const path = await api.uploadFile(coverFile.value)
    coverStatus.value = t('yueGen.recognizingMelody')
    const result = await api.runTask(sheetSage.id, { audio: path, options: {} })
    const extracted = api.abcFromResult(result)
    if (!extracted.trim()) throw new Error(t('yueGen.noAbcReturned'))
    if (extracted !== abc.value) ws.formEditor().expectNewSong()
    abc.value = extracted
    if (cot.value === 'off') cot.value = 'melody'
    coverStatus.value = t('yueGen.abcExtracted')
  } catch (err) {
    coverStatus.value = ''
    coverError.value = err instanceof Error ? err.message : String(err)
  } finally {
    if (unloadSheetSage.value) {
      try {
        const sheetSage = await api.getSheetSageModelSpec()
        await api.unloadModelId(sheetSage.id)
      } catch {
        // best-effort VRAM cleanup - a failed unload isn't user-actionable here
      }
    }
    extracting.value = false
  }
}

// ---- Manual tuning: every parameter in groups, the simple choices as each group's quick presets ----
const TUNING_MODE_KEY = 'remiqora_yue2_tuning_mode'
const readTuningMode = (): 'simple' | 'manual' => { try { return localStorage.getItem(TUNING_MODE_KEY) === 'manual' ? 'manual' : 'simple' } catch { return 'simple' } }
const tuningMode = ref<'simple' | 'manual'>(readTuningMode())
watch(tuningMode, (m) => { try { localStorage.setItem(TUNING_MODE_KEY, m) } catch { /* private window */ } })
const clock = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, '0')}`
type SliderShape = Pick<ParamSlider, 'min' | 'max' | 'step' | 'note'>
// The sliders' ranges cover the values that make sense; the number field takes anything the engine accepts.
const SEMANTIC_SHAPES: Record<string, SliderShape> = {
  temperature: { min: 0.01, max: 2, step: 0.05 },
  top_p: { min: 0.05, max: 1, step: 0.01 },
  top_k: { min: 1, max: 200, step: 1 },
  repetition_penalty: { min: 1, max: 2, step: 0.01 },
  penalty_window: { min: 1, max: 200, step: 1, note: (v) => t('yueGen.manual.seconds', { n: (v / TOKENS_PER_SECOND).toFixed(1) }) },
  min_tokens: { min: 0, max: 12000, step: 25, note: (v) => clock(v / TOKENS_PER_SECOND) },
  max_tokens: { min: 250, max: 15000, step: 250, note: (v) => clock(v / TOKENS_PER_SECOND) },
}
const ABC_SHAPES: Record<string, SliderShape> = {
  temperature: { min: 0.01, max: 2, step: 0.05 },
  top_p: { min: 0.05, max: 1, step: 0.01 },
  top_k: { min: 1, max: 200, step: 1 },
  repetition_penalty: { min: 1, max: 1.5, step: 0.005 },
  penalty_window: { min: 1, max: 200, step: 1 },
  min_tokens: { min: 0, max: 4096, step: 16 },
  max_tokens: { min: 32, max: 4096, step: 32 },
}
function samplingRow(target: PerfTarget, key: string): ParamSlider {
  const store = perfStore(target)
  return {
    kind: 'slider', id: `${target}_${key}`, label: t(`yueGen.manual.params.${key}`), tech: `${target}_${key}`,
    value: num(store[key]), def: perfDefault(target, key), ...(target === 'abc' ? ABC_SHAPES : SEMANTIC_SHAPES)[key],
    set: (v) => { store[key] = v },
  }
}
function perfQuick(rowId: string): ParamQuick {
  const row = PERF_ROWS.find((r) => r.id === rowId)!
  return {
    options: row.options.map((o) => ({ id: o.id, label: t(`yueGen.perf.${rowId}.options.${o.id}`) })),
    active: perfActive(row),
    pick: (id) => perfSet(row, row.options.find((o) => o.id === id)!),
  }
}
const manualGroups = computed<ParamGroupSpec[]>(() => {
  const g = (id: string) => ({ id, title: t(`yueGen.manual.groups.${id}.title`), sub: t(`yueGen.manual.groups.${id}.sub`) })
  const groups: ParamGroupSpec[] = [
    {
      ...g('sound'), column: 0,
      quick: {
        options: qualityOptions.value.filter((q) => q !== 'own').map((q) => ({ id: q, label: t(`yueGen.qualityNames.${q}`) })),
        active: quality.value === 'own' ? null : quality.value,
        pick: (id) => setQuality(id as Quality),
      },
      rows: [
        { kind: 'select', id: 'precision', label: t('yueGen.manual.params.precision'), tech: 'precision', value: precision.value, def: qualityPresets.value.normal.precision,
          options: precisions.value.map((x) => ({ value: x, label: x })), set: (v) => { precision.value = v as typeof precision.value } },
        { kind: 'slider', id: 'steps', label: t('yueGen.manual.params.steps'), tech: 'num_inference_steps', value: num(numInferenceSteps.value), def: Number(YUE2_DEFAULTS.numInferenceSteps),
          min: 1, max: 48, step: 1, set: (v) => { numInferenceSteps.value = v } },
        { kind: 'slider', id: 'cfg', label: t('yueGen.manual.params.cfg'), tech: 'cfg_scale', value: num(cfgScale.value), def: Number(YUE2_DEFAULTS.cfgScale[cot.value]),
          min: 0, max: 3, step: 0.01, set: (v) => { cfgScale.value = v } },
      ],
    },
    { ...g('character'), column: 0, quick: perfQuick('temperature'), rows: ['temperature', 'top_p', 'top_k'].map((k) => samplingRow('semantic', k)) },
    { ...g('repeats'), column: 0, quick: perfQuick('repeats'), rows: ['repetition_penalty', 'penalty_window'].map((k) => samplingRow('semantic', k)) },
    {
      ...g('length'), column: 1,
      quick: {
        options: LENGTHS.map((m) => ({ id: String(m), label: m === 0 ? t('yueGen.length.auto') : t('yueGen.length.minutes', { n: m }) })),
        active: songLength.value == null ? null : String(songLength.value),
        pick: (id) => setLength(Number(id)),
      },
      rows: ['min_tokens', 'max_tokens'].map((k) => samplingRow('semantic', k)),
    },
  ]
  if (cot.value !== 'off' && !scoreGiven.value) groups.push({ ...g('score'), column: 1, quick: perfQuick('score'), rows: SAMPLING_FIELDS.map((f) => samplingRow('abc', f.key)) })
  return groups
})
const manualRows = computed(() => manualGroups.value.flatMap((x) => x.rows))
const manualChanged = computed(() => manualRows.value.filter(rowChanged).length)
// Reset puts back the tuning rows only: the Sound group (precision, steps, CFG) is the Quality choice of the Song tab
const tuningRows = computed(() => manualGroups.value.filter((g) => g.id !== 'sound').flatMap((x) => x.rows))
const tuningChanged = computed(() => tuningRows.value.filter(rowChanged).length)
function resetManual() {
  for (const r of tuningRows.value) resetRow(r)
}
/** The console: all the groups at once in a window, with what the request will carry. */
const consoleOpen = ref(false)
const requestLine = computed(() => {
  const o = buildOptions()
  const parts: { k: string; v: string; set: boolean }[] = [{ k: 'cot', v: cot.value, set: false }, { k: 'precision', v: precision.value, set: precision.value !== qualityPresets.value.normal.precision }]
  for (const [k, v] of Object.entries(o)) if (!['style', 'cot', 'abc'].includes(k)) parts.push({ k, v: String(v), set: true })
  if (o.abc) parts.push({ k: 'abc', v: t('yueGen.manual.abcGiven'), set: false })
  parts.push({ k: 'seed', v: randomSeed.value ? t('yueGen.manual.seedRandom') : String(seed.value), set: false })
  return parts
})

function buildOptions(): GenerateOptions {
  const options: GenerateOptions = { style: style.value.trim(), cot: cot.value }
  const cfg = num(cfgScale.value)
  if (cfg != null) options.cfg_scale = cfg
  const steps = num(numInferenceSteps.value)
  if (steps != null) options.num_inference_steps = steps
  for (const f of SAMPLING_FIELDS) {
    const v = num(semantic[f.key])
    if (v != null) options[`semantic_${f.key}`] = v
  }
  if (cot.value !== 'off') {
    if (scoreGiven.value) options.abc = abc.value.trim()
    else {
      for (const f of SAMPLING_FIELDS) {
        const v = num(abcSampling[f.key])
        if (v != null) options[`abc_${f.key}`] = v
      }
    }
  }
  return options
}

// Create works while the engine is stopped: the backend's queue starts it for the takes.
const { createLabel } = useEngineStart('yue2')

// ---- The lyrics: section tags in one click, and how much there is ----
const lyricsEl = ref<HTMLTextAreaElement | null>(null)

// ---- The line being edited in the workspace's simple view, lit in the lyrics (while the Song tab shows) ----
// A textarea cannot colour a line, so a band is laid over it: a hidden copy of the field with the same width and
// font says where the line starts and how tall it is once wrapped. The field scrolls to the line unless it is
// being typed in.
const notesView = useNotesView()
const lyricLine = computed<number | null>(() => {
  if (!notesView.isOpen.value || ws.mode !== 'form' || formTab.value !== 'song') return null
  const ui = ws.editor?.ui
  const want = ui?.view === 'simple' ? ui.simpleLine : null
  if (!want) return null
  const norm = (x: string) => x.replace(/\s+/g, ' ').trim().toLocaleLowerCase()
  const text = norm(want.text)
  const lines = lyrics.value.split('\n')
  let seen = 0
  let first: number | null = null
  for (let i = 0; i < lines.length; i++) {
    if (norm(lines[i]) !== text) continue
    if (first == null) first = i
    if (seen++ === want.nth) return i
  }
  return first
})
const lyricBand = ref<{ top: number; height: number } | null>(null)
let mirror: HTMLDivElement | null = null
function measureLine(el: HTMLTextAreaElement, index: number): { top: number; height: number } {
  if (!mirror) {
    mirror = document.createElement('div')
    mirror.setAttribute('aria-hidden', 'true')
    document.body.appendChild(mirror)
  }
  const cs = getComputedStyle(el)
  Object.assign(mirror.style, {
    position: 'absolute', visibility: 'hidden', top: '0', left: '-9999px', overflow: 'hidden',
    whiteSpace: 'pre-wrap', overflowWrap: 'break-word', boxSizing: cs.boxSizing,
    width: `${el.clientWidth}px`, padding: cs.padding, border: '0', font: cs.font, lineHeight: cs.lineHeight, letterSpacing: cs.letterSpacing, tabSize: cs.tabSize,
  })
  const lines = el.value.split('\n')
  mirror.textContent = ''
  mirror.append(document.createTextNode(lines.slice(0, index).join('\n') + (index ? '\n' : '')))
  const span = document.createElement('span')
  span.textContent = lines[index] || '​'
  mirror.append(span)
  return { top: span.offsetTop, height: span.offsetHeight }
}
function placeLyricBand(scrollTo = false): void {
  const el = lyricsEl.value
  const i = lyricLine.value
  if (!el || i == null || !el.offsetParent) { lyricBand.value = null; return }
  const m = measureLine(el, i)
  if (scrollTo && document.activeElement !== el && (m.top < el.scrollTop || m.top + m.height > el.scrollTop + el.clientHeight)) {
    el.scrollTop = Math.max(0, m.top - el.clientHeight / 3)
  }
  const top = m.top - el.scrollTop
  // only while the line is inside the field's box
  lyricBand.value = top + m.height <= 0 || top >= el.clientHeight ? null : { top: Math.max(0, top), height: Math.min(m.height, el.clientHeight - Math.max(0, top)) }
}
watch(lyricLine, () => void nextTick(() => placeLyricBand(true)))
watch(lyrics, () => void nextTick(() => placeLyricBand()))
let lyricsRo: ResizeObserver | null = null
onMounted(() => {
  if (lyricsEl.value) { lyricsRo = new ResizeObserver(() => placeLyricBand()); lyricsRo.observe(lyricsEl.value) }
})
onBeforeUnmount(() => { lyricsRo?.disconnect(); mirror?.remove(); mirror = null })
const SECTIONS = [['verse', '[Verse]'], ['chorus', '[Chorus]'], ['bridge', '[Bridge]'], ['outro', '[Outro]']] as const
function addSection(tag: string) {
  const text = lyrics.value.replace(/\s+$/, '')
  lyrics.value = `${text}${text ? '\n\n' : ''}${tag}\n`
  void nextTick(() => {
    const el = lyricsEl.value
    if (!el) return
    el.focus()
    el.setSelectionRange(el.value.length, el.value.length)
    el.scrollTop = el.scrollHeight
  })
}
/** Sung lines: not empty, not a section tag. */
const sungLines = (text: string): number => text.split(/\r?\n/).filter((l) => l.trim() && !/^\s*\[.*\]\s*$/.test(l)).length
/**
 * Seconds a sung line took in the songs made here so far (the median), once there are enough of them: the only
 * honest basis for "about how long". Songs with a chosen length are counted too; the spread is in the median.
 */
const secondsPerLine = computed(() => {
  const xs = store.jobs
    .filter((j) => j.status === 'done' && j.durationSec && sungLines(j.lyrics) >= 4)
    .map((j) => (j.durationSec as number) / sungLines(j.lyrics))
    .sort((a, b) => a - b)
  return xs.length >= 5 ? xs[Math.floor(xs.length / 2)] : null
})
const lyricsInfo = computed(() => {
  const n = sungLines(lyrics.value)
  if (!n) return { text: '', hint: '' }
  // the estimate is for the "auto" length: a chosen length decides by itself
  if (songLength.value !== 0 || secondsPerLine.value == null) return { text: t('yueGen.lines', { n }), hint: '' }
  return { text: t('yueGen.linesAbout', { n, time: clock(n * secondsPerLine.value) }), hint: t('yueGen.linesAboutHint', { s: secondsPerLine.value.toFixed(1) }) }
})

/** The status line's link: to the session list below the form (CreatePage's `create-session`). */
function toSession() {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  document.getElementById('create-session')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

// ---- A failed check takes the user to the field: its tab, focus, aria-invalid and the error as its description ----
const ERROR_ID = 'yue-form-error'
let invalidEl: HTMLElement | null = null
let invalidDesc: string | null = null // what the field was already described by (the lyrics hint)
function clearInvalid() {
  invalidEl?.removeAttribute('aria-invalid')
  if (invalidDesc) invalidEl?.setAttribute('aria-describedby', invalidDesc)
  else invalidEl?.removeAttribute('aria-describedby')
  invalidEl = null
  invalidDesc = null
}
function fail(f: FormFail) {
  clearInvalid()
  formError.value = f.msg
  formTab.value = f.tab
  // a tuning row is only there in the manual mode
  if (f.tab === 'tuning' && f.sel.startsWith('[data-group')) tuningMode.value = 'manual'
  void nextTick(() => {
    const hit = document.querySelector<HTMLElement>(f.sel)
    // the style field is a component: its input is inside the element the id sits on
    const el = hit?.matches('input,textarea,select') ? hit : hit?.querySelector<HTMLElement>('input,textarea,select')
    if (!el) return
    el.setAttribute('aria-invalid', 'true')
    invalidDesc = el.getAttribute('aria-describedby')
    el.setAttribute('aria-describedby', [invalidDesc, ERROR_ID].filter(Boolean).join(' '))
    invalidEl = el
    el.focus()
  })
}
// editing anything takes the mark and the message off
watch(() => [lyrics.value, style.value, seed.value, randomSeed.value, cfgScale.value, numInferenceSteps.value, JSON.stringify(semantic), JSON.stringify(abcSampling)], () => {
  if (!invalidEl) return
  clearInvalid()
  formError.value = ''
})

async function submit() {
  formError.value = ''
  clearInvalid()
  if (!lyrics.value.trim()) return fail({ msg: t('yueGen.enterLyrics'), tab: 'song', sel: '#yue-lyrics' })
  if (!style.value.trim()) return fail({ msg: t('yueGen.enterStyle'), tab: 'song', sel: '#yue-style' })
  const invalid = rangeError()
  if (invalid) return fail(invalid)
  submitting.value = true
  try {
    // the takes go to the backend's queue, which starts YuE2 when it is their turn; the form stays as it was filled in
    await store.generateBatch({
      lyrics: lyrics.value.trim(),
      style: style.value.trim(),
      cot: cot.value,
      precision: precision.value,
      baseSeed: Number.isFinite(seed.value) ? seed.value : 831001,
      randomSeed: randomSeed.value,
      batchSize: batchSize.value,
      options: buildOptions(),
      title: defaultTitle({ lyrics: lyrics.value, style: style.value }),
    })
    justCreated.value = true
  } catch (err) {
    formError.value = err instanceof Error ? err.message : String(err)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
    <div class="flex flex-col rounded-xl border border-border bg-panel lg:min-h-0 lg:flex-1">
      <!-- Tabs: what is changed every time first; a dot marks a tab whose settings are not the defaults -->
      <div class="flex shrink-0 gap-1 border-b border-border px-3 pt-2.5">
        <!-- the tablist holds only the tabs (the presets menu beside it is not a tab); arrow keys move between them -->
        <div v-roving class="flex gap-1" role="tablist">
        <button
          v-for="tab in FORM_TABS" :id="`yue-tab-${tab}`" :key="tab" type="button" role="tab" :aria-selected="formTab === tab" :aria-controls="`yue-panel-${tab}`"
          class="relative -mb-px inline-flex items-center gap-1.5 rounded-t-lg border-b-2 px-3 py-2.5 text-[13px] transition-colors"
          :class="formTab === tab ? 'border-accent1 font-medium text-text' : 'border-transparent text-text-dim hover:text-text'"
          @click="formTab = tab"
        >
          <component :is="TAB_ICONS[tab]" class="hidden h-4 w-4 sm:block" />{{ t(`yueGen.tabs.${tab}`) }}
          <span v-if="tabChanged[tab]" class="h-1.5 w-1.5 rounded-full bg-accent2" aria-hidden="true"></span>
          <span v-if="tabChanged[tab]" class="sr-only">{{ t('yueGen.tabs.changed') }}</span>
        </button>
        </div>
        <!-- the presets: a menu at the end of the row of tabs -->
        <PresetMenu
          class="mb-1.5 ms-auto self-center" :presets="presets" :selected="selectedPresetName"
          @apply="(name) => { selectedPresetName = name; applyPreset(name) }" @save="(name) => { newPresetName = name; saveCurrentPreset() }" @remove="deletePreset"
        />
      </div>
      <!-- Everything that shapes the song; scrolls inside the panel on a desktop -->
      <div class="min-h-0 flex-1 overflow-y-auto p-4">
      <div v-show="formTab === 'song'" id="yue-panel-song" role="tabpanel" aria-labelledby="yue-tab-song" class="space-y-4">
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <label for="yue-lyrics" class="text-[13px] font-medium text-text">{{ t('aceGen.lyricsLabel') }}</label>
          <span class="ms-auto me-2 text-xs tabular-nums text-text-dim">{{ lyricsInfo.text }}</span>
          <HelpIconButton :topic="t('aceGen.lyricsLabel')" @click="helpOpen = 'lyrics'" />
        </div>
        <!-- the line being edited in the workspace's simple view is lit here (a band over the text, it takes no clicks) -->
        <div class="relative">
        <textarea id="yue-lyrics" ref="lyricsEl" v-model="lyrics" rows="14" :class="{ 'idea-flash': flash.lyrics }" :aria-describedby="lyricsInfo.hint ? 'yue-lyrics-hint' : undefined" class="block min-h-48 w-full resize-y rounded-lg border border-border bg-panel-2 p-2.5 font-mono text-sm leading-relaxed text-text" :placeholder="t('aceGen.lyricsPlaceholder')" @scroll="placeLyricBand()"></textarea>
        <div v-if="lyricBand" class="pointer-events-none absolute inset-x-px rounded-sm border-s-2 border-accent1 bg-accent1/15" :style="{ top: `${lyricBand.top}px`, height: `${lyricBand.height}px` }" aria-hidden="true"></div>
        </div>
        <!-- how the estimate was made: text under the field, not a tooltip nobody can reach -->
        <p v-if="lyricsInfo.hint" id="yue-lyrics-hint" class="text-xs text-text-dim">{{ lyricsInfo.hint }}</p>
        <!-- a section tag at the end of the text, on a line of its own -->
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="[id, tag] in SECTIONS" :key="id" type="button" :title="tag"
            class="min-h-6 rounded-full border border-border px-2.5 py-1 text-xs text-text-dim transition-colors hover:border-accent1/50 hover:text-text" @click="addSection(tag)"
          >{{ t(`yueGen.sections.${id}`) }}</button>
        </div>
      </div>

      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <label id="yue-style-label" for="yue-style" class="text-[13px] font-medium text-text">{{ t('aceGen.styleLabel') }}</label>
          <HelpIconButton :topic="t('aceGen.styleLabel')" @click="helpOpen = 'style'" />
        </div>
        <TagInput id="yue-style" v-model="style" :class="{ 'idea-flash': flash.style }" :placeholder="t('aceGen.stylePlaceholder')" />
      </div>

      <div class="space-y-1.5">
        <label class="inline-flex items-center gap-1.5 text-[13px] font-medium text-text"><ClockIcon class="h-4 w-4 text-text-dim" />{{ t('yueGen.length.label') }}</label>
        <div v-roving class="grid grid-cols-7 overflow-hidden rounded-lg border border-border text-xs" role="radiogroup" :aria-label="t('yueGen.length.label')">
          <button
            v-for="m in LENGTHS" :key="m" type="button" role="radio" :aria-checked="songLength === m"
            class="px-1 py-2 tabular-nums transition-colors" :class="songLength === m ? 'bg-accent1/20 font-medium text-text' : 'text-text-dim hover:bg-panel-2 hover:text-text'"
            @click="setLength(m)"
          >{{ m === 0 ? t('yueGen.length.auto') : t('yueGen.length.minutes', { n: m }) }}</button>
        </div>
        <p class="text-xs text-text-dim">{{ songLength === 0 ? t('yueGen.length.autoHint') : songLength ? t('yueGen.length.hint', { n: songLength }) : t('yueGen.length.ownHint') }}</p>
      </div>

      <div class="space-y-1.5">
        <label class="text-[13px] font-medium text-text">{{ t('yueGen.qualityLabel') }}</label>
        <div class="grid overflow-hidden rounded-lg border border-border text-xs" :class="qualityOptions.length === 4 ? 'grid-cols-4' : 'grid-cols-3'" v-roving role="radiogroup" :aria-label="t('yueGen.qualityLabel')">
          <button
            v-for="q in qualityOptions" :key="q" type="button" role="radio" :aria-checked="quality === q"
            class="px-2 py-2 transition-colors" :class="quality === q ? 'bg-accent1/20 font-medium text-text' : 'text-text-dim hover:bg-panel-2 hover:text-text'"
            @click="setQuality(q)"
          >{{ t(`yueGen.qualityNames.${q}`) }}</button>
        </div>
        <p class="text-xs text-text-dim">{{ qualityHint }}</p>
        <div v-if="quality === 'own'" class="grid grid-cols-3 gap-2 rounded-lg border border-border bg-panel-2/40 p-2.5">
          <div>
            <label for="yue-precision" class="text-xs font-medium text-text">{{ t('yueGen.precisionLabel') }}</label>
            <select id="yue-precision" v-model="precision" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text">
              <option v-for="p in precisions" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
          <div>
            <label for="yue-steps" class="text-xs font-medium text-text">{{ t('aceGen.inferenceSteps') }}</label>
            <input id="yue-steps" v-model.number="numInferenceSteps" type="number" :step="STEPS_FIELD.step" :min="STEPS_FIELD.min" :title="rangeLabel(STEPS_FIELD)" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text" :placeholder="YUE2_DEFAULTS.numInferenceSteps" />
          </div>
          <div>
            <label for="yue-cfg" class="text-xs font-medium text-text">{{ t('yueGen.cfgScale') }}</label>
            <input id="yue-cfg" v-model.number="cfgScale" type="number" :step="CFG_FIELD.step" :min="CFG_FIELD.min" :max="CFG_FIELD.max" :title="rangeLabel(CFG_FIELD)" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text" :placeholder="YUE2_DEFAULTS.cfgScale[cot]" />
          </div>
        </div>
      </div>
      </div>

      <div v-show="formTab === 'melody'" id="yue-panel-melody" role="tabpanel" aria-labelledby="yue-tab-melody" class="space-y-4">
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <label class="text-[13px] font-medium text-text">{{ t('yueGen.planLabel') }}</label>
          <HelpIconButton :topic="t('yueGen.planLabel')" @click="helpOpen = 'cot'" />
        </div>
        <div v-roving class="grid grid-cols-3 overflow-hidden rounded-lg border border-border text-xs" role="radiogroup" :aria-label="t('yueGen.planLabel')">
          <button
            v-for="o in COT_OPTIONS" :key="o.value" type="button" role="radio" :aria-checked="cot === o.value"
            class="px-2 py-2 transition-colors" :class="cot === o.value ? 'bg-accent1/20 font-medium text-text' : 'text-text-dim hover:bg-panel-2 hover:text-text'"
            @click="cot = o.value"
          >{{ t(`yueGen.planNames.${o.value}`) }}</button>
        </div>
        <p class="text-xs text-text-dim">{{ planHint }}</p>
      </div>

      <!-- the score as a card; it is edited in "Notes" beside the form -->
      <template v-if="cot !== 'off'">
        <ScoreCard :extracting="extracting" @from-song="songFile?.click()" />
        <p v-if="coverStatus" class="text-xs text-text-dim" role="status">{{ coverStatus }}</p>
        <p v-if="coverError" class="rounded-lg bg-status-failed/10 p-2 text-xs text-status-failed">{{ coverError }}</p>
        <label class="flex items-center gap-2 text-xs text-text-dim">
          <input v-model="unloadSheetSage" type="checkbox" class="rounded border-border" />
          {{ t('yueGen.unloadSheetSage') }}
        </label>
      </template>
      <!-- outside the card: "From a song..." in the workspace uses it with the plan off too -->
      <input ref="songFile" type="file" accept="audio/*" class="hidden" @change="onSongPicked" />
      </div>

      <div v-show="formTab === 'tuning'" id="yue-panel-tuning" role="tabpanel" aria-labelledby="yue-tab-tuning" class="space-y-5">
      <div class="flex flex-wrap items-center gap-2">
        <div v-roving class="inline-flex overflow-hidden rounded-lg border border-border text-xs" role="radiogroup" :aria-label="t('yueGen.tuningTitle')">
          <button
            v-for="m in (['simple', 'manual'] as const)" :key="m" type="button" role="radio" :aria-checked="tuningMode === m"
            class="px-3 py-1.5 transition-colors" :class="tuningMode === m ? 'bg-accent1/20 font-medium text-text' : 'text-text-dim hover:bg-panel-2 hover:text-text'"
            @click="tuningMode = m"
          >{{ t(`yueGen.manual.${m}`) }}</button>
        </div>
        <HelpIconButton :topic="t('yueGen.tuningTitle')" @click="helpOpen = 'advanced'" />
        <!-- Reset in Simple too: a help fix (a cut-off song's max tokens) changes rows Simple does not show -->
        <span class="ms-auto text-xs text-text-dim">{{ t('yueGen.manual.changed', { n: tuningChanged, total: tuningRows.length }) }}</span>
        <button type="button" class="min-h-6 rounded-lg border border-border px-2 py-1 text-xs text-text-dim hover:text-text disabled:opacity-40" :disabled="!tuningChanged" @click="resetManual">{{ t('yueGen.manual.reset') }}</button>
        <button v-if="tuningMode === 'manual'" type="button" class="min-h-6 min-w-6 rounded-lg border border-border px-2 py-1 text-xs text-text-dim hover:text-text" :title="t('yueGen.manual.console')" :aria-label="t('yueGen.manual.console')" @click="consoleOpen = true">⤢</button>
      </div>
      <div v-if="tuningMode === 'simple'" class="space-y-3">
        <div v-for="row in PERF_ROWS" v-show="row.target !== 'abc' || (cot !== 'off' && !scoreGiven)" :key="row.id" class="space-y-1">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-[13px] font-medium text-text">{{ t(`yueGen.perf.${row.id}.label`) }}</span>
            <div v-roving class="inline-flex overflow-hidden rounded-lg border border-border text-xs" role="radiogroup" :aria-label="t(`yueGen.perf.${row.id}.label`)">
              <button
                v-for="o in row.options" :key="o.id" type="button" role="radio" :aria-checked="perfActive(row) === o.id"
                class="px-2.5 py-1.5 transition-colors" :class="perfActive(row) === o.id ? 'bg-accent1/20 font-medium text-text' : 'text-text-dim hover:bg-panel-2 hover:text-text'"
                @click="perfSet(row, o)"
              >{{ t(`yueGen.perf.${row.id}.options.${o.id}`) }}</button>
            </div>
          </div>
          <p class="text-xs text-text-dim">{{ t(`yueGen.perf.${row.id}.hint`) }}<template v-if="perfActive(row) === null">{{ ' ' + t('yueGen.perf.manualNow') }}</template></p>
        </div>
      </div>
      <ParamGroups v-else :groups="manualGroups" />
      <p v-if="scoreGiven && cot !== 'off'" class="text-xs text-text-dim">{{ t('yueGen.scoreGivenNote') }}</p>
      </div>
      </div>

      <!-- Always in view: how many takes, the seed, and Create -->
      <!-- on a phone it sticks to the bottom of the screen with a solid background, so Create is always in reach -->
      <div class="sticky bottom-0 z-10 shrink-0 space-y-2.5 rounded-b-xl border-t border-border bg-panel-2 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 lg:static lg:bg-panel-2/60">
        <p v-if="formError" :id="ERROR_ID" role="alert" class="rounded-lg bg-status-failed/10 p-2 text-xs text-status-failed">{{ formError }}</p>
        <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs">
          <div class="flex items-center gap-2">
            <span class="text-text-dim">{{ t('yueGen.takes') }}</span>
            <div v-roving class="inline-flex overflow-hidden rounded-lg border border-border" role="radiogroup" :aria-label="t('yueGen.takes')">
              <button
                v-for="n in [1, 2, 3, 4] as const" :key="n" type="button" role="radio" :aria-checked="batchSize === n"
                class="min-w-8 px-2 py-1.5 tabular-nums" :class="batchSize === n ? 'bg-accent1/20 font-medium text-text' : 'text-text-dim hover:bg-panel-2'"
                @click="batchSize = n"
              >{{ n }}</button>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <label for="yue-seed" class="text-text-dim">{{ t('aceGen.seed') }}</label>
            <input id="yue-seed" v-model.number="seed" type="number" min="0" max="2147483647" step="1" :disabled="randomSeed" class="w-28 rounded-lg border border-border bg-panel-2 px-2 py-1.5 text-xs tabular-nums text-text disabled:opacity-40" />
            <button
              type="button" class="min-h-6 min-w-6 rounded-lg border px-2 py-1.5" :class="randomSeed ? 'border-accent1/60 bg-accent1/15 text-text' : 'border-border text-text-dim hover:text-text'"
              :aria-pressed="randomSeed" :title="t('yueGen.randomSeed')" :aria-label="t('yueGen.randomSeed')" @click="randomSeed = !randomSeed"
            >🎲</button>
          </div>
        </div>
        <MakeCoverOption />
        <div class="flex items-center">
          <button type="button" class="accent-gradient min-w-0 flex-1 rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-50" :disabled="submitting" @click="submit">
            {{ submitting ? t('yueGen.submitting') : createLabel(t('yueGen.submit')) }}<span v-if="!submitting && batchSize > 1" class="ms-1.5 font-normal">× {{ batchSize }}</span>
          </button>
          <!-- after Create: how many takes wait, as a link to the session list (visible on a phone, where the list is below) -->
          <p role="status" class="shrink-0 text-xs lg:sr-only">
            <a v-if="justCreated && queuedTakes" href="#create-session" class="ms-3 inline-flex min-h-6 items-center text-accent1 underline" @click.prevent="toSession">{{ t('yueGen.queued', { n: queuedTakes }) }}</a>
          </p>
        </div>
      </div>
    </div>

    <ParamConsole
      :open="consoleOpen" :title="t('yueGen.manual.consoleTitle')" :groups="manualGroups" :changed="manualChanged" :total="manualRows.length"
      :request="requestLine" :note="t('yueGen.manual.sendsRest')" @close="consoleOpen = false" @reset="resetManual"
    />

    <!-- The help windows, in the editor guide's look (HelpBody, HelpSection, HelpTable) -->
    <HelpModal :open="helpOpen === 'style'" :title="t('yueGen.help.style.title')" wide @close="helpOpen = null">
      <HelpBody :lead="t('yueGen.help.style.intro')">
        <HelpTable
          :columns="[{ key: 'dim', label: t('yueGen.help.style.dimHeader'), nowrap: true }, { key: 'examples', label: t('yueGen.help.style.examplesHeader') }]"
          :rows="tm('yueGen.help.style.rows') as { dim: string; examples: string }[]"
        />
        <HelpSection :title="t('yueGen.help.style.tipsTitle')" tone="tips">
          <HelpList :items="tm('yueGen.help.style.tips') as string[]" />
        </HelpSection>
        <HelpSection :title="t('yueGen.help.style.examplesTitle')">
          <HelpExamples :items="helpStyleExamples" mono pickable @pick="useStyleExample" />
        </HelpSection>
      </HelpBody>
    </HelpModal>
    <HelpModal :open="helpOpen === 'lyrics'" :title="t('yueGen.help.lyrics.title')" wide @close="helpOpen = null">
      <HelpBody :lead="t('yueGen.help.lyrics.intro')">
        <HelpTable
          :columns="[{ key: 'tag', label: t('yueGen.help.lyrics.tagHeader'), mono: true, nowrap: true }, { key: 'purpose', label: t('yueGen.help.lyrics.purposeHeader') }]"
          :rows="tm('yueGen.help.lyrics.rows') as { tag: string; purpose: string }[]"
        />
        <HelpSection :title="t('yueGen.help.lyrics.tipsTitle')" tone="tips">
          <HelpList :items="tm('yueGen.help.lyrics.tips') as string[]" />
        </HelpSection>
        <HelpSection :title="t('yueGen.help.lyrics.exampleTitle')">
          <HelpExamples :items="[{ text: t('yueGen.help.lyrics.example') }]" mono pickable @pick="useLyricsExample" />
        </HelpSection>
      </HelpBody>
    </HelpModal>
    <HelpModal :open="helpOpen === 'cot'" :title="t('yueGen.help.cot.title')" wide @close="helpOpen = null">
      <HelpBody :lead="t('yueGen.help.cot.intro')">
        <HelpTable
          :columns="[{ key: 'mode', label: t('yueGen.help.cot.modeHeader'), nowrap: true }, { key: 'when', label: t('yueGen.help.cot.whenHeader') }]"
          :rows="cotHelpRows"
          :current="(r) => r.key === cot"
        />
        <HelpSection tone="note">
          <p>{{ t('yueGen.help.cot.precisionNote') }}</p>
        </HelpSection>
        <HelpSection :title="t('yueGen.help.cot.abcTitle')" :intro="t('yueGen.help.cot.abcIntro')">
          <HelpTable :columns="[{ key: 'tag', mono: true, nowrap: true }, { key: 'purpose' }]" :rows="tm('yueGen.help.cot.abcRows') as { tag: string; purpose: string }[]" />
          <p class="mt-2 text-xs">{{ t('yueGen.help.cot.abcFooter') }}</p>
        </HelpSection>
      </HelpBody>
    </HelpModal>
    <HelpModal :open="helpOpen === 'melody'" :title="t('yueGen.help.melody.title')" wide @close="helpOpen = null">
      <HelpBody :lead="t('yueGen.help.melody.lead')">
        <HelpSection :title="t('yueGen.help.melody.sourcesTitle')">
          <HelpList :items="tm('yueGen.help.melody.sources') as string[]" ordered />
        </HelpSection>
        <HelpSection :title="t('yueGen.help.melody.tipsTitle')" tone="tips">
          <HelpList :items="tm('yueGen.help.melody.tips') as string[]" />
        </HelpSection>
        <HelpSection :title="t('yueGen.help.melody.rollTitle')">
          <HelpList :items="tm('yueGen.help.melody.roll') as string[]" />
        </HelpSection>
      </HelpBody>
    </HelpModal>
    <!-- Same look as the app's main help (AppHelpModal): lead, numbered cards, bordered cards, tinted tips box -->
    <HelpModal :open="helpOpen === 'advanced'" :title="t('yueGen.help.advanced.title')" wide @close="helpOpen = null">
      <div class="space-y-7">
        <p class="text-[15px] leading-relaxed text-text">{{ t('yueGen.help.advanced.lead') }}</p>

        <HelpSection :title="t('yueGen.help.advanced.choicesTitle')" :intro="t('yueGen.help.advanced.choicesIntro')">
          <HelpList :items="tm('yueGen.help.advanced.choices') as string[]" />
        </HelpSection>

        <!-- Symptom → one-click fix. Comes first: this is what people open the help for. -->
        <section>
          <h4 class="mb-2.5 text-sm font-semibold text-text">{{ t('yueGen.help.advanced.fixesTitle') }}</h4>
          <div class="grid gap-3 sm:grid-cols-2">
            <div v-for="x in (tm('yueGen.help.advanced.fixes') as { id: string; problem: string; fix: string }[])" :key="x.id" class="flex gap-3 rounded-lg border border-accent1/25 bg-accent1/[0.06] p-3">
              <div class="min-w-0 flex-1">
                <p class="font-medium text-text">{{ x.problem }}</p>
                <p class="mt-1 text-[13px] leading-relaxed">{{ x.fix }}</p>
              </div>
              <button type="button" class="h-fit shrink-0 rounded-lg border border-accent1/40 px-2.5 py-1 text-xs text-accent1 hover:bg-accent1/10" @click="applyHelpFix(x.id)">{{ t('yueGen.help.advanced.apply') }}</button>
            </div>
          </div>
        </section>

        <!-- Each field, grouped by what it changes, with the defaults drawn on a scale -->
        <section>
          <h4 class="mb-1 text-sm font-semibold text-text">{{ t('yueGen.help.advanced.fieldsTitle') }}</h4>
          <p class="mb-3 text-xs leading-relaxed">{{ t('yueGen.help.advanced.fieldsIntro') }}</p>
          <div class="space-y-4">
            <div v-for="g in (tm('yueGen.help.advanced.groups') as { title: string; fields: { key: string; name: string; text: string; left: string; right: string; when: string }[] }[])" :key="g.title">
              <p class="mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-dim">{{ g.title }}</p>
              <div class="grid gap-3 sm:grid-cols-2">
                <div v-for="f in g.fields" :key="f.key" class="flex flex-col rounded-lg border border-border/60 bg-panel-2/50 p-4">
                  <p class="text-[15px] font-medium text-text">{{ f.name }}</p>
                  <!-- default and range as two separate pills, so they never read as one string -->
                  <div class="mt-2 flex flex-wrap gap-2 text-xs tabular-nums">
                    <span class="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-panel px-2 py-0.5">
                      <span class="text-text-dim">{{ t('yueGen.help.advanced.defaultLabel') }}</span>
                      <span class="text-text">● {{ helpDefaults(f.key).semantic }}</span>
                      <span v-if="helpDefaults(f.key).abc" class="text-text">○ {{ helpDefaults(f.key).abc }}</span>
                    </span>
                    <span class="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-panel px-2 py-0.5">
                      <span class="text-text-dim">{{ t('yueGen.help.advanced.rangeLabel') }}</span>
                      <span class="text-text">{{ helpRange(f.key) }}</span>
                    </span>
                  </div>
                  <p class="mt-3 text-[13px] leading-relaxed">{{ f.text }}</p>
                  <!-- A ruler, not a slider: what "lower" and "higher" mean, the span's ends as numbers, and
                       the defaults as labelled ticks (audio above the line, score below it) -->
                  <div dir="ltr" class="mt-4 rounded-md border border-border/50 bg-panel/60 px-3 pb-2 pt-2.5">
                    <div class="flex justify-between text-xs text-text-dim">
                      <span>← {{ f.left }}</span>
                      <span>{{ f.right }} →</span>
                    </div>
                    <div class="relative mt-7 h-0.5 rounded-full bg-border" :class="helpDefaults(f.key).abc ? 'mb-7' : 'mb-2'">
                      <!-- audio default: label, then a tick standing on the line -->
                      <div class="absolute bottom-0 flex flex-col" :class="tickAlign(scalePct(f.key, helpDefaults(f.key).semantic))" :style="tickStyle(scalePct(f.key, helpDefaults(f.key).semantic))">
                        <span class="mb-0.5 whitespace-nowrap text-xs font-semibold leading-none tabular-nums text-accent1">{{ helpDefaults(f.key).semantic }}<span v-if="helpDefaults(f.key).abc" class="ms-1 font-normal text-text-dim">{{ t('yueGen.help.advanced.scaleSemantic') }}</span></span>
                        <span class="h-2.5 w-0.5 rounded bg-accent1" aria-hidden="true"></span>
                      </div>
                      <!-- score default: a tick hanging from the line, then its label -->
                      <div v-if="helpDefaults(f.key).abc" class="absolute top-0 flex flex-col" :class="tickAlign(scalePct(f.key, helpDefaults(f.key).abc!))" :style="tickStyle(scalePct(f.key, helpDefaults(f.key).abc!))">
                        <span class="h-2.5 w-0.5 rounded bg-text-dim" aria-hidden="true"></span>
                        <span class="mt-0.5 whitespace-nowrap text-xs font-semibold leading-none tabular-nums text-text">{{ helpDefaults(f.key).abc }}<span class="ms-1 font-normal text-text-dim">{{ t('yueGen.help.advanced.scaleAbc') }}</span></span>
                      </div>
                    </div>
                    <div class="flex justify-between text-xs tabular-nums text-text-dim">
                      <span>{{ HELP_SCALES[f.key].lo }}</span>
                      <span>{{ HELP_SCALES[f.key].hi }}</span>
                    </div>
                  </div>
                  <p class="mt-4 rounded-md bg-accent1/[0.07] px-3 py-2 text-[13px] leading-relaxed text-text"><span class="me-1 inline-block text-accent1 rtl:-scale-x-100">→</span>{{ f.when }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <CollapsibleDetails :summary="t('yueGen.help.advanced.rareTitle')">
          <p class="text-xs leading-relaxed">{{ t('yueGen.help.advanced.rareIntro') }}</p>
          <div class="grid gap-2 sm:grid-cols-3">
            <div v-for="f in (tm('yueGen.help.advanced.rare') as { key: string; name: string; text: string }[])" :key="f.key" class="rounded-lg border border-border/60 bg-panel-2/50 p-4">
              <p class="font-medium text-text">{{ f.name }}</p>
              <div class="mt-2 flex flex-wrap gap-2 text-xs tabular-nums">
                <span class="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-panel px-2 py-0.5 text-text">● {{ helpDefaults(f.key).semantic }} <span>○ {{ helpDefaults(f.key).abc }}</span></span>
                <span class="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-panel px-2 py-0.5"><span class="text-text-dim">{{ t('yueGen.help.advanced.rangeLabel') }}</span><span class="text-text">{{ helpRange(f.key) }}</span></span>
              </div>
              <p class="mt-3 text-[13px] leading-relaxed">{{ f.text }}</p>
            </div>
          </div>
        </CollapsibleDetails>

        <section class="rounded-lg border border-status-queued/30 bg-status-queued/[0.05] p-3">
          <h4 class="mb-1.5 text-sm font-semibold text-text">{{ t('yueGen.help.advanced.rulesTitle') }}</h4>
          <ol class="list-decimal space-y-1.5 ps-4">
            <li v-for="x in (tm('yueGen.help.advanced.rules') as string[])" :key="x">{{ x }}</li>
          </ol>
        </section>

        <p class="text-xs text-text-dim">{{ t('yueGen.help.advanced.note') }}</p>
      </div>
    </HelpModal>
  </div>
</template>
