import { getSegmentedText } from '@/utils/text'

export type CharacterState =
  'empty' | 'correct' | 'present' | 'absent' | 'hinted' | 'hinted-correct'

export interface CharacterMatch {
  char: string
  state: CharacterState
}

/** Uses Wordle-style frequency consumption after exact matches are reserved. */
export function matchCharacters(
  expectedText: string,
  enteredText: string,
  hintedIndices: ReadonlySet<number> = new Set(),
): CharacterMatch[] {
  const expected = getSegmentedText(expectedText)
  const entered = getSegmentedText(enteredText)
  const states: CharacterState[] = expected.map(() => 'empty')
  const unmatchedExpected = new Map<string, number>()

  for (let index = 0; index < expected.length; index += 1) {
    const expectedCharacter = expected[index] as string
    if (entered[index] === expectedCharacter) {
      states[index] = 'correct'
    } else {
      unmatchedExpected.set(expectedCharacter, (unmatchedExpected.get(expectedCharacter) ?? 0) + 1)
    }
  }

  for (let index = 0; index < expected.length; index += 1) {
    if (states[index] === 'correct') continue
    const enteredCharacter = entered[index]
    if (!enteredCharacter) continue

    const remaining = unmatchedExpected.get(enteredCharacter) ?? 0
    if (remaining > 0) {
      states[index] = 'present'
      unmatchedExpected.set(enteredCharacter, remaining - 1)
    } else {
      states[index] = 'absent'
    }
  }

  return expected.map((character, index) => {
    const state = states[index] as CharacterState
    if (hintedIndices.has(index)) {
      return { char: character, state: state === 'correct' ? 'hinted-correct' : 'hinted' }
    }
    return { char: entered[index] ?? '', state }
  })
}
