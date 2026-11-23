/**
 * Stable Audio's prompts (the assistant's, after Stable Audio's own reprompt) end with "BPM: 80. Length: 180 seconds".
 * The length also sits in the form as a parameter; when that changes, the words follow it, so the prompt never asks
 * for one length while the form makes another. A prompt without the phrase is left as it is.
 */
const LENGTH_RE = /(Length:\s*)\d+(?:\.\d+)?(\s*seconds?)/i

export function withLength(prompt: string, seconds: number): string {
  if (!LENGTH_RE.test(prompt)) return prompt
  const n = Math.round(seconds * 10) / 10
  return prompt.replace(LENGTH_RE, (_, a: string, b: string) => `${a}${n}${n === 1 ? b.replace(/s$/i, '') : /s$/i.test(b) ? b : `${b}s`}`)
}
