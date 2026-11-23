import { sectionTypeFromTag, ticksPerBar, ticksPerBeat } from './types'
import type { Note, Score, Section, SectionType } from './types'
import { splitNote } from './edit'

/**
 * The lyrics laid over the vocal melody, for the editor's simple mode: each score section gets the lyrics block of
 * the same type and occurrence, each sung line of it a phrase of the section's vocal notes, and each line its
 * syllables. Nothing here changes the score; it only says which notes a line is sung on.
 */

// ---- syllables ----

const RU_VOWELS = 'аеёиоуыэюя'
const EN_VOWELS = 'aeiouy'
const RU_SONORANT = 'йрлмн'

function isRuVowel(c: string): boolean { return RU_VOWELS.includes(c.toLowerCase()) }

function syllabifyRu(word: string): string[] {
  // a syllable is consonants + a vowel; consonants after the last vowel stay with it
  const parts: string[] = []
  let cur = ''
  for (const c of word) {
    cur += c
    if (isRuVowel(c)) { parts.push(cur); cur = '' }
  }
  if (!parts.length) return [word]
  if (cur) parts[parts.length - 1] += cur
  // й, ь, ъ always close the syllable before; a sonorant before another consonant does too ("кар-та", "мой-ка")
  for (let k = 1; k < parts.length; k++) {
    const p = parts[k]
    const first = p[0]?.toLowerCase() ?? ''
    if ((first === 'й' || first === 'ь' || first === 'ъ') && p.length > 1) {
      parts[k - 1] += p[0]; parts[k] = p.slice(1); k--; continue
    }
    if (p.length > 2 && RU_SONORANT.includes(first) && !isRuVowel(p[1])) {
      // a soft sign stays with its consonant ("боль-шой")
      const take = 'ьъ'.includes(p[1].toLowerCase()) ? (p.length > 3 && !isRuVowel(p[2]) ? 2 : 0) : 1
      if (take) { parts[k - 1] += p.slice(0, take); parts[k] = p.slice(take) }
    }
  }
  return parts
}

function isEnVowel(word: string, i: number): boolean {
  const c = word[i].toLowerCase()
  if (!EN_VOWELS.includes(c)) return false
  // y is a consonant at the start of a word or before a vowel ("you", "yes")
  if (c === 'y' && (i === 0 || (i + 1 < word.length && 'aeiou'.includes(word[i + 1].toLowerCase())))) return false
  return true
}

function syllabifyEn(word: string): string[] {
  // vowel groups are syllables; a silent final e ("time", "made") is not one, but "-le" after a consonant is ("little")
  const lower = word.toLowerCase()
  const groups: [number, number][] = []
  for (let i = 0; i < word.length; i++) {
    if (!isEnVowel(word, i)) continue
    let j = i
    while (j + 1 < word.length && isEnVowel(word, j + 1)) j++
    groups.push([i, j])
    i = j
  }
  if (groups.length > 1) {
    const last = groups[groups.length - 1]
    const silentE = last[0] === last[1] && last[0] === word.length - 1 && lower.endsWith('e')
      && !(lower.endsWith('le') && word.length > 3 && !EN_VOWELS.includes(lower[word.length - 3]))
    const silentEs = lower.endsWith('es') && last[0] === word.length - 2 && last[0] === last[1] && !/(s|z|x|ch|sh|ge|ce)es$/.test(lower)
    const silentEd = lower.endsWith('ed') && last[0] === word.length - 2 && last[0] === last[1] && !/[td]ed$/.test(lower)
    if (silentE || silentEs || silentEd) groups.pop()
  }
  if (groups.length <= 1) return [word]
  // split the consonants between two vowel groups: one goes to the next syllable, of more the first stays behind
  const cuts: number[] = []
  for (let g = 1; g < groups.length; g++) {
    const from = groups[g - 1][1] + 1
    const to = groups[g][0]
    const n = to - from
    cuts.push(n <= 1 ? from : from + 1)
  }
  const out: string[] = []
  let prev = 0
  for (const c of cuts) { out.push(word.slice(prev, c)); prev = c }
  out.push(word.slice(prev))
  return out.filter(Boolean)
}

/** A word's syllables (Russian or English by its letters). */
export function syllabifyWord(word: string): string[] {
  if (!word) return []
  if (/[а-яё]/i.test(word)) return syllabifyRu(word)
  if (/[a-z]/i.test(word)) return syllabifyEn(word)
  return [word]
}

/**
 * The sung syllables of a lyrics line, as shown under the notes: punctuation dropped, hyphenated words split,
 * the syllables inside a word end with "-" ("лю-", "бовь").
 */
