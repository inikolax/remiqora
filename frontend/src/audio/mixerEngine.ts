/**
 * Web Audio mixing engine for recombining separated stems and custom tracks.
 * Provides per-channel volume, mute, solo, pan, and a full effects rack:
 * EQ, Compressor, Filter, Distortion, Chorus, Delay, Bitcrusher, and Reverb.
 * 
 * Architecture:
 * - The graph-builder is parameterized over `BaseAudioContext` so the exact same
 *   code builds the live preview graph (a real AudioContext) and the offline
 *   export render graph (an OfflineAudioContext). This guarantees the exported
 *   mix sounds identical to the preview.
 * - Heavy Web Audio nodes (like ConvolverNode, DelayNode, WaveShaperNode) are
 *   instantiated once per channel in `buildChannel`.
 * - To prevent massive CPU overload, each heavy effect is preceded by a `*Send`
 *   GainNode. When an effect is bypassed or its mix is 0, the Send node is set
 *   to 0 gain, feeding a silent stream into the heavy node. Modern browsers 
 *   (like Chrome) automatically detect silent streams and suspend processing
 *   for those nodes, drastically saving CPU (Silent Stream Optimization).
 */
import { getSharedAudioCtx } from '../composables/audioPlayback'

export interface EqSettings {
  low: number
  mid: number
  high: number
}

export interface CompSettings {
  threshold: number
  ratio: number
}

export interface ReverbSettings {
  mix: number
}

export interface FilterSettings {
  enabled: boolean
  type: 'lowpass' | 'highpass'
  frequency: number
  resonance: number
}

export interface DistortionSettings {
  enabled: boolean
  amount: number
  mix: number
}

export interface DelaySettings {
  enabled: boolean
  time: number
  feedback: number
  mix: number
}

export interface ChorusSettings {
  enabled: boolean
  rate: number
  depth: number
  mix: number
}

export interface BitcrusherSettings {
  enabled: boolean
  bits: number
  mix: number
}

export interface ChannelSettings {
  volume: number
  muted: boolean
  solo: boolean
  pan: number
  eq: EqSettings
  comp: CompSettings
  reverb: ReverbSettings
  filter: FilterSettings
  distortion: DistortionSettings
  chorus: ChorusSettings
  bitcrusher: BitcrusherSettings
  delay: DelaySettings
}

export type MasterSettings = Omit<ChannelSettings, 'pan' | 'muted' | 'solo'>

export type StemName = 'vocals' | 'drums' | 'bass' | 'other'
export const STEM_NAMES: StemName[] = ['vocals', 'drums', 'bass', 'other']

export interface MixSettings {
  version: 1
  stems: Record<StemName, ChannelSettings>
  master: MasterSettings
}

export function defaultChannelSettings(): ChannelSettings {
  return {
    volume: 1,
    muted: false,
    solo: false,
    pan: 0,
    eq: { low: 0, mid: 0, high: 0 },
    comp: { threshold: -24, ratio: 1 },
    reverb: { mix: 0 },
    filter: { enabled: false, type: 'lowpass', frequency: 22000, resonance: 1 },
    distortion: { enabled: false, amount: 0.5, mix: 0 },
    chorus: { enabled: false, rate: 1.5, depth: 0.002, mix: 0 },
    bitcrusher: { enabled: false, bits: 8, mix: 0 },
    delay: { enabled: false, time: 0.3, feedback: 0.4, mix: 0 },
  }
}

export function defaultMasterSettings(): MasterSettings {
  const { pan: _pan, muted: _muted, solo: _solo, ...rest } = defaultChannelSettings()
  return rest
}

export function defaultMixSettings(): MixSettings {
  return {
    version: 1,
    stems: {
      vocals: defaultChannelSettings(),
      drums: defaultChannelSettings(),
      bass: defaultChannelSettings(),
      other: defaultChannelSettings(),
    },
    master: defaultMasterSettings(),
  }
}

