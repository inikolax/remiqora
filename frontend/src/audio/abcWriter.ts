import { keySignature, parseAbc } from './abcParser'

/**
 * Writes ABC the way YuE2 reads it best. A test (same lyrics, style and seeds, two contrasting melodies) showed that
 * in YuE2's own score format (a "Vocal" and an "Ins" voice, L:1/32, chord symbols, no spaces between notes) the song
 * follows the score's key, notes, melodic direction and length; in a plain one-voice L:1/8 score only the key carried
 * over. So new scores, notes typed on the piano and imported MIDI files all come out in that format; a score written
 * by hand in another layout is extended in its own style.
 */

const NATURALS: [string, number][] = [['C', 0], ['D', 2], ['E', 4], ['F', 5], ['G', 7], ['A', 9], ['B', 11]]
const NOTE_NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

/** The header of a new score, as YuE2 plans its own. */
export function yueHeader(bpm: number, opts: { title?: string; meter?: [number, number]; key?: string } = {}): string[] {
  const meter = opts.meter ?? [4, 4]
  return [
    'X:1',
    `T:${(opts.title ?? '').replace(/[\r\n]/g, ' ')}`,
    `M:${meter[0]}/${meter[1]}`,
    'L:1/32',
    `Q:1/4=${Math.max(20, Math.min(300, Math.round(bpm) || 100))}`,
    'V: Vocal clef=treble name="Vocal Melody" snm="Vocal"',
    'V: Ins clef=treble name="Ins Melody" snm="Inst."',
    `K:${opts.key ?? 'C'}`,
  ]
}

/** "^F", "=B", "c'", "A,," for a MIDI note, given the offsets that apply in the bar (key signature + accidentals). */
export function spellNote(midi: number, offsetOf: (letter: string, octave: number) => number, preferFlats: boolean): string {
  const octave = Math.floor(midi / 12) - 1
  const pc = ((midi % 12) + 12) % 12
  let letter = ''
  let acc = ''
  for (const [l, base] of NATURALS) {
    const p = base + offsetOf(l, octave)
    if (p >= 0 && p < 12 && p === pc) { letter = l; break }
  }
  if (!letter) {
    const natural = NATURALS.find(([, base]) => base === pc)
    if (natural) {
      letter = natural[0]
      acc = '='
    } else if (preferFlats) {
      letter = NATURALS.find(([, base]) => base === pc + 1)![0]
      acc = '_'
    } else {
      letter = NATURALS.find(([, base]) => base === pc - 1)![0]
      acc = '^'
    }
  }
  let name = octave >= 5 ? letter.toLowerCase() : letter
  if (octave > 5) name += "'".repeat(octave - 5)
  if (octave < 4) name += ','.repeat(4 - octave)
  return acc + name
}

/** A length in units of L: "", "2", "/2", "3/2". */
export function lengthText(units: number): string {
  if (Math.abs(units - 1) < 1e-9) return ''
  if (Number.isInteger(units)) return String(units)
  for (const den of [2, 4, 8, 16]) {
    const num = units * den
    if (Math.abs(num - Math.round(num)) < 1e-9) return Math.round(num) === 1 ? `/${den}` : `${Math.round(num)}/${den}`
  }
  return String(Math.round(units))
}

/** Bars written in a body line: its bar lines, plus one for a bar still open at its end. */
function barsInLine(line: string): number {
  const body = line.replace(/"[^"]*"/g, '').trim()
  if (!body) return 0
  const closed = (body.match(/\|/g) ?? []).length
  return closed + (body.endsWith('|') ? 0 : 1)
}

export interface AppendOptions {
  /** Tempo for a new score (the header of an existing one wins). */
  bpm: number
}

