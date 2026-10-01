<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  modelValue: string
  placeholder?: string
  editable?: boolean
  /** Shown instead of modelValue (e.g. a shortened title); editing still works on the full modelValue. */
  displayText?: string
}>()

const emit = defineEmits<{ rename: [title: string] }>()

const editing = ref(false)
const draft = ref('')
const inputEl = ref<HTMLInputElement | null>(null)

async function startEdit(): Promise<void> {
  draft.value = props.modelValue
  editing.value = true
  await nextTick()
  inputEl.value?.focus()
  inputEl.value?.select()
}

function commit(): void {
  editing.value = false
  const trimmed = draft.value.trim()
  if (trimmed && trimmed !== props.modelValue) emit('rename', trimmed)
}

function cancel(): void {
  editing.value = false
}
</script>

<template>
  <div class="group flex min-w-0 items-center gap-1.5">
    <input
      v-if="editing"
      ref="inputEl"
      v-model="draft"
      type="text"
      class="min-w-0 flex-1 rounded border border-border bg-panel-2 px-1.5 py-0.5 text-base font-semibold text-text"
      :placeholder="placeholder"
      @keydown.enter="commit"
      @keydown.escape="cancel"
      @blur="commit"
      @click.stop
    />
    <template v-else>
      <p class="min-w-0 flex-1 truncate text-base font-semibold tracking-tight text-text" :title="modelValue">{{ displayText || modelValue || placeholder }}</p>
      <button
        v-if="editable"
        type="button"
        class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-dim opacity-0 transition-opacity hover:bg-panel-2 hover:text-text focus-visible:opacity-100 group-hover:opacity-100 @max-[639px]:opacity-100"
        :title="t('common.rename')"
        :aria-label="t('common.rename')"
        @click.stop="startEdit"
      >
        ✎
      </button>
    </template>
  </div>
</template>
