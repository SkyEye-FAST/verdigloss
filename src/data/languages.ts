export type LanguageCode =
  | 'en_us'
  | 'zh_cn'
  | 'zh_hk'
  | 'zh_tw'
  | 'lzh'
  | 'ja_jp'
  | 'ko_kr'
  | 'vi_vn'
  | 'de_de'
  | 'es_es'
  | 'fr_fr'
  | 'it_it'
  | 'nl_nl'
  | 'pt_br'
  | 'ru_ru'
  | 'th_th'
  | 'uk_ua'

export interface LanguageMetadata {
  code: LanguageCode
  gameName: string
  htmlLang: string
  typographyClass: string
  dataSource: 'mc_lang/valid'
  availableInQuery: boolean
  availableInTable: boolean
  quiz: { enabled: boolean; minimumQuestions: number }
}

const definitions: Omit<
  LanguageMetadata,
  'dataSource' | 'availableInQuery' | 'availableInTable' | 'quiz'
>[] = [
  ['en_us', 'English (United States)', 'en-US'],
  ['zh_cn', '简体中文 (中国大陆)', 'zh-Hans-CN'],
  ['zh_hk', '繁體中文 (香港特別行政區)', 'zh-Hant-HK'],
  ['zh_tw', '繁體中文 (台灣)', 'zh-Hant-TW'],
  ['lzh', '文言 (華夏)', 'lzh'],
  ['ja_jp', '日本語 (日本)', 'ja-JP'],
  ['ko_kr', '한국어(대한민국)', 'ko-KR'],
  ['vi_vn', 'Tiếng Việt (Việt Nam)', 'vi-VN'],
  ['de_de', 'Deutsch (Deutschland)', 'de-DE'],
  ['es_es', 'Español (España)', 'es-ES'],
  ['fr_fr', 'Français (France)', 'fr-FR'],
  ['it_it', 'Italiano (Italia)', 'it-IT'],
  ['nl_nl', 'Nederlands (Nederland)', 'nl-NL'],
  ['pt_br', 'Português (Brasil)', 'pt-BR'],
  ['ru_ru', 'Русский (Россия)', 'ru-RU'],
  ['th_th', 'ไทย (ประเทศไทย)', 'th-TH'],
  ['uk_ua', 'Українська (Україна)', 'uk-UA'],
].map(([code, gameName, htmlLang]) => ({
  code,
  gameName,
  htmlLang,
  typographyClass: code.replace('_', '-'),
})) as Omit<LanguageMetadata, 'dataSource' | 'availableInQuery' | 'availableInTable' | 'quiz'>[]

export const languageRegistry: readonly LanguageMetadata[] = definitions.map((language) => ({
  ...language,
  dataSource: 'mc_lang/valid',
  availableInQuery: true,
  availableInTable: true,
  quiz: { enabled: language.code !== 'en_us', minimumQuestions: 10 },
}))
export const languageList = languageRegistry.map((language) => language.code) as LanguageCode[]
export const languageByCode = Object.fromEntries(
  languageRegistry.map((language) => [language.code, language]),
) as Record<LanguageCode, LanguageMetadata>
export const isLanguageCode = (value: string): value is LanguageCode =>
  languageList.includes(value as LanguageCode)
