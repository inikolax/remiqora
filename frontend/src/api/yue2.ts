import { apiFetch, apiJson } from './http'
import { getConfig } from './orchestrator'
import type { Yue2ModelSpecConfig } from './orchestrator'

const BASE = '/api/yue2'

export type Yue2ModelSpec = Yue2ModelSpecConfig

// Fallback specifications (overwritten dynamically when orchestrator config loads)
export const YUE2_MODEL: Yue2ModelSpec = {
  id: 'yue2',
  family: 'yue2',
  path: 'E:/AI/YuE2-3B/models/Yue2-3B-GGUF',
  task: 'gen',
  mode: 'offline',
}

export const SHEETSAGE_MODEL: Yue2ModelSpec = {
  id: 'sheetsage2',
  family: 'sheetsage2',
  path: 'E:/AI/YuE2-3B/models/SheetSage2-GGUF/sheetsage2-orig.gguf',
  task: 'midi',
  mode: 'offline',
}

let specsPromise: Promise<Record<string, Yue2ModelSpec>> | null = null

export async function getYue2Specs(): Promise<Record<string, Yue2ModelSpec>> {
  if (!specsPromise) {
    specsPromise = getConfig()
      .then((cfg) => {
        if (cfg?.yue2_specs) {
          if (cfg.yue2_specs.yue2) Object.assign(YUE2_MODEL, cfg.yue2_specs.yue2)
          if (cfg.yue2_specs.sheetsage2) Object.assign(SHEETSAGE_MODEL, cfg.yue2_specs.sheetsage2)
          return cfg.yue2_specs
        }
        return { yue2: YUE2_MODEL, sheetsage2: SHEETSAGE_MODEL }
      })
      .catch(() => {
        specsPromise = null
        return { yue2: YUE2_MODEL, sheetsage2: SHEETSAGE_MODEL }
      })
  }
  return specsPromise
}

export async function getYue2ModelSpec(): Promise<Yue2ModelSpec> {
  const specs = await getYue2Specs()
  return specs.yue2 || YUE2_MODEL
}

export async function getSheetSageModelSpec(): Promise<Yue2ModelSpec> {
  const specs = await getYue2Specs()
  return specs.sheetsage2 || SHEETSAGE_MODEL
}

export type CotMode = 'off' | 'melody' | 'full'

export interface GenerateOptions {
  [key: string]: unknown
  style: string
  cot: CotMode
  cfg_scale?: number
  num_inference_steps?: number
  semantic_temperature?: number
  semantic_top_p?: number
  semantic_top_k?: number
  semantic_repetition_penalty?: number
  semantic_penalty_window?: number
  semantic_min_tokens?: number
  semantic_max_tokens?: number
  abc?: string
  abc_temperature?: number
  abc_top_p?: number
  abc_top_k?: number
  abc_repetition_penalty?: number
  abc_penalty_window?: number
  abc_min_tokens?: number
  abc_max_tokens?: number
}

export interface TaskRunResult {
  audio?: string
  text?: string
  artifacts?: Array<{ id?: string; meta?: { format?: string; extension?: string }; payload?: string }>
  timing?: { wall_ms?: number; audio_duration_ms?: number }
}

export interface HealthResponse {
  status?: string
  backend?: string
}

function modelSessionOptions(precision: 'q8_0' | 'q4_0'): Record<string, string> {
  if (precision === 'q4_0') return { 'yue2.model_gguf': 'yue2-3b-q4_0.gguf' }
  return {}
}

async function getModels(): Promise<Array<{ id: string; loaded: boolean }>> {
  const json = await apiFetch<{ data?: Array<{ id: string; loaded: boolean }> }>(`${BASE}/v1/models`)
  return json.data || []
}

