<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Clip } from '../../audio/timelineTypes'
import type { MidiNote } from '../../audio/miniMidiPlayer'
import { parseAbcToMidi } from '../../audio/abcParser'
import { useEditorStore } from '../../stores/editor'

const props = defineProps<{
  clip: Clip
}>()

const emit = defineEmits<{
  'update-notes': [notes: MidiNote[]]
  'update-instrument': [instrument: 'sawtooth' | 'square' | 'sine' | 'triangle']
}>()

const store = useEditorStore()

const container = ref<HTMLDivElement | null>(null)

// Piano roll constants
const MIN_NOTE = 36 // C2
const MAX_NOTE = 96 // C7
const NOTE_COUNT = MAX_NOTE - MIN_NOTE + 1
const ROW_HEIGHT = 16

const BEATS_PER_BAR = 4
const PIXELS_PER_BEAT = 40

// Local state for dragging and editing
const localNotes = ref<MidiNote[]>([])
const scrollX = ref(0)
const scrollY = ref(0)

const durationSec = computed(() => props.clip.trimEnd - props.clip.trimStart)
// For simplicity, assume project BPM for grid
const bpm = computed(() => store.project.bpm || 120)
const bps = computed(() => bpm.value / 60)
const durationBeats = computed(() => durationSec.value * bps.value)
const gridWidth = computed(() => Math.max(800, durationBeats.value * PIXELS_PER_BEAT + 200))

// Sync local notes when clip notes change from outside (e.g. undo/redo)
watch(() => props.clip.notes, (newNotes) => {
  localNotes.value = JSON.parse(JSON.stringify(newNotes || []))
}, { immediate: true, deep: true })

function commitNotes() {
  emit('update-notes', JSON.parse(JSON.stringify(localNotes.value)))
}

function getNoteName(noteNumber: number) {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const octave = Math.floor(noteNumber / 12) - 1
  const name = noteNames[noteNumber % 12]
  return `${name}${octave}`
}

function isBlackKey(noteNumber: number) {
  const n = noteNumber % 12
  return n === 1 || n === 3 || n === 6 || n === 8 || n === 10
}

// Interaction state
let dragMode: 'move' | 'resize-start' | 'resize-end' | null = null
let draggedNoteIndex = -1
let dragStartX = 0
let dragStartBeat = 0
let dragStartDuration = 0

function onGridDoubleClick(evt: MouseEvent) {
  if (evt.target !== container.value?.querySelector('.grid-bg')) return
  const rect = (evt.target as HTMLElement).getBoundingClientRect()
  const x = evt.clientX - rect.left
  const y = evt.clientY - rect.top

  const beat = x / PIXELS_PER_BEAT
  const noteNumber = MAX_NOTE - Math.floor(y / ROW_HEIGHT)
  
  // Snap to nearest 1/4 beat (16th note)
  const snappedBeat = Math.floor(beat * 4) / 4
  const startSec = snappedBeat / bps.value

  localNotes.value.push({
    note: noteNumber,
    startSec,
    durationSec: (1/4) / bps.value,
    velocity: 100,
    channel: 0
  })
  commitNotes()
}

function onNotePointerDown(evt: PointerEvent, index: number, mode: 'move' | 'resize-start' | 'resize-end') {
  evt.stopPropagation()
  if (evt.button === 2) {
    // Right click to delete
    localNotes.value.splice(index, 1)
    commitNotes()
    return
  }
  
  dragMode = mode
  draggedNoteIndex = index
  dragStartX = evt.clientX
  const n = localNotes.value[index]
  dragStartBeat = n.startSec * bps.value
  dragStartDuration = n.durationSec * bps.value

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}

function onPointerMove(evt: PointerEvent) {
  if (!dragMode || draggedNoteIndex < 0) return
  const n = localNotes.value[draggedNoteIndex]
  
  const deltaX = evt.clientX - dragStartX
  const deltaBeats = deltaX / PIXELS_PER_BEAT
  
  // Snap to 1/16th notes (0.25 beats)
  const snappedDelta = Math.round(deltaBeats * 4) / 4

  if (dragMode === 'move') {
    const newBeat = Math.max(0, dragStartBeat + snappedDelta)
    n.startSec = newBeat / bps.value
  } else if (dragMode === 'resize-end') {
    const newDur = Math.max(0.25, dragStartDuration + snappedDelta)
    n.durationSec = newDur / bps.value
  } else if (dragMode === 'resize-start') {
    const newBeat = Math.max(0, dragStartBeat + snappedDelta)
    const newDur = Math.max(0.25, dragStartDuration - (newBeat - dragStartBeat))
    n.startSec = newBeat / bps.value
    n.durationSec = newDur / bps.value
  }
}

function onPointerUp(_evt: PointerEvent) {
  if (dragMode) {
    commitNotes()
    dragMode = null
    draggedNoteIndex = -1
  }
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
}

function onNoteContextMenu(evt: MouseEvent, index: number) {
  evt.preventDefault()
  localNotes.value.splice(index, 1)
  commitNotes()
}

