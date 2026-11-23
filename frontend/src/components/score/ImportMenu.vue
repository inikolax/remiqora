<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ScorePopover from './ScorePopover.vue'
import ScoreIcon from './ScoreIcon.vue'

/** One "Import" button for the four ways in: a song from the library, a MIDI file, the piano, ABC from the clipboard. */
const props = defineProps<{ extracting?: boolean }>()
const emit = defineEmits<{ fromSong: []; midiFile: [file: File]; piano: []; pasteAbc: [] }>()
const { t } = useI18n()
const open = ref(false)
const btn = ref<HTMLElement | null>(null)
const file = ref<HTMLInputElement | null>(null)
function pick(which: 'fromSong' | 'midi' | 'piano' | 'pasteAbc'): void {
  open.value = false
  if (which === 'midi') file.value?.click()
  else if (which === 'fromSong') emit('fromSong')
  else if (which === 'piano') emit('piano')
  else emit('pasteAbc')
}
function onFile(e: Event): void {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  input.value = ''
  if (f) emit('midiFile', f)
}
</script>

<template>
  <div class="contents">
    <button ref="btn" type="button" class="se-btn" :aria-expanded="open" :aria-haspopup="'menu'" @click="open = !open"><ScoreIcon name="import" />{{ t('score.import.button') }}<ScoreIcon name="down" class="!h-3 !w-3" /></button>
    <input ref="file" type="file" accept=".mid,.midi,audio/midi" class="hidden" @change="onFile" />
    <ScorePopover :open="open" :anchor="btn" :label="t('score.import.button')" :width="290" @close="open = false">
      <div class="se-menu" role="menu">
        <button type="button" role="menuitem" class="it" :disabled="props.extracting" @click="pick('fromSong')"><span class="ic"><ScoreIcon name="song" /></span><span><b>{{ props.extracting ? t('score.import.extracting') : t('score.import.fromSong') }}</b><small>{{ t('score.import.fromSongHint') }}</small></span></button>
        <button type="button" role="menuitem" class="it" @click="pick('midi')"><span class="ic"><ScoreIcon name="midi" /></span><span><b>{{ t('score.import.midi') }}</b><small>{{ t('score.import.midiHint') }}</small></span></button>
        <button type="button" role="menuitem" class="it" @click="pick('piano')"><span class="ic"><ScoreIcon name="piano" /></span><span><b>{{ t('score.import.piano') }}</b><small>{{ t('score.import.pianoHint') }}</small></span></button>
        <div class="hr"></div>
        <button type="button" role="menuitem" class="it" @click="pick('pasteAbc')"><span class="ic"><ScoreIcon name="paste" /></span><span><b>{{ t('score.import.paste') }}</b><small>{{ t('score.import.pasteHint') }}</small></span></button>
      </div>
    </ScorePopover>
  </div>
</template>
