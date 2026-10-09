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
import TagInput from '../../components/shared/TagInput.vue'

const store = useYue2Store()
const { t, tm } = useI18n()

interface Yue2Preset {
  name: string
  lyrics: string
  style: string
  cot: CotMode
  precision: 'q8_0' | 'q4_0'
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

watch(
  () => store.pendingParamsInsert,
  (params) => {
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
  },
)

const lyrics = ref('')
const style = ref('')
const cot = ref<CotMode>('off')
const precision = ref<'q8_0' | 'q4_0'>('q8_0')
// Only the precisions installed (the installer may have fetched one); a remembered one that is gone falls back.
const features = useFeaturesStore()
const precisions = computed(() => (features.features.yue2_precisions.length ? features.features.yue2_precisions : (['q8_0', 'q4_0'] as const)))
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
const SAMPLING_FIELDS: { key: string; label: string; step: string }[] = [
  { key: 'temperature', label: 'Temperature', step: '0.01' },
  { key: 'top_p', label: 'Top-p', step: '0.01' },
  { key: 'top_k', label: 'Top-k', step: '1' },
  { key: 'repetition_penalty', label: 'Repetition penalty', step: '0.01' },
  { key: 'penalty_window', label: 'Penalty window', step: '1' },
  { key: 'min_tokens', label: 'Min tokens', step: '1' },
  { key: 'max_tokens', label: 'Max tokens', step: '1' },
]

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
  if (cfgScale.value != null) options.cfg_scale = cfgScale.value
  if (numInferenceSteps.value != null) options.num_inference_steps = numInferenceSteps.value
  for (const f of SAMPLING_FIELDS) {
    const v = semantic[f.key]
    if (v != null) options[`semantic_${f.key}`] = v
  }
  if (cot.value !== 'off') {
    if (abc.value.trim()) options.abc = abc.value.trim()
    for (const f of SAMPLING_FIELDS) {
      const v = abcSampling[f.key]
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
          <input type="file" accept="audio/*" class="block w-full text-xs text-text-dim file:mr-3 file:rounded-md file:border-0 file:accent-gradient file:px-3 file:py-1.5 file:text-white" @change="onCoverFileChange" />
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
            <input v-model.number="cfgScale" type="number" step="0.1" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text" :placeholder="t('yueGen.defaultPlaceholder')" />
          </div>
          <div>
            <label class="text-[13px] font-medium text-text">{{ t('aceGen.inferenceSteps') }}</label>
            <input v-model.number="numInferenceSteps" type="number" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text" :placeholder="t('yueGen.defaultPlaceholder')" />
          </div>
        </div>

        <CollapsibleDetails :summary="t('yueGen.semanticSampling')">
          <div class="grid grid-cols-2 gap-2">
            <div v-for="f in SAMPLING_FIELDS" :key="'sem_' + f.key">
              <label class="text-[13px] font-medium text-text">{{ f.label }}</label>
              <input v-model.number="semantic[f.key]" type="number" :step="f.step" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text" :placeholder="t('yueGen.defaultPlaceholder')" />
            </div>
          </div>
        </CollapsibleDetails>

        <CollapsibleDetails v-if="cot !== 'off'" :summary="t('yueGen.abcPlannerSampling')">
          <div class="grid grid-cols-2 gap-2">
            <div v-for="f in SAMPLING_FIELDS" :key="'abc_' + f.key">
              <label class="text-[13px] font-medium text-text">{{ f.label }}</label>
              <input v-model.number="abcSampling[f.key]" type="number" :step="f.step" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text" :placeholder="t('yueGen.defaultPlaceholder')" />
            </div>
          </div>
        </CollapsibleDetails>
      </CollapsibleDetails>
    </div>

    <HelpModal :open="helpOpen === 'style'" :title="t('yueGen.help.style.title')" @close="helpOpen = null">
      <p>{{ t('yueGen.help.style.intro') }}</p>
      <table class="w-full border-collapse text-xs">
        <thead>
          <tr class="border-b border-border text-left text-text">
            <th class="py-1 pr-2">{{ t('yueGen.help.style.dimHeader') }}</th>
            <th class="py-1">{{ t('yueGen.help.style.examplesHeader') }}</th>
          </tr>
        </thead>
        <tbody class="align-top">
          <tr v-for="row in (tm('yueGen.help.style.rows') as { dim: string; examples: string }[])" :key="row.dim" class="border-b border-border/60">
            <td class="py-1.5 pr-2 font-medium text-text">{{ row.dim }}</td>
            <td class="py-1.5">{{ row.examples }}</td>
          </tr>
        </tbody>
      </table>
      <p class="font-medium text-text">{{ t('yueGen.help.style.tipsTitle') }}</p>
      <ul class="list-disc space-y-1 pl-4">
        <li v-for="tip in (tm('yueGen.help.style.tips') as string[])" :key="tip">{{ tip }}</li>
      </ul>
      <p class="font-medium text-text">{{ t('yueGen.help.style.examplesTitle') }}</p>
      <p v-for="ex in (tm('yueGen.help.style.examples') as string[])" :key="ex" class="rounded bg-panel-2 p-2 font-mono text-xs">{{ ex }}</p>
    </HelpModal>
    <HelpModal :open="helpOpen === 'lyrics'" :title="t('yueGen.help.lyrics.title')" @close="helpOpen = null">
      <p>{{ t('yueGen.help.lyrics.intro') }}</p>
      <table class="w-full border-collapse text-xs">
        <thead>
          <tr class="border-b border-border text-left text-text">
            <th class="py-1 pr-2">{{ t('yueGen.help.lyrics.tagHeader') }}</th>
            <th class="py-1">{{ t('yueGen.help.lyrics.purposeHeader') }}</th>
          </tr>
        </thead>
        <tbody class="align-top">
          <tr v-for="row in (tm('yueGen.help.lyrics.rows') as { tag: string; purpose: string }[])" :key="row.tag" class="border-b border-border/60">
            <td class="py-1.5 pr-2 font-mono text-text">{{ row.tag }}</td>
            <td class="py-1.5">{{ row.purpose }}</td>
          </tr>
        </tbody>
      </table>
      <p class="font-medium text-text">{{ t('yueGen.help.lyrics.tipsTitle') }}</p>
      <ul class="list-disc space-y-1 pl-4">
        <li v-for="tip in (tm('yueGen.help.lyrics.tips') as string[])" :key="tip">{{ tip }}</li>
      </ul>
      <p class="font-medium text-text">{{ t('yueGen.help.lyrics.exampleTitle') }}</p>
      <p class="rounded bg-panel-2 p-2 font-mono text-xs whitespace-pre-line">{{ t('yueGen.help.lyrics.example') }}</p>
    </HelpModal>
    <HelpModal :open="helpOpen === 'cot'" :title="t('yueGen.help.cot.title')" @close="helpOpen = null">
      <p>{{ t('yueGen.help.cot.intro') }}</p>
      <table class="w-full border-collapse text-xs">
        <thead>
          <tr class="border-b border-border text-left text-text">
            <th class="py-1 pr-2">{{ t('yueGen.help.cot.modeHeader') }}</th>
            <th class="py-1">{{ t('yueGen.help.cot.whenHeader') }}</th>
          </tr>
        </thead>
        <tbody class="align-top">
          <tr class="border-b border-border/60">
            <td class="py-1.5 pr-2 font-mono text-text">off</td>
            <td class="py-1.5">{{ COT_HINTS.off }} {{ t('yueGen.help.cot.offNote') }}</td>
          </tr>
          <tr class="border-b border-border/60">
            <td class="py-1.5 pr-2 font-mono text-text">melody</td>
            <td class="py-1.5">{{ COT_HINTS.melody }} {{ t('yueGen.help.cot.melodyNote') }}</td>
          </tr>
          <tr>
            <td class="py-1.5 pr-2 font-mono text-text">full</td>
            <td class="py-1.5">{{ COT_HINTS.full }} {{ t('yueGen.help.cot.fullNote') }}</td>
          </tr>
        </tbody>
      </table>
      <p class="text-xs text-text-dim">{{ t('yueGen.help.cot.precisionNote') }}</p>

      <p class="font-medium text-text">{{ t('yueGen.help.cot.abcTitle') }}</p>
      <p>{{ t('yueGen.help.cot.abcIntro') }}</p>
      <table class="w-full border-collapse text-xs">
        <tbody class="align-top">
          <tr v-for="row in (tm('yueGen.help.cot.abcRows') as { tag: string; purpose: string }[])" :key="row.tag" class="border-b border-border/60">
            <td class="py-1.5 pr-2 font-mono text-text">{{ row.tag }}</td>
            <td class="py-1.5">{{ row.purpose }}</td>
          </tr>
        </tbody>
      </table>
      <p class="text-xs text-text-dim">{{ t('yueGen.help.cot.abcFooter') }}</p>
    </HelpModal>
    <HelpModal :open="helpOpen === 'advanced'" :title="t('yueGen.help.advanced.title')" @close="helpOpen = null">
      <table class="w-full border-collapse text-xs">
        <thead>
          <tr class="border-b border-border text-left text-text">
            <th class="py-1 pr-2">{{ t('yueGen.help.advanced.paramHeader') }}</th>
            <th class="py-1">{{ t('yueGen.help.advanced.whatHeader') }}</th>
          </tr>
        </thead>
        <tbody class="align-top">
          <tr v-for="row in (tm('yueGen.help.advanced.rows') as { param: string; what: string }[])" :key="row.param" class="border-b border-border/60">
            <td class="py-1.5 pr-2 font-medium text-text">{{ row.param }}</td>
            <td class="py-1.5">{{ row.what }}</td>
          </tr>
        </tbody>
      </table>
      <p class="font-medium text-text">{{ t('yueGen.help.advanced.samplingTitle') }}</p>
      <table class="w-full border-collapse text-xs">
        <tbody class="align-top">
          <tr v-for="row in (tm('yueGen.help.advanced.samplingRows') as { tag: string; purpose: string }[])" :key="row.tag" class="border-b border-border/60">
            <td class="py-1.5 pr-2 font-mono text-text">{{ row.tag }}</td>
            <td class="py-1.5">{{ row.purpose }}</td>
          </tr>
        </tbody>
      </table>
      <p class="text-xs text-text-dim">{{ t('yueGen.help.advanced.footer') }}</p>
    </HelpModal>
  </div>
</template>
