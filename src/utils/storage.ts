import type { LanguageCode } from '@/data/languages'

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export function browserStorage(): StorageLike | undefined {
  try {
    if (typeof window === 'undefined') return undefined
    return window.localStorage
  } catch {
    return undefined
  }
}

export function readStoredValue<T>({
  key,
  fallback,
  parse,
  storage = browserStorage(),
  legacyKeys = [],
}: {
  key: string
  fallback: T
  parse: (raw: string) => T | undefined
  storage?: StorageLike
  legacyKeys?: readonly string[]
}): T {
  if (!storage) return fallback
  const keys = [key, ...legacyKeys]

  for (const candidateKey of keys) {
    try {
      const raw = storage.getItem(candidateKey)
      if (raw === null) continue
      const value = parse(raw)
      if (value === undefined) {
        storage.removeItem(candidateKey)
        continue
      }
      if (candidateKey !== key) {
        storage.setItem(key, JSON.stringify(value))
        storage.removeItem(candidateKey)
      }
      return value
    } catch {
      return fallback
    }
  }
  return fallback
}

export function writeStoredValue<T>(key: string, value: T, storage = browserStorage()): boolean {
  if (!storage) return false
  try {
    storage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function readLanguageList(
  key: string,
  allowedLanguages: readonly LanguageCode[],
  fallback: LanguageCode[],
  legacyKeys: readonly string[] = [],
  storage = browserStorage(),
): LanguageCode[] {
  return readStoredValue({
    key,
    fallback,
    legacyKeys,
    storage,
    parse(raw) {
      try {
        const parsed: unknown = JSON.parse(raw)
        if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === 'string'))
          return undefined
        const filtered = parsed.filter((item): item is LanguageCode =>
          (allowedLanguages as readonly string[]).includes(item),
        )
        return filtered.length === parsed.length ? filtered : undefined
      } catch {
        return undefined
      }
    },
  })
}

export function readBooleanPreference(
  key: string,
  fallback: boolean,
  storage = browserStorage(),
): boolean {
  return readStoredValue({
    key,
    fallback,
    storage,
    parse(raw) {
      if (raw === 'true') return true
      if (raw === 'false') return false
      try {
        const parsed: unknown = JSON.parse(raw)
        return typeof parsed === 'boolean' ? parsed : undefined
      } catch {
        return undefined
      }
    },
  })
}

export function readStringPreference(key: string, fallback: string): string {
  return readStoredValue({
    key,
    fallback,
    parse(raw) {
      return raw.trim() ? raw : undefined
    },
  })
}

export function writeStringPreference(
  key: string,
  value: string,
  storage = browserStorage(),
): boolean {
  if (!storage) return false
  try {
    storage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export function hasStoredValue(key: string, storage = browserStorage()): boolean {
  if (!storage) return false
  try {
    return storage.getItem(key) !== null
  } catch {
    return false
  }
}
