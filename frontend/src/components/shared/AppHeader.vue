<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useOrchestratorStore } from '../../stores/orchestrator'
import AppHelpModal from './AppHelpModal.vue'
import EditorHelpModal from '../editor/EditorHelpModal.vue'
import EditorHotkeysModal from '../editor/EditorHotkeysModal.vue'
import AiArrangerGuide from '../editor/AiArrangerGuide.vue'
import IdeaGuide from '../idea/IdeaGuide.vue'
import ResourceMeters from './ResourceMeters.vue'
import HeaderLanguage from './HeaderLanguage.vue'
import HeaderMore from './HeaderMore.vue'
import TimelineIcon from './icons/TimelineIcon.vue'
import SparklesIcon from './icons/SparklesIcon.vue'
import LibraryIcon from './icons/LibraryIcon.vue'
import NotesHelp from '../score/help/NotesHelp.vue'

const orchestrator = useOrchestratorStore()
const route = useRoute()
const onEditor = computed(() => route.path.startsWith('/editor'))
const onLibrary = computed(() => route.name === 'library')
// Create covers the engines' forms and ACE-Step's LoRA training. Home (with From an idea) is not a section.
const onCreate = computed(() => ['create', 'ace-step-lora'].includes(String(route.name)))
const { t } = useI18n()
const helpOpen = ref(false)
const notesHelpOpen = ref(false)
/** A guide opened from the help: the editor's, its shortcut sheet, the AI arranger's or From an idea's. */
const guide = ref<'editor' | 'hotkeys' | 'arranger' | 'idea' | null>(null)
function openGuide(which: 'editor' | 'arranger' | 'idea' | 'notes') {
  helpOpen.value = false
  // "More about notes": the notes' own guide (the one the note editor opens)
  if (which === 'notes') { notesHelpOpen.value = true; return }
  guide.value = which
}
/** The help closed (Escape, the cross, a click outside): the focus goes back to the "?" that opened it, also when the
 *  dialog's own return missed it (the opener had lost the focus by then). Under md the "?" is in the more-menu. */
const helpBtn = ref<HTMLButtonElement | null>(null)
function closeNotesHelp() {
  notesHelpOpen.value = false
  void nextTick(() => { if (helpBtn.value?.offsetParent) helpBtn.value.focus() })
}
function closeHelp() {
  helpOpen.value = false
  void nextTick(() => { if (helpBtn.value?.offsetParent) helpBtn.value.focus() })
}

// The header's real height as --header-h (57 px with the border, more while the switch error shows under the row), so the sticky
// columns and bars below it know where to stop.
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

/** The sections. On a phone the current one keeps its name and the other two are icons (the name stays for a screen
 *  reader); from sm up all three are named. */
const sections = computed(() => [
  { to: '/create', label: t('header.create'), title: t('header.desc.create'), icon: SparklesIcon, current: onCreate.value },
  { to: '/library', label: t('header.library'), title: t('header.desc.library'), icon: LibraryIcon, current: onLibrary.value },
  { to: '/editor', label: t('header.editor'), title: t('header.desc.editor'), icon: TimelineIcon, current: onEditor.value },
])
const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1'
</script>

