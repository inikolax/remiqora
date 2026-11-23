// Album covers (backend/app/api/routes_covers.py): one queue job per track (engine "cover", Z-Image Turbo), the
// automatic description of a track's picture, and taking a cover off again.
import { ApiError, apiFetch, apiJson } from './http'
import type { ServerJob } from './jobs'
import type { SavedTrack } from './tracks'
import type { CoverCaption } from '../covers/caption/types'

/** Queues a cover for each track; `prompts` replaces the automatic description of some of them. */
export async function makeCovers(trackIds: number[], opts: { prompts?: Record<number, string>; seed?: number } = {}): Promise<ServerJob[]> {
  const body: Record<string, unknown> = { track_ids: trackIds }
  if (opts.prompts && Object.keys(opts.prompts).length) body.prompts = Object.fromEntries(Object.entries(opts.prompts).map(([k, v]) => [String(k), v]))
  if (opts.seed != null) body.seed = opts.seed
  return (await apiJson<{ jobs: ServerJob[] }>('/api/covers', body)).jobs
}

/** The description the track's cover is drawn from: the one kept on the track ("saved": made or given before), else
 *  the server's automatic one ("auto"). Editable before making a cover. */
export interface CoverPrompt {
  prompt: string
  source: 'saved' | 'auto'
}
export async function coverPrompt(trackId: number): Promise<CoverPrompt> {
  const r = await apiFetch<{ prompt: string; source?: 'saved' | 'auto' }>(`/api/covers/prompt/${trackId}`)
  return { prompt: r.prompt, source: r.source ?? 'auto' }
}

/** Takes the cover off the track; the track as it is now. */
export function removeCover(trackId: number): Promise<SavedTrack> {
  return apiFetch<SavedTrack>(`/api/tracks/${trackId}/cover`, { method: 'DELETE' })
}

/** Sets the cover's caption with its baked JPEG ("data:image/jpeg;base64,...", 1024x1024), or clears both with
 *  `caption` null; the track as it is now. `coverV` is the version (`v`) of the cover the image was baked on: the
 *  server stores nothing when the cover was made again since (409, see `isCoverChanged`). */
export function setCoverCaption(trackId: number, caption: CoverCaption | null, image: string | null, coverV?: string | null): Promise<SavedTrack> {
  const body: Record<string, unknown> = { caption, image: caption ? image : null }
  if (caption && coverV) body.cover_v = coverV
  return apiJson<SavedTrack>(`/api/tracks/${trackId}/cover/caption`, body, 'PUT')
}

/** The version of a cover url (its `v` query parameter), or null when it has none. */
export function coverVersion(url: string): string | null {
  try {
    return new URL(url, window.location.origin).searchParams.get('v')
  } catch {
    return null
  }
}

/** The server refused a caption baked on a cover that has been made again since. */
export const isCoverChanged = (err: unknown): boolean => err instanceof ApiError && err.status === 409 && /changed/i.test(err.message)

/** The 256 px JPEG of a cover url. */
export const thumbUrl = (url: string): string => `${url}${url.includes('?') ? '&' : '?'}size=thumb`