function onPasteAbc() {
  const abc = window.prompt("Paste your ABC notation here:")
  if (!abc) return
  
  const parsed = parseAbcToMidi(abc, bpm.value)
  if (parsed.length > 0) {
    if (window.confirm(`Found ${parsed.length} notes. Overwrite existing notes? (Cancel to append)`)) {
      localNotes.value = parsed
    } else {
      localNotes.value.push(...parsed)
    }
    commitNotes()
  } else {
    window.alert("Could not find any recognizable notes in the provided ABC string.")
  }
}

</script>

<template>
  <div class="flex flex-col overflow-hidden bg-panel-2 font-sans text-text h-full rounded-lg border border-border">
    <div class="flex h-8 shrink-0 items-center justify-between border-b border-border/60 bg-panel px-3">
      <div class="flex items-center">
        <span class="text-xs font-semibold">{{ clip.sourceLabel || 'MIDI Clip' }}</span>
        <select 
          :value="clip.instrument || 'sawtooth'" 
          @change="emit('update-instrument', ($event.target as HTMLSelectElement).value as any)"
          class="ml-3 rounded border border-border bg-panel-2 px-2 py-0.5 text-xs text-text outline-none"
        >
          <option value="sawtooth">Sawtooth</option>
          <option value="square">Square</option>
          <option value="sine">Sine</option>
          <option value="triangle">Triangle</option>
        </select>
        <span class="ml-4 text-[11px] text-text-dim hidden sm:inline">Double-click to add, right-click to delete, drag edges to resize.</span>
      </div>
      <button 
        type="button" 
        class="rounded border border-accent1 px-2 py-0.5 text-[11px] text-accent1 hover:bg-accent1/10"
        @click="onPasteAbc"
      >
        Paste ABC
      </button>
    </div>
    
    <div class="flex min-h-0 flex-1 relative">
      <!-- Piano Keys -->
      <div 
        class="w-[50px] shrink-0 border-r border-border/60 relative overflow-hidden bg-panel z-10"
      >
        <div 
          class="absolute left-0 right-0 top-0"
          :style="{ transform: `translateY(${-scrollY}px)` }"
        >
          <div 
            v-for="n in NOTE_COUNT" 
            :key="n"
            class="border-b border-border/40 text-[9px] flex items-center px-1 absolute left-0 right-0"
            :class="isBlackKey(MAX_NOTE - n + 1) ? 'bg-panel-2 text-text-dim w-8 border-r border-border/40 rounded-r z-20' : 'bg-panel text-text z-0'"
            :style="{ top: ((n - 1) * ROW_HEIGHT) + 'px', height: ROW_HEIGHT + 'px' }"
          >
            {{ !isBlackKey(MAX_NOTE - n + 1) || (MAX_NOTE - n + 1) % 12 === 0 ? getNoteName(MAX_NOTE - n + 1) : '' }}
          </div>
        </div>
      </div>
      
      <!-- Grid -->
      <div 
        ref="container"
        class="flex-1 overflow-auto relative bg-[#161922]"
        @scroll="scrollY = ($event.target as HTMLElement).scrollTop; scrollX = ($event.target as HTMLElement).scrollLeft"
      >
        <div 
          class="grid-bg absolute top-0 left-0"
          :style="{ width: gridWidth + 'px', height: (NOTE_COUNT * ROW_HEIGHT) + 'px' }"
          @dblclick="onGridDoubleClick"
        >
          <!-- Horizontal lines (rows) -->
          <div 
            v-for="n in NOTE_COUNT" 
            :key="'row'+n"
            class="absolute left-0 right-0 border-b border-white/5 pointer-events-none"
            :class="isBlackKey(MAX_NOTE - n + 1) ? 'bg-white/5' : ''"
            :style="{ top: ((n - 1) * ROW_HEIGHT) + 'px', height: ROW_HEIGHT + 'px' }"
          ></div>
          
          <!-- Vertical lines (beats) -->
          <div 
            v-for="b in Math.ceil(gridWidth / PIXELS_PER_BEAT)" 
            :key="'beat'+b"
            class="absolute top-0 bottom-0 border-r pointer-events-none"
            :class="(b - 1) % BEATS_PER_BAR === 0 ? 'border-white/20' : 'border-white/5'"
            :style="{ left: ((b - 1) * PIXELS_PER_BEAT) + 'px', width: PIXELS_PER_BEAT + 'px' }"
          ></div>
          
          <!-- Notes -->
          <div
            v-for="(note, idx) in localNotes"
            :key="idx"
            class="absolute rounded bg-accent1 border border-accent1 shadow-sm cursor-move group hover:brightness-110 flex items-center"
            :style="{
              left: (note.startSec * bps * PIXELS_PER_BEAT) + 'px',
              top: ((MAX_NOTE - note.note) * ROW_HEIGHT) + 'px',
              width: (note.durationSec * bps * PIXELS_PER_BEAT) + 'px',
              height: (ROW_HEIGHT - 1) + 'px'
            }"
            @pointerdown="onNotePointerDown($event, idx, 'move')"
            @contextmenu="onNoteContextMenu($event, idx)"
          >
            <!-- Left resize handle -->
            <div 
              class="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-white/20"
              @pointerdown="onNotePointerDown($event, idx, 'resize-start')"
            ></div>
            <!-- Right resize handle -->
            <div 
              class="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-white/20"
              @pointerdown="onNotePointerDown($event, idx, 'resize-end')"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
