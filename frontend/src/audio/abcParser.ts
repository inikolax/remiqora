import type { MidiNote } from './miniMidiPlayer'

/**
 * ABC notation to notes, for the piano roll and playback (and the editor's MIDI clips).
 * Covers what SheetSage2, YuE2's planner and hand-written melodies use: several voices (V:), chord symbols in quotes,
 * ties, rests including whole-bar ones (Z), key signatures with accidentals that last to the bar line, octave marks,
 * note lengths, broken rhythm (> <), tuplets and note chords ([CEG]). Repeats are played once, grace notes and
 * decorations are skipped.
 */

export interface AbcVoice {
  id: string
  name: string
}

export interface AbcChordSymbol {
  startSec: number
  name: string
}

export interface AbcScore {
  /** Each note's channel is the index of its voice in `voices`. */
  notes: MidiNote[]
  voices: AbcVoice[]
  chords: AbcChordSymbol[]
  bpm: number
  /** Beats per bar and the beat's value, from M: (4/4 when missing). */
  meter: [number, number]
  /** L: as a fraction of a whole note. */
  unitLength: number
  key: string
  durationSec: number
  /** Where each voice ends, in whole notes, and its accidentals in the bar it ends in: what appending needs. */
  voiceEnds: Record<string, { wholes: number; barAccidentals: Record<string, number> }>
}

const LETTER_PITCH: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
const SHARP_ORDER = ['F', 'C', 'G', 'D', 'A', 'E', 'B']
const TONIC_FIFTHS: Record<string, number> = {
  C: 0, G: 1, D: 2, A: 3, E: 4, B: 5, 'F#': 6, 'C#': 7, F: -1, Bb: -2, Eb: -3, Ab: -4, Db: -5, Gb: -6, Cb: -7,
  'G#': 8, 'D#': 9, 'A#': 10, Fb: -8,
}
const MODE_SHIFT: [RegExp, number][] = [
  [/^(maj|ion)/, 0], [/^(min|aeo|m(?!ix))/, -3], [/^dor/, -2], [/^phr/, -4], [/^lyd/, 1], [/^mix/, -1], [/^loc/, -5],
]

