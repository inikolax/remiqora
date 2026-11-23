<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePlayerStore } from '../../stores/player'
import { useMarksStore } from '../../stores/marks'
import { useDialogA11y } from '../../composables/useDialogA11y'
import { useTakeCompare } from '../../composables/useTakeCompare'
import type { CompareTake } from '../../composables/useTakeCompare'
import { formatClock } from '../../composables/formatCreated'
import FavoriteStar from './FavoriteStar.vue'
import CoverThumb from './CoverThumb.vue'
import PlayIcon from './icons/PlayIcon.vue'
import PauseIcon from './icons/PauseIcon.vue'
import TrashIcon from './icons/TrashIcon.vue'

/**
 * Compare takes: 2–4 takes of one song on an A/B switch, as in a studio. They play together from the same second
 * and only the chosen one is heard (useTakeCompare), so switching keeps the place and the play state. 1–4 choose a
 * take, Space plays and pauses, ← and → move 5 s, Esc closes. The star marks the best take; with exactly one starred,
 * the others go to the trash in two clicks, with an undo. `total` is how many takes the song has, when only some of
 * them are compared.
 */
const props = defineProps<{ title: string; takes: CompareTake[]; total?: number }>()
const emit = defineEmits<{ close: []; trashed: [ids: number[]]; restored: [ids: number[]] }>()
const { t } = useI18n()
const player = usePlayerStore()
const marks = useMarksStore()

// the takes of this opening: the parent's list may change under it once some go to the trash
const all = props.takes.slice(0, 4)
const LETTERS = ['A', 'B', 'C', 'D']

/** After "keep the best": the kept take and the ones in the trash, until undone or closed. */
const done = ref<{ kept: CompareTake; ids: number[] } | null>(null)
const cmp = useTakeCompare(() => (done.value ? [] : all))

onMounted(() => player.pause())

const dialogEl = ref<HTMLElement | null>(null)
const { onKeydown: a11yKeydown } = useDialogA11y(dialogEl, () => true, () => emit('close'))

// ---- what a screen reader hears: the take now heard, the trash and its undo ----
const announcement = ref('')
function announce(text: string): void {
  announcement.value = ''
  void nextTick(() => { announcement.value = text })
}
const label = (i: number): string => t('takeCompare.tileLabel', { letter: LETTERS[i], n: all[i].n })
watch(cmp.active, (i) => announce(t('takeCompare.nowHearing', { take: label(i) })))

// ---- keys: 1–4 a take, Space play/pause, ←/→ 5 s (inside the take tiles the arrows walk the tiles) ----
const group = ref<HTMLElement | null>(null)
function onKeydown(e: KeyboardEvent): void {
  a11yKeydown(e)
  if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || done.value) return
  const target = e.target as HTMLElement | null
  const digit = /^Digit([1-4])$/.exec(e.code)?.[1] ?? (/^[1-4]$/.test(e.key) ? e.key : null)
  if (digit) {
    const i = Number(digit) - 1
    if (i < all.length) { e.preventDefault(); choose(i, true) }
    return
  }
  if (e.key === ' ' || e.code === 'Space') {
    // a plain button (the star, the trash, Close) keeps its own Space; the play button is one of them
    if (target instanceof HTMLButtonElement && target.getAttribute('role') !== 'radio') return
    e.preventDefault()
    cmp.toggle()
    return
  }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    if (target && group.value?.contains(target)) return
    e.preventDefault()
    const rtl = dialogEl.value ? getComputedStyle(dialogEl.value).direction === 'rtl' : false
    cmp.seekBy((e.key === 'ArrowRight') !== rtl ? 5 : -5)
  }
}
/** Chooses take `i`; from a key, the focus follows when it was on the tiles, so the radio stays the chosen one. */
function choose(i: number, fromKey = false): void {
  cmp.pick(i)
  if (fromKey && group.value?.contains(document.activeElement)) {
    void nextTick(() => group.value?.querySelectorAll<HTMLElement>('[role=radio]')[i]?.focus())
  }
}

// ---- the transport ----
const lengthOf = (i: number): number => cmp.state[i]?.duration || all[i].durationSec || 0
/** The transport shows the chosen take's length (a shorter one is silent past its end), not the longest take's. */
const shownTotal = computed(() => lengthOf(cmp.active.value) || cmp.total.value)
const shownTime = computed(() => Math.min(cmp.time.value, shownTotal.value))
const timeText = computed(() => `${formatClock(shownTime.value)} / ${formatClock(shownTotal.value)}`)
const valueText = computed(() => t('takeCompare.position', { at: formatClock(shownTime.value), total: formatClock(shownTotal.value) }))
/** All the takes share one seed: the same line on every tile says nothing, so it is left out. */
const oneSeed = computed(() => all.length > 1 && all.every((x) => x.seed === all[0].seed))
function onSeek(e: Event): void {
  cmp.seek(Number((e.target as HTMLInputElement).value))
}
const loading = computed(() => cmp.state.some((s) => !s.ready && !s.failed))

