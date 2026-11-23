// A caption from the stored settings to pixels: the cover image read and analysed once (cached by url), the texts
// with their defaults, the layout's steps, and the baked 1024x1024 JPEG the server keeps for downloads.
import { analyse, parseHex } from './analyse'
import type { Analysis } from './analyse'
import { FONTS, ensureFonts } from './fonts'
import { LAYOUT_FN } from './layouts'
import { toCanvas } from './render'
import { friendlyTitle } from '../../utils/trackTitle'
import type { CaptionData, CaptionText, CoverCaption, DrawOp } from './types'

export interface CoverSource {
  img: HTMLImageElement
  A: Analysis
}

const MAX_CACHED = 24
const cache = new Map<string, Promise<CoverSource>>()

/** The cover at `url`, loaded and analysed (the same url is read once). */
export function loadCover(url: string): Promise<CoverSource> {
  const hit = cache.get(url)
  if (hit) {
    cache.delete(url)
    cache.set(url, hit) // the newest at the end
    return hit
  }
  const p = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`cannot load ${url}`))
    img.src = url
  }).then((img) => ({ img, A: analyse(img) }))
  p.catch(() => cache.delete(url))
  cache.set(url, p)
  while (cache.size > MAX_CACHED) cache.delete(cache.keys().next().value!)
  return p
}

/** The defaults: the artist from the settings, the track's title, the year it was made. */
export function captionDefaults(track: { title: string; createdAt: number }, artist: string): CaptionText {
  const year = track.createdAt ? new Date(track.createdAt).getFullYear() : NaN
  return { artist: (artist || '').trim(), title: friendlyTitle(track.title || ''), year: Number.isFinite(year) ? String(year) : '' }
}

/** What a caption draws: its own texts where it has them, the defaults elsewhere. */
export function captionData(c: CoverCaption, d: CaptionText): CaptionData {
  // NFC: "Й" typed as И + combining breve becomes the one precomposed letter the fonts draw well
  const pick = (own: string | undefined, def: string): string => (own && own.trim() ? own.trim() : def.trim()).normalize('NFC')
  const out: CaptionData = {
    showArtist: c.showArtist, showTitle: c.showTitle, showYear: c.showYear,
    artist: pick(c.artist, d.artist), title: pick(c.title, d.title), year: pick(c.year, d.year),
  }
  // the colour overrides; anything unknown is "automatic"
  if (c.color === 'light' || c.color === 'dark') out.color = c.color
  else { const rgb = parseHex(c.color); if (rgb) out.color = rgb }
  const acc = parseHex(c.accent)
  if (acc) out.accent = acc
  return out
}

/** The draw steps of a caption on an analysed cover (fonts must be loaded for the measures to be right). */
export function captionOps(A: Analysis, c: CoverCaption, d: CaptionText): DrawOp[] {
  return (LAYOUT_FN[c.layout] ?? LAYOUT_FN.classic)(A, captionData(c, d), FONTS[c.font] ?? FONTS.unbounded).ops
}

/** The captioned cover as a "data:image/jpeg;base64,..." 1024x1024. */
export async function bakeCaption(url: string, c: CoverCaption, d: CaptionText): Promise<string> {
  const [src] = await Promise.all([loadCover(url), ensureFonts([c.font])])
  return toCanvas(captionOps(src.A, c, d), src.img, 1024).toDataURL('image/jpeg', 0.92)
}

/** A caption with nothing in it is not one. */
export const isEmptyCaption = (c: CoverCaption): boolean => !c.showArtist && !c.showTitle && !c.showYear
