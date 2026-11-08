<script setup lang="ts">
// Models and settings: a list of engines on the left (with their state and what their models take on disk) and the
// chosen one on the right: its settings first, then the weights it can download or delete. Engine settings apply
// on the engine's next start; the page says when a running engine still has the old ones and offers a restart.
// The chosen engine is the URL hash (#ace-step, #yue2, #stable-audio, #samples-cpu, #demucs), so the panels can
// link straight to a section.
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import type { CpuSamplerSettings, EngineId, EnginePart } from '../../api/engines'
import type { Sa3WeightModel } from '../../api/sa3Weights'
import { MODEL_LABELS } from '../../composables/useModelSwitch'
import { useEnginesStore } from '../../stores/engines'
import { useOrchestratorStore } from '../../stores/orchestrator'
import { useSa3WeightsStore } from '../../stores/sa3Weights'
import { gb } from '../../utils/bytes'
import HfTokenField from '../../components/shared/HfTokenField.vue'
import NotInstalled from '../../components/shared/NotInstalled.vue'
import PartRow from '../../components/shared/PartRow.vue'
import AssistantSection from './AssistantSection.vue'
import SparklesIcon from '../../components/shared/icons/SparklesIcon.vue'
import MicIcon from '../../components/shared/icons/MicIcon.vue'
import PulseIcon from '../../components/shared/icons/PulseIcon.vue'
import SampleIcon from '../../components/shared/icons/SampleIcon.vue'
import SplitStemsIcon from '../../components/shared/icons/SplitStemsIcon.vue'
import WaveIcon from '../../components/shared/icons/WaveIcon.vue'

const { t, locale } = useI18n()
const store = useEnginesStore()
const sa3 = useSa3WeightsStore()
const orchestrator = useOrchestratorStore()
const route = useRoute()
const router = useRouter()

type SectionId = 'ace-step' | 'yue2' | 'stable-audio' | 'samples-cpu' | 'demucs' | 'assistant'
/** The same icons as the header's engine tabs, so the list reads as the same things. Colours: the disk bar. */
const SECTIONS: { id: SectionId; engine: EngineId; icon: Component; bar: string; sub?: boolean }[] = [
  { id: 'ace-step', engine: 'ace_step', icon: WaveIcon, bar: 'bg-accent1' },
  { id: 'yue2', engine: 'yue2', icon: MicIcon, bar: 'bg-accent2' },
  { id: 'stable-audio', engine: 'stable_audio', icon: PulseIcon, bar: 'bg-accent' },
  { id: 'samples-cpu', engine: 'stable_audio', icon: SampleIcon, bar: '', sub: true },
  { id: 'demucs', engine: 'demucs', icon: SplitStemsIcon, bar: 'bg-text-dim' },
  // not an engine: the prompt assistant; its own component and state (store.assistant)
  { id: 'assistant', engine: 'demucs', icon: SparklesIcon, bar: 'bg-status-queued' },
]
const isSection = (s: string): s is SectionId => SECTIONS.some((x) => x.id === s)
const current = ref<SectionId>(isSection(route.hash.slice(1)) ? (route.hash.slice(1) as SectionId) : 'ace-step')
watch(() => route.hash, (h) => { if (isSection(h.slice(1))) current.value = h.slice(1) as SectionId })
function select(id: SectionId) {
  current.value = id
  void router.replace({ hash: `#${id}` })
}
const section = computed(() => SECTIONS.find((s) => s.id === current.value)!)
const engineId = computed(() => section.value.engine)
const engines = computed(() => store.state?.engines ?? null)
const engine = computed(() => engines.value?.[engineId.value] ?? null)
function titleOf(id: SectionId): string {
  if (id === 'samples-cpu') return t('models.cpu.title')
  if (id === 'demucs') return t('models.demucs.title')
  return MODEL_LABELS[SECTIONS.find((s) => s.id === id)!.engine as 'ace_step' | 'yue2' | 'stable_audio']
}
const sectionTitle = computed(() => titleOf(current.value))

