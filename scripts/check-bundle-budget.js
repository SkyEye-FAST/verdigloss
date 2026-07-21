import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const manifestPath = path.join(dist, '.vite', 'manifest.json')
const KiB = 1024
const approvedRemoteFontUrls = new Set([
  'https://cdn.jsdelivr.net/npm/@hanzi.pro/webfonts-shanggu-serif@0.1.0/swap.css',
  'https://cdn.jsdelivr.net/npm/@hanzi.pro/webfonts-shanggu-sans@0.1.0/swap.css',
])
const budgets = {
  initialJavaScript: 350 * KiB,
  largestJavaScriptChunk: 700 * KiB,
  languageChunk: 250 * KiB,
  xlsxChunk: 550 * KiB,
  css: 120 * KiB,
  remoteFontRequests: approvedRemoteFontUrls.size,
}

const fileSize = async (file) => (await fs.stat(path.join(dist, file))).size

async function main() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'))
  const entries = Object.entries(manifest)
  const appEntry = entries.find(([, chunk]) => chunk.isEntry)
  if (!appEntry) throw new Error('Vite manifest has no application entry.')

  const initial = new Set()
  const visit = (key) => {
    if (initial.has(key)) return
    initial.add(key)
    for (const imported of manifest[key]?.imports ?? []) visit(imported)
  }
  visit(appEntry[0])
  const initialFiles = [...initial]
    .map((key) => manifest[key].file)
    .filter((file) => file.endsWith('.js'))
  const allJs = entries.map(([, chunk]) => chunk.file).filter((file) => file.endsWith('.js'))
  const languageFiles = entries
    .filter(([key]) => key.includes('/mc_lang/valid/'))
    .map(([, chunk]) => chunk.file)
  const xlsxFiles = entries
    .filter(([key, chunk]) => key.includes('xlsx') || chunk.file.includes('xlsx'))
    .map(([, chunk]) => chunk.file)
  const cssFiles = [...new Set(entries.flatMap(([, chunk]) => chunk.css ?? []))]
  const outputFiles = await fs.readdir(path.join(dist, 'assets'))
  const remoteFontUrls = [
    ...new Set(
      (
        await Promise.all(
          outputFiles
            .filter((file) => file.endsWith('.css'))
            .map((file) => fs.readFile(path.join(dist, 'assets', file), 'utf8')),
        )
      )
        .join('\n')
        .match(/https?:\/\/[^\s)'\"]*(?:font|typeface)[^\s)'\"]*/gi) ?? [],
    ),
  ]
  const unapprovedRemoteFontUrls = remoteFontUrls.filter((url) => !approvedRemoteFontUrls.has(url))
  if (unapprovedRemoteFontUrls.length) {
    throw new Error(`unapproved remote font URLs: ${unapprovedRemoteFontUrls.join(', ')}`)
  }

  const measurements = {
    initialJavaScript: (await Promise.all(initialFiles.map(fileSize))).reduce(
      (total, size) => total + size,
      0,
    ),
    largestJavaScriptChunk: Math.max(0, ...(await Promise.all(allJs.map(fileSize)))),
    largestLanguageChunk: Math.max(0, ...(await Promise.all(languageFiles.map(fileSize)))),
    largestXlsxChunk: Math.max(0, ...(await Promise.all(xlsxFiles.map(fileSize)))),
    css: (await Promise.all(cssFiles.map(fileSize))).reduce((total, size) => total + size, 0),
    remoteFontRequests: remoteFontUrls.length,
  }

  const checks = [
    ['initialJavaScript', measurements.initialJavaScript, budgets.initialJavaScript],
    ['largestJavaScriptChunk', measurements.largestJavaScriptChunk, budgets.largestJavaScriptChunk],
    ['largestLanguageChunk', measurements.largestLanguageChunk, budgets.languageChunk],
    ['largestXlsxChunk', measurements.largestXlsxChunk, budgets.xlsxChunk],
    ['css', measurements.css, budgets.css],
    ['remoteFontRequests', measurements.remoteFontRequests, budgets.remoteFontRequests],
  ]
  for (const [name, actual, limit] of checks) {
    if (actual > limit) {
      const unit = name === 'remoteFontRequests' ? 'requests' : 'bytes'
      throw new Error(`${name} is ${actual} ${unit}; budget is ${limit}.`)
    }
  }
  if (xlsxFiles.some((file) => initialFiles.includes(file)))
    throw new Error('XLSX is included in initial route JavaScript.')
  console.log(
    JSON.stringify({ budgets, measurements, initialFiles, languageFiles, xlsxFiles }, null, 2),
  )
}

main().catch((error) => {
  console.error(`Bundle-budget check failed: ${error.message}`)
  process.exitCode = 1
})
