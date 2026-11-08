import { apiFetch } from './http'

export type MemoryHolder = 'ace_step' | 'yue2' | 'stable_audio' | 'demucs' | 'backend' | 'other'

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
  yue2_precisions: ('q8_0' | 'q4_0' | 'bf16')[]
  demucs: boolean
  ace_base: boolean
  ace_xl: boolean
  /** The sa3-server environment plus at least one downloaded checkpoint. */
  stable_audio: boolean
  /** The environment alone: the weights are gated and fetched by the user. */
  stable_audio_env: boolean
  stable_audio_models: ('medium' | 'small-music' | 'small-sfx' | 'medium-base' | 'small-music-base' | 'small-sfx-base')[]
}

export function getFeatures(): Promise<Features> {
  return apiFetch<Features>('/api/system/features')
}
