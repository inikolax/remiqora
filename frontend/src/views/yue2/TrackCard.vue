<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useYue2Store } from '../../stores/yue2'
import type { Yue2Job } from '../../stores/yue2'
import * as tracksApi from '../../api/tracks'
import { formatDuration } from '../../composables/formatDuration'
import StatusBadge from '../../components/shared/StatusBadge.vue'
import WaveformPlayer from '../../components/shared/WaveformPlayer.vue'
import StemsPanel from '../../components/shared/StemsPanel.vue'
import MidiPanel from '../../components/shared/MidiPanel.vue'
import EditableTitle from '../../components/shared/EditableTitle.vue'
import { downloadSavedTrack } from '../../composables/useTrackDownload'
import TrackDetails from '../../components/shared/TrackDetails.vue'

const props = defineProps<{ job: Yue2Job }>()
const store = useYue2Store()
const { t, locale } = useI18n()
const showDetails = ref(false)
const showAbc = ref(false)
const abcText = ref<string | null>(null)
const loadingAbc = ref(false)
const copied = ref(false)

const createdLabel = computed(() => new Date(props.job.createdAt).toLocaleString(locale.value === 'ru' ? 'ru-RU' : 'en-US'))

function cancel() {
  store.cancel(props.job.id)
}
async function remove() {
  await store.deleteJob(props.job)
}
async function toggleAbc() {
  showAbc.value = !showAbc.value
  if (showAbc.value && abcText.value == null) {
    if (props.job.abcPlan) {
      abcText.value = props.job.abcPlan
    } else if (props.job.dbId != null) {
      loadingAbc.value = true
      try {
        abcText.value = await tracksApi.trackAbc(props.job.dbId)
      } catch {
        abcText.value = ''
      } finally {
        loadingAbc.value = false
      }
    } else {
      abcText.value = ''
    }
  }
}
function insertIntoForm() {
  if (abcText.value) store.requestInsertAbc(abcText.value)
}
function download() {
  if (!props.job.audioUrl) return
  if (props.job.dbId != null) {
    void downloadSavedTrack(props.job.dbId, props.job.savedFilename || `yue2_${props.job.seed}.wav`)
    return
  }
  const a = document.createElement('a')
  a.href = props.job.audioUrl
  a.download = props.job.savedFilename || `yue2_${props.job.seed}.wav`
  a.click()
}
function copyParamsToForm() {
  const p = props.job.params || {}
  store.requestInsertParams({
    ...p,
    lyrics: props.job.lyrics || p.lyrics || '',
    style: props.job.style || p.style || '',
    cot: props.job.cot || p.cot || 'off',
    precision: props.job.precision || p.precision || 'q8_0',
    seed: props.job.seed ?? p.seed,
    abc: props.job.abcPlan || p.abc || '',
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
          :placeholder="t('yueTrack.noStyle')"
          :editable="job.dbId != null"
          @rename="(title) => store.renameJob(job, title)"
        />
        <p class="text-xs text-text-dim">{{ createdLabel }} · cot: {{ job.cot }} · {{ job.precision }}</p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <StatusBadge :status="job.status" />
        <button v-if="job.status === 'queued' || job.status === 'running'" type="button" class="text-text-dim hover:text-status-failed" :title="t('aceJob.cancel')" @click="cancel">⏹</button>
        <button v-else type="button" class="text-text-dim hover:text-status-failed" :title="t('aceJob.delete')" @click="remove">✕</button>
      </div>
    </div>

    <div v-if="job.status === 'queued' || job.status === 'running'" class="space-y-1">
      <div class="h-2 w-full overflow-hidden rounded-full bg-panel-2">
        <div class="h-full w-3/5 accent-gradient animate-pulse"></div>
      </div>
      <p class="text-xs text-text-dim">seed: {{ job.seed }}</p>
    </div>

    <div v-else-if="job.status === 'failed'" class="rounded-lg bg-status-failed/10 p-2 text-xs text-status-failed">{{ job.error }}</div>
    <div v-else-if="job.status === 'cancelled'" class="rounded-lg bg-panel-2 p-2 text-xs text-text-dim">{{ t('aceJob.cancelled') }}</div>

    <div v-else-if="job.status === 'done' && job.audioUrl" class="space-y-2">
      <WaveformPlayer :src="job.audioUrl" />
      <div class="flex flex-wrap items-center gap-3 text-xs text-text-dim">
        <span v-if="job.durationSec">{{ formatDuration(job.durationSec) }}</span>
        <span v-if="job.wallSec">{{ t('yueTrack.generationTime', { value: job.wallSec.toFixed(1) }) }}</span>
        <span>seed: {{ job.seed }}</span>
        <button type="button" class="text-accent1 hover:underline" @click="download">{{ t('aceJob.download') }}</button>
        <span v-if="job.savedFilename" class="break-all">💾 {{ job.savedFilename }}</span>
        <span v-else-if="job.saveError" class="text-status-failed" :title="job.saveError">{{ t('yueTrack.notSaved') }}</span>
      </div>
      <div v-if="job.dbId != null" class="space-y-1.5 pt-1">
        <StemsPanel :track-id="job.dbId" :title="job.title" :lyrics="job.lyrics" model="yue2" />
        <MidiPanel :track-id="job.dbId" />
      </div>
      <button type="button" class="text-xs text-text-dim hover:underline" @click="toggleAbc">
        {{ showAbc ? t('yueTrack.hideAbc') : t('yueTrack.showAbc') }}
      </button>
      <div v-if="showAbc">
        <p v-if="loadingAbc" class="text-xs text-text-dim">{{ t('yueTrack.loading') }}</p>
        <template v-else>
          <pre class="whitespace-pre-wrap rounded-lg bg-panel-2 p-2 text-xs text-text-dim">{{ abcText || t('yueTrack.noScore') }}</pre>
          <button v-if="abcText" type="button" class="mt-1 text-xs text-accent1 hover:underline" @click="insertIntoForm">{{ t('yueTrack.insertIntoForm') }}</button>
        </template>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <button type="button" class="text-xs text-accent hover:underline" @click="copyParamsToForm">
        {{ copied ? t('aceJob.copied') : t('aceJob.copyParams') }}
      </button>
      <button v-if="job.lyrics" type="button" class="text-xs text-text-dim hover:underline" @click="showDetails = !showDetails">
        {{ showDetails ? t('aceJob.hideDetails') : t('aceJob.showDetails') }}
      </button>
    </div>
    <TrackDetails v-if="showDetails" :style-text="job.style" :lyrics="job.lyrics" />
  </div>
</template>
