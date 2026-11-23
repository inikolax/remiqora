<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { useOrchestratorStore } from '../stores/orchestrator'
import { useFeaturesStore } from '../stores/features'
import { usePlayerStore } from '../stores/player'
import { useMarksStore } from '../stores/marks'
import type { PlayerTrack } from '../stores/player'
import { MODEL_FEATURE } from '../composables/useModelSwitch'
import { ENGINE_SHORT } from '../composables/useTakes'
import { formatClock, formatCreated } from '../composables/formatCreated'
import { groupSongs, playerKey, toLibTrack } from './library/libraryTracks'
import * as projectsApi from '../api/projects'
import * as tracksApi from '../api/tracks'
import type { ProjectSummary } from '../api/projects'
import type { SavedTrack } from '../api/tracks'
import type { ModelId, ModelRuntimeStatus, TrackOrigin } from '../types'
import MiniWave from '../components/shared/MiniWave.vue'
import CoverThumb from '../components/shared/CoverThumb.vue'
import { useCoversStore } from '../stores/covers'
import MicIcon from '../components/shared/icons/MicIcon.vue'
import WaveIcon from '../components/shared/icons/WaveIcon.vue'
import PulseIcon from '../components/shared/icons/PulseIcon.vue'
import PlayIcon from '../components/shared/icons/PlayIcon.vue'
import PauseIcon from '../components/shared/icons/PauseIcon.vue'
import IdeaComposer from './home/IdeaComposer.vue'
import StatusLed from './home/StatusLed'
import type { HomeKind } from './home/useIdeaComposer'

/**
 * Home: where to start on the left (one phrase, written into a prompt right here, or an engine), what is already
 * made on the right. The phrase is "From an idea": the assistant writes the prompt in place, it is edited here and
 * sent to the engine's queue, or opened in the engine's form on Create. An engine tile only opens Create.
 */
const { t } = useI18n()
const orchestrator = useOrchestratorStore()
const features = useFeaturesStore()
const player = usePlayerStore()
const covers = useCoversStore()
const composer = ref<InstanceType<typeof IdeaComposer> | null>(null)

// ---- the engines: links to Create, never a start ----
const ENGINES: { id: ModelId; icon: Component }[] = [
  { id: 'yue2', icon: MicIcon },
  { id: 'ace_step', icon: WaveIcon },
  { id: 'stable_audio', icon: PulseIcon },
]
const statusOf = (id: ModelId): ModelRuntimeStatus => orchestrator.statuses[id]?.status ?? 'stopped'
const installed = (id: ModelId): boolean => { const f = MODEL_FEATURE[id]; return !f || features.has(f) }

// ---- what is already made ----
const recentTracks = ref<SavedTrack[]>([])
const tracksLoaded = ref(false)
/** The backend did not answer: no "first run" panel for someone who has tracks. */
const tracksFailed = ref(false)
const recentProjects = ref<ProjectSummary[]>([])

const isEngine = (o: TrackOrigin): o is ModelId => o in ENGINE_SHORT
const originLabel = (o: TrackOrigin): string => (isEngine(o) ? ENGINE_SHORT[o] : t(`libraryPage.origins.${o}`))
/** The track's number among the takes of its song (over the whole library, as the library numbers them), when
 *  the song has several: rows of one name are told apart by it. */
const takeNo = ref(new Map<number, number>())
const nameOf = (track: SavedTrack): string => toLibTrack(track).shortTitle || t('create.untitled')
const titleOf = (track: SavedTrack): string => {
  const n = takeNo.value.get(track.id)
  return n != null ? t('create.takeTitle', { title: nameOf(track), n }) : nameOf(track)
}
const secondsOf = (track: SavedTrack): number | null => (track.duration_ms ? track.duration_ms / 1000 : null)

// the same keys as the library and the session, so the player bar and their buttons agree on what plays
const toPlayer = (track: SavedTrack): PlayerTrack => ({
  key: playerKey(track.id), title: titleOf(track),
  sub: `${originLabel(track.model)}, ${formatCreated(Date.parse(track.created_at)).label}`,
  src: track.audio_url, durationSec: secondsOf(track), dbId: track.id, filename: track.filename,
})
const queue = computed(() => recentTracks.value.map(toPlayer))
const isPlaying = (track: SavedTrack): boolean => player.playing && player.isCurrent(playerKey(track.id))
function play(track: SavedTrack): void {
  player.toggle(toPlayer(track), queue.value)
}

