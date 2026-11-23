<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { setDuration } from '../../audio/score'
import { useScoreEditor } from './useScoreEditor'
import { DURATIONS, durLabel } from './scoreUi'
import ScorePopover from './ScorePopover.vue'
import ScoreIcon from './ScoreIcon.vue'

/** Over the selected notes: semitone and octave, a length for all of them, duplicate, delete. */
const props = defineProps<{ compact?: boolean }>()
const ed = useScoreEditor()
const { t } = useI18n()
const count = computed(() => ed.selectedNotes.value.length)
const durs = computed(() => [...new Set(ed.selectedNotes.value.map((n) => n.note.dur))])
const durOpen = ref(false)
const durBtn = ref<HTMLElement | null>(null)
function setDur(ticks: number): void {
  ed.commit(setDuration(ed.score.value, ed.selection.value, ticks))
  durOpen.value = false
}
</script>

<template>
  <div class="flex items-center gap-0.5 rounded-[10px] border border-[#3a3a4a] bg-[#1e1e28] p-1 shadow-[0_18px_50px_rgba(0,0,0,.55)]" role="toolbar" :aria-label="t('score.selection.label')" @pointerdown.stop>
    <span class="whitespace-nowrap px-1.5 text-[11.5px] font-semibold">{{ t('score.selection.notes', { n: count }, count) }}</span>
    <span class="flex h-[26px] items-center gap-px border-s border-[#33333f] px-1">
      <span v-if="!props.compact" class="px-1 text-[10.5px] text-[#8a8a9c]">{{ t('score.selection.tone') }}</span>
      <button type="button" class="se-mini" :title="`${t('score.selection.down')} · ↓`" :aria-label="t('score.selection.down')" @click="ed.nudgePitch(-1)"><ScoreIcon name="minus" /></button>
      <button type="button" class="se-mini" :title="`${t('score.selection.up')} · ↑`" :aria-label="t('score.selection.up')" @click="ed.nudgePitch(1)"><ScoreIcon name="plus" /></button>
    </span>
    <span class="flex h-[26px] items-center gap-px border-s border-[#33333f] px-1">
      <span v-if="!props.compact" class="px-1 text-[10.5px] text-[#8a8a9c]">{{ t('score.selection.octave') }}</span>
      <button type="button" class="se-mini" :title="`${t('score.selection.octDown')} · Shift ↓`" :aria-label="t('score.selection.octDown')" @click="ed.nudgeOctave(-1)"><ScoreIcon name="down" /></button>
      <button type="button" class="se-mini" :title="`${t('score.selection.octUp')} · Shift ↑`" :aria-label="t('score.selection.octUp')" @click="ed.nudgeOctave(1)"><ScoreIcon name="up" /></button>
    </span>
    <span class="flex h-[26px] items-center border-s border-[#33333f] px-1">
      <button ref="durBtn" type="button" class="se-mini" :title="t('score.selection.duration')" :aria-haspopup="'dialog'" @click="durOpen = true">{{ durs.length === 1 ? durLabel(durs[0]) : '…' }}<ScoreIcon name="down" /></button>
    </span>
    <span class="flex h-[26px] items-center gap-px border-s border-[#33333f] px-1">
      <button type="button" class="se-mini" :title="`${t('score.selection.duplicate')} · Ctrl D`" :aria-label="t('score.selection.duplicate')" @click="ed.duplicateSelection()"><ScoreIcon name="copy" /></button>
      <button type="button" class="se-mini text-[#fca5a5]" :title="`${t('score.selection.delete')} · Del`" :aria-label="t('score.selection.delete')" @click="ed.deleteSelection()"><ScoreIcon name="trash" /></button>
    </span>
    <ScorePopover :open="durOpen" :anchor="durBtn" :label="t('score.selection.duration')" @close="durOpen = false">
      <div class="flex gap-1 p-1.5">
        <button v-for="d in DURATIONS" :key="d.ticks" type="button" class="se-btn" :class="{ on: durs.length === 1 && durs[0] === d.ticks }" @click="setDur(d.ticks)">{{ d.label }}</button>
      </div>
    </ScorePopover>
  </div>
</template>

<style scoped>
.se-mini{height:26px;min-width:26px;padding:0 6px;border-radius:6px;font-size:12px;display:inline-flex;align-items:center;justify-content:center;gap:4px}
.se-mini:hover{background:#2c2c3a}
.se-mini svg{width:12px;height:12px}
</style>