/** The score with one more note (`midi`) or rest (`null`) of `wholes` (a fraction of a whole note: 1/4 = a quarter). */
export function appendAbcNote(abc: string, midi: number | null, wholes: number, opts: AppendOptions): string {
  const fresh = !abc.trim()
  if (fresh) abc = yueHeader(opts.bpm).join('\n') + '\n'
  const score = parseAbc(abc, opts.bpm)
  const voice = score.voices[0]?.id ?? '1'
  const end = score.voiceEnds[voice] ?? { wholes: 0, barAccidentals: {} }
  const barWholes = score.meter[0] / score.meter[1]
  const pos = end.wholes - Math.floor(end.wholes / barWholes + 1e-9) * barWholes
  const atBarStart = pos < 1e-9 || barWholes - pos < 1e-9
  const overflows = !atBarStart && pos + wholes > barWholes + 1e-9
  // YuE2's layout: no spaces between notes, four bars a line, an "Ins" voice kept as long as the vocal
  const compact = /^V:\s*Vocal\b/m.test(abc)
  const sp = compact ? '' : ' '

  const sig = keySignature(score.key)
  const preferFlats = Object.values(sig).some((v) => v < 0)
  const spell = (acc: Record<string, number>): string =>
    midi == null ? 'z' : spellNote(midi, (letter, octave) => acc[letter + octave] ?? sig[letter] ?? 0, preferFlats)
  const firstPart = overflows ? barWholes - pos : wholes
  const len = (w: number): string => lengthText(w / score.unitLength)
  let piece = spell(atBarStart ? {} : end.barAccidentals) + len(firstPart)
  let newPos = (atBarStart ? 0 : pos) + firstPart
  if (overflows) {
    piece += (midi == null ? '' : '-') + `${sp}|${sp}` + spell({}) + len(wholes - firstPart)
    newPos = wholes - firstPart
  }
  if (Math.abs(newPos - barWholes) < 1e-9) piece += `${sp}|`

  const nl = abc.includes('\r\n') ? '\r\n' : '\n'
  const lines = abc.replace(/\s+$/, '').split(/\r?\n/)
  const fieldOf = (t: string): RegExpMatchArray | null => t.trim().match(/^([A-Za-z]):(.*)$/)
  const voiceIdOf = (t: string): string | null => { const f = fieldOf(t); return f?.[1] === 'V' ? f[2].trim().split(/\s+/)[0] : null }
  let headerDone = false
  let currentVoice = voice
  let target = -1
  let afterKey = -1
  lines.forEach((raw, i) => {
    const t = raw.trim()
    const field = fieldOf(t)
    if (!headerDone) {
      if (field?.[1] === 'K') { headerDone = true; afterKey = i }
      return
    }
    const v = voiceIdOf(t)
    if (v) { currentVoice = v; return }
    if (!t || t.startsWith('%') || field) return
    const inline = t.match(/^\[V:([^\]\s]+)/)
    if (inline) currentVoice = inline[1]
    if (currentVoice === voice) target = i
  })
  const hasIns = score.voices.some((v) => v.id === 'Ins') || (fresh && compact)

  /** The Ins voice's line right after the vocal line `at`, when it holds only whole-bar rests (it then follows). */
  const insRestLine = (at: number): number => {
    let i = at + 1
    while (i < lines.length && (!lines[i].trim() || lines[i].trim().startsWith('%'))) i++
    if (i >= lines.length || voiceIdOf(lines[i]) !== 'Ins') return -1
    let j = i + 1
    while (j < lines.length && !lines[j].trim()) j++
    return j < lines.length && /^\s*Z\d*\|?\s*$/.test(lines[j]) ? j : -1
  }
  const syncIns = (vocalLine: number): void => {
    const j = insRestLine(vocalLine)
    if (j >= 0) lines[j] = `Z${Math.max(1, barsInLine(lines[vocalLine]))}|`
  }
  const newBlock = (at: number): number => {
    // a fresh "V: Vocal" line (and its Ins rest) after line `at`
    const block = compact ? [`V: ${voice}`, piece, ...(hasIns ? ['V: Ins', 'Z1|'] : [])] : [`V:${voice}`, piece]
    lines.splice(at + 1, 0, ...(score.voices.length > 1 || compact ? block : [piece]))
    return at + 2
  }

  if (target < 0) {
    const at = newBlock(afterKey)
    if (compact) syncIns(at)
  } else {
    const line = lines[target].replace(/\s+$/, '')
    if (compact && atBarStart && end.wholes > 0 && barsInLine(line) >= 4) {
      const ins = insRestLine(target)
      const at = newBlock(ins >= 0 ? ins : target)
      syncIns(at)
    } else {
      const sep = compact ? (line.endsWith('|') || !atBarStart || end.wholes === 0 ? '' : '|') : line.endsWith('|') ? ' ' : atBarStart && end.wholes > 0 ? ' | ' : ' '
      lines[target] = line + sep + piece
      if (compact) syncIns(target)
    }
  }
  return lines.join(nl) + nl
}

export interface NotesToAbcOptions {
  bpm: number
  meter?: [number, number]
  title?: string
  /** The grid notes are snapped to, in whole notes (1/16 by default). */
  grid?: number
  /** The channel that is the melody (the "Vocal" voice); by default the one that sits highest. */
  melodyChannel?: number
}

type GridNote = { note: number; start: number; end: number }

const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]
const MAJOR_KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
const MINOR_KEYS = ['Cm', 'C#m', 'Dm', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'Bbm', 'Bm']

