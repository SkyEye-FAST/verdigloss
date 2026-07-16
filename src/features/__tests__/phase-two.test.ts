import { describe, expect, it } from 'vitest'
import { i18n } from '@/app/i18n'
import { documentTitleFor } from '@/app/document-title'
import { router } from '@/app/router'
import { languageList } from '@/data/languages'
import { splitTrailingAnnotation } from '@/features/colors/color-data'
import { getSearchIndex, SearchIndex } from '@/features/query/search-index'
import { clampPage, filterTranslationKeys, pageKeys } from '@/features/table/table-data'
import { loadLanguage, TranslationDataError } from '@/services/translation-data'
import { exportFilename, serializeCsv, serializeTsv, serializeXml, spreadsheetRows, type ExportRow } from '@/services/exports'

describe('phase-two data boundaries', () => {
  it('caches language loading and exposes a clear failure', async () => {
    const first = loadLanguage('en_us')
    expect(loadLanguage('en_us')).toBe(first)
    await expect(first).resolves.toHaveProperty('block.minecraft.stone')
    await expect(loadLanguage('missing' as never)).rejects.toBeInstanceOf(TranslationDataError)
    expect(languageList).toContain('en_us')
  })

  it('builds predictable capped search indexes', () => {
    const index = new SearchIndex('en_us', { 'item.apple': 'Apple', 'block.apple': 'Apple block', stone: 'Stone' })
    expect(index.search('key', 'apple')).toHaveLength(2)
    expect(index.search('source', 'APPLE', 1)).toEqual([{ key: 'item.apple', matchedValue: '', mode: 'source', language: 'en_us' }])
    expect(getSearchIndex('en_us', { stone: 'Stone' }).search('key', 'stone')).toHaveLength(1)
  })

  it('filters only selected loaded columns and clamps pagination without page zero', () => {
    const dictionaries = { en_us: { apple: 'Apple', stone: 'Stone' }, zh_cn: { apple: '苹果', stone: '石头' } }
    expect(filterTranslationKeys(['apple', 'stone'], dictionaries, ['zh_cn'], 'stone')).toEqual(['stone'])
    expect(filterTranslationKeys(['apple', 'stone'], dictionaries, ['zh_cn'], '苹果')).toEqual(['apple'])
    expect(clampPage(4, 0, 50)).toBe(0)
    expect(clampPage(4, 51, 50)).toBe(2)
    expect(pageKeys(['apple'], 0)).toEqual([])
  })

  it('serializes spreadsheet-safe exports and escapes structured formats', () => {
    const rows: ExportRow[] = [{ key: '=SUM(A1)', values: { en_us: 'A,"B"\nC', zh_cn: '<tag>&' } }]
    expect(serializeCsv(rows, ['en_us'])).toBe('\uFEFF"key","en_us"\r\n"=SUM(A1)","A,""B""\nC"\r\n')
    expect(serializeTsv(rows, ['en_us'])).toContain('A,"B" C')
    expect(serializeXml(rows, ['zh_cn'])).toContain('&lt;tag&gt;&amp;')
    expect(spreadsheetRows(rows, ['en_us'])[1]).toEqual(["'=SUM(A1)", 'A,"B"\nC'])
    expect(exportFilename('1.21.6', 'filtered', 'csv')).toBe('verdigloss-1.21.6-filtered.csv')
  })

  it('only removes a trailing parenthetical annotation from color labels', () => {
    expect(splitTrailingAnnotation('두 단어 이름 (漢字)')).toEqual({ label: '두 단어 이름', annotation: '(漢字)' })
    expect(splitTrailingAnnotation('plain (parenthesis) text')).toEqual({ label: 'plain (parenthesis) text', annotation: '' })
  })

  it('gives every route a fallback title and updates the document title for locale changes', async () => {
    expect(router.getRoutes().every((route) => typeof route.meta.fallbackTitle === 'string')).toBe(true)
    const table = router.resolve('/table')
    expect(documentTitleFor(table.meta)).toContain('Translation')
    i18n.global.locale.value = 'zh-CN'
    expect(documentTitleFor(table.meta)).toContain('标准译名表')
    expect(documentTitleFor(router.resolve('/does-not-exist').meta)).toBe('Page not found - Verdigloss')
    i18n.global.locale.value = 'en'
  })
})
