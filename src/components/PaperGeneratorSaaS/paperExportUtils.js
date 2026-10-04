import {
  buildSavedPaperDocumentHtml,
  getSavedPaperStats,
  getSavedPaperTypes,
} from './savedPaperUtils'
import {
  exportAnswerKeyAsRealDocx,
  exportCanvasAsRealDocx,
  exportMarkingSchemeAsRealDocx,
  exportPaperAsRealDocx,
  buildPaperDocxBlob,
} from './paperRealDocxExport'

function escapeHtml(value = '') {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function questionText(item = {}, language = 'english') {
  const en = item.en || item.text || ''
  const ur = item.ur || item.textUrdu || ''
  if (language === 'urdu') return ur || en
  if (language === 'dual' && en && ur) return `${en}\n${ur}`
  return en || ur
}

function resolveMcqAnswer(item = {}) {
  const fromOption = item.options?.find(opt => opt.correct)
  if (fromOption) return fromOption.key || fromOption.label || ''
  if (item.answer) return String(item.answer).toUpperCase()
  return ''
}

function resolveWrittenAnswer(item = {}) {
  const answer = String(item.answer || item.modelAnswer || item.solution || '').trim()
  return answer || '—'
}

export function downloadHtmlAsWord(html, filename = 'document.doc') {
  const safeName = filename.endsWith('.doc') ? filename : `${filename}.doc`
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = safeName
  link.click()
  URL.revokeObjectURL(url)
}

function buildAnswerKeyBody(paper = {}, questionTypes = [], language = 'english') {
  const types = questionTypes?.length ? questionTypes : getSavedPaperTypes(paper)
  return types.map(type => {
    const questions = paper[type.value] || []
    if (!questions.length) return ''
    const marks = Number(paper[`${type.value}_marks`] || type.marks || 1)
    const heading = type.questionNo
      ? `Q${type.questionNo}. ${type.label || type.labelUrdu || 'Question'}`
      : (type.label || type.labelUrdu || 'Section')
    const isMcq = type.value === 'mcq' || String(type.label || '').toLowerCase().includes('mcq')

    const rows = questions.map((item, index) => {
      if (isMcq) {
        const correct = resolveMcqAnswer(item)
        const prompt = questionText(item, language)
        return `
          <div class="answer-row">
            <div class="answer-q">${index + 1}. ${escapeHtml(prompt).replace(/\n/g, '<br/>')}</div>
            <div class="answer-a"><strong>Answer:</strong> ${correct ? `(${escapeHtml(correct)})` : '—'}</div>
          </div>
        `
      }
      const prompt = questionText(item, language)
      const answer = resolveWrittenAnswer(item)
      const prefix = (type.layout === 'block' || String(type.value || '').startsWith('nq_')) ? '' : `${index + 1}. `
      return `
        <div class="answer-row">
          ${prompt ? `<div class="answer-q">${prefix}${escapeHtml(prompt).replace(/\n/g, '<br/>')}</div>` : ''}
          <div class="answer-a"><strong>Model Answer:</strong> ${escapeHtml(answer).replace(/\n/g, '<br/>')}</div>
        </div>
      `
    }).join('')

    return `
      <section class="answer-section">
        <div class="answer-section-head">
          <strong>${escapeHtml(heading)}</strong>
          <span>(${marks} mark${marks === 1 ? '' : 's'})</span>
        </div>
        ${rows}
      </section>
    `
  }).join('')
}

export function buildAnswerKeyDocumentHtml(paper = {}, questionTypes = [], paperSettings = {}, cfg = {}) {
  const mergedCfg = { ...(paper.config || {}), ...cfg }
  const preview = paper.manualPreviewSettings || {}
  const schoolName = preview.schoolName || paperSettings?.schoolName || 'AL SIDDIQUE SCHOLARS PUBLIC SCHOOL'
  const language = paper.printPrefs?.language || mergedCfg.language || 'english'
  const stats = getSavedPaperStats(paper)
  const body = buildAnswerKeyBody(paper, questionTypes, language)

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Answer Key</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111; margin: 24px; }
    .banner { text-align: center; border: 2px solid #7A2038; padding: 14px; margin-bottom: 18px; }
    .banner h1 { margin: 0 0 6px; font-size: 20px; color: #7A2038; letter-spacing: 0.06em; }
    .banner p { margin: 4px 0; font-size: 12px; color: #444; }
    .answer-section { margin-bottom: 18px; page-break-inside: avoid; }
    .answer-section-head { display: flex; justify-content: space-between; border-bottom: 1.5px solid #1a237e; padding-bottom: 6px; margin-bottom: 10px; font-size: 12px; color: #1a237e; }
    .answer-row { margin-bottom: 10px; }
    .answer-q { font-size: 12px; line-height: 1.6; margin-bottom: 4px; white-space: pre-line; }
    .answer-a { font-size: 12px; line-height: 1.55; color: #0f5132; padding-left: 10px; border-left: 3px solid #30D158; }
  </style>
</head>
<body>
  <div class="banner">
    <h1>ANSWER KEY — TEACHER COPY</h1>
    <p><strong>${escapeHtml(String(schoolName).toUpperCase())}</strong></p>
    <p>${escapeHtml(mergedCfg.subjectName || mergedCfg.subject || paper.name || 'Assessment')}${mergedCfg.classLevel || mergedCfg.className ? ` · Class ${escapeHtml(mergedCfg.classLevel || mergedCfg.className)}` : ''}${mergedCfg.paperCode ? ` · Code ${escapeHtml(mergedCfg.paperCode)}` : ''}${mergedCfg.setLabel ? ` · ${escapeHtml(mergedCfg.setLabel)}` : ''}</p>
    <p>Total Marks: ${escapeHtml(String(stats.totalMarks || ''))}</p>
  </div>
  ${body}
</body>
</html>`
}

export function printAnswerKeyDocument(paper = {}, questionTypes = [], paperSettings = {}, cfg = {}) {
  const html = buildAnswerKeyDocumentHtml(paper, questionTypes, paperSettings, cfg)
  const old = document.getElementById('__answer_key_frame')
  if (old) old.remove()
  const iframe = document.createElement('iframe')
  iframe.id = '__answer_key_frame'
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden'
  document.body.appendChild(iframe)
  const doc = iframe.contentWindow.document
  doc.open()
  doc.write(html)
  doc.close()
  setTimeout(() => {
    try {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
    } catch (error) {
      console.error('Answer key print failed:', error)
    }
    setTimeout(() => {
      if (document.body.contains(iframe)) iframe.remove()
    }, 4000)
  }, 700)
}

export async function exportPaperAsDocx(paper = {}, paperSettings = {}, filename = '') {
  const cfg = paper.config || {}
  const name = filename || `${cfg.subjectName || cfg.subject || 'Paper'}_Class${cfg.classLevel || cfg.className || ''}`
  try {
    await exportPaperAsRealDocx(paper, paperSettings, name)
    return true
  } catch (error) {
    console.warn('Real DOCX export failed, using HTML fallback:', error)
    const html = buildSavedPaperDocumentHtml(paper, paperSettings)
    downloadHtmlAsWord(html, `${name}.doc`)
    return false
  }
}

export async function exportAnswerKeyAsDocx(paper = {}, questionTypes = [], paperSettings = {}, cfg = {}) {
  const mergedCfg = { ...(paper.config || {}), ...cfg }
  const name = `${mergedCfg.subjectName || mergedCfg.subject || 'Paper'}_AnswerKey`
  try {
    await exportAnswerKeyAsRealDocx(paper, questionTypes, paperSettings, cfg)
    return true
  } catch (error) {
    console.warn('Real answer key DOCX failed, using HTML fallback:', error)
    const html = buildAnswerKeyDocumentHtml(paper, questionTypes, paperSettings, cfg)
    downloadHtmlAsWord(html, `${name}.doc`)
    return false
  }
}

export async function exportCanvasAsDocx(canvas, filename = 'paper') {
  if (!canvas) return false
  try {
    await exportCanvasAsRealDocx(canvas, filename)
    return true
  } catch (error) {
    console.warn('Real canvas DOCX failed, using HTML fallback:', error)
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${escapeHtml(filename)}</title></head><body>${canvas.innerHTML}</body></html>`
    downloadHtmlAsWord(html, `${filename}.doc`)
    return false
  }
}

function shuffleArray(items = []) {
  const list = [...items]
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[list[i], list[j]] = [list[j], list[i]]
  }
  return list
}

function randomPaperCode() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

function shuffleMcqOptions(questions = []) {
  return questions.map(question => {
    if (!Array.isArray(question.options) || question.options.length < 2) return question
    return { ...question, options: shuffleArray(question.options) }
  })
}

function shuffleSectionQuestions(questions = [], shuffleOptions = false) {
  const ordered = shuffleArray(questions)
  return shuffleOptions ? shuffleMcqOptions(ordered) : ordered
}

function shufflePaperSections(paper = {}) {
  const next = { ...paper }
  if (Array.isArray(next.mcq)) next.mcq = shuffleSectionQuestions(next.mcq, true)
  if (Array.isArray(next.short)) next.short = shuffleSectionQuestions(next.short)
  if (Array.isArray(next.long)) next.long = shuffleSectionQuestions(next.long)

  Object.keys(next).forEach(key => {
    if (!String(key).startsWith('nq_') || !Array.isArray(next[key])) return
    next[key] = shuffleSectionQuestions(next[key])
  })

  if (next.selectedQuestions && typeof next.selectedQuestions === 'object') {
    const selected = { ...next.selectedQuestions }
    Object.keys(selected).forEach(type => {
      const payload = selected[type]
      const questions = Array.isArray(payload) ? payload : payload?.questions
      if (!Array.isArray(questions)) return
      const shuffled = type === 'mcq'
        ? shuffleSectionQuestions(questions, true)
        : shuffleSectionQuestions(questions)
      selected[type] = Array.isArray(payload)
        ? shuffled
        : { ...payload, questions: shuffled }
    })
    next.selectedQuestions = selected
  }

  return next
}

function clonePaperSet(basePaper = {}, label = 'Set A', index = 0) {
  const next = JSON.parse(JSON.stringify(basePaper))
  const code = randomPaperCode()
  next.config = {
    ...(next.config || {}),
    paperCode: code,
    setLabel: label,
    setIndex: index,
  }
  next.name = `${next.name || next.config?.subject || 'Paper'} — ${label}`
  next.id = `paper_set_${Date.now()}_${index}`

  const shuffled = shufflePaperSections(next)
  Object.assign(next, shuffled)
  return next
}

export function describePaperSetStrategy() {
  return 'Each set gets a unique paper code, shuffled MCQ options, and shuffled short/long question order.'
}

export function generatePaperSets(basePaper = {}, count = 3) {
  const labels = ['Set A', 'Set B', 'Set C', 'Set D', 'Set E']
  const total = Math.max(1, Math.min(Number(count) || 1, labels.length))
  return Array.from({ length: total }, (_, index) => clonePaperSet(basePaper, labels[index], index))
}

export function buildPaperSetsBulkPrintHtml(paperSets = [], paperSettings = {}) {
  const pages = paperSets.map(paper => buildSavedPaperDocumentHtml(paper, paperSettings)).join('')
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    body { margin: 0; font-family: Arial, sans-serif; }
    .saved-paper-page { page-break-after: always; }
    .saved-paper-page:last-child { page-break-after: auto; }
  </style>
</head>
<body>${pages}</body>
</html>`
}

export function printPaperSets(paperSets = [], paperSettings = {}) {
  if (!paperSets.length) return false
  const old = document.getElementById('__paper_sets_frame')
  if (old) old.remove()
  const iframe = document.createElement('iframe')
  iframe.id = '__paper_sets_frame'
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden'
  document.body.appendChild(iframe)
  const doc = iframe.contentWindow.document
  doc.open()
  doc.write(buildPaperSetsBulkPrintHtml(paperSets, paperSettings))
  doc.close()
  setTimeout(() => {
    try {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
    } catch (error) {
      console.error('Paper sets print failed:', error)
    }
    setTimeout(() => {
      if (document.body.contains(iframe)) iframe.remove()
    }, 4000)
  }, 900)
  return true
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

export function buildMarkingSchemeDocumentHtml(paper = {}, questionTypes = [], paperSettings = {}, cfg = {}) {
  const mergedCfg = { ...(paper.config || {}), ...cfg }
  const preview = paper.manualPreviewSettings || {}
  const schoolName = preview.schoolName || paperSettings?.schoolName || 'AL SIDDIQUE SCHOLARS PUBLIC SCHOOL'
  const stats = getSavedPaperStats(paper)
  const types = questionTypes?.length ? questionTypes : getSavedPaperTypes(paper)

  const rows = types.flatMap(type => {
    const questions = paper[type.value] || []
    const sectionMarks = Number(paper[`${type.value}_marks`] || type.marks || 1)
    return questions.map((item, index) => {
      const prompt = type.questionNo
        ? `Q${type.questionNo}. ${type.label || 'Question'}`
        : `${type.label || 'Section'} ${index + 1}`
      const text = questionText(item, mergedCfg.language || 'english')
      const notes = resolveMarkingNotes(item)
      const distribution = splitSubpartMarks(sectionMarks, text)
      const distText = distribution.map(part => `${part.label}: ${part.marks} mark(s)`).join(' · ')
      return `
        <tr>
          <td>${escapeHtml(prompt)}</td>
          <td style="text-align:center">${sectionMarks}</td>
          <td>${escapeHtml(distText)}</td>
          <td>${escapeHtml(notes || 'Award marks for accurate, complete responses aligned with the question prompt.')}</td>
        </tr>
      `
    })
  }).join('')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Marking Scheme</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111; margin: 24px; }
    h1 { margin: 0 0 8px; font-size: 20px; color: #0E5C75; }
    .meta { font-size: 12px; color: #555; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px; vertical-align: top; }
    th { background: #f1f5f9; text-align: left; color: #0E5C75; }
    .total { margin-top: 12px; font-weight: 700; }
  </style>
</head>
<body>
  <h1>MARKING SCHEME</h1>
  <div class="meta">
    <div><strong>${escapeHtml(String(schoolName).toUpperCase())}</strong></div>
    <div>${escapeHtml(mergedCfg.subjectName || mergedCfg.subject || paper.name || 'Assessment')}${mergedCfg.classLevel || mergedCfg.className ? ` · Class ${escapeHtml(mergedCfg.classLevel || mergedCfg.className)}` : ''}${mergedCfg.paperCode ? ` · Code ${escapeHtml(mergedCfg.paperCode)}` : ''}</div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width:24%">Question</th>
        <th style="width:10%">Marks</th>
        <th style="width:24%">Distribution</th>
        <th>Marking Notes</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="total">Total Marks: ${escapeHtml(String(stats.totalMarks || mergedCfg.totalMarks || ''))}</div>
</body>
</html>`
}

function openPrintHtmlDocument(html, frameId = '__export_print_frame') {
  const old = document.getElementById(frameId)
  if (old) old.remove()
  const iframe = document.createElement('iframe')
  iframe.id = frameId
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden'
  document.body.appendChild(iframe)
  const doc = iframe.contentWindow.document
  doc.open()
  doc.write(html)
  doc.close()
  setTimeout(() => {
    try {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
    } catch (error) {
      console.error('Print export failed:', error)
    }
    setTimeout(() => {
      if (document.body.contains(iframe)) iframe.remove()
    }, 4000)
  }, 700)
}

export function printMarkingSchemeDocument(paper = {}, questionTypes = [], paperSettings = {}, cfg = {}) {
  openPrintHtmlDocument(buildMarkingSchemeDocumentHtml(paper, questionTypes, paperSettings, cfg), '__marking_scheme_frame')
}

export async function exportMarkingSchemeAsDocx(paper = {}, questionTypes = [], paperSettings = {}, cfg = {}) {
  const mergedCfg = { ...(paper.config || {}), ...cfg }
  const name = `${mergedCfg.subjectName || mergedCfg.subject || 'Paper'}_MarkingScheme`
  try {
    await exportMarkingSchemeAsRealDocx(paper, questionTypes, paperSettings, cfg)
    return true
  } catch (error) {
    console.warn('Real marking scheme DOCX failed, using HTML fallback:', error)
    downloadHtmlAsWord(buildMarkingSchemeDocumentHtml(paper, questionTypes, paperSettings, cfg), `${name}.doc`)
    return false
  }
}

export function sharePaperAsPdf(paper = {}, paperSettings = {}) {
  const html = `${buildSavedPaperDocumentHtml(paper, paperSettings)}
  <script>window.addEventListener('load',function(){setTimeout(function(){window.print()},400)});</script>`
  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) return false
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Save as PDF</title>
    <style>@page{size:A4;margin:10mm}body{margin:0;font-family:Arial,sans-serif}</style></head><body>
    <div style="position:sticky;top:0;background:#111827;color:#fff;padding:10px 14px;font-size:13px;z-index:9">
      Choose <strong>Save as PDF</strong> in the print dialog.
    </div>${html}</body></html>`)
  win.document.close()
  return true
}

export function buildShareMessage(paper = {}, paperSettings = {}) {
  const cfg = paper.config || {}
  const school = paper.manualPreviewSettings?.schoolName || paperSettings?.schoolName || 'School'
  const stats = getSavedPaperStats(paper)
  return [
    `📄 ${cfg.subjectName || cfg.subject || paper.name || 'Assessment Paper'}`,
    cfg.classLevel || cfg.className ? `Class ${cfg.classLevel || cfg.className}` : '',
    cfg.paperCode ? `Paper Code: ${cfg.paperCode}` : '',
    stats.totalMarks ? `Total Marks: ${stats.totalMarks}` : '',
    cfg.timeAllowed || cfg.time ? `Time: ${cfg.timeAllowed || cfg.time}` : '',
    '',
    `Shared from ${school} · ASSPS Paper Generator`,
  ].filter(Boolean).join('\n')
}

export function sharePaperViaWhatsApp(paper = {}, paperSettings = {}) {
  const message = buildShareMessage(paper, paperSettings)
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  return true
}

export async function sharePaperPackage(paper = {}, paperSettings = {}, questionTypes = []) {
  const cfg = paper.config || {}
  const baseName = `${cfg.subjectName || cfg.subject || 'Paper'}_Class${cfg.classLevel || cfg.className || ''}`
  await exportPaperAsDocx(paper, paperSettings, baseName)
  await exportAnswerKeyAsDocx(paper, questionTypes, paperSettings, cfg)

  let paperFile
  try {
    const blob = await buildPaperDocxBlob(paper, paperSettings)
    paperFile = new File([blob], `${baseName}.docx`, { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  } catch {
    const paperHtml = buildSavedPaperDocumentHtml(paper, paperSettings)
    const paperBlob = new Blob(['\ufeff', paperHtml], { type: 'application/msword' })
    paperFile = new File([paperBlob], `${baseName}.doc`, { type: 'application/msword' })
  }

  if (navigator.share && navigator.canShare?.({ files: [paperFile] })) {
    try {
      await navigator.share({
        title: paper.name || baseName,
        text: buildShareMessage(paper, paperSettings),
        files: [paperFile],
      })
      return { mode: 'native' }
    } catch (error) {
      if (error?.name === 'AbortError') return { mode: 'cancelled' }
    }
  }

  sharePaperViaWhatsApp(paper, paperSettings)
  return { mode: 'whatsapp' }
}

export function mergeAiAnswersIntoReviewItems(reviewItems = [], answers = []) {
  const byId = Object.fromEntries(answers.map(item => [String(item.id), item]))
  const byNo = Object.fromEntries(answers.map(item => [String(item.questionNo), item]))
  return reviewItems.map(item => {
    const match = byId[String(item.id)] || byNo[String(item.targetQuestionNo)] || null
    if (!match) return item
    return {
      ...item,
      answer: match.answer || item.answer || '',
      markingNotes: match.markingNotes || item.markingNotes || '',
    }
  })
}

export function mergeAiAnswersIntoPaper(paper = {}, questionTypes = [], answers = []) {
  const byId = Object.fromEntries(answers.map(item => [String(item.id), item]))
  const byNo = Object.fromEntries(answers.map(item => [String(item.questionNo), item]))
  const next = { ...paper }
  questionTypes.forEach(type => {
    const bucket = Array.isArray(next[type.value]) ? [...next[type.value]] : []
    if (!bucket.length) return
    next[type.value] = bucket.map((item, index) => {
      const match = byId[String(item.id)]
        || byNo[String(type.questionNo)]
        || byNo[String(index + 1)]
        || null
      if (!match) return item
      return {
        ...item,
        answer: match.answer || item.answer || '',
        markingNotes: match.markingNotes || item.markingNotes || '',
      }
    })
  })
  return next
}
