/**
 * Vocal languages ACE-Step knows, by their native self-names (not translated). Matches
 * constants.VALID_LANGUAGES in the ACE-Step API (external/ACE-Step-1.5/acestep/constants.py).
 */
export const VOCAL_LANGUAGES: { code: string; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'pt', label: 'Português' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'pl', label: 'Polski' },
  { code: 'uk', label: 'Українська' },
  { code: 'cs', label: 'Čeština' },
  { code: 'sk', label: 'Slovenčina' },
  { code: 'ro', label: 'Română' },
  { code: 'hu', label: 'Magyar' },
  { code: 'bg', label: 'Български' },
  { code: 'sr', label: 'Српски' },
  { code: 'hr', label: 'Hrvatski' },
  { code: 'sv', label: 'Svenska' },
  { code: 'no', label: 'Norsk' },
  { code: 'da', label: 'Dansk' },
  { code: 'fi', label: 'Suomi' },
  { code: 'is', label: 'Íslenska' },
  { code: 'el', label: 'Ελληνικά' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'he', label: 'עברית' },
  { code: 'ar', label: 'العربية' },
  { code: 'fa', label: 'فارسی' },
  { code: 'ur', label: 'اردو' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'ne', label: 'नेपाली' },
  { code: 'sa', label: 'संस्कृतम्' },
  { code: 'th', label: 'ไทย' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'id', label: 'Indonesia' },
  { code: 'ms', label: 'Melayu' },
  { code: 'tl', label: 'Tagalog' },
  { code: 'sw', label: 'Kiswahili' },
  { code: 'az', label: 'Azərbaycan' },
  { code: 'lt', label: 'Lietuvių' },
  { code: 'ca', label: 'Català' },
  { code: 'ht', label: 'Kreyòl ayisyen' },
  { code: 'la', label: 'Latina' },
  { code: 'yue', label: '廣東話' },
]

/**
 * The language of a lyrics text, read from its letters. ACE-Step's release_task assumes English when no
 * vocal_language is sent, and Russian words are then sung as English. Structure tags ([Verse]) and
 * performance marks ((whisper)) are skipped. Latin letters count as English: other Latin-script languages
 * have to be picked by hand.
 */
export function guessVocalLanguage(lyrics: string): string {
  const words = lyrics.replace(/\[[^\]]*\]/g, ' ').replace(/\([^)]*\)/g, ' ')
  if (/[іїєґІЇЄҐ]/.test(words)) return 'uk'
  if (/[а-яёА-ЯЁ]/.test(words)) return 'ru'
  if (/[\uac00-\ud7af]/.test(words)) return 'ko'
  if (/[\u3040-\u30ff]/.test(words)) return 'ja'
  if (/[\u4e00-\u9fff]/.test(words)) return 'zh'
  return 'en'
}

export function vocalLanguageLabel(code: string): string {
  return VOCAL_LANGUAGES.find((l) => l.code === code)?.label ?? code
}
