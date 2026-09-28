<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ChannelSettings } from '../../audio/mixerEngine'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    modelValue: ChannelSettings
    label: string
    showPanMuteSolo?: boolean
    showMeter?: boolean
    level?: number
    clipping?: boolean
  }>(),
  {
    showPanMuteSolo: false,
    showMeter: false,
    level: 0,
    clipping: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: ChannelSettings]
  reset: []
}>()

function field<K extends keyof ChannelSettings>(key: K) {
  return computed<ChannelSettings[K]>({
    get: () => props.modelValue[key],
    set: (v) => emit('update:modelValue', { ...props.modelValue, [key]: v }),
  })
}

const volume = field('volume')
const pan = field('pan')
const muted = field('muted')
const solo = field('solo')

const eqLow = computed({
  get: () => props.modelValue.eq.low,
  set: (v: number) => emit('update:modelValue', { ...props.modelValue, eq: { ...props.modelValue.eq, low: v } }),
})
const eqMid = computed({
  get: () => props.modelValue.eq.mid,
  set: (v: number) => emit('update:modelValue', { ...props.modelValue, eq: { ...props.modelValue.eq, mid: v } }),
})
const eqHigh = computed({
  get: () => props.modelValue.eq.high,
  set: (v: number) => emit('update:modelValue', { ...props.modelValue, eq: { ...props.modelValue.eq, high: v } }),
})
const compThreshold = computed({
  get: () => props.modelValue.comp.threshold,
  set: (v: number) => emit('update:modelValue', { ...props.modelValue, comp: { ...props.modelValue.comp, threshold: v } }),
})
const compRatio = computed({
  get: () => props.modelValue.comp.ratio,
  set: (v: number) => emit('update:modelValue', { ...props.modelValue, comp: { ...props.modelValue.comp, ratio: v } }),
})
const reverbMix = computed({
  get: () => props.modelValue.reverb.mix,
  set: (v: number) => emit('update:modelValue', { ...props.modelValue, reverb: { ...props.modelValue.reverb, mix: v } }),
})

// Filter
const filterEnabled = computed({
  get: () => props.modelValue.filter?.enabled ?? false,
  set: (v: boolean) => emit('update:modelValue', { ...props.modelValue, filter: { ...props.modelValue.filter!, enabled: v } })
})
const filterType = computed({
  get: () => props.modelValue.filter?.type ?? 'lowpass',
  set: (v: 'lowpass' | 'highpass') => emit('update:modelValue', { ...props.modelValue, filter: { ...props.modelValue.filter!, type: v } })
})
const filterFreq = computed({
  get: () => props.modelValue.filter?.frequency ?? 22000,
  set: (v: number) => emit('update:modelValue', { ...props.modelValue, filter: { ...props.modelValue.filter!, frequency: v } })
})
const filterRes = computed({
  get: () => props.modelValue.filter?.resonance ?? 1,
  set: (v: number) => emit('update:modelValue', { ...props.modelValue, filter: { ...props.modelValue.filter!, resonance: v } })
})

// Distortion
const distEnabled = computed({
  get: () => props.modelValue.distortion?.enabled ?? false,
  set: (v: boolean) => emit('update:modelValue', { ...props.modelValue, distortion: { ...props.modelValue.distortion!, enabled: v } })
})
const distAmount = computed({
  get: () => props.modelValue.distortion?.amount ?? 0,
  set: (v: number) => emit('update:modelValue', { ...props.modelValue, distortion: { ...props.modelValue.distortion!, amount: v } })
})
const distMix = computed({
  get: () => props.modelValue.distortion?.mix ?? 0,
  set: (v: number) => emit('update:modelValue', { ...props.modelValue, distortion: { ...props.modelValue.distortion!, mix: v } })
})

