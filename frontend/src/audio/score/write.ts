import { chordTick, ticksPerBar } from './types'
import type { Note, Score, VoiceId } from './types'
import { parseKey, spellPitch } from './theory'

/**
 * A Score as ABC in YuE2's own layout, the one it follows best:
 *
 *   X:1 / T: / M: / L:1/16 / Q:1/4=95 / V: Vocal ... / V: Ins ... / K:Dm
 *   % verse
 *   V: Vocal
 *   "Dm"A4A4A4A4|"Gm"G4B4B4z2D2|...      four bars a line, a chord symbol where each chord starts
 *   V: Ins
 *   Z4|                                  whole-bar rests when the instrument is silent
 *
 * Lines break at section borders (a section's last line may hold fewer than four bars) and the section's name is
 * a comment before its first line. Lengths are split the way YuE2 splits them (14 sixteenths = 12 + 2, tied when it
 * is a note), accidentals are written against the key signature and the accidentals already in the bar, no spaces.
 * The comment holds only the section's type (labels are not kept in the ABC), and ABC marks only where a section
 * starts: bars left between sections join the section before them when the text is read back.
 */

export interface WriteOptions {
  /** T: (the score's own title by default). */
  title?: string
}

/** The L: the score is written with: its own unit, or 1/32 when a note sits off the 1/16 grid. */
export function effectiveUnit(score: Score): 16 | 32 {
  if (score.unit === 32) return 32
  const odd = (t: number): boolean => t % 2 !== 0
  const offGrid = [...score.voices.vocal, ...score.voices.ins].some((n) => odd(n.start) || odd(n.dur)) ||
    score.chords.some((c) => odd(chordTick(c, score.meter)))
  return offGrid ? 32 : 16
}

/** Lengths YuE2 writes in one piece: 1, 2, 3, 4, 6, 8, 12, 16, 24, 32... (plain and dotted values). */
const PIECES = [128, 96, 64, 48, 32, 24, 16, 12, 8, 6, 4, 3, 2, 1]
function splitLength(units: number): number[] {
  const out: number[] = []
  let left = Math.max(1, Math.round(units))
  while (left > 0) {
    const p = PIECES.find((x) => x <= left)!
    out.push(p)
    left -= p
  }
  return out
}

const lenText = (units: number): string => (units === 1 ? '' : String(units))

const ACC: Record<number, string> = { [-2]: '__', [-1]: '_', 0: '=', 1: '^', 2: '^^' }

export function scoreToAbc(score: Score, opts: WriteOptions = {}): string {
  const unit = effectiveUnit(score)
  const tpu = 32 / unit // ticks per unit of L
  const tpb = ticksPerBar(score.meter)
  const sig = (parseKey(score.key) ?? parseKey('C')!).signature

  const head = [
    'X:1',
    `T:${(opts.title ?? score.title ?? '').replace(/[\r\n]/g, ' ')}`,
    `M:${score.meter[0]}/${score.meter[1]}`,
    `L:1/${unit}`,
    `Q:1/4=${Math.max(1, Math.round(score.tempo))}`,
    'V: Vocal clef=treble name="Vocal Melody" snm="Vocal"',
    'V: Ins clef=treble name="Ins Melody" snm="Inst."',
    `K:${score.key}`,
  ]

  // chords by tick, for the vocal voice
  const chordAt = new Map<number, string>()
  for (const c of score.chords) chordAt.set(chordTick(c, score.meter), c.name)

  /** The notes of one voice, bar by bar. */
  const notesByBar = (notes: Note[]): Note[][] => {
    const out: Note[][] = Array.from({ length: score.bars }, () => [])
    for (const n of notes) {
      const first = Math.max(0, Math.floor(n.start / tpb))
      const last = Math.min(score.bars - 1, Math.floor((n.start + n.dur - 1) / tpb))
      for (let b = first; b <= last; b++) out[b].push(n)
    }
    return out
  }

  const renderBar = (bar: number, notes: Note[], withChords: boolean): string => {
    const b0 = bar * tpb
    const b1 = b0 + tpb
    // cut points: note starts and ends, chord symbols
    const cuts = new Set<number>([b0, b1])
    for (const n of notes) {
      cuts.add(Math.max(b0, n.start))
      cuts.add(Math.min(b1, n.start + n.dur))
    }
    if (withChords) for (const t of chordAt.keys()) if (t > b0 && t < b1) cuts.add(t)
    const points = [...cuts].sort((a, b) => a - b)
    const barAcc: Record<string, number> = {}
    const spell = (pitch: number): string => {
      const s = spellPitch(pitch, score.key)
      const lk = s.letter + s.octave
      const now = barAcc[lk] ?? sig[s.letter] ?? 0
      let acc = ''
      if (now !== s.alter) {
        acc = ACC[s.alter] ?? ''
        barAcc[lk] = s.alter
      }
      let name = s.octave >= 5 ? s.letter.toLowerCase() : s.letter
      if (s.octave > 5) name += "'".repeat(s.octave - 5)
      if (s.octave < 4) name += ','.repeat(4 - s.octave)
      return acc + name
    }
    let out = ''
    for (let i = 0; i < points.length - 1; i++) {
      const from = points[i]
      const to = points[i + 1]
      if (to <= from) continue
      if (withChords && chordAt.has(from)) out += `"${chordAt.get(from)}"`
      const note = notes.find((n) => n.start <= from && n.start + n.dur >= to)
      const pieces = splitLength(Math.round((to - from) / tpu))
      if (!note) {
        out += pieces.map((u) => 'z' + lenText(u)).join('')
        continue
      }
      const tok = spell(note.pitch)
      const continues = note.start + note.dur > to
      out += pieces.map((u, k) => tok + lenText(u) + (k < pieces.length - 1 || continues ? '-' : '')).join('')
    }
    return out + '|'
  }

  const voiceLine = (voice: VoiceId, from: number, to: number, bars: Note[][]): string => {
    let line = ''
    let silent = 0
    const flush = (): void => {
      if (silent) line += silent === 1 ? 'Z|' : `Z${silent}|`
      silent = 0
    }
    for (let b = from; b < to; b++) {
      // a bar with nothing in it (no notes, and in the vocal no chord) is a whole-bar rest, as YuE2 writes it
      const hasChord = voice === 'vocal' && [...chordAt.keys()].some((t) => t >= b * tpb && t < (b + 1) * tpb)
      if (!bars[b].length && !hasChord) { silent++; continue }
      flush()
      line += renderBar(b, bars[b], voice === 'vocal')
    }
    flush()
    return line
  }

  const vocalBars = notesByBar(score.voices.vocal)
  const insBars = notesByBar(score.voices.ins)

  // lines: four bars each, broken at section borders
  const borders = new Set<number>([0, score.bars])
  for (const s of score.sections) {
    if (s.startBar < score.bars) borders.add(Math.max(0, s.startBar))
    if (s.startBar + s.bars < score.bars) borders.add(s.startBar + s.bars)
  }
  const edges = [...borders].sort((a, b) => a - b)
  const body: string[] = []
  for (let e = 0; e < edges.length - 1; e++) {
    const a = edges[e]
    const b = edges[e + 1]
    const section = score.sections.find((s) => s.startBar === a)
    if (section) body.push(`% ${section.type}`)
    for (let x = a; x < b; x += 4) {
      const y = Math.min(b, x + 4)
      body.push('V: Vocal', voiceLine('vocal', x, y, vocalBars))
      body.push('V: Ins', voiceLine('ins', x, y, insBars))
    }
  }
  return [...head, ...body].join('\n') + '\n'
}
