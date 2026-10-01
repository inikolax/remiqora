<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useOrchestratorStore } from '../stores/orchestrator'
import { MODEL_LABELS, MODEL_ROUTES, useModelSwitch } from '../composables/useModelSwitch'
import { formatCreated } from '../composables/formatCreated'
import { friendlyTitle } from '../utils/trackTitle'
import * as projectsApi from '../api/projects'
import * as tracksApi from '../api/tracks'
import type { ProjectSummary } from '../api/projects'
import type { SavedTrack } from '../api/tracks'
import type { ModelId, ModelRuntimeStatus } from '../types'
import WaveformPlayer from '../components/shared/WaveformPlayer.vue'

const orchestrator = useOrchestratorStore()
const { selectModel } = useModelSwitch()
const { t } = useI18n()

const MODEL_IDS: ModelId[] = ['ace_step', 'yue2']
const DESCRIPTION_KEYS: Record<ModelId, string> = {
  ace_step: 'home.descAceStep',
  yue2: 'home.descYue2',
}
const LED: Record<ModelRuntimeStatus, string> = {
  stopped: 'bg-gray-500',
  starting: 'bg-status-queued animate-pulse',
  running: 'bg-status-done',
  stopping: 'bg-status-queued animate-pulse',
  error: 'bg-status-failed',
}

function statusOf(id: ModelId): ModelRuntimeStatus {
  return orchestrator.statuses[id]?.status ?? 'stopped'
}

// The last few tracks of both models: the page people land on should show what they made, not only
// what they can start.
const recentTracks = ref<SavedTrack[]>([])
const tracksLoaded = ref(false)
const recentProjects = ref<ProjectSummary[]>([])

function originLabel(track: SavedTrack): string {
  return track.model in MODEL_LABELS ? MODEL_LABELS[track.model as ModelId] : track.model
}
function routeOf(track: SavedTrack): string | null {
  return track.model in MODEL_ROUTES ? `/${MODEL_ROUTES[track.model as ModelId]}` : null
}

onMounted(async () => {
  try {
    const list = await tracksApi.listTracks()
    recentTracks.value = list.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 5)
  } catch {
    // The backend is not up yet: the list stays empty.
  } finally {
    tracksLoaded.value = true
  }
  try {
    const list = await projectsApi.listProjects()
    recentProjects.value = list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 3)
  } catch {
    // Same: nothing to show.
  }
})

async function onPick(id: ModelId) {
  try {
    await selectModel(id)
  } catch {
    // handled via orchestrator.switchError, shown in the header.
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl py-8">
    <h1 class="text-center text-2xl font-semibold text-text">{{ t('home.title') }}</h1>
    <p class="mt-2 text-center text-sm text-text-dim">{{ t('home.subtitle') }}</p>

    <div class="mt-6 grid gap-4 sm:grid-cols-2">
      <button
        v-for="id in MODEL_IDS"
        :key="id"
        type="button"
        class="rounded-xl border border-border bg-panel p-5 text-left transition-colors hover:border-accent1/60"
        @click="onPick(id)"
      >
        <div class="flex items-center gap-2">
          <span class="h-2 w-2 shrink-0 rounded-full" :class="LED[statusOf(id)]" aria-hidden="true"></span>
          <span class="text-lg font-semibold text-text">{{ MODEL_LABELS[id] }}</span>
        </div>
        <p class="mt-2 text-sm text-text-dim">{{ t(DESCRIPTION_KEYS[id]) }}</p>
        <span class="mt-4 inline-block rounded-lg border border-accent1/40 px-3 py-1.5 text-xs font-medium text-accent1">
          {{ statusOf(id) === 'running' ? t('home.open') : t('home.start') }}
        </span>
      </button>
    </div>

    <section class="mt-10">
      <h2 class="text-lg font-semibold text-text">{{ t('home.recentTracks') }}</h2>
      <p v-if="tracksLoaded && recentTracks.length === 0" class="mt-3 rounded-xl border border-dashed border-border p-6 text-center text-sm text-text-dim">
        {{ t('home.noTracks') }}
      </p>
      <ul v-else-if="recentTracks.length" class="mt-3 divide-y divide-border/60 rounded-xl border border-border bg-panel">
        <li v-for="track in recentTracks" :key="track.id" class="space-y-2 p-3">
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
            <component
              :is="routeOf(track) ? 'router-link' : 'span'"
              :to="routeOf(track) || undefined"
              class="min-w-0 flex-1 basis-48 truncate text-sm font-semibold text-text"
              :class="routeOf(track) ? 'hover:text-accent1' : ''"
              :title="track.title"
            >
              {{ friendlyTitle(track.title) }}
            </component>
            <span class="rounded-md border border-border px-1.5 py-px text-xs font-medium leading-4 text-text-dim">{{ originLabel(track) }}</span>
            <span class="text-xs text-text-dim" :title="formatCreated(Date.parse(track.created_at)).full">{{ formatCreated(Date.parse(track.created_at)).label }}</span>
          </div>
          <WaveformPlayer compact :src="track.audio_url" :duration-hint="track.duration_ms ? track.duration_ms / 1000 : null" />
        </li>
      </ul>
    </section>

    <section v-if="recentProjects.length > 0" class="mt-10">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-text">{{ t('home.recentProjects') }}</h2>
        <RouterLink to="/editor" class="py-1 text-sm text-accent1 hover:underline">{{ t('home.allProjects') }}</RouterLink>
      </div>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <RouterLink
          v-for="proj in recentProjects"
          :key="proj.id"
          :to="`/editor/${proj.id}`"
          class="flex flex-col justify-between rounded-xl border border-border bg-panel-2 p-4 transition-colors hover:border-accent1/60"
        >
          <div class="truncate text-sm font-medium text-text">{{ proj.name }}</div>
          <div class="mt-2 text-xs text-text-dim">{{ formatCreated(new Date(proj.updated_at).getTime()).label }}</div>
        </RouterLink>
      </div>
    </section>
  </div>
</template>
