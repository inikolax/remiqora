<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useYue2Store } from '../../stores/yue2'
import { useFeaturesStore } from '../../stores/features'
import * as api from '../../api/yue2'
import type { CotMode, GenerateOptions } from '../../api/yue2'
import ChipGroup from '../../components/shared/ChipGroup.vue'
import CollapsibleDetails from '../../components/shared/CollapsibleDetails.vue'
import HelpModal from '../../components/shared/HelpModal.vue'
import HelpIconButton from '../../components/shared/HelpIconButton.vue'
import HelpBody from '../../components/shared/help/HelpBody.vue'
import HelpSection from '../../components/shared/help/HelpSection.vue'
import HelpList from '../../components/shared/help/HelpList.vue'
import HelpTable from '../../components/shared/help/HelpTable.vue'
import HelpExamples from '../../components/shared/help/HelpExamples.vue'
import TagInput from '../../components/shared/TagInput.vue'

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
  lyrics.value = p.lyrics || ''
  style.value = p.style || ''
  cot.value = p.cot || 'off'
  precision.value = p.precision || 'q8_0'
  abc.value = p.abc || ''
  cfgScale.value = p.cfgScale ?? null
  numInferenceSteps.value = p.numInferenceSteps ?? null
  if (p.semantic) Object.assign(semantic, p.semantic)
  if (p.abcSampling) Object.assign(abcSampling, p.abcSampling)
}

function deletePreset(name: string) {
  presets.value = presets.value.filter((p) => p.name !== name)
  localStorage.setItem('yue2_presets', JSON.stringify(presets.value))
  if (selectedPresetName.value === name) selectedPresetName.value = ''
}

onMounted(loadPresets)

// Parameters put here from elsewhere (a card's reuse, "From an idea"). Applied on a change and on mount too: when
// they are sent while the engine is stopped, this form only appears once it runs, and they wait in the store.
function applyInsert(params: typeof store.pendingParamsInsert) {
  if (!params) return
  if (params.lyrics != null) lyrics.value = params.lyrics
  if (params.style != null) style.value = params.style
  if (params.cot != null) cot.value = params.cot
  if (params.precision != null) precision.value = params.precision
  if (params.seed != null) seed.value = params.seed
  if (params.abc != null) abc.value = params.abc
  if (params.cfg_scale != null) cfgScale.value = params.cfg_scale
  if (params.num_inference_steps != null) numInferenceSteps.value = params.num_inference_steps
  if (params.semantic) Object.assign(semantic, params.semantic)
  if (params.abc_sampling) Object.assign(abcSampling, params.abc_sampling)
  store.clearPendingParamsInsert()
}
watch(() => store.pendingParamsInsert, applyInsert)
onMounted(() => applyInsert(store.pendingParamsInsert))

const lyrics = ref('')
const style = ref('')
const cot = ref<CotMode>('off')
const precision = ref<'q8_0' | 'q4_0' | 'bf16'>('q8_0')
// Only the precisions installed (the installer may have fetched one); a remembered one that is gone falls back.
const features = useFeaturesStore()
const precisions = computed(() => (features.features.yue2_precisions.length ? features.features.yue2_precisions : (['q8_0', 'q4_0', 'bf16'] as const)))
watch([precision, precisions], () => {
  if (!precisions.value.includes(precision.value)) precision.value = precisions.value[0]
}, { immediate: true })
const abc = ref('')

const coverFile = ref<File | null>(null)
const unloadSheetSage = ref(true)
const extracting = ref(false)
const coverStatus = ref('')
const coverError = ref('')

const seed = ref(831001)
const randomSeed = ref(false)
const batchSize = ref<1 | 2 | 3 | 4>(1)

const cfgScale = ref<number | null>(null)
const numInferenceSteps = ref<number | null>(null)
const semantic = reactive<Record<string, number | null>>({
  temperature: null, top_p: null, top_k: null, repetition_penalty: null, penalty_window: null, min_tokens: null, max_tokens: null,
})
const abcSampling = reactive<Record<string, number | null>>({
  temperature: null, top_p: null, top_k: null, repetition_penalty: null, penalty_window: null, min_tokens: null, max_tokens: null,
})

