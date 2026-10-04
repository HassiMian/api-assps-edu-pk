import { downloadHtmlAsWord } from '../paperExportUtils'

function escapeHtml(value = '') {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function totalMarks(doc = {}) {
  return (doc.blocks || []).reduce((sum, b) => sum + Number(b.marks || 0), 0)
}

export function buildProDocumentHtml(doc = {}, paperSettings = {}, loadedPaper = {}) {
  const meta = doc.meta || {}
  const cfg = loadedPaper.config || {}
  const schoolName = meta.schoolName || paperSettings?.schoolName || 'AL SIDDIQUE SCHOLARS PUBLIC SCHOOL'
  const address = meta.address || paperSettings?.address || ''
  const subject = meta.subject || cfg.subjectName || cfg.subject || 'Assessment'
  const classLevel = meta.classLevel || cfg.classLevel || cfg.className || ''
  const isDual = meta.language === 'dual' || meta.language === 'mixed'
  const marks = totalMarks(doc)

  const blocks = (doc.blocks || []).map(block => {
    const urduBlock = isDual && block.contentUrduHtml
      ? `<div class="urdu-body" dir="rtl">${block.contentUrduHtml}</div>`
      : ''
    return `
      <section class="pro-block">
        <div class="pro-block-head">
          <strong>Q${block.questionNo}. ${escapeHtml(block.label || '')}</strong>
          <span>(${Number(block.marks || 0)} mark${Number(block.marks || 0) === 1 ? '' : 's'})</span>
        </div>
        <div class="pro-block-body">${block.contentHtml || '<p></p>'}</div>
        ${urduBlock}
      </section>
    `
  }).join('')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(subject)} Paper</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap" rel="stylesheet" />
  <style>
    *,*::before,*::after{box-sizing:border-box}
    html,body{margin:0;padding:0;background:#fff;color:#1a1a1a;font-family:Arial,sans-serif}
    @page{size:A4 portrait;margin:10mm}
    body{padding:0}
    .pro-page{max-width:210mm;margin:0 auto;padding:10mm 12mm}
    .pro-header{text-align:center;border-bottom:2px solid #1a237e;padding-bottom:10px;margin-bottom:18px}
    .pro-school{font-size:18px;font-weight:800;letter-spacing:0.04em;color:#1a237e}
    .pro-address{font-size:11px;color:#555;margin-top:4px}
    .pro-meta{font-size:12px;margin-top:10px;line-height:1.6;color:#333}
    .pro-block{margin-bottom:20px;page-break-inside:avoid}
    .pro-block-head{display:flex;justify-content:space-between;gap:12px;border-bottom:1.5px solid #1a237e;padding-bottom:6px;margin-bottom:8px;font-size:12px;color:#1a237e}
    .pro-block-body{font-size:12px;line-height:1.65;color:#111}
    .pro-block-body p{margin:0 0 6px}
    .pro-block-body ul,.pro-block-body ol{margin:4px 0 8px 18px;padding:0}
    .pro-block-body table{border-collapse:collapse;width:100%;margin:8px 0}
    .pro-block-body th,.pro-block-body td{border:1px solid #cbd5e1;padding:6px 8px;font-size:12px}
    .pro-block-body img{max-width:100%;height:auto;margin:8px 0}
    .urdu-body{font-family:'Noto Nastaliq Urdu',serif;font-size:13px;line-height:2;margin-top:8px;text-align:right;direction:rtl}
    .urdu-body p{margin:0 0 6px}
  </style>
</head>
<body>
  <article class="pro-page">
    <header class="pro-header">
      <div class="pro-school">${escapeHtml(String(schoolName).toUpperCase())}</div>
      ${address ? `<div class="pro-address">${escapeHtml(address)}</div>` : ''}
      <div class="pro-meta">
        <div><strong>${escapeHtml(subject)}</strong>${classLevel ? ` · Class ${escapeHtml(classLevel)}` : ''}</div>
        <div>Total Marks: ${marks}${cfg.time || cfg.timeAllowed ? ` · Time: ${escapeHtml(cfg.time || cfg.timeAllowed)}` : ''}</div>
      </div>
    </header>
    ${blocks}
  </article>
</body>
</html>`
}

export function printProDocument(doc, paperSettings = {}, loadedPaper = {}) {
  const html = buildProDocumentHtml(doc, paperSettings, loadedPaper)
  const old = document.getElementById('__pro_print_frame')
  if (old) old.remove()
  const iframe = document.createElement('iframe')
  iframe.id = '__pro_print_frame'
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden'
  document.body.appendChild(iframe)
  const winDoc = iframe.contentWindow.document
  winDoc.open()
  winDoc.write(html)
  winDoc.close()
  setTimeout(() => {
    try {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
    } catch (error) {
      console.error('Pro print failed:', error)
    }
    setTimeout(() => {
      if (document.body.contains(iframe)) iframe.remove()
    }, 4000)
  }, 700)
}

export function exportProDocumentAsDocx(doc, paperSettings = {}, loadedPaper = {}, filename = '') {
  const html = buildProDocumentHtml(doc, paperSettings, loadedPaper)
  const cfg = loadedPaper.config || {}
  const name = filename || `${cfg.subject || doc.meta?.subject || 'Paper'}_Class${cfg.classLevel || doc.meta?.classLevel || ''}_Pro`
  downloadHtmlAsWord(html, `${name}.doc`)
}
