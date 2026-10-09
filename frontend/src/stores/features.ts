import { acceptHMRUpdate, defineStore } from 'pinia'
import { getFeatures } from '../api/system'
import type { Features } from '../api/system'

/** A part the desktop installer lets a user leave out; the app asks for one by these ids. */
export type FeatureId = 'yue2' | 'demucs' | 'aceBase'

/** The desktop app's bridge (desktop/src/preload.js); absent in a browser on a source install. */
interface DesktopBridge {
  addFeatures?: (ids: string[]) => Promise<void>
}

/**
 * What is installed. Until the first answer everything counts as installed, so nothing flickers to
 * "not installed" on load; an older backend without the endpoint also leaves everything on.
 */
export const useFeaturesStore = defineStore('features', {
  state: () => ({
    features: { ace_step: true, yue2: true, yue2_precisions: ['q8_0', 'q4_0'], demucs: true, ace_base: true, ace_xl: true } as Features,
    loaded: false,
  }),
  getters: {
    has: (s) => (id: FeatureId): boolean => (id === 'yue2' ? s.features.yue2 : id === 'demucs' ? s.features.demucs : s.features.ace_base),
    /** The desktop app can download a missing part itself; a source install runs the setup script. */
    canInstall: (): boolean => typeof (window as unknown as { remiqora?: DesktopBridge }).remiqora?.addFeatures === 'function',
  },
  actions: {
    async refresh() {
      try {
        this.features = await getFeatures()
        this.loaded = true
      } catch {
        // an older backend, or one restarting: keep what we have
      }
    },
    /** Opens the desktop app's install screen with this part picked. */
    async install(id: FeatureId) {
      await (window as unknown as { remiqora?: DesktopBridge }).remiqora?.addFeatures?.([id])
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFeaturesStore, import.meta.hot))
}
