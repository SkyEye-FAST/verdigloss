export const QUIZ_BASE_SCORE = 10

export type QuestionCompletion = 'correct' | 'skipped' | 'timed-out' | 'incomplete'

export interface QuestionScoreInput {
  completion: QuestionCompletion
  hintCount: number
  segmentCount: number
  baseScore?: number
}

export interface QuestionScore {
  completion: QuestionCompletion
  score: number
}

export function roundScore(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function calculateQuestionScore({
  completion,
  hintCount,
  segmentCount,
  baseScore = QUIZ_BASE_SCORE,
}: QuestionScoreInput): QuestionScore {
  if (completion !== 'correct') return { completion, score: 0 }
  const safeSegmentCount = Math.max(1, segmentCount)
  const penalty = Math.min(Math.max(hintCount, 0), safeSegmentCount) / safeSegmentCount
  return { completion, score: roundScore(Math.max(0, baseScore * (1 - penalty))) }
}

export function aggregateScores(results: readonly QuestionScore[]): number {
  return roundScore(results.reduce((total, result) => total + result.score, 0))
}
