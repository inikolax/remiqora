import { acceptHMRUpdate, defineStore } from 'pinia'
import { getResources } from '../api/system'
import type { Resources } from '../api/system'

const POLL_MS = 4000

/** RAM and video memory in use, for the header's meters; polled while the tab is visible. */
export const useSystemStore = defineStore('system', {
  state: () => ({
    resources: null as Resources | null,
    _timer: null as ReturnType<typeof setTimeout> | null,
  }),
  actions: {
    async refresh() {
      try {
        this.resources = await getResources()
      } catch {
        // backend restarting: the next poll tries again
      }
    },
    startPolling() {
      if (this._timer) return
      const tick = async () => {
        // A hidden tab skips the poll (typeperf costs ~1.5 s of CPU), except for the very first one.
        if (!document.hidden || !this.resources) await this.refresh()
        this._timer = setTimeout(tick, POLL_MS)
      }
      void tick()
    },
    stopPolling() {
      if (this._timer) clearTimeout(this._timer)
      this._timer = null
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSystemStore, import.meta.hot))
}
