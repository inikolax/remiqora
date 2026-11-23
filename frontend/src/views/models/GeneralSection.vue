<script setup lang="ts">
// Models and settings, "General": what is not an engine's. The artist name (the footer's setting), whether a cover is
// made after a song (the covers store's preference), the download format (the Download buttons'), the interface
// language (the header's). Each one is the same setting as where it lives elsewhere, not a copy.
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '../../stores/settings'
import { useCoversStore } from '../../stores/covers'
import { DOWNLOAD_FORMATS, downloadFormat, setDownloadFormat } from '../../composables/useTrackDownload'
import { LOCALES, setLocale, type LocaleCode } from '../../i18n'
import GearIcon from '../../components/shared/icons/GearIcon.vue'

const { t, locale } = useI18n()
const settings = useSettingsStore()
const covers = useCoversStore()

// ---- the artist: typed here, saved on Save (or Enter); the footer shows the same name ----
const artist = ref(settings.artist)
watch(() => settings.artist, (a) => { artist.value = a })
const saved = ref(false)
const artistChanged = computed(() => artist.value.trim() !== settings.artist)
async function saveArtist() {
  if (!artistChanged.value) return
  await settings.saveArtist(artist.value.trim())
  saved.value = !settings.error
  setTimeout(() => { saved.value = false }, 2500)
}

// ---- a cover after the song: only where covers are on and their model is there ----
const coversAvailable = computed(() => covers.enabled && covers.modelInstalled)

// ---- the interface language ----
async function pickLocale(code: string) {
  const c = code as LocaleCode
  if (c === locale.value) return
  await setLocale(c)
  locale.value = c
}

const SWITCH = 'inline-flex h-7 shrink-0 items-center rounded-full px-0.5 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-accent1'
</script>

<template>
  <section class="min-w-0 overflow-hidden rounded-xl border border-border bg-panel">
    <div class="flex items-center gap-3 border-b border-border bg-panel-2/60 px-4 py-3">
      <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent1/15 text-accent1">
        <GearIcon class="h-[18px] w-[18px]" />
      </span>
      <h2 class="truncate text-base font-semibold text-text">{{ t('models.general.title') }}</h2>
    </div>

    <div class="divide-y divide-border px-4">
      <!-- the artist name -->
      <div class="grid gap-2 py-4 sm:grid-cols-[14rem_minmax(0,1fr)] sm:gap-6">
        <div>
          <label for="general-artist" class="text-sm font-medium text-text">{{ t('models.general.artist') }}</label>
          <p class="mt-0.5 text-xs leading-relaxed text-text-dim">{{ t('models.general.artistHint') }}</p>
        </div>
        <form class="flex flex-wrap items-center gap-2 self-start" @submit.prevent="saveArtist">
          <input
            id="general-artist" v-model="artist" type="text" maxlength="200" :placeholder="t('artistDialog.placeholder')"
            class="min-w-0 flex-1 rounded-lg border border-border bg-panel-2 px-2.5 py-1.5 text-sm text-text sm:max-w-sm"
          />
          <button
            type="submit" class="rounded-lg border border-border px-3 py-1.5 text-xs text-text hover:bg-panel-2 disabled:opacity-40"
            :disabled="!artistChanged || settings.saving"
          >{{ t('models.general.artistSave') }}</button>
          <span role="status" class="text-xs text-status-done">{{ saved ? t('models.general.artistSaved') : '' }}</span>
          <p v-if="settings.error" class="w-full text-xs text-status-failed" role="alert">{{ settings.error }}</p>
        </form>
      </div>

      <!-- a cover after the song -->
      <div class="grid gap-2 py-4 sm:grid-cols-[14rem_minmax(0,1fr)] sm:gap-6">
        <div>
          <p id="general-auto-cover" class="text-sm font-medium text-text">{{ t('models.general.autoCover') }}</p>
          <p class="mt-0.5 text-xs leading-relaxed text-text-dim">{{ t('models.general.autoCoverHint') }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-3 self-start">
          <button
            type="button" role="switch" :aria-checked="coversAvailable && covers.autoCover" aria-labelledby="general-auto-cover" :disabled="!coversAvailable"
            :class="SWITCH" @click="covers.setAutoCover(!covers.autoCover)"
          ><span class="relative block h-6 w-11 rounded-full transition-colors" :class="coversAvailable && covers.autoCover ? 'bg-accent1' : 'bg-slider-track/60'"><span class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[inset-inline-start] motion-reduce:transition-none" :class="coversAvailable && covers.autoCover ? 'start-[22px]' : 'start-0.5'"></span></span></button>
          <p v-if="!coversAvailable" class="text-xs text-text-dim">
            {{ t('models.general.autoCoverOff') }}
            <router-link :to="{ name: 'models', hash: '#covers' }" class="text-accent1-text hover:underline">{{ t('covers.title') }}</router-link>
          </p>
        </div>
      </div>

      <!-- the download format -->
      <div class="grid gap-2 py-4 sm:grid-cols-[14rem_minmax(0,1fr)] sm:gap-6">
        <div>
          <p id="general-format" class="text-sm font-medium text-text">{{ t('create.downloadFormat') }}</p>
          <p class="mt-0.5 text-xs leading-relaxed text-text-dim">{{ t('models.general.formatHint') }}</p>
        </div>
        <div v-roving class="grid gap-2 self-start sm:grid-cols-3" role="radiogroup" aria-labelledby="general-format">
          <button
            v-for="f in DOWNLOAD_FORMATS" :key="f" type="button" role="radio" :aria-checked="downloadFormat === f"
            class="rounded-lg border px-3 py-2 text-start transition-colors"
            :class="downloadFormat === f ? 'border-accent1/70 bg-accent1/10' : 'border-border hover:bg-panel-2'"
            @click="setDownloadFormat(f)"
          >
            <span class="block text-sm font-medium uppercase text-text">{{ f }}</span>
            <span class="mt-0.5 block text-xs leading-relaxed text-text-dim">{{ t(`create.formatHint.${f}`) }}</span>
          </button>
        </div>
      </div>

      <!-- the interface language -->
      <div class="grid gap-2 py-4 sm:grid-cols-[14rem_minmax(0,1fr)] sm:gap-6">
        <div>
          <label for="general-language" class="text-sm font-medium text-text">{{ t('header.language') }}</label>
          <p class="mt-0.5 text-xs leading-relaxed text-text-dim">{{ t('models.general.languageHint') }}</p>
        </div>
        <select
          id="general-language" :value="locale" class="self-start rounded-lg border border-border bg-panel-2 px-2.5 py-1.5 text-sm text-text sm:max-w-xs"
          @change="pickLocale(($event.target as HTMLSelectElement).value)"
        >
          <option v-for="l in LOCALES" :key="l.code" :value="l.code">{{ l.name }}</option>
        </select>
      </div>
    </div>
  </section>
</template>
