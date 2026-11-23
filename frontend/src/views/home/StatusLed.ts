import { h } from 'vue'
import type { FunctionalComponent } from 'vue'
import type { ModelRuntimeStatus } from '../../types'

// the same lights as Create's rail
const LED: Record<ModelRuntimeStatus, string> = {
  stopped: 'border border-text-dim/70',
  starting: 'bg-status-queued animate-pulse',
  running: 'bg-status-done shadow-[0_0_6px_var(--color-status-done)]',
  stopping: 'bg-status-queued animate-pulse',
  error: 'bg-status-failed',
}

/** An engine's light. An error is a red triangle with a "!", not only a red dot: colour alone does not tell it. */
const StatusLed: FunctionalComponent<{ status: ModelRuntimeStatus }> = (p) => (p.status === 'error'
  ? h('svg', { viewBox: '0 0 12 12', class: 'h-2.5 w-2.5 shrink-0 text-status-failed', 'aria-hidden': 'true' }, [
    h('path', { d: 'M6 .8 11.4 10.8H.6z', fill: 'currentColor' }),
    h('path', { d: 'M6 4.4v2.9M6 9.1v.01', stroke: 'var(--color-bg)', 'stroke-width': '1.5', 'stroke-linecap': 'round' }),
  ])
  : h('span', { class: ['h-2 w-2 shrink-0 rounded-full motion-reduce:animate-none', LED[p.status]], 'aria-hidden': 'true' }))
StatusLed.props = ['status']

export default StatusLed
