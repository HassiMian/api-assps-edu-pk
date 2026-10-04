import {
  AlignmentType,
  Paragraph,
  TextRun,
} from 'docx'
import {
  buildDocxTable,
  downloadDocxBlob,
  headingParagraph,
  htmlToDocxBlocks,
  packDocument,
  textParagraph,
} from './editor/docxCore'
import { getSavedPaperStats, getSavedPaperTypes } from './savedPaperUtils'

function resolveLanguage(paper = {}) {
  return paper.printPrefs?.language || paper.config?.language || 'english'
}

function questionEn(item = {}) {
  return String(item.en || item.text || '').trim()
}

function questionUr(item = {}) {
  return String(item.ur || item.textUrdu || '').trim()
}

function questionParagraphs(item = {}, language = 'english', prefix = '') {
  const en = questionEn(item)
  const ur = questionUr(item)
  const blocks = []
  const lead = prefix ? `${prefix}` : ''

  if (language === 'urdu') {
    blocks.push(textParagraph(`${lead}${ur || en}`, { rtl: Boolean(ur) }))
  } else if (language === 'dual') {
    if (en) blocks.push(textParagraph(`${lead}${en}`))
    if (ur) blocks.push(textParagraph(ur, { rtl: true }))
    if (!en && !ur) blocks.push(textParagraph(''))
  } else {
    blocks.push(textParagraph(`${lead}${en || ur}`))
  }

  const options = Array.isArray(item.options) ? item.options : []
  if (options.length) {
    options.forEach((opt, index) => {
      const label = opt.label || opt.key || String.fromCharCode(65 + index)
      const optEn = String(opt.text || opt.en || '').trim()
      const optUr = String(opt.textUrdu || opt.ur || '').trim()
      if (language === 'dual') {
        if (optEn) blocks.push(textParagraph(`${label}. ${optEn}`, { indent: { left: 360 } }))
        if (optUr) blocks.push(textParagraph(`${label}. ${optUr}`, { rtl: true, indent: { left: 360 } }))
      } else if (language === 'urdu') {
        blocks.push(textParagraph(`${label}. ${optUr || optEn}`, { rtl: Boolean(optUr), indent: { left: 360 } }))
      } else {
        blocks.push(textParagraph(`${label}. ${optEn || optUr}`, { indent: { left: 360 } }))
      }
    })
  }

  return blocks
}

function resolveMarkingNotes(item = {}) {
  return String(item.markingNotes || item.markingScheme || '').trim()
}

function splitSubpartMarks(totalMarks = 1, text = '') {
  const parts = String(text || '').match(/\([ivx]+\)/gi) || []
  if (parts.length <= 1) return [{ label: 'Full question', marks: Number(totalMarks || 1) }]
  const each = Math.max(1, Math.floor(Number(totalMarks || 1) / parts.length))
  const remainder = Number(totalMarks || 1) - (each * parts.length)
  return parts.map((part, index) => ({
    label: part,
    marks: each + (index === parts.length - 1 ? remainder : 0),
  }))
}

function resolveWrittenAnswer(item = {}) {
  const answer = String(item.answer || item.modelAnswer || item.solution || '').trim()
  return answer || '—'
}

function resolveMcqAnswer(item = {}) {
  const fromOption = item.options?.find(opt => opt.correct)
  if (fromOption) return fromOption.key || fromOption.label || ''
  if (item.answer) return String(item.answer).toUpperCase()
  return ''
}

function paperHeaderChildren(paper = {}, paperSettings = {}) {
  const preview = paper.manualPreviewSettings || {}
  const cfg = paper.config || {}
  const schoolName = preview.schoolName || paperSettings?.schoolName || 'AL SIDDIQUE SCHOLARS PUBLIC SCHOOL'
  const address = preview.address || paperSettings?.address || ''
  const stats = getSavedPaperStats(paper)
  const subject = cfg.subjectName || cfg.subject || paper.name || 'Assessment'
  const classLevel = cfg.classLevel || cfg.className || ''
  const metaParts = [
    cfg.paperCode ? `Code: ${cfg.paperCode}` : '',
    cfg.timeAllowed || cfg.time ? `Time: ${cfg.timeAllowed || cfg.time}` : '',
    stats.totalMarks ? `Marks: ${stats.totalMarks}` : '',
    cfg.examDate ? `Date: ${cfg.examDate}` : '',
  ].filter(Boolean).join(' · ')

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
    children: [new TextRun({ text: `${subject}${classLevel ? ` · Class ${classLevel}` : ''}`, bold: true, size: 24 })],
    spacing: { after: 60 },
  }))

  if (metaParts) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: metaParts, size: 20, color: '444444' })],
      spacing: { after: 200 },
    }))
  }

  return children
}

