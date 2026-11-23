<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { STYLE_TAG_SUGGESTIONS } from '../../composables/styleTags'

const { t } = useI18n()

const props = defineProps<{
  modelValue: string
  placeholder?: string
  /** Put on the text field, so the form's <label for> names it (then the placeholder is not used as the name). */
  id?: string
  /** The field's name for assistive tech: the placeholder is gone once a tag exists. */
  ariaLabel?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const draft = ref('')
const focused = ref(false)
const suggestionsOpen = ref(false)
const highlighted = ref(-1)
const inputEl = ref<HTMLInputElement | null>(null)
/** What "Clear" took away, so one Undo can bring it back; dropped on the next edit. */
const cleared = ref<string[] | null>(null)
/** Polite announcement of what happened to the tags (Backspace removes a tag without a visible cue). */
const announcement = ref('')

const tags = computed(() => props.modelValue.split(',').map((t) => t.trim()).filter(Boolean))

function setTags(next: string[]): void {
  cleared.value = null
  emit('update:modelValue', next.join(', '))
}

function addTags(raw: string[]): void {
  const next = [...tags.value]
  const existing = new Set(next.map((t) => t.toLowerCase()))
  for (const item of raw) {
    const tag = item.trim()
    if (!tag || existing.has(tag.toLowerCase())) continue
    next.push(tag)
    existing.add(tag.toLowerCase())
  }
  if (next.length !== tags.value.length) setTags(next)
}

function addTag(raw: string): void {
  draft.value = ''
  addTags([raw])
}

/** Leaving the field keeps what was typed: text without Enter or a comma becomes tags too, so a style typed and
 *  followed straight by Create is not lost (the form would say the style is empty while the text is on screen).
 *  A suggestion is picked on mousedown with the default prevented, so it never blurs the field first. */
function onBlur(): void {
  focused.value = false
  if (draft.value.trim()) {
    const raw = draft.value.split(',')
    draft.value = ''
    addTags(raw)
  }
}

function removeTag(tag: string, refocus = false): void {
  setTags(tags.value.filter((t) => t !== tag))
  announcement.value = t('tagInput.removed', { tag })
  // the ✕ that had the focus is gone with its tag: keep the keyboard in the field
  if (refocus) inputEl.value?.focus()
}

function clearAll(): void {
  const was = tags.value
  setTags([])
  cleared.value = was
  draft.value = ''
  announcement.value = t('tagInput.cleared')
  inputEl.value?.focus()
}

function undoClear(): void {
  const back = cleared.value
  if (!back) return
  setTags(back)
  announcement.value = t('tagInput.restored')
  inputEl.value?.focus()
}

/** A click anywhere on the box (not on a tag's ✕ or a button) puts the caret in the field, as a label would. */
function onBoxClick(e: MouseEvent): void {
  if ((e.target as HTMLElement).closest('button, input')) return
  inputEl.value?.focus()
}

// Pasting a comma-separated list (e.g. copied straight from a tag list
// elsewhere) should split into separate tags immediately, not sit as one
// uncommitted blob until the user manually types a comma/Enter afterwards.
function onPaste(e: ClipboardEvent): void {
  const text = e.clipboardData?.getData('text') ?? ''
  if (!text.includes(',')) return // single value - let it land in the draft as usual
  e.preventDefault()
  draft.value = ''
  addTags(text.split(','))
}

const suggestions = computed(() => {
  const q = draft.value.trim().toLowerCase()
  if (!q) return []
  const existing = new Set(tags.value.map((t) => t.toLowerCase()))
  return STYLE_TAG_SUGGESTIONS.filter((s) => s.toLowerCase().includes(q) && !existing.has(s.toLowerCase())).slice(0, 8)
})

function onInput(): void {
  cleared.value = null
  suggestionsOpen.value = true
  highlighted.value = -1
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'ArrowDown' && suggestions.value.length) {
    e.preventDefault()
    suggestionsOpen.value = true
    highlighted.value = (highlighted.value + 1) % suggestions.value.length
  } else if (e.key === 'ArrowUp' && suggestions.value.length) {
    e.preventDefault()
    suggestionsOpen.value = true
    highlighted.value = (highlighted.value - 1 + suggestions.value.length) % suggestions.value.length
  } else if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    const pick = highlighted.value >= 0 ? suggestions.value[highlighted.value] : draft.value
    addTag(pick)
    highlighted.value = -1
  } else if (e.key === 'Escape') {
    if (suggestionsOpen.value) {
      e.stopPropagation()
      suggestionsOpen.value = false
      highlighted.value = -1
    }
  } else if (e.key === 'Backspace' && !draft.value && tags.value.length) {
    removeTag(tags.value[tags.value.length - 1])
  }
}

function selectSuggestion(s: string): void {
  addTag(s)
  highlighted.value = -1
  inputEl.value?.focus()
}
</script>

<template>
  <div class="relative">
    <!-- the field itself has no outline: the box shows the focus instead -->
    <div
      class="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-panel-2 p-2 focus-within:border-accent1/60 focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-accent1"
      @click="onBoxClick"
    >
      <span v-for="tag in tags" :key="tag" class="flex items-center gap-0.5 rounded-full bg-panel py-0.5 ps-2 pe-0.5 text-xs text-text">
        {{ tag }}
        <!-- 24px target inside a 20px chip: the negative margin keeps the chip's height -->
        <button
          type="button" class="-my-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-text-dim hover:text-status-failed focus-visible:outline-2 focus-visible:outline-accent1"
          :aria-label="t('tagInput.removeTag', { tag })" :title="t('tagInput.removeTag', { tag })" @click="removeTag(tag, true)"
        ><span aria-hidden="true">✕</span></button>
      </span>
      <input
        :id="id"
        ref="inputEl"
        v-model="draft"
        type="text"
        class="min-w-[8rem] flex-1 bg-transparent text-sm text-text placeholder:text-text-dim focus:outline-none"
        :placeholder="tags.length ? '' : placeholder"
        :aria-label="ariaLabel || (id ? undefined : placeholder)"
        @input="onInput"
        @keydown="onKeydown"
        @paste="onPaste"
        @focus="focused = true; suggestionsOpen = true"
        @blur="onBlur"
      />
      <button
        v-if="tags.length"
        type="button"
        class="min-h-6 shrink-0 rounded px-1 text-xs text-text-dim hover:text-status-failed focus-visible:outline-2 focus-visible:outline-accent1"
        :title="t('tagInput.clearAllTitle')"
        @click="clearAll"
      >
        {{ t('tagInput.clearAll') }}
      </button>
      <button
        v-else-if="cleared"
        type="button"
        class="min-h-6 shrink-0 rounded px-1 text-xs text-accent1 hover:underline focus-visible:outline-2 focus-visible:outline-accent1"
        :title="t('tagInput.undoTitle')"
        @click="undoClear"
      >
        {{ t('tagInput.undo') }}
      </button>
    </div>
    <span class="sr-only" aria-live="polite">{{ announcement }}</span>
    <div v-if="focused && suggestionsOpen && suggestions.length" class="absolute z-10 mt-1 w-full rounded-lg border border-border bg-panel shadow-lg">
      <button
        v-for="(s, i) in suggestions"
        :key="s"
        type="button"
        tabindex="-1"
        class="block w-full px-2.5 py-1.5 text-start text-xs"
        :class="i === highlighted ? 'bg-panel-2 text-text' : 'text-text hover:bg-panel-2'"
        @mousedown.prevent="selectSuggestion(s)"
      >
        {{ s }}
      </button>
    </div>
  </div>
</template>
