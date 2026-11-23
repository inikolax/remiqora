<script setup lang="ts">
// The footer: who made it, the app's promise (generation runs on this computer) and the licenses,
// which the user otherwise never sees - the YuE2-3B weights are non-commercial, and the license of a
// generated track is the model's, not Remiqora's.
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useSettingsStore } from '../../stores/settings'
import HelpModal from './HelpModal.vue'

const { t } = useI18n()
const route = useRoute()
const year = new Date().getFullYear()
const settings = useSettingsStore()
const open = ref(false)
// under a wide page (route meta, see App.vue) the footer keeps that page's edges, not the narrow column's
const wide = computed(() => route.meta.wide === true)

interface LicenseRow {
  name: string
  license: string
  url: string
  note: string
  /** `name` is a message key, not a product name. */
  translated?: boolean
}

const rows: LicenseRow[] = [
  { name: 'Remiqora', license: 'MIT', url: 'https://github.com/inikolax/remiqora/blob/master/LICENSE', note: 'footer.remiqoraNote' },
  // the engines in the rail's order, then the models that help them, then the runtimes
  { name: 'YuE2-3B', license: 'CC BY-NC 4.0', url: 'https://creativecommons.org/licenses/by-nc/4.0/', note: 'footer.yueNote' },
  { name: 'ACE-Step 1.5', license: 'MIT', url: 'https://github.com/ace-step/ACE-Step-1.5', note: 'footer.aceNote' },
  { name: 'Stable Audio 3', license: 'Stability AI Community License', url: 'https://stability.ai/community-license-agreement', note: 'footer.sa3Note' },
  // licences as the model cards on Hugging Face give them (checked 2026-11-19)
  { name: 'SheetSage2', license: 'CC BY-NC 4.0', url: 'https://huggingface.co/audio-cpp/SheetSage2-GGUF', note: 'footer.sheetsageNote' },
  { name: 'MuScriptor', license: 'CC BY-NC 4.0', url: 'https://huggingface.co/audio-cpp/audio.cpp-gguf', note: 'footer.muscriptorNote' },
  { name: 'Z-Image Turbo', license: 'Apache-2.0', url: 'https://huggingface.co/Tongyi-MAI/Z-Image-Turbo', note: 'footer.zimageNote' },
  { name: 'Qwen3.5', license: 'Apache-2.0', url: 'https://huggingface.co/Qwen/Qwen3.5-2B', note: 'footer.qwenNote' },
  { name: 'audio.cpp', license: 'Apache-2.0', url: 'https://github.com/0xShug0/audio.cpp', note: 'footer.audiocppNote' },
  { name: 'stable-diffusion.cpp', license: 'MIT', url: 'https://github.com/leejet/stable-diffusion.cpp', note: 'footer.sdcppNote' },
  { name: 'Demucs', license: 'MIT', url: 'https://github.com/adefossez/demucs', note: 'footer.demucsNote' },
  { name: 'FFmpeg', license: 'GPL', url: 'https://ffmpeg.org/legal.html', note: 'footer.ffmpegNote' },
  { name: 'footer.fontsName', license: 'SIL OFL 1.1', url: 'https://openfontlicense.org/open-font-license-official-text/', note: 'footer.fontsNote', translated: true },
]
</script>

<template>
  <footer class="border-t border-border/60">
    <div class="mx-auto flex w-full flex-col items-center gap-3 px-4 py-5 text-xs text-text-dim sm:flex-row sm:gap-6 sm:px-6" :class="wide ? 'max-w-[1920px] 2xl:px-8' : 'max-w-7xl'">
      <div class="flex items-center gap-2">
        <span class="accent-gradient flex h-5 w-5 shrink-0 items-center justify-center rounded-md">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="white" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M7 19V5h5.5a3.75 3.75 0 0 1 0 7.5H7M12.5 12.5 17 19" />
          </svg>
        </span>
        <span><span class="font-medium text-text">Remiqora</span> · © {{ year }} {{ t('footer.author') }}</span>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:me-auto">
        <span class="flex items-center gap-1.5" :title="t('footer.localHint')">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3ZM9 12l2 2 4-4" />
          </svg>
          {{ t('footer.local') }}
        </span>
      </div>

      <button type="button" class="py-1.5 hover:text-text" :title="t('footer.artistEdit')" @click="settings.openDialog()">
        {{ t('footer.artist') }}: <span :class="settings.artist ? 'text-text' : 'text-text-dim'">{{ settings.artist || t('footer.artistUnset') }}</span> ✎
      </button>
      <!-- it opens a dialog, it goes nowhere: a button, not a link to "#" -->
      <button type="button" class="py-1.5 text-accent1-text hover:underline" aria-haspopup="dialog" @click="open = true">{{ t('footer.licenses') }}</button>
    </div>

    <HelpModal :open="open" :title="t('footer.licenses')" @close="open = false">
      <p>{{ t('footer.licensesIntro') }}</p>
      <table class="w-full border-collapse text-xs">
        <tbody class="align-top">
          <tr v-for="r in rows" :key="r.name" class="border-b border-border/60">
            <td class="w-1/3 py-2 pe-3 font-medium text-text">{{ r.translated ? t(r.name) : r.name }}</td>
            <td class="py-2">
              <a :href="r.url" target="_blank" rel="noopener" class="text-accent1-text hover:underline">{{ r.license }}</a>
              <span class="mt-1 block">{{ t(r.note) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <p>{{ t('footer.responsibility') }}</p>
    </HelpModal>
  </footer>
</template>
