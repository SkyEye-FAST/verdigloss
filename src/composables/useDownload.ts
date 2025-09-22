import type { ComputedRef } from 'vue'
import { utils as XLSXUtils, write as writeXLSX } from 'xlsx'

export interface TableRow extends Record<string, string> {
  key: string
}

export function useDownload(
  displayLanguages: ComputedRef<string[]>,
  displayData: ComputedRef<TableRow[]>,
  filteredTableData: ComputedRef<TableRow[]>,
) {
  const generateTsvContent = (data: TableRow[]): string => {
    const headers = ['key', ...displayLanguages.value]
    const rows = [headers.join('\t')]
    data.forEach((row) => {
      const rowData = [row.key, ...displayLanguages.value.map((lang) => row[lang] || '？')]
      rows.push(rowData.join('\t'))
    })
    return rows.join('\n')
  }

  const generateCsvContent = (data: TableRow[]): string => {
    const headers = ['key', ...displayLanguages.value]
    const rows = [headers.join(',')]
    data.forEach((row) => {
      const rowData = [
        `"${row.key.replace(/"/g, '""')}"`,
        ...displayLanguages.value.map((lang) => `"${(row[lang] || '？').replace(/"/g, '""')}"`),
      ]
      rows.push(rowData.join(','))
    })
    return rows.join('\n')
  }

  const generateJsonContent = (data: TableRow[]): string => {
    const result: Record<string, Record<string, string>> = {}
    data.forEach((row) => {
      const entry: Record<string, string> = {}
      displayLanguages.value.forEach((lang) => {
        entry[lang] = row[lang] || '\uff1f'
      })
      result[row.key] = entry
    })
    return JSON.stringify(result, null, 2)
  }

  const generateXmlContent = (data: TableRow[]): string => {
    const escape = (str: string) =>
      str.replace(
        /[<>&"']/g,
        (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c] || c,
      )
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<translations>'
    data.forEach((row) => {
      xml += `\n  <entry key="${escape(row.key)}">`
      displayLanguages.value.forEach((lang) => {
        xml += `\n    <${lang}>${escape(row[lang] || '？')}</${lang}>`
      })
      xml += '\n  </entry>'
    })
    xml += '\n</translations>'
    return xml
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadTsv = () => {
    const content = generateTsvContent(displayData.value)
    downloadFile(content, 'table.tsv', 'text/tab-separated-values;charset=utf-8')
  }

  const downloadCsv = () => {
    const content = generateCsvContent(displayData.value)
    downloadFile(content, 'table.csv', 'text/csv;charset=utf-8')
  }

  const downloadJson = () => {
    const content = generateJsonContent(displayData.value)
    downloadFile(content, 'table.json', 'application/json;charset=utf-8')
  }

  const downloadXml = () => {
    const content = generateXmlContent(displayData.value)
    downloadFile(content, 'table.xml', 'application/xml;charset=utf-8')
  }

  const downloadXlsx = () => {
    const headers = ['key', ...displayLanguages.value]
    const data = [headers]
    displayData.value.forEach((row) => {
      const rowData = [row.key, ...displayLanguages.value.map((lang) => row[lang] || '？')]
      data.push(rowData)
    })
    const ws = XLSXUtils.aoa_to_sheet(data)
    const wb = XLSXUtils.book_new()
    XLSXUtils.book_append_sheet(wb, ws, 'translations')
    const xlsxData = writeXLSX(wb, { type: 'array' })
    const blob = new Blob([xlsxData], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'table.xlsx'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadAllTsv = () => {
    const content = generateTsvContent(filteredTableData.value)
    downloadFile(content, 'table_all.tsv', 'text/tab-separated-values;charset=utf-8')
  }

  const downloadAllCsv = () => {
    const content = generateCsvContent(filteredTableData.value)
    downloadFile(content, 'table_all.csv', 'text/csv;charset=utf-8')
  }

  const downloadAllJson = () => {
    const content = generateJsonContent(filteredTableData.value)
    downloadFile(content, 'table_all.json', 'application/json;charset=utf-8')
  }

  const downloadAllXml = () => {
    const content = generateXmlContent(filteredTableData.value)
    downloadFile(content, 'table_all.xml', 'application/xml;charset=utf-8')
  }

  const downloadAllXlsx = () => {
    const headers = ['key', ...displayLanguages.value]
    const data = [headers]
    filteredTableData.value.forEach((row) => {
      const rowData = [row.key, ...displayLanguages.value.map((lang) => row[lang] || '？')]
      data.push(rowData)
    })
    const ws = XLSXUtils.aoa_to_sheet(data)
    const wb = XLSXUtils.book_new()
    XLSXUtils.book_append_sheet(wb, ws, 'translations')
    const xlsxData = writeXLSX(wb, { type: 'array' })
    const blob = new Blob([xlsxData], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'table_all.xlsx'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return {
    downloadTsv,
    downloadCsv,
    downloadJson,
    downloadXml,
    downloadXlsx,
    downloadAllTsv,
    downloadAllCsv,
    downloadAllJson,
    downloadAllXml,
    downloadAllXlsx,
  }
}
