<script setup lang="ts">
// The grip of a movable editor panel. Dragging it hands over to the editor, which shows the drop zones
// (above, beside, under the timeline); a plain click, or Enter / Space, opens a menu with the same three places.
import { onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { DOCK_SIDES } from '../../utils/dock'
import type { DockSide } from '../../utils/dock'

defineProps<{ side: DockSide; label: string }>()
const emit = defineEmits<{ move: [side: DockSide]; 'drag-start': [e: PointerEvent] }>()
const { t } = useI18n()

const root = ref<HTMLElement | null>(null)
const button = ref<HTMLButtonElement | null>(null)
const open = ref(false)
// The menu is fixed to the viewport: the panels scroll and would clip it.
const menuStyle = ref<Record<string, string>>({})
const MENU_HEIGHT = 112

let startX = 0
let startY = 0
let dragging = false

function onPointerDown(e: PointerEvent) {
  if (e.button !== 0) return
  e.preventDefault() // no text selection while dragging
  startX = e.clientX
  startY = e.clientY
  dragging = false
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp, { once: true })
}
function onPointerMove(e: PointerEvent) {
  if (dragging || Math.hypot(e.clientX - startX, e.clientY - startY) < 5) return
  dragging = true
  close()
  emit('drag-start', e)
}
function onPointerUp() {
  window.removeEventListener('pointermove', onPointerMove)
  if (!dragging) toggle()
}
/** Enter / Space: a click without a pointer behind it. */
function onClick(e: MouseEvent) {
  if (e.detail === 0) toggle()
}

function toggle() {
  if (open.value) return close()
  const r = button.value?.getBoundingClientRect()
  if (r) {
    const below = r.bottom + 4 + MENU_HEIGHT < window.innerHeight
    menuStyle.value = { left: `${Math.round(r.left)}px`, top: `${Math.round(below ? r.bottom + 4 : r.top - 4 - MENU_HEIGHT)}px` }
  }
  open.value = true
  document.addEventListener('pointerdown', onOutside, true)
}
function close() {
  open.value = false
  document.removeEventListener('pointerdown', onOutside, true)
}
function onOutside(e: PointerEvent) {
  if (root.value && !root.value.contains(e.target as Node)) close()
}
function choose(side: DockSide) {
  emit('move', side)
  close()
  button.value?.focus()
}

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('pointerdown', onOutside, true)
})
</script>

<template>
  <div ref="root" class="shrink-0" @keydown.escape="close">
    <button
      ref="button"
      type="button"
      class="flex h-6 w-5 cursor-grab touch-none items-center justify-center rounded text-text-dim hover:bg-panel-2 hover:text-text active:cursor-grabbing"
      :aria-label="label"
      :title="label"
      aria-haspopup="menu"
      :aria-expanded="open"
      @pointerdown="onPointerDown"
      @click="onClick"
    >
      <svg viewBox="0 0 10 16" width="10" height="16" fill="currentColor" aria-hidden="true">
        <circle cx="2.5" cy="3" r="1.3" /><circle cx="7.5" cy="3" r="1.3" />
        <circle cx="2.5" cy="8" r="1.3" /><circle cx="7.5" cy="8" r="1.3" />
        <circle cx="2.5" cy="13" r="1.3" /><circle cx="7.5" cy="13" r="1.3" />
      </svg>
    </button>
    <div v-if="open" role="menu" :aria-label="label" class="fixed z-50 flex w-40 flex-col rounded-lg border border-border bg-panel p-1 text-xs shadow-xl" :style="menuStyle">
      <button
        v-for="s in DOCK_SIDES"
        :key="s"
        type="button"
        role="menuitemradio"
        :aria-checked="s === side"
        class="rounded px-2 py-1.5 text-left hover:bg-panel-2"
        :class="s === side ? 'text-accent1' : 'text-text'"
        @click="choose(s)"
      >
        {{ t(`editor.dock.${s}`) }}
      </button>
    </div>
  </div>
</template>
