<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { cleanTag, sameTag, useMarksStore } from '../../stores/marks'
import { useCoversStore } from '../../stores/covers'
import { useDismiss } from '../../composables/useDismiss'
import { PromptCancelled, coverIdeaFor, titleIdeaOf, useAutoTitle } from '../../composables/useAutoTitle'
import { coverIdeaOf, useCoverDescribe } from '../../composables/useCoverDescribe'
import { coverPrompt } from '../../api/covers'
import * as tracksApi from '../../api/tracks'
import { loadCover } from '../../covers/caption/bake'
import { FONTS } from '../../covers/caption/fonts'
import { fontForGenre, pickLayout } from '../../covers/caption/pick'
import { FONT_KEYS, LAYOUT_IDS } from '../../covers/caption/types'
import type { CaptionFont, CaptionLayout, CoverCaption } from '../../covers/caption/types'
import type { LibTrack } from './libraryTracks'
import type { CheckState } from './useSelection'
import SelectBox from './SelectBox.vue'
import StarIcon from '../../components/shared/icons/StarIcon.vue'
import TrashIcon from '../../components/shared/icons/TrashIcon.vue'
import ReuseIcon from '../../components/shared/icons/ReuseIcon.vue'
import ChevronIcon from '../../components/shared/icons/ChevronIcon.vue'
import CheckIcon from '../../components/shared/icons/CheckIcon.vue'
import SparklesIcon from '../../components/shared/icons/SparklesIcon.vue'
import ImageIcon from '../../components/shared/icons/ImageIcon.vue'

/**
 * What can be done to the ticked tracks at once. In the library: the star, a tag, a collection, the trash; in the
 * trash: restore or delete for good. The star, the tags and the collections are done here through the marks
 * store; the trash moves are the page's (it keeps the lists, the player and the undo).
 */
const props = defineProps<{ ids: number[]; mode: 'library' | 'trash'; allCount: number; allState: CheckState; trackOf?: (id: number) => LibTrack | undefined }>()
const emit = defineEmits<{ clear: []; toggleAll: []; trash: []; restore: []; purge: []; announce: [text: string]; renamed: [] }>()
const { t } = useI18n()
const marks = useMarksStore()
const covers = useCoversStore()

// ---- covers for the selection: one request for all; the page shows the run's progress ("2 of 5") ----
// With the prompt assistant ready, the tracks without a kept description are described first, one by one
// ("Describing 2 of 5", Stop), and then all covers go in one request: the GPU switches only twice (to the assistant
// when it runs there, then to the cover model). Without it the server describes them itself.
const coversRunning = computed(() => !!covers.batchProgress?.running)
const describer = useCoverDescribe()
const describingCovers = ref<{ done: number; total: number } | null>(null)
const coverNote = ref('')
let stopCovers = false
/** The kept description of a track; '' without one. */
async function savedCoverPrompt(id: number): Promise<string> {
  try {
    const p = await coverPrompt(id)
    return p.source === 'saved' ? p.prompt.trim() : ''
  } catch {
    return ''
  }
}
async function makeCovers(): Promise<void> {
  if (coversRunning.value || describingCovers.value) return
  const ids = [...props.ids]
  coverNote.value = ''
  const prompts: Record<number, string> = {}
  if (await describer.ensure()) {
    const todo: LibTrack[] = []
    for (const id of ids) {
      const track = props.trackOf?.(id)
      if (!track || (await savedCoverPrompt(id))) continue
      const idea = coverIdeaFor(id)
      if (idea) prompts[id] = idea
      else if (coverIdeaOf(track)) todo.push(track)
    }
    if (todo.length) {
      stopCovers = false
      describingCovers.value = { done: 0, total: todo.length }
      try {
        for (const track of todo) {
          if (stopCovers) break
          try {
            prompts[track.id] = await describer.describe(track)
          } catch (e) {
            if (e instanceof PromptCancelled || stopCovers) { stopCovers = true; break }
            coverNote.value = t('covers.describeFailed', { error: e instanceof Error ? e.message : String(e) })
            break
          }
          describingCovers.value = { done: describingCovers.value.done + 1, total: todo.length }
        }
      } finally {
        describingCovers.value = null
      }
      // Stop or a failure: nothing is drawn (what was described is not kept either)
      if (stopCovers || coverNote.value) {
        if (coverNote.value) emit('announce', coverNote.value)
        return
      }
    }
  }
  const made = await run(() => covers.make(ids, { bulk: true, prompts }))
  if (made === null) emit('announce', covers.error)
}
function stopDescribingCovers(): void {
  stopCovers = true
  describer.cancel()
}

