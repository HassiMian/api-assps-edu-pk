import { PREMIUM_TEMPLATES, PREMIUM_THUMB_PRESETS, SCHOOL_BRAND } from './premiumTemplateRegistry'
import { getTemplatePreviewPath } from '../../templatePreviewAssets'
import {
  calcPaperTotal,
  editablePaperProps,
  Logo,
  paperTextFlow,
  renderPaperSections,
  resolveUrduFont,
  usePaperLayout,
} from '../../paperTemplateCore'

function schoolMeta(settings) {
  return {
    name: (settings?.schoolName || SCHOOL_BRAND.name).toUpperCase(),
    address: settings?.address || SCHOOL_BRAND.address,
    website: settings?.website || SCHOOL_BRAND.website,
    contact: settings?.contact || SCHOOL_BRAND.contact,
  }
}

function blankLine(h = 14) {
  return <div style={{ borderBottom: '1px solid rgba(0,0,0,0.22)', height: h, marginTop: 2 }} />
}

function MetaField({ label, value, fs, color, editMode, editStyle, underline = true }) {
  return (
    <div>
      <div style={{ color, fontSize: `${8 * fs}px`, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
      {value != null && value !== '' ? (
        <div style={{ fontWeight: 700, fontSize: `${10 * fs}px`, marginTop: 2 }}>{value}</div>
      ) : underline ? blankLine(12 * fs) : null}
    </div>
  )
}

function buildMetaRows(cfg, total, fs, isUrdu) {
  const L = (en, ur) => (isUrdu ? ur : en)
  return [
    [L('Student Name', 'نام'), null, L('Father Name', 'والد کا نام'), null],
    [L('Class', 'جماعت'), cfg.className, L('Section', 'سیکشن'), null],
    [L('Roll No.', 'رول نمبر'), null, L('Subject', 'مضمون'), cfg.subjectName],
    [L('Date', 'تاریخ'), cfg.examDate, L('Time Allowed', 'مہلت'), cfg.timeAllowed],
    [L('Total Marks', 'کل نمبر'), String(total), L('Obtained Marks', 'حاصل شدہ'), null],
    [L('Paper Code', 'پیپر کوڈ'), cfg.paperCode, L('Signature', 'دستخط'), null],
  ]
}

function PremiumHeader({ variant, def, settings, cfg, total, half, fs, hFs, bodyFont, editMode, editStyle, isUrdu }) {
  const { primary, secondary, surface, accent } = def.palette
  const meta = schoolMeta(settings)
  const logoSize = half ? 40 : 52

  const nameBlock = (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        contentEditable={editMode}
        suppressContentEditableWarning
        data-pg-edit="school-name"
        style={{
          ...(editMode ? editStyle : {}),
          fontSize: `${(half ? 14 : 17) * hFs}px`,
          fontWeight: 800,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: variant === 'oxford' || variant === 'royal' || variant === 'os' ? '#fff' : primary,
          lineHeight: 1.05,
          fontFamily: def.fonts?.headline || bodyFont,
        }}
      >
        {meta.name}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: `${6 * fs}px`, marginTop: `${3 * fs}px`, fontSize: `${9 * fs}px`, color: variant === 'oxford' || variant === 'royal' || variant === 'os' ? 'rgba(255,255,255,0.82)' : secondary }}>
        <span contentEditable={editMode} suppressContentEditableWarning data-pg-edit="school-address" style={editMode ? editStyle : undefined}>{meta.address}</span>
        <span>·</span><span>{meta.website}</span><span>·</span><span>{meta.contact}</span>
      </div>
    </div>
  )

  if (variant === 'oxford') {
    return (
      <div style={{ marginBottom: `${8 * fs}px` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: `${12 * fs}px`, paddingBottom: `${8 * fs}px`, borderBottom: `2px solid ${primary}` }}>
          <Logo size={logoSize} src={settings?.logo} />
          <div style={{ flex: 1 }}>
            <div contentEditable={editMode} suppressContentEditableWarning data-pg-edit="school-name" style={{ ...(editMode ? editStyle : {}), fontSize: `${(half ? 15 : 18) * hFs}px`, fontWeight: 800, color: primary, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: def.fonts?.headline }}>{meta.name}</div>
            <div style={{ marginTop: 4, fontSize: `${9 * fs}px`, color: secondary }}>
              <span contentEditable={editMode} suppressContentEditableWarning data-pg-edit="school-address" style={editMode ? editStyle : undefined}>{meta.address}</span>
              {' · '}{meta.website}{' · '}{meta.contact}
            </div>
          </div>
        </div>
        <div style={{ height: 1, background: accent, marginTop: 2 }} />
      </div>
    )
  }

  if (variant === 'ledger') {
    return (
      <div style={{ border: `2px solid ${primary}`, padding: `${8 * fs}px`, marginBottom: `${8 * fs}px`, background: surface }}>
        <div style={{ display: 'flex', gap: `${10 * fs}px`, alignItems: 'flex-start', borderBottom: `1px solid ${primary}44`, paddingBottom: `${6 * fs}px`, marginBottom: `${6 * fs}px` }}>
          <Logo size={logoSize} src={settings?.logo} />
          {nameBlock}
        </div>
        <div style={{ textAlign: 'center', fontWeight: 800, fontSize: `${11 * fs}px`, color: primary, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: `${6 * fs}px` }}>Examination Paper</div>
      </div>
    )
  }

  if (variant === 'grid') {
    return (
      <div style={{ position: 'relative', marginBottom: `${10 * fs}px`, paddingTop: `${4 * fs}px` }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: 8, height: 8, borderTop: `1px solid ${accent}`, borderLeft: `1px solid ${accent}` }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderTop: `1px solid ${accent}`, borderRight: `1px solid ${accent}` }} />
        <div style={{ display: 'flex', gap: `${12 * fs}px`, alignItems: 'center' }}>
          <Logo size={logoSize} src={settings?.logo} />
          {nameBlock}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: 2, marginTop: 8, opacity: 0.35 }}>
          {Array.from({ length: 24 }).map((_, i) => <div key={i} style={{ height: 1, background: accent }} />)}
        </div>
      </div>
    )
  }

  if (variant === 'royal') {
    return (
      <div style={{ background: primary, padding: `${(half ? 8 : 12) * fs}px`, marginBottom: `${8 * fs}px`, display: 'flex', gap: `${12 * fs}px`, alignItems: 'center' }}>
        <Logo size={logoSize + 4} src={settings?.logo} />
        {nameBlock}
      </div>
    )
  }

  if (variant === 'editorial') {
    return (
      <div style={{ marginBottom: `${10 * fs}px` }}>
        <div style={{ display: 'grid', gridTemplateColumns: `${logoSize + 16}px 1fr`, gap: `${14 * fs}px`, alignItems: 'end' }}>
          <Logo size={logoSize} src={settings?.logo} />
          <div>
            <div style={{ fontSize: `${8 * fs}px`, letterSpacing: '0.22em', textTransform: 'uppercase', color: secondary, marginBottom: 4 }}>Institutional Assessment</div>
            <div contentEditable={editMode} suppressContentEditableWarning data-pg-edit="school-name" style={{ ...(editMode ? editStyle : {}), fontSize: `${(half ? 16 : 22) * hFs}px`, fontWeight: 700, color: primary, letterSpacing: '-0.02em', lineHeight: 0.98, fontFamily: def.fonts?.headline }}>{meta.name}</div>
          </div>
        </div>
        <div style={{ marginTop: `${8 * fs}px`, display: 'flex', justifyContent: 'space-between', fontSize: `${9 * fs}px`, color: secondary, borderTop: `3px solid ${primary}`, paddingTop: 6 }}>
          <span contentEditable={editMode} suppressContentEditableWarning data-pg-edit="school-address" style={editMode ? editStyle : undefined}>{meta.address}</span>
          <span>{meta.website} · {meta.contact}</span>
        </div>
      </div>
    )
  }

  if (variant === 'blueprint') {
    return (
      <div style={{ border: `1px solid ${accent}55`, padding: `${8 * fs}px`, marginBottom: `${8 * fs}px`, background: surface, position: 'relative' }}>
        {['tl', 'tr', 'bl', 'br'].map(corner => (
          <div key={corner} style={{
            position: 'absolute',
            width: 10, height: 10,
            top: corner.startsWith('t') ? 4 : 'auto',
            bottom: corner.startsWith('b') ? 4 : 'auto',
            left: corner.endsWith('l') ? 4 : 'auto',
            right: corner.endsWith('r') ? 4 : 'auto',
            borderTop: corner.startsWith('t') ? `1px solid ${accent}` : 'none',
            borderBottom: corner.startsWith('b') ? `1px solid ${accent}` : 'none',
            borderLeft: corner.endsWith('l') ? `1px solid ${accent}` : 'none',
            borderRight: corner.endsWith('r') ? `1px solid ${accent}` : 'none',
          }} />
        ))}
        <div style={{ display: 'flex', gap: `${10 * fs}px`, alignItems: 'center' }}>
          <Logo size={logoSize} src={settings?.logo} />
          {nameBlock}
        </div>
      </div>
    )
  }

  if (variant === 'seal') {
    return (
      <div style={{ display: 'flex', gap: `${12 * fs}px`, alignItems: 'center', marginBottom: `${8 * fs}px`, paddingBottom: `${8 * fs}px`, borderBottom: `1px solid ${primary}` }}>
        <Logo size={logoSize + 6} src={settings?.logo} circle />
        <div style={{ flex: 1 }}>
          <div contentEditable={editMode} suppressContentEditableWarning data-pg-edit="school-name" style={{ ...(editMode ? editStyle : {}), fontSize: `${(half ? 14 : 17) * hFs}px`, fontWeight: 800, color: primary, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{meta.name}</div>
          <div style={{ fontSize: `${9 * fs}px`, color: secondary, marginTop: 4 }}>
            <span contentEditable={editMode} suppressContentEditableWarning data-pg-edit="school-address" style={editMode ? editStyle : undefined}>{meta.address}</span>
            {' · '}{meta.website}{' · '}{meta.contact}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'soft') {
    return (
      <div style={{ background: secondary, borderRadius: 8, padding: `${10 * fs}px`, marginBottom: `${8 * fs}px` }}>
        <div style={{ display: 'flex', gap: `${10 * fs}px`, alignItems: 'center' }}>
          <Logo size={logoSize} src={settings?.logo} />
          <div style={{ flex: 1 }}>
            <div contentEditable={editMode} suppressContentEditableWarning data-pg-edit="school-name" style={{ ...(editMode ? editStyle : {}), fontSize: `${(half ? 14 : 16) * hFs}px`, fontWeight: 800, color: primary }}>{meta.name}</div>
            <div style={{ fontSize: `${9 * fs}px`, color: '#64748b', marginTop: 2 }}>
              <span contentEditable={editMode} suppressContentEditableWarning data-pg-edit="school-address" style={editMode ? editStyle : undefined}>{meta.address}</span>
              {' · '}{meta.website}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'prestige') {
    return (
      <div style={{ marginBottom: `${12 * fs}px`, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8 }}><Logo size={logoSize} src={settings?.logo} /></div>
        <div contentEditable={editMode} suppressContentEditableWarning data-pg-edit="school-name" style={{ ...(editMode ? editStyle : {}), fontSize: `${(half ? 15 : 19) * hFs}px`, fontWeight: 700, color: primary, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: def.fonts?.headline }}>{meta.name}</div>
        <div style={{ fontSize: `${9 * fs}px`, color: secondary, marginTop: 4 }}>{meta.address} · {meta.website} · {meta.contact}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
          <div style={{ flex: 1, height: 1, background: accent }} />
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: accent }} />
          <div style={{ flex: 1, height: 1, background: accent }} />
        </div>
      </div>
    )
  }

  if (variant === 'os') {
    return (
      <div style={{ marginBottom: `${8 * fs}px` }}>
        <div style={{ background: primary, borderRadius: `${6 * fs}px ${6 * fs}px 0 0`, padding: `${8 * fs}px ${10 * fs}px`, display: 'flex', gap: `${10 * fs}px`, alignItems: 'center' }}>
          <Logo size={logoSize - 4} src={settings?.logo} />
          {nameBlock}
        </div>
        <div style={{ background: `${accent}12`, border: `1px solid ${accent}33`, borderTop: 'none', borderRadius: `0 0 ${6 * fs}px ${6 * fs}px`, padding: `${4 * fs}px ${10 * fs}px`, fontSize: `${8 * fs}px`, color: secondary, display: 'flex', justifyContent: 'space-between' }}>
          <span>{meta.address}</span><span>{meta.website}</span><span>{meta.contact}</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: `${10 * fs}px`, marginBottom: `${8 * fs}px` }}>
      <Logo size={logoSize} src={settings?.logo} />
      {nameBlock}
    </div>
  )
}

