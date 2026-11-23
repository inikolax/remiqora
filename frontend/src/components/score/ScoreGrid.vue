<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useScoreEditor } from './useScoreEditor'
import ScoreLane from './ScoreLane.vue'
import SectionsRibbon from './SectionsRibbon.vue'
import BarRuler from './BarRuler.vue'
import ChordsRow from './ChordsRow.vue'
import SelectionBar from './SelectionBar.vue'

/**
 * The editing surface: sections, bar numbers and chords over the two voices (Vocal big, Instrument thin and
 * collapsible), one horizontal scroll and zoom for all of them. Keyboard: the grid takes focus and the editor's
 * shortcuts (tools, arrows to move the selection, Space to play).
 */
const props = withDefaults(defineProps<{
  size?: 'panel' | 'full'
  /** Height of the Vocal lane (the full-screen editor fills the window with it). */
  vocalHeight?: number
  compact?: boolean
}>(), { size: 'panel', vocalHeight: 0, compact: false })
const emit = defineEmits<{ keyNote: [pitch: number] }>()

const ed = useScoreEditor()
const { ui } = ed
const { t } = useI18n()

const HI = 96
const helpId = `score-grid-help-${Math.random().toString(36).slice(2, 8)}`
const headerW = computed(() => (props.compact ? 62 : 112))
const keysW = computed(() => (props.compact ? 30 : 46))
const gut = computed(() => headerW.value + keysW.value)
const vocalRow = computed(() => (props.size === 'full' ? 13 : 10))
const insRow = computed(() => (props.size === 'full' ? 7 : 6))
const vocalH = computed(() => props.vocalHeight || (props.size === 'full' ? 360 : 220))
const insH = computed(() => (props.size === 'full' ? 110 : 84))
const TOP_ROWS = 30 + 20 + 30

const root = ref<HTMLDivElement | null>(null)
const hbar = ref<HTMLDivElement | null>(null)
const contentW = computed(() => (ed.total.value + ed.tpb.value * 2) * ui.ppt)
const maxScroll = computed(() => Math.max(0, contentW.value - ui.areaW))

watch(() => [ui.scrollX, maxScroll.value], () => {
  if (ui.scrollX > maxScroll.value) ui.scrollX = maxScroll.value
  if (hbar.value && Math.abs(hbar.value.scrollLeft - ui.scrollX) > 1) hbar.value.scrollLeft = ui.scrollX
})
function onHbar(): void {
  if (hbar.value) ui.scrollX = hbar.value.scrollLeft
}

function onWheel(e: WheelEvent): void {
  const r = root.value?.getBoundingClientRect()
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    ed.setZoom(ui.ppt * (e.deltaY < 0 ? 1.15 : 1 / 1.15), r ? Math.max(0, e.clientX - r.left - gut.value) : undefined)
    return
  }
  const dx = e.shiftKey ? e.deltaY : Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : 0
  if (!dx) return
  e.preventDefault()
  ui.scrollX = Math.max(0, Math.min(maxScroll.value, ui.scrollX + dx))
}

// the first view: from the bar where the music starts, about eight bars wide (the panel) or twelve (full screen)
function initialView(newScore = false): void {
  const s = ed.score.value
  const bars = props.size === 'full' ? 12 : props.compact ? 4 : 8
  // the panel and the full screen take turns: the other one keeps the place it was showing
  const leftTick = ui.scrollX / ui.ppt
  if (root.value) ui.areaW = Math.max(100, root.value.clientWidth - gut.value - 2)
  ui.ppt = Math.max(0.4, Math.min(16, ui.areaW / (bars * ed.tpb.value)))
  if (!newScore && leftTick > 0) { ui.scrollX = leftTick * ui.ppt; return }
  const first = s.voices.vocal[0]?.start ?? s.voices.ins[0]?.start ?? Infinity
  const bar = Number.isFinite(first) ? Math.floor(first / ed.tpb.value) : 0
  ui.scrollX = Math.max(0, bar * ed.tpb.value * ui.ppt - 4)
  if (newScore && !ui.playing) ui.cursorTick = bar * ed.tpb.value
}
// a panel in a hidden tab has no width yet: the first view waits until it is shown
let viewed = false
watch(() => ed.loadVersion.value, () => {
  viewed = (root.value?.clientWidth ?? 0) > 0
  if (viewed) requestAnimationFrame(() => initialView(true))
})