/** The key the notes are in (Krumhansl-Schmuckler on their durations), as an ABC K: value. */
export function detectKey(notes: GridNote[]): string {
  const w = new Array(12).fill(0)
  for (const n of notes) w[((n.note % 12) + 12) % 12] += n.end - n.start
  if (!w.some((x) => x > 0)) return 'C'
  const corr = (prof: number[], root: number): number => {
    const p = prof.map((_, i) => prof[(i - root + 12) % 12])
    const mw = w.reduce((a, b) => a + b) / 12
    const mp = p.reduce((a, b) => a + b) / 12
    let num = 0, dw = 0, dp = 0
    for (let i = 0; i < 12; i++) { num += (w[i] - mw) * (p[i] - mp); dw += (w[i] - mw) ** 2; dp += (p[i] - mp) ** 2 }
    return num / Math.sqrt(dw * dp || 1)
  }
  let best = 'C'
  let bestR = -2
  for (let r = 0; r < 12; r++) {
    const maj = corr(MAJOR_PROFILE, r)
    const min = corr(MINOR_PROFILE, r)
    if (maj > bestR) { bestR = maj; best = MAJOR_KEYS[r] }
    if (min > bestR) { bestR = min; best = MINOR_KEYS[r] }
  }
  return best
}

/** The chord a bar's notes spell best (a major or minor triad), or '' when the bar is empty. */
function barChord(notes: GridNote[], from: number, to: number): string {
  const w = new Array(12).fill(0)
  for (const n of notes) {
    const d = Math.min(n.end, to) - Math.max(n.start, from)
    if (d > 0) w[((n.note % 12) + 12) % 12] += d * (n.note < 60 ? 1.5 : 1) // the bass says more about the chord
  }
  if (!w.some((x) => x > 0)) return ''
  let best = ''
  let bestScore = -1
  for (let root = 0; root < 12; root++) {
    for (const [third, suffix] of [[4, ''], [3, 'm']] as const) {
      const s = w[root] * 1.2 + w[(root + third) % 12] + w[(root + 7) % 12] * 0.8
      if (s > bestScore) { bestScore = s; best = NOTE_NAMES[root] + suffix }
    }
  }
  return best
}

/**
 * A whole score in YuE2's format from notes (an imported MIDI file): the channel that sits highest becomes the
 * "Vocal" melody, the top line of the other channels the "Ins" melody (whole-bar rests when there are none), a chord
 * symbol over each bar spelled from the accompaniment, starts and ends snapped to the grid, a gap of one grid step
 * filled legato, ties over bar lines, four bars a line. Drums (channel 10) are left out.
 */