export interface BuiltChannel {
  input: AudioNode
  output: AudioNode
  filterNode: BiquadFilterNode
  distNode: WaveShaperNode
  distSend: GainNode
  distDry: GainNode
  distWet: GainNode
  delayNode: DelayNode
  delaySend: GainNode
  delayFeedback: GainNode
  delayDry: GainNode
  delayWet: GainNode
  chorusDelay: DelayNode
  chorusSend: GainNode
  chorusLfo: OscillatorNode
  chorusLfoGain: GainNode
  chorusDry: GainNode
  chorusWet: GainNode
  bitcrushNode: WaveShaperNode
  bitcrushSend: GainNode
  bitcrushDry: GainNode
  bitcrushWet: GainNode
  volumeGain: GainNode
  eqLow: BiquadFilterNode
  eqMid: BiquadFilterNode
  eqHigh: BiquadFilterNode
  comp: DynamicsCompressorNode
  panner: StereoPannerNode | null
  reverbSend: GainNode
  dryGain: GainNode
  wetGain: GainNode
  convolver: ConvolverNode
  analyser: AnalyserNode | null
  analyserL?: AnalyserNode | null
  analyserR?: AnalyserNode | null
  splitter?: ChannelSplitterNode | null
  limiterComp: DynamicsCompressorNode | null
  limiterShaper: WaveShaperNode | null
}

/**
 * Generates an asymmetrical soft clipping curve using tanh.
 * Used for the Distortion effect and the Master Limiter.
 */
function makeSoftClipCurve(threshold = 0.9): Float32Array {
  const size = 8192
  const curve = new Float32Array(size)
  for (let i = 0; i < size; i++) {
    const x = (i * 2) / (size - 1) - 1
    const abs = Math.abs(x)
    let y = abs
    if (abs > threshold) {
      y = threshold + (1 - threshold) * Math.tanh((abs - threshold) / (1 - threshold))
    }
    curve[i] = x < 0 ? -y : y
  }
  return curve
}

/**
 * Generates a staircase curve for reducing bit depth.
 * Used for the Bitcrusher effect.
 */
function makeBitcrusherCurve(bits: number): Float32Array {
  const steps = Math.pow(2, bits)
  const size = 8192
  const curve = new Float32Array(size)
  for (let i = 0; i < size; i++) {
    const x = (i * 2) / (size - 1) - 1
    curve[i] = Math.round(x * steps) / steps
  }
  return curve
}

/**
 * Builds the complete DSP graph for a single channel (track or master bus).
 * All nodes are permanently connected in a serial chain, but heavy nodes are
 * guarded by "Send" GainNodes. Setting a Send gain to 0 feeds silence to the
 * effect, which allows the browser to suspend processing for that node.
 * 
 * Signal flow:
 * Input -> Filter -> Bitcrush -> Distortion -> Chorus -> Delay -> EQ -> Compressor -> Panner -> Reverb -> Output
 */
