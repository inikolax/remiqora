<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { MemoryHolder } from '../../api/system'
import type { ModelRuntimeStatus } from '../../types'
import { useSystemStore } from '../../stores/system'
import { useOrchestratorStore } from '../../stores/orchestrator'
import { MODEL_LABELS } from '../../composables/useModelSwitch'
import { useDismiss } from '../../composables/useDismiss'
import ChevronIcon from './icons/ChevronIcon.vue'

// The header's status unit, the studio's master meter: what holds the GPU (its light and name) and how full the
// video memory is, in one button. A click opens the details: the engine's state, video memory and RAM with who
// holds how much, the card's load and temperature, the button that unloads the model and the way to Models.
// A bar turns amber from 80 % and red from 92 %: that is where a render starts to swap or runs out of memory.
// What shows on the button depends on the window: the light and the bar always, the engine's name from lg,
// the numbers from xl. On a computer without video memory figures (a Mac) the bar is the RAM's.
const { t } = useI18n()
const system = useSystemStore()
const orchestrator = useOrchestratorStore()
const uid = useId()
const open = ref(false)
const trigger = ref<HTMLButtonElement | null>(null)
const panel = ref<HTMLElement | null>(null)
useDismiss(open, () => [trigger.value, panel.value], () => { open.value = false }, { returnTo: () => trigger.value })
watch(open, (v) => { if (!v) confirming.value = false })

/** What holds the GPU: one engine at a time, chosen and started on Create. */
const gpuModel = computed(() => orchestrator.activeModel)
const gpuStatus = computed<ModelRuntimeStatus>(() => (gpuModel.value ? orchestrator.statuses[gpuModel.value]?.status ?? 'stopped' : 'stopped'))
const engineOn = computed(() => !!gpuModel.value && gpuStatus.value !== 'stopped')
const LED_CLASSES: Record<ModelRuntimeStatus, string> = {
  stopped: 'border border-text-dim/70',
  // no pulse when the system asks for reduced motion
  starting: 'bg-status-queued animate-pulse motion-reduce:animate-none',
  running: 'bg-status-done shadow-[0_0_6px_var(--color-status-done)]',
  stopping: 'bg-status-queued animate-pulse motion-reduce:animate-none',
  error: 'bg-status-failed shadow-[0_0_6px_var(--color-status-failed)]',
}
/** On the button: the engine's name, or that the GPU is free. */
const engineName = computed(() => (engineOn.value && gpuModel.value ? MODEL_LABELS[gpuModel.value] : t('header.gpuFree')))
/** In the details and for a screen reader: "YuE2-3B is running", "GPU is free". */
const statusLine = computed(() => (engineOn.value && gpuModel.value
  ? t(`resources.state.${gpuStatus.value}`, { model: MODEL_LABELS[gpuModel.value] })
  : t('header.gpuFree')))

// Unloading: stops the engine that holds the GPU, freeing its video memory; the next generation starts it again.
// It cuts a running generation short, so the first click only asks.
const confirming = ref(false)
const unloading = ref(false)
const unloadError = ref('')
const loaded = computed(() => {
  const id = orchestrator.activeModel
  const status = id ? orchestrator.statuses[id]?.status : undefined
  return id && (status === 'running' || status === 'starting' || status === 'error') ? id : null
})
async function unload() {
  if (!confirming.value) {
    confirming.value = true
    return
  }
  unloading.value = true
  unloadError.value = ''
  try {
    await orchestrator.stopActive()
  } catch (err) {
    unloadError.value = err instanceof Error ? err.message : String(err)
  } finally {
    unloading.value = false
    confirming.value = false
  }
}

const ram = computed(() => system.resources?.ram ?? null)
const vram = computed(() => system.resources?.vram ?? null)
const HOLDER_COLORS: Record<MemoryHolder, string> = {
  ace_step: '#a855f7', yue2: '#3b82f6', stable_audio: '#f59e0b', demucs: '#10b981', cover: '#ec4899', backend: '#06b6d4', other: '#64748b',
}

const gb = (bytes: number | null | undefined) => (bytes == null || !Number.isFinite(bytes) ? '–' : (bytes / 1024 ** 3).toFixed(1))
/** A total as people say it: a 15.99 GB card is "16". */
const gbTotal = (bytes: number | null | undefined) => {
  if (bytes == null || !Number.isFinite(bytes)) return '–'
  const v = bytes / 1024 ** 3
  return Math.abs(v - Math.round(v)) < 0.06 ? String(Math.round(v)) : v.toFixed(1)
}
const pct = (used: number, total: number) => Math.min(100, Math.round((used / total) * 100))
const level = (used: number, total: number) => {
  const f = used / total
  return f >= 0.92 ? 'bg-status-failed' : f >= 0.8 ? 'bg-status-queued' : 'bg-accent1'
}

