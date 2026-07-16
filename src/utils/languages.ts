import deDE from '@#/de_de.json'
import enUS from '@#/en_us.json'
import esES from '@#/es_es.json'
import frFR from '@#/fr_fr.json'
import itIT from '@#/it_it.json'
import jaJP from '@#/ja_jp.json'
import koKR from '@#/ko_kr.json'
import lzh from '@#/lzh.json'
import nlNL from '@#/nl_nl.json'
import ptBR from '@#/pt_br.json'
import ruRU from '@#/ru_ru.json'
import thTH from '@#/th_th.json'
import ukUA from '@#/uk_ua.json'
import viVN from '@#/vi_vn.json'
import zhCN from '@#/zh_cn.json'
import zhHK from '@#/zh_hk.json'
import zhTW from '@#/zh_tw.json'

export type LanguageFile = Record<string, string>

const languageData = {
  en_us: enUS,
  zh_cn: zhCN,
  zh_hk: zhHK,
  zh_tw: zhTW,
  lzh,
  ja_jp: jaJP,
  ko_kr: koKR,
  vi_vn: viVN,
  de_de: deDE,
  es_es: esES,
  fr_fr: frFR,
  it_it: itIT,
  nl_nl: nlNL,
  pt_br: ptBR,
  ru_ru: ruRU,
  th_th: thTH,
  uk_ua: ukUA,
} satisfies Record<string, LanguageFile>

export type LanguageCode = keyof typeof languageData

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

const metadata: Record<LanguageCode, Omit<LanguageMetadata, 'code'>> = {
  en_us: { nativeName: 'English (United States)', displayName: 'English (United States)', htmlLang: 'en-US', typographyClass: 'en-us', dataSource: 'mc_lang/valid', availableInQuery: true, availableInTable: true, quiz: { enabled: false, minimumQuestions: 10 } },
  zh_cn: { nativeName: '简体中文（中国大陆）', displayName: 'Simplified Chinese (Mainland China)', htmlLang: 'zh-Hans-CN', typographyClass: 'zh-cn', dataSource: 'mc_lang/valid', availableInQuery: true, availableInTable: true, quiz: { enabled: true, minimumQuestions: 10 } },
  zh_hk: { nativeName: '繁體中文（香港特別行政區）', displayName: 'Traditional Chinese (Hong Kong SAR)', htmlLang: 'zh-Hant-HK', typographyClass: 'zh-hk', dataSource: 'mc_lang/valid', availableInQuery: true, availableInTable: true, quiz: { enabled: true, minimumQuestions: 10 } },
  zh_tw: { nativeName: '繁體中文（台灣）', displayName: 'Traditional Chinese (Taiwan)', htmlLang: 'zh-Hant-TW', typographyClass: 'zh-tw', dataSource: 'mc_lang/valid', availableInQuery: true, availableInTable: true, quiz: { enabled: true, minimumQuestions: 10 } },
  lzh: { nativeName: '文言（華夏）', displayName: 'Classical Chinese', htmlLang: 'lzh', typographyClass: 'lzh', dataSource: 'mc_lang/valid', availableInQuery: true, availableInTable: true, quiz: { enabled: true, minimumQuestions: 10 } },
  ja_jp: { nativeName: '日本語（日本）', displayName: 'Japanese (Japan)', htmlLang: 'ja-JP', typographyClass: 'ja-jp', dataSource: 'mc_lang/valid', availableInQuery: true, availableInTable: true, quiz: { enabled: true, minimumQuestions: 10 } },
  ko_kr: { nativeName: '한국어(대한민국)', displayName: 'Korean (South Korea)', htmlLang: 'ko-KR', typographyClass: 'ko-kr', dataSource: 'mc_lang/valid', availableInQuery: true, availableInTable: true, quiz: { enabled: true, minimumQuestions: 10 } },
  vi_vn: { nativeName: 'Tiếng Việt (Việt Nam)', displayName: 'Vietnamese (Vietnam)', htmlLang: 'vi-VN', typographyClass: 'vi-vn', dataSource: 'mc_lang/valid', availableInQuery: true, availableInTable: true, quiz: { enabled: true, minimumQuestions: 10 } },
  de_de: { nativeName: 'Deutsch (Deutschland)', displayName: 'German (Germany)', htmlLang: 'de-DE', typographyClass: 'de-de', dataSource: 'mc_lang/valid', availableInQuery: true, availableInTable: true, quiz: { enabled: true, minimumQuestions: 10 } },
  es_es: { nativeName: 'Español (España)', displayName: 'Spanish (Spain)', htmlLang: 'es-ES', typographyClass: 'es-es', dataSource: 'mc_lang/valid', availableInQuery: true, availableInTable: true, quiz: { enabled: true, minimumQuestions: 10 } },
  fr_fr: { nativeName: 'Français (France)', displayName: 'French (France)', htmlLang: 'fr-FR', typographyClass: 'fr-fr', dataSource: 'mc_lang/valid', availableInQuery: true, availableInTable: true, quiz: { enabled: true, minimumQuestions: 10 } },
  it_it: { nativeName: 'Italiano (Italia)', displayName: 'Italian (Italy)', htmlLang: 'it-IT', typographyClass: 'it-it', dataSource: 'mc_lang/valid', availableInQuery: true, availableInTable: true, quiz: { enabled: true, minimumQuestions: 10 } },
  nl_nl: { nativeName: 'Nederlands (Nederland)', displayName: 'Dutch (Netherlands)', htmlLang: 'nl-NL', typographyClass: 'nl-nl', dataSource: 'mc_lang/valid', availableInQuery: true, availableInTable: true, quiz: { enabled: true, minimumQuestions: 10 } },
  pt_br: { nativeName: 'Português (Brasil)', displayName: 'Portuguese (Brazil)', htmlLang: 'pt-BR', typographyClass: 'pt-br', dataSource: 'mc_lang/valid', availableInQuery: true, availableInTable: true, quiz: { enabled: true, minimumQuestions: 10 } },
  ru_ru: { nativeName: 'Русский (Россия)', displayName: 'Russian (Russia)', htmlLang: 'ru-RU', typographyClass: 'ru-ru', dataSource: 'mc_lang/valid', availableInQuery: true, availableInTable: true, quiz: { enabled: true, minimumQuestions: 10 } },
  th_th: { nativeName: 'ไทย (ประเทศไทย)', displayName: 'Thai (Thailand)', htmlLang: 'th-TH', typographyClass: 'th-th', dataSource: 'mc_lang/valid', availableInQuery: true, availableInTable: true, quiz: { enabled: true, minimumQuestions: 10 } },
  uk_ua: { nativeName: 'Українська (Україна)', displayName: 'Ukrainian (Ukraine)', htmlLang: 'uk-UA', typographyClass: 'uk-ua', dataSource: 'mc_lang/valid', availableInQuery: true, availableInTable: true, quiz: { enabled: true, minimumQuestions: 10 } },
}

export const languageFiles: Record<LanguageCode, LanguageFile> = languageData
export const languageList = Object.keys(languageData) as LanguageCode[]
export const languageRegistry: readonly LanguageMetadata[] = languageList.map((code) => ({
  code,
  ...metadata[code],
}))

export function isLanguageCode(value: string): value is LanguageCode {
  return languageList.includes(value as LanguageCode)
}
