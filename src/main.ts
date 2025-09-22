import { watch, createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import { usePreferredLanguages, useTitle } from '@vueuse/core'
import App from './App.vue'
import router from './router'

import '@/assets/styles/main.css'

import en from './locales/en.json'
import zh_cn from './locales/zh-cn.json'
import zh_tw from './locales/zh-tw.json'

const languages = usePreferredLanguages()

const i18n = createI18n({
  legacy: false,
  locale: navigator.language || 'en',
  fallbackLocale: 'en',
  silentTranslationWarn: true,
  messages: {
    en: en,
    zh: zh_cn,
    'zh-CN': zh_cn,
    'zh-TW': zh_tw,
  },
})

export const currentLocale = i18n.global.locale

interface LocaleType {
  locale: 'en' | 'zh' | 'zh-CN' | 'zh-TW'
}

const updateHtmlLang = (locale: LocaleType['locale']): void => {
  const htmlElement = document.querySelector('html')
  if (htmlElement) {
    htmlElement.lang = locale
  }
}

const setLocaleFromPreference = (preferredLanguages: readonly string[]) => {
  if (preferredLanguages.length > 0) {
    const lang = (preferredLanguages[0] || '').toLowerCase()
    let locale: LocaleType['locale'] = 'en'

    if (lang.startsWith('zh')) {
      if (lang.includes('cn') || lang.includes('hans')) {
        locale = 'zh-CN'
      } else if (lang.includes('tw') || lang.includes('hant')) {
        locale = 'zh-TW'
      } else {
        locale = 'zh'
      }
    }

    i18n.global.locale.value = locale
    updateHtmlLang(locale)
  }
}

setLocaleFromPreference(languages.value)

watch(languages, (newLanguages) => {
  setLocaleFromPreference(newLanguages)
})

watch(i18n.global.locale, (newLocale) => {
  updateHtmlLang(newLocale)
})

router.beforeEach((to, from, next) => {
  if (to.meta.titleKey) {
    useTitle(i18n.global.t(to.meta.titleKey as string) + ' - Verdigloss')
  }
  next()
})

const app = createApp(App)
app.use(i18n)
app.use(router)
app.mount('#app')
