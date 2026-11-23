import { DEFAULT_SECTION_BARS, chordTick, newId, scoreTicks, ticksPerBar, ticksPerBeat, voiceOf } from './types'
import type { ChordSlot, Note, Score, Section, SectionType, VoiceId } from './types'
import { chordFromRoman, keyInterval, normalizeKey, parseKey, transposeChord } from './theory'
import { maxOf, minOf } from './num'

/**
 * Edits of a Score. Every function is pure: it returns a new Score (sharing the parts it did not touch) and leaves
 * the old one as it was, so undo keeps the old object. Voices stay monophonic: a note placed over others cuts them
 * (the one before it ends where it starts; the ones under it go, or keep their tail past its end).
 *
 * Functions that make new notes return `{ score, ids }` so the editor can select them.
 */

export interface EditResult {
  score: Score
  /** Ids of the notes the edit made. */
  ids: string[]
}

const clampPitch = (p: number): number => Math.max(0, Math.min(127, Math.round(p)))
const byStart = (a: Note, b: Note): number => a.start - b.start || a.pitch - b.pitch
const end = (n: Note): number => n.start + n.dur

function withVoice(score: Score, voice: VoiceId, notes: Note[]): Score {
  return { ...score, voices: { ...score.voices, [voice]: notes.sort(byStart) } }
}

/**
 * Clears [from, to) in a voice for a note being put there: a note that starts before ends at `from`, a note that
 * starts inside is dropped when it ends inside, and loses its head when it goes on past `to`.
 */
function carve(notes: Note[], from: number, to: number, keep: Set<string>): Note[] {
  const out: Note[] = []
  for (const n of notes) {
    if (keep.has(n.id) || end(n) <= from || n.start >= to) { out.push(n); continue }
    if (n.start < from) { out.push({ ...n, dur: from - n.start }); continue }
    if (end(n) > to) out.push({ ...n, start: to, dur: end(n) - to })
  }
  return out
}

/** Makes a voice monophonic again after `winners` moved: they cut whatever they overlap. */
function settle(notes: Note[], winners: Set<string>): Note[] {
  let out = notes
  for (const w of notes.filter((n) => winners.has(n.id))) out = carve(out, w.start, end(w), winners)
  // the winners themselves can overlap each other when they came from both sides: the later one cuts the earlier
  const sorted = [...out].sort(byStart)
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i]
    const b = sorted[i + 1]
    if (end(a) > b.start) sorted[i] = { ...a, dur: Math.max(0, b.start - a.start) }
  }
  return sorted.filter((n) => n.dur > 0)
}

/** Notes by id, with their voice. */
function pick(score: Score, ids: Iterable<string>): Map<string, VoiceId> {
  const want = new Set(ids)
  const out = new Map<string, VoiceId>()
  for (const v of ['vocal', 'ins'] as const) for (const n of score.voices[v]) if (want.has(n.id)) out.set(n.id, v)
  return out
}

/** Applies `fn` to the chosen notes of both voices, then settles overlaps. */
function mapNotes(score: Score, ids: Iterable<string>, fn: (n: Note) => Note): Score {
  const chosen = pick(score, ids)
  if (!chosen.size) return score
  const voices = { ...score.voices }
  const limit = scoreTicks(score)
  for (const v of ['vocal', 'ins'] as const) {
    if (![...chosen.values()].includes(v)) continue
    const moved = new Set<string>()
    const notes = score.voices[v].map((n) => {
      if (!chosen.has(n.id)) return n
      moved.add(n.id)
      const m = fn(n)
      const start = Math.max(0, Math.round(m.start))
      const dur = Math.max(1, Math.min(Math.round(m.dur), limit - start))
      return { ...m, start, dur, pitch: clampPitch(m.pitch) }
    }).filter((n) => n.start < limit && n.dur > 0)
    voices[v] = settle(notes, moved)
  }
  return { ...score, voices }
}

// ---- notes ----

/** A new note; it cuts the notes it lands on. The note is kept inside the score (it is shortened at the end). */
export function addNote(score: Score, voice: VoiceId, pitch: number, start: number, dur: number, id = newId()): EditResult {
  const limit = scoreTicks(score)
  const s = Math.max(0, Math.round(start))
  if (s >= limit) return { score, ids: [] }
  const d = Math.max(1, Math.min(Math.round(dur), limit - s))
  const note: Note = { id, pitch: clampPitch(pitch), start: s, dur: d }
  const notes = carve(score.voices[voice], s, s + d, new Set())
  notes.push(note)
  return { score: withVoice(score, voice, notes), ids: [id] }
}

