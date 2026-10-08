/**
 * Project export for other DAWs: every audible lane rendered on its own from 0:00 (lane volume, pan and
 * effects included, neutral master), all the same length, plus the tempo.
 *  - "stems": a ZIP with stems/NN Name.wav, a Reaper project (.RPP) and a README.
 *  - "dawproject": a DAWproject container (Bitwig Studio, Studio One, Cubase 14+) - project.xml in the
 *    layout of the format's own example (https://github.com/bitwig/dawproject), audio inside.
 */
import { defaultChannelSettings, defaultMasterSettings } from '../audio/mixerEngine'
import { effectiveLaneGain } from '../audio/timelineEngine'
import { projectDuration } from '../audio/timelineTypes'
import type { TimelineLane, TimelineProject } from '../audio/timelineTypes'
import { encodeWav } from '../audio/wavEncoder'
import { TRACK_COLORS } from './trackColors'
import { makeZip } from './zip'
import type { ZipEntry } from './zip'

type Render = (project: TimelineProject, buffers: Map<string, AudioBuffer>, totalDurationSec: number) => Promise<AudioBuffer>

interface Stem {
  name: string
  /** File name without folder, e.g. "01 Drums.wav". */
  file: string
  color: string
  wav: Uint8Array
  seconds: number
  sampleRate: number
}

export type DawExportKind = 'stems' | 'dawproject'