// ---- disk ----
const assistantBytes = computed(() => store.assistant?.on_disk ?? 0)
const totalBytes = computed(() => Object.values(engines.value ?? {}).reduce((a, e) => a + (e.on_disk ?? 0), 0) + assistantBytes.value)
/** Shares of the disk bar, one per engine; the smallest still shows as a sliver. */
const diskShares = computed(() => SECTIONS.filter((s) => !s.sub).map((s) => {
  const bytes = s.id === 'assistant' ? assistantBytes.value : engines.value?.[s.engine]?.on_disk ?? 0
  return { id: s.id, bar: s.bar, bytes, percent: totalBytes.value ? Math.max(bytes ? 0.6 : 0, (bytes / totalBytes.value) * 100) : 0 }
}))

const actionError = ref<string | null>(null)
async function run(action: () => Promise<unknown>) {
  actionError.value = null
  try {
    await action()
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : String(e)
  }
}

// ---- the engine's process ----
const status = computed(() => engine.value?.status ?? null)
const STATUS_DOT: Record<string, string> = { running: 'bg-status-done', starting: 'bg-status-queued', stopping: 'bg-status-queued', error: 'bg-status-failed', stopped: 'bg-text-dim/50' }
const STATUS_PILL: Record<string, string> = { running: 'bg-status-done/15 text-status-done', starting: 'bg-status-queued/15 text-status-queued', stopping: 'bg-status-queued/15 text-status-queued', error: 'bg-status-failed/15 text-status-failed', stopped: 'bg-panel-2 text-text-dim' }
function dotFor(id: EngineId, section?: SectionId): string {
  if (section === 'assistant') return STATUS_DOT[store.assistant?.status ?? 'stopped']
  if (id === 'demucs') return ''
  return STATUS_DOT[engines.value?.[id]?.status ?? 'stopped']
}
function bytesFor(s: { id: SectionId; engine: EngineId }): number {
  return s.id === 'assistant' ? assistantBytes.value : engines.value?.[s.engine]?.on_disk ?? 0
}
function navTitle(s: { id: SectionId; engine: EngineId }): string {
  if (s.id === 'samples-cpu') return t('models.cpu.navTitle')
  if (s.id === 'demucs') return t('models.demucs.navTitle')
  if (s.id === 'assistant') return t('models.assistant.navTitle')
  return MODEL_LABELS[s.engine as 'ace_step' | 'yue2' | 'stable_audio']
}
async function startEngine() {
  if (engineId.value === 'demucs') return
  await run(async () => {
    await orchestrator.switchModel(engineId.value as 'ace_step' | 'yue2' | 'stable_audio')
    await store.load()
  })
}
async function stopEngine() {
  await run(async () => {
    await orchestrator.stopActive()
    await store.load()
  })
}

// ---- settings ----
const pendingRestart = computed(() => {
  const e = engine.value
  if (!e?.started || e.status !== 'running' || !e.settings) return false
  return Object.entries(e.settings).some(([k, v]) => e.started?.[k] !== v)
})
async function setSetting(key: string, value: string) {
  await run(() => store.saveSettings(engineId.value, { [key]: value }))
}
async function restart() {
  await run(async () => {
    await orchestrator.stopActive()
    await orchestrator.switchModel(engineId.value as 'ace_step' | 'yue2' | 'stable_audio')
    await store.load()
  })
}

// ---- weights ----
/** vue-i18n reads a dot as a path separator: "lm-0.6B" is kept as "lm-0_6B" in the texts. */
const partKey = (id: string) => id.replace(/\./g, '_')
/** Rarely wanted parts stay folded until one is downloaded or downloading. */
const SECONDARY = new Set(['acestep-v15-xl-turbo', 'acestep-v15-xl-sft', 'acestep-v15-xl-base', 'acestep-5Hz-lm-0.6B', 'acestep-5Hz-lm-4B'])
const showAll = ref(false)
const parts = computed(() => engine.value?.parts ?? [])
const isSecondary = (p: EnginePart) => SECONDARY.has(p.id) && !p.installed && !p.download
const visibleParts = computed(() => showAll.value ? parts.value : parts.value.filter((p) => !isSecondary(p)))
const hiddenCount = computed(() => parts.value.filter(isSecondary).length)
/** What the last check of a part says, in words. */
function checkText(id: string): { text: string; bad: boolean } | null {
  const c = store.checks[id]
  if (!c) return null
  if ('error' in c) return { text: t('models.checkFailed', { error: c.error }), bad: true }
  if (c.problems.length) return { text: t('models.checkBad', { files: c.problems.map((p) => `${p.file} (${p.reason})`).join('; ') }), bad: true }
  const parts = [c.method === 'sha256' ? t('models.checkOkHash', { n: c.files, h: c.hashed }) : t('models.checkOkSize', { n: c.files })]
  if (c.outdated.length) parts.push(t('models.checkOutdated', { files: c.outdated.join(', ') }))
  if (c.offline) parts.push(t('models.checkOffline'))
  return { text: parts.join(' '), bad: false }
}
const blockedTitle = computed(() => store.state?.downloading ? t('models.oneAtATime') : undefined)

