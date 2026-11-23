import { TICKS_PER_WHOLE, newId, sectionTypeFromTag, ticksPerBar, ticksPerBeat } from './types'
import type { ChordSlot, Note, Score, Section, SectionType, VoiceId } from './types'
import { normalizeKey, parseKey } from './theory'
import { maxOf } from './num'

/**
 * ABC text to a Score. YuE2's own scores (and the app's writer output) come through exactly: two voices "Vocal" and
 * "Ins", chord symbols, ties over bar lines, whole-bar rests, "% verse" section comments, L:1/16 or 1/32. Other ABC
 * is read as well as it can be: the first voice becomes the vocal, the second the instrument; what the editor cannot
 * hold (a third voice, note chords, triplets, repeats, lyrics) is simplified and listed in `warnings`.
 */

export type ParseWarningCode =
  | 'noKey' | 'noTempo' | 'keyChange' | 'meterChange' | 'extraVoice' | 'noteChord' | 'tuplet' | 'brokenRhythm'
  | 'repeat' | 'decoration' | 'grace' | 'slur' | 'lyrics' | 'barLength' | 'pickup' | 'rounding' | 'unknown'

export interface ParseWarning {
  code: ParseWarningCode
  /** How many times it happened. */
  count: number
  /** The first bar it happened in (0-based), when it is about a place. */
  bar?: number
  detail?: string
}

export interface ParseResult {
  score: Score
  warnings: ParseWarning[]
}

const LETTER_PC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

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

interface RawNote { pitch: number; start: number; end: number; lk: string }

interface VoiceState {
  target: VoiceId | null
  bar: number
  /** Ticks into the bar (may pass the bar's end in an overfull bar). */
  pos: number
  content: boolean
  barAcc: Record<string, number>
  notes: RawNote[]
  tie: number | null // index of the note a "-" ties on
  lastNote: number | null
  lastLen: number
  tuplet: { left: number; factor: number } | null
  broken: number
  chords: { tick: number; name: string }[]
  firstBarDone: boolean
}

