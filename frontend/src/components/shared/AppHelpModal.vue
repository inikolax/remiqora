<script setup lang="ts">
// The app's help from the header: the sections (each with a way to go there), how the GPU is shared and what the
// lights mean, a quick start, which engine to pick, then each part in detail, tips, and the local/licence note.
// Same look as the editor's guide (EditorHelpModal).
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import HelpModal from './HelpModal.vue'
import WaveIcon from './icons/WaveIcon.vue'
import TargetIcon from './icons/TargetIcon.vue'
import MicIcon from './icons/MicIcon.vue'
import TimelineIcon from './icons/TimelineIcon.vue'
import SparklesIcon from './icons/SparklesIcon.vue'

defineProps<{ open: boolean }>()
/** open-guide: the editor's own guide or the AI arranger's, shown by the header in place of this one. */
const emit = defineEmits<{ close: []; 'open-guide': [which: 'editor' | 'arranger'] }>()
const { t, tm } = useI18n()
const router = useRouter()

interface Step { title: string; text: string }
interface Row { label: string; ace: string; yue: string }

const SECTIONS = [
  { key: 'ace', to: '/ace-step', icon: WaveIcon, title: 'ACE-Step 1.5' },
  { key: 'lora', to: '/ace-step/lora', icon: TargetIcon, title: 'LoRA' },
  { key: 'yue', to: '/yue2', icon: MicIcon, title: 'YuE2-3B' },
  { key: 'editor', to: '/editor', icon: TimelineIcon, title: '' },
] as const
/** The detail sections, in the order a track travels: made, trained for, split, mixed, arranged, kept. */
const DETAILS = ['ace', 'yue', 'lora', 'stems', 'editor', 'arranger', 'library'] as const
const LIGHTS = [
  { key: 'stopped', cls: 'border border-text-dim/70' },
  { key: 'starting', cls: 'bg-status-queued animate-pulse' },
  { key: 'running', cls: 'bg-status-done shadow-[0_0_6px_var(--color-status-done)]' },
  { key: 'error', cls: 'bg-status-failed shadow-[0_0_6px_var(--color-status-failed)]' },
] as const

function go(to: string) {
  emit('close')
  void router.push(to)
}
</script>

