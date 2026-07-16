import type { ComputedRef } from 'vue'
import { downloadBlob } from '@/services/browser-download'
import { exportFilename, serializeCsv, serializeJson, serializeTsv, serializeXml, spreadsheetRows, type ExportFormat, type ExportRow, type ExportScope } from '@/services/exports'

export interface TableRow extends Record<string, string> { key: string }
const mimeTypes: Record<Exclude<ExportFormat, 'xlsx'>, string> = { tsv: 'text/tab-separated-values;charset=utf-8', csv: 'text/csv;charset=utf-8', json: 'application/json;charset=utf-8', xml: 'application/xml;charset=utf-8' }

export function useDownload(
  languages: ComputedRef<string[]>,
  pageRows: ComputedRef<TableRow[]>,
  filteredRows: ComputedRef<TableRow[]>,
  minecraftVersion = '',
) {
  const rowsFor = (scope: ExportScope): ExportRow[] => (scope === 'page' ? pageRows.value : filteredRows.value).map((row) => ({ key: row.key, values: row }))
  const run = async (format: ExportFormat, scope: ExportScope) => {
    const rows = rowsFor(scope)
    const filename = exportFilename(minecraftVersion, scope, format)
    if (format === 'xlsx') {
      const xlsx = await import('xlsx')
      const worksheet = xlsx.utils.aoa_to_sheet(spreadsheetRows(rows, languages.value))
      const workbook = xlsx.utils.book_new()
      xlsx.utils.book_append_sheet(workbook, worksheet, 'translations')
      return downloadBlob(new Blob([xlsx.write(workbook, { type: 'array', bookType: 'xlsx' })], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename)
    }
    const content = format === 'csv' ? serializeCsv(rows, languages.value) : format === 'tsv' ? serializeTsv(rows, languages.value) : format === 'json' ? serializeJson(rows, languages.value) : serializeXml(rows, languages.value)
    return downloadBlob(new Blob([content], { type: mimeTypes[format] }), filename)
  }
  return {
    downloadTsv: () => run('tsv', 'page'), downloadCsv: () => run('csv', 'page'), downloadJson: () => run('json', 'page'), downloadXml: () => run('xml', 'page'), downloadXlsx: () => run('xlsx', 'page'),
    downloadAllTsv: () => run('tsv', 'filtered'), downloadAllCsv: () => run('csv', 'filtered'), downloadAllJson: () => run('json', 'filtered'), downloadAllXml: () => run('xml', 'filtered'), downloadAllXlsx: () => run('xlsx', 'filtered'),
  }
}