export function notesToAbc(notes: { note: number; startSec: number; durationSec: number; channel: number }[], opts: NotesToAbcOptions): string {
  const meter = opts.meter ?? [4, 4]
  const grid = opts.grid ?? 1 / 16
  const bpm = Math.max(20, Math.min(300, Math.round(opts.bpm) || 120))
  const secPerSlot = (240 / bpm) * grid
  const slotsPerBar = Math.max(1, Math.round(meter[0] / meter[1] / grid))
  const unitsPerSlot = Math.round(grid * 32) || 1 // L:1/32

  // Notes transcribed from a recording are off the bar grid by however long the intro runs: shift the grid so the
  // melody's onsets land on beats (a file from a DAW is already on the grid and comes out unshifted).
  const melodic = notes.filter((n) => n.channel !== 9)
  const secPerBeat = (240 / bpm) / meter[1]
  const onsetCh = opts.melodyChannel != null && melodic.some((n) => n.channel === opts.melodyChannel)
    ? melodic.filter((n) => n.channel === opts.melodyChannel)
    : melodic
  let shift = 0
  let bestMiss = Infinity
  for (let k = 0; k < 16; k++) {
    const p = (k / 16) * secPerBeat
    let miss = 0
    for (const n of onsetCh) {
      const x = (n.startSec - p) / secPerBeat
      miss += Math.abs(x - Math.round(x))
    }
    if (miss < bestMiss - 1e-6) { bestMiss = miss; shift = p }
  }
  // and the melody's first note opens a bar, so an intro becomes whole bars of rest as in YuE2's own scores
  if (onsetCh.length && shift > 0) {
    const first = Math.min(...onsetCh.map((n) => n.startSec))
    const beatIndex = Math.round((first - shift) / secPerBeat)
    shift += (((beatIndex % meter[0]) + meter[0]) % meter[0]) * secPerBeat
  }

  const byChannel = new Map<number, GridNote[]>()
  for (const n of melodic) {
    const t0 = n.startSec - shift
    if (t0 + n.durationSec <= 0) continue
    const start = Math.max(0, Math.round(t0 / secPerSlot))
    const end = Math.max(start + 1, Math.round((t0 + n.durationSec) / secPerSlot))
    const list = byChannel.get(n.channel) ?? []
    list.push({ note: n.note, start, end })
    byChannel.set(n.channel, list)
  }
  const channels = [...byChannel.entries()].filter(([, l]) => l.length > 0)
  // the melody: the channel that sits highest on average among those with a real share of the notes
  const total = channels.reduce((a, [, l]) => a + l.length, 0)
  const mean = (l: GridNote[]): number => l.reduce((a, n) => a + n.note, 0) / l.length
  const candidates = channels.filter(([, l]) => l.length >= total * 0.1)
  const melodyCh = opts.melodyChannel != null && byChannel.has(opts.melodyChannel)
    ? opts.melodyChannel
    : (candidates.length ? candidates : channels).sort((a, b) => mean(b[1]) - mean(a[1]))[0]?.[0]
  const melody = byChannel.get(melodyCh ?? -1) ?? []
  const others = channels.filter(([ch]) => ch !== melodyCh).flatMap(([, l]) => l)
  const totalSlots = Math.max(slotsPerBar, ...[...melody, ...others].map((n) => n.end))
  const bars = Math.ceil(totalSlots / slotsPerBar)
  const chordSource = others.length ? others : melody
  const key = detectKey([...melody, ...others])
  const sig = keySignature(key)
  const preferFlats = Object.values(sig).some((v) => v < 0)

  /** One voice as a list of bars: its top note at each onset, lasting to the next onset (legato over one step). */
  const voiceBars = (list: GridNote[], withChords: boolean): string[] => {
    const onsets = [...new Set(list.map((n) => n.start))].sort((a, b) => a - b)
    const events: { start: number; end: number; note: number }[] = []
    onsets.forEach((s, i) => {
      const group = list.filter((n) => n.start === s)
      const top = group.reduce((a, b) => (b.note > a.note ? b : a))
      const next = onsets[i + 1] ?? Infinity
      let end = Math.min(next, top.end)
      if (Number.isFinite(next) && next - end <= Math.max(1, (end - s) / 4)) end = next
      events.push({ start: s, end, note: top.note })
    })
    const out: string[] = Array.from({ length: bars }, () => '')
    let barAcc: Record<string, number> = {}
    let accBar = -1
    const spell = (midi: number, bar: number): string => {
      if (bar !== accBar) { barAcc = {}; accBar = bar }
      const token = spellNote(midi, (l, o) => barAcc[l + o] ?? sig[l] ?? 0, preferFlats)
      const m = token.match(/^(\^|_|=)?([A-Ga-g])([',]*)/)
      if (m) {
        let oct = m[2] === m[2].toUpperCase() ? 4 : 5
        for (const c of m[3]) oct += c === "'" ? 1 : -1
        if (m[1]) barAcc[m[2].toUpperCase() + oct] = m[1] === '^' ? 1 : m[1] === '_' ? -1 : 0
      }
      return token
    }
    const put = (note: number | null, from: number, to: number): void => {
      let s = from
      while (s < to) {
        const bar = Math.floor(s / slotsPerBar)
        const e = Math.min(to, (bar + 1) * slotsPerBar)
        const len = lengthText((e - s) * unitsPerSlot)
        out[bar] += note == null ? `z${len}` : `${spell(note, bar)}${len}${e < to ? '-' : ''}`
        s = e
      }
    }
    let t = 0
    for (const ev of events) {
      if (ev.start > t) put(null, t, ev.start)
      put(ev.note, ev.start, ev.end)
      t = ev.end
    }
    if (t < bars * slotsPerBar) put(null, t, bars * slotsPerBar)
    if (withChords) {
      let last = ''
      for (let b = 0; b < bars; b++) {
        const c = barChord(chordSource, b * slotsPerBar, (b + 1) * slotsPerBar)
        if (c) { out[b] = `"${c}"${out[b]}`; last = c } else if (last) out[b] = `"${last}"${out[b]}`
      }
    }
    return out
  }

  const vocal = voiceBars(melody, true)
  const ins = others.length ? voiceBars(others, false) : null
  const lines = [...yueHeader(bpm, { title: opts.title, meter, key })]
  for (let b = 0; b < bars; b += 4) {
    const n = Math.min(4, bars - b)
    lines.push('V: Vocal', vocal.slice(b, b + n).join('|') + '|')
    lines.push('V: Ins', ins ? ins.slice(b, b + n).join('|') + '|' : `Z${n}|`)
  }
  return lines.join('\n') + '\n'
}
