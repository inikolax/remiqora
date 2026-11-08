<script setup lang="ts">
// One downloadable part of an engine (a checkpoint, a weight file) as a row: name and a one-line hint, the download
// size, and on the right what it is up to: downloaded (with a delete button for optional parts), downloading with
// progress, or a Download button. The same row serves ACE-Step, YuE2 and Stable Audio 3 on the Models page.
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { gb } from '../../utils/bytes'
import CheckIcon from './icons/CheckIcon.vue'
import DownloadIcon from './icons/DownloadIcon.vue'
import TrashIcon from './icons/TrashIcon.vue'

export interface PartDownload {
  status: 'running' | 'done' | 'failed' | 'cancelled'
  done: number
  total: number
  error: string | null
}

const props = defineProps<{
  name: string
  hint?: string
  /** Download size. */
  bytes: number
  /** What it takes on disk now (a partial download counts too). */
  onDisk?: number
  installed: boolean
  download: PartDownload | null
  /** The engine cannot run without it: no delete button. */
  required?: boolean
  deletable?: boolean
  /** Shows "Check" and "Re-download" next to an installed part (also for required ones). */
  verifiable?: boolean
  /** It is being checked now. */
  checking?: boolean
  /** The outcome of the last check, in words; `checkBad` colours it as a problem. */
  checkNote?: string
  checkBad?: boolean
  /** Another part is downloading: the button waits. */
  blocked?: boolean
  blockedTitle?: string
}>()
const emit = defineEmits<{ download: []; cancel: []; delete: []; verify: []; reinstall: [] }>()
const { t, locale } = useI18n()

const confirming = ref(false)
const reconfirming = ref(false)
const percent = computed(() => {
  const d = props.download
  return d && d.total > 0 ? Math.min(100, Math.round((d.done / d.total) * 100)) : 0
})
const retry = computed(() => props.download?.status === 'failed' || props.download?.status === 'cancelled')
</script>

<template>
  <li class="-mx-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 rounded-lg px-2 py-2.5 transition-colors hover:bg-panel-2/50 sm:grid-cols-[minmax(0,1fr)_4.5rem_minmax(11rem,auto)]">
    <div class="min-w-0">
      <p class="truncate text-sm font-medium text-text">{{ name }}</p>
      <p v-if="hint" class="text-xs leading-relaxed text-text-dim">{{ hint }}</p>
    </div>
    <span class="text-end text-xs tabular-nums text-text-dim">{{ t('models.size', { gb: gb(bytes, locale) }) }}</span>

    <!-- downloaded -->
    <div v-if="installed" class="col-span-2 flex items-center justify-end gap-2 sm:col-span-1">
      <template v-if="confirming">
        <span class="text-xs text-text-dim">{{ t('models.deleteAsk', { gb: gb(onDisk ?? bytes, locale) }) }}</span>
        <button type="button" class="rounded-lg bg-status-failed/15 px-2.5 py-1 text-xs font-medium text-status-failed hover:bg-status-failed/25" @click="confirming = false; emit('delete')">{{ t('models.deleteYes') }}</button>
        <button type="button" class="rounded-lg border border-border px-2.5 py-1 text-xs text-text-dim hover:text-text" @click="confirming = false">{{ t('models.deleteNo') }}</button>
      </template>
      <template v-else-if="reconfirming">
        <span class="text-xs text-text-dim">{{ t('models.reinstallAsk', { gb: gb(bytes, locale) }) }}</span>
        <button type="button" class="rounded-lg bg-accent1/15 px-2.5 py-1 text-xs font-medium text-accent1 hover:bg-accent1/25" @click="reconfirming = false; emit('reinstall')">{{ t('models.reinstallYes') }}</button>
        <button type="button" class="rounded-lg border border-border px-2.5 py-1 text-xs text-text-dim hover:text-text" @click="reconfirming = false">{{ t('models.reinstallNo') }}</button>
      </template>
      <template v-else>
        <span class="inline-flex items-center gap-1.5 rounded-full bg-status-done/15 px-2.5 py-1 text-xs text-status-done">
          <CheckIcon class="h-3.5 w-3.5" />{{ t('models.installed') }}
        </span>
        <template v-if="verifiable">
          <button type="button" class="rounded-lg border border-border px-2 py-1 text-xs text-text-dim hover:text-text disabled:opacity-50" :disabled="checking" :title="t('models.checkTitle')" @click="emit('verify')">
            {{ t(checking ? 'models.checking' : 'models.check') }}
          </button>
          <button type="button" class="rounded-lg border border-border px-2 py-1 text-xs text-text-dim hover:text-text disabled:opacity-50" :disabled="blocked" :title="blocked ? blockedTitle : t('models.reinstallTitle')" :aria-label="t('models.reinstallNamed', { name })" @click="reconfirming = true">
            {{ t('models.reinstall') }}
          </button>
        </template>
        <button
          v-if="deletable && !required"
          type="button"
          class="rounded-lg p-1.5 text-text-dim hover:bg-panel-2 hover:text-status-failed"
          :title="t('models.delete')"
          :aria-label="t('models.deleteNamed', { name })"
          @click="confirming = true"
        >
          <TrashIcon class="h-4 w-4" />
        </button>
      </template>
    </div>

    <!-- downloading -->
    <div v-else-if="download?.status === 'running'" class="col-span-2 flex items-center gap-3 sm:col-span-1">
      <div class="min-w-[7rem] flex-1">
        <div class="h-1.5 overflow-hidden rounded-full bg-panel-2">
          <div class="accent-gradient h-full rounded-full transition-[width] duration-700" :style="{ width: `${percent}%` }"></div>
        </div>
        <p class="mt-1 text-[11px] tabular-nums text-text-dim">{{ t('models.progress', { done: gb(download.done, locale), total: gb(download.total, locale), pct: percent }) }}</p>
      </div>
      <button type="button" class="rounded-lg border border-border px-2.5 py-1 text-xs text-text-dim hover:text-text" @click="emit('cancel')">{{ t('models.cancel') }}</button>
    </div>

    <!-- not there (perhaps after a failed or stopped try) -->
    <div v-else class="col-span-2 flex flex-col items-end gap-1 sm:col-span-1">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg border border-accent1/40 px-3 py-1.5 text-xs font-medium text-accent1 hover:bg-accent1/10 disabled:opacity-50 disabled:hover:bg-transparent"
        :disabled="blocked"
        :title="blocked ? blockedTitle : undefined"
        @click="emit('download')"
      >
        <DownloadIcon class="h-3.5 w-3.5" />{{ t(retry ? 'models.resume' : 'models.download') }}
      </button>
      <p v-if="download?.status === 'failed'" class="max-w-xs text-end text-[11px] leading-relaxed text-status-failed" role="alert">
        <slot name="error">{{ download.error }}</slot>
      </p>
      <p v-else-if="download?.status === 'cancelled'" class="text-[11px] text-text-dim">{{ t('models.stopped') }}</p>
      <p v-else-if="$slots.note" class="max-w-xs text-end text-[11px] leading-relaxed text-text-dim"><slot name="note" /></p>
    </div>

    <p v-if="checkNote && installed" class="col-span-full text-end text-[11px] leading-relaxed" :class="checkBad ? 'text-status-failed' : 'text-text-dim'" :role="checkBad ? 'alert' : 'status'">{{ checkNote }}</p>
  </li>
</template>
