<script setup lang="ts">
// A captioned cover drawn only once it scrolls near the screen: the studio's gallery has one of these for every
// layout, and each is a full layout pass plus an SVG. Once drawn it stays (it then follows its caption live).
import { onBeforeUnmount, onMounted, ref } from 'vue'
import CoverCaptioned from '../../components/shared/CoverCaptioned.vue'
import type { CaptionText, CoverCaption } from '../../covers/caption/types'

defineProps<{ trackId: number; title: string; caption: CoverCaption | null; defaults: CaptionText }>()
const box = ref<HTMLElement | null>(null)
const seen = ref(false)
let io: IntersectionObserver | null = null
onMounted(() => {
  if (typeof IntersectionObserver === 'undefined') { seen.value = true; return }
  io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { seen.value = true; io?.disconnect(); io = null }
  }, { rootMargin: '160px' })
  if (box.value) io.observe(box.value)
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <span ref="box" class="block overflow-hidden bg-panel-2">
    <CoverCaptioned v-if="seen" :track-id="trackId" :title="title" :caption="caption" :defaults="defaults" decorative class="h-full w-full" />
  </span>
</template>
