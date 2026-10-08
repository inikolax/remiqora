<script setup lang="ts">
// The editor's shortcut sheet: keyboard, the selected clip or handle, and the mouse. Opened by its own toolbar
// button, by "?" and from the editor guide. Keeps the look of the editor's original help: glass panel,
// gradient title, two columns of cards with the keys in accent chips.
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDialogA11y } from '../../composables/useDialogA11y'
import KeyboardIcon from '../shared/icons/KeyboardIcon.vue'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{ close: [] }>()
const { t, tm } = useI18n()

const dialogEl = ref<HTMLElement | null>(null)
const { onKeydown } = useDialogA11y(dialogEl, () => props.show, () => emit('close'))

interface Keys { keys: string; action: string }
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm sm:p-6"
        @click.self="emit('close')"
      >
        <div
          ref="dialogEl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="editor-hotkeys-title"
          class="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border/60 bg-panel-2/95 shadow-2xl backdrop-blur-xl"
          @keydown="onKeydown"
        >
          <div class="flex items-center justify-between border-b border-border/40 bg-panel/50 px-6 py-4">
            <h2 id="editor-hotkeys-title" class="bg-gradient-to-r from-accent1 to-accent2 bg-clip-text text-xl font-bold text-transparent">
              {{ t('editor.hotkeys.title') }}
            </h2>
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-full bg-panel text-text-dim transition-colors hover:bg-border/50 hover:text-text"
              :aria-label="t('common.close')"
              :title="t('common.close')"
              @click="emit('close')"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </div>

          <div class="custom-scrollbar grid max-h-[70vh] gap-8 overflow-y-auto p-6">
            <!-- Keyboard -->
            <section>
              <h3 class="mb-4 flex items-center gap-2 text-sm font-semibold text-text">
                <KeyboardIcon class="h-4 w-4 text-accent1" />
                {{ t('editor.hotkeys.keysTitle') }}
              </h3>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div v-for="k in (tm('editor.hotkeys.keys') as Keys[])" :key="k.keys" class="flex items-center justify-between gap-3 rounded-lg border border-border/30 bg-panel/40 px-4 py-3">
                  <span class="text-sm text-text">{{ k.action }}</span>
                  <kbd class="shrink-0 whitespace-nowrap rounded border border-border/50 bg-panel-2 px-2 py-1 font-mono text-xs text-accent1 shadow-sm">{{ k.keys }}</kbd>
                </div>
              </div>
            </section>

            <!-- The selected clip or handle -->
            <section>
              <h3 class="mb-4 flex items-center gap-2 text-sm font-semibold text-text">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-status-done" aria-hidden="true"><rect x="3" y="7" width="18" height="10" rx="2" /><path d="M7 7v10M17 7v10" /></svg>
                {{ t('editor.hotkeys.clipKeysTitle') }}
              </h3>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div v-for="k in (tm('editor.hotkeys.clipKeys') as Keys[])" :key="k.keys" class="flex items-center justify-between gap-3 rounded-lg border border-border/30 bg-panel/40 px-4 py-3">
                  <span class="text-sm text-text">{{ k.action }}</span>
                  <kbd class="shrink-0 whitespace-nowrap rounded border border-border/50 bg-panel-2 px-2 py-1 font-mono text-xs text-accent1 shadow-sm">{{ k.keys }}</kbd>
                </div>
              </div>
            </section>

            <!-- Mouse -->
            <section>
              <h3 class="mb-4 flex items-center gap-2 text-sm font-semibold text-text">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-accent2" aria-hidden="true"><path d="M12 2a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4Z" /><path d="M12 6v3" /></svg>
                {{ t('editor.hotkeys.mouseTitle') }}
              </h3>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div v-for="k in (tm('editor.hotkeys.mouse') as Keys[])" :key="k.keys" class="flex items-center justify-between gap-3 rounded-lg border border-border/30 bg-panel/40 px-4 py-3">
                  <span class="text-sm text-text">{{ k.action }}</span>
                  <span class="shrink-0 text-right text-xs text-text-dim">{{ k.keys }}</span>
                </div>
              </div>
            </section>

            <p class="text-xs text-text-dim">{{ t('editor.hotkeys.hint') }}</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
