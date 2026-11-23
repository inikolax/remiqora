<script setup lang="ts">
// The help button next to a field or a section title: the same glyph as the header's help button,
// only quieter (dim until hovered), instead of the word "Help" repeated at every field.
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
/** What the help is about ("Style"): the button is then read as "Help: Style", not one of many "Help"s. */
const props = defineProps<{ topic?: string }>()
defineEmits<{ click: [] }>()
</script>

<template>
  <!-- a 24px target around the 15px glyph; the negative margin keeps the row's spacing as it was -->
  <button
    type="button"
    class="-m-[4.5px] inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-text-dim hover:text-accent1 focus-visible:text-accent1 focus-visible:outline-2 focus-visible:outline-accent1"
    :title="t('common.help')" :aria-label="props.topic ? `${t('common.help')}: ${props.topic}` : t('common.help')" @click="$emit('click')"
  >
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M9.5 9a2.5 2.5 0 1 1 3.4 2.33c-.77.32-1.4.98-1.4 1.92V14" />
      <circle cx="12" cy="17.5" r=".8" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  </button>
</template>
