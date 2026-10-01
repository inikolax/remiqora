import { acceptHMRUpdate, defineStore } from 'pinia'
import * as projectsApi from '../api/projects'
import { defaultChannelSettings, defaultMasterSettings } from '../audio/mixerEngine'
import type { ChannelSettings, MasterSettings } from '../audio/mixerEngine'
import { projectDuration } from '../audio/timelineTypes'
import type { Clip, TimelineLane, TimelineProject } from '../audio/timelineTypes'
import { i18n } from '../i18n'

const t = i18n.global.t

const DEFAULT_PX_PER_SECOND = 40

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
  }
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
    snapshot() {
      const snap = JSON.stringify(this.project)
      if (this.historyIndex >= 0 && this.historyIndex < this.history.length - 1) {
        this.history.splice(this.historyIndex + 1)
      }
      this.history.push(snap)
      if (this.history.length > 30) {
        this.history.shift()
      }
      this.historyIndex = this.history.length - 1
      this.dirty = true
    },
    undo() {
      if (!this.canUndo) return
      this.historyIndex--
      this.project = JSON.parse(this.history[this.historyIndex])
      this.dirty = true
    },
    redo() {
      if (!this.canRedo) return
      this.historyIndex++
      this.project = JSON.parse(this.history[this.historyIndex])
      this.dirty = true
    },
    commitSnapshot() {
      this.snapshot()
    },
    newProject() {
      this.projectId = null
      this.projectName = t('storeErrors.newProject')
      this.project = emptyProject()
      this.playheadSec = 0
      this.playing = false
      this.selectedClipId = null
      this.selectedLaneId = null
      this.history = [JSON.stringify(this.project)]
      this.historyIndex = 0
      this.dirty = false
      this.error = null
    },
    async loadProject(id: number) {
      this.loading = true
      this.error = null
      try {
        const full = await projectsApi.getProject(id)
        this.projectId = full.id
        this.projectName = full.name
        this.project = full.data
        this.playheadSec = 0
        this.playing = false
        this.selectedClipId = null
        this.selectedLaneId = null
        this.history = [JSON.stringify(this.project)]
        this.historyIndex = 0
        this.dirty = false
      } catch (e) {
        this.error = e instanceof Error ? e.message : String(e)
      } finally {
        this.loading = false
      }
    },
    async save() {
      this.saving = true
      try {
        if (this.projectId == null) {
          const created = await projectsApi.createProject(this.projectName, this.project)
          this.projectId = created.id
        } else {
          await projectsApi.updateProject(this.projectId, { name: this.projectName, data: this.project })
        }
        this.dirty = false
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
    renameLane(laneId: string, name: string) {
      const lane = this.project.lanes.find((l) => l.id === laneId)
      if (lane) {
        lane.name = name
        this.snapshot()
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
            this.dirty = true
          }
          return
        }
      }
    },
    updateLaneSettings(laneId: string, settings: ChannelSettings) {
      const lane = this.project.lanes.find((l) => l.id === laneId)
      if (lane) {
        lane.settings = settings
        this.snapshot()
      }
    },
    updateMasterSettings(settings: MasterSettings) {
      this.project.master = settings
      this.snapshot()
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
        // Cover the whole project; 10 s when it is still empty.
        this.project.loopRegion = { start: 0, end: this.totalDuration > 0.1 ? this.totalDuration : 10, enabled: true }
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
