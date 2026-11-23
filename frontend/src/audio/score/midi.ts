import { TPQ, newId, ticksPerBar, ticksPerBeat } from './types'
import type { ChordSlot, Note, Score } from './types'
import { detectKey } from '../abcWriter'
import { normalizeKey, pcName } from './theory'
import { maxOf, minOf } from './num'
import { bestOctaveShift, rangeOf } from './checks'

/**
 * A MIDI file as a score: one part becomes the vocal, another the instrument (both made monophonic: the top note
 * of each onset), notes snapped to the 1/16 grid, a chord a bar guessed from everything else, the key detected.
 *
 * Takes a `MidiParsed` (from `parseMidiBytes`: parts are its channels) or a `MidiFileInfo` (from `readMidiFile`:
 * parts are track + channel, with track names, beats and the file's own meter and key).
 */

export interface MidiLikeNote {
  note: number
  startSec: number
  durationSec: number
  channel: number
  velocity?: number
  /** From readMidiFile. */
  track?: number
  beat?: number
  beats?: number
}

export interface MidiLike {
  notes: MidiLikeNote[]
  tempoBpm: number
  trackNames?: string[]
  meter?: [number, number]
  key?: string
}

export interface MidiPart {
  index: number
  /** -1 when the source has no tracks (a MidiParsed). */
  track: number
  channel: number
  /** The track's name, or "Channel 3". */
  name: string
  noteCount: number
  /** Lowest and highest note. */
  lo: number
  hi: number
  /** Mean pitch. */
  mean: number
  /** Most notes sounding at once. */
  polyphony: number
  /** Share of notes that start while another note of the part still sounds (0 for a clean melody). */
  overlap: number
  isDrums: boolean
}

const partKey = (n: MidiLikeNote): string => `${n.track ?? -1}:${n.channel}`
const beatOf = (n: MidiLikeNote, bpm: number): number => n.beat ?? (n.startSec * bpm) / 60
const beatsOf = (n: MidiLikeNote, bpm: number): number => n.beats ?? (n.durationSec * bpm) / 60

/** The parts of the file (a track's channel, or a channel), in the order they appear. */
export function listMidiParts(src: MidiLike): MidiPart[] {
  const groups = new Map<string, MidiLikeNote[]>()
  for (const n of src.notes) {
    const k = partKey(n)
    const list = groups.get(k)
    if (list) list.push(n)
    else groups.set(k, [n])
  }
  const bpm = src.tempoBpm || 120
  return [...groups.entries()].map(([k, list], index) => {
    const [track, channel] = k.split(':').map(Number)
    const events = list.flatMap((n) => [[beatOf(n, bpm), 1], [beatOf(n, bpm) + beatsOf(n, bpm), -1]] as [number, number][])
      .sort((a, b) => a[0] - b[0] || a[1] - b[1])
    let now = 0
    let poly = 0
    for (const [, d] of events) { now += d; poly = Math.max(poly, now) }
    const sorted = [...list].sort((a, b) => beatOf(a, bpm) - beatOf(b, bpm))
    let overlaps = 0
    let lastEnd = -Infinity
    for (const n of sorted) {
      const s = beatOf(n, bpm)
      if (s < lastEnd - 1e-3) overlaps++
      lastEnd = Math.max(lastEnd, s + beatsOf(n, bpm))
    }
    const name = (track >= 0 ? src.trackNames?.[track] : '') || `Channel ${channel + 1}`
    return {
      index, track, channel, name,
      noteCount: list.length,
      lo: minOf(list, (n) => n.note),
      hi: maxOf(list, (n) => n.note),
      mean: list.reduce((a, n) => a + n.note, 0) / list.length,
      polyphony: poly,
      overlap: overlaps / list.length,
      isDrums: channel === 9,
    }
  })
}

const VOCAL_NAME = /(vocal|voice|vox|melod|lead|sing|вокал|голос|мелоди|пение)/i
const BASS_NAME = /(bass|бас)/i

/**
 * The parts the import takes by default: the vocal is the part named like one (vocal, voice, melody, вокал,
 * голос...), else the highest of the parts that play one note at a time; the instrument is the highest of the other
 * melodic parts (drums and bass left out), or none.
 */
