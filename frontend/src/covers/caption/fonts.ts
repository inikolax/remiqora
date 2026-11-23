// The caption fonts (all SIL OFL, Latin + Cyrillic, bundled from @fontsource: the app works offline), loaded only
// when a caption is drawn, and the text measuring the layouts fit their lines with. Letters outside Latin and
// Cyrillic (CJK, Arabic, Devanagari...) fall back to the system fonts the app lists in style.css.
import { ref } from 'vue'
import type { CaptionFont, FontFaceSpec } from './types'

export interface TitleFont extends FontFaceSpec {
  label: string
  lh: number
  scale: number
}

/** Title font profiles. */
export const FONTS: Record<CaptionFont, TitleFont> = {
  unbounded: { label: 'Unbounded', family: 'Unbounded', weight: 700, style: 'normal', ls: -0.01, lh: 1.04, scale: 0.86, upper: false },
  oswald: { label: 'Oswald', family: 'Oswald', weight: 600, style: 'normal', ls: 0.01, lh: 0.98, scale: 1.12, upper: true },
  playfair: { label: 'Playfair Display', family: 'Playfair Display', weight: 400, style: 'italic', ls: -0.01, lh: 1.02, scale: 1.0, upper: false },
  cormorant: { label: 'Cormorant Garamond', family: 'Cormorant Garamond', weight: 500, style: 'italic', ls: 0, lh: 0.98, scale: 1.14, upper: false },
  rubik: { label: 'Rubik Mono One', family: 'Rubik Mono One', weight: 400, style: 'normal', ls: -0.02, lh: 1.0, scale: 0.82, upper: true, ws: -0.5 },
  caveat: { label: 'Caveat', family: 'Caveat', weight: 600, style: 'normal', ls: 0, lh: 0.92, scale: 1.3, upper: false },
  pixel: { label: 'Press Start 2P', family: 'Press Start 2P', weight: 400, style: 'normal', ls: 0, lh: 1.3, scale: 0.6, upper: false, ws: -0.6 },
  manrope: { label: 'Manrope', family: 'Manrope', weight: 700, style: 'normal', ls: -0.02, lh: 1.02, scale: 1.0, upper: false },
}
/** Companion styles for the small lines. */
export const SMALL: FontFaceSpec = { family: 'Manrope', weight: 700, style: 'normal', ls: 0.18, upper: true }
export const SMALL_YEAR: FontFaceSpec = { family: 'Manrope', weight: 600, style: 'normal', ls: 0.12, upper: false }

// ---- loading ----
const LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'
const CYRILLIC = 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116'
type Loader = () => Promise<{ default: string }>
/** "family|weight|style" -> its Latin and Cyrillic files (dynamic imports: each is a separate asset, fetched on use). */
const FILES: Record<string, [Loader, Loader]> = {
  'Unbounded|700|normal': [() => import('@fontsource/unbounded/files/unbounded-latin-700-normal.woff2?url'), () => import('@fontsource/unbounded/files/unbounded-cyrillic-700-normal.woff2?url')],
  'Oswald|600|normal': [() => import('@fontsource/oswald/files/oswald-latin-600-normal.woff2?url'), () => import('@fontsource/oswald/files/oswald-cyrillic-600-normal.woff2?url')],
  'Playfair Display|400|italic': [() => import('@fontsource/playfair-display/files/playfair-display-latin-400-italic.woff2?url'), () => import('@fontsource/playfair-display/files/playfair-display-cyrillic-400-italic.woff2?url')],
  'Cormorant Garamond|500|italic': [() => import('@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff2?url'), () => import('@fontsource/cormorant-garamond/files/cormorant-garamond-cyrillic-500-italic.woff2?url')],
  'Rubik Mono One|400|normal': [() => import('@fontsource/rubik-mono-one/files/rubik-mono-one-latin-400-normal.woff2?url'), () => import('@fontsource/rubik-mono-one/files/rubik-mono-one-cyrillic-400-normal.woff2?url')],
  'Caveat|600|normal': [() => import('@fontsource/caveat/files/caveat-latin-600-normal.woff2?url'), () => import('@fontsource/caveat/files/caveat-cyrillic-600-normal.woff2?url')],
  'Press Start 2P|400|normal': [() => import('@fontsource/press-start-2p/files/press-start-2p-latin-400-normal.woff2?url'), () => import('@fontsource/press-start-2p/files/press-start-2p-cyrillic-400-normal.woff2?url')],
  'Manrope|500|normal': [() => import('@fontsource/manrope/files/manrope-latin-500-normal.woff2?url'), () => import('@fontsource/manrope/files/manrope-cyrillic-500-normal.woff2?url')],
  'Manrope|600|normal': [() => import('@fontsource/manrope/files/manrope-latin-600-normal.woff2?url'), () => import('@fontsource/manrope/files/manrope-cyrillic-600-normal.woff2?url')],
  'Manrope|700|normal': [() => import('@fontsource/manrope/files/manrope-latin-700-normal.woff2?url'), () => import('@fontsource/manrope/files/manrope-cyrillic-700-normal.woff2?url')],
  'Manrope|800|normal': [() => import('@fontsource/manrope/files/manrope-latin-800-normal.woff2?url'), () => import('@fontsource/manrope/files/manrope-cyrillic-800-normal.woff2?url')],
}
const MANROPE = ['Manrope|500|normal', 'Manrope|600|normal', 'Manrope|700|normal', 'Manrope|800|normal']
const faceKey = (f: FontFaceSpec): string => `${f.family}|${f.weight}|${f.style}`