/** First run: an example goes into the phrase, with its kind, and the field takes the focus. */
const EXAMPLES: { kind: HomeKind; key: string }[] = [
  { kind: 'song', key: 'idea.placeholderSong' },
  { kind: 'instrumental', key: 'idea.placeholderInstrumental' },
]
function useExample(ex: { kind: HomeKind; key: string }): void {
  composer.value?.fill(ex.kind, t(ex.key))
}

onMounted(async () => {
  try {
    const list = await tracksApi.listTracks()
    // the player shows a playing track's cover from the marks
    useMarksStore().noteCovers(list)
    const numbers = new Map<number, number>()
    for (const song of groupSongs(list.map(toLibTrack))) if (song.takes.length > 1) song.takes.forEach((x, i) => numbers.set(x.id, i + 1))
    takeNo.value = numbers
    recentTracks.value = list.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 5)
  } catch {
    tracksFailed.value = true
  } finally {
    tracksLoaded.value = true
  }
  try {
    const list = await projectsApi.listProjects()
    recentProjects.value = list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 3)
  } catch {
    // nothing to show
  }
})

const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1'
</script>

<template>
  <!-- Two columns from lg (where to start, what is made), one below it in reading order. The page uses the width
       App gives a wide page, so its edges line up with the header's. -->
  <div class="grid grid-cols-1 items-start gap-6 py-2 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-10 lg:py-6">
    <section class="min-w-0" aria-labelledby="home-title">
      <h1 id="home-title" class="text-2xl font-semibold tracking-tight text-text sm:text-3xl">{{ t('home.title') }}</h1>
      <p class="mt-1 text-sm text-text-dim">{{ t('home.lead') }}</p>

      <IdeaComposer ref="composer" class="mt-5" />

      <!-- quieter: the engines, each a link to its form in Create -->
      <h2 class="mt-8 text-sm text-text-dim">{{ t('home.engines') }}</h2>
      <ul class="mt-2 grid grid-cols-3 gap-2 sm:gap-3">
        <li v-for="e in ENGINES" :key="e.id" class="min-w-0">
          <router-link
            :to="{ name: 'create', query: { engine: e.id } }"
            class="flex h-full min-h-11 min-w-0 flex-col justify-center gap-1 rounded-xl border border-border bg-panel px-2.5 py-2 transition-colors hover:border-text-dim/60 sm:px-3 lg:py-2.5"
            :class="FOCUS"
          >
            <span class="flex min-w-0 items-center gap-2">
              <component :is="e.icon" class="hidden h-4 w-4 shrink-0 text-accent1 sm:block" />
              <span class="min-w-0 truncate text-sm font-semibold text-text">{{ ENGINE_SHORT[e.id] }}</span>
              <span v-if="installed(e.id)" class="sr-only">, {{ t(`modelStatus.${statusOf(e.id)}`) }}</span>
              <StatusLed v-if="installed(e.id)" :status="statusOf(e.id)" class="ms-auto" />
            </span>
            <span class="hidden truncate text-xs text-text-dim lg:block" :title="t(`create.engines.${e.id}`)">{{ t(`create.engines.${e.id}`) }}</span>
          </router-link>
        </li>
      </ul>
    </section>

    <div class="min-w-0 space-y-4">
      <section v-if="!tracksFailed" class="rounded-xl border border-border bg-panel" aria-labelledby="home-recent">
        <div class="flex min-h-12 items-center justify-between gap-3 px-4 pt-2">
          <h2 id="home-recent" class="text-base font-semibold text-text">
            {{ tracksLoaded && !recentTracks.length ? t('home.firstTitle') : t('home.recentTracks') }}
          </h2>
          <router-link
            v-if="recentTracks.length" to="/library"
            class="inline-flex min-h-6 items-center rounded text-sm text-accent1-text underline-offset-2 hover:underline" :class="FOCUS"
          >{{ t('home.allTracks') }}</router-link>
        </div>

        <!-- loading: three still rows, no animation -->
        <template v-if="!tracksLoaded">
          <p class="sr-only" role="status">{{ t('home.loading') }}</p>
          <ul class="px-2 pb-2" aria-hidden="true">
            <li v-for="n in 3" :key="n" class="flex h-11 items-center gap-3 px-2">
              <span class="h-8 w-8 shrink-0 rounded-full bg-panel-2"></span>
              <span class="h-3 w-1/3 rounded bg-panel-2"></span>
              <span class="h-3 flex-1 rounded bg-panel-2"></span>
            </li>
          </ul>
        </template>

        <ul v-else-if="recentTracks.length" class="px-2 pb-2">
          <li v-for="track in recentTracks" :key="track.id" class="flex min-w-0 items-center gap-3 rounded-lg px-2 hover:bg-panel-2/60" :class="covers.enabled ? 'h-12' : 'h-11'">
            <!-- covers on: the track's cover is the play button, the icon over it on hover (as in the library) -->
            <button
              v-if="covers.enabled" type="button" class="group/play relative h-10 w-10 shrink-0 overflow-hidden rounded-md" :class="FOCUS"
              :aria-label="`${isPlaying(track) ? t('create.pause') : t('create.play')}: ${titleOf(track)}`"
              :title="isPlaying(track) ? t('create.pause') : t('create.play')"
              @click="play(track)"
            >
              <CoverThumb :track-id="track.id" :title="titleOf(track)" placeholder class="h-full w-full" />
              <span
                class="absolute inset-0 flex items-center justify-center bg-black/40 text-white transition-opacity motion-reduce:transition-none"
                :class="isPlaying(track) ? 'opacity-100' : 'opacity-0 group-hover/play:opacity-100 group-focus-visible/play:opacity-100 pointer-coarse:opacity-100 pointer-coarse:bg-black/25'" aria-hidden="true"
              >
                <PauseIcon v-if="isPlaying(track)" class="h-4 w-4" />
                <PlayIcon v-else class="h-4 w-4" />
              </span>
            </button>
            <button
              v-else type="button" class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors"
              :class="[FOCUS, isPlaying(track) ? 'accent-gradient text-white' : 'border border-border text-text hover:border-accent1/60']"
              :aria-label="`${isPlaying(track) ? t('create.pause') : t('create.play')}: ${titleOf(track)}`"
              :title="isPlaying(track) ? t('create.pause') : t('create.play')"
              @click="play(track)"
            >
              <PauseIcon v-if="isPlaying(track)" class="h-3.5 w-3.5" />
              <PlayIcon v-else class="h-3.5 w-3.5" />
            </button>
            <span class="min-w-0 flex-1 truncate text-sm font-medium text-text sm:max-w-[14rem] sm:flex-[0_1_14rem]" :title="titleOf(track)">
              <bdi>{{ nameOf(track) }}</bdi><span v-if="takeNo.get(track.id) != null" class="font-normal text-text-dim"> · {{ t('create.takeN', { n: takeNo.get(track.id) }).toLocaleLowerCase() }}</span>
            </span>
            <!-- a picture of the track; seeking stays with the player bar -->
            <div class="hidden min-w-[3rem] flex-1 sm:block" aria-hidden="true">
              <MiniWave :src="track.audio_url" :progress="player.isCurrent(playerKey(track.id)) ? player.progress : null" />
            </div>
            <span v-if="secondsOf(track)" class="shrink-0 text-xs tabular-nums text-text-dim">{{ formatClock(secondsOf(track)) }}</span>
            <span class="w-[5.5rem] shrink-0 truncate text-end text-xs text-text-dim" :title="formatCreated(Date.parse(track.created_at)).full">{{ originLabel(track.model) }}</span>
          </li>
        </ul>

        <!-- first run -->
        <div v-else class="px-4 pb-4">
          <p class="text-sm text-text-dim">{{ t('home.firstText') }}</p>
          <div class="mt-3 flex flex-col gap-2">
            <button
              v-for="ex in EXAMPLES" :key="ex.key" type="button"
              class="min-h-10 rounded-lg border border-border px-3 py-2 text-start text-sm text-text transition-colors hover:border-accent1/60"
              :class="FOCUS" @click="useExample(ex)"
            >
              {{ t(ex.key) }}
            </button>
          </div>
        </div>
      </section>

      <section v-if="recentProjects.length" class="rounded-xl border border-border bg-panel" aria-labelledby="home-projects">
        <div class="flex min-h-12 items-center justify-between gap-3 px-4 pt-2">
          <h2 id="home-projects" class="text-base font-semibold text-text">{{ t('home.recentProjects') }}</h2>
          <router-link to="/editor" class="inline-flex min-h-6 items-center rounded text-sm text-accent1-text underline-offset-2 hover:underline" :class="FOCUS">{{ t('home.allProjects') }}</router-link>
        </div>
        <ul class="px-2 pb-2">
          <li v-for="proj in recentProjects" :key="proj.id">
            <router-link
              :to="`/editor/${proj.id}`"
              class="flex h-11 min-w-0 items-center justify-between gap-3 rounded-lg px-2 transition-colors hover:bg-panel-2/60" :class="FOCUS"
            >
              <span class="min-w-0 truncate text-sm font-medium text-text" dir="auto" :title="proj.name">{{ proj.name }}</span>
              <span class="shrink-0 text-xs text-text-dim" :title="formatCreated(new Date(proj.updated_at).getTime()).full">{{ formatCreated(new Date(proj.updated_at).getTime()).label }}</span>
            </router-link>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
