/**
 * Vocal languages, by their native self-names (not translated). Matches constants.VALID_LANGUAGES in the
 * ACE-Step API (external/ACE-Step-1.5/acestep/constants.py), plus Kazakh: ACE-Step does not list it, but with
 * vocal_language "kk" it sings Kazakh as well as with "ru" (measured on nine seeds each, 2026-10-27), and the
 * engine passes the code through without checking it against its list. So the ACE-Step form keeps offering it.
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
  { code: 'kk', label: 'Қазақша' },
]

/** The languages ACE-Step's form offers: its VALID_LANGUAGES plus Kazakh, which was measured to work. */
export const ACE_VOCAL_LANGUAGES = VOCAL_LANGUAGES

/** A language picked or stored for ACE-Step in its vocabulary: '' (auto) when it has none. */
export function aceVocalLanguage(code: string): string {
  return ACE_VOCAL_LANGUAGES.some((l) => l.code === code) ? code : ''
}

// Common function words of the Latin-script languages, to tell them apart when no letter gives the language away.
const STOPWORDS: Record<string, string> = {
  en: 'the and of to is you it that with for on are was be this my we your at as but not have',
  es: 'el la los las de que y en un una es por con para su al lo como pero sus yo mi te tu del se está estamos somos soy hoy más muy',
  pt: 'o os as de que e em um uma é por com para não do da dos das eu meu minha você nós sou estamos muito mais como',
  fr: 'le la les des du et est un une que qui dans pour avec sur je tu il nous vous mon ma ne pas au aux ce cette très plus',
  de: 'der die das und ist nicht ich du wir mit ein eine zu den dem im auf für von sich aber auch wie über mein dein sind',
  it: 'il lo la gli le di che è un una per con non io tu noi siamo sono mio mia del della sul sulla come ma anche molto',
  nl: 'de het een en van is dat niet ik je we met voor op zijn maar ook die dit mijn jij wij naar over',
  pl: 'i w nie na się to jest że z do ja ty my po jak ale od przez dla mój moja nad',
  tr: 've bir bu için ile ben sen biz de da gibi çok ama daha ne gece yok var bana benim',
  id: 'yang dan di ke dari ini itu aku kamu kita dengan untuk tidak ada pada akan sudah bukan saya atas',
  ro: 'și în la este un o pe cu că nu eu tu noi sunt mai dar mea mele',
  cs: 'a v se na je že s z do jsem ty my jak ale to nebo můj',
  sv: 'och i att det som är en på jag du vi med för inte men av min',
}
const STOPWORD_SETS = Object.entries(STOPWORDS).map(([lang, words]) => [lang, new Set(words.split(' '))] as const)

/** A Latin-script text's language: by the letters only that language has, else by its most frequent function words. */
function guessLatinLanguage(text: string): string {
  if (/[ăâêôơưđ]/i.test(text) && /[\u1ea0-\u1ef9]/.test(text)) return 'vi'
  if (/[ğşıİ]/.test(text)) return 'tr'
  if (/[ñ¿¡]/.test(text)) return 'es'
  if (/ß/.test(text)) return 'de'
  if (/[ăşșțţ]/i.test(text)) return 'ro'
  if (/[ěřů]/i.test(text)) return 'cs'
  if (/[ąęłśźżćń]/i.test(text)) return 'pl'
  if (/[ãõ]/i.test(text)) return 'pt'
  const words = text.toLowerCase().match(/[\p{L}']+/gu) ?? []
  let best = 'en'
  let bestScore = 0
  const enScore = words.filter((w) => STOPWORD_SETS[0][1].has(w)).length
  for (const [lang, set] of STOPWORD_SETS) {
    const score = words.filter((w) => set.has(w)).length
    if (score > bestScore) {
      best = lang
      bestScore = score
    }
  }
  // English wins ties and weak signals: a language needs at least two function words and to beat English.
  return best !== 'en' && bestScore >= 2 && bestScore > enScore ? best : 'en'
}

/**
 * The language of a text (lyrics or an idea), read from its letters. ACE-Step's release_task assumes English when
 * no vocal_language is sent, and Russian words are then sung as English; the prompt assistant writes in the
 * language it is given. Structure tags ([Verse]) and performance marks ((whisper)) are skipped. Scripts tell
 * their language by themselves (Cyrillic: Kazakh, Ukrainian or Russian by their special letters; Arabic script:
 * Persian, Urdu or Arabic by theirs); Latin-script languages go by their special letters or, failing that, their
 * most frequent words, and anything uncertain is English.
 */
export function guessVocalLanguage(lyrics: string): string {
  const words = lyrics.replace(/\[[^\]]*\]/g, ' ').replace(/\([^)]*\)/g, ' ')
  if (/[őűŐŰ]/.test(words)) return 'hu'
  if (/[әғқңөұүһӘҒҚҢӨҰҮҺ]/.test(words)) return 'kk'
  if (/[іїєґІЇЄҐ]/.test(words)) return 'uk'
  // Ukrainian words Russian does not have, for a text without і ї є ґ
  if (/(^|[^а-яґєіїё])(що|як|це|мені|мене|сонце|ніч|вже|серце|життя|любов|мій|моє|твоє)(?![а-яґєіїё])/i.test(words)) return 'uk'
  if (/[а-яёА-ЯЁ]/.test(words)) return 'ru'
  if (/[\uac00-\ud7af]/.test(words)) return 'ko'
  if (/[\u3040-\u30ff]/.test(words)) return 'ja'
  if (/[\u4e00-\u9fff]/.test(words)) return 'zh'
  if (/[\u0590-\u05ff]/.test(words)) return 'he'
  if (/[\u0600-\u06ff]/.test(words)) {
    if (/[ٹڈڑںےھ]/.test(words)) return 'ur'
    return /[پچژگیک]/.test(words) ? 'fa' : 'ar'
  }
  if (/[\u0900-\u097f]/.test(words)) return 'hi'
  if (/[\u0980-\u09ff]/.test(words)) return 'bn'
  if (/[\u0a00-\u0a7f]/.test(words)) return 'pa'
  if (/[\u0b80-\u0bff]/.test(words)) return 'ta'
  if (/[\u0c00-\u0c7f]/.test(words)) return 'te'
  if (/[\u0e00-\u0e7f]/.test(words)) return 'th'
  if (/[\u0370-\u03ff]/.test(words)) return 'el'
  return guessLatinLanguage(words)
}

export function vocalLanguageLabel(code: string): string {
  return VOCAL_LANGUAGES.find((l) => l.code === code)?.label ?? code
}

/** A language's English name, as a style tag takes it: 'ru' is "Russian", 'yue' is "Cantonese". */
export function englishLanguageName(code: string): string {
  try {
    return new Intl.DisplayNames(['en'], { type: 'language' }).of(code) ?? code
  } catch {
    return code
  }
}

/** Style tags with the language first: YuE2 sings in it more surely when the tags say it. Any other place it held
 *  in the tags is dropped, so it is never there twice. */
export function withLanguageTag(tags: string, language: string): string {
  const lang = language.trim()
  if (!lang) return tags.trim()
  const rest = tags.split(',').map((s) => s.trim()).filter((s) => s && s.toLowerCase() !== lang.toLowerCase())
  return [lang, ...rest].join(', ')
}