/** Grows each time a face finishes loading: what measures text depends on it, so it re-measures. */
export const fontsVersion = ref(0)
const loading = new Map<string, Promise<void>>()

function loadFace(key: string): Promise<void> {
  let p = loading.get(key)
  if (p) return p
  const files = FILES[key]
  if (!files) return Promise.resolve()
  const [family, weight, style] = key.split('|')
  p = Promise.all(files.map(async (load, i) => {
    const url = (await load()).default
    const face = new FontFace(family, `url(${url}) format('woff2')`, { weight, style, unicodeRange: i === 0 ? LATIN : CYRILLIC, display: 'swap' })
    document.fonts.add(await face.load())
  })).then(async () => {
    // and the browser agrees the face is there before anything measures with it
    await document.fonts.load(`${style} ${weight} 40px "${family}"`, 'АаЯя Hh 2026').catch(() => [])
    capCache.clear()
    fontsVersion.value++
  }).catch(() => {
    // a face that cannot load: the text falls back to the system font, still readable
    loading.delete(key)
  })
  loading.set(key, p)
  return p
}

/** The faces a caption in this title font draws with: the title's and the small lines' (Manrope). */
export function ensureFonts(keys: CaptionFont[]): Promise<void> {
  const want = new Set<string>(MANROPE)
  for (const k of keys) want.add(faceKey(FONTS[k]))
  return Promise.all([...want].map(loadFace)).then(() => undefined)
}
export const ensureAllFonts = (): Promise<void> => ensureFonts(Object.keys(FONTS) as CaptionFont[])
/** Whether a title font is loaded (for a chip to show itself in it). */
export const fontReady = (k: CaptionFont): boolean => {
  void fontsVersion.value
  return document.fonts.check(`${FONTS[k].style} ${FONTS[k].weight} 20px "${FONTS[k].family}"`, 'Hh')
}

// ---- other scripts ----
/** System fonts for the letters the bundled fonts have no glyphs for (as the app's own font lists in style.css). */
const FALLBACK = "system-ui, 'Segoe UI', 'Microsoft YaHei UI', 'PingFang SC', 'Hiragino Sans', 'Yu Gothic UI', 'Malgun Gothic', 'Noto Sans CJK SC', 'Noto Sans', sans-serif"
export const familyList = (f: FontFaceSpec): string => `'${f.family}', ${FALLBACK}`
/** Scripts that join or stack letters: no letter-spacing (it breaks them apart) and no drawing letter by letter. */
const COMPLEX = /[֐-ࣿऀ-෿฀-࿿က-႟ក-៿יִ-﷿ﹰ-﻿]/
export const isComplex = (text: string): boolean => COMPLEX.test(text)
/** Letter-spacing in em that a text gets in a face. */
export const lsOf = (f: FontFaceSpec, text: string): number => (isComplex(text) ? 0 : f.ls)

// ---- measuring ----
let mctx: CanvasRenderingContext2D | null = null
const ctx = (): CanvasRenderingContext2D => (mctx ??= document.createElement('canvas').getContext('2d')!)
export const fontStr = (f: FontFaceSpec, size: number): string => `${f.style} ${f.weight} ${size}px ${familyList(f)}`
/** User-perceived letters (grapheme clusters): "Й" written as И + breve, or an emoji, stays one. */
const graphemes = typeof Intl !== 'undefined' && 'Segmenter' in Intl ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null
export const glyphs = (t: string): string[] => (graphemes ? Array.from(graphemes.segment(t), (s) => s.segment) : Array.from(t))
/** Ink above and below the baseline of a line at a size (marks on capitals included: Й, Ё, Å, É). */
export function inkOf(text: string, f: FontFaceSpec, size: number): { asc: number; desc: number } {
  const c = ctx()
  c.font = fontStr(f, size)
  c.letterSpacing = '0px'
  const m = c.measureText(text)
  return { asc: m.actualBoundingBoxAscent || capRatio(f) * size, desc: m.actualBoundingBoxDescent || 0 }
}
export function measure(text: string, f: FontFaceSpec, size: number): number {
  const c = ctx()
  c.font = fontStr(f, size)
  c.letterSpacing = '0px'
  const n = glyphs(text).length
  return c.measureText(text).width + lsOf(f, text) * size * Math.max(0, n - 1) + wsOf(f) * size * spaces(text)
}
/** Word spacing in em a face gets: a monospaced face's space is a whole letter cell, which reads as a double gap. */
export const wsOf = (f: FontFaceSpec): number => f.ws ?? 0
const spaces = (t: string): number => (t.match(/ /g) || []).length
const capCache = new Map<string, number>()
/** Cap height per unit of font size. */
export function capRatio(f: FontFaceSpec): number {
  const k = faceKey(f)
  const hit = capCache.get(k)
  if (hit) return hit
  const c = ctx()
  c.font = fontStr(f, 100)
  c.letterSpacing = '0px'
  const r = c.measureText('НH').actualBoundingBoxAscent / 100 || 0.7
  capCache.set(k, r)
  return r
}
export const prep = (t: string, f: FontFaceSpec): string => (f.upper ? t.toLocaleUpperCase() : t).normalize('NFC')

