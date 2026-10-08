<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { MODEL_LABELS, useModelSwitch } from '../../composables/useModelSwitch'
import type { ModelId, ModelRuntimeStatus } from '../../types'

const props = defineProps<{ modelId: ModelId; status: ModelRuntimeStatus; error: string | null }>()
const { t } = useI18n()
const { selectModel } = useModelSwitch()

async function start() {
  try {
    // the banner sits on the model's own page (or its LoRA page): start it here, don't leave
    await selectModel(props.modelId, { stay: true })
  } catch {
    // orchestrator.switchError is already surfaced in the header.
  }
}
</script>

<template>
  <div class="rounded-lg border border-border bg-panel px-4 py-2.5 text-sm">
    <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
      <p v-if="status === 'starting'" class="flex items-center gap-2 text-text-dim">
        <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-accent1 border-t-transparent"></span>
        {{ t('offlineBanner.starting', { model: MODEL_LABELS[modelId] }) }}
      </p>
      <p v-else-if="status === 'stopping'" class="text-text-dim">{{ t('offlineBanner.stopping', { model: MODEL_LABELS[modelId] }) }}</p>
      <template v-else>
        <p class="flex items-center gap-2 text-text-dim">
          <span class="h-2 w-2 shrink-0 rounded-full" :class="status === 'error' ? 'bg-status-failed' : 'bg-gray-500'"></span>
          {{ t('offlineBanner.notRunning', { model: MODEL_LABELS[modelId] }) }}
        </p>
        <button type="button" class="accent-gradient rounded-lg px-3 py-1.5 text-sm font-medium text-white sm:ml-auto" @click="start">{{ t('offlineBanner.start', { model: MODEL_LABELS[modelId] }) }}</button>
      </template>
    </div>
    <p v-if="status === 'error' && error" class="mt-2 whitespace-pre-line rounded-lg bg-status-failed/10 p-3 text-xs text-status-failed">{{ error }}</p>
  </div>
</template>
