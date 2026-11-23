import { computed, ref } from 'vue'
import { PromptCancelled, writePromptLive } from '../api/assistant'
import type { WriteProgress } from '../api/assistant'
import { useEnginesStore } from '../stores/engines'
import { useOrchestratorStore } from '../stores/orchestrator'
import type { LibTrack } from '../views/library/libraryTracks'
import { titleIdeaOf } from './useAutoTitle'

const TITLE_MAX = 120
const WISH_MAX = 1000

/** Any letter beyond plain a-z (Cyrillic, CJK, accents): such a description is turned into English before drawing. */
export const hasNonLatin = (text: string): boolean => /(?![a-zA-Z])\p{L}/u.test(text)

/** The text block the "cover" task reads: the track's "Lyrics: / Style: / Idea:" (as for its name), its "Title:",
 *  and the person's own "Wish:" (any language) when there is one. */
export function coverIdeaOf(track: LibTrack, wish = ''): string {
  const title = track.title.trim().slice(0, TITLE_MAX)
  const w = wish.trim().slice(0, WISH_MAX)
  return [titleIdeaOf(track), title && `Title: ${title}`, w && `Wish: ${w}`].filter(Boolean).join('\n')
}

/**
 * Describes the picture for a track's cover with the prompt assistant (task "cover"): an English visual scene the
 * image model draws without lettering anything. Ready only when its environment and a model are installed (the same
 * rule as the Stable Audio form's assistant).
 */
export function useCoverDescribe() {
  const engines = useEnginesStore()
  const orchestrator = useOrchestratorStore()
  // the library does not load the engines' state itself: without it the assistant would look not installed
  if (!engines.assistant) void engines.load()
  const ready = computed(() => !!engines.assistant?.ready && !!engines.assistant?.models.some((m) => m.installed))
  const busy = ref(false)
  const progress = ref<WriteProgress | null>(null)
  let cancelCurrent: (() => void) | null = null
  let stopped = false

  /** The description; rejects with PromptCancelled after cancel(), with Error when nothing came of it. */
  async function describe(track: LibTrack, wish = ''): Promise<string> {
    const idea = coverIdeaOf(track, wish)
    if (!idea) throw new Error('nothing to describe the picture by')
    const onGpu = engines.assistant?.settings.device === 'cuda'
    busy.value = true
    stopped = false
    progress.value = null
    const run = writePromptLive('cover', idea, { seed: Math.floor(Math.random() * 2147483647) },
      (p) => { progress.value = p }, { unloadsEngine: onGpu && !!orchestrator.activeModel })
    cancelCurrent = run.cancel
    try {
      const prompt = String((await run.result).fields.prompt ?? '').trim()
      if (stopped) throw new PromptCancelled()
      if (!prompt) throw new Error('the assistant gave no description')
      return prompt
    } finally {
      busy.value = false
      progress.value = null
      cancelCurrent = null
      void engines.load()
      if (onGpu) void orchestrator.refresh()
    }
  }
  const cancel = (): void => {
    stopped = true
    cancelCurrent?.()
  }
  /** Waits for the assistant's state the first time: a click right after the page opens must not read "not ready". */
  const ensure = async (): Promise<boolean> => {
    if (!engines.assistant) await engines.load().catch(() => undefined)
    return ready.value
  }
  return { ready, busy, progress, describe, cancel, ensure }
}

export { PromptCancelled }
