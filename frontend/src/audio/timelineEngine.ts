/**
 * Generalized N-lane Web Audio engine for the timeline editor, built on the
 * same per-channel effect chain as mixerEngine.ts (buildChannel/
 * applyChannelSettings, exported from there for reuse here) - the mixer's
 * own buildMixGraph/STEM_NAMES stay fixed at exactly 4 stems and are
 * untouched; this module is the arbitrary-lane-count counterpart.
 */
import { applyChannelSettings, buildChannel, disconnectChannel, effectTailSeconds, getReverbImpulse } from './mixerEngine'
import type { BuiltChannel, ChannelSettings, MasterSettings } from './mixerEngine'

export interface TimelineGraph {
  ctx: BaseAudioContext
  lanes: BuiltChannel[]
  master: BuiltChannel
}

export function buildTimelineGraph(ctx: BaseAudioContext, laneCount: number, impulse: AudioBuffer): TimelineGraph {
  const master = buildChannel(ctx, true, impulse)
  master.output.connect(ctx.destination)
  const graph: TimelineGraph = { ctx, lanes: [], master }
  for (let i = 0; i < laneCount; i++) graph.lanes.push(buildLaneChannel(graph, impulse))
  return graph
}

/** A new lane channel feeding the graph's master. The caller places it in `graph.lanes`. */
export function buildLaneChannel(graph: TimelineGraph, impulse: AudioBuffer): BuiltChannel {
  const ch = buildChannel(graph.ctx, false, impulse)
  ch.output.connect(graph.master.input)
  return ch
}

export function effectiveLaneGain(settings: ChannelSettings, anySolo: boolean): number {
  if (settings.muted) return 0
  if (anySolo && !settings.solo) return 0
  return settings.volume
}

export function applyLaneSettings(graph: TimelineGraph, laneIndex: number, settings: ChannelSettings, effectiveVolume: number): void {
  applyChannelSettings(graph.lanes[laneIndex], settings, effectiveVolume)
}

export function applyMasterSettings(graph: TimelineGraph, settings: MasterSettings): void {
  applyChannelSettings(graph.master, settings, settings.volume)
}

/** Must be called when the editor closes/navigates away, same discipline as
 * mixerEngine's disconnectMixGraph - otherwise the processing graph (silent
 * but allocated) stays alive across repeated open/close cycles. */
export function disconnectTimelineGraph(graph: TimelineGraph): void {
  for (const ch of graph.lanes) disconnectChannel(ch)
  disconnectChannel(graph.master)
}

import type { MidiNote } from './miniMidiPlayer'

export interface ScheduledClip {
  laneIndex: number
  type?: 'audio' | 'midi'
  buffer?: AudioBuffer
  notes?: MidiNote[]
  timelineStart: number
  trimStart: number
  trimEnd: number
  fadeInDuration?: number
  fadeOutDuration?: number
  stretchFactor?: number
  instrument?: OscillatorType
}

export interface TimelinePlaybackHandle {
  stop(): void
}

