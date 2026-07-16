import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const QUIZ_CODE_VERSION = 'v1'
const QUIZ_ID_WIDTH = 7

export function sha256ToBase62(input, length = QUIZ_ID_WIDTH) {
  const hash = crypto.createHash('sha256').update(input).digest()
  let hashInt = BigInt(`0x${hash.toString('hex')}`)
  let base62String = ''

  while (hashInt > 0n) {
    const remainder = Number(hashInt % BigInt(BASE62.length))
    hashInt /= BigInt(BASE62.length)
    base62String = BASE62[remainder] + base62String
  }

  return base62String.padStart(length, '0').slice(0, length)
}

export function buildIdMap(keys, createId = sha256ToBase62) {
  const ids = {}
  const seenKeys = new Set()

  for (const key of [...keys].sort((left, right) => left.localeCompare(right))) {
    if (!key || seenKeys.has(key)) throw new Error(`Duplicate or empty translation key: ${key}`)
    seenKeys.add(key)

    const id = createId(key)
    if (!/^[A-Za-z0-9]{7}$/.test(id)) throw new Error(`Invalid v1 quiz ID for ${key}: ${id}`)
    if (ids[id]) throw new Error(`Quiz ID collision for ${id}: ${ids[id]} and ${key}`)
    ids[id] = key
  }

  if (Object.keys(ids).length !== keys.length) {
    throw new Error('Quiz ID map does not contain every English translation key.')
  }
  return Object.fromEntries(Object.entries(ids).sort(([left], [right]) => left.localeCompare(right)))
}

async function generateIdMap() {
  const englishPath = path.join(__dirname, '..', 'src', 'assets', 'mc_lang', 'valid', 'en_us.json')
  const outputPath = path.join(__dirname, '..', 'src', 'assets', 'data', 'quiz-id-map.json')
  const english = JSON.parse(await fs.readFile(englishPath, 'utf8'))
  const ids = buildIdMap(Object.keys(english))
  const payload = { version: QUIZ_CODE_VERSION, idWidth: QUIZ_ID_WIDTH, ids }
  await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.log(`Generated ${Object.keys(ids).length} ${QUIZ_CODE_VERSION} quiz IDs without collisions.`)
}

generateIdMap().catch((error) => {
  console.error(`Unable to generate quiz ID mapping: ${error.message}`)
  process.exitCode = 1
})
