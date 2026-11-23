import { acceptHMRUpdate, defineStore } from 'pinia'
import * as api from '../api/stableAudio'
import type { Sa3Model, Sa3ModelId } from '../api/stableAudio'
import * as tracksApi from '../api/tracks'
import type { SavedTrack } from '../api/tracks'
import { jobTime } from '../api/jobs'
import type { ServerJob } from '../api/jobs'
import type { JobStatus } from '../types'
import { useGenQueueStore } from './genQueue'
import { useCoversStore } from './covers'

const MODELS_MS = 5000

export type Sa3Kind = 'music' | 'sfx'

/** One generated variant: a card in the feed. A batch of N makes N jobs sharing one server task. */
export interface Sa3Job {
  id: string
  status: JobStatus
  createdAt: number
  /** When the backend began making it (a job of the queue). */
  startedAt?: number | null
  /** The backend queue's job this card stands for while it has no saved track. */
  serverJobId?: number | null
  /** The name shown on the card and stored as the track title; the user can rename it. */
  title: string
  prompt: string
  kind: Sa3Kind
  model: Sa3ModelId
  seed: number | null
  durationSec: number | null
  wallSec: number | null
  progress: number
  error?: string
  audioUrl?: string
  savedFilename?: string | null
  saveError?: string | null
  dbId?: number | null
  finalized: boolean
  params: Record<string, unknown>
  /** The variant's index in its job's batch. */
  index?: number
}

/** What to do with a reference track: remake it in a new style, redo a range, or carry it on. */
export type Sa3RefMode = 'cover' | 'repaint' | 'continue'

export interface Sa3Reference {
  file: Blob
  name: string
  durationSec: number
  /** The library track it came from, if any. */
  trackId: number | null
  mode: Sa3RefMode
  /** cover: 0 = loose, 1 = close to the original. */
  closeness: number
  /** cover: the result's length in seconds, or null for the source's own. */
  customSec: number | null
  /** repaint: the ranges to redo, seconds into the reference. */
  ranges: { start: number; end: number }[]
  /** continue: how many seconds to add after the end. */
  extendSec: number
}

export interface Sa3GenerateParams {
  kind: Sa3Kind
  model: Sa3ModelId
  prompt: string
  negativePrompt: string
  duration: number
  steps: number
  cfgScale: number
  seed: number
  count: number
  reference?: Sa3Reference | null
  /** One text per variant (as many as `count`); `prompt` then only names the run. */
  prompts?: string[] | null
  /** What the user typed, before the service tags were added. */
  caption?: string
  autoTags?: boolean
  /** Text-to-audio only: drop the silence the take starts with. */
  trimSilence?: boolean
  /** Decode in chunks: true / false, or null to leave it to the engine. */
  chunkedDecode?: boolean | null
  /** The sampler and guidance fields set by hand, sent as they are. */
  advanced?: Pick<api.Sa3JobRequest, 'sampler_type' | 'apg_scale' | 'cfg_interval_min' | 'cfg_interval_max' | 'scale_phi' | 'cfg_norm_threshold' | 'duration_padding'>
  /** The card's and the track's name; the prompt when not given ("From an idea" passes the idea). */
  title?: string
  /** A name per variant (a description per variant: each its own text as typed); `title` wins when given. */
  titles?: string[]
}

/** A saved track as a card of the feed. */
function fromTrack(trk: SavedTrack): Sa3Job {
  return {
    id: `saved_${trk.id}`,
    status: 'done',
    createdAt: new Date(trk.created_at).getTime() || Date.now(),
    title: trk.title,
    prompt: (trk.params.prompt as string) || trk.title,
    kind: ((trk.params.kind as Sa3Kind) || 'music'),
    model: ((trk.params.model as Sa3ModelId) || 'medium'),
    seed: trk.seed,
    durationSec: trk.duration_ms ? trk.duration_ms / 1000 : null,
    wallSec: trk.wall_ms ? trk.wall_ms / 1000 : null,
    progress: 100,
    audioUrl: trk.audio_url,
    savedFilename: trk.filename,
    dbId: trk.id,
    finalized: true,
    params: trk.params,
  }
}

