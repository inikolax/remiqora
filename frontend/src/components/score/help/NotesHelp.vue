<script lang="ts">
export type NotesHelpSection = 'what' | 'roll' | 'lanes' | 'key' | 'chords' | 'parts' | 'start' | 'simple' | 'checks' | 'recipes' | 'faq'
</script>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDialogA11y } from '../../../composables/useDialogA11y'
import HelpTable from '../../shared/help/HelpTable.vue'
import ScoreIcon from '../ScoreIcon.vue'
import { musicianView } from '../scoreUi'
import type { ScoreEditorCtx } from '../useScoreEditor'
import NotesHelpFigure from './NotesHelpFigure.vue'

/**
 * "Notes help": the note editor explained to someone who does not read music. A wide window with a table of contents
 * on the left (a select on a phone) and the sections in one scrolling column, with small drawings of what the text
 * says. Where the opener has an editor, a few buttons do the thing in it ("In key" on, the simple view, the check);
 * those that need the workspace on screen close the help and emit `reveal`, so the card can open "Notes".
 */
const SECTIONS: NotesHelpSection[] = ['what', 'roll', 'lanes', 'key', 'chords', 'parts', 'start', 'simple', 'checks', 'recipes', 'faq']

const props = defineProps<{
  open: boolean
  /** The editor of the opener: the action buttons work on it; without one they are not shown. */
  editor?: ScoreEditorCtx | null
  /** The form's melody plan, marked in the plans table. */
  plan?: 'off' | 'melody' | 'full' | null
  /** The section to open at. */
  start?: NotesHelpSection
}>()
const emit = defineEmits<{ close: []; reveal: [] }>()
const { t, tm, rt } = useI18n()

const uid = `nh-${Math.random().toString(36).slice(2, 8)}`
const dialogEl = ref<HTMLElement | null>(null)
const body = ref<HTMLElement | null>(null)
const { onKeydown } = useDialogA11y(dialogEl, () => props.open, () => emit('close'))

// ---- texts: long ones are arrays and objects read with tm(); a message that came back compiled is rendered ----
const raw = (v: unknown): string => (typeof v === 'string' ? v : v == null ? '' : rt(v as Parameters<typeof rt>[0]))
const s = (k: string): string => t(`notesHelp.sections.${k}`)
const list = (k: string): string[] => ((tm(`notesHelp.sections.${k}`) as unknown[]) ?? []).map(raw)
function objs<K extends string>(k: string, fields: readonly K[]): Record<K, string>[] {
  return ((tm(`notesHelp.sections.${k}`) as Record<string, unknown>[]) ?? []).map((o) => Object.fromEntries(fields.map((f) => [f, raw(o[f])])) as Record<K, string>)
}
const PLAN_IDS = ['off', 'melody', 'full'] as const
const plans = computed(() => objs('what.plans', ['name', 'text', 'when'] as const).map((r, i) => ({ ...r, id: PLAN_IDS[i] })))
const keys = computed(() => objs('roll.keys', ['key', 'what'] as const))
const checkRows = computed(() => objs('checks.rows', ['check', 'means', 'fix'] as const))
const ways = computed(() => objs('start.ways', ['title', 'text'] as const))
const faq = computed(() => objs('faq.items', ['q', 'a'] as const))
type Action = 'snap' | 'musician' | 'simple' | 'checks' | 'draw'
const RECIPE_ACTIONS: (Action | null)[] = [null, 'checks', null, 'simple', null]
const recipes = computed(() => ((tm('notesHelp.sections.recipes.items') as { title: unknown; steps: unknown[] }[]) ?? [])
  .map((r, i) => ({ title: raw(r.title), steps: (r.steps ?? []).map(raw), action: RECIPE_ACTIONS[i] ?? null })))
const WAY_ICONS = ['draw', 'song', 'midi']

