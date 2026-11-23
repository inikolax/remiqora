<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useOrchestratorStore } from '../../stores/orchestrator'
import { useYue2Store } from '../../stores/yue2'
import ModelOfflineBanner from '../../components/shared/ModelOfflineBanner.vue'
import EngineStartNotice from '../../components/shared/EngineStartNotice.vue'
import NotInstalled from '../../components/shared/NotInstalled.vue'
import { useFeaturesStore } from '../../stores/features'
import GenerateForm from './GenerateForm.vue'

const orchestrator = useOrchestratorStore()
const store = useYue2Store()
const features = useFeaturesStore()

const modelStatus = computed(() => orchestrator.statuses.yue2?.status ?? 'stopped')
const modelError = computed(() => orchestrator.statuses.yue2?.error ?? null)
const isRunning = computed(() => modelStatus.value === 'running')

// The history is loaded by Create, for all the engines at once.
onMounted(() => store.startBackgroundTasks())
onBeforeUnmount(() => store.stopBackgroundTasks())
</script>

<template>
  <div class="space-y-3 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
    <!-- left out at install: say what it is and offer it -->
    <NotInstalled v-if="!features.has('yue2')" feature="yue2" />
    <template v-else>
      <!-- stopped: the form works, Create starts the engine; a start under way or failed says so itself -->
      <EngineStartNotice v-if="modelStatus === 'stopped'" model-id="yue2" />
      <ModelOfflineBanner v-else-if="!isRunning" model-id="yue2" :status="modelStatus" :error="modelError" />
      <GenerateForm />
    </template>
  </div>
</template>
