import { apiFetch, apiJson } from './http'
import type { ModelId, OrchestratorStatus } from '../types'

export interface Yue2ModelSpecConfig {
  id: string
  family: string
  path: string
  task: string
  mode: string
  model_spec_override?: string
}

export interface OrchestratorConfig {
  yue2_specs: {
    yue2: Yue2ModelSpecConfig
    sheetsage2: Yue2ModelSpecConfig
    muscriptor: Yue2ModelSpecConfig
    [key: string]: Yue2ModelSpecConfig
  }
}

export function getConfig(): Promise<OrchestratorConfig> {
  return apiFetch<OrchestratorConfig>('/api/orchestrator/config')
}

export function getStatus(): Promise<OrchestratorStatus> {
  return apiFetch<OrchestratorStatus>('/api/orchestrator/status')
}

export function switchModel(model: ModelId): Promise<OrchestratorStatus> {
  return apiJson<OrchestratorStatus>('/api/orchestrator/switch', { model })
}

export function stopActive(): Promise<OrchestratorStatus> {
  return apiJson<OrchestratorStatus>('/api/orchestrator/stop', {})
}
