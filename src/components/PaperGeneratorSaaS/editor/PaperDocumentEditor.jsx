import { useEffect, useMemo, useState } from 'react'
import { paperToDocument, documentToPaper } from './documentAdapters'
import RichTextField from './RichTextField'
import EditorRibbon from './EditorRibbon'
import EditorCanvasShell from './EditorCanvasShell'
import { printProDocument, exportProDocumentAsDocx } from './proExportUtils'
import { exportProDocumentAsRealDocx } from './proDocxExport'
import { createPaperEditorExtensions, editorProseStyles } from './editorExtensions'
import { useEditor, EditorContent } from '@tiptap/react'

const D = {
  bg: '#071e34',
  gold: '#C8991A',
  silver: '#C0C8D8',
  muted: '#8892A4',
  border: 'rgba(148,163,184,0.18)',
}

function BlockEditor({
  block,
  onBlockChange,
  isDual,
  activeBlockId,
  setActiveBlockId,
  setActiveEditor,
  onReorder,
  dragOverId,
}) {
  const isActive = activeBlockId === block.id
  const isDragTarget = dragOverId === block.id
  const extensions = useMemo(() => createPaperEditorExtensions('Question body…'), [])

  const editor = useEditor({
    extensions,
    content: block.contentHtml || '<p></p>',
    editorProps: {
      attributes: {
        class: 'pg-block-body',
        style: 'min-height:80px;outline:none;line-height:1.65;color:#1a1a1a;',
      },
    },
    onFocus: () => {
      setActiveBlockId(block.id)
      setActiveEditor(editor)
    },
    onUpdate: ({ editor: ed }) => {
      onBlockChange(block.id, { contentHtml: ed.getHTML() })
    },
  })

  useEffect(() => {
    if (isActive && editor) setActiveEditor(editor)
  }, [isActive, editor, setActiveEditor])

  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', block.id)
        e.dataTransfer.effectAllowed = 'move'
      }}
      onDragOver={(e) => {
        e.preventDefault()
        onReorder?.(block.id, 'over')
      }}
      onDrop={(e) => {
        e.preventDefault()
        const fromId = e.dataTransfer.getData('text/plain')
        onReorder?.(fromId, block.id)
      }}
      style={{
        background: '#fff',
        borderRadius: 12,
        border: `1px solid ${isActive ? 'rgba(200,153,26,0.45)' : isDragTarget ? 'rgba(10,132,255,0.45)' : 'rgba(26,35,126,0.15)'}`,
        padding: '16px 18px',
        boxShadow: isActive ? '0 8px 24px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'border-color 150ms ease-out, box-shadow 150ms ease-out',
      }}
      onClick={() => { setActiveBlockId(block.id); if (editor) setActiveEditor(editor) }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
        <div
          title="Drag to reorder"
          style={{ cursor: 'grab', color: '#94a3b8', fontSize: 16, lineHeight: 1, paddingTop: 2, userSelect: 'none' }}
          aria-hidden
        >
          ⋮⋮
        </div>
        <header style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, borderBottom: '2px solid #1a237e', paddingBottom: 8 }}>
          <input
            value={block.label || ''}
            onChange={e => onBlockChange(block.id, { label: e.target.value })}
            style={{ flex: 1, border: 'none', outline: 'none', fontWeight: 800, fontSize: 14, color: '#333', background: 'transparent' }}
            aria-label={`Question ${block.questionNo} label`}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#1a237e', fontWeight: 700 }}>
            Marks
            <input
              type="number"
              min={0}
              value={block.marks}
              onChange={e => onBlockChange(block.id, { marks: Number(e.target.value) || 0 })}
              style={{ width: 52, padding: '4px 6px', borderRadius: 8, border: '1px solid rgba(26,35,126,0.25)' }}
            />
          </label>
        </header>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#1a237e', marginBottom: 6 }}>Q{block.questionNo}.</div>
      {isDual ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'start' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#64748b', marginBottom: 6 }}>English</div>
            <div style={{ border: '1px solid rgba(148,163,184,0.22)', borderRadius: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.98)', minHeight: 96 }}>
              <EditorContent editor={editor} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#64748b', marginBottom: 6 }}>اردو</div>
            <RichTextField
              value={block.contentUrduHtml}
              onChange={html => onBlockChange(block.id, { contentUrduHtml: html })}
              placeholder="اردو متن"
              direction="rtl"
              minHeight={96}
            />
          </div>
        </div>
      ) : (
        <div style={{ border: '1px solid rgba(148,163,184,0.22)', borderRadius: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.98)' }}>
          <EditorContent editor={editor} />
        </div>
      )}
    </article>
  )
}