/** The button's meter: video memory, or the RAM where there are no video memory figures. */
const meter = computed(() => {
  if (vram.value) return { ...vram.value, label: t('resources.vramLong'), of: 'resources.vramOf' as const }
  if (ram.value) return { ...ram.value, label: t('resources.ramLong'), of: 'resources.ramOf' as const }
  return null
})
const buttonLabel = computed(() => (meter.value
  ? `${statusLine.value}. ${t(meter.value.of, { used: gb(meter.value.used), total: gbTotal(meter.value.total) })}`
  : statusLine.value))

const vramHolders = computed(() =>
  (system.resources?.vram_by ?? [])
    .filter((h) => h.bytes >= 50 * 1024 ** 2)
    .map((h) => ({ ...h, color: HOLDER_COLORS[h.key] ?? HOLDER_COLORS.other, label: t(`resources.holder.${h.key}`) })),
)
const segments = computed(() => {
  const total = vram.value?.total
  return total ? vramHolders.value.map((h) => ({ ...h, pct: Math.min(100, (h.bytes / total) * 100) })) : []
})
const ramHolders = computed(() =>
  (Object.entries(system.resources?.ram_by ?? {}) as [MemoryHolder, number][])
    .filter(([, bytes]) => bytes >= 50 * 1024 ** 2)
    .map(([key, bytes]) => ({ key, bytes, label: t(`resources.holder.${key}`) })),
)
</script>

