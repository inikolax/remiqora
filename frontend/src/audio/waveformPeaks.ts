/**
 * Min/max peaks of an AudioBuffer in fixed blocks, computed once per buffer.
 *
 * A clip redraws its waveform on every trim step and zoom change; scanning the
 * samples each time is too slow for that, reading a few blocks per pixel is not.
 */
export const PEAK_BLOCK = 64

export interface BufferPeaks {
  min: Float32Array
  max: Float32Array
}

const cache = new WeakMap<AudioBuffer, BufferPeaks>()

export function bufferPeaks(buffer: AudioBuffer): BufferPeaks {
  const cached = cache.get(buffer)
  if (cached) return cached
  const blocks = Math.ceil(buffer.length / PEAK_BLOCK)
  const min = new Float32Array(blocks)
  const max = new Float32Array(blocks)
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch)
    for (let b = 0; b < blocks; b++) {
      const end = Math.min(data.length, (b + 1) * PEAK_BLOCK)
      let lo = min[b]
      let hi = max[b]
      for (let i = b * PEAK_BLOCK; i < end; i++) {
        const v = data[i]
        if (v < lo) lo = v
        else if (v > hi) hi = v
      }
      min[b] = lo
      max[b] = hi
    }
  }
  const peaks = { min, max }
  cache.set(buffer, peaks)
  return peaks
}
