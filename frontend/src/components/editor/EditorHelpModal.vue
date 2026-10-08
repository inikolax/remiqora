<script setup lang="ts">
// The editor's detailed help: quick start, a map of the screen, tracks and clips, tempo and loop, the mixer,
// a pointer to the shortcut sheet, saving and export, the AI arranger (with a button to its own guide), tips and limits.
// Same look as AiArrangerGuide.
import { useI18n } from 'vue-i18n'
import HelpModal from '../shared/HelpModal.vue'
import KeyboardIcon from '../shared/icons/KeyboardIcon.vue'
import SparklesIcon from '../shared/icons/SparklesIcon.vue'

defineProps<{ show: boolean }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'open-guide'): void
  (e: 'open-hotkeys'): void
}>()
const { t, tm } = useI18n()

interface Step { title: string; text: string }
interface Effect { key: string; text: string }
/** Clip bars for the tracks zone of the screen map: lane colors, rough lengths. */
const MAP_CLIPS = [
  { color: '#ec4899', parts: [[4, 38], [48, 30]] },
  { color: '#f97316', parts: [[10, 80]] },
  { color: '#3b82f6', parts: [[4, 50], [58, 34]] },
]
</script>

<template>
  <HelpModal :open="show" :title="t('editor.guide.title')" wide @close="emit('close')">
    <div class="space-y-7">
      <p class="text-[15px] leading-relaxed text-text">{{ t('editor.guide.lead') }}</p>

      <!-- Quick start: a real sequence, so the steps are numbered -->
      <section>
        <h4 class="mb-2.5 text-sm font-semibold text-text">{{ t('editor.guide.startTitle') }}</h4>
        <ol class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="(s, i) in (tm('editor.guide.steps') as Step[])" :key="i" class="flex gap-3 rounded-lg border border-border/60 bg-panel-2/50 p-3">
            <span class="accent-gradient flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white" aria-hidden="true">{{ i + 1 }}</span>
            <div class="min-w-0">
              <p class="font-medium text-text">{{ s.title }}</p>
              <p class="mt-0.5 text-xs leading-relaxed">{{ s.text }}</p>
            </div>
          </li>
        </ol>
      </section>

      <!-- A map of the screen, laid out like the editor itself -->
      <section>
        <h4 class="mb-2.5 text-sm font-semibold text-text">{{ t('editor.guide.mapTitle') }}</h4>
        <div class="grid grid-cols-[minmax(0,1fr)_minmax(7rem,30%)] gap-1.5 text-xs">
          <div v-for="zone in ['project', 'transport']" :key="zone" class="col-span-2 rounded-md border border-border/60 bg-panel-2/50 px-3 py-2">
            <span class="font-medium text-text">{{ t(`editor.guide.map.${zone}.title`) }}</span>
            <span class="ml-2 text-text-dim">{{ t(`editor.guide.map.${zone}.text`) }}</span>
          </div>
          <div class="rounded-md border border-border/60 bg-panel-2/50 px-3 py-2">
            <p class="font-medium text-text">{{ t('editor.guide.map.tracks.title') }}</p>
            <p class="mt-0.5 text-text-dim">{{ t('editor.guide.map.tracks.text') }}</p>
            <div class="mt-2 space-y-1" aria-hidden="true">
              <div v-for="(lane, i) in MAP_CLIPS" :key="i" class="relative h-2.5 rounded-sm bg-panel/60">
                <span
                  v-for="(p, j) in lane.parts"
                  :key="j"
                  class="absolute inset-y-0 rounded-sm"
                  :style="{ left: `${p[0]}%`, width: `${p[1]}%`, backgroundColor: lane.color, opacity: 0.75 }"
                ></span>
              </div>
            </div>
          </div>
          <div class="row-span-2 rounded-md border border-accent1/40 bg-accent1/[0.06] px-3 py-2">
            <p class="flex items-center gap-1.5 font-medium text-text"><SparklesIcon class="h-3.5 w-3.5 text-accent1" />{{ t('editor.guide.map.arranger.title') }}</p>
            <p class="mt-0.5 text-text-dim">{{ t('editor.guide.map.arranger.text') }}</p>
          </div>
          <div class="rounded-md border border-border/60 bg-panel-2/50 px-3 py-2">
            <span class="font-medium text-text">{{ t('editor.guide.map.mixer.title') }}</span>
            <span class="ml-2 text-text-dim">{{ t('editor.guide.map.mixer.text') }}</span>
          </div>
        </div>
      </section>

      <!-- Tracks and clips -->
      <div class="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <section>
          <h4 class="mb-1.5 text-sm font-semibold text-text">{{ t('editor.guide.laneTitle') }}</h4>
          <ul class="list-disc space-y-1.5 pl-4">
            <li v-for="x in (tm('editor.guide.lane') as string[])" :key="x">{{ x }}</li>
          </ul>
        </section>
        <section>
          <h4 class="mb-1.5 text-sm font-semibold text-text">{{ t('editor.guide.clipTitle') }}</h4>
          <ul class="list-disc space-y-1.5 pl-4">
            <li v-for="x in (tm('editor.guide.clip') as string[])" :key="x">{{ x }}</li>
          </ul>
        </section>
      </div>

      <section>
        <h4 class="mb-1.5 text-sm font-semibold text-text">{{ t('editor.guide.tempoTitle') }}</h4>
        <ul class="list-disc space-y-1.5 pl-4">
          <li v-for="x in (tm('editor.guide.tempo') as string[])" :key="x">{{ x }}</li>
        </ul>
      </section>

      <!-- Mixer: the eight effects of every channel -->
      <section>
        <h4 class="mb-1.5 text-sm font-semibold text-text">{{ t('editor.guide.mixTitle') }}</h4>
        <p class="mb-2.5">{{ t('editor.guide.mixIntro') }}</p>
        <div class="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          <div v-for="fx in (tm('editor.guide.effects') as Effect[])" :key="fx.key" class="rounded-md border border-border/60 bg-panel-2/40 px-2.5 py-2">
            <p class="text-xs font-semibold text-text">{{ t(`channelStrip.modules.${fx.key}`) }}</p>
            <p class="mt-0.5 text-[11px] leading-snug">{{ fx.text }}</p>
          </div>
        </div>
        <ul class="mt-2.5 list-disc space-y-1.5 pl-4">
          <li v-for="x in (tm('editor.guide.mixNotes') as string[])" :key="x">{{ x }}</li>
        </ul>
      </section>

      <!-- Shortcuts live on their own sheet -->
      <section class="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border/60 bg-panel-2/40 p-3">
        <KeyboardIcon class="h-5 w-5 shrink-0 text-accent1" />
        <div class="min-w-[14rem] flex-1">
          <h4 class="text-sm font-semibold text-text">{{ t('editor.guide.hotkeysTitle') }}</h4>
          <p class="mt-0.5 text-xs leading-relaxed">{{ t('editor.guide.hotkeysText') }}</p>
        </div>
        <button type="button" class="rounded-lg border border-border px-3 py-1.5 text-sm text-text hover:border-accent1/60 hover:bg-accent1/10" @click="emit('open-hotkeys')">
          {{ t('editor.hotkeys.open') }}
        </button>
      </section>

      <!-- Saving and export, and the AI arranger -->
      <div class="grid gap-x-6 gap-y-5 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section>
          <h4 class="mb-1.5 text-sm font-semibold text-text">{{ t('editor.guide.saveTitle') }}</h4>
          <ul class="list-disc space-y-1.5 pl-4">
            <li v-for="x in (tm('editor.guide.save') as string[])" :key="x">{{ x }}</li>
          </ul>
        </section>
        <section class="flex flex-col gap-2 self-start rounded-lg border border-accent1/30 bg-accent1/[0.06] p-3">
          <h4 class="flex items-center gap-1.5 text-sm font-semibold text-text"><SparklesIcon class="h-4 w-4 text-accent1" />{{ t('editor.guide.aiTitle') }}</h4>
          <p>{{ t('editor.guide.aiText') }}</p>
          <button type="button" class="self-start rounded-lg border border-accent1/40 px-3 py-1.5 text-sm text-accent1 hover:bg-accent1/10" @click="emit('open-guide')">
            {{ t('aiPart.guide.open') }}
          </button>
        </section>
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <section class="rounded-lg border border-accent1/25 bg-accent1/[0.06] p-3">
          <h4 class="mb-1.5 text-sm font-semibold text-text">{{ t('editor.guide.tipsTitle') }}</h4>
          <ul class="list-disc space-y-1.5 pl-4">
            <li v-for="x in (tm('editor.guide.tips') as string[])" :key="x">{{ x }}</li>
          </ul>
        </section>
        <section class="rounded-lg border border-status-queued/30 bg-status-queued/[0.05] p-3">
          <h4 class="mb-1.5 text-sm font-semibold text-text">{{ t('editor.guide.limitsTitle') }}</h4>
          <ul class="list-disc space-y-1.5 pl-4">
            <li v-for="x in (tm('editor.guide.limits') as string[])" :key="x">{{ x }}</li>
          </ul>
        </section>
      </div>
    </div>
  </HelpModal>
</template>
