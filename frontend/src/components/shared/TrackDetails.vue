<script setup lang="ts">
// The "text / parameters" block of a track card: the style as a row of tag pills and the lyrics as
// blocks, with the section tags ([Verse], [Chorus]...) set off as labels and performance marks
// ((whisper), (ad-lib)...) in an accent colour. Shared by the ACE-Step and YuE2 cards.
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ styleText?: string; lyrics?: string }>()
const { t } = useI18n()

// Tags: a comma-separated list of short items. A long free-text description (ACE-Step "Simple" mode)
// is not a tag list and is shown as a plain paragraph instead.
const tags = computed(() => {
  const parts = (props.styleText || '').split(',').map((s) => s.trim()).filter(Boolean)
  return parts.length >= 2 && parts.every((p) => p.length <= 40) ? parts : []
})

type Segment = { text: string; mark: boolean }
type Row = { kind: 'section'; text: string } | { kind: 'gap' } | { kind: 'line'; segments: Segment[] }

function segmentsOf(line: string): Segment[] {
  return line
    .split(/(\([^)]*\))/)
    .filter((s) => s !== '')
    .map((text) => ({ text, mark: /^\([^)]*\)$/.test(text) }))
}

const rows = computed<Row[]>(() => {
  const out: Row[] = []
  for (const raw of (props.lyrics || '').replace(/\r/g, '').split('\n')) {
    const line = raw.trimEnd()
    const section = /^\s*\[([^\]]+)\]\s*$/.exec(line)
    if (section) out.push({ kind: 'section', text: section[1] })
    else if (!line.trim()) {
      if (out.length && out[out.length - 1].kind !== 'gap') out.push({ kind: 'gap' })
    } else out.push({ kind: 'line', segments: segmentsOf(line.trim()) })
  }
  while (out.length && out[out.length - 1].kind === 'gap') out.pop()
  return out
})

const copied = ref<'style' | 'lyrics' | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined
async function copy(what: 'style' | 'lyrics') {
  try {
    await navigator.clipboard.writeText(what === 'style' ? props.styleText || '' : props.lyrics || '')
    copied.value = what
    clearTimeout(timer)
    timer = setTimeout(() => (copied.value = null), 1800)
  } catch {
    // clipboard not available (insecure context): nothing to confirm
  }
}
</script>

<template>
  <div class="space-y-4 rounded-lg border border-border/60 bg-panel-2 p-3 text-xs">
    <section v-if="styleText" class="space-y-2">
      <div class="flex items-center justify-between gap-2">
        <h4 class="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent1">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" /><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
          </svg>
          {{ t('trackDetails.style') }}
        </h4>
        <button type="button" class="text-[11px] text-text-dim hover:text-text" @click="copy('style')">
          {{ copied === 'style' ? t('trackDetails.copied') : t('trackDetails.copy') }}
        </button>
      </div>
      <ul v-if="tags.length" class="flex flex-wrap gap-1.5">
        <li v-for="(tag, i) in tags" :key="i" class="rounded-full border border-accent1/30 bg-accent1/10 px-2.5 py-0.5 text-[11px] text-text">
          {{ tag }}
        </li>
      </ul>
      <p v-else class="leading-relaxed text-text">{{ styleText }}</p>
    </section>

    <section v-if="rows.length" class="space-y-2">
      <div class="flex items-center justify-between gap-2">
        <h4 class="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent2">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
          </svg>
          {{ t('trackDetails.lyrics') }}
        </h4>
        <button type="button" class="text-[11px] text-text-dim hover:text-text" @click="copy('lyrics')">
          {{ copied === 'lyrics' ? t('trackDetails.copied') : t('trackDetails.copy') }}
        </button>
      </div>
      <div class="max-h-80 overflow-y-auto rounded-md border-l-2 border-accent2/40 bg-panel/60 py-2 pl-3 pr-2 leading-relaxed">
        <template v-for="(row, i) in rows" :key="i">
          <p v-if="row.kind === 'section'" class="mb-0.5 mt-2 first:mt-0">
            <span class="inline-block rounded bg-accent2/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent2">{{ row.text }}</span>
          </p>
          <div v-else-if="row.kind === 'gap'" class="h-1" aria-hidden="true"></div>
          <p v-else class="text-text">
            <template v-for="(seg, j) in row.segments" :key="j">
              <em v-if="seg.mark" class="not-italic text-accent1/90">{{ seg.text }}</em>
              <template v-else>{{ seg.text }}</template>
            </template>
          </p>
        </template>
      </div>
    </section>
  </div>
</template>
