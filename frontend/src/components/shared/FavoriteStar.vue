<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMarksStore } from '../../stores/marks'

/** The star of a saved track: lit for a favourite, a click flips it. A track not saved yet has none. */
const props = defineProps<{ trackId: number | null | undefined; bordered?: boolean }>()
const { t } = useI18n()
const marks = useMarksStore()
const on = computed(() => marks.isFavorite(props.trackId))
function toggle(): void {
  if (props.trackId != null) void marks.toggleFavorite(props.trackId)
}
</script>

<template>
  <button
    v-if="trackId != null" type="button" :aria-pressed="on"
    class="flex shrink-0 items-center justify-center rounded-lg transition-colors"
    :class="[bordered ? 'h-9 w-9 border border-border hover:bg-panel-2' : 'h-8 w-8 hover:bg-panel-2', on ? 'text-status-queued' : 'text-text-dim hover:text-text']"
    :title="on ? t('favorite.remove') : t('favorite.add')" :aria-label="on ? t('favorite.remove') : t('favorite.add')"
    @click.stop="toggle"
  >
    <svg viewBox="0 0 24 24" class="h-4 w-4" :fill="on ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z" />
    </svg>
  </button>
</template>