export function scheduleTimeline(
  graph: TimelineGraph,
  clips: ScheduledClip[],
  playFromSec: number,
  ctxStartTime: number,
  onEnded: () => void,
  /** Timeline second where this pass stops (a loop's end); clips are cut there. */
  untilSec = Infinity,
): TimelinePlaybackHandle {
  const ctx = graph.ctx as AudioContext
  const sources: (AudioBufferSourceNode | OscillatorNode)[] = []
  const fadeGains: GainNode[] = []
  let lastEnd = -Infinity
  let lastSrc: AudioBufferSourceNode | null = null

  for (const clip of clips) {
    const sf = clip.stretchFactor || 1.0
    const stretchedTrimStart = clip.trimStart * sf
    const stretchedTrimEnd = clip.trimEnd * sf
    const clipDuration = stretchedTrimEnd - stretchedTrimStart
    const clipTimelineEnd = clip.timelineStart + clipDuration
    if (clipDuration <= 0 || clipTimelineEnd <= playFromSec || clip.timelineStart >= untilSec) continue

    let when: number
    let offset: number
    let duration: number
    if (clip.timelineStart >= playFromSec) {
      when = ctxStartTime + (clip.timelineStart - playFromSec)
      offset = stretchedTrimStart
      duration = clipDuration
    } else {
      when = ctxStartTime
      offset = stretchedTrimStart + (playFromSec - clip.timelineStart)
      duration = clipTimelineEnd - playFromSec
    }

    if (clip.type === 'midi' && clip.notes) {
      // Schedule MIDI notes
      for (const note of clip.notes) {
        const noteStart = note.startSec * sf
        const noteEnd = noteStart + note.durationSec * sf
        
        // Note is completely trimmed out
        if (noteEnd <= stretchedTrimStart || noteStart >= stretchedTrimEnd) continue
        
        const noteTimelineStart = clip.timelineStart + (noteStart - stretchedTrimStart)
        const noteTimelineEnd = clip.timelineStart + (noteEnd - stretchedTrimStart)
        
        // Clamp to clip bounds
        const actualTimelineStart = Math.max(clip.timelineStart, noteTimelineStart)
        const actualTimelineEnd = Math.min(clipTimelineEnd, noteTimelineEnd, untilSec) // also cut at the end of this pass
        
        if (actualTimelineEnd <= playFromSec || actualTimelineStart >= untilSec) continue // already played, or after the cut
        
        const noteDuration = actualTimelineEnd - actualTimelineStart
        const noteWhen = actualTimelineStart >= playFromSec 
          ? ctxStartTime + (actualTimelineStart - playFromSec)
          : ctxStartTime
          
        const actualPlayDuration = actualTimelineStart >= playFromSec
          ? noteDuration
          : actualTimelineEnd - playFromSec
          
        if (actualPlayDuration <= 0) continue

        const osc = ctx.createOscillator()
        osc.type = clip.instrument || 'sawtooth'
        osc.frequency.value = 440 * Math.pow(2, (note.note - 69) / 12)
        
        const noteGain = ctx.createGain()
        // Basic ADSR envelope
        const att = Math.min(0.01, actualPlayDuration / 2)
        const rel = Math.min(0.05, actualPlayDuration / 2)
        noteGain.gain.setValueAtTime(0, noteWhen)
        noteGain.gain.linearRampToValueAtTime(note.velocity * 0.3, noteWhen + att)
        noteGain.gain.setValueAtTime(note.velocity * 0.3, Math.max(noteWhen + att, noteWhen + actualPlayDuration - rel))
        noteGain.gain.linearRampToValueAtTime(0, noteWhen + actualPlayDuration)
        
        osc.connect(noteGain)
        noteGain.connect(graph.lanes[clip.laneIndex].input)
        
        osc.start(noteWhen)
        osc.stop(noteWhen + actualPlayDuration)
        
        sources.push(osc)
        fadeGains.push(noteGain)
        
        if (actualTimelineEnd > lastEnd) {
          lastEnd = actualTimelineEnd
          lastSrc = osc as unknown as AudioBufferSourceNode
        }
      }
      continue // Skip audio buffer logic
    }

    if (!clip.buffer) continue
    
    // A negative offset is a RangeError in AudioBufferSourceNode.start(), which
    // would abort scheduling half-way and leave already-started sources unstoppable.
    offset = Math.min(Math.max(0, offset), Math.max(0, clip.buffer.duration - 0.001))
    duration = Math.max(0, Math.min(duration, clip.buffer.duration - offset, untilSec - Math.max(playFromSec, clip.timelineStart)))
    if (duration <= 0) continue

    const src = ctx.createBufferSource()
    src.buffer = clip.buffer

    const fadeGain = ctx.createGain()
    const inFadeSec = Math.min(Math.max(0.005, clip.fadeInDuration || 0.015), clipDuration / 2)
    const outFadeSec = Math.min(Math.max(0.005, clip.fadeOutDuration || 0.015), clipDuration / 2)

    const absStart = clip.timelineStart
    const absFadeInEnd = absStart + inFadeSec
    const absFadeOutStart = clipTimelineEnd - outFadeSec
    const absEnd = clipTimelineEnd

    const toCtxTime = (t: number) => ctxStartTime + (t - playFromSec)

    if (playFromSec <= absStart) {
      fadeGain.gain.setValueAtTime(0, toCtxTime(absStart))
      fadeGain.gain.linearRampToValueAtTime(1, toCtxTime(absFadeInEnd))
      fadeGain.gain.setValueAtTime(1, toCtxTime(absFadeOutStart))
      fadeGain.gain.linearRampToValueAtTime(0, toCtxTime(absEnd))
    } else {
      let initialGain = 1.0
      if (playFromSec < absFadeInEnd) {
        initialGain = (playFromSec - absStart) / inFadeSec
      } else if (playFromSec > absFadeOutStart) {
        initialGain = Math.max(0, 1.0 - (playFromSec - absFadeOutStart) / outFadeSec)
      }
      fadeGain.gain.setValueAtTime(initialGain, ctxStartTime)

      if (playFromSec < absFadeInEnd) {
        fadeGain.gain.linearRampToValueAtTime(1, toCtxTime(absFadeInEnd))
      }
      if (playFromSec < absFadeOutStart) {
        fadeGain.gain.setValueAtTime(1, Math.max(ctxStartTime, toCtxTime(absFadeOutStart)))
      }
      if (playFromSec < absEnd) {
        fadeGain.gain.linearRampToValueAtTime(0, Math.max(ctxStartTime, toCtxTime(absEnd)))
      }
    }

    src.connect(fadeGain)
    fadeGain.connect(graph.lanes[clip.laneIndex].input)
    src.start(when, offset, duration)
    sources.push(src)
    fadeGains.push(fadeGain)

    if (Math.min(clipTimelineEnd, untilSec) > lastEnd) {
      lastEnd = Math.min(clipTimelineEnd, untilSec)
      lastSrc = src
    }
  }

  if (lastSrc) lastSrc.onended = () => onEnded()

  return {
    stop() {
      for (const src of sources) {
        src.onended = null
        try { src.stop() } catch {}
        src.disconnect()
      }
      for (const g of fadeGains) {
        try { g.disconnect() } catch {}
      }
    },
  }
}

