'use client'
import Portal from '@/components/Portal'
import { PREMIUM_TEMPLATE_PICKER } from './templates/premium/PremiumTemplates'
import { CLASSIC_TEMPLATES } from './templatePickerData'

function TemplatePreviewCard({ template, active, onSelect, scale = 1.6 }) {
  const thumb = template.thumb || {}
  const paper = thumb.paper || '#fff'
  const header = thumb.header || '#1a237e'
  const accent = thumb.accent || '#1a237e'
  const logoPos = thumb.logo || 'center'
  const headerIsBand = thumb.headerBand && header !== paper
  const w = Math.round(56 * scale)
  const h = Math.round(72 * scale)

  return (
    <button
      type="button"
      onClick={() => onSelect(template.id)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 10,
        padding: 14,
        borderRadius: 14,
        cursor: 'pointer',
        border: `1px solid ${active ? 'rgba(200,153,26,0.65)' : 'rgba(148,163,184,0.2)'}`,
        background: active ? 'rgba(200,153,26,0.1)' : 'rgba(11,44,77,0.72)',
        textAlign: 'left',
        transition: 'transform 200ms cubic-bezier(0.22,1,0.36,1), box-shadow 200ms ease-out',
        transform: active ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: active ? '0 8px 24px rgba(200,153,26,0.2)' : 'none',
      }}
    >
      <div style={{
        width: w,
        height: h,
        background: paper,
        borderRadius: 8,
        overflow: 'hidden',
        border: thumb.frame ? `1px solid ${accent}55` : `1px solid ${accent}33`,
        position: 'relative',
        boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
        margin: '0 auto',
      }}>
        {template.preview ? (
          <img
            src={template.preview}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <>
        {thumb.grid && (
          <>
            <div style={{ position: 'absolute', top: 5, left: 5, width: 6, height: 6, borderTop: `1px solid ${accent}88`, borderLeft: `1px solid ${accent}88` }} />
            <div style={{ position: 'absolute', top: 5, right: 5, width: 6, height: 6, borderTop: `1px solid ${accent}88`, borderRight: `1px solid ${accent}88` }} />
          </>
        )}
        {headerIsBand ? (
          <div style={{ height: Math.round(16 * scale), background: header, display: 'flex', alignItems: 'center', padding: '0 6px', gap: 4 }}>
            {logoPos === 'left' && <div style={{ width: 10, height: 10, borderRadius: thumb.seal ? '50%' : 3, background: accent, opacity: 0.9 }} />}
            <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.55)', borderRadius: 2 }} />
          </div>
        ) : header !== paper && !thumb.masthead ? (
          <div style={{ height: 4, background: header, opacity: 0.9 }} />
        ) : null}
        {thumb.masthead && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 6px 0', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: accent, opacity: 0.85 }} />
            <div style={{ flex: 1, display: 'grid', gap: 3, marginTop: 2 }}>
              <div style={{ height: 3, background: header, borderRadius: 2 }} />
              <div style={{ height: 3, background: `${accent}44`, borderRadius: 2, width: '70%' }} />
            </div>
          </div>
        )}
        {logoPos === 'center' && <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}><div style={{ width: 14, height: 14, borderRadius: 3, background: accent, opacity: 0.85 }} /></div>}
        {logoPos === 'crest' && <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}><div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${accent}`, background: `${accent}22` }} /></div>}
        {thumb.goldRule && <div style={{ height: 2, background: '#c8991a', margin: '4px 6px 0', opacity: 0.85 }} />}
        <div style={{ padding: '6px 8px', display: 'grid', gap: 4, marginTop: 6 }}>
          <div style={{ height: 3, background: accent, opacity: 0.35, borderRadius: 2 }} />
          <div style={{ height: 3, background: `${accent}22`, borderRadius: 2, width: '85%' }} />
          <div style={{ height: 3, background: `${accent}22`, borderRadius: 2, width: '70%' }} />
          {thumb.card && <div style={{ height: 12, border: `1px solid ${accent}33`, borderRadius: 3, marginTop: 3 }} />}
        </div>
        {thumb.bar && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: accent }} />}
          </>
        )}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: active ? '#e8b420' : '#d8e2f0', lineHeight: 1.2 }}>{template.label}</div>
        <div style={{ fontSize: 12, color: '#8892A4', marginTop: 4, lineHeight: 1.5 }}>{template.desc || template.name}</div>
      </div>
    </button>
  )
}

export default function TemplateGalleryModal({ open, activeId, onClose, onSelect }) {
  if (!open) return null

  const groups = [
    { title: 'Classic Templates', items: CLASSIC_TEMPLATES },
    { title: 'Premium Institutional — 10 Designs', items: PREMIUM_TEMPLATE_PICKER, accent: true },
  ]

  return (
    <Portal>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Template gallery"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 12000,
          background: 'rgba(4,12,24,0.82)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: 'min(960px, 100%)',
            maxHeight: 'min(88vh, 900px)',
            overflow: 'auto',
            background: 'linear-gradient(180deg, rgba(11,44,77,0.98) 0%, rgba(7,30,52,0.98) 100%)',
            border: '1px solid rgba(148,163,184,0.22)',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8892A4' }}>A4 Print Templates</div>
              <h2 style={{ margin: '6px 0 0', fontSize: 24, fontWeight: 800, color: '#C8991A', letterSpacing: '-0.02em' }}>Template Gallery</h2>
              <p style={{ margin: '8px 0 0', color: '#94A3B8', fontSize: 14, lineHeight: 1.6, maxWidth: '52ch' }}>
                Browse all classic and premium institutional layouts. Click a design to apply it to your paper preview.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(148,163,184,0.2)',
                borderRadius: 10,
                color: '#C0C8D8',
                padding: '8px 14px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              Close
            </button>
          </div>

          {groups.map(group => (
            <div key={group.title} style={{ marginBottom: 24 }}>
              <div style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: group.accent ? '#C8991A' : '#8892A4',
                marginBottom: 12,
              }}>
                {group.title}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {group.items.map(t => (
                  <TemplatePreviewCard
                    key={t.id}
                    template={t}
                    active={activeId === t.id}
                    onSelect={id => { onSelect(id); onClose() }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Portal>
  )
}