<template>
  <div class="relative min-w-0">
    <!-- The master meter. Its bar's track is lighter than the header, so an empty card still reads as a meter. -->
    <button
      ref="trigger"
      type="button"
      class="flex h-9 min-w-0 max-w-full items-center gap-2 rounded-lg border px-2 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1 sm:px-2.5"
      :class="open ? 'border-accent1/50 bg-panel text-text' : 'border-border bg-panel-2/40 text-text-dim hover:border-accent1/50 hover:bg-panel hover:text-text'"
      :aria-label="buttonLabel"
      :title="buttonLabel"
      aria-haspopup="dialog"
      :aria-expanded="open"
      :aria-controls="open ? `${uid}-details` : undefined"
      @click="open = !open"
    >
      <span class="h-2 w-2 shrink-0 rounded-full" :class="LED_CLASSES[gpuStatus]" aria-hidden="true"></span>
      <span class="hidden min-w-0 max-w-[10rem] truncate lg:block" :class="engineOn ? 'font-semibold text-text' : 'font-medium'">{{ engineName }}</span>
      <span v-if="meter" class="flex h-1 w-8 shrink-0 overflow-hidden rounded-full bg-text-dim/30 sm:w-14" aria-hidden="true">
        <span class="block h-full rounded-full" :class="level(meter.used, meter.total)" :style="{ width: pct(meter.used, meter.total) + '%' }"></span>
      </span>
      <span v-if="meter" class="hidden whitespace-nowrap tabular-nums text-text-dim xl:inline">{{ gb(meter.used) }} / {{ gbTotal(meter.total) }} {{ t('resources.unit') }}</span>
      <!-- a button, not a readout: the arrow says a click opens the details -->
      <ChevronIcon class="hidden h-3.5 w-3.5 shrink-0 text-text-dim transition-transform motion-reduce:transition-none sm:block" :class="open && 'rotate-180'" />
    </button>

    <!-- The details. On a phone the full width under the header (the header's backdrop blur makes it the containing
         block of a fixed box); wider, under the button and aligned to its end. -->
    <div
      v-if="open"
      :id="`${uid}-details`"
      ref="panel"
      role="dialog"
      :aria-label="t('resources.title')"
      class="fixed inset-x-4 top-[calc(var(--header-h,4rem)+0.25rem)] z-50 space-y-3 rounded-xl border border-border bg-panel p-4 text-xs text-text shadow-xl sm:absolute sm:inset-x-auto sm:end-0 sm:top-full sm:mt-2 sm:w-[min(24rem,calc(100vw-2rem))]"
    >
      <!-- the engine's state -->
      <p class="flex items-center gap-2 text-[13px] font-semibold">
        <span class="h-2 w-2 shrink-0 rounded-full" :class="LED_CLASSES[gpuStatus]" aria-hidden="true"></span>
        <span class="min-w-0">{{ statusLine }}</span>
      </p>
      <div v-if="vram" class="border-t border-border/60 pt-3">
        <div class="mb-1 flex items-center justify-between gap-3">
          <span class="truncate text-text-dim">{{ vram.name || t('resources.vramLong') }}</span>
          <span class="flex shrink-0 gap-2 tabular-nums"><span><span class="font-medium">{{ gb(vram.used) }}</span> / {{ gbTotal(vram.total) }} {{ t('resources.unit') }}</span><span class="text-text-dim">{{ pct(vram.used, vram.total) }}%</span></span>
        </div>
        <div class="flex h-2 w-full overflow-hidden rounded-full bg-panel-2" role="progressbar" :aria-valuenow="pct(vram.used, vram.total)" aria-valuemin="0" aria-valuemax="100" :aria-label="t('resources.vramLong')">
          <template v-if="segments.length">
            <div v-for="g in segments" :key="g.key" class="h-full" :style="{ width: g.pct + '%', background: g.color }"></div>
          </template>
          <div v-else class="h-full" :class="level(vram.used, vram.total)" :style="{ width: pct(vram.used, vram.total) + '%' }"></div>
        </div>
        <ul v-if="vramHolders.length" class="mt-2 space-y-1.5">
          <li v-for="g in vramHolders" :key="g.key" class="flex items-center gap-2">
            <span class="h-2 w-2 shrink-0 rounded-full" :style="{ background: g.color }" aria-hidden="true"></span>
            <span class="min-w-0 flex-1">{{ g.label }}</span>
            <span class="shrink-0 tabular-nums">{{ gb(g.bytes) }} {{ t('resources.unit') }}</span>
          </li>
        </ul>
        <p v-if="vram.load != null || vram.temp != null" class="mt-2 flex gap-3 text-text-dim">
          <span v-if="vram.load != null">{{ t('resources.load', { n: vram.load }) }}</span>
          <span v-if="vram.temp != null">{{ vram.temp }}°C</span>
        </p>
      </div>
      <div v-if="ram" class="border-t border-border/60 pt-3">
        <div class="mb-1 flex items-center justify-between gap-3">
          <span class="text-text-dim">{{ t('resources.ramLong') }}</span>
          <span class="flex shrink-0 gap-2 tabular-nums"><span><span class="font-medium">{{ gb(ram.used) }}</span> / {{ gbTotal(ram.total) }} {{ t('resources.unit') }}</span><span class="text-text-dim">{{ pct(ram.used, ram.total) }}%</span></span>
        </div>
        <div class="flex h-2 w-full overflow-hidden rounded-full bg-panel-2" role="progressbar" :aria-valuenow="pct(ram.used, ram.total)" aria-valuemin="0" aria-valuemax="100" :aria-label="t('resources.ramLong')">
          <div class="h-full" :class="level(ram.used, ram.total)" :style="{ width: pct(ram.used, ram.total) + '%' }"></div>
        </div>
        <ul v-if="ramHolders.length" class="mt-2 space-y-0.5 text-text-dim">
          <li v-for="h in ramHolders" :key="h.key" class="flex justify-between gap-3">
            <span>{{ t('resources.holds', { who: h.label }) }}</span>
            <span class="tabular-nums text-text">{{ gb(h.bytes) }} {{ t('resources.unit') }}</span>
          </li>
        </ul>
      </div>
      <!-- unloading the engine, and the way to Models, where engines are installed and set up -->
      <div class="space-y-3 border-t border-border/60 pt-3">
        <div v-if="loaded" class="flex items-center gap-3">
          <p class="min-w-0 flex-1 leading-snug text-text-dim">
            {{ confirming ? t('resources.unloadConfirm') : t('resources.unloadHint') }}
          </p>
          <button
            type="button"
            class="inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1 disabled:opacity-50"
            :class="confirming ? 'border-status-failed/60 bg-status-failed/15 text-status-failed hover:bg-status-failed/25' : 'border-border text-text hover:border-accent1/50 hover:bg-panel-2'"
            :disabled="unloading"
            @click="unload"
          >
            <span v-if="unloading" class="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" aria-hidden="true"></span>
            {{ unloading ? t('resources.unloading') : confirming ? t('resources.unloadYes') : t('resources.unload') }}
          </button>
          <button
            v-if="confirming && !unloading" type="button"
            class="min-h-8 shrink-0 rounded-lg px-2 py-1.5 text-text-dim hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1"
            @click="confirming = false"
          >
            {{ t('common.cancel') }}
          </button>
        </div>
        <p v-if="unloadError" class="text-status-failed">{{ unloadError }}</p>
        <router-link
          to="/models"
          class="inline-flex min-h-8 items-center gap-2 rounded-lg px-2 py-1.5 -ms-2 font-medium text-accent1-text hover:bg-panel-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1"
          @click="open = false"
        >
          <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {{ t('header.models') }}
        </router-link>
      </div>
    </div>
  </div>
</template>
