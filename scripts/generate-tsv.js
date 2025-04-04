import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const langDir = path.join(__dirname, '../src/assets/mc_lang/valid')
const outputPath = path.join(__dirname, '../public/table.tsv')

const languages = [
  'en_us',
  'zh_cn',
  'zh_hk',
  'zh_tw',
  'lzh',
  'ja_jp',
  'ko_kr',
  'vi_vn',
]

async function generateTsv() {
  const data = {}

  for (const lang of languages) {
    const filePath = path.join(langDir, `${lang}.json`)
    const content = await fs.promises.readFile(filePath, 'utf-8')
    data[lang] = JSON.parse(content)
  }

  const headers = ['key', ...languages]
  const rows = [headers.join('\t')]

  for (const key of Object.keys(data.en_us)) {
    const row = [key]
    for (const lang of languages) {
      const value = data[lang][key] || '？'
      row.push(value)
    }
    rows.push(row.join('\t'))
  }

  await fs.promises.writeFile(outputPath, rows.join('\n'), 'utf-8')
  console.log('TSV file generated successfully!')
}

generateTsv().catch(console.error)
