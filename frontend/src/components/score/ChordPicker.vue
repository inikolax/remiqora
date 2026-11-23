<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { commonExtraChords, diatonicTriads, displayChord, parseChord, parseKey, pcName, setChord, chordRoman } from '../../audio/score'
import { pianoKey } from '../../audio/pianoSynth'
import { useScoreEditor } from './useScoreEditor'
import { musicianView } from './scoreUi'
import ScoreIcon from './ScoreIcon.vue'

/**
 * A bar's chord: the key's triads first (YuE2 keeps simple triads best), the usual borrowed ones, then 7ths and
 * slash chords under "more". Listen plays it; "two in a bar" adds a second chord at the half bar.
 */
const props = defineProps<{ bar: number; beat: number }>()
const emit = defineEmits<{ close: [] }>()
const ed = useScoreEditor()
const { t } = useI18n()

const key = computed(() => ed.score.value.key)
const minor = computed(() => parseKey(key.value)?.minorLike ?? false)
const current = computed(() => ed.score.value.chords.find((c) => c.bar === props.bar && Math.abs(c.beat - props.beat) < 1e-6)?.name ?? '')
const triads = computed(() => diatonicTriads(key.value).filter((x) => x.quality !== 'dim'))
const extras = computed(() => {
  const out = commonExtraChords(key.value).map((x) => ({ name: x.name, roman: x.roman }))
  // the tonic over its third (Dm/F): a smooth bass line
  const tonic = diatonicTriads(key.value)[0]
  out.push({ name: `${tonic.name}/${pcName(tonic.pcs[1], key.value)}`, roman: '' })
  return out
})
const more = computed(() => {
  const out: string[] = []
  for (const x of diatonicTriads(key.value)) {
    if (x.quality === 'min') out.push(`${x.name}7`)
    else if (x.quality === 'maj') out.push(x.degree === 5 ? `${x.name}7` : `${x.name.replace(/m$/, '')}maj7`)
  }
  const v = commonExtraChords(key.value)[0]
  if (minor.value && v) out.push(`${v.name}7`)
  for (const x of diatonicTriads(key.value)) if (x.quality === 'maj' && x.degree !== 1) out.push(`${x.name}/${pcName(x.pcs[1], key.value)}`)
  return [...new Set(out)]
})
const moreOpen = ref(false)
const halfBeat = computed(() => ed.score.value.meter[0] / 2)
const twoInBar = computed(() => ed.score.value.chords.filter((c) => c.bar === props.bar).length > 1)

function listen(name = current.value): void {
  const c = parseChord(name)
  if (!c) return
  const root = 48 + c.root
  if (c.bassPc != null) pianoKey(36 + c.bassPc, 80)
  for (const pc of c.pcs) pianoKey(root + ((pc - c.root + 12) % 12), 85)
}
function pick(name: string): void {
  ed.commit(setChord(ed.score.value, props.bar, props.beat, name))
  listen(name)
  emit('close')
}
function remove(): void {
  ed.commit(setChord(ed.score.value, props.bar, props.beat, null))
  emit('close')
}
function toggleTwo(): void {
  const s = ed.score.value
  if (twoInBar.value) {
    const second = s.chords.find((c) => c.bar === props.bar && c.beat > 0)
    if (second) ed.commit(setChord(s, props.bar, second.beat, null))
  } else {
    ed.commit(setChord(s, props.bar, halfBeat.value, current.value || triads.value[0]?.name || 'C'))
  }
  emit('close')
}
</script>

<template>
  <div class="p-3">
    <p class="se-h">{{ t('score.chords.title', { n: bar + 1 }) }}<template v-if="beat > 0"> · {{ t('score.chords.beat', { n: beat + 1 }) }}</template></p>
    <p class="se-d mb-2.5">{{ t('score.chords.hint', { key: displayChord(key) }) }}</p>
    <div class="grid grid-cols-3 gap-1.5">
      <button
        v-for="c in triads" :key="c.name" type="button"
        class="flex h-11 flex-col items-center justify-center rounded-lg border leading-tight"
        :class="current === c.name ? 'border-[#ec4899] bg-[#ec4899]/15 text-[#f9a8d4]' : 'border-border bg-panel-2 hover:border-[#3d3d4d]'"
        :aria-pressed="current === c.name" @click="pick(c.name)"
      ><b class="text-sm font-semibold">{{ displayChord(c.name) }}</b><small v-if="musicianView" class="font-mono text-[10px] text-[#8a8a9c]">{{ c.roman }}</small></button>
    </div>
    <p class="se-lab mb-1.5 mt-3">{{ minor ? t('score.chords.oftenMinor') : t('score.chords.oftenMajor') }}</p>
    <div class="flex flex-wrap gap-1.5">
      <button v-for="c in extras" :key="c.name" type="button" class="rounded-md border px-2 py-0.5 text-[11.5px]" :class="current === c.name ? 'border-[#ec4899] text-[#f9a8d4]' : 'border-border text-text-dim hover:text-text'" :aria-pressed="current === c.name" @click="pick(c.name)">
        {{ displayChord(c.name) }}<small v-if="c.roman && musicianView" class="ms-1 text-[#8a8a9c]">{{ c.roman }}</small>
      </button>
    </div>
    <button type="button" class="se-lab mb-1.5 mt-3 flex items-center gap-1 hover:text-text" :aria-expanded="moreOpen" @click="moreOpen = !moreOpen">
      {{ t('score.chords.more') }}<ScoreIcon :name="moreOpen ? 'up' : 'down'" class="h-3 w-3" />
    </button>
    <div v-if="moreOpen" class="flex flex-wrap gap-1.5">
      <button v-for="c in more" :key="c" type="button" class="rounded-md border px-2 py-0.5 text-[11.5px]" :class="current === c ? 'border-[#ec4899] text-[#f9a8d4]' : 'border-border text-text-dim hover:text-text'" :title="musicianView ? chordRoman(c, key) : undefined" @click="pick(c)">{{ displayChord(c) }}</button>
    </div>
    <div class="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-2.5">
      <button type="button" class="se-btn" :disabled="!current" @click="listen()"><ScoreIcon name="play" fill />{{ t('score.chords.listen') }}</button>
      <button type="button" class="se-btn" :disabled="beat > 0" @click="toggleTwo">{{ twoInBar ? t('score.chords.oneInBar') : t('score.chords.twoInBar') }}</button>
      <span class="flex-1"></span>
      <button type="button" class="se-btn plain" :disabled="!current" @click="remove">{{ t('score.chords.remove') }}</button>
    </div>
  </div>
</template>
