import legacyIdMap from '@/assets/data/id.json'
import generatedIdData from '@/assets/data/quiz-id-map.json'
import { loadLanguage } from '@/services/translation-data'
import { describe, expect, it } from 'vitest'

import {
  QUIZ_CODE_VERSION,
  QuizIdMapInvariantError,
  buildQuizIdMap,
  decodeLegacyQuizCode,
  decodeQuizCode,
  encodeQuizCode,
} from '../quiz-code'

describe('quiz-code integrity', () => {
  it('generates deterministic mappings without losing English keys', async () => {
    const keys = ['z.key', 'a.key', 'm.key']
    const first = buildQuizIdMap(keys, (key) => ({ 'a.key': 'AAAAAAA', 'm.key': 'BBBBBBB', 'z.key': 'CCCCCCC' })[key] as string)
    const second = buildQuizIdMap([...keys].reverse(), (key) => ({ 'a.key': 'AAAAAAA', 'm.key': 'BBBBBBB', 'z.key': 'CCCCCCC' })[key] as string)
    expect(first).toEqual(second)
    const english = await loadLanguage('en_us')
    expect(Object.keys(generatedIdData.ids)).toHaveLength(Object.keys(english).length)
    expect(new Set(Object.values(generatedIdData.ids)).size).toBe(Object.keys(english).length)
  })

  it('fails generation clearly on an ID collision', () => {
    expect(() => buildQuizIdMap(['first', 'second'], () => 'AAAAAAA')).toThrow(QuizIdMapInvariantError)
  })

  it('round-trips versioned quiz codes', () => {
    const map = { AAAAAAA: 'first', BBBBBBB: 'second' }
    const encoded = encodeQuizCode(['second', 'first'], map)
    expect(encoded).toEqual({ ok: true, value: `${QUIZ_CODE_VERSION}.AAAAAAA.BBBBBBB` })
    if (!encoded.ok) throw new Error('Expected an encoded quiz code')
    expect(decodeQuizCode(encoded.value, map, {})).toEqual({
      ok: true,
      value: { version: 'v1', ids: ['AAAAAAA', 'BBBBBBB'], keys: ['first', 'second'] },
    })
  })

  it('rejects malformed, unknown, duplicate, and unsupported codes', () => {
    const map = { AAAAAAA: 'first' }
    expect(decodeQuizCode(undefined, map, {})).toEqual({ ok: false, error: { kind: 'missing-code' } })
    expect(decodeQuizCode('v1.BAD', map, {})).toMatchObject({ ok: false, error: { kind: 'malformed-code' } })
    expect(decodeQuizCode('v1.BBBBBBB', map, {})).toMatchObject({ ok: false, error: { kind: 'unknown-id', id: 'BBBBBBB' } })
    expect(decodeQuizCode('v1.AAAAAAA.AAAAAAA', map, {})).toMatchObject({ ok: false, error: { kind: 'duplicate-id' } })
    expect(decodeQuizCode('v2.AAAAAAA', map, {})).toEqual({ ok: false, error: { kind: 'unsupported-version', version: 'v2' } })
  })

  it('isolates and preserves legacy 30-character parsing', () => {
    const ids = ['AAA', 'BBB', 'CCC', 'DDD', 'EEE', 'FFF', 'GGG', 'HHH', 'III', 'JJJ']
    const legacyMap = Object.fromEntries(ids.map((id, index) => [id, `key-${index}`]))
    const code = ids.join('')
    expect(decodeLegacyQuizCode(code, legacyMap)).toMatchObject({ ok: true, value: { version: 'legacy', keys: ids.map((_, index) => `key-${index}`) } })
    expect(decodeLegacyQuizCode(code.slice(1), legacyMap)).toMatchObject({ ok: false, error: { kind: 'malformed-code' } })
    expect(Object.keys(legacyIdMap)).toHaveLength(2336)
  })
})
