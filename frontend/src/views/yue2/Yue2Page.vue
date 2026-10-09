<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useOrchestratorStore } from '../../stores/orchestrator'
import { useYue2Store } from '../../stores/yue2'
import ModelOfflineBanner from '../../components/shared/ModelOfflineBanner.vue'
import NotInstalled from '../../components/shared/NotInstalled.vue'
import { useFeaturesStore } from '../../stores/features'
import GenerateForm from './GenerateForm.vue'
import TrackFeed from './TrackFeed.vue'

const orchestrator = useOrchestratorStore()
const store = useYue2Store()
const features = useFeaturesStore()

const modelStatus = computed(() => orchestrator.statuses.yue2?.status ?? 'stopped')
const modelError = computed(() => orchestrator.statuses.yue2?.error ?? null)
const isRunning = computed(() => modelStatus.value === 'running')

onMounted(() => {
  void store.loadHistory()
  store.startBackgroundTasks()
})
onBeforeUnmount(() => store.stopBackgroundTasks())
</script>

<template>
  <div class="space-y-6">
    <!-- left out at install: say what it is and offer it; earlier tracks stay listed below -->
    <NotInstalled v-if="!features.has('yue2')" feature="yue2" />
    <ModelOfflineBanner v-else-if="!isRunning" model-id="yue2" :status="modelStatus" :error="modelError" />
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-[480px_minmax(0,1fr)]">
      <GenerateForm v-if="isRunning" />
      <TrackFeed :class="{ 'lg:col-span-2': !isRunning }" />
    </div>
  </div>
</template>
