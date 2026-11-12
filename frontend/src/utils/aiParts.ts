import { clipBuffer } from '../audio/timelineTypes'
import type { TimelineProject } from '../audio/timelineTypes'
import { encodeWav } from '../audio/wavEncoder'
import { getSharedAudioCtx } from '../composables/audioPlayback'
import type { ModelId } from '../types'

/**
 * lego = add a part over the chosen lanes; repaint = redo a selected range; continue = extend past a
 * point; cover = a new version of a range in another style.
 */
export const AI_MODES = ['lego', 'repaint', 'continue', 'cover'] as const
export type AiMode = (typeof AI_MODES)[number]

/** ACE-Step task type a mode needs from the model (`supported_task_types` in the model inventory). */
export const AI_MODE_TASK: Record<AiMode, string> = { lego: 'lego', repaint: 'repaint', continue: 'repaint', cover: 'cover' }

/** Part classes ACE-Step's lego task was trained on (acestep/constants.py TRACK_NAMES). */
export const AI_TRACKS = [
  'drums', 'bass', 'guitar', 'keyboard', 'synth', 'strings',
  'brass', 'woodwinds', 'percussion', 'fx', 'vocals', 'backing_vocals',
] as const
export type AiTrack = (typeof AI_TRACKS)[number]

/** Lane color (utils/trackColors id) for each part class. */
export const AI_TRACK_COLOR: Record<AiTrack, string> = {
  drums: 'orange', bass: 'blue', guitar: 'red', keyboard: 'yellow', synth: 'purple', strings: 'emerald',
  brass: 'yellow', woodwinds: 'green', percussion: 'cyan', fx: 'slate', vocals: 'pink', backing_vocals: 'pink',
}

export const VOCAL_TRACKS: ReadonlySet<AiTrack> = new Set(['vocals', 'backing_vocals'])

/** ACE-Step 1.5 renders at most 600 s per task. */
export const MAX_CONTEXT_SEC = 600

/**
 * Which engine renders a job: ACE-Step (every mode) or Stable Audio 3, whose inpainting and
 * audio-to-audio cover repaint, continue and cover; it cannot write a part over a mix (lego).
 */
export const AI_ENGINES = ['ace', 'sa3'] as const
export type AiEngine = (typeof AI_ENGINES)[number]
export const ENGINE_MODES: Record<AiEngine, readonly AiMode[]> = { ace: AI_MODES, sa3: ['repaint', 'continue', 'cover'] }
/** The longest audio each engine takes in one task (Stable Audio 3 medium: 380 s). */
export const ENGINE_MAX_CONTEXT_SEC: Record<AiEngine, number> = { ace: MAX_CONTEXT_SEC, sa3: 380 }
/** The orchestrator's model id behind each engine. */
export const ENGINE_MODEL_ID: Record<AiEngine, ModelId> = { ace: 'ace_step', sa3: 'stable_audio' }
/** Stable Audio 3 checkpoints the arranger may pick, with the ones it prefers first. */
export const SA3_ARRANGER_MODELS = ['medium', 'small-music', 'small-sfx'] as const

/** One value of the "engine · model" select: `ace:acestep-v15-turbo`, `sa3:medium`. */
export function modelKey(engine: AiEngine, model: string): string {
  return `${engine}:${model}`
}
export function parseModelKey(key: string): { engine: AiEngine; model: string } {
  const i = key.indexOf(':')
  const engine = (i > 0 ? key.slice(0, i) : 'ace') as AiEngine
  return { engine: AI_ENGINES.includes(engine) ? engine : 'ace', model: i > 0 ? key.slice(i + 1) : key }
}

/** The mixed context and the gain applied to bring its peak to 0.9 (1 when it was silent). */
export interface RenderedContext {
  buffer: AudioBuffer
  gain: number
}

/**
 * Mixes the chosen lanes between `start` and `end` into the audio the model hears as context.
 * Mixed straight from the clip buffers (lane volume, clip fades and warp as the engine plays them),
 * not through the effect graph: its compressors and limiter delay the signal by ~18 ms, and the model
 * writes its part in time with what it hears, so a delayed context would put the part late.
 * Lane mute/solo is ignored (the user picked the lanes explicitly); effects are left out.
 * The mix is normalised to a 0.9 peak so a quiet selection reaches the model at a usable level; the returned
 * `gain` lets the result be brought back to the timeline's level (variantVolume).
 */
