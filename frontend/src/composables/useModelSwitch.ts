import { useRouter } from 'vue-router'
import { useOrchestratorStore } from '../stores/orchestrator'
import { useFeaturesStore, type FeatureId } from '../stores/features'
import { i18n } from '../i18n'
import type { GpuModelId, ModelId } from '../types'

export const MODEL_ROUTES: Record<ModelId, string> = {
  ace_step: 'ace-step',
  yue2: 'yue2',
  stable_audio: 'stable-audio',
}

export const MODEL_LABELS: Record<GpuModelId, string> = {
  ace_step: 'ACE-Step 1.5',
  yue2: 'YuE2-3B',
  stable_audio: 'Stable Audio 3',
  // the cover maker is no brand a user knows: its label says what it does, in the interface's language
  get cover() { return i18n.global.t('covers.engine') },
}

/** The installer part an engine needs; null when it is always there. */
export const MODEL_FEATURE: Record<ModelId, FeatureId | null> = {
  ace_step: null,
  yue2: 'yue2',
  stable_audio: 'stableAudio',
}

/**
 * Navigates to the model's page and (unless already running) tells the backend to switch to it.
 * `stay` only starts it: the offline banner on one of the model's own pages (ACE-Step's LoRA training too).
 */
export function useModelSwitch() {
  const router = useRouter()
  const orchestrator = useOrchestratorStore()
  const features = useFeaturesStore()

  async function selectModel(id: ModelId, { stay = false }: { stay?: boolean } = {}): Promise<void> {
    const routeName = MODEL_ROUTES[id]
    if (!stay && router.currentRoute.value.name !== routeName) await router.push({ name: routeName })
    // Left out at install: its page says so and offers to install it; there is nothing to start.
    const feature = MODEL_FEATURE[id]
    if (feature && !features.has(feature)) return
    const status = orchestrator.statuses[id]?.status ?? 'stopped'
    if (orchestrator.activeModel === id && status === 'running') return
    await orchestrator.switchModel(id)
  }

  return { selectModel }
}