export function buildChannel(ctx: BaseAudioContext, isMaster: boolean, impulse: AudioBuffer): BuiltChannel {
  const filterNode = ctx.createBiquadFilter()
  const distNode = ctx.createWaveShaper()
  const distSend = ctx.createGain()
  const distDry = ctx.createGain()
  const distWet = ctx.createGain()
  distWet.gain.value = 0
  
  const delayNode = ctx.createDelay(5.0)
  const delaySend = ctx.createGain()
  const delayFeedback = ctx.createGain()
  delayFeedback.gain.value = 0
  const delayDry = ctx.createGain()
  const delayWet = ctx.createGain()
  delayWet.gain.value = 0
  
  const chorusDelay = ctx.createDelay()
  const chorusSend = ctx.createGain()
  chorusDelay.delayTime.value = 0.03
  const chorusLfo = ctx.createOscillator()
  chorusLfo.type = 'sine'
  chorusLfo.frequency.value = 1.5
  const chorusLfoGain = ctx.createGain()
  chorusLfoGain.gain.value = 0.002
  chorusLfo.connect(chorusLfoGain)
  chorusLfoGain.connect(chorusDelay.delayTime)
  const chorusDry = ctx.createGain()
  const chorusWet = ctx.createGain()
  chorusWet.gain.value = 0
  // LFO needs to be started
  if (typeof (chorusLfo as any).start === 'function') {
    chorusLfo.start(0)
  }

  const bitcrushNode = ctx.createWaveShaper()
  const bitcrushSend = ctx.createGain()
  const bitcrushDry = ctx.createGain()
  const bitcrushWet = ctx.createGain()
  bitcrushWet.gain.value = 0
  
  const volumeGain = ctx.createGain()
  const eqLow = ctx.createBiquadFilter()
  eqLow.type = 'lowshelf'
  eqLow.frequency.value = 320
  const eqMid = ctx.createBiquadFilter()
  eqMid.type = 'peaking'
  eqMid.frequency.value = 1000
  eqMid.Q.value = 0.7
  const eqHigh = ctx.createBiquadFilter()
  eqHigh.type = 'highshelf'
  eqHigh.frequency.value = 3200
  const comp = ctx.createDynamicsCompressor()
  const panner = isMaster ? null : ctx.createStereoPanner()
  const reverbSend = ctx.createGain()
  const dryGain = ctx.createGain()
  const wetGain = ctx.createGain()
  const convolver = ctx.createConvolver()
  convolver.buffer = impulse
  const reverbOut = ctx.createGain()

  let limiterComp: DynamicsCompressorNode | null = null
  let limiterShaper: WaveShaperNode | null = null

  let input: AudioNode
  let preReverb: AudioNode
  
  // ==========================================
  // Internal FX wiring (Series Routing)
  // Each effect block consists of:
  // [Input] -> Dry ------------------------> [Next Stage]
  //         -> Send -> [Effect Node] -> Wet -> [Next Stage]
  // ==========================================
  const bitcrushInput = ctx.createGain()
  const distInput = ctx.createGain()
  const chorusInput = ctx.createGain()
  const delayInput = ctx.createGain()
  
  filterNode.connect(bitcrushInput)
  bitcrushInput.connect(bitcrushDry)
  bitcrushInput.connect(bitcrushSend)
  bitcrushSend.connect(bitcrushNode)
  bitcrushNode.connect(bitcrushWet)
  
  bitcrushDry.connect(distInput)
  bitcrushWet.connect(distInput)

  distInput.connect(distDry)
  distInput.connect(distSend)
  distSend.connect(distNode)
  distNode.connect(distWet)
  
  distDry.connect(chorusInput)
  distWet.connect(chorusInput)

  chorusInput.connect(chorusDry)
  chorusInput.connect(chorusSend)
  chorusSend.connect(chorusDelay)
  chorusDelay.connect(chorusWet)

  chorusDry.connect(delayInput)
  chorusWet.connect(delayInput)
  
  delayInput.connect(delayDry)
  delayInput.connect(delaySend)
  delaySend.connect(delayNode)
  delayNode.connect(delayFeedback)
  delayFeedback.connect(delayNode)
  delayNode.connect(delayWet)
  
  const fxOutput = ctx.createGain()
  delayDry.connect(fxOutput)
  delayWet.connect(fxOutput)

  if (isMaster) {
    // Stems fan their outputs directly into filterNode
    input = filterNode
    fxOutput.connect(eqLow)
    eqLow.connect(eqMid)
    eqMid.connect(eqHigh)
    eqHigh.connect(comp)
    preReverb = comp

    // Initialize Mastering Limiter nodes
    limiterComp = ctx.createDynamicsCompressor()
    limiterComp.threshold.value = -2.0
    limiterComp.knee.value = 0.0
    limiterComp.ratio.value = 20.0
    limiterComp.attack.value = 0.001
    limiterComp.release.value = 0.1

    limiterShaper = ctx.createWaveShaper()
    limiterShaper.curve = makeSoftClipCurve(0.9) as any
  } else {
    input = volumeGain
    volumeGain.connect(filterNode)
    fxOutput.connect(eqLow)
    eqLow.connect(eqMid)
    eqMid.connect(eqHigh)
    eqHigh.connect(comp)
    comp.connect(panner!)
    preReverb = panner!
  }

  preReverb.connect(dryGain)
  preReverb.connect(reverbSend)
  reverbSend.connect(convolver)
  convolver.connect(wetGain)
  dryGain.connect(reverbOut)
  wetGain.connect(reverbOut)

  // Stems: volume is first in the chain (already the `input`). Master:
  // volume is deliberately LAST, after the reverb mix - do not swap these.
  const output = isMaster ? limiterShaper! : reverbOut
  if (isMaster) {
    reverbOut.connect(volumeGain)
    volumeGain.connect(limiterComp!)
    limiterComp!.connect(limiterShaper!)
  }

  let analyser: AnalyserNode | null = null
  let analyserL: AnalyserNode | null = null
  let analyserR: AnalyserNode | null = null
  let splitter: ChannelSplitterNode | null = null

  if (typeof ctx.createAnalyser === 'function') {
    try {
      analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.3
      output.connect(analyser)

      if (isMaster) {
        splitter = ctx.createChannelSplitter(2)
        output.connect(splitter)
        analyserL = ctx.createAnalyser()
        analyserL.fftSize = 256
        analyserL.smoothingTimeConstant = 0.3
        analyserR = ctx.createAnalyser()
        analyserR.fftSize = 256
        analyserR.smoothingTimeConstant = 0.3
        splitter.connect(analyserL, 0)
        splitter.connect(analyserR, 1)
      }
    } catch {
      // OfflineAudioContext or unsupported
    }
  }

  return { 
    input, output, 
    filterNode,
    distNode,
    distSend,
    distDry,
    distWet,
    delayNode,
    delaySend,
    delayFeedback,
    delayDry,
    delayWet,
    chorusDelay,
    chorusSend,
    chorusLfo,
    chorusLfoGain,
    chorusDry,
    chorusWet,
    bitcrushNode,
    bitcrushSend,
    bitcrushDry,
    bitcrushWet,
    volumeGain,
    eqLow,
    eqMid,
    eqHigh,
    comp,
    panner,
    reverbSend,
    dryGain,
    wetGain,
    convolver, analyser, analyserL, analyserR, splitter, limiterComp, limiterShaper 
  }
}

