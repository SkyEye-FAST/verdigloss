import type { LanguageCode, LanguageFile } from '@/utils/languages'
import { getSegmentedText } from '@/utils/text'

import { err, ok, type Result } from './result'
import { type QuizIdMap } from './quiz-code'

export const QUIZ_QUESTION_COUNT = 10

export interface EligibleQuestion {
  key: string
  source: string
  translation: string
}

export interface QuizLanguageAvailability {
  language: LanguageCode
  eligibleCount: number
  available: boolean
}

export type QuizEligibilityError =
  | { kind: 'unsupported-language'; language: string }
  | { kind: 'too-few-questions'; language: LanguageCode; eligibleCount: number; requiredCount: number }

function normalizedMeaning(value: string): string {
  return value.normalize('NFKC').replace(/\s+/g, ' ').trim().toLocaleLowerCase()
}

export function buildEligibleQuestionPool(
  language: LanguageCode,
  languageFiles: Readonly<Record<LanguageCode, LanguageFile>>,
  idMap: QuizIdMap,
): EligibleQuestion[] {
  const english = languageFiles.en_us
  const target = languageFiles[language]
  if (!english || !target || language === 'en_us') return []

  const validKeys = new Set(Object.values(idMap))
  const seen = new Set<string>()
  const questions: EligibleQuestion[] = []

  for (const [key, source] of Object.entries(english)) {
    const translation = target[key]
    if (
      seen.has(key) ||
      !validKeys.has(key) ||
      !source?.trim() ||
      !translation?.trim() ||
      normalizedMeaning(source) === normalizedMeaning(translation)
    ) {
      continue
    }
    seen.add(key)
    questions.push({ key, source, translation })
  }

  return questions
}

export function getQuizLanguageAvailability(
  language: LanguageCode,
  languageFiles: Readonly<Record<LanguageCode, LanguageFile>>,
  idMap: QuizIdMap,
  requiredCount = QUIZ_QUESTION_COUNT,
): QuizLanguageAvailability {
  const eligibleCount = buildEligibleQuestionPool(language, languageFiles, idMap).length
  return { language, eligibleCount, available: eligibleCount >= requiredCount }
}

export function buildQuizQuestions(
  keys: readonly string[],
  language: LanguageCode,
  languageFiles: Readonly<Record<LanguageCode, LanguageFile>>,
  idMap: QuizIdMap,
  requiredCount = QUIZ_QUESTION_COUNT,
): Result<EligibleQuestion[], QuizEligibilityError> {
  if (!(language in languageFiles) || language === 'en_us') {
    return err({ kind: 'unsupported-language', language })
  }

  const eligibleByKey = new Map(
    buildEligibleQuestionPool(language, languageFiles, idMap).map((question) => [question.key, question]),
  )
  const questions = keys.flatMap((key) => {
    const question = eligibleByKey.get(key)
    return question ? [question] : []
  })

  if (questions.length < requiredCount) {
    return err({
      kind: 'too-few-questions',
      language,
      eligibleCount: questions.length,
      requiredCount,
    })
  }
  return ok(questions)
}

export function questionSegmentCount(question: EligibleQuestion): number {
  return getSegmentedText(question.translation).length
}
