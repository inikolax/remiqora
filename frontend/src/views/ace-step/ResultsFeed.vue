<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAceStepStore } from '../../stores/aceStep'
import { useDateFilterSort } from '../../composables/useDateFilterSort'
import { usePagination } from '../../composables/usePagination'
import FilterSortBar from '../../components/shared/FilterSortBar.vue'
import PaginationBar from '../../components/shared/PaginationBar.vue'
import JobCard from './JobCard.vue'

const store = useAceStepStore()
const { t } = useI18n()
const hasActive = computed(() => store.activeJobs.length > 0)

const { sortOrder, dateFrom, dateTo, activePreset, isFiltered, filteredSorted, applyPreset, reset } = useDateFilterSort(() => store.jobs)

const { pageSize, page, totalPages, total, pageItems, rangeFrom, rangeTo, setPage, setPageSize, resetPage } = usePagination(() => filteredSorted.value)
// A different sort or period is a different list: start from its first page.
watch([sortOrder, dateFrom, dateTo], resetPage)

const barProps = computed(() => ({
  page: page.value,
  totalPages: totalPages.value,
  pageSize: pageSize.value,
  total: total.value,
  rangeFrom: rangeFrom.value,
  rangeTo: rangeTo.value,
}))

const feedTop = ref<HTMLElement | null>(null)
function goToPage(n: number) {
  setPage(n)
  // The cards are tall: bring the top of the list back into view after turning the page.
  nextTick(() => feedTop.value?.scrollIntoView({ block: 'start', behavior: 'smooth' }))
}

async function stopAll() {
  await store.cancelAll()
}
</script>

<template>
  <div class="space-y-3">
    <div ref="feedTop" class="flex items-center justify-between" style="scroll-margin-top: calc(var(--header-h, 64px) + 12px)">
      <h2 class="text-lg font-semibold text-text">{{ t('feed.yourTracks') }}</h2>
      <button v-if="hasActive" type="button" class="rounded-lg border border-status-failed/40 px-3 py-1.5 text-xs text-status-failed hover:bg-status-failed/10" @click="stopAll">
        {{ t('feed.stopAll') }}
      </button>
    </div>

    <FilterSortBar
      v-if="store.jobs.length > 0"
      v-model:sort-order="sortOrder"
      v-model:date-from="dateFrom"
      v-model:date-to="dateTo"
      :is-filtered="isFiltered"
      :visible-count="filteredSorted.length"
      :total-count="store.jobs.length"
      :active-preset="activePreset"
      @preset="applyPreset"
      @reset="reset"
    />

    <!-- Also above the list, so a long page does not have to be scrolled to its end to turn it -->
    <PaginationBar v-bind="barProps" @update:page="goToPage" @update:page-size="setPageSize" />

    <!-- Skeleton loaders while history is loading -->
    <template v-if="!store.historyLoaded">
      <div v-for="i in 3" :key="'skel-' + i" class="animate-pulse rounded-xl border border-border bg-panel p-4 space-y-3">
        <div class="flex items-center justify-between">
          <div class="h-4 w-1/3 rounded bg-panel-2"></div>
          <div class="h-5 w-16 rounded-full bg-panel-2"></div>
        </div>
        <div class="h-3 w-2/3 rounded bg-panel-2"></div>
        <div class="h-10 w-full rounded-lg bg-panel-2"></div>
      </div>
    </template>

    <p v-else-if="store.jobs.length === 0" class="rounded-xl border border-dashed border-border p-8 text-center text-sm text-text-dim">{{ t('feed.emptyHint') }}</p>
    <p v-else-if="filteredSorted.length === 0" class="rounded-xl border border-dashed border-border p-8 text-center text-sm text-text-dim">{{ t('feed.noneInPeriod') }}</p>
    <JobCard v-for="job in pageItems" :key="job.id" :job="job" />
    <PaginationBar v-bind="barProps" @update:page="goToPage" @update:page-size="setPageSize" />
  </div>
</template>