const n = computed(() => props.ids.length)
const busy = ref(false)
async function run<T>(job: () => Promise<T>): Promise<T | undefined> {
  if (busy.value) return undefined
  busy.value = true
  try {
    return await job()
  } finally {
    busy.value = false
  }
}

// ---- the star: on for all, unless all have it already ----
const allFavorite = computed(() => props.ids.length > 0 && props.ids.every((id) => marks.isFavorite(id)))
async function favorite(): Promise<void> {
  const off = allFavorite.value
  const done = await run(() => marks.bulk(props.ids, off ? 'unfavorite' : 'favorite'))
  if (done) emit('announce', t(off ? 'libraryPage.bulk.unfavorited' : 'libraryPage.bulk.favorited', { n: done.length }, done.length))
}

/** How much of the selection a mark covers: all of it, some, none. */
function cover(isIn: (id: number) => boolean): CheckState {
  const k = props.ids.reduce((s, id) => s + Number(isIn(id)), 0)
  return k === 0 ? false : k === props.ids.length ? true : 'mixed'
}
const ariaChecked = (s: CheckState): 'true' | 'false' | 'mixed' => (s === 'mixed' ? 'mixed' : s ? 'true' : 'false')

// ---- the popovers: one open at a time ----
type Menu = 'tag' | 'col' | 'cap'
const menu = ref<Menu | null>(null)
const tagOpen = ref(false)
const colOpen = ref(false)
const capOpen = ref(false)
watch(menu, (m) => { tagOpen.value = m === 'tag'; colOpen.value = m === 'col'; capOpen.value = m === 'cap' })
const tagTrigger = ref<HTMLButtonElement | null>(null)
const tagPanel = ref<HTMLElement | null>(null)
const colTrigger = ref<HTMLButtonElement | null>(null)
const colPanel = ref<HTMLElement | null>(null)
const capTrigger = ref<HTMLButtonElement | null>(null)
const capPanel = ref<HTMLElement | null>(null)
const close = (): void => { menu.value = null }
useDismiss(tagOpen, () => [tagTrigger.value, tagPanel.value], close, { returnTo: () => tagTrigger.value })
useDismiss(colOpen, () => [colTrigger.value, colPanel.value], close, { returnTo: () => colTrigger.value })
useDismiss(capOpen, () => [capTrigger.value, capPanel.value], close, { returnTo: () => capTrigger.value })
async function openMenu(m: Menu): Promise<void> {
  if (menu.value === m) { close(); return }
  menu.value = m
  tagText.value = ''
  naming.value = false
  await nextTick()
  if (m === 'tag') tagInput.value?.focus()
  else if (m === 'cap') capPanel.value?.querySelector<HTMLElement>('select')?.focus()
  else colPanel.value?.querySelector<HTMLElement>('[role^=menuitem]')?.focus()
}