// ---- the actions, on the opener's editor ----
const ed = computed(() => props.editor ?? null)
const empty = computed(() => ed.value?.isEmpty.value ?? true)
function can(a: Action): boolean {
  if (!ed.value) return false
  if (a === 'draw') return empty.value
  if (a === 'simple' || a === 'checks') return !empty.value
  return true
}
function act(a: Action): void {
  const e = ed.value
  if (!e) return
  if (a === 'snap') { e.ui.snapKey = true; return }
  if (a === 'musician') { musicianView.value = !musicianView.value; return }
  if (a === 'simple') { e.ui.fullscreen = false; e.ui.view = 'simple' }
  if (a === 'checks') { e.ui.fullscreen = false; e.ui.showChecks = true }
  // these show something in the editor: the help steps aside
  emit('close')
  emit('reveal')
}
function actionLabel(a: Action): string {
  if (a === 'snap') return t(ed.value?.ui.snapKey ? 'notesHelp.actions.snapIsOn' : 'notesHelp.actions.snapOn')
  if (a === 'musician') return t(musicianView.value ? 'notesHelp.actions.musicianOff' : 'notesHelp.actions.musicianOn')
  return t(`notesHelp.actions.${a}`)
}

// ---- the table of contents: jump to a section, and follow the one being read ----
const active = ref<NotesHelpSection>('what')
const secId = (id: string): string => `${uid}-${id}`
let jumping = 0
function go(id: NotesHelpSection, smooth = true): void {
  const el = document.getElementById(secId(id))
  const box = body.value
  if (!el || !box) return
  active.value = id
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  // the scroll spy waits until the jump is over, so it does not light the sections passed on the way
  window.clearTimeout(jumping)
  const done = (): void => { window.clearTimeout(jumping); jumping = 0 }
  jumping = window.setTimeout(done, smooth && !reduce ? 1500 : 50)
  if (smooth && !reduce) box.addEventListener('scrollend', done, { once: true })
  box.scrollTo({ top: el.offsetTop - 8, behavior: smooth && !reduce ? 'smooth' : 'auto' })
  el.querySelector<HTMLElement>('h3')?.focus({ preventScroll: true })
}
function onScroll(): void {
  const box = body.value
  if (!box || jumping) return
  if (box.scrollTop + box.clientHeight >= box.scrollHeight - 4) { active.value = SECTIONS[SECTIONS.length - 1]; return }
  let cur: NotesHelpSection = SECTIONS[0]
  for (const id of SECTIONS) {
    const el = document.getElementById(secId(id))
    if (el && el.offsetTop - box.scrollTop <= 96) cur = id
  }
  active.value = cur
}
watch(() => props.open, async (o) => {
  if (!o) return
  active.value = props.start ?? 'what'
  await nextTick()
  if (props.start) go(props.start, false)
}, { immediate: true })
</script>

