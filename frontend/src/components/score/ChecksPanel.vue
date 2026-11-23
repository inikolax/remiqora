<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Check } from '../../audio/score'
import { useScoreEditor } from './useScoreEditor'
import ScoreIcon from './ScoreIcon.vue'
import { checkText } from './checkText'

/** "Check for YuE2": what may hurt the song, with a fix where one is obvious and a way to see where it is. */
/** `collapsible`: one line (counts and the first remark) that opens the list; the workspace's bottom bar. */
const props = withDefaults(defineProps<{ collapsible?: boolean }>(), { collapsible: false })
const ed = useScoreEditor()
const { t } = useI18n()
const open = ref(!props.collapsible)

const text = (c: Check): { title: string; sub: string } => checkText(c, ed.score.value.key, t)
const rows = computed(() => ed.checks.value.map((c) => ({ c, ...text(c) })))
const warnCount = computed(() => ed.checks.value.filter((c) => c.level === 'warn').length)
const okCount = computed(() => ed.checks.value.filter((c) => c.level === 'ok').length)
const firstRemark = computed(() => rows.value.filter((r) => r.c.level === 'warn').map((r) => r.title).join(', '))

function fix(c: Check): void {
  if (c.fix) ed.commit(c.fix())
}
function show(c: Check): void {
  if (c.noteIds?.length) {
    ed.select(c.noteIds)
    const first = ed.selectedNotes.value[0]
    if (first) { ed.ui.activeVoice = first.voice; ed.scrollToTick(first.note.start) }
  } else if (c.bars?.length) {
    ed.scrollToTick(c.bars[0] * ed.tpb.value)
    ed.ui.cursorTick = c.bars[0] * ed.tpb.value
  }
}
</script>

<template>
  <section class="se-box px-3.5 py-3" :aria-label="t('score.checks.title')">
    <button v-if="props.collapsible" type="button" class="flex w-full min-w-0 items-center gap-2 text-start" :aria-expanded="open" @click="open = !open">
      <ScoreIcon :name="open ? 'down' : 'right'" class="h-3.5 w-3.5 shrink-0 text-text-dim" />
      <h4 class="m-0 shrink-0 text-[12.5px] font-semibold">{{ t('score.checks.title') }}</h4>
      <span v-if="warnCount" class="shrink-0 rounded-md bg-[#eab308]/15 px-1.5 text-[11px] font-semibold text-[#facc15]">! {{ warnCount }}</span>
      <span v-if="okCount" class="shrink-0 rounded-md bg-[#22c55e]/15 px-1.5 text-[11px] font-semibold text-[#4ade80]">✓ {{ okCount }}</span>
      <span class="min-w-0 truncate text-[11.5px] text-[#8a8a9c]">{{ firstRemark || t('score.checks.allOk') }}</span>
    </button>
    <h4 v-else class="m-0 flex items-center gap-2 text-[12.5px] font-semibold">
      <ScoreIcon name="wand" class="h-3.5 w-3.5 text-accent" />{{ t('score.checks.title') }}
      <small class="font-medium text-[#8a8a9c]">{{ warnCount ? t('score.checks.warnCount', { n: warnCount }, warnCount) : t('score.checks.allOk') }}</small>
    </h4>
    <ul v-show="open" class="mt-1.5" :class="props.collapsible ? 'max-h-[45vh] overflow-y-auto' : ''" aria-live="polite">
      <li v-for="r in rows" :key="r.c.id" class="flex items-start gap-2.5 border-t border-[#2a2a36] py-2 text-[12px] leading-snug first:border-t-0">
        <span
          class="mt-px grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full"
          :class="r.c.level === 'ok' ? 'bg-[#22c55e]/15 text-[#4ade80]' : r.c.level === 'warn' ? 'bg-[#eab308]/15 text-[#facc15]' : 'bg-[#38bdf8]/15 text-[#7dd3fc]'"
          :aria-label="t(`score.checks.level.${r.c.level}`)"
        ><ScoreIcon :name="r.c.level === 'ok' ? 'check' : r.c.level === 'warn' ? 'warn' : 'info'" class="h-3 w-3" /></span>
        <span class="min-w-0 flex-1">{{ r.title }}<small v-if="r.sub" class="block text-[11px] text-[#8a8a9c]">{{ r.sub }}</small></span>
        <span v-if="r.c.level !== 'ok'" class="flex shrink-0 gap-1">
          <button v-if="r.c.noteIds?.length || r.c.bars?.length" type="button" class="h-6 rounded-md border border-border px-2 text-[11.5px] text-text-dim hover:text-text" @click="show(r.c)">{{ t('score.checks.show') }}</button>
          <button v-if="r.c.fix" type="button" class="h-6 rounded-md border border-accent1/50 px-2 text-[11.5px] text-accent hover:bg-accent1/10" @click="fix(r.c)">{{ t('score.checks.fix') }}</button>
        </span>
      </li>
    </ul>
  </section>
</template>
