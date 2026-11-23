/**
 * A Standard MIDI File read for the note editor's import: notes with their track and channel, track names, the
 * first tempo, time and key signatures. Unlike `parseMidiBytes` (built for playback, times in real seconds through
 * the tempo map) the times here are in beats, so a file with tempo changes still lands on the bar grid; `startSec`
 * and `durationSec` are those beats at the first tempo, which makes the result usable wherever a MidiParsed is.
 */

export interface MidiFileNote {
  note: number
  /** Quarter notes from the start. */
  beat: number
  beats: number
  /** `beat` at the first tempo. */
  startSec: number
  durationSec: number
  velocity: number
  channel: number
  /** Index of the MTrk chunk. */
  track: number
}

export interface MidiFileInfo {
  notes: MidiFileNote[]
  /** Track names (FF 03), by track index; '' when it has none. */
  trackNames: string[]
  /** Quarter notes per minute at the start. */
  tempoBpm: number
  /** From the first time signature (FF 58). */
  meter?: [number, number]
  /** From the first key signature (FF 59): "Dm", "Bb"... */
  key?: string
  durationSec: number
}

const MAJOR_BY_FIFTHS: Record<number, string> = {
  [-7]: 'Cb', [-6]: 'Gb', [-5]: 'Db', [-4]: 'Ab', [-3]: 'Eb', [-2]: 'Bb', [-1]: 'F', 0: 'C', 1: 'G', 2: 'D', 3: 'A', 4: 'E', 5: 'B', 6: 'F#', 7: 'C#',
}
const MINOR_BY_FIFTHS: Record<number, string> = {
  [-7]: 'Abm', [-6]: 'Ebm', [-5]: 'Bbm', [-4]: 'Fm', [-3]: 'Cm', [-2]: 'Gm', [-1]: 'Dm', 0: 'Am', 1: 'Em', 2: 'Bm', 3: 'F#m', 4: 'C#m', 5: 'G#m', 6: 'D#m', 7: 'A#m',
}

/** A time signature as the score can hold it: 1-32 beats of a 2, 4, 8 or 16 (FF 58 gives the power of two); a
 *  broken one is skipped (the next one, or 4/4). */
export function validMeter(num: number, pow2: number): [number, number] | undefined {
  const den = Math.pow(2, pow2)
  if (!Number.isInteger(num) || num < 1 || num > 32) return undefined
  if (!(den >= 2 && den <= 16)) return undefined
  return [num, den]
}

export function readMidiFile(bytes: ArrayBuffer | Uint8Array): MidiFileInfo {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  const empty: MidiFileInfo = { notes: [], trackNames: [], tempoBpm: 120, durationSec: 0 }
  const isTag = (at: number, tag: string): boolean => at + 4 <= data.length && [...tag].every((c, i) => data[at + i] === c.charCodeAt(0))
  let head = -1
  for (let i = 0; i + 14 <= data.length && i <= 64; i++) if (isTag(i, 'MThd')) { head = i; break }
  if (head < 0) return empty
  const division = (data[head + 12] << 8) | data[head + 13]
  // SMPTE files have no beats: read them as if one 'beat' were 1/4 s
  const ppq = division & 0x8000 ? Math.max(1, (256 - (division >> 8)) * (division & 0xff)) / 4 : Math.max(1, division)
  const u32 = (at: number): number => ((data[at] << 24) | (data[at + 1] << 16) | (data[at + 2] << 8) | data[at + 3]) >>> 0
  const varLen = (pos: { v: number }): number => {
    let value = 0
    let b: number
    do { b = data[pos.v++]; value = (value << 7) | (b & 0x7f) } while (b & 0x80 && pos.v < data.length)
    return value
  }

  const notes: MidiFileNote[] = []
  const trackNames: string[] = []
  const tempos: { tick: number; uspb: number }[] = []
  let meter: [number, number] | undefined
  let key: string | undefined
  let offset = head + 8 + u32(head + 4)
  let track = 0
  const raw: { tick: number; end: number; note: number; vel: number; channel: number; track: number }[] = []
  while (offset + 8 <= data.length) {
    if (!isTag(offset, 'MTrk')) { offset++; continue }
    const len = u32(offset + 4)
    offset += 8
    const trkEnd = Math.min(data.length, offset + len)
    const pos = { v: offset }
    let tick = 0
    let running = 0
    let name = ''
    const open = new Map<number, { tick: number; vel: number }>()
    while (pos.v < trkEnd) {
      tick += varLen(pos)
      let status = data[pos.v]
      if (status >= 0x80) pos.v++
      else if (running) status = running
      else { pos.v++; continue }
      if (status === 0xff) {
        const type = data[pos.v++]
        const n = varLen(pos)
        const body = data.subarray(pos.v, pos.v + n)
        if (type === 0x51 && n === 3) tempos.push({ tick, uspb: (body[0] << 16) | (body[1] << 8) | body[2] })
        else if (type === 0x03 && !name) name = new TextDecoder('utf-8', { fatal: false }).decode(body).replace(/\0/g, '').trim()
        else if (type === 0x58 && n >= 2 && !meter) meter = validMeter(body[0], body[1])
        else if (type === 0x59 && n >= 2 && !key) {
          const sf = body[0] > 127 ? body[0] - 256 : body[0]
          key = (body[1] ? MINOR_BY_FIFTHS : MAJOR_BY_FIFTHS)[sf]
        }
        pos.v += n
        if (type === 0x2f) break
        continue
      }
      if (status === 0xf0 || status === 0xf7) { pos.v += varLen(pos); continue }
      running = status
      const kind = status & 0xf0
      const channel = status & 0x0f
      if (kind === 0x90 || kind === 0x80) {
        const note = data[pos.v++]
        const vel = data[pos.v++]
        const k = (channel << 8) | note
        const on = open.get(k)
        if (on) { raw.push({ tick: on.tick, end: tick, note, vel: on.vel, channel, track }); open.delete(k) }
        if (kind === 0x90 && vel > 0) open.set(k, { tick, vel })
      } else if (kind === 0xa0 || kind === 0xb0 || kind === 0xe0) pos.v += 2
      else if (kind === 0xc0 || kind === 0xd0) pos.v += 1
    }
    for (const [k, on] of open) raw.push({ tick: on.tick, end: on.tick + ppq / 4, note: k & 0xff, vel: on.vel, channel: k >> 8, track })
    trackNames.push(name)
    track++
    offset = trkEnd
  }

  tempos.sort((a, b) => a.tick - b.tick)
  let firstTick = raw.length ? Infinity : 0
  for (const r of raw) if (r.tick < firstTick) firstTick = r.tick
  // the tempo where the music starts
  let uspb = 500000
  for (const t of tempos) if (t.tick <= firstTick) uspb = t.uspb
  if (!tempos.some((t) => t.tick <= firstTick) && tempos.length) uspb = tempos[0].uspb
  const tempoBpm = Math.round((60000000 / uspb) * 100) / 100
  const secPerBeat = 60 / tempoBpm
  for (const r of raw) {
    const beat = r.tick / ppq
    const beats = Math.max(1e-6, (r.end - r.tick) / ppq)
    notes.push({ note: r.note, beat, beats, startSec: beat * secPerBeat, durationSec: beats * secPerBeat, velocity: r.vel / 127, channel: r.channel, track: r.track })
  }
  notes.sort((a, b) => a.beat - b.beat || a.note - b.note)
  const durationSec = notes.reduce((m, n) => Math.max(m, n.startSec + n.durationSec), 0)
  return { notes, trackNames, tempoBpm, ...(meter ? { meter } : {}), ...(key ? { key } : {}), durationSec }
}
