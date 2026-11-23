import { noteName } from '../../audio/score'
import type { Check, SectionType } from '../../audio/score'

/** A check's words: what the checks panel lists and the form's score card sums up. */
type T = (key: string, named?: Record<string, unknown>, plural?: number) => string

const types = (list: string | number | undefined, t: T): string =>
  String(list ?? '').split(',').map((s) => s.trim()).filter(Boolean)
    .map((ty) => t(`score.sectionTypes.${ty as SectionType}`)).join(', ')

export function checkText(c: Check, key: string, t: T): { title: string; sub: string } {
  const p = c.params
  const ok = c.level === 'ok'
  switch (c.id) {
    case 'basics': return ok ? { title: t('score.checks.basicsOk'), sub: `${p.key} · ${p.tempo} · ${p.meter}` } : { title: t('score.checks.basicsWarn'), sub: '' }
    case 'chords': return ok ? { title: t('score.checks.chordsOk'), sub: t('score.checks.chordsOkSub', { n: p.bars }) } : { title: t('score.checks.chordsWarn', { n: p.missing }, Number(p.missing)), sub: t('score.checks.chordsWarnSub') }
    case 'emptyVocal': return { title: t('score.checks.emptyVocal'), sub: t('score.checks.emptyVocalSub') }
    case 'sparseVocal': return { title: t('score.checks.sparseVocal'), sub: t('score.checks.sparseVocalSub', { notes: p.notes, syllables: p.syllables }) }
    case 'range': {
      const range = `${noteName(Number(p.lo), key)}–${noteName(Number(p.hi), key)}`
      if (ok) return { title: t('score.checks.rangeOk'), sub: t('score.checks.rangeOkSub', { notes: `${noteName(Number(p.min), key)}–${noteName(Number(p.max), key)}`, range }) }
      const parts: string[] = []
      if (Number(p.high)) parts.push(t('score.checks.rangeHigh', { n: p.high }, Number(p.high)))
      if (Number(p.low)) parts.push(t('score.checks.rangeLow', { n: p.low }, Number(p.low)))
      return { title: parts.join(', '), sub: t('score.checks.rangeSub', { range }) }
    }
    case 'sections': {
      if (ok) return { title: t('score.checks.sectionsOk'), sub: t('score.checks.sectionsOkSub', { n: p.score }) }
      const bits = [t('score.checks.sectionsCount', { lyrics: p.lyrics, score: p.score })]
      if (p.lacking) bits.push(t('score.checks.sectionsLacking', { list: types(p.lacking, t) }))
      if (p.extra) bits.push(t('score.checks.sectionsExtra', { list: types(p.extra, t) }))
      return { title: t('score.checks.sectionsWarn'), sub: bits.join('; ') }
    }
    case 'insOverlap': return ok ? { title: t('score.checks.insOk'), sub: t('score.checks.insOkSub') } : { title: t('score.checks.insInfo', { n: p.bars }, Number(p.bars)), sub: t('score.checks.insOkSub') }
    case 'length': return ok ? { title: t('score.checks.lengthOk'), sub: t('score.checks.lengthSub', { n: p.chars }) } : { title: t('score.checks.lengthWarn', { n: p.chars }), sub: t('score.checks.lengthWarnSub', { limit: p.limit }) }
  }
  return { title: c.id, sub: '' }
}
