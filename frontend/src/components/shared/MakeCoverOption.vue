<script setup lang="ts">
// "Make a cover after the song": one remembered choice for the song forms. Hidden while covers are off; shown but
// disabled (with a link to the Models page) while the cover model is not installed.
import { computed, onMounted, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useCoversStore } from '../../stores/covers'

/** `engine`: the form it sits in; without it, Create's engine in the address. Stable Audio makes music, not a
 *  song, so its hint says "after generation". */
const props = defineProps<{ engine?: string }>()
const { t } = useI18n()
const covers = useCoversStore()
const route = useRoute()
onMounted(() => covers.ensureKnown())
const id = useId()
const sa = computed(() => {
  const e = props.engine ?? (route.name === 'create' ? route.query.engine : null)
  return e === 'stable_audio' || e === 'sa3'
})
</script>

<template>
  <div v-if="covers.enabled" class="text-xs">
    <div class="flex items-center gap-1.5" :class="covers.modelInstalled ? 'text-text' : 'text-text-dim'">
      <input
        :id="`${id}-cover`" type="checkbox" class="rounded border-border" data-testid="make-cover"
        :class="covers.modelInstalled ? 'cursor-pointer' : ''" :aria-describedby="`${id}-cover-hint`"
        :checked="covers.autoCover && covers.modelInstalled" :disabled="!covers.modelInstalled"
        @change="covers.setAutoCover(($event.target as HTMLInputElement).checked)"
      />
      <label :for="`${id}-cover`" :class="covers.modelInstalled ? 'cursor-pointer' : ''">{{ t('covers.after.label') }}</label>
    </div>
    <p :id="`${id}-cover-hint`" class="mt-0.5 ps-5 text-text-dim">
      <template v-if="covers.modelInstalled">{{ sa ? t('covers.after.hintSa') : t('covers.after.hint') }}</template>
      <template v-else>{{ t('covers.after.notInstalled') }} <router-link to="/models" class="text-accent1-text underline-offset-2 hover:underline">{{ t('covers.after.link') }}</router-link></template>
    </p>
  </div>
</template>
