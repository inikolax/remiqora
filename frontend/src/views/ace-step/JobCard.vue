<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAceStepStore } from '../../stores/aceStep'
import type { AceJob } from '../../stores/aceStep'
import { formatDuration } from '../../composables/formatDuration'
import StatusBadge from '../../components/shared/StatusBadge.vue'
import ProgressBar from '../../components/shared/ProgressBar.vue'
import WaveformPlayer from '../../components/shared/WaveformPlayer.vue'
import BatchABPlayer from '../../components/shared/BatchABPlayer.vue'
import StemsPanel from '../../components/shared/StemsPanel.vue'
import MidiPanel from '../../components/shared/MidiPanel.vue'
import EditableTitle from '../../components/shared/EditableTitle.vue'
import { downloadSavedTrack } from '../../composables/useTrackDownload'

const props = defineProps<{ job: AceJob }>()
const store = useAceStepStore()
const { t, locale } = useI18n()
const showDetails = ref(false)
const copied = ref(false)

const createdLabel = computed(() => new Date(props.job.createdAt).toLocaleString(locale.value === 'ru' ? 'ru-RU' : 'en-US'))
// Custom-mode style tags land in params.prompt, Simple-mode ones in
// params.sample_query (or params.prompt when a reference track is attached) -
// the title itself is truncated to 60 chars at submit time, so this is the
// only place the full, untruncated style text is still available.
const styleText = computed(() => {
  const p = props.job.params || {}
  return (p.prompt as string) || (p.sample_query as string) || ''
})

async function cancel() {
  await store.cancel(props.job.id)
}
function remove() {
  void store.removeJob(props.job.id)
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
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
</script>

<template>
  <div class="space-y-3 rounded-xl border border-border bg-panel p-4">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <EditableTitle
          :model-value="job.title"
          :placeholder="t('aceJob.noDescription')"
          :editable="job.dbIds.length > 0"
          @rename="(title) => store.renameJob(job.id, title)"
        />
        <p class="text-xs text-text-dim">{{ createdLabel }} · {{ job.model || t('aceJob.defaultModel') }}</p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <StatusBadge :status="job.status" />
        <button v-if="job.status === 'queued' || job.status === 'running'" type="button" class="text-text-dim hover:text-status-failed" :title="t('aceJob.cancel')" @click="cancel">⏹</button>
        <button v-else type="button" class="text-text-dim hover:text-status-failed" :title="t('aceJob.delete')" @click="remove">✕</button>
      </div>
    </div>

    <div v-if="job.status === 'queued' || job.status === 'running'" class="space-y-1">
      <ProgressBar :value="job.progress" />
      <p class="text-xs text-text-dim">{{ job.stage || (job.status === 'queued' ? t('aceJob.queued') : t('aceJob.generating')) }}</p>
    </div>

    <div v-else-if="job.status === 'failed'" class="rounded-lg bg-status-failed/10 p-2 text-xs text-status-failed">{{ job.error }}</div>
    <div v-else-if="job.status === 'cancelled'" class="rounded-lg bg-panel-2 p-2 text-xs text-text-dim">{{ t('aceJob.cancelled') }}</div>

    <div v-else-if="job.status === 'done'" class="space-y-2">
      <!-- If multiple variants in batch, show seamless A/B player, otherwise single WaveformPlayer -->
      <BatchABPlayer v-if="job.audioUrls.length > 1" :sources="job.audioUrls" :duration-sec="job.durationSec" />
      <WaveformPlayer v-else-if="job.audioUrls.length === 1" :src="job.audioUrls[0]" />

      <div class="flex flex-wrap items-center gap-3 text-xs text-text-dim">
        <span v-if="job.durationSec">{{ formatDuration(job.durationSec) }}</span>
        <button v-for="(url, i) in job.audioUrls" :key="'dl' + url" type="button" class="text-accent1 hover:underline" @click="download(url, i)">
          {{ t('aceJob.download') }}{{ job.audioUrls.length > 1 ? ` #${i + 1}` : '' }}
        </button>
      </div>
      <div v-for="id in job.dbIds" :key="'stems' + id" class="space-y-1.5 pt-1">
        <StemsPanel :track-id="id" :title="job.title" :lyrics="job.lyrics" model="ace_step" />
        <MidiPanel :track-id="id" />
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <button type="button" class="text-xs text-accent hover:underline" @click="copyParamsToForm">
        {{ copied ? t('aceJob.copied') : t('aceJob.copyParams') }}
      </button>
      <button v-if="job.lyrics || styleText" type="button" class="text-xs text-text-dim hover:underline" @click="showDetails = !showDetails">
        {{ showDetails ? t('aceJob.hideDetails') : t('aceJob.showDetails') }}
      </button>
    </div>
    <div v-if="showDetails" class="space-y-1 rounded-lg bg-panel-2 p-2 text-xs text-text-dim">
      <p v-if="styleText"><b>{{ t('aceJob.style') }}</b> {{ styleText }}</p>
      <p v-if="job.lyrics" class="whitespace-pre-wrap"><b>{{ t('aceJob.lyrics') }}</b> {{ job.lyrics }}</p>
    </div>
  </div>
</template>
