<script setup lang="ts">
import { onBeforeUnmount, onMounted, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useOrchestratorStore } from './stores/orchestrator'
import AppFooter from './components/shared/AppFooter.vue'
import AppHeader from './components/shared/AppHeader.vue'
import ArtistDialog from './components/shared/ArtistDialog.vue'
import { useSettingsStore } from './stores/settings'

const orchestrator = useOrchestratorStore()
const settings = useSettingsStore()
const { t } = useI18n()

watchEffect(() => {
  document.title = `Remiqora — ${t('header.tagline')}`
})

onMounted(() => {
  orchestrator.startPolling()
  void settings.load()
})
onBeforeUnmount(() => orchestrator.stopPolling())
</script>

<template>
  <AppHeader />
  <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
    <router-view v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>
  </main>
  <AppFooter />
  <ArtistDialog />
</template>
