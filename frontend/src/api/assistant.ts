// The prompt assistant (backend/app/assistant.py): a local language model that turns an idea into an
// engine's prompt. It runs next to the GPU engines and starts on the first request.
import { apiFetch, apiJson } from './http'

export type AssistantTask = 'sa3' | 'yue2-song' | 'ace-song' | 'ace-instrumental' | 'ace-part'

export interface AssistantSettings {
  model: string
  /** auto: the GPU when about 6 GB are free there, else the CPU. */
  device: 'auto' | 'cpu' | 'cuda'
  /** 0 = PyTorch's default (one per physical core). */
  threads: number
  /** Minutes without use before it stops; 0 = never. */
  idle_minutes: number
}

export interface AssistantModel {
  id: string
  bytes: number
  installed: boolean
  on_disk: number
  download: { status: 'running' | 'done' | 'failed' | 'cancelled'; done: number; total: number; error: string | null } | null
}

export interface AssistantState {
  settings: AssistantSettings
  status: 'stopped' | 'starting' | 'running' | 'error'
  error: string | null
  /** Its environment is installed. */
  ready: boolean
  models: AssistantModel[]
  downloading: string | null
  on_disk: number
  cpu_count: number
  /** Where it runs now ("auto" resolved), while it runs. */
  device: 'cpu' | 'cuda' | 'mps' | null
  loaded: boolean
  restart_pending: boolean
  /** The engine unloaded so the assistant could take the GPU (device "GPU"); cleared when an engine starts. */
  unloaded_engine: 'ace_step' | 'yue2' | 'stable_audio' | null
}

export interface AssistantResult {
  task: AssistantTask
  fields: Record<string, string | number | null>
  tokens: number
  took_ms: number
  device: string
  model: string
}

const owner = (id: string) => id.split('/').map(encodeURIComponent).join('/')

export const getAssistant = () => apiFetch<AssistantState>('/api/assistant/state')
export const saveAssistant = (s: AssistantSettings) => apiJson<AssistantState>('/api/assistant/settings', s, 'PUT')
export const startAssistant = () => apiFetch<AssistantState>('/api/assistant/start', { method: 'POST' })
export const stopAssistant = () => apiFetch<AssistantState>('/api/assistant/stop', { method: 'POST' })
export const downloadAssistantModel = (id: string) => apiFetch<AssistantState>(`/api/assistant/models/${owner(id)}/download`, { method: 'POST' })
export const cancelAssistantModel = (id: string) => apiFetch<AssistantState>(`/api/assistant/models/${owner(id)}/cancel`, { method: 'POST' })
export const deleteAssistantModel = (id: string) => apiFetch<AssistantState>(`/api/assistant/models/${owner(id)}`, { method: 'DELETE' })

/** Writes a prompt; starts the assistant first when it is not running (a few seconds more). */
export const writePrompt = (task: AssistantTask, idea: string, extra: { language?: string; kind?: string; seed?: number } = {}) =>
  apiJson<AssistantResult>('/api/assistant/v1/write', { task, idea, ...extra })

/** A prompt being written (the assistant's /v1/jobs): stage, an estimated percent and the text so far. */
export interface AssistantJob {
  job_id: string
  task: AssistantTask
  status: 'queued' | 'loading' | 'running' | 'done' | 'failed' | 'cancelled'
  stage: 'queued' | 'loading' | 'classifying' | 'writing' | 'retrying' | 'done'
  tokens: number
  /** The usual length of this task's reply, the base of the percent. */
  expected: number
  percent: number
  /** The raw reply so far. */
  text: string
  /** The reply so far as a person can read it (a JSON reply's values with real line breaks). */
  preview: string
  fields: Record<string, string | number | null> | null
  error: string | null
  took_ms: number
}

/** What the page shows while a prompt is written; the first two stages happen before the job exists. */
export interface WriteProgress {
  stage: 'unloading' | 'starting' | AssistantJob['stage']
  percent: number
  tokens: number
  preview: string
}

export class PromptCancelled extends Error {
  constructor() {
    super('cancelled')
    this.name = 'PromptCancelled'
  }
}

const POLL_MS = 500
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Writes a prompt and reports its progress: starts the assistant (with the GPU setting that first unloads a running
 * engine, `unloadsEngine`), queues the job, polls it twice a second. `cancel()` stops it; the result then rejects with
 * PromptCancelled.
 */
export function writePromptLive(
  task: AssistantTask,
  idea: string,
  extra: { language?: string; kind?: string; seed?: number },
  onProgress: (p: WriteProgress) => void,
  opts: { unloadsEngine?: boolean } = {},
): { result: Promise<AssistantResult>; cancel: () => void } {
  let jobId: string | null = null
  let cancelled = false
  const cancel = () => {
    cancelled = true
    if (jobId) void apiJson(`/api/assistant/v1/jobs/${jobId}/cancel`, {}).catch(() => {})
  }
  const result = (async (): Promise<AssistantResult> => {
    onProgress({ stage: opts.unloadsEngine ? 'unloading' : 'starting', percent: 0, tokens: 0, preview: '' })
    await startAssistant()
    if (cancelled) throw new PromptCancelled()
    let job = await apiJson<AssistantJob>('/api/assistant/v1/jobs', { task, idea, ...extra })
    jobId = job.job_id
    if (cancelled) cancel()
    for (;;) {
      onProgress({ stage: job.stage, percent: job.percent, tokens: job.tokens, preview: job.preview })
      if (job.status === 'done') {
        return { task, fields: job.fields ?? {}, tokens: job.tokens, took_ms: job.took_ms, device: '', model: '' }
      }
      if (job.status === 'cancelled') throw new PromptCancelled()
      if (job.status === 'failed') throw new Error(job.error || 'the prompt could not be written')
      await sleep(POLL_MS)
      job = await apiFetch<AssistantJob>(`/api/assistant/v1/jobs/${job.job_id}`)
    }
  })()
  return { result, cancel }
}