export async function buildPaperDocxBlob(paper = {}, paperSettings = {}) {
  const language = resolveLanguage(paper)
  const types = getSavedPaperTypes(paper)
  const children = [...paperHeaderChildren(paper, paperSettings)]

  for (const type of types) {
    const questions = paper[type.value] || []
    if (!questions.length) continue
    const marks = Number(paper[`${type.value}_marks`] || type.marks || 1)
    const displayNo = type.questionNo || ''
    const marksLabel = type.layout === 'block' || String(type.value || '').startsWith('nq_')
      ? `(${marks} mark${marks === 1 ? '' : 's'})`
      : `(${marks} × ${questions.length} = ${marks * questions.length})`
    const heading = displayNo
      ? `Q${displayNo}. ${type.label || type.labelUrdu || 'Question'}`
      : (type.label || type.labelUrdu || 'Section')

    children.push(new Paragraph({
      children: [
        new TextRun({ text: heading, bold: true, size: 24, color: '1a237e' }),
        new TextRun({ text: `   ${marksLabel}`, size: 20, color: '1a237e' }),
      ],
      spacing: { before: 160, after: 100 },
      border: { bottom: { color: '1a237e', size: 6, style: 'single' } },
    }))

    questions.forEach((item, index) => {
      const prefix = (type.layout === 'block' || String(type.value || '').startsWith('nq_')) ? '' : `${index + 1}. `
      children.push(...questionParagraphs(item, language, prefix))
    })
  }

  return packDocument(children)
}

export async function exportPaperAsRealDocx(paper = {}, paperSettings = {}, filename = '') {
  const cfg = paper.config || {}
  const name = filename || `${cfg.subjectName || cfg.subject || 'Paper'}_Class${cfg.classLevel || cfg.className || ''}`
  const blob = await buildPaperDocxBlob(paper, paperSettings)
  downloadDocxBlob(blob, name)
  return true
}

export async function exportAnswerKeyAsRealDocx(paper = {}, questionTypes = [], paperSettings = {}, cfg = {}) {
  const mergedCfg = { ...(paper.config || {}), ...cfg }
  const language = paper.printPrefs?.language || mergedCfg.language || 'english'
  const types = questionTypes?.length ? questionTypes : getSavedPaperTypes(paper)
  const preview = paper.manualPreviewSettings || {}
  const schoolName = preview.schoolName || paperSettings?.schoolName || 'AL SIDDIQUE SCHOLARS PUBLIC SCHOOL'
  const stats = getSavedPaperStats(paper)

  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'ANSWER KEY — TEACHER COPY', bold: true, size: 28, color: '7A2038' })],
      spacing: { after: 100 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: String(schoolName).toUpperCase(), bold: true, size: 24, color: '7A2038' })],
      spacing: { after: 80 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        text: `${mergedCfg.subjectName || mergedCfg.subject || paper.name || 'Assessment'}${mergedCfg.classLevel || mergedCfg.className ? ` · Class ${mergedCfg.classLevel || mergedCfg.className}` : ''}${mergedCfg.paperCode ? ` · Code ${mergedCfg.paperCode}` : ''}`,
        size: 20,
      })],
      spacing: { after: 60 },
    }),
    textParagraph(`Total Marks: ${stats.totalMarks || ''}`, { center: true, after: 200 }),
  ]

  for (const type of types) {
    const questions = paper[type.value] || []
    if (!questions.length) continue
    const marks = Number(paper[`${type.value}_marks`] || type.marks || 1)
    const heading = type.questionNo
      ? `Q${type.questionNo}. ${type.label || type.labelUrdu || 'Question'}`
      : (type.label || type.labelUrdu || 'Section')
    const isMcq = type.value === 'mcq' || String(type.label || '').toLowerCase().includes('mcq')

    children.push(headingParagraph(`${heading} (${marks} mark${marks === 1 ? '' : 's'})`, undefined, { color: '1a237e', border: '1a237e' }))

    questions.forEach((item, index) => {
      children.push(...questionParagraphs(item, language, isMcq ? `${index + 1}. ` : ((type.layout === 'block' || String(type.value || '').startsWith('nq_')) ? '' : `${index + 1}. `)))
      const answer = isMcq ? resolveMcqAnswer(item) : resolveWrittenAnswer(item)
      const label = isMcq ? 'Answer' : 'Model Answer'
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `${label}: `, bold: true, size: 20, color: '0f5132' }),
          new TextRun({ text: isMcq && answer ? `(${answer})` : answer, size: 20, color: '0f5132' }),
        ],
        spacing: { after: 120 },
        indent: { left: 240 },
      }))
    })
  }

  const blob = await packDocument(children)
  const name = `${mergedCfg.subjectName || mergedCfg.subject || 'Paper'}_AnswerKey`
  downloadDocxBlob(blob, name)
  return true
}

