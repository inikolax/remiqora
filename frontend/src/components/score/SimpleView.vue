<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { chordAt, displayChord } from '../../audio/score'
import { mapLyrics } from '../../audio/score/lyricsMap'
import type { LineMap, SectionMap } from '../../audio/score/lyricsMap'
import { useScoreEditor } from './useScoreEditor'
import { SECTION_COLORS, SECTION_TAGS, sectionLabel } from './scoreUi'
import SimpleLine from './SimpleLine.vue'
import ScoreIcon from './ScoreIcon.vue'

/**
 * Variant B, "simple": the melody over the lyrics. Every sung line is a card with its notes as a contour and its
 * syllables under them; dots move up and down along the scale. The same Score as the piano roll, so edits, undo and
 * the selection are shared. Cards are drawn only near the visible part of the list.
 */
const props = withDefaults(defineProps<{ large?: boolean }>(), { large: false })
const emit = defineEmits<{ fromSong: []; piano: []; draw: [] }>()
const ed = useScoreEditor()
const { ui } = ed
const { t } = useI18n()

const map = computed(() => mapLyrics(ed.score.value, ed.lyrics()))
const hasVocal = computed(() => ed.score.value.voices.vocal.length > 0)
const shown = computed(() => map.value.sections.filter((s) => s.lines.length))

// ---- pitch range of each section (frozen while a dot is dragged, so the card does not jump) ----
const ranges = computed(() => {
  const out = new Map<string, [number, number]>()
  for (const s of map.value.sections) {
    const ps = s.lines.flatMap((l) => l.notes.map((n) => n.pitch))
    let lo = ps.length ? Math.min(...ps) - 2 : 60
    let hi = ps.length ? Math.max(...ps) + 2 : 72
    if (hi - lo < 12) { const mid = (hi + lo) / 2; lo = Math.floor(mid - 6); hi = lo + 12 }
    out.set(secKey(s), [lo, hi])
  }
  return out
})
const frozen = shallowRef<Map<string, [number, number]> | null>(null)
function onDrag(on: boolean): void {
  frozen.value = on ? new Map(ranges.value) : null
}
const rangeOf = (s: SectionMap): [number, number] => (frozen.value ?? ranges.value).get(secKey(s)) ?? ranges.value.get(secKey(s)) ?? [60, 72]
function secKey(s: SectionMap): string { return s.section?.id ?? 'all' }

function title(s: SectionMap): string {
  return s.section ? sectionLabel(ed.score.value, s.section, t) : t('score.simple.noSection')
}
function sub(s: SectionMap): string {
  const tag = `[${s.tag || SECTION_TAGS[s.type]}]`
  const names: string[] = []
  const max = 12
  for (let b = s.startBar; b < s.startBar + Math.min(s.bars, max); b++) {
    const c = chordAt(ed.score.value, b, 0)
    names.push(c ? displayChord(c.name) : '—')
  }
  if (!names.some((n) => n !== '—')) return tag
  return `${tag} · ${names.join(' — ')}${s.bars > max ? ' …' : ''}`
}
const isActive = (s: SectionMap): boolean => !!s.section && s.section.id === ui.simpleSection
function touch(s: SectionMap, l?: LineMap): void {
  if (s.section) ui.simpleSection = s.section.id
  if (l) markLine(l)
}
/** The line in hand, as its text and which line of that text it is: the form lights the same line in the lyrics. */
function markLine(l: LineMap): void {
  if (!l.text) return
  let nth = 0
  for (const x of shown.value) for (const y of x.lines) {
    if (y.key === l.key) { if (ui.simpleLine?.key !== l.key || ui.simpleLine.text !== l.text || ui.simpleLine.nth !== nth) ui.simpleLine = { key: l.key, text: l.text, nth }; return }
    if (y.text === l.text) nth++
  }
}

// ---- width of the drawing ----
const scroller = ref<HTMLDivElement | null>(null)
const drawW = ref(600)
const compact = ref(false)
let ro: ResizeObserver | null = null
function measure(): void {
  const el = scroller.value
  if (!el) return
  // padding 24, the side column 118 + gap 12, the card's padding 28 and border 2
  compact.value = el.clientWidth < 620
  drawW.value = Math.max(220, Math.floor(el.clientWidth - 24 - (compact.value ? 0 : 130) - 30))
}

