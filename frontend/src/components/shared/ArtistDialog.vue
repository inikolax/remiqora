<script setup lang="ts">
// The one window where the artist name is entered. It opens by itself the first time a track is
// downloaded without a name, and from the footer afterwards; the name is kept on the server and
// used for every download from then on.
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDialogA11y } from '../../composables/useDialogA11y'
import { useSettingsStore } from '../../stores/settings'

const { t } = useI18n()
const settings = useSettingsStore()
const dialogEl = ref<HTMLElement | null>(null)
const draft = ref('')

const { onKeydown } = useDialogA11y(dialogEl, () => settings.dialogOpen, () => settings.closeDialog())

watch(
  () => settings.dialogOpen,
  (open) => {
    if (open) draft.value = settings.artist
  },
)

const canSave = computed(() => draft.value.trim().length > 0 && !settings.saving)

function submit() {
  if (canSave.value) void settings.saveArtist(draft.value)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="settings.dialogOpen" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:items-center" @mousedown.self="settings.closeDialog()">
      <form
        ref="dialogEl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="artist-dialog-title"
        class="my-8 w-full max-w-md space-y-4 rounded-xl border border-border bg-panel p-5 shadow-2xl"
        @keydown="onKeydown"
        @submit.prevent="submit"
      >
        <h3 id="artist-dialog-title" class="text-lg font-semibold text-text">{{ t('artistDialog.title') }}</h3>
        <label class="block space-y-1.5">
          <span class="text-sm text-text-dim">{{ t('artistDialog.label') }}</span>
          <input
            v-model="draft"
            type="text"
            maxlength="120"
            autocomplete="off"
            :placeholder="t('artistDialog.placeholder')"
            class="w-full rounded-lg border border-border bg-panel-2 px-3 py-2 text-sm text-text focus:border-accent1/60 focus:outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-accent1"
          />
        </label>
        <p class="text-xs leading-relaxed text-text-dim">{{ t('artistDialog.hint') }}</p>
        <p v-if="settings.error" class="text-xs text-status-failed">{{ settings.error }}</p>
        <div class="flex justify-end gap-2">
          <button type="button" class="rounded-lg border border-border px-3 py-2 text-sm text-text-dim hover:text-text" @click="settings.closeDialog()">
            {{ t('artistDialog.skip') }}
          </button>
          <button
            type="submit"
            :disabled="!canSave"
            class="accent-gradient rounded-lg px-4 py-2 text-sm font-medium text-white disabled:cursor-default disabled:opacity-50"
          >
            {{ t('artistDialog.save') }}
          </button>
        </div>
      </form>
    </div>
  </Teleport>
</template>
