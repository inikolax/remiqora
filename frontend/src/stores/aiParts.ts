import { acceptHMRUpdate, defineStore } from 'pinia'
import { markRaw } from 'vue'
import * as aceApi from '../api/aceStep'
import type { GenerateMusicRequest } from '../api/aceStep'
import * as sa3Api from '../api/stableAudio'
import type { Sa3JobRequest, Sa3ModelId } from '../api/stableAudio'
import * as tracksApi from '../api/tracks'
import { i18n } from '../i18n'
import { NOISE_EXEMPT_TRACKS, NOISE_THRESHOLD, noiseScore } from '../utils/aiParts'
import type { AiEngine, AiMode, AiTrack } from '../utils/aiParts'
import { getSharedAudioCtx } from '../composables/audioPlayback'
import { aceKeyScale, keyScaleText, withScaleHint } from '../utils/keyScale'
import type { HeldClip } from './editor'

const t = i18n.global.t

const POLL_MS = 2000
/** Extra requests for variants that came back as hiss (the XL base model returns it for about one in five). */
const MAX_NOISE_RETRIES = 2

export interface AiPartRequest {
  mode: AiMode
  /** Which engine renders it; `model` is a checkpoint name of that engine. */
  engine: AiEngine
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
  /** How much renderContext raised (or lowered) the context to reach its 0.9 peak; the variants are brought back
   * to the timeline's level from it (variantVolume). Missing on jobs from before it existed: taken as 1. */
  contextGain?: number
}

