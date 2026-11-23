<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Take } from '../../composables/useTakes'
import { DOWNLOAD_FORMATS, downloadFormat } from '../../composables/useTrackDownload'
import type { DownloadFormat } from '../../composables/useTrackDownload'
import { formatClock, formatDayTime } from '../../composables/formatCreated'
import ReuseIcon from '../../components/shared/icons/ReuseIcon.vue'
import ScoreIcon from '../../components/score/ScoreIcon.vue'
import DownloadIcon from '../../components/shared/icons/DownloadIcon.vue'
import SplitStemsIcon from '../../components/shared/icons/SplitStemsIcon.vue'
import KeyboardIcon from '../../components/shared/icons/KeyboardIcon.vue'
import LyricsIcon from '../../components/shared/icons/LyricsIcon.vue'
import TrashIcon from '../../components/shared/icons/TrashIcon.vue'

/**
 * What can be done with a take, in one menu: the most frequent action of a session first, its facts at the
 * bottom, deleting apart and in red. Deleting takes a second click on the same item.
 */
const props = defineProps<{ take: Take; hasScore: boolean; canRename: boolean; canMidi: boolean; canCompare?: boolean }>()
const emit = defineEmits<{ act: [what: 'reuse' | 'notes' | 'download' | 'stems' | 'midi' | 'rename' | 'style' | 'delete' | 'compare', format?: DownloadFormat] }>()
const { t } = useI18n()

const el = ref<HTMLElement | null>(null)
/** Opens upwards when there is no room under the row (the player bar sits at the bottom of the window). */
const up = ref(false)
onMounted(async () => {
  await nextTick()
  const r = el.value?.getBoundingClientRect()
  if (r && r.bottom > window.innerHeight - 88) up.value = true
  el.value?.querySelector<HTMLElement>('[role=menuitem]')?.focus()
})

const armed = ref(false)
let disarmTimer: ReturnType<typeof setTimeout> | null = null
function onDelete(): void {
  if (armed.value) { emit('act', 'delete'); return }
  armed.value = true
  disarmTimer = setTimeout(() => { armed.value = false }, 4000)
}
onBeforeUnmount(() => { if (disarmTimer) clearTimeout(disarmTimer) })

const made = computed(() => {
  const d = formatDayTime(props.take.createdAt)
  // inside a sentence: "made today", not "made Today"
  return { ...d, day: d.day.charAt(0).toLocaleLowerCase() + d.day.slice(1) }
})
/** Up and down walk the items (round), Home and End jump to the ends, as in any menu. The items are out of the Tab
 *  order (tabindex -1), so Tab leaves the menu and the focus moving out closes it (useDismiss in TakeRow). */
