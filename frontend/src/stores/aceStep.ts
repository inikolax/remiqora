import { acceptHMRUpdate, defineStore } from 'pinia'
import { useOrchestratorStore } from './orchestrator'
import * as api from '../api/aceStep'
import type { GenerateMusicRequest } from '../api/aceStep'
import * as tracksApi from '../api/tracks'
import type { SavedTrack } from '../api/tracks'
import { jobTime } from '../api/jobs'
import type { JobLora, ServerJob } from '../api/jobs'
import type { JobStatus } from '../types'
import { useGenQueueStore } from './genQueue'
import { useCoversStore } from './covers'
import { stripMetaHints } from '../utils/aceHints'

const HEALTH_MS = 15000

export interface AceJob {
  id: string
  status: JobStatus
  createdAt: number
  /** When the backend began making it (a job of the queue). */
  startedAt?: number | null
  /** The backend queue's job this row stands for while its takes are not saved. */
  serverJobId?: number | null
  title: string
  lyrics: string
  model?: string
  audioFormat: string
  batchSize: number
  error?: string
  progress: number
  stage?: string
  audioUrls: string[]
  dbIds: number[]
  finalized: boolean
  durationSec?: number | null
  params?: Record<string, any>
}

/** A saved track as a row of the session (a take a track). */
function fromTrack(t: SavedTrack): AceJob {
  return {
    id: `saved_${t.id}`,
    status: 'done',
    createdAt: new Date(t.created_at).getTime() || Date.now(),
    title: t.title,
    lyrics: t.lyrics,
    model: (t.params.model as string) || undefined,
    audioFormat: (t.params.audio_format as string) || 'mp3',
    batchSize: 1,
    progress: 100,
    audioUrls: [t.audio_url],
    dbIds: [t.id],
    finalized: true,
    durationSec: t.duration_ms ? t.duration_ms / 1000 : null,
    params: t.params,
  }
}

/** A queue job whose takes are not (all) saved: one row for the batch, as ACE-Step reports it. */
function fromServerJob(j: ServerJob, remaining: number): AceJob {
  const req = (j.request || {}) as GenerateMusicRequest
  const save = j.save || ({} as ServerJob['save'])
  return {
    id: `job_${j.id}`,
    serverJobId: j.id,
    status: j.status,
    createdAt: jobTime(j.created_at) ?? Date.now(),
    startedAt: jobTime(j.started_at),
    title: save.title || j.title || '',
    lyrics: save.lyrics ?? req.lyrics ?? '',
    model: req.model,
    audioFormat: req.audio_format || 'mp3',
    batchSize: remaining,
    error: j.error ?? undefined,
    progress: Math.round((j.progress ?? 0) * 100),
    stage: j.stage ?? undefined,
    audioUrls: [],
    dbIds: [],
    finalized: j.status !== 'queued' && j.status !== 'running',
    params: (save.params as Record<string, any>) || { ...req },
  }
}

