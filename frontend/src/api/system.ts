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
