import { useSettingsStore } from '../stores/settings'

/**
 * Downloads a saved track through the server, which writes the tags (title, artist, lyrics, the
 * AI-generated marks) into a copy. The artist name is asked for once, if it is not set yet; skipping
 * the question still downloads the track, just without an artist tag.
 */
export async function downloadSavedTrack(trackId: number, filename: string): Promise<void> {
  await useSettingsStore().ensureArtist()
  const a = document.createElement('a')
  a.href = `/api/tracks/${trackId}/download`
  a.download = filename
  a.click()
}
