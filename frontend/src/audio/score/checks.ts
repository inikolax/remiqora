import { DEFAULT_SECTION_BARS, SECTION_TYPES, sectionTypeFromTag, ticksPerBar } from './types'
import type { Note, Score, SectionType } from './types'
import { addSection, fillChords } from './edit'
import { scoreToAbc } from './write'
import { maxOf, minOf } from './num'

/**
 * "Check for YuE2": what in a score may hurt the song, each with a fix where one is obvious. The checks are cheap
 * enough to run on every edit (the ABC length one writes the score once).
 */

export type CheckId = 'basics' | 'chords' | 'range' | 'sections' | 'insOverlap' | 'length' | 'emptyVocal' | 'sparseVocal'

export interface Check {
  id: CheckId
  level: 'ok' | 'warn' | 'info'
  /** Values for the message (the UI words it): counts, note names, lists. */
  params: Record<string, string | number>
  /** The notes it is about (to outline them). */
  noteIds?: string[]
  /** The bars it is about. */
  bars?: number[]
  /** Makes the score right; pure, returns a new Score. */
  fix?: () => Score
}

/**
 * The vocal range defaults, as written in YuE2's own scores (MIDI numbers). YuE2 writes the melody in the treble
 * clef and often an octave above where it is sung (male parts sit around D5 in most of its scores), so these are
 * ranges of the written notes: from the lowest 5th percentile to the highest 95th percentile of the vocal notes in
 * 25 YuE2 scores in the library, by the singer named in the track's style (13 male: F3..A5, 7 female: A♭4..B5),
 * rounded out a little.
 */
export const VOCAL_RANGES: Record<'male' | 'female', [number, number]> = {
  male: [53, 81], // F3..A5
  female: [67, 84], // G4..C6
}

/** A soft limit for the ABC's length: past it the score takes a large share of YuE2's prompt (its own run 2-4k). */
export const ABC_SOFT_LIMIT = 12000

export interface CheckOptions {
  vocalRange?: 'male' | 'female' | [number, number]
  /** The section tags of the lyrics, in order ("Verse 1", "Chorus", "Припев"...), see `lyricsSections`. */
  lyricsSections?: string[]
  /** The ABC as it will be sent, when the caller has it already (saves writing it again). */
  abc?: string
  /** Sung syllables in the lyrics (see `countSyllables`): far fewer vocal notes means YuE2 makes up the rest. */
  lyricsSyllables?: number
}

/** Below this share of notes per sung syllable the melody is too sparse to lead YuE2 (a MIDI of a few notes). */
export const SPARSE_VOCAL_SHARE = 0.6

export function rangeOf(opt: CheckOptions['vocalRange']): [number, number] {
  if (Array.isArray(opt)) return [Math.min(opt[0], opt[1]), Math.max(opt[0], opt[1])]
  return VOCAL_RANGES[opt ?? 'male']
}

/**
 * Brings vocal notes into the range: first the whole melody by octaves (the shift that leaves the fewest notes
 * outside, the smallest one on a tie), then each note still outside by octaves on its own.
 */
export function fitVocalRange(score: Score, range: [number, number]): Score {
  const [lo, hi] = range
  const notes = score.voices.vocal
  if (!notes.length) return score
  const best = bestOctaveShift(notes.map((n) => n.pitch), range)
  const moved: Note[] = notes.map((n) => {
    let p = n.pitch + best
    while (p > hi && p - 12 >= 0) p -= 12
    while (p < lo && p + 12 <= 127) p += 12
    // a range narrower than an octave: the nearer edge
    if (p > hi) p = hi
    return p === n.pitch ? n : { ...n, pitch: p }
  })
  return { ...score, voices: { ...score.voices, vocal: moved } }
}

/**
 * The octave shift of a whole melody (semitones, a multiple of 12, at most three octaves either way) that leaves the
 * fewest notes outside the range; the smallest shift on a tie, 0 for no notes.
 */
export function bestOctaveShift(pitches: number[], range: [number, number]): number {
  const [lo, hi] = range
  if (!pitches.length) return 0
  const outside = (shift: number): number => pitches.reduce((a, p) => a + (p + shift < lo || p + shift > hi ? 1 : 0), 0)
  let best = 0
  let bestOut = outside(0)
  for (const s of [-12, 12, -24, 24, -36, 36]) {
    const o = outside(s)
    if (o < bestOut || (o === bestOut && Math.abs(s) < Math.abs(best))) { best = s; bestOut = o }
  }
  return best
}

