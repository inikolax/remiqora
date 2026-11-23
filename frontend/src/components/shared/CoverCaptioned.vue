<script setup lang="ts">
// A track's cover with its caption drawn over it live (SVG from the same draw steps the baked JPEG is made of).
// No caption, no cover or covers off: the plain CoverThumb. While the cover and the fonts load, the clean picture.
// The size and rounding come from the class the parent gives; meant for big covers - a caption at 48 px is mush.
import { computed, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCoversStore } from '../../stores/covers'
import { captionOps, loadCover } from '../../covers/caption/bake'
import type { CoverSource } from '../../covers/caption/bake'
import { ensureFonts, fontsVersion } from '../../covers/caption/fonts'
import { toSvg } from '../../covers/caption/render'
import type { CaptionText, CoverCaption } from '../../covers/caption/types'
import CoverThumb from './CoverThumb.vue'

const props = withDefaults(defineProps<{
  trackId: number | null | undefined
  /** The track's title, for the alt text. */
  title: string
  /** The caption to draw (a draft or the saved one); null: the clean cover. */
  caption: CoverCaption | null
  /** The texts an empty caption field stands for. */
  defaults: CaptionText
  placeholder?: boolean
  /** No alt text: a mini preview inside a labelled button. */
  decorative?: boolean
}>(), { placeholder: false, decorative: false })

const { t } = useI18n()
const covers = useCoversStore()
const idp = `c${useId().replace(/[^a-zA-Z0-9]/g, '')}`
const url = computed(() => covers.urlFor(props.trackId))
const busy = computed(() => !!covers.busyFor(props.trackId))

const src = ref<CoverSource | null>(null)
const srcUrl = ref<string | null>(null)
const fontsOk = ref(false)
watch(url, async (u) => {
  if (!u) { src.value = null; srcUrl.value = null; return }
  if (u === srcUrl.value) return
  try {
    const s = await loadCover(u)
    if (u === url.value) { src.value = s; srcUrl.value = u }
  } catch {
    src.value = null
  }
}, { immediate: true })
watch(() => props.caption?.font, async (f) => {
  if (!f) return
  fontsOk.value = false
  await ensureFonts([f])
  if (props.caption?.font === f) fontsOk.value = true
}, { immediate: true })

const svg = computed(() => {
  void fontsVersion.value // re-measure once a face arrives
  const c = props.caption
  if (!c || !src.value || !srcUrl.value || srcUrl.value !== url.value || !fontsOk.value) return ''
  return toSvg(captionOps(src.value.A, c, props.defaults), srcUrl.value, idp, props.decorative ? '' : t('covers.alt', { title: props.title }))
})
</script>

<template>
  <CoverThumb v-if="!caption || !url" :track-id="trackId" :title="title" :placeholder="placeholder" full />
  <span v-else class="relative block shrink-0 overflow-hidden bg-panel-2">
    <!-- eslint-disable-next-line vue/no-v-html -- built from numbers and escaped text by render.ts -->
    <span v-if="svg" class="block h-full w-full" v-html="svg"></span>
    <img v-else :src="url" :alt="decorative ? '' : t('covers.alt', { title })" class="h-full w-full object-cover" decoding="async" draggable="false" />
    <span v-if="busy" class="absolute inset-0 animate-pulse bg-white/25 motion-reduce:animate-none" aria-hidden="true"></span>
  </span>
</template>