/**
 * Applies UI settings to an existing channel graph.
 * This updates parameters like EQ gains, effect mix levels, etc.
 * 
 * Crucially, if an effect's mix is 0 or it is disabled, we set its `*Send` 
 * node's gain to 0. This is a CPU optimization that leverages the browser's 
 * "silent stream" detection to stop heavy nodes from processing.
 */
export function applyChannelSettings(ch: BuiltChannel, s: ChannelSettings | MasterSettings, effectiveVolume: number): void {
  ch.volumeGain.gain.value = effectiveVolume
  ch.eqLow.gain.value = s.eq.low
  ch.eqMid.gain.value = s.eq.mid
  ch.eqHigh.gain.value = s.eq.high
  ch.comp.threshold.value = s.comp.threshold
  ch.comp.ratio.value = s.comp.ratio
  if (ch.panner && 'pan' in s) ch.panner.pan.value = (s as ChannelSettings).pan
  
  const rMix = Math.max(0, Math.min(1, s.reverb.mix))
  ch.reverbSend.gain.value = rMix > 0 ? 1 : 0
  ch.dryGain.gain.value = 1 - rMix
  ch.wetGain.gain.value = rMix

  // FX settings
  const fullS = s as ChannelSettings
  
  const fType = fullS.filter?.type ?? 'lowpass'
  const fFreq = fullS.filter?.enabled ? (fullS.filter.frequency ?? 22000) : (fType === 'lowpass' ? 22000 : 0)
  const fRes = fullS.filter?.enabled ? (fullS.filter.resonance ?? 1) : 1
  ch.filterNode.type = fType
  ch.filterNode.frequency.value = fFreq
  ch.filterNode.Q.value = fRes

  const dEnabled = fullS.distortion?.enabled ?? false
  const dAmt = fullS.distortion?.amount ?? 0
  const dMix = fullS.distortion?.mix ?? 0
  const curveAmount = dEnabled ? Math.max(0, Math.min(0.99, dAmt)) : 0
  ch.distNode.curve = (curveAmount > 0 ? makeSoftClipCurve(1.0 - curveAmount) : null) as any
  const distMix = dEnabled ? dMix : 0
  ch.distSend.gain.value = distMix > 0 ? 1 : 0
  ch.distDry.gain.value = 1 - distMix
  ch.distWet.gain.value = distMix

  const delEnabled = fullS.delay?.enabled ?? false
  const delTime = fullS.delay?.time ?? 0.3
  const delFbk = fullS.delay?.feedback ?? 0.4
  const delMix = fullS.delay?.mix ?? 0
  ch.delayNode.delayTime.value = delTime // NEVER SET TO 0 in a feedback loop
  ch.delayFeedback.gain.value = delEnabled ? delFbk : 0
  const delayMixAmt = delEnabled ? delMix : 0
  ch.delaySend.gain.value = delayMixAmt > 0 ? 1 : 0
  ch.delayDry.gain.value = 1 - delayMixAmt
  ch.delayWet.gain.value = delayMixAmt

  const choEnabled = fullS.chorus?.enabled ?? false
  const choRate = fullS.chorus?.rate ?? 1.5
  const choDepth = fullS.chorus?.depth ?? 0.002
  const choMix = fullS.chorus?.mix ?? 0
  ch.chorusLfo.frequency.value = choRate
  ch.chorusLfoGain.gain.value = choDepth
  const chorusMixAmt = choEnabled ? choMix : 0
  ch.chorusSend.gain.value = chorusMixAmt > 0 ? 1 : 0
  ch.chorusDry.gain.value = 1 - chorusMixAmt
  ch.chorusWet.gain.value = chorusMixAmt

  const bcEnabled = fullS.bitcrusher?.enabled ?? false
  const bcBits = fullS.bitcrusher?.bits ?? 8
  const bcMix = fullS.bitcrusher?.mix ?? 0
  ch.bitcrushNode.curve = bcEnabled ? (makeBitcrusherCurve(bcBits) as any) : null
  const bcMixAmt = bcEnabled ? bcMix : 0
  ch.bitcrushSend.gain.value = bcMixAmt > 0 ? 1 : 0
  ch.bitcrushDry.gain.value = 1 - bcMixAmt
  ch.bitcrushWet.gain.value = bcMixAmt
}

