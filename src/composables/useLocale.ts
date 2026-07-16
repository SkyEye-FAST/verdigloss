import { computed, watch } from 'vue'
import { usePreferredLanguages } from '@vueuse/core'
import { i18n, resolveInterfaceLocale, type InterfaceLocale } from '@/app/i18n'

let initialized = false

function applyHtmlLang(locale: InterfaceLocale) {
  document.documentElement.lang = locale
}

export function initializeLocale() {
  if (initialized) return
  initialized = true
  const preferredLanguages = usePreferredLanguages()
  watch(
    preferredLanguages,
    (languages) => {
      const locale = resolveInterfaceLocale(languages[0])
      i18n.global.locale.value = locale
    },
    { immediate: true },
  )
  watch(i18n.global.locale, applyHtmlLang, { immediate: true })
}

export function useLocale() {
  return {
    locale: computed(() => i18n.global.locale.value),
    setLocale: (locale: InterfaceLocale) => (i18n.global.locale.value = locale),
  }
}