// ---- the mini toolbar over the selection ----
const selBox = computed(() => {
  const notes = ed.selectedNotes.value
  if (!notes.length || ui.dragging || ui.playing) return null
  const voice = notes.every((n) => n.voice === 'ins') ? 'ins' : 'vocal'
  if (voice === 'ins' && ui.insCollapsed) return null
  const ns = notes.filter((n) => n.voice === voice).map((n) => n.note)
  const minStart = Math.min(...ns.map((n) => n.start))
  const maxP = Math.max(...ns.map((n) => n.pitch))
  const rowH = voice === 'vocal' ? vocalRow.value : insRow.value
  const laneTop = voice === 'vocal' ? TOP_ROWS : TOP_ROWS + vocalH.value + 6
  const laneH = voice === 'vocal' ? vocalH.value : insH.value
  const sy = Math.max(0, ui.scrollY[voice])
  const yIn = (HI - maxP) * rowH - sy
  const x = gut.value + minStart * ui.ppt - ui.scrollX
  if (x < gut.value - 40 || x > gut.value + ui.areaW) return null
  const y = laneTop + Math.max(0, Math.min(laneH, yIn)) - 42
  const barW = props.compact ? 250 : 380
  return { left: Math.max(4, Math.min(x - 20, gut.value + ui.areaW - barW)), top: Math.max(TOP_ROWS - 30, y) }
})

let ro: ResizeObserver | null = null
onMounted(() => {
  if (root.value) {
    ro = new ResizeObserver(() => {
      const w = root.value?.clientWidth ?? 0
      if (!w) return
      ui.areaW = Math.max(100, w - gut.value - 2)
      if (!viewed) { viewed = true; requestAnimationFrame(() => initialView(ed.history.past.length === 0)) }
    })
    ro.observe(root.value)
  }
})
onBeforeUnmount(() => ro?.disconnect())
function focusGrid(): void {
  root.value?.focus({ preventScroll: true })
}
defineExpose({ focusGrid })
</script>

<template>
  <div
    ref="root" class="relative select-none overflow-hidden rounded-[10px] border border-border bg-[#14141b] outline-none focus-visible:ring-2 focus-visible:ring-accent1/70"
    dir="ltr" tabindex="0" role="group" :aria-label="t('score.grid.label')" :aria-describedby="helpId"
    @keydown="ed.onKey" @wheel="onWheel"
  >
    <p :id="helpId" class="sr-only">{{ t('score.grid.keysHelp') }}</p>
    <div class="flex h-[30px] border-b border-[#22222c]">
      <div class="flex shrink-0 items-center border-e border-border bg-panel px-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-[#6e6e80]" :style="{ width: `${gut}px` }">{{ t('score.grid.sections') }}</div>
      <div class="min-w-0 flex-1"><SectionsRibbon /></div>
    </div>
    <div class="flex h-5 border-b border-[#22222c]">
      <div class="flex shrink-0 items-center border-e border-border bg-panel px-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-[#6e6e80]" :style="{ width: `${gut}px` }">{{ t('score.grid.bars') }}</div>
      <div class="min-w-0 flex-1"><BarRuler /></div>
    </div>
    <div class="flex h-[30px] border-b border-border">
      <div class="flex shrink-0 items-center border-e border-border bg-panel px-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-[#6e6e80]" :style="{ width: `${gut}px` }">{{ t('score.grid.chords') }}</div>
      <div class="min-w-0 flex-1"><ChordsRow :show-roman="!compact" /></div>
    </div>
    <ScoreLane voice="vocal" :height="vocalH" :row-h="vocalRow" :header-w="headerW" :keys-w="keysW" :compact="compact" @key-note="emit('keyNote', $event)" />
    <div class="flex h-1.5 items-center justify-center border-y border-border bg-panel" aria-hidden="true"><i class="h-0.5 w-7 rounded bg-[#3a3a48]"></i></div>
    <ScoreLane voice="ins" :height="insH" :row-h="insRow" :header-w="headerW" :keys-w="keysW" :compact="compact" @key-note="emit('keyNote', $event)" />
    <div class="flex border-t border-border">
      <div class="shrink-0 bg-panel" :style="{ width: `${gut}px` }"></div>
      <div ref="hbar" class="se-hbar min-w-0 flex-1 overflow-x-auto overflow-y-hidden" @scroll="onHbar">
        <div class="h-px" :style="{ width: `${contentW}px` }"></div>
      </div>
    </div>
    <div v-if="selBox" class="absolute z-10" :style="{ left: `${selBox.left}px`, top: `${selBox.top}px` }">
      <SelectionBar :compact="compact" />
    </div>
  </div>
</template>

<style scoped>
.se-hbar{scrollbar-width:thin;scrollbar-color:#3a3a48 transparent;height:12px}
</style>
