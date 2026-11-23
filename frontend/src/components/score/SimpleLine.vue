<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { isInScale, noteName, scaleDegree, snapToScale, transpose } from '../../audio/score'
import type { Note, Score, SectionType } from '../../audio/score'
import { splitForSyllables } from '../../audio/score/lyricsMap'
import type { LineMap } from '../../audio/score/lyricsMap'
import { pianoKey } from '../../audio/pianoSynth'
import { useScoreEditor } from './useScoreEditor'
import ScoreIcon from './ScoreIcon.vue'

/**
 * One lyrics line of the simple view: its melody as a contour with a dot per note, the syllables under the dots.
 * A dot is dragged (or moved with the arrow keys) up and down along the scale or by semitones; the rhythm stays.
 */
const props = defineProps<{
  line: LineMap
  sectionType: SectionType
  /** Pitch range of the card (the section's, so its lines line up). */
  lo: number
  hi: number
  /** Width of the drawing in pixels. */
  width: number
  active: boolean
  /** Narrow panel: the line's name and buttons go above the drawing. */
  compact?: boolean
}>()
const emit = defineEmits<{ drag: [on: boolean]; touch: [] }>()
const ed = useScoreEditor()
const { ui } = ed
const { t } = useI18n()

const H = 92
const PAD = 10
const key = computed(() => ed.score.value.key)
const notes = computed(() => props.line.notes)
const syl = computed(() => props.line.syllables)
const words = computed(() => props.line.lineIndex >= 0)
const rowPx = computed(() => (H - 2 * PAD) / Math.max(1, props.hi - props.lo))
const y = (p: number): number => PAD + (props.hi - p) * rowPx.value
/** What sits under dot k: its syllable, "~" for a melisma. */
const label = (k: number): string => (words.value && k >= 0 && k < syl.value.length ? syl.value[k] : '~')
/** Dots spread over the width, but never closer than their syllables need (the card scrolls sideways then). */
const xs = computed(() => {
  const n = notes.value.length
  if (!n) return [] as number[]
  const w = (k: number): number => label(k).length * 7.6 + 2
  const gaps: number[] = []
  for (let k = 1; k < n; k++) gaps.push(Math.max(16, (w(k - 1) + w(k)) / 2 + 6))
  const need = gaps.reduce((a, b) => a + b, 0)
  const avail = props.width - 44
  const f = need > 0 && need < avail ? avail / need : 1
  const out = [22]
  for (const g of gaps) out.push(out[out.length - 1] + Math.max(g, Math.min(72, g * f)))
  return out
})
const x = (k: number): number => xs.value[k] ?? 22
const drawW = computed(() => Math.max(props.width, Math.ceil((xs.value[xs.value.length - 1] ?? 0) + 22 + (label(notes.value.length - 1).length * 3.8))))

const grid = computed(() => {
  const out: { y: number; tonic: boolean; label: string }[] = []
  for (let p = props.lo; p <= props.hi; p++) {
    if (!isInScale(p, key.value)) continue
    const tonic = scaleDegree(p, key.value) === 1
    out.push({ y: y(p), tonic, label: tonic ? noteName(p, key.value) : '' })
  }
  return out
})
const path = computed(() => notes.value.map((n, k) => `${k ? 'L' : 'M'}${x(k).toFixed(1)} ${y(n.pitch).toFixed(1)}`).join(' '))
const gradId = computed(() => 'sl-g-' + props.line.key.replace(/[^\w-]/g, '_'))
const radius = (n: Note): number => (n.dur >= 8 ? 6 : n.dur >= 4 ? 5 : 4)
const range = computed(() => ed.vocalRange.value)
const outOfRange = (p: number): boolean => p < range.value[0] || p > range.value[1]
const playing = (n: Note): boolean => ui.playTick != null && ui.playTick >= n.start && ui.playTick < n.start + n.dur

// ---- counts ----
const extra = computed(() => Math.max(0, notes.value.length - syl.value.length))
const missingSyl = computed(() => syl.value.slice(notes.value.length))
const ok = computed(() => notes.value.length === syl.value.length)
const missingText = computed(() => missingSyl.value.join('').replace(/-/g, ''))

