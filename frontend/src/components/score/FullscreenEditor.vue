<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useScoreEditor } from './useScoreEditor'
import { GRIDS } from './scoreUi'
import SongChips from './SongChips.vue'
import ImportMenu from './ImportMenu.vue'
import ToolPalette from './ToolPalette.vue'
import TransportBar from './TransportBar.vue'
import OverviewStrip from './OverviewStrip.vue'
import ScoreGrid from './ScoreGrid.vue'
import StatusBar from './StatusBar.vue'
import PropertiesPanel from './PropertiesPanel.vue'
import PianoInput from './PianoInput.vue'
import SheetView from './SheetView.vue'
import SimpleView from './SimpleView.vue'
import SimpleControls from './SimpleControls.vue'
import ScoreIcon from './ScoreIcon.vue'

/** The same editor over the whole window: tools in a column, the song's overview, a tall grid, properties. */
const props = defineProps<{ title?: string; abc: string; extracting?: boolean }>()
const emit = defineEmits<{ fromSong: []; midiFile: [file: File]; pasteAbc: [] }>()
const ed = useScoreEditor()
const { ui } = ed
const { t } = useI18n()

const main = ref<HTMLDivElement | null>(null)
const grid = ref<InstanceType<typeof ScoreGrid> | null>(null)
const vocalH = ref(360)
const showProps = ref(window.innerWidth >= 1100)
let ro: ResizeObserver | null = null
function fit(): void {
  const el = main.value
  if (!el) return
  // the grid's other rows: sections, bars, chords (80), the instrument (110 + 6), the scroll bar (14), borders
  const other = (el.querySelector('[data-fs-top]') as HTMLElement | null)?.offsetHeight ?? 90
  const bottom = (el.querySelector('[data-fs-bottom]') as HTMLElement | null)?.offsetHeight ?? 30
  vocalH.value = Math.max(140, el.clientHeight - other - bottom - 24 - 20 - (80 + 116 + 14 + 4))
  showProps.value = window.innerWidth >= 1100
}
watch(() => [ui.pianoOpen, ui.view], () => void nextTick(fit))
let lastFocus: HTMLElement | null = null
onMounted(() => {
  lastFocus = document.activeElement as HTMLElement | null
  document.body.style.overflow = 'hidden'
  if (main.value) { ro = new ResizeObserver(fit); ro.observe(main.value) }
  void nextTick(() => { fit(); grid.value?.focusGrid() })
})
onBeforeUnmount(() => {
  ro?.disconnect()
  document.body.style.overflow = ''
  lastFocus?.focus?.()
})
function onKey(e: KeyboardEvent): void {
  if (e.key === 'Escape' && !e.defaultPrevented) {
    if (ed.selection.value.size) { ed.clearSelection(); e.preventDefault(); return }
    ui.fullscreen = false
    e.preventDefault()
    return
  }
  ed.onKey(e)
}
const gridLabel = (): string => GRIDS.find((g) => g.ticks === ui.grid)?.label ?? ''
</script>

