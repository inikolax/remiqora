/**
 * From a description ACE-Step's language model writes the length, tempo and key itself and overwrites what the
 * request carries (acestep/api/llm_generation_inputs.py, the sample branch). What the user picked for them is
 * therefore said in words, on a last line of the description: the model reads it as part of the wish.
 */
const LINE = /\n?Requested: [^\n]*$/

export function withMetaHints(query: string, hints: { seconds?: number | null; bpm?: number | null; key?: string }): string {
  const parts: string[] = []
  if (hints.seconds) {
    const s = Math.round(hints.seconds)
    parts.push(s % 60 === 0 ? `about ${s / 60} ${s === 60 ? 'minute' : 'minutes'} long` : `about ${s} seconds long`)
  }
  if (hints.bpm) parts.push(`${Math.round(hints.bpm)} BPM`)
  if (hints.key) parts.push(`key of ${hints.key}`)
  return parts.length ? `${query}\nRequested: ${parts.join(', ')}.` : query
}

/** The description as the user wrote it: without the line withMetaHints added. */
export function stripMetaHints(text: string): string {
  return text.replace(LINE, '')
}
