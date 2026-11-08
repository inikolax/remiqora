// The Models page (backend/app/api/routes_engines.py): per engine its downloadable parts and its settings, and the
// CPU sample server the editor's Samples panel can use next to the GPU engine.
import { apiFetch, apiJson } from './http'
import type { Sa3ModelId } from './stableAudio'

export type EngineId = 'ace_step' | 'yue2' | 'stable_audio' | 'demucs'

export interface EnginePart {
  id: string
  /** main: ACE-Step's core bundle; dit / lm: ACE-Step checkpoints; common / precision: YuE2 weights. */
  kind: 'main' | 'dit' | 'lm' | 'common' | 'precision'
  bytes: number
  required: boolean
  /** Can be removed again from the Models page (not while its engine runs). */
  deletable: boolean
  /** Can be checked and downloaded again (all of them, required ones too). */
  verifiable?: boolean
  installed: boolean
  /** What it takes on disk now; a partial download counts too. */
  on_disk: number
  download: { status: 'running' | 'done' | 'failed' | 'cancelled'; done: number; total: number; error: string | null } | null
}

export interface EngineInfo {
  /** The engine's environment is installed (its download tool can run). */
  ready: boolean
  /** Orchestrator status for the GPU engines; absent for Demucs. */
  status?: 'stopped' | 'starting' | 'running' | 'stopping' | 'error'
  settings?: Record<string, string>
  /** What each setting may be (only downloaded checkpoints are listed). */
  choices?: Record<string, string[]>
  /** The settings the running engine was started with; they differ from `settings` until its next start. */
  started?: Record<string, string> | null
  parts?: EnginePart[]
  /** What the engine's models take on disk. */
  on_disk?: number
}

export interface EnginesState {
  engines: Record<EngineId, EngineInfo>
  /** The part downloading now (one at a time). */
  downloading: string | null
}

export const getEngines = () => apiFetch<EnginesState>('/api/engines')
export const saveEngineSettings = (engine: EngineId, values: Record<string, string>) =>
  apiJson<EnginesState>(`/api/engines/${engine}/settings`, values, 'PUT')
export const downloadPart = (id: string) => apiFetch<EnginesState>(`/api/engines/parts/${encodeURIComponent(id)}/download`, { method: 'POST' })
export const deletePart = (id: string) => apiFetch<EnginesState>(`/api/engines/parts/${encodeURIComponent(id)}`, { method: 'DELETE' })
export interface PartCheck {
  part: string
  ok: boolean
  problems: { file: string; reason: string }[]
  files: number
  hashed: number
  /** Whole by the record, but the source now holds another version of it. */
  outdated: string[]
  method: 'sha256' | 'structure'
  /** The source's checksum list could not be fetched: only sizes were compared. */
  offline: boolean
}
export const verifyPart = (id: string) => apiFetch<PartCheck>(`/api/engines/parts/${encodeURIComponent(id)}/verify`, { method: 'POST' })
export const reinstallPart = (id: string) => apiFetch<EnginesState>(`/api/engines/parts/${encodeURIComponent(id)}/reinstall`, { method: 'POST' })
export const cancelPart = (id: string) => apiFetch<EnginesState>(`/api/engines/parts/${encodeURIComponent(id)}/cancel`, { method: 'POST' })

export interface CpuSamplerSettings {
  enabled: boolean
  /** auto: the GPU when Stable Audio runs there, otherwise the CPU; cpu: always the CPU. */
  route: 'auto' | 'cpu'
  /** 0 = PyTorch's default (one per physical core). */
  threads: number
  model: Sa3ModelId
  /** Minutes without use before it stops and gives its memory back; 0 = never. */
  idle_minutes: number
}

export interface CpuSampler {
  settings: CpuSamplerSettings
  status: 'stopped' | 'starting' | 'running' | 'error'
  error: string | null
  /** The environment and at least one small checkpoint are there. */
  available: boolean
  models: Sa3ModelId[]
  cpu_count: number
  /** Threads or the model changed while it runs: the next request restarts it. */
  restart_pending: boolean
}

export const getCpuSampler = () => apiFetch<CpuSampler>('/api/sfx-cpu')
export const saveCpuSampler = (s: CpuSamplerSettings) => apiJson<CpuSampler>('/api/sfx-cpu', s, 'PUT')
export const startCpuSampler = () => apiFetch<CpuSampler>('/api/sfx-cpu/start', { method: 'POST' })
export const stopCpuSampler = () => apiFetch<CpuSampler>('/api/sfx-cpu/stop', { method: 'POST' })
