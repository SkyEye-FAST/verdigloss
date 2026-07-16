import { err, ok, type Result } from './result'

export const QUIZ_CODE_VERSION = 'v1' as const
export const QUIZ_ID_WIDTH = 7
export const LEGACY_SEGMENT_WIDTH = 3
export const LEGACY_QUESTION_COUNT = 10

export type QuizCodeVersion = typeof QUIZ_CODE_VERSION | 'legacy'
export type QuizIdMap = Readonly<Record<string, string>>

export interface DecodedQuizCode {
  version: QuizCodeVersion
  ids: string[]
  keys: string[]
}

export type QuizCodeError =
  | { kind: 'missing-code' }
  | { kind: 'malformed-code'; code: string }
  | { kind: 'unsupported-version'; version: string }
  | { kind: 'unknown-id'; id: string; version: QuizCodeVersion }
  | { kind: 'duplicate-id'; id: string }
  | { kind: 'duplicate-key'; key: string }

export class QuizIdMapInvariantError extends Error {
  readonly name = 'QuizIdMapInvariantError'
}

function isBase62Id(value: string, width: number): boolean {
  return new RegExp(`^[A-Za-z0-9]{${width}}$`).test(value)
}

/**
 * Builds a reproducible ID-to-key mapping and refuses every lossy condition.
 * The ID factory is injected so the same invariant checks are usable in tests.
 */
export function buildQuizIdMap(
  keys: readonly string[],
  createId: (key: string) => string,
  width = QUIZ_ID_WIDTH,
): Record<string, string> {
  const mapping: Record<string, string> = {}
  const seenKeys = new Set<string>()

  for (const key of [...keys].sort((left, right) => left.localeCompare(right))) {
    if (!key || seenKeys.has(key)) {
      throw new QuizIdMapInvariantError(`Duplicate or empty translation key: ${key}`)
    }
    seenKeys.add(key)

    const id = createId(key)
    if (!isBase62Id(id, width)) {
      throw new QuizIdMapInvariantError(`Invalid quiz ID for ${key}: ${id}`)
    }
    if (mapping[id] !== undefined) {
      throw new QuizIdMapInvariantError(`Quiz ID collision for ${id}: ${mapping[id]} and ${key}`)
    }
    mapping[id] = key
  }

  if (Object.keys(mapping).length !== keys.length) {
    throw new QuizIdMapInvariantError('Quiz ID map does not contain every translation key.')
  }

  return Object.fromEntries(
    Object.entries(mapping).sort(([left], [right]) => left.localeCompare(right)),
  )
}

export function encodeQuizCode(
  keys: readonly string[],
  idMap: QuizIdMap,
): Result<string, QuizCodeError> {
  const keyToId = new Map<string, string>()
  for (const [id, key] of Object.entries(idMap)) {
    if (keyToId.has(key)) {
      return err({ kind: 'duplicate-key', key })
    }
    keyToId.set(key, id)
  }

  const ids: string[] = []
  for (const key of keys) {
    const id = keyToId.get(key)
    if (id === undefined) return err({ kind: 'unknown-id', id: key, version: QUIZ_CODE_VERSION })
    if (ids.includes(id)) return err({ kind: 'duplicate-id', id })
    ids.push(id)
  }

  if (ids.length === 0) return err({ kind: 'malformed-code', code: '' })
  return ok(
    `${QUIZ_CODE_VERSION}.${[...ids].sort((left, right) => left.localeCompare(right)).join('.')}`,
  )
}

function decodeIds(
  version: QuizCodeVersion,
  ids: string[],
  idMap: QuizIdMap,
): Result<DecodedQuizCode, QuizCodeError> {
  const keys: string[] = []
  const seenIds = new Set<string>()
  const seenKeys = new Set<string>()

  for (const id of ids) {
    if (seenIds.has(id)) return err({ kind: 'duplicate-id', id })
    seenIds.add(id)
    const key = idMap[id]
    if (key === undefined) return err({ kind: 'unknown-id', id, version })
    if (seenKeys.has(key)) return err({ kind: 'duplicate-key', key })
    seenKeys.add(key)
    keys.push(key)
  }

  return ok({ version, ids, keys })
}

export function decodeLegacyQuizCode(
  code: string,
  legacyIdMap: QuizIdMap,
): Result<DecodedQuizCode, QuizCodeError> {
  if (!new RegExp(`^[A-Za-z0-9]{${LEGACY_SEGMENT_WIDTH * LEGACY_QUESTION_COUNT}}$`).test(code)) {
    return err({ kind: 'malformed-code', code })
  }

  const ids = Array.from({ length: LEGACY_QUESTION_COUNT }, (_, index) =>
    code.slice(index * LEGACY_SEGMENT_WIDTH, (index + 1) * LEGACY_SEGMENT_WIDTH),
  )
  return decodeIds('legacy', ids, legacyIdMap)
}

export function decodeQuizCode(
  code: string | undefined,
  idMap: QuizIdMap,
  legacyIdMap: QuizIdMap,
): Result<DecodedQuizCode, QuizCodeError> {
  if (!code) return err({ kind: 'missing-code' })

  if (code.startsWith(`${QUIZ_CODE_VERSION}.`)) {
    const segments = code.split('.')
    const ids = segments.slice(1)
    if (
      segments[0] !== QUIZ_CODE_VERSION ||
      ids.length === 0 ||
      ids.some((id) => !isBase62Id(id, QUIZ_ID_WIDTH))
    ) {
      return err({ kind: 'malformed-code', code })
    }
    return decodeIds(QUIZ_CODE_VERSION, ids, idMap)
  }

  const versionMatch = /^([A-Za-z][A-Za-z0-9_-]*)\./.exec(code)
  if (versionMatch?.[1]) return err({ kind: 'unsupported-version', version: versionMatch[1] })

  return decodeLegacyQuizCode(code, legacyIdMap)
}
