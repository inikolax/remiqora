import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { PromptCancelled, writePromptLive } from '../api/assistant'
import type { WriteProgress } from '../api/assistant'
import { useEnginesStore } from '../stores/engines'
import { useOrchestratorStore } from '../stores/orchestrator'
import type { LibTrack } from '../views/library/libraryTracks'

/** What the assistant makes of a track: its name, and a picture for its cover (English, for the covers feature). */
export interface AutoTitle {
  title: string
  /** An album cover as a scene, 20-40 words of English with no text in the picture; empty when the model gave none. */
  cover: string
}

/** The covers the assistant described this session, by track id; the covers feature reads them from here. */
const covers = new Map<number, string>()
export const coverIdeaFor = (id: number): string => covers.get(id) ?? ''

const SERVICE_TAGS = /^\s*(?:(?:TrackType|VocalType|Genre|Mood|Instrument|Tempo)\s*:[^,.\n]*[,.]\s*)+/i
const LYRICS_MAX = 1800

/** The text block the "title" task reads: "Lyrics: ...", "Style: ...", "Idea: ..."; what the track has. Empty when
 *  there is nothing to go on. */
export function titleIdeaOf(track: LibTrack): string {
  const p = track.params
  const lyrics = track.lyrics.trim().replace(/\n{3,}/g, '\n\n').slice(0, LYRICS_MAX)
  const style = track.style.replace(SERVICE_TAGS, '').trim().slice(0, 300)
  const idea = String(p.idea || p.sample_query || p.caption || '').replace(SERVICE_TAGS, '').trim().slice(0, 300)
  return [lyrics && `Lyrics: ${lyrics}`, style && `Style: ${style}`, idea && idea !== style && `Idea: ${idea}`].filter(Boolean).join('\n')
}

/**
 * Names tracks with the prompt assistant (task "title"): ready only when its environment and a model are installed.
 * A song is named in the language of its lyrics, an instrumental in the interface's language.
 */
export function useAutoTitle() {
  const { locale } = useI18n()
  const engines = useEnginesStore()
  const orchestrator = useOrchestratorStore()
  // the library does not load the engines' state itself: without it the assistant would look not installed
  if (!engines.assistant) void engines.load()
  const ready = computed(() => !!engines.assistant?.ready && !!engines.assistant?.models.some((m) => m.installed))
  const busy = ref(false)
  const progress = ref<WriteProgress | null>(null)
  let cancelCurrent: (() => void) | null = null

  /** A name for the track, other than the `avoid` ones (its title, names offered before: an "Avoid:" last line the
   *  task reads); rejects with PromptCancelled after cancel(), with Error when nothing came of it. */
  async function suggest(track: LibTrack, avoid: string[] = []): Promise<AutoTitle> {
    const base = titleIdeaOf(track)
    if (!base) throw new Error('nothing to name it by')
    const names = [...new Set(avoid.map((n) => n.replace(/[|\n]+/g, ' ').trim()).filter(Boolean))].slice(-20)
    const idea = names.length ? `${base}\nAvoid: ${names.join(' | ')}` : base
    const onGpu = engines.assistant?.settings.device === 'cuda'
    busy.value = true
    // without lyrics the model has no language to follow: the interface's (zh-CN and pt-BR are zh and pt)
    const language = track.lyrics.trim() ? undefined : locale.value.split('-')[0]
    const run = writePromptLive('title', idea, { language, seed: Math.floor(Math.random() * 2147483647) },
      (p) => { progress.value = p }, { unloadsEngine: onGpu && !!orchestrator.activeModel })
    cancelCurrent = run.cancel
    try {
      const fields = (await run.result).fields
      const title = String(fields.title ?? '').trim()
      if (!title) throw new Error('the assistant gave no title')
      const cover = String(fields.cover ?? '').trim()
      if (cover) covers.set(track.id, cover)
      return { title, cover }
    } finally {
      busy.value = false
      progress.value = null
      cancelCurrent = null
      void engines.load()
      if (onGpu) void orchestrator.refresh()
    }
  }
  const cancel = (): void => cancelCurrent?.()
  return { ready, busy, progress, suggest, cancel }
}

export { PromptCancelled }
