import enUS from '@#/en_us.json'
import zhCN from '@#/zh_cn.json'
import zhHK from '@#/zh_hk.json'
import zhTW from '@#/zh_tw.json'
import lzh from '@#/lzh.json'
import ja from '@#/ja_jp.json'
import ko from '@#/ko_kr.json'
import vi from '@#/vi_vn.json'
import de from '@#/de_de.json'
import es from '@#/es_es.json'
import fr from '@#/fr_fr.json'
import it from '@#/it_it.json'
import nl from '@#/nl_nl.json'
import ptBR from '@#/pt_br.json'
import ru from '@#/ru_ru.json'
import th from '@#/th_th.json'
import uk from '@#/uk_ua.json'

export type LanguageFile = Record<string, string>
export type LanguageCode = keyof typeof languageFiles

export const languageFiles: Record<string, LanguageFile> = {
  en_us: enUS,
  zh_cn: zhCN,
  zh_hk: zhHK,
  zh_tw: zhTW,
  lzh: lzh,
  ja_jp: ja,
  ko_kr: ko,
  vi_vn: vi,
  de_de: de,
  es_es: es,
  fr_fr: fr,
  it_it: it,
  nl_nl: nl,
  pt_br: ptBR,
  ru_ru: ru,
  th_th: th,
  uk_ua: uk,
} as const

export const languageList = Object.keys(languageFiles) as LanguageCode[]
