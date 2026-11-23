import { apiFetch, apiJson } from './http'

const BASE = '/api/ace'

export interface GenerateMusicRequest {
  prompt?: string
  lyrics?: string
  sample_mode?: boolean
  sample_query?: string
  model?: string
  bpm?: number
  key_scale?: string
  /** Beats per bar as the engine takes them: '2', '3', '4' or '6'. */
  time_signature?: string
  vocal_language?: string
  /** Left out, the API runs 8 steps on every model; Turbo cuts more than 8 to 8. */
  inference_steps?: number
  guidance_scale?: number
  seed?: number
  use_random_seed?: boolean
  audio_duration?: number
  batch_size?: number
  audio_format?: 'mp3' | 'wav' | 'flac'
  task_type?: 'text2music' | 'cover' | 'repaint' | 'extract' | 'lego' | 'complete'
  audio_cover_strength?: number
  repainting_start?: number
  repainting_end?: number
  track_name?: string
  track_classes?: string[]
  /** "explicit" passes the repaint range to the model as a 0/1 mask (what ACE-Step's own UI does for repaint). */
  chunk_mask_mode?: 'explicit' | 'auto'
  // ---- the rest of the API's fields, set from the manual tuning (left out = the engine default) ----
  /** Timestep shift, 1..5 (Turbo too: measured, it changes Turbo's take). */
  shift?: number
  infer_method?: 'ode' | 'sde'
  /** Adaptive dual guidance instead of plain CFG (base models). */
  use_adg?: boolean
  /** The part of the denoising (0..1) where guidance acts. */
  cfg_interval_start?: number
  cfg_interval_end?: number
  /** Decode in tiles: less video memory. */
  use_tiled_decode?: boolean
  /** The language model writes the audio codes (a plan) before the music is drawn. */
  thinking?: boolean
  lm_temperature?: number
  lm_cfg_scale?: number
  lm_top_k?: number
  lm_top_p?: number
  lm_negative_prompt?: string
  use_cot_caption?: boolean
  use_cot_language?: boolean
  /** Cover / repaint: how much of the source the starting noise keeps (0 = pure noise). */
  cover_noise_strength?: number
  repaint_mode?: 'conservative' | 'balanced' | 'aggressive'
  repaint_strength?: number
  repaint_wav_crossfade_sec?: number
  repaint_latent_crossfade_frames?: number
}

export interface ModelInventoryEntry {
  name: string
  is_default: boolean
  is_loaded: boolean
  supported_task_types: string[]
}

export interface ModelInventory {
  models: ModelInventoryEntry[]
  default_model: string
  lm_models: string[]
  loaded_lm_model: string | null
  llm_initialized: boolean
}

export interface HealthResponse {
  status: string
  service: string
  version: string
  models_initialized: boolean
  llm_initialized: boolean
  loaded_model: string | null
  loaded_lm_model: string | null
}

export interface ReleaseTaskResponse {
  task_id: string
  status: string
  queue_position: number
}

export interface QueryResultEntry {
  task_id: string
  status: 0 | 1 | 2
  result: string
}

export interface Envelope<T> {
  data: T
  code: number
  error?: string
  timestamp?: number
  extra?: unknown
}

export function unwrap<T>(payload: Envelope<T> | T): T {
  if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>) && 'code' in (payload as Record<string, unknown>)) {
    return (payload as Envelope<T>).data
  }
  return payload as T
}

export async function health(): Promise<HealthResponse> {
  const raw = await apiFetch<Envelope<HealthResponse> | HealthResponse>(`${BASE}/health`)
  return unwrap(raw)
}

export interface InitModelResponse {
  message: string
  slot: number
  loaded_model: string | null
  loaded_lm_model: string | null
}

export async function initModel(initLlm: boolean, lmModelPath?: string): Promise<InitModelResponse> {
  const raw = await apiJson<Envelope<InitModelResponse> | InitModelResponse>(`${BASE}/v1/init`, {
    init_llm: initLlm,
    lm_model_path: lmModelPath,
  })
  return unwrap(raw)
}

