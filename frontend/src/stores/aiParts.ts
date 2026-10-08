import { acceptHMRUpdate, defineStore } from 'pinia'
import * as aceApi from '../api/aceStep'
import type { GenerateMusicRequest } from '../api/aceStep'
import * as tracksApi from '../api/tracks'
import { i18n } from '../i18n'
import type { AiMode, AiTrack } from '../utils/aiParts'
import type { HeldClip } from './editor'

const t = i18n.global.t

const POLL_MS = 2000

export interface AiPartRequest {
  mode: AiMode
  /** lego only: the part class to generate. */
  track: AiTrack
  caption: string
  lyrics: string
  /** ACE-Step language code for the lyrics ('' = none sent: no lyrics, or an instrumental part). */
  vocalLanguage: string
  /** Lanes mixed into the audio sent to the model. */
  laneIds: string[]
  /** Timeline span of that audio. */
  ctxStart: number
  ctxEnd: number
  /** Where the result belongs on the timeline (lego: the whole context; continue: past ctxEnd). */
  regionStart: number
  regionEnd: number
  model: string
  keyScale: string
  bpm: number
  count: number
  /** cover only: 0 = loose style transfer, 1 = keep the original's structure. */
  coverStrength: number
}

export interface AiPartVariant {
  url: string
  trackId: number | null
  laneId: string | null
  /** lego only: correlation with the context; above COPY_THRESHOLD it is a copy, not a new part. */
  copyScore: number | null
}

export type AiPartStatus = 'queued' | 'running' | 'saving' | 'done' | 'failed' | 'cancelled'

export interface AiPartJob {
  id: string
  taskId: string | null
  /** editor store `session` the job belongs to; results only go into that project. */
  session: number
  status: AiPartStatus
  progress: number
  error: string | null
  request: AiPartRequest
  createdAt: number
  variants: AiPartVariant[]
  /** Set once the variants were put on lanes. */
  inserted: boolean
  /** Original clips silenced under the variants (repaint / continue / cover). */
  held: HeldClip[]
  /** Index of the variant the user kept. */
  kept: number | null
}

interface RawResultEntry {
  file?: string
  stage?: string
  progress?: number
  error?: string | null
}

/** ACE-Step request for one job. Turbo runs 8 steps; base / xl-base need 50 (the API defaults to 8). */
function buildRequest(r: AiPartRequest): GenerateMusicRequest {
  const common: GenerateMusicRequest = {
    model: r.model,
    prompt: r.caption,
    bpm: r.bpm || undefined,
    key_scale: r.keyScale || undefined,
    time_signature: '4',
    // Without it release_task assumes English and sings Russian words as English.
    vocal_language: r.vocalLanguage || undefined,
    inference_steps: /turbo/i.test(r.model) ? 8 : 50,
    guidance_scale: 7.0,
    // Fresh random seeds every time: reusing the seed of a part that is already
    // in the context makes lego return a copy of the context.
    use_random_seed: true,
    batch_size: r.count,
    audio_format: 'wav',
  }
  switch (r.mode) {
    case 'lego':
      return { ...common, task_type: 'lego', track_name: r.track, lyrics: r.lyrics || '[Instrumental]' }
    case 'cover':
      return { ...common, task_type: 'cover', audio_cover_strength: r.coverStrength, lyrics: r.lyrics || undefined }
    default:
      // repaint and continue: continue is a repaint whose range starts at the end of the context.
      return {
        ...common,
        task_type: 'repaint',
        repainting_start: r.regionStart - r.ctxStart,
        repainting_end: r.regionEnd - r.ctxStart,
        chunk_mask_mode: 'explicit',
        lyrics: r.lyrics || undefined,
      }
  }
}

export function jobLabel(r: AiPartRequest): string {
  return r.mode === 'lego' ? t(`aiPart.tracks.${r.track}`) : t(`aiPart.resultNames.${r.mode}`)
}

