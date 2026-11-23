<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDialogA11y } from '../../../composables/useDialogA11y'
import ParamGroups from './ParamGroups.vue'
import type { ParamGroupSpec } from './types'

/**
 * The console: every group of an engine's parameters at once, in a window, with the line of what the request
 * will carry. The form's own controls reach their rows through the same slots as in ParamGroups.
 */
const props = defineProps<{
  open: boolean
  title: string
  groups: ParamGroupSpec[]
  changed: number
  total: number
  /** name=value pairs; `set` marks the ones given by hand. */
  request: { k: string; v: string; set: boolean }[]
  note: string
}>()
const emit = defineEmits<{ close: []; reset: [] }>()
const { t } = useI18n()

// aria-modal promises a real modal: focus moves in on open, Tab stays inside, and goes back to the opener on close
const dialogEl = ref<HTMLElement | null>(null)
const { onKeydown } = useDialogA11y(dialogEl, () => props.open, () => emit('close'))

function onKey(e: KeyboardEvent): void {
  if (e.key === 'Escape' && props.open) emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @mousedown.self="emit('close')">
      <div class="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-border bg-panel shadow-2xl" ref="dialogEl" role="dialog" aria-modal="true" :aria-label="title" @keydown="onKeydown">
        <div class="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-4 py-3">
          <h3 class="text-base font-semibold text-text">{{ title }}</h3>
          <span class="text-xs text-text-dim">{{ t('yueGen.manual.changed', { n: changed, total }) }}</span>
          <button type="button" class="ms-auto rounded-lg border border-border px-2.5 py-1 text-xs text-text-dim hover:text-text disabled:opacity-40" :disabled="!changed" @click="emit('reset')">{{ t('yueGen.manual.resetAll') }}</button>
          <button type="button" data-autofocus class="rounded-lg border border-border px-2.5 py-1 text-xs text-text hover:bg-panel-2" @click="emit('close')">{{ t('yueGen.manual.done') }}</button>
        </div>
        <div class="min-h-0 flex-1 overflow-y-auto p-4">
          <ParamGroups :groups="groups" :columns="2">
            <template v-for="(_, name) in $slots" #[name]><slot :name="name" /></template>
          </ParamGroups>
        </div>
        <div class="flex shrink-0 flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-border px-4 py-2.5 text-xs">
          <span class="font-semibold text-text">{{ t('yueGen.manual.sends') }}</span>
          <code class="min-w-0 flex-1 font-mono text-xs leading-relaxed text-text-dim">
            <template v-for="(x, i) in request" :key="x.k"><span :class="x.set ? 'text-accent2' : ''">{{ x.k }}={{ x.v }}</span><span v-if="i < request.length - 1">, </span></template>
          </code>
          <span class="w-full text-xs text-text-dim">{{ note }}</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>