export async function modelInventory(): Promise<ModelInventory> {
  const raw = await apiFetch<Envelope<ModelInventory> | ModelInventory>(`${BASE}/v1/model_inventory`)
  return unwrap(raw)
}

export async function stats(): Promise<{ jobs: Record<string, number>; queue_size: number; queue_maxsize: number; avg_job_seconds: number }> {
  const raw = await apiFetch<Envelope<any> | any>(`${BASE}/v1/stats`)
  return unwrap(raw)
}

export async function releaseTask(req: GenerateMusicRequest, refAudioFile?: File | null): Promise<ReleaseTaskResponse> {
  let raw: Envelope<ReleaseTaskResponse> | ReleaseTaskResponse
  if (refAudioFile) {
    const form = new FormData()
    for (const [key, value] of Object.entries(req)) {
      if (value === undefined || value === null) continue
      form.append(key, Array.isArray(value) ? JSON.stringify(value) : String(value))
    }
    // Server accepts the source/context audio under either "ctx_audio" or
    // "src_audio" multipart field names (release_task_request_parser.py).
    form.append('ctx_audio', refAudioFile, refAudioFile.name)
    raw = await apiFetch<Envelope<ReleaseTaskResponse> | ReleaseTaskResponse>(`${BASE}/release_task`, {
      method: 'POST',
      body: form,
    })
  } else {
    raw = await apiJson<Envelope<ReleaseTaskResponse> | ReleaseTaskResponse>(`${BASE}/release_task`, req)
  }
  return unwrap(raw)
}

export async function queryResult(taskIds: string[]): Promise<QueryResultEntry[]> {
  const raw = await apiJson<Envelope<QueryResultEntry[]> | QueryResultEntry[]>(`${BASE}/query_result`, {
    task_id_list: taskIds,
  })
  return unwrap(raw)
}

export async function cancelTask(taskId: string): Promise<void> {
  await apiJson(`${BASE}/cancel_task`, { task_id: taskId })
}

export async function cancelAllTasks(): Promise<void> {
  await apiJson(`${BASE}/cancel_all_tasks`, {})
}

export async function loraLoad(loraPath: string, adapterName?: string): Promise<void> {
  await apiJson(`${BASE}/v1/lora/load`, { lora_path: loraPath, adapter_name: adapterName })
}

export async function loraUnload(): Promise<void> {
  await apiJson(`${BASE}/v1/lora/unload`, {})
}

export async function loraToggle(useLora: boolean): Promise<void> {
  await apiJson(`${BASE}/v1/lora/toggle`, { use_lora: useLora })
}

export async function loraScale(scale: number): Promise<void> {
  await apiJson(`${BASE}/v1/lora/scale`, { scale })
}

export function audioUrl(path: string): string {
  return `${BASE}/v1/audio?path=${encodeURIComponent(path)}`
}

/** What ACE-Step's own language model writes from a description (its "Simple Mode", /v1/create_sample). */
export interface CreatedSample {
  caption: string
  lyrics: string
  bpm: number | null
  keyscale: string
  duration: number | null
  timesignature: string
  vocal_language: string
}

/**
 * ACE-Step's language model turns a description into a style caption, lyrics with sections, BPM, key and length,
 * in the format ACE-Step itself expects. Needs ACE-Step running.
 */
export async function createSample(query: string, instrumental: boolean, vocalLanguage?: string): Promise<CreatedSample> {
  const raw = await apiJson<Envelope<CreatedSample> | CreatedSample>(`${BASE}/v1/create_sample`, {
    query,
    instrumental,
    ...(vocalLanguage ? { vocal_language: vocalLanguage } : {}),
  })
  // ACE-Step reports its own failures inside a 200 envelope: {code: 500, error}.
  const env = raw as Envelope<CreatedSample>
  if (env && typeof env === 'object' && 'code' in env && env.code >= 400) throw new Error(env.error || `create_sample failed (${env.code})`)
  return unwrap(raw)
}
