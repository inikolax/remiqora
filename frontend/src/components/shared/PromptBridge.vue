<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { preparePrompt, promptStatus } from '../../api/prompt'
import type { PromptLang, PromptPrepareResult } from '../../api/prompt'

const props = defineProps<{ target: string }>()
const emit = defineEmits<{ apply: [result: PromptPrepareResult] }>()

const { t } = useI18n()
const input = ref('')
const loading = ref(false)
const error = ref('')
const result = ref<PromptPrepareResult | null>(null)
const backendStatus = ref<string>('')
const models = ref<string[]>([])
const selectedModel = ref(localStorage.getItem('promptBridge_model') || '')
const useLocal = ref(false)
const srcLangs = ref<PromptLang[]>([])
const srcLang = ref(localStorage.getItem('promptBridge_srcLang') || 'auto')

function pickDefaultModel(list: string[], fallback: string): string {
  if (selectedModel.value && list.includes(selectedModel.value)) return selectedModel.value
  if (fallback && list.includes(fallback)) return fallback
  return list[0] || ''
}

onMounted(async () => {
  try {
    const st = await promptStatus()
    useLocal.value = st.engine === 'local'
    if (useLocal.value) {
      srcLangs.value = st.supported_langs || []
      if (srcLang.value !== 'auto' && !srcLangs.value.some((l) => l.code === srcLang.value)) srcLang.value = 'auto'
      return // built-in translator: Ollama state is irrelevant
    }
    if (!st.reachable) backendStatus.value = t('promptBridge.ollamaDown')
    else {
      models.value = st.models || []
      selectedModel.value = pickDefaultModel(models.value, st.model)
      if (st.model && !models.value.includes(st.model))
        backendStatus.value = t('promptBridge.modelMissing', { model: st.model })
    }
  } catch {
    backendStatus.value = t('promptBridge.ollamaDown')
  }
})

function onModelChange() {
  localStorage.setItem('promptBridge_model', selectedModel.value)
}

function onSrcLangChange() {
  localStorage.setItem('promptBridge_srcLang', srcLang.value)
}

async function submit() {
  error.value = ''
  result.value = null
  if (!input.value.trim()) return
  loading.value = true
  try {
    result.value = await preparePrompt(input.value.trim(), props.target, selectedModel.value, srcLang.value)
    // Auto-insert so a Hungarian description flows straight into the form;
    // everything stays editable/reviewable in the form fields.
    apply()
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

function apply() {
  if (result.value) emit('apply', result.value)
}
</script>

<template>
  <div class="space-y-2 rounded-lg border border-border bg-panel-2/50 p-3">
    <div class="flex items-center justify-between">
      <label class="text-[13px] font-medium text-text">{{ t('promptBridge.title') }}</label>
      <span class="text-[11px] text-text-dim">{{ useLocal ? t('promptBridge.hintLocal') : t('promptBridge.hint') }}</span>
    </div>
    <textarea
      v-model="input"
      rows="3"
      class="w-full rounded-lg border border-border bg-panel p-2.5 text-sm text-text"
      :placeholder="t('promptBridge.placeholder')"
    ></textarea>
    <div class="flex items-center gap-2">
      <select
        v-if="useLocal && srcLangs.length"
        v-model="srcLang"
        class="max-w-36 rounded-lg border border-border bg-panel px-2 py-1.5 text-xs text-text"
        :title="t('promptBridge.srcLangTitle')"
        @change="onSrcLangChange"
      >
        <option value="auto">{{ t('promptBridge.srcLangAuto') }}</option>
        <option v-for="l in srcLangs" :key="l.code" :value="l.code">{{ l.label }}</option>
      </select>
      <span
        v-if="useLocal"
        class="rounded-lg border border-border bg-panel px-2 py-1.5 text-xs text-text-dim"
        :title="t('promptBridge.engineLocalTitle')"
      >
        {{ t('promptBridge.engineLocal') }}
      </span>
      <select
        v-else-if="models.length"
        v-model="selectedModel"
        class="max-w-40 rounded-lg border border-border bg-panel px-2 py-1.5 text-xs text-text"
        :title="t('promptBridge.modelTitle')"
        @change="onModelChange"
      >
        <option v-for="m in models" :key="m" :value="m">{{ m }}</option>
      </select>
      <button
        type="button"
        class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text hover:bg-panel disabled:opacity-50"
        :disabled="loading || !input.trim()"
        @click="submit"
      >
        {{ loading ? t('promptBridge.working') : (useLocal ? t('promptBridge.submitLocal') : t('promptBridge.submit')) }}
      </button>
      <button
        v-if="result"
        type="button"
        class="accent-gradient rounded-lg px-3 py-1.5 text-xs font-medium text-white"
        @click="apply"
      >
        {{ t('promptBridge.apply') }}
      </button>
    </div>
    <p v-if="backendStatus" class="text-[11px] text-text-dim">{{ backendStatus }}</p>
    <p v-if="error" class="rounded-lg bg-status-failed/10 p-2 text-xs text-status-failed">{{ error }}</p>
    <div v-if="result" class="space-y-1 rounded-lg bg-panel p-2 text-xs text-text">
      <p v-if="result.style_en"><span class="text-text-dim">Style EN: </span>{{ result.style_en }}</p>
      <p v-if="result.simple"><span class="text-text-dim">Simple: </span>{{ result.simple }}</p>
      <p v-if="result.lyrics" class="whitespace-pre-wrap font-mono"><span class="text-text-dim">Lyrics: </span>{{ result.lyrics }}</p>
    </div>
  </div>
</template>
