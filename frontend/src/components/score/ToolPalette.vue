<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { displayChord } from '../../audio/score'
import { useScoreEditor } from './useScoreEditor'
import type { Tool } from './useScoreEditor'
import { DURATIONS, GRIDS } from './scoreUi'
import ScoreIcon from './ScoreIcon.vue'
import ScorePopover from './ScorePopover.vue'

/** Tools, the length of a new note, the grid and "in key": a row in the panel, a column in full screen. */
const props = withDefaults(defineProps<{ vertical?: boolean; compact?: boolean }>(), { vertical: false, compact: false })
const ed = useScoreEditor()
const { ui } = ed
const { t } = useI18n()

const TOOLS: { id: Tool; icon: string; key: string }[] = [
  { id: 'select', icon: 'cursor', key: 'V' },
  { id: 'pencil', icon: 'pencil', key: 'B' },
  { id: 'eraser', icon: 'eraser', key: 'E' },
  { id: 'cut', icon: 'scissors', key: 'C' },
]
const tip = (id: Tool, key: string): string => `${t(`score.tools.${id}`)} · ${key} — ${t(`score.tools.${id}Tip`)}`
const gridLabel = computed(() => GRIDS.find((g) => g.ticks === ui.grid)?.label ?? '')
const gridOpen = ref(false)
const gridBtn = ref<HTMLElement | null>(null)
const keyName = computed(() => displayChord(ed.score.value.key))
</script>

<template>
  <div v-if="!props.vertical" class="contents">
    <div class="se-tools" role="toolbar" :aria-label="t('score.tools.label')">
      <button
        v-for="tl in TOOLS" :key="tl.id" type="button" class="se-tool" :aria-pressed="ui.tool === tl.id"
        :title="tip(tl.id, tl.key)" :aria-label="`${t(`score.tools.${tl.id}`)} (${tl.key})`" @click="ui.tool = tl.id"
      ><ScoreIcon :name="tl.icon" /><span v-if="!props.compact && tl.id !== 'cut'">{{ t(`score.tools.${tl.id}`) }}</span></button>
    </div>
    <div class="se-dur" role="group" :aria-label="t('score.tools.durLabel')" :title="t('score.tools.durTip')">
      <button v-for="d in DURATIONS" :key="d.ticks" type="button" :aria-pressed="ui.dur === d.ticks" :title="`${d.label} · ${d.key}`" @click="ui.dur = d.ticks">{{ d.label }}</button>
      <button type="button" class="gap-1" :aria-pressed="ui.dur === 0" :title="`${t('score.tools.restTip')} · 6`" :aria-label="t('score.tools.rest')" @click="ui.dur = 0"><ScoreIcon name="rest" class="h-3.5 w-3.5" /><span v-if="!props.compact">{{ t('score.tools.rest') }}</span></button>
    </div>
    <button ref="gridBtn" type="button" class="se-btn plain px-1.5" :title="t('score.tools.gridTip')" :aria-haspopup="'dialog'" @click="gridOpen = true">
      {{ t('score.tools.grid') }} <b class="font-semibold text-text">{{ gridLabel }}</b><ScoreIcon name="down" />
    </button>
    <button type="button" role="switch" class="se-toggle" :aria-checked="ui.snapKey" :title="t('score.tools.snapTip', { key: keyName })" @click="ui.snapKey = !ui.snapKey">
      <span class="sw"></span>{{ t('score.tools.snap') }}
    </button>
    <ScorePopover :open="gridOpen" :anchor="gridBtn" :label="t('score.tools.grid')" @close="gridOpen = false">
      <div class="flex gap-1 p-1.5">
        <button v-for="g in GRIDS" :key="g.ticks" type="button" class="se-btn" :class="{ on: ui.grid === g.ticks }" @click="ui.grid = g.ticks; gridOpen = false">{{ g.label }}</button>
      </div>
    </ScorePopover>
  </div>
  <div v-else class="flex flex-col items-center gap-1 py-3" role="toolbar" aria-orientation="vertical" :aria-label="t('score.tools.label')">
    <button
      v-for="tl in TOOLS" :key="tl.id" type="button" class="se-tool relative h-10 w-10 justify-center p-0" :aria-pressed="ui.tool === tl.id"
      :title="tip(tl.id, tl.key)" :aria-label="`${t(`score.tools.${tl.id}`)} (${tl.key})`" @click="ui.tool = tl.id"
    ><ScoreIcon :name="tl.icon" class="!h-4 !w-4" /><span class="absolute bottom-0.5 end-0.5 font-mono text-[8.5px] leading-none opacity-70">{{ tl.key }}</span></button>
    <div class="my-1.5 h-px w-7 bg-border"></div>
    <button
      v-for="d in DURATIONS" :key="d.ticks" type="button" class="h-[26px] w-10 rounded-md text-[11px]"
      :class="ui.dur === d.ticks ? 'bg-accent1/20 font-semibold text-text shadow-[inset_0_0_0_1px_rgba(168,85,247,.5)]' : 'text-text-dim hover:text-text'"
      :aria-pressed="ui.dur === d.ticks" :title="`${t('score.tools.durLabel')}: ${d.label} · ${d.key}`" @click="ui.dur = d.ticks"
    >{{ d.label }}</button>
    <button type="button" class="h-[26px] w-10 rounded-md text-[10px]" :class="ui.dur === 0 ? 'bg-accent1/20 font-semibold text-text' : 'text-text-dim hover:text-text'" :aria-pressed="ui.dur === 0" :title="`${t('score.tools.restTip')} · 6`" @click="ui.dur = 0">{{ t('score.tools.rest') }}</button>
    <div class="my-1.5 h-px w-7 bg-border"></div>
    <button
      type="button" class="se-tool h-10 w-10 justify-center p-0" :aria-pressed="ui.snapKey" :class="ui.snapKey ? '!bg-accent1/20 !text-accent' : ''"
      :title="t('score.tools.snapTip', { key: keyName })" :aria-label="t('score.tools.snap')" @click="ui.snapKey = !ui.snapKey"
    ><ScoreIcon name="lock" class="!h-4 !w-4" /></button>
  </div>
</template>
