<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useOrchestratorStore } from '../../stores/orchestrator'
import { useFeaturesStore } from '../../stores/features'
import { MODEL_LABELS, MODEL_ROUTES, useModelSwitch } from '../../composables/useModelSwitch'
import { setLocale, currentLocale, type LocaleCode } from '../../i18n'
import type { ModelId, ModelRuntimeStatus } from '../../types'
import AppHelpModal from './AppHelpModal.vue'
import EditorHelpModal from '../editor/EditorHelpModal.vue'
import EditorHotkeysModal from '../editor/EditorHotkeysModal.vue'
import AiArrangerGuide from '../editor/AiArrangerGuide.vue'
import ResourceMeters from './ResourceMeters.vue'
import MicIcon from './icons/MicIcon.vue'
import TargetIcon from './icons/TargetIcon.vue'
import TimelineIcon from './icons/TimelineIcon.vue'
import WaveIcon from './icons/WaveIcon.vue'

const orchestrator = useOrchestratorStore()
const features = useFeaturesStore()
const route = useRoute()
const onEditor = computed(() => route.path.startsWith('/editor'))
const { selectModel } = useModelSwitch()
const { t, locale } = useI18n()
const helpOpen = ref(false)
/** A guide opened from the help: the editor's, its shortcut sheet, or the AI arranger's. */
const guide = ref<'editor' | 'hotkeys' | 'arranger' | null>(null)
function openGuide(which: 'editor' | 'arranger') {
  helpOpen.value = false
  guide.value = which
}

function toggleLocale() {
  const next: LocaleCode = currentLocale() === 'ru' ? 'en' : 'ru'
  setLocale(next)
  locale.value = next
}

// The header's height (it wraps on a phone) as --header-h, so sticky bars below it know where to stop.
const headerEl = ref<HTMLElement | null>(null)
let observer: ResizeObserver | null = null
onMounted(() => {
  if (!headerEl.value || typeof ResizeObserver === 'undefined') return
  observer = new ResizeObserver(() => {
    document.documentElement.style.setProperty('--header-h', `${headerEl.value?.offsetHeight ?? 0}px`)
    updateNavMore()
  })
  observer.observe(headerEl.value)
  showCurrentTab()
})
onUnmounted(() => observer?.disconnect())

// On a narrow window the tabs scroll sideways: the right edge fades while more tabs hide past it, and the
// current section's tab is scrolled into view.
const navEl = ref<HTMLElement | null>(null)
const navMore = ref(false)
function updateNavMore() {
  const nav = navEl.value
  navMore.value = !!nav && nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 4
}
async function showCurrentTab() {
  await nextTick()
  navEl.value?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  updateNavMore()
}
watch(() => route.path, showCurrentTab)

function statusOf(id: ModelId): ModelRuntimeStatus {
  return orchestrator.statuses[id]?.status ?? 'stopped'
}

/** The status lights: a lit green dot runs, a hollow ring is stopped, amber pulses while it changes. */
const LED_CLASSES: Record<ModelRuntimeStatus, string> = {
  stopped: 'border border-text-dim/70',
  starting: 'bg-status-queued animate-pulse',
  running: 'bg-status-done shadow-[0_0_6px_var(--color-status-done)]',
  stopping: 'bg-status-queued animate-pulse',
  error: 'bg-status-failed shadow-[0_0_6px_var(--color-status-failed)]',
}
/** Only one engine runs at a time, so the running one is named; a stopped one keeps just its hollow light. */
function statusShown(id: ModelId): boolean {
  return statusOf(id) !== 'stopped'
}
const STATUS_TEXT_CLASSES: Record<ModelRuntimeStatus, string> = {
  stopped: 'text-text-dim',
  starting: 'text-status-queued',
  running: 'text-status-done',
  stopping: 'text-status-queued',
  error: 'text-status-failed',
}
const DESC_KEYS: Record<ModelId, string> = { ace_step: 'header.desc.ace', yue2: 'header.desc.yue' }
/** The tab's tooltip: what the engine is for, its state, and, unless it runs, that a click starts it. */
function engineTitle(id: ModelId): string {
  if (id === 'yue2' && !features.has('yue2')) return t('notInstalled.yue2.title')
  const title = t('header.engineTitle', { model: MODEL_LABELS[id], desc: t(DESC_KEYS[id]), status: t(STATUS_LABEL_KEYS[statusOf(id)]) })
  return statusOf(id) === 'running' ? title : `${title}
${t('header.engineStart')}`
}

const STATUS_LABEL_KEYS: Record<ModelRuntimeStatus, string> = {
  stopped: 'modelStatus.stopped',
  starting: 'modelStatus.starting',
  running: 'modelStatus.running',
  stopping: 'modelStatus.stopping',
  error: 'modelStatus.error',
}

async function onSelect(id: ModelId) {
  try {
    await selectModel(id)
  } catch {
    // orchestrator.switchError already holds the message, rendered below.
  }
}
</script>

