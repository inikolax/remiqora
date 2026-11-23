import { apiFetch, apiJson } from './http'

/** A tag and how many tracks in the library (not the trash) carry it. */
export interface TagInfo {
  name: string
  count: number
}

const BASE = '/api/tags'
const at = (name: string): string => `${BASE}/${encodeURIComponent(name)}`

/** Every tag of the tracks in the library, sorted by name. */
export async function listTags(): Promise<TagInfo[]> {
  return (await apiFetch<{ data: TagInfo[] }>(BASE)).data
}

/** Renames the tag on every track (merging into a tag of that name if there is one). */
export function renameTag(name: string, to: string): Promise<TagInfo> {
  return apiJson<TagInfo>(at(name), { name: to }, 'PUT')
}

/** Takes the tag off every track; how many tracks had it. */
export async function deleteTag(name: string): Promise<number> {
  return (await apiFetch<{ removed: number }>(at(name), { method: 'DELETE' })).removed
}
