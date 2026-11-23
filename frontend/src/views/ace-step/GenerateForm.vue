<script setup lang="ts">
import KeyScalePicker from '../../components/shared/KeyScalePicker.vue'
import { aceKeyScale, formatKeyScale, normalizeKeyScale, parseKeyScale, withScaleHint } from '../../utils/keyScale'
import { withMetaHints } from '../../utils/aceHints'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch, watchEffect } from 'vue'
import { defaultTitle } from '../../utils/songTitle'
import { useI18n } from 'vue-i18n'
import { useAceStepStore } from '../../stores/aceStep'
import { useSystemStore } from '../../stores/system'
import type { GenerateMusicRequest } from '../../api/aceStep'
import type { JobLora } from '../../api/jobs'
import { useLoraRegistry } from '../../composables/useLoraRegistry'
import ChipGroup from '../../components/shared/ChipGroup.vue'
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
import ParamGroups from '../../components/shared/params/ParamGroups.vue'
import SimpleChoices from '../../components/shared/params/SimpleChoices.vue'
import type { SimpleChoice } from '../../components/shared/params/SimpleChoices.vue'
import ParamConsole from '../../components/shared/params/ParamConsole.vue'
import PresetMenu from '../../components/shared/PresetMenu.vue'
import { useEngineStart } from '../../composables/useEngineStart'
import { changedParts, resetRow, rowChanged } from '../../components/shared/params/types'
import type { ParamGroupSpec } from '../../components/shared/params/types'
import LyricsIcon from '../../components/shared/icons/LyricsIcon.vue'
import CoverIcon from '../../components/shared/icons/CoverIcon.vue'
import SlidersIcon from '../../components/shared/icons/SlidersIcon.vue'
import ClockIcon from '../../components/shared/icons/ClockIcon.vue'
import { aceVocalLanguage, ACE_VOCAL_LANGUAGES, guessVocalLanguage, vocalLanguageLabel } from '../../utils/vocalLanguages'
import { useEnginesStore } from '../../stores/engines'
import { useFormDraft } from '../../composables/useFormDraft'
import LibraryPicker from '../../components/editor/LibraryPicker.vue'
import { useRouter } from 'vue-router'

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
  // added later: presets saved before have none of these and keep the current values
  adv?: Partial<AdvState>
  loraPath?: string
  loraScale?: number
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
    adv: { ...adv },
    loraPath: selectedLoraPath.value,
    loraScale: loraScaleVal.value,
  }
  const idx = presets.value.findIndex((p) => p.name === preset.name)
  if (idx !== -1) presets.value[idx] = preset
  else presets.value.push(preset)
  localStorage.setItem('acestep_presets', JSON.stringify(presets.value))
  selectedPresetName.value = name
  newPresetName.value = ''
  showPresetInput.value = false
}

/**
 * A preset goes in as an undoable insert (the idea line's path): the fields it changes flash and "Put back" can
 * restore what it overwrote. Its empty texts are left out, so a settings-only preset keeps what is typed.
 */
function applyPreset(name: string) {
  const p = presets.value.find((x) => x.name === name)
  if (!p) return
  const params: Record<string, any> = {
    mode: p.mode === 'custom' ? 'custom' : 'simple',
    instrumental: !!p.instrumental,
    audio_format: p.audioFormat || undefined,
    key_scale: p.keyScale ?? '',
    time_signature: p.timeSignature ?? '',
    vocal_language: p.vocalLanguage || '',
  }
  if (p.simpleQuery) params.simpleQuery = p.simpleQuery
  if (p.customPrompt) params.customPrompt = p.customPrompt
  if (p.customLyrics) params.lyrics = p.customLyrics
  if (p.duration) params.duration = p.duration
  // a preset without these leaves them to the engine (as it did before): reset, not kept
  const reset: string[] = []
  if (p.bpm != null) params.bpm = p.bpm; else reset.push('bpm')
  if (p.inferenceSteps != null) params.inference_steps = p.inferenceSteps; else reset.push('inference_steps')
  if (p.guidanceScale != null) params.guidance_scale = p.guidanceScale; else reset.push('guidance_scale')
  if (reset.length) params.reset = reset
  if (p.selectedModel) params.model = p.selectedModel
  if (p.adv) params.adv = p.adv
  if (p.loraPath != null || typeof p.loraScale === 'number') params.lora = { path: p.loraPath, scale: p.loraScale }
  if (params.audio_format === undefined) delete params.audio_format
  store.requestInsertParams(params, { undoable: true })
}

function deletePreset(name: string) {
  presets.value = presets.value.filter((p) => p.name !== name)
  localStorage.setItem('acestep_presets', JSON.stringify(presets.value))
  if (selectedPresetName.value === name) selectedPresetName.value = ''
}

onMounted(loadPresets)

// Parameters put here from elsewhere (a card's reuse, "From an idea"). Applied on a change and on mount too: when
// they are sent while the engine is stopped, this form only appears once it runs, and they wait in the store.
// Fields lit up for a moment after an idea insert or its undo (the class is `idea-flash`).
const flash = reactive<Record<string, boolean>>({})
const flashTimers: Record<string, ReturnType<typeof setTimeout>> = {}
async function flashFields(keys: string[]) {
  for (const k of keys) flash[k] = false
  await nextTick() // after the mode switch rendered the field, and so the class restarts the animation
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
  // a field the insert sets or resets to the engine's default: either way its value now goes into the snapshot
  const hits = (k: string): boolean => params[k] != null || (Array.isArray(params.reset) && params.reset.includes(k))
  if (params.prompt || params.query || params.mode != null) {
    // a prompt switches to the custom mode, a query to the simple one: put the mode back too
    snap.mode = mode.value
    if (params.prompt) snap.customPrompt = customPrompt.value
    else if (params.query) snap.simpleQuery = simpleQuery.value
  }
  if (params.customPrompt != null) snap.customPrompt = customPrompt.value
  if (params.simpleQuery != null) snap.simpleQuery = simpleQuery.value
  if (params.lyrics != null) snap.lyrics = customLyrics.value
  if (params.instrumental != null) snap.instrumental = instrumental.value
  if (params.duration != null || params.audio_duration != null || params.reuse) {
    snap.duration = duration.value
    // after the duration (which turns it off): a length the model picked comes back as the model's again
    snap.lengthAuto = lengthAuto.value
  }
  if (params.audio_format != null) snap.audio_format = audioFormat.value
  if (hits('bpm')) { if (bpm.value != null) snap.bpm = bpm.value; else reset.push('bpm') }
  if (params.key_scale != null) snap.key_scale = keyScale.value // raw: normalizing it again gives the same
  if (params.time_signature != null) snap.time_signature = timeSignature.value
  if (params.vocal_language != null) snap.vocal_language = vocalLanguage.value
  if (hits('inference_steps')) { if (inferenceSteps.value != null) snap.inference_steps = inferenceSteps.value; else reset.push('inference_steps') }
  if (hits('guidance_scale')) { if (guidanceScale.value != null) snap.guidance_scale = guidanceScale.value; else reset.push('guidance_scale') }
  if (hits('seed')) { if (seedValue.value != null) snap.seed = seedValue.value; else reset.push('seed') }
  if (params.model != null) snap.model = selectedModel.value
  if (params.batch_size != null) snap.batch_size = batchSize.value
  // a reuse puts the whole tuning and the reference-task settings back to the take's: all of it is restorable
  if (params.adv != null || params.reuse) snap.adv = { ...adv }
  if (params.reuse) {
    snap.refTask = {
      coverStrength: coverStrength.value, repaintStart: repaintStart.value, repaintEnd: repaintEnd.value,
      trackName: trackName.value, trackClasses: [...trackClasses.value],
    }
  }
  if (params.lora != null) snap.lora = { path: selectedLoraPath.value, scale: loraScaleVal.value }
  if (reset.length) snap.reset = reset
  return snap
}

