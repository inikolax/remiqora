import { acceptHMRUpdate, defineStore } from 'pinia'
import * as sa3Api from '../api/stableAudio'
import { SA3_BASES } from '../api/stableAudio'
import type { Sa3Device, Sa3ModelId } from '../api/stableAudio'
import * as tracksApi from '../api/tracks'
import { i18n } from '../i18n'

const t = i18n.global.t

const POLL_MS = 1500

/** oneshot = a hit or a short sound; loop = bars at the project tempo; texture = an atmosphere or a bed. */
export const SFX_KINDS = ['oneshot', 'loop', 'texture'] as const
export type SfxKind = (typeof SFX_KINDS)[number]

export interface SfxRequest {
  kind: SfxKind
  /** What the user typed. */
  caption: string
  model: Sa3ModelId
  /** Seconds asked from the model (a loop: bars at the project tempo). */
  duration: number
  bpm: number
  bars: number
  count: number
  /** one-shot: the server drops the leading silence. */
  trimSilence?: boolean
  /** The timeline audio the model hears (audio-to-audio): the result keeps its rhythm and colour. */
  reference?: SfxReference | null
}

export interface SfxReference {
  laneIds: string[]
  /** Timeline span that was mixed, seconds. */
  start: number
  end: number
  /** 0 = only the feel, 1 = nearly the same audio. */
  closeness: number
}

export interface SfxVariant {
  url: string
  trackId: number | null
  title: string
  index: number
  durationSec: number | null
  /** Placed on a lane at least once (a label; what stays on dismissal is decided by the project's clips). */
  used: boolean
  /** Library files made from this result when it was placed (a seamed loop): dismissed with it. */
  copies: { url: string; trackId: number }[]
}

export type SfxStatus = 'queued' | 'running' | 'saving' | 'done' | 'failed' | 'cancelled'

export interface SfxJob {
  id: string
  taskId: string | null
  /** editor store `session` the job belongs to; results only go into that project. */
  session: number
  /** The GPU engine, or the CPU sample server next to it. */
  device: Sa3Device
  status: SfxStatus
  progress: number
  error: string | null
  request: SfxRequest
  createdAt: number
  variants: SfxVariant[]
}

/** The text the model gets: Freesound-style tags around the user's words. */
export function sfxPrompt(r: SfxRequest): string {
  const text = r.caption.trim()
  if (r.kind === 'loop') return `TrackType: Instrument, ${text}, ${Math.round(r.bpm)} BPM, seamless loop`
  return `TrackType: SFX. ${text}`
}

export function sfxTitle(r: SfxRequest, index: number): string {
  const short = r.caption.trim().replace(/\s+/g, ' ').slice(0, 48)
  return `${t(`sfx.kinds.${r.kind}`)} · ${short} · ${index + 1}`
}

