// The caption layouts. Each takes the cover's analysis, the lines to draw and the title font, and returns
// draw steps on the 1000x1000 grid; render.ts turns the same steps into SVG (the live preview) or canvas pixels
// (the baked JPEG), so the two cannot drift apart.
import { INK, M, S, WHITE, bandColour, contrastOf, hsl2rgb, mix, readability, readabilityWith, rgb2hsl, stickerColour, textOn } from './analyse'
import type { Readability, RegionStats } from './analyse'
import type { Analysis } from './analyse'
import { SMALL, SMALL_YEAR, capRatio, fitSmall, fitTitle, glyphs, inkOf, isComplex, lsOf, measure, prep } from './fonts'
import type { TitleFont } from './fonts'
import type { CaptionData, CaptionLayout, DrawOp, FontFaceSpec, GradOp, RGB, TextOp } from './types'

export interface LayoutResult {
  ops: DrawOp[]
  /** Why it looks so (for debugging and tooltips): which region, how busy, what scrim. */
  why: string[]
}
type LayoutFn = (A: Analysis, D: CaptionData, F: TitleFont) => LayoutResult

const T = (text: string, f: FontFaceSpec, size: number, x: number, y: number, fill: RGB, o: { rot?: number; dx?: number; opacity?: number } = {}): TextOp => (
  { t: 'text', text, f, size, x, y, fill, rot: o.rot || 0, dx: o.dx || 0, opacity: o.opacity ?? 1, ls: lsOf(f, text) }
)
const scrimGrad = (edge: GradOp['edge'], from: number, to: number, colour: RGB, a: number): GradOp => ({ t: 'grad', edge, from, to, colour, a })
const has = (on: boolean, text: string): boolean => on && !!text.trim()

// ---- the colour overrides (CoverCaption.color / .accent); absent = what the layout picks from the picture ----
/** Text over the picture: the automatic choice, or the asked-for colour with the scrim it needs. */
function readOn(st: RegionStats, target: number, D: CaptionData, forceLight = false): Readability {
  if (D.color === 'light') return readability(st, target, 'light')
  if (D.color === 'dark') return readability(st, target, 'dark')
  if (D.color) return readabilityWith(st, target, D.color)
  return readability(st, target, forceLight)
}
/** Text on a solid colour. */
const inkOn = (bg: RGB, D: CaptionData, auto?: RGB): RGB => (D.color === 'light' ? WHITE : D.color === 'dark' ? INK : D.color ?? auto ?? textOn(bg))

function classic(A: Analysis, D: CaptionData, F: TitleFont): LayoutResult {
  const ops: DrawOp[] = [{ t: 'image', x: 0, y: 0, w: S, h: S }]
  const why: string[] = []
  const topSt = A.region(0, 0, S, M + 80), r1 = readOn(topSt, 4.5, D)
  const small: DrawOp[] = []
  if (has(D.showArtist, D.artist)) { const a = fitSmall(D.artist, SMALL, 28, has(D.showYear, D.year) ? 600 : S - 2 * M); small.push(T(a.text, SMALL, a.size, M, M + a.cap, r1.fill)) }
  if (has(D.showYear, D.year)) { const y = fitSmall(D.year, SMALL_YEAR, 28, 200); small.push(T(y.text, SMALL_YEAR, y.size, S - M - y.w, M + y.cap, r1.fill)) }
  if (small.length && r1.alpha > 0.02) { ops.push(scrimGrad('top', 0, M + 210, r1.scrim, r1.alpha)); why.push(`top: noise ${topSt.std.toFixed(2)}, scrim ${r1.alpha.toFixed(2)}`) }
  if (has(D.showTitle, D.title)) {
    const t = fitTitle(D.title, F, S - 2 * M, 134, 52, { maxH: 300 })
    const top = S - M - t.height
    const st = A.region(M, top - 10, Math.max(...t.widths), t.height + 30), r = readOn(st, 3, D)
    if (r.alpha > 0.02) ops.push(scrimGrad('bottom', S, top - 230, r.scrim, r.alpha))
    why.unshift(`title: luma ${st.mean.toFixed(2)}, noise ${st.std.toFixed(2)}${r.alpha > 0.02 ? ', scrim ' + r.alpha.toFixed(2) : ''}`)
    t.lines.forEach((l, i) => ops.push(T(l, F, t.size, M, top + t.base[i], r.fill)))
  }
  ops.push(...small)
  return { ops, why }
}

function band(A: Analysis, D: CaptionData, F: TitleFont): LayoutResult {
  const ops: DrawOp[] = [{ t: 'image', x: 0, y: 0, w: S, h: S }]
  const bot = A.region(0, 620, S, 380), bg = D.accent ?? bandColour(bot), ink = inkOn(bg, D)
  const padX = M, padT = 58, padB = 54
  const t = has(D.showTitle, D.title) ? fitTitle(D.title, F, S - 2 * padX, 92, 40, { maxH: 200 }) : null
  const gap = t ? Math.round(t.size * 0.3 + 20) : 0 // room for descenders
  const hasSmall = has(D.showArtist, D.artist) || has(D.showYear, D.year)
  const smallCap = capRatio(SMALL) * 26
  if (!t && !hasSmall) return { ops, why: [] }
  const padTop = padT + (t ? t.over : 0) // marks on the first line (Ё, Å) stay inside the band
  const h = padTop + (t ? t.height : 0) + (t && hasSmall ? gap : 0) + (hasSmall ? smallCap : 0) + padB
  const y0 = S - h
  ops.push({ t: 'rect', x: 0, y: y0, w: S, h, fill: bg })
  let y = y0 + padTop
  if (t) { t.lines.forEach((l, i) => ops.push(T(l, F, t.size, padX, y + t.base[i], ink))); y += t.height + gap }
  if (hasSmall) {
    let yw = 0
    if (has(D.showYear, D.year)) { const yy = fitSmall(D.year, SMALL_YEAR, 26, 200); yw = yy.w; ops.push(T(yy.text, SMALL_YEAR, yy.size, S - padX - yy.w, y + smallCap, ink, { opacity: 0.72 })) }
    if (has(D.showArtist, D.artist)) { const a = fitSmall(D.artist, SMALL, 26, S - 2 * padX - yw - 40); ops.push(T(a.text, SMALL, a.size, padX, y + smallCap, ink, { opacity: 0.72 })) }
  }
  return { ops, why: [`band from the bottom's colour, ${ink === WHITE ? 'light' : 'dark'} text (contrast ${contrastOf(bg, ink).toFixed(1)})`] }
}

