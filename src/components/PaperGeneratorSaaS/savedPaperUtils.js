const TEMPLATE_THEME = {
  classic: '#1a237e',
  oxford: '#1B2A4A',
  cambridge: '#B87E5B',
  institutional: '#0E5C75',
  board: '#7A2038',
  'docx-assessment': '#111111',
}

function escapeHtml(value = '') {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function isUnifiedSavedPaper(paper = {}) {
  return paper.paperSource === 'unified-paper-generator'
    || paper.sourceTab === 'unified'
    || paper.structureMode === 'numbered_assessment'
    || Boolean(paper.numberedQuestionTypes?.length)
}

export function getSavedPaperTypes(paper = {}) {
  if (paper.numberedQuestionTypes?.length) {
    return [...paper.numberedQuestionTypes].sort((a, b) => Number(a.questionNo || 0) - Number(b.questionNo || 0))
  }
  const fromSelected = Object.keys(paper.selectedQuestions || {}).filter(type => {
    const payload = paper.selectedQuestions[type]
    const questions = Array.isArray(payload) ? payload : payload?.questions
    return Array.isArray(questions) && questions.length
  })
  if (fromSelected.length) {
    return fromSelected.map(type => ({
      value: type,
      label: type.replace(/^nq_/, 'Question ').replace(/_/g, ' '),
      marks: Number(paper.selectedQuestions?.[type]?.marks || paper[`${type}_marks`] || 1),
      questionNo: Number(String(type).replace(/\D/g, '')) || 0,
      layout: String(type).startsWith('nq_') ? 'block' : undefined,
    }))
  }
  return [
    { value: 'mcq', label: 'MCQ', marks: 1 },
    { value: 'short', label: 'Short Question', marks: 2 },
    { value: 'long', label: 'Long Question', marks: 5 },
  ].filter(type => (paper[type.value] || []).length)
}

export function getSavedPaperStats(paper = {}) {
  const types = getSavedPaperTypes(paper)
  const totalQuestions = types.reduce((sum, type) => sum + (paper[type.value]?.length || 0), 0)
  const totalMarks = types.reduce((sum, type) => {
    const count = paper[type.value]?.length || 0
    const each = Number(paper[`${type.value}_marks`] || type.marks || 1)
    return sum + (count * each)
  }, 0)
  return {
    types,
    totalQuestions,
    totalMarks: Number(paper.config?.totalMarks || totalMarks || 0),
    isUnified: isUnifiedSavedPaper(paper),
  }
}

export function getSavedPaperSearchBlob(paper = {}) {
  const stats = getSavedPaperStats(paper)
  return [
    paper.name,
    paper.config?.subject,
    paper.config?.subjectName,
    paper.config?.classLevel,
    paper.config?.className,
    paper.config?.examType,
    paper.config?.paperType,
    paper.config?.chapters,
    paper.paperSource,
    paper.sourceTab,
    paper.structureMode,
    stats.types.map(type => type.label).join(' '),
  ].filter(Boolean).join(' ').toLowerCase()
}

export function filterSavedPapers(papers = [], { search = '', source = 'all', classLevel = '', subject = '' } = {}) {
  const query = String(search || '').trim().toLowerCase()
  return papers.filter(paper => {
    if (source === 'unified' && !isUnifiedSavedPaper(paper)) return false
    if (source === 'studio' && isUnifiedSavedPaper(paper)) return false
    if (classLevel && String(paper.config?.classLevel || paper.config?.className || '') !== String(classLevel)) return false
    if (subject && !String(paper.config?.subject || paper.config?.subjectName || '').toLowerCase().includes(subject.toLowerCase())) return false
    if (!query) return true
    return getSavedPaperSearchBlob(paper).includes(query)
  })
}

function questionText(item = {}, language = 'english') {
  const en = item.en || item.text || ''
  const ur = item.ur || item.textUrdu || ''
  if (language === 'urdu') return ur || en
  if (language === 'dual' && en && ur) return `${en}\n${ur}`
  return en || ur
}

function buildSavedPaperSectionHtml(paper, type, themeColor, language) {
  const questions = paper[type.value] || []
  if (!questions.length) return ''
  const marks = Number(paper[`${type.value}_marks`] || type.marks || 1)
  const displayNo = type.questionNo || ''
  const marksLabel = type.layout === 'block' || String(type.value || '').startsWith('nq_')
    ? `(${marks} mark${marks === 1 ? '' : 's'})`
    : `(${marks} × ${questions.length} = ${marks * questions.length})`
  const heading = displayNo
    ? `Q${displayNo}. ${type.label || type.labelUrdu || 'Question'}`
    : (type.label || type.labelUrdu || 'Section')

  const body = questions.map((item, index) => {
    const text = questionText(item, language)
    const prefix = (type.layout === 'block' || String(type.value || '').startsWith('nq_')) ? '' : `${index + 1}. `
    return `<div class="question-item"><div class="question-text">${prefix}${escapeHtml(text).replace(/\n/g, '<br/>')}</div></div>`
  }).join('')

  return `
    <section class="paper-section">
      <div class="section-head">
        <strong>${escapeHtml(heading)}</strong>
        <span>${escapeHtml(marksLabel)}</span>
      </div>
      ${body}
    </section>
  `
}

export function buildSavedPaperDocumentHtml(paper = {}, paperSettings = {}) {
  const prefs = paper.printPrefs || {}
  const preview = paper.manualPreviewSettings || {}
  const language = prefs.language || paper.config?.language || 'english'
  const themeColor = TEMPLATE_THEME[prefs.tmpl] || TEMPLATE_THEME.classic
  const bodyFont = prefs.fontFamily || 'Arial, sans-serif'
  const fontColor = prefs.fontColor || '#1a1a1a'
  const logo = paperSettings?.logo || '/apex-logo.svg'
  const schoolName = preview.schoolName || paperSettings?.schoolName || 'AL SIDDIQUE SCHOLARS PUBLIC SCHOOL'
  const address = preview.address || paperSettings?.address || ''
  const cfg = paper.config || {}
  const stats = getSavedPaperStats(paper)
  const sections = stats.types.map(type => buildSavedPaperSectionHtml(paper, type, themeColor, language)).join('')
  const watermark = prefs.showWatermark
    ? `<div class="print-watermark"><img src="${escapeHtml(logo)}" alt="" /></div>`
    : ''

  return `
    <article class="saved-paper-page" style="--theme:${themeColor};--text:${fontColor};--font:${bodyFont};">
      ${watermark}
      <div class="paper-shell">
        <header class="paper-header">
          <div class="school-name">${escapeHtml(String(schoolName).toUpperCase())}</div>
          ${address ? `<div class="school-address">${escapeHtml(address)}</div>` : ''}
          <div class="paper-meta">
            <div><strong>${escapeHtml(cfg.subjectName || cfg.subject || paper.name || 'Assessment')}</strong>${cfg.classLevel || cfg.className ? ` · Class ${escapeHtml(cfg.classLevel || cfg.className)}` : ''}</div>
            <div>
              ${cfg.paperCode ? `Code: ${escapeHtml(cfg.paperCode)} · ` : ''}
              ${cfg.timeAllowed || cfg.time ? `Time: ${escapeHtml(cfg.timeAllowed || cfg.time)} · ` : ''}
              Marks: ${escapeHtml(String(stats.totalMarks || ''))}
              ${cfg.examDate ? ` · Date: ${escapeHtml(cfg.examDate)}` : ''}
            </div>
          </div>
        </header>
        ${sections}
      </div>
    </article>
  `
}

export function buildBulkPrintHtml(papers = [], paperSettings = {}) {
  const pages = papers.map(paper => buildSavedPaperDocumentHtml(paper, paperSettings)).join('')
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap" rel="stylesheet" />
  <style>
    *,*::before,*::after{box-sizing:border-box}
    html,body{margin:0;padding:0;background:#fff;color:#1a1a1a}
    @page{size:A4 portrait;margin:10mm}
    body{font-family:Arial,sans-serif}
    .saved-paper-page{position:relative;page-break-after:always;padding:0}
    .saved-paper-page:last-child{page-break-after:auto}
    .print-watermark{position:fixed;top:52%;left:50%;transform:translate(-50%,-50%);width:120mm;height:120mm;opacity:0.08;z-index:0;pointer-events:none;display:flex;align-items:center;justify-content:center}
    .print-watermark img{max-width:100%;max-height:100%;object-fit:contain}
    .paper-shell{position:relative;z-index:1;max-width:210mm;margin:0 auto;padding:8mm 10mm;font-family:var(--font);color:var(--text)}
    .paper-header{text-align:center;border-bottom:2px solid var(--theme);padding-bottom:10px;margin-bottom:16px}
    .school-name{font-size:18px;font-weight:800;letter-spacing:0.04em}
    .school-address{font-size:11px;margin-top:4px;color:#555}
    .paper-meta{font-size:12px;margin-top:10px;line-height:1.6}
    .paper-section{margin-bottom:18px}
    .section-head{display:flex;justify-content:space-between;gap:12px;border-bottom:1.5px solid var(--theme);padding-bottom:6px;margin-bottom:10px;font-size:12px;color:var(--theme)}
    .question-item{margin-bottom:10px}
    .question-text{font-size:12px;line-height:1.65;white-space:pre-line}
  </style>
</head>
<body>${pages}</body>
</html>`
}

export function printSavedPapers(papers = [], paperSettings = {}) {
  if (!papers.length) return false
  const old = document.getElementById('__bulk_print_frame')
  if (old) old.remove()
  const iframe = document.createElement('iframe')
  iframe.id = '__bulk_print_frame'
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden'
  document.body.appendChild(iframe)
  const doc = iframe.contentWindow.document
  doc.open()
  doc.write(buildBulkPrintHtml(papers, paperSettings))
  doc.close()
  setTimeout(() => {
    try {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
    } catch (error) {
      console.error('Bulk print failed:', error)
    }
    setTimeout(() => {
      if (document.body.contains(iframe)) iframe.remove()
    }, 4000)
  }, 900)
  return true
}

export function normalizeSavedPaperForLoad(paper = {}) {
  if (!paper) return null
  const next = { ...paper, sourceTab: paper.sourceTab || (isUnifiedSavedPaper(paper) ? 'unified' : 'build') }
  if (!next.config) next.config = {}
  return next
}

export const REOPEN_PAPER_KEY = 'assps_reopen_saved_paper_id'

export function queueSavedPaperReopen(paperId) {
  if (!paperId) return
  try { sessionStorage.setItem(REOPEN_PAPER_KEY, String(paperId)) } catch { /* ignore */ }
}

export function consumeQueuedSavedPaper(savedPapers = []) {
  try {
    const id = sessionStorage.getItem(REOPEN_PAPER_KEY)
    if (!id) return null
    sessionStorage.removeItem(REOPEN_PAPER_KEY)
    return savedPapers.find(paper => String(paper.id) === String(id)) || null
  } catch {
    return null
  }
}
