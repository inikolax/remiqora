<script setup lang="ts">
// The style of a track on the face of its card: the first few tags as small pills and "+N" for the rest.
// A description that is not a tag list (a sentence from ACE-Step's Simple mode) is shown as one clipped line.
import { computed } from 'vue'

const props = withDefaults(defineProps<{ text?: string; max?: number }>(), { max: 4 })
defineEmits<{ more: [] }>()

const tags = computed(() => {
  const parts = (props.text || '').split(',').map((s) => s.trim()).filter(Boolean)
  return parts.length >= 2 && parts.every((p) => p.length <= 40) ? parts : []
})
</script>

<template>
  <ul v-if="tags.length" class="flex flex-wrap gap-1">
    <li v-for="tag in tags.slice(0, max)" :key="tag" class="rounded-full border border-accent1/25 bg-accent1/10 px-2 py-0.5 text-xs leading-4 text-text">{{ tag }}</li>
    <li v-if="tags.length > max">
      <button type="button" class="rounded-full border border-dashed border-border px-2 py-0.5 text-xs leading-4 text-text-dim hover:border-accent1/60 hover:text-text" @click="$emit('more')">+{{ tags.length - max }}</button>
    </li>
  </ul>
  <p v-else-if="text" class="max-w-full truncate rounded-full border border-accent1/25 bg-accent1/10 px-2 py-0.5 text-xs leading-4 text-text" :title="text">{{ text }}</p>
</template>
