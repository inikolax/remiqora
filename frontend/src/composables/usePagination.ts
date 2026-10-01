import { computed, ref } from 'vue'

export const PAGE_SIZES = [5, 10, 25, 50] as const
export const DEFAULT_PAGE_SIZE = 5
const STORAGE_KEY = 'remiqora.pageSize'

function loadPageSize(): number {
  try {
    const saved = Number(localStorage.getItem(STORAGE_KEY))
    if ((PAGE_SIZES as readonly number[]).includes(saved)) return saved
  } catch {
    // storage unavailable: use the default
  }
  return DEFAULT_PAGE_SIZE
}

/**
 * Client-side pagination of a reactive list. The page size (5 by default) is remembered
 * between sessions; the current page is clamped when the list shrinks, so deleting the last
 * card of the last page never leaves an empty page behind.
 */
export function usePagination<T>(items: () => T[]) {
  const pageSize = ref(loadPageSize())
  const requestedPage = ref(1)

  const total = computed(() => items().length)
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
  const page = computed(() => Math.min(Math.max(1, requestedPage.value), totalPages.value))
  const pageItems = computed(() => items().slice((page.value - 1) * pageSize.value, page.value * pageSize.value))
  const rangeFrom = computed(() => (total.value === 0 ? 0 : (page.value - 1) * pageSize.value + 1))
  const rangeTo = computed(() => Math.min(total.value, page.value * pageSize.value))

  function setPage(n: number) {
    requestedPage.value = Math.min(Math.max(1, Math.floor(n) || 1), totalPages.value)
  }

  function setPageSize(size: number) {
    pageSize.value = size
    requestedPage.value = 1
    try {
      localStorage.setItem(STORAGE_KEY, String(size))
    } catch {
      // not persisted - just this session
    }
  }

  function resetPage() {
    requestedPage.value = 1
  }

  return { pageSize, page, totalPages, total, pageItems, rangeFrom, rangeTo, setPage, setPageSize, resetPage }
}
