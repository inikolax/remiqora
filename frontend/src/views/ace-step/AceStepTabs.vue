<script setup lang="ts">
// ACE-Step's two modes on Create, generating and training a LoRA, as tabs above the form. From lg up the engine
// rail on the left carries the same switch, so the pages hide this one there (lg:hidden on the component).
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import WaveIcon from '../../components/shared/icons/WaveIcon.vue'
import TargetIcon from '../../components/shared/icons/TargetIcon.vue'

const { t } = useI18n()
const route = useRoute()
const isCurrent = (id: 'generate' | 'lora') => (id === 'lora') === (route.query.ace === 'lora')
const TABS = [
  { id: 'generate', to: { name: 'create', query: { engine: 'ace_step' } }, icon: WaveIcon, label: 'acePage.tabs.generate', hint: 'header.desc.ace' },
  { id: 'lora', to: { name: 'create', query: { engine: 'ace_step', ace: 'lora' } }, icon: TargetIcon, label: 'acePage.tabs.lora', hint: 'acePage.tabs.loraHint' },
] as const
</script>

<template>
  <nav class="flex w-fit items-center gap-0.5 rounded-xl border border-border bg-panel-2/40 p-1" :aria-label="t('acePage.tabs.label')">
    <router-link
      v-for="tab in TABS"
      :key="tab.id"
      :to="tab.to"
      class="flex h-9 items-center gap-2 rounded-lg px-3.5 text-sm transition-colors"
      :class="isCurrent(tab.id) ? 'bg-panel font-semibold text-text shadow-sm shadow-black/20' : 'font-medium text-text-dim hover:bg-panel/60 hover:text-text'"
      :title="t(tab.hint)"
      :aria-current="isCurrent(tab.id) ? 'page' : undefined"
    >
      <component :is="tab.icon" class="h-4 w-4 shrink-0" :class="isCurrent(tab.id) && 'text-accent1'" />
      {{ t(tab.label) }}
    </router-link>
  </nav>
</template>