<template>
  <header ref="headerEl" class="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur">
    <!-- One row over the whole window: the brand, the sections centred on the window, the tools. As the window
         narrows, things drop out in order (the tagline, the memory numbers, the brand name, the descriptions) rather
         than wrapping; on a phone the tabs scroll sideways. -->
    <div class="flex h-[4.75rem] items-stretch gap-4 px-4 sm:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-6 2xl:gap-8">
      <!-- the mark is as tall as the two lines next to it (24 + 16 px); the R is drawn, not set in a
           font - an SVG <text> falls back to a different face and looks uneven -->
      <router-link to="/" class="flex shrink-0 items-center gap-2.5 self-center justify-self-start text-text">
        <span class="accent-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md shadow-accent1/20">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M7 19V5h5.5a3.75 3.75 0 0 1 0 7.5H7M12.5 12.5 17 19" />
          </svg>
        </span>
        <span class="hidden flex-col min-[1440px]:flex">
          <span class="text-lg leading-6 font-semibold">Remiqora</span>
          <!-- 12px, not 10: at 10px grey on dark Windows' smoothing made it look blurred -->
          <span class="hidden text-xs leading-4 font-medium tracking-wide whitespace-nowrap text-text/70 min-[1680px]:block">{{ t('header.tagline') }}</span>
        </span>
      </router-link>

      <!-- The sections as tabs: an icon, the name, what it is for; the current one is underlined on the header's edge.
           An engine's light tells whether it runs, and its tab opens the page and starts it on the GPU. LoRA training
           is ACE-Step's, so it sits right beside it with no divider; dividers only part the groups. -->
      <nav
        ref="navEl"
        class="flex min-w-0 items-stretch overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        :class="navMore && '[mask-image:linear-gradient(to_right,#000_calc(100%-3rem),transparent)]'"
        :aria-label="t('header.navLabel')"
        @scroll.passive="updateNavMore"
      >
        <button
          type="button"
          class="relative flex shrink-0 items-center gap-2.5 px-3.5 text-left transition-colors"
          :class="route.name === MODEL_ROUTES.ace_step ? 'text-text' : 'text-text-dim hover:text-text'"
          :title="engineTitle('ace_step')"
          :aria-current="route.name === MODEL_ROUTES.ace_step ? 'page' : undefined"
          @click="onSelect('ace_step')"
        >
          <WaveIcon class="h-[18px] w-[18px] shrink-0" :class="route.name === MODEL_ROUTES.ace_step && 'text-accent1'" />
          <span class="flex flex-col">
            <span class="flex items-center gap-2 text-[15px] leading-5 whitespace-nowrap" :class="route.name === MODEL_ROUTES.ace_step ? 'font-semibold' : 'font-medium'">
              {{ MODEL_LABELS.ace_step }}
              <span class="h-2 w-2 shrink-0 rounded-full" :class="LED_CLASSES[statusOf('ace_step')]" aria-hidden="true"></span>
              <span v-if="statusShown('ace_step')" class="hidden text-[11px] font-medium xl:inline" :class="STATUS_TEXT_CLASSES[statusOf('ace_step')]">{{ t(STATUS_LABEL_KEYS[statusOf('ace_step')]) }}</span>
            </span>
            <span class="mt-0.5 hidden text-xs leading-4 font-normal whitespace-nowrap text-text-dim xl:block">{{ t('header.desc.ace') }}</span>
          </span>
          <span v-if="route.name === MODEL_ROUTES.ace_step" class="accent-gradient absolute inset-x-3 bottom-0 h-0.5 rounded-full" aria-hidden="true"></span>
        </button>
        <router-link
          to="/ace-step/lora"
          class="relative flex shrink-0 items-center gap-2 pr-3.5 pl-1.5 transition-colors"
          :class="route.name === 'ace-step-lora' ? 'text-text' : 'text-text-dim hover:text-text'"
          :title="t('header.loraTitle')"
          :aria-current="route.name === 'ace-step-lora' ? 'page' : undefined"
        >
          <TargetIcon class="h-4 w-4 shrink-0" :class="route.name === 'ace-step-lora' && 'text-accent1'" />
          <span class="flex flex-col">
            <span class="text-sm leading-5 whitespace-nowrap" :class="route.name === 'ace-step-lora' ? 'font-semibold' : 'font-medium'">{{ t('header.lora') }}</span>
            <span class="mt-0.5 hidden text-xs leading-4 whitespace-nowrap text-text-dim xl:block">{{ t('header.desc.lora') }}</span>
          </span>
          <span v-if="route.name === 'ace-step-lora'" class="accent-gradient absolute inset-x-0.5 bottom-0 h-0.5 rounded-full" aria-hidden="true"></span>
        </router-link>

        <span class="mx-2 h-8 w-px shrink-0 self-center bg-border" aria-hidden="true"></span>

        <button
          type="button"
          class="relative flex shrink-0 items-center gap-2.5 px-3.5 text-left transition-colors"
          :class="route.name === MODEL_ROUTES.yue2 ? 'text-text' : 'text-text-dim hover:text-text'"
          :title="engineTitle('yue2')"
          :aria-current="route.name === MODEL_ROUTES.yue2 ? 'page' : undefined"
          @click="onSelect('yue2')"
        >
          <MicIcon class="h-[18px] w-[18px] shrink-0" :class="route.name === MODEL_ROUTES.yue2 && 'text-accent1'" />
          <span class="flex flex-col">
            <span class="flex items-center gap-2 text-[15px] leading-5 whitespace-nowrap" :class="route.name === MODEL_ROUTES.yue2 ? 'font-semibold' : 'font-medium'">
              {{ MODEL_LABELS.yue2 }}
              <!-- left out at install: no light, it cannot run; it says so instead -->
              <span v-if="!features.has('yue2')" class="hidden rounded border border-border px-1.5 text-[11px] font-medium text-text-dim xl:inline">{{ t('notInstalled.installed') }}</span>
              <template v-else>
                <span class="h-2 w-2 shrink-0 rounded-full" :class="LED_CLASSES[statusOf('yue2')]" aria-hidden="true"></span>
                <span v-if="statusShown('yue2')" class="hidden text-[11px] font-medium xl:inline" :class="STATUS_TEXT_CLASSES[statusOf('yue2')]">{{ t(STATUS_LABEL_KEYS[statusOf('yue2')]) }}</span>
              </template>
            </span>
            <span class="mt-0.5 hidden text-xs leading-4 font-normal whitespace-nowrap text-text-dim xl:block">{{ t('header.desc.yue') }}</span>
          </span>
          <span v-if="route.name === MODEL_ROUTES.yue2" class="accent-gradient absolute inset-x-3 bottom-0 h-0.5 rounded-full" aria-hidden="true"></span>
        </button>

        <span class="mx-2 h-8 w-px shrink-0 self-center bg-border" aria-hidden="true"></span>

        <router-link
          to="/editor"
          class="relative flex shrink-0 items-center gap-2.5 px-3.5 transition-colors"
          :class="onEditor ? 'text-text' : 'text-text-dim hover:text-text'"
          :title="t('header.desc.editor')"
          :aria-current="onEditor ? 'page' : undefined"
        >
          <TimelineIcon class="h-[18px] w-[18px] shrink-0" :class="onEditor && 'text-accent1'" />
          <span class="flex flex-col">
            <span class="text-[15px] leading-5 whitespace-nowrap" :class="onEditor ? 'font-semibold' : 'font-medium'">{{ t('header.editor') }}</span>
            <span class="mt-0.5 hidden text-xs leading-4 whitespace-nowrap text-text-dim xl:block">{{ t('header.desc.editor') }}</span>
          </span>
          <span v-if="onEditor" class="accent-gradient absolute inset-x-3 bottom-0 h-0.5 rounded-full" aria-hidden="true"></span>
        </router-link>
      </nav>

      <div class="ml-auto flex shrink-0 items-center gap-1 self-center lg:ml-0 lg:justify-self-end">
        <!-- RAM above video memory; a click opens the details and the button that unloads the model -->
        <ResourceMeters stacked class="mr-3 hidden lg:block" />
        <button
          type="button"
          class="h-9 rounded-lg px-2.5 text-xs font-semibold text-text-dim transition-colors hover:bg-panel-2 hover:text-text"
          :title="t('header.language')"
          @click="toggleLocale"
        >
          {{ locale === 'ru' ? 'EN' : 'RU' }}
        </button>
        <button
          type="button"
          :title="t('header.help')"
          :aria-label="t('header.help')"
          class="flex h-9 w-9 items-center justify-center rounded-lg text-text-dim transition-colors hover:bg-panel-2 hover:text-text"
          @click="helpOpen = true"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M9.5 9a2.5 2.5 0 1 1 3.4 2.33c-.77.32-1.4.98-1.4 1.92V14" />
            <circle cx="12" cy="17.5" r=".8" fill="currentColor" stroke="none" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </button>
      </div>
    </div>
    <p v-if="orchestrator.switchError" class="border-t border-status-failed/30 bg-status-failed/10 px-4 py-2 text-xs whitespace-pre-line text-status-failed sm:px-6">
      {{ orchestrator.switchError }}
    </p>

    <AppHelpModal :open="helpOpen" @close="helpOpen = false" @open-guide="openGuide" />
    <EditorHelpModal :show="guide === 'editor'" @close="guide = null" @open-guide="guide = 'arranger'" @open-hotkeys="guide = 'hotkeys'" />
    <EditorHotkeysModal :show="guide === 'hotkeys'" @close="guide = null" />
    <AiArrangerGuide :open="guide === 'arranger'" @close="guide = null" />
  </header>
</template>
