import { computed } from 'vue'
import { useYue2Store } from '../stores/yue2'
import type { Yue2Job } from '../stores/yue2'
import { useAceStepStore } from '../stores/aceStep'
import type { AceJob } from '../stores/aceStep'
import { useStableAudioStore } from '../stores/stableAudio'
import type { Sa3GenerateParams, Sa3Job } from '../stores/stableAudio'
import { useGenQueueStore } from '../stores/genQueue'
import { friendlyTitle, songName } from '../utils/trackTitle'
import { stripMetaHints } from '../utils/aceHints'
import type { JobStatus, ModelId } from '../types'

/**
 * A take: one piece of audio an engine made (or is making), whichever engine it was. The three engines keep
 * their own job lists; the session and the player read them through this one shape.
 */
export interface Take {
  key: string
  engine: ModelId
  title: string
  /** The style tags or the prompt it was made from. */
  style: string
  lyrics: string
  createdAt: number
  /** When the backend began making it; the time a running take has run is counted from here. */
  startedAt: number | null
  status: JobStatus
  audioUrl: string | null
  durationSec: number | null
  wallSec: number | null
  dbId: number | null
  seed: number | null
  filename: string | null
  /** 0..100 while it is being made, when the engine reports it. */
  progress: number | null
  error: string | null
  params: Record<string, unknown>
  /** How many takes this job will give (ACE-Step reports a batch as one job until it is done). */
  pending: number
  job: Yue2Job | AceJob | Sa3Job
}

/** Takes of one song: the same engine, name and text. */
export interface Song {
  key: string
  engine: ModelId
  title: string
  /** What the list calls it (the name, else the first sung line) and the line under it (the style). */
  name: string
  sub: string
  style: string
  takes: Take[]
  /** The newest take's time: songs are ordered by it. */
  latest: number
  inProgress: boolean
}

export const ENGINE_SHORT: Record<ModelId, string> = { yue2: 'YuE2', ace_step: 'ACE-Step', stable_audio: 'Stable Audio' }

// the description without the line of wishes (length, tempo, key) the form adds for the model
const aceStyle = (job: AceJob): string => String(job.params?.prompt || stripMetaHints(String(job.params?.sample_query || '')))

function fromYue(job: Yue2Job): Take {
  return {
    key: `yue2:${job.id}`, engine: 'yue2', title: job.title, style: job.style, lyrics: job.lyrics, createdAt: job.createdAt, startedAt: job.startedAt ?? null, status: job.status,
    audioUrl: job.audioUrl ?? null, durationSec: job.durationSec ?? null, wallSec: job.wallSec ?? null, dbId: job.dbId ?? null, seed: job.seed,
    filename: job.savedFilename ?? null, progress: null, error: job.error ?? job.saveError ?? null, params: job.params ?? {}, pending: 1, job,
  }
}
function fromSa(job: Sa3Job): Take {
  return {
    key: `stable_audio:${job.id}`, engine: 'stable_audio', title: job.title, style: job.prompt, lyrics: '', createdAt: job.createdAt, startedAt: job.startedAt ?? null, status: job.status,
    audioUrl: job.audioUrl ?? null, durationSec: job.durationSec, wallSec: job.wallSec, dbId: job.dbId ?? null, seed: job.seed,
    filename: job.savedFilename ?? null, progress: job.status === 'running' ? job.progress : null, error: job.error ?? job.saveError ?? null, params: job.params, pending: 1, job,
  }
}
function fromAce(job: AceJob): Take[] {
  const base = {
    engine: 'ace_step' as const, title: job.title, style: aceStyle(job), lyrics: job.lyrics, createdAt: job.createdAt, startedAt: job.startedAt ?? null, wallSec: null,
    seed: null, filename: null, error: job.error ?? null, params: (job.params ?? {}) as Record<string, unknown>, job,
  }
  // done: a take an audio; before that the whole batch is one row with the job's progress
  if (job.status === 'done' && job.audioUrls.length) {
    return job.audioUrls.map((url, i) => ({
      ...base, key: `ace_step:${job.id}:${i}`, status: 'done' as const, audioUrl: url, durationSec: job.durationSec ?? null, dbId: job.dbIds[i] ?? null, progress: null, pending: 1,
    }))
  }
  return [{ ...base, key: `ace_step:${job.id}`, status: job.status, audioUrl: null, durationSec: null, dbId: null, progress: job.status === 'running' ? job.progress : null, pending: Math.max(1, job.batchSize) }]
}

const isActive = (t: Take): boolean => t.status === 'queued' || t.status === 'running'

