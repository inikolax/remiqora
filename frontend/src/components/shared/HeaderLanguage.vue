<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { LOCALES } from '../../i18n'
import { useDismiss } from '../../composables/useDismiss'
import LanguageList from './LanguageList.vue'

/** The language in the header: the current language's code on a small button, the list of languages a click away. */
const { t, locale } = useI18n()
const open = ref(false)
const uid = useId()
const trigger = ref<HTMLButtonElement | null>(null)
const panel = ref<HTMLElement | null>(null)
useDismiss(open, () => [trigger.value, panel.value], () => { open.value = false }, { returnTo: () => trigger.value })

const current = computed(() => LOCALES.find((l) => l.code === locale.value) ?? LOCALES[0]!)
/** The code as the button's content: "RU", "DE"; both Chinese ones keep their region, as "ZH-CN" and "ZH-TW". */
const shortCode = computed(() => {
  const base = current.value.code.split('-')[0]!
  return (LOCALES.filter((l) => l.code.startsWith(`${base}-`) || l.code === base).length > 1 ? current.value.code : base).toUpperCase()
})

function done() {
  open.value = false
  trigger.value?.focus()
}
</script>

<template>
  <div class="relative">
    <button
      ref="trigger"
      type="button"
      class="flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-semibold tabular-nums text-text-dim transition-colors hover:bg-panel-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1"
      :class="open && 'bg-panel-2 text-text'"
      :aria-label="t('header.languageCurrent', { name: current.name })"
      :title="t('header.languageCurrent', { name: current.name })"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="open ? `${uid}-list` : undefined"
      @click="open = !open"
    >
      {{ shortCode }}
    </button>
    <div
      v-if="open"
      :id="`${uid}-list`"
      ref="panel"
      class="absolute end-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-panel-2 shadow-2xl"
    >
      <LanguageList @done="done" />
    </div>
  </div>
</template>