/** Removes the note(s) of the voice sounding at `tick` (only the one at `pitch` when given). */
export function eraseAt(score: Score, voice: VoiceId, tick: number, pitch?: number): Score {
  const notes = score.voices[voice].filter((n) => !(n.start <= tick && tick < end(n) && (pitch == null || n.pitch === pitch)))
  return notes.length === score.voices[voice].length ? score : withVoice(score, voice, notes)
}

/** Removes the notes that touch [from, to) (and, when given, lie within the pitch range): an eraser drag. */
export function eraseRange(score: Score, voice: VoiceId | 'both', from: number, to: number, pitchLo = 0, pitchHi = 127): Score {
  let out = score
  for (const v of voice === 'both' ? (['vocal', 'ins'] as const) : [voice]) {
    const notes = out.voices[v].filter((n) => !(n.start < to && end(n) > from && n.pitch >= pitchLo && n.pitch <= pitchHi))
    if (notes.length !== out.voices[v].length) out = withVoice(out, v, notes)
  }
  return out
}

export function deleteNotes(score: Score, ids: Iterable<string>): Score {
  const gone = new Set(ids)
  let out = score
  for (const v of ['vocal', 'ins'] as const) {
    const notes = out.voices[v].filter((n) => !gone.has(n.id))
    if (notes.length !== out.voices[v].length) out = withVoice(out, v, notes)
  }
  return out
}

/**
 * Moves notes in time and pitch together. The move is limited so the group stays inside the score and the
 * MIDI range; the moved notes cut the ones they land on.
 */
export function moveNotes(score: Score, ids: Iterable<string>, dTicks: number, dPitch: number): Score {
  const chosen = pick(score, ids)
  if (!chosen.size) return score
  const notes = [...chosen.keys()].map((id) => score.voices[chosen.get(id)!].find((n) => n.id === id)!)
  const minStart = minOf(notes, (n) => n.start)
  const maxEnd = maxOf(notes, end)
  const lo = minOf(notes, (n) => n.pitch)
  const hi = maxOf(notes, (n) => n.pitch)
  const dt = Math.max(-minStart, Math.min(Math.round(dTicks), scoreTicks(score) - maxEnd))
  const dp = Math.max(-lo, Math.min(Math.round(dPitch), 127 - hi))
  if (!dt && !dp) return score
  return mapNotes(score, chosen.keys(), (n) => ({ ...n, start: n.start + dt, pitch: n.pitch + dp }))
}

/** A new length for one note (at least one tick, up to the end of the score); it cuts the notes it now covers. */
export function resizeNote(score: Score, id: string, dur: number): Score {
  return mapNotes(score, [id], (n) => ({ ...n, dur }))
}

/** Moves a note's start edge (its end stays): dragging the left edge. */
export function resizeNoteStart(score: Score, id: string, start: number): Score {
  return mapNotes(score, [id], (n) => {
    const s = Math.max(0, Math.min(Math.round(start), end(n) - 1))
    return { ...n, start: s, dur: end(n) - s }
  })
}

/** The same length for every chosen note. */
export function setDuration(score: Score, ids: Iterable<string>, dur: number): Score {
  return mapNotes(score, ids, (n) => ({ ...n, dur }))
}

/** Cuts a note in two at `tick` (the right part gets `newId`). Nothing happens when the tick is not inside it. */
export function splitNote(score: Score, id: string, tick: number, rightId = newId()): EditResult {
  const v = voiceOf(score, id)
  if (!v) return { score, ids: [] }
  const t = Math.round(tick)
  const n = score.voices[v].find((x) => x.id === id)!
  if (t <= n.start || t >= end(n)) return { score, ids: [] }
  const notes = score.voices[v].filter((x) => x.id !== id)
  notes.push({ ...n, dur: t - n.start }, { id: rightId, pitch: n.pitch, start: t, dur: end(n) - t })
  return { score: withVoice(score, v, notes), ids: [id, rightId] }
}

export function transpose(score: Score, ids: Iterable<string>, semitones: number): Score {
  return moveNotes(score, ids, 0, semitones)
}

