<script setup lang="ts">
// A small actions menu for a card. An item marked `danger` asks for a second click before it fires.
import { onBeforeUnmount, ref, watch } from 'vue'
import MoreIcon from './icons/MoreIcon.vue'

export interface MenuItem {
  key: string
  label: string
  danger?: boolean
  /** Label of the second click of a danger item, e.g. "Click again to delete". */
  confirmLabel?: string
}

const props = defineProps<{ items: MenuItem[]; label: string }>()
const emit = defineEmits<{ select: [key: string] }>()

const open = ref(false)
const armed = ref<string | null>(null)
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)

function close(returnFocus = false) {
  open.value = false
  armed.value = null
  if (returnFocus) trigger.value?.focus()
}

function onDocumentPointer(e: Event) {
  if (root.value && !root.value.contains(e.target as Node)) close()
}

function onItem(item: MenuItem) {
  if (item.danger && armed.value !== item.key) {
    armed.value = item.key
    return
  }
  close(true)
  emit('select', item.key)
}

watch(open, (isOpen) => {
  if (isOpen) document.addEventListener('pointerdown', onDocumentPointer)
  else document.removeEventListener('pointerdown', onDocumentPointer)
})
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocumentPointer))
</script>

<template>
  <div ref="root" class="relative" @keydown.escape.stop="close(true)">
    <button
      ref="trigger"
      type="button"
      class="flex h-8 w-8 items-center justify-center rounded-lg text-text-dim hover:bg-panel-2 hover:text-text"
      aria-haspopup="menu"
      :aria-expanded="open"
      :aria-label="label"
      :title="label"
      @click="open = !open"
    >
      <MoreIcon class="h-4 w-4" />
    </button>
    <div v-if="open" role="menu" class="absolute right-0 top-full z-20 mt-1 min-w-64 rounded-lg border border-border bg-panel-2 p-1 shadow-lg">
      <button
        v-for="item in items"
        :key="item.key"
        type="button"
        role="menuitem"
        class="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-panel"
        :class="item.danger ? (armed === item.key ? 'bg-status-failed/15 text-status-failed' : 'text-status-failed/90') : 'text-text'"
        @click="onItem(item)"
      >
        {{ item.danger && armed === item.key ? item.confirmLabel || item.label : item.label }}
      </button>
    </div>
  </div>
</template>