// ---- editing ----
const stepPitch = (p: number, dir: 1 | -1): number => {
  let q = p + dir
  if (ui.snapKey) while (q > 0 && q < 127 && !isInScale(q, key.value)) q += dir
  return Math.max(0, Math.min(127, q))
}
let dragSeq = 0
const drag = shallowRef<{ id: string; base: Score; from: number; to: number; y0: number; moved: boolean } | null>(null)
function onDown(e: PointerEvent, n: Note): void {
  if (e.button !== 0) return
  emit('touch')
  try { (e.currentTarget as Element).setPointerCapture(e.pointerId) } catch { /* a pointer the browser no longer tracks */ }
  ;(e.currentTarget as SVGElement).focus({ preventScroll: true })
  if (e.shiftKey || e.ctrlKey || e.metaKey) ed.toggleSelect(n.id)
  else if (!(ed.selection.value.size === 1 && ed.selection.value.has(n.id))) ed.select([n.id])
  drag.value = { id: n.id, base: ed.score.value, from: n.pitch, to: n.pitch, y0: e.clientY, moved: false }
  emit('drag', true)
  e.preventDefault()
}
function onMove(e: PointerEvent): void {
  const d = drag.value
  if (!d) return
  const dy = e.clientY - d.y0
  if (!d.moved && Math.abs(dy) < 3) return
  const raw = Math.round(d.from - dy / rowPx.value)
  let p = Math.max(0, Math.min(127, raw))
  if (ui.snapKey) p = snapToScale(p, key.value)
  if (p === d.to && d.moved) return
  drag.value = { ...d, to: p, moved: true }
  ed.preview(p === d.from ? d.base : transpose(d.base, [d.id], p - d.from))
  if (p !== d.to) pianoKey(p, 90)
}
function onUp(): void {
  const d = drag.value
  if (!d) return
  drag.value = null
  emit('drag', false)
  if (d.moved) {
    // one undo step for the whole drag
    if (d.to !== d.from) ed.commit(ed.score.value, `simple-drag-${++dragSeq}`)
    else ed.preview(d.base)
  } else {
    pianoKey(d.from)
  }
}
function onKey(e: KeyboardEvent, n: Note, k: number): void {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    const p = stepPitch(n.pitch, e.key === 'ArrowUp' ? 1 : -1)
    if (p !== n.pitch) {
      ed.commit(transpose(ed.score.value, [n.id], p - n.pitch))
      pianoKey(p)
    }
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    const dots = (e.currentTarget as SVGElement).parentElement?.querySelectorAll<SVGElement>('[data-dot]')
    const next = dots?.[k + (e.key === 'ArrowLeft' ? -1 : 1)]
    next?.focus()
  } else if (e.key === 'Enter') {
    pianoKey(n.pitch)
  } else return
  e.preventDefault()
  e.stopPropagation()
}
function onFocus(n: Note): void {
  emit('touch')
  if (!ed.selection.value.has(n.id)) ed.select([n.id])
}
function playSyllable(k: number): void {
  const n = notes.value[k]
  if (!n) return
  emit('touch')
  ed.select([n.id])
  pianoKey(n.pitch)
}
function dotLabel(n: Note, k: number): string {
  const base = { i: k + 1, n: notes.value.length, note: noteName(n.pitch, key.value) }
  if (!words.value) return t('score.simple.dotPlain', base)
  const s = syl.value[k]
  return s != null ? t('score.simple.dot', { ...base, syl: s.replace(/-$/, '') }) : t('score.simple.dotMelisma', base)
}

function shiftLine(dir: 1 | -1): void {
  emit('touch')
  let s = ed.score.value
  for (const n of notes.value) {
    const p = stepPitch(n.pitch, dir)
    if (p !== n.pitch) s = transpose(s, [n.id], p - n.pitch)
  }
  ed.commit(s)
}
function addNotes(): void {
  emit('touch')
  ed.commit(splitForSyllables(ed.score.value, notes.value.map((n) => n.id), missingSyl.value.length))
}

