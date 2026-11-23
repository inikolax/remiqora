<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { SECTION_TYPES, addSection, removeSection, renameSection, repeatSection, resizeSectionEdge, retypeSection } from '../../audio/score'
import type { Score, Section, SectionType } from '../../audio/score'
import { useScoreEditor } from './useScoreEditor'
import { SECTION_COLORS, SECTION_TAGS, sectionLabel } from './scoreUi'
import ScorePopover from './ScorePopover.vue'
import ScoreIcon from './ScoreIcon.vue'

/** The coloured ribbon of sections over the grid: drag an edge to move it, click for the section's menu. */
const ed = useScoreEditor()
const { ui } = ed
const { t } = useI18n()

const barPx = computed(() => ed.tpb.value * ui.ppt)
const visible = computed(() => {
  const s = ed.score.value
  const b0 = ui.scrollX / barPx.value
  const b1 = (ui.scrollX + ui.areaW) / barPx.value
  return s.sections.filter((x) => x.startBar + x.bars > b0 - 1 && x.startBar < b1 + 1).map((x) => {
    const l = x.startBar * barPx.value - ui.scrollX
    const r = (x.startBar + x.bars) * barPx.value - ui.scrollX
    return { s: x, left: l + 2, width: Math.max(4, r - l - 4), label: sectionLabel(s, x, t) }
  })
})
const endX = computed(() => {
  const s = ed.score.value
  const last = s.sections[s.sections.length - 1]
  const bar = last ? last.startBar + last.bars : s.bars
  return bar * barPx.value - ui.scrollX
})

// ---- edge drags ----
let drag: { id: string; edge: 'start' | 'end'; base: Score; x0: number; moved: boolean } | null = null
function onGrip(e: PointerEvent, s: Section, edge: 'start' | 'end'): void {
  e.stopPropagation()
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  drag = { id: s.id, edge, base: ed.score.value, x0: e.clientX, moved: false }
}
function onMove(e: PointerEvent): void {
  if (!drag) return
  const area = (e.currentTarget as HTMLElement).closest('[data-area]') as HTMLElement | null
  const r = area?.getBoundingClientRect()
  if (!r) return
  if (Math.abs(e.clientX - drag.x0) > 2) drag.moved = true
  const bar = Math.round((e.clientX - r.left + ui.scrollX) / barPx.value)
  ed.preview(resizeSectionEdge(drag.base, drag.id, drag.edge, bar))
}
function onUp(): void {
  if (!drag) return
  const d = drag
  drag = null
  // a click without a drag may still have previewed a snap of the edge: the score goes back as it was
  if (d.moved) ed.commit()
  else ed.preview(d.base)
}
function onCancel(): void {
  if (!drag) return
  const d = drag
  drag = null
  ed.preview(d.base)
}

// ---- the menu ----
const menuFor = ref<string | null>(null)
const menuAnchor = ref<HTMLElement | null>(null)
const addOpen = ref(false)
const addAnchor = ref<HTMLElement | null>(null)
const current = computed(() => ed.score.value.sections.find((s) => s.id === menuFor.value) ?? null)
const renameText = ref('')
function openMenu(e: MouseEvent, s: Section): void {
  menuAnchor.value = e.currentTarget as HTMLElement
  menuFor.value = s.id
  renameText.value = s.label ?? ''
}
const lyricTag = computed(() => {
  const s = current.value
  if (!s) return ''
  const sameType = ed.score.value.sections.filter((x) => x.type === s.type)
  const n = sameType.indexOf(s) + 1
  return `[${SECTION_TAGS[s.type]}${sameType.length > 1 && s.type !== 'chorus' ? ` ${n}` : ''}]`
})
function retype(type: SectionType): void {
  if (!current.value) return
  ed.commit(retypeSection(ed.score.value, current.value.id, type))
}
function rename(): void {
  if (!current.value) return
  const label = renameText.value.trim()
  if ((current.value.label ?? '') === label) return
  ed.commit(renameSection(ed.score.value, current.value.id, label))
}
function repeat(): void {
  if (!current.value) return
  const r = repeatSection(ed.score.value, current.value.id)
  ed.commit(r.score)
  menuFor.value = null
}
function addAfter(type: SectionType, after: string | null): void {
  const r = addSection(ed.score.value, { type, after })
  ed.commit(r.score)
  menuFor.value = null
  addOpen.value = false
}
function remove(deleteBars: boolean): void {
  if (!current.value) return
  ed.commit(removeSection(ed.score.value, current.value.id, { deleteBars }))
  menuFor.value = null
}
function show(): void {
  if (!current.value) return
  ed.showBars(current.value.startBar, current.value.startBar + current.value.bars)
  menuFor.value = null
}
</script>

