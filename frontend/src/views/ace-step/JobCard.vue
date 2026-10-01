<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAceStepStore } from '../../stores/aceStep'
import type { AceJob } from '../../stores/aceStep'
import { formatClock, formatCreated } from '../../composables/formatCreated'
import StatusBadge from '../../components/shared/StatusBadge.vue'
import ProgressBar from '../../components/shared/ProgressBar.vue'
import WaveformPlayer from '../../components/shared/WaveformPlayer.vue'
import BatchABPlayer from '../../components/shared/BatchABPlayer.vue'
import StemsPanel from '../../components/shared/StemsPanel.vue'
import MidiPanel from '../../components/shared/MidiPanel.vue'
import EditableTitle from '../../components/shared/EditableTitle.vue'
import { friendlyTitle } from '../../utils/trackTitle'
import StyleChips from '../../components/shared/StyleChips.vue'
import CardMenu from '../../components/shared/CardMenu.vue'
import type { MenuItem } from '../../components/shared/CardMenu.vue'
import DownloadIcon from '../../components/shared/icons/DownloadIcon.vue'
import ChevronIcon from '../../components/shared/icons/ChevronIcon.vue'
import ReuseIcon from '../../components/shared/icons/ReuseIcon.vue'
import TrashIcon from '../../components/shared/icons/TrashIcon.vue'
import { downloadSavedTrack } from '../../composables/useTrackDownload'
import TrackDetails from '../../components/shared/TrackDetails.vue'

const props = defineProps<{ job: AceJob }>()
const store = useAceStepStore()
const { t } = useI18n()
const expanded = ref(false)

const shortTitle = computed(() => friendlyTitle(props.job.title))
const engineLabel = 'ACE-Step'
const created = computed(() => formatCreated(props.job.createdAt))
// Custom-mode style tags land in params.prompt, Simple-mode ones in
// params.sample_query (or params.prompt when a reference track is attached) -
// the title itself is truncated to 60 chars at submit time, so this is the
// only place the full, untruncated style text is still available.
const styleText = computed(() => {
  const p = props.job.params || {}
  return (p.prompt as string) || (p.sample_query as string) || ''
})
const inProgress = computed(() => props.job.status === 'queued' || props.job.status === 'running')
const menuItems = computed<MenuItem[]>(() => {
  const items: MenuItem[] = []
  if (props.job.status === 'done') items.push({ key: 'reuse', label: t('trackCard.reuse') })
  items.push({ key: 'delete', label: t('trackCard.deleteTrack'), danger: true, confirmLabel: t('trackCard.confirmDelete') })
  return items
})

