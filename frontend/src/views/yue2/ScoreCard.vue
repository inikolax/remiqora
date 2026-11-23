<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { displayChord, parseKey } from '../../audio/score'
import type { Section } from '../../audio/score'
import { useScoreWorkspace } from '../../stores/scoreWorkspace'
import { useNotesView } from '../../composables/useNotesView'
import { useEngineStart } from '../../composables/useEngineStart'
import { provideScoreEditor } from '../../components/score/useScoreEditor'
import { checkText } from '../../components/score/checkText'
import { SECTION_COLORS, fmtTime, sectionLabel } from '../../components/score/scoreUi'
import OverviewStrip from '../../components/score/OverviewStrip.vue'
import ScoreIcon from '../../components/score/ScoreIcon.vue'
import NotesHelpButton from '../../components/score/help/NotesHelpButton.vue'
import '../../components/score/score.css'

/**
 * The form's score as a card: the song's settings, the whole song as a strip, its sections and what the checks say.
 * The editing is in "Notes", Create's workspace beside the form; the card opens it at a bar or a section. It reads the
 * same editor as the workspace (the store's), so it follows every edit made there at once.
 */
const props = defineProps<{ extracting?: boolean }>()
const emit = defineEmits<{ fromSong: [] }>()
const { t } = useI18n()
const ws = useScoreWorkspace()
const notes = useNotesView()
const ed = ws.formEditor()
provideScoreEditor(ed)

const s = computed(() => ed.score.value)
const empty = computed(() => ed.isEmpty.value)
const minor = computed(() => parseKey(s.value.key)?.minorLike ?? false)
const time = computed(() => fmtTime(ed.total.value * ed.spt.value))
const shownHere = computed(() => notes.isOpen.value && ws.mode === 'form')
const hasNotes = computed(() => s.value.voices.vocal.length + s.value.voices.ins.length > 0)
// the hint names the Create button as it reads now ("Create music", or "Start YuE2-3B and create")
const { createLabel } = useEngineStart('yue2')
const createButton = computed(() => createLabel(t('yueGen.submit')))

const remarks = computed(() => ed.checks.value.filter((c) => c.level === 'warn'))
const remarksText = computed(() => remarks.value.map((c) => checkText(c, s.value.key, t).title.toLocaleLowerCase()).join(', '))

function openAt(from: number, to = from + 8): void {
  void notes.open({ focus: { from, to } })
}
const openSection = (sec: Section): void => openAt(sec.startBar, sec.startBar + sec.bars)
function toggle(): void {
  if (shownHere.value) void notes.close()
  else void notes.open()
}

const midiInput = ref<HTMLInputElement | null>(null)
function onMidi(e: Event): void {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  input.value = ''
  if (!f) return
  ws.pendingMidi = f
  void notes.open()
}
</script>

<template>
  <div class="space-y-2.5 rounded-lg border border-border bg-panel-2/50 p-3">
    <div class="flex items-center justify-between">
      <p class="text-[13px] font-medium text-text">{{ t('create.notes.cardTitle') }}</p>
      <div class="flex items-center gap-2">
        <NotesHelpButton variant="small" :editor="ed" :plan="ws.plan" @reveal="notes.open()" />
        <slot name="help" />
      </div>
    </div>
    <input ref="midiInput" type="file" accept=".mid,.midi,audio/midi" class="hidden" @change="onMidi" />

    <!-- no score yet: the three ways to one -->
    <template v-if="empty">
      <div class="px-2 py-1 text-center">
        <p class="text-[15px] font-semibold text-text">{{ t('create.notes.emptyTitle') }}</p>
        <p class="mt-0.5 text-xs text-text-dim">{{ t('create.notes.emptyLead') }}</p>
      </div>
      <!-- the workspace open beside the form has the same three ways, larger: the card does not repeat them -->
      <div v-if="!shownHere" class="grid grid-cols-[1.6fr_1fr_auto] gap-2">
        <button type="button" class="se-btn grad h-9 justify-center" @click="notes.open()"><ScoreIcon name="draw" />{{ t('create.notes.draw') }}</button>
        <button type="button" class="se-btn h-9 justify-center" :disabled="props.extracting" @click="emit('fromSong')"><ScoreIcon name="song" />{{ t('create.notes.fromSong') }}</button>
        <button type="button" class="se-btn h-9 justify-center" @click="midiInput?.click()"><ScoreIcon name="midi" />MIDI</button>
      </div>
      <p v-if="!shownHere" class="text-[11.5px] text-text-dim">{{ t('create.notes.drawNote') }}</p>
      <div v-else class="flex justify-center">
        <button type="button" class="se-btn on" aria-pressed="true" @click="toggle"><ScoreIcon name="notes" />{{ t('create.notes.open') }}</button>
      </div>
    </template>

    <template v-else>
      <p class="text-[13px] text-text-dim">
        <b class="font-semibold text-text">{{ displayChord(s.key) }}</b> {{ minor ? t('score.chips.minor') : t('score.chips.major') }}
        · <b class="font-semibold text-text">{{ s.tempo }}</b> BPM · <b class="font-semibold text-text">{{ s.meter[0] }}/{{ s.meter[1] }}</b>
        · <b class="font-semibold text-text">{{ t('score.chips.bars', { n: s.bars }, s.bars) }}</b> ≈ {{ time }}
      </p>
      <OverviewStrip v-if="hasNotes" pick :frame="shownHere" @pick="(bar) => openAt(Math.max(0, bar - 2))" />
      <div v-if="s.sections.length" class="flex flex-wrap gap-1.5">
        <button
          v-for="sec in s.sections" :key="sec.id" type="button"
          class="se-ssec inline-flex items-baseline gap-1 hover:brightness-125" :style="{ background: SECTION_COLORS[sec.type][0], color: SECTION_COLORS[sec.type][1] }"
          :title="t('create.notes.openSection')" @click="openSection(sec)"
        >{{ sectionLabel(s, sec, t) }}<small class="text-[10px] font-medium opacity-70">{{ sec.bars }}</small></button>
      </div>
      <p v-if="remarks.length" class="flex items-start gap-2 text-xs text-text-dim">
        <span class="mt-px grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-[#eab308]/15 text-[#facc15]"><ScoreIcon name="warn" class="h-3 w-3" /></span>
        <span>{{ t('create.notes.remarks', { n: remarks.length, list: remarksText }, remarks.length) }}</span>
      </p>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="se-btn" :class="{ on: shownHere }" :aria-pressed="shownHere" @click="toggle"><ScoreIcon name="notes" />{{ t('create.notes.open') }}</button>
        <template v-if="!shownHere">
          <button type="button" class="se-btn" :disabled="props.extracting" @click="emit('fromSong')"><ScoreIcon name="song" />{{ t('create.notes.fromSongDots') }}</button>
          <button type="button" class="se-btn" @click="midiInput?.click()"><ScoreIcon name="midi" />{{ t('create.notes.importMidi') }}</button>
        </template>
      </div>
    </template>
    <p v-if="shownHere" class="flex items-start gap-2 rounded-lg bg-panel px-3 py-2 text-xs text-text-dim">
      <span class="text-accent1 rtl:-scale-x-100" aria-hidden="true">→</span><span><b class="font-medium text-text">{{ t('create.notes.openHere') }}</b> {{ t('create.notes.openNote', { button: createButton }) }}</span>
    </p>
  </div>
</template>
