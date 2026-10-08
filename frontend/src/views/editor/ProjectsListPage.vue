<script setup lang="ts">
// The editor's projects. Each card lists what the project is made of, the way the mixer does: its lanes with
// their colours and how many clips each holds, and the library track it was built from. The list endpoint returns
// names and dates only; the rest comes from each project's data, fetched alongside.
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import * as projectsApi from '../../api/projects'
import type { ProjectSummary } from '../../api/projects'
import { projectDuration, type TimelineProject } from '../../audio/timelineTypes'
import PlusIcon from '../../components/shared/icons/PlusIcon.vue'
import TrashIcon from '../../components/shared/icons/TrashIcon.vue'
import TimelineIcon from '../../components/shared/icons/TimelineIcon.vue'
import { TRACK_COLORS } from '../../utils/trackColors'

const { t, tm, locale } = useI18n()

const projects = ref<ProjectSummary[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

/** What a card shows besides the name: length, tempo, the lanes, and the track the project was built from. */
interface Overview {
  duration: number
  bpm: number
  lanes: { name: string; color: string; clips: number }[]
  /** The library track most clips come from (its stems included), by name; null when none does. */
  source: string | null
}
const overviews = reactive<Record<number, Overview | 'failed'>>({})
/** Lanes listed on a card; the rest are counted. */
const SHOWN_LANES = 6

/** A library track's audio or one of its stems: /api/tracks/{id}/audio, /api/tracks/{id}/stems/{name}. */
const TRACK_URL = /^\/api\/tracks\/(\d+)\/(stems\/)?/
function toOverview(data: TimelineProject): Overview {
  const lanes = data.lanes ?? []
  // The source: the track id most clips point at; its name is a clip's label, less the " — stem" a stem adds.
  const votes = new Map<string, { n: number; label: string }>()
  for (const c of lanes.flatMap((lane) => lane.clips)) {
    const m = c.sourceUrl ? TRACK_URL.exec(c.sourceUrl) : null
    if (!m) continue
    const label = m[2] ? c.sourceLabel.replace(/\s+—\s+[^—]*$/, '') : c.sourceLabel
    const v = votes.get(m[1])
    votes.set(m[1], { n: (v?.n ?? 0) + 1, label: v?.label ?? label })
  }
  const source = [...votes.values()].sort((a, b) => b.n - a.n)[0]?.label || null
  return {
    duration: projectDuration(data),
    bpm: data.bpm,
    lanes: lanes.map((lane) => ({
      name: lane.name,
      // the editor draws a lane with no colour saved in the first one, so does the card
      color: (TRACK_COLORS.find((c) => c.id === lane.colorId) ?? TRACK_COLORS[0]).baseHex,
      clips: lane.clips.length,
    })),
    source,
  }
}

/** Fetches the projects' data a few at a time, newest first, so the cards on screen fill in first. */
async function loadOverviews(list: ProjectSummary[]): Promise<void> {
  const queue = [...list]
  const worker = async () => {
    for (let p = queue.shift(); p; p = queue.shift()) {
      try {
        overviews[p.id] = toOverview((await projectsApi.getProject(p.id)).data)
      } catch {
        overviews[p.id] = 'failed'
      }
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker))
}

async function load(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    projects.value = await projectsApi.listProjects()
    void loadOverviews(projects.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

// Deleting asks on the card itself, not in a browser dialog.
const confirmingId = ref<number | null>(null)
const deletingId = ref<number | null>(null)
async function remove(id: number): Promise<void> {
  deletingId.value = id
  try {
    await projectsApi.deleteProject(id)
    projects.value = projects.value.filter((p) => p.id !== id)
    delete overviews[id]
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    deletingId.value = null
    confirmingId.value = null
  }
}

function overviewOf(id: number): Overview | null {
  const o = overviews[id]
  return o && o !== 'failed' ? o : null
}
/** "1 клип", "3 клипа", "5 клипов": the locale's plural forms by Intl's plural category. */
function plural(n: number, key: string): string {
  const forms = tm(key) as string[]
  const index = { one: 0, few: 1, many: 2 }[new Intl.PluralRules(localeTag.value).select(n) as 'one' | 'few' | 'many'] ?? forms.length - 1
  return `${n} ${forms[Math.min(index, forms.length - 1)]}`
}
function formatDuration(sec: number): string {
  const s = Math.round(sec)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
const localeTag = computed(() => (locale.value === 'ru' ? 'ru-RU' : 'en-US'))
/** Today and yesterday by name with the time; older by the date (the year only when it is not this one). */
function formatModified(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const day = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const days = Math.round((day(now) - day(d)) / 86_400_000)
  const time = d.toLocaleTimeString(localeTag.value, { hour: '2-digit', minute: '2-digit' })
  if (days === 0) return t('projectsPage.today', { time })
  if (days === 1) return t('projectsPage.yesterday', { time })
  return d.toLocaleDateString(localeTag.value, { day: 'numeric', month: 'long', ...(d.getFullYear() !== now.getFullYear() && { year: 'numeric' }) })
}

onMounted(load)
</script>

<template>
  <div class="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div class="max-w-2xl">
        <h1 class="text-2xl font-semibold text-text">{{ t('projectsPage.title') }}</h1>
        <p class="mt-1.5 text-sm leading-relaxed text-text-dim">{{ t('projectsPage.lead') }}</p>
      </div>
      <router-link
        to="/editor/new"
        class="accent-gradient inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md shadow-accent1/20 transition-opacity hover:opacity-90"
      >
        <PlusIcon class="h-4 w-4" />
        {{ t('projectsPage.newProject') }}
      </router-link>
    </div>

    <p v-if="error" class="mb-4 rounded-lg border border-status-failed/40 bg-status-failed/10 px-3 py-2 text-sm text-status-failed">{{ error }}</p>

    <!-- loading: the cards' outlines -->
    <div v-if="loading" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
      <div v-for="i in 3" :key="i" class="h-[17rem] animate-pulse rounded-2xl border border-border bg-panel/60"></div>
    </div>

    <!-- no projects yet: what a project is, and the way to start one -->
    <div v-else-if="projects.length === 0 && !error" class="rounded-2xl border border-dashed border-border bg-panel/40 px-6 py-12 text-center">
      <svg viewBox="0 0 240 64" class="mx-auto h-16 w-60" aria-hidden="true">
        <rect v-for="(lane, i) in [[8, 70, '#a855f7'], [40, 120, '#3b82f6'], [96, 60, '#ec4899']]" :key="i" :x="lane[0]" :y="6 + i * 20" :width="lane[1]" height="12" rx="3" :fill="String(lane[2])" opacity="0.35" />
        <line x1="0" x2="240" y1="2" y2="2" stroke="currentColor" class="text-border" />
      </svg>
      <h2 class="mt-5 text-lg font-semibold text-text">{{ t('projectsPage.emptyTitle') }}</h2>
      <p class="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-text-dim">{{ t('projectsPage.emptyText') }}</p>
      <router-link to="/editor/new" class="accent-gradient mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white">
        <PlusIcon class="h-4 w-4" />
        {{ t('projectsPage.newProject') }}
      </router-link>
    </div>

    <ul v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <li v-for="p in projects" :key="p.id" class="relative flex min-w-0 flex-col rounded-2xl border border-border bg-panel p-4 transition-colors hover:border-accent1/40">
        <div class="flex items-start gap-3">
          <div class="min-w-0 flex-1">
            <router-link :to="`/editor/${p.id}`" class="block truncate text-base font-semibold text-text hover:text-accent1">{{ p.name }}</router-link>
            <p class="mt-1 flex flex-wrap gap-x-3 text-xs text-text-dim tabular-nums">
              <template v-if="overviewOf(p.id)">
                <span>{{ formatDuration(overviewOf(p.id)!.duration) }}</span>
                <span>{{ t('projectsPage.bpm', { n: Math.round(overviewOf(p.id)!.bpm) }) }}</span>
              </template>
              <time :datetime="p.updated_at" :title="t('projectsPage.modifiedTitle')">{{ formatModified(p.updated_at) }}</time>
            </p>
          </div>
          <button
            type="button"
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-dim transition-colors hover:bg-status-failed/10 hover:text-status-failed"
            :title="t('projectsPage.delete')"
            :aria-label="t('projectsPage.deleteNamed', { name: p.name })"
            @click="confirmingId = p.id"
          >
            <TrashIcon class="h-4 w-4" />
          </button>
        </div>

        <!-- what the project is made of: its lanes, as the mixer lists them -->
        <ul v-if="overviewOf(p.id)?.lanes.length" class="my-4 border-t border-border">
          <li
            v-for="(lane, i) in overviewOf(p.id)!.lanes.slice(0, SHOWN_LANES)"
            :key="i"
            class="flex items-center gap-2.5 border-b border-border/60 px-0.5 py-2 text-sm"
          >
            <span class="h-3.5 w-[3px] shrink-0 rounded-full" :style="{ background: lane.color }" aria-hidden="true"></span>
            <span class="min-w-0 flex-1 truncate text-text">{{ lane.name }}</span>
            <span class="shrink-0 text-xs text-text-dim tabular-nums">{{ plural(lane.clips, 'projectsPage.clips') }}</span>
          </li>
          <li v-if="overviewOf(p.id)!.lanes.length > SHOWN_LANES" class="px-0.5 pt-2 text-xs text-text-dim">
            {{ t('projectsPage.moreLanes', { n: overviewOf(p.id)!.lanes.length - SHOWN_LANES }) }}
          </li>
        </ul>
        <p v-else-if="overviewOf(p.id)" class="my-4 rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-text-dim">{{ t('projectsPage.noLanes') }}</p>
        <div v-else-if="overviews[p.id] !== 'failed'" class="my-4 space-y-2.5 border-t border-border pt-3" aria-hidden="true">
          <div v-for="i in 4" :key="i" class="h-4 animate-pulse rounded bg-panel-2/70"></div>
        </div>
        <div v-else class="my-4"></div>

        <div class="mt-auto flex items-center justify-between gap-3">
          <span class="min-w-0 truncate text-xs text-text-dim">
            <template v-if="overviewOf(p.id)?.source">{{ t('projectsPage.source', { name: overviewOf(p.id)!.source }) }}</template>
          </span>
          <router-link
            :to="`/editor/${p.id}`"
            class="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text transition-colors hover:border-accent1/50 hover:bg-accent1/10"
          >
            <TimelineIcon class="h-4 w-4" />
            {{ t('projectsPage.open') }}
          </router-link>
        </div>

        <!-- delete asks over the card -->
        <div
          v-if="confirmingId === p.id"
          class="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border border-status-failed/40 bg-panel/95 px-6 text-center backdrop-blur"
          role="alertdialog"
          :aria-label="t('projectsPage.confirmDelete')"
        >
          <p class="text-sm text-text">{{ t('projectsPage.confirmDelete') }}</p>
          <div class="flex gap-2">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg border border-status-failed/60 bg-status-failed/15 px-3 py-1.5 text-sm font-medium text-status-failed hover:bg-status-failed/25 disabled:opacity-50"
              :disabled="deletingId === p.id"
              @click="remove(p.id)"
            >
              <TrashIcon class="h-3.5 w-3.5" />
              {{ t('projectsPage.delete') }}
            </button>
            <button type="button" class="rounded-lg px-3 py-1.5 text-sm text-text-dim hover:text-text" @click="confirmingId = null">
              {{ t('common.cancel') }}
            </button>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
