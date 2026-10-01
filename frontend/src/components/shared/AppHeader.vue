<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useOrchestratorStore } from '../../stores/orchestrator'
import { MODEL_LABELS, MODEL_ROUTES, useModelSwitch } from '../../composables/useModelSwitch'
import { setLocale, currentLocale, type LocaleCode } from '../../i18n'
import type { ModelId, ModelRuntimeStatus } from '../../types'
import HelpModal from './HelpModal.vue'

const orchestrator = useOrchestratorStore()
const route = useRoute()
const { selectModel } = useModelSwitch()
const { t, locale } = useI18n()
const helpOpen = ref(false)
const HELP_SECTIONS = ['what', 'engines', 'ace', 'yue', 'lora', 'stems', 'editor', 'library', 'local'] as const

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
  })
  observer.observe(headerEl.value)
})
onUnmounted(() => observer?.disconnect())

const MODEL_IDS: ModelId[] = ['ace_step', 'yue2']

function statusOf(id: ModelId): ModelRuntimeStatus {
  return orchestrator.statuses[id]?.status ?? 'stopped'
}

const LED_CLASSES: Record<ModelRuntimeStatus, string> = {
  stopped: 'bg-gray-500',
  starting: 'bg-status-queued animate-pulse',
  running: 'bg-status-done',
  stopping: 'bg-status-queued animate-pulse',
  error: 'bg-status-failed',
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
    <div class="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
      <!-- the mark is as tall as the two lines next to it (24 + 16 px); the R is drawn, not set in a
           font - an SVG <text> falls back to a different face and looks uneven -->
      <router-link to="/" class="flex items-center gap-2.5 text-text">
        <span class="accent-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md shadow-accent1/20">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M7 19V5h5.5a3.75 3.75 0 0 1 0 7.5H7M12.5 12.5 17 19" />
          </svg>
        </span>
        <span class="flex flex-col">
          <span class="text-lg leading-6 font-semibold">Remiqora</span>
          <!-- 12px, not 10: at 10px grey on dark Windows' smoothing made it look blurred -->
          <span class="text-xs leading-4 font-medium tracking-wide text-text/70">{{ t('header.tagline') }}</span>
        </span>
      </router-link>

      <div class="ml-auto flex items-center gap-2 sm:order-last sm:ml-0">
        <button
          type="button"
          class="min-h-9 rounded-lg border border-border bg-panel-2 px-3 py-2 text-xs font-semibold text-text-dim hover:text-text"
          @click="toggleLocale"
        >
          {{ locale === 'ru' ? 'EN' : 'RU' }}
        </button>
        <button
          type="button"
          :title="t('header.help')"
          :aria-label="t('header.help')"
          class="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-panel-2 text-text-dim hover:border-accent1/60 hover:text-text"
          @click="helpOpen = true"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M9.5 9a2.5 2.5 0 1 1 3.4 2.33c-.77.32-1.4.98-1.4 1.92V14" />
            <circle cx="12" cy="17.5" r=".8" fill="currentColor" stroke="none" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </button>
      </div>

      <nav class="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
        <router-link
          to="/editor"
          class="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
          :class="route.path.startsWith('/editor') ? 'border-accent1/60 bg-panel text-text' : 'border-border bg-panel-2 text-text-dim hover:text-text'"
        >
          {{ t('header.editor') }}
        </router-link>
        <router-link
          v-if="statusOf('ace_step') === 'running'"
          to="/ace-step/lora"
          class="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
          :class="route.path.startsWith('/ace-step/lora') ? 'border-accent1/60 bg-panel text-text' : 'border-border bg-panel-2 text-text-dim hover:text-text'"
        >
          {{ t('header.lora') }}
        </router-link>
        <button
          v-for="id in MODEL_IDS"
          :key="id"
          type="button"
          class="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
          :title="t(STATUS_LABEL_KEYS[statusOf(id)])"
          :class="route.name === MODEL_ROUTES[id] ? 'border-accent1/60 bg-panel text-text' : 'border-border bg-panel-2 text-text-dim hover:text-text'"
          @click="onSelect(id)"
        >
          <span class="h-2 w-2 rounded-full" :class="LED_CLASSES[statusOf(id)]"></span>
          <span>{{ MODEL_LABELS[id] }}</span>
          <span class="hidden text-xs text-text-dim sm:inline">{{ t(STATUS_LABEL_KEYS[statusOf(id)]) }}</span>
        </button>
      </nav>
    </div>
    <p v-if="orchestrator.switchError" class="border-t border-status-failed/30 bg-status-failed/10 px-4 py-2 text-xs whitespace-pre-line text-status-failed sm:px-6">
      {{ orchestrator.switchError }}
    </p>

    <HelpModal :open="helpOpen" :title="t('header.helpTitle')" @close="helpOpen = false">
      <section v-for="id in HELP_SECTIONS" :key="id">
        <h4 class="mb-1 text-[0.95rem] font-semibold text-text">{{ t(`header.helpSections.${id}.title`) }}</h4>
        <p>{{ t(`header.helpSections.${id}.text`) }}</p>
      </section>
    </HelpModal>
  </header>
</template>