// Parameters put here from elsewhere (a card's reuse, "From an idea"). Applied on a change and on mount too: when
// they are sent while the engine is stopped, this form only appears once it runs, and they wait in the store.
function applyInsert(params: typeof store.pendingParamsInsert) {
  if (!params) return
  const undoable = store.pendingUndoable
  const lit = undoable || store.pendingFlash
  if (undoable) store.insertUndo = snapshotFor(params)
  const touched: string[] = []
  if (params.prompt || params.query) {
    if (params.prompt) {
      mode.value = 'custom'
      customPrompt.value = params.prompt
      touched.push('style')
    } else if (params.query) {
      mode.value = 'simple'
      simpleQuery.value = params.query
      touched.push('simple')
    }
  }
  if (params.lyrics != null) { customLyrics.value = params.lyrics; touched.push('lyrics') }
  if (params.instrumental != null) instrumental.value = params.instrumental
  // a saved request names the length audio_duration, an idea insert duration
  const length = params.duration ?? params.audio_duration
  if (typeof length === 'number' && length > 0) { duration.value = length; lengthAuto.value = false }
  else if (params.reuse) lengthAuto.value = true // a take whose length the model picked
  if (params.audio_format != null) audioFormat.value = params.audio_format
  if (params.bpm != null) bpm.value = params.bpm
  if (params.key_scale != null) keyScale.value = normalizeKeyScale(params.key_scale)
  if (params.time_signature != null) timeSignature.value = normalizeTimeSignature(params.time_signature)
  if (params.vocal_language != null) vocalLanguage.value = aceVocalLanguage(params.vocal_language)
  if (params.inference_steps != null) {
    inferenceSteps.value = params.inference_steps
    // the model switch below must not wipe these steps
    inferenceStepsTouched.value = true
  }
  if (params.guidance_scale != null) guidanceScale.value = params.guidance_scale
  if (params.seed != null) seedValue.value = params.seed
  if (params.model != null) {
    // the insert names the model: a draft's model still waiting for the engine's list must not override it
    draftModel = ''
    pickModel(params.model)
  }
  if (params.batch_size === 1 || params.batch_size === 2 || params.batch_size === 4) batchSize.value = params.batch_size
  if (params.reuse) {
    // a take's request lists only what differed from the defaults: the rest goes back to them
    setAdv(ADV_DEFAULTS)
    setAdv({
      shift: params.shift, inferMethod: params.infer_method, useAdg: params.use_adg, cfgStart: params.cfg_interval_start, cfgEnd: params.cfg_interval_end,
      tiled: params.use_tiled_decode, thinking: params.thinking, lmTemperature: params.lm_temperature, lmCfg: params.lm_cfg_scale, lmTopK: params.lm_top_k,
      lmTopP: params.lm_top_p, lmNegative: params.lm_negative_prompt, cotCaption: params.use_cot_caption,
      // sent off by the form itself when a language was picked: not a choice to carry over
      cotLanguage: params.vocal_language ? undefined : params.use_cot_language,
      coverNoise: params.cover_noise_strength, repaintMode: params.repaint_mode, repaintStrength: params.repaint_strength,
      wavCrossfade: params.repaint_wav_crossfade_sec, latentCrossfade: params.repaint_latent_crossfade_frames,
    })
    if (typeof params.audio_cover_strength === 'number') coverStrength.value = clamp(params.audio_cover_strength, 0, 1)
    if (typeof params.repainting_start === 'number') repaintStart.value = params.repainting_start
    if (typeof params.repainting_end === 'number') repaintEnd.value = params.repainting_end
    if (typeof params.track_name === 'string') trackName.value = normalizePart(params.track_name) || 'vocals'
    if (Array.isArray(params.track_classes)) trackClasses.value = [...new Set(params.track_classes.map(normalizePart).filter(Boolean))]
  }
  // from a preset or an undo snapshot: the tuning, the LoRA (only one still registered), the reference-task values
  if (params.adv && typeof params.adv === 'object') setAdv(params.adv)
  if (params.lora && typeof params.lora === 'object') {
    const path = params.lora.path
    if (typeof path === 'string') selectedLoraPath.value = !path || loras.value.some((l) => l.path === path) ? path : ''
    if (typeof params.lora.scale === 'number') loraScaleVal.value = clamp(params.lora.scale, 0, 1)
  }
  if (params.refTask && typeof params.refTask === 'object') {
    const r = params.refTask
    if (typeof r.coverStrength === 'number') coverStrength.value = clamp(r.coverStrength, 0, 1)
    if (r.repaintStart === null || typeof r.repaintStart === 'number') repaintStart.value = r.repaintStart
    if (r.repaintEnd === null || typeof r.repaintEnd === 'number') repaintEnd.value = r.repaintEnd
    if (typeof r.trackName === 'string') trackName.value = normalizePart(r.trackName) || 'vocals'
    if (Array.isArray(r.trackClasses)) trackClasses.value = r.trackClasses.map(normalizePart).filter(Boolean)
  }
  if (typeof params.lengthAuto === 'boolean') lengthAuto.value = params.lengthAuto
  // from a preset or an undo snapshot: the texts of both modes, then the mode itself, which wins
  if (params.customPrompt != null) { customPrompt.value = params.customPrompt; touched.push('style') }
  if (params.simpleQuery != null) { simpleQuery.value = params.simpleQuery; touched.push('simple') }
  if (Array.isArray(params.reset)) {
    for (const k of params.reset) {
      if (k === 'bpm') bpm.value = null
      else if (k === 'inference_steps') { inferenceSteps.value = null; inferenceStepsTouched.value = false }
      else if (k === 'guidance_scale') guidanceScale.value = null
      else if (k === 'seed') seedValue.value = null
    }
  }
  if (params.mode === 'simple' || params.mode === 'custom') {
    // an undo back to the other mode brings that mode's text back into view: that is what changed for the eye
    if (params.mode !== mode.value) touched.push(params.mode === 'simple' ? 'simple' : 'style')
    mode.value = params.mode
  }
  store.clearPendingParamsInsert()
  if (lit) flashFields(touched)
}
watch(() => store.pendingParamsInsert, applyInsert)
onMounted(() => applyInsert(store.pendingParamsInsert))

const mode = ref<Mode>('simple')
const simpleQuery = ref('')
const customPrompt = ref('')
const instrumental = ref(false)
const customLyrics = ref('')

/** The reference track. There is no switch: the "From a track" tab is the reference mode, and a chosen track is
 *  what turns it on (removing it goes back to a new song). The file cannot be kept in the draft, so neither is the mode. */
const refAudioFile = ref<File | null>(null)
const useRefAudio = computed(() => !!refAudioFile.value)
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

// What an idea insert would overwrite: the text fields of the mode that is on.
watchEffect(() => {
  store.formHasText = mode.value === 'simple'
    ? !!simpleQuery.value.trim()
    : !!(customLyrics.value.trim() || customPrompt.value.trim())
})

const selectedLoraPath = ref('')
const loraScaleVal = ref(1)
const newLoraName = ref('')
const newLoraPath = ref('')

const submitting = ref(false)
const formError = ref('')
const helpOpen = ref<null | 'style' | 'lyrics' | 'remix' | 'advanced'>(null)
const helpStyleExamples = computed(() => (tm('aceGen.help.style.examples') as string[]).map((text) => ({ text })))
/** An example from the help goes into its field, and the help closes. */
function useStyleExample(i: number) {
  customPrompt.value = (tm('aceGen.help.style.examples') as string[])[i] ?? customPrompt.value
  helpOpen.value = null
}
function useLyricsExample() {
  customLyrics.value = t('aceGen.help.lyrics.example')
  helpOpen.value = null
}

const TASK_TYPES = computed<{ value: TaskType; label: string }[]>(() => [
  { value: 'cover', label: t('aceGen.taskTypes.cover') },
  { value: 'repaint', label: t('aceGen.taskTypes.repaint') },
  { value: 'extract', label: t('aceGen.taskTypes.extract') },
  { value: 'lego', label: t('aceGen.taskTypes.lego') },
  { value: 'complete', label: t('aceGen.taskTypes.complete') },
])
// The parts ACE-Step knows (constants.TRACK_NAMES); another name is not understood by the model.
const TRACK_NAME_OPTIONS = ['vocals', 'backing_vocals', 'drums', 'bass', 'guitar', 'keyboard', 'strings', 'brass', 'woodwinds', 'synth', 'percussion', 'fx']
const trackOptions = computed(() => TRACK_NAME_OPTIONS.map((v) => ({ value: v, label: t(`aiPart.tracks.${v}`) })))
/** A part name from an older request or preset in the engine's vocabulary; '' when it has none. */
function normalizePart(name: string): string {
  if (name === 'piano' || name === 'keys') return 'keyboard'
  return TRACK_NAME_OPTIONS.includes(name) ? name : ''
}
// ACE-Step takes the beats per bar only (constants.VALID_TIME_SIGNATURES: 2, 3, 4, 6), as a string field
const TIME_SIGNATURES = [{ value: '4', label: '4/4' }, { value: '3', label: '3/4' }, { value: '6', label: '6/8' }, { value: '2', label: '2/4' }]
/** '4/4' (older presets and requests) as '4'; a metre the engine does not take is left to it (''). */
function normalizeTimeSignature(v: unknown): string {
  const beats = String(v ?? '').trim().split('/')[0]
  return TIME_SIGNATURES.some((x) => x.value === beats) ? beats : ''
}
const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v))

const engines = useEnginesStore()
const selectedModelInfo = computed(() => store.inventory?.models.find((m) => m.name === selectedModel.value))
/**
 * The checkpoint a take will use. Before the engine answers, the one the Models page starts it with (a base or SFT
 * there must not get Turbo's settings); 'turbo' only when neither is known.
 */
const modelName = computed(() =>
  selectedModelInfo.value?.name || selectedModel.value || store.inventory?.default_model || engines.state?.engines?.ace_step?.settings?.dit_model || 'turbo')
const isTurbo = computed(() => /turbo/i.test(modelName.value))
// ACE-Step's own UI: 8 steps on Turbo (more are cut to 8), 50 on SFT, 32 on base. The API's default is 8 for all.
const modelSteps = computed(() => (isTurbo.value ? 8 : /sft/i.test(modelName.value) ? 50 : 32))
/** The checkpoints on disk: the engine's list, else the Models page's; null while neither has loaded. */
const installedModels = computed<string[] | null>(() =>
  store.inventory ? store.inventory.models.map((m) => m.name) : engines.state?.engines?.ace_step?.choices?.dit_model ?? null)
/** A model named by a reused take or a preset, only if it is on disk: the engine would download a missing one (~20 GB). */
function pickModel(name: string) {
  if (installedModels.value?.includes(name)) selectedModel.value = name
}
onMounted(() => { if (!engines.state) void engines.load() })
const supportedTaskTypes = computed<Set<string>>(() => {
  const list = selectedModelInfo.value?.supported_task_types
  return list && list.length ? new Set(list) : new Set(TASK_TYPES.value.map((tt) => tt.value))
})
const taskTypeOptions = computed(() => TASK_TYPES.value.map((tt) => ({ ...tt, disabled: !supportedTaskTypes.value.has(tt.value), reason: t('aceGen.taskUnsupported') })))

watch(
  () => store.inventory,
  (inv) => {
    if (inv && !selectedModel.value) selectedModel.value = inv.default_model
  },
  { immediate: true },
)

watch([isTurbo, modelSteps], ([turbo]) => {
  if (!inferenceStepsTouched.value) inferenceSteps.value = null // let placeholder show the right default
  else if (turbo && inferenceSteps.value != null && inferenceSteps.value > 8) {
    // Turbo cuts anything above 8 to 8: back to its default
    inferenceSteps.value = null
    inferenceStepsTouched.value = false
  }
  if (turbo) guidanceScale.value = null
}, { immediate: true })

watch(supportedTaskTypes, (set) => {
  if (!set.has(taskType.value)) {
    const fallback = TASK_TYPES.value.find((tt) => set.has(tt.value))
    if (fallback) taskType.value = fallback.value
  }
})

// The LoRA is not put on the engine from here: each job carries the choice (path, name, strength) and the backend's
// queue puts it on ACE-Step before that job runs (also probing <path>/adapter and <path>/adapter/adapter, where the
// trainer's checkpoints keep the PEFT adapter), so a queued job is made with the LoRA chosen when it was sent.
function loraChoice(): JobLora | null {
  const path = selectedLoraPath.value
  if (!path) return null
  return { path, name: loras.value.find((l) => l.path === path)?.name || '', scale: loraScaleVal.value }
}

function onRefFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  if (file) refAudioFile.value = file
  input.value = '' // the same file again is a change too
}
// ---- The reference's drop zone and the library picker ----
const refDragOver = ref(false)
const refLoading = ref(false)
const refPickerOpen = ref(false)
function onRefDrop(e: DragEvent) {
  refDragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file && (file.type.startsWith('audio/') || /\.(wav|mp3|flac|ogg|m4a|aac|opus)$/i.test(file.name))) refAudioFile.value = file
}
/** A library track comes in as a file, as an upload would: the request sends the audio itself. */
async function onRefPick(payload: { sourceUrl: string; sourceLabel: string }) {
  refPickerOpen.value = false
  refLoading.value = true
  formError.value = ''
  try {
    const resp = await fetch(payload.sourceUrl)
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const blob = await resp.blob()
    const ext = (blob.type.split('/')[1] || 'wav').replace('mpeg', 'mp3').replace(/^x-/, '')
    const name = /\.[a-z0-9]{2,4}$/i.test(payload.sourceLabel) ? payload.sourceLabel : `${payload.sourceLabel}.${ext}`
    refAudioFile.value = new File([blob], name, { type: blob.type || 'audio/wav' })
  } catch (err) {
    formError.value = err instanceof Error ? err.message : String(err)
  } finally {
    refLoading.value = false
  }
}
const router = useRouter()
/** "Train your own": ACE-Step's LoRA mode on the Create page. */
function openLoraTraining() {
  void router.push({ name: 'create', query: { engine: 'ace_step', ace: 'lora' } })
}

function registerNewLora() {
  addLora(newLoraName.value, newLoraPath.value)
  newLoraName.value = ''
  newLoraPath.value = ''
}


const system = useSystemStore()
const LM_MIN_VRAM = 8.5 * 1024 ** 3

/** ACE-Step skips its language model on cards up to ~8 GB, so "describe the music" (sample_mode) cannot run there. */
function lmAvailable(): boolean {
  const total = system.resources?.vram?.total
  return total == null || total > LM_MIN_VRAM
}

// Create works while the engine is stopped: the backend's queue starts it for the job.
const { createLabel } = useEngineStart('ace_step')

// ---- Validation: an error names its field, switches to the tab that holds it and puts the focus there ----
const ERROR_ID = 'ace-form-error'
let invalidEl: HTMLElement | null = null
function clearInvalid() {
  if (invalidEl) {
    invalidEl.removeAttribute('aria-invalid')
    invalidEl.removeAttribute('aria-describedby')
    invalidEl.removeEventListener('input', onInvalidEdit)
    invalidEl.removeEventListener('change', onInvalidEdit)
  }
  invalidEl = null
}
/** Editing the field the error named clears the error: it no longer describes what is there. */
function onInvalidEdit() {
  clearInvalid()
  formError.value = ''
}
/**
 * Shows `message` in the footer's alert and marks the field: aria-invalid + aria-describedby on the element `find`
 * returns once its tab is shown. Some fields live in shared components (the tag input, the tuning rows), so the
 * attributes are set on the DOM element rather than bound in this template.
 */
async function fail(message: string, tab: (typeof FORM_TABS)[number], find: () => HTMLElement | null | undefined) {
  clearInvalid()
  formError.value = message
  formTab.value = tab
  await nextTick()
  const el = find()
  if (!el) return
  invalidEl = el
  el.setAttribute('aria-invalid', 'true')
  el.setAttribute('aria-describedby', ERROR_ID)
  el.addEventListener('input', onInvalidEdit)
  el.addEventListener('change', onInvalidEdit)
  el.focus()
}
const byId = (id: string) => () => document.getElementById(id)

