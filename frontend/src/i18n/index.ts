import { createI18n } from 'vue-i18n'
import ru from '../locales/ru'
import en from '../locales/en'

export type LocaleCode =
  | 'ru' | 'en' | 'kk' | 'es' | 'pt-BR' | 'de' | 'fr' | 'it' | 'pl' | 'uk' | 'tr'
  | 'zh-CN' | 'zh-TW' | 'ja' | 'ko' | 'vi' | 'id' | 'hi' | 'ar' | 'fa' | 'he'

/** The languages of the interface, by their own names. Russian and English are always loaded; the rest on demand. */
export const LOCALES: { code: LocaleCode; name: string; rtl?: boolean }[] = [
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'English' },
  { code: 'kk', name: 'Қазақша' },
  { code: 'es', name: 'Español' },
  { code: 'pt-BR', name: 'Português (Brasil)' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'pl', name: 'Polski' },
  { code: 'uk', name: 'Українська' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'zh-CN', name: '简体中文' },
  { code: 'zh-TW', name: '繁體中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'ar', name: 'العربية', rtl: true },
  { code: 'fa', name: 'فارسی', rtl: true },
  { code: 'he', name: 'עברית', rtl: true },
]
const isLocale = (code: unknown): code is LocaleCode => LOCALES.some((l) => l.code === code)
const STORAGE_KEY = 'remiqora_locale'

type Messages = Record<string, unknown>
const LOADERS: Partial<Record<LocaleCode, () => Promise<{ default: Messages }>>> = {
  kk: () => import('../locales/kk'),
  es: () => import('../locales/es'),
  'pt-BR': () => import('../locales/pt-BR'),
  de: () => import('../locales/de'),
  fr: () => import('../locales/fr'),
  it: () => import('../locales/it'),
  pl: () => import('../locales/pl'),
  uk: () => import('../locales/uk'),
  tr: () => import('../locales/tr'),
  'zh-CN': () => import('../locales/zh-CN'),
  'zh-TW': () => import('../locales/zh-TW'),
  ja: () => import('../locales/ja'),
  ko: () => import('../locales/ko'),
  vi: () => import('../locales/vi'),
  id: () => import('../locales/id'),
  hi: () => import('../locales/hi'),
  ar: () => import('../locales/ar'),
  fa: () => import('../locales/fa'),
  he: () => import('../locales/he'),
}

/** The interface language for one language tag from the browser: "pt-PT" gives pt-BR, "zh-HK" gives Traditional. */
function matchLocale(tag: string): LocaleCode | undefined {
  if (tag.startsWith('zh')) return /^zh-(tw|hk|mo|hant)/.test(tag) ? 'zh-TW' : 'zh-CN'
  if (tag.startsWith('pt')) return 'pt-BR'
  return LOCALES.find((l) => l.code.toLowerCase() === tag || l.code.toLowerCase() === tag.split('-')[0])?.code
}

// The interface follows the system language until the user picks one: the first preferred language that has a
// translation wins. English is the exception: people in Belarus, Ukraine or Kazakhstan often keep en first and
// ru second, and for them the interface is Russian. English is the default when nothing matches.
function systemLocale(): LocaleCode {
  const preferred = (navigator.languages?.length ? navigator.languages : [navigator.language ?? '']).map((lang) => lang.toLowerCase())
  const matches = preferred.map(matchLocale).filter((code): code is LocaleCode => code !== undefined)
  if (matches[0] === 'en' && matches.includes('ru')) return 'ru'
  return matches[0] ?? 'en'
}

// The document language and reading direction follow the interface language.
function applyDocumentLocale(locale: LocaleCode) {
  document.documentElement.lang = locale
  document.documentElement.dir = LOCALES.find((l) => l.code === locale)?.rtl ? 'rtl' : 'ltr'
}

function detectInitialLocale(): LocaleCode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isLocale(saved)) return saved
  } catch {
    // localStorage unavailable (private browsing) - fall through to the system language.
  }
  return systemLocale()
}

/** The form of a count in a "one | few | many" message: 1, 21 → one; 2-4, 22 → few; 5-20, 11-14 → many. */
function slavicPlural(choice: number, choicesLength: number): number {
  if (choicesLength < 3) return choice === 1 ? 0 : 1
  const n = Math.abs(choice) % 100
  const last = n % 10
  if (n > 10 && n < 20) return 2
  if (last === 1) return 0
  return last >= 2 && last <= 4 ? 1 : 2
}

const initialLocale = detectInitialLocale()
applyDocumentLocale(initialLocale)

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  // A language that is only partly translated shows English for the rest; Traditional Chinese tries Simplified first.
  fallbackLocale: { 'zh-TW': ['zh-CN', 'en'], default: ['en'] },
  messages: { ru, en },
  // Russian counts take three forms: 1 трек, 2 трека, 5 треков ("one | few | many" in a message)
  pluralRules: { ru: slavicPlural },
})

/** Loads a language's messages the first time it is needed. */
export async function loadLocale(locale: LocaleCode): Promise<void> {
  if ((i18n.global.availableLocales as string[]).includes(locale)) return
  const loader = LOADERS[locale]
  // The messages type is inferred from ru and en alone; every language has the same shape (checked by script).
  if (loader) i18n.global.setLocaleMessage(locale as 'ru', (await loader()).default as any)
}

/** Resolves once the starting language is loaded: the app mounts after it, so no key shows up untranslated. */
export const ready = loadLocale(initialLocale)

export async function setLocale(locale: LocaleCode) {
  await loadLocale(locale)
  ;(i18n.global.locale as any).value = locale
  applyDocumentLocale(locale)
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // ignore - just won't persist across reloads
  }
}

export function currentLocale(): LocaleCode {
  return (i18n.global.locale as any).value
}

/** The BCP 47 tag for dates and times: the interface language's own formats, American English for English. */
export function dateLocaleTag(locale: string): string {
  return locale === 'ru' ? 'ru-RU' : locale === 'en' ? 'en-US' : locale
}
