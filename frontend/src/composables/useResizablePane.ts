// A side pane the user widens or narrows by dragging its edge: the width (px) kept in localStorage, clamped to
// [min, max] where max is also at most a share of the page, a keyboard handle (arrows move it, Shift for big steps,
// Home/End to the ends), double-click back to the default. `edge` is the side of the pane the handle sits on, in
// logical terms: 'start' = the pane's left edge in a left-to-right page (dragging left widens it).
import { computed, onBeforeUnmount, ref } from 'vue'

export interface ResizableOpts {
  key: string
  min: number
  max: number
  /** The most of the page (0..1) the pane may take. */
  maxShare: number
  /** The width before the user changes it (may depend on the window). */
  initial: () => number
  /** The width the share is taken of (the page's content box). */
  pageWidth: () => number
}

function readStored(key: string): number | null {
  try {
    const v = Number(localStorage.getItem(key))
    return Number.isFinite(v) && v > 0 ? v : null
  } catch {
    return null
  }
}
function writeStored(key: string, v: number | null): void {
  try {
    if (v == null) localStorage.removeItem(key)
    else localStorage.setItem(key, String(Math.round(v)))
  } catch {
    // private window, blocked storage: the width lasts this visit
  }
}

export function useResizablePane(o: ResizableOpts) {
  const stored = ref<number | null>(readStored(o.key))
  const page = ref(o.pageWidth())
  const upper = computed(() => Math.max(o.min, Math.min(o.max, Math.floor(page.value * o.maxShare))))
  const clamp = (v: number): number => Math.round(Math.max(o.min, Math.min(upper.value, v)))
  const width = computed(() => clamp(stored.value ?? o.initial()))
  const dragging = ref(false)

  const onResize = (): void => { page.value = o.pageWidth() }
  window.addEventListener('resize', onResize)

  function set(v: number): void {
    stored.value = clamp(v)
    writeStored(o.key, stored.value)
  }
  function reset(): void {
    stored.value = null
    writeStored(o.key, null)
  }

  const rtl = (el: Element): boolean => getComputedStyle(el).direction === 'rtl'

  // ---- drag: pointer capture on the handle; the pane's start edge follows the pointer ----
  let startX = 0
  let startW = 0
  let flip = 1
  function onPointerDown(e: PointerEvent): void {
    if (e.button !== 0) return
    const el = e.currentTarget as HTMLElement
    onResize()
    startX = e.clientX
    startW = width.value
    flip = rtl(el) ? -1 : 1
    dragging.value = true
    el.setPointerCapture(e.pointerId)
    e.preventDefault()
  }
  function onPointerMove(e: PointerEvent): void {
    if (!dragging.value) return
    stored.value = clamp(startW + (startX - e.clientX) * flip)
  }
  function onPointerUp(e: PointerEvent): void {
    if (!dragging.value) return
    dragging.value = false
    ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
    set(stored.value ?? width.value)
  }

  // ---- keys: the handle is a separator; the arrow toward the outside widens ----
  function onKeydown(e: KeyboardEvent): void {
    const step = e.shiftKey ? 64 : 16
    const wider = rtl(e.currentTarget as Element) ? 'ArrowRight' : 'ArrowLeft'
    const narrower = wider === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft'
    if (e.key === wider) set(width.value + step)
    else if (e.key === narrower) set(width.value - step)
    else if (e.key === 'Home') set(o.min)
    else if (e.key === 'End') set(upper.value)
    else return
    e.preventDefault()
  }

  onBeforeUnmount(() => window.removeEventListener('resize', onResize))

  return { width, min: o.min, max: upper, dragging, reset, measure: onResize, onPointerDown, onPointerMove, onPointerUp, onKeydown }
}
