import { acceptHMRUpdate, defineStore } from 'pinia'
import * as projectsApi from '../api/projects'
import { defaultChannelSettings, defaultMasterSettings } from '../audio/mixerEngine'
import type { ChannelSettings, MasterSettings } from '../audio/mixerEngine'
import { projectDuration } from '../audio/timelineTypes'
import type { Clip, TimelineLane, TimelineProject } from '../audio/timelineTypes'
import { i18n } from '../i18n'

const t = i18n.global.t

const DEFAULT_PX_PER_SECOND = 40
/** Baseline entry plus 30 undo steps. */
const HISTORY_LIMIT = 31

import { TRACK_COLORS } from '../utils/trackColors'

let laneColorIndex = 0

function newLane(name: string): TimelineLane {
  const colorId = TRACK_COLORS[laneColorIndex % TRACK_COLORS.length].id
  laneColorIndex++
  return { id: crypto.randomUUID(), name, clips: [], settings: defaultChannelSettings(), colorId }
}

function emptyProject(): TimelineProject {
  return {
    version: 1,
    lanes: [newLane(t('storeErrors.defaultLane', { n: 1 })), newLane(t('storeErrors.defaultLane', { n: 2 }))],
    master: defaultMasterSettings(),
    pxPerSecond: DEFAULT_PX_PER_SECOND,
    bpm: 120,
    snapEnabled: true,
    loopRegion: { start: 0, end: 10, enabled: false },
  }
}

/**
 * Serialisation used for undo history. Zoom is view state rather than an edit,
 * so it is left out: undoing a clip move must not also jump the zoom back, and
 * zooming between two otherwise identical states must not count as a change.
 */
function serialize(project: TimelineProject): string {
  const { pxPerSecond: _zoom, ...rest } = project
  return JSON.stringify(rest)
}