const NOTE = /^(\^\^|\^|__|_|=)?([A-Ga-g])([',]*)(\d*\/*\d*)/

function classifyVoice(id: string, name: string): VoiceId | null {
  if (/^(ins|inst|acc|pno|piano|gtr|guit|bass|harm|chord|comp)/i.test(id)) return 'ins'
  if (/^(voc|voice|vox|mel|lead|sing|sop|ten)/i.test(id)) return 'vocal'
  if (/(vocal|voice|vox|sing|вокал|голос)/i.test(name)) return 'vocal'
  if (/(inst|piano|guitar|accomp|ins\b|инстр)/i.test(name)) return 'ins'
  return null
}

export function abcToScore(text: string): ParseResult {
  const warnings = new Map<ParseWarningCode, ParseWarning>()
  const warn = (code: ParseWarningCode, bar?: number, detail?: string): void => {
    const w = warnings.get(code)
    if (w) w.count++
    else warnings.set(code, { code, count: 1, ...(bar != null ? { bar } : {}), ...(detail ? { detail } : {}) })
  }

  let title: string | undefined
  let meter: [number, number] = [4, 4]
  let meterSet = false
  let unitWhole = 0 // L as a fraction of a whole note
  let tempo = 0
  let key = ''
  let sig: Record<string, number> = parseKey('C')!.signature
  let tpb = ticksPerBar(meter)

  const states = new Map<string, VoiceState>()
  const order: string[] = []
  let cur: VoiceState | null = null
  const taken = new Set<VoiceId>()

  const voiceFor = (id: string, name = ''): VoiceState => {
    let st = states.get(id)
    if (st) return st
    let target = classifyVoice(id, name)
    if (target && taken.has(target)) target = null
    if (!target) target = !taken.has('vocal') ? 'vocal' : !taken.has('ins') ? 'ins' : null
    if (target) taken.add(target)
    else warn('extraVoice', undefined, id)
    st = {
      target, bar: 0, pos: 0, content: false, barAcc: {}, notes: [], tie: null, lastNote: null, lastLen: 0,
      tuplet: null, broken: 1, chords: [], firstBarDone: false,
    }
    states.set(id, st)
    order.push(id)
    return st
  }
  const current = (): VoiceState => cur ?? (cur = voiceFor('1'))
  const vocalState = (): VoiceState | null => [...states.values()].find((s) => s.target === 'vocal') ?? null

  const unitTicks = (): number => (unitWhole || (meter[0] / meter[1] < 0.75 ? 1 / 16 : 1 / 8)) * TICKS_PER_WHOLE

  const sectionMarks: { bar: number; type: SectionType; label?: string }[] = []

  const setField = (type: string, value: string, inBody: boolean): void => {
    const v = value.trim()
    if (type === 'T') { if (title == null) title = v }
    else if (type === 'L') unitWhole = fraction(v) || unitWhole
    else if (type === 'M') {
      let m: [number, number] | null = null
      if (v === 'C') m = [4, 4]
      else if (v === 'C|') m = [2, 2]
      else {
        const x = v.match(/(\d+)\s*\/\s*(\d+)/)
        if (x) m = [parseInt(x[1], 10), parseInt(x[2], 10)]
      }
      if (!m) return
      if (inBody && meterSet && (m[0] !== meter[0] || m[1] !== meter[1])) { warn('meterChange', vocalState()?.bar); return }
      meter = m
      meterSet = true
      tpb = ticksPerBar(meter)
    } else if (type === 'Q') {
      const x = v.match(/(?:(\d+)\s*\/\s*(\d+)\s*=\s*)?(\d+)\s*$/) ?? v.match(/(?:(\d+)\s*\/\s*(\d+)\s*=\s*)?(\d+)/)
      if (x) {
        const bpm = parseInt(x[3], 10)
        const beat = x[1] && x[2] ? parseInt(x[1], 10) / parseInt(x[2], 10) : 0.25
        if (bpm > 0 && !tempo) tempo = Math.round(bpm * (beat / 0.25))
      }
    } else if (type === 'K') {
      const k = v.split(/\s+/)[0] ?? ''
      const info = /^none/i.test(k) ? null : parseKey(v)
      if (!info) { if (!key) warn('noKey'); return }
      if (inBody && key && normalizeKey(v) !== key) warn('keyChange', vocalState()?.bar, normalizeKey(v))
      if (!key) key = normalizeKey(v)
      sig = info.signature
    } else if (type === 'V') {
      const id = v.split(/\s+/)[0]
      if (!id) return
      const name = v.match(/(?:^|\s)(?:name|nm)="([^"]*)"/)?.[1] ?? ''
      const st = voiceFor(id, name)
      if (inBody) cur = st
    }
  }

  const absTick = (st: VoiceState): number => st.bar * tpb + st.pos

  /** Length of the next note or rest in ticks, with a pending tuplet or broken rhythm applied. */
  const takeLen = (st: VoiceState, mult: number): number => {
    let t = unitTicks() * mult * st.broken
    st.broken = 1
    if (st.tuplet) {
      t *= st.tuplet.factor
      if (--st.tuplet.left <= 0) st.tuplet = null
    }
    return t
  }

  const pitchOf = (st: VoiceState, acc: string, letter: string, octave: string): { pitch: number; lk: string; explicit: boolean } => {
    const L = letter.toUpperCase()
    let oct = letter === L ? 4 : 5
    for (const c of octave) oct += c === "'" ? 1 : -1
    const lk = L + oct
    let off: number
    if (acc) {
      off = acc === '^^' ? 2 : acc === '^' ? 1 : acc === '__' ? -2 : acc === '_' ? -1 : 0
      st.barAcc[lk] = off
    } else {
      off = st.barAcc[lk] ?? sig[L] ?? 0
    }
    return { pitch: (oct + 1) * 12 + LETTER_PC[L] + off, lk, explicit: !!acc }
  }

  const putNote = (st: VoiceState, p: { pitch: number; lk: string; explicit: boolean }, len: number): void => {
    const start = absTick(st)
    const tied = st.tie != null ? st.notes[st.tie] : null
    st.tie = null
    if (tied && Math.abs(tied.end - start) < 1e-6 && (tied.pitch === p.pitch || (!p.explicit && tied.lk === p.lk))) {
      tied.end = start + len
      st.lastNote = st.notes.indexOf(tied)
    } else {
      st.notes.push({ pitch: p.pitch, start, end: start + len, lk: p.lk })
      st.lastNote = st.notes.length - 1
    }
    st.lastLen = len
    st.pos += len
    st.content = true
  }

  const barLine = (st: VoiceState): void => {
    st.barAcc = {}
    if (!st.content) return // "||", a bar line opening a line, a repeat sign after a bar line
    const eps = 1e-6
    const full = Math.round(st.pos / tpb)
    if (full >= 1 && Math.abs(st.pos - full * tpb) < eps) {
      st.bar += full
    } else if (st.pos < tpb) {
      if (!st.firstBarDone && st.bar === 0) {
        // a pickup: its notes end where the first bar ends
        const shift = tpb - st.pos
        for (const n of st.notes) { n.start += shift; n.end += shift }
        for (const c of st.chords) c.tick += shift
        warn('pickup', 0)
      } else {
        warn('barLength', st.bar)
      }
      st.bar += 1
    } else {
      warn('barLength', st.bar)
      st.bar += Math.ceil(st.pos / tpb - eps)
    }
    st.pos = 0
    st.content = false
    st.firstBarDone = true
  }

  const parseBody = (line: string): void => {
    let i = 0
    while (i < line.length) {
      const st = current()
      const ch = line[i]
      const rest = line.slice(i)
      if (ch === '%') break
      if (ch === '"') {
        const end = line.indexOf('"', i + 1)
        const txt = (end < 0 ? line.slice(i + 1) : line.slice(i + 1, end)).trim()
        if (/^[A-G]/.test(txt)) st.chords.push({ tick: absTick(st), name: txt })
        i = end < 0 ? line.length : end + 1
        continue
      }
      if (ch === '!' || ch === '+') {
        const end = line.indexOf(ch, i + 1)
        warn('decoration', st.bar)
        i = end < 0 ? i + 1 : end + 1
        continue
      }
      if (ch === '{') {
        const end = line.indexOf('}', i + 1)
        warn('grace', st.bar)
        i = end < 0 ? line.length : end + 1
        continue
      }
      const inline = rest.match(/^\[([A-Za-z]):([^\]]*)\]/)
      if (inline) {
        setField(inline[1], inline[2], true)
        i += inline[0].length
        continue
      }
      const bar = rest.match(/^(:*\|[\]|:]*\d*|\[\|[:]*|::|\[\d+)/)
      if (bar) {
        if (/[:\d]/.test(bar[0])) warn('repeat', st.bar)
        barLine(st)
        i += bar[0].length
        continue
      }
      if (ch === '[') {
        // a note chord: the voice stays monophonic, so its top note is kept
        const end = line.indexOf(']', i + 1)
        const inner = end < 0 ? line.slice(i + 1) : line.slice(i + 1, end)
        let j = end < 0 ? line.length : end + 1
        const outer = line.slice(j).match(/^\d*\/*\d*/)?.[0] ?? ''
        j += outer.length
        let top: { pitch: number; lk: string; explicit: boolean } | null = null
        let mult = 0
        let k = 0
        while (k < inner.length) {
          const m = inner.slice(k).match(NOTE)
          if (!m) { k++; continue }
          const p = pitchOf(st, m[1] ?? '', m[2], m[3])
          if (!top) mult = lengthMultiplier(m[4])
          if (!top || p.pitch > top.pitch) top = p
          k += m[0].length
        }
        warn('noteChord', st.bar)
        const len = takeLen(st, (mult || 1) * lengthMultiplier(outer))
        if (top) putNote(st, top, len)
        else { st.pos += len; st.content = true }
        i = j
        continue
      }
      const tup = rest.match(/^\((\d)(?::(\d)?)?(?::(\d))?/)
      if (tup) {
        const p = parseInt(tup[1], 10)
        const q = tup[2] ? parseInt(tup[2], 10) : p === 3 || p === 6 ? 2 : p === 2 || p === 4 || p === 8 ? 3 : 2
        st.tuplet = { left: tup[3] ? parseInt(tup[3], 10) : p, factor: q / p }
        warn('tuplet', st.bar)
        i += tup[0].length
        continue
      }
      if (ch === '(' || ch === ')') { warn('slur', st.bar); i++; continue }
      if (ch === '-') {
        st.tie = st.lastNote
        i++
        continue
      }
      if (ch === '>' || ch === '<') {
        let n = 1
        while (line[i + n] === ch) n++
        const dot = 1 - Math.pow(0.5, n)
        const delta = st.lastLen * ((ch === '>' ? 1 + dot : 1 - dot) - 1)
        if (st.lastNote != null) st.notes[st.lastNote].end += delta
        st.pos += delta
        st.broken = ch === '>' ? 1 - dot : 1 + dot
        warn('brokenRhythm', st.bar)
        i += n
        continue
      }
      const restM = rest.match(/^([zx])(\d*\/*\d*)/)
      if (restM) {
        const len = takeLen(st, lengthMultiplier(restM[2]))
        st.tie = null
        st.lastNote = null
        st.lastLen = len
        st.pos += len
        st.content = true
        i += restM[0].length
        continue
      }
      const barRest = rest.match(/^([ZX])(\d*)/)
      if (barRest) {
        const bars = barRest[2] ? parseInt(barRest[2], 10) : 1
        st.tie = null
        st.lastNote = null
        st.pos += bars * tpb
        st.content = true
        i += barRest[0].length
        continue
      }
      const m = rest.match(NOTE)
      if (m) {
        const p = pitchOf(st, m[1] ?? '', m[2], m[3])
        putNote(st, p, takeLen(st, lengthMultiplier(m[4])))
        i += m[0].length
        continue
      }
      if (!/[\s\\`y&.~HLMOPSTuvJR]/.test(ch)) warn('unknown', st.bar, ch)
      i++
    }
  }

  let inHeader = true
  let sawKey = false
  for (const raw of text.split(/\r?\n/)) {
    const t = raw.trim()
    if (!t) continue
    if (t.startsWith('%')) {
      if (t.startsWith('%%')) continue
      const type = sectionTypeFromTag(t.slice(1))
      if (type && !inHeader) {
        const label = t.slice(1).trim()
        const v = vocalState() ?? (order.length ? states.get(order[0])! : null)
        const bar = v ? v.bar + (v.content ? 1 : 0) : 0
        sectionMarks.push({ bar, type, ...(label.toLowerCase() !== type ? { label } : {}) })
      }
      continue
    }
    const field = t.match(/^([A-Za-z]):(.*)$/)
    if (field) {
      const type = field[1]
      if (type === 'K') { setField('K', field[2], !inHeader); if (!sawKey) { sawKey = true; inHeader = false } continue }
      if (type === 'V') { setField('V', field[2], !inHeader); continue }
      if ('TLMQ'.includes(type)) { setField(type, field[2], !inHeader); continue }
      if (type === 'w' || type === 'W') { warn('lyrics'); continue }
      if (inHeader || 'XPRNOSCBDFGHIZr+'.includes(type)) continue
    }
    if (inHeader) inHeader = false // a body without K:
    parseBody(t)
  }

  // close each voice's last bar
  let totalBars = 0
  for (const st of states.values()) {
    if (st.content && st.pos > 1e-6) {
      st.bar += Math.max(1, Math.ceil(st.pos / tpb - 1e-6))
      st.pos = 0
    }
    totalBars = Math.max(totalBars, st.bar)
  }

  if (!key) { key = 'C'; if (!warnings.has('noKey')) warn('noKey') }
  if (!tempo) { tempo = 120; warn('noTempo') }

  // notes: rounded to ticks, kept in time order, later notes cut earlier ones short (they cannot overlap)
  let rounded = false
  const toNotes = (raw: RawNote[]): Note[] => {
    const out: Note[] = []
    for (const r of [...raw].sort((a, b) => a.start - b.start)) {
      const s = Math.round(r.start)
      const e = Math.round(r.end)
      if (Math.abs(s - r.start) > 1e-6 || Math.abs(e - r.end) > 1e-6) rounded = true
      if (e <= s) continue
      const prev = out[out.length - 1]
      if (prev && prev.start + prev.dur > s) {
        prev.dur = s - prev.start
        if (prev.dur <= 0) out.pop()
      }
      out.push({ id: newId(), pitch: r.pitch, start: s, dur: e - s })
    }
    return out
  }
  const byTarget = (target: VoiceId): VoiceState | null => [...states.values()].find((s) => s.target === target) ?? null
  const vocalSt = byTarget('vocal')
  const insSt = byTarget('ins')
  const vocal = vocalSt ? toNotes(vocalSt.notes) : []
  const ins = insSt ? toNotes(insSt.notes) : []
  if (rounded) warn('rounding')
  const lastEnd = Math.max(0, maxOf(vocal, (n) => n.start + n.dur), maxOf(ins, (n) => n.start + n.dur))
  totalBars = Math.max(totalBars, Math.ceil(lastEnd / tpb))

  // chords: the vocal voice's (YuE2 writes them there), else the first voice that has any
  const chordSource = (vocalSt?.chords.length ? vocalSt : [...states.values()].find((s) => s.chords.length)) ?? null
  const beatTicks = ticksPerBeat(meter)
  const chords: ChordSlot[] = []
  const seen = new Set<number>()
  for (const c of chordSource?.chords ?? []) {
    const tick = Math.max(0, Math.round(c.tick))
    if (seen.has(tick)) { chords[chords.length - 1].name = c.name; continue }
    seen.add(tick)
    const bar = Math.floor(tick / tpb)
    if (bar >= totalBars) totalBars = bar + 1
    chords.push({ bar, beat: (tick - bar * tpb) / beatTicks, name: c.name })
  }
  chords.sort((a, b) => a.bar - b.bar || a.beat - b.beat)

  // sections: from each "% type" comment to the next one
  const marks = sectionMarks
    .filter((m) => m.bar < totalBars)
    .sort((a, b) => a.bar - b.bar)
    .filter((m, i, arr) => arr[i + 1]?.bar !== m.bar)
  const sections: Section[] = marks.map((m, i) => ({
    id: newId('s'),
    type: m.type,
    ...(m.label ? { label: m.label } : {}),
    startBar: m.bar,
    bars: (marks[i + 1]?.bar ?? totalBars) - m.bar,
  }))

  const L = unitWhole || (meter[0] / meter[1] < 0.75 ? 1 / 16 : 1 / 8)
  const oddTicks = [...vocal, ...ins].some((n) => n.start % 2 || n.dur % 2)
  const unit: 16 | 32 = Math.abs(L - 1 / 32) < 1e-9 ? 32 : Math.abs(L - 1 / 16) < 1e-9 ? 16 : oddTicks ? 32 : 16

  const score: Score = {
    key,
    tempo,
    meter,
    unit,
    bars: totalBars,
    sections,
    chords,
    voices: { vocal, ins },
    ...(title ? { title } : {}),
  }
  return { score, warnings: [...warnings.values()] }
}
