<script setup lang="ts">
// The help button next to a field or a section title: the same glyph as the header's help button,
// only quieter (dim until hovered), instead of the word "Help" repeated at every field.
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
defineEmits<{ click: [] }>()
</script>

<template>
  <button type="button" class="shrink-0 text-text-dim hover:text-accent1" :title="t('common.help')" :aria-label="t('common.help')" @click="$emit('click')">
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M9.5 9a2.5 2.5 0 1 1 3.4 2.33c-.77.32-1.4.98-1.4 1.92V14" />
      <circle cx="12" cy="17.5" r=".8" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  </button>
</template>
