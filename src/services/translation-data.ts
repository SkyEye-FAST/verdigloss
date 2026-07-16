import { isLanguageCode, type LanguageCode } from '@/data/languages'

export type LanguageFile = Readonly<Record<string, string>>
export class TranslationDataError extends Error {
  constructor(public readonly language: string, cause?: unknown) {
    super(`Unable to load translation data for ${language}`)
    this.name = 'TranslationDataError'
    this.cause = cause
  }
}

type Loader = () => Promise<LanguageFile>
const modules = import.meta.glob<LanguageFile>('@/assets/mc_lang/valid/*.json', { eager: false, import: 'default' })
const cache = new Map<LanguageCode, Promise<LanguageFile>>()

function loaderFor(language: LanguageCode): Loader {
  const loader = modules[`/src/assets/mc_lang/valid/${language}.json`]
  if (!loader) throw new TranslationDataError(language)
  return loader
}

export function loadLanguage(language: LanguageCode): Promise<LanguageFile> {
  const cached = cache.get(language)
  if (cached) return cached
  let loader: Loader
  try { loader = loaderFor(language) } catch (cause) { return Promise.reject(cause) }
  const pending = loader().catch((cause) => {
    cache.delete(language)
    throw new TranslationDataError(language, cause)
  })
  cache.set(language, pending)
  return pending
}

export async function loadLanguages(languages: readonly LanguageCode[]): Promise<Record<LanguageCode, LanguageFile>> {
  const entries = await Promise.all(languages.map(async (language) => [language, await loadLanguage(language)] as const))
  return Object.fromEntries(entries) as Record<LanguageCode, LanguageFile>
}

export function clearTranslationDataCacheForTests() { cache.clear() }
export { isLanguageCode }
