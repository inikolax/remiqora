<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { LOCALES } from '../../i18n'
import { useDismiss } from '../../composables/useDismiss'
import LanguageList from './LanguageList.vue'

/**
 * The header's tools on a narrow window, behind one button: the language (the same list as the language button),
 * Models and settings, the help. A menu: up and down walk it, Home and End jump to the ends, Escape closes it and
 * gives the focus back to the button.
 */
const emit = defineEmits<{ help: [] }>()
const { t, locale } = useI18n()
const router = useRouter()
const uid = useId()
const open = ref(false)
/** The menu, or the language list in its place. */
const view = ref<'menu' | 'language'>('menu')
const trigger = ref<HTMLButtonElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const close = () => { open.value = false }
useDismiss(open, () => [trigger.value, panel.value], close, { returnTo: () => trigger.value })

const currentName = computed(() => LOCALES.find((l) => l.code === locale.value)?.name ?? '')

watch(open, async (v) => {
  if (!v) return
  view.value = 'menu'
  await nextTick()
  panel.value?.querySelector<HTMLElement>('[role=menuitem]')?.focus()
})

function onKey(e: KeyboardEvent): void {
  if (view.value !== 'menu' || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return
  e.preventDefault()
  const items = [...(panel.value?.querySelectorAll<HTMLElement>('[role=menuitem]') ?? [])]
  if (!items.length) return
  const i = items.indexOf(document.activeElement as HTMLElement)
  const to = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1
    : (i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length
  items[to]?.focus()
}

function back() {
  close()
  trigger.value?.focus()
}
function goModels() {
  close()
  void router.push('/models')
}
function openHelp() {
  close()
  emit('help')
}
const ITEM = 'flex min-h-9 w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-start text-[13px] text-text hover:bg-accent1/15 focus:bg-accent1/15 focus:outline-none'
</script>

<template>
  <div class="relative">
    <button
      ref="trigger"
      type="button"
      class="flex h-9 w-9 items-center justify-center rounded-lg text-text-dim transition-colors hover:bg-panel-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1"
      :class="open && 'bg-panel-2 text-text'"
      :aria-label="t('header.more')"
      :title="t('header.more')"
      aria-haspopup="menu"
      :aria-expanded="open"
      :aria-controls="open ? `${uid}-menu` : undefined"
      @click="open = !open"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="5" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="12" cy="19" r="1.8" />
      </svg>
    </button>
    <!-- fixed under the header on a phone (the header's backdrop blur makes it the containing block), so the menu
         never runs off the window's start edge -->
    <div
      v-if="open"
      :id="`${uid}-menu`"
      ref="panel"
      class="fixed inset-x-4 top-[calc(var(--header-h,4rem)+0.25rem)] z-50 rounded-xl border border-border bg-panel-2 shadow-2xl sm:absolute sm:inset-x-auto sm:end-0 sm:top-full sm:mt-2 sm:w-64"
      @keydown="onKey"
    >
      <div v-if="view === 'menu'" role="menu" :aria-label="t('header.more')" class="p-1">
        <button type="button" role="menuitem" tabindex="-1" aria-haspopup="listbox" :class="ITEM" @click="view = 'language'">
          <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0 text-text-dim" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
          </svg>
          <span class="min-w-0 flex-1">{{ t('header.language') }}</span>
          <bdi class="shrink-0 truncate text-text-dim">{{ currentName }}</bdi>
        </button>
        <button type="button" role="menuitem" tabindex="-1" :class="ITEM" @click="goModels">
          <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0 text-text-dim" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {{ t('header.models') }}
        </button>
        <button type="button" role="menuitem" tabindex="-1" :class="ITEM" @click="openHelp">
          <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0 text-text-dim" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M9.5 9a2.5 2.5 0 1 1 3.4 2.33c-.77.32-1.4.98-1.4 1.92V14" />
            <circle cx="12" cy="17.5" r=".8" fill="currentColor" stroke="none" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          {{ t('header.help') }}
        </button>
      </div>
      <LanguageList v-else @done="back" />
    </div>
  </div>
</template>
