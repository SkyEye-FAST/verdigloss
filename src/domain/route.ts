import type { LanguageCode } from '@/data/languages'

import { err, ok, type Result } from './result'

export type QueryValue = string | Array<string | null> | null | undefined
export type TimerMode = 'timed' | 'untimed'

export type RouteQueryError =
  { kind: 'unsupported-language'; language: string } | { kind: 'invalid-timer-mode'; value: string }

function singleValue(value: QueryValue): string | undefined {
  return Array.isArray(value) || value === null ? undefined : value
}

export function parseTargetLanguage(
  value: QueryValue,
  supportedLanguages: readonly LanguageCode[],
  fallback: LanguageCode,
): Result<LanguageCode, RouteQueryError> {
  const language = singleValue(value)
  if (language === undefined) return ok(fallback)
  if ((supportedLanguages as readonly string[]).includes(language))
    return ok(language as LanguageCode)
  return err({ kind: 'unsupported-language', language })
}

export function parseTimerMode(value: QueryValue): Result<TimerMode, RouteQueryError> {
  const timer = singleValue(value)
  if (timer === undefined || timer === '0') return ok('untimed')
  if (timer === '1') return ok('timed')
  return err({ kind: 'invalid-timer-mode', value: timer })
}
