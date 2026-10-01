<script setup lang="ts">
// The footer: who made it, the app's promise (generation runs on this computer) and the licenses,
// which the user otherwise never sees - the YuE2-3B weights are non-commercial, and the license of a
// generated track is the model's, not Remiqora's.
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '../../stores/settings'
import HelpModal from './HelpModal.vue'

const { t } = useI18n()
const year = new Date().getFullYear()
const settings = useSettingsStore()
const open = ref(false)

interface LicenseRow {
  name: string
  license: string
  url: string
  note: string
}

const rows: LicenseRow[] = [
  { name: 'Remiqora', license: 'MIT', url: 'https://github.com/inikolax/remiqora/blob/master/LICENSE', note: 'footer.remiqoraNote' },
  { name: 'ACE-Step 1.5', license: 'MIT', url: 'https://github.com/ace-step/ACE-Step-1.5', note: 'footer.aceNote' },
  { name: 'YuE2-3B', license: 'CC BY-NC 4.0', url: 'https://creativecommons.org/licenses/by-nc/4.0/', note: 'footer.yueNote' },
  { name: 'audio.cpp', license: 'Apache-2.0', url: 'https://github.com/0xShug0/audio.cpp', note: 'footer.audiocppNote' },
  { name: 'Demucs', license: 'MIT', url: 'https://github.com/adefossez/demucs', note: 'footer.demucsNote' },
  { name: 'FFmpeg', license: 'GPL', url: 'https://ffmpeg.org/legal.html', note: 'footer.ffmpegNote' },
]
</script>

<template>
  <footer class="border-t border-border/60">
    <div class="mx-auto flex w-full max-w-7xl flex-col items-center gap-3 px-4 py-5 text-xs text-text-dim sm:flex-row sm:gap-6 sm:px-6">
      <div class="flex items-center gap-2">
        <span class="accent-gradient flex h-5 w-5 shrink-0 items-center justify-center rounded-md">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="white" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M7 19V5h5.5a3.75 3.75 0 0 1 0 7.5H7M12.5 12.5 17 19" />
          </svg>
        </span>
        <span><span class="font-medium text-text">Remiqora</span> · © {{ year }} {{ t('footer.author') }}</span>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:mr-auto">
        <span class="flex items-center gap-1.5" :title="t('footer.localHint')">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3ZM9 12l2 2 4-4" />
          </svg>
          {{ t('footer.local') }}
        </span>
      </div>

      <button type="button" class="hover:text-text" :title="t('footer.artistEdit')" @click="settings.openDialog()">
        {{ t('footer.artist') }}: <span :class="settings.artist ? 'text-text' : 'text-text-dim'">{{ settings.artist || t('footer.artistUnset') }}</span> ✎
      </button>
      <a href="#" class="text-accent1 hover:underline" @click.prevent="open = true">{{ t('footer.licenses') }}</a>
    </div>

    <HelpModal :open="open" :title="t('footer.licenses')" @close="open = false">
      <p>{{ t('footer.licensesIntro') }}</p>
      <table class="w-full border-collapse text-xs">
        <tbody class="align-top">
          <tr v-for="r in rows" :key="r.name" class="border-b border-border/60">
            <td class="w-1/3 py-2 pr-3 font-medium text-text">{{ r.name }}</td>
            <td class="py-2">
              <a :href="r.url" target="_blank" rel="noopener" class="text-accent1 hover:underline">{{ r.license }}</a>
              <span class="mt-1 block">{{ t(r.note) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <p>{{ t('footer.responsibility') }}</p>
    </HelpModal>
  </footer>
</template>
