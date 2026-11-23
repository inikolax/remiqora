import { acceptHMRUpdate, defineStore } from 'pinia'
import { useOrchestratorStore } from './orchestrator'
import * as api from '../api/yue2'
import type { CotMode, GenerateOptions } from '../api/yue2'
import * as tracksApi from '../api/tracks'
import type { SavedTrack } from '../api/tracks'
import { jobTime } from '../api/jobs'
import type { JobBatchEntry, ServerJob } from '../api/jobs'
import type { JobStatus } from '../types'
import { useGenQueueStore } from './genQueue'
import { useCoversStore } from './covers'

const HEALTH_MS = 5000

type Precision = 'q8_0' | 'q4_0' | 'bf16'

export interface Yue2Job {
  id: string
  status: JobStatus
  createdAt: number
  /** When the backend began making it (a take of the queue), for the time it has run. */
  startedAt?: number | null
  /** The backend queue's job this row stands for while it has no saved track. */
  serverJobId?: number | null
  /** The name shown on the card and stored as the track title; the user can rename it. */
  title: string
  /** The style tags the track was generated with. Never overwritten by a rename. */
  style: string
  lyrics: string
  cot: CotMode
  precision: Precision
  seed: number
  error?: string
  audioUrl?: string
  abcPlan?: string | null
  durationSec?: number | null
  wallSec?: number | null
  savedFilename?: string | null
  saveError?: string | null
  dbId?: number | null
  finalized: boolean
  params?: Record<string, any>
}

/** A saved track as a row of the session. */
function fromTrack(t: SavedTrack): Yue2Job {
  return {
    id: `saved_${t.id}`,
    status: 'done',
    createdAt: new Date(t.created_at).getTime() || Date.now(),
    title: t.title,
    // The tags live in the saved params; the title is only a fallback for tracks saved before they were recorded.
    style: (t.params.style as string) || t.title,
    lyrics: t.lyrics,
    cot: (t.params.cot as CotMode) || 'off',
    precision: (t.params.precision as Precision) || 'q8_0',
    seed: t.seed ?? 0,
    audioUrl: t.audio_url,
    abcPlan: t.abc_url ? '' : null,
    durationSec: t.duration_ms ? t.duration_ms / 1000 : null,
    wallSec: t.wall_ms ? t.wall_ms / 1000 : null,
    savedFilename: t.filename,
    dbId: t.id,
    finalized: true,
    params: t.params,
  }
}

/** A queue job that has no saved track (yet): waiting, being made, failed or stopped. */
function fromServerJob(j: ServerJob): Yue2Job {
  const req = j.request || {}
  const save = j.save || ({} as ServerJob['save'])
  const params = (save.params || {}) as Record<string, any>
  return {
    id: `job_${j.id}`,
    serverJobId: j.id,
    status: j.status,
    createdAt: jobTime(j.created_at) ?? Date.now(),
    startedAt: jobTime(j.started_at),
    title: save.title || j.title || '',
    style: save.style || params.style || '',
    lyrics: save.lyrics ?? req.lyrics ?? '',
    cot: (req.options?.cot as CotMode) || params.cot || 'off',
    precision: (req.precision as Precision) || params.precision || 'q8_0',
    seed: typeof req.seed === 'number' ? req.seed : 0,
    error: j.error ?? undefined,
    finalized: j.status !== 'queued' && j.status !== 'running',
    params,
  }
}

