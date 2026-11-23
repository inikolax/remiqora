import { hookTitle } from './songTitle'

const MAX = 80

/** `text` cut to `max` characters at the end of a comma-separated phrase, or at a word when one phrase is
 *  longer than that; "…" marks a cut inside a phrase. */
export function cutAtPhrase(text: string, max: number): string {
  const clean = (text || '').replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const parts = clean.split(',').map((p) => p.trim()).filter(Boolean)
  let out = parts[0] || clean
  for (let i = 1; i < parts.length && out.length + 2 + parts[i].length <= max; i++) out += ', ' + parts[i]
  if (out.length > max) {
    const cut = out.slice(0, max - 1)
    out = (cut.includes(' ') ? cut.slice(0, cut.lastIndexOf(' ')) : cut) + '…'
  }
  return out
}

/** A title short enough for a card header. A title that is really a prompt ("Late-90s Frankfurt acid trance,
 *  138 BPM, driving 4/4 kick, ...") is cut after the last whole comma-separated phrase that fits; a name the
 *  user typed is left alone. */
export function friendlyTitle(title: string): string {
  const out = cutAtPhrase(title, MAX)
  return out.charAt(0).toUpperCase() + out.slice(1)
}

const norm = (s: string): string => (s || '').replace(/\s+/g, ' ').trim().toLowerCase().replace(/…$/, '')

/** The first line that is sung: section tags ([verse], (chorus)) and empty lines skipped. */
export function firstSungLine(lyrics: string): string {
  for (const raw of (lyrics || '').split(/\r?\n/)) {
    const line = raw.trim()
    if (line && !/^[[(].*[\])]$/.test(line)) return line.replace(/[,.;:!?…\s]+$/, '')
  }
  return ''
}

/** Stable Audio's service tags in front of a prompt ("TrackType: Music, VocalType: Instrumental. "). */
const SERVICE_TAG = /^\s*(?:TrackType|VocalType|Genre|Mood|Instrument|Tempo)\s*:/i
/** The whole run of those tags, up to the text after them. */
const SERVICE_TAGS = /^\s*(?:(?:TrackType|VocalType|Genre|Mood|Instrument|Tempo)\s*:[^,.\n]*[,.]\s*)+/i

/** A style as people read it: Stable Audio's service tags in front ("TrackType: SFX. soft rain…") left out. */
export function withoutServiceTags(style: string): string {
  const full = (style || '').trim()
  return full.replace(SERVICE_TAGS, '').trim() || full
}

/**
 * Whether a stored title is really the prompt it was made from, not a name: empty, the style itself, a cut of the
 * style ("Russian, prominent duduk lead melody, …"), the style with more after it, a tag list (three and more
 * commas) or a prompt with Stable Audio's service tags. A short name made from the first phrase of the style (the
 * default name of an instrumental) is a name.
 */
export function isPromptTitle(title: string, style: string): boolean {
  const t = norm(title)
  const s = norm(style)
  if (!t) return true
  if (SERVICE_TAG.test(title)) return true
  if ((title.match(/,/g)?.length ?? 0) >= 3) return true
  if (!s) return false
  if (t === s) return true
  if (s.length >= 20 && t.startsWith(s)) return true
  return s.startsWith(t) && ((title.match(/,/g)?.length ?? 0) >= 2 || t.length >= 40 || /…$/.test(title.trim()))
}

/**
 * What a track is called on every screen (the library, the session, Home, the player, Compare), and the line under
 * it. One rule: the track's own name; for a track still called by its prompt, the hook of its words (the most
 * repeated chorus line, else the first sung line); else nothing, which the screens show as "Untitled". The style
 * never stands in the title's place: it is the line under it. `prompt` says the stored title is the prompt, so a
 * screen can offer to think of a name.
 */
export function songName(title: string, style: string, lyrics: string): { name: string; sub: string; prompt: boolean } {
  // the line under the name reads without Stable Audio's service tags ("TrackType: SFX. soft rain…")
  const sub = withoutServiceTags(style)
  if (!isPromptTitle(title || '', style || '')) return { name: friendlyTitle(title), sub, prompt: false }
  const hook = hookTitle(lyrics || '', 6) || cutAtPhrase(firstSungLine(lyrics || ''), 64)
  return { name: hook, sub, prompt: true }
}
