<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useOrchestratorStore } from './stores/orchestrator'
import { useSystemStore } from './stores/system'
import { useFeaturesStore } from './stores/features'
import AppFooter from './components/shared/AppFooter.vue'
import AppHeader from './components/shared/AppHeader.vue'
import ArtistDialog from './components/shared/ArtistDialog.vue'
import { useSettingsStore } from './stores/settings'

const orchestrator = useOrchestratorStore()
const system = useSystemStore()
const features = useFeaturesStore()
const settings = useSettingsStore()
const { t } = useI18n()
const route = useRoute()
// The editor is a workspace (route meta): the full window width and, from lg up, exactly one screen high, so the
// timeline and the AI panel scroll inside it and the mixer stays in view. No footer there.
const workspace = computed(() => route.meta.workspace === true)

watchEffect(() => {
  document.title = `Remiqora — ${t('header.tagline')}`
})

onMounted(() => {
  orchestrator.startPolling()
  system.startPolling()
  void features.refresh()
  void settings.load()
})
onBeforeUnmount(() => {
  orchestrator.stopPolling()
  system.stopPolling()
})
</script>

<template>
  <div class="flex min-h-[100svh] flex-1 flex-col" :class="workspace && 'lg:h-[100svh] lg:min-h-0 lg:flex-none'">
    <AppHeader />
    <main :class="workspace ? 'flex min-h-0 w-full flex-1 flex-col' : 'mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6'">
      <router-view v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>
    <AppFooter v-if="!workspace" />
  </div>
  <ArtistDialog />
</template>
