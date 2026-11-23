import { acceptHMRUpdate, defineStore } from 'pinia'
import * as jobsApi from '../api/jobs'
import type { JobBatchEntry, ServerJob } from '../api/jobs'
import type { ModelId } from '../types'
import { useYue2Store } from './yue2'
import { useAceStepStore } from './aceStep'
import { useStableAudioStore } from './stableAudio'

/** Poll this often while a take waits or is made, and this often otherwise (a second tab sees new takes). */
const ACTIVE_MS = 1500
const IDLE_MS = 10000

// the engines that make takes; cover jobs (engine "cover") stay in `jobs` but go to no session list
const ENGINES: ModelId[] = ['yue2', 'ace_step', 'stable_audio']
const isActive = (j: ServerJob): boolean => j.status === 'queued' || j.status === 'running'

/** What of a job the session list shows: when it is the same as last time the engine store is left alone. */
const signature = (list: ServerJob[]): string =>
  list.map((j) => `${j.id}:${j.status}:${j.stage ?? ''}:${j.progress ?? ''}:${j.started_at ?? ''}:${j.error ?? ''}:${j.tracks.map((t) => t.id).join('.')}`).join('|')

/**
 * The backend's generation queue as the page sees it. It owns the polling and hands each engine's jobs to that
 * engine's store (syncServerJobs), which turns them into the rows of the session list.
 */
export const useGenQueueStore = defineStore('genQueue', {
  state: () => ({
    jobs: [] as ServerJob[],
    loaded: false,
    _users: 0,
    _timer: null as ReturnType<typeof setTimeout> | null,
    _polling: false,
    _signatures: {} as Partial<Record<ModelId, string>>,
    /** Bumped by every local change, so a poll that was under way meanwhile does not undo it. */
    _version: 0,
  }),
  getters: {
    hasActive: (s): boolean => s.jobs.some(isActive),
  },
  actions: {
    /** Reads the whole list from the backend. */
    async refresh(): Promise<void> {
      // A submit, cancel or dismiss that landed while the list was on its way is newer than that list: laying the
      // old list over it would bring back a dismissed job, or a cancelled one as still running. Ask again instead.
      for (let attempt = 0; attempt < 3; attempt++) {
        const at = this._version
        const list = await jobsApi.listJobs()
        if (at === this._version) {
          this._set(list)
          break
        }
        // changes keep landing: keep the local list, the next poll catches up
      }
      this.loaded = true
    },
    /** Puts jobs the backend just returned (a submit, a cancel) into the list without waiting for the poll. */
    _merge(changed: ServerJob[]): void {
      const byId = new Map(this.jobs.map((j) => [j.id, j]))
      for (const j of changed) byId.set(j.id, j)
      this._version++
      this._set([...byId.values()].sort((a, b) => b.id - a.id))
    },
    /** Jobs queued elsewhere (POST /api/covers) go into the list at once. */
    adopt(jobs: ServerJob[]): void {
      this._merge(jobs)
      this._kick()
    },
    _set(list: ServerJob[]): void {
      this.jobs = list
      this._distribute()
    },
    _distribute(force = false): void {
      for (const engine of ENGINES) {
        const mine = this.jobs.filter((j) => j.engine === engine)
        const sig = signature(mine)
        if (!force && this._signatures[engine] === sig) continue
        this._signatures[engine] = sig
        if (engine === 'yue2') useYue2Store().syncServerJobs(mine)
        else if (engine === 'ace_step') useAceStepStore().syncServerJobs(mine)
        else useStableAudioStore().syncServerJobs(mine)
      }
    },
    /** This engine's jobs as last seen (an engine store rebuilds its rows from them after reloading its tracks). */
    jobsOf(engine: ModelId): ServerJob[] {
      return this.jobs.filter((j) => j.engine === engine)
    },
    async submit(engine: ModelId, batch: JobBatchEntry[], audio?: Blob | null, audioName?: string): Promise<ServerJob[]> {
      const created = await jobsApi.submitJobs(engine, batch, audio, audioName)
      this._merge(created)
      this._kick()
      return created
    },
    async cancel(id: number): Promise<void> {
      try {
        this._merge([await jobsApi.cancelJob(id)])
      } catch {
        // already over: the poll reports how it ended
      }
      this._kick()
    },
    /** Takes a finished (failed, stopped) job off the list for good; saved tracks are not touched. */
    async dismiss(id: number): Promise<void> {
      try {
        await jobsApi.dismissJob(id)
      } catch {
        // gone already, or the backend is away: still drop it here so the row does not get stuck
      }
      this._version++
      this._set(this.jobs.filter((j) => j.id !== id))
    },
    /** A page that shows the queue holds the polling while it is mounted; `release` when it goes. */
    acquire(): void {
      this._users++
      if (this._users === 1) this._kick()
    },
    release(): void {
      this._users = Math.max(0, this._users - 1)
      if (this._users === 0 && this._timer) {
        clearTimeout(this._timer)
        this._timer = null
      }
    },
    /** Polls now (or right after the poll under way) and goes on at the pace the list asks for. */
    _kick(): void {
      if (this._timer) clearTimeout(this._timer)
      this._timer = null
      if (this._polling) return
      void this._tick()
    },
    async _tick(): Promise<void> {
      this._polling = true
      try {
        await this.refresh()
      } catch {
        // the backend is restarting: try again at the idle pace
      } finally {
        this._polling = false
      }
      if (this._timer) clearTimeout(this._timer)
      this._timer = null
      // nobody shows the list: stop; the next page that shows it starts the polling again
      if (this._users > 0) this._timer = setTimeout(() => { this._timer = null; void this._tick() }, this.hasActive ? ACTIVE_MS : IDLE_MS)
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGenQueueStore, import.meta.hot))
}
