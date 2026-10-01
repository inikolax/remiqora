<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { t } = useI18n()

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.show) {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="show" 
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-black/40"
        @click.self="emit('close')"
      >
        <div class="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border/60 bg-panel-2/95 shadow-2xl backdrop-blur-xl">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-border/40 bg-panel/50 px-6 py-4">
            <h2 class="text-xl font-bold bg-gradient-to-r from-accent1 to-accent2 bg-clip-text text-transparent">
              {{ t('editor.help.title') }}
            </h2>
            <button 
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-full bg-panel hover:bg-border/50 text-text-dim hover:text-text transition-colors"
              :aria-label="t('common.close')"
              :title="t('common.close')"
              @click="emit('close')"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="p-6 max-h-[70vh] overflow-y-auto grid gap-8 custom-scrollbar">
            
            <!-- Hotkeys -->
            <section>
              <h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-text-dim flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-accent1"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x2="6" y1="8" y2="5"></line><line x2="10" y1="8" y2="5"></line><line x2="14" y1="8" y2="5"></line></svg>
                {{ t('editor.help.hotkeys') }}
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="flex items-center justify-between rounded-lg bg-panel/40 px-4 py-3 border border-border/30">
                  <span class="text-sm text-text">{{ t('editor.help.playPause') }}</span>
                  <kbd class="rounded bg-panel-2 px-2 py-1 text-xs font-mono text-accent1 border border-border/50 shadow-sm">Space</kbd>
                </div>
                <div class="flex items-center justify-between rounded-lg bg-panel/40 px-4 py-3 border border-border/30">
                  <span class="text-sm text-text">{{ t('editor.help.split') }}</span>
                  <kbd class="rounded bg-panel-2 px-2 py-1 text-xs font-mono text-accent1 border border-border/50 shadow-sm">S</kbd>
                </div>
                <div class="flex items-center justify-between rounded-lg bg-panel/40 px-4 py-3 border border-border/30">
                  <span class="text-sm text-text">{{ t('editor.help.delete') }}</span>
                  <kbd class="rounded bg-panel-2 px-2 py-1 text-xs font-mono text-accent1 border border-border/50 shadow-sm">Del</kbd>
                </div>
                <div class="flex items-center justify-between rounded-lg bg-panel/40 px-4 py-3 border border-border/30">
                  <span class="text-sm text-text">{{ t('editor.help.duplicate') }}</span>
                  <kbd class="rounded bg-panel-2 px-2 py-1 text-xs font-mono text-accent1 border border-border/50 shadow-sm">Ctrl+D</kbd>
                </div>
                <div class="flex items-center justify-between rounded-lg bg-panel/40 px-4 py-3 border border-border/30">
                  <span class="text-sm text-text">{{ t('editor.help.undo') }}</span>
                  <kbd class="rounded bg-panel-2 px-2 py-1 text-xs font-mono text-accent1 border border-border/50 shadow-sm">Ctrl+Z</kbd>
                </div>
                <div class="flex items-center justify-between rounded-lg bg-panel/40 px-4 py-3 border border-border/30">
                  <span class="text-sm text-text">{{ t('editor.help.redo') }}</span>
                  <kbd class="rounded bg-panel-2 px-2 py-1 text-xs font-mono text-accent1 border border-border/50 shadow-sm">Ctrl+Y</kbd>
                </div>
                <div class="flex items-center justify-between rounded-lg bg-panel/40 px-4 py-3 border border-border/30">
                  <span class="text-sm text-text">{{ t('editor.help.save') }}</span>
                  <kbd class="rounded bg-panel-2 px-2 py-1 text-xs font-mono text-accent1 border border-border/50 shadow-sm">Ctrl+S</kbd>
                </div>
                <div class="flex items-center justify-between rounded-lg bg-panel/40 px-4 py-3 border border-border/30">
                  <span class="text-sm text-text">{{ t('editor.help.movePlayhead') }}</span>
                  <kbd class="rounded bg-panel-2 px-2 py-1 text-xs font-mono text-accent1 border border-border/50 shadow-sm">← →</kbd>
                </div>
                <div class="flex items-center justify-between rounded-lg bg-panel/40 px-4 py-3 border border-border/30">
                  <span class="text-sm text-text">{{ t('editor.help.startEnd') }}</span>
                  <kbd class="rounded bg-panel-2 px-2 py-1 text-xs font-mono text-accent1 border border-border/50 shadow-sm">Home / End</kbd>
                </div>
                <div class="flex items-center justify-between rounded-lg bg-panel/40 px-4 py-3 border border-border/30">
                  <span class="text-sm text-text">{{ t('editor.help.zoom') }}</span>
                  <kbd class="rounded bg-panel-2 px-2 py-1 text-xs font-mono text-accent1 border border-border/50 shadow-sm">+ / -</kbd>
                </div>
                <div class="flex items-center justify-between rounded-lg bg-panel/40 px-4 py-3 border border-border/30">
                  <span class="text-sm text-text">{{ t('editor.help.selectByKeyboard') }}</span>
                  <kbd class="rounded bg-panel-2 px-2 py-1 text-xs font-mono text-accent1 border border-border/50 shadow-sm">Tab</kbd>
                </div>
                <div class="flex items-center justify-between rounded-lg bg-panel/40 px-4 py-3 border border-border/30">
                  <span class="text-sm text-text">{{ t('editor.help.moveClip') }}</span>
                  <kbd class="rounded bg-panel-2 px-2 py-1 text-xs font-mono text-accent1 border border-border/50 shadow-sm">← →</kbd>
                </div>
                <div class="flex items-center justify-between rounded-lg bg-panel/40 px-4 py-3 border border-border/30">
                  <span class="text-sm text-text">{{ t('editor.help.trimClipEnd') }}</span>
                  <kbd class="rounded bg-panel-2 px-2 py-1 text-xs font-mono text-accent1 border border-border/50 shadow-sm">Shift+← →</kbd>
                </div>
              </div>
            </section>

            <!-- Mouse -->
            <section>
              <h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-text-dim flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-accent2"><path d="M12 2a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4Z"></path><path d="M12 6v3"></path></svg>
                {{ t('editor.help.mouse') }}
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="flex items-center justify-between rounded-lg bg-panel/40 px-4 py-3 border border-border/30">
                  <span class="text-sm text-text">{{ t('editor.help.zoom') }}</span>
                  <span class="text-xs text-text-dim text-right">Ctrl + Scroll</span>
                </div>
                <div class="flex items-center justify-between rounded-lg bg-panel/40 px-4 py-3 border border-border/30">
                  <span class="text-sm text-text">{{ t('editor.help.pan') }}</span>
                  <span class="text-xs text-text-dim text-right">Shift+Click / Mid-Click</span>
                </div>
              </div>
            </section>

            <!-- Basics -->
            <section>
              <h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-text-dim flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-status-done"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                {{ t('editor.help.basics') }}
              </h3>
              <ul class="space-y-3">
                <li class="flex items-start gap-3">
                  <div class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent1"></div>
                  <p class="text-sm text-text-dim leading-relaxed">{{ t('editor.help.addTrackDesc') }}</p>
                </li>
                <li class="flex items-start gap-3">
                  <div class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent1"></div>
                  <p class="text-sm text-text-dim leading-relaxed">{{ t('editor.help.loopDesc') }}</p>
                </li>
                <li class="flex items-start gap-3">
                  <div class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent1"></div>
                  <p class="text-sm text-text-dim leading-relaxed">{{ t('editor.help.snapDesc') }}</p>
                </li>
              </ul>
            </section>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active .rounded-2xl,
.fade-leave-active .rounded-2xl {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}

.fade-enter-from .rounded-2xl,
.fade-leave-to .rounded-2xl {
  transform: scale(0.96) translateY(10px);
  opacity: 0;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-dim);
}
</style>
