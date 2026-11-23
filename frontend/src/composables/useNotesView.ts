import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { LocationQueryRaw } from 'vue-router'
import { useScoreWorkspace } from '../stores/scoreWorkspace'
import { useOrchestratorStore } from '../stores/orchestrator'
import type { ModelId } from '../types'

const CREATE_ENGINES: ModelId[] = ['yue2', 'ace_step', 'stable_audio']
const isCreateEngine = (v: unknown): v is ModelId => CREATE_ENGINES.includes(v as ModelId)
const ENGINE_KEY = 'remiqora_create_engine'
function rememberedEngine(): ModelId | null {
  try { const v = localStorage.getItem(ENGINE_KEY); return isCreateEngine(v) ? v : null } catch { return null }
}
/** Create's engine: the one in the address wins (links and the old addresses carry it); else the one on the GPU,
 *  else the last used (the cover maker on the GPU is no engine of that page: it falls through to the last used). */
export function createEngineOf(queryEngine: unknown, activeModel: unknown): ModelId {
  if (isCreateEngine(queryEngine)) return queryEngine
  return (isCreateEngine(activeModel) ? activeModel : null) ?? rememberedEngine() ?? 'yue2'
}

/**
 * The YuE2 notes workspace in the address: `/create?engine=yue2&view=notes`. Opening pushes a page of its own, so the
 * browser's Back returns to the session; closing goes back when that page is the one we came from.
 */
export function useNotesView() {
  const route = useRoute()
  const router = useRouter()
  const ws = useScoreWorkspace()
  const orchestrator = useOrchestratorStore()
  // the notes are YuE2's: `view=notes` with another engine on show is no open workspace
  const isOpen = computed(() => route.name === 'create' && route.query.view === 'notes'
    && createEngineOf(route.query.engine, orchestrator.activeModel) === 'yue2')

  /** Opens the workspace on the form's score (a take's copy closes); `focus` shows those bars once it is up. */
  function open(opts: { focus?: { from: number; to: number } | null; keepCopy?: boolean } = {}): Promise<unknown> {
    if (!opts.keepCopy) ws.closeCopy()
    if (opts.focus) ws.focus = opts.focus
    if (isOpen.value) return Promise.resolve()
    try { localStorage.setItem(ENGINE_KEY, 'yue2') } catch { /* private window */ }
    const query: LocationQueryRaw = { ...route.query, engine: 'yue2', view: 'notes' }
    delete query.ace
    return router.push({ name: 'create', query })
  }

  function close(): Promise<unknown> {
    if (!isOpen.value) return Promise.resolve()
    ws.halt()
    ws.formDrawer = false
    // the page before is this one without the workspace: step back to it, so Forward could reopen it
    const back = (window.history.state as { back?: string } | null)?.back
    if (back) {
      const prev = router.resolve(back)
      // only when it is the same engine's page (a missing engine is the one remembered, i.e. this one)
      const sameEngine = prev.query.engine == null || prev.query.engine === route.query.engine
      if (prev.name === 'create' && prev.query.view !== 'notes' && sameEngine) { router.back(); return Promise.resolve() }
    }
    const query: LocationQueryRaw = { ...route.query }
    delete query.view
    return router.replace({ name: 'create', query })
  }

  const toggle = (): Promise<unknown> => (isOpen.value && ws.mode === 'form' ? close() : open())

  return { isOpen, open, close, toggle }
}
