<script setup lang="ts">
import { computed, nextTick, onMounted, ref, shallowRef, toRaw, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { PromptCancelled, writePromptLive } from '../../api/assistant'
import type { AssistantTask, WriteProgress } from '../../api/assistant'
import { useEnginesStore } from '../../stores/engines'
import { useOrchestratorStore } from '../../stores/orchestrator'
import { useIdeaStore } from '../../stores/idea'
import { useYue2Store } from '../../stores/yue2'
import { useAceStepStore } from '../../stores/aceStep'
import { useStableAudioStore } from '../../stores/stableAudio'
import { VOCAL_LANGUAGES, englishLanguageName, guessVocalLanguage, vocalLanguageLabel, withLanguageTag } from '../../utils/vocalLanguages'
import type { ModelId } from '../../types'
import { ENGINE_SHORT } from '../../composables/useTakes'
import SparklesIcon from '../../components/shared/icons/SparklesIcon.vue'
import CheckIcon from '../../components/shared/icons/CheckIcon.vue'

/**
 * One phrase above the form, in one capsule: the prompt assistant writes the lyrics and the style (a description,
 * for Stable Audio) for the engine chosen, and they land in its form to be read and changed before Create. The
 * footer shows which fields it fills, lights them up as it writes them and offers to put the old form back.
 * Its settings (the lyrics' language; instrumental, for ACE-Step) unfold in the capsule itself; the home page has
 * the whole of "From an idea": who writes, generating straight from the idea.
 */
const props = defineProps<{ engine: ModelId }>()
const { t } = useI18n()
const engines = useEnginesStore()
const orchestrator = useOrchestratorStore()
const yue2 = useYue2Store()
const ace = useAceStepStore()
const sa = useStableAudioStore()
// the same idea as on the home page: typed here, it is there too
const { idea, kind, language: languagePick } = storeToRefs(useIdeaStore())

// --- the settings, folded in the capsule (shared with the home page through the idea store) ----------------------
const SETTINGS_KEY = 'remiqora.ideaLine.settings'
const settingsOpen = ref((() => { try { return localStorage.getItem(SETTINGS_KEY) === 'open' } catch { return false } })())
watch(settingsOpen, (v) => { try { localStorage.setItem(SETTINGS_KEY, v ? 'open' : 'closed') } catch { /* private window */ } })
/** What the assistant writes for Stable Audio. Auto lets its classifier read the idea, which takes a story-like
 *  phrase ("leaving town on a night train") for a sound: a picked kind skips the guess. */
type SaWriteKind = 'auto' | 'music' | 'instrument' | 'one_shot' | 'sfx'
const SA_KINDS: SaWriteKind[] = ['auto', 'music', 'instrument', 'one_shot', 'sfx']
const SA_KIND_KEY = 'remiqora.ideaLine.saKind'
const saKind = ref<SaWriteKind>((() => { try { const v = localStorage.getItem(SA_KIND_KEY); return SA_KINDS.includes(v as SaWriteKind) ? v as SaWriteKind : 'auto' } catch { return 'auto' } })())
watch(saKind, (v) => { try { localStorage.setItem(SA_KIND_KEY, v) } catch { /* private window */ } })
const detectedLanguage = computed(() => guessVocalLanguage(idea.value))
/** ACE-Step only: YuE2 always sings. */
const instrumental = computed({
  get: () => props.engine === 'ace_step' && kind.value === 'instrumental',
  set: (v: boolean) => { kind.value = v ? 'instrumental' : 'song' },
})

const writing = ref(false)
const stopping = ref(false)
const progress = ref<WriteProgress | null>(null)
const error = ref('')
const done = ref(false)
/** The undo snapshot this line's last write left in its engine's store (compared by identity, raw). */
const ownSnap = shallowRef<unknown>(null)
/** The engine being written for, fixed when Write is pressed: switching the engine meanwhile must not send a
 *  YuE2 song into ACE-Step's form (and wipe its style). */
const writingFor = ref<ModelId | null>(null)
/** The engine the last result went into; when it is not the one shown, the status line names its form. */
const doneFor = ref<ModelId | null>(null)
let cancel: (() => void) | null = null

/** A downloaded model is enough: the assistant starts on the first request. */
const assistantReady = computed(() => !!engines.assistant?.ready && !!engines.assistant?.models.some((m) => m.installed))
/** Known not ready (the state has loaded and says so): the capsule says it up front, with the way to the model. */
const assistantMissing = computed(() => engines.assistant != null && !assistantReady.value)
onMounted(() => void engines.load())

const hasPhrase = computed(() => !!idea.value.trim())
const canWrite = computed(() => hasPhrase.value && !assistantMissing.value)

// --- the store of an engine -------------------------------------------------------------------------------------
const storeOf = (id: ModelId) => (id === 'yue2' ? yue2 : id === 'ace_step' ? ace : sa)
const formHasText = computed(() => storeOf(props.engine).formHasText)
/** Any undoable insert into the shown form (this line's, a preset, a help example, a reuse) can be put back here,
 *  until the next insert replaces the snapshot or the offer is dismissed. */
const undoReady = computed(() => !writing.value && !!storeOf(props.engine).insertUndo)
/** The shown form's snapshot is the one this line's own write made (a preset after it would replace the snapshot):
 *  then the footer says "Put into the form below" rather than "The form was changed". */
const ownInsert = computed(() => ownSnap.value != null && toRaw(storeOf(props.engine).insertUndo) === ownSnap.value)
function dismissUndo(): void {
  storeOf(props.engine).clearInsertUndo()
}

function undo(): void {
  if (props.engine === 'yue2') {
    if (yue2.insertUndo) yue2.requestInsertParams(yue2.insertUndo, { flash: true })
    yue2.clearInsertUndo()
  } else if (props.engine === 'ace_step') {
    if (ace.insertUndo) ace.requestInsertParams(ace.insertUndo, { flash: true })
    ace.clearInsertUndo()
  } else {
    if (sa.insertUndo) sa.requestInsertParams(sa.insertUndo, { flash: true })
    sa.clearInsertUndo()
  }
  done.value = false
}
// the status line speaks of the engine shown; the undo stays with the form it belongs to (undoEngine)
watch(() => props.engine, () => { if (!writing.value) { done.value = false; error.value = '' } })

// --- the chips: the fields the assistant fills, in the order it writes them -------------------------------------
type ChipState = 'pending' | 'active' | 'written'
interface Chip { id: string; keys: string[] }
/** While writing, the chips are those of the engine written for, not of the one shown. */
const chipEngine = computed<ModelId>(() => (writing.value && writingFor.value) || (done.value && doneFor.value) || props.engine)
/** JSON keys in the order the assistant streams them. Stable Audio's preview is not JSON: no keys. */
const chips = computed<Chip[]>(() => {
  if (chipEngine.value === 'yue2') return [{ id: 'style', keys: ['style'] }, { id: 'lyrics', keys: ['lyrics'] }]
  if (chipEngine.value === 'ace_step') return [{ id: 'style', keys: ['caption'] }, { id: 'lyrics', keys: ['lyrics'] }, { id: 'tempo', keys: ['bpm', 'keyscale', 'duration'] }]
  return [{ id: 'description', keys: [] }, { id: 'length', keys: [] }]
})

/** A key that has appeared in the streamed JSON (an escaped quote inside a string does not count). */
function keySeen(preview: string, key: string): boolean {
  return new RegExp(`(?<!\\\\)"${key}"\\s*:`).test(preview)
}

const chipStates = computed<ChipState[]>(() => {
  const list = chips.value
  if (done.value) return list.map(() => 'written')
  const p = progress.value
  if (!writing.value || !p || (p.stage !== 'writing' && p.stage !== 'retrying')) return list.map(() => 'pending')
  if (chipEngine.value === 'stable_audio') return list.map(() => 'active')
  const seen = list.map((c) => c.keys.some((k) => keySeen(p.preview, k)))
  return list.map((_, i) => (seen.slice(i + 1).some(Boolean) ? 'written' : seen[i] ? 'active' : 'pending'))
})

/** Before the text starts, a short stage; while writing, the stage and the percent. */
const stageText = computed(() => {
  const p = progress.value
  if (!writing.value) return ''
  if (stopping.value) return t('create.idea.stopping')
  if (!p) return t('create.idea.writing')
  const s = t(`promptProgress.stage.${p.stage}`)
  return p.stage === 'writing' || p.stage === 'retrying' ? `${s}, ${p.percent}%` : s
})

const showFooter = computed(() => hasPhrase.value || writing.value || !!error.value || done.value || undoReady.value)
const showReplaceWarning = computed(() => hasPhrase.value && !writing.value && !done.value && !error.value && formHasText.value)

// --- the textarea: grows from one line to three, then scrolls ---------------------------------------------------
const box = ref<HTMLTextAreaElement | null>(null)
function fit(): void {
  const el = box.value
  if (!el) return
  el.style.height = 'auto'
  const line = parseFloat(getComputedStyle(el).lineHeight) || 20
  el.style.height = `${Math.min(el.scrollHeight, line * 3)}px`
}
watch(idea, () => void nextTick(fit))
onMounted(fit)

function onInput(): void {
  done.value = false
  error.value = ''
}
function onEnter(e: KeyboardEvent): void {
  if (e.shiftKey || e.isComposing) return
  e.preventDefault()
  void write()
}

function stop(): void {
  stopping.value = true
  cancel?.()
}

async function write(): Promise<void> {
  const text = idea.value.trim()
  if (!text || writing.value) return
  done.value = false
  if (!assistantReady.value) {
    error.value = t('create.idea.noAssistant')
    return
  }
  // the engine is fixed now: the task, the insert and the undo all go to it, whatever is shown when the text comes
  const eng = props.engine
  writingFor.value = eng
  writing.value = true
  stopping.value = false
  error.value = ''
  // the language picked in the settings, else the one the phrase is written in
  const language = languagePick.value || guessVocalLanguage(text)
  const noVocals = eng === 'ace_step' && kind.value === 'instrumental'
  // set to the GPU, the assistant unloads a running engine to write
  const onGpu = engines.assistant?.settings.device === 'cuda'
  const task: AssistantTask = eng === 'yue2' ? 'yue2-song' : eng === 'ace_step' ? (noVocals ? 'ace-instrumental' : 'ace-song') : 'sa3'
  const extra = eng === 'stable_audio' ? (saKind.value === 'auto' ? {} : { kind: saKind.value }) : { language }
  const run = writePromptLive(task, text, extra, (p) => { progress.value = p }, { unloadsEngine: onGpu && !!orchestrator.activeModel })
  cancel = run.cancel
  try {
    const f = (await run.result).fields
    // switched away meanwhile: the request still goes to eng's store, its form (kept mounted) takes it in
    if (eng === 'yue2') {
      // the language opens the tags: the one the lyrics were written in, else the idea's
      const lang = typeof f.language === 'string' && f.language ? f.language : englishLanguageName(language)
      yue2.requestInsertParams({ lyrics: String(f.lyrics ?? ''), style: withLanguageTag(String(f.style ?? ''), lang) }, { undoable: true })
    } else if (eng === 'ace_step') {
      ace.requestInsertParams({
        prompt: String(f.caption ?? ''), lyrics: noVocals ? '' : String(f.lyrics ?? ''), instrumental: noVocals, vocal_language: noVocals ? '' : language,
        bpm: typeof f.bpm === 'number' ? f.bpm : null, key_scale: String(f.keyscale ?? ''),
        ...(typeof f.duration === 'number' ? { duration: Math.max(10, Math.min(300, Math.round(f.duration))) } : {}),
      }, { undoable: true })
    } else {
      // the kind picked in the settings, or the one Stable Audio's classifier read in the idea
      const kind = f.category === 'sfx' || f.category === 'one_shot' ? 'sfx' : 'music'
      sa.requestInsertParams({ kind, prompt: String(f.prompt ?? ''), ...(typeof f.duration === 'number' ? { duration: Math.max(1, Math.round(f.duration)) } : {}) }, { undoable: true })
    }
    ownSnap.value = toRaw(storeOf(eng).insertUndo) ?? null
    doneFor.value = eng
    done.value = true
    void engines.load()
    if (onGpu) void orchestrator.refresh()
  } catch (e) {
    // stopped by hand: no error, the form stays as it was
    if (!(e instanceof PromptCancelled)) error.value = e instanceof Error ? e.message : String(e)
  } finally {
    writing.value = false
    writingFor.value = null
    stopping.value = false
    progress.value = null
    cancel = null
  }
}
/** "Put into the form below", or, when the engine was switched meanwhile, which engine's form got it. */
const writtenText = computed(() => (doneFor.value && doneFor.value !== props.engine
  ? t('create.idea.writtenOther', { name: ENGINE_SHORT[doneFor.value] })
  : t('create.idea.written')))

const actionLabel = computed(() => t(props.engine === 'stable_audio' ? 'create.idea.describe' : 'create.idea.writeShort'))
const actionTitle = computed(() => t(props.engine === 'stable_audio' ? 'create.idea.writeSa' : 'create.idea.write'))
</script>

<template>
  <div class="idea-capsule relative rounded-xl border border-border bg-panel transition-colors focus-within:border-accent1/70 focus-within:ring-2 focus-within:ring-accent1/30" :class="{ running: writing }">
    <form class="flex items-end gap-2 py-1.5 pe-1.5 ps-3" @submit.prevent="write">
      <SparklesIcon class="mt-2.5 h-4 w-4 shrink-0 self-start text-accent1" />
      <textarea
        ref="box" v-model="idea" rows="1"
        class="min-w-0 flex-1 resize-none bg-transparent py-1.5 text-sm leading-5 text-text outline-none placeholder:text-text-dim"
        :placeholder="t(`create.idea.placeholder.${engine}`)" :aria-label="t(`create.idea.placeholder.${engine}`)"
        :aria-describedby="assistantMissing ? 'idea-no-assistant' : undefined"
        :readonly="writing" @input="onInput" @keydown.enter="onEnter"
      ></textarea>
      <button
        v-if="writing" type="button"
        class="shrink-0 rounded-lg border border-border px-3 py-1.5 text-sm text-text-dim transition-colors hover:border-status-failed/60 hover:text-status-failed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1 disabled:opacity-50"
        :disabled="stopping" @click="stop"
      >
        {{ t('create.idea.stop') }}
      </button>
      <button
        v-else type="submit"
        class="shrink-0 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1 disabled:cursor-default"
        :class="canWrite ? 'border-accent1-strong bg-accent1-strong text-white hover:bg-accent1-strong/90' : 'border-transparent text-text-dim'"
        :disabled="!canWrite" :title="actionTitle" :aria-label="actionTitle"
        :aria-describedby="assistantMissing ? 'idea-no-assistant' : undefined"
      >
        {{ actionLabel }}
      </button>
    </form>

    <!-- no assistant model: said before anything is typed, with the way to get it; Write stays off meanwhile -->
    <p v-if="assistantMissing" id="idea-no-assistant" class="border-t border-border/70 px-3 py-1.5 text-xs text-text-dim">
      {{ t('create.idea.noAssistantNote') }}
      <router-link to="/models" class="rounded text-accent1-text underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-accent1">{{ t('create.idea.noAssistantLink') }}</router-link>
    </p>

    <div v-if="showFooter" class="space-y-1 border-t border-border/70 px-3 py-2 text-xs">
      <!-- the chips belong to a phrase; an undo offered alone (a preset changed the form) shows without them -->
      <div v-if="hasPhrase || writing || done || !!error" class="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        <span
          v-for="(c, i) in chips" :key="c.id"
          class="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 transition-colors duration-300"
          :class="{
            'border-border text-text-dim': chipStates[i] === 'pending',
            'border-accent1/60 bg-accent1/15 text-text': chipStates[i] === 'active',
            'border-status-done/40 text-text': chipStates[i] === 'written',
          }"
        >
          <CheckIcon v-if="chipStates[i] === 'written'" class="h-3 w-3 text-status-done" />
          <span v-else-if="chipStates[i] === 'active'" class="chip-dot h-1.5 w-1.5 rounded-full bg-accent1" aria-hidden="true"></span>
          <span v-else-if="writing" class="h-1.5 w-1.5 rounded-full border border-text-dim/70" aria-hidden="true"></span>
          {{ t(`create.idea.chip.${c.id}`) }}
        </span>
        <!-- the settings unfold here, in the capsule: no page to leave for -->
        <button
          type="button"
          class="ms-auto inline-flex min-h-6 items-center gap-1 rounded px-1 py-0.5 text-text-dim transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-accent1"
          :aria-expanded="settingsOpen" aria-controls="idea-line-settings" @click="settingsOpen = !settingsOpen"
        >
          <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {{ t('create.idea.settings') }}
          <svg viewBox="0 0 24 24" class="h-3 w-3" :class="settingsOpen && 'rotate-180'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </button>
      </div>
      <div v-if="settingsOpen && (hasPhrase || writing || done || !!error)" id="idea-line-settings" class="flex flex-wrap items-center gap-x-4 gap-y-2 py-1.5">
        <label v-if="engine === 'stable_audio'" class="inline-flex items-center gap-2 text-text-dim">
          {{ t('create.idea.saKind') }}
          <select
            v-model="saKind" :disabled="writing"
            class="min-h-7 rounded-md border border-border bg-panel-2 px-2 py-0.5 text-xs text-text focus-visible:outline-2 focus-visible:outline-accent1 disabled:opacity-50"
          >
            <option v-for="k in SA_KINDS" :key="k" :value="k">{{ t(`create.idea.saKinds.${k}`) }}</option>
          </select>
        </label>
        <label v-else class="inline-flex items-center gap-2 text-text-dim">
          {{ t('idea.language') }}
          <select
            v-model="languagePick" :disabled="writing || instrumental"
            class="min-h-7 rounded-md border border-border bg-panel-2 px-2 py-0.5 text-xs text-text focus-visible:outline-2 focus-visible:outline-accent1 disabled:opacity-50"
          >
            <option value="">{{ hasPhrase ? t('idea.languageAuto', { lang: vocalLanguageLabel(detectedLanguage) }) : t('idea.languageAutoIdea') }}</option>
            <option v-for="l in VOCAL_LANGUAGES" :key="l.code" :value="l.code">{{ l.label }}</option>
          </select>
        </label>
        <label v-if="engine === 'ace_step'" class="inline-flex min-h-6 cursor-pointer items-center gap-2 text-text-dim">
          <input v-model="instrumental" type="checkbox" class="h-4 w-4 rounded border-border accent-accent1" :disabled="writing" />
          {{ t('aceGen.noVocal') }}
        </label>
      </div>
      <!-- the words are the live region; the buttons stay out of it, so they are not read out on every change -->
      <div class="flex flex-wrap items-center gap-x-3 gap-y-0.5">
        <span role="status" aria-live="polite">
          <span v-if="writing" class="tabular-nums text-text-dim">{{ stageText }}</span>
          <span v-else-if="error" class="text-status-failed">{{ error }}</span>
          <span v-else-if="done && (ownInsert || !undoReady)" class="text-text-dim">{{ writtenText }}</span>
          <!-- a preset, a help example or a reuse changed the form: one neutral line fits them all -->
          <span v-else-if="undoReady" class="text-text-dim">{{ t('create.idea.formChanged') }}</span>
          <span v-else-if="showReplaceWarning" class="text-text-dim">{{ t('create.idea.replaces') }}</span>
        </span>
        <span v-if="undoReady" class="inline-flex items-center gap-1">
          <button
            type="button"
            class="inline-flex min-h-6 items-center rounded text-accent underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-accent1"
            @click="undo"
          >
            {{ t('create.idea.undo') }}
          </button>
          <!-- the offer stays until the next insert replaces it, or until it is put away here -->
          <button
            type="button"
            class="flex h-6 w-6 items-center justify-center rounded text-text-dim hover:bg-panel-2 hover:text-text focus-visible:outline-2 focus-visible:outline-accent1"
            :title="t('create.idea.dismiss')" :aria-label="t('create.idea.dismiss')" @click="dismissUndo"
          ><span aria-hidden="true">✕</span></button>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* While the assistant writes, a slow light runs along the capsule's border. */
@property --idea-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}
.idea-capsule.running::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: conic-gradient(from var(--idea-angle), transparent 0deg 250deg, var(--color-accent1) 310deg, var(--color-accent2) 340deg, transparent 360deg);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
  pointer-events: none;
  animation: idea-border 4s linear infinite;
}
@keyframes idea-border {
  to { --idea-angle: 360deg; }
}
.chip-dot {
  animation: idea-dot 1.2s ease-in-out infinite;
}
@keyframes idea-dot {
  50% { opacity: 0.35; }
}
@media (prefers-reduced-motion: reduce) {
  .idea-capsule.running::before { animation: none; }
  .chip-dot { animation: none; }
}
</style>
