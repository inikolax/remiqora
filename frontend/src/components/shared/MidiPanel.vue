<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import * as midiApi from '../../api/midi'
import type { MidiSource, MidiStatus } from '../../api/midi'
import { drawPianoRoll, parseMidiBytes, playMidiNotes } from '../../audio/miniMidiPlayer'
import type { MidiParsed, MidiSynthHandle } from '../../audio/miniMidiPlayer'
import NotInstalled from './NotInstalled.vue'
import { useFeaturesStore } from '../../stores/features'
import { useYue2Store } from '../../stores/yue2'
import { notesToAbc } from '../../audio/abcWriter'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps<{
  trackId: number
  /** The track's tempo when known (its style or settings say it): MuScriptor's MIDI keeps a default tempo, so the
   * score's bars line up with the music only with the real one. */
  bpm?: number | null
}>()
const { t } = useI18n()
/** Transcription runs on the YuE2 engine: without it, MIDI made earlier still plays, nothing new can start. */
const features = useFeaturesStore()

const SOURCE_LABELS = computed<Record<MidiSource, string>>(() => ({
  full: t('midiPanel.sourceFull'),
  vocals: t('library.stems.vocals'),
  drums: t('library.stems.drums'),
  bass: t('library.stems.bass'),
  other: t('library.stems.other'),
}))

const status = ref<MidiStatus | null>(null)
const expanded = ref(true)
const actionError = ref<string | null>(null)

const midiCache = ref<Record<string, MidiParsed>>({})
const playingSource = ref<string | null>(null)
const openRollSource = ref<string | null>(null)
let activeSynth: MidiSynthHandle | null = null

let pollTimer: ReturnType<typeof setTimeout> | null = null

function isBusy(source: MidiSource): boolean {
  const s = status.value?.sources[source]?.status
  return s === 'queued' || s === 'running'
}

function anyBusy(): boolean {
  return !!status.value && status.value.available.some(isBusy)
}

function clearPoll() {
  if (pollTimer != null) {
    clearTimeout(pollTimer)
    pollTimer = null
  }
}

function schedulePoll() {
  clearPoll()
  pollTimer = setTimeout(async () => {
    try {
      status.value = await midiApi.getMidiStatus(props.trackId)
    } catch {
      // transient network error - keep polling on the same schedule
    }
    if (anyBusy()) schedulePoll()
  }, 2000)
}

/** The source whose start request is out: the server first starts YuE2 when it is not running (MuScriptor lives in
 *  its server), which takes a while, so the row shows it is waiting instead of a button that seems to do nothing. */
const launching = ref<MidiSource | null>(null)

async function start(source: MidiSource, force = false) {
  if (launching.value) return
  actionError.value = null
  launching.value = source
  try {
    status.value = await midiApi.startTranscription(props.trackId, source, force)
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : String(e)
    return
  } finally {
    launching.value = null
  }
  schedulePoll()
}

async function cancel(source: MidiSource) {
  clearPoll()
  status.value = await midiApi.cancelTranscription(props.trackId, source)
}

async function removeAll() {
  if (!window.confirm(t('midiPanel.confirmDeleteAll'))) return
  activeSynth?.stop()
  activeSynth = null
  playingSource.value = null
  await midiApi.deleteMidi(props.trackId)
  status.value = await midiApi.getMidiStatus(props.trackId)
}

function download(source: MidiSource) {
  const url = status.value?.urls[source]
  if (!url) return
  const a = document.createElement('a')
  a.href = url
  a.download = `${source}_${props.trackId}.mid`
  a.click()
}

async function getOrLoadMidi(source: MidiSource): Promise<MidiParsed | null> {
  if (midiCache.value[source]) return midiCache.value[source]
  const url = status.value?.urls[source]
  if (!url) return null
  try {
    const resp = await fetch(url)
    const buf = await resp.arrayBuffer()
    const parsed = parseMidiBytes(buf)
    midiCache.value[source] = parsed
    return parsed
  } catch {
    return null
  }
}