function frame(A: Analysis, D: CaptionData, F: TitleFont): LayoutResult {
  const all = A.region(0, 0, S, S)
  const [h] = rgb2hsl(...all.dominant)
  let paper = D.accent ?? hsl2rgb(h, 0.22, 0.94)
  if (!D.accent && D.color && contrastOf(paper, inkOn(paper, D)) < 3) paper = hsl2rgb(h, 0.22, 0.12)
  const ink = inkOn(paper, D, D.accent ? undefined : INK)
  const inset = 44, ih = 730
  const ops: DrawOp[] = [{ t: 'rect', x: 0, y: 0, w: S, h: S, fill: paper }, { t: 'image', x: inset, y: inset, w: S - 2 * inset, h: ih }]
  const mTop = inset + ih
  const smallCap = capRatio(SMALL) * 22
  const hasSmall = has(D.showArtist, D.artist) || has(D.showYear, D.year)
  const yS = S - 50
  if (has(D.showTitle, D.title)) {
    const avail = (hasSmall ? yS - smallCap - 34 : S - 50) - (mTop + 44)
    const t = fitTitle(D.title, F, S - 2 * inset - 8, 84, 34, { maxH: avail })
    const top = mTop + 44 + t.over + Math.max(0, ((avail - t.over - t.height) / 2) * 0.6)
    t.lines.forEach((l, i) => ops.push(T(l, F, t.size, inset + 4, top + t.base[i], ink)))
  }
  if (hasSmall) {
    let yw = 0
    if (has(D.showYear, D.year)) { const yy = fitSmall(D.year, SMALL_YEAR, 22, 200); yw = yy.w; ops.push(T(yy.text, SMALL_YEAR, yy.size, S - inset - 4 - yy.w, yS, ink, { opacity: 0.55 })) }
    if (has(D.showArtist, D.artist)) { const a = fitSmall(D.artist, SMALL, 22, S - 2 * inset - yw - 40); ops.push(T(a.text, SMALL, a.size, inset + 4, yS, ink, { opacity: 0.55 })) }
  }
  return { ops, why: ['the frame is tinted with the picture\'s colour; the text is always dark'] }
}

function spine(A: Analysis, D: CaptionData, F: TitleFont): LayoutResult {
  const ops: DrawOp[] = [{ t: 'image', x: 0, y: 0, w: S, h: S }]
  const left = A.region(0, 0, 200, S), bg = D.accent ?? bandColour(left), ink = inkOn(bg, D)
  // the small block at the top end of the spine
  const smallTxt = [has(D.showArtist, D.artist) ? D.artist : '', has(D.showYear, D.year) ? D.year : ''].filter(Boolean).join('   ')
  const sm = smallTxt ? fitSmall(smallTxt, SMALL, 24, 420) : null
  const len = S - 2 * M - (sm ? sm.w + 56 : 0)
  const t = has(D.showTitle, D.title) ? fitTitle(D.title, F, len, 96, 30, { maxLines: 1 }) : null
  if (!t && !sm) return { ops, why: [] }
  const pad = Math.max(34, (t ? t.size : 30) * 0.42)
  const W = Math.round((t ? t.cap : sm ? sm.cap : 20) + 2 * pad)
  ops.push({ t: 'rect', x: 0, y: 0, w: W, h: S, fill: bg })
  ops.push({ t: 'rect', x: W, y: 0, w: 2, h: S, fill: ink, opacity: 0.18 })
  if (t) ops.push(T(t.lines[0], F, t.size, W / 2 + t.cap / 2, S - M, ink, { rot: -90 }))
  if (sm) ops.push(T(sm.text, SMALL, sm.size, W / 2 + sm.cap / 2, M + sm.w, ink, { rot: -90, opacity: 0.72 }))
  return { ops, why: [`spine in the left edge's colour, ${W} wide`] }
}

function poster(A: Analysis, D: CaptionData, F: TitleFont): LayoutResult {
  const ops: DrawOp[] = [{ t: 'image', x: 0, y: 0, w: S, h: S }]
  const fa = { ...SMALL, ls: 0.3 }, fy = { ...SMALL_YEAR, ls: 0.3 }
  const t = has(D.showTitle, D.title) ? fitTitle(D.title, F, S - 2 * 110, 220, 70, { maxH: 440 }) : null
  const a = has(D.showArtist, D.artist) ? fitSmall(D.artist, fa, 28, S - 2 * M) : null
  const y = has(D.showYear, D.year) ? fitSmall(D.year, fy, 28, 300) : null
  if (!t && !a && !y) return { ops, why: [] }
  // marks on the first line (Ё, Å) rise above the cap height: keep them off the artist line
  const gapA = 56 + (t ? t.over : 0), gapY = 62
  const blockH = (a ? a.cap + gapA : 0) + (t ? t.height : 0) + (y ? gapY + y.cap : 0)
  let top = 500 - blockH / 2
  const st = A.region(120, top - 20, S - 240, blockH + 40), r = readOn(st, 3, D)
  const why = [`centre: luma ${st.mean.toFixed(2)}, noise ${st.std.toFixed(2)}`]
  if (r.alpha > 0.02) { ops.push({ t: 'radial', cx: 500, cy: 500, r: 640, colour: r.scrim, a: Math.min(0.8, r.alpha * 1.1) }); why.push(`scrim ${r.alpha.toFixed(2)}`) }
  if (a) { ops.push(T(a.text, fa, a.size, 500 - a.w / 2, top + a.cap, r.fill)); top += a.cap + gapA }
  if (t) { t.lines.forEach((l, i) => ops.push(T(l, F, t.size, 500 - t.widths[i] / 2, top + t.base[i], r.fill))); top += t.height }
  if (y) { top += gapY; ops.push(T(y.text, fy, y.size, 500 - y.w / 2, top + y.cap, r.fill)) }
  return { ops, why }
}

