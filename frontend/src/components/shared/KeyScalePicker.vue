<script setup lang="ts">
import { computed, nextTick, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { SCALE_MODES, TONICS, aceKeyScale, formatKeyScale, isPlainKey, modeKey, parseKeyScale } from '../../utils/keyScale'

/** The key as "<tonic> <scale id>" ("D dorian"); '' = not set. */
const model = defineModel<string>({ required: true })
defineProps<{
  /** Text of the empty tonic option ("auto", "not set"). */
  emptyLabel: string
}>()

const { t } = useI18n()
const listId = useId()

const parsed = computed(() => parseKeyScale(model.value))
const tonic = computed(() => parsed.value?.tonic ?? '')
const modeId = computed(() => parsed.value?.mode.id ?? 'major')
const modes = computed(() => SCALE_MODES.map((m) => ({ id: m.id, en: m.en, label: t(`keyScale.modes.${modeKey(m.id)}`) })))
const modeLabel = computed(() => modes.value.find((m) => m.id === modeId.value)?.label ?? '')

function setTonic(value: string): void {
  model.value = formatKeyScale(value, modeId.value)
}

// ---- Scale: a combobox filtered by what is typed (localized or English name) ----
const inputEl = ref<HTMLInputElement | null>(null)
const open = ref(false)
const query = ref('')
const active = ref(0)
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? modes.value.filter((m) => m.label.toLowerCase().includes(q) || m.en.toLowerCase().includes(q) || m.id.includes(q)) : modes.value
})

/** The list opens upwards when the room under the field (inside the panel that scrolls it) is too small. */
const dropUp = ref(false)
function placeList(): void {
  const el = inputEl.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  let top = 0
  let bottom = window.innerHeight
  for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
    const style = getComputedStyle(a)
    if (/auto|scroll|hidden/.test(style.overflowY)) {
      const box = a.getBoundingClientRect()
      top = Math.max(top, box.top)
      bottom = Math.min(bottom, box.bottom)
    }
  }
  const below = bottom - rect.bottom
  dropUp.value = below < 240 && rect.top - top > below
}

function openList(): void {
  placeList()
  open.value = true
  query.value = ''
  active.value = Math.max(0, modes.value.findIndex((m) => m.id === modeId.value))
  void nextTick(() => inputEl.value?.select())
}

function pick(id: string): void {
  model.value = formatKeyScale(tonic.value, id)
  open.value = false
  inputEl.value?.blur()
}

function onInput(e: Event): void {
  query.value = (e.target as HTMLInputElement).value
  active.value = 0
  open.value = true
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
    if (!open.value) return openList()
    const n = filtered.value.length
    if (n) active.value = (active.value + (e.key === 'ArrowDown' ? 1 : n - 1)) % n
  } else if (e.key === 'Enter') {
    if (!open.value) return
    e.preventDefault()
    const hit = filtered.value[active.value]
    if (hit) pick(hit.id)
  } else if (e.key === 'Escape' && open.value) {
    e.preventDefault()
    e.stopPropagation()
    open.value = false
    inputEl.value?.blur()
  }
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <div class="flex items-stretch gap-1.5">
      <select
        :value="tonic"
        class="rounded-lg border border-border bg-panel-2 px-2 py-1.5 text-sm text-text"
        :aria-label="t('keyScale.tonic')"
        :title="t('keyScale.tonic')"
        @change="setTonic(($event.target as HTMLSelectElement).value)"
      >
        <option value="">{{ emptyLabel }}</option>
        <option v-for="n in TONICS" :key="n" :value="n">{{ n }}</option>
      </select>
      <div class="relative min-w-0 flex-1">
        <input
          ref="inputEl"
          type="text"
          role="combobox"
          autocomplete="off"
          spellcheck="false"
          class="w-full min-w-[10rem] rounded-lg border border-border bg-panel-2 px-2 py-1.5 text-sm text-text disabled:opacity-50"
          :value="open ? query : tonic ? modeLabel : ''"
          :placeholder="open ? t('keyScale.search') : t('keyScale.mode')"
          :disabled="!tonic"
          :aria-label="t('keyScale.mode')"
          :title="t('keyScale.mode')"
          :aria-expanded="open"
          :aria-controls="listId"
          aria-autocomplete="list"
          :aria-activedescendant="open && filtered[active] ? `${listId}-${active}` : undefined"
          @focus="openList"
          @blur="open = false"
          @input="onInput"
          @keydown="onKeydown"
        />
        <ul
          v-show="open"
          :id="listId"
          role="listbox"
          class="absolute left-0 right-0 z-50 max-h-56 overflow-y-auto rounded-lg border border-border bg-panel-2 py-1 text-sm shadow-xl"
          :class="dropUp ? 'bottom-full mb-1' : 'top-full mt-1'"
        >
          <li
            v-for="(m, i) in filtered"
            :id="`${listId}-${i}`"
            :key="m.id"
            role="option"
            :aria-selected="m.id === modeId"
            class="cursor-pointer px-2 py-1"
            :class="[i === active ? 'bg-accent1/15 text-text' : 'text-text-dim', m.id === modeId ? 'font-medium text-accent1' : '']"
            @mousedown.prevent="pick(m.id)"
            @mousemove="active = i"
          >{{ m.label }}</li>
          <li v-if="filtered.length === 0" class="px-2 py-1 text-text-dim">{{ t('keyScale.none') }}</li>
        </ul>
      </div>
    </div>
    <p v-if="!isPlainKey(model)" class="max-w-md text-[11px] leading-snug text-text-dim">{{ t('keyScale.hint', { key: aceKeyScale(model) }) }}</p>
  </div>
</template>
