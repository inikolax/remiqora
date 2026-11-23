<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { displayChord, sectionAt } from '../../audio/score'
import { useScoreEditor } from './useScoreEditor'
import { sectionLabel } from './scoreUi'
import ScoreIcon from './ScoreIcon.vue'

/** The simple view's part of the header: "in key" and playing the current section over and over. */
const ed = useScoreEditor()
const { ui } = ed
const { t } = useI18n()

const keyName = computed(() => displayChord(ed.score.value.key))
/** The section last touched in the simple view, else the one at the cursor, else the first chorus. */
const current = computed(() => {
  const s = ed.score.value
  const tpb = ed.tpb.value
  const atCursor = sectionAt(s, Math.floor(ui.cursorTick / tpb))
  const sung = atCursor && s.voices.vocal.some((n) => n.start >= atCursor.startBar * tpb && n.start < (atCursor.startBar + atCursor.bars) * tpb)
  return s.sections.find((x) => x.id === ui.simpleSection)
    ?? (sung ? atCursor : null)
    ?? s.sections.find((x) => x.type === 'chorus')
    ?? s.sections[0]
    ?? null
})
const name = computed(() => (current.value ? sectionLabel(ed.score.value, current.value, t).toLocaleLowerCase() : t('score.simple.noSection').toLocaleLowerCase()))
const bars = computed<[number, number]>(() => (current.value ? [current.value.startBar, current.value.startBar + current.value.bars] : [0, ed.score.value.bars]))
const playing = computed(() => ui.playing && ui.loopOn && !!ui.loop && ui.loop[0] === bars.value[0] && ui.loop[1] === bars.value[1])
function toggle(): void {
  if (playing.value) ed.stop()
  else ed.playRegion(bars.value[0], bars.value[1])
}
</script>

<template>
  <div class="contents">
    <button type="button" role="switch" class="se-toggle" :aria-checked="ui.snapKey" :title="t('score.tools.snapTip', { key: keyName })" @click="ui.snapKey = !ui.snapKey">
      <span class="sw"></span>{{ t('score.tools.snap') }}
    </button>
    <button type="button" class="se-btn" :class="{ on: playing }" :disabled="ed.isEmpty.value || !ed.score.value.voices.vocal.length" @click="toggle">
      <ScoreIcon :name="playing ? 'pause' : 'play'" fill />{{ playing ? t('score.simple.stop') : t('score.simple.playSection', { name }) }}
    </button>
  </div>
</template>