export function defaultMidiParts(parts: MidiPart[]): { vocal: number | null; ins: number | null } {
  const candidates = parts.filter((p) => !p.isDrums && p.noteCount >= 8)
  const pool = candidates.length ? candidates : parts.filter((p) => !p.isDrums)
  const total = pool.reduce((a, p) => a + p.noteCount, 0)
  const big = (p: MidiPart): boolean => p.noteCount >= total * 0.05
  const named = pool.find((p) => VOCAL_NAME.test(p.name))
  const upper = pool.filter((p) => !BASS_NAME.test(p.name) && p.mean >= 48)
  const mono = upper.filter((p) => p.overlap <= 0.1 && big(p))
  const highest = (list: MidiPart[]): MidiPart | null => [...list].sort((a, b) => b.mean - a.mean)[0] ?? null
  const vocal = named ?? highest(mono) ?? highest(upper.filter(big)) ?? highest(pool)
  const ins = highest(upper.filter((p) => p !== vocal && big(p)))
  return { vocal: vocal?.index ?? null, ins: ins?.index ?? null }
}

export interface MidiImportOptions {
  /** Part index for the vocal (default: `defaultMidiParts`). */
  vocalPart?: number | null
  /** Part index for the instrument; null for none. */
  insPart?: number | null
  /** 'auto' (default): the file's key signature, else detected from the notes. */
  key?: string | 'auto'
  /** Grid in ticks (2 = 1/16, the default). */
  grid?: number
  meter?: [number, number]
  /** The song's tempo. When it differs from the file's (a transcription saved at a default 120), the notes are
   *  placed by their time in seconds at this tempo instead of the file's beats. */
  tempo?: number
  /**
   * Shift the notes so they sit on the beat grid (for a transcription of a recording, where the intro does not
   * end on a bar line); 'auto' (default) does it only when the notes are clearly off the grid.
   */
  align?: boolean | 'auto'
  /**
   * Move the whole vocal part by octaves into this written range (YuE2 writes a melody about an octave above where it
   * is sung, a transcription has the sung pitch). Octaves only, every note by the same shift; off when not given.
   */
  fitOctave?: 'male' | 'female' | [number, number] | null
}

export interface MidiImportResult {
  score: Score
  parts: MidiPart[]
  vocalPart: number | null
  insPart: number | null
  /** Notes dropped to make a voice monophonic. */
  dropped: number
  /** Beats the notes were shifted by to sit on the grid. */
  shiftBeats: number
  /** Semitones the vocal part was moved by (`fitOctave`), a multiple of 12. */
  octaveShift: number
}

type GridNote = { note: number; start: number; end: number }

/** The chord a bar's notes spell best (a major or minor triad), or '' when the bar is empty. */
function barChord(notes: GridNote[], from: number, to: number, key: string): string {
  const w = new Array(12).fill(0)
  for (const n of notes) {
    const d = Math.min(n.end, to) - Math.max(n.start, from)
    if (d > 0) w[((n.note % 12) + 12) % 12] += d * (n.note < 60 ? 1.5 : 1)
  }
  if (!w.some((x) => x > 0)) return ''
  let best = ''
  let bestScore = -1
  for (let root = 0; root < 12; root++) {
    for (const [third, suffix] of [[4, ''], [3, 'm']] as const) {
      const s = w[root] * 1.2 + w[(root + third) % 12] + w[(root + 7) % 12] * 0.8
      if (s > bestScore) { bestScore = s; best = pcName(root, key) + suffix }
    }
  }
  return best
}

/** One voice from a part: the top note at each onset, lasting to its end or the next onset. */
function monophonic(list: GridNote[]): { notes: GridNote[]; dropped: number } {
  // by onset, the highest first (a stable sort: of equal notes the first in the list is the one kept)
  const sorted = [...list].sort((a, b) => a.start - b.start || b.note - a.note)
  const out: GridNote[] = []
  let i = 0
  while (i < sorted.length) {
    const top = sorted[i]
    let j = i + 1
    while (j < sorted.length && sorted[j].start === top.start) j++
    const next = j < sorted.length ? sorted[j].start : Infinity
    const e = Math.min(next, top.end)
    if (e > top.start) out.push({ note: top.note, start: top.start, end: e })
    i = j
  }
  return { notes: out, dropped: list.length - out.length }
}

