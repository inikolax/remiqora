import { apiFetch, apiJson } from './http'
import type { TrackOrigin } from '../types'
import type { CoverCaption } from '../covers/caption/types'

export interface SavedTrack {
  id: number
  model: TrackOrigin
  created_at: string
  title: string
  lyrics: string
  seed: number | null
  duration_ms: number | null
  wall_ms: number | null
  params: Record<string, unknown>
  filename: string
  audio_url: string
  abc_url: string | null
  stems: Record<string, string> | null
  midi: Record<string, string> | null
  /** Marked with the star. */
  favorite: boolean
  /** Ids of the collections the track is in. */
  collections: number[]
  /** The track's tags, sorted case-insensitively. */
  tags: string[]
  /** When the track went to the trash (ISO UTC); null while it is in the library. */
  deleted_at: string | null
  /** The album cover ("/api/tracks/{id}/cover?v=<mtime>"; add "&size=thumb" for 256 px); null without one or on an older backend. */
  cover_url?: string | null
  /** The description its cover was last drawn from (or was asked to be); null until one was made or given. */
  cover_prompt?: string | null
  /** The caption drawn over the cover (artist, title, year); null without one or on an older backend. */
  cover_caption?: CoverCaption | null
  /** The baked captioned JPEG; null without one, or when the cover changed after it was baked (stale). */
  cover_captioned_url?: string | null
}

export interface SaveTrackMeta {
  model: TrackOrigin
  title: string
  lyrics: string
  seed?: number
  duration_ms?: number
  wall_ms?: number
  params?: Record<string, unknown>
}

export async function saveTrack(meta: SaveTrackMeta, audio: Blob, audioExt: string, abcText?: string | null): Promise<SavedTrack> {
  const form = new FormData()
  form.append('model', meta.model)
  form.append('title', meta.title)
  form.append('lyrics', meta.lyrics)
  if (meta.seed != null) form.append('seed', String(meta.seed))
  if (meta.duration_ms != null) form.append('duration_ms', String(meta.duration_ms))
  if (meta.wall_ms != null) form.append('wall_ms', String(meta.wall_ms))
  form.append('params', JSON.stringify(meta.params || {}))
  if (abcText) form.append('abc', abcText)
  form.append('audio', audio, `track.${audioExt}`)
  return apiFetch<SavedTrack>('/api/tracks', { method: 'POST', body: form })
}

export async function uploadTrack(file: File, title?: string): Promise<SavedTrack> {
  const form = new FormData()
  form.append('audio', file)
  if (title) form.append('title', title)
  return apiFetch<SavedTrack>('/api/tracks/upload', { method: 'POST', body: form })
}

export async function listTracks(model?: TrackOrigin): Promise<SavedTrack[]> {
  const qs = model ? `?model=${encodeURIComponent(model)}` : ''
  const json = await apiFetch<{ data: SavedTrack[] }>(`/api/tracks${qs}`)
  return json.data
}

export function renameTrack(id: number, title: string): Promise<SavedTrack> {
  return apiJson<SavedTrack>(`/api/tracks/${id}`, { title }, 'PUT')
}

export function setFavorite(id: number, favorite: boolean): Promise<SavedTrack> {
  return apiJson<SavedTrack>(`/api/tracks/${id}`, { favorite }, 'PUT')
}

/** Moves the track to the trash; `permanent` deletes it for good (files, stems, notes and all). */
export async function deleteTrack(id: number, opts: { permanent?: boolean } = {}): Promise<void> {
  await apiFetch(`/api/tracks/${id}${opts.permanent ? '?permanent=true' : ''}`, { method: 'DELETE' })
}

/** The tracks in the trash, the most recently trashed first. */
export async function listTrash(): Promise<SavedTrack[]> {
  return (await apiFetch<{ data: SavedTrack[] }>('/api/tracks/trash')).data
}

/** Deletes everything in the trash for good; how many tracks went. */
export async function emptyTrash(): Promise<number> {
  return (await apiJson<{ purged: number }>('/api/tracks/trash/empty', {})).purged
}

export type BulkAction = 'trash' | 'restore' | 'purge' | 'favorite' | 'unfavorite' | 'tag' | 'untag' | 'collect' | 'uncollect'

/** One action on many tracks at once, in one transaction: the tracks as they are afterwards ([] for purge). */
export function bulkTracks(ids: number[], action: BulkAction, extra: { tag?: string; collection_id?: number } = {}): Promise<{ data: SavedTrack[]; missing?: number[] }> {
  return apiJson<{ data: SavedTrack[]; missing?: number[] }>('/api/tracks/bulk', { ids, action, ...extra })
}

/** An editor project that uses a track (its clips play the track or one of its stems). */
export interface ProjectRef { id: number; name: string }

/** The editor projects whose clips use this track: ask before it goes to the trash or for good. */
export async function trackUsage(id: number): Promise<ProjectRef[]> {
  return (await apiFetch<{ projects: ProjectRef[] }>(`/api/tracks/${id}/usage`)).projects
}

/** The same for many tracks at once (a bulk trash), by track id; a track no project uses has an empty list. */
export async function tracksUsage(ids: number[]): Promise<Record<number, ProjectRef[]>> {
  const usage = (await apiFetch<{ usage: Record<string, ProjectRef[]> }>(`/api/tracks/usage?ids=${ids.join(',')}`)).usage
  return Object.fromEntries(Object.entries(usage).map(([k, v]) => [Number(k), v]))
}

/** Replaces the track's whole tag list. */
export function setTrackTags(id: number, tags: string[]): Promise<SavedTrack> {
  return apiJson<SavedTrack>(`/api/tracks/${id}`, { tags }, 'PUT')
}

export function trackAudioUrl(id: number): string {
  return `/api/tracks/${id}/audio`
}

export async function trackAbc(id: number): Promise<string> {
  const resp = await fetch(`/api/tracks/${id}/abc`)
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
  return resp.text()
}
