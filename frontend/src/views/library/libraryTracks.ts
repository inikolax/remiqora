import type { SavedTrack } from '../../api/tracks'
import type { ModelId, TrackOrigin } from '../../types'
import { songName, withoutServiceTags } from '../../utils/trackTitle'

/** A saved track as the library shows it, whatever made it: an engine, the editor or an upload. */
export interface LibTrack {
  id: number
  origin: TrackOrigin
  /** The full title (the editable one) and what the screens call it (songName: the name, else the hook of its
   *  words, else empty for "Untitled"); `promptTitle` when the stored title is only the prompt. */
  title: string
  shortTitle: string
  promptTitle: boolean
  style: string
  lyrics: string
  createdAt: number
  durationSec: number | null
  wallSec: number | null
  seed: number | null
  audioUrl: string
  filename: string
  hasStems: boolean
  hasMidi: boolean
  hasScore: boolean
  /** A part made by the editor's AI arranger, not a whole track. */
  aiPart: boolean
  params: Record<string, unknown>
  /** When it went to the trash; null for a track in the library. */
  deletedAt: number | null
}

/** Takes of one song: the same origin, name and text. */
export interface LibSong {
  key: string
  takes: LibTrack[]
  /** The newest take: the song's row shows and plays it. */
  lead: LibTrack
  latest: number
}

export const ENGINES: ModelId[] = ['yue2', 'ace_step', 'stable_audio']
export const isEngine = (origin: TrackOrigin): origin is ModelId => (ENGINES as TrackOrigin[]).includes(origin)

export function toLibTrack(t: SavedTrack): LibTrack {
  const p = t.params || {}
  const style = String(p.style || p.prompt || p.sample_query || p.caption || '')
  const named = songName(t.title || '', style, t.lyrics || '')
  return {
    id: t.id, origin: t.model, title: t.title, shortTitle: named.name, promptTitle: named.prompt, style, lyrics: t.lyrics || '',
    createdAt: new Date(t.created_at).getTime() || 0, durationSec: t.duration_ms ? t.duration_ms / 1000 : null, wallSec: t.wall_ms ? t.wall_ms / 1000 : null,
    seed: t.seed, audioUrl: t.audio_url, filename: t.filename, hasStems: !!t.stems && Object.keys(t.stems).length > 0, hasMidi: !!t.midi && Object.keys(t.midi).length > 0,
    hasScore: !!t.abc_url, aiPart: p.ai_part === true, params: p,
    deletedAt: t.deleted_at ? new Date(t.deleted_at).getTime() || null : null,
  }
}

/** The line under a row's title: the style (never in the title's place, see songName). */
export function subtitleOf(track: LibTrack): string {
  return withoutServiceTags(track.style)
}

export function groupSongs(tracks: LibTrack[]): LibSong[] {
  const map = new Map<string, LibSong>()
  for (const track of tracks) {
    // an AI part or an upload stands alone; generated takes of the same text are one song
    const key = isEngine(track.origin) ? `${track.origin}|${track.title.trim().toLowerCase()}|${(track.lyrics || track.style).trim().toLowerCase()}` : `id:${track.id}`
    const song = map.get(key)
    if (song) song.takes.push(track)
    else map.set(key, { key, takes: [track], lead: track, latest: track.createdAt })
  }
  for (const song of map.values()) {
    song.takes.sort((a, b) => a.createdAt - b.createdAt || a.id - b.id)
    song.lead = song.takes[song.takes.length - 1]
    song.latest = song.lead.createdAt
  }
  return [...map.values()]
}

export const playerKey = (id: number): string => `track:${id}`
