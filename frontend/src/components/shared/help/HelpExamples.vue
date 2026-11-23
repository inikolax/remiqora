<script setup lang="ts">
// Examples in a help window as cards. When pickable they are buttons that put the example into the form (the help
// then closes); without it they are just there to read. label: a small tag before the text (the kind, the instrument).
import { useI18n } from 'vue-i18n'

defineProps<{
  items: { label?: string; text: string }[]
  /** Prompts and lyrics: monospace, line breaks kept. */
  mono?: boolean
  pickable?: boolean
}>()
const emit = defineEmits<{ pick: [index: number] }>()
const { t } = useI18n()
</script>

<template>
  <div>
    <p v-if="pickable" class="mb-2 text-xs">{{ t('common.helpPickExample') }}</p>
    <ul class="space-y-1.5">
      <li v-for="(x, i) in items" :key="i">
        <component
          :is="pickable ? 'button' : 'div'"
          :type="pickable ? 'button' : undefined"
          class="block w-full rounded-lg border border-border/60 bg-panel-2/50 px-3 py-2 text-start text-xs leading-relaxed"
          :class="[mono && 'font-mono whitespace-pre-line', pickable && 'transition-colors hover:border-accent1/50 hover:bg-accent1/[0.06]']"
          @click="pickable && emit('pick', i)"
        >
          <span v-if="x.label" class="me-1.5 rounded border border-border px-1 font-sans text-xs text-text-dim">{{ x.label }}</span>{{ x.text }}
        </component>
      </li>
    </ul>
  </div>
</template>
