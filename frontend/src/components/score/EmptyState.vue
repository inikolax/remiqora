<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { barsForSection, keyFrom, lyricsSections, parseKey, scaffoldFromLyrics, chordFromRoman, displayChord } from '../../audio/score'
import { useScoreEditor } from './useScoreEditor'
import { SECTION_COLORS, TONICS, fmtTime } from './scoreUi'
import ScoreIcon from './ScoreIcon.vue'
import NotesHelpButton from './help/NotesHelpButton.vue'

/**
 * No score yet: draw one from scratch (a skeleton from the lyrics' section tags, a placeholder chord a bar), take
 * the melody of a song, or drop a MIDI file.
 */
const props = defineProps<{ extracting?: boolean; compact?: boolean }>()
const emit = defineEmits<{ fromSong: []; midiFile: [file: File]; piano: [] }>()
const ed = useScoreEditor()
const { t } = useI18n()

const tonic = ref(2)
const minor = ref(true)
const tempo = ref(95)
const meter = ref<'4/4' | '3/4' | '6/8'>('4/4')
const withChords = ref(true)
const key = computed(() => keyFrom(minor.value ? TONICS[tonic.value].minor : TONICS[tonic.value].major, minor.value ? 'minor' : 'major'))
const found = computed(() => lyricsSections(ed.lyrics()))
const preview = computed(() => found.value.map((f) => ({ type: f.type, tag: f.tag, bars: barsForSection(f.type, f.lines) })))
const totalBars = computed(() => preview.value.reduce((a, b) => a + b.bars, 0) || 8)
const meterPair = computed<[number, number]>(() => meter.value.split('/').map(Number) as [number, number])
const seconds = computed(() => totalBars.value * (meterPair.value[0] * 4 / meterPair.value[1]) * 60 / Math.max(1, tempo.value))
const progression = computed(() => (parseKey(key.value)?.minorLike ? ['i', 'VI', 'III', 'VII'] : ['I', 'V', 'vi', 'IV']))
const progressionText = computed(() => progression.value.map((r) => displayChord(chordFromRoman(r, key.value) ?? r)).join('–'))

function create(): void {
  let s = scaffoldFromLyrics(ed.lyrics(), { key: key.value, tempo: tempo.value, meter: meterPair.value })
  if (!withChords.value) s = { ...s, chords: [] }
  ed.replaceScore(s)
}

const dragOver = ref(false)
const file = ref<HTMLInputElement | null>(null)
function onDrop(e: DragEvent): void {
  dragOver.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f) emit('midiFile', f)
}
function onFile(e: Event): void {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  input.value = ''
  if (f) emit('midiFile', f)
}
</script>

