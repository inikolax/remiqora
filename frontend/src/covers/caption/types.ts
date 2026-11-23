// Captions drawn over album covers: the artist, the title and the year, laid out on a 1000x1000 grid. The model
// never writes text into a picture; the browser draws it, so it is always sharp and spelled right.

export type CaptionLayout =
  | 'classic' | 'band' | 'frame' | 'spine' | 'poster' | 'sticker' | 'minimal'
  | 'magazine' | 'cassette' | 'record' | 'swiss' | 'neon' | 'tape' | 'stamp' | 'credits'
export type CaptionFont = 'unbounded' | 'oswald' | 'playfair' | 'cormorant' | 'rubik' | 'caveat' | 'pixel' | 'manrope'

/** All layout ids in the order the UI lists them (the first seven are the original set). */
export const LAYOUT_IDS: CaptionLayout[] = [
  'classic', 'band', 'frame', 'spine', 'poster', 'sticker', 'minimal',
  'magazine', 'cassette', 'record', 'swiss', 'neon', 'tape', 'stamp', 'credits',
]
/** The same list (the older name). */
export const LAYOUTS: CaptionLayout[] = LAYOUT_IDS
export const FONT_KEYS: CaptionFont[] = ['unbounded', 'oswald', 'playfair', 'cormorant', 'rubik', 'caveat', 'pixel', 'manrope']

/**
 * A track's caption as the server keeps it (Track.cover_caption). An absent text means "the default": the artist
 * from the settings, the track's title, the year it was made. An empty string is the same as absent.
 */
export interface CoverCaption {
  layout: CaptionLayout
  font: CaptionFont
  showArtist: boolean
  showTitle: boolean
  showYear: boolean
  artist?: string
  title?: string
  year?: string
  /** Text colour: 'auto' or absent = chosen from the picture (as before); 'light' / 'dark' = white / ink with the
   *  scrim the picture needs for it; '#rrggbb' = that colour. */
  color?: 'auto' | 'light' | 'dark' | string
  /** '#rrggbb' for bands, spines, stickers, blocks and glows; absent = from the picture. */
  accent?: string
}

/** The texts a caption draws, defaults filled in. */
export interface CaptionText {
  artist: string
  title: string
  year: string
}

/** The lines on and their texts: what a layout draws. */
export interface CaptionData extends CaptionText {
  showArtist: boolean
  showTitle: boolean
  showYear: boolean
  /** The colour overrides, parsed: absent = automatic. */
  color?: 'light' | 'dark' | RGB
  accent?: RGB
}

export type RGB = [number, number, number]

/** A font face as the layouts use it: ls = letter-spacing in em, lh = line height, scale = optical size factor. */
export interface FontFaceSpec {
  family: string
  weight: number
  style: 'normal' | 'italic'
  ls: number
  upper: boolean
  /** Extra word spacing in em (added to each space): monospaced faces whose space is a whole letter cell. */
  ws?: number
  lh?: number
  scale?: number
}

// ---- draw steps: what a layout returns, what both renderers draw ----
export interface ImageOp { t: 'image'; x: number; y: number; w: number; h: number }
export interface RectOp { t: 'rect'; x: number; y: number; w: number; h: number; fill: RGB; opacity?: number }
/** A linear fade from an edge: full at `from`, gone at `to`. */
export interface GradOp { t: 'grad'; edge: 'top' | 'bottom' | 'left'; from: number; to: number; colour: RGB; a: number }
export interface RadialOp { t: 'radial'; cx: number; cy: number; r: number; colour: RGB; a: number }
export interface CircleOp { t: 'circle'; cx: number; cy: number; r: number; fill?: RGB; stroke?: RGB; sw?: number; opacity?: number; shadow?: boolean }
export interface GroupOp { t: 'group'; rot: number; cx: number; cy: number; children: DrawOp[] }
/** translate(x,y) rotate(rot), then the text at (dx,0): alphabetic baseline, start anchor. */
export interface TextOp {
  t: 'text'; text: string; f: FontFaceSpec; size: number; x: number; y: number; fill: RGB; rot: number; dx: number; opacity: number; ls: number
  /** Outline instead of (or under, with `fill`) the fill. */
  stroke?: RGB; sw?: number; noFill?: boolean
  /** A glow behind: blur radius in layout units and its colour (SVG feGaussianBlur / canvas shadowBlur). */
  glow?: { r: number; colour: RGB; a: number }
}
/** A filled polygon (points on the grid), optionally stroked. */
export interface PolyOp { t: 'poly'; pts: [number, number][]; fill?: RGB; stroke?: RGB; sw?: number; opacity?: number }
/** The cover image clipped to a circle: the cover's centre square scaled to the circle's diameter. */
export interface ImageCircleOp { t: 'imgcircle'; cx: number; cy: number; r: number }
/** A rectangle outline. */
export interface FrameOp { t: 'frame'; x: number; y: number; w: number; h: number; stroke: RGB; sw: number; opacity?: number; rx?: number }
export type DrawOp = ImageOp | RectOp | GradOp | RadialOp | CircleOp | GroupOp | TextOp | PolyOp | ImageCircleOp | FrameOp
