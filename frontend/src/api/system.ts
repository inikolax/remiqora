import { apiFetch } from './http'

export type MemoryHolder = 'ace_step' | 'yue2' | 'demucs' | 'backend' | 'other'

export interface Resources {
  ram: { used: number; total: number } | null
  /** The first NVIDIA card (nvidia-smi); null without one, e.g. on a Mac. */
  vram: { name: string; used: number; total: number; load: number | null; temp: number | null } | null
  /** Who holds the video memory; empty where per-process numbers can't be read. */
  vram_by: { key: MemoryHolder; bytes: number }[]
  /** RAM held by each holder's process tree. */
  ram_by: Partial<Record<MemoryHolder, number>>
}

export function getResources(): Promise<Resources> {
  return apiFetch<Resources>('/api/system/resources')
}

/** Which optional parts are installed (backend/app/features.py): a user may leave them out at install. */
export interface Features {
  ace_step: boolean
  yue2: boolean
  yue2_precisions: ('q8_0' | 'q4_0')[]
  demucs: boolean
  ace_base: boolean
  ace_xl: boolean
}

export function getFeatures(): Promise<Features> {
  return apiFetch<Features>('/api/system/features')
}