export interface AiPartVariant {
  url: string
  trackId: number | null
  laneId: string | null
  /** lego only: correlation with the context; above COPY_THRESHOLD it is a copy, not a new part. */
  copyScore: number | null
  /** lego only: spectral flatness of the part; above NOISE_THRESHOLD it is hiss, not an instrument. Unset for drum-like parts. */
  noiseScore?: number | null
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
  /** The audio sent to the model, kept to ask once more for variants that came back as hiss. */
  context?: File
  /** How many times replacements were asked for; after MAX_NOISE_RETRIES the variants are taken as they are. */
  retries?: number
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
    // ACE-Step's key field is major / minor only: any other scale is also named in the text.
    prompt: withScaleHint(r.caption, r.keyScale),
    bpm: r.bpm || undefined,
    key_scale: (r.keyScale && aceKeyScale(r.keyScale)) || undefined,
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

/**
 * Stable Audio 3 request for one job. Repaint and continue are inpainting of the context with the
 * range masked (continue: the mask starts where the context ends and the result is longer than it);
 * cover is audio-to-audio. The output spans the whole context (cover: the range), as ACE-Step's does.
 */
function buildSa3Request(r: AiPartRequest): Sa3JobRequest {
  const text = r.caption.trim()
  const prompt = ['TrackType: Music, VocalType: Instrumental.', text, r.keyScale ? `in ${keyScaleText(r.keyScale)}` : '', r.bpm ? `${Math.round(r.bpm)} BPM` : '']
    .filter(Boolean)
    .join(text && !/[.,;!?]$/.test(text) ? ', ' : ' ')
    .replace('. , ', '. ')
  const common: Sa3JobRequest = {
    task: 'text',
    model: r.model as Sa3ModelId,
    prompt,
    steps: 8,
    cfg_scale: 1,
    seed: -1,
    batch_size: r.count,
  }
  switch (r.mode) {
    case 'cover':
      // ACE-Step's strength is "closeness to the original"; Stable Audio's noise level is the opposite.
      return { ...common, task: 'a2a', init_noise_level: Math.min(1, Math.max(0, 1 - r.coverStrength)) }
    case 'continue':
      return {
        ...common, task: 'inpaint', duration: r.regionEnd - r.ctxStart,
        mask_start: [r.ctxEnd - r.ctxStart], mask_end: [r.regionEnd - r.ctxStart],
      }
    default:
      return {
        ...common, task: 'inpaint', duration: r.ctxEnd - r.ctxStart,
        mask_start: [r.regionStart - r.ctxStart], mask_end: [r.regionEnd - r.ctxStart],
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
        context: markRaw(context),
      })
      const job = this.jobs[0] // the reactive proxy, so later writes re-render
      try {
        if (request.engine === 'sa3') {
          const res = await sa3Api.submitJob(buildSa3Request(request), context)
          job.taskId = res.job_id
        } else {
          const res = await aceApi.releaseTask(buildRequest(request), context)
          job.taskId = res.task_id
        }
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
      await Promise.all([
        this._pollAce(waiting.filter((j) => j.request.engine !== 'sa3')),
        this._pollSa3(waiting.filter((j) => j.request.engine === 'sa3')),
      ])
    },
    async _pollSa3(waiting: AiPartJob[]) {
      if (waiting.length === 0) return
      let states: sa3Api.Sa3JobState[]
      try {
        states = await sa3Api.queryJobs(waiting.map((j) => j.taskId as string))
      } catch {
        return
      }
      for (const st of states) {
        const job = waiting.find((j) => j.taskId === st.job_id)
        if (!job || job.status === 'cancelled') continue
        if (st.status === 'done') {
          job.status = 'saving'
          job.progress = 100
          void this._persist(job, st.files.map((f) => sa3Api.audioUrl(f)))
        } else if (st.status === 'failed' || st.status === 'cancelled') {
          job.status = st.status
          job.error = st.error || (st.status === 'failed' ? t('storeErrors.unknownError') : null)
        } else {
          job.status = st.status
          job.progress = st.progress
        }
      }
    },
    async _pollAce(waiting: AiPartJob[]) {
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
          if (job.retries && job.variants.length && first.error !== 'Cancelled by user') {
            // Only the request for replacements failed: the good variants of the first one stand.
            job.status = 'done'
          } else {
            job.status = first.error === 'Cancelled by user' ? 'cancelled' : 'failed'
            job.error = first.error || t('storeErrors.unknownError')
          }
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
      // ACE-Step's lego sometimes returns steady hiss instead of a part: 7 variants of 162 on the base
      // model and 15 of 72 on XL base, whatever the part, context length, tempo or guidance. Those are
      // not saved; the same request is sent again for as many variants as were dropped.
      const screen = r.mode === 'lego' && r.engine !== 'sa3' && !NOISE_EXEMPT_TRACKS.has(r.track) && (job.retries ?? 0) < MAX_NOISE_RETRIES && !!job.context
      let dropped = 0
      for (const url of urls) {
        try {
          const resp = await fetch(url)
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
          const blob = await resp.blob()
          if (screen) {
            let noisy = false
            try {
              noisy = noiseScore(await getSharedAudioCtx().decodeAudioData(await blob.arrayBuffer())) >= NOISE_THRESHOLD
            } catch {
              // Undecodable here: leave the verdict to the panel.
            }
            if (noisy) {
              dropped++
              continue
            }
          }
          const saved = await tracksApi.saveTrack(
            {
              model: 'editor',
              title: `${jobLabel(r)} · ${t('aiPart.variantShort', { n: job.variants.length + 1 })}`,
              lyrics: r.lyrics,
              params: {
                ai_part: true, mode: r.mode, engine: r.engine, track_name: r.mode === 'lego' ? r.track : undefined, caption: r.caption,
                model: r.model, bpm: r.bpm, key_scale: r.keyScale, context: [r.ctxStart, r.ctxEnd],
                region: [r.regionStart, r.regionEnd],
              },
            },
            blob,
            'wav',
          )
          job.variants.push({ url: saved.audio_url, trackId: saved.id, laneId: null, copyScore: null })
        } catch {
          // Library save failed: still offer the (temporary) model URL.
          job.variants.push({ url, trackId: null, laneId: null, copyScore: null })
        }
      }
      if (dropped && job.context && job.status !== 'cancelled') {
        job.retries = (job.retries ?? 0) + 1
        try {
          const res = await aceApi.releaseTask(buildRequest({ ...r, count: dropped }), job.context)
          job.taskId = res.task_id
          job.status = 'running'
          job.progress = 0
          this._ensurePolling()
          return
        } catch {
          // The model is gone or busy: settle for the variants that are fine.
        }
      }
      job.context = undefined
      if (job.status === 'cancelled') return
      job.status = job.variants.length ? 'done' : 'failed'
      if (!job.variants.length) job.error = t('aiPart.noResults')
    },
    async cancel(jobId: string) {
      const job = this.jobs.find((j) => j.id === jobId)
      if (!job) return
      if (job.taskId) {
        try {
          if (job.request.engine === 'sa3') await sa3Api.cancelJob(job.taskId)
          else await aceApi.cancelTask(job.taskId)
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
