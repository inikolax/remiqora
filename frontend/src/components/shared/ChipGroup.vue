<script setup lang="ts">
import { useId } from 'vue'
import CheckIcon from './icons/CheckIcon.vue'

export interface ChipOption {
  value: string | number
  label: string
  disabled?: boolean
  /** Why a disabled chip cannot be chosen: shown as its tooltip and read with it. */
  reason?: string
}

const props = defineProps<{
  modelValue: string | number | (string | number)[]
  options: ChipOption[]
  multiple?: boolean
  /** Smaller chips, for dense panels such as the editor's AI arranger. */
  small?: boolean
  /** The group's name for assistive tech (the visible label next to it, when it is not a <label>). */
  ariaLabel?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string | number | (string | number)[]] }>()
const uid = useId()

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
const why = (opt: ChipOption): string | undefined => (opt.disabled && opt.reason ? opt.reason : undefined)
</script>

<template>
  <!-- one choice: a radiogroup (one Tab stop, arrows move, via v-roving); several: toggle buttons with aria-pressed -->
  <div v-roving class="flex flex-wrap gap-2" :role="multiple ? 'group' : 'radiogroup'" :aria-label="ariaLabel">
    <button
      v-for="(opt, i) in options"
      :key="opt.value"
      type="button"
      :role="multiple ? undefined : 'radio'"
      :aria-checked="multiple ? undefined : isActive(opt.value)"
      :aria-pressed="multiple ? isActive(opt.value) : undefined"
      :disabled="opt.disabled"
      :title="why(opt)"
      :aria-describedby="why(opt) ? `${uid}-why-${i}` : undefined"
      class="inline-flex items-center gap-1 rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1 disabled:cursor-not-allowed disabled:opacity-40"
      :class="[small ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm', isActive(opt.value) ? 'accent-gradient border-transparent font-medium text-white' : 'border-border bg-panel-2 text-text hover:border-accent1/60']"
      @click="onClick(opt.value)"
    >
      <!-- the check says "chosen" without relying on the fill colour -->
      <CheckIcon v-if="isActive(opt.value)" class="-ms-0.5 h-3.5 w-3.5 shrink-0" />
      {{ opt.label }}
    </button>
    <!-- the reasons live outside the buttons so they are not read twice (name + description) -->
    <template v-for="(opt, i) in options" :key="`why-${opt.value}`">
      <span v-if="why(opt)" :id="`${uid}-why-${i}`" class="sr-only">{{ why(opt) }}</span>
    </template>
  </div>
</template>
