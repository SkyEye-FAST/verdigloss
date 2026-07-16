import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'
import zhCN from '@/locales/zh-cn.json'
import zhTW from '@/locales/zh-tw.json'

export type InterfaceLocale = 'en' | 'zh-CN' | 'zh-TW'

export const i18n = createI18n({
  legacy: false,
  locale: resolveInterfaceLocale(navigator.language),
  fallbackLocale: 'en',
  messages: { en, 'zh-CN': zhCN, 'zh-TW': zhTW },
})

export function resolveInterfaceLocale(language: string | undefined): InterfaceLocale {
  const normalized = language?.toLowerCase() ?? 'en'
  if (!normalized.startsWith('zh')) return 'en'
  if (normalized.includes('hant') || /-(tw|hk|mo)(?:-|$)/.test(normalized)) return 'zh-TW'
  return 'zh-CN'
}