<template>
  <!-- Teleported: a fixed overlay inside a transformed or filtered parent would be sized to it, not to the screen -->
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[60] flex justify-center bg-black/60 sm:items-center sm:p-4" @click.self="emit('close')">
      <div
        ref="dialogEl" role="dialog" aria-modal="true" :aria-labelledby="`${uid}-title`"
        class="flex h-full w-full min-w-0 max-w-6xl flex-col overflow-hidden bg-panel shadow-2xl sm:h-[min(880px,calc(100dvh-2rem))] sm:rounded-xl sm:border sm:border-border"
        @keydown="onKeydown"
      >
        <header class="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
          <span class="accent-gradient grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white"><ScoreIcon name="notes" class="h-4 w-4" /></span>
          <h2 :id="`${uid}-title`" class="m-0 min-w-0 flex-1 truncate text-lg font-semibold text-text">{{ t('notesHelp.title') }}</h2>
          <button type="button" class="grid h-8 w-8 shrink-0 place-items-center rounded-full text-text-dim hover:bg-panel-2 hover:text-text focus-visible:outline-2 focus-visible:outline-accent1" :aria-label="t('common.close')" @click="emit('close')">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </header>

        <!-- a phone: the contents as a select -->
        <div class="shrink-0 border-b border-border px-4 py-2 md:hidden">
          <label :for="`${uid}-pick`" class="sr-only">{{ t('notesHelp.tocPick') }}</label>
          <select
            :id="`${uid}-pick`" :value="active" class="h-9 w-full rounded-lg border border-border bg-panel-2 px-2 text-sm text-text"
            @change="go(($event.target as HTMLSelectElement).value as NotesHelpSection)"
          >
            <option v-for="(id, i) in SECTIONS" :key="id" :value="id">{{ i + 1 }}. {{ s(`${id}.toc`) }}</option>
          </select>
        </div>

        <div class="flex min-h-0 flex-1">
          <nav class="hidden w-60 shrink-0 overflow-y-auto border-e border-border p-3 md:block" :aria-label="t('notesHelp.toc')">
            <p class="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-text-dim">{{ t('notesHelp.toc') }}</p>
            <ol class="m-0 list-none space-y-0.5 p-0">
              <li v-for="(id, i) in SECTIONS" :key="id">
                <a
                  :href="`#${secId(id)}`" :aria-current="active === id ? 'true' : undefined"
                  class="flex items-baseline gap-2 rounded-lg px-2 py-1.5 text-[13px] leading-snug no-underline focus-visible:outline-2 focus-visible:outline-accent1"
                  :class="active === id ? 'bg-accent1/15 font-medium text-text' : 'text-text-dim hover:bg-panel-2 hover:text-text'"
                  @click.prevent="go(id)"
                ><span class="w-4 shrink-0 text-end text-[11px] tabular-nums opacity-70">{{ i + 1 }}</span>{{ s(`${id}.toc`) }}</a>
              </li>
            </ol>
          </nav>

          <!-- data-autofocus: the keyboard lands where the arrows and Page Down scroll the text -->
          <div
            ref="body" data-autofocus tabindex="0"
            class="relative min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-16 pt-5 text-sm leading-relaxed text-text-dim focus-visible:outline-none sm:px-7 [&_b]:font-semibold [&_b]:text-text"
            @scroll.passive="onScroll"
          >
            <div class="mx-auto min-w-0 max-w-3xl space-y-12">
              <!-- 1 -->
              <section :id="secId('what')" class="space-y-3" :aria-labelledby="`${secId('what')}-h`">
                <h3 :id="`${secId('what')}-h`" tabindex="-1" class="nh-h"><span class="nh-n">1</span>{{ s('what.title') }}</h3>
                <p v-for="(x, i) in list('what.p')" :key="i" v-html="x"></p>
                <h4 class="nh-h4">{{ s('what.plansTitle') }}</h4>
                <p>{{ s('what.plansIntro') }}</p>
                <HelpTable
                  :columns="[{ key: 'name', label: s('what.head.name'), nowrap: true }, { key: 'text', label: s('what.head.text') }, { key: 'when', label: s('what.head.when') }]"
                  :rows="plans" :current="(r) => !!props.plan && r.id === props.plan" min-width="560px"
                />
              </section>

              <!-- 2 -->
              <section :id="secId('roll')" class="space-y-3" :aria-labelledby="`${secId('roll')}-h`">
                <h3 :id="`${secId('roll')}-h`" tabindex="-1" class="nh-h"><span class="nh-n">2</span>{{ s('roll.title') }}</h3>
                <p v-for="(x, i) in list('roll.p').slice(0, 3)" :key="`a${i}`" v-html="x"></p>
                <NotesHelpFigure kind="roll" />
                <p v-for="(x, i) in list('roll.p').slice(3, 4)" :key="`b${i}`" v-html="x"></p>
                <NotesHelpFigure kind="bars" />
                <p v-for="(x, i) in list('roll.p').slice(4)" :key="`c${i}`" v-html="x"></p>
                <h4 class="nh-h4">{{ s('roll.toolsTitle') }}</h4>
                <ul class="nh-ul"><li v-for="(x, i) in list('roll.tools')" :key="i" v-html="x"></li></ul>
                <h4 class="nh-h4">{{ s('roll.viewsTitle') }}</h4>
                <ul class="nh-ul"><li v-for="(x, i) in list('roll.views')" :key="i" v-html="x"></li></ul>
                <h4 class="nh-h4">{{ s('roll.keysTitle') }}</h4>
                <p class="text-xs">{{ s('roll.keysHint') }}</p>
                <HelpTable :columns="[{ key: 'key', label: s('roll.head.key'), mono: true, nowrap: true }, { key: 'what', label: s('roll.head.what') }]" :rows="keys" />
              </section>

              <!-- 3 -->
              <section :id="secId('lanes')" class="space-y-3" :aria-labelledby="`${secId('lanes')}-h`">
                <h3 :id="`${secId('lanes')}-h`" tabindex="-1" class="nh-h"><span class="nh-n">3</span>{{ s('lanes.title') }}</h3>
                <p v-for="(x, i) in list('lanes.p').slice(0, 2)" :key="`a${i}`" v-html="x"></p>
                <NotesHelpFigure kind="lanes" />
                <p v-for="(x, i) in list('lanes.p').slice(2)" :key="`b${i}`" v-html="x"></p>
                <h4 class="nh-h4">{{ s('lanes.voiceTitle') }}</h4>
                <p v-for="(x, i) in list('lanes.voice').slice(0, 2)" :key="`c${i}`" v-html="x"></p>
                <NotesHelpFigure kind="octave" />
                <p v-for="(x, i) in list('lanes.voice').slice(2)" :key="`d${i}`" v-html="x"></p>
              </section>

              <!-- 4 -->
              <section :id="secId('key')" class="space-y-3" :aria-labelledby="`${secId('key')}-h`">
                <h3 :id="`${secId('key')}-h`" tabindex="-1" class="nh-h"><span class="nh-n">4</span>{{ s('key.title') }}</h3>
                <p v-for="(x, i) in list('key.p').slice(0, 2)" :key="`a${i}`" v-html="x"></p>
                <NotesHelpFigure kind="key" />
                <p v-for="(x, i) in list('key.p').slice(2)" :key="`b${i}`" v-html="x"></p>
                <div v-if="can('snap')"><button type="button" class="nh-act" :disabled="props.editor?.ui.snapKey" @click="act('snap')"><ScoreIcon :name="props.editor?.ui.snapKey ? 'check' : 'lock'" />{{ actionLabel('snap') }}</button></div>
                <h4 class="nh-h4">{{ s('key.tempoTitle') }}</h4>
                <p v-for="(x, i) in list('key.tempo')" :key="`c${i}`" v-html="x"></p>
              </section>

              <!-- 5 -->
              <section :id="secId('chords')" class="space-y-3" :aria-labelledby="`${secId('chords')}-h`">
                <h3 :id="`${secId('chords')}-h`" tabindex="-1" class="nh-h"><span class="nh-n">5</span>{{ s('chords.title') }}</h3>
                <p v-for="(x, i) in list('chords.p').slice(0, 2)" :key="`a${i}`" v-html="x"></p>
                <NotesHelpFigure kind="chords" />
                <p v-for="(x, i) in list('chords.p').slice(2)" :key="`b${i}`" v-html="x"></p>
                <div v-if="can('musician')"><button type="button" class="nh-act" :aria-pressed="musicianView" @click="act('musician')">{{ actionLabel('musician') }}</button></div>
                <p class="nh-note">{{ s('chords.note') }}</p>
              </section>

              <!-- 6 -->
              <section :id="secId('parts')" class="space-y-3" :aria-labelledby="`${secId('parts')}-h`">
                <h3 :id="`${secId('parts')}-h`" tabindex="-1" class="nh-h"><span class="nh-n">6</span>{{ s('parts.title') }}</h3>
                <p v-for="(x, i) in list('parts.p').slice(0, 2)" :key="`a${i}`" v-html="x"></p>
                <NotesHelpFigure kind="parts" />
                <p v-for="(x, i) in list('parts.p').slice(2)" :key="`b${i}`" v-html="x"></p>
                <p class="nh-tip">{{ s('parts.tip') }}</p>
              </section>

              <!-- 7 -->
              <section :id="secId('start')" class="space-y-3" :aria-labelledby="`${secId('start')}-h`">
                <h3 :id="`${secId('start')}-h`" tabindex="-1" class="nh-h"><span class="nh-n">7</span>{{ s('start.title') }}</h3>
                <p>{{ s('start.intro') }}</p>
                <div class="grid gap-3 lg:grid-cols-3">
                  <div v-for="(w, i) in ways" :key="i" class="flex flex-col gap-2 rounded-lg border border-border/70 bg-panel-2/50 p-3.5">
                    <p class="m-0 flex items-center gap-2 font-medium text-text">
                      <span class="grid h-7 w-7 shrink-0 place-items-center rounded-lg" :class="i === 0 ? 'accent-gradient text-white' : 'bg-accent1/15 text-accent'"><ScoreIcon :name="WAY_ICONS[i]" class="h-3.5 w-3.5" /></span>{{ w.title }}
                    </p>
                    <p class="m-0 text-[13px]">{{ w.text }}</p>
                  </div>
                </div>
                <div v-if="can('draw')"><button type="button" class="nh-act" @click="act('draw')"><ScoreIcon name="draw" />{{ actionLabel('draw') }}</button></div>
                <div class="nh-note">
                  <p class="m-0 mb-1 font-medium text-text">{{ s('start.sparseTitle') }}</p>
                  <p class="m-0">{{ s('start.sparse') }}</p>
                </div>
                <h4 class="nh-h4">{{ s('start.alsoTitle') }}</h4>
                <ul class="nh-ul"><li v-for="(x, i) in list('start.also')" :key="i" v-html="x"></li></ul>
              </section>

              <!-- 8 -->
              <section :id="secId('simple')" class="space-y-3" :aria-labelledby="`${secId('simple')}-h`">
                <h3 :id="`${secId('simple')}-h`" tabindex="-1" class="nh-h"><span class="nh-n">8</span>{{ s('simple.title') }}</h3>
                <p v-for="(x, i) in list('simple.p').slice(0, 2)" :key="`a${i}`" v-html="x"></p>
                <NotesHelpFigure kind="simple" />
                <p v-for="(x, i) in list('simple.p').slice(2)" :key="`b${i}`" v-html="x"></p>
                <div v-if="can('simple')"><button type="button" class="nh-act" @click="act('simple')"><ScoreIcon name="eye" />{{ actionLabel('simple') }}</button></div>
              </section>

              <!-- 9 -->
              <section :id="secId('checks')" class="space-y-3" :aria-labelledby="`${secId('checks')}-h`">
                <h3 :id="`${secId('checks')}-h`" tabindex="-1" class="nh-h"><span class="nh-n">9</span>{{ s('checks.title') }}</h3>
                <p>{{ s('checks.intro') }}</p>
                <HelpTable
                  :columns="[{ key: 'check', label: s('checks.head.check') }, { key: 'means', label: s('checks.head.means') }, { key: 'fix', label: s('checks.head.fix') }]"
                  :rows="checkRows" min-width="600px"
                />
                <p class="nh-tip">{{ s('checks.tip') }}</p>
                <div v-if="can('checks')"><button type="button" class="nh-act" @click="act('checks')"><ScoreIcon name="check" />{{ actionLabel('checks') }}</button></div>
              </section>

              <!-- 10 -->
              <section :id="secId('recipes')" class="space-y-3" :aria-labelledby="`${secId('recipes')}-h`">
                <h3 :id="`${secId('recipes')}-h`" tabindex="-1" class="nh-h"><span class="nh-n">10</span>{{ s('recipes.title') }}</h3>
                <p>{{ s('recipes.intro') }}</p>
                <div class="grid gap-3 lg:grid-cols-2">
                  <div v-for="(r, i) in recipes" :key="i" class="flex flex-col gap-2 rounded-lg border border-accent1/25 bg-accent1/[0.06] p-3.5">
                    <p class="m-0 font-medium text-text">{{ r.title }}</p>
                    <ol class="m-0 list-decimal space-y-1 ps-5 text-[13px]"><li v-for="(x, j) in r.steps" :key="j">{{ x }}</li></ol>
                    <div v-if="r.action && can(r.action)" class="mt-auto pt-1"><button type="button" class="nh-act" @click="act(r.action)">{{ actionLabel(r.action) }}</button></div>
                  </div>
                </div>
              </section>

              <!-- 11 -->
              <section :id="secId('faq')" class="space-y-3" :aria-labelledby="`${secId('faq')}-h`">
                <h3 :id="`${secId('faq')}-h`" tabindex="-1" class="nh-h"><span class="nh-n">11</span>{{ s('faq.title') }}</h3>
                <div class="divide-y divide-border/60 rounded-lg border border-border/60">
                  <details v-for="(q, i) in faq" :key="i" class="group">
                    <summary class="flex cursor-pointer list-none items-center gap-2 px-3.5 py-2.5 font-medium text-text hover:bg-panel-2/50 focus-visible:outline-2 focus-visible:outline-accent1 [&::-webkit-details-marker]:hidden">
                      <ScoreIcon name="right" class="h-3.5 w-3.5 shrink-0 text-text-dim transition-transform group-open:rotate-90 rtl:-scale-x-100 motion-reduce:transition-none" />{{ q.q }}
                    </summary>
                    <p class="m-0 px-3.5 pb-3 ps-[2.15rem]">{{ q.a }}</p>
                  </details>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.nh-h{display:flex;align-items:center;gap:10px;margin:0;font-size:18px;font-weight:600;line-height:1.3;color:var(--color-text);scroll-margin-top:8px}
