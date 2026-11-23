import { isRef, onBeforeUnmount, watch } from 'vue'
import type { Ref } from 'vue'

/**
 * What is typed into a form survives a reload and a look at another page: the fields are written to localStorage
 * shortly after a change and read back when the form is set up (before its mount, so parameters put into the form
 * from elsewhere - a reuse, "From an idea" - are applied after the draft and win).
 *
 * `fields` maps a name to a ref or to a reactive object (its own keys are restored one by one). Only names given
 * here are read back, and only values of the same type as the field holds now, so an old or foreign draft cannot
 * put a wrong shape into the form.
 */
export function useFormDraft(key: string, fields: Record<string, Ref<unknown> | Record<string, unknown>>): { clear: () => void } {
  const storeKey = `remiqora.draft.${key}`
  const sameType = (now: unknown, saved: unknown): boolean =>
    saved === null || now === null || now === undefined
      ? saved === null || ['string', 'number', 'boolean'].includes(typeof saved) || Array.isArray(saved)
      : Array.isArray(now) ? Array.isArray(saved) : typeof now === typeof saved

  try {
    const raw = localStorage.getItem(storeKey)
    const saved = raw ? JSON.parse(raw) as Record<string, unknown> : null
    if (saved && typeof saved === 'object') {
      for (const [name, field] of Object.entries(fields)) {
        if (!(name in saved)) continue
        const value = saved[name]
        if (isRef(field)) {
          if (sameType(field.value, value)) field.value = value
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
          for (const k of Object.keys(field)) {
            const v = (value as Record<string, unknown>)[k]
            if (k in (value as object) && sameType(field[k], v)) field[k] = v
          }
        }
      }
    }
  } catch { /* a broken draft or a private window: the form starts empty */ }

  const snapshot = (): Record<string, unknown> =>
    Object.fromEntries(Object.entries(fields).map(([name, field]) => [name, isRef(field) ? field.value : { ...field }]))
  const save = (): void => {
    try { localStorage.setItem(storeKey, JSON.stringify(snapshot())) } catch { /* full or private: nothing to keep */ }
  }
  let timer: ReturnType<typeof setTimeout> | null = null
  const stop = watch(snapshot, () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(save, 400)
  }, { deep: true })
  // a change made in the last moment before leaving the page is still written
  const flush = (): void => { if (timer) { clearTimeout(timer); timer = null; save() } }
  window.addEventListener('pagehide', flush)
  onBeforeUnmount(() => { flush(); stop(); window.removeEventListener('pagehide', flush) })

  return {
    clear() {
      if (timer) { clearTimeout(timer); timer = null }
      try { localStorage.removeItem(storeKey) } catch { /* nothing to remove */ }
    },
  }
}