export const useAiPartsStore = defineStore('aiParts', {
  state: () => ({
    jobs: [] as AiPartJob[],
    /**
     * Library copies of variants the user threw away. They are deleted on the next project save,
     * and only if no clip uses them then: an undo can bring a dropped variant lane back.
     */
    discarded: [] as AiPartVariant[],
    _pollTimer: null as ReturnType<typeof setTimeout> | null,
  }),
  actions: {
    async submit(request: AiPartRequest, context: File, session: number): Promise<AiPartJob> {
      this.jobs.unshift({
        id: crypto.randomUUID(),
        taskId: null,
        session,
        status: 'queued',
        progress: 0,
        error: null,
        request,
        createdAt: Date.now(),
        variants: [],
        inserted: false,
        held: [],
        kept: null,
      })
      const job = this.jobs[0] // the reactive proxy, so later writes re-render
      try {
        const res = await aceApi.releaseTask(buildRequest(request), context)
        job.taskId = res.task_id
        this._ensurePolling()
      } catch (e) {
        job.status = 'failed'
        job.error = e instanceof Error ? e.message : String(e)
      }
      return job
    },
    _ensurePolling() {
      if (this._pollTimer) return
      const tick = async () => {
        await this._poll()
        this._pollTimer = this.jobs.some((j) => (j.status === 'queued' || j.status === 'running') && j.taskId)
          ? setTimeout(tick, POLL_MS)
          : null
      }
      this._pollTimer = setTimeout(tick, POLL_MS)
    },
    async _poll() {
      const waiting = this.jobs.filter((j) => (j.status === 'queued' || j.status === 'running') && j.taskId)
      if (waiting.length === 0) return
      let results: aceApi.QueryResultEntry[]
      try {
        results = await aceApi.queryResult(waiting.map((j) => j.taskId as string))
      } catch {
        return // backend or model restarting; next tick retries
      }
      for (const entry of results) {
        const job = this.jobs.find((j) => j.taskId === entry.task_id)
        if (!job || job.status === 'cancelled') continue
        let parsed: RawResultEntry[] = []
        try {
          parsed = JSON.parse(entry.result)
        } catch {
          parsed = []
        }
        const first = parsed[0] || {}
        if (entry.status === 1) {
          job.status = 'saving'
          job.progress = 100
          void this._persist(job, parsed.filter((p) => p.file).map((p) => `/api/ace${p.file}`))
        } else if (entry.status === 2) {
          job.status = first.error === 'Cancelled by user' ? 'cancelled' : 'failed'
          job.error = first.error || t('storeErrors.unknownError')
        } else {
          job.status = first.stage === 'queued' ? 'queued' : 'running'
          job.progress = Math.round((first.progress || 0) * 100)
        }
      }
    },
    /**
     * Copies each variant from ACE-Step's temp storage into the shared library
     * (origin "editor"), so the project keeps a URL that survives a restart.
     */
    async _persist(job: AiPartJob, urls: string[]) {
      const r = job.request
      for (const [i, url] of urls.entries()) {
        try {
          const resp = await fetch(url)
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
          const saved = await tracksApi.saveTrack(
            {
              model: 'editor',
              title: `${jobLabel(r)} · ${t('aiPart.variantShort', { n: i + 1 })}`,
              lyrics: r.lyrics,
              params: {
                ai_part: true, mode: r.mode, track_name: r.mode === 'lego' ? r.track : undefined, caption: r.caption,
                model: r.model, bpm: r.bpm, key_scale: r.keyScale, context: [r.ctxStart, r.ctxEnd],
                region: [r.regionStart, r.regionEnd],
              },
            },
            await resp.blob(),
            'wav',
          )
          job.variants.push({ url: saved.audio_url, trackId: saved.id, laneId: null, copyScore: null })
        } catch {
          // Library save failed: still offer the (temporary) model URL.
          job.variants.push({ url, trackId: null, laneId: null, copyScore: null })
        }
      }
      job.status = job.variants.length ? 'done' : 'failed'
      if (!job.variants.length) job.error = t('aiPart.noResults')
    },
    async cancel(jobId: string) {
      const job = this.jobs.find((j) => j.id === jobId)
      if (!job) return
      if (job.taskId) {
        try {
          await aceApi.cancelTask(job.taskId)
        } catch {
          // already finished or the model is gone; the local state below still applies
        }
      }
      if (job.status === 'queued' || job.status === 'running') job.status = 'cancelled'
    },
    discardVariants(variants: AiPartVariant[]) {
      this.discarded.push(...variants.filter((v) => v.trackId != null))
    },
    /** Deletes the discarded variants' library tracks that `usedUrls` (the saved project's clips) do not reference. */
    async purgeDiscarded(usedUrls: Set<string>) {
      const drop = this.discarded.filter((v) => !usedUrls.has(v.url))
      this.discarded = this.discarded.filter((v) => usedUrls.has(v.url))
      for (const v of drop) {
        try {
          await tracksApi.deleteTrack(v.trackId as number)
        } catch {
          // already gone; nothing references it
        }
      }
    },
    removeJob(jobId: string) {
      this.jobs = this.jobs.filter((j) => j.id !== jobId)
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAiPartsStore, import.meta.hot))
}
