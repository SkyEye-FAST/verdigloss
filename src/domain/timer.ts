export interface QuizTimer {
  startedAt: number
  durationMs: number
}

export function createQuizTimer(startedAt: number, durationSeconds: number): QuizTimer {
  return { startedAt, durationMs: durationSeconds * 1000 }
}

export function elapsedMilliseconds(timer: QuizTimer, now: number): number {
  return Math.max(0, now - timer.startedAt)
}

export function remainingMilliseconds(timer: QuizTimer, now: number): number {
  return Math.max(0, timer.durationMs - elapsedMilliseconds(timer, now))
}

export function remainingSeconds(timer: QuizTimer, now: number): number {
  return Math.ceil(remainingMilliseconds(timer, now) / 1000)
}

export function isTimerExpired(timer: QuizTimer, now: number): boolean {
  return elapsedMilliseconds(timer, now) >= timer.durationMs
}

export function timerProgressPercent(timer: QuizTimer, now: number): number {
  if (timer.durationMs <= 0) return 0
  return (remainingMilliseconds(timer, now) / timer.durationMs) * 100
}
