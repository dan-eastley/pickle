import { catalogueTables } from './blocks'
import { saveBlob, safeFileName } from './save'

// RFC-4180 CSV escaping: quote when the cell contains a comma, quote, or newline.
const csvCell = (v) => {
  const s = String(v ?? '')
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

const tableToCsv = (table) =>
  [table.columns, ...table.rows].map((row) => row.map(csvCell).join(',')).join('\r\n')

// CSV is a single table format, so multiple catalogue arrays are stacked with a
// blank line and a section title between them.
export function downloadCatalogueCsv(data, artefact) {
  const tables = catalogueTables(data)
  const sections = tables.map((t) =>
    tables.length > 1 ? `${t.name}\r\n${tableToCsv(t)}` : tableToCsv(t)
  )
  const csv = sections.join('\r\n\r\n')
  // Prepend a BOM so Excel opens UTF-8 cleanly.
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' })
  saveBlob(blob, `${safeFileName(artefact?.id, artefact?.name)}.csv`)
}

// Real .xlsx via ExcelJS (lazy-loaded — keeps it out of the initial bundle).
// One worksheet per catalogue array, with a styled header row.
export async function downloadCatalogueExcel(data, artefact) {
  const ExcelJS = (await import('exceljs')).default
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Pickle'
  wb.created = new Date()

  const tables = catalogueTables(data)
  if (tables.length === 0) tables.push({ name: 'Sheet1', columns: ['(empty)'], rows: [] })

  for (const table of tables) {
    // Worksheet names are capped at 31 chars and can't contain []*?/\:
    const sheetName = table.name.replace(/[[\]*?/\\:]/g, ' ').slice(0, 31) || 'Sheet'
    const ws = wb.addWorksheet(sheetName)
    ws.columns = table.columns.map((c) => ({
      header: c,
      key: c,
      width: Math.min(Math.max(c.length + 4, 14), 60),
    }))
    table.rows.forEach((row) => ws.addRow(row))
    ws.getRow(1).font = { bold: true }
    ws.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF1F5F9' },
    }
    ws.views = [{ state: 'frozen', ySplit: 1 }]
  }

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  saveBlob(blob, `${safeFileName(artefact?.id, artefact?.name)}.xlsx`)
}
