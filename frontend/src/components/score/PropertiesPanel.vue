<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { displayChord, fitVocalRange, noteName, sectionAt, sectionTypeFromTag } from '../../audio/score'
import { useScoreEditor } from './useScoreEditor'
import { SECTION_COLORS, durLabel, lyricsBlocks, sectionLabel } from './scoreUi'

/** Full screen, on the right: what is selected, its section and the lyric line under it, the voice's range, the
 *  section's chords. */
const ed = useScoreEditor()
const { ui } = ed
const { t } = useI18n()
const key = computed(() => ed.score.value.key)

const sel = computed(() => ed.selectedNotes.value)
const info = computed(() => {
  const ns = sel.value.map((n) => n.note)
  if (!ns.length) return null
  const ps = ns.map((n) => n.pitch)
  const tpb = ed.tpb.value
  const bars = [...new Set(ns.map((n) => Math.floor(n.start / tpb) + 1))].sort((a, b) => a - b)
  const durs = [...new Set(ns.map((n) => n.dur))].sort((a, b) => a - b).map(durLabel)
  return {
    count: ns.length,
    pitches: `${noteName(Math.min(...ps), key.value)} – ${noteName(Math.max(...ps), key.value)}`,
    bars: bars.length > 3 ? `${bars[0]}–${bars[bars.length - 1]}` : bars.join(', '),
    durs: durs.slice(0, 4).join(', '),
  }
})
/** The bar we describe: the selection's first, else where the cursor is. */
const focusBar = computed(() => {
  const ns = sel.value
  const tick = ns.length ? Math.min(...ns.map((n) => n.note.start)) : ui.playTick ?? ui.cursorTick
  return Math.floor(tick / ed.tpb.value)
})
const section = computed(() => sectionAt(ed.score.value, focusBar.value))
const lyricLine = computed(() => {
  const s = section.value
  if (!s) return ''
  const sameType = ed.score.value.sections.filter((x) => x.type === s.type)
  const blocks = lyricsBlocks(ed.lyrics(), sectionTypeFromTag).filter((b) => b.type === s.type)
  const block = blocks[sameType.indexOf(s)]
  if (!block?.lines.length) return ''
  const i = Math.min(block.lines.length - 1, Math.floor(((focusBar.value - s.startBar) * block.lines.length) / s.bars))
  return block.lines[i]
})
const sectionChords = computed(() => {
  const s = section.value
  if (!s) return []
  return ed.score.value.chords.filter((c) => c.bar >= s.startBar && c.bar < s.startBar + s.bars).map((c) => c.name)
})
const range = computed(() => ed.vocalRange.value)
const outside = computed(() => {
  const [lo, hi] = range.value
  const all = ed.score.value.voices.vocal.filter((n) => n.pitch < lo || n.pitch > hi)
  const s = section.value
  const here = s ? all.filter((n) => { const b = Math.floor(n.start / ed.tpb.value); return b >= s.startBar && b < s.startBar + s.bars }) : []
  return { all: all.length, here: here.length }
})
function fitRange(): void {
  ed.commit(fitVocalRange(ed.score.value, range.value))
}
</script>

<template>
  <aside class="flex flex-col gap-3.5 overflow-y-auto border-s border-border bg-panel p-3.5 text-[12px]" :aria-label="t('score.props.label')">
    <div>
      <h5 class="se-lab mb-1.5">{{ t('score.props.selected') }}</h5>
      <div class="se-box p-2.5">
        <div v-if="info" class="grid grid-cols-[96px_1fr] gap-x-2 gap-y-1">
          <span class="text-text-dim">{{ t('score.props.notes') }}</span><span>{{ info.count }}</span>
          <span class="text-text-dim">{{ t('score.props.pitches') }}</span><span>{{ info.pitches }}</span>
          <span class="text-text-dim">{{ t('score.props.bar') }}</span><span>{{ info.bars }}</span>
          <span class="text-text-dim">{{ t('score.props.durs') }}</span><span>{{ info.durs }}</span>
        </div>
        <p v-else class="m-0 text-text-dim">{{ t('score.props.nothing') }}</p>
      </div>
    </div>
    <div v-if="section">
      <h5 class="se-lab mb-1.5">{{ t('score.props.section') }}</h5>
      <div class="se-box p-2.5">
        <div class="mb-1.5 flex flex-wrap items-center gap-2">
          <span class="se-ssec" :style="{ background: SECTION_COLORS[section.type][0], color: SECTION_COLORS[section.type][1] }">{{ sectionLabel(ed.score.value, section, t) }}</span>
          <span class="text-text-dim">{{ t('score.props.bars', { from: section.startBar + 1, to: section.startBar + section.bars }) }}</span>
        </div>
        <template v-if="lyricLine">
          <div class="text-[11.5px] leading-normal text-text-dim">{{ t('score.props.lyricLine') }}</div>
          <div class="mt-0.5 text-[12.5px]">«{{ lyricLine }}»</div>
        </template>
        <div v-else class="text-[11.5px] text-text-dim">{{ t('score.props.noLyric') }}</div>
      </div>
    </div>
    <div>
      <h5 class="se-lab mb-1.5">{{ t('score.lane.vocal') }}</h5>
      <div class="se-box p-2.5">
        <div class="grid grid-cols-[96px_1fr] gap-x-2 gap-y-1">
          <span class="text-text-dim">{{ t('score.props.range') }}</span><span>{{ noteName(range[0], key) }} – {{ noteName(range[1], key) }}</span>
          <span class="text-text-dim">{{ t('score.props.preset') }}</span>
          <span class="flex gap-1">
            <button v-for="p in (['male', 'female'] as const)" :key="p" type="button" class="rounded px-1.5 text-[11px]" :class="ui.rangePreset === p ? 'bg-accent1/25 text-text' : 'text-text-dim hover:text-text'" :aria-pressed="ui.rangePreset === p" @click="ui.rangePreset = p; ui.rangeTouched = true">{{ t(`score.lane.${p}`) }}</button>
          </span>
        </div>
        <template v-if="outside.all">
          <div class="mt-2.5 flex items-start gap-2 border-t border-border pt-2.5">
            <span class="font-bold text-[#facc15]">!</span>
            <div class="flex-1 text-[11.5px] text-text-dim">{{ t('score.props.outside', { here: outside.here, all: outside.all }) }}</div>
          </div>
          <button type="button" class="se-btn mt-2 w-full justify-center border-accent1/50 text-accent" @click="fitRange">{{ t('score.props.fit') }}</button>
        </template>
      </div>
    </div>
    <div v-if="sectionChords.length">
      <h5 class="se-lab mb-1.5">{{ t('score.props.chords') }}</h5>
      <div class="flex flex-wrap gap-1">
        <span v-for="(c, i) in sectionChords" :key="i" class="se-cchip !static">{{ displayChord(c) }}</span>
      </div>
    </div>
  </aside>
</template>
