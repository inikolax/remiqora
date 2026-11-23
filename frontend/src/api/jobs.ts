// The backend's generation queue (/api/jobs): the page submits takes, reads their state and cancels or dismisses them;
// the backend starts the engine, runs the takes one at a time and saves each finished take into the library.
import { apiFetch } from './http'
import type { SavedTrack } from './tracks'
import type { GpuModelId, JobStatus, ModelId } from '../types'

export interface JobLora {
  path: string
  name: string
  scale: number
}

/** What the backend saves with each finished take of the job. */
export interface JobSave {
  title: string
  lyrics: string
  style: string
  params: Record<string, unknown>
  /** Stable Audio: one title / prompt per take of the batch. */
  titles?: string[]
  prompts?: string[]
  /** ACE-Step: the LoRA to put on the engine before the job (null = none). */
  lora?: JobLora | null
}

/** One entry of a submit: a job. YuE2 sends one per seed; ACE-Step and Stable Audio exactly one. */
export interface JobBatchEntry {
  /** The engine request body as the engine store builds it. */
  request: Record<string, unknown>
  /** How many takes the job gives (ACE-Step batch_size, Stable Audio count, YuE2 1). */
  takes: number
  save: JobSave
}

export interface ServerJob {
  id: number
  /** cover: an album cover for a track (POST /api/covers); not a take, the session lists leave it out. */
  engine: GpuModelId
  status: JobStatus
  batch_id: string
  batch_index: number
  takes: number
  title: string
  stage: string | null
  /** 0..1 when the engine reports it. */
  progress: number | null
  error: string | null
  created_at: string
  started_at: string | null
  finished_at: string | null
  request: Record<string, any>
  save: JobSave
  /** The library tracks the job has saved so far. */
  tracks: SavedTrack[]
}

const BASE = '/api/jobs'

/** Queues the batch; `audio` is the reference audio the whole batch uses. */
export async function submitJobs(engine: ModelId, batch: JobBatchEntry[], audio?: Blob | null, audioName?: string): Promise<ServerJob[]> {
  const form = new FormData()
  form.append('spec', JSON.stringify({ engine, batch }))
  if (audio) form.append('audio', audio, audioName || (audio instanceof File ? audio.name : 'reference.wav'))
  const res = await apiFetch<{ jobs: ServerJob[] }>(BASE, { method: 'POST', body: form })
  return res.jobs
}

/** Queued and running jobs, and the finished ones of the last day that were not dismissed; newest first. */
export async function listJobs(): Promise<ServerJob[]> {
  const res = await apiFetch<{ jobs: ServerJob[] }>(BASE)
  return res.jobs
}

export function getJob(id: number): Promise<ServerJob> {
  return apiFetch<ServerJob>(`${BASE}/${id}`)
}

export function cancelJob(id: number): Promise<ServerJob> {
  return apiFetch<ServerJob>(`${BASE}/${id}/cancel`, { method: 'POST' })
}

/** Takes the job off the list; its saved tracks stay in the library. */
export async function dismissJob(id: number): Promise<void> {
  await apiFetch(`${BASE}/${id}`, { method: 'DELETE' })
}

/** An ISO time from the backend as epoch ms, or null. */
export function jobTime(iso: string | null | undefined): number | null {
  if (!iso) return null
  const ms = Date.parse(iso)
  return Number.isFinite(ms) ? ms : null
}
