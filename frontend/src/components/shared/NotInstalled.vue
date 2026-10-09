<script setup lang="ts">
// A part the user left out at install (YuE2, stem separation, ACE-Step's base model): what it gives, how much it
// weighs, and the way to get it. In the desktop app the button opens its install screen with the part picked; a
// source install is pointed at the setup script. `compact` fits inside a panel or a card.
import { useI18n } from 'vue-i18n'
import { useFeaturesStore, type FeatureId } from '../../stores/features'
import DownloadIcon from './icons/DownloadIcon.vue'

const props = defineProps<{ feature: FeatureId; compact?: boolean }>()
const { t } = useI18n()
const features = useFeaturesStore()
</script>

<template>
  <div
    class="rounded-xl border border-dashed border-border bg-panel/50"
    :class="props.compact ? 'flex flex-wrap items-center gap-x-4 gap-y-2 p-3 text-xs' : 'mx-auto max-w-xl p-8 text-center'"
  >
    <div :class="props.compact ? 'min-w-0 flex-1' : ''">
      <p class="font-semibold text-text" :class="props.compact ? 'text-sm' : 'text-lg'">{{ t(`notInstalled.${props.feature}.title`) }}</p>
      <p class="mt-1 leading-relaxed text-text-dim" :class="props.compact ? '' : 'text-sm'">{{ t(`notInstalled.${props.feature}.text`) }}</p>
      <p v-if="!features.canInstall" class="mt-1.5 text-text-dim" :class="props.compact ? '' : 'text-sm'">{{ t('notInstalled.manual') }}</p>
    </div>
    <button
      v-if="features.canInstall"
      type="button"
      class="accent-gradient inline-flex shrink-0 items-center gap-2 rounded-lg font-semibold text-white"
      :class="props.compact ? 'px-3 py-1.5 text-xs' : 'mt-5 px-4 py-2 text-sm'"
      @click="features.install(props.feature)"
    >
      <DownloadIcon class="h-4 w-4" />
      {{ t('notInstalled.install', { size: t(`notInstalled.${props.feature}.size`) }) }}
    </button>
  </div>
</template>