// ---- keep the best: exactly one starred among them; two clicks; the others to the trash, with an undo ----
const starred = computed(() => all.filter((x) => marks.isFavorite(x.id)))
const best = computed(() => (starred.value.length === 1 ? starred.value[0] : null))
const others = computed(() => (best.value ? all.filter((x) => x.id !== best.value!.id) : []))
const keepHint = computed(() => (best.value ? t('takeCompare.keepWill', { take: label(all.indexOf(best.value)), n: others.value.length }, others.value.length)
  : starred.value.length > 1 ? t('takeCompare.keepTooMany') : t('takeCompare.keepNeedStar')))
const armed = ref(false)
let armTimer: ReturnType<typeof setTimeout> | null = null
const disarm = (): void => { armed.value = false; if (armTimer) clearTimeout(armTimer); armTimer = null }
watch(best, disarm)
onBeforeUnmount(disarm)
const error = ref('')
const undoBtn = ref<HTMLButtonElement | null>(null)
async function keepBest(): Promise<void> {
  const kept = best.value
  if (!kept) return
  if (!armed.value) {
    armed.value = true
    armTimer = setTimeout(disarm, 5000)
    return
  }
  disarm()
  const ids = others.value.map((x) => x.id)
  cmp.pause()
  const result = await marks.bulk(ids, 'trash')
  if (!result) { error.value = marks.error; return }
  error.value = ''
  const moved = result.map((x) => x.id)
  done.value = { kept, ids: moved }
  emit('trashed', moved)
  announce(t('takeCompare.kept', { take: label(all.indexOf(kept)), n: moved.length }, moved.length))
  void nextTick(() => undoBtn.value?.focus())
}
async function undo(): Promise<void> {
  const ids = done.value?.ids ?? []
  const result = await marks.bulk(ids, 'restore')
  if (!result) { error.value = marks.error; return }
  error.value = ''
  done.value = null
  emit('restored', result.map((x) => x.id))
  announce(t('takeCompare.restored', { n: result.length }, result.length))
  void nextTick(() => group.value?.querySelector<HTMLElement>('[role=radio][aria-checked=true]')?.focus())
}
</script>

