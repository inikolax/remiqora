import { acceptHMRUpdate, defineStore } from 'pinia'
import { claimPlayback } from '../composables/audioPlayback'

/** What the player at the bottom of the window plays: any take or library track. */
export interface PlayerTrack {
  key: string
  title: string
  /** The line under the title: the engine and when it was made. */
  sub: string
  src: string
  durationSec: number | null
  dbId: number | null
  filename: string | null
}

// One <audio> for the whole app, outside the store: an element is not something to make reactive.
let audio: HTMLAudioElement | null = null

export const usePlayerStore = defineStore('player', {
  state: () => ({
    track: null as PlayerTrack | null,
    playing: false,
    time: 0,
    duration: 0,
    /** The list playback was started from: what Next and Previous walk through. */
    queue: [] as PlayerTrack[],
  }),
  getters: {
    /** 0..1 through the track. */
    progress(state): number {
      const total = state.duration || state.track?.durationSec || 0
      return total ? Math.min(1, state.time / total) : 0
    },
    total(state): number {
      return state.duration || state.track?.durationSec || 0
    },
    /** Where the track that plays sits in the queue; -1 when it is not from it. */
    position(state): number {
      const key = state.track?.key
      return key ? state.queue.findIndex((x) => x.key === key) : -1
    },
    hasNext(): boolean {
      return this.position >= 0 && this.position < this.queue.length - 1
    },
    hasPrev(): boolean {
      return this.position > 0
    },
  },
  actions: {
    _audio(): HTMLAudioElement {
      if (audio) return audio
      audio = new Audio()
      audio.preload = 'metadata'
      audio.addEventListener('timeupdate', () => { this.time = audio!.currentTime })
      audio.addEventListener('loadedmetadata', () => { this.duration = Number.isFinite(audio!.duration) ? audio!.duration : 0 })
      audio.addEventListener('play', () => { this.playing = true })
      audio.addEventListener('pause', () => { this.playing = false })
      // the end of a track: on to the next one of the queue, if there is one
      audio.addEventListener('ended', () => {
        if (this.hasNext) this.next()
        else { this.playing = false; this.time = 0 }
      })
      return audio
    },
    isCurrent(key: string): boolean {
      return this.track?.key === key
    },
    /**
     * Plays the track; the one already playing pauses, a paused one carries on. `queue` is the list it was
     * started from, in the order shown.
     */
    toggle(track: PlayerTrack, queue?: PlayerTrack[]): void {
      const el = this._audio()
      if (queue) this.queue = [...queue]
      if (this.track?.key === track.key) {
        if (el.paused) { claimPlayback(el); void el.play() } else el.pause()
        return
      }
      this._start(track)
    },
    /**
     * Another take of the same song from the same second: what an A/B comparison needs. Starts `track` and moves
     * it to `atSec` once it has loaded (or to its end, when it is shorter).
     */
    switchTo(track: PlayerTrack, queue: PlayerTrack[] | undefined, atSec: number): void {
      if (queue) this.queue = [...queue]
      this._start(track, atSec)
    },
    _start(track: PlayerTrack, atSec = 0): void {
      const el = this._audio()
      this.track = track
      this.time = 0
      this.duration = 0
      el.src = track.src
      if (atSec > 0) {
        el.addEventListener('loadedmetadata', () => {
          el.currentTime = Math.min(atSec, Number.isFinite(el.duration) ? Math.max(0, el.duration - 0.5) : atSec)
          this.time = el.currentTime
        }, { once: true })
      }
      claimPlayback(el)
      void el.play().catch(() => { this.playing = false })
    },
    next(): void {
      if (this.hasNext) this._start(this.queue[this.position + 1])
    },
    /** Back to the start of the track; from its first seconds, to the track before it. */
    prev(): void {
      if (this.hasPrev && this.time < 3) this._start(this.queue[this.position - 1])
      else this.seek(0)
    },
    /** `fraction` 0..1 of the track. */
    seek(fraction: number): void {
      const el = this._audio()
      const total = this.total
      if (!this.track || !total) return
      el.currentTime = Math.max(0, Math.min(1, fraction)) * total
      this.time = el.currentTime
    },
    pause(): void {
      audio?.pause()
    },
    close(): void {
      audio?.pause()
      this.track = null
      this.queue = []
      this.time = 0
      this.duration = 0
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePlayerStore, import.meta.hot))
}