/** Up (+1) or down (-1) an octave. */
export function octave(score: Score, ids: Iterable<string>, dir: 1 | -1): Score {
  return moveNotes(score, ids, 0, 12 * dir)
}

/**
 * Copies of the notes right after them (shifted by the selection's span, from its first start to its last end,
 * rounded up to `grid` ticks when given). Copies that would fall past the end of the score are dropped.
 */
export function duplicate(score: Score, ids: Iterable<string>, grid = 1): EditResult {
  const chosen = pick(score, ids)
  if (!chosen.size) return { score, ids: [] }
  const notes = [...chosen.entries()].map(([id, v]) => ({ v, n: score.voices[v].find((x) => x.id === id)! }))
  const span = maxOf(notes, (x) => end(x.n)) - minOf(notes, (x) => x.n.start)
  const shift = Math.ceil(span / Math.max(1, grid)) * Math.max(1, grid)
  return pasteNotes(score, notes.map(({ v, n }) => ({ voice: v, pitch: n.pitch, start: n.start + shift, dur: n.dur })))
}

/** Puts notes in (a paste): each one cuts what it lands on; those past the end of the score are dropped. */
export function pasteNotes(score: Score, notes: { voice: VoiceId; pitch: number; start: number; dur: number }[]): EditResult {
  const limit = scoreTicks(score)
  const ids: string[] = []
  const voices = { ...score.voices }
  for (const v of ['vocal', 'ins'] as const) {
    const add = notes.filter((n) => n.voice === v && n.start >= 0 && n.start < limit)
    if (!add.length) continue
    const made = new Set<string>()
    let list = [...voices[v]]
    for (const n of add) {
      const id = newId()
      made.add(id)
      ids.push(id)
      list.push({ id, pitch: clampPitch(n.pitch), start: Math.round(n.start), dur: Math.max(1, Math.min(Math.round(n.dur), limit - Math.round(n.start))) })
    }
    list = settle(list, made)
    voices[v] = list
  }
  const kept = new Set([...voices.vocal, ...voices.ins].map((n) => n.id))
  return { score: { ...score, voices }, ids: ids.filter((id) => kept.has(id)) }
}

// ---- grid ----

/** The tick on the grid nearest to `tick` (grid in ticks: 2 = a 1/16 note). */
export function snap(tick: number, grid: number): number {
  return grid > 1 ? Math.round(tick / grid) * grid : Math.round(tick)
}

/** The grid line at or before `tick`. */
export function snapDown(tick: number, grid: number): number {
  return grid > 1 ? Math.floor(tick / grid) * grid : Math.floor(tick)
}

/** Snaps the notes' starts (and ends, unless `ends` is false) to the grid; a note never gets shorter than a step. */
export function quantize(score: Score, ids: Iterable<string>, grid: number, ends = true): Score {
  return mapNotes(score, ids, (n) => {
    const s = snap(n.start, grid)
    const e = ends ? Math.max(s + grid, snap(end(n), grid)) : s + n.dur
    return { ...n, start: s, dur: e - s }
  })
}

/** Grid lengths by name, in ticks. */
export const GRID = { '1/32': 1, '1/16': 2, '1/8': 4, '1/4': 8, '1/2': 16, '1': 32 } as const

// ---- chords ----

/** The chord at a bar and beat; `null` removes it. */
export function setChord(score: Score, bar: number, beat: number, name: string | null): Score {
  const chords = score.chords.filter((c) => !(c.bar === bar && Math.abs(c.beat - beat) < 1e-9))
  const clean = name?.trim()
  if (clean && bar >= 0 && bar < score.bars) chords.push({ bar, beat, name: clean })
  chords.sort((a, b) => a.bar - b.bar || a.beat - b.beat)
  return { ...score, chords }
}

/** The chord sounding at a bar and beat (the last one at or before it, from earlier bars too), or null. */
export function chordAt(score: Score, bar: number, beat = 0): ChordSlot | null {
  let found: ChordSlot | null = null
  for (const c of score.chords) {
    if (c.bar < bar || (c.bar === bar && c.beat <= beat + 1e-9)) found = c
    else break
  }
  return found
}

