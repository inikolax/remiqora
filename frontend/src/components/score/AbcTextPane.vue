<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useScoreEditor } from './useScoreEditor'
import ScoreIcon from './ScoreIcon.vue'

/**
 * The ABC text itself, for editing by hand: a textarea over a coloured copy of the same text (headers, voices,
 * chords, rests and lengths in their colours). Typing here is read into the notes after a pause; the notes do not
 * write back under the caret.
 */
/** `fill`: always open and as tall as its box (the workspace's bottom drawer, which has its own toggle). */
const props = withDefaults(defineProps<{ modelValue: string; defaultOpen?: boolean; fill?: boolean }>(), { defaultOpen: true, fill: false })
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const ed = useScoreEditor()
const { t } = useI18n()

const open = ref(props.fill || props.defaultOpen)
const pre = ref<HTMLPreElement | null>(null)
const area = ref<HTMLTextAreaElement | null>(null)

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
function hlLine(line: string): string {
  if (/^%/.test(line)) return `<span class="tk-com">${esc(line)}</span>`
  if (/^V:/.test(line)) return `<span class="tk-v">${esc(line)}</span>`
  if (/^[A-Za-z]:/.test(line)) return `<span class="tk-hk">${esc(line.slice(0, 2))}</span><span class="tk-h">${esc(line.slice(2))}</span>`
  return esc(line).replace(/("[^"]*")|(\|)|([zZx]\d*\/?\d*)|([\^_=]*[A-Ga-g][',]*)(\d*\/?\d*-?)/g, (_m, ch: string, bar: string, r: string, n: string, len: string) =>
    ch ? `<span class="tk-ch">${ch}</span>` : bar ? '<span class="tk-bar">|</span>' : r ? `<span class="tk-r">${r}</span>` : `<span class="tk-n">${n}</span>${len ? `<span class="tk-len">${len}</span>` : ''}`)
}
const html = computed(() => props.modelValue.split('\n').map(hlLine).join('\n') + '\n')

function onInput(e: Event): void {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
}
function syncScroll(): void {
  if (pre.value && area.value) { pre.value.scrollTop = area.value.scrollTop; pre.value.scrollLeft = area.value.scrollLeft }
}
const copied = ref(false)
async function copy(): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.modelValue)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch { /* no clipboard: the text can still be selected by hand */ }
}
function onFocus(): void { ed.ui.abcTyping = true }
function onBlur(): void {
  ed.ui.abcTyping = false
}
// the pane closing (or the view switching) with the caret in it fires no blur: the typing state goes with it
onBeforeUnmount(() => { ed.ui.abcTyping = false })
const warnText = computed(() => ed.warnings.value.map((w) =>
  t(`score.abc.warn.${w.code}`) + (w.count > 1 ? ` ×${w.count}` : '') + (w.bar != null ? ` · ${t('score.abc.bar', { n: w.bar + 1 })}` : '')))
defineExpose({ focus: () => { open.value = true; requestAnimationFrame(() => area.value?.focus()) } })
</script>

<template>
  <section class="se-box flex min-w-0 flex-col" :class="{ 'h-full min-h-0': fill }" :aria-label="t('score.abc.title')">
    <div class="flex items-center gap-2 px-3 py-2.5" :class="open ? 'border-b border-[#2a2a36]' : ''">
      <h4 v-if="fill" class="m-0 truncate text-[12.5px] font-semibold">{{ t('score.abc.title') }}</h4>
      <button v-else type="button" class="flex min-w-0 items-center gap-2 text-start" :aria-expanded="open" @click="open = !open">
        <ScoreIcon :name="open ? 'down' : 'right'" class="h-3.5 w-3.5 shrink-0 text-text-dim" />
        <h4 class="m-0 truncate text-[12.5px] font-semibold">{{ t('score.abc.title') }}</h4>
      </button>
      <span v-if="ed.ui.abcTyping" class="inline-flex shrink-0 items-center gap-1 text-[11px] text-text-dim">{{ t('score.abc.reading') }}</span>
      <span v-else-if="warnText.length" class="inline-flex shrink-0 items-center gap-1 text-[11px] text-[#facc15]" :title="warnText.join('\n')"><ScoreIcon name="warn" class="h-3 w-3" />{{ t('score.abc.warnings', { n: warnText.length }, warnText.length) }}</span>
      <span v-else class="inline-flex shrink-0 items-center gap-1 text-[11px] text-[#4ade80]"><ScoreIcon name="check" class="h-3 w-3" />{{ t('score.abc.synced') }}</span>
      <span class="flex-1"></span>
      <button type="button" class="se-btn h-6 shrink-0" :disabled="!modelValue" @click="copy"><ScoreIcon name="copy" />{{ copied ? t('score.abc.copied') : t('score.abc.copy') }}</button>
    </div>
    <template v-if="open">
      <ul v-if="warnText.length" class="space-y-0.5 border-b border-[#2a2a36] px-3 py-2 text-[11px] text-[#facc15]">
        <li v-for="(w, i) in warnText" :key="i">{{ w }}</li>
      </ul>
      <div class="se-abc relative min-h-0" :class="fill ? 'flex-1' : 'h-64'">
        <pre ref="pre" class="se-abc-layer pointer-events-none" aria-hidden="true" v-html="html"></pre>
        <textarea
          ref="area" class="se-abc-layer se-abc-input" spellcheck="false" autocomplete="off" wrap="off"
          :value="modelValue" :aria-label="t('score.abc.title')" :placeholder="t('score.abc.placeholder')"
          @input="onInput" @scroll="syncScroll" @focus="onFocus" @blur="onBlur"
        ></textarea>
      </div>
    </template>
  </section>
</template>

<style scoped>
.se-abc-layer{position:absolute;inset:0;margin:0;padding:8px 12px;font:11.5px/18px 'JetBrains Mono',ui-monospace,Consolas,monospace;white-space:pre;overflow:auto;tab-size:4;border:0;letter-spacing:0}
.se-abc-input{background:transparent;color:transparent;caret-color:#fff;resize:none;outline:none}
.se-abc-input::selection{background:rgba(168,85,247,.35);color:transparent}
.se-abc-input:focus-visible{box-shadow:inset 0 0 0 2px rgba(168,85,247,.5)}
.se-abc-input::placeholder{color:#6e6e80}
pre :deep(.tk-h){color:#a1a1b5}
pre :deep(.tk-hk){color:#c4b5fd}
pre :deep(.tk-com){color:#fbbf24;font-style:italic}
pre :deep(.tk-v){color:#5eead4}
pre :deep(.tk-ch){color:#f9a8d4}
pre :deep(.tk-r){color:#5b5b6e}
pre :deep(.tk-bar){color:#6b6b82}
pre :deep(.tk-n){color:#e4e4ec}
pre :deep(.tk-len){color:#a78bfa}
</style>