// ---- only the cards near the view are drawn (by scroll position: no IntersectionObserver, which stalls in a
// background tab) ----
const visible = shallowRef<Set<string>>(new Set())
const observed = new Map<string, HTMLElement>()
function observe(key: string, el: unknown): void {
  if (el instanceof HTMLElement) observed.set(key, el)
  else observed.delete(key)
}
const MARGIN = 500
function updateVisible(): void {
  const box = scroller.value
  if (!box) return
  const top = box.scrollTop - MARGIN
  const bottom = box.scrollTop + box.clientHeight + MARGIN
  const next = new Set<string>()
  for (const [key, el] of observed) {
    const y = el.offsetTop
    if (y + el.offsetHeight >= top && y <= bottom) next.add(key)
  }
  const cur = visible.value
  if (next.size !== cur.size || [...next].some((k) => !cur.has(k))) visible.value = next
}
let raf = 0
function onScroll(): void {
  if (raf) return
  raf = requestAnimationFrame(() => { raf = 0; updateVisible() })
  // a background tab runs no frames: still update soon
  setTimeout(() => { if (raf) { cancelAnimationFrame(raf); raf = 0; updateVisible() } }, 120)
}
onMounted(() => {
  measure()
  if (scroller.value) { ro = new ResizeObserver(() => { measure(); onScroll() }); ro.observe(scroller.value) }
  void nextTick(updateVisible)
})
// the list changes (lyrics typed, a section added): recount after it is drawn
watch(() => shown.value.map((x) => x.lines.length).join(','), () => void nextTick(updateVisible))
watch(compact, () => void nextTick(updateVisible))
onBeforeUnmount(() => { ro?.disconnect(); if (raf) cancelAnimationFrame(raf) })

// the line under the cursor while playing comes into view
const playingKey = computed(() => {
  const tk = ui.playTick
  if (tk == null) return null
  for (const s of shown.value) for (const l of s.lines) if (tk >= l.start && tk < l.end) return l.key
  return null
})
watch(playingKey, (k) => {
  if (k) for (const s of shown.value) for (const l of s.lines) if (l.key === k) markLine(l)
  if (!k || !ui.follow) return
  void nextTick(() => {
    const el = observed.get(k)
    const box = scroller.value
    if (!el || !box) return
    const r = el.getBoundingClientRect()
    const b = box.getBoundingClientRect()
    if (r.top < b.top || r.bottom > b.bottom) box.scrollTo({ top: box.scrollTop + r.top - b.top - 40, behavior: 'smooth' })
  })
})
</script>

<template>
  <div
    ref="scroller" class="relative overflow-y-auto rounded-[10px] border border-border bg-panel p-3" :class="props.large ? 'min-h-[200px] flex-1' : 'h-[480px]'"
    role="region" :aria-label="t('score.simple.label')" @scroll.passive="onScroll"
  >
    <div v-if="!map.hasLyrics" class="se-box mx-auto my-6 max-w-[460px] p-4 text-center">
      <p class="se-h">{{ t('score.simple.noLyricsTitle') }}</p>
      <p class="se-d mt-1.5">{{ t('score.simple.noLyrics') }}</p>
    </div>
    <div v-else-if="!hasVocal" class="se-box mx-auto my-6 flex max-w-[520px] flex-col items-center gap-3 p-4 text-center">
      <div>
        <p class="se-h">{{ t('score.simple.noVocalTitle') }}</p>
        <p class="se-d mt-1.5">{{ t('score.simple.noVocal') }}</p>
      </div>
      <div class="flex flex-wrap justify-center gap-2">
        <button type="button" class="se-btn" @click="emit('fromSong')"><ScoreIcon name="song" />{{ t('score.simple.fromSong') }}</button>
        <button type="button" class="se-btn" @click="emit('piano')"><ScoreIcon name="piano" />{{ t('score.simple.piano') }}</button>
        <button type="button" class="se-btn grad" @click="emit('draw')"><ScoreIcon name="pencil" />{{ t('score.simple.draw') }}</button>
      </div>
    </div>
    <template v-else>
      <p class="mb-2.5 text-[11.5px] text-text-dim">{{ ui.snapKey ? t('score.simple.hintKey') : t('score.simple.hintFree') }}</p>
      <section v-for="s in shown" :key="secKey(s)" class="mb-4 flex flex-col gap-2.5" @focusin="touch(s)">
        <div class="sticky top-[-12px] z-10 -mx-3 flex items-center gap-2 bg-panel px-3 py-1.5">
          <span class="se-ssec shrink-0 whitespace-nowrap" :style="{ background: SECTION_COLORS[s.type][0], color: SECTION_COLORS[s.type][1] }">{{ title(s) }}</span>
          <span class="truncate text-[12px] text-text-dim">{{ sub(s) }}</span>
        </div>
        <div v-for="l in s.lines" :key="l.key" :ref="(el) => observe(l.key, el)" :data-key="l.key" :class="[compact ? 'min-h-[150px]' : 'min-h-[128px]', ui.simpleLine?.key === l.key ? 'rounded-xl outline outline-1 outline-offset-2 outline-accent1/50' : '']" @focusin="markLine(l)" @pointerdown="markLine(l)">
          <SimpleLine
            v-if="visible.has(l.key)" :line="l" :section-type="s.type" :lo="rangeOf(s)[0]" :hi="rangeOf(s)[1]" :width="drawW"
            :active="isActive(s)" :compact="compact" @drag="onDrag" @touch="touch(s, l)"
          />
        </div>
      </section>
      <p v-if="map.unmatchedLines" class="text-[11.5px] text-status-queued">{{ t('score.simple.unmatched', { n: map.unmatchedLines }) }}</p>
    </template>
  </div>
</template>