export const useSfxStore = defineStore('sfx', {
  state: () => ({
    jobs: [] as SfxJob[],
    _pollTimer: null as ReturnType<typeof setTimeout> | null,
  }),
  actions: {
    /** `audio` is the mixed reference span when `request.reference` is set: the job then runs audio-to-audio. */
    async submit(request: SfxRequest, session: number, audio: File | null = null, device: Sa3Device = 'gpu'): Promise<SfxJob> {
      this.jobs.unshift({
        id: crypto.randomUUID(),
        taskId: null,
        session,
        device,
        status: 'queued',
        progress: 0,
        error: null,
        request,
        createdAt: Date.now(),
        variants: [],
      })
      const job = this.jobs[0] // the reactive proxy, so later writes re-render
      try {
        const ref = audio ? request.reference : null
        // the post-trained checkpoints are tuned for 8 steps without CFG; a -base one needs about 50 and CFG 7
        const isBase = request.model.endsWith('-base')
        const res = await sa3Api.submitJob({
          task: ref ? 'a2a' : 'text', model: request.model, prompt: sfxPrompt(request), duration: request.duration,
          steps: isBase ? 50 : 8, cfg_scale: isBase ? 7 : 1, seed: -1, batch_size: request.count, trim_silence: request.trimSilence || undefined,
          // Stable Audio's noise level is the opposite of closeness.
          init_noise_level: ref ? Math.min(1, Math.max(0, 1 - ref.closeness)) : undefined,
        }, ref ? audio : null, SA3_BASES[device])
        job.taskId = res.job_id
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
      // one query per server: the GPU engine and the CPU sample server keep their own job ids
      const states: sa3Api.Sa3JobState[] = []
      for (const device of ['gpu', 'cpu'] as Sa3Device[]) {
        const ids = waiting.filter((j) => (j.device ?? 'gpu') === device).map((j) => j.taskId as string)
        if (!ids.length) continue
        try {
          states.push(...await sa3Api.queryJobs(ids, SA3_BASES[device]))
        } catch {
          // that server is restarting; the next tick retries
        }
      }
      for (const st of states) {
        const job = waiting.find((j) => j.taskId === st.job_id)
        if (!job || job.status === 'cancelled') continue
        if (st.status === 'done') {
          job.status = 'saving'
          job.progress = 100
          void this._persist(job, st.files.map((f) => sa3Api.audioUrl(f, SA3_BASES[job.device ?? 'gpu'])), st.durations)
        } else if (st.status === 'failed' || st.status === 'cancelled') {
          job.status = st.status
          job.error = st.error || (st.status === 'failed' ? t('storeErrors.unknownError') : null)
        } else {
          job.status = st.status
          job.progress = st.progress
        }
      }
    },
    /** Copies each result from the engine into the library (origin "editor", marked sfx), so a clip's URL survives a restart. */
    async _persist(job: SfxJob, urls: string[], durations: number[]) {
      const r = job.request
      for (const [i, url] of urls.entries()) {
        const title = sfxTitle(r, i)
        const durationSec = durations[i] ?? null
        try {
          const resp = await fetch(url)
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
          const saved = await tracksApi.saveTrack(
            {
              model: 'editor',
              title,
              lyrics: '',
              duration_ms: durationSec != null ? Math.round(durationSec * 1000) : undefined,
              params: {
                sfx: true, kind: r.kind, caption: r.caption, prompt: sfxPrompt(r), engine: 'sa3', model: r.model, device: job.device,
                bpm: r.bpm, bars: r.kind === 'loop' ? r.bars : undefined, duration: r.duration, index: i,
                ...(r.reference ? { ref_lanes: r.reference.laneIds, ref_range: [r.reference.start, r.reference.end], closeness: r.reference.closeness } : {}),
              },
            },
            await resp.blob(),
            'wav',
          )
          job.variants.push({ url: saved.audio_url, trackId: saved.id, title, index: i, durationSec, used: false, copies: [] })
        } catch {
          // Library save failed: still offer the (temporary) engine URL.
          job.variants.push({ url, trackId: null, title, index: i, durationSec, used: false, copies: [] })
        }
      }
      job.status = job.variants.length ? 'done' : 'failed'
      if (!job.variants.length) job.error = t('sfx.noResults')
    },
    async cancel(jobId: string) {
      const job = this.jobs.find((j) => j.id === jobId)
      if (!job) return
      if (job.taskId) {
        try {
          await sa3Api.cancelJob(job.taskId, SA3_BASES[job.device ?? 'gpu'])
        } catch {
          // already finished or the engine is gone; the local state below still applies
        }
      }
      if (job.status === 'queued' || job.status === 'running') job.status = 'cancelled'
    },
    /**
     * Drops the job and deletes its results from the library (the database row and the file on disk),
     * except those a clip still plays: `keepUrls` is the set of source URLs on the project's lanes.
     */
    async removeJob(jobId: string, keepUrls: ReadonlySet<string> = new Set()) {
      const job = this.jobs.find((j) => j.id === jobId)
      this.jobs = this.jobs.filter((j) => j.id !== jobId)
      if (!job) return
      const files = job.variants.flatMap((v) => [{ url: v.url, trackId: v.trackId }, ...v.copies])
      for (const f of files) {
        if (f.trackId == null || keepUrls.has(f.url)) continue
        try {
          await tracksApi.deleteTrack(f.trackId)
        } catch {
          // already gone
        }
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSfxStore, import.meta.hot))
}