<template>
  <div class="relative h-full overflow-hidden" data-area>
    <button
      v-for="v in visible" :key="v.s.id" type="button"
      class="absolute bottom-1 top-1 flex items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-md px-2.5 text-[11.5px] font-semibold"
      :style="{ left: `${v.left}px`, width: `${v.width}px`, background: SECTION_COLORS[v.s.type][0], color: SECTION_COLORS[v.s.type][1], boxShadow: menuFor === v.s.id ? '0 0 0 1.5px #fff inset' : undefined }"
      :aria-label="t('score.sections.menuFor', { name: v.label })" :aria-haspopup="'dialog'"
      @click="openMenu($event, v.s)" @dblclick="ed.showBars(v.s.startBar, v.s.startBar + v.s.bars)"
    >
      <span class="absolute inset-y-[3px] start-[3px] w-1 cursor-ew-resize rounded-sm bg-white/55" :title="t('score.sections.dragEdge')" @pointerdown="onGrip($event, v.s, 'start')" @pointermove="onMove" @pointerup="onUp" @pointercancel="onCancel" @click.stop></span>
      <span dir="auto" class="ms-1 truncate">{{ v.label }}</span>
      <small class="truncate text-[10.5px] font-medium opacity-70">{{ v.s.bars }} {{ t('score.sections.barsShort') }}</small>
      <span class="absolute inset-y-[3px] end-[3px] w-1 cursor-ew-resize rounded-sm bg-white/55" :title="t('score.sections.dragEdge')" @pointerdown="onGrip($event, v.s, 'end')" @pointermove="onMove" @pointerup="onUp" @pointercancel="onCancel" @click.stop></span>
    </button>
    <button
      v-if="endX > -20 && endX < ui.areaW" ref="addAnchor" type="button"
      class="absolute top-[5px] grid h-[18px] w-[18px] place-items-center rounded-[5px] bg-[#2a2a37] text-[13px] text-text-dim hover:text-text"
      :style="{ left: `${endX + 4}px` }" :title="t('score.sections.add')" :aria-label="t('score.sections.add')"
      @click="addOpen = true"
    >+</button>

    <ScorePopover :open="addOpen" :anchor="addAnchor" :label="t('score.sections.add')" :width="260" @close="addOpen = false">
      <div class="p-3">
        <p class="se-h">{{ t('score.sections.add') }}</p>
        <p class="se-d mb-2">{{ t('score.sections.addHint') }}</p>
        <div class="flex flex-wrap gap-1.5">
          <button v-for="ty in SECTION_TYPES" :key="ty" type="button" class="se-ssec" :style="{ background: SECTION_COLORS[ty][0], color: SECTION_COLORS[ty][1] }" @click="addAfter(ty, ed.score.value.sections[ed.score.value.sections.length - 1]?.id ?? null)">{{ t(`score.sectionTypes.${ty}`) }}</button>
        </div>
      </div>
    </ScorePopover>

    <ScorePopover :open="!!current" :anchor="menuAnchor" :label="current ? sectionLabel(ed.score.value, current, t) : ''" :width="330" @close="menuFor = null">
      <div v-if="current" class="se-menu p-2.5">
        <p class="se-h">{{ t('score.sections.title', { name: sectionLabel(ed.score.value, current, t) }) }}</p>
        <p class="se-d mb-2">{{ t('score.sections.barsRange', { from: current.startBar + 1, to: current.startBar + current.bars, tag: lyricTag }) }}</p>
        <div class="mb-2 flex flex-wrap gap-1.5" role="radiogroup" :aria-label="t('score.sections.type')">
          <button
            v-for="ty in SECTION_TYPES" :key="ty" type="button" role="radio" :aria-checked="current.type === ty" class="se-ssec"
            :style="{ background: SECTION_COLORS[ty][0], color: SECTION_COLORS[ty][1], boxShadow: current.type === ty ? '0 0 0 1.5px #fff inset' : undefined }"
            @click="retype(ty)"
          >{{ t(`score.sectionTypes.${ty}`) }}</button>
        </div>
        <label class="mb-1 flex items-center gap-2 px-1 text-[12px] text-text-dim">
          <span class="shrink-0">{{ t('score.sections.rename') }}</span>
          <input v-model="renameText" class="se-input min-w-0 flex-1" :placeholder="t(`score.sectionTypes.${current.type}`)" @keydown.enter.prevent="rename" @blur="rename" />
        </label>
        <button type="button" class="it" @click="repeat"><span class="ic"><ScoreIcon name="copy" /></span><span><b>{{ t('score.sections.repeat') }}</b><small>{{ t('score.sections.repeatHint') }}</small></span></button>
        <button type="button" class="it" @click="addAfter(current.type, current.id)"><span class="ic"><ScoreIcon name="plus" /></span><span><b>{{ t('score.sections.addAfter') }}</b><small>{{ t('score.sections.addAfterHint') }}</small></span></button>
        <button type="button" class="it" @click="show"><span class="ic"><ScoreIcon name="eye" /></span><span><b>{{ t('score.sections.show') }}</b><small>{{ t('score.sections.showHint') }}</small></span></button>
        <div class="hr"></div>
        <div class="flex gap-1.5 px-1 pt-1">
          <button type="button" class="se-btn" @click="remove(false)">{{ t('score.sections.unlabel') }}</button>
          <button type="button" class="se-btn danger" @click="remove(true)"><ScoreIcon name="trash" />{{ t('score.sections.deleteBars') }}</button>
        </div>
      </div>
    </ScorePopover>
  </div>
</template>