/** Gives every bar without a chord the chord sounding before it (YuE2 writes one in each bar). */
export function fillChords(score: Score): Score {
  const chords = [...score.chords]
  let last: string | null = null
  for (let b = 0; b < score.bars; b++) {
    const here = score.chords.filter((c) => c.bar === b)
    if (!here.length && last) chords.push({ bar: b, beat: 0, name: last })
    if (here.length) last = here[here.length - 1].name
  }
  chords.sort((a, b) => a.bar - b.bar || a.beat - b.beat)
  return chords.length === score.chords.length ? score : { ...score, chords }
}

// ---- song settings ----

/**
 * A new key. With `transposeNotes` the notes and chords move with it (by the shorter way between the tonics: Dm to
 * Em is up 2, Dm to Bm down 3); otherwise only the signature changes.
 */
export function setKey(score: Score, key: string, opts: { transposeNotes?: boolean } = {}): Score {
  const k = normalizeKey(key)
  if (!opts.transposeNotes) return { ...score, key: k }
  const d = keyInterval(score.key, k)
  const t = (notes: Note[]): Note[] => notes.map((n) => ({ ...n, pitch: clampPitch(n.pitch + d) }))
  return {
    ...score,
    key: k,
    voices: { vocal: t(score.voices.vocal), ins: t(score.voices.ins) },
    chords: score.chords.map((c) => ({ ...c, name: transposeChord(c.name, d, k) })),
  }
}

export function setTempo(score: Score, tempo: number): Score {
  return { ...score, tempo: Math.max(20, Math.min(300, Math.round(tempo))) }
}

export function setTitle(score: Score, title: string): Score {
  return { ...score, title }
}

/**
 * A new meter. Notes keep their place in time (in ticks); bars are counted anew, so the score gets the bars it
 * needs, sections keep their starts as near as they can, chords move to the bar and beat at their old time.
 */
export function setMeter(score: Score, meter: [number, number]): Score {
  const oldT = ticksPerBar(score.meter)
  const newT = ticksPerBar(meter)
  if (oldT === newT && meter[1] === score.meter[1]) return { ...score, meter }
  const total = score.bars * oldT
  const bars = Math.ceil(total / newT)
  const beatT = ticksPerBeat(meter)
  const chords: ChordSlot[] = []
  for (const c of score.chords) {
    const t = chordTick(c, score.meter)
    const bar = Math.floor(t / newT)
    const slot = { bar, beat: (t - bar * newT) / beatT, name: c.name }
    const same = chords.findIndex((x) => x.bar === slot.bar && Math.abs(x.beat - slot.beat) < 1e-9)
    if (same >= 0) chords[same] = slot
    else chords.push(slot)
  }
  const starts = score.sections.map((s) => Math.round((s.startBar * oldT) / newT))
  const sections: Section[] = []
  score.sections.forEach((s, i) => {
    const a = starts[i]
    const b = i + 1 < starts.length ? Math.min(starts[i + 1], Math.round(((s.startBar + s.bars) * oldT) / newT)) : Math.round(((s.startBar + s.bars) * oldT) / newT)
    if (b > a && (!sections.length || a >= sections[sections.length - 1].startBar + sections[sections.length - 1].bars)) sections.push({ ...s, startBar: a, bars: Math.min(b, bars) - a })
  })
  return { ...score, meter, bars, chords: chords.sort((a, b) => a.bar - b.bar || a.beat - b.beat), sections: sections.filter((s) => s.bars > 0) }
}

/** Cuts or extends the score at its end: notes past the new end go (a note across it is shortened), so do chords;
 *  sections are cut short or dropped. Growing adds empty bars. */
export function setBars(score: Score, bars: number): Score {
  const n = Math.max(0, Math.round(bars))
  if (n === score.bars) return score
  if (n > score.bars) return { ...score, bars: n }
  const limit = n * ticksPerBar(score.meter)
  const cut = (notes: Note[]): Note[] =>
    notes.filter((x) => x.start < limit).map((x) => (end(x) > limit ? { ...x, dur: limit - x.start } : x))
  return {
    ...score,
    bars: n,
    voices: { vocal: cut(score.voices.vocal), ins: cut(score.voices.ins) },
    chords: score.chords.filter((c) => c.bar < n),
    sections: score.sections.filter((s) => s.startBar < n).map((s) => (s.startBar + s.bars > n ? { ...s, bars: n - s.startBar } : s)),
  }
}

