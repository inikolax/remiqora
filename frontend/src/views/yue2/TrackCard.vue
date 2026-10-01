<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useYue2Store } from '../../stores/yue2'
import type { Yue2Job } from '../../stores/yue2'
import * as tracksApi from '../../api/tracks'
import { formatClock, formatCreated } from '../../composables/formatCreated'
import StatusBadge from '../../components/shared/StatusBadge.vue'
import WaveformPlayer from '../../components/shared/WaveformPlayer.vue'
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

const props = defineProps<{ job: Yue2Job }>()
const store = useYue2Store()
const { t } = useI18n()
const expanded = ref(false)
const showAbc = ref(false)
const abcText = ref<string | null>(null)
const loadingAbc = ref(false)

const shortTitle = computed(() => friendlyTitle(props.job.title))
const engineLabel = 'YuE2'
const created = computed(() => formatCreated(props.job.createdAt))
const menuItems = computed<MenuItem[]>(() => {
  const items: MenuItem[] = []
  if (props.job.status === 'done') items.push({ key: 'reuse', label: t('trackCard.reuse') })
  items.push({ key: 'delete', label: t('trackCard.deleteTrack'), danger: true, confirmLabel: t('trackCard.confirmDelete') })
  return items
})
const inProgress = computed(() => props.job.status === 'queued' || props.job.status === 'running')

function cancel() {
  store.cancel(props.job.id)
}
async function remove() {
  await store.deleteJob(props.job)
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
    void remove()
    return
  }
  deleteArmed.value = true
  disarmTimer = setTimeout(disarmDelete, 4000)
}
onBeforeUnmount(disarmDelete)
function onMenu(key: string) {
  if (key === 'reuse') copyParamsToForm()
  else if (key === 'delete') void remove()
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
            :placeholder="t('yueTrack.noStyle')"
            :editable="job.dbId != null"
            @rename="(title) => store.renameJob(job, title)"
          />
          <div class="ml-auto flex shrink-0 items-center gap-1">
            <div v-if="job.status === 'done' && job.durationSec" class="mr-1 hidden border-r border-border/60 pr-3 text-right @min-[640px]:block">
              <p class="text-sm font-semibold tabular-nums text-text" :title="`${Math.round(job.durationSec)} ${t('common.secondsUnit')}`">{{ formatClock(job.durationSec) }}</p>
            </div>
            <StatusBadge v-if="job.status !== 'done'" :status="job.status" class="mr-1" />
            <button
              v-if="job.status === 'done' && job.audioUrl"
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-lg text-text-dim hover:bg-panel-2 hover:text-text"
              :aria-label="t('trackCard.downloadTagged')"
              :title="t('trackCard.downloadTagged')"
              @click="download"
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
          <span v-if="job.style" class="h-3.5 w-px bg-border" aria-hidden="true"></span>
          <StyleChips class="min-w-0" :max="4" :text="job.style" @more="expanded = true" />
        </div>

        <div v-if="inProgress" class="mt-2 space-y-1">
          <div class="h-2 w-full overflow-hidden rounded-full bg-panel-2">
            <div class="h-full w-3/5 accent-gradient animate-pulse"></div>
          </div>
          <p class="text-xs text-text-dim">seed: {{ job.seed }}</p>
        </div>
        <div v-else-if="job.status === 'failed'" class="mt-2 rounded-lg bg-status-failed/10 p-2 text-xs text-status-failed">{{ job.error }}</div>
        <div v-else-if="job.status === 'cancelled'" class="mt-2 rounded-lg bg-panel-2 p-2 text-xs text-text-dim">{{ t('aceJob.cancelled') }}</div>
        <template v-else-if="job.status === 'done' && job.audioUrl">
          <WaveformPlayer class="mt-2" :src="job.audioUrl" :duration-hint="job.durationSec" total-class="@min-[640px]:hidden" />
          <p v-if="job.saveError && job.dbId == null" class="mt-1.5 text-xs text-status-failed" :title="job.saveError">{{ t('yueTrack.notSaved') }}</p>
        </template>
      </div>
    </header>

    <div v-if="expanded && job.status === 'done' && job.audioUrl" class="mt-3 space-y-3 border-t border-border/60 pt-3">
      <TrackDetails v-if="job.style || job.lyrics" :style-text="job.style" :lyrics="job.lyrics" />

      <div v-if="job.dbId != null" class="space-y-1.5">
        <StemsPanel :track-id="job.dbId" :title="job.title" :lyrics="job.lyrics" model="yue2" />
        <MidiPanel :track-id="job.dbId" />
      </div>

      <div>
        <button type="button" class="text-xs text-text-dim hover:underline" @click="toggleAbc">
          {{ showAbc ? t('yueTrack.hideAbc') : t('yueTrack.showAbc') }}
        </button>
        <div v-if="showAbc" class="mt-1.5">
          <p v-if="loadingAbc" class="text-xs text-text-dim">{{ t('yueTrack.loading') }}</p>
          <template v-else>
            <pre class="whitespace-pre-wrap rounded-lg bg-panel-2 p-2 text-xs text-text-dim">{{ abcText || t('yueTrack.noScore') }}</pre>
            <button v-if="abcText" type="button" class="mt-1 text-xs text-accent1 hover:underline" @click="insertIntoForm">{{ t('yueTrack.insertIntoForm') }}</button>
          </template>
        </div>
      </div>

      <p class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-dim">
        <span>{{ t('trackCard.seed') }} <span class="tabular-nums text-text">{{ job.seed }}</span></span>
        <span v-if="job.wallSec">{{ t('trackCard.generation') }} <span class="tabular-nums text-text">{{ job.wallSec.toFixed(1) }} {{ t('trackCard.secondsShort') }}</span></span>
        <span v-if="job.savedFilename" class="break-all">{{ t('trackCard.file') }} <span class="text-text">{{ job.savedFilename }}</span></span>
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