export function renderContext(
  project: TimelineProject,
  buffers: Map<string, AudioBuffer>,
  laneIds: string[],
  start: number,
  end: number,
): RenderedContext {
  const sampleRate = getSharedAudioCtx().sampleRate
  const frames = Math.max(1, Math.round((end - start) * sampleRate))
  const out = new AudioBuffer({ numberOfChannels: 2, length: frames, sampleRate })
  const outL = out.getChannelData(0)
  const outR = out.getChannelData(1)
  const bpm = project.bpm || 120
  for (const lane of project.lanes) {
    if (!laneIds.includes(lane.id)) continue
    const gain = lane.settings.volume ?? 1
    for (const clip of lane.clips) {
      if (clip.muted || clip.type === 'midi' || !clip.sourceUrl) continue
      // Same buffer choice and source-domain math as toScheduledClips / renderTimeline.
      const chosen = clipBuffer(clip, bpm, buffers)
      if (!chosen) continue
      const buf = chosen.buffer
      const sf = chosen.sf
      const srcStart = clip.trimStart * sf
      const dur = (clip.trimEnd - clip.trimStart) * sf
      const fadeIn = Math.min(Math.max(0.005, clip.fadeInDuration || 0.015), dur / 2)
      const fadeOut = Math.min(Math.max(0.005, clip.fadeOutDuration || 0.015), dur / 2)
      const t0 = Math.max(start, clip.timelineStart)
      const t1 = Math.min(end, clip.timelineStart + dur)
      if (t1 <= t0) continue
      const srcL = buf.getChannelData(0)
      const srcR = buf.getChannelData(Math.min(1, buf.numberOfChannels - 1))
      for (let o = Math.round((t0 - start) * sampleRate); o < Math.min(frames, Math.round((t1 - start) * sampleRate)); o++) {
        const into = start + o / sampleRate - clip.timelineStart
        const si = Math.floor((srcStart + into) * buf.sampleRate)
        if (si < 0 || si >= srcL.length) continue
        let g = gain
        if (into < fadeIn) g *= into / fadeIn
        else if (dur - into < fadeOut) g *= (dur - into) / fadeOut
        outL[o] += srcL[si] * g
        outR[o] += srcR[si] * g
      }
    }
  }
  // A quiet selection (e.g. a fade) still reaches the model at a usable level.
  let peak = 0
  for (let i = 0; i < frames; i++) peak = Math.max(peak, Math.abs(outL[i]), Math.abs(outR[i]))
  let gain = 1
  if (peak > 1e-4) {
    gain = 0.9 / peak
    for (let i = 0; i < frames; i++) {
      outL[i] *= gain
      outR[i] *= gain
    }
  }
  return { buffer: out, gain }
}

/** RMS of both channels between two times (seconds from the buffer start); null when the span is empty. */
function spanRms(b: AudioBuffer, from: number, to: number): number | null {
  const i0 = Math.max(0, Math.floor(from * b.sampleRate))
  const i1 = Math.min(b.length, Math.floor(to * b.sampleRate))
  if (i1 - i0 < b.sampleRate * 0.25) return null
  let sum = 0
  for (let c = 0; c < b.numberOfChannels; c++) {
    const d = b.getChannelData(c)
    for (let i = i0; i < i1; i++) sum += d[i] * d[i]
  }
  return Math.sqrt(sum / ((i1 - i0) * b.numberOfChannels))
}

/** Lane volume limits for a variant: below that it is a level bug rather than a match. */
const MIN_VARIANT_VOLUME = 0.02
const MAX_VARIANT_VOLUME = 4

/**
 * The lane volume that puts a variant back at the level of the timeline it replaces. The model heard the
 * context normalised by `contextGain`, so its output sits that much louder (or quieter) than the original.
 * Repaint and continue return the audio outside the range almost as it was: when the context is at hand,
 * the level is measured there, which also covers an engine that levels its own output. Otherwise (cover,
 * a new part, a job finished after a reload) the normalisation is undone: 1 / contextGain.
 * `ctxStart` and the spans are timeline seconds; the variant and the context both start at `ctxStart`.
 */
export function variantVolume(
  r: { mode: AiMode; ctxStart: number; ctxEnd: number; regionStart: number; regionEnd: number; contextGain?: number },
  variant: AudioBuffer,
  context: AudioBuffer | null,
): number {
  const gain = r.contextGain && r.contextGain > 0 ? r.contextGain : 1
  let volume = 1 / gain
  if (context && (r.mode === 'repaint' || r.mode === 'continue')) {
    // Keep clear of the seams: the engines blend a little into the untouched audio.
    const spans: [number, number][] = [[0, r.regionStart - r.ctxStart - 0.3]]
    if (r.mode === 'repaint') spans.push([r.regionEnd - r.ctxStart + 0.3, r.ctxEnd - r.ctxStart])
    let ctxSq = 0
    let varSq = 0
    for (const [a, b] of spans) {
      const c = spanRms(context, a, b)
      const v = spanRms(variant, a, b)
      if (c == null || v == null) continue
      ctxSq += c * c * (b - a)
      varSq += v * v * (b - a)
    }
    // ctx = gain * original and variant = k * ctx outside the range, so original / variant = ctx / (variant * gain).
    if (ctxSq > 1e-10 && varSq > 1e-10) volume = Math.sqrt(ctxSq / varSq) / gain
  }
  return Math.min(MAX_VARIANT_VOLUME, Math.max(MIN_VARIANT_VOLUME, volume))
}

