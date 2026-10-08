/** Where a panel of the editor sits around the timeline. */
export type DockSide = 'top' | 'right' | 'bottom'
export const DOCK_SIDES: DockSide[] = ['top', 'right', 'bottom']

/** The editor's movable panels: the AI arranger and the mixer with its effects. */
export type DockPanel = 'ai' | 'mixer'

const STORAGE_KEY = 'remiqora_editor_docks'
const DEFAULTS: Record<DockPanel, DockSide> = { ai: 'right', mixer: 'bottom' }

/** Share of the work area's width left of the "right" drop zone (dockAt and the zones drawn while dragging). */
export const RIGHT_ZONE_START = 0.72

function isSide(v: unknown): v is DockSide {
  return typeof v === 'string' && (DOCK_SIDES as string[]).includes(v)
}

/** The places chosen in this browser, or the defaults. */
export function loadDocks(): Record<DockPanel, DockSide> {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Record<string, unknown>
    return { ai: isSide(saved.ai) ? saved.ai : DEFAULTS.ai, mixer: isSide(saved.mixer) ? saved.mixer : DEFAULTS.mixer }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveDocks(docks: Record<DockPanel, DockSide>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docks))
  } catch {
    // storage blocked: the places just are not remembered
  }
}

/** The dock a drop at (x, y) lands in: the right band of the work area, else its upper or lower half; null outside it. */
export function dockAt(area: DOMRect, x: number, y: number): DockSide | null {
  if (x < area.left || x > area.right || y < area.top || y > area.bottom) return null
  if (x > area.left + area.width * RIGHT_ZONE_START) return 'right'
  return y < area.top + area.height / 2 ? 'top' : 'bottom'
}
