import {
  AlignmentType,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  UnderlineType,
  WidthType,
} from 'docx'

export function downloadDocxBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.docx') ? filename : `${filename}.docx`
  link.click()
  URL.revokeObjectURL(url)
}

function parseHtml(html = '') {
  const div = document.createElement('div')
  div.innerHTML = html || '<p></p>'
  return div
}

export function inlineRuns(node, style = {}) {
  const runs = []
  node.childNodes.forEach(child => {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent || ''
      if (text) runs.push(new TextRun({ text, ...style }))
      return
    }
    if (child.nodeName === 'BR') {
      runs.push(new TextRun({ text: '', break: 1 }))
      return
    }
    const tag = child.nodeName
    const nextStyle = { ...style }
    if (tag === 'STRONG' || tag === 'B') nextStyle.bold = true
    if (tag === 'EM' || tag === 'I') nextStyle.italics = true
    if (tag === 'U') nextStyle.underline = { type: UnderlineType.SINGLE }
    runs.push(...inlineRuns(child, nextStyle))
  })
  return runs.length ? runs : [new TextRun({ text: '', ...style })]
}

export function paragraphFromElement(el, opts = {}) {
  const align = el.style?.textAlign || ''
  const alignment = align === 'center'
    ? AlignmentType.CENTER
    : align === 'right'
      ? AlignmentType.RIGHT
      : opts.rtl
        ? AlignmentType.RIGHT
        : AlignmentType.LEFT
  const runs = inlineRuns(el)
  return new Paragraph({
    alignment,
    bidirectional: !!opts.rtl,
    children: runs,
    spacing: { after: 120 },
  })
}

export function textParagraph(text = '', opts = {}) {
  const value = String(text || '').trim()
  if (!value) return new Paragraph({ children: [new TextRun('')], spacing: { after: 80 } })
  return new Paragraph({
    alignment: opts.center ? AlignmentType.CENTER : (opts.rtl ? AlignmentType.RIGHT : AlignmentType.LEFT),
    bidirectional: !!opts.rtl,
    children: [new TextRun({ text: value, size: opts.size || 22, bold: opts.bold, color: opts.color, ...opts.run })],
    spacing: { before: opts.before ?? 0, after: opts.after ?? 100 },
    indent: opts.indent,
  })
}

export function headingParagraph(text, level = HeadingLevel.HEADING_2, opts = {}) {
  return new Paragraph({
    heading: level,
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
    children: [new TextRun({ text, bold: true, size: opts.size || 24, color: opts.color || '1a237e' })],
    spacing: { before: opts.before ?? 160, after: opts.after ?? 80 },
    border: opts.border ? { bottom: { color: opts.border, size: 6, style: 'single' } } : undefined,
  })
}

async function imageParagraph(imgEl) {
  const src = imgEl.getAttribute('src') || ''
  if (!src) return null
  try {
    let data
    let type = 'png'
    if (src.startsWith('data:image/')) {
      const match = src.match(/^data:image\/(\w+);base64,(.+)$/)
      if (!match) return null
      type = match[1] === 'jpeg' ? 'jpg' : match[1]
      const binary = atob(match[2])
      data = Uint8Array.from(binary, c => c.charCodeAt(0))
    } else {
      const res = await fetch(src)
      const buf = await res.arrayBuffer()
      data = new Uint8Array(buf)
      if (src.includes('.jpg') || src.includes('.jpeg')) type = 'jpg'
    }
    const width = Number(imgEl.getAttribute('width')) || 280
    const height = Number(imgEl.getAttribute('height')) || Math.round(width * 0.65)
    return new Paragraph({
      children: [new ImageRun({ type, data, transformation: { width, height } })],
      spacing: { after: 120 },
    })
  } catch {
    return new Paragraph({ children: [new TextRun({ text: '[Image]', italics: true })] })
  }
}

function tableFromElement(tableEl) {
  const rows = Array.from(tableEl.querySelectorAll('tr')).map(tr => {
    const cells = Array.from(tr.children).filter(el => el.tagName === 'TD' || el.tagName === 'TH')
    return new TableRow({
      children: cells.map(cell => new TableCell({
        children: [paragraphFromElement(cell)],
        width: { size: Math.floor(100 / Math.max(cells.length, 1)), type: WidthType.PERCENTAGE },
      })),
    })
  })
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
  })
}

export async function htmlToDocxBlocks(html, opts = {}) {
  const root = parseHtml(html)
  const blocks = []
  for (const node of root.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent || '').trim()
      if (text) blocks.push(textParagraph(text, opts))
      continue
    }
    const tag = node.nodeName
    if (tag === 'P') {
      blocks.push(paragraphFromElement(node, opts))
      continue
    }
    if (tag === 'H2') {
      blocks.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: inlineRuns(node), spacing: { after: 120 } }))
      continue
    }
    if (tag === 'H3') {
      blocks.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: inlineRuns(node), spacing: { after: 120 } }))
      continue
    }
    if (tag === 'UL' || tag === 'OL') {
      Array.from(node.querySelectorAll(':scope > li')).forEach((li, index) => {
        const bullet = tag === 'OL' ? `${index + 1}. ` : '• '
        blocks.push(new Paragraph({
          children: [new TextRun(bullet), ...inlineRuns(li)],
          spacing: { after: 80 },
          indent: { left: 360 },
        }))
      })
      continue
    }
    if (tag === 'TABLE') {
      blocks.push(tableFromElement(node))
      blocks.push(new Paragraph({ children: [new TextRun('')], spacing: { after: 120 } }))
      continue
    }
    if (tag === 'IMG') {
      const imgPara = await imageParagraph(node)
      if (imgPara) blocks.push(imgPara)
      continue
    }
    if (tag === 'DIV' || tag === 'SECTION' || tag === 'ARTICLE') {
      const inner = await htmlToDocxBlocks(node.innerHTML, opts)
      blocks.push(...inner)
    }
  }
  return blocks.length ? blocks : [new Paragraph({ children: [new TextRun('')] })]
}

export function buildDocxTable(headers, rows) {
  const headerRow = new TableRow({
    children: headers.map(label => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20, color: '0E5C75' })] })],
      width: { size: Math.floor(100 / headers.length), type: WidthType.PERCENTAGE },
    })),
  })
  const bodyRows = rows.map(cells => new TableRow({
    children: cells.map(text => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: String(text || ''), size: 20 })] })],
      width: { size: Math.floor(100 / headers.length), type: WidthType.PERCENTAGE },
    })),
  }))
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...bodyRows],
  })
}

export async function packDocument(children) {
  const document = new Document({ sections: [{ properties: {}, children }] })
  return Packer.toBlob(document)
}

export async function exportHtmlAsRealDocx(html, filename = 'document') {
  const blocks = await htmlToDocxBlocks(html)
  const blob = await packDocument(blocks)
  downloadDocxBlob(blob, filename)
  return true
}
