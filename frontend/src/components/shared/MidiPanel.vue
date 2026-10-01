<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import * as midiApi from '../../api/midi'
import type { MidiSource, MidiStatus } from '../../api/midi'
import { drawPianoRoll, parseMidiBytes, playMidiNotes } from '../../audio/miniMidiPlayer'
import type { MidiParsed, MidiSynthHandle } from '../../audio/miniMidiPlayer'

const props = defineProps<{ trackId: number }>()
const { t } = useI18n()

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

async function start(source: MidiSource, force = false) {
  actionError.value = null
  try {
    status.value = await midiApi.startTranscription(props.trackId, source, force)
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : String(e)
    return
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
      class="flex w-full items-start justify-between gap-3 px-3 py-2.5 text-left"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      <span class="min-w-0">
        <span class="block text-sm font-semibold text-text">{{ t('midiPanel.title') }}</span>
        <span class="mt-0.5 block text-xs text-text-dim">{{ t('midiPanel.hint') }}</span>
      </span>
      <span class="mt-1 shrink-0 text-text-dim" aria-hidden="true">{{ expanded ? '▾' : '▸' }}</span>
    </button>

    <div v-if="expanded" class="space-y-2 border-t border-border/60 p-3">
      <div v-if="actionError" class="rounded-lg bg-status-failed/10 p-2 text-xs text-status-failed">{{ actionError }}</div>

      <div
        v-for="source in status?.available || []"
        :key="source"
        class="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-panel p-2"
      >
        <span class="min-w-24 text-xs text-text-dim">{{ SOURCE_LABELS[source] }}</span>

        <template v-if="isBusy(source)">
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
          <button type="button" class="text-xs text-text-dim hover:underline" @click="start(source, true)">{{ t('midiPanel.recreate') }}</button>

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

        <template v-else>
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
