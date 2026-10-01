import { apiFetch, apiJson } from './http'

export interface AppSettings {
  artist: string
}

export const getSettings = () => apiFetch<AppSettings>('/api/settings')
export const saveSettings = (settings: AppSettings) => apiJson<AppSettings>('/api/settings', settings, 'PUT')
