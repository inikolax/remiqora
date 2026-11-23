import { DEFAULT_SECTION_BARS, emptyScore, newId, sectionTypeFromTag, ticksPerBar } from './types'
import type { ChordSlot, Score, Section, SectionType } from './types'
import { placeholderChords } from './edit'
import { normalizeKey } from './theory'

/**
 * An empty score shaped by the lyrics: a section for each [Intro] / [Verse 1] / [Chorus]... tag (English or
 * Russian, as people write them), the usual number of bars, a placeholder chord in every bar, no notes yet.
 */

export interface LyricsSection {
  type: SectionType
  /** The tag as written, without brackets: "Verse 1", "Припев". */
  tag: string
  /** Sung lines under it. */
  lines: number
}

/**
 * The section tags of the lyrics in order, with their sung lines. Tags are lines like "[Verse 2]" or "(Chorus)";
 * a tag that names no known section ("[Spoken]") is skipped and its lines go to the section before it. Lines before
 * the first tag make a verse.
 */
export function lyricsSections(lyrics: string): LyricsSection[] {
  const out: LyricsSection[] = []
  let current: LyricsSection | null = null
  for (const raw of (lyrics || '').split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) continue
    const tag = line.match(/^\[([^\]]+)\]$/) ?? line.match(/^\(([^)]+)\)$/)
    if (tag) {
      const type = sectionTypeFromTag(tag[1])
      if (type) {
        current = { type, tag: tag[1].trim(), lines: 0 }
        out.push(current)
      }
      continue
    }
    if (!current) {
      current = { type: 'verse', tag: '', lines: 0 }
      out.push(current)
    }
    current.lines++
  }
  return out
}

/** Bars for a section: `perLine` a sung line, rounded up to whole four-bar lines; the type's usual length when it
 *  has no lines. */
export function barsForSection(type: SectionType, lines: number, perLine = 2): number {
  if (lines <= 0) return DEFAULT_SECTION_BARS[type]
  return Math.max(4, Math.ceil((lines * perLine) / 4) * 4)
}

export interface ScaffoldOptions {
  key: string
  tempo: number
  meter?: [number, number]
  unit?: 16 | 32
  title?: string
  /** Roman numerals cycled one a bar (i–VI–III–VII in minor, I–V–vi–IV in major by default). */
  progression?: string[]
  /** How many bars a sung line takes (2). */
  barsPerLine?: number
}

export function scaffoldFromLyrics(lyrics: string, opts: ScaffoldOptions): Score {
  const key = normalizeKey(opts.key)
  const base = emptyScore({ key, tempo: opts.tempo, meter: opts.meter ?? [4, 4], unit: opts.unit ?? 16, ...(opts.title ? { title: opts.title } : {}) })
  let found = lyricsSections(lyrics)
  if (!found.length) found = [{ type: 'verse', tag: '', lines: 0 }]
  const perLine = opts.barsPerLine ?? 2
  const sections: Section[] = []
  const chords: ChordSlot[] = []
  let bar = 0
  for (const f of found) {
    const bars = barsForSection(f.type, f.lines, perLine)
    const label = f.tag && f.tag.toLowerCase() !== f.type ? f.tag : undefined
    sections.push({ id: newId('s'), type: f.type, startBar: bar, bars, ...(label ? { label } : {}) })
    chords.push(...placeholderChords(key, bar, bars, opts.progression))
    bar += bars
  }
  return { ...base, bars: bar, sections, chords }
}

/**
 * Sections over a score that has bars and notes but no sections (a MIDI import): the lyrics' tags in order, laid
 * over the bars that are there. Sections with sung lines share the bars from the first vocal note to the last, in
 * proportion to their lines; the unsung ones before them (an intro) take the bars before the singing, the ones after
 * (an outro) the bars after it. Notes, chords and the number of bars stay as they are; a section that gets no bar
 * is left out. Returns the score unchanged when the lyrics have no tags or the score no bars.
 */
export function sectionsFromLyrics(score: Score, lyrics: string): Score {
  const found = lyricsSections(lyrics)
  if (!found.length || score.bars <= 0) return score
  const tpb = ticksPerBar(score.meter)
  const vocal = score.voices.vocal
  let vFrom = 0
  let vTo = score.bars
  if (vocal.length) {
    vFrom = Math.min(score.bars - 1, Math.floor(Math.min(...vocal.map((n) => n.start)) / tpb))
    vTo = Math.max(vFrom + 1, Math.min(score.bars, Math.ceil(Math.max(...vocal.map((n) => n.start + n.dur)) / tpb)))
  }
  const firstSung = found.findIndex((f) => f.lines > 0)
  const lastSung = found.length - 1 - [...found].reverse().findIndex((f) => f.lines > 0)
  let lead: LyricsSection[] = []
  let mid = found
  let tail: LyricsSection[] = []
  if (firstSung >= 0) {
    lead = found.slice(0, firstSung)
    mid = found.slice(firstSung, lastSung + 1)
    tail = found.slice(lastSung + 1)
  }
  // a group with no room joins the singing; the singing takes the room of an empty group
  let midFrom = vFrom
  let midTo = vTo
  if (!lead.length || vFrom === 0) { mid = [...lead, ...mid]; lead = []; midFrom = 0 }
  if (!tail.length || vTo >= score.bars) { mid = [...mid, ...tail]; tail = []; midTo = score.bars }
  const weight = (f: LyricsSection): number => (f.lines > 0 ? f.lines * 2 : DEFAULT_SECTION_BARS[f.type])
  const sections: Section[] = []
  const lay = (list: LyricsSection[], from: number, to: number): void => {
    const total = list.reduce((a, f) => a + weight(f), 0)
    let acc = 0
    let bar = from
    for (const f of list) {
      acc += weight(f)
      const end = Math.round(from + ((to - from) * acc) / total)
      if (end > bar) {
        const label = f.tag && f.tag.toLowerCase() !== f.type ? f.tag : undefined
        sections.push({ id: newId('s'), type: f.type, startBar: bar, bars: end - bar, ...(label ? { label } : {}) })
        bar = end
      }
    }
  }
  lay(lead, 0, midFrom)
  lay(mid, midFrom, midTo)
  lay(tail, midTo, score.bars)
  return { ...score, sections }
}
