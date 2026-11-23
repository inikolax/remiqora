import { ref, watch } from 'vue'
import { sectionTypeFromTag } from '../../audio/score'
import type { Score, Section, SectionType } from '../../audio/score'

/** Shared bits of the note editor's UI: lengths, grids, section colours, labels, time. */

export const DURATIONS: { ticks: number; label: string; key: string }[] = [
  { ticks: 2, label: '1/16', key: '1' },
  { ticks: 4, label: '1/8', key: '2' },
  { ticks: 8, label: '1/4', key: '3' },
  { ticks: 16, label: '1/2', key: '4' },
  { ticks: 32, label: '1', key: '5' },
]

export const GRIDS: { ticks: number; label: string }[] = [
  { ticks: 1, label: '1/32' },
  { ticks: 2, label: '1/16' },
  { ticks: 4, label: '1/8' },
  { ticks: 8, label: '1/4' },
  { ticks: 16, label: '1/2' },
  { ticks: 32, label: '1' },
]

export function durLabel(ticks: number): string {
  const d = DURATIONS.find((x) => x.ticks === ticks)
  if (d) return d.label
  // dotted and other lengths as a fraction of a whole (32 ticks)
  let n = ticks
  let den = 32
  while (n % 2 === 0 && den > 1) { n /= 2; den /= 2 }
  return den === 1 ? String(n) : `${n}/${den}`
}

/** Section colours: [background, text]. */
export const SECTION_COLORS: Record<SectionType, [string, string]> = {
  intro: ['#334155', '#cbd5e1'],
  verse: ['#4c2a7a', '#e9d5ff'],
  'pre-chorus': ['#6b4a12', '#fde68a'],
  chorus: ['#7a1f4f', '#fbcfe8'],
  bridge: ['#14532d', '#bbf7d0'],
  interlude: ['#3f3f46', '#e4e4e7'],
  outro: ['#1e3a5f', '#bfdbfe'],
}

/** The English tag YuE2 and the lyrics use: "Pre-Chorus". */
export const SECTION_TAGS: Record<SectionType, string> = {
  intro: 'Intro', verse: 'Verse', 'pre-chorus': 'Pre-Chorus', chorus: 'Chorus', bridge: 'Bridge', interlude: 'Interlude', outro: 'Outro',
}

type T = (key: string, named?: Record<string, unknown>) => string

/** "Куплет 2" (a number only when the type comes more than once), or the user's own label. */
export function sectionLabel(score: Score, s: Section, t: T): string {
  // a label that is only the lyrics' tag ("Verse 1", "Final Chorus") reads better in the app's language
  if (s.label && sectionTypeFromTag(s.label) !== s.type) return s.label
  const same = score.sections.filter((x) => x.type === s.type)
  const name = t(`score.sectionTypes.${s.type}`)
  return same.length > 1 ? `${name} ${same.indexOf(s) + 1}` : name
}

export function fmtTime(sec: number): string {
  const s = Math.max(0, Math.round(sec))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export const isBlackKey = (p: number): boolean => [1, 3, 6, 8, 10].includes(((p % 12) + 12) % 12)

/** The 12 tonics as the key picker shows them, with the spelling the key takes in major and in minor. */
export const TONICS: { label: string; major: string; minor: string }[] = [
  { label: 'C', major: 'C', minor: 'C' },
  { label: 'C♯', major: 'Db', minor: 'C#' },
  { label: 'D', major: 'D', minor: 'D' },
  { label: 'E♭', major: 'Eb', minor: 'Eb' },
  { label: 'E', major: 'E', minor: 'E' },
  { label: 'F', major: 'F', minor: 'F' },
  { label: 'F♯', major: 'F#', minor: 'F#' },
  { label: 'G', major: 'G', minor: 'G' },
  { label: 'A♭', major: 'Ab', minor: 'G#' },
  { label: 'A', major: 'A', minor: 'A' },
  { label: 'B♭', major: 'Bb', minor: 'Bb' },
  { label: 'B', major: 'B', minor: 'B' },
]

/** Lyrics split into sections with their sung lines (the text, not just the count): the properties panel shows the
 *  line under the selected notes. */
export function lyricsBlocks(lyrics: string, typeOf: (tag: string) => SectionType | null): { type: SectionType; tag: string; lines: string[] }[] {
  const out: { type: SectionType; tag: string; lines: string[] }[] = []
  let cur: { type: SectionType; tag: string; lines: string[] } | null = null
  for (const raw of (lyrics || '').split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) continue
    const tag = line.match(/^\[([^\]]+)\]$/) ?? line.match(/^\(([^)]+)\)$/)
    if (tag) {
      const type = typeOf(tag[1])
      if (type) { cur = { type, tag: tag[1].trim(), lines: [] }; out.push(cur) }
      continue
    }
    if (!cur) { cur = { type: 'verse', tag: '', lines: [] }; out.push(cur) }
    cur.lines.push(line)
  }
  return out
}

/** "For musicians": chord degrees (I, IV, V...) on the chords; off by default, remembered in this browser. */
const MUSICIAN_KEY = 'remiqora.score.musician'
function readMusician(): boolean {
  try { return localStorage.getItem(MUSICIAN_KEY) === '1' } catch { return false }
}
export const musicianView = ref(readMusician())
watch(musicianView, (on) => {
  try { if (on) localStorage.setItem(MUSICIAN_KEY, '1'); else localStorage.removeItem(MUSICIAN_KEY) } catch { /* private window */ }
})

/** What the MIDI import dialog settles: the two parts, the singer whose octave the vocal part is moved into, the tempo. */
export interface MidiPick {
  vocal: number | null
  ins: number | null
  voice: 'male' | 'female'
  /** Move the vocal part by octaves into the singer's written range. */
  fitOctave: boolean
  tempo: number
}

/** The tempo a library track's params name: a `bpm` number, or "126 BPM" in its style or caption. */
export function trackBpm(params: Record<string, unknown> | null | undefined): number | null {
  if (!params) return null
  const n = Number(params.bpm)
  if (Number.isFinite(n) && n >= 20 && n <= 300) return n
  for (const k of ['style', 'prompt', 'caption', 'tags']) {
    const v = params[k]
    const m = typeof v === 'string' ? v.match(/\b(\d{2,3}(?:\.\d+)?)\s*bpm\b/i) : null
    if (m && +m[1] >= 20 && +m[1] <= 300) return +m[1]
  }
  return null
}
