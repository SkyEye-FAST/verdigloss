import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const langDir = path.join(__dirname, '..', 'src', 'assets', 'mc_lang', 'valid')
const outputPath = path.join(__dirname, '..', 'public', 'table.tsv')

const languages = ['en_us', 'zh_cn', 'zh_hk', 'zh_tw', 'lzh', 'ja_jp', 'ko_kr', 'vi_vn']

async function generateTsv() {
  try {
    const data = await Promise.all(
      languages.map(async (lang) => {
        const content = await fs.readFile(path.join(langDir, `${lang}.json`), 'utf-8')
        return [lang, JSON.parse(content)]
      }),
    )

    const langData = Object.fromEntries(data)
    const headers = ['key', ...languages]
    const rows = [headers.join('\t')]

    Object.keys(langData.en_us).forEach((key) => {
      const row = [key, ...languages.map((lang) => langData[lang][key] || '？')]
      rows.push(row.join('\t'))
    })

    await fs.writeFile(outputPath, rows.join('\n'), 'utf-8')
    console.log('TSV file generated successfully!')
  } catch (err) {
    console.error('Error generating TSV file:', err.message)
    process.exit(1)
  }
}

generateTsv().catch(console.error)
