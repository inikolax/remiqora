<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { cutAtPhrase } from '../../utils/trackTitle'
import { useI18n } from 'vue-i18n'
import { useAceStepStore } from '../../stores/aceStep'
import * as api from '../../api/aceStep'
import type { GenerateMusicRequest } from '../../api/aceStep'
import { useLoraRegistry } from '../../composables/useLoraRegistry'
import ChipGroup from '../../components/shared/ChipGroup.vue'
import CollapsibleDetails from '../../components/shared/CollapsibleDetails.vue'
import HelpModal from '../../components/shared/HelpModal.vue'
import HelpIconButton from '../../components/shared/HelpIconButton.vue'
import TagInput from '../../components/shared/TagInput.vue'
import { guessVocalLanguage, VOCAL_LANGUAGES, vocalLanguageLabel } from '../../utils/vocalLanguages'

const store = useAceStepStore()
const { t, tm } = useI18n()
const { loras, add: addLora, remove: removeLora } = useLoraRegistry()

type Mode = 'simple' | 'custom'
type TaskType = 'cover' | 'repaint' | 'extract' | 'lego' | 'complete'

interface AcePreset {
  name: string
  mode: Mode
  simpleQuery: string
  customPrompt: string
  instrumental: boolean
  customLyrics: string
  duration: number
  audioFormat: 'mp3' | 'wav' | 'flac'
  bpm: number | null
  keyScale: string
  timeSignature: string
  vocalLanguage: string
  inferenceSteps: number | null
  guidanceScale: number | null
  selectedModel: string
}

const presets = ref<AcePreset[]>([])
const selectedPresetName = ref('')
const newPresetName = ref('')
const showPresetInput = ref(false)

function loadPresets() {
  try {
    const raw = localStorage.getItem('acestep_presets')
    if (raw) presets.value = JSON.parse(raw)
  } catch {}
}

function saveCurrentPreset() {
  const name = newPresetName.value.trim()
  if (!name) return
  const preset: AcePreset = {
    name,
    mode: mode.value,
    simpleQuery: simpleQuery.value,
    customPrompt: customPrompt.value,
    instrumental: instrumental.value,
    customLyrics: customLyrics.value,
    duration: duration.value,
    audioFormat: audioFormat.value,
    bpm: bpm.value,
    keyScale: keyScale.value,
    timeSignature: timeSignature.value,
    vocalLanguage: vocalLanguage.value,
    inferenceSteps: inferenceSteps.value,
    guidanceScale: guidanceScale.value,
    selectedModel: selectedModel.value,
  }
  const idx = presets.value.findIndex((p) => p.name === preset.name)
  if (idx !== -1) presets.value[idx] = preset
  else presets.value.push(preset)
  localStorage.setItem('acestep_presets', JSON.stringify(presets.value))
  selectedPresetName.value = name
  newPresetName.value = ''
  showPresetInput.value = false
}

function applyPreset(name: string) {
  const p = presets.value.find((x) => x.name === name)
  if (!p) return
  mode.value = p.mode || 'simple'
  simpleQuery.value = p.simpleQuery || ''
  customPrompt.value = p.customPrompt || ''
  instrumental.value = !!p.instrumental
  customLyrics.value = p.customLyrics || ''
  if (p.duration) duration.value = p.duration
  if (p.audioFormat) audioFormat.value = p.audioFormat
  bpm.value = p.bpm ?? null
  keyScale.value = p.keyScale || ''
  timeSignature.value = p.timeSignature || ''
  vocalLanguage.value = p.vocalLanguage || ''
  inferenceSteps.value = p.inferenceSteps ?? null
  guidanceScale.value = p.guidanceScale ?? null
  if (p.selectedModel) selectedModel.value = p.selectedModel
}

function deletePreset(name: string) {
  presets.value = presets.value.filter((p) => p.name !== name)
  localStorage.setItem('acestep_presets', JSON.stringify(presets.value))
  if (selectedPresetName.value === name) selectedPresetName.value = ''
}

onMounted(loadPresets)