function effectiveStemGain(s: ChannelSettings, anySolo: boolean): number {
  if (s.muted) return 0
  if (anySolo && !s.solo) return 0
  return s.volume
}

export interface MixGraph {
  ctx: BaseAudioContext
  stems: Record<StemName, BuiltChannel>
  master: BuiltChannel
}

/**
 * Builds the entire mixer graph (4 stem channels routed into 1 master bus).
 * Used primarily by the Mixer (not the DAW editor, which builds its own tracks dynamically).
 */
export function buildMixGraph(ctx: BaseAudioContext, impulse: AudioBuffer): MixGraph {
  const master = buildChannel(ctx, true, impulse)
  master.output.connect(ctx.destination)
  const stems = {} as Record<StemName, BuiltChannel>
  for (const name of STEM_NAMES) {
    const ch = buildChannel(ctx, false, impulse)
    ch.output.connect(master.input)
    stems[name] = ch
  }
  return { ctx, stems, master }
}

export function applyMixSettings(graph: MixGraph, settings: MixSettings): void {
  const anySolo = STEM_NAMES.some((n) => settings.stems[n].solo)
  for (const name of STEM_NAMES) {
    applyChannelSettings(graph.stems[name], settings.stems[name], effectiveStemGain(settings.stems[name], anySolo))
  }
  applyChannelSettings(graph.master, settings.master, settings.master.volume)
}

