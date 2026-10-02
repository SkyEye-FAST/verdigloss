import { isLanguageCode, type LanguageCode } from '@/data/languages'

export type LanguageFile = Readonly<Record<string, string>>
export type LanguageDataSource = 'valid' | 'full'
export class TranslationDataError extends Error {
  constructor(
    public readonly language: string,
    cause?: unknown,
  ) {
    super(`Unable to load translation data for ${language}`)
    this.name = 'TranslationDataError'
    this.cause = cause
  }
}

type Loader = () => Promise<LanguageFile>
const modules = import.meta.glob<LanguageFile>(
  ['@/assets/mc_lang/valid/*.json', '@/assets/mc_lang/full/*.json'],
  {
    eager: false,
    import: 'default',
  },
)
const cache = new Map<string, Promise<LanguageFile>>()

function loaderFor(language: LanguageCode, source: LanguageDataSource): Loader {
  const loader = modules[`/src/assets/mc_lang/${source}/${language}.json`]
  if (!loader) throw new TranslationDataError(language)
  return loader
}

export function loadLanguage(
  language: LanguageCode,
  source: LanguageDataSource = 'valid',
): Promise<LanguageFile> {
  const cacheKey = `${source}:${language}`
  const cached = cache.get(cacheKey)
  if (cached) return cached
  let loader: Loader
  try {
    loader = loaderFor(language, source)
  } catch (cause) {
    return Promise.reject(cause)
  }
  const pending = loader().catch((cause) => {
    cache.delete(cacheKey)
    throw new TranslationDataError(language, cause)
  })
  cache.set(cacheKey, pending)
  return pending
}

export async function loadLanguages(
  languages: readonly LanguageCode[],
  source: LanguageDataSource = 'valid',
): Promise<Record<LanguageCode, LanguageFile>> {
  const entries = await Promise.all(
    languages.map(async (language) => [language, await loadLanguage(language, source)] as const),
  )
  return Object.fromEntries(entries) as Record<LanguageCode, LanguageFile>
}

export function clearTranslationDataCacheForTests() {
  cache.clear()
}
export { isLanguageCode }