watch(
  () => store.pendingParamsInsert,
  (params) => {
    if (!params) return
    if (params.prompt || params.query) {
      if (params.prompt) {
        mode.value = 'custom'
        customPrompt.value = params.prompt
      } else if (params.query) {
        mode.value = 'simple'
        simpleQuery.value = params.query
      }
    }
    if (params.lyrics != null) customLyrics.value = params.lyrics
    if (params.instrumental != null) instrumental.value = params.instrumental
    if (params.duration != null) duration.value = params.duration
    if (params.audio_format != null) audioFormat.value = params.audio_format
    if (params.bpm != null) bpm.value = params.bpm
    if (params.key_scale != null) keyScale.value = params.key_scale
    if (params.time_signature != null) timeSignature.value = params.time_signature
    if (params.vocal_language != null) vocalLanguage.value = params.vocal_language
    if (params.inference_steps != null) inferenceSteps.value = params.inference_steps
    if (params.guidance_scale != null) guidanceScale.value = params.guidance_scale
    if (params.seed != null) seedValue.value = params.seed
    if (params.model != null) selectedModel.value = params.model
    store.clearPendingParamsInsert()
  },
)

const mode = ref<Mode>('simple')
const simpleQuery = ref('')
const customPrompt = ref('')
const instrumental = ref(false)
const customLyrics = ref('')

const useRefAudio = ref(false)
const refAudioFile = ref<File | null>(null)
const taskType = ref<TaskType>('cover')
const repaintStart = ref<number | null>(null)
const repaintEnd = ref<number | null>(null)
const trackName = ref('vocals')
const trackClasses = ref<string[]>([])
const coverStrength = ref(1)

const duration = ref(120)
const batchSize = ref<1 | 2 | 4>(1)

const audioFormat = ref<'mp3' | 'wav' | 'flac'>('mp3')
const bpm = ref<number | null>(null)
const keyScale = ref('')
const timeSignature = ref('')
const vocalLanguage = ref('')
/**
 * "Auto" with lyrics typed in: the language read from their letters. Without vocal_language the API assumes
 * English, and for cover / repaint / extract / lego / complete no LM runs to detect it, so Russian lyrics
 * were sung as English. Empty in "simple" mode and for instrumentals: there the LM writes the lyrics.
 */
const autoVocalLanguage = computed(() =>
  mode.value === 'custom' && !instrumental.value && customLyrics.value.trim() ? guessVocalLanguage(customLyrics.value) : '',
)
const inferenceSteps = ref<number | null>(null)
const inferenceStepsTouched = ref(false)
const guidanceScale = ref<number | null>(null)
const seedValue = ref<number | null>(null)
const selectedModel = ref('')

const selectedLoraPath = ref('')
const loraScaleVal = ref(1)
const loraStatus = ref('')
const newLoraName = ref('')
const newLoraPath = ref('')

const submitting = ref(false)
const formError = ref('')
const helpOpen = ref<null | 'style' | 'lyrics' | 'remix' | 'advanced'>(null)

const TASK_TYPES = computed<{ value: TaskType; label: string }[]>(() => [
  { value: 'cover', label: t('aceGen.taskTypes.cover') },
  { value: 'repaint', label: t('aceGen.taskTypes.repaint') },
  { value: 'extract', label: t('aceGen.taskTypes.extract') },
  { value: 'lego', label: t('aceGen.taskTypes.lego') },
  { value: 'complete', label: t('aceGen.taskTypes.complete') },
])
const TRACK_NAME_OPTIONS = ['vocals', 'drums', 'bass', 'guitar', 'piano', 'keys', 'strings', 'brass', 'woodwinds', 'synth', 'percussion', 'other']
const TIME_SIGNATURES = ['4/4', '3/4', '6/8', '2/4', '5/4', '7/8']

const selectedModelInfo = computed(() => store.inventory?.models.find((m) => m.name === selectedModel.value))
const isTurbo = computed(() => /turbo/i.test(selectedModelInfo.value?.name || selectedModel.value || ''))
const supportedTaskTypes = computed<Set<string>>(() => {
  const list = selectedModelInfo.value?.supported_task_types
  return list && list.length ? new Set(list) : new Set(TASK_TYPES.value.map((tt) => tt.value))
})
const taskTypeOptions = computed(() => TASK_TYPES.value.map((tt) => ({ ...tt, disabled: !supportedTaskTypes.value.has(tt.value) })))

