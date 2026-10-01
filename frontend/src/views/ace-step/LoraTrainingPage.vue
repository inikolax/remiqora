<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useOrchestratorStore } from '../../stores/orchestrator'
import { useLoraTrainingStore } from '../../stores/loraTraining'
import { useLoraRegistry } from '../../composables/useLoraRegistry'
import { formatDuration } from '../../composables/formatDuration'
import { uploadDatasetFiles } from '../../api/loraDataset'
import * as aceStepApi from '../../api/aceStep'
import ModelOfflineBanner from '../../components/shared/ModelOfflineBanner.vue'
import ProgressBar from '../../components/shared/ProgressBar.vue'
import CollapsibleDetails from '../../components/shared/CollapsibleDetails.vue'
import HelpModal from '../../components/shared/HelpModal.vue'
import HelpIconButton from '../../components/shared/HelpIconButton.vue'
import type { DatasetSample } from '../../api/aceStepTraining'

const orchestrator = useOrchestratorStore()
const store = useLoraTrainingStore()
const { add: addLora } = useLoraRegistry()
const { t, tm } = useI18n()

const helpOpen = ref<'dataset' | 'training' | null>(null)

const modelStatus = computed(() => orchestrator.statuses.ace_step?.status ?? 'stopped')
const modelError = computed(() => orchestrator.statuses.ace_step?.error ?? null)
const isRunning = computed(() => modelStatus.value === 'running')

// Auto-labeling and training need the DiT model *and* the LLM actually loaded
// into GPU memory - the orchestrator only reports the process as "running"
// once its HTTP server answers, well before that (lazy on first real use).
// Without this check, clicking "Разметить автоматически" first thing just
// 500s with an opaque "Model not initialized".
const llmReady = ref<boolean | null>(null)
const modelReady = ref<boolean | null>(null)
const checkingReady = ref(false)
const initializing = ref(false)
const initError = ref('')

async function checkModelReady() {
  checkingReady.value = true
  try {
    const health = await aceStepApi.health()
    modelReady.value = health.models_initialized
    llmReady.value = health.llm_initialized
  } catch {
    modelReady.value = null
    llmReady.value = null
  } finally {
    checkingReady.value = false
  }
}

async function onInitModel() {
  initializing.value = true
  initError.value = ''
  try {
    await aceStepApi.initModel(true)
    await checkModelReady()
  } catch (err) {
    initError.value = err instanceof Error ? err.message : String(err)
  } finally {
    initializing.value = false
  }
}

watch(isRunning, (running) => {
  if (running) void checkModelReady()
})

onMounted(() => {
  store.refreshTrainingStatus()
  if (isRunning.value) void checkModelReady()
})
onBeforeUnmount(() => store.stopBackgroundTasks())

// ── 1. Dataset ──
const audioDir = ref('datasets/my-voice')
const datasetName = ref('my_lora_dataset')
const customTag = ref('')
const tagPosition = ref<'prepend' | 'append' | 'replace'>('replace')
const allInstrumental = ref(true)
const loadPath = ref('')

async function onScan() {
  try {
    await store.scanDataset({
      audio_dir: audioDir.value,
      dataset_name: datasetName.value,
      custom_tag: customTag.value,
      tag_position: tagPosition.value,
      all_instrumental: allInstrumental.value,
    })
  } catch {
    // store.scanError already holds the message
  }
}
async function onLoadDataset() {
  if (!loadPath.value.trim()) return
  try {
    await store.loadDataset(loadPath.value.trim())
  } catch {
    // store.scanError already holds the message
  }
}

// Bulk browser upload: ACE-Step's own dataset API only scans a server-local
// folder path, so files picked/dropped here first go to Remiqora's own
// backend, which drops them under ACE_STEP_DIR/datasets/<name>/ (a location
// the scan endpoint is already allowed to read) and hands back that path.
const fileInput = ref<HTMLInputElement | null>(null)
const dragging = ref(false)
const uploading = ref(false)
const uploadMessage = ref('')
const uploadError = ref('')

