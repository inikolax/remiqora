import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import * as settingsApi from '../api/settings'
import * as coversApi from '../api/covers'
import * as tracksApi from '../api/tracks'
import type { ServerJob } from '../api/jobs'
import type { JobStatus } from '../types'
import { useGenQueueStore } from './genQueue'
import { useMarksStore } from './marks'
import { useSettingsStore } from './settings'
import { useEnginesStore } from './engines'
import { bakeCaption, captionDefaults } from '../covers/caption/bake'
import type { CaptionText, CoverCaption } from '../covers/caption/types'

const isActive = (j: ServerJob): boolean => j.status === 'queued' || j.status === 'running'
const isOver = (s: JobStatus): boolean => s === 'done' || s === 'failed' || s === 'cancelled'
const trackOf = (j: ServerJob): number => Number(j.request?.track_id)
const fail = (err: unknown): string => (err instanceof Error ? err.message : String(err))

/**
 * Album covers: whether they are on (the setting, read at app start) and the cover jobs of the server's queue.
 * The covers themselves live in the marks store (marks.coverOf), next to the star and the tags; a finished job
 * writes its new cover there, so every row, the player and the details change in place.
 * While covers are off nothing shows a cover or offers to make one.
 */
export const useCoversStore = defineStore('covers', () => {
  const queue = useGenQueueStore()
  const marks = useMarksStore()
  const settings = useSettingsStore()

  const enabled = ref(false)
  const loaded = ref(false)
  const saving = ref(false)
  const error = ref('')

  async function load(): Promise<void> {
    try {
      enabled.value = (await settingsApi.getSettings()).covers_enabled === true
      loaded.value = true
    } catch {
      // the backend is not up yet: covers stay off until the next load
    }
  }
  async function setEnabled(on: boolean): Promise<void> {
    saving.value = true
    error.value = ''
    try {
      enabled.value = (await settingsApi.saveSettings({ covers_enabled: on })).covers_enabled === true
    } catch (err) {
      error.value = fail(err)
    } finally {
      saving.value = false
    }
  }

  // ---- "make a cover after the song" (one preference for every song form) ----
  const AUTO_KEY = 'remiqora.autoCover'
  const readAuto = (): boolean => { try { return localStorage.getItem(AUTO_KEY) === '1' } catch { return false } }
  const autoCover = ref(readAuto())
  function setAutoCover(on: boolean): void {
    autoCover.value = on
    try { localStorage.setItem(AUTO_KEY, on ? '1' : '0') } catch { /* private window: the choice lasts until reload */ }
  }
  const engines = useEnginesStore()
  /** The cover model and its image server are on disk (the rule of the Models page). */
  const modelInstalled = computed(() => {
    const c = engines.state?.engines.cover
    const parts = c?.parts ?? []
    return !!c?.ready && parts.length > 0 && parts.every((p) => p.installed)
  })
  /** What a song request sends as make_cover: on, covers are enabled and the model is there. */
  const wantsCover = computed(() => autoCover.value && enabled.value && modelInstalled.value)
  /** A form shows the option once the engines' state (and the covers setting) is known. */
  function ensureKnown(): void {
    if (!engines.state) void engines.load()
    if (!loaded.value) void load()
  }

  /** The cover jobs of the queue, newest first (as the queue keeps them). */
  const jobs = computed(() => queue.jobs.filter((j) => j.engine === 'cover'))
  /** The newest cover job of a track, whatever its state. */
  const jobFor = (trackId: number): ServerJob | null => jobs.value.find((j) => trackOf(j) === trackId) ?? null
  /** The job making the track's cover now (queued or running). */
  const busyFor = (trackId: number | null | undefined): ServerJob | null => {
    if (trackId == null) return null
    const j = jobFor(trackId)
    return j && isActive(j) ? j : null
  }
  /** The track's last cover job when it failed (until dismissed). */
  const failedFor = (trackId: number): ServerJob | null => { const j = jobFor(trackId); return j?.status === 'failed' ? j : null }

  // ---- a bulk run: "2 of 5" ----
  const batch = ref<number[]>([])
  const batchProgress = computed(() => {
    if (!batch.value.length) return null
    const list = jobs.value.filter((j) => batch.value.includes(j.id))
    return {
      total: batch.value.length,
      done: list.filter((j) => isOver(j.status)).length,
      failed: list.filter((j) => j.status === 'failed').length,
      running: list.some(isActive),
    }
  })
  const clearBatch = (): void => { batch.value = [] }
  /** Stops what of the run has not finished. */
  async function cancelBatch(): Promise<void> {
    const open = jobs.value.filter((j) => batch.value.includes(j.id) && isActive(j))
    await Promise.all(open.map((j) => queue.cancel(j.id)))
  }

  // ---- polling: the queue polls while a cover is being made ----
  let holding = false
  const anyActive = computed(() => jobs.value.some(isActive))
  function hold(): void {
    if (holding) return
    holding = true
    queue.acquire()
  }
  watch(anyActive, (on) => {
    if (on) hold()
    else if (holding) { holding = false; queue.release() }
  })

  // A job that finishes while we watch writes its cover into the marks; jobs already over when first seen are
  // left alone (the track list read at load is newer than an old job, whose cover may have been removed since).
  const seen = new Map<number, JobStatus>()
  watch(jobs, (list) => {
    for (const j of list) {
      const before = seen.get(j.id)
      seen.set(j.id, j.status)
      if (j.status !== 'done' || before === undefined || before === 'done') continue
      const track = j.tracks[0]
      if (track) {
        marks.applyCover(track.id, track.cover_url ?? null)
        // a new picture under a caption: the server dropped the baked file (stale), the watch below bakes it again
        marks.applyCaption(track)
      }
    }
  }, { immediate: true })

  /** Queues a cover for each track; `seed` makes another picture than the last one; `bulk` counts them as one run. */
  async function make(trackIds: number[], opts: { prompts?: Record<number, string>; seed?: number; bulk?: boolean } = {}): Promise<ServerJob[] | null> {
    if (!trackIds.length) return []
    error.value = ''
    try {
      const created = await coversApi.makeCovers(trackIds, opts)
      for (const j of created) seen.set(j.id, j.status)
      queue.adopt(created)
      hold()
      if (opts.bulk) batch.value = created.map((j) => j.id)
      return created
    } catch (err) {
      error.value = fail(err)
      return null
    }
  }
  /** A new random seed: "Another cover". */
  const newSeed = (): number => Math.floor(Math.random() * 2147483647)
  async function remove(trackId: number): Promise<boolean> {
    error.value = ''
    try {
      const track = await coversApi.removeCover(trackId)
      marks.applyCover(track.id, track.cover_url ?? null)
      return true
    } catch (err) {
      error.value = fail(err)
      return false
    }
  }
  const cancel = (jobId: number): Promise<void> => queue.cancel(jobId)
  const dismiss = (jobId: number): Promise<void> => queue.dismiss(jobId)

  /** The track's cover url while covers are on; null otherwise. */
  const urlFor = (trackId: number | null | undefined): string | null => (enabled.value ? marks.coverOf(trackId) : null)

  // ---- captions over the covers: the artist, the title and the year, baked in the browser ----
  /** The track's caption while covers are on and it has a cover; null otherwise. */
  const captionFor = (trackId: number | null | undefined): CoverCaption | null => (urlFor(trackId) ? marks.captionOf(trackId) : null)
  /** The default texts of a track's caption: the artist setting, the title, the year it was made. */
  function defaultsFor(trackId: number, track?: { title: string; createdAt: number }): CaptionText {
    const meta = track ?? marks.captionMeta[trackId] ?? { title: '', createdAt: 0 }
    return captionDefaults(meta, settings.artist)
  }
  /** Reads the tracks' covers again (a cover made again meanwhile): the new url is what the next bake loads. */
  async function refreshCovers(): Promise<boolean> {
    try {
      marks.noteCovers(await tracksApi.listTracks())
      return true
    } catch {
      return false
    }
  }
  /** Bakes the caption over the track's cover and stores both; null clears them. False (with `error`) on failure.
   *  A cover made again while baking: it is baked once more on the new one. */
  async function saveCaption(trackId: number, caption: CoverCaption | null, track?: { title: string; createdAt: number }, retried = false): Promise<boolean> {
    error.value = ''
    try {
      let image: string | null = null
      let coverV: string | null = null
      if (caption) {
        const url = marks.coverOf(trackId)
        if (!url) throw new Error('no cover')
        if (!settings.loaded) await settings.load()
        coverV = coversApi.coverVersion(url)
        image = await bakeCaption(url, caption, defaultsFor(trackId, track))
      }
      const saved = await coversApi.setCoverCaption(trackId, caption, image, coverV)
      marks.applyCaption(saved)
      return true
    } catch (err) {
      if (caption && !retried && coversApi.isCoverChanged(err) && await refreshCovers()) return saveCaption(trackId, caption, track, true)
      error.value = fail(err)
      return false
    }
  }

  // A caption whose baked file is missing or stale (the cover was made again, the track renamed, the artist
  // changed) is baked again in the background, one at a time. A failure is not retried for the same cover; a
  // success forgets the cover, so a later rename bakes it again.
  const tried = new Set<string>()
  const rebaking = ref<number | null>(null)
  const staleIds = (): number[] => (enabled.value
    ? Object.keys(marks.captions).map(Number).filter((id) => !marks.captioned[id] && !!marks.covers[id] && !tried.has(`${id}|${marks.covers[id]}`))
    : [])
  const stale = computed(staleIds)
  let draining = false
  async function drain(): Promise<void> {
    if (draining) return
    draining = true
    try {
      if (!settings.loaded) await settings.load()
      for (let id: number | undefined = staleIds()[0]; id != null; id = staleIds()[0]) {
        const caption = marks.captions[id]
        const url = marks.covers[id]
        const key = `${id}|${url}`
        tried.add(key)
        rebaking.value = id
        try {
          const image = await bakeCaption(url, caption, defaultsFor(id))
          // changed while it was baking (saved from the panel, removed, a newer cover): leave it to the next round
          if (marks.captions[id] !== caption || marks.covers[id] !== url) { tried.delete(key); continue }
          marks.applyCaption(await coversApi.setCoverCaption(id, caption, image, coversApi.coverVersion(url)))
          // fresh now: only failures stay in `tried` (kept while the server still leaves it stale, so no loop)
          if (marks.captioned[id]) tried.delete(key)
        } catch (err) {
          // the cover was made again meanwhile: its new url (a new key) is baked in this round; any other failure
          // waits for the next load or the next cover
          if (coversApi.isCoverChanged(err)) await refreshCovers()
        }
        // give the page a frame between two bakes
        await new Promise((r) => setTimeout(r, 30))
      }
    } finally {
      rebaking.value = null
      draining = false
    }
  }
  watch(stale, (ids) => { if (ids.length) void drain() }, { immediate: true })
  // the artist's name is in the captions that use the default one
  let knownArtist: string | null = null
  watch(() => (settings.loaded ? settings.artist : null), (now) => {
    if (now == null) return
    const was = knownArtist
    knownArtist = now
    if (was == null || was === now) return
    for (const [id, cap] of Object.entries(marks.captions)) {
      if (cap.showArtist && !cap.artist?.trim()) { tried.delete(`${id}|${marks.covers[Number(id)]}`); marks.markCaptionStale(Number(id)) }
    }
  }, { immediate: true })

  return {
    enabled, loaded, saving, error, load, setEnabled,
    autoCover, setAutoCover, modelInstalled, wantsCover, ensureKnown,
    jobs, jobFor, busyFor, failedFor, batch, batchProgress, clearBatch, cancelBatch,
    make, newSeed, remove, cancel, dismiss, urlFor,
    captionFor, defaultsFor, saveCaption, rebaking,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCoversStore, import.meta.hot))
}
