<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ScoreEditorCtx } from '../useScoreEditor'
import NotesHelp from './NotesHelp.vue'
import type { NotesHelpSection } from './NotesHelp.vue'

/**
 * "Notes help" and the window it opens: the "?" in the workspace header (`button`), the form's notes card (`small`)
 * and the empty state (`link`). Each opener keeps its own window, so focus goes back to the button that opened it.
 */
const props = withDefaults(defineProps<{
  editor?: ScoreEditorCtx | null
  plan?: 'off' | 'melody' | 'full' | null
  start?: NotesHelpSection
  variant?: 'button' | 'small' | 'link'
  /** `button` only: the label shows from this width up, the "?" alone below it. */
  labelFrom?: 'always' | 'sm' | 'xl'
}>(), { editor: null, plan: null, start: undefined, variant: 'button', labelFrom: 'always' })
const emit = defineEmits<{ reveal: [] }>()
// two roots (the button and the teleported window): a class from the parent goes to the button
defineOptions({ inheritAttrs: false })
const { t } = useI18n()
const open = ref(false)
</script>

<template>
  <button
    v-bind="$attrs"
    type="button"
    :class="{
      'se-btn': props.variant === 'button',
      'inline-flex h-6 items-center gap-1 rounded-md px-1.5 text-[11.5px] text-text-dim hover:bg-panel-2 hover:text-text focus-visible:outline-2 focus-visible:outline-accent1': props.variant === 'small',
      'inline-flex items-center gap-1 text-accent1-text underline underline-offset-2 hover:text-text focus-visible:outline-2 focus-visible:outline-accent1': props.variant === 'link',
    }"
    :title="t('notesHelp.openTip')" :aria-label="t('notesHelp.open')" aria-haspopup="dialog" @click="open = true"
  >
    <svg viewBox="0 0 24 24" class="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M9.5 9a2.5 2.5 0 1 1 3.4 2.33c-.77.32-1.4.98-1.4 1.92V14" />
      <circle cx="12" cy="17.5" r=".8" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="10" />
    </svg>
    <span :class="{ 'hidden sm:inline': props.variant === 'button' && props.labelFrom === 'sm', 'hidden xl:inline': props.variant === 'button' && props.labelFrom === 'xl' }">{{ t('notesHelp.open') }}</span>
  </button>
  <NotesHelp :open="open" :editor="props.editor" :plan="props.plan" :start="props.start" @close="open = false" @reveal="emit('reveal')" />
</template>
