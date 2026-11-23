<script setup lang="ts">
// What is happening to a track's cover picture right now: the assistant describing it (with Stop), the cover being
// made (its state from the queue, with Stop), a failure (until dismissed), an error of the last action.
import { useI18n } from 'vue-i18n'
import SparklesIcon from '../../components/shared/icons/SparklesIcon.vue'
import type { useCoverActions } from './useCoverActions'

const props = defineProps<{ actions: ReturnType<typeof useCoverActions> }>()
const { t } = useI18n()
const a = props.actions
const { describing, describePct, job, stateText, pct, failed, covers, describer } = a
</script>

<template>
  <!-- the assistant describes the picture first: its progress, with Stop -->
  <div v-if="describing" class="space-y-1.5 rounded-lg border border-border bg-panel-2 px-2.5 py-2 text-xs" role="status">
    <div class="flex items-center gap-2">
      <SparklesIcon class="h-3.5 w-3.5 shrink-0 animate-pulse text-accent1-text motion-reduce:animate-none" />
      <span class="min-w-0 flex-1 text-text">{{ describePct != null ? t('covers.describingPct', { pct: describePct }) : t('covers.describing') }}</span>
      <button type="button" class="min-h-6 rounded-md px-1.5 py-0.5 text-text-dim hover:text-text" @click="describer.cancel()">{{ t('covers.stop') }}</button>
    </div>
    <div class="h-1 overflow-hidden rounded-full bg-slider-track/50" aria-hidden="true">
      <div v-if="describePct != null" class="accent-gradient h-full rounded-full transition-[width]" :style="{ width: `${describePct}%` }"></div>
      <div v-else class="h-full w-1/3 animate-pulse rounded-full bg-accent1/60 motion-reduce:animate-none"></div>
    </div>
  </div>

  <!-- being made: its state from the queue, with Stop -->
  <div v-else-if="job" class="space-y-1.5 rounded-lg border border-border bg-panel-2 px-2.5 py-2 text-xs" role="status">
    <div class="flex items-center gap-2">
      <span class="min-w-0 flex-1 text-text">{{ stateText }}</span>
      <button type="button" class="min-h-6 rounded-md px-1.5 py-0.5 text-text-dim hover:text-text" @click="covers.cancel(job.id)">{{ t('covers.stop') }}</button>
    </div>
    <div class="h-1 overflow-hidden rounded-full bg-slider-track/50" aria-hidden="true">
      <div v-if="pct != null" class="accent-gradient h-full rounded-full transition-[width]" :style="{ width: `${pct}%` }"></div>
      <div v-else class="h-full w-1/3 animate-pulse rounded-full bg-accent1/60 motion-reduce:animate-none"></div>
    </div>
  </div>

  <div v-else-if="failed" class="flex items-start gap-2 rounded-lg bg-status-failed/10 px-2.5 py-2 text-xs text-status-failed" role="alert">
    <span class="min-w-0 flex-1 break-words">{{ t('covers.failed', { error: failed.error || '?' }) }}</span>
    <button type="button" class="flex h-6 min-w-6 items-center justify-center rounded-md px-1 hover:bg-status-failed/10" :aria-label="t('covers.dismiss')" :title="t('covers.dismiss')" @click="covers.dismiss(failed.id)">✕</button>
  </div>
  <p v-if="covers.error" class="rounded-lg bg-status-failed/10 px-2.5 py-2 text-xs text-status-failed" role="alert">{{ covers.error }}</p>
</template>