export function syllabifyLine(line: string): string[] {
  const clean = line
    .replace(/[‐-―-]+/g, ' ')
    .replace(/[^\p{L}\p{N}'’\s]+/gu, ' ')
  const out: string[] = []
  for (const w of clean.split(/\s+/)) {
    const word = w.replace(/^['’]+|['’]+$/g, '')
    if (!word) continue
    const parts = syllabifyWord(word)
    parts.forEach((p, k) => out.push(k < parts.length - 1 ? p + '-' : p))
  }
  return out
}

// ---- lyrics blocks ----

export interface LyricsBlock {
  type: SectionType
  tag: string
  lines: string[]
}

/** The lyrics' sections with the text of their sung lines (the same rules as `lyricsSections`). */
export function lyricsBlocks(lyrics: string): LyricsBlock[] {
  const out: LyricsBlock[] = []
  let cur: LyricsBlock | null = null
  for (const raw of (lyrics || '').split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) continue
    const tag = line.match(/^\[([^\]]+)\]$/) ?? line.match(/^\(([^)]+)\)$/)
    if (tag) {
      const type = sectionTypeFromTag(tag[1])
      if (type) { cur = { type, tag: tag[1].trim(), lines: [] }; out.push(cur) }
      continue
    }
    if (!cur) { cur = { type: 'verse', tag: '', lines: [] }; out.push(cur) }
    cur.lines.push(line)
  }
  return out
}

/** Sung syllables in the whole lyrics (tags left out). */
export function countSyllables(lyrics: string): number {
  return lyricsBlocks(lyrics).reduce((a, b) => a + b.lines.reduce((x, l) => x + syllabifyLine(l).length, 0), 0)
}

// ---- the map ----

export interface LineMap {
  /** "s1a:0": the section's id and the line's index in it. */
  key: string
  /** -1: the section has notes but no words. */
  lineIndex: number
  text: string
  syllables: string[]
  /** The line's vocal notes, in order. */
  notes: Note[]
  /** Ticks the phrase covers (from its first note to the end of its last; the line's share of the section when it has none). */
  start: number
  end: number
}

export interface SectionMap {
  /** The score's section; null when the score has none and the whole song is one block. */
  section: Section | null
  type: SectionType
  startBar: number
  bars: number
  /** The lyrics block it took ("Chorus"), or null. */
  tag: string | null
  lines: LineMap[]
}

export interface LyricsMap {
  sections: SectionMap[]
  /** Lyrics lines no score section took (a [Bridge] the score has no bridge for). */
  unmatchedLines: number
  /** The lyrics have sung lines at all. */
  hasLyrics: boolean
}

const end = (n: Note): number => n.start + n.dur

/** Phrases of the notes at rests of at least `minRest` ticks. Returns the start index of each phrase. */
function restPhrases(notes: Note[], minRest: number): number[] {
  const starts = notes.length ? [0] : []
  for (let i = 1; i < notes.length; i++) if (notes[i].start - end(notes[i - 1]) >= minRest) starts.push(i)
  return starts
}

/** Note counts against syllable counts: how badly a split fits (lower is better). */
function splitCost(starts: number[], total: number, syl: number[]): number {
  let cost = 0
  for (let l = 0; l < syl.length; l++) {
    const a = starts[l] ?? total
    const b = starts[l + 1] ?? total
    const cnt = l < starts.length ? Math.max(0, b - a) : 0
    cost += Math.abs(cnt - syl[l]) + (cnt === 0 && syl[l] > 0 ? 4 : 0)
  }
  return cost
}

/**
 * Picks the line boundaries among the gaps between notes: a boundary at a rest of a beat or more costs nothing, at a
 * shorter rest a little, between two touching notes more; each note more or less than the line's syllables costs
 * one. Dynamic programming over (line, first note).
 */
function bestSplit(notes: Note[], syl: number[], beat: number): number[] {
  const n = notes.length
  const L = syl.length
  const gapCost = (i: number): number => {
    if (i <= 0 || i >= n) return 0
    const g = notes[i].start - end(notes[i - 1])
    return g >= beat ? 0 : g > 0 ? 2.5 : 5
  }
  const INF = 1e9
  // cost[l][i]: lines 0..l-1 placed on notes 0..i-1
  const cost: number[][] = Array.from({ length: L + 1 }, () => new Array(n + 1).fill(INF))
  const from: number[][] = Array.from({ length: L + 1 }, () => new Array(n + 1).fill(-1))
  cost[0][0] = 0
  for (let l = 0; l < L; l++) {
    for (let i = 0; i <= n; i++) {
      const c0 = cost[l][i]
      if (c0 >= INF) continue
      for (let j = i; j <= n; j++) {
        const cnt = j - i
        const c = c0 + Math.abs(cnt - syl[l]) + (cnt === 0 && syl[l] > 0 ? 4 : 0) + (l < L - 1 ? gapCost(j) : 0)
        if (c < cost[l + 1][j]) { cost[l + 1][j] = c; from[l + 1][j] = i }
      }
    }
  }
  const starts: number[] = new Array(L).fill(0)
  let j = n
  for (let l = L; l > 0; l--) { const i = from[l][j]; starts[l - 1] = i; j = i }
  return starts
}

/** Even split by time: line l takes the notes starting in its share of the section. */
function evenSplit(notes: Note[], L: number, from: number, to: number): number[] {
  const starts: number[] = []
  let i = 0
  for (let l = 0; l < L; l++) {
    const t = from + Math.round(((to - from) * l) / L)
    while (i < notes.length && notes[i].start < t) i++
    starts.push(i)
  }
  return starts
}

