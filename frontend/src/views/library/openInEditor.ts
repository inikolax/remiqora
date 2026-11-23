import * as projectsApi from '../../api/projects'
import { decodeStem, defaultChannelSettings, defaultMasterSettings } from '../../audio/mixerEngine'
import type { Clip, TimelineProject } from '../../audio/timelineTypes'
import { trackBpm } from '../../utils/bpmFromText'
import type { LibTrack } from './libraryTracks'

/**
 * A new editor project with the track as one clip on one lane, at the track's tempo when it is known (the way the
 * stems panel opens its stems). Returns the project's id for /editor/:id.
 */
export async function projectFromTrack(track: LibTrack, name: string): Promise<number> {
  const buffer = await decodeStem(track.audioUrl)
  const bpm = trackBpm(track.params, track.style, track.title) || 120
  const clip: Clip = {
    id: crypto.randomUUID(),
    type: 'audio',
    sourceUrl: track.audioUrl,
    sourceLabel: name,
    timelineStart: 0,
    trimStart: 0,
    trimEnd: buffer.duration,
    originalBpm: bpm,
  }
  const project: TimelineProject = {
    version: 1,
    lanes: [{ id: crypto.randomUUID(), name, settings: defaultChannelSettings(), clips: [clip] }],
    master: defaultMasterSettings(),
    pxPerSecond: 40,
    bpm,
    snapEnabled: false,
  }
  const created = await projectsApi.createProject(name, project)
  return created.id
}