// ---- captions over the covers: one style for the whole selection (an album's look), one cover at a time ----
const capLayout = ref<CaptionLayout | 'auto'>('auto')
const capFont = ref<CaptionFont | 'genre'>('genre')
const capColor = ref<'auto' | 'light' | 'dark'>('auto')
const capLines = reactive({ showArtist: true, showTitle: true, showYear: true })
const withCover = computed(() => props.ids.filter((id) => !!covers.urlFor(id)))
const withCaption = computed(() => props.ids.filter((id) => !!covers.captionFor(id)))
const captioning = ref<{ done: number; total: number } | null>(null)
const capNote = ref('')
let stopCaps = false
async function captionAll(remove = false): Promise<void> {
  if (captioning.value) return
  const ids = remove ? [...withCaption.value] : [...withCover.value]
  const skipped = remove ? 0 : props.ids.length - ids.length
  close()
  if (!ids.length) return
  stopCaps = false
  capNote.value = ''
  captioning.value = { done: 0, total: ids.length }
  let done = 0
  let failed = ''
  try {
    for (const id of ids) {
      if (stopCaps) break
      const track = props.trackOf?.(id)
      let caption: CoverCaption | null = null
      if (!remove) {
        const font = capFont.value === 'genre' ? fontForGenre(track?.style ?? '') : capFont.value
        let layout: CaptionLayout = capLayout.value === 'auto' ? 'classic' : capLayout.value
        if (capLayout.value === 'auto') {
          try { layout = pickLayout((await loadCover(covers.urlFor(id)!)).A, font, track?.style ?? '') } catch { /* the bake below reports it */ }
        }
        caption = { layout, font, ...capLines, ...(capColor.value !== 'auto' ? { color: capColor.value } : {}) }
      }
      if (!(await covers.saveCaption(id, caption, track ? { title: track.title, createdAt: track.createdAt } : undefined))) {
        failed = covers.error
        break
      }
      done++
      captioning.value = { done, total: ids.length }
    }
  } finally {
    captioning.value = null
  }
  const parts = [failed ? t('covers.caption.bulkFailed', { n: done, error: failed }, done)
    : stopCaps ? t('covers.caption.bulkStopped', { n: done, total: ids.length })
      : t(remove ? 'covers.caption.bulkRemoved' : 'covers.caption.bulkDone', { n: done }, done)]
  if (skipped) parts.push(t('covers.caption.bulkSkipped', { n: skipped }, skipped))
  capNote.value = parts.join(' · ')
  emit('announce', capNote.value)
}
function stopCaptioning(): void {
  stopCaps = true
}
// the selection is gone (cleared, all trashed): nothing to act on
watch(n, (v) => { if (!v) close() })

/** Up and down walk the items of the open menu; down from the field goes into the list. */
function onMenuKey(e: KeyboardEvent, panel: HTMLElement | null): void {
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key) || !panel) return
  const items = [...panel.querySelectorAll<HTMLElement>('[role^=menuitem]')]
  if (!items.length) return
  e.preventDefault()
  const i = items.indexOf(document.activeElement as HTMLElement)
  const to = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1
    : i === -1 ? (e.key === 'ArrowDown' ? 0 : items.length - 1)
      : (i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length
  items[to]?.focus()
}

// ---- tags ----
const tagText = ref('')
const tagInput = ref<HTMLInputElement | null>(null)
const typed = computed(() => cleanTag(tagText.value))
const tagItems = computed(() => {
  const q = typed.value.toLocaleLowerCase()
  return marks.tagList.filter((x) => !q || x.name.toLocaleLowerCase().includes(q))
})
const typedIsNew = computed(() => typed.value !== '' && !marks.tagList.some((x) => sameTag(x.name, typed.value)))
const tagState = (name: string): CheckState => cover((id) => marks.hasTag(id, name))
async function setTag(name: string, on: boolean): Promise<void> {
  const done = await run(() => marks.bulk(props.ids, on ? 'tag' : 'untag', { tag: name }))
  if (done) emit('announce', t(on ? 'libraryPage.bulk.tagged' : 'libraryPage.bulk.untagged', { tag: name, n: done.length }, done.length))
}
async function addTyped(): Promise<void> {
  const name = typed.value
  if (!name) return
  tagText.value = ''
  await setTag(name, true)
  // the "Add #tag" item that may have had the focus is gone: back to the field
  tagInput.value?.focus()
}

