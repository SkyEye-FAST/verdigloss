import fs from 'fs/promises'
import crypto from 'crypto'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const BASE62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

function sha256ToBase62(inputString, length = 3) {
  const hash = crypto.createHash('sha256').update(inputString).digest()
  let hashInt = BigInt('0x' + hash.toString('hex'))
  let base62String = ''

  while (hashInt > 0n) {
    const remainder = Number(hashInt % BigInt(BASE62.length))
    hashInt = hashInt / BigInt(BASE62.length)
    base62String = BASE62[remainder] + base62String
  }

  return base62String.padStart(length, '0').slice(0, length)
}

async function generateIdMap() {
  const enUsPath = path.join(
    __dirname,
    '../src/assets/mc_lang/valid/en_us.json',
  )
  const idMapPath = path.join(__dirname, '../src/assets/data/id.json')

  try {
    const enUsData = JSON.parse(await fs.readFile(enUsPath, 'utf8'))
    const codeToKeyMap = {}

    for (const key of Object.keys(enUsData)) {
      const code = sha256ToBase62(key)
      codeToKeyMap[code] = key
      console.log(`Code: ${code} -> Key: ${key}`)
    }

    await fs.writeFile(idMapPath, JSON.stringify(codeToKeyMap, null, 2))
    console.log('ID mapping file generated successfully!')
  } catch (err) {
    console.error('Error generating ID mapping file:', err.message)
    process.exit(1)
  }
}

generateIdMap()
