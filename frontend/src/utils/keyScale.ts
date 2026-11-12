/**
 * Key = tonic + scale. The value kept in forms and saved params is "<tonic> <scale id>", e.g. "D dorian";
 * "C major" / "A minor" are the plain ACE-Step strings, so older saved values still parse.
 */
export const TONICS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'] as const

export interface ScaleMode {
  /** Lower-case English name: the value part and the locale key (spaces as underscores). */
  id: string
  /** Name put into the text prompt. */
  en: string
  /**
   * The major or minor key ACE-Step is given for this scale: `offset` semitones above the tonic.
   * ACE-Step's key vocabulary is major and minor only (acestep/constants.py KEYSCALE_MODES), so a
   * church mode gets the key with the same notes (D Dorian -> C major) and the other scales the
   * major or minor key on the same tonic.
   */
  offset: number
  quality: 'major' | 'minor'
}

export const SCALE_MODES: ScaleMode[] = [
  { id: 'major', en: 'major', offset: 0, quality: 'major' },
  { id: 'minor', en: 'minor', offset: 0, quality: 'minor' },
  { id: 'dorian', en: 'Dorian', offset: 10, quality: 'major' },
  { id: 'phrygian', en: 'Phrygian', offset: 8, quality: 'major' },
  { id: 'lydian', en: 'Lydian', offset: 7, quality: 'major' },
  { id: 'mixolydian', en: 'Mixolydian', offset: 5, quality: 'major' },
  { id: 'locrian', en: 'Locrian', offset: 1, quality: 'major' },
  { id: 'harmonic minor', en: 'harmonic minor', offset: 0, quality: 'minor' },
  { id: 'melodic minor', en: 'melodic minor', offset: 0, quality: 'minor' },
  { id: 'major pentatonic', en: 'major pentatonic', offset: 0, quality: 'major' },
  { id: 'minor pentatonic', en: 'minor pentatonic', offset: 0, quality: 'minor' },
  { id: 'blues', en: 'blues', offset: 0, quality: 'minor' },
  { id: 'phrygian dominant', en: 'Phrygian dominant', offset: 5, quality: 'minor' },
  { id: 'double harmonic', en: 'double harmonic', offset: 0, quality: 'major' },
  { id: 'hungarian minor', en: 'Hungarian minor', offset: 0, quality: 'minor' },
]

/** Locale key of a scale's name under `keyScale.modes`. */
export function modeKey(id: string): string {
  return id.replace(/ /g, '_')
}

const ENHARMONIC: Record<string, string> = { DB: 'C#', 'D#': 'Eb', GB: 'F#', 'G#': 'Ab', 'A#': 'Bb', CB: 'B', 'E#': 'F', FB: 'E', 'B#': 'C' }

export interface ParsedKey {
  tonic: (typeof TONICS)[number]
  mode: ScaleMode
}

export function parseKeyScale(value: string | null | undefined): ParsedKey | null {
  const m = /^\s*([A-Ga-g])\s*([#b♯♭]?)\s+(.+?)\s*$/.exec(value ?? '')
  if (!m) return null
  const raw = (m[1].toUpperCase() + m[2].replace('♯', '#').replace('♭', 'b')).toUpperCase()
  const tonic = TONICS.find((t) => t.toUpperCase() === (ENHARMONIC[raw] ?? raw).toUpperCase())
  const mode = SCALE_MODES.find((s) => s.id === m[3].toLowerCase())
  return tonic && mode ? { tonic, mode } : null
}

/**
 * A key as the form keeps it, from whatever was typed or saved before the picker existed: "Am", "F#m",
 * "C Maj", "a MINOR". What cannot be read becomes '' rather than a value the picker cannot show.
 */
export function normalizeKeyScale(value: string | null | undefined): string {
  const text = (value ?? '').trim()
  const parsed = parseKeyScale(text)
  if (parsed) return formatKeyScale(parsed.tonic, parsed.mode.id)
  const short = /^([A-Ga-g])\s*([#b♯♭]?)\s*(m|min|minor|maj|major)?$/i.exec(text)
  if (!short) return ''
  // "Am" is minor, "AM" and a bare "A" are major.
  const minor = /^(m|min|minor)$/.test(short[3] ?? '') || /^(min|minor)$/i.test(short[3] ?? '')
  const again = parseKeyScale(`${short[1]}${short[2]} ${minor ? 'minor' : 'major'}`)
  return again ? formatKeyScale(again.tonic, again.mode.id) : ''
}

export function formatKeyScale(tonic: string, modeId: string): string {
  return tonic ? `${tonic} ${modeId}` : ''
}

/** True for the two scales ACE-Step knows by itself. */
export function isPlainKey(value: string): boolean {
  const p = parseKeyScale(value)
  return !p || p.mode.id === 'major' || p.mode.id === 'minor'
}

/** The `key_scale` ACE-Step accepts for a value: "D dorian" -> "C major". Unparsed text passes through. */
export function aceKeyScale(value: string): string {
  const p = parseKeyScale(value)
  if (!p) return value.trim()
  return `${TONICS[(TONICS.indexOf(p.tonic) + p.mode.offset) % 12]} ${p.mode.quality}`
}

/** The key as words for a text prompt: "D Dorian", "A harmonic minor". */
export function keyScaleText(value: string): string {
  const p = parseKeyScale(value)
  return p ? `${p.tonic} ${p.mode.en}` : value.trim()
}

/** Style text with the scale named in it when ACE-Step's key field cannot say it ("..., D Dorian scale"). */
export function withScaleHint(prompt: string, keyScale: string): string {
  if (isPlainKey(keyScale)) return prompt
  const hint = `${keyScaleText(keyScale)} scale`
  return prompt.trim() ? `${prompt.trim().replace(/[.,;]$/, '')}, ${hint}` : hint
}