// Delay
const delayEnabled = computed({
  get: () => props.modelValue.delay?.enabled ?? false,
  set: (v: boolean) => emit('update:modelValue', { ...props.modelValue, delay: { ...props.modelValue.delay!, enabled: v } })
})
const delayTime = computed({
  get: () => props.modelValue.delay?.time ?? 0.3,
  set: (v: number) => emit('update:modelValue', { ...props.modelValue, delay: { ...props.modelValue.delay!, time: v } })
})
const delayFeedback = computed({
  get: () => props.modelValue.delay?.feedback ?? 0.4,
  set: (v: number) => emit('update:modelValue', { ...props.modelValue, delay: { ...props.modelValue.delay!, feedback: v } })
})
const delayMix = computed({
  get: () => props.modelValue.delay?.mix ?? 0,
  set: (v: number) => emit('update:modelValue', { ...props.modelValue, delay: { ...props.modelValue.delay!, mix: v } })
})


// Chorus
const chorusEnabled = computed({
  get: () => props.modelValue.chorus?.enabled ?? false,
  set: (v: boolean) => emit('update:modelValue', { ...props.modelValue, chorus: { ...props.modelValue.chorus!, enabled: v } })
})
const chorusRate = computed({
  get: () => props.modelValue.chorus?.rate ?? 1.5,
  set: (v: number) => emit('update:modelValue', { ...props.modelValue, chorus: { ...props.modelValue.chorus!, rate: v } })
})
const chorusDepth = computed({
  get: () => props.modelValue.chorus?.depth ?? 0.002,
  set: (v: number) => emit('update:modelValue', { ...props.modelValue, chorus: { ...props.modelValue.chorus!, depth: v } })
})
const chorusMix = computed({
  get: () => props.modelValue.chorus?.mix ?? 0,
  set: (v: number) => emit('update:modelValue', { ...props.modelValue, chorus: { ...props.modelValue.chorus!, mix: v } })
})

// Bitcrusher
const bcEnabled = computed({
  get: () => props.modelValue.bitcrusher?.enabled ?? false,
  set: (v: boolean) => emit('update:modelValue', { ...props.modelValue, bitcrusher: { ...props.modelValue.bitcrusher!, enabled: v } })
})
const bcBits = computed({
  get: () => props.modelValue.bitcrusher?.bits ?? 8,
  set: (v: number) => emit('update:modelValue', { ...props.modelValue, bitcrusher: { ...props.modelValue.bitcrusher!, bits: v } })
})
const bcMix = computed({
  get: () => props.modelValue.bitcrusher?.mix ?? 0,
  set: (v: number) => emit('update:modelValue', { ...props.modelValue, bitcrusher: { ...props.modelValue.bitcrusher!, mix: v } })
})

</script>