function disconnectChannel(ch: BuiltChannel): void {
  ch.filterNode.disconnect()
  ch.distNode.disconnect()
  ch.distDry.disconnect()
  ch.distWet.disconnect()
  ch.delayNode.disconnect()
  ch.delayFeedback.disconnect()
  ch.delayDry.disconnect()
  ch.delayWet.disconnect()
  ch.chorusDelay.disconnect()
  try { ch.chorusLfo.stop() } catch {}
  ch.chorusLfo.disconnect()
  ch.chorusLfoGain.disconnect()
  ch.chorusDry.disconnect()
  ch.chorusWet.disconnect()
  ch.bitcrushNode.disconnect()
  ch.bitcrushDry.disconnect()
  ch.bitcrushWet.disconnect()
  
  ch.volumeGain.disconnect()
  ch.eqLow.disconnect()
  ch.eqMid.disconnect()
  ch.eqHigh.disconnect()
  ch.comp.disconnect()
  ch.panner?.disconnect()
  ch.dryGain.disconnect()
  ch.wetGain.disconnect()
  ch.convolver.disconnect()
  ch.analyser?.disconnect()
  ch.analyserL?.disconnect()
  ch.analyserR?.disconnect()
  ch.splitter?.disconnect()
  ch.limiterComp?.disconnect()
  ch.limiterShaper?.disconnect()
}

export function getChannelLevel(ch: BuiltChannel): { peak: number; clipping: boolean; peakL: number; peakR: number } {
  if (!ch.analyser) return { peak: 0, clipping: false, peakL: 0, peakR: 0 }

  if (ch.analyserL && ch.analyserR) {
    const dataL = new Float32Array(ch.analyserL.fftSize)
    ch.analyserL.getFloatTimeDomainData(dataL)
    let maxL = 0
    for (let i = 0; i < dataL.length; i++) {
      const val = Math.abs(dataL[i])
      if (val > maxL) maxL = val
    }
    
    const dataR = new Float32Array(ch.analyserR.fftSize)
    ch.analyserR.getFloatTimeDomainData(dataR)
    let maxR = 0
    for (let i = 0; i < dataR.length; i++) {
      const val = Math.abs(dataR[i])
      if (val > maxR) maxR = val
    }
    
    const max = Math.max(maxL, maxR)
    return {
      peak: max,
      clipping: max >= 0.99,
      peakL: maxL,
      peakR: maxR,
    }
  }

  const data = new Float32Array(ch.analyser.fftSize)
  ch.analyser.getFloatTimeDomainData(data)
  let max = 0
  for (let i = 0; i < data.length; i++) {
    const val = Math.abs(data[i])
    if (val > max) max = val
  }
  return {
    peak: max,
    clipping: max >= 0.99,
    peakL: max,
    peakR: max,
  }
}

/** Must be called when the mixer closes, or Chrome/Firefox keep the (silent
 * but allocated) processing graph alive across repeated open/close cycles. */
export function disconnectMixGraph(graph: MixGraph): void {
  for (const name of STEM_NAMES) disconnectChannel(graph.stems[name])
  disconnectChannel(graph.master)
}

const impulseCache = new Map<number, AudioBuffer>()
const REVERB_IMPULSE_SEC = 2

/** A procedurally generated ~2s decaying-noise impulse response, cached per
 * sample rate. Unlike AudioBufferSourceNode, ConvolverNode.buffer does NOT
 * auto-resample - its sample rate must exactly match the context's, so the
 * impulse has to be (re)generated for whatever rate the live AudioContext
 * (device-dependent, e.g. 48000Hz) or the export OfflineAudioContext uses. */
export function getReverbImpulse(sampleRate: number): AudioBuffer {
  let buf = impulseCache.get(sampleRate)
  if (!buf) {
    buf = generateImpulse(sampleRate, REVERB_IMPULSE_SEC, 2)
    impulseCache.set(sampleRate, buf)
  }
  return buf
}

/** How long a channel keeps sounding after its input goes silent: the
 * reverb impulse, plus delay repeats until the feedback has decayed them
 * below -60 dB. Used to size offline renders so they keep the ring-out. */
export function effectTailSeconds(s: ChannelSettings | MasterSettings): number {
  let tail = 0
  if (s.reverb.mix > 0) tail += REVERB_IMPULSE_SEC
  const d = s.delay
  if (d?.enabled && (d.mix ?? 0) > 0) {
    const fb = Math.min(Math.max(d.feedback ?? 0.4, 0), 0.99)
    const repeats = fb > 0 ? Math.ceil(Math.log(0.001) / Math.log(fb)) : 1
    tail += (d.time ?? 0.3) * Math.max(1, repeats)
  }
  return tail
}

