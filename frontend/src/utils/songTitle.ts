// Default names for new tracks, in the spirit of a streaming service: a song is called by its hook (the line
// of the chorus that comes back most often), an instrumental or a sound by the user's own few words, never by
// the engine's prompt with its tags.

/** The service tags Stable Audio's prompts open with ("TrackType: Music, VocalType: Instrumental, "). */
const SERVICE_TAGS = /^\s*(?:(?:TrackType|VocalType|Genre|Mood|Instrument|Tempo)\s*:[^,.\n]*[,.]\s*)+/i
const CHORUS = /chorus|hook|refrain|припев|estribillo|ritornello|refrän|kehrvers/i
const EDGE = /^[\s"'`“”«»‘’()[\]{}<>,.;:!?…\-–—*_~/\|]+|[\s"'`“”«»‘’()[\]{}<>,.;:!?…\-–—*_~/\|]+$/g

const DANGLING = /^(?:a|an|the|in|on|at|of|to|for|with|and|or|but|from|by|as|into|over|about|that|which|в|на|с|со|и|а|но|к|о|об|от|по|за|из|для|у|что|как)$/i
const squash = (s: string): string => s.replace(/\s+/g, ' ').trim()
const words = (s: string): string[] => squash(s).split(' ').filter(Boolean)

/** `text` cut to about `max` words at a phrase boundary (a comma, a dash); one long phrase is cut at the word. */
export function cutWords(text: string, max = 5): string {
  const clean = squash(text).replace(EDGE, '')
  if (words(clean).length <= max) return clean
  const phrases = clean.split(/\s*[,;:–—]\s*|\s+-\s+/).map((p) => p.replace(EDGE, '')).filter(Boolean)
  let out = ''
  for (const phrase of phrases) {
    const next = out ? `${out}, ${phrase}` : phrase
    if (words(next).length > max) break
    out = next
  }
  if (!out) {
    const w = words(phrases[0] || clean).slice(0, max)
    // a cut must not end on a word that wants a next one ("a loud door slam in a")
    while (w.length > 2 && DANGLING.test(w[w.length - 1].replace(EDGE, ''))) w.pop()
    out = w.join(' ')
  }
  return out.replace(EDGE, '')
}

const capital = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)

interface Line { text: string; key: string; section: string }

/** The sung lines with the section they belong to; labels, empty lines and lines that are only a tag are skipped. */
function sungLines(lyrics: string): Line[] {
  const out: Line[] = []
  let section = ''
  for (const raw of (lyrics || '').split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) continue
    if (/^[[(].*[\])]$/.test(line)) { section = line.replace(EDGE, ''); continue }
    const text = line.replace(/\s*[[(]\s*(?:x\s*\d+|\d+\s*x|repeat)[^\])]*[\])]\s*$/i, '').replace(EDGE, '')
    const key = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim()
    if (key) out.push({ text, key, section })
  }
  return out
}

/** The hook of a song: the most repeated line of its chorus, else its most repeated line, else the chorus' or the
 *  first sung line; about five words. Empty for lyrics without a sung line (an instrumental). */
export function hookTitle(lyrics: string, max = 5): string {
  const lines = sungLines(lyrics)
  if (!lines.length) return ''
  const count = new Map<string, number>()
  for (const l of lines) count.set(l.key, (count.get(l.key) ?? 0) + 1)
  const best = (pool: Line[]): Line | null => {
    let top: Line | null = null
    for (const l of pool) if ((count.get(l.key) ?? 0) > (top ? count.get(top.key)! : 1)) top = l
    return top
  }
  const chorus = lines.filter((l) => CHORUS.test(l.section))
  const pick = best(chorus) ?? best(lines) ?? chorus[0] ?? lines[0]
  return capital(cutWords(pick.text, max))
}

/** The user's own words as a short name: service tags dropped, the first phrase (or about six words). */
export function ideaTitle(text: string, max = 6): string {
  const body = squash((text || '').replace(SERVICE_TAGS, ''))
  return capital(cutWords(body, max))
}

/** The name a new take gets: the hook for a song with lyrics, else the idea, else the style. */
export function defaultTitle(src: { lyrics?: string; idea?: string; style?: string }): string {
  return hookTitle(src.lyrics || '') || ideaTitle(src.idea || '') || ideaTitle(src.style || '') || ''
}
