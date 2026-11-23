// What a cover looks like under the text: a 96x96 downsample, and for any region of the 1000x1000 grid its
// brightness, how busy it is (luminance spread), its darkest and brightest pixels and its dominant and accent
// colours. From that: the text colour and how strong a scrim it needs, and the colours of bands and stickers.
import type { RGB } from './types'

export const S = 1000 // layout units: the cover is always 1000x1000
export const M = 64 // outer margin
const GRID = 96

// ---- colour helpers ----
const lin = (c: number): number => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4) }
export const relLum = (r: number, g: number, b: number): number => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
export const contrast = (a: number, b: number): number => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
export function rgb2hsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (mx + mn) / 2
  if (mx !== mn) {
    const d = mx - mn
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn)
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4
    h /= 6
  }
  return [h, s, l]
}
export function hsl2rgb(h: number, s: number, l: number): RGB {
  if (!s) { const v = Math.round(l * 255); return [v, v, v] }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q
  const f = (t: number): number => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  return [f(h + 1 / 3), f(h), f(h - 1 / 3)].map((v) => Math.round(v * 255)) as RGB
}
export const css = (c: RGB, a = 1): string => (a >= 1 ? `rgb(${c[0]},${c[1]},${c[2]})` : `rgba(${c[0]},${c[1]},${c[2]},${+a.toFixed(3)})`)
export const WHITE: RGB = [255, 255, 255]
export const INK: RGB = [20, 19, 18]
const LUM_WHITE = 1
const LUM_INK = relLum(...INK)

export interface RegionStats {
  /** Mean luma, 0..1. */
  mean: number
  /** Luma spread: how busy the region is. */
  std: number
  /** Relative luminance of the darkest and brightest pixels that count (10th and 88th percentile). */
  p10: number
  p90: number
  avg: RGB
  dominant: RGB
  accent: RGB
  accentSat: number
  /** Mean colour of the darkest / brightest tenth of the pixels. */
  dark: RGB
  light: RGB
}

export interface Analysis {
  region(rx: number, ry: number, rw: number, rh: number): RegionStats
}

/** The cover read once, small: every region question is answered from the 96x96 pixels. */
export function analyse(img: CanvasImageSource): Analysis {
  const c = document.createElement('canvas')
  c.width = c.height = GRID
  const x = c.getContext('2d', { willReadFrequently: true })!
  x.drawImage(img, 0, 0, GRID, GRID)
  const d = x.getImageData(0, 0, GRID, GRID).data
  const cache = new Map<string, RegionStats>()
  return {
    region(rx, ry, rw, rh) {
      const key = `${Math.round(rx)},${Math.round(ry)},${Math.round(rw)},${Math.round(rh)}`
      let st = cache.get(key)
      if (!st) { st = regionStats(d, rx, ry, rw, rh); cache.set(key, st) }
      return st
    },
  }
}

