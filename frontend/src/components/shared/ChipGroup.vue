<script setup lang="ts">
export interface ChipOption {
  value: string | number
  label: string
  disabled?: boolean
}

const props = defineProps<{
  modelValue: string | number | (string | number)[]
  options: ChipOption[]
  multiple?: boolean
  /** Smaller chips, for dense panels such as the editor's AI arranger. */
  small?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string | number | (string | number)[]] }>()

function isActive(value: string | number): boolean {
  if (props.multiple) return Array.isArray(props.modelValue) && props.modelValue.includes(value)
  return props.modelValue === value
}

function onClick(value: string | number) {
  if (props.multiple) {
    const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const idx = current.indexOf(value)
    if (idx >= 0) current.splice(idx, 1)
    else current.push(value)
    emit('update:modelValue', current)
  } else {
    emit('update:modelValue', value)
  }
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      :disabled="opt.disabled"
      class="rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-40"
      :class="[small ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm', isActive(opt.value) ? 'accent-gradient border-transparent text-white' : 'border-border bg-panel-2 text-text hover:border-accent1/60']"
      @click="onClick(opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>