// ---- playing the line over and over ----
const bars = computed<[number, number]>(() => {
  const tpb = ed.tpb.value
  const a = Math.floor(props.line.start / tpb)
  return [a, Math.max(a + 1, Math.ceil(props.line.end / tpb))]
})
const linePlaying = computed(() => ui.playing && ui.loopOn && !!ui.loop && ui.loop[0] === bars.value[0] && ui.loop[1] === bars.value[1])
function togglePlay(): void {
  emit('touch')
  if (linePlaying.value) ed.stop()
  else ed.playRegion(bars.value[0], bars.value[1], props.line.start)
}

const tip = computed(() => {
  const d = drag.value
  if (!d || !d.moved) return null
  const k = notes.value.findIndex((n) => n.id === d.id)
  if (k < 0) return null
  const text = `${noteName(d.from, key.value)} → ${noteName(d.to, key.value)}`
  const tx = x(k) + 12
  const w = 82
  return { x: tx + w > drawW.value ? x(k) - 12 - w : tx, y: Math.max(2, Math.min(H - 22, y(d.to) - 10)), w, text }
})
</script>

<template>
  <div class="sl-line" :class="{ act: active, compact }">
    <div class="sl-side">
      <span class="text-[12px] font-medium text-text">{{ words ? t('score.simple.line', { n: line.lineIndex + 1 }) : t('score.simple.noWords') }}</span>
      <span v-if="words" class="sl-cnt" :class="ok ? 'ok' : 'warn'">{{ t('score.simple.count', { syl: syl.length, notes: notes.length }) }}<template v-if="ok"> ✓</template></span>
      <span v-if="words && !notes.length" class="text-[10.5px]">{{ t('score.simple.noNotes') }}</span>
      <span v-else-if="words && extra" class="text-[10.5px]">{{ t('score.simple.melisma', { n: extra }) }}</span>
      <span v-else-if="words && missingSyl.length" class="text-[10.5px]">{{ t('score.simple.missing', { text: missingText }) }}
        <button type="button" class="sl-link" :title="t('score.simple.addTip')" @click="addNotes">{{ t('score.simple.add') }}</button>
      </span>
      <span class="sl-ctr">
        <button type="button" :class="{ on: linePlaying }" :disabled="!notes.length" :title="linePlaying ? t('score.simple.stop') : t('score.simple.playLine')" :aria-label="linePlaying ? t('score.simple.stop') : t('score.simple.playLine')" @click="togglePlay"><ScoreIcon :name="linePlaying ? 'pause' : 'play'" fill /></button>
        <button type="button" :disabled="!notes.length" :title="ui.snapKey ? t('score.simple.lineUp') : t('score.simple.lineUpSemi')" :aria-label="ui.snapKey ? t('score.simple.lineUp') : t('score.simple.lineUpSemi')" @click="shiftLine(1)"><ScoreIcon name="up" /></button>
        <button type="button" :disabled="!notes.length" :title="ui.snapKey ? t('score.simple.lineDown') : t('score.simple.lineDownSemi')" :aria-label="ui.snapKey ? t('score.simple.lineDown') : t('score.simple.lineDownSemi')" @click="shiftLine(-1)"><ScoreIcon name="down" /></button>
      </span>
    </div>
    <div class="sl-box" dir="ltr">
      <svg :width="drawW" :height="H" :viewBox="`0 0 ${drawW} ${H}`" class="block select-none" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp" @lostpointercapture="onUp">
        <defs>
          <linearGradient :id="gradId" x1="0" x2="1"><stop offset="0" stop-color="#a855f7" /><stop offset="1" stop-color="#ec4899" /></linearGradient>
        </defs>
        <g aria-hidden="true">
          <template v-for="g in grid" :key="g.y">
            <line x1="0" :x2="drawW" :y1="g.y" :y2="g.y" :stroke="g.tonic ? 'rgba(168,85,247,.22)' : 'rgba(255,255,255,.045)'" />
            <text v-if="g.label" x="2" :y="g.y + 3" fill="#6e6e80" font-size="9.5">{{ g.label }}</text>
          </template>
          <path v-if="notes.length > 1" :d="path" fill="none" :stroke="`url(#${gradId})`" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" opacity=".9" />
        </g>
        <g>
          <circle
            v-for="(n, k) in notes" :key="n.id" data-dot
            :cx="x(k)" :cy="y(n.pitch)" :r="radius(n) + (drag?.id === n.id && drag.moved ? 2 : 0)"
            class="sl-dot" :class="{ sel: ed.selection.value.has(n.id), oor: outOfRange(n.pitch), play: playing(n), mel: words && k >= syl.length, dragging: drag?.id === n.id && drag.moved }"
            tabindex="0" role="slider" aria-orientation="vertical" :aria-valuemin="0" :aria-valuemax="127" :aria-valuenow="n.pitch"
            :aria-valuetext="noteName(n.pitch, key)" :aria-label="dotLabel(n, k)"
            @pointerdown="onDown($event, n)" @keydown="onKey($event, n, k)" @focus="onFocus(n)"
          />
        </g>
        <g v-if="tip" pointer-events="none">
          <rect :x="tip.x" :y="tip.y" :width="tip.w" height="20" rx="6" fill="#0b0b10" stroke="#3a3a48" />
          <text :x="tip.x + tip.w / 2" :y="tip.y + 14" fill="#e4e4ec" font-size="11" text-anchor="middle">{{ tip.text }}</text>
        </g>
      </svg>
      <div class="sl-syl" :style="{ width: drawW + 'px' }">
        <template v-if="notes.length">
          <button
            v-for="(n, k) in notes" :key="n.id" type="button" tabindex="-1" dir="auto" class="sl-s" :class="{ mel: !words || k >= syl.length, sel: ed.selection.value.has(n.id) }"
            :style="{ left: x(k) + 'px' }" @click="playSyllable(k)"
          >{{ label(k) }}</button>
        </template>
        <span v-else dir="auto" class="sl-text">{{ line.text }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sl-line{display:grid;grid-template-columns:118px minmax(0,1fr);gap:12px;align-items:stretch}
.sl-side{display:flex;flex-direction:column;gap:5px;justify-content:center;font-size:11px;color:#8a8a9c;min-width:0}
.sl-cnt.ok{color:#4ade80}
.sl-cnt.warn{color:#facc15}
.sl-ctr{display:flex;gap:4px}
.sl-ctr button{width:26px;height:24px;border-radius:6px;border:1px solid var(--color-border);color:var(--color-text-dim);display:grid;place-items:center}
.sl-ctr button:hover:not(:disabled){color:var(--color-text);background:var(--color-panel-2)}
.sl-ctr button:disabled{opacity:.4}
.sl-ctr button.on{background:rgba(168,85,247,.2);border-color:rgba(168,85,247,.5);color:var(--color-text)}
.sl-ctr svg{width:11px;height:11px}
.sl-link{color:var(--color-accent1-text);text-decoration:underline;text-underline-offset:2px}
.sl-box{position:relative;border:1px solid var(--color-border);border-radius:10px;background:#14141b;padding:6px 14px 8px;min-width:0;overflow-x:auto;overflow-y:hidden}
.compact{grid-template-columns:minmax(0,1fr);gap:6px}
.compact .sl-side{flex-direction:row;flex-wrap:wrap;align-items:center;column-gap:10px;row-gap:2px;justify-content:flex-start}
.compact .sl-ctr{margin-inline-start:auto}
.act .sl-box{border-color:rgba(168,85,247,.55);box-shadow:0 0 0 3px rgba(168,85,247,.10)}
.sl-dot{fill:#1a1a22;stroke:#e9d5ff;stroke-width:2;cursor:ns-resize;outline:none}
.sl-dot.mel{stroke:#8a8a9c}
.sl-dot.oor{stroke:#ef4444}
.sl-dot.sel{fill:#ec4899;stroke:#fff}
.sl-dot.play{stroke:#fff;stroke-width:3;filter:drop-shadow(0 0 4px #ec4899)}
.sl-dot.dragging{fill:#fff;stroke:#ec4899;stroke-width:3}
.sl-dot:focus-visible{stroke:#fff;stroke-width:3;filter:drop-shadow(0 0 3px #a855f7)}
.sl-syl{position:relative;height:20px;font-size:13px}
.sl-s{position:absolute;top:0;transform:translateX(-50%);white-space:nowrap;color:var(--color-text);line-height:20px;padding:0 1px;border-radius:4px}
.sl-s:hover{background:rgba(168,85,247,.18)}
.sl-s.mel{color:#6e6e80}
.sl-s.sel{color:#f9a8d4}
.sl-text{color:#6e6e80;line-height:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block}
</style>
