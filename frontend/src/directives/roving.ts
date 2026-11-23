import type { Directive } from 'vue'

/**
 * `v-roving` on a radiogroup or a tablist built from buttons: the group is one Tab stop and the arrow keys move
 * inside it, as the roles promise to a keyboard and a screen reader. The chosen item (aria-checked / aria-selected)
 * holds the tab stop; arrows, Home and End move the focus and choose (a click), mirrored in right-to-left pages.
 */
const ITEMS = '[role="radio"], [role="tab"]'
const state = new WeakMap<HTMLElement, { onKey: (e: KeyboardEvent) => void; observer: MutationObserver }>()

function items(el: HTMLElement): HTMLElement[] {
  return [...el.querySelectorAll<HTMLElement>(ITEMS)].filter((x) => !(x as HTMLButtonElement).disabled && x.offsetParent !== null)
}
const chosen = (x: HTMLElement): boolean => x.getAttribute('aria-checked') === 'true' || x.getAttribute('aria-selected') === 'true'

function sync(el: HTMLElement): void {
  const all = items(el)
  if (!all.length) return
  const stop = all.find(chosen) ?? all[0]
  for (const x of all) {
    const want = x === stop ? '0' : '-1'
    if (x.getAttribute('tabindex') !== want) x.setAttribute('tabindex', want)
  }
}

export const vRoving: Directive<HTMLElement> = {
  mounted(el) {
    const onKey = (e: KeyboardEvent): void => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(ITEMS)
      if (!target || !el.contains(target) || e.altKey || e.ctrlKey || e.metaKey) return
      const all = items(el)
      const at = all.indexOf(target)
      if (at < 0) return
      const rtl = getComputedStyle(el).direction === 'rtl'
      const next = e.key === 'ArrowDown' || e.key === (rtl ? 'ArrowLeft' : 'ArrowRight') ? at + 1
        : e.key === 'ArrowUp' || e.key === (rtl ? 'ArrowRight' : 'ArrowLeft') ? at - 1
          : e.key === 'Home' ? 0 : e.key === 'End' ? all.length - 1 : null
      if (next === null) return
      e.preventDefault()
      const to = all[(next + all.length) % all.length]
      to.focus()
      to.click()
    }
    el.addEventListener('keydown', onKey)
    // the choice also changes from outside (a preset, a reuse): the tab stop follows it
    const observer = new MutationObserver(() => sync(el))
    observer.observe(el, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-checked', 'aria-selected', 'disabled'] })
    state.set(el, { onKey, observer })
    sync(el)
  },
  updated: sync,
  unmounted(el) {
    const s = state.get(el)
    if (!s) return
    el.removeEventListener('keydown', s.onKey)
    s.observer.disconnect()
    state.delete(el)
  },
}

declare module 'vue' {
  interface GlobalDirectives {
    vRoving: typeof vRoving
  }
}
