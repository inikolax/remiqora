<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import ChevronIcon from './icons/ChevronIcon.vue'

/**
 * A form's presets as a menu in the row of its tabs: pick one to apply it, save the form as it is under a
 * name, delete one. The form keeps the presets; this only shows them.
 */
const props = defineProps<{ presets: { name: string }[]; selected: string }>()
const emit = defineEmits<{ apply: [name: string]; save: [name: string]; remove: [name: string] }>()
const { t } = useI18n()
const panelId = useId()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const nameInput = ref<HTMLInputElement | null>(null)
const newName = ref('')

/** The arrows walk the presets and the name field; the ✕ buttons stay on Tab. */
function navItems(): HTMLElement[] {
  return panel.value ? [...panel.value.querySelectorAll<HTMLElement>('[data-preset-item]')] : []
}
function toggle(): void {
  open.value = !open.value
  disarm()
  if (!open.value) return
  // into the menu: the chosen preset, else the first, else the name field
  void nextTick(() => {
    const items = navItems()
    const chosen = items.find((x) => x.dataset.presetItem === props.selected && props.selected)
    ;(chosen ?? (props.presets.length ? items[0] : nameInput.value))?.focus()
  })
}
function close(refocus: boolean): void {
  open.value = false
  disarm()
  if (refocus) trigger.value?.focus()
}
function apply(name: string): void {
  emit('apply', name)
  close(true)
}
function save(): void {
  const name = newName.value.trim()
  if (!name) return
  emit('save', name)
  newName.value = ''
  close(true)
}

/** Deleting takes two clicks on the same ✕ (as the bin of a take): the first arms it for a few seconds. */
const armed = ref<string | null>(null)
let disarmTimer: ReturnType<typeof setTimeout> | null = null
function disarm(): void {
  if (disarmTimer) clearTimeout(disarmTimer)
  disarmTimer = null
  armed.value = null
}
function askRemove(name: string): void {
  if (armed.value === name) {
    disarm()
    emit('remove', name)
    // the row is gone with its button: keep the keyboard in the menu
    void nextTick(() => (navItems()[0] ?? nameInput.value)?.focus())
    return
  }
  disarm()
  armed.value = name
  disarmTimer = setTimeout(() => { armed.value = null }, 4000)
}

function onPanelKey(e: KeyboardEvent): void {
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return
  const items = navItems()
  if (!items.length) return
  const at = items.indexOf(document.activeElement as HTMLElement)
  // in the name field Home/End move the caret
  if (at >= 0 && items[at] === nameInput.value && (e.key === 'Home' || e.key === 'End')) return
  e.preventDefault()
  const n = items.length
  const next = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : e.key === 'ArrowDown' ? (at + 1) % n : (at - 1 + n) % n
  items[next].focus()
}

function onDocPointer(e: PointerEvent): void {
  if (open.value && root.value && !root.value.contains(e.target as Node)) close(false)
}
function onKey(e: KeyboardEvent): void {
  if (e.key !== 'Escape' || !open.value) return
  e.stopPropagation()
  // back to the button that opened it, unless the focus already went elsewhere on the page
  close(!!root.value?.contains(document.activeElement))
}
onMounted(() => {
  document.addEventListener('pointerdown', onDocPointer)
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocPointer)
  window.removeEventListener('keydown', onKey)
  disarm()
})
</script>

<template>
  <div ref="root" class="relative">
    <button
      ref="trigger"
      type="button" class="inline-flex max-w-36 items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs transition-colors"
      :class="selected ? 'text-text' : 'text-text-dim hover:text-text'" :aria-expanded="open" :aria-controls="open ? panelId : undefined" :title="t('presets.title')" @click="toggle"
    >
      <span class="truncate">{{ selected || t('presets.button') }}</span>
      <ChevronIcon class="h-3.5 w-3.5 shrink-0 transition-transform motion-reduce:transition-none" :class="open ? 'rotate-180' : ''" />
    </button>

    <div v-if="open" :id="panelId" ref="panel" class="absolute end-0 top-full z-20 mt-1.5 w-64 rounded-xl border border-border bg-panel p-2 shadow-2xl" @keydown="onPanelKey">
      <ul v-if="presets.length" class="max-h-56 space-y-0.5 overflow-y-auto">
        <li v-for="p in presets" :key="p.name" class="flex items-center gap-1">
          <button
            type="button" :data-preset-item="p.name" class="min-w-0 flex-1 truncate rounded-lg px-2 py-1.5 text-start text-sm transition-colors"
            :class="p.name === selected ? 'bg-accent1/15 font-medium text-text' : 'text-text hover:bg-panel-2'" :aria-current="p.name === selected ? 'true' : undefined" :title="p.name" @click="apply(p.name)"
          >{{ p.name }}</button>
          <button
            type="button" class="inline-flex min-h-6 min-w-6 shrink-0 items-center justify-center rounded-lg px-1.5 text-xs"
            :class="armed === p.name ? 'bg-status-failed/15 font-medium text-status-failed' : 'text-text-dim hover:bg-status-failed/10 hover:text-status-failed'"
            :title="armed === p.name ? t('presets.confirmDelete', { name: p.name }) : t('presets.deleteOne', { name: p.name })"
            :aria-label="armed === p.name ? t('presets.confirmDelete', { name: p.name }) : t('presets.deleteOne', { name: p.name })"
            @click="askRemove(p.name)" @blur="armed === p.name && disarm()"
          ><template v-if="armed === p.name">{{ t('presets.deleteAsk') }}</template><span v-else aria-hidden="true">✕</span></button>
        </li>
      </ul>
      <p v-else class="px-2 py-1.5 text-xs text-text-dim">{{ t('presets.none') }}</p>
      <form class="mt-2 flex items-center gap-1.5 border-t border-border pt-2" @submit.prevent="save">
        <input
          ref="nameInput" v-model="newName" data-preset-item="" type="text" maxlength="60" class="min-w-0 flex-1 rounded-lg border border-border bg-panel-2 px-2 py-1.5 text-xs text-text"
          :placeholder="t('aceGen.presetNamePlaceholder')" :aria-label="t('presets.saveCurrent')"
        />
        <button type="submit" class="shrink-0 rounded-lg border border-border px-2 py-1.5 text-xs text-text hover:bg-panel-2 disabled:opacity-40" :disabled="!newName.trim()" :title="t('presets.saveCurrent')">{{ t('aceGen.save') }}</button>
      </form>
    </div>
  </div>
</template>
