import { apiFetch, apiJson } from './http'

/** A named set of tracks in the library; a track may be in several. */
export interface Collection {
  id: number
  name: string
  created_at: string
  track_ids: number[]
}

const BASE = '/api/collections'

export async function listCollections(): Promise<Collection[]> {
  return (await apiFetch<{ data: Collection[] }>(BASE)).data
}

export function createCollection(name: string): Promise<Collection> {
  return apiJson<Collection>(BASE, { name })
}

export function renameCollection(id: number, name: string): Promise<Collection> {
  return apiJson<Collection>(`${BASE}/${id}`, { name }, 'PUT')
}

export async function deleteCollection(id: number): Promise<void> {
  await apiFetch(`${BASE}/${id}`, { method: 'DELETE' })
}

/** Puts the track into the collection or takes it out; the collection as it is afterwards. */
export function setCollectionTrack(id: number, trackId: number, present: boolean): Promise<Collection> {
  return apiFetch<Collection>(`${BASE}/${id}/tracks/${trackId}`, { method: present ? 'PUT' : 'DELETE' })
}
