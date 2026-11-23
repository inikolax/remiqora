<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useScoreWorkspace } from '../../stores/scoreWorkspace'
import { useYue2Store } from '../../stores/yue2'
import { useNotesView } from '../../composables/useNotesView'
import { sectionAt } from '../../audio/score'
import ScoreEditor from '../../components/score/ScoreEditor.vue'
import ScoreIcon from '../../components/score/ScoreIcon.vue'
import NotesHelpButton from '../../components/score/help/NotesHelpButton.vue'
import '../../components/score/score.css'

/**
 * YuE2's "Notes" on Create: the score editor in the session's place, on the whole width. It edits the form's own
 * score (the workspace store's editor), so there is no save or apply: the green "form's notes" badge says so. A take's
 * score opens as a labelled copy with a banner: "To the form" puts it into the form, "Close" goes back to the form's.
 */
const props = defineProps<{ narrow: boolean; formShown: boolean }>()
const emit = defineEmits<{ toggleForm: [] }>()
const { t } = useI18n()
const ws = useScoreWorkspace()
const yue = useYue2Store()
const notes = useNotesView()
const editorView = ref<InstanceType<typeof ScoreEditor> | null>(null)

function fromSong(): void {
  // "From a song..." fills the form's score: a take's copy steps aside first
  if (ws.mode === 'copy') ws.closeCopy()
  ws.fromSongRequest++
}

/** The take's copy goes into the form (one undo step of the form's score); a different score there is asked about. */
function copyToForm(): void {
  const abc = ws.copyAbc
  const cur = ws.formAbc.trim()
  if (cur && cur !== abc.trim() && !window.confirm(t('score.workspace.replaceConfirm'))) return
  yue.requestInsertAbc(abc)
  ws.closeCopy()
}

// ---- requests made before the workspace was up: a MIDI file picked in the form's card, bars to show ----
watch(() => ws.pendingMidi, (file) => {
  if (!file) return
  ws.pendingMidi = null
  void nextTick(() => editorView.value?.importMidi(file))
}, { immediate: true })

watch(() => ws.focus, (f) => {
  if (!f) return
  ws.focus = null
  const ed = ws.editor
  if (!ed) return
  const { ui } = ed
  if (ui.view === 'simple') {
    const sec = sectionAt(ed.score.value, f.from)
    if (sec) ui.simpleSection = sec.id
    return
  }
  if (ui.view === 'sheet') ui.view = 'roll'
  ui.cursorTick = f.from * ed.tpb.value
  // now (a grid mounting keeps the left bar it finds) and once it has measured its real width
  ed.showBars(f.from, f.to)
  setTimeout(() => requestAnimationFrame(() => ed.showBars(f.from, f.to)), 150)
}, { immediate: true })

onBeforeUnmount(() => ws.halt())
</script>

<template>
  <section class="flex min-h-0 min-w-0 flex-col rounded-xl border border-border bg-panel p-3 sm:p-4" :aria-label="t('score.workspace.label')">
    <ScoreEditor
      v-if="ws.editor" :key="ws.mode" ref="editorView" layout="workspace" :editor="ws.editor"
      :plan="ws.mode === 'form' ? ws.plan : 'full'" :extracting="ws.extracting" :title="ws.mode === 'copy' ? ws.copy?.title : ws.title"
      class="min-h-0 flex-1" @from-song="fromSong"
    >
      <template #lead>
        <button type="button" class="se-btn" :title="t('score.workspace.backTip')" @click="notes.close()">
          <ScoreIcon name="right" class="rotate-180 rtl:rotate-0" />{{ t('create.session') }}
        </button>
        <h2 class="m-0 flex min-w-0 items-baseline gap-1.5 text-[15px] font-semibold">
          {{ t('score.workspace.title') }}
          <span dir="auto" class="truncate text-[13px] font-medium text-text-dim">{{ (ws.mode === 'copy' ? ws.copy?.title : ws.title) || t('create.untitled') }}</span>
        </h2>
        <span
          v-if="ws.mode === 'form'" class="inline-flex shrink-0 items-center gap-1 rounded-md border border-dashed border-status-done/50 bg-status-done/10 px-1.5 py-0.5 text-[11px] font-medium text-status-done"
          :title="t('score.workspace.formBadgeTip')"
        ><ScoreIcon name="check" class="h-3 w-3" />{{ t('score.workspace.formBadge') }}</span>
        <span v-else class="inline-flex shrink-0 items-center rounded-md bg-sky-500/15 px-1.5 py-0.5 text-[11px] font-medium text-sky-300" :title="t('score.workspace.copyBadgeTip')">{{ t('score.workspace.copyBadge') }}</span>
      </template>
      <template #tools>
        <NotesHelpButton :editor="ws.editor" :plan="ws.plan" label-from="xl" />
        <button v-if="props.narrow" type="button" class="se-btn" :class="{ on: props.formShown }" :aria-pressed="props.formShown" @click="emit('toggleForm')">{{ t('score.workspace.form') }}</button>
      </template>
      <template #banner>
        <div v-if="ws.mode === 'copy' && ws.copy" class="flex flex-wrap items-center gap-3 rounded-xl border border-sky-500/30 bg-sky-500/[0.07] px-3.5 py-2.5">
          <span class="accent-gradient h-9 w-9 shrink-0 rounded-lg" aria-hidden="true"></span>
          <div class="min-w-0 flex-1">
            <p class="m-0 text-[13px] font-semibold">{{ t('score.workspace.copyTitle', { title: ws.copy.title }) }}</p>
            <p class="m-0 text-[11.5px] text-text-dim">{{ t('score.workspace.copyLead') }}</p>
          </div>
          <button type="button" class="se-btn grad" @click="copyToForm"><ScoreIcon name="import" />{{ t('score.workspace.toForm') }}</button>
          <button type="button" class="se-btn" @click="ws.closeCopy()">{{ t('score.common.close') }}</button>
        </div>
      </template>
    </ScoreEditor>
  </section>
</template>
