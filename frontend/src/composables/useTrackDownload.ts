import { ref } from 'vue'
import { useSettingsStore } from '../stores/settings'

export type DownloadFormat = 'mp3' | 'flac' | 'wav'
export const DOWNLOAD_FORMATS: DownloadFormat[] = ['mp3', 'flac', 'wav']

const KEY = 'remiqora.downloadFormat'

function readStored(): DownloadFormat {
  try {
    const v = localStorage.getItem(KEY)
    if (v && (DOWNLOAD_FORMATS as string[]).includes(v)) return v as DownloadFormat
  } catch {
    // storage blocked: the default
  }
  return 'mp3'
}

/** The format the Download buttons use; remembered between visits. Shared, so every button shows the same one. */
export const downloadFormat = ref<DownloadFormat>(readStored())

export function setDownloadFormat(format: DownloadFormat): void {
  downloadFormat.value = format
  try {
    localStorage.setItem(KEY, format)
  } catch {
    // not remembered, still used for this session
  }
}

/** The file name with the extension of the chosen format. */
function withExtension(filename: string, format: DownloadFormat): string {
  const dot = filename.lastIndexOf('.')
  return `${dot > 0 ? filename.slice(0, dot) : filename}.${format}`
}

/**
 * Downloads a saved track through the server, which writes the tags (title, artist, lyrics, the
 * AI-generated marks) into a copy, converted to `format` (the remembered one by default). The artist name is
 * asked for once, if it is not set yet; skipping the question still downloads the track, just without an artist tag.
 * A plain link is used on purpose: the browser's own download handles big files without holding them in memory,
 * and a failed conversion (the server answers 503) shows up as a failed download there.
 */
export async function downloadSavedTrack(trackId: number, filename: string, format: DownloadFormat = downloadFormat.value): Promise<void> {
  // the artist question is a courtesy: a settings failure still downloads, just without asking
  try {
    await useSettingsStore().ensureArtist()
  } catch {
    // no artist tag this time
  }
  const a = document.createElement('a')
  a.href = `/api/tracks/${trackId}/download?format=${format}`
  a.download = withExtension(filename, format)
  a.click()
}