<template>
  <!-- Teleported: inside the header or a scrolled panel a fixed overlay would be sized to it, not the screen -->
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:items-center" @mousedown.self="emit('close')">
      <div
        ref="dialogEl" role="dialog" aria-modal="true" aria-labelledby="take-compare-title" aria-describedby="take-compare-keys"
        class="my-8 w-full max-w-2xl rounded-xl border border-border bg-panel p-5 shadow-2xl" @keydown="onKeydown"
      >
        <div class="mb-4 flex items-start gap-3">
          <div class="min-w-0 flex-1">
            <h3 id="take-compare-title" class="text-lg font-semibold text-text">{{ t('takeCompare.title') }}</h3>
            <p class="truncate text-sm text-text-dim" :title="title"><bdi>{{ title }}</bdi></p>
          </div>
          <button type="button" class="rounded-full p-1 text-text-dim hover:bg-panel-2 hover:text-text" :aria-label="t('common.close')" :title="t('common.close')" @click="emit('close')">
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">{{ announcement }}</p>

        <!-- after "keep the best": what happened, the undo, and Close -->
        <div v-if="done" class="rounded-lg border border-border bg-panel-2 p-4 text-sm text-text">
          <p class="flex items-start gap-2">
            <TrashIcon class="mt-0.5 h-4 w-4 shrink-0 text-text-dim" />
            <span>{{ t('takeCompare.kept', { take: label(all.indexOf(done.kept)), n: done.ids.length }, done.ids.length) }}</span>
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            <button ref="undoBtn" type="button" class="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-accent1-text hover:bg-panel" @click="undo">{{ t('libraryPage.trash.undo') }}</button>
            <button type="button" class="rounded-lg border border-border px-3 py-1.5 text-sm text-text hover:bg-panel" @click="emit('close')">{{ t('common.close') }}</button>
          </div>
        </div>

        <template v-else>
          <p v-if="total && total > all.length" class="mb-3 text-xs text-text-dim">{{ t('takeCompare.newestOf', { shown: all.length, total }) }}</p>

          <!-- the takes: one Tab stop, arrows walk them (v-roving); the star sits beside each, outside the radio -->
          <div ref="group" v-roving role="radiogroup" :aria-label="t('takeCompare.takes')" class="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div
              v-for="(tk, i) in all" :key="tk.id"
              class="tile relative flex min-w-0 flex-col rounded-lg border bg-panel-2"
              :class="cmp.active.value === i ? 'border-accent1 ring-1 ring-accent1' : 'border-border'"
            >
              <button
                type="button" role="radio" :aria-checked="cmp.active.value === i" :data-autofocus="cmp.active.value === i ? '' : undefined"
                :aria-label="label(i)" :aria-describedby="`take-compare-meta-${i}`"
                class="flex min-w-0 flex-1 flex-col items-start gap-1 rounded-lg p-3 pe-9 text-start focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent1"
                @click="choose(i)"
              >
                <span class="flex items-center gap-2">
                  <span
                    class="flex h-8 w-8 items-center justify-center rounded-md text-base font-bold"
                    :class="cmp.active.value === i ? 'bg-accent1-strong text-white' : 'border border-border text-text'" aria-hidden="true"
                  >{{ LETTERS[i] }}</span>
                  <!-- the take's cover, when it has one and covers are on -->
                  <CoverThumb :track-id="tk.id" :title="`${title} · ${t('libraryPage.take', { n: tk.n })}`" class="h-8 w-8 rounded-md" />
                  <!-- heard now: three bars, still when the motion is reduced -->
                  <span v-if="cmp.active.value === i" class="eq flex h-3.5 items-end gap-[2px]" :class="cmp.playing.value ? 'on' : ''" aria-hidden="true">
                    <span class="w-[3px] rounded-sm bg-accent1"></span><span class="w-[3px] rounded-sm bg-accent1"></span><span class="w-[3px] rounded-sm bg-accent1"></span>
                  </span>
                </span>
                <span :id="`take-compare-meta-${i}`" class="flex flex-col text-xs text-text-dim">
                  <span class="text-sm font-medium text-text">{{ t('libraryPage.take', { n: tk.n }) }}</span>
                  <span v-if="tk.seed != null && !oneSeed" class="tabular-nums">{{ t('takeCompare.seed', { seed: tk.seed }) }}</span>
                  <span class="tabular-nums">{{ formatClock(lengthOf(i)) }}</span>
                  <span v-if="cmp.state[i]?.failed" class="text-status-failed">{{ t('takeCompare.failed') }}</span>
                  <span v-else-if="!cmp.state[i]?.ready" class="text-text-dim">{{ t('takeCompare.loading') }}</span>
                  <span v-if="marks.isFavorite(tk.id)" class="text-status-queued">{{ t('takeCompare.best') }}</span>
                </span>
                <!-- its length against the longest take: where it falls silent -->
                <span class="mt-1 block h-1 w-full rounded-full bg-border/60" aria-hidden="true">
                  <span class="block h-1 rounded-full" :class="cmp.active.value === i ? 'bg-accent1' : 'bg-text-dim/50'" :style="{ width: `${cmp.total.value ? Math.min(100, (lengthOf(i) / cmp.total.value) * 100) : 100}%` }"></span>
                </span>
              </button>
              <FavoriteStar :track-id="tk.id" class="!absolute end-1 top-1" />
            </div>
          </div>

          <!-- the shared transport -->
          <div class="mt-4 flex items-center gap-3">
            <button
              type="button" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full accent-gradient text-white disabled:opacity-50"
              :aria-label="cmp.playing.value ? t('create.pause') : t('create.play')" :title="cmp.playing.value ? t('create.pause') : t('create.play')"
              @click="cmp.toggle()"
            >
              <PauseIcon v-if="cmp.playing.value" class="h-4 w-4" />
              <PlayIcon v-else class="h-4 w-4" />
            </button>
            <input
              type="range" min="0" :max="shownTotal || 0" step="0.1" :value="shownTime"
              class="min-w-0 flex-1 accent-accent1" :aria-label="t('takeCompare.seek')" :aria-valuetext="valueText"
              @input="onSeek"
            />
            <span class="shrink-0 text-xs tabular-nums text-text-dim">{{ timeText }}</span>
          </div>
          <p id="take-compare-keys" class="mt-2 text-xs text-text-dim">
            {{ t('takeCompare.keys') }}<template v-if="loading"> · {{ t('takeCompare.loadingAll') }}</template>
          </p>

          <!-- keep the best: two clicks, then the others go to the trash -->
          <div class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-4">
            <button
              type="button" class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              :class="armed ? 'border-status-failed/60 bg-status-failed/15 font-medium text-status-failed' : 'border-border text-text hover:bg-panel-2'"
              :disabled="!best" :aria-describedby="'take-compare-keep-hint'" @click="keepBest" @blur="disarm"
            ><TrashIcon class="h-4 w-4" />{{ armed ? t('takeCompare.keepConfirm', { n: others.length }, others.length) : t('takeCompare.keep') }}</button>
            <span id="take-compare-keep-hint" class="min-w-0 flex-1 text-xs text-text-dim">{{ keepHint }}</span>
          </div>
        </template>
        <p v-if="error" class="mt-3 text-xs text-status-failed" role="alert">{{ error }}</p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.tile { transition: border-color 0.12s, box-shadow 0.12s; }
.eq span { height: 40%; }
.eq.on span { animation: eq 0.9s ease-in-out infinite; }
.eq.on span:nth-child(2) { animation-delay: -0.3s; }
.eq.on span:nth-child(3) { animation-delay: -0.6s; }
@keyframes eq { 0%, 100% { height: 30%; } 50% { height: 100%; } }
@media (prefers-reduced-motion: reduce) {
  .tile { transition: none; }
  .eq.on span { animation: none; height: 70%; }
}
</style>