.nh-h:focus{outline:none}
.nh-h:focus-visible{outline:2px solid var(--color-accent1);outline-offset:3px;border-radius:4px}
.nh-n{display:grid;place-items:center;min-width:26px;height:26px;padding:0 6px;border-radius:8px;background:rgba(168,85,247,.18);color:var(--color-accent);font-size:12.5px;font-weight:700;font-variant-numeric:tabular-nums;flex:none}
.nh-h4{margin:18px 0 0;font-size:14px;font-weight:600;color:var(--color-text)}
.nh-ul{margin:0;padding-inline-start:1.1rem;list-style:disc}
.nh-ul>li+li{margin-top:6px}
.nh-note{margin:0;border-radius:8px;border:1px solid color-mix(in srgb,var(--color-status-queued) 30%,transparent);background:color-mix(in srgb,var(--color-status-queued) 5%,transparent);padding:10px 12px}
.nh-tip{margin:0;border-radius:8px;border:1px solid color-mix(in srgb,var(--color-accent1) 25%,transparent);background:color-mix(in srgb,var(--color-accent1) 6%,transparent);padding:10px 12px}
.nh-act{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:8px;border:1px solid color-mix(in srgb,var(--color-accent1) 45%,transparent);font-size:12.5px;color:var(--color-accent)}
.nh-act:hover:not(:disabled){background:color-mix(in srgb,var(--color-accent1) 12%,transparent)}
.nh-act:disabled{opacity:.7;cursor:default}
.nh-act:focus-visible{outline:2px solid var(--color-accent1);outline-offset:1px}
.nh-act :deep(svg){width:14px;height:14px;flex:none}
</style>
