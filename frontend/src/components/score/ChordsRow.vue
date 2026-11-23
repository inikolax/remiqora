<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { chordRoman, displayChord } from '../../audio/score'
import { useScoreEditor } from './useScoreEditor'
import { musicianView } from './scoreUi'
import ScorePopover from './ScorePopover.vue'
import ChordPicker from './ChordPicker.vue'

/** A chip per chord over the grid (an empty bar shows a dashed "+"); a click opens the picker. */
const props = defineProps<{ showRoman?: boolean }>()
const ed = useScoreEditor()
const { ui } = ed
const { t } = useI18n()

const barPx = computed(() => ed.tpb.value * ui.ppt)
const beatPx = computed(() => barPx.value / ed.score.value.meter[0])
const chips = computed(() => {
  const s = ed.score.value
  const b0 = Math.max(0, Math.floor(ui.scrollX / barPx.value))
  const b1 = Math.min(s.bars, Math.ceil((ui.scrollX + ui.areaW) / barPx.value))
  const byBar = new Map<number, { beat: number; name: string }[]>()
  for (const c of s.chords) if (c.bar >= b0 && c.bar < b1) (byBar.get(c.bar) ?? byBar.set(c.bar, []).get(c.bar)!).push(c)
  const out: { bar: number; beat: number; name: string; left: number; width: number }[] = []
  for (let b = b0; b < b1; b++) {
    const cs = byBar.get(b) ?? []
    const x0 = b * barPx.value - ui.scrollX
    if (!cs.length) { out.push({ bar: b, beat: 0, name: '', left: x0 + 4, width: barPx.value - 8 }); continue }
    cs.forEach((c, i) => {
      const st = c.beat * beatPx.value
      const en = i + 1 < cs.length ? cs[i + 1].beat * beatPx.value : barPx.value
      out.push({ bar: b, beat: c.beat, name: c.name, left: x0 + st + 3, width: Math.max(6, en - st - 6) })
    })
  }
  return out
})

const open = ref<{ bar: number; beat: number } | null>(null)
const anchor = ref<HTMLElement | null>(null)
function openPicker(e: MouseEvent, bar: number, beat: number): void {
  anchor.value = e.currentTarget as HTMLElement
  open.value = { bar, beat }
}
const isOpen = (bar: number, beat: number): boolean => !!open.value && open.value.bar === bar && open.value.beat === beat
</script>

<template>
  <div class="relative h-full overflow-hidden">
    <button
      v-for="c in chips" :key="`${c.bar}:${c.beat}`" type="button"
      class="se-cchip" :class="{ empty: !c.name, open: isOpen(c.bar, c.beat) }"
      :style="{ left: `${c.left}px`, width: `${c.width}px` }"
      :aria-label="c.name ? t('score.chords.chipLabel', { n: c.bar + 1, chord: displayChord(c.name) }) : t('score.chords.addLabel', { n: c.bar + 1 })"
      @click="openPicker($event, c.bar, c.beat)"
    >
      <template v-if="c.name && c.width > 14">{{ displayChord(c.name) }}<small v-if="props.showRoman !== false && musicianView && c.width > 48">{{ chordRoman(c.name, ed.score.value.key) }}</small></template>
      <template v-else-if="!c.name && c.width > 10">+</template>
    </button>
    <ScorePopover :open="!!open" :anchor="anchor" :label="open ? t('score.chords.title', { n: open.bar + 1 }) : ''" :width="300" @close="open = null">
      <ChordPicker v-if="open" :bar="open.bar" :beat="open.beat" @close="open = null" />
    </ScorePopover>
  </div>
</template>
