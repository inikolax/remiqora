<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ENGINE_SHORT, useTakes } from '../../composables/useTakes'
import type { Take } from '../../composables/useTakes'
import type { PlayerTrack } from '../../stores/player'
import { formatDayTime } from '../../composables/formatCreated'
import { songName } from '../../utils/trackTitle'
import LibraryIcon from '../../components/shared/icons/LibraryIcon.vue'
import TakeRow from './TakeRow.vue'
import TakeCompare from '../../components/shared/TakeCompare.vue'
import type { CompareTake } from '../../composables/useTakeCompare'

/**
 * The session as a track list: a take a row (TakeRow); the takes of one song stay together (newest first), the songs
 * by their newest take, as the library groups them. Takes of the same prompt carry their number so rows of one
 * name are told apart. Today by default; the period widens it to the week or to everything, and then the songs fall
 * under the day of their newest take (an older take of one says its own day on its row).
 */
const props = defineProps<{ loaded: boolean }>()
const emit = defineEmits<{ reuse: [take: Take]; count: [n: number] }>()
const { t } = useI18n()
const { songs, loadAll } = useTakes()

type Period = 'today' | 'week' | 'all'
const PERIODS: Period[] = ['today', 'week', 'all']
const PERIOD_KEY = 'remiqora_session_period'
const readPeriod = (): Period => { try { const v = localStorage.getItem(PERIOD_KEY) as Period; return PERIODS.includes(v) ? v : 'today' } catch { return 'today' } }
const period = ref<Period>(readPeriod())
watch(period, (p) => { try { localStorage.setItem(PERIOD_KEY, p) } catch { /* private window */ } })

function since(p: Period): number {
  if (p === 'all') return 0
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  return p === 'today' ? start.getTime() : start.getTime() - 6 * 86400000
}
/** A take a row; `n` is its number among the takes of the same prompt, when there are several; `song` the song's
 *  key; `day` the day heading it falls under (its song's newest take's). */
interface Row { take: Take; n: number | null; song: string; day: string }
const isActive = (x: Take): boolean => x.status === 'queued' || x.status === 'running'
const rows = computed<Row[]>(() => songs.value
  .flatMap((s) => s.takes.map((take, i) => ({ take, n: s.takes.length > 1 ? i + 1 : null, song: s.key, day: '' }))))
const byNewest = (a: Row, b: Row): number => Number(isActive(b.take)) - Number(isActive(a.take)) || b.take.createdAt - a.take.createdAt || b.take.key.localeCompare(a.take.key)
/** The takes in the period, a song's together: what is being made now first, then by the song's newest take. */
const inPeriod = computed<Row[]>(() => {
  const from = since(period.value)
  const bySong = new Map<string, Row[]>()
  for (const r of rows.value) {
    if (!isActive(r.take) && r.take.createdAt < from) continue
    const list = bySong.get(r.song)
    if (list) list.push(r)
    else bySong.set(r.song, [r])
  }
  const lists = [...bySong.values()].map((list) => list.sort(byNewest))
  lists.sort((a, b) => byNewest(a[0], b[0]))
  return lists.flatMap((list) => {
    const day = formatDayTime(list[0].take.createdAt).day
    return list.map((r) => ({ ...r, day }))
  })
})
// Create's "Session N" button on a phone, where the list sits below the form
watch(() => inPeriod.value.length, (n) => emit('count', n), { immediate: true })
const counts = computed(() => Object.fromEntries(PERIODS.map((p) => [p, rows.value.filter((r) => r.take.createdAt >= since(p)).length])) as Record<Period, number>)

// A long list comes a page at a time.
const PAGE = 12
const shown = ref(PAGE)
watch(period, () => { shown.value = PAGE })
const visible = computed(() => inPeriod.value.slice(0, shown.value))

/** The takes on show under their day; "Today" alone needs no heading, the period already says it. */
const groups = computed(() => {
  const out: { day: string; rows: Row[] }[] = []
  for (const row of visible.value) {
    const last = out[out.length - 1]
    if (last && last.day === row.day) last.rows.push(row)
    else out.push({ day: row.day, rows: [row] })
  }
  return out
})
/** Over a week or everything the takes fall under day headings, "Today" included, so the first page says which day it is. */
const showDays = computed(() => period.value !== 'today')

const keyOf = (take: Take): string => (take.dbId != null ? `track:${take.dbId}` : take.key)

/** What the player gets for a take, and the queue: the takes on show, in the list's order. */
const playerTracks = computed(() => {
  const map = new Map<string, PlayerTrack>()
  for (const { take, n } of visible.value) {
    if (!take.audioUrl) continue
    const name = songName(take.title, take.style, take.lyrics).name || t('create.untitled')
    map.set(take.key, {
      key: keyOf(take), title: n != null ? t('create.takeTitle', { title: name, n }) : name,
      sub: `${ENGINE_SHORT[take.engine]} · ${formatDayTime(take.createdAt).day}, ${formatDayTime(take.createdAt).time}`,
      src: take.audioUrl, durationSec: take.durationSec, dbId: take.dbId, filename: take.filename,
    })
  }
  return map
})
const queue = computed(() => [...playerTracks.value.values()])

