import { documentToBlocks } from './blocks'
import { saveBlob, safeFileName } from './save'

// ── Word (.docx) via the `docx` library ────────────────────────────────────────
export async function downloadDocumentWord(doc, sections, artefact) {
  const docx = await import('docx')
  const {
    Document,
    Packer,
    Paragraph,
    HeadingLevel,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
  } = docx

  const blocks = documentToBlocks(doc, sections)
  const HEADINGS = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
  }

  const cell = (text, opts = {}) =>
    new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: String(text ?? ''), ...opts })] })],
    })

  const children = []
  for (const block of blocks) {
    switch (block.type) {
      case 'heading':
        children.push(new Paragraph({ text: block.text, heading: HEADINGS[block.level] }))
        break
      case 'paragraph':
        children.push(new Paragraph({ text: block.text }))
        break
      case 'bullets':
        for (const item of block.items)
          children.push(new Paragraph({ text: item, bullet: { level: 0 } }))
        break
      case 'keyvalue':
        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: block.rows.map(
              ([k, v]) => new TableRow({ children: [cell(k, { bold: true }), cell(v)] })
            ),
          })
        )
        children.push(new Paragraph({ text: '' }))
        break
      case 'table':
        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: block.columns.map((c) => cell(c, { bold: true })) }),
              ...block.rows.map((row) => new TableRow({ children: row.map((v) => cell(v)) })),
            ],
          })
        )
        children.push(new Paragraph({ text: '' }))
        break
      default:
        break
    }
  }

  const file = new Document({ sections: [{ children }] })
  const blob = await Packer.toBlob(file)
  saveBlob(blob, `${safeFileName(artefact?.id, doc?.id ?? doc?.title)}.docx`)
}

// ── PDF via jsPDF (manual text layout — no html2canvas dependency) ──────────────
export async function downloadDocumentPdf(doc, sections, artefact) {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })

  const margin = 48
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const contentW = pageW - margin * 2
  let y = margin

  const ensureSpace = (h) => {
    if (y + h > pageH - margin) {
      pdf.addPage()
      y = margin
    }
  }

  const writeLines = (
    text,
    { size = 11, style = 'normal', gap = 4, indent = 0, color = 30 } = {}
  ) => {
    pdf.setFont('helvetica', style)
    pdf.setFontSize(size)
    pdf.setTextColor(color)
    const lines = pdf.splitTextToSize(String(text ?? ''), contentW - indent)
    const lineH = size * 1.35
    for (const line of lines) {
      ensureSpace(lineH)
      pdf.text(line, margin + indent, y)
      y += lineH
    }
    y += gap
  }

  const HEADING_SIZE = { 1: 20, 2: 15, 3: 12.5 }
  const blocks = documentToBlocks(doc, sections)

  for (const block of blocks) {
    switch (block.type) {
      case 'heading':
        y += block.level === 1 ? 0 : 6
        writeLines(block.text, {
          size: HEADING_SIZE[block.level],
          style: 'bold',
          gap: 6,
          color: 17,
        })
        break
      case 'paragraph':
        writeLines(block.text, { size: 11, gap: 8 })
        break
      case 'bullets':
        for (const item of block.items) writeLines(`•  ${item}`, { size: 11, gap: 2, indent: 8 })
        y += 6
        break
      case 'keyvalue':
        for (const [k, v] of block.rows) writeLines(`${k}: ${v}`, { size: 11, gap: 2 })
        y += 6
        break
      case 'table': {
        // Compact rendering: header line then a line per row, columns joined by
        // " | ". Keeps the PDF dependency-light without a table plugin.
        writeLines(block.columns.join('  |  '), { size: 10, style: 'bold', gap: 2 })
        for (const row of block.rows) writeLines(row.join('  |  '), { size: 10, gap: 2, color: 60 })
        y += 8
        break
      }
      default:
        break
    }
  }

  const blob = pdf.output('blob')
  saveBlob(blob, `${safeFileName(artefact?.id, doc?.id ?? doc?.title)}.pdf`)
}
