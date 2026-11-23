<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { displayChord, keyFrom, noteName, parseKey, scalePitchClasses, setBars, setKey, setMeter, setTempo } from '../../audio/score'
import { useScoreEditor } from './useScoreEditor'
import { TONICS, fmtTime } from './scoreUi'
import ScorePopover from './ScorePopover.vue'
import ScoreIcon from './ScoreIcon.vue'

/** The song's settings as chips: key, tempo, meter, length; each opens a small card. */
const props = defineProps<{ disabled?: boolean }>()
const ed = useScoreEditor()
const { t } = useI18n()

const open = ref<'' | 'key' | 'tempo' | 'meter' | 'len'>('')
const anchors: Record<string, HTMLElement | null> = {}
const anchor = ref<HTMLElement | null>(null)
function toggle(which: 'key' | 'tempo' | 'meter' | 'len', e: MouseEvent): void {
  anchors[which] = e.currentTarget as HTMLElement
  anchor.value = anchors[which]
  open.value = open.value === which ? '' : which
}

const s = computed(() => ed.score.value)
const keyInfo = computed(() => parseKey(s.value.key))
const minor = computed(() => keyInfo.value?.minorLike ?? false)
const transposeNotes = ref(true)
const scaleNames = computed(() => scalePitchClasses(s.value.key).map((pc) => noteName(60 + pc, s.value.key, false)))
function pickKey(i: number, isMinor: boolean): void {
  const name = isMinor ? TONICS[i].minor : TONICS[i].major
  const key = keyFrom(name, isMinor ? 'minor' : 'major')
  if (key === s.value.key) return
  ed.commit(setKey(s.value, key, { transposeNotes: transposeNotes.value }))
}
const tonicIndex = computed(() => keyInfo.value?.tonic ?? 0)

function tempo(v: number): void {
  const n = Math.round(Math.max(30, Math.min(260, v || 0)))
  if (n !== s.value.tempo) ed.commit(setTempo(s.value, n), 'tempo')
}
const METERS: [number, number][] = [[4, 4], [3, 4], [2, 4], [6, 8], [12, 8]]
function meter(m: [number, number]): void {
  if (m[0] === s.value.meter[0] && m[1] === s.value.meter[1]) return
  ed.commit(setMeter(s.value, m))
  open.value = ''
}
function bars(n: number): void {
  const next = Math.max(1, Math.min(400, Math.round(n || 0)))
  if (next !== s.value.bars) ed.commit(setBars(s.value, next), 'bars')
}
const lenTime = computed(() => fmtTime(ed.total.value * ed.spt.value))
const eightBars = computed(() => Math.round(8 * ed.tpb.value * ed.spt.value))
</script>