function sticker(A: Analysis, D: CaptionData, F: TitleFont): LayoutResult {
  const ops: DrawOp[] = [{ t: 'image', x: 0, y: 0, w: S, h: S }]
  const R = 172, box = 2 * R + M
  const corners = [
    { k: 'bottom right', cx: S - M - R + 10, cy: S - M - R + 10, rot: -9, rx: S - box, ry: S - box, top: false },
    { k: 'bottom left', cx: M + R - 10, cy: S - M - R + 10, rot: 8, rx: 0, ry: S - box, top: false },
    { k: 'top right', cx: S - M - R + 10, cy: M + R - 10, rot: 9, rx: S - box, ry: 0, top: true },
    { k: 'top left', cx: M + R - 10, cy: M + R - 10, rot: -8, rx: 0, ry: 0, top: true },
  ].map((c) => {
    const st = A.region(c.rx, c.ry, box, box)
    return { ...c, st, score: st.std + (c.top ? 0.02 : 0) } // a slight preference for the bottom corners
  })
  const c = corners.sort((a, b) => a.score - b.score)[0]
  let bg = D.accent ?? stickerColour(A.region(0, 0, S, S))
  // the sticker must stand off its corner: the same hue as the corner -> cream paper
  const [hb] = rgb2hsl(...bg), [hc, sc] = rgb2hsl(...c.st.dominant), dh = Math.min(Math.abs(hb - hc), 1 - Math.abs(hb - hc))
  if (!D.accent && sc > 0.3 && dh < 0.12) bg = [240, 232, 208]
  const ink = inkOn(bg, D)
  const kids: DrawOp[] = []
  kids.push({ t: 'circle', cx: c.cx, cy: c.cy, r: R, fill: bg, shadow: true })
  kids.push({ t: 'circle', cx: c.cx, cy: c.cy, r: R - 15, stroke: ink, sw: 2, opacity: 0.45 })
  const t = has(D.showTitle, D.title) ? fitTitle(D.title, F, 2 * R * 0.64, 60, 22, { maxH: 112 }) : null
  const fy = { ...SMALL_YEAR, ls: 0.24 }
  const y = has(D.showYear, D.year) ? fitSmall(D.year, fy, 24, 200) : null
  const artist = has(D.showArtist, D.artist)
  const fa = { ...SMALL, ls: 0.16, weight: 800 }
  // letters that join (Arabic, Devanagari...) cannot go round the arc one by one: a straight line above the title
  const straight = artist && isComplex(D.artist) ? fitSmall(D.artist, fa, 22, 2 * R * 0.62) : null
  const blockH = (straight ? straight.cap + 22 + (t ? t.over : 0) : 0) + (t ? t.height : 0) + (y ? 40 + y.cap : 0)
  let top = c.cy - blockH / 2 + (artist && !straight ? 26 : 0)
  if (straight) { kids.push(T(straight.text, fa, straight.size, c.cx - straight.w / 2, top + straight.cap, ink, { opacity: 0.85 })); top += straight.cap + 22 + (t ? t.over : 0) }
  if (t) { t.lines.forEach((l, i) => kids.push(T(l, F, t.size, c.cx - t.widths[i] / 2, top + t.base[i], ink))); top += t.height }
  if (y) { top += 40; kids.push(T(y.text, fy, y.size, c.cx - y.w / 2, top + y.cap, ink, { opacity: 0.8 })) }
  // the artist on the upper arc, glyph by glyph
  if (artist && !straight) {
    let size = 24
    const txt = prep(D.artist, fa)
    const Rarc = R - 44
    const span = (s: number): number => glyphs(txt).reduce((w, g) => w + measure(g, fa, s) + fa.ls * s, 0) / Rarc
    while (span(size) > Math.PI * 0.95 && size > 15) size -= 0.5
    const total = span(size)
    let ang = -Math.PI / 2 - total / 2
    for (const g of glyphs(txt)) {
      const gw = measure(g, fa, size), adv = gw + fa.ls * size, mid = ang + adv / 2 / Rarc
      kids.push(T(g, fa, size, c.cx + Rarc * Math.cos(mid), c.cy + Rarc * Math.sin(mid), ink, { rot: (mid * 180) / Math.PI + 90, dx: -gw / 2 }))
      ang += adv / Rarc
    }
  }
  ops.push({ t: 'group', rot: c.rot, cx: c.cx, cy: c.cy, children: kids })
  return { ops, why: [`corner ${c.k}: the quietest (noise ${c.st.std.toFixed(2)})`] }
}

function minimal(A: Analysis, D: CaptionData): LayoutResult {
  const ops: DrawOp[] = [{ t: 'image', x: 0, y: 0, w: S, h: S }]
  const fa: FontFaceSpec = { family: 'Manrope', weight: 500, style: 'normal', ls: 0.01, upper: false }, fb: FontFaceSpec = { ...fa, weight: 700 }
  const parts: [string, FontFaceSpec][] = []
  if (has(D.showArtist, D.artist)) parts.push([D.artist, fa])
  if (has(D.showTitle, D.title)) { if (parts.length) parts.push([' — ', fa]); parts.push([D.title, fb]) }
  if (has(D.showYear, D.year)) { if (parts.length) parts.push([', ', fa]); parts.push([D.year, fa]) }
  if (!parts.length) return { ops, why: [] }
  let size = 26
  const W = (): number => parts.reduce((w, [t, f]) => w + measure(t, f, size) + lsOf(f, t) * size, 0)
  while (W() > S - 2 * M && size > 14) size -= 0.5
  // still too long at the smallest size: the longest part gives way, ending in an ellipsis
  while (W() > S - 2 * M) {
    const i = parts.reduce((best, p, k) => (p[0].length > parts[best][0].length ? k : best), 0)
    const g = glyphs(parts[i][0].replace(/…$/, ''))
    if (g.length <= 2) break
    parts[i] = [g.slice(0, -1).join('').trimEnd() + '…', parts[i][1]]
  }
  const w = W(), cap = capRatio(fa) * size
  const spots = [
    { k: 'bottom left', x: M, y: S - M, ry: S - M - cap - 30, edge: 'bottom' as const },
    { k: 'top left', x: M, y: M + cap, ry: M - 30, edge: 'top' as const },
    { k: 'bottom right', x: S - M - w, y: S - M, ry: S - M - cap - 30, edge: 'bottom' as const },
  ].map((s) => {
    const st = A.region(s.x - 20, s.ry, w + 40, cap + 60)
    const r = readOn(st, 4.5, D)
    return { ...s, st, r, score: r.alpha + st.std * 0.5 }
  })
  const sp = spots.sort((a, b) => a.score - b.score)[0]
  // a busy spot: dark text on a white veil reads poorly there, so light text on a dark scrim, whatever the luma
  const r = !D.color && sp.r.busy && !sp.r.light ? readability(sp.st, 4.5, true) : sp.r
  if (r.alpha > 0.02) ops.push(sp.edge === 'bottom' ? scrimGrad('bottom', S, S - M - cap - 150, r.scrim, r.alpha) : scrimGrad('top', 0, M + cap + 150, r.scrim, r.alpha))
  let x = sp.x
  for (const [t, f] of parts) {
    ops.push(T(t, f, size, x, sp.y, r.fill, { opacity: f.weight === 700 ? 1 : 0.86 }))
    x += measure(t, f, size) + lsOf(f, t) * size
  }
  return { ops, why: [`${sp.k}: noise ${sp.st.std.toFixed(2)}${r.alpha > 0.02 ? ', scrim ' + r.alpha.toFixed(2) : ''}`] }
}