<template>
  <Teleport to="body">
    <div class="se-full fixed inset-0 z-50 flex flex-col bg-bg text-text" role="dialog" aria-modal="true" :aria-label="t('create.notes.cardTitle')" @keydown="onKey">
      <div class="flex flex-wrap items-center gap-2.5 border-b border-border bg-panel px-4 py-2.5">
        <span class="text-sm font-semibold">{{ t('create.notes.cardTitle') }}<small v-if="props.title" class="ms-1.5 text-[12.5px] font-medium text-text-dim">{{ props.title }}</small></span>
        <span class="flex-1"></span>
        <SongChips :disabled="ed.isEmpty.value" />
        <span class="se-sep"></span>
        <ImportMenu :extracting="props.extracting" @from-song="emit('fromSong')" @midi-file="emit('midiFile', $event)" @piano="ui.pianoOpen = true" @paste-abc="emit('pasteAbc')" />
        <button type="button" class="se-btn icon" :disabled="!ed.canUndo.value" :title="`${t('score.toolbar.undo')} · Ctrl+Z`" :aria-label="t('score.toolbar.undo')" @click="ed.undo()"><ScoreIcon name="undo" /></button>
        <button type="button" class="se-btn icon" :disabled="!ed.canRedo.value" :title="`${t('score.toolbar.redo')} · Ctrl+Shift+Z`" :aria-label="t('score.toolbar.redo')" @click="ed.redo()"><ScoreIcon name="redo" /></button>
        <div class="se-seg" role="radiogroup" :aria-label="t('score.toolbar.view')">
          <button type="button" role="radio" :aria-checked="ui.view === 'roll'" :class="{ on: ui.view === 'roll' }" @click="ui.view = 'roll'">{{ t('score.toolbar.views.roll') }}</button>
          <button type="button" role="radio" :aria-checked="ui.view === 'sheet'" :class="{ on: ui.view === 'sheet' }" @click="ui.view = 'sheet'">{{ t('score.toolbar.views.sheet') }}</button>
          <button type="button" role="radio" :aria-checked="ui.view === 'simple'" :class="{ on: ui.view === 'simple' }" @click="ui.view = 'simple'">{{ t('score.toolbar.views.simple') }}</button>
        </div>
        <button type="button" class="se-btn" @click="ui.fullscreen = false"><ScoreIcon name="min" />{{ t('score.full.close') }} <span class="font-mono text-[10px] text-[#6e6e80]">Esc</span></button>
      </div>
      <div class="grid min-h-0 flex-1" :class="showProps ? 'grid-cols-[56px_minmax(0,1fr)_268px]' : 'grid-cols-[56px_minmax(0,1fr)]'">
        <div class="overflow-y-auto border-e border-border bg-panel"><ToolPalette vertical /></div>
        <div ref="main" class="flex min-h-0 min-w-0 flex-col gap-2.5 px-3.5 py-3">
          <div data-fs-top class="flex flex-col gap-2.5">
            <div class="flex flex-wrap items-center gap-2">
              <TransportBar full />
              <span class="flex-1"></span>
              <SimpleControls v-if="ui.view === 'simple'" />
              <template v-else>
              <span class="text-[12px] text-text-dim">{{ t('score.tools.grid') }}: <b class="text-text">{{ gridLabel() }}</b></span>
              <span class="se-sep"></span>
              <button type="button" class="se-btn icon" :aria-label="t('score.status.zoomOut')" :title="t('score.status.zoomOut')" @click="ed.setZoom(ui.ppt / 1.3)"><ScoreIcon name="zoomout" /></button>
              <button type="button" class="se-btn icon" :aria-label="t('score.status.zoomIn')" :title="t('score.status.zoomIn')" @click="ed.setZoom(ui.ppt * 1.3)"><ScoreIcon name="zoomin" /></button>
              <button type="button" class="se-btn" @click="ed.zoomFit()">{{ t('score.full.wholeSong') }}</button>
              </template>
            </div>
            <OverviewStrip v-if="ui.view === 'roll' && !ed.isEmpty.value" />
          </div>
          <template v-if="ui.view === 'roll'">
            <ScoreGrid ref="grid" size="full" :vocal-height="vocalH" @key-note="(p) => ui.pianoOpen && ui.recording && ed.typeNote(p)" />
            <div data-fs-bottom class="flex flex-col gap-2">
              <StatusBar :toggles="false" />
              <PianoInput v-if="ui.pianoOpen" large />
            </div>
          </template>
          <SimpleView v-else-if="ui.view === 'simple'" large @from-song="emit('fromSong')" @piano="ui.pianoOpen = true; ui.view = 'roll'" @draw="ui.view = 'roll'; ui.tool = 'pencil'" />
          <SheetView v-else :abc="abc" large />
        </div>
        <PropertiesPanel v-if="showProps" />
      </div>
    </div>
  </Teleport>
</template>
