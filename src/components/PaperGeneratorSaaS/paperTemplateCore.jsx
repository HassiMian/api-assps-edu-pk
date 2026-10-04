/** Shared print template utilities for PTS + Premium templates */

export const DEFAULT_LOGO = '/apex-logo.svg'

export function resolveLogo(settings) {
  return settings?.logo || DEFAULT_LOGO
}

export function resolveBodyFont(userFont, templateDefault) {
  return userFont?.trim() ? userFont : templateDefault
}

export function paperTextFlow({ isUrdu, engLineH, urdLineH, letterSp }) {
  return { lineHeight: isUrdu ? urdLineH : engLineH, letterSpacing: `${letterSp}px` }
}

export function editablePaperProps(edit) {
  return edit ? { 'data-manual-edit': 'true' } : {}
}

export function usePaperLayout({ half, baseFontSz, headFontSz, fontFamily, templateDefaultFont, fontColor, cfg, pbStyle, engLineH, urdLineH, letterSp }) {
  const isUrdu = cfg.language === 'urdu'
  const fs = (half ? 0.82 : 1) * (baseFontSz / 11)
  const hFs = (half ? 0.82 : 1) * (headFontSz / 11)
  const bodyFont = resolveBodyFont(fontFamily, templateDefaultFont)
  const wrap = {
    width: '100%',
    color: fontColor,
    fontFamily: bodyFont,
    fontSize: `${baseFontSz * fs}px`,
    direction: isUrdu ? 'rtl' : 'ltr',
    padding: half ? '3mm 3mm' : '4mm 6mm',
    boxSizing: 'border-box',
    border: pbStyle,
    minHeight: half ? '' : '297mm',
    ...paperTextFlow({ isUrdu, engLineH, urdLineH, letterSp }),
  }
  return { isUrdu, isDual: cfg.language === 'dual', fs, hFs, bodyFont, wrap, qFs: 11 * fs, qFsSm: Math.max(7, 10 * fs), qFsHead: 12 * fs }
}

export function resolveUrduFont(settings) {
  return settings?.urduFont ? `'${settings.urduFont}', 'Noto Nastaliq Urdu', serif` : "'Noto Nastaliq Urdu', serif"
}

export function QuestionText({ item, isUrdu, isDual, editMode, editStyle, bodyFont, urduFont, getBodyDisplay, getT, type, index, isBlockLayout }) {
  const enEditProps = editMode ? { contentEditable: true, suppressContentEditableWarning: true, 'data-pg-edit': 'question-text-en', 'data-pg-type': type.value, 'data-pg-index': index, style: editStyle } : {}
  const urEditProps = editMode ? { contentEditable: true, suppressContentEditableWarning: true, 'data-pg-edit': 'question-text-ur', 'data-pg-type': type.value, 'data-pg-index': index, style: editStyle } : {}
  const singleEditProps = editMode ? { contentEditable: true, suppressContentEditableWarning: true, 'data-pg-edit': 'question-text', 'data-pg-type': type.value, 'data-pg-index': index, style: editStyle } : {}
  if (isDual) {
    const en = item.en || item.text || ''
    const ur = item.ur || item.textUrdu || ''
    const displayEn = isBlockLayout ? (getBodyDisplay ? getBodyDisplay(item) : en) : en
    return (
      <div>
        {en && <div {...enEditProps} style={{ ...(editMode ? editStyle : {}), fontFamily: bodyFont, direction: 'ltr', textAlign: 'left', lineHeight: 1.55 }}>{displayEn}</div>}
        {ur && <div {...urEditProps} style={{ ...(editMode ? editStyle : {}), fontFamily: urduFont, direction: 'rtl', textAlign: 'right', marginTop: en ? 6 : 0, lineHeight: 2 }}>{ur}</div>}
      </div>
    )
  }
  if (isUrdu) {
    const ur = item.ur || item.textUrdu || item.text || item.en || ''
    const text = isBlockLayout && getBodyDisplay ? getBodyDisplay(item) : ur
    return <span {...urEditProps} style={{ fontFamily: urduFont, direction: 'rtl', textAlign: 'right', display: 'inline-block', width: '100%', lineHeight: 2 }}>{text}</span>
  }
  const text = isBlockLayout && getBodyDisplay ? getBodyDisplay(item) : getT(item)
  return <span {...singleEditProps}>{text}</span>
}

export function calcPaperTotal(paper, questionTypes) {
  return questionTypes.reduce((sum, t) => sum + (paper[t.value]?.length || 0) * (paper[`${t.value}_marks`] || t.marks || 1), 0)
}