function pickFiles() {
  fileInput.value?.click()
}
function onFilesPicked(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files || [])
  if (files.length) void handleFiles(files)
  ;(e.target as HTMLInputElement).value = ''
}
function onDrop(e: DragEvent) {
  e.preventDefault()
  dragging.value = false
  const files = Array.from(e.dataTransfer?.files || [])
  if (files.length) void handleFiles(files)
}
async function handleFiles(files: File[]) {
  uploading.value = true
  uploadError.value = ''
  uploadMessage.value = ''
  try {
    const res = await uploadDatasetFiles(datasetName.value, files)
    audioDir.value = res.audio_dir
    const skipped = res.skipped.length ? t('lora.uploadedSkipped', { count: res.skipped.length, names: res.skipped.join(', ') }) : ''
    uploadMessage.value = t('lora.uploadedMessage', { saved: res.saved.length, skipped })
    await onScan()
  } catch (err) {
    uploadError.value = err instanceof Error ? err.message : String(err)
  } finally {
    uploading.value = false
  }
}

const labeledCount = computed(() => store.samples.filter((s) => s.labeled).length)

// ── 2. Auto-label ──
const skipMetas = ref(false)
const formatLyrics = ref(false)
const transcribeLyrics = ref(false)
const onlyUnlabeled = ref(false)

async function onAutoLabel() {
  await store.startAutoLabel({
    skip_metas: skipMetas.value,
    format_lyrics: formatLyrics.value,
    transcribe_lyrics: transcribeLyrics.value,
    only_unlabeled: onlyUnlabeled.value,
    save_path: store.datasetPath || undefined,
  })
}

// ── 3. Review samples ──
const editing = ref<Record<number, Partial<DatasetSample>>>({})
function edited(sample: DatasetSample): Partial<DatasetSample> {
  if (!editing.value[sample.index]) editing.value[sample.index] = { ...sample }
  return editing.value[sample.index]
}
// store.samples gets replaced wholesale after a scan/load/auto-label
// (e.g. auto-label fills in a caption that was empty a moment ago) - drop
// any unsaved edit buffers so the table shows the fresh server data instead
// of stale (often blank) values cached before that happened.
watch(
  () => store.samples,
  () => {
    editing.value = {}
  },
)
async function saveSample(sample: DatasetSample) {
  const e = editing.value[sample.index]
  if (!e) return
  await store.updateSample(sample.index, {
    caption: e.caption,
    genre: e.genre,
    lyrics: e.lyrics,
    bpm: e.bpm ?? undefined,
    keyscale: e.keyscale,
    timesignature: e.timesignature,
    language: e.language,
    is_instrumental: e.is_instrumental,
  })
  delete editing.value[sample.index]
}

const genreRatio = ref(0)
const savePath = ref('')
async function onSaveDataset() {
  if (!savePath.value.trim()) return
  await store.saveDataset({
    save_path: savePath.value.trim(),
    dataset_name: datasetName.value,
    custom_tag: customTag.value,
    tag_position: tagPosition.value,
    all_instrumental: allInstrumental.value,
    genre_ratio: genreRatio.value,
  })
}

// ── 4. Preprocess ──
const outputDir = ref('')
function suggestOutputDir() {
  if (!outputDir.value) outputDir.value = `${audioDir.value.replace(/\/$/, '')}/tensors`
}
const skipExisting = ref(false)
async function onPreprocess() {
  suggestOutputDir()
  await store.startPreprocess({ output_dir: outputDir.value, skip_existing: skipExisting.value })
}

// ── 5. Training ──
const tensorDir = ref('')
const loraOutputDir = ref('./lora_output')
const loraRank = ref(64)
const loraAlpha = ref(128)
const loraDropout = ref(0.1)
const learningRate = ref(0.0001)
const trainEpochs = ref(10)
const trainBatchSize = ref(1)
const gradientAccumulation = ref(4)
const saveEveryNEpochs = ref(5)
const trainingSeed = ref(42)
const useFp8 = ref(false)
const gradientCheckpointing = ref(false)

async function onStartTraining() {
  const dir = tensorDir.value || store.preprocessOutputDir
  if (!dir) return
  await store.startTraining({
    tensor_dir: dir,
    lora_rank: loraRank.value,
    lora_alpha: loraAlpha.value,
    lora_dropout: loraDropout.value,
    learning_rate: learningRate.value,
    train_epochs: trainEpochs.value,
    train_batch_size: trainBatchSize.value,
    gradient_accumulation: gradientAccumulation.value,
    save_every_n_epochs: saveEveryNEpochs.value,
    training_seed: trainingSeed.value,
    lora_output_dir: loraOutputDir.value,
    use_fp8: useFp8.value,
    gradient_checkpointing: gradientCheckpointing.value,
  })
}

