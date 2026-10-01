<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { PAGE_SIZES } from '../../composables/usePagination'

const { t } = useI18n()

const props = defineProps<{
  page: number
  totalPages: number
  pageSize: number
  total: number
  rangeFrom: number
  rangeTo: number
}>()

const emit = defineEmits<{
  'update:page': [value: number]
  'update:pageSize': [value: number]
}>()

// Not worth showing while everything fits on the smallest page.
const visible = computed(() => props.total > PAGE_SIZES[0])

/** 1 … 4 5 [6] 7 8 … 20: first, last, and a window around the current page. null = an ellipsis. */
const items = computed<(number | null)[]>(() => {
  const last = props.totalPages
  const keep = new Set<number>([1, last])
  for (let n = props.page - 1; n <= props.page + 1; n++) if (n >= 1 && n <= last) keep.add(n)
  const sorted = [...keep].sort((a, b) => a - b)
  const out: (number | null)[] = []
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push(sorted[i - 1] + 1 === n - 1 ? n - 1 : null)
    out.push(n)
  })
  return out
})

function onSize(e: Event) {
  emit('update:pageSize', Number((e.target as HTMLSelectElement).value))
}
</script>

<template>
  <nav v-if="visible" :aria-label="t('pagination.label')" class="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border bg-panel-2/50 px-3 py-2 text-xs">
    <span class="text-text-dim">{{ t('pagination.range', { from: rangeFrom, to: rangeTo, total }) }}</span>

    <div class="ml-auto flex flex-wrap items-center gap-1">
      <button
        type="button"
        class="rounded-md border border-border px-2 py-1 text-text-dim hover:border-accent1/60 hover:text-text disabled:cursor-default disabled:opacity-40 disabled:hover:border-border disabled:hover:text-text-dim"
        :disabled="page <= 1"
        :aria-label="t('pagination.prev')"
        :title="t('pagination.prev')"
        @click="emit('update:page', page - 1)"
      >
        ‹
      </button>
      <template v-for="(n, i) in items" :key="n ?? 'gap-' + i">
        <span v-if="n === null" class="px-1 text-text-dim" aria-hidden="true">…</span>
        <button
          v-else
          type="button"
          class="min-w-7 rounded-md border px-2 py-1 transition-colors"
          :class="n === page ? 'border-accent1 bg-accent1/10 text-accent1' : 'border-border text-text-dim hover:border-accent1/60 hover:text-text'"
          :aria-current="n === page ? 'page' : undefined"
          :aria-label="t('pagination.page', { n })"
          @click="emit('update:page', n)"
        >
          {{ n }}
        </button>
      </template>
      <button
        type="button"
        class="rounded-md border border-border px-2 py-1 text-text-dim hover:border-accent1/60 hover:text-text disabled:cursor-default disabled:opacity-40 disabled:hover:border-border disabled:hover:text-text-dim"
        :disabled="page >= totalPages"
        :aria-label="t('pagination.next')"
        :title="t('pagination.next')"
        @click="emit('update:page', page + 1)"
      >
        ›
      </button>
    </div>

    <label class="flex items-center gap-1.5 text-text-dim">
      {{ t('pagination.perPage') }}
      <select :value="pageSize" class="rounded-md border border-border bg-panel-2 px-1.5 py-1 text-text" @change="onSize">
        <option v-for="s in PAGE_SIZES" :key="s" :value="s">{{ s }}</option>
      </select>
    </label>
  </nav>
</template>
