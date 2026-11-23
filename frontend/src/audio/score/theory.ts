/**
 * Keys, scales, note spelling and chords for the note editor: which rows of the grid are in the key, how a pitch
 * is spelled in it (C♯ in D minor, D♭ in A♭ major), the key's triads with their roman numerals and chord names.
 */

export type Mode = 'major' | 'minor' | 'dorian' | 'phrygian' | 'lydian' | 'mixolydian' | 'locrian'

export interface KeyInfo {
  /** Pitch class of the tonic, 0 = C. */
  tonic: number
  /** "D", "F#", "Bb". */
  tonicName: string
  mode: Mode
  /** A minor third over the tonic (minor, dorian, phrygian, locrian). */
  minorLike: boolean
  /** The key signature: semitone offset per letter (Dm: B = -1). */
  signature: Record<string, number>
  /** Sharps (> 0) or flats (< 0) in the signature. */
  fifths: number
}

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const
const LETTER_PC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
const SHARP_ORDER = ['F', 'C', 'G', 'D', 'A', 'E', 'B']
const MODE_STEPS: Record<Mode, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  minor: [0, 2, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
}
/** Fifths a mode adds to its tonic's major key signature. */
const MODE_FIFTHS: Record<Mode, number> = { major: 0, lydian: 1, mixolydian: -1, dorian: -2, minor: -3, phrygian: -4, locrian: -5 }
const MODE_SUFFIX: Record<Mode, string> = { major: '', minor: 'm', dorian: 'dor', phrygian: 'phr', lydian: 'lyd', mixolydian: 'mix', locrian: 'loc' }

const pc = (n: number): number => ((n % 12) + 12) % 12

function letterFifths(name: string): number {
  // fifths of the major key on this tonic: C 0, G 1, F -1, F# 6, Bb -2...
  const base: Record<string, number> = { C: 0, G: 1, D: 2, A: 3, E: 4, B: 5, F: -1 }
  const L = name[0].toUpperCase()
  let f = base[L] ?? 0
  for (const c of name.slice(1)) f += c === '#' ? 7 : c === 'b' ? -7 : 0
  return f
}

function modeFromText(text: string): Mode | null {
  const m = text.toLowerCase()
  if (!m || /^(maj|ion)/.test(m)) return 'major'
  if (/^mix/.test(m)) return 'mixolydian'
  if (/^(min|aeo|m)/.test(m)) return 'minor'
  if (/^dor/.test(m)) return 'dorian'
  if (/^phr/.test(m)) return 'phrygian'
  if (/^lyd/.test(m)) return 'lydian'
  if (/^loc/.test(m)) return 'locrian'
  return null
}

