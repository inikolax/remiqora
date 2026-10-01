<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { DatePreset, SortOrder } from '../../composables/useDateFilterSort'

const { t } = useI18n()

const props = defineProps<{
  sortOrder: SortOrder
  dateFrom: string
  dateTo: string
  isFiltered: boolean
  visibleCount: number
  totalCount: number
  activePreset?: DatePreset | null
}>()

const emit = defineEmits<{
  'update:sortOrder': [value: SortOrder]
  'update:dateFrom': [value: string]
  'update:dateTo': [value: string]
  preset: [value: DatePreset]
  reset: []
}>()

const PRESETS: { value: DatePreset; labelKey: string }[] = [
  { value: 'today', labelKey: 'filterSort.today' },
  { value: '7d', labelKey: 'filterSort.days7' },
  { value: '30d', labelKey: 'filterSort.days30' },
  { value: 'all', labelKey: 'filterSort.all' },
]
</script>

<template>
  <div class="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border bg-panel-2/50 px-3 py-2 text-xs">
    <div class="flex items-center gap-1 rounded-md bg-panel-2 p-0.5">
      <button
        type="button"
        class="rounded px-2 py-1"
        :class="sortOrder === 'newest' ? 'accent-gradient text-white' : 'text-text-dim'"
        @click="emit('update:sortOrder', 'newest')"
      >
        {{ t('filterSort.newest') }}
      </button>
      <button
        type="button"
        class="rounded px-2 py-1"
        :class="sortOrder === 'oldest' ? 'accent-gradient text-white' : 'text-text-dim'"
        @click="emit('update:sortOrder', 'oldest')"
      >
        {{ t('filterSort.oldest') }}
      </button>
    </div>

    <div class="flex items-center gap-1.5">
      <input
        type="date"
        :value="dateFrom"
        :aria-label="t('filterSort.from')"
        :title="t('filterSort.from')"
        class="rounded-md border border-border bg-panel-2 px-1.5 py-1 text-text"
        @change="emit('update:dateFrom', ($event.target as HTMLInputElement).value)"
      />
      <span class="text-text-dim">—</span>
      <input
        type="date"
        :value="dateTo"
        :aria-label="t('filterSort.to')"
        :title="t('filterSort.to')"
        class="rounded-md border border-border bg-panel-2 px-1.5 py-1 text-text"
        @change="emit('update:dateTo', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <div class="flex items-center gap-1">
      <button
        v-for="p in PRESETS"
        :key="p.value"
        type="button"
        class="rounded-full border px-2 py-1 transition-colors"
        :class="activePreset === p.value
          ? 'border-accent1 bg-accent1/10 text-accent1'
          : 'border-border text-text-dim hover:border-accent1/60 hover:text-text'"
        @click="emit('preset', p.value)"
      >
        {{ t(p.labelKey) }}
      </button>
    </div>

    <div v-if="isFiltered" class="ml-auto flex items-center gap-2 text-text-dim">
      <span>{{ t('filterSort.shownOf', { shown: visibleCount, total: totalCount }) }}</span>
      <button type="button" class="py-1 text-accent1 hover:underline" @click="emit('reset')">{{ t('filterSort.reset') }}</button>
    </div>
  </div>
</template>
