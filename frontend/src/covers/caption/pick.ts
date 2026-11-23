// "Pick for me": a title font from the track's genre, a layout from what the cover looks like where the text
// would go (and how loud the genre is; the styled layouts also from the genre itself).
import { M, S, rgb2hsl } from './analyse'
import type { Analysis } from './analyse'
import type { CaptionFont, CaptionLayout } from './types'

/** Genre words (any case, English and Russian) -> title font. A word matches at the start of a word ("rock" in
 *  "rock-n-roll"); a trailing $ asks for the whole word ("emo", not "emotional"). The word met first wins. */
const GENRE_WORDS: [CaptionFont, string[]][] = [
  ['pixel', ['chiptune', 'chip tune', '8-bit', '8 bit', '8bit', '16-bit', '16bit', 'bitpop', 'video game', 'videogame', 'game music', 'retro game', 'arcade', 'nes$', 'gameboy', 'game boy', 'чиптюн', '8-бит', '8 бит', 'ретро-игр', 'видеоигр', 'аркад']],
  ['oswald', ['rock', 'metal', 'punk', 'grunge', 'hardcore', 'emo$', 'industrial', 'post-rock', 'stoner', 'рок', 'метал', 'панк', 'гранж']],
  ['rubik', ['brass', 'funk', 'hip hop', 'hip-hop', 'hiphop', 'rap$', 'trap', 'drill', 'phonk', 'ska$', 'big band', 'grime', 'crunk', 'рэп', 'хип-хоп', 'хипхоп', 'фанк', 'трэп', 'духов', 'ска$']],
  ['caveat', ['acoustic', 'folk', 'cozy', 'lo-fi', 'lofi', 'lullaby', 'singer-songwriter', 'country', 'bluegrass', 'children', 'kids', 'campfire', 'акуст', 'фолк', 'колыбель', 'бард', 'кантри', 'детск', 'уютн']],
  ['cormorant', ['tango', 'classical', 'baroque', 'opera', 'orchestral', 'chamber', 'waltz', 'romance', 'chanson', 'requiem', 'танго', 'классич', 'барокко', 'опер', 'оркестр', 'вальс', 'романс', 'шансон']],
  ['playfair', ['r&b', 'rnb', 'soul', 'jazz', 'blues', 'bossa', 'lounge', 'swing', 'motown', 'gospel', 'джаз', 'блюз', 'соул', 'свинг', 'босса']],
  ['unbounded', ['pop', 'dance', 'edm', 'house', 'techno', 'trance', 'synth', 'electro', 'disco', 'dubstep', 'drum and bass', 'dnb', 'eurodance', 'hyperpop', 'поп', 'электро', 'танц', 'диско', 'техно', 'хаус', 'транс']],
  ['manrope', ['ambient', 'minimal', 'cinematic', 'soundtrack', 'score', 'meditat', 'эмбиент', 'саундтрек', 'медитат']],
]
const ENERGETIC: CaptionFont[] = ['oswald', 'rubik', 'unbounded', 'pixel']
const SOFT: CaptionFont[] = ['caveat', 'playfair', 'cormorant']

/** Genre words -> the layout that suits them (the same matching rules). Only the styled layouts are tied to
 *  genres; the plain ones are chosen by the picture alone. */