async function togglePlayMidi(source: MidiSource) {
  if (playingSource.value === source) {
    activeSynth?.stop()
    activeSynth = null
    playingSource.value = null
    return
  }

  activeSynth?.stop()
  activeSynth = null
  playingSource.value = null

  const parsed = await getOrLoadMidi(source)
  if (!parsed || parsed.notes.length === 0) return

  playingSource.value = source
  activeSynth = playMidiNotes(parsed.notes, 0, () => {
    if (playingSource.value === source) {
      playingSource.value = null
      activeSynth = null
    }
  })
}

async function toggleRoll(source: MidiSource) {
  if (openRollSource.value === source) {
    openRollSource.value = null
    return
  }
  openRollSource.value = source
  const parsed = await getOrLoadMidi(source)
  if (parsed) {
    setTimeout(() => {
      const canvas = document.getElementById(`roll-${props.trackId}-${source}`) as HTMLCanvasElement
      if (canvas) drawPianoRoll(canvas, parsed.notes, parsed.durationSec)
    }, 60)
  }
}

// ---- MIDI -> a score for YuE2: the vocals as the melody, bass and the rest as the accompaniment ----
const yue2 = useYue2Store()
const route = useRoute()
const router = useRouter()
const scoreNote = ref<string | null>(null)
const canMakeScore = computed(() => {
  const s = status.value?.sources
  return !!s && (s.vocals?.status === 'done' || s.full?.status === 'done')
})
async function toYueScore() {
  actionError.value = null
  scoreNote.value = null
  const s = status.value?.sources
  if (!s) return
  type N = { note: number; startSec: number; durationSec: number; channel: number }
  const notes: N[] = []
  let melodyChannel: number | undefined
  let tempo = 0
  const add = async (source: MidiSource, channel: number | null): Promise<boolean> => {
    if (s[source]?.status !== 'done') return false
    const parsed = await getOrLoadMidi(source)
    if (!parsed) return false
    tempo = tempo || parsed.tempoBpm
    for (const n of parsed.notes) if (n.channel !== 9) notes.push({ ...n, channel: channel ?? n.channel })
    return true
  }
  let from: string
  if (await add('vocals', 0)) {
    melodyChannel = 0
    const acc = [(await add('bass', 1)) && 'bass', (await add('other', 2)) && 'other'].filter(Boolean)
    from = acc.length ? t('midiPanel.scoreFromStems') : t('midiPanel.scoreFromVocals')
  } else {
    await add('full', null)
    from = t('midiPanel.scoreFromFull')
  }
  if (!notes.length) {
    actionError.value = t('midiPanel.scoreEmpty')
    return
  }
  const bpm = props.bpm && props.bpm > 0 ? props.bpm : tempo || 120
  yue2.requestInsertAbc(notesToAbc(notes, { bpm, melodyChannel }))
  scoreNote.value = `${from} · ${Math.round(bpm)} BPM`
  if (!route.path.startsWith('/yue2')) await router.push('/yue2')
}

async function refresh() {
  try {
    status.value = await midiApi.getMidiStatus(props.trackId)
    if (anyBusy()) schedulePoll()
  } catch {
    status.value = null
  }
}

onMounted(refresh)
onBeforeUnmount(() => {
  clearPoll()
  activeSynth?.stop()
})
</script>

