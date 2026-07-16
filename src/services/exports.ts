export type ExportFormat = 'tsv' | 'csv' | 'json' | 'xml' | 'xlsx'
export type ExportScope = 'page' | 'filtered'
export interface ExportRow {
  key: string
  values: Record<string, string | undefined>
}
export const MISSING_TRANSLATION = '？'

const valueFor = (row: ExportRow, language: string) => row.values[language] ?? MISSING_TRANSLATION
const sanitizeFormula = (value: string) => (/^[=+\-@]/.test(value) ? `'${value}` : value)
const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`
const tsvCell = (value: string) => value.replace(/[\t\r\n]+/g, ' ')
const xmlEscape = (value: string) =>
  value.replace(
    /[<>&"']/g,
    (character) =>
      ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[character]!,
  )

export function serializeCsv(rows: readonly ExportRow[], languages: readonly string[]) {
  return `\uFEFF${[['key', ...languages], ...rows.map((row) => [row.key, ...languages.map((language) => valueFor(row, language))])].map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`
}
export function serializeTsv(rows: readonly ExportRow[], languages: readonly string[]) {
  return `\uFEFF${[['key', ...languages], ...rows.map((row) => [row.key, ...languages.map((language) => valueFor(row, language))])].map((row) => row.map(tsvCell).join('\t')).join('\r\n')}\r\n`
}
export function serializeJson(rows: readonly ExportRow[], languages: readonly string[]) {
  return JSON.stringify(
    Object.fromEntries(
      rows.map((row) => [
        row.key,
        Object.fromEntries(languages.map((language) => [language, valueFor(row, language)])),
      ]),
    ),
    null,
    2,
  )
}
export function serializeXml(rows: readonly ExportRow[], languages: readonly string[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<translations>\n${rows.map((row) => `  <entry key="${xmlEscape(row.key)}">\n${languages.map((language) => `    <translation language="${xmlEscape(language)}">${xmlEscape(valueFor(row, language))}</translation>`).join('\n')}\n  </entry>`).join('\n')}\n</translations>\n`
}
export function spreadsheetRows(rows: readonly ExportRow[], languages: readonly string[]) {
  return [
    ['key', ...languages],
    ...rows.map((row) => [
      sanitizeFormula(row.key),
      ...languages.map((language) => sanitizeFormula(valueFor(row, language))),
    ]),
  ]
}
export function exportFilename(version: string, scope: ExportScope, format: ExportFormat) {
  return `verdigloss-${version.trim()}-${scope}.${format}`
}
