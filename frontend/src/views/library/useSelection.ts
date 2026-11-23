import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

/** A checkbox's state: on, off, or some of what it stands for. */
export type CheckState = boolean | 'mixed'

/**
 * The tracks ticked for a bulk action. A row stands for one track (a take) or several (a folded song: all its
 * takes). Shift+click ticks the range from the last ticked row across the rows on show; Escape clears it; ids that
 * leave the list (another search, a deleted track) drop out on their own.
 *
 * `all` is every track that passes the filter, the search and the period (not just the page on show): what
 * "select all" ticks and what the selection is trimmed to. `ordered` is the ids of the rows on show, in their
 * order, for the Shift range.
 */
export function useSelection(all: () => number[], ordered: () => number[]) {
  const ids = ref<Set<number>>(new Set())
  /** Where the last plain click was: a Shift+click ticks from here. */
  let anchor: number | null = null

  const count = computed(() => ids.value.size)
  const any = computed(() => ids.value.size > 0)
  const list = computed(() => [...ids.value])
  const has = (id: number): boolean => ids.value.has(id)

  function set(next: Set<number>): void {
    ids.value = next
  }
  /** On when every one of `rowIds` is ticked, mixed when some are. */
  function stateOf(rowIds: number[]): CheckState {
    if (!rowIds.length) return false
    const n = rowIds.reduce((k, id) => k + Number(ids.value.has(id)), 0)
    return n === 0 ? false : n === rowIds.length ? true : 'mixed'
  }

  /** A click on a row's box: flips the row, or with Shift ticks everything from the anchor to it. */
  function toggle(rowIds: number[], shift = false): void {
    if (!rowIds.length) return
    const next = new Set(ids.value)
    const order = ordered()
    const from = anchor == null ? -1 : order.indexOf(anchor)
    if (shift && from !== -1) {
      const at = rowIds.map((id) => order.indexOf(id)).filter((i) => i !== -1)
      if (at.length) {
        const lo = Math.min(from, ...at)
        const hi = Math.max(from, ...at)
        for (const id of order.slice(lo, hi + 1)) next.add(id)
        for (const id of rowIds) next.add(id)
        set(next)
        return
      }
    }
    const on = stateOf(rowIds) !== true
    for (const id of rowIds) {
      if (on) next.add(id)
      else next.delete(id)
    }
    anchor = rowIds[0]
    set(next)
  }

  const allState = computed<CheckState>(() => stateOf(all()))
  function toggleAll(): void {
    set(allState.value === true ? new Set() : new Set(all()))
  }
  function clear(): void {
    if (ids.value.size) set(new Set())
    anchor = null
  }

  // the list changed under the selection: keep only what is still there
  watch(all, (now) => {
    if (!ids.value.size) return
    const keep = new Set(now)
    const next = new Set([...ids.value].filter((id) => keep.has(id)))
    if (next.size !== ids.value.size) set(next)
  })

  // Escape clears it, unless the key belongs to a field or a menu (those close themselves)
  const onKey = (e: KeyboardEvent): void => {
    if (e.key !== 'Escape' || !ids.value.size || e.defaultPrevented) return
    const target = e.target as HTMLElement | null
    if (target?.closest('input, textarea, select, [contenteditable="true"], [role="menu"], [role="dialog"]')) return
    clear()
  }
  onMounted(() => document.addEventListener('keydown', onKey))
  onBeforeUnmount(() => document.removeEventListener('keydown', onKey))

  return { ids, list, count, any, has, stateOf, toggle, allState, toggleAll, clear }
}

export type Selection = ReturnType<typeof useSelection>