export function useTakes() {
  const yue = useYue2Store()
  const ace = useAceStepStore()
  const sa = useStableAudioStore()
  const queue = useGenQueueStore()

  const takes = computed<Take[]>(() => [...yue.jobs.map(fromYue), ...ace.jobs.flatMap(fromAce), ...sa.jobs.map(fromSa)])

  /** Songs, newest first; a song's takes in the order they were made. */
  const songs = computed<Song[]>(() => {
    const map = new Map<string, Song>()
    for (const take of takes.value) {
      const key = `${take.engine}|${take.title.trim().toLowerCase()}|${(take.lyrics || take.style).trim().toLowerCase()}`
      let song = map.get(key)
      if (!song) {
        song = { key, engine: take.engine, title: friendlyTitle(take.title), ...songName(take.title, take.style, take.lyrics), style: take.style, takes: [], latest: 0, inProgress: false }
        map.set(key, song)
      }
      song.takes.push(take)
      song.latest = Math.max(song.latest, take.createdAt)
      if (isActive(take)) song.inProgress = true
    }
    const list = [...map.values()]
    for (const song of list) song.takes.sort((a, b) => a.createdAt - b.createdAt || a.key.localeCompare(b.key))
    // what is being made now comes first, then by the newest take
    return list.sort((a, b) => Number(b.inProgress) - Number(a.inProgress) || b.latest - a.latest)
  })

  /** The saved tracks and the backend queue's jobs: a fresh page rebuilds everything, takes still made included. */
  async function loadAll(): Promise<void> {
    // whichever comes last, each engine store lays the queue's jobs over the tracks it read
    await Promise.allSettled([queue.refresh(), yue.loadHistory(), ace.loadHistory(), sa.loadHistory()])
  }

  /** Stops a waiting or running take on the backend (an ACE-Step or Stable Audio batch stops whole). */
  function cancel(take: Take): void {
    if (take.engine === 'yue2') void yue.cancel(take.job.id)
    else if (take.engine === 'ace_step') void ace.cancel(take.job.id)
    else void sa.cancel(take.job.id)
  }
  /** Deletes a saved take's track; a failed or stopped take is taken off the queue's list (its job whole). */
  async function remove(take: Take): Promise<void> {
    if (take.engine === 'yue2') await yue.deleteJob(take.job as Yue2Job)
    else if (take.engine === 'ace_step') await ace.removeJob(take.job.id)
    else await sa.deleteJob(take.job as Sa3Job)
  }
  async function rename(take: Take, title: string): Promise<void> {
    if (take.engine === 'yue2') await yue.renameJob(take.job as Yue2Job, title)
    else if (take.engine === 'stable_audio') await sa.renameJob(take.job as Sa3Job, title)
  }
  /** Puts the take's text, style and settings back into its engine's form. */
  function reuse(take: Take): void {
    if (take.engine === 'yue2') {
      const job = take.job as Yue2Job
      const p = job.params || {}
      // the take saved its sampling as flat option keys; the form wants the two stages as objects with every key
      // present (null = the engine default), so a field the take did not set goes back to its default
      const stage = (prefix: string) => Object.fromEntries(
        ['temperature', 'top_p', 'top_k', 'repetition_penalty', 'penalty_window', 'min_tokens', 'max_tokens'].map((k) => [k, typeof p[`${prefix}_${k}`] === 'number' ? p[`${prefix}_${k}`] : null]),
      )
      const reset = ['cfg_scale', 'num_inference_steps'].filter((k) => typeof p[k] !== 'number')
      yue.requestInsertParams({
        ...p, lyrics: job.lyrics || p.lyrics || '', style: job.style || p.style || '', cot: job.cot || p.cot || 'off', precision: job.precision || p.precision || 'q8_0',
        seed: job.seed ?? p.seed, abc: job.abcPlan || p.abc || '', semantic: stage('semantic'), abc_sampling: stage('abc'), reset, randomSeed: false,
      // undoable: the idea line's "Put back" restores what the reuse overwrote, and the changed fields flash
      }, { undoable: true })
    } else if (take.engine === 'ace_step') {
      const job = take.job as AceJob
      const p = job.params || {}
      // a description-mode take gives back its whole description (sample_query), not the title cut from it;
      // `reuse` asks the form to put back the tuning too (the request lists only what differed from the defaults)
      const custom = typeof p.prompt === 'string' && !p.sample_mode
      ace.requestInsertParams({
        ...p, lyrics: job.lyrics || p.lyrics || '', model: job.model || p.model, audio_format: job.audioFormat || p.audio_format,
        query: stripMetaHints(String(p.sample_query || '')) || job.title || p.query || '', reuse: true,
        ...(custom && p.lyrics === '' ? { instrumental: true } : custom && p.lyrics ? { instrumental: false } : {}),
      }, { undoable: true }) // the form keeps what it overwrote ("Put back") and lights up the changed fields
    } else {
      const job = take.job as Sa3Job
      const p = job.params
      // the text as typed: the caption when it is this take's alone (a per-variant run joins them all), else the
      // prompt without the service tags the form put in front of it
      const caption = typeof p.caption === 'string' && !Array.isArray(p.prompts) ? p.caption : ''
      const text = caption || job.prompt.replace(/^(TrackType: SFX\. |TrackType: Music, VocalType: Instrumental\. )/, '')
      // every sampler/guidance field the form has a control for; one the take did not set goes back to the default
      const advanced: Record<string, unknown> = {}
      for (const k of ['sampler_type', 'apg_scale', 'cfg_interval_min', 'cfg_interval_max', 'scale_phi', 'cfg_norm_threshold', 'duration_padding']) {
        if (p[k] != null) advanced[k] = p[k]
      }
      sa.requestInsertParams({
        kind: job.kind, model: job.model, prompt: text, negativePrompt: (p.negative_prompt as string) || '',
        duration: typeof p.duration === 'number' ? p.duration : undefined, steps: typeof p.steps === 'number' ? p.steps : undefined,
        cfgScale: typeof p.cfg_scale === 'number' ? p.cfg_scale : undefined, seed: job.seed ?? -1,
        autoTags: typeof p.auto_tags === 'boolean' ? p.auto_tags : undefined, advanced: advanced as Sa3GenerateParams['advanced'],
        trimSilence: p.trim_silence === true, chunkedDecode: typeof p.chunked_decode === 'boolean' ? p.chunked_decode : null,
        // undoable: the form snapshots what the reuse overwrites, and the idea line offers "Put back"
      }, { undoable: true })
    }
  }

  return { takes, songs, loadAll, cancel, remove, rename, reuse }
}