async function loadModelSpec(spec: Yue2ModelSpec, sessionOptions?: Record<string, string>): Promise<void> {
  await apiJson(`${BASE}/v1/models/load`, {
    id: spec.id,
    path: spec.path,
    family: spec.family,
    task: spec.task,
    mode: spec.mode,
    ...(spec.model_spec_override ? { model_spec_override: spec.model_spec_override } : {}),
    load_options: {},
    session_options: sessionOptions || {},
  })
}

export async function unloadModelId(id: string): Promise<void> {
  await apiJson(`${BASE}/v1/models/unload`, { id })
}

/**
 * Idempotent load: when sessionOptions is explicitly passed (precision
 * switch) always calls load so a resident-but-wrong-precision model gets
 * reloaded; otherwise checks the loaded list first to skip a no-op call.
 */
export async function ensureLoaded(
  specOrId?: Yue2ModelSpec | 'yue2' | 'sheetsage2' | 'muscriptor',
  sessionOptions?: Record<string, string>,
): Promise<void> {
  let spec: Yue2ModelSpec
  if (!specOrId || specOrId === 'yue2') {
    spec = await getYue2ModelSpec()
  } else if (specOrId === 'sheetsage2') {
    spec = await getSheetSageModelSpec()
  } else if (typeof specOrId === 'string') {
    const specs = await getYue2Specs()
    spec = specs[specOrId] || YUE2_MODEL
  } else {
    const specs = await getYue2Specs()
    if (specs && specs[specOrId.id]) {
      spec = { ...specOrId, path: specs[specOrId.id].path }
    } else {
      spec = specOrId
    }
  }

  if (sessionOptions !== undefined) {
    await loadModelSpec(spec, sessionOptions)
    return
  }
  const list = await getModels()
  if (list.some((m) => m.id === spec.id && m.loaded)) return
  await loadModelSpec(spec)
}

export function precisionSessionOptions(precision: 'q8_0' | 'q4_0'): Record<string, string> {
  return modelSessionOptions(precision)
}

export async function uploadFile(file: File): Promise<string> {
  const match = /\.([A-Za-z0-9]{1,8})$/.exec(file.name)
  const filename = `upload.${(match && match[1] && match[1].toLowerCase()) || 'bin'}`
  const json = await apiFetch<{ path: string }>(`${BASE}/v1/ui/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'X-AudioCPP-Filename': filename,
    },
    body: file,
  })
  // The native server's JSON parser mishandles backslash escapes when a
  // Windows path it returned is echoed back in a later request body -
  // forward slashes round-trip fine, so normalize once here.
  return json.path.replace(/\\/g, '/')
}

export async function runTask(model: string, request: unknown, signal?: AbortSignal): Promise<TaskRunResult> {
  return apiFetch<TaskRunResult>(`${BASE}/v1/tasks/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, request }),
    signal,
  })
}

export async function generateTrack(lyrics: string, seed: number, options: GenerateOptions, precision: 'q8_0' | 'q4_0', signal?: AbortSignal): Promise<TaskRunResult> {
  const spec = await getYue2ModelSpec()
  await ensureLoaded(spec, precisionSessionOptions(precision))
  return runTask(spec.id, { lyrics, seed, options }, signal)
}

export async function extractAbcFromAudio(audioPath: string): Promise<TaskRunResult> {
  const spec = await getSheetSageModelSpec()
  await ensureLoaded(spec)
  return runTask(spec.id, { audio: audioPath, options: {} })
}

export function abcFromResult(result: TaskRunResult): string {
  if (typeof result.text === 'string' && result.text.trim()) return result.text
  for (const artifact of result.artifacts || []) {
    const format = String(artifact?.meta?.format || artifact?.meta?.extension || artifact?.id || '')
    if (/abc|score/i.test(format) && typeof artifact.payload === 'string') {
      try {
        return atob(artifact.payload)
      } catch {
        return artifact.payload
      }
    }
  }
  return ''
}

export function base64AudioBlob(data: string): Blob {
  const binary = atob(data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: 'audio/wav' })
}

export async function health(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>(`${BASE}/health`)
}
