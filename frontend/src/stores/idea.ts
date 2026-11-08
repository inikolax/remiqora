import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { WriteProgress } from '../api/assistant'
import type { Sa3ModelId } from '../api/stableAudio'

export type IdeaKind = 'song' | 'instrumental'
export type IdeaWriter = 'assistant' | 'ace'
export type IdeaEngine = 'ace' | 'yue2' | 'sa3'

/** The prompt written from the idea, as editable fields. */
export interface IdeaDraft {
  engine: IdeaEngine
  /** ACE-Step's caption, YuE2's style tags, or Stable Audio's prompt. */
  caption: string
  lyrics: string
  bpm: number | null
  keyscale: string
  duration: number
  timesignature: string
  language: string
  writtenBy: IdeaWriter
  seconds: number
  /** Stable Audio only: music or a sound (rain, a hit, a whoosh), as its classifier read the idea. */
  sa3Kind?: 'music' | 'sfx'
}

const STORE_KEY = 'remiqora.idea'

/**
 * "From an idea": the idea, the prompt written from it and the writing in progress. Kept here rather than
 * in the page, so going to an engine's page ("Open in the form", a header tab) and back finds it all as it was, and a
 * prompt still being written goes on and lands here. The idea, the choices and the prompt are also kept in this
 * browser, so a reload does not lose them.
 */
export const useIdeaStore = defineStore('idea', () => {
  const idea = ref('')
  const kind = ref<IdeaKind>('song')
  /** '' = from the idea's letters. */
  const language = ref('')
  const writerPref = ref<IdeaWriter>('assistant')
  const engine = ref<IdeaEngine>('ace')
  const draft = ref<IdeaDraft | null>(null)
  const variants = ref<1 | 2 | 4>(1)
  const precision = ref<'q8_0' | 'q4_0' | 'bf16'>('q8_0')
  const sa3Model = ref<Sa3ModelId>('medium')

  // the writing, not saved: it lives as long as the page's tab
  const writing = ref(false)
  const error = ref<string | null>(null)
  const progress = ref<WriteProgress | null>(null)
  const stopping = ref(false)
  let stopRun: (() => void) | null = null
  function setStop(fn: (() => void) | null) {
    stopRun = fn
  }
  function stop() {
    stopping.value = true
    stopRun?.()
  }
  /** A clean form for the next idea: the idea, the prompt and the last error go; the choices (song or
   *  instrumental, language, engine, variants) stay. Not while a prompt is being written. */
  function reset() {
    if (writing.value) return
    idea.value = ''
    draft.value = null
    error.value = null
  }

  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}')
    if (typeof saved.idea === 'string') idea.value = saved.idea
    if (saved.kind === 'song' || saved.kind === 'instrumental') kind.value = saved.kind
    if (typeof saved.language === 'string') language.value = saved.language
    if (saved.writer === 'assistant' || saved.writer === 'ace') writerPref.value = saved.writer
    if (saved.engine === 'ace' || saved.engine === 'yue2' || saved.engine === 'sa3') engine.value = saved.engine
    if (saved.variants === 1 || saved.variants === 2 || saved.variants === 4) variants.value = saved.variants
    if (saved.precision === 'q8_0' || saved.precision === 'q4_0' || saved.precision === 'bf16') precision.value = saved.precision
    if (typeof saved.sa3Model === 'string') sa3Model.value = saved.sa3Model
    const d = saved.draft
    if (d && typeof d === 'object' && typeof d.caption === 'string' && d.engine === engine.value) draft.value = d
  } catch {
    // a private window or blocked storage: start empty
  }
  watch([idea, kind, language, writerPref, engine, draft, variants, precision, sa3Model], () => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        idea: idea.value, kind: kind.value, language: language.value, writer: writerPref.value, engine: engine.value,
        draft: draft.value, variants: variants.value, precision: precision.value, sa3Model: sa3Model.value,
      }))
    } catch {
      // not saved; nothing else depends on it
    }
  }, { deep: true })

  return {
    idea, kind, language, writerPref, engine, draft, variants, precision, sa3Model,
    writing, error, progress, stopping, setStop, stop, reset,
  }
})

if (import.meta.hot) import.meta.hot.accept(acceptHMRUpdate(useIdeaStore, import.meta.hot))
