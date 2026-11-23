// Stable Audio 3 through the backend's reverse proxy (/api/sa3/* -> external/sa3-server). The server
// is a job queue: submit, poll a batch of ids, fetch the files it names.
import { apiFetch, apiJson } from './http'

export type Sa3Task = 'text' | 'a2a' | 'inpaint'
export type Sa3ModelId = 'medium' | 'small-music' | 'small-sfx' | 'medium-base' | 'small-music-base' | 'small-sfx-base'
export type Sa3JobStatus = 'queued' | 'running' | 'done' | 'failed' | 'cancelled'

export interface Sa3Model {
  id: Sa3ModelId
  label: string
  repo: string
  params: string
  max_seconds: number
  kinds: ('music' | 'sfx')[]
  tasks: Sa3Task[]
  /** A pre-training checkpoint: wants ~50 steps and CFG, honours the negative prompt; the start of LoRA training. */
  base: boolean
  installed: boolean
  loaded: boolean
  loading: boolean
  /** Installed and runnable on this device (medium needs a GPU). */
  available: boolean
  device: string
}

/** The checkpoints as sa3-server's specs.py describes them: what the forms show while the engine is stopped and reports none. */
const SA3_POST_TRAINED: Record<'medium' | 'small-music' | 'small-sfx', Pick<Sa3Model, 'label' | 'params' | 'max_seconds' | 'kinds'>> = {
  medium: { label: 'Medium', params: '1.4B', max_seconds: 380, kinds: ['music', 'sfx'] },
  'small-music': { label: 'Small Music', params: '433M', max_seconds: 120, kinds: ['music'] },
  'small-sfx': { label: 'Small SFX', params: '433M', max_seconds: 120, kinds: ['sfx'] },
}
/** An installed checkpoint as the engine would list it; not loaded, and assumed runnable (the queue reports it if not). */
export function offlineModel(id: Sa3ModelId): Sa3Model {
  const base = id.endsWith('-base')
  const spec = SA3_POST_TRAINED[id.replace(/-base$/, '') as keyof typeof SA3_POST_TRAINED]
  return {
    id, ...spec, label: base ? `${spec.label} Base` : spec.label, repo: '', tasks: ['text', 'a2a', 'inpaint'],
    base, installed: true, loaded: false, loading: false, available: true, device: '',
  }
}

export interface Sa3Health {
  ok: boolean
  loaded: Sa3ModelId[]
  loading: Sa3ModelId | null
  version: string
}

export interface Sa3JobRequest {
  task: Sa3Task
  model: Sa3ModelId
  /** One text, or one per variant (then as many as batch_size). */
  prompt: string | string[]
  negative_prompt?: string | string[]
  /** Seconds. For a2a the server uses the audio's own length; for inpaint it is the total length. */
  duration?: number
  steps?: number
  cfg_scale?: number
  /** -1 = random; the job reports the seed it used. */
  seed?: number
  batch_size?: number
  /** a2a only: 0 keeps the audio, 1 ignores it. */
  init_noise_level?: number
  /** inpaint only, seconds from the start of the audio; one region per pair. */
  mask_start?: number[]
  mask_end?: number[]
  chunked_decode?: boolean
  /** text only: drop leading silence below -60 dBFS (one-shots). */
  trim_silence?: boolean
  // ---- the sampler and the guidance; left out = the package's default ----
  sampler_type?: 'pingpong' | 'euler' | 'rk4' | 'dpmpp'
  /** 1 = adaptive projected guidance, 0 = plain CFG. */
  apg_scale?: number
  /** The part of the denoising (0..1) where guidance acts. */
  cfg_interval_min?: number
  cfg_interval_max?: number
  /** Rescales the guided output toward the unguided one's spread (0 = off). */
  scale_phi?: number
  /** Caps the guidance step's size (0 = off). */
  cfg_norm_threshold?: number
  /** Seconds of headroom past the length the model plans for. */
  duration_padding?: number
}

export interface Sa3JobCreated {
  job_id: string
  queue_position: number
  status: Sa3JobStatus
}

export interface Sa3JobState {
  job_id: string
  status: Sa3JobStatus
  stage: string
  progress: number
  /** Server paths such as /v1/files/<job>_<i>.wav; see audioUrl(). */
  files: string[]
  durations: number[]
  error: string | null
  seed: number | null
  created_at: number
  finished_at: number | null
}

const BASE = '/api/sa3'
/** Where a job runs: the engine on the GPU (orchestrated), or the CPU sample server next to it (backend/app/sfx_cpu.py). */
export type Sa3Device = 'gpu' | 'cpu'
export const SA3_BASES: Record<Sa3Device, string> = { gpu: BASE, cpu: '/api/sa3cpu' }

export function health(): Promise<Sa3Health> {
  return apiFetch<Sa3Health>(`${BASE}/health`)
}

export function models(): Promise<Sa3Model[]> {
  return apiFetch<Sa3Model[]>(`${BASE}/v1/models`)
}

export function loadModel(model: Sa3ModelId): Promise<{ loaded: Sa3ModelId[] }> {
  return apiJson(`${BASE}/v1/models/load`, { model })
}

export function submitJob(req: Sa3JobRequest, audio?: File | Blob | null, base: string = BASE): Promise<Sa3JobCreated> {
  const form = new FormData()
  for (const [k, v] of Object.entries(req)) {
    if (v == null) continue
    if (Array.isArray(v)) for (const x of v) form.append(k, String(x))
    else form.append(k, String(v))
  }
  if (audio) form.append('audio', audio, 'context.wav')
  return apiFetch<Sa3JobCreated>(`${base}/v1/jobs`, { method: 'POST', body: form })
}

export function queryJobs(ids: string[], base: string = BASE): Promise<Sa3JobState[]> {
  return apiJson<Sa3JobState[]>(`${base}/v1/jobs/query`, { ids })
}

export async function cancelJob(id: string, base: string = BASE): Promise<void> {
  await apiJson(`${base}/v1/jobs/${encodeURIComponent(id)}/cancel`, {})
}

/** The browser-side URL of a file a job reported. */
export function audioUrl(serverPath: string, base: string = BASE): string {
  return `${base}${serverPath}`
}
