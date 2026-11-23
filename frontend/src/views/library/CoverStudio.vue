<script setup lang="ts">
// The cover studio: one track's cover in a full-window dialog. The cover is the star - a big live preview on the
// left (with a "without caption / with caption" switch to compare), the controls in a column on the right: the
// picture (another one, its description, remove), the template (this cover in every layout, live), the font, the
// lines and their texts, the colours. Save bakes the caption in the browser and stores it; "No caption" takes it off.
// Esc / Close / Cancel with unsaved changes ask first. Narrow windows: the preview on top, the controls under it.
import { computed, nextTick, reactive, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDialogA11y } from '../../composables/useDialogA11y'
import { loadCover } from '../../covers/caption/bake'
import { paletteOf } from '../../covers/caption/analyse'
import type { Swatch } from '../../covers/caption/analyse'
import { FONTS, ensureAllFonts, familyList } from '../../covers/caption/fonts'
import { fontForGenre, pickLayout } from '../../covers/caption/pick'
import { FONT_KEYS } from '../../covers/caption/types'
import type { CaptionFont, CaptionLayout, CoverCaption } from '../../covers/caption/types'
import CoverCaptioned from '../../components/shared/CoverCaptioned.vue'
import SparklesIcon from '../../components/shared/icons/SparklesIcon.vue'
import ChevronIcon from '../../components/shared/icons/ChevronIcon.vue'
import CoverJobState from './CoverJobState.vue'
import LazyCoverCaptioned from './LazyCoverCaptioned.vue'
import { useCoverActions } from './useCoverActions'
import type { LibTrack } from './libraryTracks'

const props = defineProps<{ track: LibTrack; title: string }>()
const emit = defineEmits<{ close: [note: string] }>()
const { t } = useI18n()
const uid = useId()
const actions = useCoverActions(() => props.track)
const {
  covers, describer, has, job, busy, make, editing, text, loadingPrompt, before, field, openEdit, closeEdit, draw, rewrite,
  putBack, onInput, hint, removeArmed, disarm, onRemove, describing,
} = actions

/** The layouts in the gallery, in groups. */
const GROUPS: { key: string; layouts: CaptionLayout[] }[] = [
  { key: 'type', layouts: ['classic', 'poster', 'magazine', 'swiss', 'minimal', 'credits'] },
  { key: 'plates', layouts: ['band', 'frame', 'spine', 'cassette'] },
  { key: 'print', layouts: ['sticker', 'stamp', 'tape', 'record'] },
  { key: 'effects', layouts: ['neon'] },
]
// the textarea sits in the sections' v-for, where a plain template ref would become an array
const setField = (el: unknown): void => { field.value = (el as HTMLTextAreaElement | null) ?? null }
const layoutName = (l: CaptionLayout): string => t(`covers.caption.layouts.${l}`)

// ---- the draft: the saved caption, or one picked for this cover; `off` = no caption ----
const savedCaption = computed(() => covers.captionFor(props.track.id))
const capDefaults = computed(() => covers.defaultsFor(props.track.id, { title: props.track.title, createdAt: props.track.createdAt }))
const draft = reactive<CoverCaption>({ layout: 'classic', font: 'unbounded', showArtist: true, showTitle: true, showYear: true, artist: '', title: '', year: '', color: 'auto', accent: undefined })
const off = ref(false)
const noLines = computed(() => !draft.showArtist && !draft.showTitle && !draft.showYear)
const clean = (v: string | undefined): string | undefined => (v && v.trim() ? v.trim() : undefined)
/** The caption Save stores (null: none). */
function result(): CoverCaption | null {
  if (off.value) return null
  const color = draft.color && draft.color !== 'auto' ? draft.color : undefined
  return {
    layout: draft.layout, font: draft.font, showArtist: draft.showArtist, showTitle: draft.showTitle, showYear: draft.showYear,
    ...(clean(draft.artist) ? { artist: clean(draft.artist) } : {}), ...(clean(draft.title) ? { title: clean(draft.title) } : {}), ...(clean(draft.year) ? { year: clean(draft.year) } : {}),
    ...(color ? { color } : {}), ...(draft.accent ? { accent: draft.accent } : {}),
  }
}
const snapshot = ref('')
const dirty = computed(() => snapshot.value !== '' && JSON.stringify(result()) !== snapshot.value)

