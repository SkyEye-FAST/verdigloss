import type { LanguageCode } from '@/data/languages'
import type { LanguageFile } from '@/services/translation-data'

export const TABLE_PAGE_SIZE = 50

export function filterTranslationKeys(
  keys: readonly string[],
  dictionaries: Partial<Record<LanguageCode, LanguageFile>>,
  languages: readonly LanguageCode[],
  query: string,
) {
  const normalized = query.trim().toLocaleLowerCase()
  if (!normalized) return keys
  return keys.filter((key) => key.toLocaleLowerCase().includes(normalized) || languages.some((language) => dictionaries[language]?.[key]?.toLocaleLowerCase().includes(normalized)))
}

export function clampPage(currentPage: number, totalItems: number, pageSize = TABLE_PAGE_SIZE) {
  const totalPages = Math.ceil(totalItems / pageSize)
  return totalPages === 0 ? 0 : Math.min(Math.max(currentPage, 1), totalPages)
}

export function pageKeys(keys: readonly string[], currentPage: number, pageSize = TABLE_PAGE_SIZE) {
  if (!keys.length || currentPage < 1) return []
  return keys.slice((currentPage - 1) * pageSize, currentPage * pageSize)
}