export interface FitTitle {
  lines: string[]
  size: number
  widths: number[]
  cap: number
  /** Each line's baseline below the top of the block (the first at the cap height). */
  base: number[]
  /** The last baseline below the top: the block's height to the baseline. */
  height: number
  /** How far the first line's marks (Ё, Å, É) rise above the cap height: room to keep above the block. */
  over: number
}

/**
 * Baselines for lines at a size: the font's line height, or more when the ink would touch - the previous line's
 * descenders and this line's tallest marks (the breve of Й, the ring of Å) keep a gap of at least 12% of the size.
 */
function baselines(lines: string[], f: TitleFont, size: number): number[] {
  const cap = capRatio(f) * size
  const ink = lines.map((l) => inkOf(l, f, size))
  const base = [cap]
  for (let i = 1; i < lines.length; i++) base.push(base[i - 1] + Math.max(f.lh * size, ink[i - 1].desc + ink[i].asc + 0.12 * size))
  return base
}

function joinTok(ts: string[]): string {
  let s = ''
  ts.forEach((t, i) => { s += (i && !s.endsWith('-') ? ' ' : '') + t })
  return s
}
function ellipsize(line: string, f: FontFaceSpec, size: number, maxW: number): string {
  if (measure(line, f, size) <= maxW) return line
  const g = glyphs(line)
  while (g.length > 1 && measure(g.join('') + '…', f, size) > maxW) g.pop()
  return g.join('').trim() + '…'
}

/** A title at the largest size that fits maxW in one or two (balanced) lines and maxH; at the smallest size,
 *  what still does not fit ends in an ellipsis. */
export function fitTitle(raw: string, f: TitleFont, maxW: number, maxSize: number, minSize: number, { maxLines = 2, maxH = Infinity } = {}): FitTitle {
  const text = prep(raw.trim(), f)
  maxSize *= f.scale
  minSize *= f.scale
  const cap = capRatio(f)
  const w1 = measure(text, f, 100)
  let best = { lines: [text], size: Math.min(maxSize, maxW / (w1 / 100), maxH / cap) }
  if (maxLines > 1) {
    const toks = text.match(/[^\s-]+-?|\s+/g)?.filter((t) => t.trim()) || [text]
    if (toks.length > 1) {
      let two: { w: number; lines: string[] } | null = null
      for (let i = 1; i < toks.length; i++) {
        const a = joinTok(toks.slice(0, i)), b = joinTok(toks.slice(i))
        const w = Math.max(measure(a, f, 100), measure(b, f, 100))
        if (!two || w < two.w) two = { w, lines: [a, b] }
      }
      const s2 = Math.min(maxSize, maxW / (two!.w / 100), maxH / (cap + f.lh))
      // one line unless two lines give a clearly bigger title
      if (s2 > best.size * 1.3 || best.size < minSize) best = { lines: two!.lines, size: s2 }
    }
  }
  if (best.size < minSize) {
    best.size = minSize
    best.lines = best.lines.map((l) => ellipsize(l, f, minSize, maxW))
  }
  let size = Math.floor(best.size * 10) / 10
  let base = baselines(best.lines, f, size)
  // the extra gap made the block taller than allowed: shrink to fit (not under the smallest size)
  for (let k = 0; k < 4 && base[base.length - 1] > maxH + 0.5 && size > minSize; k++) {
    size = Math.max(minSize, Math.floor(size * (maxH / base[base.length - 1]) * 10) / 10)
    base = baselines(best.lines, f, size)
  }
  const over = Math.max(0, inkOf(best.lines[0], f, size).asc - cap * size)
  return { lines: best.lines, size, widths: best.lines.map((l) => measure(l, f, size)), cap: cap * size, base, height: base[base.length - 1], over }
}

export interface FitSmall { text: string; size: number; w: number; cap: number }
/** A small line shrunk to fit maxW, then cut with an ellipsis at minSize. */
export function fitSmall(raw: string, f: FontFaceSpec, size: number, maxW: number, minSize = 16): FitSmall {
  let text = prep(raw, f)
  let s = size
  while (s > minSize && measure(text, f, s) > maxW) s -= 0.5
  text = ellipsize(text, f, s, maxW)
  return { text, size: s, w: measure(text, f, s), cap: capRatio(f) * s }
}