<template>
  <HelpModal :open="open" :title="t('header.helpTitle')" wide @close="emit('close')">
    <div class="space-y-7">
      <p class="text-[15px] leading-relaxed text-text">{{ t('header.guide.lead') }}</p>

      <!-- The sections, as in the header -->
      <section>
        <h4 class="mb-2.5 text-sm font-semibold text-text">{{ t('header.guide.mapTitle') }}</h4>
        <div class="grid gap-2 sm:grid-cols-2">
          <div v-for="s in SECTIONS" :key="s.key" class="flex gap-3 rounded-lg border border-border/60 bg-panel-2/50 p-3">
            <component :is="s.icon" class="mt-0.5 h-[18px] w-[18px] shrink-0 text-accent1" />
            <div class="min-w-0 flex-1">
              <div class="flex items-baseline justify-between gap-3">
                <p class="font-medium text-text">{{ s.title || t('header.editor') }}</p>
                <button type="button" class="shrink-0 text-xs text-accent1 hover:underline" @click="go(s.to)">{{ t('header.guide.goTo') }}</button>
              </div>
              <p class="text-xs text-text-dim">{{ t(`header.desc.${s.key}`) }}</p>
              <p class="mt-1.5 text-xs leading-relaxed">{{ t(`header.guide.map.${s.key}`) }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- One engine on the GPU at a time -->
      <section class="rounded-lg border border-border/60 bg-panel-2/40 p-4">
        <h4 class="mb-1.5 text-sm font-semibold text-text">{{ t('header.guide.gpuTitle') }}</h4>
        <ul class="list-disc space-y-1.5 pl-4">
          <li v-for="x in (tm('header.guide.gpu') as string[])" :key="x">{{ x }}</li>
        </ul>
        <div class="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs">
          <span v-for="l in LIGHTS" :key="l.key" class="flex items-center gap-2">
            <span class="h-2 w-2 shrink-0 rounded-full" :class="l.cls" aria-hidden="true"></span>
            <span class="text-text">{{ t(`modelStatus.${l.key}`) }}</span>
            <span>{{ t(`header.guide.lights.${l.key}`) }}</span>
          </span>
        </div>
      </section>

      <!-- Quick start: a real sequence, so the steps are numbered -->
      <section>
        <h4 class="mb-2.5 text-sm font-semibold text-text">{{ t('header.guide.startTitle') }}</h4>
        <ol class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="(s, i) in (tm('header.guide.steps') as Step[])" :key="i" class="flex gap-3 rounded-lg border border-border/60 bg-panel-2/50 p-3">
            <span class="accent-gradient flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white" aria-hidden="true">{{ i + 1 }}</span>
            <div class="min-w-0">
              <p class="font-medium text-text">{{ s.title }}</p>
              <p class="mt-0.5 text-xs leading-relaxed">{{ s.text }}</p>
            </div>
          </li>
        </ol>
      </section>

      <!-- Which engine -->
      <section>
        <h4 class="mb-2.5 text-sm font-semibold text-text">{{ t('header.guide.compareTitle') }}</h4>
        <div class="overflow-x-auto rounded-lg border border-border/60">
          <table class="w-full min-w-[32rem] text-left text-xs">
            <thead class="bg-panel-2/60 text-text">
              <tr>
                <th class="w-[22%] px-3 py-2 font-medium"></th>
                <th class="px-3 py-2 font-semibold"><span class="inline-flex items-center gap-1.5"><WaveIcon class="h-3.5 w-3.5 text-accent1" />ACE-Step 1.5</span></th>
                <th class="px-3 py-2 font-semibold"><span class="inline-flex items-center gap-1.5"><MicIcon class="h-3.5 w-3.5 text-accent1" />YuE2-3B</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in (tm('header.guide.compare') as Row[])" :key="r.label" class="border-t border-border/60 align-top">
                <th scope="row" class="px-3 py-2 font-medium text-text">{{ r.label }}</th>
                <td class="px-3 py-2 leading-relaxed">{{ r.ace }}</td>
                <td class="px-3 py-2 leading-relaxed">{{ r.yue }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Each part in detail -->
      <div class="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <section v-for="id in DETAILS" :key="id">
          <h4 class="mb-1.5 text-sm font-semibold text-text">{{ t(`header.helpSections.${id}.title`) }}</h4>
          <p>{{ t(`header.helpSections.${id}.text`) }}</p>
          <!-- the editor and the arranger have guides of their own -->
          <button
            v-if="id === 'editor' || id === 'arranger'"
            type="button"
            class="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-accent1/40 px-3 py-1.5 text-sm text-accent1 hover:bg-accent1/10"
            @click="emit('open-guide', id)"
          >
            <component :is="id === 'editor' ? TimelineIcon : SparklesIcon" class="h-4 w-4" />
            {{ t(id === 'editor' ? 'header.guide.editorGuide' : 'header.guide.arrangerGuide') }}
          </button>
        </section>
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <section class="rounded-lg border border-accent1/25 bg-accent1/[0.06] p-3">
          <h4 class="mb-1.5 text-sm font-semibold text-text">{{ t('header.guide.tipsTitle') }}</h4>
          <ul class="list-disc space-y-1.5 pl-4">
            <li v-for="x in (tm('header.guide.tips') as string[])" :key="x">{{ x }}</li>
          </ul>
        </section>
        <section class="rounded-lg border border-status-queued/30 bg-status-queued/[0.05] p-3">
          <h4 class="mb-1.5 text-sm font-semibold text-text">{{ t('header.helpSections.local.title') }}</h4>
          <p>{{ t('header.helpSections.local.text') }}</p>
        </section>
      </div>
    </div>
  </HelpModal>
</template>
