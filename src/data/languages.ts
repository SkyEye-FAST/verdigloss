export type LanguageCode =
  | 'en_us' | 'zh_cn' | 'zh_hk' | 'zh_tw' | 'lzh' | 'ja_jp' | 'ko_kr' | 'vi_vn'
  | 'de_de' | 'es_es' | 'fr_fr' | 'it_it' | 'nl_nl' | 'pt_br' | 'ru_ru' | 'th_th' | 'uk_ua'

export interface LanguageMetadata {
  code: LanguageCode
  nativeName: string
  displayName: string
  htmlLang: string
  typographyClass: string
  dataSource: 'mc_lang/valid'
  availableInQuery: boolean
  availableInTable: boolean
  quiz: { enabled: boolean; minimumQuestions: number }
}

const definitions: Omit<LanguageMetadata, 'dataSource' | 'availableInQuery' | 'availableInTable' | 'quiz'>[] = [
  ['en_us', 'English (United States)', 'English (United States)', 'en-US'], ['zh_cn', '简体中文（中国大陆）', 'Simplified Chinese (Mainland China)', 'zh-Hans-CN'], ['zh_hk', '繁體中文（香港特別行政區）', 'Traditional Chinese (Hong Kong SAR)', 'zh-Hant-HK'], ['zh_tw', '繁體中文（台灣）', 'Traditional Chinese (Taiwan)', 'zh-Hant-TW'], ['lzh', '文言（華夏）', 'Classical Chinese', 'lzh'], ['ja_jp', '日本語（日本）', 'Japanese (Japan)', 'ja-JP'], ['ko_kr', '한국어(대한민국)', 'Korean (South Korea)', 'ko-KR'], ['vi_vn', 'Tiếng Việt (Việt Nam)', 'Vietnamese (Vietnam)', 'vi-VN'], ['de_de', 'Deutsch (Deutschland)', 'German (Germany)', 'de-DE'], ['es_es', 'Español (España)', 'Spanish (Spain)', 'es-ES'], ['fr_fr', 'Français (France)', 'French (France)', 'fr-FR'], ['it_it', 'Italiano (Italia)', 'Italian (Italy)', 'it-IT'], ['nl_nl', 'Nederlands (Nederland)', 'Dutch (Netherlands)', 'nl-NL'], ['pt_br', 'Português (Brasil)', 'Portuguese (Brazil)', 'pt-BR'], ['ru_ru', 'Русский (Россия)', 'Russian (Russia)', 'ru-RU'], ['th_th', 'ไทย (ประเทศไทย)', 'Thai (Thailand)', 'th-TH'], ['uk_ua', 'Українська (Україна)', 'Ukrainian (Ukraine)', 'uk-UA'],
].map(([code, nativeName, displayName, htmlLang]) => ({ code, nativeName, displayName, htmlLang, typographyClass: code.replace('_', '-'), })) as Omit<LanguageMetadata, 'dataSource' | 'availableInQuery' | 'availableInTable' | 'quiz'>[]

export const languageRegistry: readonly LanguageMetadata[] = definitions.map((language) => ({ ...language, dataSource: 'mc_lang/valid', availableInQuery: true, availableInTable: true, quiz: { enabled: language.code !== 'en_us', minimumQuestions: 10 } }))
export const languageList = languageRegistry.map((language) => language.code) as LanguageCode[]
export const languageByCode = Object.fromEntries(languageRegistry.map((language) => [language.code, language])) as Record<LanguageCode, LanguageMetadata>
export const isLanguageCode = (value: string): value is LanguageCode => languageList.includes(value as LanguageCode)