// ---- collections ----
const colState = (id: number): CheckState => cover((tid) => marks.collections.find((c) => c.id === id)?.track_ids.includes(tid) ?? false)
async function setCollection(id: number, on: boolean): Promise<void> {
  const name = marks.collections.find((c) => c.id === id)?.name ?? ''
  const done = await run(() => marks.bulk(props.ids, on ? 'collect' : 'uncollect', { collection_id: id }))
  if (done) emit('announce', t(on ? 'libraryPage.bulk.collected' : 'libraryPage.bulk.uncollected', { name, n: done.length }, done.length))
}
const naming = ref(false)
const colName = ref('')
const colInput = ref<HTMLInputElement | null>(null)
function startNaming(): void {
  naming.value = true
  colName.value = ''
  void nextTick(() => colInput.value?.focus())
}
async function createAndAdd(): Promise<void> {
  const name = colName.value.trim()
  naming.value = false
  colName.value = ''
  if (!name) return
  const created = await run(() => marks.createCollection(name))
  if (created) await setCollection(created.id, true)
  await nextTick()
  colPanel.value?.querySelector<HTMLElement>('[role^=menuitem]')?.focus()
}

// ---- names from the prompt assistant, one track at a time: progress, Stop, and an undo for the whole batch ----
const autoTitle = useAutoTitle()
const titling = ref<{ done: number; total: number } | null>(null)
const titled = ref<{ id: number; from: string; to: string }[] | null>(null)
const titleNote = ref('')
let stopTitles = false
const tracksToName = computed(() => props.ids.map((id) => props.trackOf?.(id)).filter((x): x is LibTrack => !!x && !!titleIdeaOf(x)))
const canTitle = computed(() => autoTitle.ready.value && tracksToName.value.length > 0)
async function nameAll(): Promise<void> {
  if (titling.value || !canTitle.value) return
  const list = tracksToName.value
  const out: { id: number; from: string; to: string }[] = []
  titled.value = null
  titleNote.value = ''
  stopTitles = false
  titling.value = { done: 0, total: list.length }
  let failed = ''
  try {
    for (const track of list) {
      if (stopTitles) break
      try {
        const { title } = await autoTitle.suggest(track)
        await tracksApi.renameTrack(track.id, title)
        out.push({ id: track.id, from: track.title, to: title })
      } catch (e) {
        if (e instanceof PromptCancelled || stopTitles) break
        failed = e instanceof Error ? e.message : String(e)
        break
      }
      titling.value = { done: titling.value!.done + 1, total: list.length }
    }
  } finally {
    titling.value = null
  }
  if (out.length) {
    titled.value = out
    emit('renamed')
  }
  titleNote.value = failed ? t('autoTitle.bulkFailed', { n: out.length, error: failed }, out.length)
    : t(stopTitles ? 'autoTitle.bulkStopped' : 'autoTitle.bulkDone', { n: out.length, total: list.length }, out.length)
  emit('announce', titleNote.value)
}
function stopNaming(): void {
  stopTitles = true
  autoTitle.cancel()
}
async function undoTitles(): Promise<void> {
  const list = titled.value
  titled.value = null
  if (!list) return
  for (const x of list) await tracksApi.renameTrack(x.id, x.from).catch(() => {})
  titleNote.value = t('autoTitle.bulkUndone', { n: list.length }, list.length)
  emit('renamed')
  emit('announce', titleNote.value)
}
onBeforeUnmount(() => { stopTitles = true; autoTitle.cancel(); stopCovers = true; describer.cancel(); stopCaps = true })

// ---- delete for good (the trash): two clicks, the first arms the button for a few seconds ----
const purgeArmed = ref(false)
let purgeTimer: ReturnType<typeof setTimeout> | null = null
function disarm(): void {
  purgeArmed.value = false
  if (purgeTimer) clearTimeout(purgeTimer)
  purgeTimer = null
}
function purge(): void {
  if (purgeArmed.value) {
    disarm()
    emit('purge')
    return
  }
  purgeArmed.value = true
  purgeTimer = setTimeout(disarm, 4000)
}
watch(() => props.ids, disarm)
onBeforeUnmount(disarm)