const epochProgress = computed(() => {
  if (!store.totalEpochs) return 0
  return ((store.training?.current_epoch ?? 0) / store.totalEpochs) * 100
})
const etaLabel = computed(() => {
  const sec = store.training?.estimated_time_remaining
  if (!sec || !Number.isFinite(sec)) return '—'
  const m = Math.round(sec / 60)
  return m < 1 ? t('lora.etaLessThanMin') : t('lora.etaMin', { value: m })
})

// ── 6. Export ──
const exportPath = ref('')
const registryName = ref('')
async function onExport() {
  if (!exportPath.value.trim() || !registryName.value.trim()) return
  await store.exportAndRegister(exportPath.value.trim(), loraOutputDir.value, registryName.value.trim(), addLora)
  registryName.value = ''
}
</script>

<template>
  <div class="space-y-6">
    <ModelOfflineBanner v-if="!isRunning" model-id="ace_step" :status="modelStatus" :error="modelError" />

    <template v-else>
      <div class="rounded-xl border border-status-queued/40 bg-status-queued/10 p-4 text-sm text-text-dim">
        <i18n-t keypath="lora.serverNotice" tag="span">
          <template #example><code class="rounded bg-panel-2 px-1">datasets/...</code></template>
        </i18n-t>
      </div>

      <div v-if="llmReady === false" class="flex flex-wrap items-center gap-3 rounded-xl border border-status-failed/40 bg-status-failed/10 p-4 text-sm text-text-dim">
        <span class="flex-1">
          {{ t('lora.llmNotReady') }}
        </span>
        <button
          type="button"
          class="accent-gradient inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          :disabled="initializing"
          @click="onInitModel"
        >
          <span v-if="initializing" class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
          {{ initializing ? t('lora.loading') : t('lora.initModel') }}
        </button>
      </div>
      <p v-if="initError" class="text-xs text-status-failed">{{ initError }}</p>

      <!-- 1. Dataset -->
      <section class="space-y-3 rounded-xl border border-border bg-panel p-5">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-text">{{ t('lora.step1Title') }}</h2>
          <HelpIconButton @click="helpOpen = 'dataset'" />
        </div>

        <label class="space-y-1 block max-w-xs">
          <span class="text-xs text-text-dim">{{ t('lora.datasetNameLabel') }}</span>
          <input v-model="datasetName" type="text" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text" />
        </label>

        <div
          class="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors"
          :class="dragging ? 'border-accent1 bg-accent1/5' : 'border-border'"
          @dragover.prevent="dragging = true"
          @dragleave.prevent="dragging = false"
          @drop="onDrop"
          @click="pickFiles"
        >
          <input ref="fileInput" type="file" multiple accept="audio/*,.wav,.mp3,.flac,.ogg,.opus" class="hidden" @change="onFilesPicked" />
          <p class="text-sm text-text">{{ uploading ? t('lora.loading') : t('lora.dropHint') }}</p>
          <p class="text-xs text-text-dim">{{ t('lora.dropSubHint') }}</p>
        </div>
        <p v-if="uploadMessage" class="text-xs text-status-done">{{ uploadMessage }}</p>
        <p v-if="uploadError" class="text-xs text-status-failed">{{ uploadError }}</p>

        <CollapsibleDetails :summary="t('lora.manualFolderSummary')">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label class="space-y-1">
            <span class="text-xs text-text-dim">{{ t('lora.audioDirLabel') }}</span>
            <input v-model="audioDir" type="text" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text" placeholder="datasets/my-voice" />
          </label>
        </div>
        </CollapsibleDetails>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label class="space-y-1">
            <span class="text-xs text-text-dim">{{ t('lora.triggerWordLabel') }}</span>
            <input v-model="customTag" type="text" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text" :placeholder="t('lora.triggerWordPlaceholder')" />
          </label>
          <label class="space-y-1">
            <span class="text-xs text-text-dim">{{ t('lora.triggerPositionLabel') }}</span>
            <select v-model="tagPosition" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text">
              <option value="replace">{{ t('lora.tagReplace') }}</option>
              <option value="prepend">{{ t('lora.tagPrepend') }}</option>
              <option value="append">{{ t('lora.tagAppend') }}</option>
            </select>
          </label>
        </div>
        <label class="flex items-center gap-2 text-sm text-text-dim">
          <input v-model="allInstrumental" type="checkbox" class="accent-accent1" />
          {{ t('lora.allInstrumental') }}
        </label>
        <p class="text-xs text-text-dim">{{ t('lora.clipTrimHint') }}</p>
        <div class="flex flex-wrap items-center gap-3">
          <button type="button" class="accent-gradient rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" :disabled="store.scanning" @click="onScan">
            {{ store.scanning ? t('lora.scanning') : t('lora.scanFolder') }}
          </button>
          <span class="text-text-dim">{{ t('lora.or') }}</span>
          <input v-model="loadPath" type="text" class="w-56 rounded-lg border border-border bg-panel-2 p-1.5 text-xs text-text" :placeholder="t('lora.loadPathPlaceholder')" />
          <button type="button" class="rounded-lg bg-panel-2 px-3 py-1.5 text-xs text-text-dim hover:text-text" @click="onLoadDataset">{{ t('lora.load') }}</button>
        </div>
        <p v-if="store.scanError" class="text-xs text-status-failed">{{ store.scanError }}</p>
        <p v-if="store.samples.length" class="text-sm text-text-dim">
          {{ t('lora.samplesFound', { count: store.samples.length, labeled: labeledCount }) }}
        </p>
      </section>

      <template v-if="store.samples.length">
        <!-- 2. Auto-label -->
        <section class="space-y-3 rounded-xl border border-border bg-panel p-5">
          <h2 class="text-lg font-semibold text-text">{{ t('lora.step2Title') }}</h2>
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label class="flex items-center gap-2 text-sm text-text-dim"><input v-model="onlyUnlabeled" type="checkbox" class="accent-accent1" /> {{ t('lora.onlyUnlabeled') }}</label>
            <label class="flex items-center gap-2 text-sm text-text-dim"><input v-model="skipMetas" type="checkbox" class="accent-accent1" /> {{ t('lora.skipMetas') }}</label>
            <label class="flex items-center gap-2 text-sm text-text-dim"><input v-model="formatLyrics" type="checkbox" class="accent-accent1" /> {{ t('lora.formatLyrics') }}</label>
            <label class="flex items-center gap-2 text-sm text-text-dim"><input v-model="transcribeLyrics" type="checkbox" class="accent-accent1" /> {{ t('lora.transcribeLyrics') }}</label>
          </div>
          <button
            type="button"
            class="accent-gradient inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            :disabled="store.autoLabelStarting || store.autoLabelRunning"
            @click="onAutoLabel"
          >
            <span v-if="store.autoLabelStarting || store.autoLabelRunning" class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            {{ store.autoLabelStarting ? t('lora.starting') : store.autoLabelRunning ? t('lora.labeling') : t('lora.labelAuto') }}
          </button>
          <div v-if="store.autoLabelRunning || store.autoLabelTotal" class="space-y-2">
            <ProgressBar :value="store.autoLabelTotal ? (store.autoLabelCurrent / store.autoLabelTotal) * 100 : 0" />
            <p class="text-xs text-text-dim">{{ store.autoLabelCurrent }} / {{ store.autoLabelTotal }} — {{ store.autoLabelProgressMsg }}</p>
            <p v-if="store.autoLabelLastSample" class="text-xs text-text-dim">
              {{ t('lora.lastLabeled', { filename: store.autoLabelLastSample.filename, caption: store.autoLabelLastSample.caption || '—' }) }}
            </p>
          </div>
          <p v-if="store.autoLabelError" class="text-xs text-status-failed">{{ store.autoLabelError }}</p>
        </section>

        <!-- 3. Review samples -->
        <section class="space-y-3 rounded-xl border border-border bg-panel p-5">
          <h2 class="text-lg font-semibold text-text">{{ t('lora.step3Title') }}</h2>
          <div class="max-h-96 overflow-auto rounded-lg border border-border">
            <table class="w-full text-left text-xs">
              <thead class="sticky top-0 bg-panel-2 text-text-dim">
                <tr>
                  <th class="p-2">{{ t('lora.colFile') }}</th>
                  <th class="p-2">{{ t('lora.colDuration') }}</th>
                  <th class="p-2">✓</th>
                  <th class="p-2">{{ t('lora.colDescription') }}</th>
                  <th class="p-2">{{ t('lora.colGenre') }}</th>
                  <th class="p-2">BPM</th>
                  <th class="p-2">{{ t('lora.colKey') }}</th>
                  <th class="p-2">{{ t('lora.colInstrumental') }}</th>
                  <th class="p-2"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in store.samples" :key="s.index" class="border-t border-border/60 align-top">
                  <td class="p-2 text-text-dim">{{ s.filename }}</td>
                  <td class="p-2 text-text-dim">{{ formatDuration(s.duration) }}</td>
                  <td class="p-2">{{ s.labeled ? '✓' : '—' }}</td>
                  <td class="p-2"><input v-model="edited(s).caption" type="text" class="w-48 rounded border border-border bg-panel-2 p-1 text-text" /></td>
                  <td class="p-2"><input v-model="edited(s).genre" type="text" class="w-28 rounded border border-border bg-panel-2 p-1 text-text" /></td>
                  <td class="p-2"><input v-model.number="edited(s).bpm" type="number" class="w-16 rounded border border-border bg-panel-2 p-1 text-text" /></td>
                  <td class="p-2"><input v-model="edited(s).keyscale" type="text" class="w-16 rounded border border-border bg-panel-2 p-1 text-text" /></td>
                  <td class="p-2"><input v-model="edited(s).is_instrumental" type="checkbox" class="accent-accent1" /></td>
                  <td class="p-2"><button type="button" class="rounded bg-panel-2 px-2 py-1 text-text-dim hover:text-text" @click="saveSample(s)">{{ t('lora.save') }}</button></td>
                </tr>
              </tbody>
            </table>
          </div>

          <CollapsibleDetails :summary="t('lora.saveDatasetSummary')">
            <label class="space-y-1 block">
              <span class="text-xs text-text-dim">{{ t('lora.genreRatioLabel', { value: genreRatio }) }}</span>
              <input v-model.number="genreRatio" type="range" min="0" max="100" step="5" class="w-full accent-accent1" />
            </label>
            <div class="flex gap-2">
              <input v-model="savePath" type="text" class="flex-1 rounded-lg border border-border bg-panel-2 p-1.5 text-xs text-text" :placeholder="t('lora.savePathPlaceholder')" />
              <button type="button" class="rounded-lg bg-panel-2 px-3 py-1.5 text-xs text-text-dim hover:text-text" @click="onSaveDataset">{{ t('lora.save') }}</button>
            </div>
          </CollapsibleDetails>
        </section>

        <!-- 4. Preprocess -->
        <section class="space-y-3 rounded-xl border border-border bg-panel p-5">
          <h2 class="text-lg font-semibold text-text">{{ t('lora.step4Title') }}</h2>
          <p class="text-xs text-text-dim">{{ t('lora.preprocessHint') }}</p>
          <div class="flex flex-wrap items-center gap-3">
            <input v-model="outputDir" type="text" class="w-64 rounded-lg border border-border bg-panel-2 p-2 text-sm text-text" :placeholder="t('lora.outputDirPlaceholder')" @focus="suggestOutputDir" />
            <label class="flex items-center gap-2 text-sm text-text-dim"><input v-model="skipExisting" type="checkbox" class="accent-accent1" /> {{ t('lora.skipExisting') }}</label>
            <button
              type="button"
              class="accent-gradient inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              :disabled="store.preprocessStarting || store.preprocessRunning"
              @click="onPreprocess"
            >
              <span v-if="store.preprocessStarting || store.preprocessRunning" class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              {{ store.preprocessStarting ? t('lora.starting') : store.preprocessRunning ? t('lora.processing') : t('lora.startPreprocess') }}
            </button>
          </div>
          <div v-if="store.preprocessRunning || store.preprocessTotal" class="space-y-2">
            <ProgressBar :value="store.preprocessTotal ? (store.preprocessCurrent / store.preprocessTotal) * 100 : 0" />
            <p class="text-xs text-text-dim">{{ t('lora.tensorsProgress', { current: store.preprocessCurrent, total: store.preprocessTotal }) }}</p>
          </div>
          <p v-if="store.preprocessError" class="text-xs text-status-failed">{{ store.preprocessError }}</p>
          <p v-if="store.preprocessOutputDir" class="text-xs text-text-dim">{{ t('lora.done', { path: store.preprocessOutputDir }) }}</p>
        </section>

        <!-- 5. Training -->
        <section class="space-y-3 rounded-xl border border-border bg-panel p-5">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-text">{{ t('lora.step5Title') }}</h2>
            <HelpIconButton @click="helpOpen = 'training'" />
          </div>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label class="space-y-1">
              <span class="text-xs text-text-dim">{{ t('lora.tensorDirLabel') }}</span>
              <input v-model="tensorDir" type="text" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text" :placeholder="store.preprocessOutputDir || 'datasets/my-voice/tensors'" />
            </label>
            <label class="space-y-1">
              <span class="text-xs text-text-dim">{{ t('lora.outputDirLabel') }}</span>
              <input v-model="loraOutputDir" type="text" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text" />
            </label>
          </div>

          <CollapsibleDetails :summary="t('lora.advancedParams')">
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label class="space-y-1"><span class="text-xs text-text-dim">{{ t('lora.loraRank') }}</span><input v-model.number="loraRank" type="number" min="1" max="256" class="w-full rounded-lg border border-border bg-panel-2 p-1.5 text-sm text-text" /></label>
              <label class="space-y-1"><span class="text-xs text-text-dim">{{ t('lora.loraAlpha') }}</span><input v-model.number="loraAlpha" type="number" min="1" max="512" class="w-full rounded-lg border border-border bg-panel-2 p-1.5 text-sm text-text" /></label>
              <label class="space-y-1"><span class="text-xs text-text-dim">{{ t('lora.dropout') }}</span><input v-model.number="loraDropout" type="number" min="0" max="1" step="0.05" class="w-full rounded-lg border border-border bg-panel-2 p-1.5 text-sm text-text" /></label>
              <label class="space-y-1"><span class="text-xs text-text-dim">{{ t('lora.learningRate') }}</span><input v-model.number="learningRate" type="number" min="0" step="0.00001" class="w-full rounded-lg border border-border bg-panel-2 p-1.5 text-sm text-text" /></label>
              <label class="space-y-1"><span class="text-xs text-text-dim">{{ t('lora.epochs') }}</span><input v-model.number="trainEpochs" type="number" min="1" class="w-full rounded-lg border border-border bg-panel-2 p-1.5 text-sm text-text" /></label>
              <label class="space-y-1"><span class="text-xs text-text-dim">{{ t('lora.batchSize') }}</span><input v-model.number="trainBatchSize" type="number" min="1" class="w-full rounded-lg border border-border bg-panel-2 p-1.5 text-sm text-text" /></label>
              <label class="space-y-1"><span class="text-xs text-text-dim">{{ t('lora.gradientAccumulation') }}</span><input v-model.number="gradientAccumulation" type="number" min="1" class="w-full rounded-lg border border-border bg-panel-2 p-1.5 text-sm text-text" /></label>
              <label class="space-y-1"><span class="text-xs text-text-dim">{{ t('lora.saveEveryN') }}</span><input v-model.number="saveEveryNEpochs" type="number" min="1" class="w-full rounded-lg border border-border bg-panel-2 p-1.5 text-sm text-text" /></label>
              <label class="space-y-1"><span class="text-xs text-text-dim">{{ t('lora.seed') }}</span><input v-model.number="trainingSeed" type="number" class="w-full rounded-lg border border-border bg-panel-2 p-1.5 text-sm text-text" /></label>
            </div>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 text-sm text-text-dim"><input v-model="useFp8" type="checkbox" class="accent-accent1" /> {{ t('lora.fp8') }}</label>
              <label class="flex items-center gap-2 text-sm text-text-dim"><input v-model="gradientCheckpointing" type="checkbox" class="accent-accent1" /> {{ t('lora.gradientCheckpointing') }}</label>
            </div>
          </CollapsibleDetails>

          <div class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="accent-gradient inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              :disabled="store.trainingStarting || store.isTraining || (!tensorDir && !store.preprocessOutputDir)"
              @click="onStartTraining"
            >
              <span v-if="store.trainingStarting" class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              {{ store.trainingStarting ? t('lora.starting') : t('lora.startTraining') }}
            </button>
            <button v-if="store.isTraining" type="button" class="rounded-lg border border-status-failed px-4 py-2 text-sm font-medium text-status-failed" @click="store.stopTraining">
              {{ t('lora.stop') }}
            </button>
          </div>
          <p v-if="store.trainingError" class="text-xs text-status-failed">{{ store.trainingError }}</p>

          <div v-if="store.training && (store.isTraining || store.training.current_step > 0)" class="space-y-2 rounded-lg border border-border bg-panel-2/50 p-3">
            <ProgressBar :value="epochProgress" />
            <p class="text-xs text-text-dim">
              {{ t('lora.epochStatus', {
                epoch: store.training.current_epoch,
                total: store.totalEpochs ? ` / ${store.totalEpochs}` : '',
                step: store.training.current_step,
                loss: store.training.current_loss != null ? store.training.current_loss.toFixed(4) : '—',
                eta: etaLabel,
              }) }}
            </p>
            <p class="text-xs text-text-dim">{{ store.training.status }}</p>
            <a v-if="store.training.tensorboard_url" :href="store.training.tensorboard_url" target="_blank" rel="noopener" class="text-xs text-accent1 hover:underline">{{ t('lora.openTensorboard') }}</a>
          </div>
        </section>

        <!-- 6. Export -->
        <section class="space-y-3 rounded-xl border border-border bg-panel p-5">
          <h2 class="text-lg font-semibold text-text">{{ t('lora.step6Title') }}</h2>
          <p class="text-xs text-text-dim">{{ t('lora.exportHint') }}</p>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label class="space-y-1">
              <span class="text-xs text-text-dim">{{ t('lora.exportPathLabel') }}</span>
              <input v-model="exportPath" type="text" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text" placeholder="E:/AI/LoRAs/my-voice" />
            </label>
            <label class="space-y-1">
              <span class="text-xs text-text-dim">{{ t('lora.registryNameLabel') }}</span>
              <input v-model="registryName" type="text" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text" placeholder="my-voice" />
            </label>
          </div>
          <button type="button" class="accent-gradient rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" :disabled="store.exporting" @click="onExport">
            {{ store.exporting ? t('lora.exporting') : t('lora.exportAndRegister') }}
          </button>
          <p v-if="store.exportError" class="text-xs text-status-failed">{{ store.exportError }}</p>
          <p v-if="store.lastExportedPath" class="text-xs text-status-done">{{ t('lora.registered', { path: store.lastExportedPath }) }}</p>
        </section>
      </template>
    </template>

    <HelpModal :open="helpOpen === 'dataset'" :title="t('lora.help.dataset.title')" @close="helpOpen = null">
      <table class="w-full border-collapse text-xs">
        <thead>
          <tr class="border-b border-border text-left text-text">
            <th class="py-1 pr-2">{{ t('lora.help.dataset.fieldHeader') }}</th>
            <th class="py-1">{{ t('lora.help.dataset.whatHeader') }}</th>
          </tr>
        </thead>
        <tbody class="align-top">
          <tr v-for="row in (tm('lora.help.dataset.rows') as { field: string; what: string }[])" :key="row.field" class="border-b border-border/60">
            <td class="py-1.5 pr-2 font-medium text-text">{{ row.field }}</td>
            <td class="py-1.5">{{ row.what }}</td>
          </tr>
        </tbody>
      </table>
    </HelpModal>

    <HelpModal :open="helpOpen === 'training'" :title="t('lora.help.training.title')" @close="helpOpen = null">
      <table class="w-full border-collapse text-xs">
        <thead>
          <tr class="border-b border-border text-left text-text">
            <th class="py-1 pr-2">{{ t('lora.help.training.paramHeader') }}</th>
            <th class="py-1">{{ t('lora.help.training.whatHeader') }}</th>
          </tr>
        </thead>
        <tbody class="align-top">
          <tr v-for="row in (tm('lora.help.training.rows') as { param: string; what: string }[])" :key="row.param" class="border-b border-border/60">
            <td class="py-1.5 pr-2 font-medium text-text">{{ row.param }}</td>
            <td class="py-1.5">{{ row.what }}</td>
          </tr>
        </tbody>
      </table>
      <p class="text-xs text-text-dim">{{ t('lora.help.training.footer') }}</p>
    </HelpModal>
  </div>
</template>
