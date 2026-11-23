<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDismiss } from '../../composables/useDismiss'
import { DOWNLOAD_FORMATS, downloadFormat, setDownloadFormat } from '../../composables/useTrackDownload'
import type { DownloadFormat } from '../../composables/useTrackDownload'
import DownloadIcon from '../../components/shared/icons/DownloadIcon.vue'

/**
 * Download as a split button: the main part downloads in the remembered format (and says which), the chevron opens a
 * menu of the three formats, each with a line on what it is for. Choosing one downloads and remembers it. `icon`
 * keeps the main part as an icon (a very narrow panel); its label then names the format for screen readers.
 */
defineProps<{ icon: boolean; yue2?: boolean }>()
const emit = defineEmits<{ download: [format: DownloadFormat] }>()
const { t } = useI18n()

const open = ref(false)
const alignEnd = ref(false)
const wrap = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const close = (): void => { open.value = false }
useDismiss(open, () => [wrap.value], close, { returnTo: () => trigger.value })

const label = (f: DownloadFormat): string => t('create.downloadAs', { format: f.toUpperCase() })

async function toggle(): Promise<void> {
  if (open.value) { close(); return }
  const r = trigger.value?.getBoundingClientRect()
  if (r) {
    const rtl = getComputedStyle(trigger.value!).direction === 'rtl'
    const room = rtl ? r.right : window.innerWidth - r.left
    alignEnd.value = room < 300
  }
  open.value = true
  await nextTick()
  const items = items_()
  ;(items.find((x) => x.getAttribute('aria-checked') === 'true') ?? items[0])?.focus()
}
const items_ = (): HTMLElement[] => [...(panel.value?.querySelectorAll<HTMLElement>('[role^=menuitem]') ?? [])]

function onKey(e: KeyboardEvent): void {
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return
  const items = items_()
  if (!items.length) return
  e.preventDefault()
  const i = items.indexOf(document.activeElement as HTMLElement)
  const to = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1
    : i === -1 ? 0 : (i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length
  items[to]?.focus()
}
/** The chevron also opens on ArrowDown, as a menu button does. */
function onTriggerKey(e: KeyboardEvent): void {
  if (e.key === 'ArrowDown' && !open.value) { e.preventDefault(); void toggle() }
}
function choose(f: DownloadFormat): void {
  setDownloadFormat(f)
  close()
  trigger.value?.focus()
  emit('download', f)
}

const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1'
const PART = `inline-flex h-9 items-center justify-center border border-border text-[13px] font-medium text-text hover:bg-panel-2 ${FOCUS}`
const ITEM = 'flex min-h-8 w-full items-start gap-2 rounded-md px-2 py-1.5 text-start text-xs text-text hover:bg-accent1/15 focus:bg-accent1/15 focus:outline-none'
</script>

<template>
  <div ref="wrap" class="relative inline-flex shrink-0">
    <button
      type="button" :class="[PART, 'gap-2 whitespace-nowrap rounded-s-lg', icon ? 'w-9' : 'px-3.5']"
      :aria-label="label(downloadFormat)" :title="icon ? label(downloadFormat) : undefined" @click="emit('download', downloadFormat)"
    >
      <DownloadIcon class="h-4 w-4 shrink-0" />
      <span :class="icon ? 'sr-only' : ''">{{ label(downloadFormat) }}</span>
    </button>
    <button
      ref="trigger" type="button" :class="[PART, '-ms-px w-7 rounded-e-lg']" aria-haspopup="menu" :aria-expanded="open"
      :aria-label="t('create.downloadFormat')" :title="t('create.downloadFormat')" @click="toggle" @keydown="onTriggerKey"
    >
      <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6.5l4 4 4-4" /></svg>
    </button>
    <div
      v-if="open" ref="panel" role="menu" :aria-label="t('create.downloadFormat')"
      class="absolute top-full z-30 mt-1 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-panel p-1.5 shadow-xl shadow-black/40"
      :class="alignEnd ? 'end-0' : 'start-0'" @keydown="onKey"
    >
      <button
        v-for="f in DOWNLOAD_FORMATS" :key="f" type="button" role="menuitemradio" :aria-checked="f === downloadFormat" :class="ITEM" @click="choose(f)"
      >
        <span class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden="true">
          <span v-if="f === downloadFormat" class="h-2 w-2 rounded-full bg-accent1-strong"></span>
        </span>
        <span class="min-w-0 flex-1">
          <span class="block text-[13px] font-medium">{{ f.toUpperCase() }}</span>
          <span class="block text-text-dim">{{ t(`create.formatHint.${f}`) }}</span>
        </span>
      </button>
      <p v-if="yue2" class="mt-1 border-t border-border/60 px-2 pb-0.5 pt-1.5 text-[11px] leading-snug text-text-dim" :title="t('libraryPage.yueLicenceHint')">{{ t('libraryPage.yueLicence') }}</p>
    </div>
  </div>
</template>