/** Counts the layouts chosen by hand: a pick still reading the picture does not overwrite one chosen meanwhile. */
let layoutChoices = 0
/** A font from the genre, a layout from where the picture is calm. */
async function pickCaption(): Promise<void> {
  const url = covers.urlFor(props.track.id)
  const font = fontForGenre(props.track.style)
  off.value = false
  draft.font = font
  if (!url) return
  const choicesBefore = layoutChoices
  const layoutBefore = draft.layout
  try {
    const { A } = await loadCover(url)
    if (layoutChoices !== choicesBefore || draft.layout !== layoutBefore) return
    draft.layout = pickLayout(A, font, props.track.style)
  } catch {
    // the font alone
  }
}
async function start(): Promise<void> {
  void ensureAllFonts()
  const s = savedCaption.value
  if (s) {
    Object.assign(draft, { ...s, artist: s.artist ?? '', title: s.title ?? '', year: s.year ?? '', color: s.color ?? 'auto', accent: s.accent })
  } else {
    Object.assign(draft, { showArtist: !!capDefaults.value.artist, showTitle: true, showYear: true, artist: '', title: '', year: '', color: 'auto', accent: undefined })
    await pickCaption()
  }
  // what was there when it opened (a picked one counts as untouched): closing then asks nothing
  snapshot.value = JSON.stringify(result())
}
void start()

// ---- the preview: with or without the caption, to compare ----
const compare = ref<'with' | 'without'>('with')
const previewCaption = computed<CoverCaption | null>(() => (off.value || compare.value === 'without' ? null : draft))
watch(off, (v) => { if (!v) compare.value = 'with' })

// the gallery follows the draft a beat later: fifteen layouts redrawn on every key would stutter
const thumbDraft = ref<CoverCaption>({ ...draft })
let thumbTimer: ReturnType<typeof setTimeout> | null = null
watch(draft, () => {
  if (thumbTimer) clearTimeout(thumbTimer)
  thumbTimer = setTimeout(() => { thumbDraft.value = { ...draft } }, 140)
}, { deep: true })
const thumbCaps = computed(() => Object.fromEntries(GROUPS.flatMap((g) => g.layouts).map((l) => [l, { ...thumbDraft.value, layout: l }])) as Record<CaptionLayout, CoverCaption>)
function chooseLayout(l: CaptionLayout): void {
  layoutChoices++
  off.value = false
  draft.layout = l
}

// ---- fonts ----
const fontStyle = (k: CaptionFont): Record<string, string> => ({
  fontFamily: familyList(FONTS[k]), fontWeight: String(FONTS[k].weight), fontStyle: FONTS[k].style,
  ...(k === 'pixel' ? { fontSize: '10px' } : k === 'caveat' ? { fontSize: '17px' } : {}),
})

// ---- colours: auto, light, dark and the picture's own ----
const palette = ref<Swatch[]>([])
watch(() => covers.urlFor(props.track.id), async (url) => {
  if (!url) { palette.value = []; return }
  try {
    const { A } = await loadCover(url)
    if (url === covers.urlFor(props.track.id)) palette.value = paletteOf(A)
  } catch {
    palette.value = []
  }
}, { immediate: true })
const isHex = (v: string | undefined): v is string => !!v && /^#[0-9a-f]{6}$/i.test(v)
/** The picture's swatches, plus a chosen colour that is not among them (kept from an earlier picture). */
const swatchesWith = (chosen: string | undefined): { hex: string; label: string }[] => {
  const list = palette.value.map((s) => ({ hex: s.hex, label: t(`covers.studio.swatch.${s.key}`, { hex: s.hex }) }))
  if (isHex(chosen) && !list.some((s) => s.hex.toLowerCase() === chosen.toLowerCase())) list.push({ hex: chosen, label: t('covers.studio.swatch.custom', { hex: chosen }) })
  return list
}
const textSwatches = computed(() => swatchesWith(draft.color))
const accentSwatches = computed(() => swatchesWith(draft.accent))
const sameHex = (a: string | undefined, b: string): boolean => !!a && a.toLowerCase() === b.toLowerCase()

