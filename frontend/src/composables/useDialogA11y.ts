/**
 * Keyboard behaviour every modal dialog needs: focus moves into the dialog when
 * it opens (to its [data-autofocus] element, else the first focusable one) and goes back to what had it before when it closes, Tab stays inside,
 * and Escape closes it. Bind the returned `onKeydown` to the dialog element
 * (which also carries role="dialog" and aria-modal="true").
 */
import { nextTick, onBeforeUnmount, watch, type Ref } from 'vue'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function focusableIn(el: HTMLElement): HTMLElement[] {
  return [...el.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => n.offsetParent !== null || n === document.activeElement)
}

export function useDialogA11y(dialogEl: Ref<HTMLElement | null>, active: () => boolean, onClose: () => void) {
  let opener: HTMLElement | null = null

  watch(
    active,
    async (isActive) => {
      if (isActive) {
        opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
        await nextTick()
        const el = dialogEl.value
        if (!el) return
        // A dialog can name its starting point (e.g. a search field) with data-autofocus.
        const first = el.querySelector<HTMLElement>('[data-autofocus]') ?? focusableIn(el)[0]
        if (first) first.focus()
        else {
          el.tabIndex = -1
          el.focus()
        }
      } else if (opener) {
        opener.focus?.()
        opener = null
      }
    },
    { immediate: true, flush: 'post' },
  )

  onBeforeUnmount(() => {
    if (opener && document.contains(opener)) opener.focus?.()
    opener = null
  })

  function onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      onClose()
      return
    }
    if (e.key !== 'Tab') return
    const el = dialogEl.value
    if (!el) return
    const items = focusableIn(el)
    if (items.length === 0) {
      e.preventDefault()
      return
    }
    const first = items[0]
    const last = items[items.length - 1]
    const current = document.activeElement
    if (e.shiftKey && (current === first || !el.contains(current))) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && (current === last || !el.contains(current))) {
      e.preventDefault()
      first.focus()
    }
  }

  return { onKeydown }
}