export const useYue2Store = defineStore('yue2', {
  state: () => ({
    jobs: [] as Yue2Job[],
    health: null as api.HealthResponse | null,
    healthError: false,
    historyLoaded: false,
    // Set by a TrackCard's "insert into form" action; GenerateForm watches
    // this and copies it into its own local ABC textarea state.
    pendingAbcInsert: null as string | null,
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
    _saved: {} as Record<string, Yue2Job>,
    /** Rows of queue jobs that have no saved track. */
    _pending: [] as Yue2Job[],
    /** Tracks deleted here: a recently finished job still lists them until the backend drops them. */
    _deleted: [] as number[],
  }),
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
        const tracks = await tracksApi.listTracks('yue2')
        const saved: Record<string, Yue2Job> = {}
        for (const t of tracks) {
          if (this._deleted.includes(t.id)) continue
          saved[`saved_${t.id}`] = fromTrack(t)
        }
        // the list is the truth: names changed and tracks deleted elsewhere (the library) show here
        this._saved = saved
        // the queue's finished jobs may hold tracks saved after the list above was read
        this.syncServerJobs(useGenQueueStore().jobsOf('yue2'))
      } finally {
        this.historyLoaded = true
      }
    },
    /** The queue's YuE2 jobs: a finished one is shown through its saved track, the rest as rows of their own. */
    syncServerJobs(list: ServerJob[]) {
      const pending: Yue2Job[] = []
      for (const j of list) {
        for (const t of j.tracks || []) {
          if (this._deleted.includes(t.id) || this._saved[`saved_${t.id}`]) continue
          this._saved[`saved_${t.id}`] = fromTrack(t)
        }
        if (j.status !== 'done' && !(j.tracks || []).length) pending.push(fromServerJob(j))
      }
      this._pending = pending
      this._rebuild()
    },
    async refreshHealth() {
      // a stopped engine answers 503 through the proxy: no request (it only filled the console) until it runs
      const status = useOrchestratorStore().statuses.yue2?.status
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
      const tick = async () => {
        await this.refreshHealth()
        this._healthTimer = setTimeout(tick, HEALTH_MS)
      }
      void tick()
    },
    stopBackgroundTasks() {
      if (this._healthTimer) clearTimeout(this._healthTimer)
      this._healthTimer = null
    },
    /**
     * Queues the takes on the backend, one job a seed; the backend starts YuE2, makes them one after another and
     * saves each into the library. `title` names the takes (the style when not given; "From an idea" passes the idea).
     */
    async generateBatch(params: { lyrics: string; style: string; cot: CotMode; precision: Precision; baseSeed: number; randomSeed: boolean; batchSize: number; options: GenerateOptions; title?: string }) {
      const batch: JobBatchEntry[] = []
      const makeCover = useCoversStore().wantsCover
      for (let i = 0; i < params.batchSize; i++) {
        const seed = params.randomSeed ? Math.floor(Math.random() * 2147483647) : params.baseSeed + i
        batch.push({
          request: { lyrics: params.lyrics, seed, options: params.options, precision: params.precision, ...(makeCover ? { make_cover: true } : {}) },
          takes: 1,
          save: {
            title: params.title || params.style,
            lyrics: params.lyrics,
            style: params.style,
            params: { ...params.options, cot: params.cot, precision: params.precision, style: params.style, lyrics: params.lyrics },
          },
        })
      }
      await useGenQueueStore().submit('yue2', batch)
    },
    async cancel(jobId: string) {
      const job = this.jobs.find((j) => j.id === jobId)
      if (job?.serverJobId != null) await useGenQueueStore().cancel(job.serverJobId)
    },
    requestInsertAbc(abc: string) {
      this.pendingAbcInsert = abc
    },
    clearPendingAbcInsert() {
      this.pendingAbcInsert = null
    },
    /** A saved take deletes its track; a failed or stopped one is taken off the queue's list. */
    async deleteJob(job: Yue2Job) {
      if (job.dbId != null) {
        this._deleted.push(job.dbId)
        try {
          await tracksApi.deleteTrack(job.dbId)
        } catch {
          // ignore - still remove locally so the UI doesn't get stuck
        }
        delete this._saved[job.id]
        this._rebuild()
      } else if (job.serverJobId != null) {
        await useGenQueueStore().dismiss(job.serverJobId)
      }
    },
    async renameJob(job: Yue2Job, title: string) {
      if (job.dbId == null) return
      await tracksApi.renameTrack(job.dbId, title)
      const target = this.jobs.find((j) => j.id === job.id)
      if (target) target.title = title
    },
  },
})

// Without this, editing this file while the dev server is running leaves
// already-mounted components bound to a stale store instance (old action
// closures) instead of picking up the new code - looks like "it's fixed in
// a fresh tab but stuck in the one I already had open".
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useYue2Store, import.meta.hot))
}
