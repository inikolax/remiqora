<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { defaultMidiParts, midiToScore, noteName } from '../../audio/score'
import type { MidiLike, MidiPart } from '../../audio/score'
import { pianoKey } from '../../audio/pianoSynth'
import type { MidiPick } from './scoreUi'

/**
 * Which parts of a MIDI file become the Vocal and the Instrument (YuE2 takes two voices; drums and the rest are left
 * out). The defaults are the part named like a voice (or the highest single line) and the highest other melody.
 * Also the singer's octave (a transcription has the sung pitch, YuE2 writes about an octave above it) and the song's
 * tempo (a transcription often says 120 whatever the song's is; the notes are placed by seconds at the tempo chosen).
 */
const props = defineProps<{
  parts: MidiPart[]
  fileName: string
  replacing: boolean
  /** The file itself, for the octave the vocal part needs. */
  src: MidiLike
  voice: 'male' | 'female'
  /** The library track the file came from, when its params name a tempo. */
  track?: { title: string; bpm: number } | null
}>()
const emit = defineEmits<{ confirm: [pick: MidiPick]; cancel: [] }>()
const { t } = useI18n()

const defaults = defaultMidiParts(props.parts)
const vocal = ref<number | null>(defaults.vocal)
const ins = ref<number | null>(defaults.ins)
const voice = ref<'male' | 'female'>(props.voice)
const fitOctave = ref(true)
const fileTempo = Math.round(props.src.tempoBpm || 120)
const tempo = ref<number>(props.track?.bpm ? Math.round(props.track.bpm) : fileTempo)
const tempoOk = computed(() => Number.isFinite(tempo.value) && tempo.value >= 20 && tempo.value <= 300)
const tempoFrom = computed(() => props.track?.bpm && Math.round(props.track.bpm) === tempo.value
  ? t('score.midi.tempoTrack', { title: props.track.title })
  : tempo.value === fileTempo ? t('score.midi.tempoFile') : '')
// the octave the vocal part will be moved by: the importer's own answer for the part chosen
const shift = computed(() => {
  if (!fitOctave.value || vocal.value == null) return 0
  try {
    return midiToScore(props.src, { vocalPart: vocal.value, insPart: null, fitOctave: voice.value }).octaveShift
  } catch {
    return 0
  }
})
const shiftText = computed(() => {
  const n = Math.abs(shift.value) / 12
  if (!n) return t('score.midi.octaveNone')
  return t(shift.value > 0 ? 'score.midi.octaveUp' : 'score.midi.octaveDown', { n }, n)
})
function confirm(): void {
  emit('confirm', { vocal: vocal.value, ins: ins.value, voice: voice.value, fitOctave: fitOctave.value, tempo: tempoOk.value ? tempo.value : fileTempo })
}
const dialog = ref<HTMLDivElement | null>(null)
onMounted(() => nextTick(() => dialog.value?.querySelector<HTMLElement>('input,button')?.focus()))

