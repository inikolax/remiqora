<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ParamRow from './ParamRow.vue'
import { rowChanged } from './types'
import type { ParamGroupSpec } from './types'

/**
 * The groups of an engine's parameters: a card a group, its simple choice as quick presets in the heading, a row a
 * parameter. One column with a row of group chips to jump by (the Tuning tab), or two columns (the console).
 */
const props = defineProps<{ groups: ParamGroupSpec[]; columns?: 1 | 2 }>()
const { t } = useI18n()

const root = ref<HTMLElement | null>(null)
const cols = computed(() => (props.columns === 2 ? [props.groups.filter((g) => (g.column ?? 0) === 0), props.groups.filter((g) => g.column === 1)] : [props.groups]))
const groupChanged = (g: ParamGroupSpec): boolean => g.rows.some(rowChanged)
function jump(id: string): void {
  // no glide for those who asked the system for less motion
  const smooth = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  root.value?.querySelector(`[data-group="${id}"]`)?.scrollIntoView({ block: 'nearest', behavior: smooth ? 'smooth' : 'auto' })
}
</script>

<template>
  <div ref="root" class="space-y-4">
    <div v-if="columns !== 2 && groups.length > 2" class="flex flex-wrap gap-2">
      <button
        v-for="g in groups" :key="g.id" type="button"
        class="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-text-dim hover:border-accent1/50 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent1"
        @click="jump(g.id)"
      ><span v-if="groupChanged(g)" class="h-1.5 w-1.5 rounded-full bg-accent2" aria-hidden="true"></span>{{ g.title }}<span v-if="groupChanged(g)" class="sr-only">({{ t('params.changed') }})</span></button>
    </div>
    <div :class="columns === 2 ? 'grid gap-3 md:grid-cols-2' : ''">
      <div v-for="(col, ci) in cols" :key="ci" class="space-y-3">
        <section v-for="g in col" :key="g.id" :data-group="g.id" class="scroll-mt-2 rounded-lg border border-border bg-panel-2/40" :aria-label="g.title">
          <header class="flex flex-wrap items-center gap-x-2 gap-y-1.5 px-3 pb-2 pt-3">
            <h4 class="text-[13px] font-semibold text-text">{{ g.title }}</h4>
            <span class="text-xs text-text-dim">{{ g.sub }}</span>
            <div v-if="g.quick" v-roving class="ms-auto flex flex-wrap gap-1" role="radiogroup" :aria-label="t('params.quick', { group: g.title })">
              <button
                v-for="o in g.quick.options" :key="o.id" type="button" role="radio" :aria-checked="g.quick.active === o.id"
                class="min-h-6 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent1"
                :class="g.quick.active === o.id ? 'border-transparent bg-accent1/20 font-medium text-text' : 'border-border text-text-dim hover:text-text'"
                @click="g.quick.pick(o.id)"
              >{{ o.label }}</button>
            </div>
          </header>
          <ParamRow v-for="r in g.rows" :key="r.id" :row="r"><slot :name="r.id" /></ParamRow>
        </section>
      </div>
    </div>
  </div>
</template>