/** Line boundaries (start index of each line's notes) for a section's notes and its lines' syllable counts. */
export function splitLines(notes: Note[], syl: number[], beat: number, from: number, to: number): number[] {
  const L = syl.length
  if (!L) return []
  const phrases = restPhrases(notes, beat)
  // the rests already make one phrase a line
  if (phrases.length === L) return phrases
  const candidates = [bestSplit(notes, syl, beat), evenSplit(notes, L, from, to)]
  let best = candidates[0]
  let bestCost = splitCost(best, notes.length, syl)
  for (const c of candidates.slice(1)) {
    const k = splitCost(c, notes.length, syl)
    if (k < bestCost) { best = c; bestCost = k }
  }
  return best
}

export function mapLyrics(score: Score, lyrics: string): LyricsMap {
  const blocks = lyricsBlocks(lyrics)
  const hasLyrics = blocks.some((b) => b.lines.length)
  const tpb = ticksPerBar(score.meter)
  const beat = ticksPerBeat(score.meter)
  const vocal = score.voices.vocal
  const used = new Set<LyricsBlock>()

  type Part = { section: Section | null; type: SectionType; startBar: number; bars: number; block: LyricsBlock | null }
  const parts: Part[] = []
  if (!score.sections.length) {
    const lines = blocks.flatMap((b) => b.lines)
    blocks.forEach((b) => used.add(b))
    parts.push({ section: null, type: 'verse', startBar: 0, bars: score.bars, block: lines.length ? { type: 'verse', tag: '', lines } : null })
  } else {
    const seen: Partial<Record<SectionType, number>> = {}
    for (const s of score.sections) {
      const k = seen[s.type] ?? 0
      seen[s.type] = k + 1
      const same = blocks.filter((b) => b.type === s.type)
      // the k-th block of the type; a chorus the lyrics do not write out again repeats the last one
      let block: LyricsBlock | null = same[k] ?? null
      if (!block && s.type === 'chorus' && same.length) block = same[same.length - 1]
      if (block) used.add(block)
      parts.push({ section: s, type: s.type, startBar: s.startBar, bars: s.bars, block })
    }
  }

  const sections: SectionMap[] = []
  let ni = 0
  for (const p of parts) {
    const from = p.startBar * tpb
    const to = (p.startBar + p.bars) * tpb
    while (ni < vocal.length && vocal[ni].start < from) ni++
    const notes: Note[] = []
    for (let i = ni; i < vocal.length && vocal[i].start < to; i++) notes.push(vocal[i])
    const id = p.section?.id ?? 'all'
    const lines: LineMap[] = []
    const texts = p.block?.lines ?? []
    if (!texts.length) {
      if (notes.length) lines.push({ key: `${id}:-1`, lineIndex: -1, text: '', syllables: [], notes, start: notes[0].start, end: end(notes[notes.length - 1]) })
    } else {
      const syl = texts.map(syllabifyLine)
      const starts = splitLines(notes, syl.map((s) => s.length), beat, from, to)
      texts.forEach((text, l) => {
        const a = starts[l] ?? notes.length
        const b = starts[l + 1] ?? notes.length
        const ln = notes.slice(a, Math.max(a, b))
        const share0 = from + Math.round(((to - from) * l) / texts.length)
        const share1 = from + Math.round(((to - from) * (l + 1)) / texts.length)
        lines.push({
          key: `${id}:${l}`, lineIndex: l, text, syllables: syl[l], notes: ln,
          start: ln.length ? ln[0].start : share0, end: ln.length ? end(ln[ln.length - 1]) : share1,
        })
      })
    }
    sections.push({ section: p.section, type: p.type, startBar: p.startBar, bars: p.bars, tag: p.block ? p.block.tag : null, lines })
  }
  const unmatchedLines = blocks.filter((b) => !used.has(b)).reduce((a, b) => a + b.lines.length, 0)
  return { sections, unmatchedLines, hasLyrics }
}

/**
 * Cuts the longest notes of a line in half until it has `need` more notes (a syllable each). Returns the new score,
 * unchanged when no note is long enough to cut (two ticks).
 */
export function splitForSyllables(score: Score, noteIds: string[], need: number): Score {
  let s = score
  let ids = [...noteIds]
  for (let k = 0; k < need; k++) {
    const notes = s.voices.vocal.filter((n) => ids.includes(n.id))
    const longest = notes.reduce<Note | null>((a, n) => (n.dur >= 2 && (!a || n.dur > a.dur) ? n : a), null)
    if (!longest) break
    // the cut lands on a sixteenth when it can
    let at = longest.start + Math.floor(longest.dur / 2)
    if (longest.dur >= 4) at = longest.start + Math.max(2, Math.round(longest.dur / 4) * 2)
    const r = splitNote(s, longest.id, at)
    if (!r.ids.length) break
    s = r.score
    ids = [...ids, ...r.ids.filter((x) => !ids.includes(x))]
  }
  return s
}
