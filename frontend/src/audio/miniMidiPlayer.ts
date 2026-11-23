import { getSharedAudioCtx } from '../composables/audioPlayback'
import { i18n } from '../i18n'

export interface MidiNote {
  note: number
  startSec: number
  durationSec: number
  velocity: number
  channel: number
}

export interface MidiParsed {
  durationSec: number
  notes: MidiNote[]
  tempoBpm: number
}

function readVarLen(data: Uint8Array, offset: { val: number }): number {
  let value = 0
  let byte: number
  do {
    byte = data[offset.val++]
    value = (value << 7) | (byte & 0x7f)
  } while (byte & 0x80 && offset.val < data.length)
  return value
}

/**
 * A Standard MIDI File (also one wrapped in RIFF, as Windows saves some .mid/.rmi files) to notes in seconds.
 * Tempo changes from every track go into one tempo map, so the notes of a format-1 file's later tracks and the notes
 * after a tempo change are timed right; `tempoBpm` is the tempo where the music starts.
 */
export function parseMidiBytes(bytes: ArrayBuffer): MidiParsed {
  const data = new Uint8Array(bytes)
  const empty: MidiParsed = { durationSec: 0, notes: [], tempoBpm: 120 }
  const isTag = (at: number, tag: string): boolean =>
    at + 4 <= data.length && [...tag].every((c, i) => data[at + i] === c.charCodeAt(0))
  // MThd at the start, or a little further in a RIFF (RMID) wrapper
  let head = -1
  for (let i = 0; i + 14 <= data.length && i <= 64; i++) if (isTag(i, 'MThd')) { head = i; break }
  if (head < 0) return empty
  const division = (data[head + 12] << 8) | data[head + 13]
  // SMPTE timing (high bit set): frames per second times ticks per frame, the tempo does not apply
  const smpteSecPerTick = division & 0x8000
    ? 1 / ((256 - (division >> 8) === 29 ? 29.97 : 256 - (division >> 8)) * Math.max(1, division & 0xff))
    : 0
  const ppq = Math.max(1, division)

  type Raw = { tick: number; note: number; vel: number; channel: number }
  const tracks: Raw[][] = []
  const tempos: { tick: number; uspb: number }[] = []
  let offset = head + 8 + ((data[head + 4] << 24) | (data[head + 5] << 16) | (data[head + 6] << 8) | data[head + 7])
  while (offset + 8 <= data.length) {
    if (!isTag(offset, 'MTrk')) { offset++; continue }
    const trkLength = ((data[offset + 4] << 24) | (data[offset + 5] << 16) | (data[offset + 6] << 8) | data[offset + 7]) >>> 0
    offset += 8
    const trkEnd = Math.min(data.length, offset + trkLength)
    const pos = { val: offset }
    const events: Raw[] = []
    let tick = 0
    let runningStatus = 0
    while (pos.val < trkEnd) {
      tick += readVarLen(data, pos)
      let status = data[pos.val]
      if (status >= 0x80) pos.val++
      else if (runningStatus) status = runningStatus
      else { pos.val++; continue } // a data byte with no status to run on: skip it
      if (status === 0xff) {
        const metaType = data[pos.val++]
        const metaLen = readVarLen(data, pos)
        if (metaType === 0x51 && metaLen === 3) {
          const uspb = (data[pos.val] << 16) | (data[pos.val + 1] << 8) | data[pos.val + 2]
          if (uspb > 0) tempos.push({ tick, uspb })
        }
        pos.val += metaLen
        if (metaType === 0x2f) break // end of track
        continue
      }
      if (status === 0xf0 || status === 0xf7) {
        pos.val += readVarLen(data, pos)
        continue
      }
      // meta and sysex events above leave the running status of the channel messages alone
      runningStatus = status
      const msgType = status & 0xf0
      const channel = status & 0x0f
      if (msgType === 0x90 || msgType === 0x80) {
        const note = data[pos.val++]
        const vel = data[pos.val++]
        events.push({ tick, note, vel: msgType === 0x90 ? vel : 0, channel })
      } else if (msgType === 0xa0 || msgType === 0xb0 || msgType === 0xe0) {
        pos.val += 2
      } else if (msgType === 0xc0 || msgType === 0xd0) {
        pos.val += 1
      }
    }
    tracks.push(events)
    offset = trkEnd
  }

  // the tempo map: where each tempo starts, in ticks and in seconds (120 BPM until the first tempo event)
  tempos.sort((a, b) => a.tick - b.tick)
  const segments: { tick: number; sec: number; uspb: number }[] = [{ tick: 0, sec: 0, uspb: 500000 }]
  for (const t of tempos) {
    const last = segments[segments.length - 1]
    const sec = last.sec + ((t.tick - last.tick) * last.uspb) / 1e6 / ppq
    if (t.tick === last.tick) segments[segments.length - 1] = { tick: t.tick, sec: last.sec, uspb: t.uspb }
    else segments.push({ tick: t.tick, sec, uspb: t.uspb })
  }
  const segmentAt = (tick: number): { tick: number; sec: number; uspb: number } => {
    let i = segments.length - 1
    while (i > 0 && segments[i].tick > tick) i--
    return segments[i]
  }
  const toSec = (tick: number): number => {
    if (smpteSecPerTick) return tick * smpteSecPerTick
    const s = segmentAt(tick)
    return s.sec + ((tick - s.tick) * s.uspb) / 1e6 / ppq
  }

  const allNotes: MidiNote[] = []
  let maxTimeSec = 0
  let firstTick = Infinity
  for (const events of tracks) {
    const active = new Map<number, Raw>()
    const close = (on: Raw, endTick: number): void => {
      const startSec = toSec(on.tick)
      const endSec = toSec(endTick)
      allNotes.push({ note: on.note, startSec, durationSec: Math.max(0.05, endSec - startSec), velocity: on.vel / 127, channel: on.channel })
      maxTimeSec = Math.max(maxTimeSec, endSec)
      firstTick = Math.min(firstTick, on.tick)
    }
    for (const ev of events) {
      const key = (ev.channel << 8) | ev.note
      const open = active.get(key)
      if (open) { close(open, ev.tick); active.delete(key) } // a note off, or the same key struck again
      if (ev.vel > 0) active.set(key, ev)
    }
    // notes never released
    for (const on of active.values()) {
      allNotes.push({ note: on.note, startSec: toSec(on.tick), durationSec: 0.25, velocity: on.vel / 127, channel: on.channel })
      firstTick = Math.min(firstTick, on.tick)
    }
  }

  allNotes.sort((a, b) => a.startSec - b.startSec)
  return {
    durationSec: Math.max(1, maxTimeSec),
    notes: allNotes,
    tempoBpm: Math.round(60000000 / segmentAt(Number.isFinite(firstTick) ? firstTick : 0).uspb),
  }
}