export function audioBufferToWavFile(buffer: AudioBuffer, name: string): File {
  return new File([encodeWav(buffer)], name, { type: 'audio/wav' })
}

/**
 * Pearson correlation of the mono signals (decimated to ~6 kHz). Lego sometimes
 * returns a re-rendered copy of its context instead of a new part (seen at 0.75-0.96);
 * a real new part sits near 0.
 */
export function correlationWithContext(part: AudioBuffer, context: AudioBuffer): number {
  const step = Math.max(1, Math.floor(part.sampleRate / 6000))
  const ratio = context.sampleRate / part.sampleRate
  const n = Math.min(part.length, Math.floor(context.length / ratio))
  const mono = (b: AudioBuffer, i: number) => {
    let s = 0
    for (let c = 0; c < b.numberOfChannels; c++) s += b.getChannelData(c)[i]
    return s / b.numberOfChannels
  }
  let sa = 0, sb = 0, saa = 0, sbb = 0, sab = 0, k = 0
  for (let i = 0; i < n; i += step) {
    const a = mono(part, i)
    const b = mono(context, Math.floor(i * ratio))
    sa += a; sb += b; saa += a * a; sbb += b * b; sab += a * b; k++
  }
  if (k < 2) return 0
  const cov = sab / k - (sa / k) * (sb / k)
  const va = saa / k - (sa / k) ** 2
  const vb = sbb / k - (sb / k) ** 2
  return va > 1e-12 && vb > 1e-12 ? cov / Math.sqrt(va * vb) : 0
}

export const COPY_THRESHOLD = 0.3

const NOISE_FFT = 2048
const NOISE_FRAMES = 256

/** In-place radix-2 FFT of a real signal of length NOISE_FFT (re holds the samples, im zeros). */
function fft(re: Float32Array, im: Float32Array): void {
  const n = re.length
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) {
      const t = re[i]; re[i] = re[j]; re[j] = t
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len
    const wr = Math.cos(ang)
    const wi = Math.sin(ang)
    for (let i = 0; i < n; i += len) {
      let cr = 1
      let ci = 0
      for (let k = 0; k < len / 2; k++) {
        const a = i + k
        const b = a + len / 2
        const xr = re[b] * cr - im[b] * ci
        const xi = re[b] * ci + im[b] * cr
        re[b] = re[a] - xr; im[b] = im[a] - xi
        re[a] += xr; im[a] += xi
        const ncr = cr * wr - ci * wi
        ci = cr * wi + ci * wr
        cr = ncr
      }
    }
  }
}

/**
 * How noise-like a generated part is: the median spectral flatness (100 Hz - 12 kHz) of its frames that
 * are not silent. 1 is white noise, a played instrument sits near 0.
 *
 * Lego sometimes returns steady broadband hiss instead of a part (the whole file reads 0.1-0.2, while
 * 41 good parts and mixes from the library read 0.00-0.04). Drum, percussion and effect parts are
 * noise-like by nature and are not judged by it (NOISE_EXEMPT_TRACKS).
 */
export function noiseScore(part: AudioBuffer): number {
  const n = NOISE_FFT
  if (part.length < n * 2) return 0
  const frames = Math.min(NOISE_FRAMES, Math.floor(part.length / n))
  const hop = (part.length - n) / Math.max(1, frames - 1)
  const lo = Math.ceil((100 * n) / part.sampleRate)
  const hi = Math.min(n / 2, Math.floor((12000 * n) / part.sampleRate))
  const window = new Float32Array(n)
  for (let i = 0; i < n; i++) window[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1))
  const channels = Array.from({ length: part.numberOfChannels }, (_, c) => part.getChannelData(c))
  const re = new Float32Array(n)
  const im = new Float32Array(n)
  const energy: number[] = []
  const flatness: number[] = []
  for (let f = 0; f < frames; f++) {
    const at = Math.floor(f * hop)
    for (let i = 0; i < n; i++) {
      let s = 0
      for (const ch of channels) s += ch[at + i]
      re[i] = (s / channels.length) * window[i]
      im[i] = 0
    }
    fft(re, im)
    let sum = 0
    let logSum = 0
    for (let k = lo; k < hi; k++) {
      const p = re[k] * re[k] + im[k] * im[k] + 1e-12
      sum += p
      logSum += Math.log(p)
    }
    energy.push(sum)
    flatness.push(Math.exp(logSum / (hi - lo)) / (sum / (hi - lo)))
  }
  const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)] ?? 0
  const floor = median(energy) * 0.1
  return median(flatness.filter((_, i) => energy[i] > floor))
}

export const NOISE_THRESHOLD = 0.06
export const NOISE_EXEMPT_TRACKS: ReadonlySet<AiTrack> = new Set(['drums', 'percussion', 'fx'])