function PremiumMeta({ layout, def, cfg, total, half, fs, isUrdu, editMode, editStyle }) {
  const { primary, secondary, accent, surface } = def.palette
  const rows = buildMetaRows(cfg, total, fs, isUrdu)

  if (layout === 'ledger') {
    return (
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: `${10 * fs}px`, fontSize: `${9 * fs}px` }}>
        <tbody>
          {rows.slice(0, 4).map(([l1, v1, l2, v2], ri) => (
            <tr key={ri}>
              {[l1, v1, l2, v2].map((cell, ci) => (
                <td key={ci} style={{ border: `1px solid ${primary}44`, padding: `${4 * fs}px ${6 * fs}px`, width: '25%', background: ci % 2 === 0 ? surface : '#fff' }}>
                  {ci % 2 === 0 ? <div style={{ color: primary, fontWeight: 700, fontSize: `${7 * fs}px`, textTransform: 'uppercase' }}>{cell}</div> : (cell ? <div style={{ fontWeight: 700 }}>{cell}</div> : blankLine(10 * fs))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  if (layout === 'chips') {
    const flat = rows.flatMap(([l1, v1, l2, v2]) => [{ l: l1, v: v1 }, { l: l2, v: v2 }]).slice(0, 10)
    return (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${half ? 2 : 3}, 1fr)`, gap: `${5 * fs}px`, marginBottom: `${10 * fs}px` }}>
        {flat.map(({ l, v }) => (
          <div key={l} style={{ background: surface, border: `1px solid ${secondary}`, borderRadius: 6, padding: `${5 * fs}px ${7 * fs}px` }}>
            <MetaField label={l} value={v} fs={fs} color={primary} editMode={editMode} editStyle={editStyle} />
          </div>
        ))}
      </div>
    )
  }

  if (layout === 'cards') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${6 * fs}px`, marginBottom: `${10 * fs}px` }}>
        <div style={{ border: `1px solid ${accent}44`, borderRadius: 8, padding: `${8 * fs}px`, background: '#fff' }}>
          <div style={{ fontSize: `${8 * fs}px`, color: accent, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>Student Profile</div>
          {rows.slice(0, 2).map(([l1, v1, l2, v2]) => (
            <div key={l1} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 6 }}>
              <MetaField label={l1} value={v1} fs={fs} color={secondary} />
              <MetaField label={l2} value={v2} fs={fs} color={secondary} />
            </div>
          ))}
        </div>
        <div style={{ border: `1px solid ${accent}44`, borderRadius: 8, padding: `${8 * fs}px`, background: '#fff' }}>
          <div style={{ fontSize: `${8 * fs}px`, color: accent, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>Exam Session</div>
          {rows.slice(2, 4).map(([l1, v1, l2, v2]) => (
            <div key={l1} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 6 }}>
              <MetaField label={l1} value={v1} fs={fs} color={secondary} />
              <MetaField label={l2} value={v2} fs={fs} color={secondary} />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <MetaField label={rows[4][0]} value={rows[4][1]} fs={fs} color={secondary} />
            <MetaField label={rows[4][2]} value={rows[4][3]} fs={fs} color={secondary} />
          </div>
        </div>
      </div>
    )
  }

  if (layout === 'underline') {
    return (
      <div style={{ marginBottom: `${10 * fs}px`, fontSize: `${10 * fs}px` }}>
        {rows.map(([l1, v1, l2, v2], i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${12 * fs}px`, marginBottom: `${6 * fs}px` }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
              <span style={{ color: primary, fontWeight: 700, minWidth: 88 }}>{l1}:</span>
              {v1 ? <strong>{v1}</strong> : <span style={{ flex: 1, borderBottom: `1px solid ${primary}55` }} />}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
              <span style={{ color: primary, fontWeight: 700, minWidth: 88 }}>{l2}:</span>
              {v2 ? <strong>{v2}</strong> : <span style={{ flex: 1, borderBottom: `1px solid ${primary}55` }} />}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${half ? 2 : 4}, 1fr)`, gap: `${5 * fs}px`, marginBottom: `${10 * fs}px`, padding: `${6 * fs}px`, background: surface, border: `1px solid ${primary}22` }}>
      {rows.flatMap(([l1, v1, l2, v2]) => [{ l: l1, v: v1 }, { l: l2, v: v2 }]).slice(0, 8).map(({ l, v }) => (
        <MetaField key={l} label={l} value={v} fs={fs} color={primary} editMode={editMode} editStyle={editStyle} />
      ))}
    </div>
  )
}

const VARIANT_MAP = {
  'premium-01-oxford-minimal': { header: 'oxford', meta: 'grid', divider: 'default' },
  'premium-02-cambridge-ledger': { header: 'ledger', meta: 'ledger', divider: 'ledger' },
  'premium-03-scholar-grid': { header: 'grid', meta: 'grid', divider: 'blueprint' },
  'premium-04-royal-crest': { header: 'royal', meta: 'grid', divider: 'gold' },
  'premium-05-editorial': { header: 'editorial', meta: 'underline', divider: 'editorial' },
  'premium-06-blueprint': { header: 'blueprint', meta: 'ledger', divider: 'blueprint' },
  'premium-07-institutional-seal': { header: 'seal', meta: 'underline', divider: 'default' },
  'premium-08-soft-modern': { header: 'soft', meta: 'chips', divider: 'pill' },
  'premium-09-prestige': { header: 'prestige', meta: 'grid', divider: 'gold' },
  'premium-10-future-academy': { header: 'os', meta: 'cards', divider: 'default' },
}

function createPremiumTemplate(def) {
  const variant = VARIANT_MAP[def.id] || { header: 'oxford', meta: 'grid', divider: 'default' }

  return function PremiumTemplate({
    paper, cfg, printBubble, printAns, half, editMode = false, letterSp = 0, engLineH = 1.5, urdLineH = 2.0,
    showAnsLines = false, fontColor = '#1a1a1a', fontFamily = '', baseFontSz = 11, headFontSz = 11,
    qBorderStyle = 'none', showUrduHeaders = false, showSectionLine = false, questionTypes = [], settings, pbStyle,
  }) {
    const total = calcPaperTotal(paper, questionTypes)
    const { primary, surface } = def.palette
    const { isUrdu, isDual, fs, hFs, bodyFont, wrap, qFs, qFsSm, qFsHead } = usePaperLayout({
      half, baseFontSz, headFontSz, fontFamily, templateDefaultFont: def.fonts?.body || 'Arial, sans-serif', fontColor, cfg, pbStyle, engLineH, urdLineH, letterSp,
    })
    const editStyle = editMode ? { outline: `1.5px dashed ${primary}`, borderRadius: 2, minWidth: 20, display: 'inline-block' } : {}
    const sectionProps = {
      paper, cfg, questionTypes, half, printBubble, printAns, editMode, editStyle, fs, qFs, qFsSm, qFsHead,
      qBorderStyle, urdLineH, engLineH, letterSp, showAnsLines, showUrduHeaders, showSectionLine,
      themeColor: primary, bodyFont, urduFont: resolveUrduFont(settings), isUrdu, isDual, sectionDivider: variant.divider,
    }

    return (
      <div {...editablePaperProps(editMode)} style={{ ...wrap, position: 'relative', background: surface || '#fff', fontFamily: bodyFont, ...paperTextFlow({ isUrdu, engLineH, urdLineH, letterSp }) }}>
        <div style={{ position: 'absolute', top: 6, right: 8, fontSize: 8, color: `${primary}55`, letterSpacing: '0.12em', fontWeight: 600 }}>{def.code}</div>
        <PremiumHeader variant={variant.header} def={def} settings={settings} cfg={cfg} total={total} half={half} fs={fs} hFs={hFs} bodyFont={bodyFont} editMode={editMode} editStyle={editStyle} isUrdu={isUrdu} />
        <PremiumMeta layout={variant.meta} def={def} cfg={cfg} total={total} half={half} fs={fs} isUrdu={isUrdu} editMode={editMode} editStyle={editStyle} />
        <div data-edit-guide style={{ border: editMode ? `2px dashed ${primary}` : 'none', padding: `${4 * fs}px 0`, position: 'relative' }}>
          {renderPaperSections(sectionProps)}
        </div>
      </div>
    )
  }
}

export const PREMIUM_TEMPLATE_COMPONENTS = Object.fromEntries(
  PREMIUM_TEMPLATES.map(def => [def.id, createPremiumTemplate(def)]),
)

export const PREMIUM_TEMPLATE_PICKER = PREMIUM_TEMPLATES.map(def => ({
  id: def.id,
  label: def.code,
  desc: def.name,
  category: 'premium',
  preview: getTemplatePreviewPath(def.id),
  thumb: {
    paper: def.palette.surface || '#fff',
    header: def.palette.primary,
    accent: def.palette.accent,
    logo: 'left',
    ...(PREMIUM_THUMB_PRESETS[def.id] || {}),
  },
}))
