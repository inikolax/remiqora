<script setup lang="ts">
/** The note editor's line icons (24px grid, stroked with currentColor). */
const props = defineProps<{ name: string; fill?: boolean }>()
const PATHS: Record<string, string> = {
  cursor: '<path d="M4 3l7 17 2.5-7.5L21 10z"/>',
  pencil: '<path d="M17 3l4 4L8 20l-5 1 1-5z"/><path d="M14 6l4 4"/>',
  eraser: '<path d="M7 21h13"/><path d="M3.5 14.5l9-9a2 2 0 012.8 0l3.2 3.2a2 2 0 010 2.8L11 19H7.5z"/><path d="M8.5 9.5l6 6"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12"/>',
  play: '<path d="M7 4l13 8-13 8z"/>',
  pause: '<path d="M7 4h4v16H7zM14 4h4v16h-4z"/>',
  back: '<path d="M19 5L9 12l10 7z"/><path d="M5 5v14"/>',
  loop: '<path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 014-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 01-4 4H3"/>',
  metro: '<path d="M9 3h6l4 18H5z"/><path d="M12 15l5-8"/><path d="M7.5 15h9"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 010 10h-3"/>',
  redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H9a5 5 0 000 10h3"/>',
  max: '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>',
  min: '<path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  up: '<path d="M6 15l6-6 6 6"/>',
  right: '<path d="M9 6l6 6-6 6"/>',
  import: '<path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/>',
  check: '<path d="M5 12l5 5L20 7"/>',
  warn: '<path d="M12 8v5"/><path d="M12 16.5v.5"/>',
  info: '<path d="M12 11v6"/><path d="M12 7.5v.5"/>',
  wand: '<path d="M15 4V2M15 10V8M11 6h2M17 6h2"/><path d="M3 21l12-12"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1"/>',
  song: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/>',
  midi: '<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/><path d="M9 17v-4l3 2 3-2v4"/>',
  piano: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 5v14M13 5v14M18 5v14"/>',
  paste: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4h6v3H9z"/>',
  draw: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 15h4M9 11h5M12 8h5"/>',
  lock: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  zoomin: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5M8 11h6M11 8v6"/>',
  zoomout: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5M8 11h6"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  notes: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  rest: '<path d="M10 3l4 4.5-3.5 4 4 4.5c-2.5-1-4.5.5-3 4.5"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
}
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <svg viewBox="0 0 24 24" aria-hidden="true" :fill="props.fill ? 'currentColor' : 'none'" :stroke="props.fill ? 'none' : 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="PATHS[props.name] ?? ''"></svg>
</template>