export async function exportMarkingSchemeAsRealDocx(paper = {}, questionTypes = [], paperSettings = {}, cfg = {}) {
  const mergedCfg = { ...(paper.config || {}), ...cfg }
  const preview = paper.manualPreviewSettings || {}
  const schoolName = preview.schoolName || paperSettings?.schoolName || 'AL SIDDIQUE SCHOLARS PUBLIC SCHOOL'
  const stats = getSavedPaperStats(paper)
  const types = questionTypes?.length ? questionTypes : getSavedPaperTypes(paper)
  const language = paper.printPrefs?.language || mergedCfg.language || 'english'

  const rows = types.flatMap(type => {
    const questions = paper[type.value] || []
    const sectionMarks = Number(paper[`${type.value}_marks`] || type.marks || 1)
    return questions.map((item, index) => {
      const prompt = type.questionNo
        ? `Q${type.questionNo}. ${type.label || 'Question'}`
        : `${type.label || 'Section'} ${index + 1}`
      const text = [questionEn(item), questionUr(item)].filter(Boolean).join('\n')
      const notes = resolveMarkingNotes(item)
      const distribution = splitSubpartMarks(sectionMarks, text)
      const distText = distribution.map(part => `${part.label}: ${part.marks} mark(s)`).join(' · ')
      return [prompt, String(sectionMarks), distText, notes || 'Award marks for accurate, complete responses aligned with the question prompt.']
    })
  })

  const children = [
    headingParagraph('MARKING SCHEME', undefined, { color: '0E5C75' }),
    textParagraph(String(schoolName).toUpperCase(), { run: { bold: true } }),
    textParagraph(`${mergedCfg.subjectName || mergedCfg.subject || paper.name || 'Assessment'}${mergedCfg.classLevel || mergedCfg.className ? ` · Class ${mergedCfg.classLevel || mergedCfg.className}` : ''}${mergedCfg.paperCode ? ` · Code ${mergedCfg.paperCode}` : ''}`),
    buildDocxTable(['Question', 'Marks', 'Distribution', 'Marking Notes'], rows),
    textParagraph(`Total Marks: ${stats.totalMarks || mergedCfg.totalMarks || ''}`, { bold: true, before: 200 }),
  ]

  const blob = await packDocument(children)
  const name = `${mergedCfg.subjectName || mergedCfg.subject || 'Paper'}_MarkingScheme`
  downloadDocxBlob(blob, name)
  return true
}

export async function exportCanvasAsRealDocx(canvas, filename = 'paper') {
  if (!canvas) return false
  const blocks = await htmlToDocxBlocks(canvas.innerHTML)
  const blob = await packDocument(blocks)
  downloadDocxBlob(blob, filename)
  return true
}
