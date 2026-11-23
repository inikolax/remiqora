import { trackUsage, tracksUsage } from '../api/tracks'
import type { ProjectRef } from '../api/tracks'

type Translate = (key: string, named?: Record<string, unknown>) => string

/** Up to three project names, then "and N more". */
function nameList(projects: ProjectRef[], t: Translate, quote: boolean): string {
  const names = projects.slice(0, 3).map((p) => (quote ? `«${p.name}»` : p.name))
  const rest = projects.length - names.length
  return names.join(', ') + (rest > 0 ? t('libraryPage.usage.more', { n: rest }) : '')
}

/**
 * Before tracks go to the trash (or for good): asks, with a confirm, when editor projects play them. A failed
 * usage check never blocks the deletion - the warning is just skipped.
 */
export async function confirmTrackDeletion(ids: number[], t: Translate, forGood = false): Promise<boolean> {
  if (!ids.length) return true
  let projects: ProjectRef[] = []
  let used = 0
  try {
    if (ids.length === 1 && !forGood) {
      projects = await trackUsage(ids[0])
    } else {
      const seen = new Map<number, ProjectRef>()
      for (const list of Object.values(await tracksUsage(ids))) {
        if (list.length) used += 1
        for (const p of list) seen.set(p.id, p)
      }
      projects = [...seen.values()]
    }
  } catch {
    return true
  }
  if (!projects.length) return true
  if (forGood) return window.confirm(t('libraryPage.usage.purge', { names: nameList(projects, t, true) }))
  if (ids.length === 1) {
    const more = projects.length > 1 ? t('libraryPage.usage.more', { n: projects.length - 1 }) : ''
    return window.confirm(t('libraryPage.usage.single', { name: projects[0].name, more }))
  }
  return window.confirm(t('libraryPage.usage.bulk', { n: used, names: nameList(projects, t, true) }))
}
