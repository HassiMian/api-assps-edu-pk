import {
  AlignmentType,
  Paragraph,
  TextRun,
} from 'docx'
import {
  downloadDocxBlob,
  htmlToDocxBlocks,
  packDocument,
} from './docxCore'

function totalMarks(doc = {}) {
  return (doc.blocks || []).reduce((sum, b) => sum + Number(b.marks || 0), 0)
}

export async function exportProDocumentAsRealDocx(doc = {}, paperSettings = {}, loadedPaper = {}, filename = '') {
  const meta = doc.meta || {}
  const cfg = loadedPaper.config || {}
  const schoolName = meta.schoolName || paperSettings?.schoolName || 'AL SIDDIQUE SCHOLARS PUBLIC SCHOOL'
  const address = meta.address || paperSettings?.address || ''
  const subject = meta.subject || cfg.subjectName || cfg.subject || 'Assessment'
  const classLevel = meta.classLevel || cfg.classLevel || cfg.className || ''
  const isDual = meta.language === 'dual' || meta.language === 'mixed'
  const marks = totalMarks(doc)

  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: String(schoolName).toUpperCase(), bold: true, size: 32, color: '1a237e' })],
      spacing: { after: 80 },
    }),
  ]

  if (address) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: address, size: 20, color: '555555' })],
      spacing: { after: 80 },
    }))
  }

  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({ text: `${subject}${classLevel ? ` · Class ${classLevel}` : ''}`, bold: true, size: 22 }),
    ],
    spacing: { after: 60 },
  }))

  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: `Total Marks: ${marks}`, size: 20 })],
    spacing: { after: 200 },
  }))

  for (const block of doc.blocks || []) {
    children.push(new Paragraph({
      children: [
        new TextRun({ text: `Q${block.questionNo}. ${block.label || ''}`, bold: true, size: 24, color: '1a237e' }),
        new TextRun({ text: `   (${Number(block.marks || 0)} marks)`, size: 20, color: '1a237e' }),
      ],
      spacing: { before: 160, after: 80 },
      border: { bottom: { color: '1a237e', size: 6, style: 'single' } },
    }))

    const bodyBlocks = await htmlToDocxBlocks(block.contentHtml || '<p></p>')
    children.push(...bodyBlocks)

    if (isDual && block.contentUrduHtml) {
      const urduBlocks = await htmlToDocxBlocks(block.contentUrduHtml, { rtl: true })
      children.push(...urduBlocks)
    }
  }

  const blob = await packDocument(children)
  const name = filename || `${cfg.subject || subject || 'Paper'}_Class${classLevel || 'X'}_Pro`
  downloadDocxBlob(blob, name)
  return true
}