export function Logo({ size = 50, src = null, wide = false, circle = false }) {
  const logoSrc = src || DEFAULT_LOGO
  if (logoSrc && !circle) {
    return (
      <img
        src={logoSrc}
        style={{ width: wide ? size * 2.8 : size, height: size, objectFit: 'contain', display: 'block', margin: '0 auto', background: 'transparent' }}
        alt="logo"
      />
    )
  }
  if (logoSrc && circle) {
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)', display: 'grid', placeItems: 'center', background: '#fff' }}>
        <img src={logoSrc} style={{ width: size * 0.82, height: size * 0.82, objectFit: 'contain' }} alt="logo" />
      </div>
    )
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: '#1a237e', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 900, fontSize: size * 0.32, letterSpacing: '0.04em' }}>
      ASSPS
    </div>
  )
}

function SectionRenderer({ type, paper, isUrdu, isDual, editMode, editStyle, fs, qFs, qFsSm, qFsHead, qBorderStyle, urdLineH, engLineH, letterSp, printAns, showAnsLines, qn, half, themeColor = '#1a237e', urduHeader = '', showSectionLine = false, bodyFont = 'inherit', urduFont = "'Noto Nastaliq Urdu', serif", sectionDivider = 'default' }) {
  const qs = paper[type.value] || []
  if (qs.length === 0) return null
  const marks = paper[`${type.value}_marks`] || type.marks || 1
  const isMcq = type.value === 'mcq'
  const isBlockLayout = type.layout === 'block' || String(type.value || '').startsWith('nq_')
  const useShortGrid = !isBlockLayout && (type.value === 'short' || type.value.includes('short'))
  const effectiveQBorder = isBlockLayout ? 'none' : qBorderStyle
  const displayQn = type.questionNo || qn
  const textFont = isUrdu ? urduFont : bodyFont
  const marksLabel = isBlockLayout
    ? `(${marks} mark${Number(marks) === 1 ? '' : 's'})`
    : `(${marks} × ${qs.length} = ${qs.length * marks})`

  function getT(item) {
    const e = item.en || item.text || ''
    const u = item.ur || item.textUrdu || item.text || ''
    return isUrdu ? (u || e) : (isDual && e && u ? e + ' / ' + u : (e || u))
  }

  function getBodyDisplay(item) {
    let text = getT(item)
    if (!isBlockLayout) return text
    const heading = String(type.label || '').trim()
    if (heading) {
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean)
      const filtered = lines.filter(line => line.toLowerCase() !== heading.toLowerCase())
      text = filtered.length ? filtered.join('\n') : text
      if (text.toLowerCase().startsWith(heading.toLowerCase())) {
        text = text.slice(heading.length).trim().replace(/^[\s:.\-]+/, '').trim()
      }
    }
    return text.replace(/\s+(?=\([ivx]+\)\s)/gi, '\n').trim()
  }

  const dividerStyle = (() => {
    if (sectionDivider === 'ledger') return { borderBottom: `1px solid ${themeColor}55`, marginBottom: `${8 * fs}px` }
    if (sectionDivider === 'gold') return { borderBottom: `1px solid ${themeColor}`, marginBottom: `${8 * fs}px`, position: 'relative' }
    if (sectionDivider === 'pill') return { marginBottom: `${8 * fs}px` }
    if (sectionDivider === 'blueprint') return { borderBottom: `0.5px dashed ${themeColor}66`, marginBottom: `${8 * fs}px` }
    return { borderBottom: `2.1px solid ${themeColor}`, marginBottom: `${6 * fs}px`, paddingBottom: `${4 * fs}px` }
  })()

  return (
    <div style={{ marginBottom: `${10 * fs}px` }}>
      {urduHeader && <div style={{ textAlign: 'center', fontFamily: urduFont, fontSize: `${14 * fs}px`, fontWeight: 800, color: themeColor, marginBottom: `${5 * fs}px`, direction: 'rtl' }}>{urduHeader}</div>}
      {sectionDivider === 'pill' ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: `${8 * fs}px`, direction: isUrdu ? 'rtl' : 'ltr' }}>
          <span style={{ background: `${themeColor}12`, color: themeColor, fontWeight: 700, fontSize: `${10 * fs}px`, padding: `${3 * fs}px ${10 * fs}px`, borderRadius: 999, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            <span contentEditable={editMode} suppressContentEditableWarning data-pg-edit="section-label" data-pg-type={type.value} style={editMode ? editStyle : undefined}>{isUrdu ? (type.labelUrdu || type.label) : type.label}</span>
          </span>
          <span style={{ fontWeight: 700, fontSize: `${10 * fs}px`, color: themeColor }}><span contentEditable={editMode} suppressContentEditableWarning data-pg-edit="section-marks" data-pg-type={type.value} style={editMode ? editStyle : undefined}>{marksLabel}</span></span>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', direction: isUrdu ? 'rtl' : 'ltr', ...dividerStyle }}>
          {isUrdu ? (
            <>
              <span style={{ fontWeight: 700, fontSize: `${12 * fs}px`, fontFamily: urduFont, lineHeight: urdLineH }}>سوال نمبر {displayQn}. <span contentEditable={editMode} suppressContentEditableWarning data-pg-edit="section-label" data-pg-type={type.value} style={editMode ? editStyle : undefined}>{type.labelUrdu || type.label}</span></span>
              <span style={{ fontWeight: 700, fontSize: `${10 * fs}px`, color: themeColor }}><span contentEditable={editMode} suppressContentEditableWarning data-pg-edit="section-marks" data-pg-type={type.value} style={editMode ? editStyle : undefined}>{marksLabel}</span></span>
            </>
          ) : (
            <>
              <span style={{ fontWeight: sectionDivider === 'editorial' ? 600 : 800, fontSize: `${12 * fs}px`, color: sectionDivider === 'editorial' ? themeColor : '#333', fontFamily: textFont, letterSpacing: sectionDivider === 'editorial' ? '0.12em' : 0, textTransform: sectionDivider === 'editorial' ? 'uppercase' : 'none' }}>
                {sectionDivider === 'editorial' ? '' : `Q${displayQn}. `}
                <span contentEditable={editMode} suppressContentEditableWarning data-pg-edit="section-label" data-pg-type={type.value} style={editMode ? editStyle : undefined}>{type.label}</span>
              </span>
              <span style={{ fontWeight: 700, fontSize: `${11 * fs}px`, color: themeColor, fontFamily: textFont }}><span contentEditable={editMode} suppressContentEditableWarning data-pg-edit="section-marks" data-pg-type={type.value} style={editMode ? editStyle : undefined}>{marksLabel}</span></span>
            </>
          )}
        </div>
      )}
      {showSectionLine && <div style={{ borderBottom: `1px dashed ${themeColor}55`, marginBottom: `${8 * fs}px` }} />}

      {isMcq ? (
        effectiveQBorder === 'table' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: `${qFs}px` }}>
            <thead><tr style={{ background: `${themeColor}11` }}>
              <th style={{ border: `1px solid ${themeColor}88`, padding: `${3 * fs}px`, textAlign: 'center', width: '5%' }}>No.</th>
              <th style={{ border: `1px solid ${themeColor}88`, padding: `${3 * fs}px ${5 * fs}px` }}>{isUrdu ? 'سوال' : 'Question'}</th>
              {['A', 'B', 'C', 'D'].map(l => <th key={l} style={{ border: `1px solid ${themeColor}88`, padding: `${3 * fs}px`, textAlign: 'center', width: '11%' }}>({l})</th>)}
            </tr></thead>
            <tbody>{qs.map((q, i) => (
              <tr key={q.id || `${type.value}-row-${i}`}>
                <td style={{ border: `1px solid ${themeColor}88`, padding: `${3 * fs}px`, textAlign: 'center', fontWeight: 700, color: themeColor }}>{i + 1}.</td>
                <td style={{ border: `1px solid ${themeColor}88`, padding: `${3 * fs}px ${5 * fs}px`, direction: isUrdu ? 'rtl' : 'ltr', textAlign: isUrdu ? 'right' : 'left', fontFamily: textFont, lineHeight: isUrdu ? urdLineH : engLineH }}>
                  <QuestionText item={q} isUrdu={isUrdu} isDual={isDual} editMode={editMode} editStyle={editStyle} bodyFont={bodyFont} urduFont={urduFont} getT={getT} type={type} index={i} isBlockLayout={false} />
                </td>
                {q.options?.map((opt, optIndex) => (
                  <td key={opt.key || opt.label || `${type.value}-opt-${i}-${optIndex}`} style={{ border: `1px solid ${themeColor}88`, padding: `${3 * fs}px`, textAlign: 'center', fontSize: `${qFsSm}px` }}>
                    <span contentEditable={editMode} suppressContentEditableWarning data-pg-edit={editMode ? 'mcq-option' : undefined} data-pg-type={type.value} data-pg-index={i} data-pg-opt-key={opt.key || opt.label || String.fromCharCode(65 + optIndex)} style={editStyle}>{getT(opt)}</span>
                  </td>
                ))}
              </tr>
            ))}</tbody>
          </table>
        ) : (
          qs.map((q, i) => (
            <div key={q.id || `${type.value}-card-${i}`} style={{ marginBottom: `${8 * fs}px`, ...(qBorderStyle === 'box' ? { border: `1px solid ${themeColor}44`, borderRadius: `${3 * fs}px`, padding: `${6 * fs}px ${8 * fs}px` } : {}) }}>
              <div style={{ fontWeight: 700, fontSize: `${qFs}px`, marginBottom: `${3 * fs}px`, direction: isUrdu ? 'rtl' : 'ltr', textAlign: isUrdu ? 'right' : 'left', fontFamily: textFont, lineHeight: isUrdu ? urdLineH : engLineH, letterSpacing: `${letterSp}px` }}>
                <span style={{ color: themeColor }}>{i + 1}.</span>{' '}<QuestionText item={q} isUrdu={isUrdu} isDual={isDual} editMode={editMode} editStyle={editStyle} bodyFont={bodyFont} urduFont={urduFont} getT={getT} type={type} index={i} isBlockLayout={false} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${half ? 2 : 4}, 1fr)`, gap: `${2 * fs}px`, paddingLeft: isUrdu ? 0 : `${14 * fs}px`, paddingRight: isUrdu ? `${14 * fs}px` : 0 }}>
                {q.options?.map((opt, optIndex) => (
                  <div key={opt.key || opt.label || `${type.value}-choice-${i}-${optIndex}`} style={{ fontSize: `${qFsSm}px`, direction: isUrdu ? 'rtl' : 'ltr', fontFamily: textFont, lineHeight: isUrdu ? urdLineH : engLineH, letterSpacing: `${letterSp}px` }}>
                    <strong style={{ color: themeColor }}>({opt.key || opt.label || String.fromCharCode(65 + optIndex)})</strong>{' '}
                    <span contentEditable={editMode} suppressContentEditableWarning data-pg-edit={editMode ? 'mcq-option' : undefined} data-pg-type={type.value} data-pg-index={i} data-pg-opt-key={opt.key || opt.label || String.fromCharCode(65 + optIndex)} style={editStyle}>{getT(opt)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )
      ) : (
        effectiveQBorder === 'table' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: `${qFs}px` }}>
            <thead><tr style={{ background: `${themeColor}11` }}>
              <th style={{ border: `1px solid ${themeColor}88`, padding: `${3 * fs}px`, textAlign: 'center', width: '6%' }}>No.</th>
              <th style={{ border: `1px solid ${themeColor}88`, padding: `${3 * fs}px ${5 * fs}px` }}>{isUrdu ? 'سوال' : 'Question'}</th>
            </tr></thead>
            <tbody>{qs.map((q, i) => (
              <tr key={q.id || `${type.value}-table-${i}`}>
                <td style={{ border: `1px solid ${themeColor}88`, padding: `${5 * fs}px`, textAlign: 'center', fontWeight: 700, color: themeColor, verticalAlign: 'top' }}>{i + 1}.</td>
                <td style={{ border: `1px solid ${themeColor}88`, padding: `${5 * fs}px`, direction: isUrdu ? 'rtl' : 'ltr', textAlign: isUrdu ? 'right' : 'left', fontFamily: textFont, lineHeight: isUrdu ? urdLineH : engLineH, minHeight: `${20 * fs}px`, whiteSpace: isBlockLayout && !isDual ? 'pre-line' : 'normal' }}>
                  <QuestionText item={q} isUrdu={isUrdu} isDual={isDual} editMode={editMode} editStyle={editStyle} bodyFont={bodyFont} urduFont={urduFont} getBodyDisplay={getBodyDisplay} getT={getT} type={type} index={i} isBlockLayout={isBlockLayout} />
                </td>
              </tr>
            ))}</tbody>
          </table>
        ) : (
          <div style={{ display: useShortGrid ? 'grid' : 'block', gridTemplateColumns: useShortGrid ? '1fr 1fr' : 'none', gap: `${4 * fs}px ${14 * fs}px` }}>
            {qs.map((q, i) => (
              <div key={q.id || `${type.value}-item-${i}`} style={{ fontSize: `${qFs}px`, marginBottom: useShortGrid ? 0 : `${12 * fs}px`, ...(qBorderStyle === 'box' ? { border: `1px solid ${themeColor}44`, borderRadius: `${3 * fs}px`, padding: useShortGrid ? `${5 * fs}px ${7 * fs}px` : `${6 * fs}px ${8 * fs}px` } : {}) }}>
                <div style={{ fontWeight: useShortGrid ? 600 : 700, direction: isUrdu ? 'rtl' : 'ltr', textAlign: isUrdu ? 'right' : 'left', fontFamily: textFont, lineHeight: isUrdu ? urdLineH : engLineH, letterSpacing: `${letterSp}px`, whiteSpace: isBlockLayout && !isDual ? 'pre-line' : 'normal' }}>
                  {!isBlockLayout && <span style={{ color: themeColor, fontWeight: 600 }}>{i + 1}.</span>}{!isBlockLayout ? ' ' : ''}<QuestionText item={q} isUrdu={isUrdu} isDual={isDual} editMode={editMode} editStyle={editStyle} bodyFont={bodyFont} urduFont={urduFont} getBodyDisplay={getBodyDisplay} getT={getT} type={type} index={i} isBlockLayout={isBlockLayout} />
                </div>
                {showAnsLines && (useShortGrid ? (
                  <div style={{ borderBottom: `1px solid ${themeColor}44`, marginTop: `${4 * fs}px`, marginBottom: `${4 * fs}px`, height: `${14 * fs}px` }} />
                ) : (
                  [...Array(6)].map((_, li) => (
                    <div key={li} style={{ borderBottom: `1px solid ${themeColor}22`, height: `${20 * fs}px` }} />
                  ))
                ))}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}

export function renderPaperSections({
  paper, cfg, questionTypes, half, printBubble, printAns, editMode, editStyle, fs, qFs, qFsSm, qFsHead,
  qBorderStyle, urdLineH, engLineH, letterSp, showAnsLines, showUrduHeaders, showSectionLine, themeColor, bodyFont, urduFont,
  isUrdu, isDual, sectionDivider = 'default',
}) {
  const mcqs = paper.mcq || []
  let qn = 0
  return (
    <>
      {printBubble && mcqs.length > 0 && (
        <div style={{ marginBottom: `${8 * fs}px` }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${half ? 4 : 5}, 1fr)`, gap: `${3 * fs}px ${8 * fs}px` }}>
            {mcqs.map((q, i) => (
              <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: `${3 * fs}px`, fontSize: `${10 * fs}px`, fontWeight: 700, fontFamily: bodyFont }}>
                <span style={{ minWidth: `${16 * fs}px`, color: themeColor }}>{i + 1}.</span>
                {['A', 'B', 'C', 'D'].map(lt => (
                  <span key={lt} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: `${16 * fs}px`, height: `${16 * fs}px`, borderRadius: '50%', border: `1.5px solid ${themeColor}`, fontSize: `${8 * fs}px`, fontWeight: 700, color: printAns && q.options?.find(o => o.key === lt)?.correct ? '#fff' : themeColor, background: printAns && q.options?.find(o => o.key === lt)?.correct ? themeColor : 'transparent' }}>{lt}</span>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderBottom: `1px solid ${themeColor}33`, marginTop: `${6 * fs}px` }} />
        </div>
      )}
      {questionTypes.map(type => {
        const qs = paper[type.value] || []
        if (!qs.length) return null
        qn++
        return (
          <SectionRenderer
            key={type.value}
            type={type}
            paper={paper}
            isUrdu={isUrdu}
            isDual={isDual}
            editMode={editMode}
            editStyle={editStyle}
            fs={fs}
            qFs={qFs}
            qFsSm={qFsSm}
            qFsHead={qFsHead}
            qBorderStyle={qBorderStyle}
            urdLineH={urdLineH}
            engLineH={engLineH}
            letterSp={letterSp}
            printAns={printAns}
            showAnsLines={showAnsLines}
            showSectionLine={showSectionLine}
            bodyFont={bodyFont}
            urduFont={urduFont}
            qn={qn}
            half={half}
            themeColor={themeColor}
            urduHeader={showUrduHeaders ? (type.value === 'mcq' ? 'حصہ معروضی' : 'حصہ انشائیہ') : ''}
            sectionDivider={sectionDivider}
          />
        )
      })}
    </>
  )
}