<template>
  <div class="rounded-lg border border-border bg-panel-2">
    <button
      type="button"
      class="flex w-full items-start justify-between gap-3 px-3 py-2.5 text-start"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      <span class="min-w-0">
        <span class="block text-sm font-semibold text-text">{{ t('midiPanel.title') }}</span>
        <span class="mt-0.5 block text-xs text-text-dim">{{ t('midiPanel.hint') }}</span>
      </span>
      <span class="mt-1 shrink-0 text-text-dim" :class="!expanded && 'rtl:-scale-x-100'" aria-hidden="true">{{ expanded ? '▾' : '▸' }}</span>
    </button>

    <div v-if="expanded" class="space-y-2 border-t border-border/60 p-3">
      <NotInstalled v-if="!features.has('yue2')" feature="yue2" compact />
      <div v-if="actionError" class="rounded-lg bg-status-failed/10 p-2 text-xs text-status-failed">{{ actionError }}</div>
      <div v-if="canMakeScore" class="flex flex-wrap items-center gap-2 rounded-lg border border-accent1/30 bg-accent1/5 p-2">
        <button type="button" class="accent-gradient rounded-lg px-2.5 py-1 text-xs font-medium text-white" :title="t('midiPanel.toScoreHint')" @click="toYueScore">{{ t('midiPanel.toScore') }}</button>
        <span class="text-xs text-text-dim">{{ scoreNote ? t('midiPanel.scoreInserted', { from: scoreNote }) : status?.sources.vocals?.status === 'done' ? t('midiPanel.toScoreHint') : t('midiPanel.betterWithVocals') }}</span>
      </div>

      <div
        v-for="source in status?.available || []"
        :key="source"
        class="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-panel p-2"
      >
        <span class="min-w-24 text-xs text-text-dim">{{ SOURCE_LABELS[source] }}</span>

        <span v-if="launching === source" class="text-xs text-text-dim" role="status">{{ t('midiPanel.queued') }}</span>
        <template v-else-if="isBusy(source)">
          <span class="text-xs text-text-dim">
            {{ status?.sources[source].status === 'queued' ? t('midiPanel.queued') : t('midiPanel.running') }}
          </span>
          <button type="button" class="text-xs text-text-dim hover:text-status-failed" @click="cancel(source)">{{ t('midiPanel.cancel') }}</button>
        </template>

        <template v-else-if="status?.sources[source].status === 'done'">
          <button
            type="button"
            class="rounded px-2 py-0.5 text-xs font-medium"
            :class="playingSource === source ? 'bg-status-failed text-white' : 'accent-gradient text-white'"
            @click="togglePlayMidi(source)"
          >
            {{ playingSource === source ? t('midiPanel.stop') : t('midiPanel.listen') }}
          </button>
          <button
            type="button"
            class="rounded border border-border bg-panel px-2 py-0.5 text-xs text-text hover:bg-panel-2"
            @click="toggleRoll(source)"
          >
            {{ t('midiPanel.notes') }}
          </button>
          <button type="button" class="text-xs text-accent1 hover:underline" @click="download(source)">{{ t('midiPanel.download') }}</button>
          <button v-if="features.has('yue2')" type="button" class="text-xs text-text-dim hover:underline" @click="start(source, true)">{{ t('midiPanel.recreate') }}</button>

          <div v-if="openRollSource === source" class="mt-2 w-full space-y-1">
            <div class="flex items-center justify-between text-xs text-text-dim">
              <span>{{ t('midiPanel.pianoRoll') }}</span>
              <span v-if="midiCache[source]">{{ t('midiPanel.notesCount', { count: midiCache[source].notes.length, bpm: midiCache[source].tempoBpm }) }}</span>
            </div>
            <canvas
              :id="`roll-${trackId}-${source}`"
              class="h-28 w-full rounded border border-border/80 bg-[#161922]"
            />
          </div>
        </template>

        <template v-else-if="features.has('yue2')">
          <button
            type="button"
            class="accent-gradient rounded-lg px-2.5 py-1 text-xs font-medium text-white"
            @click="start(source)"
          >
            {{ t('midiPanel.recognize') }}
          </button>
          <span v-if="status?.sources[source].status === 'cancelled'" class="text-xs text-text-dim">{{ t('midiPanel.cancelled') }}</span>
        </template>

        <span
          v-if="status?.sources[source].status === 'failed' && status.sources[source].error"
          class="w-full text-xs text-status-failed"
          :title="status.sources[source].error || ''"
        >
          {{ status.sources[source].error }}
        </span>
      </div>

      <button
        v-if="status && Object.keys(status.urls).length > 0"
        type="button"
        class="rounded-lg border border-status-failed/40 px-2.5 py-1 text-xs font-medium text-status-failed"
        @click="removeAll"
      >
        {{ t('midiPanel.deleteAll') }}
      </button>
    </div>
  </div>
</template>