<template>
  <div class="flex items-stretch rounded-xl border border-border/50 bg-panel-2/60 backdrop-blur-sm p-3 shadow-sm transition-colors hover:bg-panel-2/80 w-full gap-4">
    <!-- Volume & Pan Section -->
    <div class="flex flex-col w-36 shrink-0 border-r border-border/50 pr-3">
      <div class="flex items-center justify-between">
        <p class="text-xs font-medium text-text truncate pr-2">{{ label }}</p>
        <div class="flex items-center gap-1 shrink-0">
          <template v-if="showPanMuteSolo">
            <button
              type="button"
              class="rounded px-1.5 py-0.5 text-[10px] font-medium transition-all hover:scale-105 active:scale-95"
              :class="muted ? 'bg-status-failed text-white shadow-[0_0_8px_var(--color-status-failed)]' : 'bg-panel text-text-dim hover:text-white'"
              :aria-pressed="!!muted"
              :aria-label="t('channelStrip.mute')"
              :title="t('channelStrip.mute')"
              @click="muted = !muted"
            >
              M
            </button>
            <button
              type="button"
              class="rounded px-1.5 py-0.5 text-[10px] font-medium transition-all hover:scale-105 active:scale-95"
              :class="solo ? 'accent-gradient text-white shadow-[0_0_8px_var(--color-accent1)]' : 'bg-panel text-text-dim hover:text-white'"
              :aria-pressed="!!solo"
              :aria-label="t('channelStrip.solo')"
              :title="t('channelStrip.solo')"
              @click="solo = !solo"
            >
              S
            </button>
          </template>
        </div>
      </div>
      <div class="space-y-1 mt-2">
        <div class="flex items-center justify-between text-[10px] text-text-dim">
          <span>{{ t('channelStrip.volume', { value: Math.round(volume * 100) }) }}</span>
          <span
            v-if="clipping"
            class="rounded bg-status-failed px-1 py-0.2 text-[9px] font-bold text-white uppercase tracking-wider animate-pulse"
            role="status"
          >
            {{ t('channelStrip.clip') }}
          </span>
        </div>
        <input v-model.number="volume" type="range" min="0" max="1.5" step="0.01" class="w-full accent-current" />
        <div v-if="showMeter" class="h-2 w-full overflow-hidden rounded-full bg-panel/80 shadow-inner mt-1">
          <div
            class="h-full transition-all duration-75 ease-out rounded-full shadow-[0_0_8px_currentColor]"
            :class="clipping ? 'bg-status-failed text-status-failed' : (level ?? 0) > 0.85 ? 'bg-amber-400 text-amber-400' : 'bg-accent1 text-accent1'"
            :style="{ width: `${Math.min(100, Math.round((level ?? 0) * 100))}%` }"
          />
        </div>
      </div>
      <label v-if="showPanMuteSolo" class="block text-[10px] text-text-dim mt-2">
        {{ t('channelStrip.pan', { value: pan.toFixed(2) }) }}
        <input v-model.number="pan" type="range" min="-1" max="1" step="0.01" class="w-full accent-current" />
      </label>
      <div class="mt-auto pt-2">
        <button type="button" class="text-[10px] text-text-dim hover:underline" @click="emit('reset')">{{ t('common.reset') }}</button>
      </div>
    </div>

    <!-- Effects Rack (Wrappable) -->
    <div class="flex flex-wrap items-stretch gap-2 flex-1 min-w-0">
      
      <!-- EQ Module -->
      <div class="flex flex-col rounded-lg border border-border/50 bg-panel/30 overflow-hidden shrink-0 shadow-inner w-28">
        <div class="bg-panel-2/50 px-2 py-0.5 border-b border-border/50 flex items-center justify-between">
          <span class="text-[9px] font-bold text-text uppercase tracking-wider">{{ t('channelStrip.modules.eq') }}</span>
        </div>
        <div class="flex flex-col gap-1.5 p-1.5">
          <label class="flex items-center gap-1 text-[9px] text-text-dim">
            <span class="w-6 truncate">{{ t('channelStrip.params.low') }}</span>
            <input v-model.number="eqLow" type="range" min="-12" max="12" step="0.5" class="flex-1 min-w-0 h-1 bg-panel-2 rounded-full appearance-none accent-accent1" />
            <span class="w-5 text-right tabular-nums text-[8px]">{{ eqLow > 0 ? '+' + eqLow : eqLow }}</span>
          </label>
          <label class="flex items-center gap-1 text-[9px] text-text-dim">
            <span class="w-6 truncate">{{ t('channelStrip.params.mid') }}</span>
            <input v-model.number="eqMid" type="range" min="-12" max="12" step="0.5" class="flex-1 min-w-0 h-1 bg-panel-2 rounded-full appearance-none accent-accent1" />
            <span class="w-5 text-right tabular-nums text-[8px]">{{ eqMid > 0 ? '+' + eqMid : eqMid }}</span>
          </label>
          <label class="flex items-center gap-1 text-[9px] text-text-dim">
            <span class="w-6 truncate">{{ t('channelStrip.params.high') }}</span>
            <input v-model.number="eqHigh" type="range" min="-12" max="12" step="0.5" class="flex-1 min-w-0 h-1 bg-panel-2 rounded-full appearance-none accent-accent1" />
            <span class="w-5 text-right tabular-nums text-[8px]">{{ eqHigh > 0 ? '+' + eqHigh : eqHigh }}</span>
          </label>
        </div>
      </div>

      <!-- Dynamics Module -->
      <div class="flex flex-col rounded-lg border border-border/50 bg-panel/30 overflow-hidden shrink-0 shadow-inner w-28">
        <div class="bg-panel-2/50 px-2 py-0.5 border-b border-border/50 flex items-center justify-between">
          <span class="text-[9px] font-bold text-text uppercase tracking-wider">{{ t('channelStrip.modules.dynamics') }}</span>
        </div>
        <div class="flex flex-col gap-1.5 p-1.5">
          <label class="flex items-center gap-1 text-[9px] text-text-dim">
            <span class="w-8 truncate">{{ t('channelStrip.params.thresh') }}</span>
            <input v-model.number="compThreshold" type="range" min="-60" max="0" step="1" class="flex-1 min-w-0 h-1 bg-panel-2 rounded-full appearance-none accent-accent1" />
            <span class="w-4 text-right tabular-nums text-[8px]">{{ compThreshold }}</span>
          </label>
          <label class="flex items-center gap-1 text-[9px] text-text-dim">
            <span class="w-8 truncate">{{ t('channelStrip.params.ratio') }}</span>
            <input v-model.number="compRatio" type="range" min="1" max="20" step="0.5" class="flex-1 min-w-0 h-1 bg-panel-2 rounded-full appearance-none accent-accent1" />
            <span class="w-4 text-right tabular-nums text-[8px]">{{ compRatio }}</span>
          </label>
        </div>
      </div>

      <!-- Filter Module -->
      <div class="flex flex-col rounded-lg border border-border/50 bg-panel/30 overflow-hidden shrink-0 shadow-inner w-28" :class="!filterEnabled ? 'opacity-60' : ''">
        <div class="bg-panel-2/50 px-2 py-0.5 border-b border-border/50 flex items-center justify-between gap-1">
          <label class="flex items-center gap-1 cursor-pointer">
            <input v-model="filterEnabled" type="checkbox" class="accent-accent1 w-2.5 h-2.5" />
            <span class="text-[9px] font-bold text-text uppercase tracking-wider">{{ t('channelStrip.modules.filter') }}</span>
          </label>
          <select v-if="filterEnabled" v-model="filterType" class="rounded bg-panel px-0.5 py-0 text-[8px] text-text border border-border/50 cursor-pointer">
            <option value="lowpass">{{ t('channelStrip.lowpass') }}</option>
            <option value="highpass">{{ t('channelStrip.highpass') }}</option>
          </select>
        </div>
        <div class="flex flex-col gap-1.5 p-1.5 relative">
          <div v-if="!filterEnabled" class="absolute inset-0 bg-panel-2/40 z-10"></div>
          <label class="flex items-center gap-1 text-[9px] text-text-dim">
            <span class="w-6 truncate">{{ t('channelStrip.params.freq') }}</span>
            <input v-model.number="filterFreq" type="range" min="20" max="22000" step="1" class="flex-1 min-w-0 h-1 bg-panel-2 rounded-full appearance-none accent-accent1" />
            <span class="w-6 text-right tabular-nums text-[8px]">{{ filterFreq >= 1000 ? (filterFreq/1000).toFixed(1) + 'k' : filterFreq }}</span>
          </label>
          <label class="flex items-center gap-1 text-[9px] text-text-dim">
            <span class="w-6 truncate">{{ t('channelStrip.params.res') }}</span>
            <input v-model.number="filterRes" type="range" min="0.1" max="20" step="0.1" class="flex-1 min-w-0 h-1 bg-panel-2 rounded-full appearance-none accent-accent1" />
            <span class="w-6 text-right tabular-nums text-[8px]">{{ filterRes.toFixed(1) }}</span>
          </label>
        </div>
      </div>

      <!-- Chorus Module -->
      <div class="flex flex-col rounded-lg border border-border/50 bg-panel/30 overflow-hidden shrink-0 shadow-inner w-28" :class="!chorusEnabled ? 'opacity-60' : ''">
        <div class="bg-panel-2/50 px-2 py-0.5 border-b border-border/50 flex items-center justify-between">
          <label class="flex items-center gap-1 cursor-pointer">
            <input v-model="chorusEnabled" type="checkbox" class="accent-accent1 w-2.5 h-2.5" />
            <span class="text-[9px] font-bold text-text uppercase tracking-wider">{{ t('channelStrip.modules.chorus') }}</span>
          </label>
        </div>
        <div class="flex flex-col gap-1.5 p-1.5 relative">
          <div v-if="!chorusEnabled" class="absolute inset-0 bg-panel-2/40 z-10"></div>
          <label class="flex items-center gap-1 text-[9px] text-text-dim">
            <span class="w-7 truncate">{{ t('channelStrip.params.rate') }}</span>
            <input v-model.number="chorusRate" type="range" min="0.1" max="5" step="0.1" class="flex-1 min-w-0 h-1 bg-panel-2 rounded-full appearance-none accent-accent1" />
            <span class="w-5 text-right tabular-nums text-[8px]">{{ chorusRate.toFixed(1) }}</span>
          </label>
          <label class="flex items-center gap-1 text-[9px] text-text-dim">
            <span class="w-7 truncate">{{ t('channelStrip.params.depth') }}</span>
            <input v-model.number="chorusDepth" type="range" min="0.001" max="0.01" step="0.001" class="flex-1 min-w-0 h-1 bg-panel-2 rounded-full appearance-none accent-accent1" />
            <span class="w-5 text-right tabular-nums text-[8px]">{{ (chorusDepth * 1000).toFixed(0) }}</span>
          </label>
          <label class="flex items-center gap-1 text-[9px] text-text-dim">
            <span class="w-7 truncate">{{ t('channelStrip.params.mix') }}</span>
            <input v-model.number="chorusMix" type="range" min="0" max="1" step="0.01" class="flex-1 min-w-0 h-1 bg-panel-2 rounded-full appearance-none accent-accent1" />
            <span class="w-5 text-right tabular-nums text-[8px]">{{ Math.round(chorusMix * 100) }}%</span>
          </label>
        </div>
      </div>
      
      <!-- Delay Module -->
      <div class="flex flex-col rounded-lg border border-border/50 bg-panel/30 overflow-hidden shrink-0 shadow-inner w-28" :class="!delayEnabled ? 'opacity-60' : ''">
        <div class="bg-panel-2/50 px-2 py-0.5 border-b border-border/50 flex items-center justify-between">
          <label class="flex items-center gap-1 cursor-pointer">
            <input v-model="delayEnabled" type="checkbox" class="accent-accent1 w-2.5 h-2.5" />
            <span class="text-[9px] font-bold text-text uppercase tracking-wider">{{ t('channelStrip.modules.delay') }}</span>
          </label>
        </div>
        <div class="flex flex-col gap-1.5 p-1.5 relative">
          <div v-if="!delayEnabled" class="absolute inset-0 bg-panel-2/40 z-10"></div>
          <label class="flex items-center gap-1 text-[9px] text-text-dim">
            <span class="w-6 truncate">{{ t('channelStrip.params.time') }}</span>
            <input v-model.number="delayTime" type="range" min="0.01" max="2" step="0.01" class="flex-1 min-w-0 h-1 bg-panel-2 rounded-full appearance-none accent-accent1" />
            <span class="w-6 text-right tabular-nums text-[8px]">{{ delayTime.toFixed(2) }}</span>
          </label>
          <label class="flex items-center gap-1 text-[9px] text-text-dim">
            <span class="w-6 truncate">{{ t('channelStrip.params.fdbk') }}</span>
            <input v-model.number="delayFeedback" type="range" min="0" max="0.95" step="0.01" class="flex-1 min-w-0 h-1 bg-panel-2 rounded-full appearance-none accent-accent1" />
            <span class="w-6 text-right tabular-nums text-[8px]">{{ Math.round(delayFeedback * 100) }}%</span>
          </label>
          <label class="flex items-center gap-1 text-[9px] text-text-dim">
            <span class="w-6 truncate">{{ t('channelStrip.params.mix') }}</span>
            <input v-model.number="delayMix" type="range" min="0" max="1" step="0.01" class="flex-1 min-w-0 h-1 bg-panel-2 rounded-full appearance-none accent-accent1" />
            <span class="w-6 text-right tabular-nums text-[8px]">{{ Math.round(delayMix * 100) }}%</span>
          </label>
        </div>
      </div>
      
      <!-- Reverb Module -->
      <div class="flex flex-col rounded-lg border border-border/50 bg-panel/30 overflow-hidden shrink-0 shadow-inner w-28">
        <div class="bg-panel-2/50 px-2 py-0.5 border-b border-border/50 flex items-center justify-between">
          <span class="text-[9px] font-bold text-text uppercase tracking-wider">{{ t('channelStrip.modules.reverb') }}</span>
        </div>
        <div class="flex flex-col gap-1.5 p-1.5">
          <label class="flex items-center gap-1 text-[9px] text-text-dim">
            <span class="w-6 truncate">{{ t('channelStrip.params.mix') }}</span>
            <input v-model.number="reverbMix" type="range" min="0" max="1" step="0.01" class="flex-1 min-w-0 h-1 bg-panel-2 rounded-full appearance-none accent-accent1" />
            <span class="w-6 text-right tabular-nums text-[8px]">{{ Math.round(reverbMix * 100) }}%</span>
          </label>
        </div>
      </div>

      <!-- Distortion Module -->
      <div class="flex flex-col rounded-lg border border-border/50 bg-panel/30 overflow-hidden shrink-0 shadow-inner w-28" :class="!distEnabled ? 'opacity-60' : ''">
        <div class="bg-panel-2/50 px-2 py-0.5 border-b border-border/50 flex items-center justify-between">
          <label class="flex items-center gap-1 cursor-pointer">
            <input v-model="distEnabled" type="checkbox" class="accent-accent1 w-2.5 h-2.5" />
            <span class="text-[9px] font-bold text-text uppercase tracking-wider">{{ t('channelStrip.modules.distort') }}</span>
          </label>
        </div>
        <div class="flex flex-col gap-1.5 p-1.5 relative">
          <div v-if="!distEnabled" class="absolute inset-0 bg-panel-2/40 z-10"></div>
          <label class="flex items-center gap-1 text-[9px] text-text-dim">
            <span class="w-7 truncate">{{ t('channelStrip.params.drive') }}</span>
            <input v-model.number="distAmount" type="range" min="0" max="1" step="0.01" class="flex-1 min-w-0 h-1 bg-panel-2 rounded-full appearance-none accent-accent1" />
            <span class="w-5 text-right tabular-nums text-[8px]">{{ Math.round(distAmount * 100) }}%</span>
          </label>
          <label class="flex items-center gap-1 text-[9px] text-text-dim">
            <span class="w-7 truncate">{{ t('channelStrip.params.mix') }}</span>
            <input v-model.number="distMix" type="range" min="0" max="1" step="0.01" class="flex-1 min-w-0 h-1 bg-panel-2 rounded-full appearance-none accent-accent1" />
            <span class="w-5 text-right tabular-nums text-[8px]">{{ Math.round(distMix * 100) }}%</span>
          </label>
        </div>
      </div>

      <!-- Bitcrusher Module -->
      <div class="flex flex-col rounded-lg border border-border/50 bg-panel/30 overflow-hidden shrink-0 shadow-inner w-28" :class="!bcEnabled ? 'opacity-60' : ''">
        <div class="bg-panel-2/50 px-2 py-0.5 border-b border-border/50 flex items-center justify-between">
          <label class="flex items-center gap-1 cursor-pointer">
            <input v-model="bcEnabled" type="checkbox" class="accent-accent1 w-2.5 h-2.5" />
            <span class="text-[9px] font-bold text-text uppercase tracking-wider">{{ t('channelStrip.modules.bitcrush') }}</span>
          </label>
        </div>
        <div class="flex flex-col gap-1.5 p-1.5 relative">
          <div v-if="!bcEnabled" class="absolute inset-0 bg-panel-2/40 z-10"></div>
          <label class="flex items-center gap-1 text-[9px] text-text-dim">
            <span class="w-6 truncate">{{ t('channelStrip.params.bits') }}</span>
            <input v-model.number="bcBits" type="range" min="2" max="16" step="1" class="flex-1 min-w-0 h-1 bg-panel-2 rounded-full appearance-none accent-accent1" />
            <span class="w-6 text-right tabular-nums text-[8px]">{{ bcBits }}</span>
          </label>
          <label class="flex items-center gap-1 text-[9px] text-text-dim">
            <span class="w-6 truncate">{{ t('channelStrip.params.mix') }}</span>
            <input v-model.number="bcMix" type="range" min="0" max="1" step="0.01" class="flex-1 min-w-0 h-1 bg-panel-2 rounded-full appearance-none accent-accent1" />
            <span class="w-6 text-right tabular-nums text-[8px]">{{ Math.round(bcMix * 100) }}%</span>
          </label>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-dim);
}
</style>