/** A region in layout units (0..1000). */
function regionStats(d: Uint8ClampedArray, rx: number, ry: number, rw: number, rh: number): RegionStats {
  const k = GRID / S
  let x0 = Math.max(0, Math.floor(rx * k)), y0 = Math.max(0, Math.floor(ry * k))
  let x1 = Math.min(GRID, Math.ceil((rx + rw) * k)), y1 = Math.min(GRID, Math.ceil((ry + rh) * k))
  if (x1 <= x0) { x0 = Math.min(x0, GRID - 1); x1 = x0 + 1 }
  if (y1 <= y0) { y0 = Math.min(y0, GRID - 1); y1 = y0 + 1 }
  const lums: number[] = []
  let sr = 0, sg = 0, sb = 0, sl = 0, sl2 = 0, n = 0
  const buckets = new Map<string, { n: number; r: number; g: number; b: number; s: number }>()
  for (let y = y0; y < y1; y++) for (let xx = x0; xx < x1; xx++) {
    const i = (y * GRID + xx) * 4, r = d[i], g = d[i + 1], b = d[i + 2]
    lums.push(relLum(r, g, b))
    const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    sl += luma; sl2 += luma * luma
    sr += r; sg += g; sb += b; n++
    // colour buckets: 12 hues x 4 lightness, greys in their own bucket
    const [h, s, l] = rgb2hsl(r, g, b)
    const key = s < 0.15 ? 'g' + Math.floor(l * 4) : Math.floor(h * 12) + '_' + Math.min(3, Math.floor(l * 4))
    const bk = buckets.get(key) || { n: 0, r: 0, g: 0, b: 0, s: 0 }
    bk.n++; bk.r += r; bk.g += g; bk.b += b; bk.s += s
    buckets.set(key, bk)
  }
  const order = lums.map((l, i) => [l, i] as [number, number]).sort((a, b) => a[0] - b[0])
  lums.sort((a, b) => a - b)
  // the region's pixels in scan order, to average the darkest and brightest tenth
  const px: RGB[] = []
  for (let y = y0; y < y1; y++) for (let xx = x0; xx < x1; xx++) { const i = (y * GRID + xx) * 4; px.push([d[i], d[i + 1], d[i + 2]]) }
  const avgOf = (idx: number[]): RGB => {
    const s3 = [0, 0, 0]
    for (const i of idx) { s3[0] += px[i][0]; s3[1] += px[i][1]; s3[2] += px[i][2] }
    return s3.map((v) => Math.round(v / idx.length)) as RGB
  }
  const tenth = Math.max(1, Math.floor(order.length / 10))
  const dark = avgOf(order.slice(0, tenth).map((o) => o[1])), light = avgOf(order.slice(-tenth).map((o) => o[1]))
  const mean = sl / n, std = Math.sqrt(Math.max(0, sl2 / n - mean * mean))
  const pct = (p: number): number => lums[Math.min(lums.length - 1, Math.floor(p * lums.length))]
  const bs = [...buckets.values()].map((b) => ({ n: b.n, c: [b.r / b.n, b.g / b.n, b.b / b.n].map(Math.round) as RGB, s: b.s / b.n }))
  const dominant = bs.slice().sort((a, b) => b.n * (0.6 + b.s) - a.n * (0.6 + a.s))[0].c
  const accent = bs.slice().sort((a, b) => b.n * b.s * b.s - a.n * a.s * a.s)[0]
  return { mean, std, p10: pct(0.1), p90: pct(0.88), avg: [sr / n, sg / n, sb / n].map(Math.round) as RGB, dominant, accent: accent.c, accentSat: accent.s, dark, light }
}

export interface Readability {
  fill: RGB
  scrim: RGB
  alpha: number
  light: boolean
  busy: boolean
}

/**
 * Text colour + scrim strength for a region. `target` = the WCAG contrast wanted against the worst pixels (p90 for
 * light text, p10 for dark). `forceLight`: light text on a dark scrim whatever the region (a busy spot).
 */
export function readability(st: RegionStats, target = 4.5, forceLight: boolean | 'light' | 'dark' = false): Readability {
  const forceDark = forceLight === 'dark'
  if (forceDark) forceLight = false
  // light text: a black scrim of alpha a darkens the worst bright pixel L -> L(1-a)
  const needW = (LUM_WHITE + 0.05) / target - 0.05
  const aW = st.p90 <= needW ? 0 : 1 - needW / st.p90
  // dark text: a white scrim lightens the worst dark pixel L -> L(1-a)+a
  const needD = target * (LUM_INK + 0.05) - 0.05
  const aD = st.p10 >= needD ? 0 : (needD - st.p10) / (1 - st.p10)
  // prefer light text: dark text only when it needs clearly less veil (a white haze looks washed out);
  // busy backgrounds: a white veil over a busy picture reads poorly, so light text + dark scrim
  const light = !forceDark && (!!forceLight || aW <= aD + 0.12 || Math.min(aW, aD) > 0.3 || st.std > 0.19)
  let a = light ? aW : aD
  if (st.std > 0.13) a = Math.max(a, Math.min(0.55, (st.std - 0.13) * 2.2)) // a busy region gets some scrim anyway
  a = Math.min(light ? 0.78 : 0.7, a)
  return { fill: light ? WHITE : INK, scrim: light ? [0, 0, 0] : [255, 255, 255], alpha: a, light, busy: st.std > 0.13 }
}

