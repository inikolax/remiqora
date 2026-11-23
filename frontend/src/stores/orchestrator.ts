import { acceptHMRUpdate, defineStore } from 'pinia'
import * as api from '../api/orchestrator'
import type { GpuModelId, ModelRuntimeStatus, OrchestratorStatus } from '../types'

const FAST_POLL_MS = 1500
const SLOW_POLL_MS = 8000

interface StatusEntry {
  id: GpuModelId
  label: string
  status: ModelRuntimeStatus
  error: string | null
}

export const useOrchestratorStore = defineStore('orchestrator', {
  state: () => ({
    activeModel: null as GpuModelId | null,
    statuses: {} as Record<string, StatusEntry>,
    switching: false,
    switchError: null as string | null,
    _timer: null as ReturnType<typeof setTimeout> | null,
  }),
  getters: {
    isBusy(state): boolean {
      return Object.values(state.statuses).some((m) => m.status === 'starting' || m.status === 'stopping')
    },
  },
  actions: {
    _applySnapshot(snapshot: OrchestratorStatus) {
      this.activeModel = snapshot.active_model
      this.statuses = snapshot.models as Record<string, StatusEntry>
    },
    async refresh() {
      try {
        this._applySnapshot(await api.getStatus())
      } catch {
        // Transient network hiccup (e.g. backend restarting) - next poll retries.
      }
    },
    startPolling() {
      if (this._timer) return
      const tick = async () => {
        await this.refresh()
        const delay = this.isBusy ? FAST_POLL_MS : SLOW_POLL_MS
        this._timer = setTimeout(tick, delay)
      }
      void tick()
    },
    stopPolling() {
      if (this._timer) clearTimeout(this._timer)
      this._timer = null
    },
    async switchModel(model: GpuModelId) {
      this.switching = true
      this.switchError = null
      try {
        this._applySnapshot(await api.switchModel(model))
      } catch (err) {
        this.switchError = err instanceof Error ? err.message : String(err)
        await this.refresh()
        throw err
      } finally {
        this.switching = false
      }
    },
    async stopActive() {
      this._applySnapshot(await api.stopActive())
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOrchestratorStore, import.meta.hot))
}