// Export renders past the last clip so reverb and delay can ring out, then
// cuts the file where the tail drops below -80 dBFS. A long feedback delay
// can outlast the cap; that tail is faded out instead of stopping hard.
const MAX_EXPORT_TAIL_SEC = 30
const TAIL_SILENCE = 1e-4
const TAIL_FADE_SEC = 0.05

export function exportTailSeconds(laneSettings: ChannelSettings[], masterSettings: MasterSettings): number {
  const anySolo = laneSettings.some((s) => s.solo)
  const audible = laneSettings.filter((s) => effectiveLaneGain(s, anySolo) > 0)
  const laneTail = Math.max(0, ...audible.map(effectTailSeconds))
  return Math.min(MAX_EXPORT_TAIL_SEC, laneTail + effectTailSeconds(masterSettings))
}

/** One past the last sample above `threshold` in any channel, or 0. */
export function audibleLength(channels: Float32Array[], threshold: number): number {
  let end = 0
  for (const data of channels) {
    for (let i = data.length - 1; i >= end; i--) {
      if (Math.abs(data[i]) > threshold) {
        end = i + 1
        break
      }
    }
  }
  return end
}

function trimTail(buf: AudioBuffer, contentFrames: number): AudioBuffer {
  if (buf.length <= contentFrames) return buf
  const channels = Array.from({ length: buf.numberOfChannels }, (_, c) => buf.getChannelData(c))
  const end = Math.max(contentFrames, audibleLength(channels, TAIL_SILENCE))
  if (end === buf.length) {
    const fade = Math.min(Math.round(TAIL_FADE_SEC * buf.sampleRate), buf.length - contentFrames)
    for (const data of channels) {
      for (let i = 0; i < fade; i++) data[buf.length - fade + i] *= 1 - (i + 1) / fade
    }
    return buf
  }
  const out = new AudioBuffer({ numberOfChannels: buf.numberOfChannels, length: end, sampleRate: buf.sampleRate })
  channels.forEach((data, c) => out.copyToChannel(data.subarray(0, end), c))
  return out
}