/** Readability for a text of a given colour: a dark scrim under a light colour, a white veil under a dark one, as
 *  strong as the worst pixels need for `target` (capped like readability's). */
export function readabilityWith(st: RegionStats, target: number, fill: RGB): Readability {
  const Lf = relLum(...fill)
  const light = (Lf + 0.05) / 0.05 >= 1.05 / (Lf + 0.05)
  let a: number
  if (light) {
    const need = (Lf + 0.05) / target - 0.05
    a = need <= 0 ? 1 : st.p90 <= need ? 0 : 1 - need / st.p90
  } else {
    const need = target * (Lf + 0.05) - 0.05
    a = need >= 1 ? 1 : st.p10 >= need ? 0 : (need - st.p10) / (1 - st.p10)
  }
  if (st.std > 0.13) a = Math.max(a, Math.min(0.55, (st.std - 0.13) * 2.2))
  a = Math.min(light ? 0.78 : 0.7, a)
  return { fill, scrim: light ? [0, 0, 0] : [255, 255, 255], alpha: a, light, busy: st.std > 0.13 }
}

export const mix = (a: RGB, b: RGB, t: number): RGB => [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * t)) as RGB

/** A quiet solid colour for bands and spines from a region's dominant colour. */
export function bandColour(st: RegionStats): RGB {
  const [h, s0, l0] = rgb2hsl(...st.dominant)
  const s = Math.min(s0, 0.5)
  const l = l0 > 0.62 ? Math.max(0.86, Math.min(0.92, l0)) : Math.max(0.14, Math.min(0.24, l0 * 0.55))
  return hsl2rgb(h, s, l)
}

export function stickerColour(st: RegionStats): RGB {
  const [h, s] = rgb2hsl(...st.accent)
  if (s < 0.25) return [238, 228, 200] // no colour in the picture: cream paper
  return hsl2rgb(h, Math.max(0.62, Math.min(0.85, s)), 0.55)
}

export function textOn(bg: RGB): RGB {
  const L = relLum(...bg)
  return contrast(L, LUM_WHITE) >= contrast(L, LUM_INK) ? WHITE : INK
}
export const contrastOf = (a: RGB, b: RGB): number => contrast(relLum(...a), relLum(...b))

// ---- colour overrides and the palette the UI offers ----
export const toHex = (c: RGB): string => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')
/** '#rrggbb' (or '#rgb') -> RGB; anything else -> null. */
export function parseHex(s: string | undefined | null): RGB | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((s || '').trim())
  if (!m) return null
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1]
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB
}

export interface Swatch {
  key: 'dominant' | 'accent' | 'darkest' | 'lightest' | 'complement'
  /** '#rrggbb' */
  hex: string
  rgb: RGB
}

/**
 * paletteOf(A: Analysis): Swatch[] - five colours from the whole cover for the colour pickers, in this order:
 * dominant (the most present colour), accent (the most saturated one; a vivid tint of the dominant hue when the
 * picture has no colour), darkest, lightest, complement (the accent's opposite hue). Each is { key, hex, rgb }; the
 * hex goes straight into CoverCaption.color / CoverCaption.accent.
 */
export function paletteOf(A: Analysis): Swatch[] {
  const st = A.region(0, 0, S, S)
  const acc = st.accentSat >= 0.25 ? st.accent : hsl2rgb(rgb2hsl(...st.dominant)[0], 0.7, 0.55)
  const [ha, sa, la] = rgb2hsl(...acc)
  const comp = hsl2rgb((ha + 0.5) % 1, Math.max(0.55, sa), Math.min(0.62, Math.max(0.45, la)))
  const sw = (key: Swatch['key'], rgb: RGB): Swatch => ({ key, hex: toHex(rgb), rgb })
  return [sw('dominant', st.dominant), sw('accent', acc), sw('darkest', st.dark), sw('lightest', st.light), sw('complement', comp)]
}
