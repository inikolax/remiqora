import { i18n } from '../i18n'

/** A track's length as a clock: 3:20, or 1:02:05 for an hour and more. */
export function formatClock(totalSeconds: number | null | undefined): string {
  if (totalSeconds == null || !Number.isFinite(totalSeconds) || totalSeconds < 0) return '—'
  const rounded = Math.round(totalSeconds)
  const h = Math.floor(rounded / 3600)
  const m = Math.floor((rounded % 3600) / 60)
  const s = rounded % 60
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

const RU_MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

/** When a track was made, in words people use: "Today, 17:54", "Yesterday, 09:10", "30 Sep, 21:33", with the
 *  year added only for an older year. `full` is the exact timestamp for a tooltip. */
export function formatCreated(timestamp: number): { label: string; full: string } {
  const lang = String(i18n.global.locale.value) === 'ru' ? 'ru-RU' : 'en-US'
  const when = new Date(timestamp)
  const now = new Date()
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const dayDiff = Math.round((startOf(when) - startOf(now)) / 86400000)
  const time = when.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })
  let day: string
  if (dayDiff === 0 || dayDiff === -1) {
    const word = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' }).format(dayDiff, 'day')
    day = word.charAt(0).toUpperCase() + word.slice(1)
  } else if (lang === 'ru-RU') {
    day = `${when.getDate()} ${RU_MONTHS[when.getMonth()]}${when.getFullYear() === now.getFullYear() ? '' : ` ${when.getFullYear()}`}`
  } else {
    day = when.toLocaleDateString(lang, when.getFullYear() === now.getFullYear() ? { day: 'numeric', month: 'short' } : { day: 'numeric', month: 'short', year: 'numeric' })
  }
  return { label: `${day}, ${time}`, full: when.toLocaleString(lang) }
}