const LAYOUT_WORDS: [CaptionLayout, string[]][] = [
  ['neon', ['synthwave', 'synth-wave', 'retrowave', 'outrun', 'vaporwave', 'darksynth', 'cyberpunk', 'electro', 'synthpop', 'synth-pop', 'italo', 'синтвейв', 'ретровейв', 'электро', 'синти-поп', 'киберпанк']],
  ['credits', ['film score', 'score$', 'soundtrack', 'cinematic', 'ambient', 'trailer', 'orchestral', 'drone', 'саундтрек', 'кинематограф', 'эмбиент', 'оркестр', 'трейлер']],
  ['stamp', ['punk', 'hardcore', 'grunge', 'oi$', 'crust', 'thrash', 'панк', 'хардкор', 'гранж', 'трэш']],
  ['tape', ['garage', 'noise', 'riot', 'industrial', 'diy', 'emo$', 'screamo', 'гараж', 'нойз', 'индастриал']],
  ['record', ['jazz', 'soul', 'funk', 'blues', 'motown', 'disco', 'r&b', 'rnb', 'gospel', 'bossa', 'swing', 'doo-wop', 'джаз', 'соул', 'фанк', 'блюз', 'диско', 'свинг', 'босса']],
  ['swiss', ['techno', 'minimal', 'idm', 'electronica', 'krautrock', 'house', 'glitch', 'техно', 'минимал', 'хаус']],
  ['cassette', ['lo-fi', 'lofi', 'lo fi', 'indie', 'bedroom', 'chillhop', 'tape', 'cassette', 'demo$', 'dream pop', 'инди', 'лоу-фай', 'лофай', 'кассет']],
  ['magazine', ['pop', 'k-pop', 'j-pop', 'kpop', 'hyperpop', 'dance-pop', 'поп']],
]

const escRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const wordRe = (w: string): RegExp => {
  const whole = w.endsWith('$')
  return new RegExp(`(?<![\\p{L}\\p{N}])${escRe(whole ? w.slice(0, -1) : w)}${whole ? '(?![\\p{L}])' : ''}`, 'iu')
}
/** The entry whose word comes first in the text, or `def`. */
function firstMatch<K>(table: [K, RegExp][], style: string, def: K): K {
  const s = style || ''
  let best = def
  let at = Infinity
  for (const [k, re] of table) {
    const i = s.search(re)
    if (i !== -1 && i < at) { at = i; best = k }
  }
  return best
}
const GENRE_RE: [CaptionFont, RegExp][] = GENRE_WORDS.flatMap(([font, words]) => words.map((w): [CaptionFont, RegExp] => [font, wordRe(w)]))
const LAYOUT_RE: [CaptionLayout | null, RegExp][] = LAYOUT_WORDS.flatMap(([l, words]) => words.map((w): [CaptionLayout, RegExp] => [l, wordRe(w)]))

/** The title font for a style text ("dark synthwave, 80s, female vocal"); Unbounded when nothing matches. */
export function fontForGenre(style: string): CaptionFont {
  return firstMatch<CaptionFont>(GENRE_RE, style, 'unbounded')
}

/** layoutForGenre(style: string): CaptionLayout | null - the layout a style text suggests ("dark synthwave, 80s"
 *  -> 'neon'); null when no genre word matches. */
export function layoutForGenre(style: string): CaptionLayout | null {
  return firstMatch<CaptionLayout | null>(LAYOUT_RE, style, null)
}
/** How much the genre's layout is preferred over the picture's own best fit. */
const GENRE_BONUS = 0.4

/** Each layout's fit for this cover, higher is better; `style` (the track's style text) gives the layout its genre
 *  suggests a bonus. */