/** The key signature as a semitone offset per letter (F: 1 in G major). */
export function keySignature(key: string): Record<string, number> {
  const sig: Record<string, number> = { C: 0, D: 0, E: 0, F: 0, G: 0, A: 0, B: 0 }
  const m = key.trim().match(/^([A-Ga-g])([#b]?)\s*([A-Za-z]*)/)
  if (!m || /^none/i.test(key.trim())) return sig
  const tonic = m[1].toUpperCase() + m[2]
  let fifths = TONIC_FIFTHS[tonic] ?? 0
  const mode = m[3].toLowerCase()
  for (const [re, shift] of MODE_SHIFT) {
    if (mode && re.test(mode)) { fifths += shift; break }
  }
  fifths = Math.max(-7, Math.min(7, fifths))
  if (fifths > 0) for (const l of SHARP_ORDER.slice(0, fifths)) sig[l] = 1
  else if (fifths < 0) for (const l of [...SHARP_ORDER].reverse().slice(0, -fifths)) sig[l] = -1
  return sig
}

function fraction(s: string): number {
  const m = s.match(/(\d+)\s*\/\s*(\d+)/)
  if (m) return parseInt(m[1], 10) / parseInt(m[2], 10)
  const n = parseFloat(s)
  return Number.isFinite(n) && n > 0 ? n : 0
}

/** "2", "/2", "/", "3/2", "//" after a note, as a multiple of L. */
function lengthMultiplier(s: string): number {
  if (!s) return 1
  if (/^\/+$/.test(s)) return Math.pow(0.5, s.length)
  const m = s.match(/^(\d*)(\/?)(\d*)$/)
  if (!m) return 1
  const num = m[1] ? parseInt(m[1], 10) : 1
  if (!m[2]) return num
  const den = m[3] ? parseInt(m[3], 10) : 2
  return num / den
}

interface VoiceState {
  index: number
  sec: number
  wholes: number
  barAcc: Record<string, number>
  tie: { pitch: number; noteIndex: number } | null
  lastNote: number[] // indices of the last notes (a [chord] gives several)
  lastLen: number // whole notes of the last note or rest
  tuplet: { left: number; factor: number } | null
  broken: number // multiplier waiting for the next note after > or <
}

export function parseAbc(abc: string, defaultBpm = 120): AbcScore {
  const voices: AbcVoice[] = []
  const notes: MidiNote[] = []
  const chords: AbcChordSymbol[] = []
  let bpm = defaultBpm
  let meter: [number, number] = [4, 4]
  let unit = 0
  let key = 'C'
  let sig = keySignature(key)
  let secPerWhole = 240 / bpm
  const states = new Map<string, VoiceState>()

  const voiceFor = (id: string, name?: string): VoiceState => {
    let st = states.get(id)
    if (!st) {
      voices.push({ id, name: name || id })
      st = { index: voices.length - 1, sec: 0, wholes: 0, barAcc: {}, tie: null, lastNote: [], lastLen: 0, tuplet: null, broken: 1 }
      states.set(id, st)
    } else if (name) {
      voices[st.index].name = name
    }
    return st
  }
  let cur: VoiceState | null = null
  const current = (): VoiceState => cur ?? (cur = voiceFor('1'))

  const setField = (type: string, value: string): void => {
    if (type === 'L') unit = fraction(value) || unit
    else if (type === 'M') {
      const v = value.trim()
      if (v === 'C') meter = [4, 4]
      else if (v === 'C|') meter = [2, 2]
      else {
        const m = v.match(/(\d+)\s*\/\s*(\d+)/)
        if (m) meter = [parseInt(m[1], 10), parseInt(m[2], 10)]
      }
    } else if (type === 'Q') {
      const m = value.match(/(?:(\d+)\s*\/\s*(\d+)\s*=\s*)?(\d+)/)
      if (m) {
        bpm = parseInt(m[3], 10) || bpm
        const beat = m[1] && m[2] ? parseInt(m[1], 10) / parseInt(m[2], 10) : 0.25
        secPerWhole = 60 / (bpm * beat)
      }
    } else if (type === 'K') {
      key = value.trim().split(/\s+/)[0] || 'C'
      sig = keySignature(value)
    } else if (type === 'V') {
      const id = value.trim().split(/\s+/)[0]
      if (!id) return
      const name = value.match(/(?:^|\s)name="([^"]*)"/)?.[1] ?? value.match(/(?:^|\s)nm="([^"]*)"/)?.[1]
      cur = voiceFor(id, name)
    }
  }

  const unitLen = (): number => unit || (meter[0] / meter[1] < 0.75 ? 1 / 16 : 1 / 8)

  const advance = (st: VoiceState, wholes: number): void => {
    st.wholes += wholes
    st.sec += wholes * secPerWhole
  }

  /** Applies a pending tuplet / broken-rhythm factor to the next note or rest, in whole notes. */
  const noteWholes = (st: VoiceState, mult: number): number => {
    let w = unitLen() * mult * st.broken
    st.broken = 1
    if (st.tuplet) {
      w *= st.tuplet.factor
      if (--st.tuplet.left <= 0) st.tuplet = null
    }
    return w
  }

  const pitchOf = (st: VoiceState, acc: string, letter: string, octave: string): number => {
    const L = letter.toUpperCase()
    let oct = letter === L ? 4 : 5
    for (const c of octave) oct += c === "'" ? 1 : -1
    const barKey = L + oct
    let off: number
    if (acc) {
      off = acc === '^^' ? 2 : acc === '^' ? 1 : acc === '__' ? -2 : acc === '_' ? -1 : 0
      st.barAcc[barKey] = off
    } else {
      off = st.barAcc[barKey] ?? sig[L] ?? 0
    }
    return (oct + 1) * 12 + LETTER_PITCH[L] + off
  }

  const addNote = (st: VoiceState, pitch: number, wholes: number, startSec: number): number => {
    if (st.tie && st.tie.pitch === pitch) {
      const ix = st.tie.noteIndex
      notes[ix].durationSec = startSec + wholes * secPerWhole - notes[ix].startSec
      st.tie = null
      return ix
    }
    st.tie = null
    notes.push({ note: pitch, startSec, durationSec: wholes * secPerWhole, velocity: 100, channel: st.index })
    return notes.length - 1
  }

  const NOTE = /^(\^\^|\^|__|_|=)?([A-Ga-g])([',]*)(\d*\/*\d*)/
  const parseBody = (line: string): void => {
    let i = 0
    while (i < line.length) {
      const st = current()
      const ch = line[i]
      const rest = line.slice(i)
      if (ch === '%') break
      if (ch === '"') {
        const end = line.indexOf('"', i + 1)
        const text = end < 0 ? line.slice(i + 1) : line.slice(i + 1, end)
        if (/^[A-G]/.test(text) && !chords.some((c) => Math.abs(c.startSec - st.sec) < 1e-6)) chords.push({ startSec: st.sec, name: text })
        i = end < 0 ? line.length : end + 1
        continue
      }
      if (ch === '!' || ch === '+') {
        const end = line.indexOf(ch, i + 1)
        i = end < 0 ? i + 1 : end + 1
        continue
      }
      if (ch === '{') {
        const end = line.indexOf('}', i + 1)
        i = end < 0 ? line.length : end + 1
        continue
      }
      const inline = rest.match(/^\[([A-Za-z]):([^\]]*)\]/)
      if (inline) {
        setField(inline[1], inline[2])
        i += inline[0].length
        continue
      }
      const bar = rest.match(/^(:*\|[\]|:]*\d*|\[\|[:]*|::|\[\d+)/)
      if (bar) {
        st.barAcc = {}
        i += bar[0].length
        continue
      }
      if (ch === '[') {
        // a chord of notes: every note starts together, the first one's length moves time
        const end = line.indexOf(']', i + 1)
        const inner = end < 0 ? line.slice(i + 1) : line.slice(i + 1, end)
        let j = end < 0 ? line.length : end + 1
        const outer = line.slice(j).match(/^\d*\/*\d*/)?.[0] ?? ''
        j += outer.length
        const parts: { pitch: number; w: number }[] = []
        let k = 0
        while (k < inner.length) {
          const m = inner.slice(k).match(NOTE)
          if (!m) { k++; continue }
          parts.push({ pitch: pitchOf(st, m[1] ?? '', m[2], m[3]), w: unitLen() * lengthMultiplier(m[4]) * lengthMultiplier(outer) })
          k += m[0].length
        }
        const first = parts[0]?.w ?? unitLen() * lengthMultiplier(outer)
        const total = noteWholes(st, first / unitLen())
        const start = st.sec
        st.lastNote = parts.map((p) => addNote(st, p.pitch, p.w * (total / first), start))
        st.lastLen = total
        advance(st, total)
        i = j
        continue
      }
      const tup = rest.match(/^\((\d)(?::(\d)?)?(?::(\d))?/)
      if (tup) {
        const p = parseInt(tup[1], 10)
        const q = tup[2] ? parseInt(tup[2], 10) : p === 3 || p === 6 ? 2 : p === 2 || p === 4 || p === 8 ? 3 : 2
        st.tuplet = { left: tup[3] ? parseInt(tup[3], 10) : p, factor: q / p }
        i += tup[0].length
        continue
      }
      if (ch === '-') {
        const last = st.lastNote[st.lastNote.length - 1]
        if (last != null && last >= 0) st.tie = { pitch: notes[last].note, noteIndex: last }
        i++
        continue
      }
      if (ch === '>' || ch === '<') {
        let n = 1
        while (line[i + n] === ch) n++
        const dot = 1 - Math.pow(0.5, n) // 0.5 for >, 0.75 for >>
        const prev = st.lastLen
        const prevFactor = ch === '>' ? 1 + dot : 1 - dot
        const delta = prev * (prevFactor - 1)
        for (const ix of st.lastNote) if (ix >= 0) notes[ix].durationSec += delta * secPerWhole
        advance(st, delta)
        st.broken = ch === '>' ? 1 - dot : 1 + dot
        i += n
        continue
      }
      const restM = rest.match(/^([zx])(\d*\/*\d*)/)
      if (restM) {
        const w = noteWholes(st, lengthMultiplier(restM[2]))
        st.tie = null
        st.lastNote = []
        st.lastLen = w
        advance(st, w)
        i += restM[0].length
        continue
      }
      const barRest = rest.match(/^([ZX])(\d*)/)
      if (barRest) {
        const bars = barRest[2] ? parseInt(barRest[2], 10) : 1
        st.tie = null
        st.lastNote = []
        advance(st, bars * (meter[0] / meter[1]))
        i += barRest[0].length
        continue
      }
      const m = rest.match(NOTE)
      if (m) {
        const start = st.sec
        const w = noteWholes(st, lengthMultiplier(m[4]))
        const ix = addNote(st, pitchOf(st, m[1] ?? '', m[2], m[3]), w, start)
        st.lastNote = ix >= 0 ? [ix] : []
        st.lastLen = w
        advance(st, w)
        i += m[0].length
        continue
      }
      i++ // spaces, slurs, spacers, anything unknown
    }
  }

  let inHeader = true
  for (const raw of abc.split(/\r?\n/)) {
    const line = raw.replace(/\s+$/, '')
    const t = line.trim()
    if (!t || t.startsWith('%')) continue
    const field = t.match(/^([A-Za-z]):(.*)$/)
    if (field) {
      const type = field[1]
      if (type === 'K') { setField('K', field[2]); inHeader = false; continue }
      if (type === 'V' && inHeader) {
        // a voice declared in the header: known, but the notes come later
        const id = field[2].trim().split(/\s+/)[0]
        const name = field[2].match(/(?:^|\s)name="([^"]*)"/)?.[1]
        if (id) voiceFor(id, name)
        continue
      }
      if ('LMQVK'.includes(type)) { setField(type, field[2]); continue }
      if (inHeader || 'TXPRNOSWCBDFGHIwW'.includes(type)) continue
    }
    inHeader = false
    parseBody(t)
  }

  notes.sort((a, b) => a.startSec - b.startSec || a.channel - b.channel)
  chords.sort((a, b) => a.startSec - b.startSec)
  const voiceEnds: AbcScore['voiceEnds'] = {}
  let durationSec = 0
  for (const [id, st] of states) {
    voiceEnds[id] = { wholes: st.wholes, barAccidentals: { ...st.barAcc } }
    durationSec = Math.max(durationSec, st.sec)
  }
  if (!voices.length) voices.push({ id: '1', name: '1' })
  return { notes, voices, chords, bpm, meter, unitLength: unitLen(), key, durationSec, voiceEnds }
}

export function parseAbcToMidi(abc: string, defaultBpm: number = 120): MidiNote[] {
  return parseAbc(abc, defaultBpm).notes
}