// ---- the sections fold ----
type Section = 'image' | 'layout' | 'font' | 'text' | 'color'
const SECTIONS: Section[] = ['image', 'layout', 'font', 'text', 'color']
const open = reactive<Record<Section, boolean>>({ image: true, layout: true, font: true, text: true, color: true })

// ---- save, close ----
const saving = ref(false)
const canSave = computed(() => !saving.value && !job.value && (off.value ? !!savedCaption.value || dirty.value : has.value && !noLines.value))
/** Why the last Save failed, in words (shown next to it); '' while nothing failed. */
const saveError = ref('')
function saveErrorText(raw: string): string {
  if (raw === 'no cover' || /has no cover/i.test(raw)) return t('covers.studio.errNoCover')
  if (/^cannot load/i.test(raw)) return t('covers.studio.errLoad')
  if (/cover has changed/i.test(raw)) return t('covers.studio.errChanged')
  return t('covers.studio.errSave')
}
async function save(): Promise<void> {
  if (!canSave.value) return
  const caption = result()
  if (!caption && !savedCaption.value) { emit('close', ''); return }
  saving.value = true
  saveError.value = ''
  try {
    if (await covers.saveCaption(props.track.id, caption, { title: props.track.title, createdAt: props.track.createdAt })) {
      emit('close', caption ? t('covers.caption.saved') : t('covers.caption.removed'))
    } else {
      saveError.value = saveErrorText(covers.error)
    }
  } finally {
    saving.value = false
  }
}
watch(() => JSON.stringify(result()), () => { saveError.value = '' })
const confirming = ref(false)
const stayBtn = ref<HTMLButtonElement | null>(null)
function requestClose(): void {
  if (confirming.value) { confirming.value = false; return }
  if (dirty.value && !saving.value) {
    confirming.value = true
    void nextTick(() => stayBtn.value?.focus())
    return
  }
  close()
}
function close(): void {
  closeEdit()
  emit('close', '')
}
watch(dirty, (d) => { if (!d) confirming.value = false })

const dialogEl = ref<HTMLElement | null>(null)
const { onKeydown } = useDialogA11y(dialogEl, () => true, requestClose)

const BTN = 'inline-flex min-h-8 items-center justify-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-text hover:bg-panel-2 focus-visible:outline-2 focus-visible:outline-accent1 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent'
const CHIP = 'inline-flex min-h-8 items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent1 motion-reduce:transition-none'
const chipCls = (on: boolean): string => (on ? 'border-transparent bg-accent1/25 font-medium text-text' : 'border-border text-text-dim hover:text-text')
</script>