function setVocal(i: number): void {
  vocal.value = i
  if (ins.value === i) ins.value = null
}
function setIns(i: number | null): void {
  ins.value = i
  if (i != null && vocal.value === i) vocal.value = null
}
const canImport = computed(() => vocal.value != null || ins.value != null)
function hear(p: MidiPart): void {
  pianoKey(Math.round(p.mean))
}
function onKey(e: KeyboardEvent): void {
  if (e.key === 'Escape') { e.stopPropagation(); emit('cancel') }
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4" @mousedown.self="emit('cancel')" @keydown="onKey">
      <div ref="dialog" class="flex max-h-full w-full max-w-xl flex-col overflow-hidden rounded-xl border border-border bg-panel shadow-2xl" role="dialog" aria-modal="true" :aria-label="t('score.midi.title')">
        <div class="border-b border-border px-4 py-3">
          <p class="text-sm font-semibold text-text">{{ t('score.midi.title') }}</p>
          <p class="mt-0.5 truncate text-xs text-text-dim">{{ fileName }} · {{ t('score.midi.lead') }}</p>
        </div>
        <div class="min-h-0 flex-1 overflow-y-auto p-2">
          <table class="w-full text-[12.5px]">
            <thead>
              <tr class="text-start text-[10.5px] uppercase tracking-wide text-[#8a8a9c]">
                <th class="px-2 py-1.5 text-start font-semibold">{{ t('score.midi.part') }}</th>
                <th class="px-2 py-1.5 text-start font-semibold">{{ t('score.midi.range') }}</th>
                <th class="px-2 py-1.5 text-end font-semibold">{{ t('score.midi.notes') }}</th>
                <th class="px-2 py-1.5 text-center font-semibold">{{ t('score.lane.vocal') }}</th>
                <th class="px-2 py-1.5 text-center font-semibold">{{ t('score.lane.ins') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in parts" :key="p.index" class="border-t border-border" :class="p.isDrums ? 'opacity-50' : ''">
                <td class="px-2 py-1.5">
                  <button type="button" class="text-start hover:text-accent" :title="t('score.midi.hear')" @click="hear(p)">{{ p.name || t('score.midi.channel', { n: p.channel + 1 }) }}</button>
                  <span v-if="p.isDrums" class="ms-1.5 text-[11px] text-text-dim">{{ t('score.midi.drums') }}</span>
                  <span v-else-if="p.polyphony > 1" class="ms-1.5 text-[11px] text-text-dim" :title="t('score.midi.chordsHint')">{{ t('score.midi.chords') }}</span>
                </td>
                <td class="px-2 py-1.5 tabular-nums text-text-dim">{{ noteName(p.lo) }}–{{ noteName(p.hi) }}</td>
                <td class="px-2 py-1.5 text-end tabular-nums text-text-dim">{{ p.noteCount }}</td>
                <td class="px-2 py-1.5 text-center"><input type="radio" name="midi-vocal" :checked="vocal === p.index" :disabled="p.isDrums" :aria-label="`${t('score.lane.vocal')}: ${p.name}`" @change="setVocal(p.index)" /></td>
                <td class="px-2 py-1.5 text-center"><input type="radio" name="midi-ins" :checked="ins === p.index" :disabled="p.isDrums" :aria-label="`${t('score.lane.ins')}: ${p.name}`" @change="setIns(p.index)" /></td>
              </tr>
              <tr class="border-t border-border">
                <td class="px-2 py-1.5 text-text-dim" colspan="4">{{ t('score.midi.noIns') }}</td>
                <td class="px-2 py-1.5 text-center"><input type="radio" name="midi-ins" :checked="ins === null" :aria-label="t('score.midi.noIns')" @change="setIns(null)" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="space-y-2 border-t border-border px-4 py-3 text-[12.5px]">
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <select v-model="voice" class="h-7 rounded-md border border-border bg-panel-2 px-1.5 text-[12px] text-text" :aria-label="t('score.lane.rangePreset')">
              <option value="male" class="bg-panel">{{ t('score.lane.voiceMale') }}</option>
              <option value="female" class="bg-panel">{{ t('score.lane.voiceFemale') }}</option>
            </select>
            <label class="inline-flex items-center gap-1.5 text-text" :title="t('score.midi.fitOctaveHint')">
              <input v-model="fitOctave" type="checkbox" class="rounded border-border" :disabled="vocal == null" />{{ t('score.midi.fitOctave') }}
            </label>
            <span v-if="fitOctave && vocal != null" class="rounded-md px-1.5 py-0.5 text-[11.5px] font-semibold" :class="shift ? 'bg-accent1/15 text-accent' : 'bg-panel-2 text-text-dim'">{{ shiftText }}</span>
          </div>
          <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
            <label for="midi-tempo" class="text-text">{{ t('score.chips.tempo') }}</label>
            <input
              id="midi-tempo" v-model.number="tempo" type="number" min="20" max="300" step="1"
              class="h-7 w-20 rounded-md border bg-panel-2 px-2 tabular-nums text-text" :class="tempoOk ? 'border-border' : 'border-status-failed'"
            />
            <span class="text-text-dim">BPM</span>
            <span v-if="tempoFrom" class="text-[11.5px] text-text-dim">· {{ tempoFrom }}</span>
          </div>
          <p class="text-[11px] text-text-dim">{{ t('score.midi.tempoHint', { bpm: fileTempo }) }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3">
          <p v-if="replacing" class="me-auto text-xs text-status-queued">{{ t('score.midi.replaceWarn') }}</p>
          <span v-else class="me-auto"></span>
          <button type="button" class="se-btn" @click="emit('cancel')">{{ t('score.common.cancel') }}</button>
          <button type="button" class="se-btn grad" :disabled="!canImport" @click="confirm">{{ replacing ? t('score.midi.replace') : t('score.midi.import') }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