export function midiToScore(src: MidiLike, opts: MidiImportOptions = {}): MidiImportResult {
  const parts = listMidiParts(src)
  const defaults = defaultMidiParts(parts)
  const vocalPart = opts.vocalPart !== undefined ? opts.vocalPart : defaults.vocal
  const insPart = opts.insPart !== undefined ? opts.insPart : defaults.ins
  const bpm = opts.tempo ?? src.tempoBpm ?? 120
  const bySeconds = opts.tempo != null && Math.abs(opts.tempo - (src.tempoBpm || 120)) > 0.01
  const beatAt = (n: MidiLikeNote): number => (bySeconds ? (n.startSec * bpm) / 60 : beatOf(n, bpm))
  const beatsAt = (n: MidiLikeNote): number => (bySeconds ? (n.durationSec * bpm) / 60 : beatsOf(n, bpm))
  const meter = opts.meter ?? src.meter ?? [4, 4]
  const grid = Math.max(1, opts.grid ?? 2)
  const tpb = ticksPerBar(meter)
  const beatT = ticksPerBeat(meter)
  const keyOfPart = new Map(parts.map((p) => [`${p.track}:${p.channel}`, p.index]))
  const partOf = (n: MidiLikeNote): number => keyOfPart.get(partKey(n)) ?? -1
  const melodic = src.notes.filter((n) => !parts[partOf(n)]?.isDrums)

  // ticks (1/32 notes) from the file's beats
  const tickOf = (beat: number): number => beat * TPQ
  // the grid phase: transcriptions of recordings sit off the bar grid by however long the intro runs
  const onsetSrc = vocalPart != null ? melodic.filter((n) => partOf(n) === vocalPart) : melodic
  const miss = (shift: number): number => onsetSrc.reduce((a, n) => {
    const x = (tickOf(beatAt(n)) - shift) / grid
    return a + Math.abs(x - Math.round(x))
  }, 0)
  let shift = 0
  if (opts.align !== false && onsetSrc.length) {
    let best = miss(0)
    const unshifted = best
    for (let k = 1; k < 16; k++) {
      const s = (k / 16) * TPQ
      const m = miss(s)
      if (m < best - 1e-6) { best = m; shift = s }
    }
    // 'auto': only when the shift makes a real difference (a file from a DAW is on the grid already)
    if (opts.align !== true && !(best < unshifted * 0.6)) shift = 0
    if (shift) {
      // and the melody's first note opens a beat of its own bar as in YuE2's scores: whole bars of rest before it
      const first = minOf(onsetSrc, (n) => tickOf(beatAt(n)))
      const beatIndex = Math.round((first - shift) / beatT)
      shift += (((beatIndex % meter[0]) + meter[0]) % meter[0]) * beatT
      shift = shift % tpb
    }
  }

  const toGrid = (list: MidiLikeNote[]): GridNote[] => {
    const out: GridNote[] = []
    for (const n of list) {
      const t0 = tickOf(beatAt(n)) - shift
      const t1 = t0 + tickOf(beatsAt(n))
      if (t1 <= 0) continue
      const start = Math.max(0, Math.round(t0 / grid) * grid)
      const end = Math.max(start + grid, Math.round(t1 / grid) * grid)
      out.push({ note: n.note, start, end })
    }
    return out
  }
  const vocalRaw = vocalPart != null ? toGrid(melodic.filter((n) => partOf(n) === vocalPart)) : []
  const insRaw = insPart != null ? toGrid(melodic.filter((n) => partOf(n) === insPart)) : []
  const others = toGrid(melodic.filter((n) => partOf(n) !== vocalPart))
  const v = monophonic(vocalRaw)
  const i = monophonic(insRaw)

  const endTick = Math.max(0, maxOf(v.notes, (n) => n.end), maxOf(i.notes, (n) => n.end), maxOf(others, (n) => n.end))
  const bars = Math.ceil(endTick / tpb)
  const key = opts.key && opts.key !== 'auto'
    ? normalizeKey(opts.key)
    : src.key ? normalizeKey(src.key) : normalizeKey(detectKey([...v.notes, ...others]))

  const chordSrc = others.length ? others : v.notes
  const chords: ChordSlot[] = []
  let last = ''
  for (let b = 0; b < bars; b++) {
    const c = barChord(chordSrc, b * tpb, (b + 1) * tpb, key) || last
    if (c) chords.push({ bar: b, beat: 0, name: c })
    last = c
  }
  const octaveShift = opts.fitOctave ? bestOctaveShift(v.notes.map((n) => n.note), rangeOf(opts.fitOctave)) : 0
  const asNotes = (list: GridNote[], by = 0): Note[] => list.map((n) => ({ id: newId(), pitch: n.note + by, start: n.start, dur: n.end - n.start }))
  const score: Score = {
    key,
    tempo: Math.max(20, Math.min(300, Math.round(bpm))),
    meter,
    unit: grid % 2 ? 32 : 16,
    bars,
    sections: [],
    chords,
    voices: { vocal: asNotes(v.notes, octaveShift), ins: asNotes(i.notes) },
  }
  return { score, parts, vocalPart, insPart, dropped: v.dropped + i.dropped, shiftBeats: shift / TPQ, octaveShift }
}