/** A K: value ("Dm", "D#m", "Bb", "A minor", "Ador", "F# Mixolydian") parsed; null when it is not a key. */
export function parseKey(key: string): KeyInfo | null {
  const m = (key || '').trim().match(/^([A-Ga-g])([#♯b♭]?)\s*([A-Za-z]*)/)
  if (!m) return null
  const acc = m[2] === '♯' ? '#' : m[2] === '♭' ? 'b' : m[2]
  const tonicName = m[1].toUpperCase() + acc
  const mode = modeFromText(m[3])
  if (!mode) return null
  const fifths = letterFifths(tonicName) + MODE_FIFTHS[mode]
  const signature: Record<string, number> = { C: 0, D: 0, E: 0, F: 0, G: 0, A: 0, B: 0 }
  // beyond 7 (D#m has 6, but A#m 7, D# major 9): the extra ones are double sharps / flats
  for (let i = 0; i < Math.abs(fifths); i++) {
    const l = fifths > 0 ? SHARP_ORDER[i % 7] : SHARP_ORDER[6 - (i % 7)]
    signature[l] += fifths > 0 ? 1 : -1
  }
  const tonic = pc(LETTER_PC[tonicName[0]] + (acc === '#' ? 1 : acc === 'b' ? -1 : 0))
  return { tonic, tonicName, mode, minorLike: MODE_STEPS[mode][2] === 3, signature, fifths }
}

/** The key normalised to the score's form: "Dm", "C", "F#", "Ador". Unknown text gives "C". */
export function normalizeKey(key: string): string {
  const k = parseKey(key)
  return k ? k.tonicName + MODE_SUFFIX[k.mode] : 'C'
}

export function keyFrom(tonicName: string, mode: Mode): string {
  return tonicName + MODE_SUFFIX[mode]
}

/** The seven pitch classes of the key's scale, tonic first. */
export function scalePitchClasses(key: string): number[] {
  const k = parseKey(key) ?? parseKey('C')!
  return MODE_STEPS[k.mode].map((s) => pc(k.tonic + s))
}

export function isInScale(pitch: number, key: string): boolean {
  return scalePitchClasses(key).includes(pc(pitch))
}

/** The nearest pitch of the key's scale (ties go `dir`: down by default, so a pencil between two steps lands lower). */
export function snapToScale(pitch: number, key: string, dir: 'nearest' | 'up' | 'down' = 'nearest'): number {
  const scale = scalePitchClasses(key)
  if (scale.includes(pc(pitch))) return pitch
  if (dir === 'up') { let p = pitch; while (!scale.includes(pc(p))) p++; return p }
  if (dir === 'down') { let p = pitch; while (!scale.includes(pc(p))) p--; return p }
  for (let d = 1; d < 12; d++) {
    if (scale.includes(pc(pitch - d))) return pitch - d
    if (scale.includes(pc(pitch + d))) return pitch + d
  }
  return pitch
}

/** Scale degree of the pitch in the key (1..7), or null when it is outside the scale. */
export function scaleDegree(pitch: number, key: string): number | null {
  const i = scalePitchClasses(key).indexOf(pc(pitch))
  return i < 0 ? null : i + 1
}

export interface Spelling {
  letter: string
  /** -2..2 semitones from the natural letter. */
  alter: number
  /** Scientific octave (C4 = 60). */
  octave: number
}

/**
 * How the pitch is spelled in the key. Notes of the scale take the key's letters; the others follow the usual
 * habit, and YuE2's own: in minor the raised 6th and 7th and the raised 4th are sharps (C♯ and G♯ in D minor, D♯
 * in E minor), the lowered 2nd a flat; in major ♯1, ♭3, ♯4, ♭6, ♭7.
 */
export function spellPitch(pitch: number, key: string): Spelling {
  const k = parseKey(key) ?? parseKey('C')!
  const steps = MODE_STEPS[k.mode]
  const rel = pc(pitch - k.tonic)
  const tonicLetter = LETTERS.indexOf(k.tonicName[0] as (typeof LETTERS)[number])
  let degree = steps.indexOf(rel) // 0-based
  if (degree < 0) {
    // chromatic: a sharp of the degree below or a flat of the degree above
    const raise = k.minorLike ? [2, 4, 6, 9, 11].includes(rel) : [1, 6].includes(rel)
    const below = steps.indexOf(pc(rel - 1))
    const above = steps.indexOf(pc(rel + 1))
    degree = raise ? (below >= 0 ? below : above) : (above >= 0 ? above : below)
    if (degree < 0) degree = 0
    // never a double sharp or flat for a chromatic note (G in C# minor is G natural, not F double sharp): the
    // other neighbour then spells it with a single sign or none
    const other = degree === below ? above : below
    if (other >= 0 && Math.abs(alterOf(pitch, LETTERS[(tonicLetter + degree) % 7])) === 2) degree = other
  }
  const letter = LETTERS[(tonicLetter + degree) % 7]
  // the letter's natural pitch class nearest to the pitch
  const alter = alterOf(pitch, letter)
  if (Math.abs(alter) > 2) {
    // a spelling this far off: fall back to a plain sharp / flat
    return plainSpelling(pitch, k.fifths < 0)
  }
  const octave = Math.round((pitch - alter - LETTER_PC[letter]) / 12) - 1
  return { letter, alter, octave }
}

/** How far `pitch` is from the nearest `letter` (-6..6 semitones). */
function alterOf(pitch: number, letter: (typeof LETTERS)[number]): number {
  let alter = pc(pitch) - LETTER_PC[letter]
  if (alter > 6) alter -= 12
  if (alter < -6) alter += 12
  return alter
}

function plainSpelling(pitch: number, flats: boolean): Spelling {
  const p = pc(pitch)
  const natural = LETTERS.find((l) => LETTER_PC[l] === p)
  if (natural) return { letter: natural, alter: 0, octave: Math.floor(pitch / 12) - 1 }
  const letter = flats ? LETTERS.find((l) => LETTER_PC[l] === p + 1)! : LETTERS.find((l) => LETTER_PC[l] === p - 1)!
  const alter = flats ? -1 : 1
  return { letter, alter, octave: Math.round((pitch - alter - LETTER_PC[letter]) / 12) - 1 }
}

const ACC_TEXT: Record<number, string> = { [-2]: '𝄫', [-1]: '♭', 0: '', 1: '♯', 2: '𝄪' }

/** "C♯4", "B♭3" (with `withOctave` false: "C♯"). Without a key: sharps. */
export function noteName(pitch: number, key = 'C', withOctave = true): string {
  const s = spellPitch(pitch, key)
  return s.letter + (ACC_TEXT[s.alter] ?? '') + (withOctave ? String(s.octave) : '')
}

// ---- chords ----

export type ChordQuality = 'maj' | 'min' | 'dim' | 'aug' | 'sus2' | 'sus4' | '5'

export interface ChordInfo {
  root: number
  rootName: string
  quality: ChordQuality
  /** What follows the quality: "7", "maj7", "7b5"... */
  ext: string
  bass?: string
  bassPc?: number
  /** Pitch classes of the chord (root first). */
  pcs: number[]
}

const NOTE_RE = /^([A-G])([#♯b♭]?)/

function nameToPc(name: string): number {
  const m = name.match(NOTE_RE)
  if (!m) return 0
  return pc(LETTER_PC[m[1]] + (m[2] === '#' || m[2] === '♯' ? 1 : m[2] === 'b' || m[2] === '♭' ? -1 : 0))
}

/** "Dm", "C/E", "F#m7b5", "Bbmaj7", "Asus4", "C#dim" parsed; null when it is not a chord name. */
export function parseChord(name: string): ChordInfo | null {
  const m = (name || '').trim().match(/^([A-G][#♯b♭]?)([^/]*)(?:\/([A-G][#♯b♭]?))?$/)
  if (!m) return null
  const rootName = m[1].replace('♯', '#').replace('♭', 'b')
  const root = nameToPc(rootName)
  const body = m[2]
  let quality = 'maj' as ChordQuality
  let ext = body
  const q = (re: RegExp, qual: ChordQuality): boolean => {
    const x = body.match(re)
    if (!x) return false
    quality = qual
    ext = body.slice(x[0].length)
    return true
  }
  if (/^(maj|M)(7|9|11|13)/.test(body)) ext = body.replace(/^M/, 'maj')
  else if (!(q(/^(min|mi|m|-)(?!aj)/, 'min') || q(/^(dim|°|o)/, 'dim') || q(/^(aug|\+)/, 'aug') ||
    q(/^sus2/, 'sus2') || q(/^sus4?/, 'sus4') || q(/^5$/, '5'))) ext = body
  const third = quality === 'min' || quality === 'dim' ? 3 : quality === 'sus2' ? 2 : quality === 'sus4' ? 5 : quality === '5' ? -1 : 4
  const fifth = quality === 'dim' || /^7?(b|♭)5/.test(ext) ? 6 : quality === 'aug' ? 8 : 7
  const pcs = [root]
  if (third >= 0) pcs.push(pc(root + third))
  pcs.push(pc(root + fifth))
  if (/maj7|M7/.test(ext)) pcs.push(pc(root + 11))
  else if (/7/.test(ext)) pcs.push(pc(root + (quality === 'dim' && !/7b5/.test(ext) ? 9 : 10)))
  if (/6/.test(ext) && !/7/.test(ext)) pcs.push(pc(root + 9))
  const bass = m[3]?.replace('♯', '#').replace('♭', 'b')
  return { root, rootName, quality, ext, pcs, ...(bass ? { bass, bassPc: nameToPc(bass) } : {}) }
}

/** The chord name for display: "F♯m7♭5", "B♭". */
export function displayChord(name: string): string {
  return name.replace(/([A-G])#/g, '$1♯').replace(/([A-G])b/g, '$1♭').replace(/(\d)b(\d)/g, '$1♭$2')
}

const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
const MIXED_NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

/** The name of a pitch class as a chord root in the key (sharps in sharp keys, flats in flat keys). */
export function pcName(p: number, key?: string): string {
  const k = key ? parseKey(key) : null
  if (k) {
    // a note of the scale: the key's own spelling
    const steps = MODE_STEPS[k.mode].map((s) => pc(k.tonic + s))
    if (steps.includes(pc(p))) {
      const s = spellPitch(60 + pc(p), key!)
      if (Math.abs(s.alter) <= 1) return s.letter + (s.alter > 0 ? '#' : s.alter < 0 ? 'b' : '')
    }
    if (k.fifths > 0) return SHARP_NAMES[pc(p)]
    if (k.fifths < 0) return FLAT_NAMES[pc(p)]
  }
  return MIXED_NAMES[pc(p)]
}

/** The chord name moved by `semitones`, roots spelled for `key` when given. */
export function transposeChord(name: string, semitones: number, key?: string): string {
  const c = parseChord(name)
  if (!c) return name
  const suffix = name.trim().replace(/^[A-G][#♯b♭]?/, '').replace(/\/[A-G][#♯b♭]?$/, '')
  const root = pcName(c.root + semitones, key)
  const bass = c.bassPc != null ? '/' + pcName(c.bassPc + semitones, key) : ''
  return root + suffix + bass
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']

export interface Triad {
  /** 1..7 */
  degree: number
  /** "i", "III", "ii°", "V" */
  roman: string
  /** "Dm", "F", "E°" written as "Edim" */
  name: string
  quality: 'maj' | 'min' | 'dim' | 'aug'
  pcs: number[]
}

function triadName(root: number, quality: Triad['quality'], key: string): string {
  return pcName(root, key) + (quality === 'min' ? 'm' : quality === 'dim' ? 'dim' : quality === 'aug' ? 'aug' : '')
}

function romanFor(degree: number, quality: Triad['quality'], prefix = ''): string {
  const r = ROMAN[degree - 1]
  if (quality === 'min') return prefix + r.toLowerCase()
  if (quality === 'dim') return prefix + r.toLowerCase() + '°'
  if (quality === 'aug') return prefix + r + '+'
  return prefix + r
}

/** The seven triads of the key's scale with their roman numerals (Dm: i ii° III iv v VI VII). */
export function diatonicTriads(key: string): Triad[] {
  const scale = scalePitchClasses(key)
  return scale.map((root, i) => {
    const third = pc(scale[(i + 2) % 7] - root)
    const fifth = pc(scale[(i + 4) % 7] - root)
    const quality: Triad['quality'] = third === 4 ? (fifth === 8 ? 'aug' : 'maj') : fifth === 6 ? 'dim' : 'min'
    return { degree: i + 1, roman: romanFor(i + 1, quality), name: triadName(root, quality, key), quality, pcs: [root, pc(root + third), pc(root + fifth)] }
  })
}

/**
 * Chords outside the scale that are common anyway: in minor the major V (A in D minor, from the harmonic minor)
 * and the major IV (dorian); in major ♭VII and the minor iv (borrowed from the minor key).
 */
export function commonExtraChords(key: string): Triad[] {
  const k = parseKey(key) ?? parseKey('C')!
  const make = (offset: number, quality: Triad['quality'], degree: number, prefix = ''): Triad => {
    const root = pc(k.tonic + offset)
    const t = quality === 'min' ? 3 : 4
    return { degree, roman: romanFor(degree, quality, prefix), name: triadName(root, quality, key), quality, pcs: [root, pc(root + t), pc(root + 7)] }
  }
  return k.minorLike
    ? [make(7, 'maj', 5), make(5, 'maj', 4)]
    : [make(10, 'maj', 7, '♭'), make(5, 'min', 4)]
}

/** The relative key: F for Dm, Am for C (modes: the relative major / minor of their signature). */
export function relativeKey(key: string): string {
  const k = parseKey(key) ?? parseKey('C')!
  if (k.mode === 'major') return pcName(k.tonic + 9, key) + 'm'
  if (k.mode === 'minor') return pcName(k.tonic + 3, key)
  // a mode: the major key with the same signature
  const offset: Record<Mode, number> = { major: 0, dorian: 2, phrygian: 4, lydian: 5, mixolydian: 7, minor: 9, locrian: 11 }
  return pcName(k.tonic - offset[k.mode], key)
}

/** The roman numeral of a chord in the key ("iv" for Gm in Dm, "V" for A in Dm, "♭VII" for Bb in C), or ''. */
export function chordRoman(name: string, key: string): string {
  const c = parseChord(name)
  const k = parseKey(key)
  if (!c || !k) return ''
  const rel = pc(c.root - k.tonic)
  const steps = MODE_STEPS[k.mode]
  let degree = steps.indexOf(rel)
  let prefix = ''
  if (degree < 0) {
    // between two degrees: a flat of the upper one
    degree = steps.findIndex((s) => s > rel)
    if (degree < 0) degree = 0
    prefix = '♭'
  }
  const q: Triad['quality'] = c.quality === 'min' ? 'min' : c.quality === 'dim' ? 'dim' : c.quality === 'aug' ? 'aug' : 'maj'
  return romanFor(degree + 1, q, prefix) + (/7/.test(c.ext) ? '7' : '')
}

/** A chord of the key from its roman numeral ("i", "VI", "iv", "V", "♭VII", "bVII"), or null. */
export function chordFromRoman(roman: string, key: string): string | null {
  const m = roman.trim().match(/^([♭b#♯]?)(VII|VI|V|IV|III|II|I|vii|vi|v|iv|iii|ii|i)(°|o|\+)?$/)
  const k = parseKey(key)
  if (!m || !k) return null
  const degree = ROMAN.indexOf(m[2].toUpperCase())
  const minor = m[2] === m[2].toLowerCase()
  const shift = m[1] === '♭' || m[1] === 'b' ? -1 : m[1] === '#' || m[1] === '♯' ? 1 : 0
  // a flat degree counts from the major scale (♭VII in C = Bb), a plain one from the key's own scale
  const base = shift ? MODE_STEPS.major[degree] : MODE_STEPS[k.mode][degree]
  const root = pc(k.tonic + base + shift)
  const quality: Triad['quality'] = m[3] === '°' || m[3] === 'o' ? 'dim' : m[3] === '+' ? 'aug' : minor ? 'min' : 'maj'
  return triadName(root, quality, key)
}

/** Semitones from one key's tonic to another's, the shorter way (-6..5). */
export function keyInterval(from: string, to: string): number {
  const a = parseKey(from)
  const b = parseKey(to)
  if (!a || !b) return 0
  let d = pc(b.tonic - a.tonic)
  if (d > 5) d -= 12
  return d
}