export const useEditorStore = defineStore('editor', {
  state: () => ({
    projectId: null as number | null,
    projectName: t('storeErrors.newProject'),
    project: emptyProject() as TimelineProject,
    playheadSec: 0,
    playing: false,
    selectedClipId: null as string | null,
    selectedLaneId: null as string | null,
    dirty: false,
    /** What the server has (or, for a new project, the starting state); `dirty` is measured against it. */
    savedSnap: '',
    savedName: '',
    /**
     * Bumped whenever a different project is put in the store (newProject, a
     * loadProject that succeeded). A save that resolves after that belongs to
     * a project that is no longer open and must not write into the store.
     */
    session: 0,
    /** Bumped per loadProject/newProject call, so only the latest load may apply. */
    loadSeq: 0,
    loading: false,
    saving: false,
    error: null as string | null,
    history: [] as string[],
    historyIndex: -1,
  }),
  getters: {
    totalDuration: (state) => projectDuration(state.project),
    canUndo: (state) => state.historyIndex > 0,
    canRedo: (state) => state.historyIndex >= 0 && state.historyIndex < state.history.length - 1,
  },
  actions: {
    /** Live (uncommitted) edit: unsaved until the gesture commits and is compared. */
    markDirty() {
      this.dirty = true
    },
    /** Unsaved = the last committed state or the name differs from what was saved. */
    refreshDirty(snap?: string) {
      const current = snap ?? this.history[this.historyIndex] ?? serialize(this.project)
      this.dirty = current !== this.savedSnap || this.projectName !== this.savedName
    },
    /** Marks `snap` / `name` as what the server has (or the clean starting point). */
    markSaved(snap: string, name: string) {
      this.savedSnap = snap
      this.savedName = name
      this.refreshDirty()
    },
    snapshot() {
      const snap = serialize(this.project)
      // Nothing changed since the last history entry (a click that selected a
      // clip without moving it, a slider dragged back to where it started):
      // do not spend an undo step.
      if (this.historyIndex >= 0 && this.history[this.historyIndex] === snap) {
        this.refreshDirty(snap)
        return
      }
      if (this.historyIndex >= 0 && this.historyIndex < this.history.length - 1) {
        this.history.splice(this.historyIndex + 1)
      }
      this.history.push(snap)
      if (this.history.length > HISTORY_LIMIT) {
        this.history.shift()
      }
      this.historyIndex = this.history.length - 1
      this.refreshDirty(snap)
    },
    restoreHistory(index: number) {
      if (!Number.isInteger(index) || index < 0 || index >= this.history.length) return
      const zoom = this.project.pxPerSecond
      this.project = { ...JSON.parse(this.history[index]), pxPerSecond: zoom }
      this.historyIndex = index
      this.refreshDirty()
    },
    undo() {
      if (!this.canUndo) return
      this.restoreHistory(this.historyIndex - 1)
    },
    redo() {
      if (!this.canRedo) return
      this.restoreHistory(this.historyIndex + 1)
    },
    commitSnapshot() {
      this.snapshot()
    },
    clearSelection() {
      this.selectedClipId = null
      this.selectedLaneId = null
    },
    setProjectName(name: string) {
      this.projectName = name
      this.refreshDirty()
    },
    newProject() {
      this.session++
      this.loadSeq++
      this.loading = false
      this.projectId = null
      this.projectName = t('storeErrors.newProject')
      this.project = emptyProject()
      this.playheadSec = 0
      this.playing = false
      this.selectedClipId = null
      this.selectedLaneId = null
      this.history = [serialize(this.project)]
      this.historyIndex = 0
      this.markSaved(this.history[0], this.projectName)
      this.error = null
    },
    async loadProject(id: number) {
      const seq = ++this.loadSeq
      this.loading = true
      this.error = null
      try {
        const full = await projectsApi.getProject(id)
        // A newer load or a new project took over while this one was fetching.
        if (seq !== this.loadSeq) return
        this.session++
        this.projectId = full.id
        this.projectName = full.name
        this.project = full.data
        this.playheadSec = 0
        this.playing = false
        this.selectedClipId = null
        this.selectedLaneId = null
        this.history = [serialize(this.project)]
        this.historyIndex = 0
        this.markSaved(this.history[0], this.projectName)
      } catch (e) {
        if (seq === this.loadSeq) this.error = e instanceof Error ? e.message : String(e)
      } finally {
        if (seq === this.loadSeq) this.loading = false
      }
    },
    /**
     * Resolves to true when the project was written and is still the one in
     * the store. Failures land in `error`.
     */
    async save(): Promise<boolean> {
      const session = this.session
      const sentSnap = serialize(this.project)
      const sentName = this.projectName
      this.saving = true
      this.error = null
      try {
        if (this.projectId == null) {
          const created = await projectsApi.createProject(sentName, this.project)
          // Another project was opened while the request was in flight. The
          // new record exists on the server, but its id and saved state must
          // not be attached to the project that is open now.
          if (session !== this.session) return false
          this.projectId = created.id
        } else {
          await projectsApi.updateProject(this.projectId, { name: sentName, data: this.project })
          if (session !== this.session) return false
        }
        // Edits made while the request was in flight still count as unsaved.
        // Compare the live project, not the last undo step: a lane rename
        // being typed or a slider mid-drag is not in the history yet.
        this.savedSnap = sentSnap
        this.savedName = sentName
        this.refreshDirty(serialize(this.project))
        return true
      } catch (e) {
        if (session === this.session) this.error = e instanceof Error ? e.message : String(e)
        return false
      } finally {
        this.saving = false
      }
    },
    addLane() {
      const lane = newLane(t('storeErrors.defaultLane', { n: this.project.lanes.length + 1 }))
      this.project.lanes.push(lane)
      this.snapshot()
      return lane
    },
    /** Live edit; the lane commits one undo step when the name field loses focus. */
    renameLane(laneId: string, name: string) {
      const lane = this.project.lanes.find((l) => l.id === laneId)
      if (lane) {
        lane.name = name
        this.markDirty()
      }
    },
    removeLane(laneId: string) {
      this.project.lanes = this.project.lanes.filter((l) => l.id !== laneId)
      if (this.selectedLaneId === laneId) this.selectedLaneId = null
      this.snapshot()
    },
    updateLaneColor(laneId: string, colorId: string) {
      const lane = this.project.lanes.find((l) => l.id === laneId)
      if (lane) {
        lane.colorId = colorId
        this.snapshot()
      }
    },
    addClip(laneId: string, clip: Clip) {
      const lane = this.project.lanes.find((l) => l.id === laneId)
      if (lane) {
        lane.clips.push(clip)
        this.snapshot()
      }
    },
    removeClip(clipId: string) {
      for (const lane of this.project.lanes) {
        const idx = lane.clips.findIndex((c) => c.id === clipId)
        if (idx !== -1) {
          lane.clips.splice(idx, 1)
          if (this.selectedClipId === clipId) this.selectedClipId = null
          this.snapshot()
          return
        }
      }
    },
    updateClip(clipId: string, patch: Partial<Clip>, commit = false) {
      for (const lane of this.project.lanes) {
        const clip = lane.clips.find((c) => c.id === clipId)
        if (clip) {
          Object.assign(clip, patch)
          if (commit) {
            this.snapshot()
          } else {
            this.markDirty()
          }
          return
        }
      }
    },
    /**
     * `commit = false` applies a slider's intermediate value without an undo
     * step; the control emits a commit when the gesture ends.
     */
    updateLaneSettings(laneId: string, settings: ChannelSettings, commit = true) {
      const lane = this.project.lanes.find((l) => l.id === laneId)
      if (lane) {
        lane.settings = settings
        if (commit) this.snapshot()
        else this.markDirty()
      }
    },
    updateMasterSettings(settings: MasterSettings, commit = true) {
      this.project.master = settings
      if (commit) this.snapshot()
      else this.markDirty()
    },
    setZoom(pxPerSecond: number) {
      this.project.pxPerSecond = Math.max(5, Math.min(400, pxPerSecond))
    },
    setBpm(bpm: number) {
      this.project.bpm = Math.max(20, Math.min(999, bpm))
      this.snapshot()
    },
    toggleSnap() {
      this.project.snapEnabled = !this.project.snapEnabled
      this.snapshot()
    },
    toggleLoop() {
      if (!this.project.loopRegion) {
        this.project.loopRegion = { start: 0, end: 10, enabled: true }
      } else {
        this.project.loopRegion.enabled = !this.project.loopRegion.enabled
      }
      this.snapshot()
    },
    setLoopRegion(start: number, end: number) {
      if (this.project.loopRegion) {
        this.project.loopRegion.start = Math.max(0, start)
        this.project.loopRegion.end = Math.max(start + 0.1, end)
      } else {
        this.project.loopRegion = { start: Math.max(0, start), end: Math.max(start + 0.1, end), enabled: true }
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEditorStore, import.meta.hot))
}
