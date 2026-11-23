<script setup lang="ts">
// The home page's "From an idea": the phrase in one capsule with the kind, the engine and Compose on one row, the
// rarer options (lyrics language, who writes) behind "More", then the live writing, and the prompt to edit and send.
// A sound is always Stable Audio's: the assistant writes its sound prompt (told the kind, not guessing it); without
// the assistant the phrase goes into Stable Audio's form as it is.
import { computed, nextTick, onMounted, provide, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { MODEL_LABELS } from '../../composables/useModelSwitch'
import { ENGINE_SHORT } from '../../composables/useTakes'
import { useFeaturesStore } from '../../stores/features'
import { useStableAudioStore } from '../../stores/stableAudio'
import type { IdeaEngine } from '../../stores/idea'
import { VOCAL_LANGUAGES } from '../../utils/vocalLanguages'
import ChipGroup from '../../components/shared/ChipGroup.vue'
import PromptProgress from '../../components/shared/PromptProgress.vue'
import IdeaGuide from '../../components/idea/IdeaGuide.vue'
import SparklesIcon from '../../components/shared/icons/SparklesIcon.vue'
import IdeaPrompt from './IdeaPrompt.vue'
import StatusLed from './StatusLed'
import { IDEA_COMPOSER, IDEA_ENGINES, useIdeaComposer } from './useIdeaComposer'
import type { HomeKind } from './useIdeaComposer'

const { t } = useI18n()
const router = useRouter()
const features = useFeaturesStore()
const sa = useStableAudioStore()
const c = useIdeaComposer()
provide(IDEA_COMPOSER, c)
const {
  orchestrator, engines, idea, kind, language, writerPref, engine, draft, writing, error, progress, stopping,
  instrumental, effectiveLanguage, engineInfo, engineAvailable, unavailableReason, fitEngine,
  aceRunning, assistantReady, writerKnown, writer, writerOptions, assistantOnGpu, assistantOnCpu, write, stopWriting, startAce,
} = c
const uid = useId()

// ---- the kind: the store's song or instrumental, or a sound (home only) ----
const KINDS: HomeKind[] = ['song', 'instrumental', 'sound']
const homeKind = ref<HomeKind>(kind.value)
const isSound = computed(() => homeKind.value === 'sound')
// a prompt written for a sound is not one for a song, and back: switching drops it
watch(isSound, () => { draft.value = null })
const soundOk = computed(() => features.has('stableAudio'))
watch(soundOk, (ok) => { if (!ok && homeKind.value === 'sound') homeKind.value = kind.value })
watch(homeKind, (k) => { if (k !== 'sound') kind.value = k })
watch(kind, (k) => { if (homeKind.value !== 'sound') homeKind.value = k })

// ---- the engine: a sound is Stable Audio's; songs and instrumentals follow the idea page's rules ----
const shownEngine = computed<IdeaEngine>(() => (isSound.value ? 'sa3' : engine.value))
const engineOff = (id: IdeaEngine): boolean => (isSound.value ? id !== 'sa3' : !engineAvailable(id))
function engineWhy(id: IdeaEngine): string | undefined {
  if (!engineOff(id)) return undefined
  return isSound.value ? t('home.soundBySa3') : unavailableReason(id)
}
function pickEngine(id: IdeaEngine): void {
  if (!isSound.value && !engineOff(id)) engine.value = id
}
const statusOf = (id: IdeaEngine) => {
  const model = IDEA_ENGINES.find((e) => e.id === id)!.model
  return orchestrator.statuses[model]?.status ?? 'stopped'
}
const installedEngine = (id: IdeaEngine): boolean => (id === 'yue2' ? features.has('yue2') : id === 'sa3' ? features.has('stableAudio') : true)

// ---- the phrase ----
const hasPhrase = computed(() => !!idea.value.trim())
/** Known that nothing can write the prompt for this engine: Compose is off and the line under it says why. */
const noWriter = computed(() => !isSound.value && writerKnown.value && !writer.value)
const placeholder = computed(() => t(isSound.value ? 'home.placeholderSound' : instrumental.value ? 'idea.placeholderInstrumental' : 'idea.placeholderSong'))
const composeTitle = computed(() => {
  if (!hasPhrase.value) return t('home.needPhrase')
  if (isSound.value) return t('home.composeSound')
  return noWriter.value ? t('idea.noWriter') : t('home.composeHere')
})
const composeOff = computed(() => !hasPhrase.value || writing.value || noWriter.value)

// grows from two lines to five, then scrolls
const box = ref<HTMLTextAreaElement | null>(null)
function fit(): void {
  const el = box.value
  if (!el) return
  el.style.height = 'auto'
  const line = parseFloat(getComputedStyle(el).lineHeight) || 24
  el.style.height = `${Math.min(el.scrollHeight, line * 5)}px`
}
watch(idea, () => void nextTick(fit))

function onEnter(e: KeyboardEvent): void {
  if (e.shiftKey || e.isComposing) return
  e.preventDefault()
  void compose()
}

async function compose(): Promise<void> {
  const text = idea.value.trim()
  if (!text || writing.value) return
  // who can write is known only once the assistant's state is in
  if (!engines.assistant) await engines.load()
  if (isSound.value) {
    // the assistant turns the phrase, in any language, into Stable Audio's sound prompt with a length; without it
    // the phrase goes into Stable Audio's form as it is
    if (assistantReady.value) return void (await write({ sound: true }))
    sa.requestInsertParams({ kind: 'sfx', prompt: text }, { undoable: true })
    void router.push({ name: 'create', query: { engine: 'stable_audio' } })
    return
  }
  // an engine picked before it was known to be missing, or for the other kind
  fitEngine(instrumental.value)
  if (!engineAvailable(engine.value)) engine.value = 'ace'
  await write()
}

/** The first run's examples (the right column): the phrase and its kind, and the field takes the focus. */
function fill(k: HomeKind, text: string): void {
  idea.value = text
  homeKind.value = k
  void nextTick(() => box.value?.focus())
}
defineExpose({ fill })

// ---- "More": the rarer options, closed by default, remembered in this browser ----
const MORE_KEY = 'remiqora.home.more'
const moreOpen = ref(false)
try { moreOpen.value = localStorage.getItem(MORE_KEY) === '1' } catch { /* blocked storage: closed */ }
watch(moreOpen, (open) => { try { localStorage.setItem(MORE_KEY, open ? '1' : '0') } catch { /* not kept */ } })
const showLanguage = computed(() => !isSound.value && !instrumental.value)
const showWriter = computed(() => !isSound.value && engine.value === 'ace' && (assistantReady.value || aceRunning.value))
const writerLine = computed(() => {
  if (writer.value === 'ace') return t('idea.byAce')
  if (writer.value !== 'assistant') return ''
  if (assistantOnGpu.value) return t('idea.byAssistantGpu', { engine: MODEL_LABELS[engineInfo.value.model] })
  return t(assistantOnCpu.value ? (instrumental.value ? 'idea.byAssistantCpuInstrumental' : 'idea.byAssistantCpu') : (instrumental.value ? 'idea.byAssistantInstrumental' : 'idea.byAssistant'))
})
const guideOpen = ref(false)

// ---- said when the prompt is in: the panel appears without a sound otherwise ----
const announce = ref('')
let draftBefore: unknown = null
watch(writing, (now, was) => {
  if (now) {
    draftBefore = draft.value
    announce.value = t('idea.writing')
  } else if (!was || !draft.value || draft.value === draftBefore || error.value) announce.value = ''
  else {
    const by = t(draft.value.writtenBy === 'ace' ? 'idea.writtenByAce' : 'idea.writtenByAssistant', { s: draft.value.seconds.toFixed(1) })
    announce.value = `${t('idea.promptTitle', { engine: MODEL_LABELS[engineInfo.value.model] })}, ${by}`
  }
})

onMounted(() => {
  fit()
  void engines.load()
})

const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1'
const SEGMENTS = 'flex min-w-0 flex-wrap gap-0.5 rounded-lg bg-panel-2 p-0.5'
const SEGMENT = 'inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm transition-colors motion-reduce:transition-none disabled:cursor-default disabled:opacity-50 sm:px-3'
const SEG_ON = 'bg-panel font-medium text-text shadow-sm ring-1 ring-border'
const SEG_OFF = 'text-text-dim hover:text-text'
</script>

<template>
  <div class="space-y-3">
    <!-- the one bold element: the phrase -->
    <form
      class="rounded-2xl border border-accent1/40 bg-panel shadow-lg shadow-accent1/10 transition-colors focus-within:border-accent1/80 focus-within:ring-2 focus-within:ring-accent1/30 motion-reduce:transition-none"
      @submit.prevent="compose"
    >
      <div class="flex gap-3 px-4 pt-4">
        <SparklesIcon class="mt-1 h-5 w-5 shrink-0 text-accent1" />
        <textarea
          ref="box" v-model="idea" rows="2" dir="auto"
          class="min-w-0 flex-1 resize-none bg-transparent text-base leading-6 text-text outline-none placeholder:text-text-dim"
          :placeholder="placeholder" :aria-label="t('home.phraseLabel')"
          @keydown.enter="onEnter"
        ></textarea>
      </div>

      <div class="mt-3 flex flex-wrap items-center gap-2 border-t border-border/70 px-3 py-3 sm:px-4">
        <div v-roving role="radiogroup" :aria-label="t('home.kindLabel')" :class="SEGMENTS">
          <button
            v-for="k in KINDS" :key="k" type="button" role="radio" :aria-checked="homeKind === k"
            :disabled="k === 'sound' && !soundOk" :title="k === 'sound' && !soundOk ? t('home.soundMissing') : undefined"
            :class="[SEGMENT, FOCUS, homeKind === k ? SEG_ON : SEG_OFF]"
            @click="homeKind = k"
          >
            {{ t(`home.kind.${k}`) }}
          </button>
        </div>

        <!-- the engine: an engine that cannot make this kind is off, with the reason; the light is its state -->
        <div v-roving role="radiogroup" :aria-label="t('home.engineLabel')" :class="SEGMENTS">
          <button
            v-for="e in IDEA_ENGINES" :key="e.id" type="button" role="radio" :aria-checked="shownEngine === e.id"
            :disabled="engineOff(e.id)"
            :title="engineWhy(e.id) ?? t(`idea.engineHint.${e.id}`)"
            :aria-describedby="engineWhy(e.id) ? `${uid}-why-${e.id}` : undefined"
            :class="[SEGMENT, FOCUS, shownEngine === e.id ? SEG_ON : SEG_OFF]"
            @click="pickEngine(e.id)"
          >
            {{ ENGINE_SHORT[e.model] }}
            <template v-if="installedEngine(e.id)">
              <StatusLed :status="statusOf(e.id)" />
              <span class="sr-only">, {{ t(`modelStatus.${statusOf(e.id)}`) }}</span>
            </template>
          </button>
          <template v-for="e in IDEA_ENGINES" :key="`why-${e.id}`">
            <span v-if="engineWhy(e.id)" :id="`${uid}-why-${e.id}`" class="sr-only">{{ engineWhy(e.id) }}</span>
          </template>
        </div>

        <div class="ms-auto flex shrink-0 items-center gap-1">
          <button
            type="button"
            class="inline-flex h-10 items-center gap-1 rounded-lg px-2.5 text-sm text-text-dim transition-colors hover:text-text motion-reduce:transition-none"
            :class="FOCUS" :aria-expanded="moreOpen" :aria-controls="`${uid}-more`"
            @click="moreOpen = !moreOpen"
          >
            {{ t('home.more') }}
            <svg viewBox="0 0 24 24" class="h-4 w-4" :class="moreOpen && 'rotate-180'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <!-- off without a phrase, and then it looks off too; the labels share one cell, so the width stays -->
          <button
            type="submit"
            class="h-10 shrink-0 rounded-lg border px-5 text-sm font-semibold transition-colors motion-reduce:transition-none disabled:cursor-default"
            :class="[FOCUS, !composeOff ? 'border-accent1-strong bg-accent1-strong text-white hover:bg-accent1-strong/90' : 'border-border text-text-dim']"
            :disabled="composeOff" :title="composeTitle"
          >
            <span class="grid">
              <span
                v-for="k in ['home.compose', 'idea.writing']" :key="k"
                class="col-start-1 row-start-1 text-center"
                :class="k === (writing ? 'idea.writing' : 'home.compose') ? '' : 'invisible'"
                :aria-hidden="k === (writing ? 'idea.writing' : 'home.compose') ? undefined : 'true'"
              >{{ t(k) }}</span>
            </span>
          </button>
        </div>
      </div>

      <!-- nothing can write for this engine: said up front, with the ways out -->
      <p v-if="noWriter" class="-mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 px-4 pb-3 text-xs leading-relaxed text-status-queued">
        <span>{{ engine === 'ace' ? t('idea.noWriter') : t('idea.noWriterAssistant') }}</span>
        <button
          v-if="engine === 'ace'" type="button"
          class="inline-flex min-h-6 items-center rounded text-accent1-text underline disabled:opacity-50" :class="FOCUS"
          :disabled="orchestrator.switching" @click="startAce"
        >{{ t('idea.startAce') }}</button>
        <router-link to="/models#assistant" class="inline-flex min-h-6 items-center rounded text-accent1-text underline" :class="FOCUS">{{ t('idea.setupAssistant') }}</router-link>
      </p>

      <!-- the rarer options -->
      <div v-show="moreOpen" :id="`${uid}-more`" class="space-y-3 border-t border-border/70 px-4 py-3 text-xs text-text-dim">
        <div v-if="showLanguage || showWriter" class="flex flex-wrap items-center gap-x-6 gap-y-3">
          <label v-if="showLanguage" class="flex items-center gap-2">
            {{ t('idea.language') }}
            <select
              v-model="language"
              class="min-h-8 rounded-lg border border-border bg-panel-2 px-2 py-1 text-sm text-text focus:border-accent1 focus:outline-none"
            >
              <!-- nothing typed yet: the language will come from the idea, not "English" (the guess for an empty text) -->
              <option value="">{{ idea.trim() ? t('idea.languageAuto', { lang: VOCAL_LANGUAGES.find((l) => l.code === effectiveLanguage)?.label ?? effectiveLanguage }) : t('idea.languageAutoIdea') }}</option>
              <option v-for="l in VOCAL_LANGUAGES" :key="l.code" :value="l.code">{{ l.label }}</option>
            </select>
          </label>
          <div v-if="showWriter" class="flex flex-wrap items-center gap-2">
            <span aria-hidden="true">{{ t('idea.writer') }}</span>
            <ChipGroup v-model="writerPref" small :options="writerOptions" :aria-label="t('idea.writer')" />
          </div>
        </div>
        <div class="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div class="min-w-[14rem] flex-1 space-y-1 leading-relaxed">
            <p>{{ isSound ? t('home.composeSound') : t(`idea.engineHint.${engine}`) }}</p>
            <p v-if="!isSound && writerLine">{{ writerLine }}</p>
          </div>
          <button
            type="button" class="inline-flex min-h-6 shrink-0 items-center rounded text-accent1-text underline-offset-2 hover:underline" :class="FOCUS"
            @click="guideOpen = true"
          >{{ t('home.guide') }}</button>
        </div>
      </div>
    </form>

    <!-- the writing -->
    <PromptProgress v-if="writing && progress" :progress="progress" :stopping="stopping" @stop="stopWriting" />
    <p v-else-if="writing" class="text-xs text-text-dim">
      {{ t('idea.writing') }}<template v-if="writer === 'ace'"> {{ t('idea.writingAce') }}</template>
    </p>
    <p v-if="error" class="rounded-lg bg-status-failed/10 p-3 text-xs text-status-failed" role="alert">{{ error }}</p>
    <p class="sr-only" role="status" aria-live="polite">{{ announce }}</p>

    <!-- the prompt -->
    <IdeaPrompt />

    <IdeaGuide :open="guideOpen" @close="guideOpen = false" />
  </div>
</template>
