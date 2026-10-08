<script setup lang="ts">
// The AI arranger's detailed help: quick start, the four modes, variants, what the model hears, the panel,
// tips and limits. Opened from the "?" in the arranger panel header and from the editor's help.
import type { Component } from 'vue'
import { useI18n } from 'vue-i18n'
import HelpModal from '../shared/HelpModal.vue'
import AddPartIcon from '../shared/icons/AddPartIcon.vue'
import ContinueIcon from '../shared/icons/ContinueIcon.vue'
import CoverIcon from '../shared/icons/CoverIcon.vue'
import RepaintIcon from '../shared/icons/RepaintIcon.vue'
import type { AiMode } from '../../utils/aiParts'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const { t, tm } = useI18n()

const MODE_ICONS: Record<AiMode, Component> = { lego: AddPartIcon, repaint: RepaintIcon, continue: ContinueIcon, cover: CoverIcon }

interface Step { title: string; text: string }
interface ModeCard { mode: AiMode; model: string; what: string; when: string; where: string }
interface Term { term: string; text: string }
</script>

<template>
  <HelpModal :open="open" :title="t('aiPart.guide.title')" wide @close="emit('close')">
    <div class="space-y-6">
      <p class="text-[15px] leading-relaxed text-text">{{ t('aiPart.guide.lead') }}</p>

      <!-- Quick start: a real sequence, so the steps are numbered -->
      <section>
        <h4 class="mb-2.5 text-sm font-semibold text-text">{{ t('aiPart.guide.startTitle') }}</h4>
        <ol class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="(s, i) in (tm('aiPart.guide.steps') as Step[])" :key="i" class="flex gap-3 rounded-lg border border-border/60 bg-panel-2/50 p-3">
            <span class="accent-gradient flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white" aria-hidden="true">{{ i + 1 }}</span>
            <div class="min-w-0">
              <p class="font-medium text-text">{{ s.title }}</p>
              <p class="mt-0.5 text-xs leading-relaxed">{{ s.text }}</p>
            </div>
          </li>
        </ol>
      </section>

      <!-- The four modes, with the icons of the panel's mode switch -->
      <section>
        <h4 class="mb-2.5 text-sm font-semibold text-text">{{ t('aiPart.guide.modesTitle') }}</h4>
        <div class="grid gap-2 sm:grid-cols-2">
          <article v-for="m in (tm('aiPart.guide.modes') as ModeCard[])" :key="m.mode" class="flex flex-col gap-2 rounded-lg border border-border/60 bg-panel-2/30 p-3">
            <div class="flex items-center gap-2">
              <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent1/15 text-accent1">
                <component :is="MODE_ICONS[m.mode]" class="h-4 w-4" />
              </span>
              <h5 class="font-medium text-text">{{ t(`aiPart.modes.${m.mode}`) }}</h5>
              <span class="ml-auto shrink-0 rounded-full border border-border px-2 py-0.5 text-[11px]">{{ m.model }}</span>
            </div>
            <p class="text-xs leading-relaxed">{{ m.what }}</p>
            <dl class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs">
              <dt class="text-text">{{ t('aiPart.guide.whenLabel') }}</dt>
              <dd>{{ m.when }}</dd>
              <dt class="text-text">{{ t('aiPart.guide.whereLabel') }}</dt>
              <dd>{{ m.where }}</dd>
            </dl>
          </article>
        </div>
      </section>

      <!-- Variants and the job card's buttons -->
      <section>
        <h4 class="mb-1.5 text-sm font-semibold text-text">{{ t('aiPart.guide.variantsTitle') }}</h4>
        <p class="mb-2.5">{{ t('aiPart.guide.variantsIntro') }}</p>
        <dl class="divide-y divide-border/50 rounded-lg border border-border/60">
          <div v-for="v in (tm('aiPart.guide.variants') as Term[])" :key="v.term" class="grid gap-x-4 gap-y-0.5 px-3 py-2 sm:grid-cols-[10rem_minmax(0,1fr)]">
            <dt class="font-medium text-text">{{ v.term }}</dt>
            <dd>{{ v.text }}</dd>
          </div>
        </dl>
      </section>

      <div class="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <section>
          <h4 class="mb-1.5 text-sm font-semibold text-text">{{ t('aiPart.guide.hearsTitle') }}</h4>
          <ul class="list-disc space-y-1.5 pl-4">
            <li v-for="x in (tm('aiPart.guide.hears') as string[])" :key="x">{{ x }}</li>
          </ul>
        </section>
        <section>
          <h4 class="mb-1.5 text-sm font-semibold text-text">{{ t('aiPart.guide.panelTitle') }}</h4>
          <ul class="list-disc space-y-1.5 pl-4">
            <li v-for="x in (tm('aiPart.guide.panel') as string[])" :key="x">{{ x }}</li>
          </ul>
        </section>
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <section class="rounded-lg border border-accent1/25 bg-accent1/[0.06] p-3">
          <h4 class="mb-1.5 text-sm font-semibold text-text">{{ t('aiPart.guide.tipsTitle') }}</h4>
          <ul class="list-disc space-y-1.5 pl-4">
            <li v-for="x in (tm('aiPart.guide.tips') as string[])" :key="x">{{ x }}</li>
          </ul>
        </section>
        <section class="rounded-lg border border-status-queued/30 bg-status-queued/[0.05] p-3">
          <h4 class="mb-1.5 text-sm font-semibold text-text">{{ t('aiPart.guide.limitsTitle') }}</h4>
          <ul class="list-disc space-y-1.5 pl-4">
            <li v-for="x in (tm('aiPart.guide.limits') as string[])" :key="x">{{ x }}</li>
          </ul>
        </section>
      </div>
    </div>
  </HelpModal>
</template>