function onKey(e: KeyboardEvent): void {
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return
  e.preventDefault()
  const items = [...(el.value?.querySelectorAll<HTMLElement>('[role=menuitem]') ?? [])]
  if (!items.length) return
  const i = items.indexOf(document.activeElement as HTMLElement)
  const to = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1
    : (i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length
  items[to]?.focus()
}
const ITEM = 'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-start text-[13px] text-text hover:bg-accent1/15 focus:bg-accent1/15 focus:outline-none'
</script>

<template>
  <div
    ref="el" role="menu" :aria-label="t('create.more')" class="absolute end-0 z-30 w-60 rounded-xl border border-border bg-panel-2 p-1 shadow-2xl"
    :class="up ? 'bottom-full mb-1' : 'top-full mt-1'" @keydown="onKey"
  >
    <template v-if="take.audioUrl">
      <button type="button" role="menuitem" tabindex="-1" :class="ITEM" @click="emit('act', 'reuse')"><ReuseIcon class="h-4 w-4 text-text-dim" />{{ t('create.reuseInForm') }}</button>
      <button v-if="hasScore" type="button" role="menuitem" tabindex="-1" :class="ITEM" :title="t('create.notes.openTakeTip')" @click="emit('act', 'notes')"><ScoreIcon name="notes" class="h-4 w-4 text-text-dim" />{{ t('create.notes.open') }}</button>
      <button v-if="canCompare" type="button" role="menuitem" tabindex="-1" :class="ITEM" @click="emit('act', 'compare')">
        <svg viewBox="0 0 24 24" class="h-4 w-4 text-text-dim" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4v16M17 4v16M3 8h8M13 16h8" /></svg>{{ t('takeCompare.title') }}
      </button>
      <!-- a saved take: download in a format (converted by the server); the remembered one is lit -->
      <div v-if="take.dbId != null" class="flex items-center gap-2.5 px-2 py-1 text-[13px] text-text">
        <DownloadIcon class="h-4 w-4 shrink-0 text-text-dim" /><span class="me-auto">{{ t('create.download') }}</span>
        <button
          v-for="f in DOWNLOAD_FORMATS" :key="f" type="button" role="menuitem" tabindex="-1"
          class="rounded-md border px-1.5 py-0.5 text-[11.5px] font-medium uppercase hover:bg-accent1/15 focus:bg-accent1/15 focus:outline-none"
          :class="f === downloadFormat ? 'border-accent1/60 text-text' : 'border-border text-text-dim'"
          :aria-label="t('create.downloadAs', { format: f.toUpperCase() })" :title="t(`create.formatHint.${f}`)"
          @click="emit('act', 'download', f)"
        >{{ f }}</button>
      </div>
      <button v-else type="button" role="menuitem" tabindex="-1" :class="ITEM" @click="emit('act', 'download')"><DownloadIcon class="h-4 w-4 text-text-dim" />{{ t('create.download') }}</button>
      <template v-if="take.dbId != null">
        <div class="mx-1 my-1 h-px bg-border" role="separator"></div>
        <button type="button" role="menuitem" tabindex="-1" :class="ITEM" @click="emit('act', 'stems')"><SplitStemsIcon class="h-4 w-4 text-text-dim" />{{ t('create.menu.stems') }}</button>
        <button v-if="canMidi" type="button" role="menuitem" tabindex="-1" :class="ITEM" @click="emit('act', 'midi')"><KeyboardIcon class="h-4 w-4 text-text-dim" />{{ t('create.menu.midi') }}</button>
      </template>
      <div class="mx-1 my-1 h-px bg-border" role="separator"></div>
      <button v-if="canRename" type="button" role="menuitem" tabindex="-1" :class="ITEM" @click="emit('act', 'rename')">
        <svg viewBox="0 0 24 24" class="h-4 w-4 text-text-dim" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z" /></svg>{{ t('create.menu.rename') }}
      </button>
      <button type="button" role="menuitem" tabindex="-1" :class="ITEM" @click="emit('act', 'style')"><LyricsIcon class="h-4 w-4 text-text-dim" />{{ t('create.styleAndLyrics') }}</button>
      <p class="px-2 pb-1.5 pt-1 text-[11.5px] leading-relaxed text-text-dim">
        <template v-if="take.seed != null">{{ t('trackCard.seed') }} <span class="tabular-nums text-text">{{ take.seed }}</span><br></template>
        {{ t('create.menu.made', { when: `${made.day}, ${made.time}`, len: formatClock(take.durationSec) }) }}<template v-if="take.wallSec">, {{ t('create.menu.took', { s: Math.round(take.wallSec) }) }}</template>
      </p>
      <div class="mx-1 my-1 h-px bg-border" role="separator"></div>
    </template>
    <button
      type="button" role="menuitem" tabindex="-1" :class="[ITEM, armed ? 'bg-status-failed/15 text-status-failed' : 'text-status-failed']" @click="onDelete"
    ><TrashIcon class="h-4 w-4" />{{ armed ? t('trackCard.confirmDelete') : t('trackCard.deleteTrack') }}</button>
  </div>
</template>