<template>
  <div class="space-y-3">
    <div class="px-2 pt-1 text-center">
      <p class="text-[15px] font-semibold">{{ t('score.empty.title') }}</p>
      <p class="text-[12.5px] text-text-dim">{{ t('score.empty.lead') }}</p>
    </div>
    <div class="grid gap-3" :class="props.compact ? 'grid-cols-1' : 'grid-cols-[1.25fr_1fr_1fr]'">
      <!-- 1: from scratch -->
      <div class="se-empty-main flex flex-col gap-2.5 rounded-xl p-4">
        <div class="flex items-center gap-3">
          <span class="accent-gradient grid h-10 w-10 shrink-0 place-items-center rounded-[11px] text-white"><ScoreIcon name="draw" class="h-5 w-5" /></span>
          <div><h3 class="m-0 text-[15px] font-semibold">{{ t('score.empty.drawTitle') }}</h3><p class="m-0 text-[12.5px] text-text-dim">{{ t('score.empty.drawLead') }}</p></div>
        </div>
        <div class="flex flex-col gap-2 rounded-[9px] border border-[#2a2a36] bg-black/20 p-2.5">
          <div class="flex flex-wrap items-center gap-1.5">
            <label class="se-chip"><span class="l">{{ t('score.chips.key') }}</span>
              <select v-model.number="tonic" class="bg-transparent font-semibold text-text outline-none" :aria-label="t('score.chips.key')">
                <option v-for="(k, i) in TONICS" :key="k.label" :value="i" class="bg-panel">{{ k.label }}</option>
              </select>
              <select v-model="minor" class="bg-transparent text-[11.5px] text-[#8a8a9c] outline-none" :aria-label="t('score.chips.mode')">
                <option :value="true" class="bg-panel">{{ t('score.chips.minor') }}</option>
                <option :value="false" class="bg-panel">{{ t('score.chips.major') }}</option>
              </select>
            </label>
            <label class="se-chip"><span class="l">{{ t('score.chips.tempo') }}</span><input v-model.number="tempo" type="number" min="30" max="260" class="w-12 bg-transparent font-semibold text-text outline-none" :aria-label="t('score.chips.tempo')" /></label>
            <label class="se-chip"><span class="l">{{ t('score.chips.meter') }}</span>
              <select v-model="meter" class="bg-transparent font-semibold text-text outline-none" :aria-label="t('score.chips.meter')">
                <option v-for="m in ['4/4', '3/4', '6/8']" :key="m" :value="m" class="bg-panel">{{ m }}</option>
              </select>
            </label>
          </div>
          <p class="m-0 text-[11px] text-[#8a8a9c]">{{ found.length ? t('score.empty.fromLyrics', { tags: found.slice(0, 4).map((f) => `[${f.tag || f.type}]`).join(' ') + (found.length > 4 ? ' …' : '') }) : t('score.empty.noTags') }}</p>
          <div v-if="preview.length" class="flex h-[22px] gap-[3px]" aria-hidden="true">
            <span
              v-for="(p, i) in preview" :key="i" class="flex items-center justify-center overflow-hidden whitespace-nowrap rounded text-[10px] font-semibold"
              :style="{ flex: p.bars, background: SECTION_COLORS[p.type][0], color: SECTION_COLORS[p.type][1] }" :title="`${p.tag || p.type}: ${p.bars}`"
            >{{ p.bars }}</span>
          </div>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-[12px] text-text-dim">{{ t('score.empty.summary', { sections: preview.length || 1, bars: totalBars, time: fmtTime(seconds) }) }}</span>
            <button type="button" role="switch" class="se-toggle" :aria-checked="withChords" @click="withChords = !withChords"><span class="sw"></span>{{ t('score.empty.chords', { prog: progressionText }) }}</button>
          </div>
        </div>
        <button type="button" class="se-btn grad h-[34px] justify-center text-[13px]" @click="create">{{ t('score.empty.create') }}</button>
      </div>
      <!-- 2: from a song -->
      <div class="flex flex-col gap-2.5 rounded-xl border border-border bg-panel-2 p-4">
        <div class="flex items-center gap-3">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-accent1/15 text-accent"><ScoreIcon name="song" class="h-5 w-5" /></span>
          <div><h3 class="m-0 text-[15px] font-semibold">{{ t('score.import.fromSong') }}</h3><p class="m-0 text-[12.5px] text-text-dim">{{ t('score.empty.songLead') }}</p></div>
        </div>
        <button type="button" class="se-btn justify-center" :disabled="props.extracting" @click="emit('fromSong')"><ScoreIcon name="import" />{{ props.extracting ? t('score.import.extracting') : t('score.empty.pickAudio') }}</button>
        <p class="m-0 text-[11.5px] text-text-dim">{{ t('score.empty.songNote') }}</p>
      </div>
      <!-- 3: MIDI -->
      <div class="flex flex-col gap-2.5 rounded-xl border border-border bg-panel-2 p-4">
        <div class="flex items-center gap-3">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-accent1/15 text-accent"><ScoreIcon name="midi" class="h-5 w-5" /></span>
          <div><h3 class="m-0 text-[15px] font-semibold">{{ t('score.empty.midiTitle') }}</h3><p class="m-0 text-[12.5px] text-text-dim">{{ t('score.empty.midiLead') }}</p></div>
        </div>
        <button
          type="button" class="rounded-[9px] border-[1.5px] border-dashed p-4 text-center text-[12px] text-text-dim"
          :class="dragOver ? 'border-accent1 bg-accent1/10' : 'border-[#3d3d4d] hover:border-accent1/60'"
          @click="file?.click()" @dragover.prevent="dragOver = true" @dragleave="dragOver = false" @drop.prevent="onDrop"
        ><ScoreIcon name="import" class="mx-auto mb-1 h-5 w-5 text-[#6e6e80]" />{{ t('score.empty.drop') }}<br /><span class="text-[11px] text-[#8a8a9c]">{{ t('score.empty.orPick') }}</span></button>
        <input ref="file" type="file" accept=".mid,.midi,audio/midi" class="hidden" @change="onFile" />
        <p class="m-0 text-[11.5px] text-text-dim">{{ t('score.empty.midiNote') }}</p>
      </div>
    </div>
    <p class="text-center text-[12px] text-text-dim">{{ t('score.empty.or') }} <button type="button" class="text-accent1-text underline" @click="emit('piano')">{{ t('score.empty.playPiano') }}</button> {{ t('score.empty.playPianoTail') }}</p>
    <p class="text-center text-[12px] text-text-dim">{{ t('notesHelp.firstTime') }} <NotesHelpButton variant="link" :editor="ed" start="what" /></p>
  </div>
</template>

<style scoped>
.se-empty-main{background:linear-gradient(var(--color-panel-2),var(--color-panel-2)) padding-box,linear-gradient(135deg,var(--color-accent1),var(--color-accent2)) border-box;border:1.5px solid transparent}
</style>
