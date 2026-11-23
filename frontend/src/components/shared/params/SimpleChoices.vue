<script setup lang="ts">
import { useI18n } from 'vue-i18n'

/** The simple side of a tuning tab: a few plain choices, a row each, with a line saying what the choice does. */
export interface SimpleChoice {
  id: string
  label: string
  hint: string
  options: { id: string; label: string }[]
  /** The option the values match now, or null when they were set by hand. */
  active: string | null
  pick: (id: string) => void
}
defineProps<{ rows: SimpleChoice[] }>()
const { t } = useI18n()
</script>

<template>
  <div class="space-y-4">
    <div v-for="row in rows" :key="row.id" class="space-y-1">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="text-[13px] font-medium text-text">{{ row.label }}</span>
        <!-- v-roving: one Tab stop, the arrows move between the choices -->
        <div v-roving class="inline-flex overflow-hidden rounded-lg border border-border text-xs" role="radiogroup" :aria-label="row.label">
          <button
            v-for="o in row.options" :key="o.id" type="button" role="radio" :aria-checked="row.active === o.id"
            class="px-2.5 py-1.5 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent1" :class="row.active === o.id ? 'bg-accent1/20 font-medium text-text' : 'text-text-dim hover:bg-panel-2 hover:text-text'"
            @click="row.pick(o.id)"
          >{{ o.label }}</button>
        </div>
      </div>
      <p class="text-xs text-text-dim">{{ row.hint }}<template v-if="row.active === null">{{ ' ' + t('yueGen.perf.manualNow') }}</template></p>
    </div>
  </div>
</template>
