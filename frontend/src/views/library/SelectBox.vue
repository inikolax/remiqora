<script setup lang="ts">
import type { CheckState } from './useSelection'
import CheckIcon from '../../components/shared/icons/CheckIcon.vue'

/**
 * A row's tick box for the bulk actions: a button with role="checkbox", so a script can hold its state (on, off,
 * mixed) without the native box flipping on its own. The click comes with Shift, for a range.
 */
defineProps<{ state: CheckState; label: string; size?: 'sm' | 'md' }>()
const emit = defineEmits<{ toggle: [shift: boolean] }>()
</script>

<template>
  <button
    type="button" role="checkbox" :aria-checked="state === 'mixed' ? 'mixed' : state ? 'true' : 'false'" :aria-label="label" :title="label"
    class="flex shrink-0 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent1"
    :class="size === 'sm' ? 'h-6 w-6' : 'h-7 w-7'"
    @click.stop="(e: MouseEvent) => emit('toggle', e.shiftKey)"
  >
    <span
      class="flex h-4 w-4 items-center justify-center rounded border transition-colors"
      :class="state ? 'border-transparent bg-accent1-strong text-white' : 'border-text-dim/70 bg-panel-2 hover:border-accent1/70'"
      aria-hidden="true"
    >
      <CheckIcon v-if="state === true" class="h-3 w-3" />
      <span v-else-if="state === 'mixed'" class="h-0.5 w-2 rounded-full bg-white"></span>
    </span>
  </button>
</template>