export default function PaperDocumentEditor({
  loadedPaper,
  onPaperChange,
  onReturnToSource,
  onOpenPrintPreview,
  paperSettings = {},
  language = 'english',
}) {
  const [doc, setDoc] = useState(() => paperToDocument(loadedPaper || {}))
  const [activeBlockId, setActiveBlockId] = useState(doc.blocks?.[0]?.id || null)
  const [activeEditor, setActiveEditor] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [dragOverId, setDragOverId] = useState(null)
  const [exporting, setExporting] = useState(false)
  const isDual = language === 'dual' || language === 'mixed'

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const persist = (nextDoc) => {
    setDoc(nextDoc)
    onPaperChange?.(documentToPaper(nextDoc, loadedPaper || {}))
  }

  const onBlockChange = (id, patch) => {
    const next = {
      ...doc,
      blocks: (doc.blocks || []).map(b => b.id === id ? { ...b, ...patch } : b),
    }
    persist(next)
  }

  const reorderBlocks = (fromId, toId) => {
    setDragOverId(null)
    if (!fromId || !toId || fromId === toId) return
    const blocks = [...(doc.blocks || [])]
    const fromIdx = blocks.findIndex(b => b.id === fromId)
    const toIdx = blocks.findIndex(b => b.id === toId)
    if (fromIdx < 0 || toIdx < 0) return
    const [moved] = blocks.splice(fromIdx, 1)
    blocks.splice(toIdx, 0, moved)
    const renumbered = blocks.map((b, i) => ({ ...b, questionNo: i + 1 }))
    persist({ ...doc, blocks: renumbered })
  }

  const handleReorder = (a, b) => {
    if (b === 'over') {
      setDragOverId(a)
      return
    }
    reorderBlocks(a, b)
  }

  const handleExportDocx = async () => {
    setExporting(true)
    try {
      await exportProDocumentAsRealDocx(doc, paperSettings, loadedPaper)
    } catch (error) {
      console.warn('Real DOCX export failed, using HTML fallback:', error)
      exportProDocumentAsDocx(doc, paperSettings, loadedPaper)
    } finally {
      setExporting(false)
    }
  }

  const meta = doc.meta || {}

  return (
    <div style={{ minHeight: '100vh', background: D.bg, color: D.silver, display: 'flex', flexDirection: 'column' }}>
      <style>{editorProseStyles}</style>
      <header style={{ padding: '14px 18px', borderBottom: `1px solid ${D.border}`, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', background: 'rgba(7,22,40,0.96)' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: D.gold }}>Paper Studio Pro</div>
          <div style={{ fontSize: 12, color: D.muted, marginTop: 4 }}>Tables · images · drag reorder · real DOCX · bilingual columns</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" onClick={() => printProDocument(doc, paperSettings, loadedPaper)} style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(200,153,26,0.45)', background: 'rgba(200,153,26,0.14)', color: D.gold, cursor: 'pointer', fontWeight: 700 }}>
            Print
          </button>
          <button type="button" disabled={exporting} onClick={handleExportDocx} style={{ padding: '10px 16px', borderRadius: 10, border: `1px solid ${D.border}`, background: 'rgba(11,44,77,0.55)', color: D.silver, cursor: exporting ? 'wait' : 'pointer', fontWeight: 600, opacity: exporting ? 0.7 : 1 }}>
            {exporting ? 'Exporting…' : 'Export DOCX'}
          </button>
          {onOpenPrintPreview && (
            <button type="button" onClick={() => onOpenPrintPreview(documentToPaper(doc, loadedPaper || {}))} style={{ padding: '10px 16px', borderRadius: 10, border: `1px solid ${D.border}`, background: 'rgba(11,44,77,0.55)', color: D.silver, cursor: 'pointer', fontWeight: 600 }}>
              Template Preview
            </button>
          )}
          {onReturnToSource && (
            <button type="button" onClick={onReturnToSource} style={{ padding: '10px 16px', borderRadius: 10, border: `1px solid ${D.border}`, background: 'transparent', color: D.silver, cursor: 'pointer', fontWeight: 600 }}>
              ← Back to Builder
            </button>
          )}
        </div>
      </header>

      {!isMobile && activeEditor && (
        <div style={{ padding: '10px 18px', borderBottom: `1px solid ${D.border}` }}>
          <EditorRibbon editor={activeEditor} />
        </div>
      )}

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '280px 1fr', gap: 0, minHeight: 0 }}>
        {!isMobile && (
          <aside style={{ borderRight: `1px solid ${D.border}`, padding: 16, overflowY: 'auto', background: 'rgba(11,44,77,0.35)' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: D.muted, marginBottom: 10 }}>Document</div>
            <input
              value={meta.schoolName || ''}
              onChange={e => persist({ ...doc, meta: { ...meta, schoolName: e.target.value } })}
              placeholder="School name"
              style={{ width: '100%', marginBottom: 8, padding: '8px 10px', borderRadius: 8, border: `1px solid ${D.border}`, background: 'rgba(7,22,40,0.6)', color: D.silver }}
            />
            <input
              value={meta.subject || ''}
              onChange={e => persist({ ...doc, meta: { ...meta, subject: e.target.value } })}
              placeholder="Subject"
              style={{ width: '100%', marginBottom: 8, padding: '8px 10px', borderRadius: 8, border: `1px solid ${D.border}`, background: 'rgba(7,22,40,0.6)', color: D.silver }}
            />
            <input
              value={meta.classLevel || ''}
              onChange={e => persist({ ...doc, meta: { ...meta, classLevel: e.target.value } })}
              placeholder="Class"
              style={{ width: '100%', marginBottom: 8, padding: '8px 10px', borderRadius: 8, border: `1px solid ${D.border}`, background: 'rgba(7,22,40,0.6)', color: D.silver }}
            />
            <input
              value={meta.address || ''}
              onChange={e => persist({ ...doc, meta: { ...meta, address: e.target.value } })}
              placeholder="School address"
              style={{ width: '100%', marginBottom: 8, padding: '8px 10px', borderRadius: 8, border: `1px solid ${D.border}`, background: 'rgba(7,22,40,0.6)', color: D.silver }}
            />
            <div style={{ fontSize: 11, color: D.muted, margin: '12px 0 8px' }}>Drag questions to reorder</div>
            <div style={{ display: 'grid', gap: 6 }}>
              {(doc.blocks || []).map(b => (
                <button
                  key={b.id}
                  type="button"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', b.id)}
                  onDragOver={(e) => { e.preventDefault(); setDragOverId(b.id) }}
                  onDrop={(e) => {
                    e.preventDefault()
                    reorderBlocks(e.dataTransfer.getData('text/plain'), b.id)
                  }}
                  onClick={() => setActiveBlockId(b.id)}
                  style={{
                    textAlign: 'left',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: `1px solid ${activeBlockId === b.id ? 'rgba(200,153,26,0.5)' : dragOverId === b.id ? 'rgba(10,132,255,0.45)' : D.border}`,
                    background: activeBlockId === b.id ? 'rgba(200,153,26,0.12)' : 'rgba(7,22,40,0.5)',
                    color: activeBlockId === b.id ? D.gold : D.silver,
                    cursor: 'grab',
                    fontSize: 13,
                  }}
                >
                  ⋮⋮ Q{b.questionNo} · {b.marks}m
                </button>
              ))}
            </div>
          </aside>
        )}

        <main style={{ padding: isMobile ? 12 : 20, overflowY: 'auto', paddingBottom: isMobile ? 88 : 20 }}>
          <EditorCanvasShell>
            <div style={{ width: 794, minHeight: 1123, background: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.35)', padding: '32px 40px', boxSizing: 'border-box' }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: '0.04em', color: '#1a237e' }}>{(meta.schoolName || 'SCHOOL NAME').toUpperCase()}</div>
                {meta.address && <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{meta.address}</div>}
                <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>{meta.classLevel} · {meta.subject}</div>
              </div>
              <div style={{ display: 'grid', gap: 20 }}>
                {(doc.blocks || []).map(block => (
                  <BlockEditor
                    key={block.id}
                    block={block}
                    isDual={isDual}
                    activeBlockId={activeBlockId}
                    setActiveBlockId={setActiveBlockId}
                    setActiveEditor={setActiveEditor}
                    onBlockChange={onBlockChange}
                    onReorder={handleReorder}
                    dragOverId={dragOverId}
                  />
                ))}
                {!doc.blocks?.length && (
                  <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>No questions in this paper yet. Build from Smart Paste first.</div>
                )}
              </div>
            </div>
          </EditorCanvasShell>
        </main>
      </div>

      {isMobile && activeEditor && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, padding: '8px 10px calc(8px + env(safe-area-inset-bottom))', background: 'rgba(7,22,40,0.98)', borderTop: `1px solid ${D.border}` }}>
          <EditorRibbon editor={activeEditor} compact />
        </div>
      )}
    </div>
  )
}
