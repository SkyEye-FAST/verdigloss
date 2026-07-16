export type RandomSource = () => number

/** Returns a new Fisher-Yates shuffled array without mutating the input. */
export function shuffle<T>(items: readonly T[], random: RandomSource = Math.random): T[] {
  const result = [...items]

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomValue = random()
    if (!Number.isFinite(randomValue) || randomValue < 0 || randomValue >= 1) {
      throw new RangeError('Random source must return a finite number in [0, 1).')
    }

    const swapIndex = Math.floor(randomValue * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex] as T, result[index] as T]
  }

  return result
}
