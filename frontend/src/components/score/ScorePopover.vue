<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

/**
 * A small floating card under (or over) an anchor: the chips' menus, the chord picker, the section menu. Teleported
 * to the body so the grid's overflow does not clip it; closes on a click outside or Escape and gives the focus back.
 */
const props = withDefaults(defineProps<{
  open: boolean
  anchor: HTMLElement | null
  /** Or a point (client coordinates) when there is no element to hang it on. */
  at?: { x: number; y: number } | null
  label?: string
  width?: number
}>(), { at: null, label: '', width: 0 })
const emit = defineEmits<{ close: [] }>()

const el = ref<HTMLDivElement | null>(null)
const pos = ref({ left: 0, top: 0 })

function place(): void {
  const card = el.value
  if (!card) return
  const r = props.anchor?.getBoundingClientRect()
  const ax = r ? r.left : props.at?.x ?? 0
  const ay = r ? r.bottom + 6 : props.at?.y ?? 0
  const w = card.offsetWidth
  const h = card.offsetHeight
  let left = Math.min(ax, window.innerWidth - w - 8)
  let top = ay
  if (top + h > window.innerHeight - 8) top = Math.max(8, (r ? r.top - 6 : ay) - h)
  left = Math.max(8, left)
  pos.value = { left, top }
}

function onDown(e: PointerEvent): void {
  const t = e.target as Node
  if (el.value?.contains(t) || props.anchor?.contains(t)) return
  emit('close')
}
function onKey(e: KeyboardEvent): void {
  if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); close() }
}
function close(): void {
  emit('close')
  props.anchor?.focus?.()
}

watch(() => props.open, async (open) => {
  if (open) {
    await nextTick()
    place()
    window.addEventListener('pointerdown', onDown, true)
    window.addEventListener('resize', place)
    const first = el.value?.querySelector<HTMLElement>('[data-autofocus], button:not([disabled]), input, select')
    first?.focus({ preventScroll: true })
  } else {
    window.removeEventListener('pointerdown', onDown, true)
    window.removeEventListener('resize', place)
  }
}, { immediate: true })
onBeforeUnmount(() => {
  window.removeEventListener('pointerdown', onDown, true)
  window.removeEventListener('resize', place)
})
defineExpose({ place })
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open" ref="el" role="dialog" :aria-label="label || undefined"
      class="score-pop fixed z-[70] rounded-xl border border-[#3a3a4a] bg-[#1e1e28] text-text shadow-[0_18px_50px_rgba(0,0,0,.55),0_2px_8px_rgba(0,0,0,.4)]"
      :style="{ left: `${pos.left}px`, top: `${pos.top}px`, width: width ? `${width}px` : undefined }"
      @keydown="onKey"
    >
      <slot />
    </div>
  </Teleport>
</template>
