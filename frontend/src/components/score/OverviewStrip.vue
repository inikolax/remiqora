<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useScoreEditor } from './useScoreEditor'
import { SECTION_COLORS } from './scoreUi'

/**
 * The whole song in one strip: sections in colour, notes as dashes, a frame round what the grid shows (drag it).
 * `pick`: a summary (the form's score card) — a click names the bar instead of scrolling; `frame` off hides the frame.
 */
const props = withDefaults(defineProps<{ pick?: boolean; frame?: boolean }>(), { pick: false, frame: true })
const emit = defineEmits<{ pick: [bar: number] }>()
const ed = useScoreEditor()
const { ui } = ed
const { t } = useI18n()
const canvas = ref<HTMLCanvasElement | null>(null)
const wrap = ref<HTMLDivElement | null>(null)
const W = ref(800)
const H = 44
const k = computed(() => W.value / Math.max(1, ed.total.value))

function draw(): void {
  const cv = canvas.value
  if (!cv) return
  const dpr = window.devicePixelRatio || 1
  cv.width = Math.round(W.value * dpr)
  cv.height = Math.round(H * dpr)
  cv.style.width = `${W.value}px`
  cv.style.height = `${H}px`
  const g = cv.getContext('2d')
  if (!g) return
  g.setTransform(dpr, 0, 0, dpr, 0, 0)
  g.fillStyle = '#14141b'
  g.fillRect(0, 0, W.value, H)
  const s = ed.score.value
  const tpb = ed.tpb.value
  for (const sec of s.sections) {
    g.fillStyle = SECTION_COLORS[sec.type][0]
    g.fillRect(sec.startBar * tpb * k.value, 0, Math.max(1, sec.bars * tpb * k.value - 1), 10)
  }
  const all = [...s.voices.vocal, ...s.voices.ins]
  let lo = 127
  let hi = 0
  for (const n of all) { if (n.pitch < lo) lo = n.pitch; if (n.pitch > hi) hi = n.pitch }
  const span = Math.max(12, hi - lo)
  const yOf = (p: number): number => 13 + (hi - p) * ((H - 17) / span)
  const [rlo, rhi] = ed.vocalRange.value
  for (const n of s.voices.ins) { g.fillStyle = '#2dd4bf'; g.fillRect(n.start * k.value, yOf(n.pitch), Math.max(1, n.dur * k.value), 2) }
  for (const n of s.voices.vocal) { g.fillStyle = n.pitch > rhi || n.pitch < rlo ? '#ef4444' : '#c084fc'; g.fillRect(n.start * k.value, yOf(n.pitch), Math.max(1, n.dur * k.value), 2) }
  if (ui.playTick != null) { g.fillStyle = '#ef4444'; g.fillRect(ui.playTick * k.value, 0, 1.5, H) }
}
const frame = computed(() => {
  const left = (ui.scrollX / ui.ppt) * k.value
  const width = (ui.areaW / ui.ppt) * k.value
  return { left: Math.max(0, left), width: Math.min(W.value, Math.max(8, width)) }
})
watch(() => [ed.score.value, ui.playTick, W.value, ui.rangePreset], () => requestAnimationFrame(draw))
let ro: ResizeObserver | null = null
onMounted(() => {
  if (wrap.value) { ro = new ResizeObserver(() => { W.value = wrap.value?.clientWidth ?? 800; draw() }); ro.observe(wrap.value) }
})
onBeforeUnmount(() => ro?.disconnect())

let drag: { offset: number } | null = null
function tickAt(e: PointerEvent | MouseEvent): number {
  const r = wrap.value!.getBoundingClientRect()
  return (e.clientX - r.left) / k.value
}
function onDown(e: PointerEvent): void {
  if (props.pick) { emit('pick', Math.max(0, Math.floor(tickAt(e) / ed.tpb.value))); return }
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  const tick = tickAt(e)
  const vis = ui.areaW / ui.ppt
  const fromTick = ui.scrollX / ui.ppt
  drag = { offset: tick >= fromTick && tick <= fromTick + vis ? tick - fromTick : vis / 2 }
  onMove(e)
}
function onMove(e: PointerEvent): void {
  if (!drag) return
  ui.scrollX = Math.max(0, (tickAt(e) - drag.offset) * ui.ppt)
}
function onDbl(e: MouseEvent): void {
  if (props.pick) return
  const bar = tickAt(e) / ed.tpb.value
  const sec = ed.score.value.sections.find((s) => bar >= s.startBar && bar < s.startBar + s.bars)
  if (sec) ed.showBars(sec.startBar, sec.startBar + sec.bars)
}
</script>

<template>
  <div
    v-if="props.pick" ref="wrap" dir="ltr" class="relative h-11 cursor-pointer overflow-hidden rounded-lg border border-border hover:border-text-dim/60" :title="t('score.overview.pickHint')"
    role="button" tabindex="0" :aria-label="t('score.overview.pickHint')"
    @pointerdown="onDown" @keydown.enter.prevent="emit('pick', 0)" @keydown.space.prevent="emit('pick', 0)"
  >
    <canvas ref="canvas" class="block"></canvas>
    <div v-if="props.frame" class="pointer-events-none absolute inset-y-0 rounded-[5px] border-[1.5px] border-white/75 bg-white/5" :style="{ left: `${frame.left}px`, width: `${frame.width}px` }"></div>
  </div>
  <div
    v-else ref="wrap" dir="ltr" class="relative h-11 cursor-pointer overflow-hidden rounded-lg border border-border" :title="t('score.overview.hint')"
    role="scrollbar" aria-orientation="horizontal" :aria-label="t('score.overview.label')" :aria-valuenow="Math.round(ui.scrollX)" aria-valuemin="0"
    @pointerdown="onDown" @pointermove="onMove" @pointerup="drag = null" @pointercancel="drag = null" @dblclick="onDbl"
  >
    <canvas ref="canvas" class="block"></canvas>
    <div v-if="props.frame" class="pointer-events-none absolute inset-y-0 rounded-[5px] border-[1.5px] border-white/75 bg-white/5" :style="{ left: `${frame.left}px`, width: `${frame.width}px` }"></div>
  </div>
</template>
