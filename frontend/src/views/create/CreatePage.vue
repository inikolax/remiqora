<script setup lang="ts">
import { computed, h, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import type { Component, FunctionalComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import type { LocationQueryRaw } from 'vue-router'
import { useOrchestratorStore } from '../../stores/orchestrator'
import { useFeaturesStore } from '../../stores/features'
import { useMarksStore } from '../../stores/marks'
import { useGenQueueStore } from '../../stores/genQueue'
import { usePlayerStore } from '../../stores/player'
import { MODEL_FEATURE } from '../../composables/useModelSwitch'
import { ENGINE_SHORT, useTakes } from '../../composables/useTakes'
import type { Take } from '../../composables/useTakes'
import type { JobStatus, ModelId, ModelRuntimeStatus } from '../../types'
import { songName } from '../../utils/trackTitle'
import Yue2Page from '../yue2/Yue2Page.vue'
import AceStepPage from '../ace-step/AceStepPage.vue'
import StableAudioPage from '../stable-audio/StableAudioPage.vue'
import SessionPanel from './SessionPanel.vue'
import MicIcon from '../../components/shared/icons/MicIcon.vue'
import WaveIcon from '../../components/shared/icons/WaveIcon.vue'
import PulseIcon from '../../components/shared/icons/PulseIcon.vue'
import SparklesIcon from '../../components/shared/icons/SparklesIcon.vue'
import TargetIcon from '../../components/shared/icons/TargetIcon.vue'
import GearIcon from '../../components/shared/icons/GearIcon.vue'
import LibraryIcon from '../../components/shared/icons/LibraryIcon.vue'
import LoraTrainingPage from '../ace-step/LoraTrainingPage.vue'
import IdeaLine from './IdeaLine.vue'
import NotesWorkspace from './NotesWorkspace.vue'
import ScoreIcon from '../../components/score/ScoreIcon.vue'
import { createEngineOf, useNotesView } from '../../composables/useNotesView'
import { useScoreWorkspace } from '../../stores/scoreWorkspace'

/**
 * Create: one page for the three engines. The engines are a rail on the left (a row of tabs on a phone), the
 * chosen engine's form is next to it, and what was made, by whichever engine, is the session on the right.
 * ACE-Step has a second mode, LoRA training, which takes the form's and the session's room. YuE2 has "Notes": its
 * score editor in the session's place (`view=notes`), on the whole width; under 1100 px the form steps aside for it
 * (a drawer brings it back) and on a phone it is a screen of its own.
 */
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
/** The player bar takes the bottom of the window while a track is loaded: the form's column ends above it. */
const player = usePlayerStore()
const orchestrator = useOrchestratorStore()
const features = useFeaturesStore()
const { loadAll, takes } = useTakes()
const marks = useMarksStore()
/** The backend's queue of takes: polled while this page is open, so the session follows it. */
const genQueue = useGenQueueStore()

const ENGINES: { id: ModelId; icon: Component; pane: Component }[] = [
  { id: 'yue2', icon: MicIcon, pane: Yue2Page },
  { id: 'ace_step', icon: WaveIcon, pane: AceStepPage },
  { id: 'stable_audio', icon: PulseIcon, pane: StableAudioPage },
]
/** The tabs' rows in the lg rail: row 2 is kept for YuE2's "Notes" and row 4 for ACE-Step's modes, each right under
 *  its tab (see the template). */
const TAB_ROW: Record<ModelId, string> = { yue2: 'lg:row-start-1', ace_step: 'lg:row-start-3', stable_audio: 'lg:row-start-5' }
const ENGINE_KEY = 'remiqora_create_engine'

// The engine in the address wins (links and the old addresses carry it); else the one on the GPU, else the last used.
// (the cover maker on the GPU is no engine of this page: it falls through to the last used)
const engine = computed<ModelId>(() => createEngineOf(route.query.engine, orchestrator.activeModel))
function pick(id: ModelId): Promise<unknown> {
  try { localStorage.setItem(ENGINE_KEY, id) } catch { /* private window */ }
  // an engine picked in the rail opens on its main mode: ACE-Step on Generate, not LoRA
  const query: LocationQueryRaw = { ...route.query, engine: id }
  delete query.ace
  // another engine has no notes: the session comes back (the form's score stays in YuE2's form)
  if (id !== 'yue2') delete query.view
  return router.replace({ name: 'create', query })
}

/** ACE-Step's modes, in the address (`ace=lora`; the old /ace-step/lora redirects there). */
type AceMode = 'generate' | 'lora'
const ACE_MODES: { id: AceMode; icon: Component; label: string; hint: string }[] = [
  { id: 'generate', icon: SparklesIcon, label: 'acePage.tabs.generate', hint: 'header.desc.ace' },
  { id: 'lora', icon: TargetIcon, label: 'acePage.tabs.lora', hint: 'acePage.tabs.loraHint' },
]
const aceMode = computed<AceMode>(() => (route.query.ace === 'lora' ? 'lora' : 'generate'))
const loraMode = computed(() => engine.value === 'ace_step' && aceMode.value === 'lora')
function pickAce(mode: AceMode): void {
  if (mode === aceMode.value && engine.value === 'ace_step') return
  try { localStorage.setItem(ENGINE_KEY, 'ace_step') } catch { /* private window */ }
  const query: LocationQueryRaw = { ...route.query, engine: 'ace_step' }
  delete query.view
  if (mode === 'lora') query.ace = 'lora'
  else delete query.ace
  // a page of its own before, so Back still returns from training to generating
  void router.push({ name: 'create', query })
}

// ---- YuE2's notes workspace (in the address: view=notes) ----
const notes = useNotesView()
const ws = useScoreWorkspace()
const notesOpen = computed(() => engine.value === 'yue2' && notes.isOpen.value)
/** The form has a score the closed workspace would show: a dot on the rail's "Notes". */
const notesDot = computed(() => !notesOpen.value && !!ws.formAbc.trim())
function media(query: string) {
  const m = window.matchMedia?.(query)
  const r = ref(!!m?.matches)
  const on = (e: MediaQueryListEvent): void => { r.value = e.matches }
  m?.addEventListener('change', on)
  onBeforeUnmount(() => m?.removeEventListener('change', on))
  return r
}
/** Wide enough for the rail, the form and the notes side by side. */
const wide = media('(min-width: 1100px)')
/** The rail layout (lg); under it the notes are a screen of their own. */
const desktop = media('(min-width: 1024px)')
/** The notes take the form's room too: the form is a drawer the workspace's "Form" opens. */
const formAside = computed(() => notesOpen.value && !wide.value)
watch(formAside, (aside) => { if (!aside) ws.formDrawer = false })
function onKeydown(e: KeyboardEvent): void {
  // an Escape a dialog or a menu inside already took is not the drawer's
  if (e.defaultPrevented) return
  if (e.key === 'Escape' && formAside.value && ws.formDrawer) { ws.formDrawer = false; e.preventDefault() }
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

// A form stays mounted once opened, so what was typed survives a look at another engine (or at LoRA training).
const opened = reactive(new Set<ModelId>())
watch(engine, (id) => opened.add(id), { immediate: true })
const paneShown = (id: ModelId): boolean => engine.value === id && !(id === 'ace_step' && loraMode.value)

const statusOf = (id: ModelId): ModelRuntimeStatus => orchestrator.statuses[id]?.status ?? 'stopped'
const installed = (id: ModelId): boolean => { const f = MODEL_FEATURE[id]; return !f || features.has(f) }
const LED: Record<ModelRuntimeStatus, string> = {
  stopped: 'border border-text-dim/70',
  starting: 'bg-status-queued animate-pulse',
  running: 'bg-status-done shadow-[0_0_6px_var(--color-status-done)]',
  stopping: 'bg-status-queued animate-pulse',
  error: 'bg-status-failed',
}
/** The engine's light. An error is a red triangle with a "!", not only a red dot: colour alone does not tell it. */
const StatusLed: FunctionalComponent<{ status: ModelRuntimeStatus }> = (p) => (p.status === 'error'
  ? h('svg', { viewBox: '0 0 12 12', class: 'h-2.5 w-2.5 shrink-0 text-status-failed', 'aria-hidden': 'true' }, [
    h('path', { d: 'M6 .8 11.4 10.8H.6z', fill: 'currentColor' }),
    h('path', { d: 'M6 4.4v2.9M6 9.1v.01', stroke: 'var(--color-bg)', 'stroke-width': '1.5', 'stroke-linecap': 'round' }),
  ])
  : h('span', { class: ['h-2 w-2 shrink-0 rounded-full motion-reduce:animate-none', LED[p.status]], 'aria-hidden': 'true' }))
StatusLed.props = ['status']

const loaded = ref(false)
onBeforeUnmount(() => genQueue.release())
onMounted(async () => {
  genQueue.acquire()
  // the stars of the takes come with the tracks' list
  await Promise.all([loadAll(), marks.load().catch(() => [])])
  loaded.value = true
})

const reduceMotion = (): boolean => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** A take's settings go back into its engine's form: show that form and move the focus there, so a keyboard or
 *  a screen reader lands where the settings went. On lg the form is a sticky column beside the session, already in
 *  sight: the focus is enough. On a phone the form is above the session: scroll to it, gently unless motion is reduced. */
async function onReuse(take: Take): Promise<void> {
  if (take.engine !== engine.value || loraMode.value) await pick(take.engine)
  await nextTick()
  const panel = document.getElementById(`create-panel-${take.engine}`)
  if (!panel) return
  if (window.matchMedia?.('(min-width: 1024px)').matches) { panel.focus({ preventScroll: false }); return }
  panel.focus({ preventScroll: true })
  panel.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' })
}

/** On a phone the session is below the form: the button by the engine tabs takes you there. */
const sessionCount = ref(0)
function toSession(): void {
  document.getElementById('create-session')?.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' })
}

/**
 * One polite live region for the takes: a screen reader hears that takes went into the queue, that one is ready or
 * that one failed and why. Only transitions of a job's status are told, never a progress tick, and nothing about
 * the takes that were already there when the page loaded.
 */
const announcement = ref('')
let seen: Map<string, JobStatus> | null = null
const isActive = (s: JobStatus | undefined): boolean => s === 'queued' || s === 'running'
watch([takes, loaded], ([list, ready]) => {
  // a job of ACE-Step turns into several takes when done: the job is the unit that changes status
  const jobs = new Map<string, Take[]>()
  for (const x of list) {
    const k = `${x.engine}:${x.job.id}`
    const same = jobs.get(k)
    if (same) same.push(x)
    else jobs.set(k, [x])
  }
  const prev = seen
  seen = new Map([...jobs].map(([k, xs]) => [k, xs[0].status]))
  if (!ready || !prev) return
  const said: string[] = []
  let queued = false
  for (const [k, xs] of jobs) {
    const was = prev.get(k)
    const now = xs[0].status
    if (was === now) continue
    const name = songName(xs[0].title, xs[0].style, xs[0].lyrics).name || t('create.untitled')
    if (isActive(now) && !isActive(was)) queued = true
    else if (isActive(was) && now === 'done') said.push(xs.length > 1 ? t('create.live.readyMany', { name, n: xs.length }) : t('create.live.ready', { name }))
    else if (isActive(was) && now === 'failed') said.push(t('create.live.failed', { name, reason: xs[0].error || t('create.failed') }))
  }
  if (queued) {
    const n = list.filter((x) => isActive(x.status)).reduce((sum, x) => sum + x.pending, 0)
    said.unshift(t('create.live.queue', { n }))
  }
  if (!said.length) return
  // emptied first, so the same words said twice in a row are announced again
  announcement.value = ''
  void nextTick(() => { announcement.value = said.join(' ') })
})
</script>

<template>
  <!-- Three layouts. Under lg: one column, the engines a row of tabs on top, the session below the form.
       lg: a rail of icons, the form 440-480 px, the session the rest. 2xl: the rail with names and purposes,
       a wider form, the session the rest. In LoRA mode the training page takes the form's and the session's room.
       The side columns stick under the header (its real height, --header-h) and end above the player; dvh, not vh,
       so a phone's or a tablet's browser bars are not counted in. They never get shorter than 30rem: on a low
       window the page scrolls rather than the form shrinking to a sliver. -->
  <div
    class="grid grid-cols-1 items-start gap-3 lg:gap-6"
    :class="loraMode || formAside
      ? 'lg:grid-cols-[3.5rem_minmax(0,1fr)] 2xl:grid-cols-[12.5rem_minmax(0,1fr)]'
      : notesOpen
        ? 'lg:grid-cols-[3.5rem_clamp(400px,30vw,440px)_minmax(0,1fr)] 2xl:grid-cols-[12.5rem_clamp(420px,28vw,520px)_minmax(0,1fr)]'
        : 'lg:grid-cols-[3.5rem_clamp(440px,36vw,480px)_minmax(0,1fr)] 2xl:grid-cols-[12.5rem_clamp(440px,34vw,640px)_minmax(0,1fr)]'"
    :style="{ '--side-max': player.track
      ? 'max(30rem, calc(100dvh - var(--header-h, 4rem) - 1.25rem - var(--player-h, 4.25rem)))'
      : 'max(30rem, calc(100dvh - var(--header-h, 4rem) - 1.25rem))' }"
  >
    <!-- the takes' news for a screen reader: queued, ready, failed (see the watcher) -->
    <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">{{ announcement }}</p>

    <!-- The engine rack: fits the window under the header and above the player, like the form's column. On lg it is
         a grid whose rows the tablist shares (subgrid), so ACE-Step's modes sit right under its tab while staying
         outside the tablist: rows 1, 3 and 5 are the tabs, row 2 YuE2's notes, row 4 ACE-Step's modes, row 6 the
         models link. -->
    <div v-show="!(notesOpen && !desktop)" class="flex min-w-0 items-center gap-1.5 sm:gap-2 lg:sticky lg:top-[calc(var(--header-h,4rem)+0.25rem)] lg:grid lg:max-h-[var(--side-max)] lg:self-start lg:grid-cols-1 lg:grid-rows-[auto_auto_auto_auto_auto_auto] lg:items-stretch lg:gap-0 lg:overflow-y-auto lg:rounded-xl lg:border lg:border-border lg:bg-panel lg:p-1.5 2xl:p-2">
      <!-- arrows move between the engines (v-roving): left/right on a phone's row, up/down on the rail -->
      <div
        v-roving
        class="flex min-w-0 flex-1 gap-1.5 sm:gap-2 lg:col-start-1 lg:row-span-5 lg:row-start-1 lg:grid lg:grid-rows-subgrid lg:gap-0"
        role="tablist" :aria-label="t('create.engine')"
      >
        <button
          v-for="e in ENGINES" :id="`create-tab-${e.id}`" :key="e.id"
          type="button" role="tab" :aria-selected="engine === e.id"
          :aria-controls="e.id === 'ace_step' && loraMode ? 'create-panel-lora' : opened.has(e.id) ? `create-panel-${e.id}` : undefined"
          class="relative flex h-10 min-w-0 flex-auto items-center justify-center gap-1.5 rounded-lg border px-1.5 text-[13px] transition-colors sm:px-2.5 sm:text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1 lg:mb-1 lg:h-auto lg:min-h-12 lg:w-full lg:flex-none lg:flex-col lg:gap-1 lg:border-transparent lg:px-0 lg:py-1.5 2xl:flex-row 2xl:items-start 2xl:justify-start 2xl:gap-2.5 2xl:px-2.5 2xl:py-2 2xl:text-start"
          :class="[TAB_ROW[e.id], engine === e.id ? 'border-accent1/70 bg-accent1/10' : 'border-border bg-panel hover:border-text-dim/60 lg:bg-transparent lg:hover:border-transparent lg:hover:bg-panel-2']"
          :title="t('create.engineTitle', { name: ENGINE_SHORT[e.id], status: t(`modelStatus.${statusOf(e.id)}`) })"
          @click="pick(e.id)"
        >
          <!-- the chosen unit's marker on the rail's edge -->
          <span v-if="engine === e.id" class="absolute inset-y-2 start-0 hidden w-[3px] rounded-e-full bg-accent1 lg:block" aria-hidden="true"></span>
          <component :is="e.icon" class="hidden h-5 w-5 shrink-0 lg:block 2xl:mt-0.5 2xl:h-4 2xl:w-4" :class="engine === e.id ? 'text-accent1' : 'text-text-dim'" />
          <!-- between lg and 2xl a short name under the icon (the full one is read from the sr-only text below) -->
          <span class="hidden text-[10.5px] leading-none lg:max-2xl:block" :class="engine === e.id ? 'font-medium text-text' : 'text-text-dim'" aria-hidden="true">{{ t(`create.rail.${e.id}`) }}</span>
          <!-- icons only between lg and 2xl: the LED sits on the icon's corner there -->
          <StatusLed v-if="installed(e.id)" :status="statusOf(e.id)" class="absolute end-1.5 top-1.5 hidden lg:max-2xl:block" />
          <span class="min-w-0 lg:max-2xl:sr-only 2xl:flex-1">
            <span class="flex min-w-0 items-center gap-1.5 2xl:gap-2">
              <span class="min-w-0 truncate font-semibold text-text">{{ ENGINE_SHORT[e.id] }}</span>
              <!-- the light is colour (and shape): its words are for a screen reader, "ACE-Step, running" -->
              <span v-if="installed(e.id)" class="sr-only">, {{ t(`modelStatus.${statusOf(e.id)}`) }}</span>
              <StatusLed v-if="installed(e.id)" :status="statusOf(e.id)" class="2xl:ms-auto" />
            </span>
            <span class="mt-0.5 hidden truncate text-xs text-text-dim 2xl:block" :title="t(`create.engines.${e.id}`)">{{ t(`create.engines.${e.id}`) }}</span>
          </span>
        </button>
      </div>

      <!-- YuE2's notes under its unit while it is chosen (row 2): the score editor in the session's place. A dot: the
           form has a score and the workspace is closed. -->
      <div v-if="engine === 'yue2'" class="hidden lg:col-start-1 lg:row-start-2 lg:flex lg:flex-col lg:items-center lg:pb-2 2xl:items-stretch 2xl:ps-7">
        <button
          type="button" :aria-pressed="notesOpen" :title="t('create.notes.railTip')"
          class="relative flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-md px-1.5 py-1 text-[10.5px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1 2xl:w-full 2xl:flex-row 2xl:justify-start 2xl:gap-2 2xl:px-2 2xl:py-1.5 2xl:text-sm"
          :class="notesOpen ? 'bg-accent1/15 font-medium text-text ring-1 ring-accent1/40' : 'text-text-dim hover:bg-panel-2/60 hover:text-text'"
          @click="notesOpen ? notes.close() : notes.open()"
        >
          <ScoreIcon name="notes" class="h-4 w-4 shrink-0" :class="notesOpen && 'text-accent1'" />
          <span class="min-w-0 truncate">{{ t('create.notes.rail') }}</span>
          <span v-if="notesDot" class="absolute end-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-accent2 2xl:static 2xl:ms-auto" aria-hidden="true"></span>
          <span v-if="notesDot" class="sr-only">{{ t('create.notes.hasScore') }}</span>
        </button>
      </div>

      <!-- ACE-Step's modes under its unit while it is chosen (row 4 of the rail); a navigation of its own, since a
           tablist may hold only tabs. On a phone the switch stays above the form. -->
      <nav
        v-if="engine === 'ace_step'"
        class="hidden lg:col-start-1 lg:row-start-4 lg:flex lg:flex-col lg:items-center lg:gap-0.5 lg:pb-2 2xl:items-stretch 2xl:ps-7"
        :aria-label="t('acePage.tabs.label')"
      >
        <button
          v-for="m in ACE_MODES" :key="m.id" type="button" :aria-current="aceMode === m.id ? 'page' : undefined"
          class="flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-md px-1.5 py-1 text-[10.5px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1 2xl:h-8 2xl:w-full 2xl:flex-row 2xl:justify-start 2xl:gap-2 2xl:px-2 2xl:py-0 2xl:text-sm"
          :class="aceMode === m.id ? 'bg-panel-2 font-medium text-text' : 'text-text-dim hover:bg-panel-2/60 hover:text-text'"
          :title="t(m.hint)"
          @click="pickAce(m.id)"
        >
          <component :is="m.icon" class="h-4 w-4 shrink-0 2xl:hidden" :class="aceMode === m.id && 'text-accent1'" />
          <span class="min-w-0 truncate lg:max-2xl:sr-only">{{ t(m.label) }}</span>
          <span class="hidden leading-none lg:max-2xl:block" aria-hidden="true">{{ t(`create.rail.${m.id}`) }}</span>
        </button>
      </nav>

      <!-- a phone: YuE2's notes as a screen of their own -->
      <button
        v-if="engine === 'yue2'" type="button" :title="t('create.notes.railTip')"
        class="relative flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs text-text-dim transition-colors hover:border-text-dim/60 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1 lg:hidden"
        @click="notes.open()"
      >
        <ScoreIcon name="notes" class="h-3.5 w-3.5" /><span class="hidden sm:inline">{{ t('create.notes.rail') }}</span>
        <span v-if="notesDot" class="absolute end-1 top-1 h-1.5 w-1.5 rounded-full bg-accent2" aria-hidden="true"></span>
      </button>

      <!-- a phone: the session is below the form, this takes you there -->
      <button
        v-if="!loraMode" type="button"
        class="flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs text-text-dim transition-colors hover:border-text-dim/60 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1 lg:hidden"
        :aria-label="t('create.toSession', { n: sessionCount })"
        @click="toSession"
      >
        <span class="hidden sm:inline">{{ t('create.session') }}</span>
        <LibraryIcon class="h-3.5 w-3.5 sm:hidden" />
        <span class="tabular-nums">{{ sessionCount }}</span>
      </button>

      <!-- right under the engines, past a rule: the settings belong to them, not to the bottom of the window -->
      <div class="hidden lg:col-start-1 lg:row-start-6 lg:mt-1.5 lg:block lg:border-t lg:border-border lg:pt-1.5">
        <router-link
          to="/models"
          class="flex min-h-10 min-w-0 flex-col items-center justify-center gap-1 rounded-lg py-1.5 text-sm text-text-dim transition-colors hover:bg-panel-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1 2xl:flex-row 2xl:justify-start 2xl:gap-2 2xl:px-2.5"
          :title="t('header.models')"
        >
          <GearIcon class="h-5 w-5 shrink-0 2xl:h-4 2xl:w-4" />
          <span class="min-w-0 truncate lg:max-2xl:sr-only">{{ t('create.models') }}</span>
          <span class="hidden text-[10.5px] leading-none lg:max-2xl:block" aria-hidden="true">{{ t('create.rail.models') }}</span>
        </router-link>
      </div>
    </div>

    <!-- the column fits the window under the header and above the player: the form's footer with Create stays in sight -->
    <!-- the form steps aside for the notes on a narrow window: the workspace's "Form" shows it as a drawer -->
    <div v-if="formAside && ws.formDrawer" class="fixed inset-0 z-40 bg-black/50" aria-hidden="true" @click="ws.formDrawer = false"></div>
    <div
      v-show="!loraMode && (!formAside || ws.formDrawer)"
      :class="formAside
        ? 'fixed inset-y-0 start-0 z-50 flex w-[min(480px,94vw)] min-w-0 flex-col space-y-3 overflow-y-auto border-e border-border bg-bg p-3 shadow-2xl'
        : 'min-w-0 space-y-3 lg:sticky lg:top-[calc(var(--header-h,4rem)+0.25rem)] lg:flex lg:max-h-[var(--side-max)] lg:flex-col'"
      :role="formAside ? 'dialog' : undefined" :aria-label="formAside ? t('score.workspace.form') : undefined"
    >
      <!-- one phrase: the assistant writes the lyrics and the style into the form below -->
      <IdeaLine :engine="engine" />

      <!-- tabindex -1: a reuse moves the focus here (onReuse); the form keeps at least 16rem, a banner above it
           or a long idea cannot squeeze it to a sliver -->
      <template v-for="e in ENGINES" :key="e.id">
        <div
          v-if="opened.has(e.id)" v-show="paneShown(e.id)" :id="`create-panel-${e.id}`"
          role="tabpanel" :aria-labelledby="`create-tab-${e.id}`" tabindex="-1"
          class="scroll-mt-[calc(var(--header-h,4rem)+0.75rem)] outline-none lg:flex lg:min-h-[16rem] lg:flex-1 lg:flex-col"
        ><component :is="e.pane" /></div>
      </template>
    </div>

    <!-- LoRA training: a long page of its own steps, it scrolls with the window -->
    <div v-if="loraMode" id="create-panel-lora" role="tabpanel" aria-labelledby="create-tab-ace_step" class="min-w-0 max-w-6xl"><LoraTrainingPage /></div>

    <!-- YuE2's notes in the session's place, as tall as the form's column -->
    <NotesWorkspace
      v-if="notesOpen" class="h-[var(--side-max)] lg:sticky lg:top-[calc(var(--header-h,4rem)+0.25rem)]"
      :narrow="formAside" :form-shown="ws.formDrawer" @toggle-form="ws.formDrawer = !ws.formDrawer"
    />

    <SessionPanel
      v-show="!loraMode && !notesOpen" id="create-session"
      class="mt-3 scroll-mt-[calc(var(--header-h,4rem)+0.75rem)] lg:mt-0"
      :loaded="loaded" @reuse="onReuse" @count="sessionCount = $event"
    />
  </div>
</template>