async function cancel() {
  await store.cancel(props.job.id)
}
function remove() {
  void store.removeJob(props.job.id)
}
// Deleting takes two clicks on the same button: the first one arms it for a few seconds.
const deleteArmed = ref(false)
let disarmTimer: ReturnType<typeof setTimeout> | null = null
function disarmDelete() {
  deleteArmed.value = false
  if (disarmTimer) clearTimeout(disarmTimer)
  disarmTimer = null
}
function onDeleteClick() {
  if (deleteArmed.value) {
    disarmDelete()
    remove()
    return
  }
  deleteArmed.value = true
  disarmTimer = setTimeout(disarmDelete, 4000)
}
onBeforeUnmount(disarmDelete)
function onMenu(key: string) {
  if (key === 'reuse') copyParamsToForm()
  else if (key === 'delete') remove()
}
function download(url: string, index: number) {
  const filename = `${(props.job.title || 'track').replace(/[^\w\-]+/g, '_')}_${index + 1}.${props.job.audioFormat}`
  const trackId = props.job.dbIds[index]
  // A saved track goes through the server so the tags are written; a variant that is not saved yet is plain audio.
  if (trackId != null) {
    void downloadSavedTrack(trackId, filename)
    return
  }
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}
function copyParamsToForm() {
  const p = props.job.params || {}
  store.requestInsertParams({
    ...p,
    lyrics: props.job.lyrics || p.lyrics || '',
    model: props.job.model || p.model,
    audio_format: props.job.audioFormat || p.audio_format,
    query: props.job.title || p.query || '',
  })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <article class="@container relative overflow-hidden rounded-xl border border-border bg-panel p-3">

    <header class="flex items-start">
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <EditableTitle
            class="min-w-0 flex-1"
            :model-value="job.title"
            :display-text="shortTitle"
            :placeholder="t('aceJob.noDescription')"
            :editable="job.dbIds.length > 0"
            @rename="(title) => store.renameJob(job.id, title)"
          />
          <div class="ml-auto flex shrink-0 items-center gap-1">
            <div v-if="job.status === 'done' && job.durationSec" class="mr-1 hidden border-r border-border/60 pr-3 text-right @min-[640px]:block">
              <p class="text-sm font-semibold tabular-nums text-text" :title="`${Math.round(job.durationSec)} ${t('common.secondsUnit')}`">{{ formatClock(job.durationSec) }}</p>
            </div>
            <StatusBadge v-if="job.status !== 'done'" :status="job.status" class="mr-1" />
            <button
              v-if="job.status === 'done' && job.audioUrls.length === 1"
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-lg text-text-dim hover:bg-panel-2 hover:text-text"
              :aria-label="t('trackCard.downloadTagged')"
              :title="t('trackCard.downloadTagged')"
              @click="download(job.audioUrls[0], 0)"
            >
              <DownloadIcon class="h-4 w-4" />
            </button>
            <button v-if="inProgress" type="button" class="flex h-8 w-8 items-center justify-center rounded-lg text-text-dim hover:bg-panel-2 hover:text-status-failed" :title="t('aceJob.cancel')" :aria-label="t('aceJob.cancel')" @click="cancel">⏹</button>
            <button
              v-if="job.status === 'done'"
              type="button"
              class="hidden h-8 w-8 items-center justify-center rounded-lg text-text-dim hover:bg-panel-2 hover:text-text @min-[640px]:flex"
              :aria-label="t('trackCard.reuse')"
              :title="t('trackCard.reuse')"
              @click="copyParamsToForm"
            >
              <ReuseIcon class="h-4 w-4" />
            </button>
            <button
              v-if="!inProgress"
              type="button"
              class="hidden h-8 items-center justify-center rounded-lg @min-[640px]:flex"
              :class="deleteArmed ? 'bg-status-failed/15 px-2 text-xs font-medium text-status-failed' : 'w-8 text-text-dim hover:bg-panel-2 hover:text-status-failed'"
              :aria-label="deleteArmed ? t('trackCard.confirmDelete') : t('trackCard.deleteTrack')"
              :title="deleteArmed ? t('trackCard.confirmDelete') : t('trackCard.deleteTrack')"
              @click="onDeleteClick"
              @blur="disarmDelete"
            >
              <template v-if="deleteArmed">{{ t('trackCard.deleteShort') }}</template>
              <TrashIcon v-else class="h-4 w-4" />
            </button>
            <CardMenu v-if="!inProgress" class="@min-[640px]:hidden" :items="menuItems" :label="t('trackCard.moreActions')" @select="onMenu" />
            <button
              v-if="job.status === 'done'"
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-lg text-text-dim hover:bg-panel-2 hover:text-text"
              :aria-expanded="expanded"
              :aria-label="expanded ? t('trackCard.collapse') : t('trackCard.expand')"
              :title="expanded ? t('trackCard.collapse') : t('trackCard.expand')"
              @click="expanded = !expanded"
            >
              <ChevronIcon class="h-4 w-4 transition-transform" :class="expanded ? 'rotate-180' : ''" />
            </button>
          </div>
        </div>
        <div class="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <span class="rounded-md border border-border px-1.5 py-px text-xs font-medium leading-4 text-text-dim">{{ engineLabel }}</span>
          <span class="text-xs text-text-dim" :title="created.full">{{ created.label }}</span>
          <span v-if="styleText" class="h-3.5 w-px bg-border" aria-hidden="true"></span>
          <StyleChips class="min-w-0" :max="4" :text="styleText" @more="expanded = true" />
        </div>

        <div v-if="inProgress" class="mt-2 space-y-1">
          <ProgressBar :value="job.progress" />
          <p class="text-xs text-text-dim">{{ job.stage || (job.status === 'queued' ? t('aceJob.queued') : t('aceJob.generating')) }}</p>
        </div>
        <div v-else-if="job.status === 'failed'" class="mt-2 rounded-lg bg-status-failed/10 p-2 text-xs text-status-failed">{{ job.error }}</div>
        <div v-else-if="job.status === 'cancelled'" class="mt-2 rounded-lg bg-panel-2 p-2 text-xs text-text-dim">{{ t('aceJob.cancelled') }}</div>
        <template v-else-if="job.status === 'done'">
          <!-- One track: a waveform. Several variants of a batch: the seamless A/B player and a download per variant. -->
          <WaveformPlayer v-if="job.audioUrls.length === 1" class="mt-2" :src="job.audioUrls[0]" :duration-hint="job.durationSec" total-class="@min-[640px]:hidden" />
          <BatchABPlayer v-else-if="job.audioUrls.length > 1" class="mt-2" :sources="job.audioUrls" :duration-sec="job.durationSec" hide-download />
          <div v-if="job.audioUrls.length > 1" class="mt-2 flex flex-wrap gap-1.5">
            <button
              v-for="(url, i) in job.audioUrls"
              :key="'dl' + url"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs text-text-dim hover:border-accent1/60 hover:text-text"
              :title="t('trackCard.downloadTagged')"
              @click="download(url, i)"
            >
              <DownloadIcon class="h-3.5 w-3.5" />
              {{ t('trackCard.variant', { n: i + 1 }) }}
            </button>
          </div>
        </template>
      </div>
    </header>

    <div v-if="expanded && job.status === 'done'" class="mt-3 space-y-3 border-t border-border/60 pt-3">
      <TrackDetails v-if="styleText || job.lyrics" :style-text="styleText" :lyrics="job.lyrics" />

      <div v-for="(id, i) in job.dbIds" :key="'stems' + id" class="space-y-1.5">
        <p v-if="job.dbIds.length > 1" class="text-xs font-medium text-text-dim">{{ t('trackCard.variant', { n: i + 1 }) }}</p>
        <StemsPanel :track-id="id" :title="job.title" :lyrics="job.lyrics" model="ace_step" />
        <MidiPanel :track-id="id" />
      </div>

      <p class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-dim">
        <span>ACE-Step</span>
        <span>{{ job.audioFormat }}</span>
      </p>

      <button
        type="button"
        class="flex w-full items-center justify-center gap-1.5 rounded-lg border-t border-border/60 py-2 text-xs text-text-dim hover:bg-panel-2 hover:text-text"
        @click="expanded = false"
      >
        <ChevronIcon class="h-3.5 w-3.5 rotate-180" />
        {{ t('trackCard.collapse') }}
      </button>
    </div>
  </article>
</template>
