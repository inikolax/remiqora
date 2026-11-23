<script setup lang="ts">
// The prompt written from the idea, as editable fields per engine, with another take, a reset, the variants,
// "Open in the form" and Generate. The state and the actions come from IdeaComposer (useIdeaComposer).
import { inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { MODEL_LABELS } from '../../composables/useModelSwitch'
import { VOCAL_LANGUAGES } from '../../utils/vocalLanguages'
import ChipGroup from '../../components/shared/ChipGroup.vue'
import MakeCoverOption from '../../components/shared/MakeCoverOption.vue'
import { IDEA_COMPOSER } from './useIdeaComposer'

const { t } = useI18n()
const c = inject(IDEA_COMPOSER)
if (!c) throw new Error('IdeaPrompt needs IdeaComposer')
const {
  ideaStore, orchestrator, draft, variants, precision, sa3Model, writing, instrumental, engineInfo, engineRunning, yue2Precisions,
  write, durationLabel, variantOptions, sa3Kind, sa3Models, sa3KindOptions, setSa3Kind, sa3Max, starting, generate, openInForm,
} = c

const FIELD = 'rounded-lg border border-border bg-panel-2 text-sm text-text focus:border-accent1 focus:outline-none'
const QUIET = 'inline-flex min-h-8 items-center rounded-lg border border-border px-3 text-xs text-text-dim transition-colors hover:border-text-dim hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1 disabled:pointer-events-none disabled:opacity-40'
</script>

<template>
  <section v-if="draft" class="overflow-hidden rounded-xl border border-border bg-panel" aria-labelledby="idea-prompt-title">
    <div class="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border bg-panel-2/60 px-4 py-2.5">
      <h2 id="idea-prompt-title" class="text-sm font-semibold text-text">{{ t('idea.promptTitle', { engine: MODEL_LABELS[engineInfo.model] }) }}</h2>
      <span class="text-xs text-text-dim">{{ t(draft.writtenBy === 'ace' ? 'idea.writtenByAce' : 'idea.writtenByAssistant', { s: draft.seconds.toFixed(1) }) }}</span>
      <span class="ms-auto flex items-center gap-2">
        <button type="button" :class="QUIET" :disabled="writing" @click="write({ sound: draft.engine === 'sa3' && draft.sa3Kind === 'sfx' })">{{ t('idea.rewrite') }}</button>
        <button type="button" :class="QUIET" :title="t('idea.resetTitle')" :disabled="writing" @click="ideaStore.reset()">{{ t('idea.reset') }}</button>
      </span>
    </div>
    <div class="space-y-4 p-4">
      <label class="flex flex-col gap-1 text-xs">
        <span class="font-medium text-text">{{ t(draft.engine === 'yue2' ? 'idea.styleTags' : draft.engine === 'sa3' ? 'idea.sa3Prompt' : 'idea.caption') }}</span>
        <textarea v-model="draft.caption" :rows="draft.engine === 'sa3' ? 4 : 2" dir="auto" class="resize-y px-3 py-2 leading-relaxed" :class="FIELD"></textarea>
        <span v-if="draft.engine === 'yue2'" class="leading-relaxed text-text-dim">{{ t('idea.styleTagsHint') }}</span>
        <span v-else-if="draft.engine === 'sa3'" class="leading-relaxed text-text-dim">{{ t('idea.sa3PromptHint') }}</span>
      </label>
      <label v-if="!instrumental && draft.engine !== 'sa3'" class="flex flex-col gap-1 text-xs">
        <span class="font-medium text-text">{{ t('idea.lyrics') }}</span>
        <textarea v-model="draft.lyrics" rows="12" dir="auto" class="resize-y px-3 py-2 font-mono text-[13px] leading-relaxed" :class="FIELD"></textarea>
      </label>

      <!-- ACE-Step: tempo, key, length, language -->
      <div v-if="draft.engine === 'ace'" class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label class="flex min-w-0 flex-col gap-1 text-xs">
          <span class="font-medium text-text">{{ t('idea.bpm') }}</span>
          <input v-model.number="draft.bpm" type="number" min="30" max="300" class="min-w-0 px-2.5 py-2" :class="FIELD" />
        </label>
        <label class="flex min-w-0 flex-col gap-1 text-xs">
          <span class="font-medium text-text">{{ t('idea.key') }}</span>
          <input v-model="draft.keyscale" type="text" placeholder="A minor" class="min-w-0 px-2.5 py-2" :class="FIELD" />
        </label>
        <label class="flex min-w-0 flex-col gap-1 text-xs">
          <span class="font-medium text-text">{{ t('idea.duration', { label: durationLabel }) }}</span>
          <input v-model.number="draft.duration" type="number" min="10" max="600" step="5" class="min-w-0 px-2.5 py-2" :class="FIELD" />
        </label>
        <label v-if="!instrumental" class="flex min-w-0 flex-col gap-1 text-xs">
          <span class="font-medium text-text">{{ t('idea.vocalLanguage') }}</span>
          <select v-model="draft.language" class="min-w-0 px-2 py-2" :class="FIELD">
            <option v-for="l in VOCAL_LANGUAGES" :key="l.code" :value="l.code">{{ l.label }}</option>
          </select>
        </label>
      </div>
      <!-- Stable Audio 3: music or a sound, the checkpoint and the length (its own limit per checkpoint) -->
      <div v-else-if="draft.engine === 'sa3'" class="grid gap-3 sm:grid-cols-3">
        <!-- as the classifier read the idea; switching it swaps the prompt's service tag -->
        <div class="flex flex-col gap-1 text-xs">
          <span class="font-medium text-text">{{ t('idea.sa3Kind') }}</span>
          <ChipGroup :model-value="sa3Kind" small :options="sa3KindOptions" :aria-label="t('idea.sa3Kind')" @update:model-value="setSa3Kind" />
        </div>
        <label class="flex min-w-0 flex-col gap-1 text-xs">
          <span class="font-medium text-text">{{ t('idea.sa3Model') }}</span>
          <select v-model="sa3Model" class="min-w-0 px-2.5 py-2" :class="FIELD">
            <option v-for="m in sa3Models" :key="m.id" :value="m.id">{{ m.id }}</option>
          </select>
        </label>
        <label class="flex min-w-0 flex-col gap-1 text-xs">
          <span class="font-medium text-text">{{ t('idea.duration', { label: durationLabel }) }}</span>
          <input v-model.number="draft.duration" type="number" :min="sa3Kind === 'sfx' ? 0.5 : 5" :max="sa3Max" :step="sa3Kind === 'sfx' ? 0.5 : 5" class="min-w-0 px-2.5 py-2" :class="FIELD" />
          <span class="text-text-dim">{{ t('idea.sa3Max', { max: sa3Max }) }}</span>
        </label>
      </div>
      <!-- YuE2: the length follows the lyrics, the tempo is a tag; only the precision to pick -->
      <div v-else class="flex flex-wrap items-end gap-4">
        <label v-if="yue2Precisions.length > 1" class="flex flex-col gap-1 text-xs">
          <span class="font-medium text-text">{{ t('idea.precision') }}</span>
          <select v-model="precision" class="px-2.5 py-2" :class="FIELD">
            <option v-for="p in yue2Precisions" :key="p" :value="p">{{ p }}</option>
          </select>
        </label>
        <p class="max-w-md text-xs leading-relaxed text-text-dim">{{ t('idea.yue2Length') }}</p>
      </div>

      <div class="flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <span class="text-xs text-text-dim">{{ t('idea.variants') }}</span>
        <ChipGroup v-model="variants" small :options="variantOptions" :aria-label="t('idea.variants')" />
        <span class="ms-auto flex flex-wrap items-center justify-end gap-2">
          <button type="button" class="min-h-9 px-3 py-2" :class="QUIET" @click="openInForm">{{ t('idea.openInForm', { engine: MODEL_LABELS[engineInfo.model] }) }}</button>
          <button
            type="button"
            class="accent-gradient inline-flex min-h-9 items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1 disabled:opacity-50"
            :disabled="starting || orchestrator.switching || writing || !draft.caption.trim()"
            @click="generate"
          >
            {{ starting ? t('idea.sending') : t('idea.generate') }}
          </button>
        </span>
      </div>
      <MakeCoverOption v-if="draft.engine !== 'sa3' || sa3Kind === 'music'" :engine="engineInfo.model" />
      <p v-if="!engineRunning(draft.engine) && orchestrator.activeModel && orchestrator.activeModel !== engineInfo.model" class="-mt-2 text-end text-xs text-text-dim">{{ t('aiPart.engineSwitchNote', { running: MODEL_LABELS[orchestrator.activeModel] }) }}</p>
    </div>
  </section>
</template>