/**
 * Inserts `count` empty bars before bar `at`: everything from there on moves right. A note across the point is cut
 * there and its tail moves on with the bars; a section that runs through the point grows.
 */
export function insertBars(score: Score, at: number, count: number): Score {
  const n = Math.max(0, Math.round(count))
  if (!n) return score
  const a = Math.max(0, Math.min(score.bars, Math.round(at)))
  const tpb = ticksPerBar(score.meter)
  const point = a * tpb
  const shift = n * tpb
  const move = (notes: Note[]): Note[] => {
    const out: Note[] = []
    for (const x of notes) {
      if (end(x) <= point) out.push(x)
      else if (x.start >= point) out.push({ ...x, start: x.start + shift })
      else {
        // across the point: the head stays, the tail moves on with the bars
        out.push({ ...x, dur: point - x.start })
        out.push({ id: newId(), pitch: x.pitch, start: point + shift, dur: end(x) - point })
      }
    }
    return out
  }
  return {
    ...score,
    bars: score.bars + n,
    voices: { vocal: move(score.voices.vocal), ins: move(score.voices.ins) },
    chords: score.chords.map((c) => (c.bar >= a ? { ...c, bar: c.bar + n } : c)),
    sections: score.sections.map((s) =>
      s.startBar >= a ? { ...s, startBar: s.startBar + n } : s.startBar + s.bars > a ? { ...s, bars: s.bars + n } : s,
    ),
  }
}

/** Removes `count` bars from bar `at`: what comes after moves left; sections shrink (and go when emptied). */
export function deleteBars(score: Score, at: number, count: number): Score {
  const a = Math.max(0, Math.min(score.bars, Math.round(at)))
  const n = Math.max(0, Math.min(score.bars - a, Math.round(count)))
  if (!n) return score
  const tpb = ticksPerBar(score.meter)
  const from = a * tpb
  const to = (a + n) * tpb
  const shift = to - from
  const move = (notes: Note[]): Note[] => {
    const out: Note[] = []
    for (const x of notes) {
      if (end(x) <= from) out.push(x)
      else if (x.start >= to) out.push({ ...x, start: x.start - shift })
      else if (x.start < from) out.push({ ...x, dur: from - x.start }) // the head before the cut stays
      else if (end(x) > to) out.push({ ...x, start: from, dur: end(x) - to }) // the tail after it moves in
    }
    return out
  }
  const sections: Section[] = []
  for (const s of score.sections) {
    const s0 = s.startBar
    const s1 = s.startBar + s.bars
    const keepBefore = Math.max(0, Math.min(s1, a) - s0)
    const keepAfter = Math.max(0, s1 - Math.max(s0, a + n))
    const bars = keepBefore + keepAfter
    if (bars <= 0) continue
    sections.push({ ...s, startBar: s0 < a ? s0 : Math.max(a, s0 - n), bars })
  }
  return {
    ...score,
    bars: score.bars - n,
    voices: { vocal: move(score.voices.vocal), ins: move(score.voices.ins) },
    chords: score.chords.filter((c) => c.bar < a || c.bar >= a + n).map((c) => (c.bar >= a + n ? { ...c, bar: c.bar - n } : c)),
    sections,
  }
}

// ---- sections ----

/** Placeholder chords for new bars: i–VI–III–VII in minor, I–V–vi–IV in major, one a bar. */
export function placeholderChords(key: string, startBar: number, bars: number, progression?: string[]): ChordSlot[] {
  const minor = parseKey(key)?.minorLike ?? false
  const romans = progression?.length ? progression : minor ? ['i', 'VI', 'III', 'VII'] : ['I', 'V', 'vi', 'IV']
  const names = romans.map((r) => chordFromRoman(r, key)).filter((x): x is string => !!x)
  if (!names.length) return []
  return Array.from({ length: bars }, (_, i) => ({ bar: startBar + i, beat: 0, name: names[i % names.length] }))
}

export interface AddSectionOptions {
  type: SectionType
  /** Bars of the new section (the type's usual length by default). */
  bars?: number
  /** The section it goes after; at the end of the score when missing. */
  after?: string | null
  label?: string
  /** Put placeholder chords in its bars (default true). */
  chords?: boolean | string[]
}