export interface MidiSynthHandle {
  stop(): void
}

export function playMidiNotes(notes: MidiNote[], startOffsetSec = 0, onEnded?: () => void): MidiSynthHandle {
  const ctx = getSharedAudioCtx()
  const masterGain = ctx.createGain()
  masterGain.gain.setValueAtTime(0.3, ctx.currentTime)
  masterGain.connect(ctx.destination)

  const activeNodes: { osc: OscillatorNode; gain: GainNode }[] = []
  let stopped = false

  const startTime = ctx.currentTime
  let latestEnd = 0

  // Filter notes that start after or at startOffsetSec
  for (const n of notes) {
    if (n.startSec + n.durationSec <= startOffsetSec) continue
    const noteStart = Math.max(0, n.startSec - startOffsetSec)
    const noteDuration = n.durationSec - Math.max(0, startOffsetSec - n.startSec)
    if (noteDuration <= 0) continue

    const when = startTime + noteStart
    const freq = 440 * Math.pow(2, (n.note - 69) / 12)

    const osc = ctx.createOscillator()
    osc.type = n.channel === 9 ? 'square' : n.note < 48 ? 'triangle' : 'sine'
    osc.frequency.setValueAtTime(freq, when)

    const gain = ctx.createGain()
    const peakVol = Math.max(0.05, Math.min(0.8, n.velocity * 0.4))
    const attack = 0.01
    const release = Math.min(0.05, noteDuration)

    gain.gain.setValueAtTime(0, when)
    gain.gain.linearRampToValueAtTime(peakVol, when + attack)
    gain.gain.setValueAtTime(peakVol, Math.max(when + attack, when + noteDuration - release))
    gain.gain.linearRampToValueAtTime(0, when + noteDuration)

    osc.connect(gain)
    gain.connect(masterGain)

    osc.start(when)
    osc.stop(when + noteDuration + 0.05)

    activeNodes.push({ osc, gain })

    if (when + noteDuration > latestEnd) {
      latestEnd = when + noteDuration
    }
  }

  const endTimer = setTimeout(() => {
    if (!stopped && onEnded) onEnded()
  }, Math.max(0, (latestEnd - startTime) * 1000 + 100))

  return {
    stop() {
      stopped = true
      clearTimeout(endTimer)
      try {
        masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05)
        setTimeout(() => {
          for (const node of activeNodes) {
            try {
              node.osc.stop()
              node.osc.disconnect()
              node.gain.disconnect()
            } catch {}
          }
          masterGain.disconnect()
        }, 60)
      } catch {}
    },
  }
}

export function drawPianoRoll(
  canvas: HTMLCanvasElement,
  notes: MidiNote[],
  totalDuration: number,
  playheadSec?: number,
) {
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  const width = Math.max(1, rect.width)
  const height = Math.max(1, rect.height)

  canvas.width = width * dpr
  canvas.height = height * dpr

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.fillStyle = '#161922'
  ctx.fillRect(0, 0, width, height)

  if (notes.length === 0) {
    ctx.fillStyle = '#64748b'
    ctx.font = '11px sans-serif'
    ctx.fillText(i18n.global.t('storeErrors.notesNotFound'), 10, height / 2)
    return
  }

  let minNote = 127
  let maxNote = 0
  for (const n of notes) {
    if (n.note < minNote) minNote = n.note
    if (n.note > maxNote) maxNote = n.note
  }
  minNote = Math.max(0, minNote - 2)
  maxNote = Math.min(127, maxNote + 2)
  const noteRange = Math.max(12, maxNote - minNote + 1)

  // Grid lines
  ctx.strokeStyle = '#232936'
  ctx.lineWidth = 1
  for (let n = minNote; n <= maxNote; n++) {
    if (n % 12 === 0) {
      const y = height - ((n - minNote) / noteRange) * height
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
  }

  // Draw notes
  const dur = Math.max(1, totalDuration)
  for (const n of notes) {
    const x = (n.startSec / dur) * width
    const w = Math.max(2, (n.durationSec / dur) * width)
    const y = height - ((n.note - minNote + 1) / noteRange) * height
    const h = Math.max(2, height / noteRange - 1)

    // Color based on pitch
    const hue = ((n.note * 23) % 360)
    ctx.fillStyle = `hsl(${hue}, 80%, 60%)`
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, 1)
    ctx.fill()
  }

  // Playhead line
  if (playheadSec != null && playheadSec >= 0) {
    const px = (playheadSec / dur) * width
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(px, 0)
    ctx.lineTo(px, height)
    ctx.stroke()
  }
}