watch(
  () => store.inventory,
  (inv) => {
    if (inv && !selectedModel.value) selectedModel.value = inv.default_model
  },
  { immediate: true },
)

watch(isTurbo, (turbo) => {
  if (!inferenceStepsTouched.value) inferenceSteps.value = null // let placeholder show the right default
  if (turbo) guidanceScale.value = null
}, { immediate: true })

watch(supportedTaskTypes, (set) => {
  if (!set.has(taskType.value)) {
    const fallback = TASK_TYPES.value.find((tt) => set.has(tt.value))
    if (fallback) taskType.value = fallback.value
  }
})

// The trainer saves each checkpoint as "<checkpoint>/adapter/{adapter_config.json,...}";
// exporting a checkpoint via the LoRA training page copies that checkpoint dir as-is, so
// the actual PEFT adapter path can end up one level deeper than the registered path.
// Probe both nestings rather than requiring the registry entry to be exactly right.
async function loadLoraWithFallback(path: string, name?: string) {
  const candidates = [path, `${path}/adapter`, `${path}/adapter/adapter`]
  let lastErr: unknown
  for (const candidate of candidates) {
    try {
      await api.loraLoad(candidate, name)
      return
    } catch (err) {
      lastErr = err
    }
  }
  throw lastErr
}

let loraDebounce: ReturnType<typeof setTimeout> | null = null
watch(selectedLoraPath, async (path) => {
  loraStatus.value = ''
  try {
    if (!path) {
      await api.loraUnload()
    } else {
      const entry = loras.value.find((l) => l.path === path)
      await loadLoraWithFallback(path, entry?.name)
      await api.loraScale(loraScaleVal.value)
    }
  } catch (err) {
    loraStatus.value = err instanceof Error ? err.message : String(err)
  }
})
watch(loraScaleVal, (scale) => {
  if (!selectedLoraPath.value) return
  if (loraDebounce) clearTimeout(loraDebounce)
  loraDebounce = setTimeout(async () => {
    try {
      await api.loraScale(scale)
    } catch (err) {
      loraStatus.value = err instanceof Error ? err.message : String(err)
    }
  }, 300)
})

function onRefFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0] ?? null
  refAudioFile.value = file
}

function registerNewLora() {
  addLora(newLoraName.value, newLoraPath.value)
  newLoraName.value = ''
  newLoraPath.value = ''
}

const inferenceStepsPlaceholder = computed(() => (isTurbo.value ? t('aceGen.inferenceStepsTurbo') : t('aceGen.inferenceStepsNormal')))
const durationLabel = computed(() => {
  const m = Math.floor(duration.value / 60)
  const s = duration.value % 60
  return `${m}:${String(s).padStart(2, '0')} (${duration.value}s)`
})

