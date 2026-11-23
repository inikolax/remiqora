<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useScoreEditor } from './useScoreEditor'
import { fmtTime } from './scoreUi'
import ScoreIcon from './ScoreIcon.vue'

/** To the start, play / pause, loop, the time; in full screen also follow, metronome and zoom. */
const props = withDefaults(defineProps<{ full?: boolean }>(), { full: false })
const ed = useScoreEditor()
const { ui } = ed
const { t } = useI18n()
const now = computed(() => fmtTime((ui.playTick ?? ui.cursorTick) * ed.spt.value))
const total = computed(() => fmtTime(ed.total.value * ed.spt.value))
function toggleLoop(): void {
  if (!ui.loop) {
    const bar = Math.floor(ui.cursorTick / ed.tpb.value)
    ui.loop = [bar, Math.min(ed.score.value.bars, bar + 4)]
  }
  ui.loopOn = !ui.loopOn
}
</script>

<template>
  <div class="contents">
    <button type="button" class="se-btn icon" :disabled="ed.isEmpty.value" :title="`${t('score.transport.toStart')} · Home`" :aria-label="t('score.transport.toStart')" @click="ed.toStart()"><ScoreIcon name="back" fill /></button>
    <button type="button" class="se-btn grad px-3.5" :disabled="ed.isEmpty.value" :title="`${ui.playing ? t('score.transport.pause') : t('score.transport.play')} · Space`" @click="ed.togglePlay()">
      <ScoreIcon :name="ui.playing ? 'pause' : 'play'" fill />{{ ui.playing ? t('score.transport.pause') : t('score.transport.play') }}
    </button>
    <button type="button" class="se-btn icon" :class="{ on: ui.loopOn }" :aria-pressed="ui.loopOn" :title="`${t('score.transport.loop')} · L`" :aria-label="t('score.transport.loop')" @click="toggleLoop"><ScoreIcon name="loop" /></button>
    <span class="se-time"><b>{{ now }}</b> / {{ total }}</span>
    <template v-if="props.full">
      <span class="se-sep"></span>
      <button type="button" role="switch" class="se-toggle" :aria-checked="ui.follow" @click="ui.follow = !ui.follow"><span class="sw"></span>{{ t('score.transport.follow') }}</button>
      <button type="button" role="switch" class="se-toggle" :aria-checked="ui.metronome" @click="ui.metronome = !ui.metronome"><span class="sw"></span><ScoreIcon name="metro" />{{ t('score.transport.metronome') }}</button>
    </template>
  </div>
</template>
