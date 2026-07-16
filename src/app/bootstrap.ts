import type { App } from 'vue'
import { i18n } from './i18n'
import { router } from './router'
import { installDocumentTitle } from './document-title'
import { initializeLocale } from '@/composables/useLocale'

export function installApplicationServices(app: App) {
  app.use(i18n)
  app.use(router)
  initializeLocale()
  installDocumentTitle(router)
}
