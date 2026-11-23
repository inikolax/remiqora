/**
 * The manual tuning of an engine: groups of parameters, each a row with a slider, a select, a switch or a text.
 * A form describes its parameters with these and ParamGroups draws them (in the Tuning tab and in the console).
 */

interface ParamBase {
  id: string
  /** Plain name ("Boldness") and the engine's own name under it ("temperature"). */
  label: string
  tech: string
  /** Shown but not editable now (a parameter another choice rules out); `why` says so in the row. */
  disabled?: boolean
  why?: string
  /** Shown under the row while the current value has a known cost (louder and clipped, noise...). */
  warn?: string
}

export interface ParamSlider extends ParamBase {
  kind: 'slider'
  /** null = the engine default. */
  value: number | null
  /** The engine default: where the slider rests and its tick sits. */
  def: number
  /** The slider's range; the number field takes values outside it. */
  min: number
  max: number
  step: number
  /** What the value means in other units ("3.2 s", "6:00"), for the current value. */
  note?: (v: number) => string
  /** No engine default to rest on: empty means the engine decides ("auto"), any number is a choice. */
  auto?: string
  set: (v: number | null) => void
}

export interface ParamSelect extends ParamBase {
  kind: 'select'
  value: string
  def: string
  options: { value: string; label: string }[]
  set: (v: string) => void
}

export interface ParamToggle extends ParamBase {
  kind: 'toggle'
  value: boolean
  def: boolean
  set: (v: boolean) => void
}

export interface ParamText extends ParamBase {
  kind: 'text'
  value: string
  def: string
  placeholder?: string
  set: (v: string) => void
}

/** A control of the form's own, put into the row through the slot named by the row's id. */
export interface ParamSlot extends ParamBase {
  kind: 'slot'
  changed: boolean
  reset: () => void
}

export type ParamRowSpec = ParamSlider | ParamSelect | ParamToggle | ParamText | ParamSlot

export interface ParamQuick {
  options: { id: string; label: string }[]
  /** The option the group's values match now, or null when set by hand. */
  active: string | null
  pick: (id: string) => void
}

export interface ParamGroupSpec {
  id: string
  title: string
  sub: string
  /** The simple mode's choice for this group, as one-click presets in its heading. */
  quick?: ParamQuick
  rows: ParamRowSpec[]
  /** Column in the console's two-column layout. */
  column?: 0 | 1
}

export function rowChanged(r: ParamRowSpec): boolean {
  if (r.kind === 'slot') return r.changed
  if (r.kind !== 'slider') return r.value !== r.def
  const v = r.value as unknown
  if (r.auto != null) return v != null && v !== ''
  return v != null && v !== '' && Math.abs(Number(v) - r.def) > 1e-9
}

/** Back to the default: a slider is left to the engine again, the others take their default value. */
export function resetRow(r: ParamRowSpec): void {
  if (r.kind === 'slider') r.set(null)
  else if (r.kind === 'select') r.set(r.def)
  else if (r.kind === 'toggle') r.set(r.def)
  else if (r.kind === 'text') r.set(r.def)
  else r.reset()
}

/** The rows set by hand as name=value, for the line of what a request will carry. `slots` gives a slot row's value. */
export function changedParts(rows: ParamRowSpec[], slots: Record<string, string> = {}): { k: string; v: string; set: boolean }[] {
  return rows
    .filter((r) => !r.disabled && rowChanged(r))
    .map((r) => ({ k: r.tech, v: r.kind === 'slot' ? slots[r.id] ?? '' : String(r.value), set: true }))
}
