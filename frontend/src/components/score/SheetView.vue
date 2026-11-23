<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { pianoKey } from '../../audio/pianoSynth'

/** The score as sheet music (abcjs, loaded on first use), dark like the app or on light paper; a click plays a note. */
const props = withDefaults(defineProps<{ abc: string; large?: boolean }>(), { large: false })
const { t, locale } = useI18n()

const THEME_KEY = 'remiqora_abc_sheet_theme'
const readTheme = (): 'dark' | 'paper' => { try { return localStorage.getItem(THEME_KEY) === 'paper' ? 'paper' : 'dark' } catch { return 'dark' } }
const theme = ref<'dark' | 'paper'>(readTheme())
function toggleTheme(): void {
  theme.value = theme.value === 'dark' ? 'paper' : 'dark'
  try { localStorage.setItem(THEME_KEY, theme.value) } catch { /* private window */ }
  void render()
}
const sheet = ref<HTMLDivElement | null>(null)
const error = ref('')
let abcjs: typeof import('abcjs') | null = null
let timer: ReturnType<typeof setTimeout> | null = null
let ro: ResizeObserver | null = null

/**
 * The voices' names on the staff in the reader's language: the stored ABC names them for YuE2 (name="Vocal Melody",
 * snm="Inst."), and only this drawing of it says "Voice" and "Instrument". The ABC itself is never changed.
 */
function forDisplay(src: string): string {
  const clean = (s: string): string => s.replace(/"/g, "'")
  const names: Record<'vocal' | 'ins', [string, string]> = {
    vocal: [clean(t('score.lane.vocal')), clean(t('score.lane.vocal'))],
    ins: [clean(t('score.lane.ins')), clean(t('score.lane.insShort'))],
  }
  return src.replace(/^V:[ \t]*(\S+)(.*)$/gm, (line, id: string, rest: string) => {
    const v = /^vocal/i.test(id) ? 'vocal' : /^ins/i.test(id) ? 'ins' : null
    if (!v) return line
    const [full, short] = names[v]
    return `V: ${id}${rest.replace(/(\s)(name|nm)="[^"]*"/, `$1$2="${full}"`).replace(/(\s)(snm|subname)="[^"]*"/, `$1$2="${short}"`)}`
  })
}

async function render(): Promise<void> {
  const el = sheet.value
  if (!el) return
  if (!abcjs) abcjs = (await import('abcjs')).default as unknown as typeof import('abcjs')
  const width = Math.max(320, el.clientWidth - 24)
  try {
    error.value = ''
    // a blank line ends a tune in ABC
    abcjs.renderAbc(el, forDisplay(props.abc || '').replace(/\r/g, '').replace(/\n[ \t]*(?=\n)/g, ''), {
      add_classes: true,
      foregroundColor: theme.value === 'dark' ? '#e2e8f0' : '#000000',
      selectionColor: '#ec4899',
      staffwidth: width,
      paddingtop: 8, paddingbottom: 8, paddingleft: 4, paddingright: 4,
      wrap: { preferredMeasuresPerLine: props.large ? 4 : 3, minSpacing: 1.6, maxSpacing: 2.8 },
      clickListener: (elem) => {
        const pitches = (elem as unknown as { midiPitches?: { pitch: number }[] }).midiPitches
        for (const p of pitches ?? []) pianoKey(p.pitch)
      },
    })
  } catch {
    error.value = t('score.sheet.failed')
  }
}
function schedule(): void {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => void render(), 150)
}
watch(() => props.abc, schedule)
watch(locale, schedule)
onMounted(() => {
  void nextTick(render)
  if (sheet.value) { ro = new ResizeObserver(schedule); ro.observe(sheet.value) }
})
onBeforeUnmount(() => { ro?.disconnect(); if (timer) clearTimeout(timer) })
</script>

<template>
  <div class="relative overflow-y-auto rounded-[10px] border border-border p-3" :class="[large ? 'min-h-[200px] flex-1' : 'h-[400px]', theme === 'dark' ? 'bg-[#14141b] text-slate-200' : 'bg-[#f5efe4] text-black']">
    <button type="button" class="absolute end-2 top-2 z-10 rounded-md border px-2 py-0.5 text-[11px]" :class="theme === 'dark' ? 'border-slate-600 text-slate-300 hover:text-white' : 'border-slate-400 text-slate-600 hover:text-black'" @click="toggleTheme">{{ theme === 'dark' ? t('score.sheet.paper') : t('score.sheet.dark') }}</button>
    <div ref="sheet" dir="ltr"></div>
    <p v-if="!abc.trim()" class="py-6 text-center text-xs text-slate-500">{{ t('score.sheet.empty') }}</p>
    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
  </div>
</template>
