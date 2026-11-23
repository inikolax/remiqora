<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { noteName } from '../../audio/score'
import { pianoKey } from '../../audio/pianoSynth'
import { useScoreEditor } from './useScoreEditor'
import { DURATIONS, isBlackKey } from './scoreUi'
import ScoreIcon from './ScoreIcon.vue'

/**
 * Playing the melody in: an on-screen keyboard, or a MIDI keyboard over Web MIDI. Each key played goes into the
 * Vocal at the cursor with the chosen length, and the cursor moves on.
 */
const props = withDefaults(defineProps<{ large?: boolean }>(), { large: false })
const ed = useScoreEditor()
const { ui } = ed
const { t } = useI18n()

const OCTAVES = props.large ? 3 : 2
const baseOctave = ref(4)
const lit = ref<number | null>(null)
function press(note: number, velocity = 100): void {
  pianoKey(note, velocity)
  lit.value = note
  setTimeout(() => { if (lit.value === note) lit.value = null }, 180)
  if (ui.recording) ed.typeNote(note)
}
interface Key { note: number; black: boolean; left: number; label: string }
const keys = computed<Key[]>(() => {
  const out: Key[] = []
  const start = (baseOctave.value + 1) * 12
  let white = 0
  for (let n = start; n < start + 12 * OCTAVES; n++) {
    if (isBlackKey(n)) out.push({ note: n, black: true, left: white - 0.32, label: '' })
    else out.push({ note: n, black: false, left: white++, label: n % 12 === 0 ? `C${n / 12 - 1}` : '' })
  }
  return out
})
const WHITE = 7 * OCTAVES

// ---- MIDI keyboard ----
const midiState = ref<'unsupported' | 'none' | 'denied' | string>('none')
let access: MIDIAccess | null = null
/** Unmounted: a late MIDI permission or a device plugged in later binds nothing. */
let disposed = false
function onMidi(e: MIDIMessageEvent): void {
  if (disposed) return
  const d = e.data
  if (!d || d.length < 3) return
  if ((d[0] & 0xf0) === 0x90 && d[2] > 0) press(d[1], d[2])
}
function bind(): void {
  if (!access || disposed) return
  const names: string[] = []
  access.inputs.forEach((input) => { input.onmidimessage = onMidi; names.push(input.name || 'MIDI') })
  midiState.value = names.length ? names.join(', ') : 'none'
}
async function connect(): Promise<void> {
  if (!('requestMIDIAccess' in navigator)) { midiState.value = 'unsupported'; return }
  try {
    const a = await navigator.requestMIDIAccess()
    if (disposed) return
    access = a
    access.onstatechange = () => bind()
    bind()
  } catch {
    if (!disposed) midiState.value = 'denied'
  }
}
void connect()
onBeforeUnmount(() => {
  disposed = true
  if (!access) return
  access.onstatechange = null
  access.inputs.forEach((i) => { i.onmidimessage = null })
  access = null
})
const midiConnected = computed(() => !['unsupported', 'none', 'denied'].includes(midiState.value))
const midiLabel = computed(() => {
  const s = midiState.value
  if (s === 'unsupported') return t('score.piano.midiUnsupported')
  if (s === 'denied') return t('score.piano.midiDenied')
  if (s === 'none') return t('score.piano.midiNone')
  return t('score.piano.midiConnected', { name: s })
})
const cursorText = computed(() => {
  const bar = Math.floor(ui.cursorTick / ed.tpb.value) + 1
  const beat = Math.floor((ui.cursorTick % ed.tpb.value) / ed.tpBeat.value) + 1
  return t('score.status.pos', { bar, beat })
})
</script>

<template>
  <section class="space-y-2 rounded-[10px] border border-border bg-panel p-2.5" :aria-label="t('score.piano.title')">
    <div class="flex flex-wrap items-center gap-2 text-xs">
      <span class="font-medium text-text">{{ t('score.piano.title') }}</span>
      <span class="text-text-dim">{{ cursorText }}</span>
      <div class="se-dur" role="group" :aria-label="t('score.tools.durLabel')">
        <button v-for="d in DURATIONS" :key="d.ticks" type="button" :aria-pressed="ui.dur === d.ticks" @click="ui.dur = d.ticks">{{ d.label }}</button>
      </div>
      <button type="button" class="se-btn" @click="ed.typeRest()">{{ t('score.piano.rest') }}</button>
      <button type="button" role="switch" class="se-toggle" :aria-checked="ui.recording" :title="t('score.piano.recordHint')" @click="ui.recording = !ui.recording"><span class="sw"></span>{{ t('score.piano.record') }}</button>
      <span class="ms-auto inline-flex items-center gap-1.5 text-[11px] text-text-dim" :title="midiLabel">
        <span class="inline-block h-2 w-2 rounded-full" :class="midiConnected ? 'bg-status-done' : 'bg-slate-600'"></span>{{ midiConnected ? midiState : t('score.piano.midiShort') }}
      </span>
      <button type="button" class="se-btn icon" :aria-label="t('score.common.close')" :title="t('score.common.close')" @click="ui.pianoOpen = false"><ScoreIcon name="close" /></button>
    </div>
    <div class="flex items-stretch gap-1.5">
      <button type="button" class="rounded-md border border-border px-1.5 text-text-dim hover:text-text disabled:opacity-40" :disabled="baseOctave <= 1" :aria-label="t('score.piano.octaveDown')" @click="baseOctave--">‹</button>
      <div class="relative flex-1 select-none" :class="large ? 'h-28' : 'h-24'">
        <button
          v-for="k in keys.filter((x) => !x.black)" :key="k.note" type="button"
          class="absolute top-0 h-full rounded-b-md border border-slate-400 text-[10px] text-slate-600"
          :class="lit === k.note ? 'bg-[#f9a8d4]' : 'bg-slate-100 hover:bg-white'"
          :style="{ left: `${(k.left / WHITE) * 100}%`, width: `${100 / WHITE}%` }"
          :aria-label="noteName(k.note)" @pointerdown.prevent="press(k.note)" @keydown.enter.prevent="press(k.note)"
        ><span class="absolute bottom-1 start-1">{{ k.label }}</span></button>
        <button
          v-for="k in keys.filter((x) => x.black)" :key="k.note" type="button"
          class="absolute top-0 z-10 h-[60%] rounded-b-md" :class="lit === k.note ? 'bg-[#ec4899]' : 'bg-slate-800 hover:bg-slate-700'"
          :style="{ left: `${(k.left / WHITE) * 100}%`, width: `${(0.64 / WHITE) * 100}%` }"
          :aria-label="noteName(k.note)" @pointerdown.prevent="press(k.note)" @keydown.enter.prevent="press(k.note)"
        ></button>
      </div>
      <button type="button" class="rounded-md border border-border px-1.5 text-text-dim hover:text-text disabled:opacity-40" :disabled="baseOctave >= 6" :aria-label="t('score.piano.octaveUp')" @click="baseOctave++">›</button>
    </div>
  </section>
</template>
