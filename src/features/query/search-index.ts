import type { LanguageFile } from '@/services/translation-data'
import type { LanguageCode } from '@/data/languages'

export type QueryMode = 'key' | 'source' | 'translation'
export interface SearchResult {
  key: string
  matchedValue: string
  mode: QueryMode
  language: LanguageCode
}
export const normalizeSearchText = (value: string) => value.trim().toLocaleLowerCase()

export class SearchIndex {
  private readonly keys: readonly [string, string][]
  private readonly values: readonly [string, string][]
  constructor(
    public readonly language: LanguageCode,
    data: LanguageFile,
  ) {
    this.keys = Object.keys(data).map((key) => [key, normalizeSearchText(key)])
    this.values = Object.entries(data).map(([key, value]) => [key, normalizeSearchText(value)])
  }
  search(mode: QueryMode, query: string, limit = 100): SearchResult[] {
    const normalized = normalizeSearchText(query)
    if (!normalized) return []
    const source = mode === 'key' ? this.keys : this.values
    return source
      .filter(([, value]) => value.includes(normalized))
      .slice(0, limit)
      .map(([key]) => ({
        key,
        matchedValue: mode === 'key' ? key : '',
        mode,
        language: this.language,
      }))
  }
}

const indexes = new Map<LanguageCode, SearchIndex>()
export function getSearchIndex(language: LanguageCode, data: LanguageFile) {
  const cached = indexes.get(language)
  if (cached) return cached
  const index = new SearchIndex(language, data)
  indexes.set(language, index)
  return index
}

export function clearSearchIndexesForTests() {
  indexes.clear()
}
