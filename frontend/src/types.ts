export type ModelId = 'ace_step' | 'yue2' | 'stable_audio'
export type TrackOrigin = ModelId | 'editor' | 'upload'
/** What can hold the GPU: the three music engines and the cover maker (Z-Image Turbo), which makes no tracks. */
export type GpuModelId = ModelId | 'cover'

export type ModelRuntimeStatus = 'stopped' | 'starting' | 'running' | 'stopping' | 'error'

export interface ModelStatusEntry {
  id: GpuModelId
  label: string
  status: ModelRuntimeStatus
  error: string | null
}

export interface OrchestratorStatus {
  active_model: GpuModelId | null
  models: Partial<Record<GpuModelId, ModelStatusEntry>>
}

export type JobStatus = 'queued' | 'running' | 'done' | 'failed' | 'cancelled'