export function layoutScores(A: Analysis, font: CaptionFont, style = ''): Record<CaptionLayout, number> {
  const bottom = A.region(0, 700, S, 300), centre = A.region(150, 320, 700, 360), left = A.region(0, 0, 200, S), all = A.region(0, 0, S, S)
  const corner = Math.min(...[[0, 0], [S - 400, 0], [0, S - 400], [S - 400, S - 400]].map(([x, y]) => A.region(x, y, 400, 400).std))
  const minimalSpot = Math.min(A.region(0, S - M - 100, S, M + 100).std, A.region(0, 0, S, M + 100).std)
  const top = A.region(0, 0, S, 330), mid = A.region(0, 330, S, 340), swissSpot = A.region(0, 620, 640, 380)
  const bars = (A.region(0, 0, S, 240).std + A.region(0, S - 240, S, 240).std) / 2
  const energetic = ENERGETIC.includes(font), soft = SOFT.includes(font)
  const dark = Math.max(0, 0.38 - all.mean), vivid = all.accentSat > 0.45 ? 1 : 0
  // a dark picture whose strongest colour is a deep brown is lamp- or candle-lit (moody: credits), one lit in
  // magenta, blue or bright orange is a night of coloured lights (neon)
  const [ah, , al] = rgb2hsl(...all.accent)
  const lamplit = dark > 0 && ah > 0.02 && ah < 0.13 && al < 0.3 ? 1 : 0, lit = dark > 0 && !lamplit ? 1 : 0
  const sc: Record<CaptionLayout, number> = {
    classic: 1 - bottom.std * 3,
    poster: 1 - centre.std * 3 + (energetic ? 0.2 : 0),
    band: bottom.std * 2.2 + 0.2,
    frame: all.std * 2 + (soft ? 0.3 : 0),
    spine: 1 - left.std * 3 - 0.05,
    // a corner badge: good on a quiet corner, but not the answer to every cover
    sticker: 0.9 - corner * 3 + (energetic ? 0.12 : 0),
    minimal: 1 - minimalSpot * 4 - (energetic ? 0.3 : 0),
    magazine: 1.12 - top.std * 3.5 + (energetic ? 0.05 : 0), // a calm sky for the masthead
    cassette: 0.25 + bottom.std * 1.6 + (soft ? 0.12 : 0), // an opaque label over a busy bottom
    record: 0.42 + Math.min(0.25, all.std) * 1.2 + (soft ? 0.1 : 0) - dark * 0.5, // busy art reads well as a disc
    swiss: 0.3 + swissSpot.std * 1.6 + vivid * 0.1, // a solid block over a busy, colourful corner
    neon: 0.3 + dark * 2.4 + (all.accentSat - 0.45) * 1.6 + lit * 0.08 - lamplit * 0.15 - (soft ? 0.08 : 0), // night, coloured lights
    tape: 0.2 + mid.std * 1.5 + (energetic ? 0.08 : 0),
    stamp: 0.1 + all.mean * 0.5 + (energetic ? 0.12 : 0), // ink reads best on light pictures
    credits: 0.8 - bars * 2.6 + dark * 1.8 + lamplit * 0.08, // quiet edges, moody lamp-lit pictures
  }
  const g = layoutForGenre(style)
  // every styled layout reads on any picture (they bring their own scrims, blocks and labels): the genre's layout
  // wins unless the picture plainly fits it badly, and then it still stands near the top
  if (g) sc[g] = Math.max(sc[g] + GENRE_BONUS, Math.max(...Object.values(sc)) + (sc[g] > 0.25 ? 0.02 : -0.05))
  return sc
}

/** The best layout for one cover (and, when given, the track's style text). */
export function pickLayout(A: Analysis, font: CaptionFont, style = ''): CaptionLayout {
  const sc = layoutScores(A, font, style)
  return (Object.keys(sc) as CaptionLayout[]).sort((a, b) => sc[b] - sc[a])[0]
}

/** Layouts for several covers: the best fits first, each layout once until all are used (an album page where
 *  every cover is captioned differently, but each in what suits it). */
export function pickLayouts(items: { A: Analysis; font: CaptionFont; style?: string }[]): CaptionLayout[] {
  const out: (CaptionLayout | null)[] = items.map(() => null)
  const scores = items.map((it) => layoutScores(it.A, it.font, it.style))
  let left = items.map((_, i) => i)
  while (left.length) {
    const pairs: [number, number, CaptionLayout][] = []
    for (const i of left) for (const l of Object.keys(scores[i]) as CaptionLayout[]) pairs.push([scores[i][l], i, l])
    pairs.sort((a, b) => b[0] - a[0])
    const used = new Set<CaptionLayout>()
    for (const [, i, l] of pairs) {
      if (out[i] || used.has(l)) continue
      out[i] = l
      used.add(l)
    }
    left = left.filter((i) => !out[i])
  }
  return out as CaptionLayout[]
}