const BTN = 'flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs text-text hover:bg-panel-2 disabled:opacity-50'
const PANEL = 'absolute start-0 top-full z-30 mt-1 w-64 rounded-lg border border-border bg-panel p-1.5 shadow-xl shadow-black/40'
const CAP_PANEL = 'absolute start-0 top-full z-30 mt-1 w-72 max-w-[calc(100vw-2rem)] space-y-2.5 rounded-lg border border-border bg-panel p-2.5 shadow-xl shadow-black/40'
const ITEM = 'flex min-h-8 w-full items-center gap-2 rounded-md px-2 py-1 text-start text-xs text-text hover:bg-accent1/15 focus:bg-accent1/15 focus:outline-none'
</script>

<template>
  <div role="toolbar" :aria-label="t('libraryPage.bulk.label')" class="flex flex-wrap items-center gap-1.5 border-b border-border bg-panel px-3 py-2">
    <SelectBox :state="allState" :label="t('libraryPage.bulk.selectAll', { n: allCount })" @toggle="emit('toggleAll')" />
    <span class="me-1 text-xs font-medium tabular-nums text-text">{{ t('libraryPage.bulk.selected', { n }) }}</span>
    <button type="button" class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-dim hover:bg-panel-2 hover:text-text" :title="t('libraryPage.bulk.clear')" :aria-label="t('libraryPage.bulk.clear')" @click="emit('clear')">✕</button>
    <span class="mx-1 h-5 w-px bg-border" aria-hidden="true"></span>

    <template v-if="mode === 'library'">
      <button type="button" :class="BTN" :disabled="busy" @click="favorite">
        <StarIcon class="h-3.5 w-3.5" :class="allFavorite ? 'text-status-queued' : ''" />{{ allFavorite ? t('favorite.remove') : t('favorite.add') }}
      </button>

      <!-- a tag: type a new one (Enter) or tick the existing ones; the mark says how many of the selection have it -->
      <div class="relative">
        <button
          ref="tagTrigger" type="button" :class="BTN" aria-haspopup="true" :aria-expanded="menu === 'tag'" :disabled="busy && menu !== 'tag'"
          @click="openMenu('tag')"
        ># {{ t('libraryPage.bulk.tag') }}<ChevronIcon class="h-3 w-3 transition-transform" :class="menu === 'tag' ? 'rotate-180' : ''" /></button>
        <div v-if="menu === 'tag'" ref="tagPanel" :class="PANEL" @keydown="onMenuKey($event, tagPanel)">
          <form @submit.prevent="addTyped">
            <input
              ref="tagInput" v-model="tagText" type="text" maxlength="40" class="w-full rounded-md border border-border bg-panel-2 px-2 py-1.5 text-xs text-text outline-none focus:border-accent1/60"
              :placeholder="t('libraryPage.bulk.tagPlaceholder')" :aria-label="t('libraryPage.bulk.tagPlaceholder')"
            />
          </form>
          <div role="menu" :aria-label="t('libraryPage.groups.tags')" class="mt-1 max-h-60 overflow-y-auto">
            <button v-if="typedIsNew" type="button" role="menuitem" :class="ITEM" @click="addTyped">
              <span class="text-accent1-text">+</span><span class="min-w-0 truncate">{{ t('libraryPage.bulk.addTag', { tag: typed }) }}</span>
            </button>
            <button
              v-for="tag in tagItems" :key="tag.name" type="button" role="menuitemcheckbox" :aria-checked="ariaChecked(tagState(tag.name))" :class="ITEM"
              @click="setTag(tag.name, tagState(tag.name) !== true)"
            >
              <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded border" :class="tagState(tag.name) ? 'border-transparent bg-accent1-strong text-white' : 'border-text-dim/70'" aria-hidden="true">
                <CheckIcon v-if="tagState(tag.name) === true" class="h-3 w-3" />
                <span v-else-if="tagState(tag.name) === 'mixed'" class="h-0.5 w-2 rounded-full bg-white"></span>
              </span>
              <span class="min-w-0 flex-1 truncate">#{{ tag.name }}</span>
              <span class="tabular-nums text-text-dim">{{ tag.count }}</span>
            </button>
            <p v-if="!tagItems.length && !typedIsNew" class="px-2 py-1.5 text-xs text-text-dim">{{ t('libraryPage.bulk.noTags') }}</p>
          </div>
        </div>
      </div>

      <!-- a collection: tick it for the whole selection, or make a new one and put them in it -->
      <div class="relative">
        <button
          ref="colTrigger" type="button" :class="BTN" aria-haspopup="menu" :aria-expanded="menu === 'col'" :disabled="busy && menu !== 'col'"
          @click="openMenu('col')"
        >{{ t('libraryPage.bulk.collection') }}<ChevronIcon class="h-3 w-3 transition-transform" :class="menu === 'col' ? 'rotate-180' : ''" /></button>
        <div v-if="menu === 'col'" ref="colPanel" :class="PANEL" @keydown="onMenuKey($event, colPanel)">
          <div role="menu" :aria-label="t('libraryPage.groups.collections')" class="max-h-60 overflow-y-auto">
            <button
              v-for="c in marks.collections" :key="c.id" type="button" role="menuitemcheckbox" :aria-checked="ariaChecked(colState(c.id))" :class="ITEM"
              @click="setCollection(c.id, colState(c.id) !== true)"
            >
              <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded border" :class="colState(c.id) ? 'border-transparent bg-accent1-strong text-white' : 'border-text-dim/70'" aria-hidden="true">
                <CheckIcon v-if="colState(c.id) === true" class="h-3 w-3" />
                <span v-else-if="colState(c.id) === 'mixed'" class="h-0.5 w-2 rounded-full bg-white"></span>
              </span>
              <span class="min-w-0 flex-1 truncate">{{ c.name }}</span>
            </button>
            <button v-if="!naming" type="button" role="menuitem" :class="[ITEM, 'text-text-dim']" @click="startNaming">{{ t('libraryPage.bulk.newCollection') }}</button>
          </div>
          <form v-if="naming" class="mt-1" @submit.prevent="createAndAdd">
            <input
              ref="colInput" v-model="colName" type="text" maxlength="80" class="w-full rounded-md border border-accent1/60 bg-panel-2 px-2 py-1.5 text-xs text-text outline-none"
              :placeholder="t('libraryPage.collectionName')" :aria-label="t('libraryPage.collectionName')" @keydown.esc.stop="naming = false"
            />
          </form>
        </div>
      </div>

      <button
        type="button" :class="BTN" :disabled="busy || !!titling || !canTitle" :title="autoTitle.ready.value ? t('autoTitle.bulkHint') : t('autoTitle.noAssistant')"
        @click="nameAll"
      ><SparklesIcon class="h-3.5 w-3.5" />{{ t('autoTitle.bulk') }}</button>

      <button
        v-if="covers.enabled" type="button" :class="BTN" :disabled="busy || coversRunning || !!describingCovers" :title="t('covers.bulkHint')" @click="makeCovers"
      ><ImageIcon class="h-3.5 w-3.5" />{{ t('covers.bulk') }}</button>

      <!-- captions: one style for all the selected covers, or a layout picked for each -->
      <div v-if="covers.enabled" class="relative">
        <button
          ref="capTrigger" type="button" :class="BTN" aria-haspopup="dialog" :aria-expanded="menu === 'cap'" :disabled="(busy || !!captioning) && menu !== 'cap'" :title="t('covers.caption.bulkHint')"
          @click="openMenu('cap')"
        >Aa {{ t('covers.caption.bulk') }}<ChevronIcon class="h-3 w-3 transition-transform" :class="menu === 'cap' ? 'rotate-180' : ''" /></button>
        <form v-if="menu === 'cap'" ref="capPanel" role="dialog" :aria-label="t('covers.caption.bulk')" :class="CAP_PANEL" @submit.prevent="captionAll()">
          <label class="block space-y-1 text-xs text-text-dim">
            <span class="font-semibold">{{ t('covers.caption.layout') }}</span>
            <select v-model="capLayout" class="w-full rounded-md border border-border bg-panel-2 px-2 py-1.5 text-xs text-text outline-none focus:border-accent1/60">
              <option value="auto">{{ t('covers.caption.autoLayout') }}</option>
              <option v-for="l in LAYOUT_IDS" :key="l" :value="l">{{ t(`covers.caption.layouts.${l}`) }}</option>
            </select>
          </label>
          <label class="block space-y-1 text-xs text-text-dim">
            <span class="font-semibold">{{ t('covers.caption.font') }}</span>
            <select v-model="capFont" class="w-full rounded-md border border-border bg-panel-2 px-2 py-1.5 text-xs text-text outline-none focus:border-accent1/60">
              <option value="genre">{{ t('covers.caption.genreFont') }}</option>
              <option v-for="k in FONT_KEYS" :key="k" :value="k">{{ FONTS[k].label }}</option>
            </select>
          </label>
          <label class="block space-y-1 text-xs text-text-dim">
            <span class="font-semibold">{{ t('covers.caption.color') }}</span>
            <select v-model="capColor" class="w-full rounded-md border border-border bg-panel-2 px-2 py-1.5 text-xs text-text outline-none focus:border-accent1/60">
              <option v-for="c in (['auto', 'light', 'dark'] as const)" :key="c" :value="c">{{ t(`covers.studio.${c}`) }}</option>
            </select>
          </label>
          <fieldset class="text-xs text-text">
            <legend class="mb-1 font-semibold text-text-dim">{{ t('covers.caption.lines') }}</legend>
            <div class="flex flex-wrap gap-x-3 gap-y-1">
              <label class="flex items-center gap-1.5"><input v-model="capLines.showArtist" type="checkbox" class="h-3.5 w-3.5 accent-accent1" />{{ t('covers.caption.artist') }}</label>
              <label class="flex items-center gap-1.5"><input v-model="capLines.showTitle" type="checkbox" class="h-3.5 w-3.5 accent-accent1" />{{ t('covers.caption.title') }}</label>
              <label class="flex items-center gap-1.5"><input v-model="capLines.showYear" type="checkbox" class="h-3.5 w-3.5 accent-accent1" />{{ t('covers.caption.year') }}</label>
            </div>
          </fieldset>
          <p v-if="!withCover.length" class="text-xs text-text-dim">{{ t('covers.caption.noCovers') }}</p>
          <p v-else-if="withCover.length < ids.length" class="text-xs text-text-dim">{{ t('covers.caption.willSkip', { n: ids.length - withCover.length }, ids.length - withCover.length) }}</p>
          <div class="flex flex-wrap gap-1.5">
            <button
              type="submit" class="inline-flex min-h-7 items-center rounded-md bg-accent1-strong px-2.5 py-1 text-xs font-medium text-white hover:brightness-110 disabled:opacity-50"
              :disabled="!withCover.length || (!capLines.showArtist && !capLines.showTitle && !capLines.showYear)"
            >{{ t('covers.caption.apply', { n: withCover.length }, withCover.length) }}</button>
            <button v-if="withCaption.length" type="button" class="inline-flex min-h-7 items-center rounded-md border border-border px-2.5 py-1 text-xs text-text-dim hover:bg-panel-2 hover:text-status-failed" @click="captionAll(true)">{{ t('covers.caption.bulkRemove') }}</button>
          </div>
        </form>
      </div>

      <button type="button" :class="[BTN, 'text-text-dim hover:text-status-failed']" :disabled="busy" @click="emit('trash')">
        <TrashIcon class="h-3.5 w-3.5" />{{ t('libraryPage.delete') }}
      </button>
    </template>

    <template v-else>
      <button type="button" :class="BTN" :disabled="busy" @click="emit('restore')"><ReuseIcon class="h-3.5 w-3.5" />{{ t('libraryPage.trash.restore') }}</button>
      <button
        type="button" :class="[BTN, purgeArmed ? 'border-status-failed/60 bg-status-failed/10 font-medium text-status-failed' : 'text-text-dim hover:text-status-failed']"
        @click="purge" @blur="disarm"
      ><TrashIcon class="h-3.5 w-3.5" />{{ purgeArmed ? t('libraryPage.trash.confirmPurge') : t('libraryPage.trash.purge') }}</button>
    </template>
    <!-- covers: the assistant describes the pictures first, with Stop; a failure stays until dismissed -->
    <div v-if="describingCovers || coverNote" class="flex basis-full items-center gap-3 text-xs text-text" role="status">
      <template v-if="describingCovers">
        <ImageIcon class="h-3.5 w-3.5 shrink-0 animate-pulse text-accent1-text motion-reduce:animate-none" />
        <span class="min-w-0 flex-1 tabular-nums">{{ t('covers.bulkDescribing', { done: Math.min(describingCovers.done + 1, describingCovers.total), total: describingCovers.total }) }}</span>
        <button type="button" class="rounded-md px-1.5 py-1 font-medium text-accent1-text hover:underline" @click="stopDescribingCovers">{{ t('covers.stop') }}</button>
      </template>
      <template v-else>
        <span class="min-w-0 flex-1 text-status-failed">{{ coverNote }}</span>
        <button type="button" class="flex h-6 w-6 items-center justify-center rounded-md text-text-dim hover:text-text" :aria-label="t('covers.dismiss')" :title="t('covers.dismiss')" @click="coverNote = ''">✕</button>
      </template>
    </div>
    <!-- captions: progress with Stop, then how many were captioned and skipped -->
    <div v-if="captioning || capNote" class="flex basis-full items-center gap-3 text-xs text-text" role="status">
      <template v-if="captioning">
        <ImageIcon class="h-3.5 w-3.5 shrink-0 animate-pulse text-accent1-text motion-reduce:animate-none" />
        <span class="min-w-0 flex-1 tabular-nums">{{ t('covers.caption.bulkProgress', { done: Math.min(captioning.done + 1, captioning.total), total: captioning.total }) }}</span>
        <button type="button" class="rounded-md px-1.5 py-1 font-medium text-accent1-text hover:underline" @click="stopCaptioning">{{ t('covers.stop') }}</button>
      </template>
      <template v-else>
        <span class="min-w-0 flex-1">{{ capNote }}</span>
        <button type="button" class="flex h-6 w-6 items-center justify-center rounded-md text-text-dim hover:text-text" :aria-label="t('covers.dismiss')" :title="t('covers.dismiss')" @click="capNote = ''">✕</button>
      </template>
    </div>
    <!-- naming: progress with Stop, then the result with the undo for the whole batch -->
    <div v-if="titling || titleNote" class="flex basis-full items-center gap-3 text-xs text-text" role="status">
      <template v-if="titling">
        <SparklesIcon class="h-3.5 w-3.5 shrink-0 animate-pulse text-accent1-text motion-reduce:animate-none" />
        <span class="min-w-0 flex-1 tabular-nums">{{ t('autoTitle.progress', { done: Math.min(titling.done + 1, titling.total), total: titling.total }) }}</span>
        <button type="button" class="rounded-md px-1.5 py-1 font-medium text-accent1-text hover:underline" @click="stopNaming">{{ t('autoTitle.stop') }}</button>
      </template>
      <template v-else>
        <span class="min-w-0 flex-1">{{ titleNote }}</span>
        <button v-if="titled" type="button" class="font-medium text-accent1-text hover:underline" @click="undoTitles">{{ t('libraryPage.trash.undo') }}</button>
        <button type="button" class="flex h-6 w-6 items-center justify-center rounded-md text-text-dim hover:text-text" :aria-label="t('libraryPage.trash.dismiss')" :title="t('libraryPage.trash.dismiss')" @click="titled = null; titleNote = ''">✕</button>
      </template>
    </div>
  </div>
</template>