<template>
  <!-- Teleported: inside a scrolled panel a fixed overlay would be sized to it, not the screen -->
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex bg-black/70 sm:p-4 lg:p-6" @mousedown.self="requestClose">
      <div
        ref="dialogEl" role="dialog" aria-modal="true" :aria-labelledby="`${uid}-title`" :aria-describedby="`${uid}-desc`"
        class="flex min-h-0 w-full flex-col overflow-hidden border-border bg-panel shadow-2xl sm:rounded-xl sm:border" @keydown="onKeydown"
      >
        <!-- header: what this is, for which track, Close -->
        <div class="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div class="min-w-0 flex-1">
            <h2 :id="`${uid}-title`" class="text-base font-semibold text-text">{{ t('covers.studio.title') }}</h2>
            <p class="truncate text-xs text-text-dim" :title="title"><bdi>{{ title }}</bdi></p>
          </div>
          <p :id="`${uid}-desc`" class="sr-only">{{ t('covers.caption.sectionHint') }}</p>
          <button type="button" class="rounded-full p-1.5 text-text-dim hover:bg-panel-2 hover:text-text focus-visible:outline-2 focus-visible:outline-accent1" :aria-label="t('common.close')" :title="t('common.close')" @click="requestClose">
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:grid-rows-[minmax(0,1fr)] lg:overflow-hidden">
          <!-- the preview: as big as fits -->
          <div class="studio-stage flex flex-col items-center justify-center gap-3 bg-bg/60 p-4 sm:p-6">
            <CoverCaptioned :track-id="track.id" :title="title" :caption="previewCaption" :defaults="capDefaults" placeholder class="studio-preview aspect-square rounded-lg shadow-2xl" />
            <div v-if="has && !off" v-roving role="radiogroup" :aria-label="t('covers.studio.preview')" class="inline-flex rounded-lg border border-border bg-panel p-0.5 text-xs">
              <button
                v-for="m in (['without', 'with'] as const)" :key="m" type="button" role="radio" :aria-checked="compare === m"
                class="min-h-7 rounded-md px-3 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-accent1 motion-reduce:transition-none"
                :class="compare === m ? 'bg-accent1/25 font-medium text-text' : 'text-text-dim hover:text-text'" @click="compare = m"
              >{{ m === 'with' ? t('covers.studio.captioned') : t('covers.studio.plain') }}</button>
            </div>
          </div>

          <!-- the controls -->
          <div class="studio-controls border-border lg:overflow-y-auto lg:border-s">
            <section v-for="s in SECTIONS" v-show="s === 'image' || has" :key="s" class="border-b border-border" :aria-labelledby="`${uid}-h-${s}`">
              <h3 :id="`${uid}-h-${s}`">
                <button
                  type="button" :aria-expanded="open[s]" :aria-controls="`${uid}-s-${s}`"
                  class="flex w-full items-center gap-2 px-4 py-2.5 text-start text-xs font-semibold uppercase tracking-wide text-text-dim hover:text-text focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent1"
                  @click="open[s] = !open[s]"
                >
                  <span class="min-w-0 flex-1">{{ t(`covers.studio.sections.${s}`) }}</span>
                  <ChevronIcon class="h-3.5 w-3.5 transition-transform motion-reduce:transition-none" :class="open[s] ? 'rotate-180' : ''" />
                </button>
              </h3>
              <div v-show="open[s]" :id="`${uid}-s-${s}`" class="px-4 pb-4">
                <!-- a. the picture -->
                <div v-if="s === 'image'" class="space-y-2.5">
                  <CoverJobState :actions="actions" />
                  <form v-if="editing" class="space-y-1.5" @submit.prevent="draw">
                    <label :for="`${uid}-prompt`" class="block text-xs font-semibold text-text-dim">{{ t('covers.describe') }}</label>
                    <textarea
                      :id="`${uid}-prompt`" :ref="setField" v-model="text" rows="5" maxlength="1000" dir="auto" :aria-describedby="`${uid}-prompt-hint`"
                      class="w-full resize-y rounded-lg border border-border bg-panel-2 px-2.5 py-1.5 text-xs leading-relaxed text-text outline-none focus:border-accent1/60"
                      :placeholder="loadingPrompt ? t('covers.loadingPrompt') : ''" :aria-busy="loadingPrompt || describing" :readonly="describing"
                      @input="onInput" @keydown.esc.stop.prevent="closeEdit" @keydown.ctrl.enter.prevent="draw" @keydown.meta.enter.prevent="draw"
                    ></textarea>
                    <p :id="`${uid}-prompt-hint`" class="text-[11px] leading-relaxed text-text-dim">{{ hint }}</p>
                    <div class="flex flex-wrap gap-1.5">
                      <button type="submit" class="inline-flex min-h-8 items-center rounded-md bg-accent1-strong px-2.5 py-1 text-xs font-medium text-white hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent1 disabled:opacity-50" :disabled="!text.trim() || busy">{{ t('covers.draw') }}</button>
                      <button type="button" :class="BTN" :disabled="busy || !describer.ready.value" :title="describer.ready.value ? t('covers.withAssistantHint') : t('covers.noAssistant')" @click="rewrite">
                        <SparklesIcon class="h-3.5 w-3.5" />{{ t('covers.withAssistant') }}
                      </button>
                      <button v-if="before != null" type="button" :class="BTN" :disabled="describing" @click="putBack">{{ t('covers.putBack') }}</button>
                      <button type="button" :class="BTN" @click="closeEdit">{{ t('covers.cancel') }}</button>
                    </div>
                  </form>
                  <div v-else class="flex flex-wrap gap-1.5">
                    <button type="button" :class="BTN" :disabled="busy" @click="make(has)">{{ has ? t('covers.another') : t('covers.make') }}</button>
                    <button type="button" :class="BTN" :disabled="busy" @click="openEdit">{{ t('covers.edit') }}</button>
                    <button
                      v-if="has" type="button" :class="[BTN, removeArmed ? 'border-status-failed/60 bg-status-failed/10 text-status-failed' : 'text-text-dim hover:text-status-failed']"
                      :disabled="busy" @click="onRemove" @blur="disarm"
                    >{{ removeArmed ? t('covers.removeConfirm') : t('covers.remove') }}</button>
                  </div>
                  <p v-if="!has" class="text-[11px] leading-relaxed text-text-dim">{{ t('covers.studio.needPicture') }}</p>
                  <p v-else class="text-[11px] leading-relaxed text-text-dim">{{ t('covers.studio.keepsCaption') }}</p>
                </div>

                <!-- b. the template: this cover in every layout, live -->
                <div v-else-if="s === 'layout'" class="space-y-3">
                  <button type="button" :class="BTN" :title="t('covers.caption.pickHint')" @click="pickCaption"><SparklesIcon class="h-3.5 w-3.5" />{{ t('covers.caption.pick') }}</button>
                  <div v-roving role="radiogroup" :aria-labelledby="`${uid}-h-layout`" class="space-y-3">
                    <div class="studio-grid grid gap-2">
                      <button
                        type="button" role="radio" :aria-checked="off" class="group flex min-w-0 flex-col gap-1 rounded-md text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1"
                        @click="off = true"
                      >
                        <LazyCoverCaptioned :track-id="track.id" :title="title" :caption="null" :defaults="capDefaults" class="aspect-square w-full rounded-md ring-2 transition-shadow motion-reduce:transition-none" :class="off ? 'ring-accent1' : 'ring-transparent group-hover:ring-border'" />
                        <span class="truncate text-[11px] leading-tight" :class="off ? 'font-semibold text-text' : 'text-text-dim'">{{ t('covers.studio.plain') }}</span>
                      </button>
                    </div>
                    <div v-for="g in GROUPS" :key="g.key" role="group" :aria-labelledby="`${uid}-g-${g.key}`">
                      <p :id="`${uid}-g-${g.key}`" class="mb-1.5 text-[11px] font-medium text-text-dim">{{ t(`covers.caption.groups.${g.key}`) }}</p>
                      <div class="studio-grid grid gap-2">
                        <button
                          v-for="l in g.layouts" :key="l" type="button" role="radio" :aria-checked="!off && draft.layout === l"
                          class="group flex min-w-0 flex-col gap-1 rounded-md text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1"
                          @click="chooseLayout(l)"
                        >
                          <LazyCoverCaptioned
                            :track-id="track.id" :title="title" :caption="thumbCaps[l]" :defaults="capDefaults"
                            class="aspect-square w-full rounded-md ring-2 transition-shadow motion-reduce:transition-none" :class="!off && draft.layout === l ? 'ring-accent1' : 'ring-transparent group-hover:ring-border'"
                          />
                          <span class="truncate text-[11px] leading-tight" :class="!off && draft.layout === l ? 'font-semibold text-text' : 'text-text-dim'">{{ layoutName(l) }}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- c. the font: each named in itself -->
                <div v-else-if="s === 'font'" v-roving role="radiogroup" :aria-labelledby="`${uid}-h-font`" class="flex flex-wrap gap-1.5">
                  <button
                    v-for="k in FONT_KEYS" :key="k" type="button" role="radio" :aria-checked="draft.font === k"
                    :class="[CHIP, chipCls(draft.font === k), 'text-[14px] leading-tight']" :style="fontStyle(k)" @click="draft.font = k; off = false"
                  >{{ FONTS[k].label }}</button>
                </div>

                <!-- d. the lines and their texts (an empty field is the default, shown greyed in it) -->
                <fieldset v-else-if="s === 'text'" class="space-y-2">
                  <legend class="sr-only">{{ t('covers.caption.lines') }}</legend>
                  <div v-for="line in (['artist', 'title', 'year'] as const)" :key="line" class="flex items-center gap-2">
                    <label class="flex w-28 shrink-0 items-center gap-1.5 text-xs text-text">
                      <input v-if="line === 'artist'" v-model="draft.showArtist" type="checkbox" class="h-3.5 w-3.5 accent-accent1" />
                      <input v-else-if="line === 'title'" v-model="draft.showTitle" type="checkbox" class="h-3.5 w-3.5 accent-accent1" />
                      <input v-else v-model="draft.showYear" type="checkbox" class="h-3.5 w-3.5 accent-accent1" />
                      {{ t(`covers.caption.${line}`) }}
                    </label>
                    <input
                      v-model="draft[line]" type="text" dir="auto" :maxlength="line === 'year' ? 12 : 120" :placeholder="capDefaults[line]"
                      :aria-label="t('covers.caption.textOf', { line: t(`covers.caption.${line}`) })" :aria-describedby="`${uid}-text-hint`"
                      :disabled="line === 'artist' ? !draft.showArtist : line === 'title' ? !draft.showTitle : !draft.showYear"
                      class="min-w-0 flex-1 rounded-md border border-border bg-panel-2 px-2 py-1.5 text-xs text-text outline-none placeholder:text-text-dim/70 focus:border-accent1/60 disabled:opacity-50"
                    />
                  </div>
                  <p :id="`${uid}-text-hint`" class="text-[11px] leading-relaxed" :class="noLines && !off ? 'text-status-failed' : 'text-text-dim'">{{ noLines && !off ? t('covers.caption.noLines') : t('covers.caption.textHint') }}</p>
                </fieldset>

                <!-- e. colours: of the text, and of bands, stickers and blocks -->
                <div v-else class="space-y-3">
                  <div>
                    <p :id="`${uid}-c-text`" class="mb-1.5 text-xs text-text-dim">{{ t('covers.caption.color') }}</p>
                    <div v-roving role="radiogroup" :aria-labelledby="`${uid}-c-text`" class="flex flex-wrap items-center gap-1.5">
                      <button
                        v-for="m in (['auto', 'light', 'dark'] as const)" :key="m" type="button" role="radio" :aria-checked="(draft.color || 'auto') === m"
                        :class="[CHIP, chipCls((draft.color || 'auto') === m)]" @click="draft.color = m; off = false"
                      >
                        <span v-if="m !== 'auto'" class="h-3 w-3 rounded-full border border-white/30" :class="m === 'light' ? 'bg-white' : 'bg-[#141312]'" aria-hidden="true"></span>
                        {{ t(`covers.studio.${m}`) }}
                      </button>
                      <button
                        v-for="sw in textSwatches" :key="sw.hex" type="button" role="radio" :aria-checked="sameHex(draft.color, sw.hex)" :aria-label="sw.label" :title="sw.label"
                        class="h-8 w-8 rounded-full border-2 transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1 motion-reduce:transition-none"
                        :class="sameHex(draft.color, sw.hex) ? 'border-white ring-2 ring-accent1' : 'border-white/20 hover:border-white/50'" :style="{ backgroundColor: sw.hex }"
                        @click="draft.color = sw.hex; off = false"
                      ></button>
                    </div>
                  </div>
                  <div>
                    <p :id="`${uid}-c-acc`" class="mb-1.5 text-xs text-text-dim">{{ t('covers.studio.accentColor') }}</p>
                    <div v-roving role="radiogroup" :aria-labelledby="`${uid}-c-acc`" :aria-describedby="`${uid}-c-acc-hint`" class="flex flex-wrap items-center gap-1.5">
                      <button type="button" role="radio" :aria-checked="!draft.accent" :class="[CHIP, chipCls(!draft.accent)]" @click="draft.accent = undefined; off = false">{{ t('covers.studio.auto') }}</button>
                      <button
                        v-for="sw in accentSwatches" :key="sw.hex" type="button" role="radio" :aria-checked="sameHex(draft.accent, sw.hex)" :aria-label="sw.label" :title="sw.label"
                        class="h-8 w-8 rounded-full border-2 transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1 motion-reduce:transition-none"
                        :class="sameHex(draft.accent, sw.hex) ? 'border-white ring-2 ring-accent1' : 'border-white/20 hover:border-white/50'" :style="{ backgroundColor: sw.hex }"
                        @click="draft.accent = sw.hex; off = false"
                      ></button>
                    </div>
                    <p :id="`${uid}-c-acc-hint`" class="mt-1.5 text-[11px] leading-relaxed text-text-dim">{{ t('covers.studio.accentHint') }}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <!-- footer: Save / Cancel, or the question about unsaved changes -->
        <div class="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border px-4 py-3 sm:px-5">
          <template v-if="confirming">
            <p class="me-auto text-sm text-text" role="alert">{{ t('covers.studio.unsaved') }}</p>
            <button type="button" class="rounded-lg border border-border px-3 py-2 text-sm text-text-dim hover:text-status-failed focus-visible:outline-2 focus-visible:outline-accent1" @click="close">{{ t('covers.studio.discard') }}</button>
            <button ref="stayBtn" type="button" class="accent-gradient rounded-lg px-4 py-2 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1" @click="confirming = false">{{ t('covers.studio.keepEditing') }}</button>
          </template>
          <template v-else>
            <p v-if="job" class="me-auto text-xs text-text-dim">{{ t('covers.studio.waitPicture') }}</p>
            <p v-else-if="saveError" class="me-auto text-xs text-status-failed" role="alert">{{ saveError }}</p>
            <button type="button" class="rounded-lg border border-border px-3 py-2 text-sm text-text-dim hover:text-text focus-visible:outline-2 focus-visible:outline-accent1" @click="requestClose">{{ t('covers.cancel') }}</button>
            <button
              type="button" :disabled="!canSave"
              class="accent-gradient rounded-lg px-4 py-2 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1 disabled:cursor-default disabled:opacity-50"
              @click="save"
            >{{ saving ? t('covers.caption.saving') : t('covers.caption.save') }}</button>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* the cover as big as the window allows: square, under ~78vh and ~60vw on a wide window */
.studio-preview {
  width: min(100%, 70svh);
}
.studio-grid {
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
}
@media (min-width: 1024px) {
  .studio-stage {
    min-height: 0;
  }
  .studio-preview {
    width: min(100%, 78vh, 60vw, calc(100svh - 13rem));
  }
  .studio-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