/** A new section of empty bars, inserted after another one (or at the end); returns the score and the section's id. */
export function addSection(score: Score, opts: AddSectionOptions): { score: Score; id: string } {
  const bars = Math.max(1, Math.round(opts.bars ?? DEFAULT_SECTION_BARS[opts.type]))
  const after = opts.after ? score.sections.find((s) => s.id === opts.after) : null
  const at = after ? after.startBar + after.bars : score.bars
  let out = insertBars(score, at, bars)
  // insertBars grew a section that ran through the point; the new bars belong to the new section instead
  out = {
    ...out,
    sections: out.sections.map((s) => {
      const orig = score.sections.find((x) => x.id === s.id)
      return orig && orig.startBar < at && orig.startBar + orig.bars > at ? { ...s, bars: orig.bars } : s
    }),
  }
  const id = newId('s')
  const section: Section = { id, type: opts.type, startBar: at, bars, ...(opts.label ? { label: opts.label } : {}) }
  const sections = [...out.sections, section].sort((a, b) => a.startBar - b.startBar)
  const chords = opts.chords === false
    ? out.chords
    : [...out.chords, ...placeholderChords(score.key, at, bars, Array.isArray(opts.chords) ? opts.chords : undefined)]
      .sort((a, b) => a.bar - b.bar || a.beat - b.beat)
  return { score: { ...out, sections, chords }, id }
}

/**
 * Removes a section. By default only its name goes (the bars and notes stay, unlabelled);
 * with `deleteBars` its bars go too.
 */
export function removeSection(score: Score, id: string, opts: { deleteBars?: boolean } = {}): Score {
  const s = score.sections.find((x) => x.id === id)
  if (!s) return score
  if (opts.deleteBars) return deleteBars(score, s.startBar, s.bars)
  return { ...score, sections: score.sections.filter((x) => x.id !== id) }
}

function patchSection(score: Score, id: string, patch: Partial<Section>): Score {
  if (!score.sections.some((s) => s.id === id)) return score
  return { ...score, sections: score.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)) }
}

export function renameSection(score: Score, id: string, label: string): Score {
  const s = score.sections.find((x) => x.id === id)
  if (!s) return score
  const clean = label.trim()
  const { label: _old, ...rest } = s
  void _old
  return { ...score, sections: score.sections.map((x) => (x.id === id ? (clean ? { ...rest, label: clean } : rest) : x)) }
}

export function retypeSection(score: Score, id: string, type: SectionType): Score {
  return patchSection(score, id, { type })
}

/**
 * Drags a section's edge to `toBar`. The neighbour on that side gives or takes the bars (it keeps at least one);
 * with no neighbour there, the edge moves into the free bars, up to the start or end of the score. Notes do not move.
 */
export function resizeSectionEdge(score: Score, id: string, edge: 'start' | 'end', toBar: number): Score {
  const i = score.sections.findIndex((s) => s.id === id)
  if (i < 0) return score
  const s = score.sections[i]
  const sections = [...score.sections]
  const to = Math.round(toBar)
  if (edge === 'end') {
    const next = sections[i + 1]
    const nextEnd = next ? next.startBar + next.bars : score.bars
    const max = next && next.startBar === s.startBar + s.bars ? nextEnd - 1 : next ? next.startBar : score.bars
    const e = Math.max(s.startBar + 1, Math.min(to, max))
    sections[i] = { ...s, bars: e - s.startBar }
    if (next && next.startBar === s.startBar + s.bars) sections[i + 1] = { ...next, startBar: e, bars: nextEnd - e }
  } else {
    const prev = sections[i - 1]
    const sEnd = s.startBar + s.bars
    const min = prev && prev.startBar + prev.bars === s.startBar ? prev.startBar + 1 : prev ? prev.startBar + prev.bars : 0
    const a = Math.min(sEnd - 1, Math.max(to, min))
    sections[i] = { ...s, startBar: a, bars: sEnd - a }
    if (prev && prev.startBar + prev.bars === s.startBar) sections[i - 1] = { ...prev, bars: a - prev.startBar }
  }
  return { ...score, sections }
}

