/** A tempo written in a style or prompt ("…, 126 BPM"), or null. */
export function bpmFromText(text: string | null | undefined): number | null {
  const m = (text || '').match(/(\d{2,3}(?:\.\d+)?)\s*bpm\b/i)
  const v = m ? parseFloat(m[1]) : NaN
  return v >= 30 && v <= 300 ? v : null
}

/** A track's tempo: its settings (bpm) first, then a tempo written in its style text. */
export function trackBpm(params: Record<string, unknown> | null | undefined, ...texts: (string | null | undefined)[]): number | null {
  const b = Number(params?.bpm)
  if (Number.isFinite(b) && b >= 30 && b <= 300) return b
  for (const t of texts) {
    const v = bpmFromText(t)
    if (v) return v
  }
  return null
}
