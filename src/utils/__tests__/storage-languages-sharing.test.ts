import { describe, expect, it } from 'vitest'

import { languageList, languageRegistry } from '@/data/languages'
import { loadLanguages } from '@/services/translation-data'
import { copyText, shareContent } from '../sharing'
import { readBooleanPreference, readLanguageList, readStoredValue, writeStoredValue, type StorageLike } from '../storage'

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>()

  getItem(key: string): string | null { return this.values.get(key) ?? null }
  setItem(key: string, value: string): void { this.values.set(key, value) }
  removeItem(key: string): void { this.values.delete(key) }
}

describe('safe persistence and language registry', () => {
  it('falls back and repairs malformed or wrong-shaped stored data', () => {
    const storage = new MemoryStorage()
    storage.setItem('languages', '{bad json')
    expect(readLanguageList('languages', languageList, ['zh_cn'], [], storage)).toEqual(['zh_cn'])
    storage.setItem('languages', '["zh_cn", "unknown"]')
    expect(readLanguageList('languages', languageList, ['zh_cn'], [], storage)).toEqual(['zh_cn'])
    storage.setItem('boolean', '"true"')
    expect(readBooleanPreference('boolean', false, storage)).toBe(false)
    storage.setItem('font', 'false')
    expect(readBooleanPreference('font', true, storage)).toBe(false)
  })

  it('migrates a current key to a versioned key', () => {
    const storage = new MemoryStorage()
    storage.setItem('table:selectedLanguages', '["en_us", "zh_cn"]')
    const value = readStoredValue({
      key: 'verdigloss:table:selectedLanguages:v1',
      legacyKeys: ['table:selectedLanguages'],
      fallback: [] as string[],
      storage,
      parse: (raw) => { try { const parsed: unknown = JSON.parse(raw); return Array.isArray(parsed) ? parsed as string[] : undefined } catch { return undefined } },
    })
    expect(value).toEqual(['en_us', 'zh_cn'])
    expect(storage.getItem('table:selectedLanguages')).toBeNull()
    expect(storage.getItem('verdigloss:table:selectedLanguages:v1')).toBe('["en_us","zh_cn"]')
    expect(writeStoredValue('verdigloss:table:selectedLanguages:v1', value, storage)).toBe(true)
  })

  it('has complete, unique language metadata and data files', async () => {
    expect(new Set(languageRegistry.map((language) => language.code)).size).toBe(languageRegistry.length)
    expect(new Set(languageRegistry.map((language) => language.nativeName)).size).toBe(languageRegistry.length)
    expect(new Set(languageRegistry.map((language) => language.htmlLang)).size).toBe(languageRegistry.length)
    expect(languageRegistry.every((language) => /^[a-z]{2,3}(?:-[A-Za-z0-9]+)*$/.test(language.htmlLang))).toBe(true)
    const files = await loadLanguages(languageList)
    expect(languageRegistry.every((language) => files[language.code] !== undefined)).toBe(true)
    expect(new Set(languageRegistry.map((language) => language.code)).size).toBe(languageList.length)
  })

  it('returns explicit clipboard and share failures instead of rejecting', async () => {
    await expect(copyText('code', { writeText: async () => { throw new Error('blocked') } })).resolves.toMatchObject({ ok: false, error: { kind: 'rejected' } })
    await expect(shareContent({ title: 'Quiz' }, async () => { throw new Error('blocked') })).resolves.toMatchObject({ ok: false, error: { kind: 'rejected' } })
  })
})