const submitting = ref(false)
const formError = ref('')
const helpOpen = ref<null | 'style' | 'lyrics' | 'cot' | 'advanced'>(null)
const helpStyleExamples = computed(() => (tm('yueGen.help.style.examples') as string[]).map((text) => ({ text })))
/** An example from the help goes into its field, and the help closes. */
function useStyleExample(i: number) {
  style.value = (tm('yueGen.help.style.examples') as string[])[i] ?? style.value
  helpOpen.value = null
}
function useLyricsExample() {
  lyrics.value = t('yueGen.help.lyrics.example')
  helpOpen.value = null
}
/** The CoT modes with what each is for, as rows of the help's table. */
const cotHelpRows = computed(() => (['off', 'melody', 'full'] as const).map((mode) => ({
  mode,
  when: `${COT_HINTS.value[mode]} ${t(`yueGen.help.cot.${mode}Note`)}`,
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
// min/max are what audio.cpp's request validation accepts (src/models/yue2/request.cpp); it rejects the
// whole request otherwise, so the form checks them before sending. max_tokens additionally must be
// >= min_tokens of the same stage.
type NumberField = { key: string; label: string; step: string; min: number; max?: number }
const SAMPLING_FIELDS: NumberField[] = [
  { key: 'temperature', label: 'Temperature', step: '0.01', min: 0, max: 5 },
  { key: 'top_p', label: 'Top-p', step: '0.01', min: 0.01, max: 1 },
  { key: 'top_k', label: 'Top-k', step: '1', min: 1 },
  { key: 'repetition_penalty', label: 'Repetition penalty', step: '0.01', min: 0.01 },
  { key: 'penalty_window', label: 'Penalty window', step: '1', min: 1 },
  { key: 'min_tokens', label: 'Min tokens', step: '1', min: 0 },
  { key: 'max_tokens', label: 'Max tokens', step: '1', min: 0 },
]
const CFG_FIELD: NumberField = { key: 'cfg_scale', label: 'CFG scale', step: '0.1', min: 0, max: 20 }
const STEPS_FIELD: NumberField = { key: 'num_inference_steps', label: 'Inference steps', step: '1', min: 1 }
const rangeLabel = (f: NumberField) => (f.max == null ? `≥ ${f.min}` : `${f.min} – ${f.max}`)
// A cleared number input leaves '' (v-model.number keeps what it cannot parse), which must count as
// "not set" rather than be sent to the engine.
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)
// The first out-of-range field as a user-facing message, or '' when everything is fine.
function rangeError(): string {
  const check = (group: string, f: NumberField, raw: number | null) => {
    const v = num(raw)
    if (v == null) return ''
    const integer = f.step === '1'
    if (v < f.min || (f.max != null && v > f.max) || (integer && !Number.isInteger(v))) {
      const label = f === STEPS_FIELD ? t('aceGen.inferenceSteps') : f.label
      return t('yueGen.outOfRange', { field: group ? `${group} → ${label}` : label, range: rangeLabel(f) })
    }
    return ''
  }
  const checkStage = (group: string, values: Record<string, number | null>) => {
    for (const f of SAMPLING_FIELDS) {
      const err = check(group, f, values[f.key])
      if (err) return err
    }
    const lo = num(values.min_tokens) ?? YUE2_DEFAULTS_NUM(group, 'min_tokens')
    const hi = num(values.max_tokens) ?? YUE2_DEFAULTS_NUM(group, 'max_tokens')
    if (hi < lo) return t('yueGen.maxBelowMin', { group })
    return ''
  }
  return (
    check('', CFG_FIELD, cfgScale.value) ||
    check('', STEPS_FIELD, numInferenceSteps.value) ||
    checkStage(t('yueGen.semanticSampling'), semantic) ||
    (cot.value !== 'off' ? checkStage(t('yueGen.abcPlannerSampling'), abcSampling) : '')
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
const defaultPlaceholder = (value: string) => t('yueGen.defaultValuePlaceholder', { value })

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
  melody: () => { if (cot.value === 'off') cot.value = 'full'; abcSampling.temperature = 0.55 },
  same: () => { randomSeed.value = true },
  final: () => { numInferenceSteps.value = 32; cfgScale.value = 1.2 },
}
function applyHelpFix(id: string) {
  HELP_FIXES[id]?.()
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
    store.clearPendingAbcInsert()
  },
)

function onCoverFileChange(e: Event) {
  coverFile.value = (e.target as HTMLInputElement).files?.[0] ?? null
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
    if (abc.value.trim()) options.abc = abc.value.trim()
    for (const f of SAMPLING_FIELDS) {
      const v = num(abcSampling[f.key])
      if (v != null) options[`abc_${f.key}`] = v
    }
  }
  return options
}

async function submit() {
  formError.value = ''
  if (!lyrics.value.trim()) {
    formError.value = t('yueGen.enterLyrics')
    return
  }
  if (!style.value.trim()) {
    formError.value = t('yueGen.enterStyle')
    return
  }
  const invalid = rangeError()
  if (invalid) {
    formError.value = invalid
    return
  }
  submitting.value = true
  try {
    await store.generateBatch({
      lyrics: lyrics.value.trim(),
      style: style.value.trim(),
      cot: cot.value,
      precision: precision.value,
      baseSeed: Number.isFinite(seed.value) ? seed.value : 831001,
      randomSeed: randomSeed.value,
      batchSize: batchSize.value,
      options: buildOptions(),
    })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="lg:sticky lg:top-20 lg:self-start">
    <div class="space-y-4 rounded-xl border border-border bg-panel p-4">
      <button type="button" class="accent-gradient w-full rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-50" :disabled="submitting" @click="submit">
        {{ submitting ? t('yueGen.submitting') : t('yueGen.submit') }}
      </button>
      <p v-if="formError" class="rounded-lg bg-status-failed/10 p-2 text-xs text-status-failed">{{ formError }}</p>

      <!-- Preset bar -->
      <div class="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-panel-2 p-2">
        <select
          v-model="selectedPresetName"
          class="flex-1 min-w-32 rounded border border-border bg-panel px-2 py-1 text-xs text-text"
          @change="applyPreset(selectedPresetName)"
        >
          <option value="">{{ t('aceGen.presetPlaceholder') }}</option>
          <option v-for="p in presets" :key="p.name" :value="p.name">{{ p.name }}</option>
        </select>
        <button
          v-if="!showPresetInput"
          type="button"
          class="rounded border border-border px-2 py-1 text-xs text-text hover:bg-panel"
          :title="t('aceGen.savePresetTitle')"
          @click="showPresetInput = true"
        >
          {{ t('aceGen.addPreset') }}
        </button>
        <button
          v-if="selectedPresetName"
          type="button"
          class="rounded px-1.5 py-1 text-xs text-status-failed hover:bg-status-failed/10"
          :title="t('aceGen.deletePresetTitle')"
          @click="deletePreset(selectedPresetName)"
        >
          ✕
        </button>
        <div v-if="showPresetInput" class="flex w-full items-center gap-1 pt-1">
          <input
            v-model="newPresetName"
            :placeholder="t('aceGen.presetNamePlaceholder')"
            class="flex-1 rounded border border-border bg-panel px-2 py-0.5 text-xs text-text"
            @keyup.enter="saveCurrentPreset"
          />
          <button
            type="button"
            class="accent-gradient rounded px-2 py-0.5 text-xs text-white"
            @click="saveCurrentPreset"
          >
            {{ t('aceGen.save') }}
          </button>
          <button
            type="button"
            class="text-xs text-text-dim hover:text-text"
            @click="showPresetInput = false"
          >
            {{ t('aceGen.cancel') }}
          </button>
        </div>
      </div>

      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <label class="text-[13px] font-medium text-text">{{ t('aceGen.lyricsLabel') }}</label>
          <HelpIconButton @click="helpOpen = 'lyrics'" />
        </div>
        <textarea v-model="lyrics" rows="6" class="w-full rounded-lg border border-border bg-panel-2 p-2.5 font-mono text-sm text-text" :placeholder="t('aceGen.lyricsPlaceholder')"></textarea>
      </div>

      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <label class="text-[13px] font-medium text-text">{{ t('aceGen.styleLabel') }}</label>
          <HelpIconButton @click="helpOpen = 'style'" />
        </div>
        <TagInput v-model="style" :placeholder="t('aceGen.stylePlaceholder')" />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <div class="mb-1 flex items-center justify-between">
            <label class="text-[13px] font-medium text-text">{{ t('yueGen.cotModeLabel') }}</label>
            <HelpIconButton @click="helpOpen = 'cot'" />
          </div>
          <select v-model="cot" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text">
            <option v-for="o in COT_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-[13px] font-medium text-text">{{ t('yueGen.precisionLabel') }}</label>
          <select v-model="precision" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text">
            <option v-for="p in precisions" :key="p" :value="p">{{ p }}</option>
          </select>
        </div>
      </div>
      <p class="text-xs text-text-dim">{{ COT_HINTS[cot] }}</p>

      <div v-if="cot !== 'off'" class="space-y-3 rounded-lg border border-border bg-panel-2/50 p-3">
        <div>
          <label class="text-[13px] font-medium text-text">{{ t('yueGen.abcScore') }}</label>
          <textarea v-model="abc" rows="6" class="w-full rounded-lg border border-border bg-panel-2 p-2.5 font-mono text-xs text-text"></textarea>
        </div>
        <div class="space-y-2 rounded-lg border border-border bg-panel p-3">
          <p class="text-xs font-medium text-text">{{ t('yueGen.extractSectionTitle') }}</p>
          <input type="file" accept="audio/*" class="block w-full text-xs text-text-dim file:me-3 file:rounded-md file:border-0 file:accent-gradient file:px-3 file:py-1.5 file:text-white" @change="onCoverFileChange" />
          <label class="flex items-center gap-2 text-xs text-text-dim">
            <input v-model="unloadSheetSage" type="checkbox" class="rounded border-border" />
            {{ t('yueGen.unloadSheetSage') }}
          </label>
          <button type="button" class="accent-gradient rounded-lg px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50" :disabled="!coverFile || extracting" @click="extractAbc">
            {{ extracting ? t('yueGen.extracting') : t('yueGen.extract') }}
          </button>
          <p v-if="coverStatus" class="text-xs text-text-dim">{{ coverStatus }}</p>
          <p v-if="coverError" class="rounded-lg bg-status-failed/10 p-2 text-xs text-status-failed">{{ coverError }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-[13px] font-medium text-text">{{ t('aceGen.seed') }}</label>
          <input v-model.number="seed" type="number" :disabled="randomSeed" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text disabled:opacity-40" />
        </div>
        <label class="flex items-end gap-2 pb-2 text-xs text-text-dim">
          <input v-model="randomSeed" type="checkbox" class="rounded border-border" />
          {{ t('yueGen.randomSeed') }}
        </label>
      </div>

      <div>
        <label class="mb-1 block text-[13px] font-medium text-text">{{ t('aceGen.variantCount') }}</label>
        <ChipGroup v-model="batchSize" :options="[{ value: 1, label: '1' }, { value: 2, label: '2' }, { value: 3, label: '3' }, { value: 4, label: '4' }]" />
      </div>

      <CollapsibleDetails :summary="t('aceGen.advancedSettings')">
        <button type="button" class="text-xs text-accent1 hover:underline" @click="helpOpen = 'advanced'">{{ t('aceGen.advancedWhatMeans') }}</button>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-[13px] font-medium text-text">{{ t('yueGen.cfgScale') }}</label>
            <input v-model.number="cfgScale" type="number" :step="CFG_FIELD.step" :min="CFG_FIELD.min" :max="CFG_FIELD.max" :title="rangeLabel(CFG_FIELD)" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text" :placeholder="defaultPlaceholder(YUE2_DEFAULTS.cfgScale[cot])" />
          </div>
          <div>
            <label class="text-[13px] font-medium text-text">{{ t('aceGen.inferenceSteps') }}</label>
            <input v-model.number="numInferenceSteps" type="number" :step="STEPS_FIELD.step" :min="STEPS_FIELD.min" :title="rangeLabel(STEPS_FIELD)" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text" :placeholder="defaultPlaceholder(YUE2_DEFAULTS.numInferenceSteps)" />
          </div>
        </div>

        <CollapsibleDetails :summary="t('yueGen.semanticSampling')">
          <div class="grid grid-cols-2 gap-2">
            <div v-for="f in SAMPLING_FIELDS" :key="'sem_' + f.key">
              <label class="text-[13px] font-medium text-text">{{ f.label }}</label>
              <input v-model.number="semantic[f.key]" type="number" :step="f.step" :min="f.min" :max="f.max" :title="rangeLabel(f)" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text" :placeholder="defaultPlaceholder(YUE2_DEFAULTS.semantic[f.key])" />
            </div>
          </div>
        </CollapsibleDetails>

        <CollapsibleDetails v-if="cot !== 'off'" :summary="t('yueGen.abcPlannerSampling')">
          <div class="grid grid-cols-2 gap-2">
            <div v-for="f in SAMPLING_FIELDS" :key="'abc_' + f.key">
              <label class="text-[13px] font-medium text-text">{{ f.label }}</label>
              <input v-model.number="abcSampling[f.key]" type="number" :step="f.step" :min="f.min" :max="f.max" :title="rangeLabel(f)" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text" :placeholder="defaultPlaceholder(YUE2_DEFAULTS.abc[f.key])" />
            </div>
          </div>
        </CollapsibleDetails>
      </CollapsibleDetails>
    </div>

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
          :columns="[{ key: 'mode', label: t('yueGen.help.cot.modeHeader'), mono: true }, { key: 'when', label: t('yueGen.help.cot.whenHeader') }]"
          :rows="cotHelpRows"
          :current="(r) => r.mode === cot"
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
    <!-- Same look as the app's main help (AppHelpModal): lead, numbered cards, bordered cards, tinted tips box -->
    <HelpModal :open="helpOpen === 'advanced'" :title="t('yueGen.help.advanced.title')" wide @close="helpOpen = null">
      <div class="space-y-7">
        <p class="text-[15px] leading-relaxed text-text">{{ t('yueGen.help.advanced.lead') }}</p>

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
                        <span class="mb-0.5 whitespace-nowrap text-[11px] font-semibold leading-none tabular-nums text-accent1">{{ helpDefaults(f.key).semantic }}<span v-if="helpDefaults(f.key).abc" class="ms-1 font-normal text-text-dim">{{ t('yueGen.help.advanced.scaleSemantic') }}</span></span>
                        <span class="h-2.5 w-0.5 rounded bg-accent1" aria-hidden="true"></span>
                      </div>
                      <!-- score default: a tick hanging from the line, then its label -->
                      <div v-if="helpDefaults(f.key).abc" class="absolute top-0 flex flex-col" :class="tickAlign(scalePct(f.key, helpDefaults(f.key).abc!))" :style="tickStyle(scalePct(f.key, helpDefaults(f.key).abc!))">
                        <span class="h-2.5 w-0.5 rounded bg-text-dim" aria-hidden="true"></span>
                        <span class="mt-0.5 whitespace-nowrap text-[11px] font-semibold leading-none tabular-nums text-text">{{ helpDefaults(f.key).abc }}<span class="ms-1 font-normal text-text-dim">{{ t('yueGen.help.advanced.scaleAbc') }}</span></span>
                      </div>
                    </div>
                    <div class="flex justify-between text-[11px] tabular-nums text-text-dim">
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
