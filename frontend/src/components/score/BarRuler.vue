<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { snapDown } from '../../audio/score'
import { useScoreEditor } from './useScoreEditor'

/** Bar numbers: a click moves the playback start there, a drag marks bars to loop. */
const ed = useScoreEditor()
const { ui } = ed
const { t } = useI18n()

const barPx = computed(() => ed.tpb.value * ui.ppt)
const every = computed(() => (barPx.value >= 26 ? 1 : barPx.value >= 13 ? 2 : barPx.value >= 6 ? 4 : 8))
const curBar = computed(() => Math.floor((ui.playTick ?? ui.cursorTick) / ed.tpb.value))
const bars = computed(() => {
  const b0 = Math.max(0, Math.floor(ui.scrollX / barPx.value))
  const b1 = Math.min(ed.score.value.bars, Math.ceil((ui.scrollX + ui.areaW) / barPx.value))
  const out: { b: number; x: number }[] = []
  for (let b = b0; b < b1; b++) if (b % every.value === 0 || b === curBar.value) out.push({ b, x: b * barPx.value - ui.scrollX })
  return out
})
const loopBox = computed(() => {
  if (!ui.loop) return null
  const l = ui.loop[0] * barPx.value - ui.scrollX
  const r = ui.loop[1] * barPx.value - ui.scrollX
  return { left: l + 1, width: Math.max(4, r - l - 2) }
})
const cursorX = computed(() => ui.cursorTick * ui.ppt - ui.scrollX)
const playX = computed(() => (ui.playTick == null ? null : ui.playTick * ui.ppt - ui.scrollX))

let drag: { x0: number; bar0: number; moved: boolean } | null = null
function barAt(e: PointerEvent): number {
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  return (e.clientX - r.left + ui.scrollX) / barPx.value
}
function onDown(e: PointerEvent): void {
  if (ed.isEmpty.value) return
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  drag = { x0: e.clientX, bar0: barAt(e), moved: false }
}
function onMove(e: PointerEvent): void {
  if (!drag) return
  if (Math.abs(e.clientX - drag.x0) < 4 && !drag.moved) return
  drag.moved = true
  const a = Math.floor(Math.min(drag.bar0, barAt(e)))
  const b = Math.ceil(Math.max(drag.bar0, barAt(e)))
  ui.loop = [Math.max(0, a), Math.min(ed.score.value.bars, Math.max(a + 1, b))]
  ui.loopOn = true
}
function onUp(e: PointerEvent): void {
  if (!drag) return
  const d = drag
  drag = null
  if (!d.moved) ed.seek(snapDown(Math.max(0, barAt(e) * ed.tpb.value), ed.tpBeat.value))
}
</script>

<template>
  <div
    class="relative h-full cursor-pointer select-none overflow-hidden bg-[#17171f]" :title="t('score.ruler.hint')"
    @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="drag = null"
  >
    <div
      v-if="loopBox" class="absolute top-0.5 flex h-4 items-center justify-end rounded border pe-1 text-[10px]"
      :class="ui.loopOn ? 'border-[#38bdf8]/50 bg-[#38bdf8]/15 text-[#7dd3fc]' : 'border-border bg-transparent text-text-dim'"
      :style="{ left: `${loopBox.left}px`, width: `${loopBox.width}px` }"
    ><span v-if="loopBox.width > 50" class="truncate">{{ t('score.ruler.loop') }}</span></div>
    <span
      v-for="x in bars" :key="x.b"
      class="absolute top-0 h-5 border-s border-[#2a2a36] ps-[5px] text-[10.5px] leading-5 tabular-nums"
      :class="x.b === curBar ? 'font-semibold text-white' : 'text-[#6e6e80]'"
      :style="{ left: `${x.x}px` }"
    >{{ x.b + 1 }}</span>
    <span v-if="cursorX >= -6" class="pointer-events-none absolute bottom-0 h-0 w-0 border-x-[5px] border-t-[7px] border-x-transparent border-t-[#ef4444]/70" :style="{ left: `${cursorX - 5}px` }" aria-hidden="true"></span>
    <span v-if="playX != null && playX >= 0" class="pointer-events-none absolute inset-y-0 w-0.5 bg-[#ef4444]" :style="{ left: `${playX - 1}px` }" aria-hidden="true"></span>
  </div>
</template>
