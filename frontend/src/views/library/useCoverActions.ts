// What can be done about a track's cover picture, shared by the details panel and the cover studio: Make a cover /
// Another cover, the description to edit before making one, and Remove (two clicks). The description is the one kept
// on the track (the last cover's, or the last one given); without one the prompt assistant writes it first when it
// is ready ("Describing the picture…", with Stop), else the server makes its own. In the editor the text can be
// written in any language: Draw turns a non-English text into English with the assistant first, "Make it with the
// assistant" shows its version for review (with Put back). While the cover is made, its state from the queue; a
// failure stays until dismissed.
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCoversStore } from '../../stores/covers'
import { coverPrompt } from '../../api/covers'
import { coverIdeaFor } from '../../composables/useAutoTitle'
import { PromptCancelled, hasNonLatin, useCoverDescribe } from '../../composables/useCoverDescribe'
import type { LibTrack } from './libraryTracks'

export function useCoverActions(track: () => LibTrack) {
  const { t } = useI18n()
  const covers = useCoversStore()
  const describer = useCoverDescribe()
  const id = (): number => track().id

  const has = computed(() => !!covers.urlFor(id()))
  const job = computed(() => covers.busyFor(id()))
  const failed = computed(() => (job.value ? null : covers.failedFor(id())))
  const pct = computed(() => (job.value?.status === 'running' && job.value.progress != null ? Math.round(job.value.progress * 100) : null))
  const stateText = computed(() => {
    const j = job.value
    if (!j) return ''
    if (j.status === 'queued') return t('covers.queued')
    // the engine's own stage names (sampling, vae_decode…) are not shown: only its start, which takes a while
    if (j.stage === 'starting engine' || j.stage === 'loading model') return t('covers.starting')
    return pct.value != null ? t('covers.makingPct', { pct: pct.value }) : t('covers.making')
  })
  const describing = computed(() => describer.busy.value)
  const describePct = computed(() => {
    const p = describer.progress.value
    return p && p.percent > 0 ? Math.round(p.percent) : null
  })
  const busy = computed(() => !!job.value || describing.value)
  const fail = (err: unknown): string => (err instanceof Error ? err.message : String(err))

  /** The track's kept description; '' without one (or when it cannot be read). */
  async function savedPrompt(trackId: number): Promise<string> {
    try {
      const p = await coverPrompt(trackId)
      return p.source === 'saved' ? p.prompt.trim() : ''
    } catch {
      return ''
    }
  }

  /** The assistant's description, '' after Stop; a failure shows in the panel and gives null. */
  async function describe(wish = ''): Promise<string | null> {
    try {
      return await describer.describe(track(), wish)
    } catch (err) {
      if (err instanceof PromptCancelled) return ''
      covers.error = t('covers.describeFailed', { error: fail(err) })
      return null
    }
  }

  /** Make a cover / Another cover (a new seed): from the kept description, else the assistant's idea for the track
   *  (from naming it), else the assistant writes one now when it is ready, else the server's automatic one. */
  async function make(another: boolean): Promise<void> {
    if (busy.value) return
    const tid = id()
    covers.error = ''
    let text = (await savedPrompt(tid)) || coverIdeaFor(tid)
    if (!text && (await describer.ensure())) {
      const written = await describe()
      if (!written || tid !== id()) return
      text = written
    }
    await covers.make([tid], { ...(text ? { prompts: { [tid]: text } } : {}), ...(another ? { seed: covers.newSeed() } : {}) })
  }

  // ---- the description ----
  const editing = ref(false)
  const text = ref('')
  const loadingPrompt = ref(false)
  const source = ref<'saved' | 'assistant' | 'auto' | null>(null)
  /** The text before "Make it with the assistant" replaced it, until the user edits the field. */
  const before = ref<string | null>(null)
  const field = ref<HTMLTextAreaElement | null>(null)
  async function openEdit(): Promise<void> {
    const tid = id()
    editing.value = true
    covers.error = ''
    before.value = null
    source.value = null
    text.value = ''
    loadingPrompt.value = true
    try {
      const p = await coverPrompt(tid)
      if (tid !== id() || !editing.value) return
      const idea = coverIdeaFor(tid)
      if (p.source === 'saved') { text.value = p.prompt; source.value = 'saved' }
      else if (idea) { text.value = idea; source.value = 'assistant' }
      else { text.value = p.prompt; source.value = 'auto' }
    } catch (err) {
      const idea = coverIdeaFor(tid)
      if (idea) { text.value = idea; source.value = 'assistant' }
      covers.error = fail(err)
    } finally {
      loadingPrompt.value = false
    }
    void nextTick(() => field.value?.focus())
  }
  function closeEdit(): void {
    describer.cancel()
    editing.value = false
  }
  /** Draw: the text as it is; a text with non-Latin letters goes through the assistant first when it is ready. */
  async function draw(): Promise<void> {
    const tid = id()
    let desc = text.value.trim()
    if (!desc || busy.value) return
    covers.error = ''
    if (hasNonLatin(desc) && (await describer.ensure())) {
      const written = await describe(desc)
      if (!written || tid !== id()) return
      desc = written
      text.value = written
    }
    editing.value = false
    await covers.make([tid], { prompts: { [tid]: desc }, seed: covers.newSeed() })
  }
  /** The assistant's version of the text (or of the song, with the field empty), into the field for review. */
  async function rewrite(): Promise<void> {
    if (busy.value || !describer.ready.value) return
    const tid = id()
    const was = text.value
    covers.error = ''
    const written = await describe(was)
    if (!written || tid !== id() || !editing.value) return
    text.value = written
    before.value = was
    void nextTick(() => field.value?.focus())
  }
  function putBack(): void {
    if (before.value == null) return
    text.value = before.value
    before.value = null
  }
  function onInput(): void {
    before.value = null
  }
  const hint = computed(() => {
    const from = source.value === 'saved' ? t('covers.fromSaved') : source.value === 'assistant' ? t('covers.fromAssistant') : ''
    const how = describer.ready.value ? t('covers.anyLanguageHint') : t('covers.describeHint')
    return from ? `${from} ${how}` : how
  })

  // ---- remove: the first click arms the button for a few seconds ----
  const removeArmed = ref(false)
  let disarmTimer: ReturnType<typeof setTimeout> | null = null
  function disarm(): void {
    removeArmed.value = false
    if (disarmTimer) clearTimeout(disarmTimer)
    disarmTimer = null
  }
  async function onRemove(): Promise<void> {
    if (!removeArmed.value) {
      removeArmed.value = true
      disarmTimer = setTimeout(disarm, 4000)
      return
    }
    disarm()
    await covers.remove(id())
  }

  watch(id, () => {
    disarm()
    describer.cancel()
    editing.value = false
    text.value = ''
    before.value = null
  })
  onBeforeUnmount(() => { disarm(); describer.cancel() })

  return {
    covers, describer, has, job, failed, pct, stateText, describing, describePct, busy, make,
    editing, text, loadingPrompt, before, field, openEdit, closeEdit, draw, rewrite, putBack, onInput, hint,
    removeArmed, disarm, onRemove,
  }
}
