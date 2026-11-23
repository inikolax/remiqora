import { acceptHMRUpdate, defineStore } from 'pinia'
import * as tracksApi from '../api/tracks'
import type { SavedTrack } from '../api/tracks'
import * as collectionsApi from '../api/collections'
import type { Collection } from '../api/collections'
import * as tagsApi from '../api/tags'
import type { TagInfo } from '../api/tags'
import type { CoverCaption } from '../covers/caption/types'

/** What a captioned track's default texts come from. */
export interface CaptionMeta { title: string; createdAt: number }
/** The part of a track its cover and caption are read from. */
export type CaptionTrack = Pick<SavedTrack, 'id' | 'cover_url' | 'cover_caption' | 'cover_captioned_url'> & Partial<Pick<SavedTrack, 'title' | 'created_at'>>

const fail = (err: unknown): string => (err instanceof Error ? err.message : String(err))
/** Tags are one regardless of case: "Rock" and "rock" are the same tag. */
export const sameTag = (a: string, b: string): boolean => a.toLocaleLowerCase() === b.toLocaleLowerCase()
/** A tag as the server keeps it: no leading #, whitespace collapsed, at most 40 characters. */
export const cleanTag = (raw: string): string => raw.replace(/^#+/, '').replace(/\s+/g, ' ').trim().slice(0, 40).trim()
const byName = (a: string, b: string): number => a.localeCompare(b, undefined, { sensitivity: 'base' })

/**
 * What the user marked: favourite tracks (the star), collections and tags, and how many tracks wait in the trash.
 * One place for it, so the session, the library and the player show the same star for the same track.
 */
export const useMarksStore = defineStore('marks', {
  state: () => ({
    /** track id -> true for a favourite. */
    favorites: {} as Record<number, boolean>,
    collections: [] as Collection[],
    /** track id -> its tags (only tracks that have some). */
    tags: {} as Record<number, string[]>,
    /** Every tag in the library with its count, from the server. */
    tagList: [] as TagInfo[],
    /** Tracks in the trash. */
    trashCount: 0,
    /** track id -> its album cover's url (only tracks that have one; shown only while covers are on). */
    covers: {} as Record<number, string>,
    /** track id -> the caption over its cover (only tracks that have one). */
    captions: {} as Record<number, CoverCaption>,
    /** track id -> its baked captioned JPEG while fresh (a caption without one waits to be baked again). */
    captioned: {} as Record<number, string>,
    /** track id -> what a captioned track's default texts come from (its title and when it was made). */
    captionMeta: {} as Record<number, CaptionMeta>,
    loaded: false,
    error: '',
  }),
  getters: {
    isFavorite: (state) => (trackId: number | null | undefined): boolean => trackId != null && state.favorites[trackId] === true,
    favoriteCount: (state): number => Object.keys(state.favorites).length,
    collectionsOf: (state) => (trackId: number): Collection[] => state.collections.filter((c) => c.track_ids.includes(trackId)),
    tagsOf: (state) => (trackId: number): string[] => state.tags[trackId] ?? [],
    coverOf: (state) => (trackId: number | null | undefined): string | null => (trackId != null ? state.covers[trackId] ?? null : null),
    captionOf: (state) => (trackId: number | null | undefined): CoverCaption | null => (trackId != null ? state.captions[trackId] ?? null : null),
    hasTag: (state) => (trackId: number, tag: string): boolean => (state.tags[trackId] ?? []).some((x) => sameTag(x, tag)),
  },
  actions: {
    /** Reads the tracks (their stars with them) and the collections; gives the tracks back to the caller. */
    async load(): Promise<SavedTrack[]> {
      const [tracks, collections, tagList, trash] = await Promise.all([
        tracksApi.listTracks(), collectionsApi.listCollections(),
        // an older backend has no tags and no trash yet: the library still opens
        tagsApi.listTags().catch(() => [] as TagInfo[]), tracksApi.listTrash().catch(() => [] as SavedTrack[]),
      ])
      const favorites: Record<number, boolean> = {}
      const tags: Record<number, string[]> = {}
      const covers: Record<number, string> = {}
      for (const t of tracks) {
        if (t.favorite) favorites[t.id] = true
        if (t.tags?.length) tags[t.id] = t.tags
        if (t.cover_url) covers[t.id] = t.cover_url
      }
      this.covers = covers
      for (const t of tracks) this.applyCaption(t)
      // tracks gone from the list (trashed, deleted) leave their captions
      const ids = new Set(tracks.map((t) => t.id))
      for (const id of Object.keys(this.captions).map(Number)) if (!ids.has(id)) this.dropCaption(id)
      this.favorites = favorites
      this.tags = tags
      this.collections = collections
      this.tagList = tagList
      this.trashCount = trash.length
      this.loaded = true
      return tracks
    },
    /** A track's cover as the server has it now (null: none). */
    applyCover(trackId: number, url: string | null): void {
      if (url) this.covers[trackId] = url
      else delete this.covers[trackId]
    },
    /** The covers of tracks a page read on its own (the home page's list, an engine's takes). */
    noteCovers(tracks: CaptionTrack[]): void {
      for (const t of tracks) {
        if ('cover_url' in t) this.applyCover(t.id, t.cover_url ?? null)
        this.applyCaption(t)
      }
    },
    /**
     * A track's caption as the server has it. Its baked file is kept only while it still shows what the caption
     * draws now: a track renamed since (its caption on the default title) counts as stale too, so the covers
     * store bakes it again.
     */
    applyCaption(track: CaptionTrack): void {
      if (!('cover_caption' in track)) return
      const cap = track.cover_caption ?? null
      if (!cap) { this.dropCaption(track.id); return }
      const before = this.captionMeta[track.id]
      const meta: CaptionMeta = {
        title: track.title ?? before?.title ?? '',
        createdAt: track.created_at ? new Date(track.created_at).getTime() || 0 : before?.createdAt ?? 0,
      }
      const renamed = !!before && before.title !== meta.title && cap.showTitle && !cap.title?.trim()
      this.captions[track.id] = cap
      this.captionMeta[track.id] = meta
      if (track.cover_captioned_url && !renamed) this.captioned[track.id] = track.cover_captioned_url
      else delete this.captioned[track.id]
    },
    dropCaption(trackId: number): void {
      delete this.captions[trackId]
      delete this.captioned[trackId]
      delete this.captionMeta[trackId]
    },
    /** The baked file no longer shows what the caption draws (the artist name changed): bake it again. */
    markCaptionStale(trackId: number): void {
      delete this.captioned[trackId]
    },
    async refreshTags(): Promise<void> {
      try {
        this.tagList = await tagsApi.listTags()
      } catch {
        // the list keeps what it had; the next load fixes it
      }
    },
    /** Takes a track's marks as the server returned them: the star, the tags and the collections it is in. */
    applyTrack(track: SavedTrack): void {
      if (track.favorite) this.favorites[track.id] = true
      else delete this.favorites[track.id]
      if (track.tags?.length) this.tags[track.id] = track.tags
      else delete this.tags[track.id]
      if ('cover_url' in track) this.applyCover(track.id, track.cover_url ?? null)
      this.applyCaption(track)
      const ids = track.collections ?? []
      for (const c of this.collections) {
        const inIt = c.track_ids.includes(track.id)
        const should = ids.includes(c.id)
        if (should && !inIt) c.track_ids.push(track.id)
        else if (!should && inIt) c.track_ids = c.track_ids.filter((x) => x !== track.id)
      }
    },
    /**
     * One action on many tracks; the marks follow what the server returns. Gives back the tracks as they are now,
     * or null (with `error` set) when the server refused.
     */
    async bulk(ids: number[], action: tracksApi.BulkAction, extra: { tag?: string; collection_id?: number } = {}): Promise<SavedTrack[] | null> {
      if (!ids.length) return []
      this.error = ''
      let result: SavedTrack[]
      let missing: number[]
      try {
        const resp = await tracksApi.bulkTracks(ids, action, extra)
        result = resp.data
        missing = resp.missing ?? []
      } catch (err) {
        this.error = fail(err)
        return null
      }
      if (action === 'trash') {
        for (const t of result) this.forget(t.id)
        this.trashCount += result.length
      } else if (action === 'restore') {
        for (const t of result) this.applyTrack(t)
        this.trashCount = Math.max(0, this.trashCount - result.length)
      } else if (action === 'purge') {
        this.trashCount = Math.max(0, this.trashCount - (ids.length - missing.length))
      } else {
        for (const t of result) this.applyTrack(t)
      }
      if (action === 'trash' || action === 'restore' || action === 'tag' || action === 'untag') void this.refreshTags()
      return result
    },
    /** Replaces one track's tags. */
    async setTags(trackId: number, tags: string[]): Promise<boolean> {
      this.error = ''
      try {
        this.applyTrack(await tracksApi.setTrackTags(trackId, tags))
      } catch (err) {
        this.error = fail(err)
        return false
      }
      void this.refreshTags()
      return true
    },
    /** Renames a tag everywhere; the name it has now, or null. */
    async renameTag(name: string, to: string): Promise<string | null> {
      this.error = ''
      try {
        const info = await tagsApi.renameTag(name, to)
        for (const [id, list] of Object.entries(this.tags)) {
          if (!list.some((x) => sameTag(x, name))) continue
          const next = list.filter((x) => !sameTag(x, name) && !sameTag(x, info.name))
          next.push(info.name)
          this.tags[Number(id)] = next.sort(byName)
        }
        await this.refreshTags()
        return info.name
      } catch (err) {
        this.error = fail(err)
        return null
      }
    },
    /** Takes a tag off every track. */
    async deleteTag(name: string): Promise<boolean> {
      this.error = ''
      try {
        await tagsApi.deleteTag(name)
      } catch (err) {
        this.error = fail(err)
        return false
      }
      for (const [id, list] of Object.entries(this.tags)) {
        const next = list.filter((x) => !sameTag(x, name))
        if (next.length) this.tags[Number(id)] = next
        else delete this.tags[Number(id)]
      }
      this.tagList = this.tagList.filter((x) => !sameTag(x.name, name))
      return true
    },
    async loadCollections(): Promise<void> {
      this.collections = await collectionsApi.listCollections()
    },
    /** Flips the star at once and tells the server; put back if the server refuses. */
    async toggleFavorite(trackId: number): Promise<void> {
      const next = !this.favorites[trackId]
      const apply = (on: boolean) => {
        if (on) this.favorites[trackId] = true
        else delete this.favorites[trackId]
      }
      apply(next)
      this.error = ''
      try {
        await tracksApi.setFavorite(trackId, next)
      } catch (err) {
        apply(!next)
        this.error = err instanceof Error ? err.message : String(err)
      }
    },
    async createCollection(name: string): Promise<Collection | null> {
      this.error = ''
      try {
        const created = await collectionsApi.createCollection(name)
        this.collections.push(created)
        return created
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
        return null
      }
    },
    async renameCollection(id: number, name: string): Promise<void> {
      this.error = ''
      try {
        this._replace(await collectionsApi.renameCollection(id, name))
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
      }
    },
    async deleteCollection(id: number): Promise<boolean> {
      this.error = ''
      try {
        await collectionsApi.deleteCollection(id)
        this.collections = this.collections.filter((c) => c.id !== id)
        return true
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
        return false
      }
    },
    async setInCollection(id: number, trackId: number, present: boolean): Promise<void> {
      this.error = ''
      try {
        this._replace(await collectionsApi.setCollectionTrack(id, trackId, present))
      } catch (err) {
        this.error = err instanceof Error ? err.message : String(err)
      }
    },
    /** A deleted (or trashed) track leaves its star, its tags and its collections. */
    forget(trackId: number): void {
      delete this.favorites[trackId]
      delete this.tags[trackId]
      this.dropCaption(trackId)
      for (const c of this.collections) c.track_ids = c.track_ids.filter((x) => x !== trackId)
    },
    _replace(collection: Collection): void {
      const i = this.collections.findIndex((c) => c.id === collection.id)
      if (i === -1) this.collections.push(collection)
      else this.collections[i] = collection
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMarksStore, import.meta.hot))
}
