import { onBeforeUnmount, watch } from 'vue'
import type { Ref } from 'vue'

export interface DismissOptions {
  /** Where the focus goes back after Escape (the trigger, usually): without it the focus would fall to <body>. */
  returnTo?: () => HTMLElement | null | undefined
}

/**
 * Closes a popup (a menu, a card) on a press outside it and outside its trigger, on Escape, or when the focus
 * leaves it (Tab past its end), while `open` is true. `inside` gives the elements a press or the focus may land on
 * without closing it. Escape also gives the focus back (`returnTo`); a press or a Tab has already put it elsewhere.
 */
export function useDismiss(open: Ref<boolean>, inside: () => (HTMLElement | null | undefined)[], close: () => void, opts: DismissOptions = {}): void {
  const within = (target: EventTarget | null): boolean => target instanceof Node && inside().some((el) => el && el.contains(target))
  const onDown = (e: PointerEvent): void => {
    if (!within(e.target)) close()
  }
  const onKey = (e: KeyboardEvent): void => {
    if (e.key !== 'Escape') return
    const back = opts.returnTo?.()
    close()
    back?.focus()
  }
  // focusin on the document, not focusout on the popup: it tells where the focus went, and a click on nothing
  // focusable (the focus goes to <body>, no focusin) is left to the pointerdown above
  const onFocus = (e: FocusEvent): void => {
    if (!within(e.target)) close()
  }
  const off = (): void => {
    document.removeEventListener('pointerdown', onDown, true)
    document.removeEventListener('keydown', onKey)
    document.removeEventListener('focusin', onFocus)
  }
  watch(open, (v) => {
    off()
    if (v) {
      document.addEventListener('pointerdown', onDown, true)
      document.addEventListener('keydown', onKey)
      document.addEventListener('focusin', onFocus)
    }
  })
  onBeforeUnmount(off)
}