<template>
  <div class="contents">
    <button type="button" class="se-chip" :disabled="props.disabled" :aria-expanded="open === 'key'" :title="t('score.chips.keyTitle')" @click="toggle('key', $event)">
      <span class="l">{{ t('score.chips.key') }}</span><span class="v">{{ props.disabled ? '—' : displayChord(s.key) }}</span><span v-if="!props.disabled" class="h">{{ minor ? t('score.chips.minor') : t('score.chips.major') }}</span><ScoreIcon name="down" />
    </button>
    <button type="button" class="se-chip" :disabled="props.disabled" :aria-expanded="open === 'tempo'" :title="t('score.chips.tempoTitle')" @click="toggle('tempo', $event)">
      <span class="l">{{ t('score.chips.tempo') }}</span><span class="v">{{ props.disabled ? '—' : s.tempo }}</span><ScoreIcon name="down" />
    </button>
    <button type="button" class="se-chip" :disabled="props.disabled" :aria-expanded="open === 'meter'" :title="t('score.chips.meter')" @click="toggle('meter', $event)">
      <span class="l">{{ t('score.chips.meter') }}</span><span class="v">{{ s.meter[0] }}/{{ s.meter[1] }}</span>
    </button>
    <button type="button" class="se-chip" :disabled="props.disabled" :aria-expanded="open === 'len'" :title="t('score.chips.lenTitle', { bars: 8, sec: eightBars })" @click="toggle('len', $event)">
      <span class="l">{{ t('score.chips.length') }}</span><span class="v">{{ t('score.chips.bars', { n: s.bars }, s.bars) }}</span><span v-if="s.bars" class="h">≈ {{ lenTime }}</span>
    </button>

    <ScorePopover :open="open === 'key'" :anchor="anchor" :label="t('score.chips.key')" :width="300" @close="open = ''">
      <div class="p-3">
        <p class="se-h">{{ t('score.chips.key') }}</p>
        <p class="se-d">{{ t('score.chips.keyHint') }}</p>
        <div class="my-2 grid grid-cols-6 gap-1">
          <button
            v-for="(k, i) in TONICS" :key="k.label" type="button"
            class="h-7 rounded-md border text-[12px]" :class="tonicIndex === i ? 'border-accent1/60 bg-accent1/20 font-semibold text-white' : 'border-border text-text-dim hover:text-text'"
            :aria-pressed="tonicIndex === i" @click="pickKey(i, minor)"
          >{{ k.label }}</button>
        </div>
        <div class="se-seg w-full" role="radiogroup" :aria-label="t('score.chips.mode')">
          <button type="button" role="radio" class="flex-1 justify-center" :class="{ on: !minor }" :aria-checked="!minor" @click="pickKey(tonicIndex, false)">{{ t('score.chips.major') }}</button>
          <button type="button" role="radio" class="flex-1 justify-center" :class="{ on: minor }" :aria-checked="minor" @click="pickKey(tonicIndex, true)">{{ t('score.chips.minor') }}</button>
        </div>
        <p class="se-d mt-2.5">{{ t('score.chips.scaleNotes') }}</p>
        <div class="my-2 flex gap-[3px]">
          <span v-for="(n, i) in scaleNames" :key="n + i" class="grid h-[26px] flex-1 place-items-center rounded-[5px] text-[11.5px]" :class="i === 0 ? 'accent-gradient font-semibold text-white' : 'bg-accent1/10 text-accent'">{{ n }}</span>
        </div>
        <button type="button" role="switch" class="se-toggle whitespace-normal text-start" :aria-checked="transposeNotes" @click="transposeNotes = !transposeNotes"><span class="sw"></span>{{ t('score.chips.transpose') }}</button>
      </div>
    </ScorePopover>

    <ScorePopover :open="open === 'tempo'" :anchor="anchor" :label="t('score.chips.tempo')" :width="240" @close="open = ''">
      <div class="p-3">
        <p class="se-h">{{ t('score.chips.tempoTitle') }}</p>
        <div class="my-2.5 flex items-center gap-2">
          <button type="button" class="se-btn icon" :aria-label="t('score.chips.slower')" @click="tempo(s.tempo - 1)"><ScoreIcon name="minus" /></button>
          <input type="number" min="30" max="260" class="se-input w-20 text-center text-base font-semibold tabular-nums" :value="s.tempo" :aria-label="t('score.chips.tempo')" @change="tempo(Number(($event.target as HTMLInputElement).value))" />
          <button type="button" class="se-btn icon" :aria-label="t('score.chips.faster')" @click="tempo(s.tempo + 1)"><ScoreIcon name="plus" /></button>
          <span class="text-xs text-text-dim">BPM</span>
        </div>
        <p class="se-d">{{ t('score.chips.tempoHint') }}</p>
      </div>
    </ScorePopover>

    <ScorePopover :open="open === 'meter'" :anchor="anchor" :label="t('score.chips.meter')" @close="open = ''">
      <div class="flex gap-1 p-2">
        <button v-for="m in METERS" :key="m.join('/')" type="button" class="se-btn" :class="{ on: m[0] === s.meter[0] && m[1] === s.meter[1] }" @click="meter(m)">{{ m[0] }}/{{ m[1] }}</button>
      </div>
    </ScorePopover>

    <ScorePopover :open="open === 'len'" :anchor="anchor" :label="t('score.chips.length')" :width="300" @close="open = ''">
      <div class="p-3">
        <p class="se-h">{{ t('score.chips.lenCard') }}</p>
        <p class="se-d">{{ t('score.chips.lenHint', { sec: eightBars, bpm: s.tempo }) }}</p>
        <div class="my-3 flex items-center gap-2">
          <button type="button" class="se-btn icon" :aria-label="t('score.chips.fewer')" @click="bars(s.bars - 1)"><ScoreIcon name="minus" /></button>
          <input type="number" min="1" max="400" class="se-input w-20 text-center text-lg font-semibold tabular-nums" :value="s.bars" :aria-label="t('score.chips.length')" @change="bars(Number(($event.target as HTMLInputElement).value))" />
          <button type="button" class="se-btn icon" :aria-label="t('score.chips.more')" @click="bars(s.bars + 1)"><ScoreIcon name="plus" /></button>
          <span class="text-[12.5px] text-text-dim">{{ t('score.chips.barsWord', s.bars) }} ≈ {{ lenTime }}</span>
        </div>
        <p class="se-d mb-1.5">{{ t('score.chips.usual') }}</p>
        <div class="grid grid-cols-[1fr_auto] gap-x-2.5 gap-y-0.5 text-[12px]">
          <span class="text-text-dim">{{ t('score.chips.usualIntro') }}</span><span>{{ t('score.chips.usualIntroBars') }}</span>
          <span class="text-text-dim">{{ t('score.chips.usualVerse') }}</span><span>{{ t('score.chips.usualVerseBars') }}</span>
          <span class="text-text-dim">{{ t('score.chips.usualLine') }}</span><span>{{ t('score.chips.usualLineBars') }}</span>
        </div>
      </div>
    </ScorePopover>
  </div>
</template>