export const useAceStepStore = defineStore('aceStep', {
  state: () => ({
    jobs: [] as AceJob[],
    historyLoaded: false,
    inventory: null as api.ModelInventory | null,
    health: null as api.HealthResponse | null,
    healthError: false,
    pendingParamsInsert: null as Record<string, any> | null,
    /** The pending insert asks for an undo snapshot / a flash on the fields it changes (the idea line). */
    pendingUndoable: false,
    pendingFlash: false,
    /** What the last undoable insert overwrote, as params: requestInsertParams(insertUndo) puts it back. */
    insertUndo: null as Record<string, any> | null,
    /** Kept by the form: it holds text an idea insert would replace. */
    formHasText: false,
    _healthTimer: null as ReturnType<typeof setTimeout> | null,
    /** Saved takes by row id: the library's tracks plus those the queue saved since. */
    _saved: {} as Record<string, AceJob>,
    /** Rows of queue jobs whose takes are not saved. */
    _pending: [] as AceJob[],
    /** Tracks deleted here: a recently finished job still lists them until the backend drops them. */
    _deleted: [] as number[],
  }),
  getters: {
    activeJobs(state): AceJob[] {
      return state.jobs.filter((j) => j.status === 'queued' || j.status === 'running')
    },
  },
  actions: {
    requestInsertParams(params: Record<string, any>, opts?: { undoable?: boolean; flash?: boolean }) {
      this.pendingUndoable = !!opts?.undoable
      this.pendingFlash = !!opts?.flash
      this.pendingParamsInsert = { ...params }
    },
    clearPendingParamsInsert() {
      this.pendingParamsInsert = null
      this.pendingUndoable = false
      this.pendingFlash = false
    },
    clearInsertUndo() {
      this.insertUndo = null
    },
    _rebuild() {
      this.jobs = [...this._pending, ...Object.values(this._saved)].sort((a, b) => b.createdAt - a.createdAt)
    },
    async loadHistory() {
      try {
        const tracks = await tracksApi.listTracks('ace_step')
        const saved: Record<string, AceJob> = {}
        for (const t of tracks) {
          if (this._deleted.includes(t.id)) continue
          saved[`saved_${t.id}`] = fromTrack(t)
        }
        // the list is the truth: names changed and tracks deleted elsewhere (the library) show here
        this._saved = saved
        // the queue's finished jobs may hold tracks saved after the list above was read
        this.syncServerJobs(useGenQueueStore().jobsOf('ace_step'))
      } finally {
        this.historyLoaded = true
      }
    },
    /** The queue's ACE-Step jobs: saved takes as tracks, the takes still to come as one row of the batch. */
    syncServerJobs(list: ServerJob[]) {
      const pending: AceJob[] = []
      for (const j of list) {
        const tracks = j.tracks || []
        for (const t of tracks) {
          if (this._deleted.includes(t.id) || this._saved[`saved_${t.id}`]) continue
          this._saved[`saved_${t.id}`] = fromTrack(t)
        }
        const remaining = Math.max(0, (j.takes || 1) - tracks.length)
        if (j.status !== 'done' && remaining > 0) pending.push(fromServerJob(j, remaining))
      }
      this._pending = pending
      this._rebuild()
    },
    async loadInventory() {
      try {
        this.inventory = await api.modelInventory()
      } catch {
        this.inventory = null
      }
    },
    async refreshHealth() {
      // a stopped engine answers 503 through the proxy: no request (it only filled the console) until it runs
      const status = useOrchestratorStore().statuses.ace_step?.status
      if (status && status !== 'running') {
        this.health = null
        this.healthError = false
        return
      }
      try {
        this.health = await api.health()
        this.healthError = false
      } catch {
        this.healthError = true
      }
    },
    startBackgroundTasks() {
      if (this._healthTimer) return
      const healthTick = async () => {
        await this.refreshHealth()
        this._healthTimer = setTimeout(healthTick, HEALTH_MS)
      }
      void healthTick()
    },
    stopBackgroundTasks() {
      if (this._healthTimer) clearTimeout(this._healthTimer)
      this._healthTimer = null
    },
    /**
     * Queues one ACE-Step job (a batch of batch_size takes) on the backend, which starts ACE-Step, puts the LoRA on
     * it (null takes it off; left out, the engine keeps what it has) and saves each take into the library.
     */
    async submit(req: GenerateMusicRequest, refAudioFile: File | null, title: string, lora?: JobLora | null): Promise<void> {
      const save = {
        title,
        lyrics: req.lyrics || '',
        style: String(req.prompt || stripMetaHints(String(req.sample_query || ''))),
        params: { ...req } as Record<string, unknown>,
        ...(lora !== undefined ? { lora } : {}),
      }
      await useGenQueueStore().submit('ace_step', [{ request: { ...req, ...(useCoversStore().wantsCover ? { make_cover: true } : {}) }, takes: req.batch_size || 1, save }], refAudioFile, refAudioFile?.name)
    },
    async cancel(jobId: string) {
      const job = this.jobs.find((j) => j.id === jobId)
      if (job?.serverJobId != null) await useGenQueueStore().cancel(job.serverJobId)
    },
    /** A saved take deletes its track; a failed or stopped batch is taken off the queue's list. */
    async removeJob(jobId: string) {
      const job = this.jobs.find((j) => j.id === jobId)
      if (!job) return
      if (job.dbIds.length) {
        for (const id of job.dbIds) {
          this._deleted.push(id)
          try {
            await tracksApi.deleteTrack(id)
          } catch {
            // ignore - still remove locally so the UI doesn't get stuck
          }
        }
        delete this._saved[job.id]
        this._rebuild()
      } else if (job.serverJobId != null) {
        await useGenQueueStore().dismiss(job.serverJobId)
      }
    },
    async renameJob(jobId: string, title: string) {
      const job = this.jobs.find((j) => j.id === jobId)
      if (!job) return
      await Promise.all(job.dbIds.map((id) => tracksApi.renameTrack(id, title)))
      job.title = title
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAceStepStore, import.meta.hot))
}
