<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { noteName } from '../../audio/score'
import { useScoreEditor } from './useScoreEditor'
import { durLabel, musicianView } from './scoreUi'
import ScoreIcon from './ScoreIcon.vue'

/** Under the grid: what the tool does and where the mouse is (bar, beat, note) on the left; follow / metronome and zoom on the right. */
const props = withDefaults(defineProps<{ toggles?: boolean; compact?: boolean }>(), { toggles: true, compact: false })
const ed = useScoreEditor()
const { ui } = ed
const { t } = useI18n()

const toggleMusician = (): void => { musicianView.value = !musicianView.value }
const hint = computed(() => {
  if (ui.tool === 'pencil') return t(ui.dur ? 'score.status.pencil' : 'score.status.pencilRest', { len: durLabel(ui.dur || ui.restDur) })
  return t(`score.status.${ui.tool}`)
})
const pos = computed(() => {
  const sel = ed.selectedNotes.value
  if (sel.length > 1) {
    const ps = sel.map((n) => n.note.pitch)
    return t('score.status.selected', { n: sel.length, range: `${noteName(Math.min(...ps), ed.score.value.key)}–${noteName(Math.max(...ps), ed.score.value.key)}` })
  }
  const h = ui.hover
  const tick = h?.tick ?? ui.cursorTick
  const bar = Math.floor(tick / ed.tpb.value) + 1
  const beat = Math.floor((tick % ed.tpb.value) / ed.tpBeat.value) + 1
  return t('score.status.pos', { bar, beat }) + (h ? ` · ${noteName(h.pitch, ed.score.value.key)}` : '')
})
</script>

<template>
  <div class="flex flex-wrap items-center gap-x-3.5 gap-y-1 px-0.5 text-[11.5px] text-text-dim">
    <span v-if="!props.compact" class="min-w-[8rem] flex-1 basis-0 truncate" :title="hint"><b class="font-semibold text-text">{{ t(`score.tools.${ui.tool}`) }}</b> · {{ hint }}</span>
    <!-- where the mouse is: bar, beat and the note under it, to place notes exactly; on the left and in a fixed
         width so its changing length never pushes the switches and zoom buttons around -->
    <span class="w-[25ch] shrink-0 truncate font-mono text-[11.5px] tabular-nums text-text" :title="pos" aria-live="off">{{ pos }}</span>
    <span v-if="props.compact" class="flex-1"></span>
    <template v-if="props.toggles">
      <button type="button" role="switch" class="se-toggle" :aria-checked="ui.follow" @click="ui.follow = !ui.follow"><span class="sw"></span>{{ t('score.transport.follow') }}</button>
      <button type="button" role="switch" class="se-toggle" :aria-checked="ui.metronome" @click="ui.metronome = !ui.metronome"><span class="sw"></span><ScoreIcon name="metro" />{{ t('score.transport.metronome') }}</button>
    </template>
    <button type="button" role="switch" class="se-toggle" :aria-checked="musicianView" :title="t('score.toolbar.musicianTip')" @click="toggleMusician"><span class="sw"></span>{{ t('score.toolbar.musician') }}</button>
    <button type="button" class="se-btn icon" :title="t('score.status.zoomOut')" :aria-label="t('score.status.zoomOut')" @click="ed.setZoom(ui.ppt / 1.3)"><ScoreIcon name="zoomout" /></button>
    <button type="button" class="se-btn icon" :title="t('score.status.zoomIn')" :aria-label="t('score.status.zoomIn')" @click="ed.setZoom(ui.ppt * 1.3)"><ScoreIcon name="zoomin" /></button>
  </div>
</template>
