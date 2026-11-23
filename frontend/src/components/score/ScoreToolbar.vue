<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useScoreEditor } from './useScoreEditor'
import type { ViewMode } from './useScoreEditor'
import SongChips from './SongChips.vue'
import ImportMenu from './ImportMenu.vue'
import ScoreIcon from './ScoreIcon.vue'

/**
 * The panel's top row: the song's chips, Import, undo / redo, the view (piano roll, sheet music, and the simple
 * mode: the melody over the lyrics) and full screen.
 */
const props = defineProps<{ extracting?: boolean; disabled?: boolean }>()
const emit = defineEmits<{ fromSong: []; midiFile: [file: File]; piano: []; pasteAbc: [] }>()
const ed = useScoreEditor()
const { ui } = ed
const { t } = useI18n()
const VIEWS: { id: ViewMode; soon?: boolean }[] = [{ id: 'roll' }, { id: 'sheet' }, { id: 'simple' }]
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <SongChips :disabled="props.disabled" />
    <span class="flex-1"></span>
    <ImportMenu :extracting="props.extracting" @from-song="emit('fromSong')" @midi-file="emit('midiFile', $event)" @piano="emit('piano')" @paste-abc="emit('pasteAbc')" />
    <span class="se-sep"></span>
    <button type="button" class="se-btn icon" :disabled="!ed.canUndo.value" :title="`${t('score.toolbar.undo')} · Ctrl+Z`" :aria-label="t('score.toolbar.undo')" @click="ed.undo()"><ScoreIcon name="undo" /></button>
    <button type="button" class="se-btn icon" :disabled="!ed.canRedo.value" :title="`${t('score.toolbar.redo')} · Ctrl+Shift+Z`" :aria-label="t('score.toolbar.redo')" @click="ed.redo()"><ScoreIcon name="redo" /></button>
    <div class="se-seg" role="radiogroup" :aria-label="t('score.toolbar.view')">
      <button
        v-for="v in VIEWS" :key="v.id" type="button" role="radio" :aria-checked="ui.view === v.id" :class="{ on: ui.view === v.id }"
        :disabled="v.soon || props.disabled" :title="v.soon ? t('score.toolbar.soon') : undefined" @click="ui.view = v.id"
      >{{ t(`score.toolbar.views.${v.id}`) }}<small v-if="v.soon" class="text-[9.5px] text-[#8a8a9c]">{{ t('score.toolbar.soonShort') }}</small></button>
    </div>
    <button type="button" class="se-btn icon" :title="`${t('score.toolbar.fullscreen')} · F`" :aria-label="t('score.toolbar.fullscreen')" @click="ui.fullscreen = true"><ScoreIcon name="max" /></button>
  </div>
</template>
