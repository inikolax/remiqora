<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { MemoryHolder } from '../../api/system'
import { useSystemStore } from '../../stores/system'

// RAM and video memory in use: two small meters in the header, and the details (who holds how much, the card's
// load and temperature) in a panel on click. A meter turns amber from 80 % and red from 92 %: that is where a
// render starts to swap or runs out of memory. Same as Remiqora Video's header.
const { t } = useI18n()
const system = useSystemStore()
const open = ref(false)
const root = ref<HTMLElement | null>(null)

const ram = computed(() => system.resources?.ram ?? null)
const vram = computed(() => system.resources?.vram ?? null)
const HOLDER_COLORS: Record<MemoryHolder, string> = {
  ace_step: '#a855f7', yue2: '#3b82f6', demucs: '#10b981', backend: '#06b6d4', other: '#64748b',
}

const gb = (bytes: number | null | undefined) => (bytes == null || !Number.isFinite(bytes) ? '–' : (bytes / 1024 ** 3).toFixed(1))
const pct = (used: number, total: number) => Math.min(100, Math.round((used / total) * 100))
const level = (used: number, total: number) => {
  const f = used / total
  return f >= 0.92 ? 'bg-status-failed' : f >= 0.8 ? 'bg-status-queued' : 'bg-accent1'
}

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
const vramTitle = computed(() => vramHolders.value.map((h) => `${h.label}: ${gb(h.bytes)} ${t('resources.unit')}`).join(' · '))

function onDocClick(e: MouseEvent) {
  if (open.value && root.value && !root.value.contains(e.target as Node)) open.value = false
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}
onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div v-if="ram || vram" ref="root" class="relative">
    <!-- the header: two small meters -->
    <button
      type="button"
      class="flex items-center gap-3 rounded-md px-2 py-0.5 text-xs text-text-dim hover:bg-panel hover:text-text"
      :aria-expanded="open"
      :aria-label="t('resources.title')"
      :title="vramTitle || t('resources.title')"
      @click="open = !open"
    >
      <span v-for="m in [ram && { key: 'ram', label: t('resources.ram'), ...ram }, vram && { key: 'vram', label: t('resources.vram'), ...vram }]" :key="m ? m.key : 'none'" class="contents">
        <span v-if="m" class="flex items-center gap-1.5">
          <span class="whitespace-nowrap">{{ m.label }}</span>
          <span class="flex h-1.5 w-12 overflow-hidden rounded-full bg-panel-2" role="progressbar" :aria-valuenow="pct(m.used, m.total)" aria-valuemin="0" aria-valuemax="100" :aria-label="m.label">
            <template v-if="m.key === 'vram' && segments.length">
              <span v-for="g in segments" :key="g.key" class="block h-full transition-[width] duration-500" :style="{ width: g.pct + '%', background: g.color }"></span>
            </template>
            <span v-else class="block h-full transition-[width] duration-500" :class="level(m.used, m.total)" :style="{ width: pct(m.used, m.total) + '%' }"></span>
          </span>
          <span class="whitespace-nowrap tabular-nums text-text">{{ gb(m.used) }}<span class="text-text-dim">/{{ gb(m.total) }} {{ t('resources.unit') }}</span></span>
        </span>
      </span>
    </button>

    <!-- the details -->
    <div
      v-if="open"
      role="dialog"
      :aria-label="t('resources.title')"
      class="absolute right-0 top-full z-50 mt-1 w-[min(24rem,calc(100vw-2rem))] space-y-3 rounded-xl border border-border bg-panel p-4 text-xs text-text shadow-xl"
    >
      <div v-if="ram">
        <div class="mb-1 flex items-center justify-between">
          <span class="text-text-dim">{{ t('resources.ramLong') }}</span>
          <span class="tabular-nums"><span class="font-medium">{{ gb(ram.used) }}</span> / {{ gb(ram.total) }} {{ t('resources.unit') }} · {{ pct(ram.used, ram.total) }}%</span>
        </div>
        <div class="flex h-2 w-full overflow-hidden rounded-full bg-panel-2">
          <div class="h-full transition-[width] duration-500" :class="level(ram.used, ram.total)" :style="{ width: pct(ram.used, ram.total) + '%' }"></div>
        </div>
        <ul v-if="ramHolders.length" class="mt-2 space-y-0.5 text-text-dim">
          <li v-for="h in ramHolders" :key="h.key" class="flex justify-between gap-3">
            <span>{{ t('resources.holds', { who: h.label }) }}</span>
            <span class="tabular-nums text-text">{{ gb(h.bytes) }} {{ t('resources.unit') }}</span>
          </li>
        </ul>
      </div>
      <div v-if="vram" class="border-t border-border/60 pt-3">
        <div class="mb-1 flex items-center justify-between gap-3">
          <span class="truncate text-text-dim">{{ vram.name || t('resources.vramLong') }}</span>
          <span class="shrink-0 tabular-nums"><span class="font-medium">{{ gb(vram.used) }}</span> / {{ gb(vram.total) }} {{ t('resources.unit') }} · {{ pct(vram.used, vram.total) }}%</span>
        </div>
        <div class="flex h-2 w-full overflow-hidden rounded-full bg-panel-2">
          <template v-if="segments.length">
            <div v-for="g in segments" :key="g.key" class="h-full transition-[width] duration-500" :style="{ width: g.pct + '%', background: g.color }"></div>
          </template>
          <div v-else class="h-full transition-[width] duration-500" :class="level(vram.used, vram.total)" :style="{ width: pct(vram.used, vram.total) + '%' }"></div>
        </div>
        <ul v-if="vramHolders.length" class="mt-2 space-y-1.5">
          <li v-for="g in vramHolders" :key="g.key" class="flex items-center gap-2">
            <span class="h-2 w-2 shrink-0 rounded-full" :style="{ background: g.color }" aria-hidden="true"></span>
            <span class="min-w-0 flex-1">{{ g.label }}</span>
            <span class="shrink-0 tabular-nums">{{ gb(g.bytes) }} {{ t('resources.unit') }}</span>
          </li>
        </ul>
        <p v-if="vram.load != null || vram.temp != null" class="mt-2 text-text-dim">
          <template v-if="vram.load != null">{{ t('resources.load', { n: vram.load }) }}</template><template v-if="vram.load != null && vram.temp != null"> · </template><template v-if="vram.temp != null">{{ vram.temp }}°C</template>
        </p>
      </div>
    </div>
  </div>
</template>