async function submit() {
  formError.value = ''

  const req: GenerateMusicRequest = {
    audio_duration: duration.value,
    batch_size: batchSize.value,
    audio_format: audioFormat.value,
  }
  let title = ''

  if (mode.value === 'simple') {
    if (!simpleQuery.value.trim()) {
      formError.value = t('aceGen.enterDescription')
      return
    }
    title = cutAtPhrase(simpleQuery.value, 60)
    if (useRefAudio.value) {
      req.prompt = simpleQuery.value.trim()
    } else {
      req.sample_query = simpleQuery.value.trim()
      req.sample_mode = true
    }
  } else {
    if (!customPrompt.value.trim()) {
      formError.value = t('aceGen.enterStyle')
      return
    }
    title = cutAtPhrase(customPrompt.value, 60)
    req.prompt = customPrompt.value.trim()
    req.lyrics = instrumental.value ? '' : customLyrics.value
  }

  if (bpm.value) req.bpm = bpm.value
  if (keyScale.value) req.key_scale = keyScale.value
  if (timeSignature.value) req.time_signature = timeSignature.value
  const language = vocalLanguage.value || autoVocalLanguage.value
  if (language) req.vocal_language = language
  if (inferenceSteps.value) req.inference_steps = inferenceSteps.value
  if (guidanceScale.value != null && !isTurbo.value) req.guidance_scale = guidanceScale.value
  if (seedValue.value != null) {
    req.seed = seedValue.value
    req.use_random_seed = false
  } else {
    req.use_random_seed = true
  }
  if (selectedModel.value) req.model = selectedModel.value

  let refFile: File | null = null
  if (useRefAudio.value) {
    if (!refAudioFile.value) {
      formError.value = t('aceGen.selectRefFile')
      return
    }
    refFile = refAudioFile.value
    req.task_type = taskType.value
    if (taskType.value === 'repaint') {
      if (repaintStart.value != null) req.repainting_start = repaintStart.value
      if (repaintEnd.value != null) req.repainting_end = repaintEnd.value
    }
    if (taskType.value === 'extract' || taskType.value === 'lego') req.track_name = trackName.value
    if (taskType.value === 'complete') req.track_classes = trackClasses.value
    if (taskType.value === 'cover' || taskType.value === 'repaint') req.audio_cover_strength = coverStrength.value
  }

  submitting.value = true
  try {
    await store.submit(req, refFile, title)
  } catch (err) {
    formError.value = err instanceof Error ? err.message : String(err)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="lg:sticky lg:top-20 lg:self-start">
    <div class="space-y-4 rounded-xl border border-border bg-panel p-4">
      <button type="button" class="accent-gradient w-full rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-50" :disabled="submitting" @click="submit">
        {{ submitting ? t('aceGen.submitting') : t('aceGen.submit') }}
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

      <div class="flex gap-2 rounded-lg bg-panel-2 p-1 text-sm">
        <button
          type="button"
          class="flex-1 rounded-md py-1.5 transition-colors"
          :class="mode === 'simple' ? 'accent-gradient text-white' : 'text-text-dim'"
          @click="mode = 'simple'"
        >
          {{ t('aceGen.modeSimple') }}
        </button>
        <button
          type="button"
          class="flex-1 rounded-md py-1.5 transition-colors"
          :class="mode === 'custom' ? 'accent-gradient text-white' : 'text-text-dim'"
          @click="mode = 'custom'"
        >
          {{ t('aceGen.modeCustom') }}
        </button>
      </div>

      <div v-if="mode === 'simple'" class="space-y-1.5">
        <label class="text-[13px] font-medium text-text">{{ t('aceGen.simpleLabel') }}</label>
        <textarea v-model="simpleQuery" rows="3" class="w-full rounded-lg border border-border bg-panel-2 p-2.5 text-sm text-text" :placeholder="t('aceGen.simplePlaceholder')"></textarea>
      </div>

      <div v-else class="space-y-3">
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label class="text-[13px] font-medium text-text">{{ t('aceGen.styleLabel') }}</label>
            <HelpIconButton @click="helpOpen = 'style'" />
          </div>
          <TagInput v-model="customPrompt" :placeholder="t('aceGen.stylePlaceholder')" />
        </div>
        <label class="flex items-center gap-2 text-sm text-text-dim">
          <input v-model="instrumental" type="checkbox" class="rounded border-border" />
          {{ t('aceGen.instrumental') }}
        </label>
        <div v-if="!instrumental" class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label class="text-[13px] font-medium text-text">{{ t('aceGen.lyricsLabel') }}</label>
            <HelpIconButton @click="helpOpen = 'lyrics'" />
          </div>
          <textarea v-model="customLyrics" rows="6" class="w-full rounded-lg border border-border bg-panel-2 p-2.5 font-mono text-sm text-text" :placeholder="t('aceGen.lyricsPlaceholder')"></textarea>
        </div>
      </div>

      <div class="space-y-2 rounded-lg border border-border bg-panel-2/50 p-3">
        <label class="flex items-center justify-between text-sm">
          <span class="flex items-center gap-2 font-medium text-text">
            <input v-model="useRefAudio" type="checkbox" class="rounded border-border" />
            {{ t('aceGen.refAudio') }}
          </span>
          <HelpIconButton @click="helpOpen = 'remix'" />
        </label>
        <div v-if="useRefAudio" class="space-y-3 pt-1">
          <input type="file" accept="audio/*" class="block w-full text-xs text-text-dim file:mr-3 file:rounded-md file:border-0 file:accent-gradient file:px-3 file:py-1.5 file:text-white" @change="onRefFileChange" />
          <p v-if="refAudioFile" class="text-xs text-text-dim">{{ refAudioFile.name }}</p>

          <ChipGroup v-model="taskType" :options="taskTypeOptions" />

          <div v-if="taskType === 'repaint'" class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-[13px] font-medium text-text">{{ t('aceGen.repaintStart') }}</label>
              <input v-model.number="repaintStart" type="number" min="0" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text" />
            </div>
            <div>
              <label class="text-[13px] font-medium text-text">{{ t('aceGen.repaintEnd') }}</label>
              <input v-model.number="repaintEnd" type="number" min="0" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text" />
            </div>
          </div>

          <div v-if="taskType === 'extract' || taskType === 'lego'">
            <label class="text-[13px] font-medium text-text">{{ t('aceGen.trackPart') }}</label>
            <select v-model="trackName" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text">
              <option v-for="opt in TRACK_NAME_OPTIONS" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>

          <div v-if="taskType === 'complete'">
            <label class="mb-1 block text-[13px] font-medium text-text">{{ t('aceGen.trackPartsToAdd') }}</label>
            <ChipGroup v-model="trackClasses" multiple :options="TRACK_NAME_OPTIONS.map((v) => ({ value: v, label: v }))" />
          </div>

          <div v-if="taskType === 'cover' || taskType === 'repaint'">
            <label class="text-[13px] font-medium text-text">{{ t('aceGen.coverStrength', { value: coverStrength.toFixed(2) }) }}</label>
            <input v-model.number="coverStrength" type="range" min="0" max="1" step="0.05" class="w-full accent-accent1" />
          </div>
        </div>
      </div>

      <div>
        <label class="text-[13px] font-medium text-text">{{ t('aceGen.duration', { value: durationLabel }) }}</label>
        <input v-model.number="duration" type="range" min="10" max="300" step="5" class="w-full accent-accent1" />
      </div>

      <div>
        <label class="mb-1 block text-[13px] font-medium text-text">{{ t('aceGen.variantCount') }}</label>
        <ChipGroup v-model="batchSize" :options="[{ value: 1, label: '1' }, { value: 2, label: '2' }, { value: 4, label: '4' }]" />
      </div>

      <CollapsibleDetails :summary="t('aceGen.advancedSettings')">
        <button type="button" class="text-xs text-accent1 hover:underline" @click="helpOpen = 'advanced'">{{ t('aceGen.advancedWhatMeans') }}</button>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-[13px] font-medium text-text">{{ t('aceGen.format') }}</label>
            <select v-model="audioFormat" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text">
              <option value="mp3">mp3</option>
              <option value="wav">wav</option>
              <option value="flac">flac</option>
            </select>
          </div>
          <div>
            <label class="text-[13px] font-medium text-text">{{ t('aceGen.bpm') }}</label>
            <input v-model.number="bpm" type="number" min="0" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text" :placeholder="t('aceGen.bpmPlaceholder')" />
          </div>
          <div>
            <label class="text-[13px] font-medium text-text">{{ t('aceGen.keyScale') }}</label>
            <input v-model="keyScale" type="text" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text" :placeholder="t('aceGen.keyScalePlaceholder')" />
          </div>
          <div>
            <label class="text-[13px] font-medium text-text">{{ t('aceGen.timeSignature') }}</label>
            <select v-model="timeSignature" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text">
              <option value="">{{ t('aceGen.timeSignatureAuto') }}</option>
              <option v-for="ts in TIME_SIGNATURES" :key="ts" :value="ts">{{ ts }}</option>
            </select>
          </div>
          <div>
            <label class="text-[13px] font-medium text-text">{{ t('aceGen.vocalLanguage') }}</label>
            <select v-model="vocalLanguage" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text">
              <option value="">{{ autoVocalLanguage ? `${t('aceGen.vocalLanguageAuto')}: ${vocalLanguageLabel(autoVocalLanguage)}` : t('aceGen.vocalLanguageAuto') }}</option>
              <option v-for="lang in VOCAL_LANGUAGES" :key="lang.code" :value="lang.code">{{ lang.label }}</option>
            </select>
          </div>
          <div>
            <label class="text-[13px] font-medium text-text">{{ t('aceGen.inferenceSteps') }}</label>
            <input
              v-model.number="inferenceSteps"
              type="number"
              min="1"
              class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text"
              :placeholder="inferenceStepsPlaceholder"
              @input="inferenceStepsTouched = true"
            />
          </div>
          <div>
            <label class="text-[13px] font-medium text-text">{{ t('aceGen.guidanceScale') }}</label>
            <input
              v-model.number="guidanceScale"
              type="number"
              step="0.1"
              :disabled="isTurbo"
              class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text disabled:opacity-40"
              :placeholder="isTurbo ? t('aceGen.guidanceUnused') : t('aceGen.guidanceDefault')"
            />
          </div>
          <div>
            <label class="text-[13px] font-medium text-text">{{ t('aceGen.seed') }}</label>
            <input v-model.number="seedValue" type="number" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text" :placeholder="t('aceGen.seedPlaceholder')" />
          </div>
          <div>
            <label class="text-[13px] font-medium text-text">{{ t('aceGen.model') }}</label>
            <select v-model="selectedModel" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text">
              <option v-for="m in store.inventory?.models ?? []" :key="m.name" :value="m.name">{{ m.name }}</option>
            </select>
          </div>
        </div>

        <div class="space-y-2 rounded-lg border border-border bg-panel-2/50 p-3">
          <label class="text-[13px] font-medium text-text">{{ t('aceGen.lora') }}</label>
          <select v-model="selectedLoraPath" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text">
            <option value="">{{ t('aceGen.noLora') }}</option>
            <option v-for="l in loras" :key="l.path" :value="l.path">{{ l.name }}</option>
          </select>
          <div v-if="selectedLoraPath">
            <label class="text-[13px] font-medium text-text">{{ t('aceGen.loraStrength', { value: loraScaleVal.toFixed(2) }) }}</label>
            <input v-model.number="loraScaleVal" type="range" min="0" max="2" step="0.05" class="w-full accent-accent1" />
          </div>
          <p v-if="loraStatus" class="text-xs text-status-failed">{{ loraStatus }}</p>
          <div class="flex items-center gap-2">
            <input v-model="newLoraName" type="text" :placeholder="t('aceGen.loraNamePlaceholder')" class="w-1/3 rounded-lg border border-border bg-panel-2 p-1.5 text-xs text-text" />
            <input v-model="newLoraPath" type="text" :placeholder="t('aceGen.loraPathPlaceholder')" class="flex-1 rounded-lg border border-border bg-panel-2 p-1.5 text-xs text-text" />
            <button type="button" class="rounded-lg bg-panel px-2 py-1.5 text-xs text-text-dim hover:text-text" @click="registerNewLora">+</button>
          </div>
          <ul v-if="loras.length" class="space-y-1">
            <li v-for="l in loras" :key="l.path" class="flex items-center justify-between text-xs text-text-dim">
              <span class="truncate">{{ l.name }}</span>
              <button type="button" class="text-status-failed hover:underline" @click="removeLora(l.path)">{{ t('aceGen.removeLora') }}</button>
            </li>
          </ul>
        </div>
      </CollapsibleDetails>
    </div>

    <HelpModal :open="helpOpen === 'style'" :title="t('aceGen.help.style.title')" @close="helpOpen = null">
      <p>{{ t('aceGen.help.style.intro') }}</p>
      <table class="w-full border-collapse text-xs">
        <thead>
          <tr class="border-b border-border text-left text-text">
            <th class="py-1 pr-2">{{ t('aceGen.help.style.dimHeader') }}</th>
            <th class="py-1">{{ t('aceGen.help.style.examplesHeader') }}</th>
          </tr>
        </thead>
        <tbody class="align-top">
          <tr v-for="row in (tm('aceGen.help.style.rows') as { dim: string; examples: string }[])" :key="row.dim" class="border-b border-border/60">
            <td class="py-1.5 pr-2 font-medium text-text">{{ row.dim }}</td>
            <td class="py-1.5">{{ row.examples }}</td>
          </tr>
        </tbody>
      </table>
      <p class="font-medium text-text">{{ t('aceGen.help.style.tipsTitle') }}</p>
      <ul class="list-disc space-y-1 pl-4">
        <li v-for="tip in (tm('aceGen.help.style.tips') as string[])" :key="tip">{{ tip }}</li>
      </ul>
      <p class="font-medium text-text">{{ t('aceGen.help.style.examplesTitle') }}</p>
      <p v-for="ex in (tm('aceGen.help.style.examples') as string[])" :key="ex" class="rounded bg-panel-2 p-2 font-mono text-xs">{{ ex }}</p>
    </HelpModal>
    <HelpModal :open="helpOpen === 'lyrics'" :title="t('aceGen.help.lyrics.title')" @close="helpOpen = null">
      <p>{{ t('aceGen.help.lyrics.intro') }}</p>
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
          <tr v-for="mark in (tm('aceGen.help.lyrics.marks') as { tag: string; purpose: string }[])" :key="mark.tag" class="border-b border-border/60">
            <td class="py-1.5 pr-2 font-mono text-text">{{ mark.tag }}</td>
            <td class="py-1.5">{{ mark.purpose }}</td>
          </tr>
        </tbody>
      </table>
      <p class="font-medium text-text">{{ t('aceGen.help.lyrics.tipsTitle') }}</p>
      <ul class="list-disc space-y-1 pl-4">
        <li v-for="tip in (tm('aceGen.help.lyrics.tips') as string[])" :key="tip">{{ tip }}</li>
      </ul>
      <p class="font-medium text-text">{{ t('aceGen.help.lyrics.exampleTitle') }}</p>
      <p class="rounded bg-panel-2 p-2 font-mono text-xs whitespace-pre-line">{{ t('aceGen.help.lyrics.example') }}</p>
    </HelpModal>
    <HelpModal :open="helpOpen === 'remix'" :title="t('aceGen.help.remix.title')" @close="helpOpen = null">
      <table class="w-full border-collapse text-xs">
        <thead>
          <tr class="border-b border-border text-left text-text">
            <th class="py-1 pr-2">{{ t('aceGen.help.remix.scenarioHeader') }}</th>
            <th class="py-1">{{ t('aceGen.help.remix.whatHeader') }}</th>
            <th class="py-1">{{ t('aceGen.help.remix.tuneHeader') }}</th>
          </tr>
        </thead>
        <tbody class="align-top">
          <tr v-for="row in (tm('aceGen.help.remix.rows') as { scenario: string; what: string; tune: string }[])" :key="row.scenario" class="border-b border-border/60">
            <td class="py-1.5 pr-2 font-medium text-text">{{ row.scenario }}</td>
            <td class="py-1.5 pr-2">{{ row.what }}</td>
            <td class="py-1.5">{{ row.tune }}</td>
          </tr>
        </tbody>
      </table>
      <p class="font-medium text-text">{{ t('aceGen.help.remix.paramsTitle') }}</p>
      <ul class="list-disc space-y-1 pl-4">
        <li v-for="(p, i) in (tm('aceGen.help.remix.params') as string[])" :key="i" v-html="p"></li>
      </ul>
      <p class="font-medium text-text">{{ t('aceGen.help.remix.unavailableTitle') }}</p>
      <p class="text-xs text-text-dim">{{ t('aceGen.help.remix.unavailable') }}</p>
    </HelpModal>
    <HelpModal :open="helpOpen === 'advanced'" :title="t('aceGen.help.advanced.title')" @close="helpOpen = null">
      <table class="w-full border-collapse text-xs">
        <thead>
          <tr class="border-b border-border text-left text-text">
            <th class="py-1 pr-2">{{ t('aceGen.help.advanced.paramHeader') }}</th>
            <th class="py-1">{{ t('aceGen.help.advanced.whatHeader') }}</th>
          </tr>
        </thead>
        <tbody class="align-top">
          <tr v-for="row in (tm('aceGen.help.advanced.rows') as { param: string; what: string }[])" :key="row.param" class="border-b border-border/60">
            <td class="py-1.5 pr-2 font-medium text-text">{{ row.param }}</td>
            <td class="py-1.5">{{ row.what }}</td>
          </tr>
        </tbody>
      </table>
      <p class="text-xs text-text-dim">{{ t('aceGen.help.advanced.footer') }}</p>
    </HelpModal>
  </div>
</template>
