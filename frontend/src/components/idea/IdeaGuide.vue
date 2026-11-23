<script setup lang="ts">
// The guide of "From an idea", in the editor guide's look: a quick start, what the assistant writes for
// each engine, who writes the prompt, the assistant and the GPU, what comes after the prompt, tips and limits.
// Opened from the home page's "More" and from the app's help.
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import HelpModal from '../shared/HelpModal.vue'
import HelpBody from '../shared/help/HelpBody.vue'
import HelpSection from '../shared/help/HelpSection.vue'
import HelpSteps from '../shared/help/HelpSteps.vue'
import HelpTable from '../shared/help/HelpTable.vue'
import HelpList from '../shared/help/HelpList.vue'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const { t, tm } = useI18n()
const router = useRouter()
const route = useRoute()

function openModels() {
  emit('close')
  void router.push({ path: '/models', hash: '#assistant' })
}
</script>

<template>
  <HelpModal :open="open" :title="t('idea.guide.title')" wide @close="emit('close')">
    <HelpBody :lead="t('idea.guide.lead')">
      <HelpSection :title="t('idea.guide.startTitle')">
        <HelpSteps :steps="tm('idea.guide.steps') as { title: string; text: string }[]" />
      </HelpSection>

      <HelpSection :title="t('idea.guide.enginesTitle')">
        <HelpTable
          :columns="[
            { key: 'engine', label: t('idea.guide.engineHeader'), nowrap: true },
            { key: 'what', label: t('idea.guide.whatHeader') },
            { key: 'kind', label: t('idea.guide.kindHeader') },
          ]"
          :rows="tm('idea.guide.engines') as { engine: string; what: string; kind: string }[]"
          min-width="36rem"
        />
      </HelpSection>

      <HelpSection :title="t('idea.guide.writerTitle')">
        <HelpList :items="tm('idea.guide.writer') as string[]" />
      </HelpSection>

      <!-- the three devices side by side, then where they are set -->
      <HelpSection :title="t('idea.guide.deviceTitle')">
        <div class="grid gap-2 sm:grid-cols-3">
          <div v-for="d in (tm('idea.guide.devices') as { name: string; text: string }[])" :key="d.name" class="rounded-lg border border-border/60 bg-panel-2/50 p-3">
            <p class="font-medium text-text">{{ d.name }}</p>
            <p class="mt-1 text-xs leading-relaxed">{{ d.text }}</p>
          </div>
        </div>
        <div class="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <p class="min-w-[14rem] flex-1 text-xs leading-relaxed">{{ t('idea.guide.deviceNote') }}</p>
          <button
            v-if="route.name !== 'models'"
            type="button"
            class="rounded-lg border border-accent1/40 px-3 py-1.5 text-sm text-accent1 hover:bg-accent1/10"
            @click="openModels"
          >
            {{ t('idea.guide.models') }}
          </button>
        </div>
      </HelpSection>

      <HelpSection :title="t('idea.guide.afterTitle')">
        <HelpList :items="tm('idea.guide.after') as string[]" />
      </HelpSection>

      <div class="grid gap-3 sm:grid-cols-2">
        <HelpSection :title="t('idea.guide.tipsTitle')" tone="tips">
          <HelpList :items="tm('idea.guide.tips') as string[]" />
        </HelpSection>
        <HelpSection :title="t('idea.guide.limitsTitle')" tone="note">
          <HelpList :items="tm('idea.guide.limits') as string[]" />
        </HelpSection>
      </div>
    </HelpBody>
  </HelpModal>
</template>
