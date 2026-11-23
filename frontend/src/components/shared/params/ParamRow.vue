<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { resetRow, rowChanged } from './types'
import type { ParamRowSpec } from './types'

/**
 * One parameter of the manual tuning: its plain name with the engine's name under it, then the control - a slider
 * with a tick at the engine default and the number (typed values may leave the slider's range), a select, a switch
 * or a text - and a reset.
 */
const props = defineProps<{ row: ParamRowSpec }>()
const { t } = useI18n()

const changed = computed(() => rowChanged(props.row))
const pct = (v: number): number => {
  const r = props.row
  if (r.kind !== 'slider') return 0
  return Math.max(0, Math.min(100, ((v - r.min) / (r.max - r.min)) * 100))
}
/** What the slider shows: the value, or the default while the parameter is left to the engine. */
const shown = computed(() => {
  const r = props.row
  if (r.kind !== 'slider') return 0
  const v = r.value as unknown
  return v == null || v === '' ? r.def : Number(v)
})
const decimals = computed(() => (props.row.kind === 'slider' ? (String(props.row.step).split('.')[1] ?? '').length : 0))
/** What a screen reader says for the slider: "auto" while the engine decides, the value with its note, or nothing (the number). */
const valueText = computed(() => {
  const r = props.row
  if (r.kind !== 'slider') return undefined
  const v = r.value as unknown
  if (r.auto != null && (v == null || v === '')) return r.auto
  return r.note ? `${shown.value} (${r.note(shown.value)})` : undefined
})
function fromSlider(e: Event): void {
  const r = props.row
  if (r.kind !== 'slider') return
  const v = Number(Number((e.target as HTMLInputElement).value).toFixed(decimals.value))
  // back on the default: leave the parameter to the engine again (an "auto" slider has no default to go back to)
  r.set(r.auto == null && Math.abs(v - r.def) < 1e-9 ? null : v)
}
function fromNumber(e: Event): void {
  const r = props.row
  if (r.kind !== 'slider') return
  const raw = (e.target as HTMLInputElement).value
  const v = Number(raw)
  r.set(raw === '' || !Number.isFinite(v) ? null : v)
}
const FIELD = 'w-full rounded-md border bg-panel-2 px-1.5 py-1 text-xs text-text disabled:opacity-50'
</script>