<template>
  <header ref="headerEl" class="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur">
    <!-- One row, 56 px, in the same container as a wide page, so the brand and the help line up with the page's
         columns. The brand and the sections on the start side, the status unit and the tools on the end side. As the
         window narrows things drop out rather than wrap: the brand's name (below xl), the memory numbers (below xl),
         the engine's name (below lg), the language, gear and help go behind a more-button (below md), the other
         sections' names (below sm). -->
    <div class="mx-auto flex h-16 w-full max-w-[1920px] items-stretch gap-1 px-4 sm:gap-3 sm:px-6 2xl:px-8">
      <!-- the R is drawn, not set in a font - an SVG <text> falls back to a different face and looks uneven -->
      <router-link
        to="/"
        class="flex shrink-0 items-center gap-3 self-center rounded-lg text-text"
        :class="FOCUS"
        aria-label="Remiqora"
      >
        <span class="accent-gradient flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] shadow-md shadow-accent1/20">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M7 19V5h5.5a3.75 3.75 0 0 1 0 7.5H7M12.5 12.5 17 19" />
          </svg>
        </span>
        <!-- the name over the motto, together as tall as the mark (20 + 16 px); 12px, not smaller: at 10px grey on
             dark Windows' smoothing made it look blurred -->
        <span class="hidden flex-col whitespace-nowrap xl:flex" aria-hidden="true">
          <span class="text-base leading-5 font-semibold">Remiqora</span>
          <span class="text-xs leading-4 font-medium text-text-dim">{{ t('header.tagline') }}</span>
        </span>
      </router-link>

      <!-- The sections, right after the brand. The current one is underlined at the header's bottom edge. LoRA training
           is a tab inside ACE-Step's page; From an idea is on the home page, reached by the brand. -->
      <!-- min-w-0 all the way down: should a long translation not fit, the names are cut short rather than the row
           scrolling sideways -->
      <nav class="flex min-w-0 items-stretch md:ms-2 lg:ms-5" :aria-label="t('header.navLabel')">
        <router-link
          v-for="s in sections"
          :key="s.to"
          :to="s.to"
          class="relative flex w-[4.25rem] shrink-0 flex-col items-center justify-center gap-0.5 rounded-md px-0.5 transition-colors focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-accent1 sm:w-auto sm:min-w-0 sm:shrink sm:flex-row sm:justify-start sm:gap-2 sm:px-2 md:px-3"
          :class="s.current ? 'text-text' : 'text-text-dim hover:text-text'"
          :title="s.title"
          :aria-current="s.current ? 'page' : undefined"
        >
          <!-- a phone: every section is its icon over a small name, all three the same width, nothing cut to "Библиоте…" -->
          <component :is="s.icon" class="h-[18px] w-[18px] shrink-0" :class="s.current && 'text-accent1'" />
          <span
            class="max-w-full truncate text-[10px] leading-3 whitespace-nowrap sm:min-w-0 sm:text-[15px] sm:leading-5"
            :class="s.current ? 'font-semibold' : 'font-medium'"
          >{{ s.label }}</span>
          <span v-if="s.current" class="accent-gradient absolute inset-x-2 bottom-0 h-0.5 rounded-full md:inset-x-3" aria-hidden="true"></span>
        </router-link>
      </nav>

      <div class="ms-auto flex min-w-0 shrink items-center gap-1 sm:gap-1.5">
        <!-- the status unit: what holds the GPU and how full the memory is; a click opens the details -->
        <ResourceMeters class="sm:me-1 md:me-2" />
        <div class="hidden items-center gap-1 md:flex">
          <HeaderLanguage />
          <!-- Models and settings: a settings page, so a gear beside the help rather than a section -->
          <router-link
            to="/models"
            :title="t('header.models')"
            :aria-label="t('header.models')"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-dim transition-colors hover:bg-panel-2 hover:text-text"
            :class="FOCUS"
            active-class="bg-panel-2 text-text"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </router-link>
          <button
            ref="helpBtn"
            type="button"
            :title="t('header.help')"
            :aria-label="t('header.help')"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-dim transition-colors hover:bg-panel-2 hover:text-text"
            :class="FOCUS"
            @click="helpOpen = true"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M9.5 9a2.5 2.5 0 1 1 3.4 2.33c-.77.32-1.4.98-1.4 1.92V14" />
              <circle cx="12" cy="17.5" r=".8" fill="currentColor" stroke="none" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </button>
        </div>
        <!-- narrower than md: the language, Models and the help in one menu -->
        <HeaderMore class="md:hidden" @help="helpOpen = true" />
      </div>
    </div>
    <p v-if="orchestrator.switchError" class="border-t border-status-failed/30 bg-status-failed/10 text-xs whitespace-pre-line text-status-failed">
      <span class="mx-auto block w-full max-w-[1920px] px-4 py-2 sm:px-6 2xl:px-8">{{ orchestrator.switchError }}</span>
    </p>

    <AppHelpModal :open="helpOpen" @close="closeHelp" @open-guide="openGuide" />
    <NotesHelp :open="notesHelpOpen" @close="closeNotesHelp" />
    <EditorHelpModal :show="guide === 'editor'" @close="guide = null" @open-guide="guide = 'arranger'" @open-hotkeys="guide = 'hotkeys'" />
    <EditorHotkeysModal :show="guide === 'hotkeys'" @close="guide = null" />
    <AiArrangerGuide :open="guide === 'arranger'" @close="guide = null" />
    <IdeaGuide :open="guide === 'idea'" @close="guide = null" />
  </header>
</template>
