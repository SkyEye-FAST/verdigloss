import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { QUIZ_ID_WIDTH, QUIZ_CODE_VERSION, buildIdMap } from './generate-id-mapping.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const fromRoot = (...parts) => path.join(root, ...parts)

function fail(message) {
  throw new Error(message)
}

function flattenKeys(value, prefix = '') {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return [prefix]
  return Object.entries(value).flatMap(([key, child]) =>
    flattenKeys(child, prefix ? `${prefix}.${key}` : key),
  )
}

function assertSameKeys(expected, actual, label) {
  const expectedKeys = flattenKeys(expected).sort()
  const actualKeys = flattenKeys(actual).sort()
  if (expectedKeys.join('\n') !== actualKeys.join('\n')) {
    const missing = expectedKeys.filter((key) => !actualKeys.includes(key))
    const unexpected = actualKeys.filter((key) => !expectedKeys.includes(key))
    fail(
      `${label} does not match the English interface keys (missing: ${missing.join(', ') || 'none'}; unexpected: ${unexpected.join(', ') || 'none'}).`,
    )
  }
}

async function readJson(relativePath) {
  return JSON.parse(await fs.readFile(fromRoot(relativePath), 'utf8'))
}

async function main() {
  const validDirectory = fromRoot('src', 'assets', 'mc_lang', 'valid')
  const english = await readJson('src/assets/mc_lang/valid/en_us.json')
  const generated = await readJson('src/assets/data/quiz-id-map.json')
  const rating = await readJson('src/assets/data/rating.json')
  const englishKeys = Object.keys(english).sort()
  const expectedIds = buildIdMap(englishKeys)

  if (generated.version !== QUIZ_CODE_VERSION || generated.idWidth !== QUIZ_ID_WIDTH) {
    fail('quiz-id-map.json has an unsupported version or ID width.')
  }
  if (JSON.stringify(generated.ids) !== JSON.stringify(expectedIds)) {
    fail('quiz-id-map.json is stale or non-deterministic; run pnpm generate-data.')
  }

  const ids = Object.entries(generated.ids)
  if (
    ids.some(
      ([id, key]) => !new RegExp(`^[A-Za-z0-9]{${QUIZ_ID_WIDTH}}$`).test(id) || !english[key],
    )
  ) {
    fail('Every generated quiz ID must decode to an English translation key.')
  }
  const mappedKeys = ids.map(([, key]) => key).sort()
  if (
    new Set(ids.map(([id]) => id)).size !== ids.length ||
    new Set(mappedKeys).size !== mappedKeys.length
  ) {
    fail('quiz-id-map.json contains duplicate quiz IDs or translation keys.')
  }
  if (mappedKeys.join('\n') !== englishKeys.join('\n')) {
    fail('quiz-id-map.json lost English translation keys.')
  }

  for (const [key, value] of Object.entries(rating)) {
    if (!english[key] || typeof value !== 'number' || !Number.isFinite(value)) {
      fail(`rating.json contains an invalid entry for ${key}.`)
    }
  }

  const registrySource = await fs.readFile(fromRoot('src', 'data', 'languages.ts'), 'utf8')
  const registryCodes = [...registrySource.matchAll(/\['([a-z]{2,3}(?:_[a-z]{2})?)',/g)].map(
    (match) => match[1],
  )
  const dataFiles = (await fs.readdir(validDirectory))
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.slice(0, -5))
    .sort()
  if (
    !registryCodes.length ||
    [...new Set(registryCodes)].sort().join('\n') !== dataFiles.join('\n')
  ) {
    fail('Language registry entries must refer exactly to language data files in valid/.')
  }

  const [en, zhCn, zhTw] = await Promise.all([
    readJson('src/locales/en.json'),
    readJson('src/locales/zh-cn.json'),
    readJson('src/locales/zh-tw.json'),
  ])
  assertSameKeys(en, zhCn, 'zh-cn.json')
  assertSameKeys(en, zhTw, 'zh-tw.json')

  console.log(
    `Validated ${englishKeys.length} English keys, ${ids.length} reversible quiz IDs, ${registryCodes.length} language files, and interface locale parity.`,
  )
}

main().catch((error) => {
  console.error(`Generated-data validation failed: ${error.message}`)
  process.exitCode = 1
})
