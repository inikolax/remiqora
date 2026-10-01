import { acceptHMRUpdate, defineStore } from 'pinia'
import * as api from '../api/settings'

// Callers waiting for the artist dialog to be answered (kept out of the store state: functions are not state).
let waiters: Array<(hasArtist: boolean) => void> = []

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    /** Artist name entered once, written into the tags of every downloaded track. */
    artist: '',
    loaded: false,
    dialogOpen: false,
    saving: false,
    error: '',
  }),
  actions: {
    async load() {
      try {
        this.artist = (await api.getSettings()).artist
        this.loaded = true
      } catch {
        // the backend is not reachable yet: stay unloaded so the next call tries again
      }
    },
    openDialog() {
      this.error = ''
      this.dialogOpen = true
    },
    /** Resolves true once an artist name is set (asking for it once if it is not), false if the user skipped. */
    async ensureArtist(): Promise<boolean> {
      if (!this.loaded) await this.load()
      if (this.artist) return true
      return new Promise((resolve) => {
        waiters.push(resolve)
        this.openDialog()
      })
    },
    async saveArtist(name: string) {
      this.saving = true
      this.error = ''
      try {
        this.artist = (await api.saveSettings({ artist: name })).artist
        this.loaded = true
        this.closeDialog()
      } catch (e) {
        this.error = e instanceof Error ? e.message : String(e)
      } finally {
        this.saving = false
      }
    },
    closeDialog() {
      this.dialogOpen = false
      const pending = waiters
      waiters = []
      for (const resolve of pending) resolve(!!this.artist)
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot))
}