function safeFileName(name: string): string {
  // eslint-disable-next-line no-control-regex
  return name.replace(/[\\/:*?"<>|\x00-\x1f]/g, '_').replace(/\s+/g, ' ').trim().slice(0, 80) || 'Track'
}

function xml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function laneHex(lane: TimelineLane): string {
  return TRACK_COLORS.find((c) => c.id === lane.colorId)?.baseHex ?? '#a855f7'
}

/** Lanes that are heard in the mix (mute / solo respected) and have at least one audible clip. */
export function exportableLanes(project: TimelineProject): TimelineLane[] {
  const anySolo = project.lanes.some((l) => l.settings.solo)
  return project.lanes.filter((l) => effectiveLaneGain(l.settings, anySolo) > 0 && l.clips.some((c) => !c.muted))
}

/**
 * Samples by which the effect graph delays its output (the DynamicsCompressor lookahead on the lane,
 * the master and the limiter, ~18 ms in Chromium), measured by rendering one impulse through it.
 * Stems are shifted back by this much so they start exactly at the project's 0:00 in another DAW.
 */
async function measureLatency(project: TimelineProject, render: Render): Promise<number> {
  const sr = 48000
  const probe = new AudioBuffer({ numberOfChannels: 2, length: Math.round(0.5 * sr), sampleRate: sr })
  probe.getChannelData(0)[Math.round(0.1 * sr)] = 0.5
  probe.getChannelData(1)[Math.round(0.1 * sr)] = 0.5
  const lane: TimelineLane = {
    id: 'latency-probe', name: 'latency-probe', settings: defaultChannelSettings(),
    clips: [{ id: 'latency-probe', sourceUrl: 'latency-probe', sourceLabel: '', timelineStart: 0, trimStart: 0, trimEnd: 0.5,
      fadeInDuration: 0.005, fadeOutDuration: 0.005 }],
  }
  const out = await render({ ...project, lanes: [lane], master: defaultMasterSettings(), loopRegion: undefined },
    new Map([['latency-probe', probe]]), 0.5)
  const data = out.getChannelData(0)
  let at = 0
  for (let i = 1; i < data.length; i++) if (Math.abs(data[i]) > Math.abs(data[at])) at = i
  return Math.max(0, at - Math.round(0.1 * out.sampleRate))
}

async function renderStems(
  project: TimelineProject,
  buffers: Map<string, AudioBuffer>,
  render: Render,
  onProgress?: (done: number, total: number) => void,
): Promise<Stem[]> {
  const lanes = exportableLanes(project)
  const end = projectDuration(project)
  const latency = await measureLatency(project, render)
  const rendered: AudioBuffer[] = []
  for (const [i, lane] of lanes.entries()) {
    onProgress?.(i, lanes.length)
    const alone = { ...lane, settings: { ...lane.settings, muted: false, solo: false } }
    // Render a little past the end so dropping the latency at the start does not cut the tail.
    const tail = latency / 48000 + 0.05
    rendered.push(await render({ ...project, lanes: [alone], master: defaultMasterSettings(), loopRegion: undefined }, buffers, end + tail))
  }
  onProgress?.(lanes.length, lanes.length)
  // Same length for every stem (effect tails differ), so DAWs line them up without trimming.
  const length = Math.max(1, ...rendered.map((b) => b.length - latency))
  const used = new Set<string>()
  const stems: Stem[] = []
  for (const [i, buf] of rendered.entries()) {
    const padded = new AudioBuffer({ numberOfChannels: 2, length, sampleRate: buf.sampleRate })
    for (let c = 0; c < 2; c++) padded.copyToChannel(buf.getChannelData(Math.min(c, buf.numberOfChannels - 1)).subarray(latency), c)
    let base = `${String(i + 1).padStart(2, '0')} ${safeFileName(lanes[i].name)}`
    while (used.has(base.toLowerCase())) base += '_'
    used.add(base.toLowerCase())
    stems.push({
      name: lanes[i].name || `Track ${i + 1}`,
      file: `${base}.wav`,
      color: laneHex(lanes[i]),
      wav: new Uint8Array(await encodeWav(padded).arrayBuffer()),
      seconds: length / buf.sampleRate,
      sampleRate: buf.sampleRate,
    })
  }
  return stems
}

/** Reaper project; FILE paths are relative to the .RPP, which Reaper resolves next to it. */
function reaperProject(stems: Stem[], bpm: number): string {
  const rpp = (s: string) => s.replace(/"/g, "'")
  const color = (hex: string) => {
    const n = parseInt(hex.slice(1), 16)
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
    return (r | (g << 8) | (b << 16) | 0x1000000) >>> 0 // Windows COLORREF + "custom colour" flag
  }
  const tracks = stems.map((s) => [
    '  <TRACK',
    `    NAME "${rpp(s.name)}"`,
    `    PEAKCOL ${color(s.color)}`,
    '    <ITEM',
    '      POSITION 0',
    `      LENGTH ${s.seconds.toFixed(6)}`,
    `      NAME "${rpp(s.name)}"`,
    '      <SOURCE WAVE',
    `        FILE "stems/${rpp(s.file)}"`,
    '      >',
    '    >',
    '  >',
  ].join('\n'))
  return [
    '<REAPER_PROJECT 0.1 "6.0" 0',
    `  TEMPO ${bpm} 4 4`,
    `  SAMPLERATE ${stems[0]?.sampleRate ?? 48000} 0 0`,
    ...tracks,
    '>',
    '',
  ].join('\n')
}

function dawProjectXml(stems: Stem[], bpm: number): string {
  let n = 0
  const id = () => `id${n++}`
  const f = (v: number) => v.toFixed(6)
  const tempoId = id(), sigId = id()
  const master = { track: id(), channel: id(), mute: id(), pan: id(), vol: id(), lanes: id(), clips: id() }
  const tracks = stems.map((s) => ({
    s, track: id(), channel: id(), mute: id(), pan: id(), vol: id(),
    lanes: id(), clips: id(), inner: id(), warps: id(), audio: id(),
  }))
  const channel = (role: string, cid: string, mute: string, pan: string, vol: string, dest?: string) => [
    `      <Channel audioChannels="2"${dest ? ` destination="${dest}"` : ''} role="${role}" solo="false" id="${cid}">`,
    `        <Mute value="false" id="${mute}" name="Mute"/>`,
    `        <Pan max="1.000000" min="0.000000" unit="normalized" value="0.500000" id="${pan}" name="Pan"/>`,
    `        <Volume max="2.000000" min="0.000000" unit="linear" value="1.000000" id="${vol}" name="Volume"/>`,
    '      </Channel>',
  ].join('\n')
  const structure = tracks.map((t) => [
    `    <Track contentType="audio" loaded="true" id="${t.track}" name="${xml(t.s.name)}" color="${t.s.color}">`,
    channel('regular', t.channel, t.mute, t.pan, t.vol, master.channel),
    '    </Track>',
  ].join('\n'))
  const lanes = tracks.map((t) => {
    const beats = (t.s.seconds * bpm) / 60
    return [
      `      <Lanes track="${t.track}" id="${t.lanes}">`,
      `        <Clips id="${t.clips}">`,
      `          <Clip time="0.0" duration="${f(beats)}" playStart="0.0" fadeTimeUnit="beats" fadeInTime="0.0" fadeOutTime="0.0" name="${xml(t.s.name)}">`,
      `            <Clips id="${t.inner}">`,
      `              <Clip time="0.0" duration="${f(beats)}" contentTimeUnit="beats" playStart="0.0" fadeTimeUnit="beats" fadeInTime="0.0" fadeOutTime="0.0">`,
      `                <Warps contentTimeUnit="seconds" timeUnit="beats" id="${t.warps}">`,
      `                  <Audio algorithm="stretch" channels="2" duration="${f(t.s.seconds)}" sampleRate="${t.s.sampleRate}" id="${t.audio}">`,
      `                    <File path="audio/${xml(t.s.file)}"/>`,
      '                  </Audio>',
      '                  <Warp time="0.0" contentTime="0.0"/>',
      `                  <Warp time="${f(beats)}" contentTime="${f(t.s.seconds)}"/>`,
      '                </Warps>',
      '              </Clip>',
      '            </Clips>',
      '          </Clip>',
      '        </Clips>',
      '      </Lanes>',
    ].join('\n')
  })
  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Project version="1.0">',
    '  <Application name="Remiqora" version="1.0"/>',
    '  <Transport>',
    `    <Tempo max="666.000000" min="20.000000" unit="bpm" value="${f(bpm)}" id="${tempoId}" name="Tempo"/>`,
    `    <TimeSignature denominator="4" numerator="4" id="${sigId}"/>`,
    '  </Transport>',
    '  <Structure>',
    ...structure,
    `    <Track contentType="audio notes" loaded="true" id="${master.track}" name="Master">`,
    channel('master', master.channel, master.mute, master.pan, master.vol),
    '    </Track>',
    '  </Structure>',
    `  <Arrangement id="${id()}">`,
    `    <Lanes timeUnit="beats" id="${id()}">`,
    ...lanes,
    `      <Lanes track="${master.track}" id="${master.lanes}">`,
    `        <Clips id="${master.clips}"/>`,
    '      </Lanes>',
    '    </Lanes>',
    '  </Arrangement>',
    '  <Scenes/>',
    '</Project>',
    '',
  ].join('\n')
}

function metadataXml(title: string): string {
  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<MetaData>',
    `  <Title>${xml(title)}</Title>`,
    '  <Comment>Exported from Remiqora</Comment>',
    '</MetaData>',
    '',
  ].join('\n')
}

/**
 * Renders the stems and packs them. `readme` is the text for README.txt in the stems ZIP (localised by
 * the caller). Returns the file to download and its suggested name.
 */
export async function exportForDaw(
  kind: DawExportKind,
  project: TimelineProject,
  buffers: Map<string, AudioBuffer>,
  render: Render,
  projectName: string,
  readme: (bpm: number, files: string[]) => string,
  onProgress?: (done: number, total: number) => void,
): Promise<{ blob: Blob; fileName: string }> {
  const stems = await renderStems(project, buffers, render, onProgress)
  if (stems.length === 0) throw new Error('nothing to export')
  const bpm = project.bpm || 120
  const enc = new TextEncoder()
  const base = safeFileName(projectName || 'Remiqora')
  if (kind === 'dawproject') {
    const entries: ZipEntry[] = [
      { name: 'project.xml', data: enc.encode(dawProjectXml(stems, bpm)) },
      { name: 'metadata.xml', data: enc.encode(metadataXml(projectName || base)) },
      ...stems.map((s) => ({ name: `audio/${s.file}`, data: s.wav })),
    ]
    return { blob: makeZip(entries), fileName: `${base}.dawproject` }
  }
  const entries: ZipEntry[] = [
    ...stems.map((s) => ({ name: `stems/${s.file}`, data: s.wav })),
    { name: `${base}.RPP`, data: enc.encode(reaperProject(stems, bpm)) },
    { name: 'README.txt', data: enc.encode(readme(bpm, stems.map((s) => `stems/${s.file}`))) },
  ]
  return { blob: makeZip(entries), fileName: `${base} - stems.zip` }
}