/** After a successful Create: how many takes went into the queue, said politely next to the button. */
const queuedTakes = ref(0)
function toSession() {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  document.getElementById('create-session')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

async function submit() {
  formError.value = ''
  clearInvalid()
  queuedTakes.value = 0

  // Create pressed on "From a track" with no track: that tab means a reference, not a new song made by surprise
  if (formTab.value === 'ref' && !refAudioFile.value) {
    void fail(t('aceGen.refNeeded'), 'ref', byId('ace-ref-file'))
    return
  }

  const req: GenerateMusicRequest = {
    // left to the model (a description, no length picked): not sent, so a reuse of the take leaves it to the model too
    ...(lengthIsAuto.value ? {} : { audio_duration: duration.value }),
    batch_size: batchSize.value,
    audio_format: audioFormat.value,
  }
  let title = ''

  if (mode.value === 'simple') {
    if (!simpleQuery.value.trim()) {
      void fail(t('aceGen.enterDescription'), 'song', byId('ace-simple'))
      return
    }
    title = defaultTitle({ idea: simpleQuery.value })
    if (useRefAudio.value || !lmAvailable()) {
      // sample_mode needs ACE-Step's language model, which it does not load on cards up to ~8 GB
      req.prompt = simpleQuery.value.trim()
      if (!useRefAudio.value) req.lyrics = ''
    } else {
      // the model overwrites the request's length, tempo and key with its own: what was picked goes in words
      req.sample_query = withMetaHints(simpleQuery.value.trim(), {
        seconds: lengthIsAuto.value ? null : duration.value, bpm: bpm.value, key: keyScale.value ? aceKeyScale(keyScale.value) : '',
      })
      req.sample_mode = true
    }
  } else {
    if (!customPrompt.value.trim()) {
      // the style field is the shared tag input: its own <input> takes the focus and the marks
      void fail(t('aceGen.enterStyle'), 'song', () => document.querySelector<HTMLElement>('#ace-style'))
      return
    }
    title = defaultTitle({ lyrics: instrumental.value ? '' : customLyrics.value, style: customPrompt.value })
    req.prompt = customPrompt.value.trim()
    req.lyrics = instrumental.value ? '' : customLyrics.value
  }

  // from a description the language model overwrites these with its own (they went in words above); they are
  // still sent, so the take remembers them for a reuse. The metre has no wording the model follows: not sent there.
  if (bpm.value) req.bpm = bpm.value
  if (keyScale.value) {
    req.key_scale = aceKeyScale(keyScale.value)
    // The key field is major / minor only: another scale is named in the style text too.
    if (req.prompt) req.prompt = withScaleHint(req.prompt, keyScale.value)
  }
  if (timeSignature.value && !modelPicksLength.value) req.time_signature = timeSignature.value
  // a guessed language ACE-Step does not list (Kazakh) goes as its own "unknown", not as the API's default English
  const language = vocalLanguage.value || (autoVocalLanguage.value && (aceVocalLanguage(autoVocalLanguage.value) || 'unknown'))
  if (language) req.vocal_language = language
  // Turbo cuts steps above 8 to 8 but takes fewer; the other models get theirs always: the API's default is Turbo's 8
  if (isTurbo.value) {
    if (inferenceSteps.value) req.inference_steps = clamp(inferenceSteps.value, 1, 8)
  } else {
    req.inference_steps = inferenceSteps.value || modelSteps.value
  }
  if (guidanceScale.value != null && !isTurbo.value) req.guidance_scale = guidanceScale.value
  if (!isTurbo.value && (adv.cfgStart ?? 0) >= (adv.cfgEnd ?? 1)) {
    // the two rows are in the manual tuning: show it and focus the "from" number (ParamRow names it by its label)
    tuningMode.value = 'manual'
    const label = t('aceGen.manual.cfgStart')
    void fail(t('aceGen.cfgIntervalOrder'), 'tuning', () =>
      [...document.querySelectorAll<HTMLElement>('#ace-panel-tuning input[type="number"]')].find((x) => x.getAttribute('aria-label') === label))
    return
  }
  if (seedValue.value != null) {
    req.seed = seedValue.value
    req.use_random_seed = false
  } else {
    req.use_random_seed = true
  }
  if (selectedModel.value) req.model = selectedModel.value
  Object.assign(req, advancedFields())

  let refFile: File | null = null
  if (refAudioFile.value) {
    refFile = refAudioFile.value
    req.task_type = taskType.value
    if (taskType.value === 'repaint') {
      const start = typeof repaintStart.value === 'number' ? repaintStart.value : null
      const end = typeof repaintEnd.value === 'number' ? repaintEnd.value : null
      if (end != null && end <= (start ?? 0)) {
        void fail(t('aceGen.repaintOrder'), 'ref', byId('ace-repaint-end'))
        return
      }
      if (start != null) req.repainting_start = start
      if (end != null) req.repainting_end = end
      // the range goes to the model as a 0/1 mask, as ACE-Step's own UI and the editor's AI parts do
      req.chunk_mask_mode = 'explicit'
    }
    if (taskType.value === 'extract' || taskType.value === 'lego') req.track_name = trackName.value
    if (taskType.value === 'complete') req.track_classes = trackClasses.value
    if (taskType.value === 'cover' || taskType.value === 'repaint') req.audio_cover_strength = coverStrength.value
  }

  submitting.value = true
  try {
    // the job goes to the backend's queue with the LoRA chosen here; the form stays as it was filled in
    await store.submit(req, refFile, title, loraChoice())
    queuedTakes.value = batchSize.value
  } catch (err) {
    formError.value = err instanceof Error ? err.message : String(err)
  } finally {
    submitting.value = false
  }
}
// ---- The form's tabs: the song first, a reference track, the tuning; a dot marks a tab that is in use ----
const FORM_TABS = ['song', 'ref', 'tuning'] as const
const TAB_ICONS = { song: LyricsIcon, ref: CoverIcon, tuning: SlidersIcon } as const
const formTab = ref<(typeof FORM_TABS)[number]>('song')
const tabChanged = computed<Record<(typeof FORM_TABS)[number], boolean>>(() => ({ song: false, ref: useRefAudio.value, tuning: manualChanged.value > 0 }))

// ---- Length and the model as choices; any other length is set with the slider in the tuning ----
const LENGTHS = [30, 60, 120, 180, 240, 300]
/** A description written into a song by the language model: it picks the length itself (asked 20 s, got 143). */
const modelPicksLength = computed(() => mode.value === 'simple' && !useRefAudio.value && lmAvailable())
/** No length picked yet: from a description the model then chooses it. Picking one asks the model for it in words. */
const lengthAuto = ref(true)
const lengthIsAuto = computed(() => modelPicksLength.value && lengthAuto.value)
/** A length button: picks it; the picked one again goes back to the model's choice (where it has one). */
function pickLength(s: number) {
  if (modelPicksLength.value && !lengthAuto.value && duration.value === s) { lengthAuto.value = true; return }
  duration.value = s
  lengthAuto.value = false
}
const lengthLabel = (s: number): string => (s < 60 ? `0:${s}` : t('yueGen.length.minutes', { n: s / 60 }))
const clock = (s: number): string => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`
const models = computed(() => store.inventory?.models ?? [])
/** "acestep-v15-turbo" as "Turbo": the part that tells the checkpoints apart. */
function shortModel(name: string): string {
  const short = name.replace(/^ace[-_]?step[-_]?v?[\d.]*[-_]?/i, '') || name
  return short.charAt(0).toUpperCase() + short.slice(1)
}

// ---- Seed: empty lets the engine pick one for each take ----
const seedRandom = computed(() => seedValue.value == null)
function toggleSeedRandom() {
  seedValue.value = seedRandom.value ? Math.floor(Math.random() * 2147483647) : null
}
function onSeedInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value
  seedValue.value = raw === '' || !Number.isFinite(Number(raw)) ? null : Number(raw)
}

// ---- The tuning: every parameter in groups (the same rows as the other engines' forms) ----
// ---- The API's other parameters, by hand: null (or the default) leaves each to the engine ----
const ADV_DEFAULTS = {
  shift: null as number | null,
  inferMethod: 'ode' as 'ode' | 'sde',
  useAdg: false,
  cfgStart: null as number | null,
  cfgEnd: null as number | null,
  tiled: true,
  thinking: false,
  lmTemperature: null as number | null,
  lmCfg: null as number | null,
  lmTopK: null as number | null,
  lmTopP: null as number | null,
  lmNegative: 'NO USER INPUT',
  cotCaption: true,
  cotLanguage: true,
  coverNoise: null as number | null,
  repaintMode: 'balanced' as 'conservative' | 'balanced' | 'aggressive',
  repaintStrength: null as number | null,
  wavCrossfade: null as number | null,
  latentCrossfade: null as number | null,
}
type AdvState = typeof ADV_DEFAULTS
const adv = reactive<AdvState>({ ...ADV_DEFAULTS })
/** Puts the known keys of `values` into the tuning (a preset or a reused take); unknown or missing keys are skipped. */
function setAdv(values: Partial<Record<keyof AdvState, unknown>>) {
  for (const k of Object.keys(ADV_DEFAULTS) as (keyof AdvState)[]) {
    const v = values[k]
    if (v === undefined) continue
    const def = ADV_DEFAULTS[k]
    // the default's type decides: a number field also takes null (the engine's default)
    if (def === null ? v === null || typeof v === 'number' : typeof v === typeof def) (adv as Record<string, unknown>)[k] = v
  }
  if (adv.lmTopP != null) adv.lmTopP = Math.min(0.99, adv.lmTopP)
}

// ---- The draft: what was typed and picked survives a reload and a visit to another page ----
// Restored here, during setup: a pending insert (reuse, idea, preset) is applied at mount, after it, and wins.
// The model goes through its own ref: a model not on disk must not be selected (pickModel guards that), and the
// engine's list may arrive later. The uploaded reference file cannot be kept, so its switch is not kept either.
const draftModelField = ref('')
useFormDraft('ace_step', {
  mode, simpleQuery, customPrompt, customLyrics, instrumental, duration, lengthAuto, audioFormat, bpm, keyScale, timeSignature,
  vocalLanguage, inferenceSteps, inferenceStepsTouched, guidanceScale, seedValue, batchSize, adv: adv as unknown as Record<string, unknown>,
  loraPath: selectedLoraPath, loraScale: loraScaleVal, model: draftModelField,
  taskType, repaintStart, repaintEnd, trackName, trackClasses, coverStrength,
})
// a draft from an older build or edited by hand: only values the form can hold
if (mode.value !== 'simple' && mode.value !== 'custom') mode.value = 'simple'
if (![1, 2, 4].includes(batchSize.value)) batchSize.value = 1
if (!['mp3', 'wav', 'flac'].includes(audioFormat.value)) audioFormat.value = 'mp3'
if (!TASK_TYPES.value.some((x) => x.value === taskType.value)) taskType.value = 'cover'
if (!(duration.value > 0)) duration.value = 120
keyScale.value = normalizeKeyScale(keyScale.value)
timeSignature.value = normalizeTimeSignature(timeSignature.value)
vocalLanguage.value = aceVocalLanguage(vocalLanguage.value)
trackName.value = normalizePart(trackName.value) || 'vocals'
trackClasses.value = trackClasses.value.filter((x) => typeof x === 'string').map(normalizePart).filter(Boolean)
coverStrength.value = clamp(Number(coverStrength.value) || 0, 0, 1)
loraScaleVal.value = clamp(Number(loraScaleVal.value) || 0, 0, 1)
// a LoRA removed from the list since: none, as a preset does
if (selectedLoraPath.value && !loras.value.some((l) => l.path === selectedLoraPath.value)) selectedLoraPath.value = ''
if (adv.inferMethod !== 'ode' && adv.inferMethod !== 'sde') adv.inferMethod = 'ode'
if (!['conservative', 'balanced', 'aggressive'].includes(adv.repaintMode)) adv.repaintMode = 'balanced'
setAdv({ ...adv }) // clamps top-p
let draftModel = draftModelField.value
watch(installedModels, (list) => {
  if (!list || !draftModel) return
  pickModel(draftModel)
  draftModel = ''
  draftModelField.value = selectedModel.value
}, { immediate: true })
// until the draft's model is settled, the default the inventory picks must not overwrite it in the saved draft
watch(selectedModel, (m) => { if (!draftModel) draftModelField.value = m })
/** The LM writes only from text: a reference-track task never runs it (and it is not loaded on small cards). */
const lmUsed = computed(() => lmAvailable() && !useRefAudio.value)
/** The manual parameters as request fields: only what differs from the engine's own default. */
function advancedFields(): Partial<GenerateMusicRequest> {
  const f: Partial<GenerateMusicRequest> = {}
  const usesGuidance = !isTurbo.value
  // shift acts on Turbo too (measured), though the API's description says base models only
  if (adv.shift != null) f.shift = adv.shift
  if (adv.inferMethod !== 'ode') f.infer_method = adv.inferMethod
  if (usesGuidance && adv.useAdg) f.use_adg = true
  if (usesGuidance && adv.cfgStart != null) f.cfg_interval_start = adv.cfgStart
  if (usesGuidance && adv.cfgEnd != null) f.cfg_interval_end = adv.cfgEnd
  if (!adv.tiled) f.use_tiled_decode = false
  if (lmUsed.value) {
    if (adv.thinking) f.thinking = true
    if (adv.lmTemperature != null) f.lm_temperature = adv.lmTemperature
    if (adv.lmCfg != null) f.lm_cfg_scale = adv.lmCfg
    if (adv.lmTopK != null && adv.lmTopK > 0) f.lm_top_k = adv.lmTopK
    // ACE-Step reads 1.0 as its default 0.9
    if (adv.lmTopP != null) f.lm_top_p = Math.min(0.99, adv.lmTopP)
    if (adv.lmNegative.trim() && adv.lmNegative !== 'NO USER INPUT') f.lm_negative_prompt = adv.lmNegative
    if (!adv.cotCaption) f.use_cot_caption = false
    // with it on the LM's guess replaces a language picked by hand
    if (!adv.cotLanguage || vocalLanguage.value) f.use_cot_language = false
  }
  if (useRefAudio.value && (taskType.value === 'cover' || taskType.value === 'repaint') && adv.coverNoise != null) f.cover_noise_strength = adv.coverNoise
  if (useRefAudio.value && taskType.value === 'repaint') {
    if (adv.repaintMode !== 'balanced') f.repaint_mode = adv.repaintMode
    if (adv.repaintMode === 'balanced' && adv.repaintStrength != null) f.repaint_strength = adv.repaintStrength
    if (adv.wavCrossfade != null) f.repaint_wav_crossfade_sec = adv.wavCrossfade
    if (adv.latentCrossfade != null) f.repaint_latent_crossfade_frames = adv.latentCrossfade
  }
  return f
}

const manualGroups = computed<ParamGroupSpec[]>(() => [
  {
    id: 'sound', title: t('yueGen.manual.groups.sound.title'), sub: t('yueGen.manual.groups.sound.sub'), column: 0,
    quick: models.value.length > 1 && models.value.length <= 4
      ? { options: models.value.map((m) => ({ id: m.name, label: shortModel(m.name) })), active: selectedModel.value, pick: (id) => { selectedModel.value = id } }
      : undefined,
    rows: [
      {
        kind: 'select', id: 'model', label: t('aceGen.model'), tech: 'model', value: selectedModel.value, def: store.inventory?.default_model ?? selectedModel.value,
        // while the engine is stopped it has no list yet: the checkpoints on disk (the Models page's), and none picked
        // is the one the engine starts with, said as such rather than an empty box
        options: [
          ...(selectedModel.value ? [] : [{ value: '', label: t('aceGen.modelDefault', { name: shortModel(modelName.value).toLowerCase() }) }]),
          ...(models.value.length ? models.value.map((m) => m.name) : installedModels.value ?? []).map((n) => ({ value: n, label: n })),
        ],
        set: (v) => { selectedModel.value = v },
      },
      {
        kind: 'slider', id: 'steps', label: t('yueGen.manual.params.steps'), tech: 'inference_steps', value: inferenceSteps.value, def: modelSteps.value, min: 1, max: isTurbo.value ? 8 : 200, step: 1,
        warn: isTurbo.value ? t('aceGen.manual.turboSteps') : undefined,
        set: (v) => {
          const steps = v == null ? null : clamp(Math.round(v), 1, isTurbo.value ? 8 : 200)
          inferenceSteps.value = steps
          inferenceStepsTouched.value = steps != null
        },
      },
      {
        kind: 'slider', id: 'guidance', label: t('yueGen.manual.params.cfg'), tech: 'guidance_scale', value: guidanceScale.value, def: 7, min: 1, max: 15, step: 0.1,
        disabled: isTurbo.value, why: t('aceGen.guidanceUnused'), set: (v) => { guidanceScale.value = v },
      },
      {
        kind: 'select', id: 'lora', label: 'LoRA', tech: 'lora', value: selectedLoraPath.value, def: '',
        options: [{ value: '', label: t('aceGen.noLora') }, ...loras.value.map((l) => ({ value: l.path, label: l.name }))], set: (v) => { selectedLoraPath.value = v },
      },
      {
        kind: 'slider', id: 'loraScale', label: t('aceGen.manual.loraScale'), tech: 'lora scale', value: loraScaleVal.value, def: 1, min: 0, max: 1, step: 0.05,
        // the engine takes 0..1 only
        disabled: !selectedLoraPath.value, why: t('aceGen.manual.pickLora'), set: (v) => { loraScaleVal.value = v == null ? 1 : clamp(v, 0, 1) },
      },
      {
        kind: 'slider', id: 'shift', label: t('aceGen.manual.shift'), tech: 'shift', value: adv.shift, def: 3, min: 1, max: 5, step: 0.1,
        set: (v) => { adv.shift = v },
      },
      {
        kind: 'select', id: 'infer', label: t('aceGen.manual.infer'), tech: 'infer_method', value: adv.inferMethod, def: 'ode',
        options: [{ value: 'ode', label: t('aceGen.manual.ode') }, { value: 'sde', label: t('aceGen.manual.sde') }], warn: !isTurbo.value && adv.inferMethod === 'sde' ? t('aceGen.manual.sdeBaseWarn') : undefined,
        set: (v) => { adv.inferMethod = v as 'ode' | 'sde' },
      },
      {
        kind: 'toggle', id: 'adg', label: t('aceGen.manual.adg'), tech: 'use_adg', value: adv.useAdg, def: false,
        disabled: isTurbo.value, why: t('aceGen.manual.baseOnly'), set: (v) => { adv.useAdg = v },
      },
      {
        kind: 'slider', id: 'cfgStart', label: t('aceGen.manual.cfgStart'), tech: 'cfg_interval_start', value: adv.cfgStart, def: 0, min: 0, max: 1, step: 0.01,
        disabled: isTurbo.value, why: t('aceGen.manual.baseOnly'), set: (v) => { adv.cfgStart = v },
      },
      {
        kind: 'slider', id: 'cfgEnd', label: t('aceGen.manual.cfgEnd'), tech: 'cfg_interval_end', value: adv.cfgEnd, def: 1, min: 0, max: 1, step: 0.01,
        disabled: isTurbo.value, why: t('aceGen.manual.baseOnly'), set: (v) => { adv.cfgEnd = v },
      },
    ],
  },
  {
    id: 'music', title: t('aceGen.manual.musicTitle'), sub: t('aceGen.manual.musicSub'), column: 1,
    rows: [
      // from a description the language model sets these itself (modelPicksLength: the same case)
      {
        kind: 'slider', id: 'bpm', label: t('aceGen.manual.bpm'), tech: 'bpm', value: bpm.value, def: 120, min: 30, max: 300, step: 1, auto: t('aceGen.bpmPlaceholder'),
        set: (v) => { bpm.value = v == null ? null : clamp(Math.round(v), 30, 300) },
      },
      { kind: 'slot', id: 'key', label: t('aceGen.keyScale'), tech: 'key_scale', changed: keyScale.value !== '', reset: () => { keyScale.value = '' } },
      {
        kind: 'select', id: 'time', label: t('aceGen.timeSignature'), tech: 'time_signature', value: timeSignature.value, def: '',
        options: [{ value: '', label: t('aceGen.timeSignatureAuto') }, ...TIME_SIGNATURES], set: (v) => { timeSignature.value = v },
        disabled: modelPicksLength.value, why: t('aceGen.manual.metaByModel'),
      },
      {
        kind: 'select', id: 'language', label: t('aceGen.vocalLanguage'), tech: 'vocal_language', value: vocalLanguage.value, def: '',
        options: [
          { value: '', label: aceVocalLanguage(autoVocalLanguage.value) ? `${t('aceGen.vocalLanguageAuto')}: ${vocalLanguageLabel(autoVocalLanguage.value)}` : t('aceGen.vocalLanguageAuto') },
          ...ACE_VOCAL_LANGUAGES.map((l) => ({ value: l.code, label: l.label })),
        ],
        set: (v) => { vocalLanguage.value = v },
      },
    ],
  },
  {
    id: 'lm', title: t('aceGen.manual.lmTitle'), sub: t('aceGen.manual.lmSub'), column: 1,
    rows: (() => {
      const off = !lmUsed.value
      const why = lmAvailable() ? t('aceGen.manual.noLmWithRef') : t('aceGen.manual.noLm')
      const picked = !!vocalLanguage.value
      const rows: ParamGroupSpec['rows'] = [
        { kind: 'toggle', id: 'thinking', label: t('aceGen.manual.thinking'), tech: 'thinking', value: adv.thinking, def: false, disabled: off, why, set: (v) => { adv.thinking = v } },
        { kind: 'slider', id: 'lmTemp', label: t('yueGen.manual.params.temperature'), tech: 'lm_temperature', value: adv.lmTemperature, def: 0.85, min: 0, max: 2, step: 0.05, disabled: off, why, set: (v) => { adv.lmTemperature = v } },
        { kind: 'slider', id: 'lmCfg', label: t('aceGen.manual.lmCfg'), tech: 'lm_cfg_scale', value: adv.lmCfg, def: 2.5, min: 1, max: 5, step: 0.1, disabled: off, why, set: (v) => { adv.lmCfg = v } },
        // ACE-Step reads 1.0 as its default 0.9: 0.99 is the most it takes
        { kind: 'slider', id: 'lmTopP', label: t('yueGen.manual.params.top_p'), tech: 'lm_top_p', value: adv.lmTopP, def: 0.9, min: 0.05, max: 0.99, step: 0.01, disabled: off, why, set: (v) => { adv.lmTopP = v == null ? null : clamp(v, 0.01, 0.99) } },
        { kind: 'slider', id: 'lmTopK', label: t('yueGen.manual.params.top_k'), tech: 'lm_top_k', value: adv.lmTopK, def: 0, min: 0, max: 200, step: 1, auto: t('aceGen.manual.off'), disabled: off, why, set: (v) => { adv.lmTopK = v } },
        { kind: 'text', id: 'lmNeg', label: t('aceGen.manual.lmNegative'), tech: 'lm_negative_prompt', value: adv.lmNegative, def: 'NO USER INPUT', disabled: off, why, set: (v) => { adv.lmNegative = v || 'NO USER INPUT' } },
        {
          kind: 'toggle', id: 'cotCaption', label: t('aceGen.manual.cotCaption'), tech: 'use_cot_caption', value: adv.cotCaption, def: true, disabled: off, why,
          warn: adv.cotCaption && mode.value === 'custom' ? t('aceGen.manual.cotCaptionHint') : undefined, set: (v) => { adv.cotCaption = v },
        },
        // a language picked by hand is sent with this off: on, the LM's guess would replace it
        {
          kind: 'toggle', id: 'cotLanguage', label: t('aceGen.manual.cotLanguage'), tech: 'use_cot_language', value: adv.cotLanguage, def: true,
          disabled: off || picked, why: off ? why : t('aceGen.manual.cotLanguagePicked'), set: (v) => { adv.cotLanguage = v },
        },
      ]
      return rows
    })(),
  },
  {
    id: 'ref', title: t('aceGen.manual.refTitle'), sub: t('aceGen.manual.refSub'), column: 0,
    rows: (() => {
      const noRef = !useRefAudio.value
      const coverLike = taskType.value === 'cover' || taskType.value === 'repaint'
      const repaint = taskType.value === 'repaint'
      const whyRef = t('aceGen.manual.needRef')
      const rows: ParamGroupSpec['rows'] = [
        {
          kind: 'slider', id: 'coverNoise', label: t('aceGen.manual.coverNoise'), tech: 'cover_noise_strength', value: adv.coverNoise, def: 0, min: 0, max: 1, step: 0.05,
          disabled: noRef || !coverLike, why: noRef ? whyRef : t('aceGen.manual.coverRepaintOnly'), set: (v) => { adv.coverNoise = v },
        },
        {
          kind: 'select', id: 'repaintMode', label: t('aceGen.manual.repaintMode'), tech: 'repaint_mode', value: adv.repaintMode, def: 'balanced',
          options: (['conservative', 'balanced', 'aggressive'] as const).map((m) => ({ value: m, label: t(`aceGen.manual.repaintModes.${m}`) })),
          disabled: noRef || !repaint, why: noRef ? whyRef : t('aceGen.manual.repaintOnly'), set: (v) => { adv.repaintMode = v as typeof adv.repaintMode },
        },
        {
          kind: 'slider', id: 'repaintStrength', label: t('aceGen.manual.repaintStrength'), tech: 'repaint_strength', value: adv.repaintStrength, def: 0.5, min: 0, max: 1, step: 0.05,
          disabled: noRef || !repaint || adv.repaintMode !== 'balanced', why: noRef ? whyRef : !repaint ? t('aceGen.manual.repaintOnly') : t('aceGen.manual.balancedOnly'), set: (v) => { adv.repaintStrength = v == null ? null : clamp(v, 0, 1) },
        },
        {
          kind: 'slider', id: 'wavCrossfade', label: t('aceGen.manual.wavCrossfade'), tech: 'repaint_wav_crossfade_sec', value: adv.wavCrossfade, def: 0, min: 0, max: 2, step: 0.05,
          note: (v) => t('yueGen.manual.seconds', { n: v.toFixed(2) }), disabled: noRef || !repaint, why: noRef ? whyRef : t('aceGen.manual.repaintOnly'), set: (v) => { adv.wavCrossfade = v },
        },
        {
          kind: 'slider', id: 'latentCrossfade', label: t('aceGen.manual.latentCrossfade'), tech: 'repaint_latent_crossfade_frames', value: adv.latentCrossfade, def: 10, min: 0, max: 50, step: 1,
          note: (v) => t('yueGen.manual.seconds', { n: (v / 25).toFixed(2) }), disabled: noRef || !repaint, why: noRef ? whyRef : t('aceGen.manual.repaintOnly'), set: (v) => { adv.latentCrossfade = v },
        },
      ]
      return rows
    })(),
  },
  {
    id: 'result', title: t('sa3Gen.manual.resultTitle'), sub: t('aceGen.manual.resultSub'), column: 1,
    rows: [
      {
        kind: 'select', id: 'format', label: t('aceGen.format'), tech: 'audio_format', value: audioFormat.value, def: 'mp3',
        options: ['mp3', 'wav', 'flac'].map((x) => ({ value: x, label: x })), set: (v) => { audioFormat.value = v as 'mp3' | 'wav' | 'flac' },
      },
      { kind: 'slider', id: 'duration', label: t('aceGen.manual.length'), tech: 'audio_duration', value: lengthIsAuto.value ? null : duration.value, def: 120, min: 10, max: 300, step: 5, note: clock,
        ...(modelPicksLength.value ? { auto: t('aceGen.simple.auto') } : {}),
        set: (v) => { if (v == null) { if (modelPicksLength.value) lengthAuto.value = true; else duration.value = 120 } else { duration.value = v; lengthAuto.value = false } } },
      { kind: 'toggle', id: 'tiled', label: t('aceGen.manual.tiled'), tech: 'use_tiled_decode', value: adv.tiled, def: true, set: (v) => { adv.tiled = v } },
    ],
  },
])
const manualRows = computed(() => manualGroups.value.flatMap((g) => g.rows))
const manualChanged = computed(() => manualRows.value.filter((r) => !r.disabled && rowChanged(r)).length)
// The model and the length are the Song tab's choices too: Reset in the tuning leaves them, so it never changes
// what that tab shows without the user seeing it.
const SONG_ROWS = new Set(['model', 'duration'])
const resettableRows = computed(() => manualRows.value.filter((r) => !r.disabled && !SONG_ROWS.has(r.id) && rowChanged(r)))
function resetManual() {
  for (const r of resettableRows.value) resetRow(r)
}

// ---- Removing a LoRA from the list takes two clicks on the same button, as a take's bin does ----
const armedLora = ref('')
let disarmLoraTimer: ReturnType<typeof setTimeout> | null = null
function askRemoveLora(path: string) {
  if (disarmLoraTimer) clearTimeout(disarmLoraTimer)
  if (armedLora.value === path) {
    armedLora.value = ''
    if (selectedLoraPath.value === path) selectedLoraPath.value = ''
    removeLora(path)
    return
  }
  armedLora.value = path
  disarmLoraTimer = setTimeout(() => { armedLora.value = '' }, 4000)
}
onBeforeUnmount(() => { if (disarmLoraTimer) clearTimeout(disarmLoraTimer) })
// ---- The tuning tab: a few plain choices, or every parameter by hand; the console shows them all at once ----
const TUNING_MODE_KEY = 'remiqora_ace_tuning_mode'
const readTuningMode = (): 'simple' | 'manual' => { try { return localStorage.getItem(TUNING_MODE_KEY) === 'manual' ? 'manual' : 'simple' } catch { return 'simple' } }
const tuningMode = ref<'simple' | 'manual'>(readTuningMode())
watch(tuningMode, (m) => { try { localStorage.setItem(TUNING_MODE_KEY, m) } catch { /* private window */ } })
const consoleOpen = ref(false)
// Turbo has no "more" (it stops at 8); the others double their own default (base 64, SFT 100)
const moreSteps = computed(() => modelSteps.value * 2)
const SIMPLE_TEMPOS = [{ id: 'slow', bpm: 80 }, { id: 'medium', bpm: 110 }, { id: 'fast', bpm: 140 }]
const simpleRows = computed<SimpleChoice[]>(() => [
  ...(isTurbo.value ? [] : [{
    id: 'steps', label: t('params.simple.steps'), hint: t('params.simple.stepsHint'),
    options: [{ id: 'normal', label: t('params.simple.normal', { n: modelSteps.value }) }, { id: 'more', label: t('params.simple.more', { n: moreSteps.value }) }],
    active: inferenceSteps.value == null ? 'normal' : inferenceSteps.value === moreSteps.value ? 'more' : null,
    pick: (id: string) => { inferenceSteps.value = id === 'more' ? moreSteps.value : null; inferenceStepsTouched.value = id === 'more' },
  }]),
  // no length here: it is the Song tab's (one control, with Auto); the manual tuning's slider is the same value
  {
    id: 'tempo', label: t('aceGen.simple.tempo'), hint: t(modelPicksLength.value ? 'aceGen.simple.tempoWish' : 'aceGen.simple.tempoHint'),
    options: [{ id: 'auto', label: t('aceGen.simple.auto') }, ...SIMPLE_TEMPOS.map((x) => ({ id: x.id, label: t(`aceGen.simple.${x.id}`, { n: x.bpm }) }))],
    active: bpm.value == null ? 'auto' : SIMPLE_TEMPOS.find((x) => x.bpm === bpm.value)?.id ?? null,
    pick: (id: string) => { bpm.value = SIMPLE_TEMPOS.find((x) => x.id === id)?.bpm ?? null },
  },
  {
    id: 'key', label: t('aceGen.simple.key'), hint: t(modelPicksLength.value ? 'aceGen.simple.keyWish' : 'aceGen.simple.keyHint'),
    options: [{ id: 'auto', label: t('aceGen.simple.auto') }, { id: 'major', label: t('aceGen.simple.major') }, { id: 'minor', label: t('aceGen.simple.minor') }],
    active: !keyScale.value ? 'auto' : (['major', 'minor'].includes(parseKeyScale(keyScale.value)?.mode.id ?? '') ? parseKeyScale(keyScale.value)!.mode.id : null),
    // no tonic chosen yet: the plainest keys, C major and A minor; a tonic set by hand stays
    pick: (id: string) => { keyScale.value = id === 'auto' ? '' : formatKeyScale(parseKeyScale(keyScale.value)?.tonic || (id === 'major' ? 'C' : 'A'), id) },
  },
  {
    id: 'format', label: t('aceGen.format'), hint: t('aceGen.simple.formatHint'),
    options: ['mp3', 'wav', 'flac'].map((x) => ({ id: x, label: x })), active: audioFormat.value,
    pick: (id) => { audioFormat.value = id as 'mp3' | 'wav' | 'flac' },
  },
])
/** What the request will carry: the takes and the seed, then what was set by hand. */
const requestLine = computed(() => [
  { k: 'batch_size', v: String(batchSize.value), set: false },
  { k: 'seed', v: seedValue.value == null ? t('yueGen.manual.seedRandom') : String(seedValue.value), set: false },
  ...changedParts(manualRows.value, { key: keyScale.value }),
])
</script>

<template>
  <div class="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
    <div class="flex flex-col rounded-xl border border-border bg-panel lg:min-h-0 lg:flex-1">
      <!-- Tabs: what is changed every time first; a dot marks a tab that is in use -->
      <div class="flex shrink-0 items-end gap-1 border-b border-border px-3 pt-2">
        <!-- the tabs scroll sideways when long names do not fit (a 440 px form); -mb-px lays the active line on the border -->
        <div v-roving class="-mb-px flex min-w-0 flex-1 gap-1 overflow-x-auto [scrollbar-width:thin]" role="tablist">
          <button
            v-for="tab in FORM_TABS" :id="`ace-tab-${tab}`" :key="tab" type="button" role="tab" :aria-selected="formTab === tab" :aria-controls="`ace-panel-${tab}`"
            class="relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-t-lg border-b-2 px-3 py-2.5 text-[13px] transition-colors"
            :class="formTab === tab ? 'border-accent1 font-medium text-text' : 'border-transparent text-text-dim hover:text-text'"
            @click="formTab = tab"
          >
            <component :is="TAB_ICONS[tab]" class="hidden h-4 w-4 sm:block" aria-hidden="true" />{{ t(`aceGen.tabs.${tab}`) }}
            <!-- the dot is not only a colour: its word is read with the tab's name -->
            <span v-if="tabChanged[tab]" class="h-1.5 w-1.5 rounded-full bg-accent2" :title="t('yueGen.tabs.changed')" aria-hidden="true"></span>
            <span v-if="tabChanged[tab]" class="sr-only">({{ t('aceGen.tabChanged') }})</span>
          </button>
        </div>
        <!-- the presets: a menu at the end of the row of tabs -->
        <PresetMenu
          class="mb-1.5 shrink-0 self-center" :presets="presets" :selected="selectedPresetName"
          @apply="(name) => { selectedPresetName = name; applyPreset(name) }" @save="(name) => { newPresetName = name; saveCurrentPreset() }" @remove="deletePreset"
        />
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto p-4">
        <!-- The song: a description for the engine to write from, or your own style and lyrics -->
        <div v-show="formTab === 'song'" id="ace-panel-song" class="space-y-4" role="tabpanel" aria-labelledby="ace-tab-song">
          <div v-roving class="grid grid-cols-2 overflow-hidden rounded-lg border border-border text-xs" role="radiogroup" :aria-label="t('aceGen.modeLabel')">
            <button
              v-for="m in (['simple', 'custom'] as const)" :key="m" type="button" role="radio" :aria-checked="mode === m"
              class="min-w-0 px-2 py-2 transition-colors" :class="mode === m ? 'bg-accent1/20 font-medium text-text' : 'text-text-dim hover:bg-panel-2 hover:text-text'"
              @click="mode = m"
            >{{ t(m === 'simple' ? 'aceGen.modeDescribe' : 'aceGen.modeOwn') }}</button>
          </div>

          <div v-if="mode === 'simple'" class="space-y-1.5">
            <label class="text-[13px] font-medium text-text" for="ace-simple">{{ t('aceGen.simpleLabel') }}</label>
            <textarea id="ace-simple" v-model="simpleQuery" rows="7" :class="{ 'idea-flash': flash.simple }" class="w-full rounded-lg border border-border bg-panel-2 p-2.5 text-sm text-text" :placeholder="t('aceGen.simplePlaceholder')"></textarea>
            <p v-if="!lmAvailable()" class="text-xs leading-relaxed text-text-dim">
              {{ t('aceGen.noLmNote') }}
              <template v-if="selectedModel && !isTurbo">{{ t('aceGen.noLmBaseNote') }}</template>
            </p>
          </div>

          <template v-else>
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="text-[13px] font-medium text-text" for="ace-lyrics">{{ t('aceGen.lyricsLabel') }}</label>
                <div class="flex items-center gap-2">
                  <label class="flex items-center gap-1.5 text-xs text-text-dim">
                    <input v-model="instrumental" type="checkbox" class="rounded border-border" />
                    {{ t('aceGen.noVocal') }}
                  </label>
                  <HelpIconButton :topic="t('aceGen.lyricsLabel')" @click="helpOpen = 'lyrics'" />
                </div>
              </div>
              <textarea
                v-if="!instrumental" id="ace-lyrics" v-model="customLyrics" rows="10" :class="{ 'idea-flash': flash.lyrics }"
                class="w-full rounded-lg border border-border bg-panel-2 p-2.5 font-mono text-sm text-text" :placeholder="t('aceGen.lyricsPlaceholder')"
              ></textarea>
              <p v-else class="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-text-dim">{{ t('aceGen.noVocalHint') }}</p>
            </div>
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label for="ace-style" class="text-[13px] font-medium text-text">{{ t('aceGen.styleLabel') }}</label>
                <HelpIconButton :topic="t('aceGen.styleLabel')" @click="helpOpen = 'style'" />
              </div>
              <!-- the id lands on the tag input's own <input>: the label points at it and validation focuses it -->
              <TagInput id="ace-style" v-model="customPrompt" :class="{ 'idea-flash': flash.style }" :placeholder="t('aceGen.stylePlaceholder')" />
            </div>
          </template>

          <div class="space-y-1.5">
            <div class="flex items-baseline justify-between">
              <span class="inline-flex items-center gap-1.5 text-[13px] font-medium text-text"><ClockIcon class="h-4 w-4 text-text-dim" />{{ t('yueGen.length.label') }}</span>
              <span v-if="!lengthIsAuto && !LENGTHS.includes(duration)" class="text-xs tabular-nums text-text-dim">{{ t('sa3Gen.lengthOwn', { v: clock(duration) }) }}</span>
            </div>
            <!-- six in a row while each keeps ~3.5rem; longer words wrap to a second row instead of being cut -->
            <div v-roving class="grid grid-cols-[repeat(auto-fit,minmax(3.5rem,1fr))] overflow-hidden rounded-lg border border-border text-xs" role="radiogroup" :aria-label="t('yueGen.length.label')">
              <!-- from a description the model can choose the length: Auto, as in YuE2's form -->
              <button
                v-if="modelPicksLength" type="button" role="radio" :aria-checked="lengthIsAuto"
                class="min-w-0 truncate px-1 py-2 transition-colors" :class="lengthIsAuto ? 'bg-accent1/20 font-medium text-text' : 'text-text-dim hover:bg-panel-2 hover:text-text'"
                @click="lengthAuto = true"
              >{{ t('yueGen.length.auto') }}</button>
              <button
                v-for="s in LENGTHS" :key="s" type="button" role="radio" :aria-checked="!lengthIsAuto && duration === s" :title="lengthLabel(s)"
                class="min-w-0 truncate px-1 py-2 tabular-nums transition-colors" :class="!lengthIsAuto && duration === s ? 'bg-accent1/20 font-medium text-text' : 'text-text-dim hover:bg-panel-2 hover:text-text'"
                @click="pickLength(s)"
              >{{ lengthLabel(s) }}</button>
            </div>
            <!-- from a description the language model sets the length itself: a picked one is asked for in words -->
            <p v-if="modelPicksLength && lengthIsAuto" class="text-xs text-text-dim">{{ t('aceGen.lengthByModelNote') }}</p>
          </div>

          <div v-if="models.length > 1" class="space-y-1.5">
            <span class="block text-[13px] font-medium text-text">{{ t('aceGen.model') }}</span>
            <div v-roving class="flex flex-wrap overflow-hidden rounded-lg border border-border text-xs" role="radiogroup" :aria-label="t('aceGen.model')">
              <button
                v-for="m in models" :key="m.name" type="button" role="radio" :aria-checked="selectedModel === m.name" :title="m.name"
                class="flex-1 whitespace-nowrap px-2.5 py-2 transition-colors" :class="selectedModel === m.name ? 'bg-accent1/20 font-medium text-text' : 'text-text-dim hover:bg-panel-2 hover:text-text'"
                @click="selectedModel = m.name"
              >{{ shortModel(m.name) }}</button>
            </div>
            <p class="text-xs text-text-dim">{{ t('aceGen.modelNote') }}</p>
          </div>
        </div>

        <!-- A reference track: a cover, a redone range, a part taken out or added -->
        <div v-show="formTab === 'ref'" id="ace-panel-ref" class="space-y-3" role="tabpanel" aria-labelledby="ace-tab-ref">
          <div class="flex items-center justify-between text-sm">
            <span class="font-medium text-text">{{ t('aceGen.refAudio') }}</span>
            <HelpIconButton :topic="t('aceGen.refAudio')" @click="helpOpen = 'remix'" />
          </div>
          <p class="text-xs text-text-dim">{{ t('aceGen.refOff') }}</p>
          <!-- the drop zone: a file dropped or chosen, or a library track; a chosen one turns the reference mode on -->
          <div
            class="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed px-3 py-4 text-center transition-colors"
            :class="refDragOver ? 'border-accent1 bg-accent1/10' : refAudioFile ? 'border-accent1/40 bg-accent1/[0.04]' : 'border-border'"
            @dragover.prevent="refDragOver = true" @dragleave="refDragOver = false" @drop.prevent="onRefDrop"
          >
            <p v-if="refLoading" class="text-xs text-text-dim">{{ t('aceGen.refLoading') }}</p>
            <p v-else-if="refAudioFile" class="max-w-full truncate text-sm font-medium text-text" :title="refAudioFile.name">{{ refAudioFile.name }}</p>
            <p v-else class="text-xs text-text-dim">{{ t('aceGen.refDrop') }}</p>
            <div class="flex flex-wrap justify-center gap-2">
              <!-- the real input is sr-only: the label shows where the keyboard focus is -->
              <label class="cursor-pointer rounded-md border border-border px-3 py-1.5 text-xs text-text hover:bg-panel-2 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent1">
                {{ t('aceGen.refChoose') }}
                <input id="ace-ref-file" type="file" accept="audio/*" class="sr-only" :aria-label="t('aceGen.refFile')" @change="onRefFileChange" />
              </label>
              <button type="button" class="rounded-md border border-border px-3 py-1.5 text-xs text-text hover:bg-panel-2" @click="refPickerOpen = true">{{ t('aceGen.refFromLibrary') }}</button>
              <button v-if="refAudioFile" type="button" class="rounded-md px-3 py-1.5 text-xs text-text-dim hover:text-text" @click="refAudioFile = null">{{ t('aceGen.refRemove') }}</button>
            </div>
          </div>
          <div class="space-y-3">

          <ChipGroup v-model="taskType" :options="taskTypeOptions" :aria-label="t('aceGen.taskType')" />

          <div v-if="taskType === 'repaint'" class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-[13px] font-medium text-text" for="ace-repaint-start">{{ t('aceGen.repaintStart') }}</label>
              <input id="ace-repaint-start" v-model.number="repaintStart" type="number" min="0" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text" />
            </div>
            <div>
              <label class="text-[13px] font-medium text-text" for="ace-repaint-end">{{ t('aceGen.repaintEnd') }}</label>
              <input id="ace-repaint-end" v-model.number="repaintEnd" type="number" min="0" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text" />
            </div>
          </div>

          <div v-if="taskType === 'extract' || taskType === 'lego'">
            <label class="text-[13px] font-medium text-text" for="ace-track-part">{{ t('aceGen.trackPart') }}</label>
            <select id="ace-track-part" v-model="trackName" class="w-full rounded-lg border border-border bg-panel-2 p-2 text-sm text-text">
              <option v-for="opt in trackOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>

          <div v-if="taskType === 'complete'">
            <!-- a chip group is not labelable: its name goes in as aria-label -->
            <p class="mb-1 block text-[13px] font-medium text-text">{{ t('aceGen.trackPartsToAdd') }}</p>
            <ChipGroup v-model="trackClasses" multiple :options="trackOptions" :aria-label="t('aceGen.trackPartsToAdd')" />
          </div>

          <div v-if="taskType === 'cover' || taskType === 'repaint'">
            <!-- audio_cover_strength 1 keeps the most of the source: the slider runs the other way, from close to free -->
            <label class="text-[13px] font-medium text-text" for="ace-cover-strength">{{ t('aceGen.closeness') }}</label>
            <input
              id="ace-cover-strength" type="range" min="0" max="1" step="0.05" class="w-full accent-accent1"
              :value="1 - coverStrength" :aria-valuetext="`${t('aceGen.closeness')}: ${coverStrength.toFixed(2)}`"
              @input="coverStrength = clamp(1 - Number(($event.target as HTMLInputElement).value), 0, 1)"
            />
            <span class="flex justify-between text-xs text-text-dim" aria-hidden="true"><span>{{ t('aceGen.closenessLow') }}</span><span>{{ t('aceGen.closenessHigh') }}</span></span>
            <p class="mt-1 text-xs text-text-dim">{{ t('aceGen.closenessHint') }}</p>
          </div>
          </div>
        </div>

        <!-- The tuning: every parameter, in groups -->
        <div v-show="formTab === 'tuning'" id="ace-panel-tuning" class="space-y-5" role="tabpanel" aria-labelledby="ace-tab-tuning">
          <div class="flex flex-wrap items-center gap-2">
            <div v-roving class="inline-flex overflow-hidden rounded-lg border border-border text-xs" role="radiogroup" :aria-label="t('yueGen.tuningTitle')">
              <button
                v-for="m in (['simple', 'manual'] as const)" :key="m" type="button" role="radio" :aria-checked="tuningMode === m"
                class="px-3 py-1.5 transition-colors" :class="tuningMode === m ? 'bg-accent1/20 font-medium text-text' : 'text-text-dim hover:bg-panel-2 hover:text-text'"
                @click="tuningMode = m"
              >{{ t(`yueGen.manual.${m}`) }}</button>
            </div>
            <HelpIconButton :topic="t('yueGen.tuningTitle')" @click="helpOpen = 'advanced'" />
            <template v-if="tuningMode === 'manual'">
              <span class="ms-auto text-xs text-text-dim">{{ t('yueGen.manual.changed', { n: resettableRows.length, total: manualRows.filter((r) => !SONG_ROWS.has(r.id)).length }) }}</span>
              <!-- only the tuning's own rows: the model and the length belong to the Song tab and stay -->
              <button type="button" class="min-h-6 rounded-lg border border-border px-2 py-1 text-xs text-text-dim hover:text-text disabled:cursor-not-allowed disabled:opacity-40" :disabled="!resettableRows.length" @click="resetManual">{{ t('yueGen.manual.reset') }}</button>
              <button type="button" class="min-h-6 rounded-lg border border-border px-2 py-1 text-xs text-text-dim hover:text-text" :title="t('yueGen.manual.console')" :aria-label="t('yueGen.manual.console')" @click="consoleOpen = true"><span aria-hidden="true">⤢</span></button>
            </template>
          </div>
          <SimpleChoices v-if="tuningMode === 'simple'" :rows="simpleRows" />
          <!-- the LoRA in plain view too: the one in use (or none) and the way to train one -->
          <div v-if="tuningMode === 'simple'" class="flex flex-wrap items-center justify-between gap-2">
            <label for="ace-simple-lora" class="text-[13px] font-medium text-text">{{ t('aceGen.loraSimple') }}</label>
            <span class="flex items-center gap-2 text-xs">
              <select id="ace-simple-lora" v-model="selectedLoraPath" class="max-w-[12rem] rounded-lg border border-border bg-panel-2 px-2 py-1.5 text-xs text-text">
                <option value="">{{ t('aceGen.noLora') }}</option>
                <option v-for="l in loras" :key="l.path" :value="l.path">{{ l.name }}</option>
              </select>
              <span class="text-text-dim" aria-hidden="true">·</span>
              <button type="button" class="text-accent1-text hover:underline" @click="openLoraTraining">{{ t('aceGen.loraTrain') }}</button>
            </span>
          </div>
          <ParamGroups v-else :groups="manualGroups">
            <template #key><KeyScalePicker v-model="keyScale" :empty-label="t('keyScale.notSet')" /></template>
          </ParamGroups>

          <!-- the LoRA list: adapters are registered by a name and a folder -->
          <CollapsibleDetails v-if="tuningMode === 'manual'" :summary="t('aceGen.manual.myLoras', { n: loras.length })">
            <div class="flex items-center gap-2">
              <input
                v-model="newLoraName" type="text" :placeholder="t('aceGen.loraNamePlaceholder')" :aria-label="t('aceGen.loraName')"
                class="w-1/3 rounded-lg border border-border bg-panel-2 p-1.5 text-xs text-text"
              />
              <input
                v-model="newLoraPath" type="text" :placeholder="t('aceGen.loraPathPlaceholder')" :aria-label="t('aceGen.loraPath')"
                class="min-w-0 flex-1 rounded-lg border border-border bg-panel-2 p-1.5 text-xs text-text"
              />
              <button
                type="button" class="min-h-6 rounded-lg border border-border px-2 py-1.5 text-xs text-text-dim hover:text-text"
                :title="t('aceGen.addLora')" :aria-label="t('aceGen.addLora')" @click="registerNewLora"
              ><span aria-hidden="true">+</span></button>
            </div>
            <ul v-if="loras.length" class="space-y-1">
              <li v-for="l in loras" :key="l.path" class="flex items-center justify-between gap-2 text-xs text-text">
                <span class="truncate" :title="l.path">{{ l.name }}</span>
                <!-- the first click turns it into "Remove?" for a few seconds, the second removes -->
                <button
                  type="button" class="min-h-6 shrink-0 rounded-lg px-2"
                  :class="armedLora === l.path ? 'border border-status-failed/60 bg-status-failed/15 font-medium text-status-failed' : 'text-status-failed hover:underline'"
                  :aria-label="armedLora === l.path ? t('aceGen.removeLoraConfirm') : t('aceGen.removeLoraNamed', { name: l.name })"
                  @click="askRemoveLora(l.path)"
                >{{ armedLora === l.path ? t('aceGen.removeLoraConfirm') : t('aceGen.removeLora') }}</button>
              </li>
            </ul>
          </CollapsibleDetails>
        </div>
      </div>

      <!-- Always in view: how many takes, the seed, and Create -->
      <!-- below lg the page scrolls: the footer sticks to the bottom (opaque, above the phone's home bar) so Create
           stays in reach; from lg the form is a column whose middle scrolls and the footer is already in view -->
      <div class="sticky bottom-0 z-10 shrink-0 space-y-2.5 rounded-b-xl border-t border-border bg-panel p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:static lg:bg-panel-2/60 lg:pb-3">
        <p v-if="formError" :id="ERROR_ID" role="alert" class="rounded-lg bg-status-failed/10 p-2 text-xs text-status-failed">{{ formError }}</p>
        <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs">
          <div class="flex items-center gap-2">
            <span id="ace-takes-label" class="text-text-dim">{{ t('yueGen.takes') }}</span>
            <!-- named by the visible word next to it (WCAG 2.5.3: the spoken name matches the label) -->
            <div v-roving class="inline-flex overflow-hidden rounded-lg border border-border" role="radiogroup" aria-labelledby="ace-takes-label">
              <button
                v-for="n in ([1, 2, 4] as const)" :key="n" type="button" role="radio" :aria-checked="batchSize === n"
                class="min-w-8 px-2 py-1.5 tabular-nums" :class="batchSize === n ? 'bg-accent1/20 font-medium text-text' : 'text-text-dim hover:bg-panel-2'"
                @click="batchSize = n"
              >{{ n }}</button>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <label for="ace-seed" class="text-text-dim">{{ t('aceGen.seed') }}</label>
            <input
              id="ace-seed" type="number" :value="seedValue ?? ''" :disabled="seedRandom" :placeholder="t('aceGen.seedPlaceholder')"
              class="w-28 rounded-lg border border-border bg-panel-2 px-2 py-1.5 text-xs tabular-nums text-text disabled:text-text-dim" @change="onSeedInput"
            />
            <!-- a toggle: pressed = a new random seed for each take -->
            <button
              type="button" class="min-h-6 rounded-lg border px-2 py-1.5" :class="seedRandom ? 'border-accent1/60 bg-accent1/15 text-text' : 'border-border text-text-dim hover:text-text'"
              :aria-pressed="seedRandom" :title="t('yueGen.randomSeed')" :aria-label="t('yueGen.randomSeed')" @click="toggleSeedRandom"
            ><span aria-hidden="true">🎲</span></button>
          </div>
        </div>
        <MakeCoverOption />
        <button type="button" class="accent-gradient w-full rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-50" :disabled="submitting" @click="submit">
          {{ submitting ? t('aceGen.submitting') : createLabel(t('aceGen.submit')) }}<span v-if="!submitting && batchSize > 1" class="ms-1.5 font-normal">× {{ batchSize }}</span>
        </button>
        <!-- the live region is always there (an inserted one is often not read); from lg the session is beside the form -->
        <p role="status" class="text-center text-xs text-text empty:-mt-2.5 lg:sr-only">
          <a v-if="queuedTakes" href="#create-session" class="underline underline-offset-2 hover:text-accent1" @click.prevent="toSession">{{ t('aceGen.queuedStatus', { n: queuedTakes }) }}</a>
        </p>
      </div>
    </div>

    <LibraryPicker v-if="refPickerOpen" @pick="onRefPick" @close="refPickerOpen = false" />

    <ParamConsole
      :open="consoleOpen" :title="t('params.consoleTitle', { name: 'ACE-Step' })" :groups="manualGroups" :changed="manualChanged" :total="manualRows.length"
      :request="requestLine" :note="t('params.consoleNote')" @close="consoleOpen = false" @reset="resetManual"
    >
      <template #key><KeyScalePicker v-model="keyScale" :empty-label="t('keyScale.notSet')" /></template>
    </ParamConsole>

    <!-- The help windows, in the editor guide's look (HelpBody, HelpSection, HelpTable) -->
    <HelpModal :open="helpOpen === 'style'" :title="t('aceGen.help.style.title')" wide @close="helpOpen = null">
      <HelpBody :lead="t('aceGen.help.style.intro')">
        <HelpTable
          :columns="[{ key: 'dim', label: t('aceGen.help.style.dimHeader'), nowrap: true }, { key: 'examples', label: t('aceGen.help.style.examplesHeader') }]"
          :rows="tm('aceGen.help.style.rows') as { dim: string; examples: string }[]"
        />
        <HelpSection :title="t('aceGen.help.style.tipsTitle')" tone="tips">
          <HelpList :items="tm('aceGen.help.style.tips') as string[]" />
        </HelpSection>
        <HelpSection :title="t('aceGen.help.style.examplesTitle')">
          <HelpExamples :items="helpStyleExamples" mono pickable @pick="useStyleExample" />
        </HelpSection>
      </HelpBody>
    </HelpModal>
    <HelpModal :open="helpOpen === 'lyrics'" :title="t('aceGen.help.lyrics.title')" wide @close="helpOpen = null">
      <HelpBody :lead="t('aceGen.help.lyrics.intro')">
        <HelpTable
          :columns="[{ key: 'tag', label: t('aceGen.help.lyrics.tagHeader'), mono: true, nowrap: true }, { key: 'purpose', label: t('aceGen.help.lyrics.purposeHeader') }]"
          :rows="tm('aceGen.help.lyrics.rows') as { tag: string; purpose: string }[]"
        />
        <HelpSection :title="t('aceGen.help.lyrics.marksTitle')" :intro="t('aceGen.help.lyrics.marksIntro')">
          <HelpTable :columns="[{ key: 'tag', mono: true, nowrap: true }, { key: 'purpose' }]" :rows="tm('aceGen.help.lyrics.marks') as { tag: string; purpose: string }[]" />
        </HelpSection>
        <HelpSection :title="t('aceGen.help.lyrics.tipsTitle')" tone="tips">
          <HelpList :items="tm('aceGen.help.lyrics.tips') as string[]" />
        </HelpSection>
        <HelpSection :title="t('aceGen.help.lyrics.exampleTitle')">
          <HelpExamples :items="[{ text: t('aceGen.help.lyrics.example') }]" mono pickable @pick="useLyricsExample" />
        </HelpSection>
      </HelpBody>
    </HelpModal>
    <HelpModal :open="helpOpen === 'remix'" :title="t('aceGen.help.remix.title')" wide @close="helpOpen = null">
      <HelpBody>
        <HelpTable
          :columns="[
            { key: 'scenario', label: t('aceGen.help.remix.scenarioHeader') },
            { key: 'what', label: t('aceGen.help.remix.whatHeader') },
            { key: 'tune', label: t('aceGen.help.remix.tuneHeader') },
          ]"
          :rows="tm('aceGen.help.remix.rows') as { scenario: string; what: string; tune: string }[]"
          min-width="36rem"
        />
        <HelpSection :title="t('aceGen.help.remix.paramsTitle')">
          <HelpList :items="tm('aceGen.help.remix.params') as string[]" html />
        </HelpSection>
        <HelpSection :title="t('aceGen.help.remix.unavailableTitle')" tone="note">
          <p>{{ t('aceGen.help.remix.unavailable') }}</p>
        </HelpSection>
      </HelpBody>
    </HelpModal>
    <HelpModal :open="helpOpen === 'advanced'" :title="t('aceGen.help.advanced.title')" wide @close="helpOpen = null">
      <HelpBody>
        <HelpTable
          :columns="[{ key: 'param', label: t('aceGen.help.advanced.paramHeader'), nowrap: true }, { key: 'what', label: t('aceGen.help.advanced.whatHeader') }]"
          :rows="tm('aceGen.help.advanced.rows') as { param: string; what: string }[]"
        />
        <HelpSection tone="note">
          <p>{{ t('aceGen.help.advanced.footer') }}</p>
        </HelpSection>
      </HelpBody>
    </HelpModal>
  </div>
</template>
