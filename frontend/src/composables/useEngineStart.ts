import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useOrchestratorStore } from '../stores/orchestrator'
import { MODEL_LABELS } from './useModelSwitch'
import type { ModelId, ModelRuntimeStatus } from '../types'

const START_TIMEOUT_MS = 180000
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * An engine's form works while its engine is stopped: the backend's queue starts the engine when a take's turn
 * comes. This is the engine's state and the words for the Create button; `ensure` starts it by hand (not used on submit).
 */
export function useEngineStart(id: ModelId) {
  const { t } = useI18n()
  const orchestrator = useOrchestratorStore()
  const status = computed<ModelRuntimeStatus>(() => orchestrator.statuses[id]?.status ?? 'stopped')
  const running = computed(() => status.value === 'running')
  const starting = ref(false)
  const busy = computed(() => starting.value || status.value === 'starting')
  const error = ref('')
  const name = MODEL_LABELS[id]

  /** True once the engine runs. Starts it when it does not; false (with `error` set) when it did not come up. */
  async function ensure(): Promise<boolean> {
    if (running.value) return true
    starting.value = true
    error.value = ''
    try {
      await orchestrator.switchModel(id)
      const deadline = Date.now() + START_TIMEOUT_MS
      while (!running.value && status.value !== 'error' && Date.now() < deadline) {
        await sleep(1000)
        await orchestrator.refresh()
      }
      if (!running.value) error.value = orchestrator.statuses[id]?.error || t('create.startFailed', { name })
      return running.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      return false
    } finally {
      starting.value = false
    }
  }

  /** The Create button's text: the form's own while the engine runs, else "Start X and create". */
  const createLabel = (whenRunning: string): string => (running.value ? whenRunning : busy.value ? t('create.startingEngine', { name }) : t('create.startAndCreate', { name }))

  return { status, running, busy, error, ensure, createLabel }
}