// ---- compare takes: a song's saved takes on an A/B switch, the 4 newest ----
const comparable = (x: Take): boolean => x.status === 'done' && x.audioUrl != null && x.dbId != null
/** take key -> its song's saved takes (oldest first, numbered as the rows), for songs with two and more. */
const compareSets = computed(() => {
  const map = new Map<string, { takes: CompareTake[]; name: string; leadKey: string }>()
  for (const song of songs.value) {
    const saved = song.takes.map((x, i) => ({ x, n: i + 1 })).filter(({ x }) => comparable(x))
    if (saved.length < 2) continue
    const set = {
      takes: saved.map(({ x, n }): CompareTake => ({ id: x.dbId!, src: x.audioUrl!, n, seed: x.seed, durationSec: x.durationSec, createdAt: x.createdAt })),
      name: song.name || t('create.untitled'), leadKey: saved[saved.length - 1].x.key,
    }
    for (const { x } of saved) map.set(x.key, set)
  }
  return map
})
const comparing = ref<{ title: string; takes: CompareTake[]; total: number } | null>(null)
function openCompare(take: Take): void {
  const set = compareSets.value.get(take.key)
  if (set) comparing.value = { title: set.name, takes: set.takes.slice(-4), total: set.takes.length }
}
</script>

<template>
  <section class="@container min-w-0 space-y-3" :aria-label="t('create.session')">
    <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
      <h2 class="text-lg font-semibold text-text">{{ t('create.session') }}</h2>
      <!-- one Tab stop, arrows choose (v-roving); each hint is the radio's description, not only a hover title -->
      <div v-roving class="ms-auto inline-flex overflow-hidden rounded-lg border border-border text-xs" role="radiogroup" :aria-label="t('create.period')">
        <button
          v-for="p in PERIODS" :key="p" type="button" role="radio" :aria-checked="period === p" :title="t(`create.periodHint.${p}`)"
          :aria-describedby="`session-period-hint-${p}`"
          class="px-2.5 py-1.5 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent1" :class="period === p ? 'bg-accent1/20 font-medium text-text' : 'text-text-dim hover:bg-panel-2 hover:text-text'"
          @click="period = p"
        >{{ t(`create.periods.${p}`) }}<span class="ms-1.5 tabular-nums text-text-dim">{{ counts[p] }}</span></button>
      </div>
      <!-- outside the radios, so the hints describe them without becoming part of their names -->
      <span v-for="p in PERIODS" :id="`session-period-hint-${p}`" :key="`hint-${p}`" class="sr-only">{{ t(`create.periodHint.${p}`) }}</span>
      <router-link to="/library" :title="t('create.wholeLibrary')" :aria-label="t('create.wholeLibrary')" class="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-text-dim hover:bg-panel hover:text-text">
        <LibraryIcon class="h-3.5 w-3.5" /><span class="hidden @lg:inline">{{ t('create.wholeLibrary') }}</span>
      </router-link>
    </div>

    <p v-if="!props.loaded && !songs.length" class="rounded-xl border border-border bg-panel p-6 text-sm text-text-dim">{{ t('create.loading') }}</p>

    <!-- nothing in this period: say what to do, and offer the wider one when it has takes -->
    <div v-else-if="!inPeriod.length" class="rounded-xl border border-dashed border-border p-8 text-center">
      <p class="text-sm font-medium text-text">{{ t(period === 'all' ? 'create.emptyAll' : 'create.emptyPeriod') }}</p>
      <p class="mt-1 text-sm text-text-dim">{{ t('create.emptyHint') }}</p>
      <button v-if="period !== 'all' && counts.all > 0" type="button" class="mt-4 rounded-lg border border-border px-3 py-1.5 text-xs text-text hover:bg-panel-2" @click="period = 'all'">
        {{ t('create.showAll', { n: counts.all }) }}
      </button>
    </div>

    <template v-else>
      <div v-for="(group, gi) in groups" :key="`${gi}-${group.day}`" class="space-y-1.5">
        <h3 v-if="showDays" class="px-1 pt-1 text-xs font-semibold text-text-dim">{{ group.day }}</h3>
        <div class="divide-y divide-border/70 rounded-xl border border-border bg-panel">
          <TakeRow
            v-for="row in group.rows" :key="row.take.key" :take="row.take" :n="row.n" :tracks="playerTracks" :queue="queue"
            :other-day="formatDayTime(row.take.createdAt).day !== row.day"
            :compare="compareSets.get(row.take.key)?.takes.length ?? 0" :compare-lead="compareSets.get(row.take.key)?.leadKey === row.take.key"
            @reuse="emit('reuse', $event)" @compare="openCompare(row.take)"
          />
        </div>
      </div>
      <button v-if="inPeriod.length > shown" type="button" class="w-full rounded-xl border border-border py-2.5 text-sm text-text-dim hover:bg-panel hover:text-text" @click="shown += PAGE">
        {{ t('create.showMore', { n: inPeriod.length - shown }) }}
      </button>
    </template>
    <TakeCompare
      v-if="comparing" :title="comparing.title" :takes="comparing.takes" :total="comparing.total"
      @close="comparing = null" @trashed="loadAll()" @restored="loadAll()"
    />
  </section>
</template>