function generateImpulse(sampleRate: number, durationSec: number, decay: number): AudioBuffer {
  const length = Math.floor(sampleRate * durationSec)
  const buffer = new AudioBuffer({ numberOfChannels: 2, length, sampleRate })
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel)
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
    }
  }
  return buffer
}

// Keyed by stem URL so reopening the mixer for the same track within the
// session skips re-fetching/re-decoding the WAV files (mirrors peaksCache
// in composables/audioPlayback.ts).
const bufferCache = new Map<string, Promise<AudioBuffer>>()
/** How long a failed source stays failed before the next request fetches it again. */
const FAILED_RETRY_MS = 10_000

export function decodeStem(url: string): Promise<AudioBuffer> {
  let entry = bufferCache.get(url)
  if (!entry) {
    entry = fetch(url)
      .then((r) => {
        // Without this a 404 page is handed to decodeAudioData, which fails
        // with an unhelpful decode error instead of saying the file is gone.
        if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`)
        return r.arrayBuffer()
      })
      .then((buf) => getSharedAudioCtx().decodeAudioData(buf))
    // A failure stays cached for FAILED_RETRY_MS, so callers that run on
    // every edit (the editor's project watcher fires on each drag frame) get
    // the cached rejection instead of fetching a dead URL many times a second.
    // After that it is dropped, so a file that comes back is picked up.
    const failed = entry
    failed.catch(() => {
      setTimeout(() => {
        if (bufferCache.get(url) === failed) bufferCache.delete(url)
      }, FAILED_RETRY_MS)
    })
    bufferCache.set(url, entry)
  }
  return entry
}

export interface PlaybackHandle {
  stop(): void
}

/** Starts all 4 stem sources at the same AudioContext time for sample-accurate
 * sync. AudioBufferSourceNodes are one-shot, so pause/seek is implemented by
 * the caller as stop() + a fresh playFrom() at the new offset - the effect
 * graph itself (built once by buildMixGraph) is never rebuilt here. */
export function playFrom(
  graph: MixGraph,
  buffers: Record<StemName, AudioBuffer>,
  offsetSec: number,
  onEnded: () => void,
): PlaybackHandle {
  const ctx = graph.ctx as AudioContext
  let longest: StemName = STEM_NAMES[0]
  for (const name of STEM_NAMES) {
    if (buffers[name].duration > buffers[longest].duration) longest = name
  }
  const sources: AudioBufferSourceNode[] = STEM_NAMES.map((name) => {
    const src = ctx.createBufferSource()
    src.buffer = buffers[name]
    src.connect(graph.stems[name].input)
    src.start(0, Math.min(offsetSec, Math.max(0, buffers[name].duration - 0.001)))
    if (name === longest) src.onended = () => onEnded()
    return src
  })
  return {
    stop() {
      for (const src of sources) {
        src.onended = null
        try {
          src.stop()
        } catch {
          // already stopped/ended - fine
        }
        src.disconnect()
      }
    },
  }
}

/** Renders the mix offline (identical graph/settings code path as the live
 * preview) and returns the final stereo AudioBuffer, ready to encode. */
export async function renderMix(
  buffers: Record<StemName, AudioBuffer>,
  settings: MixSettings,
  sampleRate: number,
): Promise<AudioBuffer> {
  const durationSec = Math.max(...STEM_NAMES.map((n) => buffers[n].duration))
  const ctx = new OfflineAudioContext(2, Math.ceil(durationSec * sampleRate), sampleRate)
  const graph = buildMixGraph(ctx, getReverbImpulse(sampleRate))
  applyMixSettings(graph, settings)
  for (const name of STEM_NAMES) {
    const src = ctx.createBufferSource()
    src.buffer = buffers[name]
    src.connect(graph.stems[name].input)
    src.start(0)
  }
  return ctx.startRendering()
}
