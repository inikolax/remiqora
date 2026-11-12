import type { ChannelSettings, MasterSettings } from './mixerEngine'
import type { MidiNote } from './miniMidiPlayer'

export type ClipType = 'audio' | 'midi'

export interface Clip {
  id: string
  type?: ClipType
  sourceUrl?: string
  sourceLabel: string
  /** Position on the global timeline, in seconds. */
  timelineStart: number
  /** Offset into the source audio where playback of this clip begins, in seconds. */
  trimStart: number
  /** Offset into the source audio where playback of this clip ends, in seconds. */
  trimEnd: number
  fadeInDuration?: number
  fadeOutDuration?: number
  warpEnabled?: boolean
  originalBpm?: number
  notes?: MidiNote[]
  instrument?: 'sawtooth' | 'square' | 'sine' | 'triangle'
  muted?: boolean
  solo?: boolean
}

/** What a click on a clip does: move and trim it, cut it in two, or erase a piece of it. */
export type EditorTool = 'select' | 'knife' | 'eraser'

export interface TimelineLane {
  id: string
  name: string
  clips: Clip[]
  settings: ChannelSettings
  colorId?: string
}

export interface TimelineProject {
  version: 1
  lanes: TimelineLane[]
  master: MasterSettings
  pxPerSecond: number
  bpm: number
  snapEnabled: boolean
  loopRegion?: { start: number; end: number; enabled: boolean }
}

/**
 * Ratio between stretched (timeline) seconds and source seconds for a clip.
 * A warped clip's stretched buffer has length `source / (projectBpm / originalBpm)`,
 * so every source-domain value (trimStart, trimEnd, note times) is multiplied by
 * `originalBpm / projectBpm` to land in the stretched domain. This is the single
 * place that formula lives; the drawing code, snapping, split/duplicate and the
 * playback/render engine must all go through it so they cannot disagree.
 */
export function stretchFactor(clip: Pick<Clip, 'warpEnabled' | 'originalBpm'>, projectBpm: number = 120): number {
  if (clip.warpEnabled && clip.originalBpm) {
    return clip.originalBpm / (projectBpm || 120)
  }
  return 1.0
}

/** Key of a clip's time-stretched buffer (for the current project BPM) in the editor's buffer map. */
export function warpKey(clip: Pick<Clip, 'sourceUrl' | 'originalBpm'>, projectBpm: number = 120): string {
  return `${clip.sourceUrl}_warp_${clip.originalBpm}_${projectBpm || 120}`
}

/**
 * The buffer to play or draw for an audio clip, with the stretch factor that
 * buffer actually carries. Offsets into it are `source seconds * sf`.
 *
 * Right after Warp is turned on or the BPM changes, the stretched buffer is
 * still being built. Until it exists this returns the source buffer with
 * sf = 1, so trims, waveforms and playback address the source in its own
 * time instead of applying the new ratio to a buffer that was never stretched.
 */
export function clipBuffer(
  clip: Pick<Clip, 'sourceUrl' | 'warpEnabled' | 'originalBpm'>,
  projectBpm: number,
  buffers: Map<string, AudioBuffer>,
): { buffer: AudioBuffer; sf: number } | null {
  if (!clip.sourceUrl) return null
  const sf = stretchFactor(clip, projectBpm)
  if (sf !== 1) {
    const stretched = buffers.get(warpKey(clip, projectBpm))
    if (stretched) return { buffer: stretched, sf }
  }
  const source = buffers.get(clip.sourceUrl)
  return source ? { buffer: source, sf: 1 } : null
}

export function clipDuration(clip: Clip, projectBpm: number = 120): number {
  return (clip.trimEnd - clip.trimStart) * stretchFactor(clip, projectBpm)
}

export function clipEnd(clip: Clip, projectBpm: number = 120): number {
  return clip.timelineStart + clipDuration(clip, projectBpm)
}

export function projectDuration(project: TimelineProject): number {
  let max = 0
  for (const lane of project.lanes) {
    for (const clip of lane.clips) {
      max = Math.max(max, clipEnd(clip, project.bpm))
    }
  }
  return max
}
