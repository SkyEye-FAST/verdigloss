import type { Router } from 'vue-router'
import { watch } from 'vue'
import { i18n } from './i18n'

const applicationName = 'Verdigloss'

export function installDocumentTitle(router: Router) {
  const update = () => {
    document.title = documentTitleFor(router.currentRoute.value.meta)
  }
  router.afterEach(update)
  watch(i18n.global.locale, update, { immediate: true })
}

export function documentTitleFor(meta: { titleKey?: string; fallbackTitle?: string }) {
  const title = meta.titleKey ? i18n.global.t(meta.titleKey) : meta.fallbackTitle
  return title ? `${title} - ${applicationName}` : applicationName
}
