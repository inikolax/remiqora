<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLocale, LOCALES, type LocaleCode } from '../../i18n'

/**
 * The interface languages as a listbox, each by its own name, the current one checked. It takes the focus when it
 * appears; up and down walk it, Home and End jump to the ends, Enter or Space picks. Escape is the popup's business
 * (useDismiss there gives the focus back to its trigger). Used by the language button and by the phone's more-menu.
 */
const emit = defineEmits<{ done: [] }>()
const { t, locale } = useI18n()
const uid = useId()
const listEl = ref<HTMLElement | null>(null)
const currentIndex = computed(() => Math.max(0, LOCALES.findIndex((l) => l.code === locale.value)))
const active = ref(currentIndex.value)
const optionId = (i: number) => `${uid}-opt-${i}`

function show(i: number) {
  active.value = i
  void nextTick(() => document.getElementById(optionId(i))?.scrollIntoView({ block: 'nearest' }))
}
onMounted(() => {
  listEl.value?.focus()
  show(active.value)
})

async function pick(code: LocaleCode) {
  if (code !== locale.value) {
    await setLocale(code)
    locale.value = code
  }
  emit('done')
}
function onKey(e: KeyboardEvent) {
  const n = LOCALES.length
  if (e.key === 'ArrowDown') show((active.value + 1) % n)
  else if (e.key === 'ArrowUp') show((active.value + n - 1) % n)
  else if (e.key === 'Home') show(0)
  else if (e.key === 'End') show(n - 1)
  else if (e.key === 'Enter' || e.key === ' ') void pick(LOCALES[active.value]!.code)
  else return
  e.preventDefault()
}
</script>

<template>
  <ul
    ref="listEl"
    role="listbox"
    tabindex="0"
    :aria-label="t('header.language')"
    :aria-activedescendant="optionId(active)"
    class="max-h-[min(22rem,60dvh)] overflow-y-auto overscroll-contain rounded-lg p-1 outline-none focus-visible:ring-2 focus-visible:ring-accent1/60"
    @keydown="onKey"
  >
    <li
      v-for="(l, i) in LOCALES"
      :id="optionId(i)"
      :key="l.code"
      role="option"
      :aria-selected="l.code === locale"
      class="flex min-h-8 cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-[13px] text-text"
      :class="i === active ? 'bg-accent1/15' : 'hover:bg-panel'"
      @click="pick(l.code)"
      @pointermove="active = i"
    >
      <!-- the check keeps its place on every row, so the names line up -->
      <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0 text-accent1" :class="l.code !== locale && 'invisible'" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m5 12 5 5 9-10" />
      </svg>
      <!-- bdi: an Arabic or Hebrew name keeps its own direction inside a left-to-right list (and the other way round)
           while the rows stay aligned to the page's start -->
      <span class="min-w-0 flex-1 truncate" :class="l.code === locale && 'font-semibold'"><bdi :lang="l.code">{{ l.name }}</bdi></span>
    </li>
  </ul>
</template>
