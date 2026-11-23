import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, effectScope, ref, shallowRef } from 'vue'
import type { EffectScope } from 'vue'
import { createScoreEditor } from '../components/score/useScoreEditor'
import type { ScoreEditorCtx } from '../components/score/useScoreEditor'

/**
 * The YuE2 score's workspace ("Ноты"): the form's ABC and the one editor over it, shared by the form's score card
 * and the wide editor that takes the session's place on Create. The form's `abc` field IS `formAbc` here (the form
 * binds its draft to it), so an edit in the workspace is an edit of the form: no copy, no "apply".
 *
 * A take's score can be opened too: then the workspace shows a copy with an editor of its own; its edits stay in the
 * copy until "To the form" puts it into the form.
 */
export interface TakeCopy {
  /** The take's row key, so opening the same take again keeps the copy and its edits. */
  key: string
  title: string
  lyrics: string
  style: string
}

export const useScoreWorkspace = defineStore('scoreWorkspace', () => {
  // ---- the form's side (kept by GenerateForm) ----
  const formAbc = ref('')
  const lyrics = ref('')
  const style = ref('')
  /** The form's song name, for the header ("" = untitled). */
  const title = ref('')
  /** The form's tab: the lyrics' line is lit only while the Song tab shows. */
  const formTab = ref<'song' | 'melody' | 'tuning'>('song')
  /** The form's melody plan: 'melody' means YuE2 leaves the chords out. */
  const plan = ref<'off' | 'melody' | 'full'>('full')
  /** "From a song..." is running in the form. */
  const extracting = ref(false)
  /** Bumped to ask the form to pick an audio file for "From a song..." (the form owns that flow). */
  const fromSongRequest = ref(0)

  // ---- the editors: created on first use, inside a scope of their own (a store action has no component). The form
  // creates its editor right after its draft is read, so the restored score is the editor's start, not an undo step.
  let formScope: EffectScope | null = null
  const formEd = shallowRef<ScoreEditorCtx | null>(null)
  function formEditor(): ScoreEditorCtx {
    if (!formEd.value) {
      formScope = effectScope(true)
      formEd.value = formScope.run(() => createScoreEditor({
        getAbc: () => formAbc.value,
        setAbc: (v) => { formAbc.value = v },
        lyrics: () => lyrics.value,
        style: () => style.value,
      }))!
    }
    return formEd.value
  }

  const copy = shallowRef<TakeCopy | null>(null)
  const copyAbc = ref('')
  let copyScope: EffectScope | null = null
  const copyEd = shallowRef<ScoreEditorCtx | null>(null)
  function openCopy(c: TakeCopy, abc: string): void {
    if (copy.value?.key === c.key && copyEd.value) return
    closeCopy()
    copy.value = c
    copyAbc.value = abc
    copyScope = effectScope(true)
    copyEd.value = copyScope.run(() => createScoreEditor({
      getAbc: () => copyAbc.value,
      setAbc: (v) => { copyAbc.value = v },
      lyrics: () => c.lyrics,
      style: () => c.style,
    }))!
  }
  function closeCopy(): void {
    copyEd.value?.dispose()
    copyScope?.stop()
    copyScope = null
    copyEd.value = null
    copy.value = null
    copyAbc.value = ''
  }

  /** What the workspace shows: the take's copy while one is open, else the form's score. */
  const mode = computed<'form' | 'copy'>(() => (copy.value && copyEd.value ? 'copy' : 'form'))
  /** The editor on show; null until the form has set its score up (GenerateForm calls formEditor() after its draft). */
  const editor = computed<ScoreEditorCtx | null>(() => (mode.value === 'copy' ? copyEd.value : formEd.value))

  // ---- requests for the workspace (it may not be mounted yet when they are made) ----
  /** Bars to show once the workspace is up: a bar of the card's strip or a section chip. */
  const focus = ref<{ from: number; to: number } | null>(null)
  /** A MIDI file picked in the form's card: the workspace opens its track picker for it. */
  const pendingMidi = shallowRef<File | null>(null)
  /** The form's drawer on a narrow window. */
  const formDrawer = ref(false)

  /** Stops what plays when the workspace is left. */
  function halt(): void {
    formEd.value?.stop()
    copyEd.value?.stop()
  }

  return {
    formAbc, lyrics, style, title, formTab, plan, extracting, fromSongRequest,
    formEditor, copy, copyAbc, openCopy, closeCopy, mode, editor,
    focus, pendingMidi, formDrawer, halt,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useScoreWorkspace, import.meta.hot))
}