/** Variant `i` of a queue job that has no saved track: waiting, being made, failed or stopped. */
function fromServerJob(j: ServerJob, i: number): Sa3Job {
  const req = j.request || {}
  const save = j.save || ({} as ServerJob['save'])
  const params = (save.params || {}) as Record<string, unknown>
  const text = save.prompts?.[i] ?? (typeof params.prompt === 'string' ? params.prompt : '')
  return {
    id: `job_${j.id}_${i}`,
    serverJobId: j.id,
    status: j.status,
    createdAt: jobTime(j.created_at) ?? Date.now(),
    startedAt: jobTime(j.started_at),
    title: save.titles?.[i] || save.title || j.title || text,
    prompt: text || save.style || '',
    kind: (params.kind as Sa3Kind) || 'music',
    model: (req.model as Sa3ModelId) || (params.model as Sa3ModelId) || 'medium',
    seed: typeof req.seed === 'number' && req.seed >= 0 ? req.seed : null,
    durationSec: null,
    wallSec: null,
    progress: Math.round((j.progress ?? 0) * 100),
    error: j.error ?? undefined,
    finalized: j.status !== 'queued' && j.status !== 'running',
    params,
    index: i,
  }
}

export const useStableAudioStore = defineStore('stableAudio', {
  state: () => ({
    jobs: [] as Sa3Job[],
    models: [] as Sa3Model[],
    modelsError: false,
    historyLoaded: false,
    pendingParamsInsert: null as Partial<Sa3GenerateParams> | null,
    /** The pending insert asks for an undo snapshot / a flash on the fields it changes (the idea line). */
    pendingUndoable: false,
    pendingFlash: false,
    /** What the last undoable insert overwrote, as params: requestInsertParams(insertUndo) puts it back. */
    insertUndo: null as Partial<Sa3GenerateParams> | null,
    /** Kept by the form: it holds text an idea insert would replace. */
    formHasText: false,
    _modelsTimer: null as ReturnType<typeof setTimeout> | null,
    /** Saved takes by row id: the library's tracks plus those the queue saved since. */
    _saved: {} as Record<string, Sa3Job>,
    /** Cards of queue jobs whose variants are not saved. */
    _pending: [] as Sa3Job[],
    /** Tracks deleted here: a recently finished job still lists them until the backend drops them. */
    _deleted: [] as number[],
  }),
  getters: {
    /** Checkpoints that can run here, in the server's order. */
    availableModels: (s) => s.models.filter((m) => m.available),
  },
  actions: {
    requestInsertParams(params: Partial<Sa3GenerateParams>, opts?: { undoable?: boolean; flash?: boolean }) {
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
        const tracks = await tracksApi.listTracks('stable_audio')
        const saved: Record<string, Sa3Job> = {}
        for (const trk of tracks) {
          if (this._deleted.includes(trk.id)) continue
          saved[`saved_${trk.id}`] = fromTrack(trk)
        }
        // the list is the truth: names changed and tracks deleted elsewhere (the library) show here
        this._saved = saved
        // the queue's finished jobs may hold tracks saved after the list above was read
        this.syncServerJobs(useGenQueueStore().jobsOf('stable_audio'))
      } finally {
        this.historyLoaded = true
      }
    },
    /** The queue's Stable Audio jobs: saved variants as tracks, the rest as a card a variant. */
    syncServerJobs(list: ServerJob[]) {
      const pending: Sa3Job[] = []
      for (const j of list) {
        const tracks = j.tracks || []
        for (const trk of tracks) {
          if (this._deleted.includes(trk.id) || this._saved[`saved_${trk.id}`]) continue
          this._saved[`saved_${trk.id}`] = fromTrack(trk)
        }
        // done with a note: some variants came back without audio; they show as failed cards, as they did before
        if (j.status === 'done' && !j.error) continue
        for (let i = tracks.length; i < Math.max(1, j.takes || 1); i++) {
          const card = fromServerJob(j, i)
          if (j.status === 'done') Object.assign(card, { status: 'failed', finalized: true })
          pending.push(card)
        }
      }
      this._pending = pending
      this._rebuild()
    },
    async refreshModels() {
      try {
        this.models = await api.models()
        this.modelsError = false
      } catch {
        this.modelsError = true
      }
    },
    startBackgroundTasks() {
      if (this._modelsTimer) return
      const tick = async () => {
        await this.refreshModels()
        this._modelsTimer = setTimeout(tick, MODELS_MS)
      }
      void tick()
    },
    stopBackgroundTasks() {
      if (this._modelsTimer) clearTimeout(this._modelsTimer)
      this._modelsTimer = null
    },
    /** Queues the variants on the backend as one job; the backend starts Stable Audio and saves each variant. */
    async generate(p: Sa3GenerateParams) {
      const ref = p.reference ?? null
      // The reference decides the task and the length: a cover keeps the source length, a repaint too,
      // a continuation is the source plus the extension (the mask covers the part past the source).
      const prompts = p.prompts && p.prompts.length === p.count ? p.prompts : null
      const req: api.Sa3JobRequest = {
        task: 'text', model: p.model, prompt: prompts ?? p.prompt, negative_prompt: p.negativePrompt || undefined,
        duration: p.duration, steps: p.steps, cfg_scale: p.cfgScale, seed: p.seed, batch_size: p.count,
      }
      if (ref?.mode === 'cover') {
        req.task = 'a2a'
        req.init_noise_level = Math.min(1, Math.max(0, 1 - ref.closeness))
        req.duration = ref.customSec ?? ref.durationSec
      } else if (ref?.mode === 'repaint') {
        req.task = 'inpaint'
        req.mask_start = ref.ranges.map((r) => r.start)
        req.mask_end = ref.ranges.map((r) => r.end)
        req.duration = ref.durationSec
      } else if (ref?.mode === 'continue') {
        req.task = 'inpaint'
        req.mask_start = [ref.durationSec]
        req.mask_end = [ref.durationSec + ref.extendSec]
        req.duration = ref.durationSec + ref.extendSec
      }
      if (p.trimSilence && req.task === 'text') req.trim_silence = true
      if (p.chunkedDecode != null) req.chunked_decode = p.chunkedDecode
      if (p.advanced) Object.assign(req, p.advanced)
      const params = {
        task: req.task, kind: p.kind, model: p.model, prompt: p.prompt, prompts: prompts ?? undefined, caption: p.caption,
        auto_tags: p.autoTags, negative_prompt: p.negativePrompt, ...(p.advanced ?? {}),
        // kept so a reuse can set the decoder's switches again
        trim_silence: req.trim_silence, chunked_decode: req.chunked_decode,
        duration: req.duration, steps: p.steps, cfg_scale: p.cfgScale, seed: p.seed, batch_size: p.count,
        ...(ref ? {
          ref_mode: ref.mode, ref_name: ref.name, ref_track_id: ref.trackId, ref_duration: ref.durationSec,
          closeness: ref.mode === 'cover' ? ref.closeness : undefined,
          custom_sec: ref.mode === 'cover' ? ref.customSec : undefined,
          mask: ref.mode === 'repaint' ? ref.ranges.map((r) => [r.start, r.end]) : undefined,
          extend_sec: ref.mode === 'continue' ? ref.extendSec : undefined,
        } : {}),
      }
      // a variant's text and its name (the run's name when given, else its own text)
      const texts = Array.from({ length: p.count }, (_, i) => (prompts ? prompts[i] : p.prompt))
      // JSON drops the fields left undefined, as the multipart form did
      const request = JSON.parse(JSON.stringify(req)) as Record<string, unknown>
      if (p.kind === 'music' && useCoversStore().wantsCover) request.make_cover = true
      await useGenQueueStore().submit('stable_audio', [{
        request,
        takes: p.count,
        save: {
          title: p.title || p.titles?.[0] || texts[0] || p.prompt, lyrics: '', style: p.prompt, params: JSON.parse(JSON.stringify(params)),
          titles: texts.map((text, i) => p.title || p.titles?.[i] || text), prompts: texts,
        },
      }], ref?.file ?? null, 'context.wav')
    },
    async cancel(jobId: string) {
      const job = this.jobs.find((j) => j.id === jobId)
      if (job?.serverJobId != null) await useGenQueueStore().cancel(job.serverJobId)
    },
    /** A saved variant deletes its track; a failed or stopped job is taken off the queue's list (all its cards). */
    async deleteJob(job: Sa3Job) {
      if (job.dbId != null) {
        this._deleted.push(job.dbId)
        try {
          await tracksApi.deleteTrack(job.dbId)
        } catch {
          // still remove locally so the card does not get stuck
        }
        delete this._saved[job.id]
        this._rebuild()
      } else if (job.serverJobId != null) {
        await useGenQueueStore().dismiss(job.serverJobId)
      }
    },
    async renameJob(job: Sa3Job, title: string) {
      if (job.dbId == null) return
      await tracksApi.renameTrack(job.dbId, title)
      const target = this.jobs.find((j) => j.id === job.id)
      if (target) target.title = title
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStableAudioStore, import.meta.hot))
}