/** Labels bars [startBar, startBar + bars) as a new section (the bars already there; overlapped sections give way). */
export function markSection(score: Score, type: SectionType, startBar: number, bars: number, label?: string): { score: Score; id: string } {
  const a = Math.max(0, Math.round(startBar))
  const b = Math.min(score.bars, a + Math.max(1, Math.round(bars)))
  const id = newId('s')
  const sections: Section[] = []
  for (const s of score.sections) {
    const s1 = s.startBar + s.bars
    if (s1 <= a || s.startBar >= b) { sections.push(s); continue }
    if (s.startBar < a) sections.push({ ...s, bars: a - s.startBar })
    if (s1 > b) sections.push({ ...s, id: s.startBar < a ? newId('s') : s.id, startBar: b, bars: s1 - b })
  }
  if (b > a) sections.push({ id, type, startBar: a, bars: b - a, ...(label ? { label } : {}) })
  return { score: { ...score, sections: sections.sort((x, y) => x.startBar - y.startBar) }, id }
}

/**
 * A copy of a section right after it (a second chorus in one click): its bars, the notes of both voices and the
 * chords in them; what came after moves on.
 */
export function repeatSection(score: Score, id: string): { score: Score; id: string; ids: string[] } {
  const s = score.sections.find((x) => x.id === id)
  if (!s) return { score, id: '', ids: [] }
  const tpb = ticksPerBar(score.meter)
  const from = s.startBar * tpb
  const to = (s.startBar + s.bars) * tpb
  const at = s.startBar + s.bars
  let out = insertBars(score, at, s.bars)
  // the copy: notes that start inside the section (cut at its end), chords in its bars
  const copies: { voice: VoiceId; pitch: number; start: number; dur: number }[] = []
  for (const v of ['vocal', 'ins'] as const) {
    for (const n of score.voices[v]) {
      if (n.start >= from && n.start < to) copies.push({ voice: v, pitch: n.pitch, start: n.start + (to - from), dur: Math.min(end(n), to) - n.start })
    }
  }
  const pasted = pasteNotes(out, copies)
  out = pasted.score
  const newSec: Section = { id: newId('s'), type: s.type, startBar: at, bars: s.bars }
  const chords = [
    ...out.chords.filter((c) => c.bar < at || c.bar >= at + s.bars),
    ...score.chords.filter((c) => c.bar >= s.startBar && c.bar < at).map((c) => ({ ...c, bar: c.bar + s.bars })),
  ].sort((a, b) => a.bar - b.bar || a.beat - b.beat)
  const sections = [...out.sections, newSec].sort((a, b) => a.startBar - b.startBar)
  return { score: { ...out, chords, sections }, id: newSec.id, ids: pasted.ids }
}

// ---- history ----

/**
 * Undo and redo over Scores. Plain fields only, so it can sit in a Vue `reactive()` / `ref()` (keep the Scores
 * themselves out of deep reactivity: `shallowRef`, or `markRaw` them, they are big and never mutated).
 *
 * `push(score, key)` with the same `key` as the push before it replaces that step instead of adding one: a drag that
 * pushes on every mouse move is one undo step. `seal()` (or any push with another key, or no key) ends that.
 */
export class History {
  past: Score[] = []
  present: Score
  future: Score[] = []
  cap: number
  private lastKey: string | null = null

  constructor(initial: Score, cap = 100) {
    this.present = initial
    this.cap = cap
  }

  get canUndo(): boolean { return this.past.length > 0 }
  get canRedo(): boolean { return this.future.length > 0 }

  push(score: Score, coalesceKey?: string): Score {
    if (score === this.present) return score
    if (coalesceKey && coalesceKey === this.lastKey && this.past.length) {
      this.present = score
    } else {
      this.past.push(this.present)
      if (this.past.length > this.cap) this.past.splice(0, this.past.length - this.cap)
      this.present = score
    }
    this.future = []
    this.lastKey = coalesceKey ?? null
    return score
  }

  /** Ends a coalescing run: the next push is a step of its own. */
  seal(): void { this.lastKey = null }

  undo(): Score | null {
    const prev = this.past.pop()
    if (!prev) return null
    this.future.push(this.present)
    this.present = prev
    this.lastKey = null
    return prev
  }

  redo(): Score | null {
    const next = this.future.pop()
    if (!next) return null
    this.past.push(this.present)
    this.present = next
    this.lastKey = null
    return next
  }

  /** Starts over from `score` (a new song loaded): no undo past it. */
  reset(score: Score): void {
    this.past = []
    this.future = []
    this.present = score
    this.lastKey = null
  }
}