<template>
  <div class="grid min-h-[38px] grid-cols-[minmax(0,10.5rem)_minmax(0,1fr)_4.25rem_1rem] items-center gap-x-2.5 border-t border-border/60 px-3 py-1.5">
    <div class="min-w-0" :class="row.disabled ? 'opacity-60' : ''">
      <p class="flex items-center gap-1.5 text-[12.5px] font-medium text-text">
        <span class="truncate" :title="row.label">{{ row.label }}</span>
        <span v-if="changed" class="h-1.5 w-1.5 shrink-0 rounded-full bg-accent2" :title="t('params.changed')"><span class="sr-only">{{ t('params.changed') }}</span></span>
        <span v-if="row.kind === 'slider' && row.note" class="shrink-0 text-xs font-normal tabular-nums text-text-dim">{{ row.note(shown) }}</span>
      </p>
      <p class="truncate text-xs text-text-dim" :title="row.tech">{{ row.tech }}</p>
    </div>

    <!-- ruled out by another choice: say why in place of the control -->
    <p v-if="row.disabled && row.why" class="col-span-2 truncate rounded-md border border-border/70 px-2 py-1 text-xs text-text-dim" :title="row.why">{{ row.why }}</p>

    <template v-else-if="row.kind === 'slider'">
      <div class="relative flex h-5 items-center">
        <!-- the tick of the engine default; inset-inline-start because a native range runs right-to-left in RTL -->
        <span v-if="row.auto == null" class="pointer-events-none absolute top-0.5 h-4 w-px bg-text-dim/60" :style="{ insetInlineStart: `calc(${pct(row.def)}% + ${(0.5 - pct(row.def) / 100) * 14}px)` }" :title="t('params.default', { v: row.def })"></span>
        <input
          type="range" class="relative w-full" :class="changed ? 'param-changed' : ''" :disabled="row.disabled"
          :min="row.min" :max="row.max" :step="row.step" :value="Math.max(row.min, Math.min(row.max, shown))"
          :aria-label="row.label" :aria-valuetext="valueText" @input="fromSlider"
        />
      </div>
      <input
        type="number" :step="row.step" :value="row.value ?? ''" :placeholder="row.auto ?? String(row.def)" :aria-label="row.label" :disabled="row.disabled"
        :class="[FIELD, 'text-end tabular-nums placeholder:text-text-dim/60', changed ? 'border-accent2/60' : 'border-border']"
        @change="fromNumber"
      />
    </template>

    <select
      v-else-if="row.kind === 'select'" :class="[FIELD, 'col-span-2', changed ? 'border-accent2/60' : 'border-border']" :disabled="row.disabled"
      :value="row.value" :aria-label="row.label" @change="row.set(($event.target as HTMLSelectElement).value)"
    >
      <option v-for="o in row.options" :key="o.value" :value="o.value">{{ o.label }}</option>
    </select>

    <div v-else-if="row.kind === 'toggle'" class="col-span-2 flex justify-end">
      <!-- the button is the 24px target; the 20px track is drawn inside it -->
      <button
        type="button" role="switch" :aria-checked="row.value" :aria-label="row.label" :disabled="row.disabled"
        class="inline-flex h-6 items-center rounded-full px-0.5 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-accent1"
        @click="row.set(!row.value)"
      ><span class="relative block h-5 w-9 rounded-full transition-colors" :class="row.value ? 'bg-accent1' : 'bg-slider-track/60'"><span class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-[inset-inline-start] motion-reduce:transition-none" :class="row.value ? 'start-[18px]' : 'start-0.5'"></span></span></button>
    </div>

    <!-- the form's own control, brought to the row's size -->
    <div v-else-if="row.kind === 'slot'" class="col-span-2 min-w-0 [&_input]:min-w-0! [&_input]:rounded-md! [&_input]:py-1! [&_input]:text-xs! [&_select]:rounded-md! [&_select]:py-1! [&_select]:text-xs!"><slot /></div>

    <input
      v-else type="text" :class="[FIELD, 'col-span-2 placeholder:text-text-dim/60', changed ? 'border-accent2/60' : 'border-border']" :disabled="row.disabled"
      :value="row.value" :placeholder="row.placeholder" :aria-label="row.label" @change="row.set(($event.target as HTMLInputElement).value)"
    />

    <!-- 24px target in the 1rem column: the negative margin lets it overhang instead of widening the grid -->
    <button
      type="button" class="-mx-1 inline-flex h-6 w-6 items-center justify-center rounded text-sm leading-none text-text-dim hover:text-text focus-visible:outline-2 focus-visible:outline-accent1" :class="changed && !row.disabled ? '' : 'invisible'"
      :title="t('params.reset')" :aria-label="t('params.resetOne', { name: row.label })" @click="resetRow(row)"
    ><span aria-hidden="true">↺</span></button>
    <!-- a value that works but costs something: what was measured, under the row -->
    <p v-if="row.warn && !row.disabled" class="col-span-4 mt-1 rounded-md border border-status-queued/40 bg-status-queued/10 px-2 py-1 text-xs leading-snug text-text">{{ row.warn }}</p>
  </div>
</template>

<style scoped>
/* a changed parameter's slider takes the accent */
input[type='range'].param-changed::-webkit-slider-thumb { background: #fff; box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-accent2) 35%, transparent); }
input[type='range'].param-changed::-webkit-slider-runnable-track { background: color-mix(in oklab, var(--color-accent2) 55%, var(--color-slider-track)); }
</style>
