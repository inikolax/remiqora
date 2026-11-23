<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useOrchestratorStore } from '../../stores/orchestrator'
import { MODEL_LABELS } from '../../composables/useModelSwitch'
import type { ModelId } from '../../types'

/**
 * Above a form whose engine is stopped: the form can be filled in as it is, and Create will start the engine.
 * Says what that costs: the engine that holds the GPU now stops, and the first take after a start takes longer.
 */
const props = defineProps<{ modelId: ModelId }>()
const { t } = useI18n()
const orchestrator = useOrchestratorStore()
const other = computed(() => {
  const active = orchestrator.activeModel
  return active && active !== props.modelId && orchestrator.statuses[active]?.status === 'running' ? MODEL_LABELS[active] : null
})
</script>

<template>
  <p class="rounded-lg border border-status-queued/40 bg-status-queued/10 px-3 py-2 text-xs leading-relaxed text-text">
    {{ other ? t('create.startsOnCreateOther', { name: MODEL_LABELS[modelId], other }) : t('create.startsOnCreate', { name: MODEL_LABELS[modelId] }) }}
  </p>
</template>
