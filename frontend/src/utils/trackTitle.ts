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
