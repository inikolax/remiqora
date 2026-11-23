/**
 * The note editor's data model: one YuE2 score (two monophonic voices, sections, a chord per bar) in plain,
 * immutable objects. Every edit returns a new Score, so undo is a list of Scores.
 *
 * Time is counted in ticks of a 1/32 note (8 ticks a quarter) from the start of the first bar. That is the finest
 * step YuE2 writes (L:1/32); its scores have no triplets.
 */

/** Ticks in a quarter note. */
export const TPQ = 8
/** Ticks in a whole note (1 tick = a 1/32 note). */
export const TICKS_PER_WHOLE = TPQ * 4

export type SectionType = 'intro' | 'verse' | 'pre-chorus' | 'chorus' | 'bridge' | 'interlude' | 'outro'
export const SECTION_TYPES: readonly SectionType[] = ['intro', 'verse', 'pre-chorus', 'chorus', 'bridge', 'interlude', 'outro']

/** Typical length of a new section, in bars. */
export const DEFAULT_SECTION_BARS: Record<SectionType, number> = {
  intro: 4, verse: 8, 'pre-chorus': 4, chorus: 8, bridge: 4, interlude: 4, outro: 4,
}

export type VoiceId = 'vocal' | 'ins'
export const VOICES: readonly VoiceId[] = ['vocal', 'ins']

export interface Note {
  id: string
  /** MIDI note number (60 = middle C). */
  pitch: number
  /** Ticks from the start of the score. */
  start: number
  /** Ticks, at least 1. */
  dur: number
}

export interface Section {
  id: string
  type: SectionType
  /** What the user calls it ("Chorus 2"); YuE2's own scores have none. */
  label?: string
  /** First bar, 0-based. */
  startBar: number
  bars: number
}

export interface ChordSlot {
  /** 0-based bar. */
  bar: number
  /** Where in the bar, in beats of the meter (0 = bar start, 2 = the middle of a 4/4 bar). Fractions happen
   *  (YuE2 sometimes puts a chord on the last beat of an intro's first bar). */
  beat: number
  /** As written: "Dm", "C/E", "F#m7b5". */
  name: string
}

export interface Score {
  /** ABC K: value, normalised: tonic + mode suffix ("Dm", "C", "D#m", "Ador", "Gmix"). */
  key: string
  /** Quarter notes per minute. */
  tempo: number
  meter: [number, number]
  /** L: of the written ABC: 1/16 or 1/32. */
  unit: 16 | 32
  /** Length of the score in bars. */
  bars: number
  /** Sorted by startBar, not overlapping; bars between sections are allowed. */
  sections: Section[]
  /** Sorted by bar, then beat. */
  chords: ChordSlot[]
  /** Each voice is sorted by start and monophonic (notes do not overlap). */
  voices: { vocal: Note[]; ins: Note[] }
  /** T: of the ABC. */
  title?: string
}

/** Ticks in one bar of the meter. */
export function ticksPerBar(meter: [number, number]): number {
  return Math.max(1, Math.round((meter[0] * TICKS_PER_WHOLE) / meter[1]))
}

/** Ticks in one beat of the meter (a quarter in 4/4, an eighth in 6/8). */
export function ticksPerBeat(meter: [number, number]): number {
  return TICKS_PER_WHOLE / meter[1]
}

/** Total length of the score in ticks. */
export function scoreTicks(score: Score): number {
  return score.bars * ticksPerBar(score.meter)
}

/** Seconds per tick at the score's tempo. */
export function secPerTick(score: Pick<Score, 'tempo'>): number {
  return 60 / (Math.max(1, score.tempo) * TPQ)
}

/** The chord's position in ticks from the start of the score. */
export function chordTick(chord: ChordSlot, meter: [number, number]): number {
  return chord.bar * ticksPerBar(meter) + Math.round(chord.beat * ticksPerBeat(meter))
}

let seq = 0
/** A fresh id for a note or a section ("n1a", "s1b"...): unique within this page. */
export function newId(prefix = 'n'): string {
  seq++
  return prefix + seq.toString(36)
}

export function emptyScore(opts: Partial<Pick<Score, 'key' | 'tempo' | 'meter' | 'unit' | 'bars' | 'title'>> = {}): Score {
  return {
    key: opts.key ?? 'C',
    tempo: opts.tempo ?? 100,
    meter: opts.meter ?? [4, 4],
    unit: opts.unit ?? 16,
    bars: opts.bars ?? 0,
    sections: [],
    chords: [],
    voices: { vocal: [], ins: [] },
    ...(opts.title != null ? { title: opts.title } : {}),
  }
}

/** All notes of both voices with their voice. */
export function allNotes(score: Score): { voice: VoiceId; note: Note }[] {
  return [
    ...score.voices.vocal.map((note) => ({ voice: 'vocal' as const, note })),
    ...score.voices.ins.map((note) => ({ voice: 'ins' as const, note })),
  ]
}

/** The voice a note id lives in, or null. */
export function voiceOf(score: Score, id: string): VoiceId | null {
  if (score.voices.vocal.some((n) => n.id === id)) return 'vocal'
  if (score.voices.ins.some((n) => n.id === id)) return 'ins'
  return null
}

/** The section the bar is in, or null. */
export function sectionAt(score: Score, bar: number): Section | null {
  return score.sections.find((s) => bar >= s.startBar && bar < s.startBar + s.bars) ?? null
}

/** A section type from a lyrics tag or an ABC comment: "Verse 2", "pre chorus", "Припев", "Final Chorus", "hook". */
export function sectionTypeFromTag(tag: string): SectionType | null {
  const t = tag.toLowerCase().replace(/[\[\]()]/g, '').replace(/[\s_]*\d+\s*$/, '').replace(/ё/g, 'е').trim()
  if (!t) return null
  if (/^(pre[\s-]?chorus|prechorus|build[\s-]?up|пред[\s-]?припев|перед\s*припевом)/.test(t)) return 'pre-chorus'
  if (/^(post[\s-]?chorus)/.test(t)) return 'chorus'
  if (/(^|\s)(chorus|hook|refrain|припев|рефрен|хук)\b/.test(t) || /припев|рефрен/.test(t)) return 'chorus'
  if (/^(verse|куплет|стих)/.test(t)) return 'verse'
  if (/^(intro|вступление|интро|начало)/.test(t)) return 'intro'
  if (/^(bridge|бридж|мост|переход)/.test(t)) return 'bridge'
  if (/^(interlude|instrumental|inst|solo|break|проигрыш|соло|инструментал|брейк)/.test(t)) return 'interlude'
  if (/^(outro|ending|end|coda|fade|концовка|аутро|финал|кода|окончание|завершение)/.test(t)) return 'outro'
  return null
}
