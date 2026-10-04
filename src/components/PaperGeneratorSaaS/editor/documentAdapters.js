function plainToHtml(text = '') {
  return String(text || '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => `<p>${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`)
    .join('') || '<p></p>'
}

function htmlToPlain(html = '') {
  if (!html) return ''
  const div = typeof document !== 'undefined' ? document.createElement('div') : null
  if (!div) return String(html).replace(/<[^>]+>/g, '\n').trim()
  div.innerHTML = html
  return (div.innerText || div.textContent || '').replace(/\u00a0/g, ' ').trim()
}

export function paperToDocument(loadedPaper = {}) {
  const types = loadedPaper.numberedQuestionTypes?.length
    ? [...loadedPaper.numberedQuestionTypes].sort((a, b) => Number(a.questionNo || 0) - Number(b.questionNo || 0))
    : []

  const blocks = types.map(type => {
    const item = (loadedPaper[type.value] || [])[0] || {}
    return {
      id: type.value,
      questionNo: type.questionNo,
      label: type.label || type.labelUrdu || `Question ${type.questionNo}`,
      marks: Number(loadedPaper[`${type.value}_marks`] || type.marks || 1),
      layout: type.layout || 'block',
      contentHtml: plainToHtml(item.en || item.text || ''),
      contentUrduHtml: plainToHtml(item.ur || item.textUrdu || ''),
      answer: item.answer || '',
      markingNotes: item.markingNotes || '',
    }
  })

  return {
    version: 1,
    meta: {
      subject: loadedPaper.config?.subjectName || loadedPaper.config?.subject || '',
      classLevel: loadedPaper.config?.className || loadedPaper.config?.classLevel || '',
      paperCode: loadedPaper.config?.paperCode || '',
      language: loadedPaper.config?.language || loadedPaper.printPrefs?.language || 'english',
      schoolName: loadedPaper.manualPreviewSettings?.schoolName || '',
      address: loadedPaper.manualPreviewSettings?.address || '',
    },
    blocks,
  }
}

export function documentToPaper(document, basePaper = {}) {
  const next = { ...basePaper }
  const typesById = Object.fromEntries((basePaper.numberedQuestionTypes || []).map(t => [t.value, { ...t }]))

  const types = (document.blocks || []).map(block => {
    const typeId = block.id
    const en = htmlToPlain(block.contentHtml)
    const ur = htmlToPlain(block.contentUrduHtml)
    const bucket = Array.isArray(next[typeId]) ? [...next[typeId]] : []
    const current = bucket[0] || { id: typeId }
    bucket[0] = {
      ...current,
      en,
      text: en,
      ur,
      textUrdu: ur,
      answer: block.answer || current.answer || '',
      markingNotes: block.markingNotes || current.markingNotes || '',
    }
    next[typeId] = bucket
    next[`${typeId}_marks`] = Number(block.marks || next[`${typeId}_marks`] || 1)

    const existing = typesById[typeId] || { value: typeId, layout: block.layout || 'block' }
    return {
      ...existing,
      questionNo: block.questionNo,
      label: block.label || existing.label,
      labelUrdu: block.label || existing.labelUrdu,
      marks: Number(block.marks || existing.marks || 1),
    }
  })

  next.numberedQuestionTypes = types
  next.manualPreviewSettings = {
    ...(basePaper.manualPreviewSettings || {}),
    schoolName: document.meta?.schoolName || basePaper.manualPreviewSettings?.schoolName,
    address: document.meta?.address || basePaper.manualPreviewSettings?.address,
  }
  return next
}

export { plainToHtml, htmlToPlain }
