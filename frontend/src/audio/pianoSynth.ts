import { getSharedAudioCtx } from '../composables/audioPlayback'
import type { MidiNote } from './miniMidiPlayer'

/**
 * A small synthesized piano for previewing melodies: a triangle plus a quiet octave sine through a low-pass that
 * closes as the note decays, so a key sounds struck and fades like a string. No samples, nothing to download.
 */

function strike(ctx: AudioContext, out: AudioNode, note: number, when: number, held: number, velocity = 100): AudioScheduledSourceNode[] {
  const freq = 440 * Math.pow(2, (note - 69) / 12)
  const peak = 0.12 + 0.18 * Math.min(1, velocity / 127)
  // higher keys fade faster, as on a piano
  const decay = Math.max(0.6, 2.6 - (note - 48) * 0.03)
  const end = when + Math.max(0.08, held) + 0.25

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(Math.min(12000, freq * 8), when)
  filter.frequency.exponentialRampToValueAtTime(Math.max(300, freq * 2), when + decay)
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, when)
  gain.gain.exponentialRampToValueAtTime(peak, when + 0.006)
  gain.gain.exponentialRampToValueAtTime(peak * 0.25, when + decay * 0.5)
  gain.gain.setValueAtTime(peak * 0.25, Math.max(when + 0.01, end - 0.25))
  gain.gain.exponentialRampToValueAtTime(0.0001, end)
  filter.connect(gain).connect(out)

  const body = ctx.createOscillator()
  body.type = 'triangle'
  body.frequency.setValueAtTime(freq, when)
  body.connect(filter)
  const shine = ctx.createOscillator()
  shine.type = 'sine'
  shine.frequency.setValueAtTime(freq * 2, when)
  const shineGain = ctx.createGain()
  shineGain.gain.value = 0.18
  shine.connect(shineGain).connect(filter)
  for (const o of [body, shine]) { o.start(when); o.stop(end + 0.02) }
  return [body, shine]
}

/** One key, now (the on-screen keyboard and a MIDI keyboard). */
export function pianoKey(note: number, velocity = 100): void {
  const ctx = getSharedAudioCtx()
  if (ctx.state === 'suspended') void ctx.resume()
  const out = ctx.createGain()
  out.gain.value = 0.9
  out.connect(ctx.destination)
  strike(ctx, out, note, ctx.currentTime + 0.005, 0.35, velocity)
  setTimeout(() => out.disconnect(), 3500)
}

export interface PianoPlayback {
  /** The audio clock time at which second 0 of the notes sounds. */
  startedAt: number
  stop(): void
}

/** Plays notes from `fromSec`; `onEnded` fires after the last one unless stopped. */
export function playPianoNotes(notes: MidiNote[], fromSec = 0, onEnded?: () => void): PianoPlayback {
  const ctx = getSharedAudioCtx()
  if (ctx.state === 'suspended') void ctx.resume()
  const out = ctx.createGain()
  out.gain.value = 0.8
  out.connect(ctx.destination)
  const startedAt = ctx.currentTime + 0.05 - fromSec
  const nodes: AudioScheduledSourceNode[] = []
  let last = 0
  for (const n of notes) {
    if (n.startSec + n.durationSec <= fromSec) continue
    const start = Math.max(n.startSec, fromSec)
    nodes.push(...strike(ctx, out, n.note, startedAt + start, n.startSec + n.durationSec - start, n.velocity))
    last = Math.max(last, n.startSec + n.durationSec)
  }
  let stopped = false
  const timer = setTimeout(() => { if (!stopped) { out.disconnect(); onEnded?.() } }, Math.max(0, (startedAt + last - ctx.currentTime) * 1000 + 400))
  return {
    startedAt,
    stop() {
      stopped = true
      clearTimeout(timer)
      out.gain.setTargetAtTime(0, ctx.currentTime, 0.02)
      setTimeout(() => {
        for (const o of nodes) { try { o.stop() } catch { /* already ended */ } }
        out.disconnect()
      }, 120)
    },
  }
}
