import { apiFetch, apiJson } from './http'

export interface AppSettings {
  artist: string
  /** Album covers for tracks (made on a button, never by themselves); absent on an older backend. */
  covers_enabled?: boolean
}

export const getSettings = () => apiFetch<AppSettings>('/api/settings')
/** Only the fields to change. */
export const saveSettings = (settings: Partial<AppSettings>) => apiJson<AppSettings>('/api/settings', settings, 'PUT')