export async function renderTimeline(
  clips: ScheduledClip[],
  laneSettings: ChannelSettings[],
  masterSettings: MasterSettings,
  totalDurationSec: number,
  sampleRate: number,
): Promise<AudioBuffer> {
  const contentFrames = Math.max(1, Math.ceil(totalDurationSec * sampleRate))
  const tailFrames = Math.ceil(exportTailSeconds(laneSettings, masterSettings) * sampleRate)
  const ctx = new OfflineAudioContext(2, contentFrames + tailFrames, sampleRate)
  const graph = buildTimelineGraph(ctx, laneSettings.length, getReverbImpulse(sampleRate))
  const anySolo = laneSettings.some((s) => s.solo)
  laneSettings.forEach((s, i) => applyLaneSettings(graph, i, s, effectiveLaneGain(s, anySolo)))
  applyMasterSettings(graph, masterSettings)
  
  for (const clip of clips) {
    const sf = clip.stretchFactor || 1.0
    const stretchedTrimStart = clip.trimStart * sf
    const stretchedTrimEnd = clip.trimEnd * sf
    const duration = stretchedTrimEnd - stretchedTrimStart
    const clipTimelineEnd = clip.timelineStart + duration
    if (duration <= 0) continue

    if (clip.type === 'midi' && clip.notes) {
      for (const note of clip.notes) {
        const noteStart = note.startSec * sf
        const noteEnd = noteStart + note.durationSec * sf
        if (noteEnd <= stretchedTrimStart || noteStart >= stretchedTrimEnd) continue
        
        const noteTimelineStart = clip.timelineStart + (noteStart - stretchedTrimStart)
        const noteTimelineEnd = clip.timelineStart + (noteEnd - stretchedTrimStart)
        
        const actualTimelineStart = Math.max(clip.timelineStart, noteTimelineStart)
        const actualTimelineEnd = Math.min(clipTimelineEnd, noteTimelineEnd)
        
        const noteDuration = actualTimelineEnd - actualTimelineStart
        if (noteDuration <= 0) continue

        const osc = ctx.createOscillator()
        osc.type = 'sawtooth'
        osc.frequency.value = 440 * Math.pow(2, (note.note - 69) / 12)
        
        const noteGain = ctx.createGain()
        const att = Math.min(0.01, noteDuration / 2)
        const rel = Math.min(0.05, noteDuration / 2)
        noteGain.gain.setValueAtTime(0, actualTimelineStart)
        noteGain.gain.linearRampToValueAtTime(note.velocity * 0.3, actualTimelineStart + att)
        noteGain.gain.setValueAtTime(note.velocity * 0.3, Math.max(actualTimelineStart + att, actualTimelineStart + noteDuration - rel))
        noteGain.gain.linearRampToValueAtTime(0, actualTimelineStart + noteDuration)
        
        osc.connect(noteGain)
        noteGain.connect(graph.lanes[clip.laneIndex].input)
        
        osc.start(actualTimelineStart)
        osc.stop(actualTimelineStart + noteDuration)
      }
      continue
    }

    if (!clip.buffer) continue
    
    const src = ctx.createBufferSource()
    src.buffer = clip.buffer
    const fadeGain = ctx.createGain()
    
    const inFadeSec = Math.min(Math.max(0.005, clip.fadeInDuration || 0.015), duration / 2)
    const outFadeSec = Math.min(Math.max(0.005, clip.fadeOutDuration || 0.015), duration / 2)
    
    const absStart = clip.timelineStart
    const absFadeInEnd = absStart + inFadeSec
    const absFadeOutStart = clip.timelineStart + duration - outFadeSec
    const absEnd = clip.timelineStart + duration
    
    fadeGain.gain.setValueAtTime(0, absStart)
    fadeGain.gain.linearRampToValueAtTime(1, absFadeInEnd)
    fadeGain.gain.setValueAtTime(1, absFadeOutStart)
    fadeGain.gain.linearRampToValueAtTime(0, absEnd)
    
    src.connect(fadeGain)
    fadeGain.connect(graph.lanes[clip.laneIndex].input)
    // Same guards as scheduleTimeline: never hand start() a negative offset or a
    // duration that runs past the buffer.
    const offset = Math.min(Math.max(0, stretchedTrimStart), Math.max(0, clip.buffer.duration - 0.001))
    const playDuration = Math.max(0, Math.min(duration, clip.buffer.duration - offset))
    if (playDuration <= 0) continue
    src.start(absStart, offset, playDuration)
  }
  return trimTail(await ctx.startRendering(), contentFrames)
}