/** Counts of each section type in order of appearance. */
function countTypes(types: SectionType[]): Record<SectionType, number> {
  const c = Object.fromEntries(SECTION_TYPES.map((t) => [t, 0])) as Record<SectionType, number>
  for (const t of types) c[t]++
  return c
}

/** The bars where a voice sounds. */
function soundingBars(notes: Note[], tpb: number): Set<number> {
  const bars = new Set<number>()
  for (const n of notes) {
    for (let b = Math.floor(n.start / tpb); b <= Math.floor((n.start + n.dur - 1) / tpb); b++) bars.add(b)
  }
  return bars
}

export function validate(score: Score, opts: CheckOptions = {}): Check[] {
  const out: Check[] = []
  const tpb = ticksPerBar(score.meter)
  const vocal = score.voices.vocal

  // key, tempo, chords
  const basicsOk = !!score.key && score.tempo > 0
  const barsWithChord = new Set(score.chords.map((c) => c.bar))
  const missing: number[] = []
  for (let b = 0; b < score.bars; b++) if (!barsWithChord.has(b)) missing.push(b)
  out.push({ id: 'basics', level: basicsOk ? 'ok' : 'warn', params: { key: score.key, tempo: score.tempo, meter: `${score.meter[0]}/${score.meter[1]}` } })
  if (score.bars > 0) {
    // bars before the first chord cannot be filled by carrying one over
    const fixable = score.chords.length > 0
    out.push({
      id: 'chords',
      level: missing.length ? 'warn' : 'ok',
      params: { missing: missing.length, bars: score.bars },
      ...(missing.length ? { bars: missing } : {}),
      ...(missing.length && fixable ? { fix: () => fillChords(score) } : {}),
    })
  }

  // empty vocal
  if (!vocal.length) out.push({ id: 'emptyVocal', level: 'warn', params: {} })

  // a melody of far fewer notes than the lyrics have syllables: YuE2 makes up the rest
  const syl = opts.lyricsSyllables ?? 0
  if (vocal.length && syl >= 8 && vocal.length < syl * SPARSE_VOCAL_SHARE) {
    out.push({ id: 'sparseVocal', level: 'warn', params: { notes: vocal.length, syllables: syl } })
  }

  // vocal range
  if (vocal.length) {
    const [lo, hi] = rangeOf(opts.vocalRange)
    const high = vocal.filter((n) => n.pitch > hi)
    const low = vocal.filter((n) => n.pitch < lo)
    const bad = [...high, ...low]
    out.push({
      id: 'range',
      level: bad.length ? 'warn' : 'ok',
      params: { high: high.length, low: low.length, lo, hi, min: minOf(vocal, (n) => n.pitch), max: maxOf(vocal, (n) => n.pitch) },
      ...(bad.length ? { noteIds: bad.map((n) => n.id), fix: () => fitVocalRange(score, [lo, hi]) } : {}),
    })
  }

  // sections against the lyrics' tags
  if (opts.lyricsSections) {
    const want = countTypes(opts.lyricsSections.map((t) => sectionTypeFromTag(t)).filter((t): t is SectionType => !!t))
    const have = countTypes(score.sections.map((s) => s.type))
    const lacking: SectionType[] = []
    const extra: SectionType[] = []
    for (const t of SECTION_TYPES) {
      for (let i = have[t]; i < want[t]; i++) lacking.push(t)
      for (let i = want[t]; i < have[t]; i++) extra.push(t)
    }
    const fine = !lacking.length && !extra.length
    out.push({
      id: 'sections',
      level: fine ? 'ok' : 'warn',
      params: {
        lyrics: opts.lyricsSections.length,
        score: score.sections.length,
        lacking: lacking.join(', '),
        extra: extra.join(', '),
      },
      ...(lacking.length ? {
        fix: () => {
          let s = score
          for (const t of lacking) s = addSection(s, { type: t, bars: DEFAULT_SECTION_BARS[t] }).score
          return s
        },
      } : {}),
    })
  }

  // the instrument over the singing: YuE2 itself keeps the Ins voice for intros and breaks
  const vBars = soundingBars(vocal, tpb)
  const both = [...soundingBars(score.voices.ins, tpb)].filter((b) => vBars.has(b)).sort((a, b) => a - b)
  if (score.voices.ins.length) {
    out.push({ id: 'insOverlap', level: both.length ? 'info' : 'ok', params: { bars: both.length }, ...(both.length ? { bars: both } : {}) })
  }

  // length of the ABC
  const length = (opts.abc ?? scoreToAbc(score)).length
  out.push({ id: 'length', level: length > ABC_SOFT_LIMIT ? 'warn' : 'ok', params: { chars: length, limit: ABC_SOFT_LIMIT } })

  return out
}
