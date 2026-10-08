<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDialogA11y } from '../../composables/useDialogA11y'

/** wide: for long help with cards and columns (the AI arranger's guide). */
const props = defineProps<{ open: boolean; title: string; wide?: boolean }>()
const emit = defineEmits<{ close: [] }>()
const { t } = useI18n()

const dialogEl = ref<HTMLElement | null>(null)
const { onKeydown } = useDialogA11y(dialogEl, () => props.open, () => emit('close'))
</script>

<template>
  <!-- Teleported: inside the header (backdrop-filter) a fixed overlay would be sized to the header, not the screen -->
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:items-center" @click.self="emit('close')">
      <div
        ref="dialogEl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
        class="my-8 w-full rounded-xl border border-border bg-panel p-5 shadow-2xl"
        :class="props.wide ? 'max-w-4xl' : 'max-w-2xl'"
        @keydown="onKeydown"
      >
        <div class="mb-4 flex items-center justify-between">
          <h3 id="help-modal-title" class="text-lg font-semibold text-text">{{ title }}</h3>
          <button type="button" class="rounded-full p-1 text-text-dim hover:bg-panel-2 hover:text-text" :aria-label="t('common.close')" @click="emit('close')">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div class="max-h-[70vh] space-y-3 overflow-y-auto text-sm leading-relaxed text-text-dim">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>