// Stable Audio 3: its own store (the gated weights and the token)
const sa3Models = computed(() => sa3.weights?.models ?? [])
const sa3Visible = computed(() => showAll.value ? sa3Models.value : sa3Models.value.filter((m) => !m.base || m.installed || m.download))
const sa3Hidden = computed(() => sa3Models.value.filter((m) => m.base && !m.installed && !m.download).length)
const pageUrl = (m: Sa3WeightModel) => `https://huggingface.co/${m.repo}`
const optionLabel = (key: string, value: string) => (key === 'preload' && value === '' ? t('models.sa3.preloadNone') : value)
watch(current, () => { showAll.value = false })

// ---- samples on the CPU ----
const cpuForm = ref<CpuSamplerSettings | null>(null)
watch(() => store.cpu?.settings, (s) => { if (s) cpuForm.value = { ...s } }, { immediate: true })
const threadChoices = computed(() => {
  const n = store.cpu?.cpu_count || 8
  return [0, ...[2, 4, 6, 8, 12, 16, 24, 32, 48, 64].filter((x) => x <= n)]
})
async function saveCpu() {
  if (cpuForm.value) await run(() => store.saveCpu(cpuForm.value as CpuSamplerSettings))
}

onMounted(() => {
  store.watch()
  void store.load()
  void sa3.load()
})
onBeforeUnmount(() => store.unwatch())
</script>

