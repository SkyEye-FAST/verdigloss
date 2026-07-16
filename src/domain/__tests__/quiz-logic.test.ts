import { describe, expect, it } from 'vitest'

import { matchCharacters } from '../matching'
import { buildEligibleQuestionPool, buildQuizQuestions, getQuizLanguageAvailability } from '../quiz'
import { parseTargetLanguage, parseTimerMode } from '../route'
import { aggregateScores, calculateQuestionScore } from '../scoring'
import { shuffle } from '../shuffle'
import { createQuizTimer, isTimerExpired, remainingSeconds, timerProgressPercent } from '../timer'
import type { LanguageCode, LanguageFile } from '@/utils/languages'

const files = {
  en_us: { one: 'Stone', two: 'Dirt', same: 'Same', missing: 'Missing', unmapped: 'Unmapped' },
  zh_cn: { one: '石头', two: '泥土', same: 'Same', missing: '', unmapped: '未映射' },
} as unknown as Record<LanguageCode, LanguageFile>
const map = { AAAAAAA: 'one', BBBBBBB: 'two', CCCCCCC: 'same', DDDDDDD: 'missing' }

describe('quiz business logic', () => {
  it('uses a non-mutating injectable Fisher-Yates shuffle', () => {
    const source = [1, 2, 3, 4]
    expect(shuffle(source, () => 0)).toEqual([2, 3, 4, 1])
    expect(source).toEqual([1, 2, 3, 4])
    expect(shuffle([])).toEqual([])
    expect(shuffle([1])).toEqual([1])
    expect([...shuffle(source)].sort()).toEqual(source)
  })

  it('filters eligible translations and reports insufficient selected questions', () => {
    expect(buildEligibleQuestionPool('zh_cn', files, map).map((question) => question.key)).toEqual(['one', 'two'])
    expect(getQuizLanguageAvailability('zh_cn', files, map, 3)).toEqual({ language: 'zh_cn', eligibleCount: 2, available: false })
    expect(buildQuizQuestions(['one', 'same', 'missing'], 'zh_cn', files, map, 3)).toEqual({
      ok: false,
      error: { kind: 'too-few-questions', language: 'zh_cn', eligibleCount: 1, requiredCount: 3 },
    })
  })

  it('consumes duplicate characters exactly once and supports grapheme segmentation and hints', () => {
    expect(matchCharacters('abc', 'abc').map((match) => match.state)).toEqual(['correct', 'correct', 'correct'])
    expect(matchCharacters('abc', 'xyz').map((match) => match.state)).toEqual(['absent', 'absent', 'absent'])
    expect(matchCharacters('aab', 'aaa').map((match) => match.state)).toEqual(['correct', 'correct', 'absent'])
    expect(matchCharacters('aab', 'baa').map((match) => match.state)).toEqual(['present', 'correct', 'present'])
    expect(matchCharacters('你好', '您好', new Set([1]))).toEqual([
      { char: '您', state: 'absent' },
      { char: '好', state: 'hinted-correct' },
    ])
    expect(matchCharacters('👨‍👩‍👧', '👨‍👩‍👧')).toEqual([{ char: '👨‍👩‍👧', state: 'correct' }])
    expect(matchCharacters('ab', '').map((match) => match.state)).toEqual(['empty', 'empty'])
  })

  it('scores from stored outcomes with rounding and zero skip or timeout scores', () => {
    expect(calculateQuestionScore({ completion: 'correct', hintCount: 1, segmentCount: 3 })).toEqual({ completion: 'correct', score: 6.67 })
    expect(calculateQuestionScore({ completion: 'skipped', hintCount: 0, segmentCount: 2 }).score).toBe(0)
    expect(calculateQuestionScore({ completion: 'timed-out', hintCount: 0, segmentCount: 2 }).score).toBe(0)
    expect(aggregateScores([{ completion: 'correct', score: 6.67 }, { completion: 'skipped', score: 0 }, { completion: 'correct', score: 3.33 }])).toBe(10)
  })

  it('uses deadline-based timer calculations despite delayed callbacks', () => {
    const timer = createQuizTimer(1_000, 10)
    expect(remainingSeconds(timer, 4_250)).toBe(7)
    expect(timerProgressPercent(timer, 6_000)).toBe(50)
    expect(isTimerExpired(timer, 11_000)).toBe(true)
  })

  it('parses valid and invalid route query values explicitly', () => {
    expect(parseTargetLanguage('zh_cn', ['zh_cn'] as LanguageCode[], 'zh_cn')).toEqual({ ok: true, value: 'zh_cn' })
    expect(parseTargetLanguage('xx_yy', ['zh_cn'] as LanguageCode[], 'zh_cn')).toEqual({ ok: false, error: { kind: 'unsupported-language', language: 'xx_yy' } })
    expect(parseTimerMode('1')).toEqual({ ok: true, value: 'timed' })
    expect(parseTimerMode('2')).toEqual({ ok: false, error: { kind: 'invalid-timer-mode', value: '2' } })
  })
})