// ---- shared by the newer layouts ----
/** A vivid colour from the picture's accent at lightness `l`; `fallback` (or the dominant hue) when it is grey. */
function vivid(A: Analysis, l: number, fallback?: RGB): RGB {
  const st = A.region(0, 0, S, S)
  if (st.accentSat >= 0.25) { const [h, s0] = rgb2hsl(...st.accent); return hsl2rgb(h, Math.max(0.62, Math.min(0.9, s0)), l) }
  if (fallback) return fallback
  const [h, s0] = rgb2hsl(...st.dominant)
  return hsl2rgb(h, s0 < 0.08 ? 0 : 0.6, l)
}
/** A small seeded random (mulberry32 over an FNV hash of the text): the same title gives the same "randomness", so
 *  the preview and the baked JPEG agree. */
function rng(seed: string): () => number {
  let h = 2166136261
  for (const ch of seed) h = Math.imul(h ^ ch.codePointAt(0)!, 16777619)
  return () => {
    h = (h + 0x6d2b79f5) | 0
    let t = Math.imul(h ^ (h >>> 15), 1 | h)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
/** A line's letters each with its own opacity (uneven ink); joined scripts stay whole. */
function inkLetters(text: string, f: FontFaceSpec, size: number, x: number, y: number, fill: RGB, rnd: () => number, lo: number): TextOp[] {
  if (isComplex(text)) return [T(text, f, size, x, y, fill, { opacity: +(lo + (1 - lo) * 0.6).toFixed(3) })]
  const g = glyphs(text), ls = lsOf(f, text) * size
  return g.map((ch, i) => {
    const pre = i ? measure(g.slice(0, i).join(''), f, size) + ls : 0
    return T(ch, f, size, x + pre, y, fill, { opacity: +(lo + (1 - lo) * rnd()).toFixed(3) })
  })
}
/** The artist over the year, small, in the quietest of the corners `ok` allows, with the scrim it needs. */
function cornerSmall(A: Analysis, D: CaptionData, ok: (top: number, bh: number) => boolean): { ops: DrawOp[]; why: string } | null {
  const a = has(D.showArtist, D.artist) ? fitSmall(D.artist, SMALL, 24, 520) : null
  const y = has(D.showYear, D.year) ? fitSmall(D.year, SMALL_YEAR, 22, 260) : null
  if (!a && !y) return null
  const gap = 16
  const bh = (a ? a.cap : 0) + (a && y ? gap : 0) + (y ? y.cap : 0), bw = Math.max(a ? a.w : 0, y ? y.w : 0)
  const all = [
    { k: 'bottom left', top: S - M - bh, right: false },
    { k: 'top right', top: M, right: true },
    { k: 'bottom right', top: S - M - bh, right: true },
    { k: 'top left', top: M, right: false },
  ]
  const free = all.filter((p) => ok(p.top, bh))
  const spots = (free.length ? free : all).map((p) => {
    const x = p.right ? S - M - bw : M
    const st = A.region(x - 20, p.top - 20, bw + 40, bh + 40), r = readOn(st, 4.5, D)
    return { ...p, st, r, score: r.alpha + st.std * 0.5 }
  })
  const sp = spots.sort((p, q) => p.score - q.score)[0]
  const r = !D.color && sp.r.busy && !sp.r.light ? readability(sp.st, 4.5, true) : sp.r
  const ops: DrawOp[] = []
  const bottom = sp.top > 500
  if (r.alpha > 0.02) ops.push(bottom ? scrimGrad('bottom', S, sp.top - 130, r.scrim, r.alpha) : scrimGrad('top', 0, sp.top + bh + 130, r.scrim, r.alpha))
  const xOf = (w: number): number => (sp.right ? S - M - w : M)
  let top = sp.top
  if (a) { ops.push(T(a.text, SMALL, a.size, xOf(a.w), top + a.cap, r.fill)); top += a.cap + gap }
  if (y) ops.push(T(y.text, SMALL_YEAR, y.size, xOf(y.w), top + y.cap, r.fill, { opacity: 0.85 }))
  return { ops, why: `${sp.k}: noise ${sp.st.std.toFixed(2)}${r.alpha > 0.02 ? ', scrim ' + r.alpha.toFixed(2) : ''}` }
}

function magazine(A: Analysis, D: CaptionData, F: TitleFont): LayoutResult {
  const ops: DrawOp[] = [{ t: 'image', x: 0, y: 0, w: S, h: S }]
  const why: string[] = []
  const mx = 38
  // a masthead is set tight and as wide as the cover
  const MF: TitleFont = { ...F, ls: F.ls - 0.025 }
  // a short word may grow taller (a masthead fills the top), a long title keeps to the top third
  const short = has(D.showTitle, D.title) && glyphs(prep(D.title.trim(), MF)).length <= 8
  const maxH = short ? 400 : 300
  const t = has(D.showTitle, D.title) ? fitTitle(D.title, MF, S - 2 * mx, 640, 60, { maxH }) : null
  if (t) {
    // a justified stack: each line at the size that fills the width (two lines of different sizes, edge to edge)
    const W = S - 2 * mx, cap = capRatio(MF)
    const sizes = t.lines.map((l) => (t.lines.length > 1 ? Math.min(t.size * 1.8, (W / measure(l, MF, 100)) * 100) : t.size))
    const stack = (k: number): { base: number[]; over: number; bottom: number } => {
      const sz = sizes.map((v) => v * k), ink = t.lines.map((l, i) => inkOf(l, MF, sz[i]))
      const base = [cap * sz[0]]
      for (let i = 1; i < sz.length; i++) base.push(base[i - 1] + Math.max(MF.lh * sz[i] * 0.92, ink[i - 1].desc + ink[i].asc + 0.08 * sz[i]))
      return { base, over: Math.max(0, ink[0].asc - cap * sz[0]), bottom: base[base.length - 1] + ink[ink.length - 1].desc }
    }
    let k = 1, st0 = stack(1)
    if (st0.base[st0.base.length - 1] > maxH + 30) { k = (maxH + 30) / st0.base[st0.base.length - 1]; st0 = stack(k) }
    const y0 = 40 + st0.over
    const bottom = y0 + st0.bottom
    const st = A.region(0, 0, S, bottom + 20)
    let r = readOn(st, 3, D)
    if (!D.color && r.busy && !r.light) r = readability(st, 3, true) // a white veil over a busy picture reads poorly
    if (r.busy) {
      // busy behind the masthead: the fade starts below the letters, so the whole masthead gets the full scrim
      const a2 = Math.min(0.85, Math.max(r.alpha, 0.5) / 0.75)
      ops.push(scrimGrad('top', 0, Math.min(S * 0.78, bottom * 2), r.scrim, a2))
      why.push(`busy top: scrim ${a2.toFixed(2)}`)
    } else if (r.alpha > 0.02) ops.push(scrimGrad('top', 0, bottom + 220, r.scrim, r.alpha))
    t.lines.forEach((l, i) => {
      const sz = Math.floor(sizes[i] * k * 10) / 10
      // a short word that the height stopped short of the edges is tracked out toward them
      let f: TitleFont = MF
      const w = measure(l, MF, sz), n = glyphs(l).length
      if (t.lines.length === 1 && n > 1 && !isComplex(l) && w < W * 0.96) f = { ...MF, ls: MF.ls + Math.min(0.35, (W - w) / ((n - 1) * sz)) }
      ops.push(T(l, f, sz, (S - measure(l, f, sz)) / 2, y0 + st0.base[i], r.fill))
    })
    why.push(`masthead: luma ${st.mean.toFixed(2)}, noise ${st.std.toFixed(2)}${r.alpha > 0.02 ? ', scrim ' + r.alpha.toFixed(2) : ''}`)
  }
  // cover lines at the bottom left: a short accent bar, the artist large-ish, the year under it
  const fa: FontFaceSpec = { ...SMALL, weight: 800, ls: 0.06 }, fy: FontFaceSpec = { ...SMALL_YEAR, ls: 0.16 }
  const a = has(D.showArtist, D.artist) ? fitSmall(D.artist, fa, 44, 620, 22) : null
  const y = has(D.showYear, D.year) ? fitSmall(D.year, fy, 28, 300) : null
  if (a || y) {
    const yB = S - 58
    const aB = y ? yB - (y.cap + 24) : yB
    const blockTop = (a ? aB - a.cap : yB - (y ? y.cap : 0)) - 34
    const st = A.region(0, blockTop - 10, 700, S - blockTop)
    let r = readOn(st, 4.5, D)
    if (!D.color && r.busy && !r.light) r = readability(st, 4.5, true)
    if (r.alpha > 0.02) ops.push(scrimGrad('bottom', S, blockTop - 160, r.scrim, r.alpha))
    ops.push({ t: 'rect', x: M, y: blockTop, w: 64, h: 9, fill: D.accent ?? vivid(A, r.light ? 0.6 : 0.45, r.fill) })
    if (a) ops.push(T(a.text, fa, a.size, M, aB, r.fill))
    if (y) ops.push(T(y.text, fy, y.size, M, yB, r.fill, { opacity: 0.85 }))
    why.push(`cover lines: noise ${st.std.toFixed(2)}`)
  }
  return { ops, why }
}

function cassette(A: Analysis, D: CaptionData, F: TitleFont): LayoutResult {
  const ops: DrawOp[] = [{ t: 'image', x: 0, y: 0, w: S, h: S }]
  const bg = D.accent ?? vivid(A, 0.42, bandColour(A.region(0, 0, 200, S))), ink = inkOn(bg, D)
  const W = 124, mid = (W - 14) / 2
  // the J-card spine: the title reading up from the bottom, the artist at the top end
  const sm = has(D.showArtist, D.artist) ? fitSmall(D.artist, SMALL, 22, 330) : null
  const st = has(D.showTitle, D.title) ? fitTitle(D.title, F, S - 2 * M - (sm ? sm.w + 48 : 0), 52, 22, { maxLines: 1, maxH: 46 }) : null
  ops.push({ t: 'rect', x: 0, y: 0, w: W, h: S, fill: bg })
  ops.push({ t: 'rect', x: W - 14, y: 0, w: 2, h: S, fill: ink, opacity: 0.22 })
  ops.push({ t: 'rect', x: W, y: 0, w: 3, h: S, fill: [0, 0, 0], opacity: 0.18 })
  if (st) ops.push(T(st.lines[0], F, st.size, mid + st.cap / 2, S - M, ink, { rot: -90 }))
  if (sm) ops.push(T(sm.text, SMALL, sm.size, mid + sm.cap / 2, M + sm.w, ink, { rot: -90, opacity: 0.78 }))
  // the cassette label: a coloured stripe (side A, the year), ruled paper with the title written on the lines
  const lx = W + 64, lw = S - lx - 64, padX = 28, stripe = 44
  let paper: RGB = [244, 238, 222]
  // a light text colour asked for: a dark label, or the writing would vanish
  if (D.color && contrastOf(paper, inkOn(paper, D)) < 3) paper = [34, 33, 38]
  const pen = inkOn(paper, D, [26, 38, 92])
  const t = has(D.showTitle, D.title) ? fitTitle(D.title, F, lw - 2 * padX, 70, 28, { maxH: 132 }) : null
  const gapL = t ? (t.lines.length > 1 ? t.base[1] - t.base[0] : t.size * F.lh * 1.1) : 56
  const rules: number[] = t ? t.base.map((b) => stripe + 22 + t.over + b) : [stripe + 60]
  rules.push(rules[rules.length - 1] + gapL)
  const lh = Math.round(rules[rules.length - 1] + 22), ly = S - 64 - lh
  ops.push({ t: 'rect', x: lx + 5, y: ly + 7, w: lw, h: lh, fill: [0, 0, 0], opacity: 0.3 })
  ops.push({ t: 'rect', x: lx, y: ly, w: lw, h: lh, fill: paper })
  ops.push({ t: 'rect', x: lx, y: ly, w: lw, h: stripe, fill: bg })
  const sideF: FontFaceSpec = { ...SMALL, weight: 800, ls: 0 }
  const side = fitSmall('A', sideF, 24, 60)
  ops.push({ t: 'frame', x: lx + 16, y: ly + (stripe - 32) / 2, w: 32, h: 32, stroke: ink, sw: 2, opacity: 0.85 })
  ops.push(T(side.text, sideF, side.size, lx + 16 + (32 - side.w) / 2, ly + stripe / 2 + side.cap / 2, ink))
  if (has(D.showYear, D.year)) { const y = fitSmall(D.year, SMALL_YEAR, 24, 260); ops.push(T(y.text, SMALL_YEAR, y.size, lx + lw - 18 - y.w, ly + stripe / 2 + y.cap / 2, ink, { opacity: 0.85 })) }
  for (const r of rules) ops.push({ t: 'rect', x: lx + 14, y: ly + r + 5, w: lw - 28, h: 2, fill: [98, 130, 178], opacity: 0.55 })
  if (t) t.lines.forEach((l, i) => ops.push(T(l, F, t.size, lx + padX, ly + rules[i], pen, { opacity: 0.94 })))
  return { ops, why: [`J-card spine + label, ${ink === WHITE ? 'light' : 'dark'} text on the spine (contrast ${contrastOf(bg, ink).toFixed(1)})`] }
}

function record(A: Analysis, D: CaptionData, F: TitleFont): LayoutResult {
  const all = A.region(0, 0, S, S)
  const bg = D.accent ?? bandColour(all), ink = inkOn(bg, D)
  const cx = 594, cy = 424, R = 330
  const ops: DrawOp[] = [{ t: 'rect', x: 0, y: 0, w: S, h: S, fill: bg }]
  ops.push({ t: 'circle', cx, cy, r: R, fill: [14, 14, 14], shadow: true })
  ops.push({ t: 'imgcircle', cx, cy, r: R })
  // grooves, the black rim, the label's edge and the spindle hole
  for (let rr = R * 0.4; rr < R * 0.95; rr += 9) ops.push({ t: 'circle', cx, cy, r: +rr.toFixed(1), stroke: [0, 0, 0], sw: 1.4, opacity: 0.16 })
  ops.push({ t: 'circle', cx, cy, r: R - 6, stroke: [10, 10, 10], sw: 12, opacity: 0.9 })
  ops.push({ t: 'circle', cx, cy, r: R * 0.34, stroke: [255, 255, 255], sw: 2, opacity: 0.4 })
  ops.push({ t: 'circle', cx, cy, r: 13, fill: bg })
  // the artist and year at the top left, clear of the disc; the title along the bottom
  const a = has(D.showArtist, D.artist) ? fitSmall(D.artist, SMALL, 26, 400) : null
  const y = has(D.showYear, D.year) ? fitSmall(D.year, SMALL_YEAR, 24, 300) : null
  let top = M
  if (a) { ops.push(T(a.text, SMALL, a.size, M, top + a.cap, ink)); top += a.cap + 20 }
  if (y) ops.push(T(y.text, SMALL_YEAR, y.size, M, top + y.cap, ink, { opacity: 0.7 }))
  if (has(D.showTitle, D.title)) {
    const tTop = cy + R + 50
    const t = fitTitle(D.title, F, S - 2 * M, 120, 36, { maxH: S - 60 - tTop })
    const y0 = S - 60 - t.height
    t.lines.forEach((l, i) => ops.push(T(l, F, t.size, M, y0 + t.base[i], ink)))
  }
  return { ops, why: [`sleeve in the picture's colour, ${ink === WHITE ? 'light' : 'dark'} text (contrast ${contrastOf(bg, ink).toFixed(1)})`] }
}

function swiss(A: Analysis, D: CaptionData, F: TitleFont): LayoutResult {
  const ops: DrawOp[] = [{ t: 'image', x: 0, y: 0, w: S, h: S }]
  const block = D.accent ?? vivid(A, 0.5, [214, 40, 30]), ink = inkOn(block, D)
  const BW = 640, pad = 48
  const SF: TitleFont = { ...F, ls: F.ls - 0.015 }
  const t = has(D.showTitle, D.title) ? fitTitle(D.title, SF, BW - 2 * pad, 132, 34, { maxH: 250 }) : null
  const fa: FontFaceSpec = { ...SMALL, ls: 0.14 }, fy: FontFaceSpec = { ...SMALL_YEAR, ls: 0.1 }
  const col2 = Math.round(BW * 0.64)
  const y = has(D.showYear, D.year) ? fitSmall(D.year, fy, 22, BW - pad - col2) : null
  const a = has(D.showArtist, D.artist) ? fitSmall(D.artist, fa, 22, (y ? col2 - 24 : BW - pad) - pad) : null
  if (!t && !a && !y) return { ops, why: [] }
  const smallCap = capRatio(SMALL) * 22
  const content = 40 + (t ? t.over + t.height + t.size * 0.2 + 36 : 0) + (a || y ? 2 + 24 + smallCap : 0) + pad
  const h = Math.round(Math.max(t ? 330 : 200, content)), y0 = S - h
  ops.push({ t: 'rect', x: 0, y: y0, w: BW, h, fill: block })
  ops.push({ t: 'rect', x: BW, y: y0, w: S - BW, h: 4, fill: block }) // the block's top edge runs on as a rule
  if (t) t.lines.forEach((l, i) => ops.push(T(l, SF, t.size, pad - 3, y0 + 40 + t.over + t.base[i], ink)))
  if (a || y) {
    const base = S - pad
    ops.push({ t: 'rect', x: pad, y: base - smallCap - 24, w: BW - 2 * pad, h: 2, fill: ink, opacity: 0.9 })
    if (a) ops.push(T(a.text, fa, a.size, pad, base, ink))
    if (y) ops.push(T(y.text, fy, y.size, a ? col2 : pad, base, ink, { opacity: 0.85 }))
  }
  return { ops, why: [`block ${BW}x${h}, ${ink === WHITE ? 'light' : 'dark'} text (contrast ${contrastOf(block, ink).toFixed(1)})`] }
}

function neon(A: Analysis, D: CaptionData, F: TitleFont): LayoutResult {
  const ops: DrawOp[] = [{ t: 'image', x: 0, y: 0, w: S, h: S }]
  const tube = D.accent ?? vivid(A, 0.6, hsl2rgb(0.88, 1, 0.62))
  const [th, ts] = rgb2hsl(...tube)
  const glowC = hsl2rgb(th, Math.max(ts, 0.85), 0.55)
  // a dark core is not a lit tube: 'dark' keeps the automatic near-white core (the tube colour is the accent)
  const core: RGB = D.color === 'light' ? WHITE : D.color && D.color !== 'dark' ? D.color : mix(tube, WHITE, 0.72)
  const halo = mix(tube, WHITE, 0.3)
  const fa: FontFaceSpec = { ...SMALL, ls: 0.34 }, fy: FontFaceSpec = { ...SMALL_YEAR, ls: 0.3 }
  const t = has(D.showTitle, D.title) ? fitTitle(D.title, F, S - 2 * 120, 170, 50, { maxH: 380 }) : null
  const a = has(D.showArtist, D.artist) ? fitSmall(D.artist, fa, 26, S - 2 * 120) : null
  const y = has(D.showYear, D.year) ? fitSmall(D.year, fy, 26, 300) : null
  if (!t && !a && !y) return { ops, why: [] }
  const gapA = 58 + (t ? t.over : 0), gapY = 64
  const blockH = (a ? a.cap + gapA : 0) + (t ? t.height : 0) + (y ? gapY + y.cap : 0)
  let top = 500 - blockH / 2
  // the night: the whole picture darkened, the middle more, so the tubes glow whatever is under them
  const st = A.region(100, top - 40, S - 200, blockH + 80)
  const need = readability(st, 4.5, 'light').alpha
  const dark = Math.max(0.42, Math.min(0.72, need + 0.2))
  ops.push({ t: 'rect', x: 0, y: 0, w: S, h: S, fill: [0, 0, 0], opacity: +(dark * 0.55).toFixed(3) })
  ops.push({ t: 'radial', cx: 500, cy: 500, r: 700, colour: [0, 0, 0], a: dark })
  const tubeText = (text: string, f: FontFaceSpec, size: number, x: number, yy: number, thin: boolean): void => {
    const k = Math.max(0.5, size / 100)
    ops.push({ ...T(text, f, size, x, yy, glowC), glow: { r: (thin ? 10 : 30) * k, colour: glowC, a: 0.8 } })
    ops.push({ ...T(text, f, size, x, yy, halo), glow: { r: (thin ? 3 : 8) * k, colour: glowC, a: 0.95 } })
    ops.push({ ...T(text, f, size, x, yy, core), glow: { r: (thin ? 1 : 2) * k, colour: halo, a: 0.9 } })
  }
  if (a) { tubeText(a.text, fa, a.size, 500 - a.w / 2, top + a.cap, true); top += a.cap + gapA }
  if (t) { t.lines.forEach((l, i) => tubeText(l, F, t.size, 500 - t.widths[i] / 2, top + t.base[i], false)); top += t.height }
  if (y) { top += gapY; tubeText(y.text, fy, y.size, 500 - y.w / 2, top + y.cap, true) }
  return { ops, why: [`darkened ${dark.toFixed(2)}, tube ${tube.join(',')}`] }
}

function tape(A: Analysis, D: CaptionData, F: TitleFont): LayoutResult {
  const ops: DrawOp[] = [{ t: 'image', x: 0, y: 0, w: S, h: S }]
  const why: string[] = []
  const rnd = rng('tape|' + D.title)
  const rot = (rnd() < 0.5 ? -1 : 1) * (5 + rnd() * 2.5)
  const paper = D.accent ?? ([234, 224, 194] as RGB), ink = inkOn(paper, D)
  const t = has(D.showTitle, D.title) ? fitTitle(D.title, F, 760, 108, 34, { maxH: 200 }) : null
  // the tape over the quietest band (the busy part is usually what the picture is of)
  let cy = 560, h = 0
  if (t) {
    const pad = Math.max(30, t.size * 0.4)
    h = Math.round(t.over + t.height + 2 * pad + t.size * 0.1)
    cy = [560, 420, 690, 320].map((c) => ({ c, s: A.region(0, c - h / 2, S, h).std - (c === 560 ? 0.015 : 0) })).sort((p, q) => p.s - q.s)[0].c
    const y0 = cy - h / 2
    const edge = mix(paper, [0, 0, 0], 0.28)
    const kids: DrawOp[] = [
      { t: 'rect', x: -300, y: y0 + 6, w: 1600, h, fill: [0, 0, 0], opacity: 0.22 },
      { t: 'rect', x: -300, y: y0, w: 1600, h, fill: paper, opacity: 0.9 },
      { t: 'rect', x: -300, y: y0 + 3, w: 1600, h: Math.round(h * 0.22), fill: WHITE, opacity: 0.1 },
      { t: 'rect', x: -300, y: y0, w: 1600, h: 3, fill: edge, opacity: 0.45 },
      { t: 'rect', x: -300, y: y0 + h - 3, w: 1600, h: 3, fill: edge, opacity: 0.45 },
    ]
    // caps-to-last-baseline centred on the tape, nudged down by half of the marks above the caps
    const top = cy - t.height / 2 + t.over / 2 + t.size * 0.03
    t.lines.forEach((l, i) => kids.push(T(l, F, t.size, 500 - t.widths[i] / 2, top + t.base[i], ink)))
    ops.push({ t: 'group', rot, cx: 500, cy, children: kids })
    why.push(`tape at ${cy}, ${rot.toFixed(1)} degrees`)
  }
  // the artist and year small in the quietest corner the tape leaves free
  const reach = h / 2 + 80
  const cs = cornerSmall(A, D, (top, bh) => !t || top + bh < cy - reach || top > cy + reach)
  if (cs) { ops.push(...cs.ops); why.push(cs.why) }
  return { ops, why }
}

function stamp(A: Analysis, D: CaptionData, F: TitleFont): LayoutResult {
  const ops: DrawOp[] = [{ t: 'image', x: 0, y: 0, w: S, h: S }]
  const rnd = rng('stamp|' + D.title + '|' + D.artist)
  const inkC = D.accent ?? vivid(A, 0.4, [192, 34, 40])
  const txt = D.color === 'light' ? WHITE : D.color === 'dark' ? INK : D.color ?? inkC
  const SF: TitleFont = { ...F, upper: true, ls: Math.max(F.ls, 0.02) }
  const fa: FontFaceSpec = { ...SMALL, weight: 800, ls: 0.3 }, fy: FontFaceSpec = { ...SMALL_YEAR, weight: 700, ls: 0.3 }
  const t = has(D.showTitle, D.title) ? fitTitle(D.title, SF, 400, 76, 26, { maxH: 140 }) : null
  const a = has(D.showArtist, D.artist) ? fitSmall(D.artist, fa, 20, 380) : null
  const y = has(D.showYear, D.year) ? fitSmall(D.year, fy, 21, 260) : null
  if (!t && !a && !y) return { ops, why: [] }
  // the stamp's face, from the top: artist, rule, title, rule, year
  const inset = 14, padX = 32, padY = 28, gap = 18
  const parts: { h: number; draw: (top: number, cx: number, out: DrawOp[]) => void }[] = []
  const ruleW = (w: number): number => w - 2 * inset - 2 * padX + 30
  let innerW = Math.max(t ? Math.max(...t.widths) : 0, a ? a.w : 0, y ? y.w : 0)
  innerW = Math.max(innerW, 220)
  const W = innerW + 2 * padX + 2 * inset
  const rule = (out: DrawOp[], yy: number, cx: number): void => { out.push({ t: 'rect', x: cx - ruleW(W) / 2, y: yy, w: ruleW(W), h: 3, fill: inkC, opacity: +(0.88 + 0.12 * rnd()).toFixed(3) }) }
  if (a) parts.push({ h: a.cap, draw: (top, cx, out) => out.push(...inkLetters(a.text, fa, a.size, cx - a.w / 2, top + a.cap, txt, rnd, 0.9)) })
  if (a && t) parts.push({ h: 3 + 2 * gap, draw: (top, cx, out) => rule(out, top + gap, cx) })
  if (t) parts.push({ h: t.over + t.height, draw: (top, cx, out) => t.lines.forEach((l, i) => out.push(...inkLetters(l, SF, t.size, cx - t.widths[i] / 2, top + t.over + t.base[i], txt, rnd, 0.9))) })
  if (y && (t || a)) parts.push({ h: 3 + 2 * gap + (t ? t.size * 0.08 : 0), draw: (top, cx, out) => rule(out, top + gap + (t ? t.size * 0.08 : 0), cx) })
  if (y) parts.push({ h: y.cap, draw: (top, cx, out) => out.push(...inkLetters(y.text, fy, y.size, cx - y.w / 2, top + y.cap, txt, rnd, 0.9)) })
  const H = parts.reduce((s, p) => s + p.h, 0) + 2 * padY + 2 * inset
  // where: the calmest of nine spots (corners, edges, middle), clear of the edges even when tilted; the busy part
  // is usually what the picture is of, so the stamp keeps off it (and off the centre lines, where a subject sits)
  const e = 40
  const xs = [M + e + W / 2, 500, S - M - e - W / 2], ys = [M + e + H / 2, 500, S - M - e - H / 2]
  const spots = xs.flatMap((cx) => ys.map((cy) => ({ cx: Math.round(cx), cy: Math.round(cy), st: A.region(cx - W / 2, cy - H / 2, W, H) })))
  const sp = spots.map((p) => ({ ...p, score: p.st.std + (p.cx === 500 ? 0.02 : 0) + (p.cy === 500 ? 0.02 : 0) })).sort((p, q) => p.score - q.score)[0]
  const rot = (rnd() < 0.5 ? -1 : 1) * (5 + rnd() * 6)
  const x0 = sp.cx - W / 2, y0 = sp.cy - H / 2
  const kids: DrawOp[] = []
  // a veil inside the stamp where the picture would swallow the ink
  // (the letters' faintest ink is 0.9: the veil is sized so even that passes 4.5:1)
  const rv = readabilityWith(sp.st, 4.5 / 0.9, txt)
  const veil = rv.alpha > 0.02 ? Math.max(rv.busy ? 0.82 : 0.6, Math.min(0.94, rv.alpha * 1.3)) : 0
  if (veil) kids.push({ t: 'rect', x: x0, y: y0, w: W, h: H, fill: rv.light ? [0, 0, 0] : [250, 246, 238], opacity: +veil.toFixed(3) })
  // the double border, each side in pieces of slightly different ink
  const border = (x: number, y: number, w: number, h: number, sw: number): void => {
    const seg = (sx: number, sy: number, sw2: number, sh: number, n: number, horiz: boolean): void => {
      for (let i = 0; i < n; i++) {
        const o = +(0.82 + 0.18 * rnd()).toFixed(3)
        if (horiz) kids.push({ t: 'rect', x: sx + (sw2 * i) / n, y: sy, w: sw2 / n, h: sh, fill: inkC, opacity: o })
        else kids.push({ t: 'rect', x: sx, y: sy + (sh * i) / n, w: sw2, h: sh / n, fill: inkC, opacity: o })
      }
    }
    seg(x, y, w, sw, 4, true)
    seg(x, y + h - sw, w, sw, 4, true)
    seg(x, y + sw, sw, h - 2 * sw, 2, false)
    seg(x + w - sw, y + sw, sw, h - 2 * sw, 2, false)
  }
  border(x0, y0, W, H, 9)
  border(x0 + inset, y0 + inset, W - 2 * inset, H - 2 * inset, 3)
  let top = y0 + inset + padY
  for (const p of parts) { p.draw(top, sp.cx, kids); top += p.h }
  ops.push({ t: 'group', rot, cx: sp.cx, cy: sp.cy, children: kids })
  return { ops, why: [`stamp at ${sp.cx},${sp.cy}, ${rot.toFixed(1)} degrees${veil ? ', veil ' + veil.toFixed(2) : ''}`] }
}

function credits(_A: Analysis, D: CaptionData, F: TitleFont): LayoutResult {
  const ops: DrawOp[] = [{ t: 'image', x: 0, y: 0, w: S, h: S }]
  const bar = D.accent ?? ([7, 7, 9] as RGB), ink = inkOn(bar, D)
  const fa: FontFaceSpec = { ...SMALL, weight: 600, ls: 0.42 }, fy: FontFaceSpec = { ...SMALL_YEAR, weight: 500, ls: 0.42 }
  const TF: TitleFont = { ...F, upper: F.family !== 'Caveat', ls: F.ls + (F.family === 'Press Start 2P' ? 0.06 : 0.14) }
  const a = has(D.showArtist, D.artist) ? fitSmall(D.artist, fa, 20, 760) : null
  const y = has(D.showYear, D.year) ? fitSmall(D.year, fy, 19, 300) : null
  const gap = 30
  const smallH = (a ? a.cap + gap : 0) + (y ? gap + y.cap : 0)
  // Press Start 2P is drawn at 0.6 of the size (its scale): its own, larger range so the title is not tiny
  const px = F.family === 'Press Start 2P'
  const t = has(D.showTitle, D.title) ? fitTitle(D.title, TF, 820, px ? 80 : 60, px ? 44 : 26, { maxH: 300 - 2 * 50 - smallH }) : null
  // the lines, top to bottom, each with its height; one gap between neighbours
  const rows: { h: number; after?: number; draw: (top: number) => void }[] = []
  if (a) rows.push({ h: a.cap, draw: (top) => ops.push(T(a.text, fa, a.size, 500 - a.w / 2, top + a.cap, ink, { opacity: 0.72 })) })
  if (t) rows.push({ h: t.over + t.height, after: t.size * 0.1, draw: (top) => t.lines.forEach((l, i) => ops.push(T(l, TF, t.size, 500 - t.widths[i] / 2, top + t.over + t.base[i], ink))) })
  if (y) rows.push({ h: y.cap, draw: (top) => ops.push(T(y.text, fy, y.size, 500 - y.w / 2, top + y.cap, ink, { opacity: 0.6 })) })
  const blockH = rows.reduce((s, r) => s + r.h, 0) + gap * Math.max(0, rows.length - 1) + (t && y ? t.size * 0.1 : 0) // room for descenders
  // the letterbox: the same bar above and below, tall enough for the credits
  const BH = Math.round(Math.max(210, Math.min(300, blockH + 2 * 56)))
  ops.push({ t: 'rect', x: 0, y: 0, w: S, h: BH, fill: bar })
  ops.push({ t: 'rect', x: 0, y: S - BH, w: S, h: BH, fill: bar })
  let top = S - BH + (BH - blockH) / 2
  for (const r of rows) { r.draw(top); top += r.h + gap + (r.after ?? 0) }
  return { ops, why: [`letterbox ${BH} tall bars`] }
}

export const LAYOUT_FN: Record<CaptionLayout, LayoutFn> = {
  classic, band, frame, spine, poster, sticker, minimal,
  magazine, cassette, record, swiss, neon, tape, stamp, credits,
}