<template>
  <div class="mx-auto max-w-5xl">
    <!-- title, and the disk: the total with a bar of each engine's share -->
    <header class="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
      <div class="min-w-0">
        <h1 class="text-2xl font-semibold text-text">{{ t('models.title') }}</h1>
        <p class="mt-1 max-w-2xl text-sm leading-relaxed text-text-dim">{{ t('models.lead') }}</p>
      </div>
      <div v-if="engines" class="w-full max-w-xs shrink-0 sm:w-72">
        <p class="flex items-baseline justify-between text-xs text-text-dim">
          <span>{{ t('models.diskTitle') }}</span>
          <span class="text-sm font-semibold tabular-nums text-text">{{ t('models.size', { gb: gb(totalBytes, locale) }) }}</span>
        </p>
        <div class="mt-1.5 flex h-2 w-full gap-px overflow-hidden rounded-full bg-panel-2" role="img" :aria-label="t('models.total', { gb: gb(totalBytes, locale) })">
          <span v-for="s in diskShares" :key="s.id" class="h-full" :class="s.bar" :style="{ width: `${s.percent}%` }"></span>
        </div>
      </div>
    </header>

    <p v-if="store.loadError" class="mt-5 rounded-lg bg-status-failed/10 p-3 text-sm text-status-failed">{{ store.loadError }}</p>
    <p v-else-if="!engines" class="mt-5 text-sm text-text-dim">{{ t('models.loading') }}</p>

    <div v-if="engines" class="mt-5 grid gap-5 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <!-- the engines: a column on a wide screen, a row of chips on a narrow one -->
      <nav :aria-label="t('models.nav')" class="-mx-4 flex gap-1 overflow-x-auto px-4 lg:sticky lg:top-20 lg:mx-0 lg:flex-col lg:self-start lg:overflow-visible lg:rounded-xl lg:border lg:border-border lg:bg-panel lg:p-1.5">
        <button
          v-for="s in SECTIONS"
          :key="s.id"
          type="button"
          class="relative flex shrink-0 items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-sm transition-colors lg:w-full"
          :class="[
            current === s.id ? 'bg-accent1/15 text-text' : 'text-text-dim hover:bg-panel-2 hover:text-text',
            s.sub && 'lg:ms-3 lg:w-[calc(100%-0.75rem)]',
          ]"
          :aria-current="current === s.id ? 'page' : undefined"
          @click="select(s.id)"
        >
          <span v-if="current === s.id" class="accent-gradient absolute inset-y-2 start-0 w-0.5 rounded-full" aria-hidden="true"></span>
          <component :is="s.icon" class="h-4 w-4 shrink-0" :class="current === s.id ? 'text-accent1' : 'text-text-dim'" />
          <span class="min-w-0 flex-1 truncate" :class="current === s.id && 'font-medium'">{{ navTitle(s) }}</span>
          <span v-if="!s.sub && dotFor(s.engine, s.id)" class="h-1.5 w-1.5 shrink-0 rounded-full" :class="dotFor(s.engine, s.id)"></span>
          <span v-if="!s.sub && bytesFor(s)" class="hidden text-[11px] tabular-nums text-text-dim lg:inline">{{ t('models.size', { gb: gb(bytesFor(s), locale) }) }}</span>
        </button>
      </nav>

      <AssistantSection v-if="current === 'assistant'" />
      <!-- the chosen engine: one card with a header strip and sections inside -->
      <section v-else class="min-w-0 overflow-hidden rounded-xl border border-border bg-panel">
        <div class="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border bg-panel-2/60 px-4 py-3">
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent1/15 text-accent1">
            <component :is="section.icon" class="h-[18px] w-[18px]" />
          </span>
          <div class="min-w-0 flex-1">
            <h2 class="truncate text-base font-semibold text-text">{{ sectionTitle }}</h2>
            <p v-if="!section.sub && engine?.on_disk != null" class="text-xs text-text-dim">{{ t('models.onDisk', { gb: gb(engine.on_disk ?? 0, locale) }) }}</p>
          </div>
          <span v-if="status && !section.sub" class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs" :class="STATUS_PILL[status]">
            <span class="h-1.5 w-1.5 rounded-full" :class="STATUS_DOT[status]"></span>{{ t(`models.status.${status}`) }}
          </span>
          <template v-if="status && !section.sub && engine?.ready">
            <button v-if="status === 'running'" type="button" class="rounded-lg border border-border px-3 py-1.5 text-xs text-text-dim hover:border-text-dim hover:text-text" :disabled="orchestrator.switching" @click="stopEngine">{{ t('models.stop') }}</button>
            <button v-else-if="status === 'stopped' || status === 'error'" type="button" class="accent-gradient rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50" :disabled="orchestrator.switching" @click="startEngine">{{ t('models.start') }}</button>
          </template>
        </div>

        <div class="px-4 pb-4">
          <p v-if="status === 'error' && engine && orchestrator.statuses[engineId]?.error" class="mt-4 whitespace-pre-line rounded-lg bg-status-failed/10 p-3 text-xs text-status-failed">{{ orchestrator.statuses[engineId]?.error }}</p>
          <p v-if="actionError" class="mt-4 rounded-lg bg-status-failed/10 p-3 text-xs text-status-failed" role="alert">{{ actionError }}</p>

          <NotInstalled v-if="engine && !engine.ready" :feature="engineId === 'ace_step' ? 'aceBase' : engineId === 'yue2' ? 'yue2' : engineId === 'demucs' ? 'demucs' : 'stableAudio'" compact class="mt-4" />

          <!-- ================= ACE-Step / YuE2 ================= -->
          <template v-else-if="engine && (engineId === 'ace_step' || engineId === 'yue2') && !section.sub">
            <h3 class="mt-4 text-[11px] font-semibold tracking-wider text-text-dim uppercase">{{ t('models.settings') }}</h3>
            <p v-if="engineId === 'yue2'" class="mt-2 text-xs leading-relaxed text-text-dim">{{ t('models.yue2.noSettings') }}</p>
            <div v-else class="mt-2 grid gap-4 sm:grid-cols-2">
              <label v-for="key in ['dit_model', 'lm_model']" :key="key" class="flex flex-col gap-1 text-xs">
                <span class="font-medium text-text">{{ t(`models.ace.${key}`) }}</span>
                <select class="rounded-lg border border-border bg-panel-2 px-2.5 py-2 text-sm text-text focus:border-accent1 focus:outline-none" :value="engine.settings?.[key]" @change="setSetting(key, ($event.target as HTMLSelectElement).value)">
                  <option v-for="v in engine.choices?.[key] ?? []" :key="v" :value="v">{{ v }}</option>
                </select>
                <span class="leading-relaxed text-text-dim">{{ t(`models.ace.${key}Hint`) }}</span>
              </label>
            </div>
            <p v-if="pendingRestart" class="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-status-queued/10 px-3 py-2 text-xs text-status-queued">
              {{ t('models.restartNote', { engine: sectionTitle }) }}
              <button type="button" class="rounded-lg border border-status-queued/40 px-2.5 py-1 text-status-queued hover:bg-status-queued/10" @click="restart">{{ t('models.restart') }}</button>
            </p>

            <div class="mt-5 flex items-baseline justify-between gap-3 border-t border-border pt-4">
              <h3 class="text-[11px] font-semibold tracking-wider text-text-dim uppercase">{{ t('models.weights') }}</h3>
              <span v-if="store.state?.downloading" class="text-xs text-status-queued">{{ t('models.downloadingNow') }}</span>
            </div>
            <ul class="mt-1">
              <PartRow
                v-for="p in visibleParts"
                :key="p.id"
                :name="t(`models.parts.${partKey(p.id)}.name`)"
                :hint="t(`models.parts.${partKey(p.id)}.text`)"
                :bytes="p.bytes"
                :on-disk="p.on_disk"
                :installed="p.installed"
                :download="p.download"
                :required="p.required"
                :deletable="p.deletable"
                :verifiable="p.verifiable"
                :checking="store.checking === p.id"
                :check-note="checkText(p.id)?.text"
                :check-bad="checkText(p.id)?.bad"
                :blocked="!!store.state?.downloading"
                :blocked-title="blockedTitle"
                @verify="run(() => store.verify(p.id))"
                @reinstall="run(() => store.reinstall(p.id))"
                @download="run(() => store.download(p.id))"
                @cancel="run(() => store.cancel(p.id))"
                @delete="run(() => store.remove(p.id))"
              >
                <template v-if="p.required" #note>{{ t('models.required') }}</template>
              </PartRow>
            </ul>
            <button v-if="hiddenCount" type="button" class="mt-2 rounded-lg px-2 py-1 text-xs text-text-dim hover:bg-panel-2 hover:text-text" :aria-expanded="showAll" @click="showAll = !showAll">
              {{ t(showAll ? 'models.showLess' : 'models.showMore', { n: hiddenCount }) }}
            </button>
          </template>

          <!-- ================= Stable Audio 3 ================= -->
          <template v-else-if="engine && engineId === 'stable_audio' && !section.sub">
            <h3 class="mt-4 text-[11px] font-semibold tracking-wider text-text-dim uppercase">{{ t('models.settings') }}</h3>
            <div class="mt-2 grid gap-4 sm:grid-cols-2">
              <label class="flex flex-col gap-1 text-xs">
                <span class="font-medium text-text">{{ t('models.sa3.preload') }}</span>
                <select class="rounded-lg border border-border bg-panel-2 px-2.5 py-2 text-sm text-text focus:border-accent1 focus:outline-none" :value="engine.settings?.preload" @change="setSetting('preload', ($event.target as HTMLSelectElement).value)">
                  <option v-for="v in engine.choices?.preload ?? []" :key="v" :value="v">{{ optionLabel('preload', v) }}</option>
                </select>
                <span class="leading-relaxed text-text-dim">{{ t('models.sa3.preloadHint') }}</span>
              </label>
              <HfTokenField class="self-start rounded-lg border border-border bg-panel-2/60 p-3" />
            </div>
            <p v-if="pendingRestart" class="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-status-queued/10 px-3 py-2 text-xs text-status-queued">
              {{ t('models.restartNote', { engine: sectionTitle }) }}
              <button type="button" class="rounded-lg border border-status-queued/40 px-2.5 py-1 text-status-queued hover:bg-status-queued/10" @click="restart">{{ t('models.restart') }}</button>
            </p>

            <div class="mt-5 flex items-baseline justify-between gap-3 border-t border-border pt-4">
              <h3 class="text-[11px] font-semibold tracking-wider text-text-dim uppercase">{{ t('models.weights') }}</h3>
              <span v-if="sa3.running" class="text-xs text-status-queued">{{ t('models.downloadingNow') }}</span>
            </div>
            <p class="mt-2 text-xs leading-relaxed text-text-dim">{{ t('sa3Weights.lead') }}</p>
            <p v-if="sa3.loadError" class="mt-2 text-xs text-status-failed">{{ sa3.loadError }}</p>
            <ul class="mt-1">
              <PartRow
                v-for="m in sa3Visible"
                :key="m.id"
                :name="m.id"
                :hint="t(`sa3Weights.models.${m.id}`)"
                :bytes="m.bytes"
                :on-disk="m.on_disk"
                :installed="m.installed"
                :download="m.download"
                deletable
                :blocked="!!sa3.running || !sa3.weights?.env"
                :blocked-title="sa3.running ? t('sa3Weights.oneAtATime', { model: sa3.running.id }) : undefined"
                @download="run(() => sa3.download(m.id))"
                @cancel="run(() => sa3.cancel(m.id))"
                @delete="run(() => sa3.remove(m.id))"
              >
                <template #error>
                  <template v-if="m.download?.code === 'access'">
                    {{ t('sa3Weights.errors.access') }}
                    <a :href="pageUrl(m)" target="_blank" rel="noopener" class="underline">{{ t('sa3Weights.modelPage') }}</a>
                  </template>
                  <template v-else-if="m.download?.code === 'login'">{{ t(sa3.weights?.token ? 'sa3Weights.errors.badToken' : 'sa3Weights.errors.login') }}</template>
                  <template v-else-if="m.download?.code === 'network'">{{ t('sa3Weights.errors.network') }}</template>
                  <template v-else>{{ m.download?.error || t('sa3Weights.errors.unknown') }}</template>
                </template>
                <template v-if="m.gated" #note>
                  {{ t('sa3Weights.licence') }}
                  <a :href="pageUrl(m)" target="_blank" rel="noopener" class="text-accent1 underline">{{ t('sa3Weights.modelPage') }}</a>
                </template>
              </PartRow>
            </ul>
            <button v-if="sa3Hidden" type="button" class="mt-2 rounded-lg px-2 py-1 text-xs text-text-dim hover:bg-panel-2 hover:text-text" :aria-expanded="showAll" @click="showAll = !showAll">
              {{ t(showAll ? 'models.showLess' : 'models.showMoreBase', { n: sa3Hidden }) }}
            </button>
          </template>

          <!-- ================= samples on the CPU ================= -->
          <template v-else-if="engine && section.sub">
            <p class="mt-4 max-w-3xl text-sm leading-relaxed text-text-dim">{{ t('models.cpu.lead') }}</p>
            <div class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              <h3 class="text-[11px] font-semibold tracking-wider text-text-dim uppercase">{{ t('models.settings') }}</h3>
              <span v-if="store.cpu" class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs" :class="STATUS_PILL[store.cpu.status]">
                <span class="h-1.5 w-1.5 rounded-full" :class="STATUS_DOT[store.cpu.status]"></span>{{ t(`models.status.${store.cpu.status}`) }}
              </span>
              <template v-if="store.cpu && cpuForm?.enabled">
                <button v-if="store.cpu.status !== 'running'" type="button" class="ms-auto rounded-lg border border-border px-3 py-1.5 text-xs text-text hover:border-accent1 disabled:opacity-50" :disabled="store.cpu.status === 'starting'" @click="run(() => store.startCpu())">{{ t('models.cpu.start') }}</button>
                <button v-else type="button" class="ms-auto rounded-lg border border-border px-3 py-1.5 text-xs text-text-dim hover:text-text" @click="run(() => store.stopCpu())">{{ t('models.cpu.stop') }}</button>
              </template>
            </div>
            <p v-if="store.cpu && !store.cpu.available" class="mt-2 text-xs text-status-queued">{{ t('models.cpu.notAvailable') }}</p>
            <form v-else-if="cpuForm" class="mt-3 space-y-4" @change="saveCpu" @submit.prevent>
              <label class="flex items-center gap-2 rounded-lg border border-border bg-panel-2/60 px-3 py-2.5 text-sm text-text">
                <input v-model="cpuForm.enabled" type="checkbox" class="h-4 w-4 accent-accent1" />
                {{ t('models.cpu.enabled') }}
              </label>
              <fieldset class="grid gap-4 sm:grid-cols-2 disabled:opacity-50" :disabled="!cpuForm.enabled">
                <div class="flex flex-col gap-1.5 text-xs sm:col-span-2">
                  <span class="font-medium text-text">{{ t('models.cpu.route') }}</span>
                  <label class="flex items-start gap-2 text-text"><input v-model="cpuForm.route" type="radio" value="auto" class="mt-0.5 accent-accent1" />{{ t('models.cpu.routeAuto') }}</label>
                  <label class="flex items-start gap-2 text-text"><input v-model="cpuForm.route" type="radio" value="cpu" class="mt-0.5 accent-accent1" />{{ t('models.cpu.routeCpu') }}</label>
                </div>
                <label class="flex flex-col gap-1 text-xs">
                  <span class="font-medium text-text">{{ t('models.cpu.threads') }}</span>
                  <select v-model.number="cpuForm.threads" class="rounded-lg border border-border bg-panel-2 px-2.5 py-2 text-sm text-text focus:border-accent1 focus:outline-none">
                    <option v-for="n in threadChoices" :key="n" :value="n">{{ n === 0 ? t('models.cpu.threadsAuto') : n }}</option>
                  </select>
                  <span class="leading-relaxed text-text-dim">{{ t('models.cpu.threadsHint', { n: store.cpu?.cpu_count ?? '?' }) }}</span>
                </label>
                <label class="flex flex-col gap-1 text-xs">
                  <span class="font-medium text-text">{{ t('models.cpu.model') }}</span>
                  <select v-model="cpuForm.model" class="rounded-lg border border-border bg-panel-2 px-2.5 py-2 text-sm text-text focus:border-accent1 focus:outline-none">
                    <option v-for="m in store.cpu?.models ?? []" :key="m" :value="m">{{ m }}</option>
                  </select>
                </label>
                <label class="flex flex-col gap-1 text-xs">
                  <span class="font-medium text-text">{{ t('models.cpu.idle') }}</span>
                  <select v-model.number="cpuForm.idle_minutes" class="rounded-lg border border-border bg-panel-2 px-2.5 py-2 text-sm text-text focus:border-accent1 focus:outline-none">
                    <option v-for="m in [5, 15, 30, 60, 0]" :key="m" :value="m">{{ m === 0 ? t('models.cpu.idleNever') : t('models.cpu.idleMin', { n: m }) }}</option>
                  </select>
                  <span class="leading-relaxed text-text-dim">{{ t('models.cpu.idleHint') }}</span>
                </label>
              </fieldset>
              <p class="text-xs leading-relaxed text-text-dim">{{ t('models.cpu.speed') }}</p>
              <p v-if="store.cpu?.restart_pending" class="rounded-lg bg-status-queued/10 px-3 py-2 text-xs text-status-queued">{{ t('models.cpu.restartPending') }}</p>
              <p v-if="store.cpu?.error" class="whitespace-pre-line rounded-lg bg-status-failed/10 p-2 text-xs text-status-failed">{{ store.cpu.error }}</p>
            </form>
          </template>

          <!-- ================= Demucs ================= -->
          <template v-else-if="engine && engineId === 'demucs'">
            <h3 class="mt-4 text-[11px] font-semibold tracking-wider text-text-dim uppercase">{{ t('models.demucs.model') }}</h3>
            <div class="mt-2 grid gap-3 sm:grid-cols-2" role="radiogroup" :aria-label="t('models.demucs.model')">
              <label
                v-for="m in engine.choices?.model ?? []"
                :key="m"
                class="flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors"
                :class="engine.settings?.model === m ? 'border-accent1/60 bg-accent1/10' : 'border-border bg-panel-2/40 hover:border-text-dim/60'"
              >
                <input type="radio" name="demucs-model" :value="m" :checked="engine.settings?.model === m" class="mt-1 accent-accent1" @change="setSetting('model', m)" />
                <span><b class="font-medium text-text">{{ m }}</b><span class="mt-0.5 block text-xs leading-relaxed text-text-dim">{{ t(`models.demucs.models.${m}`) }}</span></span>
              </label>
            </div>
          </template>
        </div>
      </section>
    </div>
  </div>
</template>
