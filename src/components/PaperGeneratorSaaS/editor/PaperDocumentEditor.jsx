import { useEffect, useMemo, useState } from 'react'
import { classifyLegacyEditablePaper, legacyPaperToWorkingDocument, applyLegacyWorkingDocument } from './losslessLegacyBridge.mjs'
import RichTextField from './RichTextField'
import EditorCanvasShell from './EditorCanvasShell'
import { createPaperEditorExtensions, editorProseStyles } from './editorExtensions'
import { useEditor, EditorContent } from '@tiptap/react'
import { fetchPaperDeliveryManifest } from '../paperVaultService'

const D = {
  bg: '#f6f8fa',
  gold: '#0b2c4d',
  silver: '#284b62',
  muted: '#657d8d',
  border: '#d9e2e8',
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
  allowReorder = false,
  allowMarksEdit = true,
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
  useEffect(() => {
    if (!editor) return
    const incoming = block.contentHtml || '<p></p>'
    if (editor.getHTML() !== incoming) editor.commands.setContent(incoming, { emitUpdate: false })
  }, [editor, block.contentHtml])


  return (
    <article
      draggable={allowReorder}
      onDragStart={(e) => {
        if (!allowReorder) { e.preventDefault(); return }
        e.dataTransfer.setData('text/plain', block.id)
        e.dataTransfer.effectAllowed = 'move'
      }}
      onDragOver={(e) => {
        if (!allowReorder) return
        e.preventDefault()
        onReorder?.(block.id, 'over')
      }}
      onDrop={(e) => {
        if (!allowReorder) return
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
          title="Source order locked until canonical editing"
          style={{ cursor: 'default', color: '#94a3b8', fontSize: 16, lineHeight: 1, paddingTop: 2, userSelect: 'none' }}
          aria-hidden
        >
          •
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
              disabled={!allowMarksEdit}
              title={!allowMarksEdit ? 'Shared-category marks: edit through canonical editor when available' : undefined}
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
  onSaveWorkingDocument,
  saveRevision = null,
  saving = false,
  saveNotice = '',
  saveError = '',
  saveConflict = false,
  onReloadLatest,
  onLoadRevisionHistory,
  deliveryRevision = null,
  deliverySnapshotHash = '',
  paperSettings = {},
  language = 'english',
}) {
  const compatibility = useMemo(() => classifyLegacyEditablePaper(loadedPaper), [loadedPaper])
  const [doc, setDoc] = useState(() => compatibility.compatible ? legacyPaperToWorkingDocument(loadedPaper) : {meta: {},blocks: []})
  const [bridgeError, setBridgeError] = useState('')
  const [dirty,setDirty]=useState(false)
  const [historyOpen,setHistoryOpen]=useState(false)
  const [historyLoading,setHistoryLoading]=useState(false)
  const [historyError,setHistoryError]=useState('')
  const [historyData,setHistoryData]=useState(null)
  const [deliveryOpen,setDeliveryOpen]=useState(false)
  const [deliveryLoading,setDeliveryLoading]=useState(false)
  const [deliveryError,setDeliveryError]=useState('')
  const [deliveryData,setDeliveryData]=useState(null)
  const [activeBlockId, setActiveBlockId] = useState(doc.blocks?.[0]?.id || null)
  const [activeEditor, setActiveEditor] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [dragOverId, setDragOverId] = useState(null)
  const isDual = language === 'dual' || language === 'mixed'

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const persist = (nextDoc) => {
    if (!compatibility.compatible) return
    try {
      // Source paper is the immutable baseline; apply only representable edits.
      // All omitted questions, options, bilingual provenance and unknown fields survive.
      const nextPaper=applyLegacyWorkingDocument(nextDoc, loadedPaper)
      setBridgeError('')
      setDoc(nextDoc)
      setDirty(true)
      onPaperChange?.(nextPaper)
    } catch(err) {
      setBridgeError(err?.message || 'This change cannot be represented by the legacy paper format.')
    }
  }

  const onBlockChange = (id, patch) => {
    const next = {
      ...doc,
      blocks: (doc.blocks || []).map(b => b.id === id ? { ...b, ...patch } : b),
    }
    persist(next)
  }

  // Reordering is intentionally disabled until SaaS PaperDocument has explicit
  // ordering semantics. The old type-level numbering could silently corrupt it.
  const reorderBlocks = () => setBridgeError('Reordering requires the canonical PaperDocument editor.')
  const handleReorder = () => {}

  const handleExportDocx = () => setBridgeError('DOCX export is disabled in legacy compatibility mode pending canonical renderer parity.')

  const toggleHistory = async () => {
    if(historyOpen){setHistoryOpen(false);return}
    setHistoryOpen(true);setHistoryError('')
    if(!onLoadRevisionHistory)return
    setHistoryLoading(true)
    try{const data=await onLoadRevisionHistory();setHistoryData(data)}
    catch(err){setHistoryError(err?.message||'Revision history could not be loaded.')}
    finally{setHistoryLoading(false)}
  }

  const loadDeliveryManifest = async () => {
    if (!loadedPaper?.id || !deliveryRevision || !deliverySnapshotHash) {
      setDeliveryError('A verified saved revision is required before delivery can be evaluated.')
      return
    }
    setDeliveryLoading(true)
    setDeliveryError('')
    try {
      const manifest = await fetchPaperDeliveryManifest(loadedPaper.id, {
        revision: deliveryRevision,
        snapshotHash: deliverySnapshotHash,
      })
      setDeliveryData(manifest)
    } catch (error) {
      setDeliveryData(null)
      setDeliveryError(error?.response?.data?.message || error?.message || 'Delivery capability could not be verified.')
    } finally {
      setDeliveryLoading(false)
    }
  }

  const toggleDelivery = () => {
    const next = !deliveryOpen
    setDeliveryOpen(next)
    if (next && !deliveryData && !deliveryLoading) loadDeliveryManifest()
  }

  useEffect(() => {
    setDeliveryData(null)
    setDeliveryError('')
    setDeliveryOpen(false)
  }, [deliveryRevision, deliverySnapshotHash, loadedPaper?.id])

  const meta = doc.meta || {}
  if (!compatibility.compatible) return (
    <section className="ps6-compatibility-gate" role="status" style={{padding:28,border:'1px solid #ccd8e0',borderRadius:16,background:'#f8fafb',color:'#17354a'}}>
      <h2 style={{fontSize:19,fontWeight:700}}>Canonical editor handoff required</h2>
      <p style={{margin:'10px 0',fontSize:13,lineHeight:1.65}}>This source format is not safe to flatten into the legacy Pro Editor: {compatibility.reason}. Your original paper has not been changed.</p>
      {onReturnToSource && <button type="button" onClick={onReturnToSource} style={{padding:'10px 15px',borderRadius:10,background:'#0b2c4d',color:'#fff'}}>Return to paper workspace</button>}
    </section>
  )

  const typeCounts = (doc.blocks || []).reduce((acc,b)=>{acc[b.sourceType]=(acc[b.sourceType]||0)+1;return acc},{})
  return (
    <div style={{ minHeight: '100vh', background: D.bg, color: D.silver, display: 'flex', flexDirection: 'column' }}>
      <style>{editorProseStyles}</style>
      <header style={{ padding: '14px 18px', borderBottom: `1px solid ${D.border}`, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(180deg,#fff,#f5f8fa)' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: D.gold }}>Paper Studio Pro</div>
          <div style={{ fontSize: 12, color: D.muted, marginTop: 4 }}>V6-C protected legacy edit · source-preserving · canonical renderer pending</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {onSaveWorkingDocument&&<button type="button" onClick={()=>onSaveWorkingDocument(doc)} disabled={!dirty||saving||saveConflict} aria-label="Save changes" style={{padding:'10px 16px',borderRadius:10,border:'1px solid #0b2c4d',background:dirty&&!saving&&!saveConflict?'#0b2c4d':'#e7edf2',color:dirty&&!saving&&!saveConflict?'#fff':'#7b8c98',fontWeight:750,cursor:dirty&&!saving&&!saveConflict?'pointer':'not-allowed'}}>{saving?'Saving…':`Save changes${saveRevision?` · Rev ${saveRevision}`:''}`}</button>}
          {loadedPaper?.id&&<button type="button" onClick={toggleDelivery} aria-expanded={deliveryOpen} style={{padding:'10px 14px',borderRadius:10,border:`1px solid ${D.border}`,background:deliveryOpen?'#e8eef3':'#fff',color:'#284b62',fontWeight:700,cursor:'pointer'}}>Delivery Center</button>}
          {onLoadRevisionHistory&&<button type="button" onClick={toggleHistory} aria-expanded={historyOpen} style={{padding:'10px 14px',borderRadius:10,border:`1px solid ${D.border}`,background:historyOpen?'#e8eef3':'#fff',color:'#284b62',fontWeight:700,cursor:'pointer'}}>Revision history</button>}
          <button type="button" disabled title="Canonical print parity is pending for this compatibility document" onClick={() => setBridgeError('Use validated canonical renderer for printing. Legacy Pro direct print is disabled to avoid missing questions.')} style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(200,153,26,0.45)', background: 'rgba(200,153,26,0.14)', color: D.gold, cursor: 'pointer', fontWeight: 700 }}>
            Print
          </button>
          <button type="button" disabled title="Canonical DOCX export parity is pending" onClick={handleExportDocx} style={{ padding: '10px 16px', borderRadius: 10, border: `1px solid ${D.border}`, background: '#edf2f6', color: D.silver, cursor: 'not-allowed', fontWeight: 600, opacity: 0.55 }}>
            Export DOCX (pending parity)
          </button>
          {onOpenPrintPreview && (
            <button type="button" onClick={() => { try { onOpenPrintPreview(applyLegacyWorkingDocument(doc, loadedPaper)) } catch(err) { setBridgeError(err.message) } }} style={{ padding: '10px 16px', borderRadius: 10, border: `1px solid ${D.border}`, background: '#edf2f6', color: D.silver, cursor: 'pointer', fontWeight: 600 }}>
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

      {saveNotice&&<div role="status" style={{padding:'10px 18px',background:'#edf7f0',color:'#23543d',borderBottom:'1px solid #c5dfcd',fontSize:12}}>{saveNotice}</div>}
      {saveError&&<div role="alert" style={{display:'flex',alignItems:'center',flexWrap:'wrap',gap:10,padding:'10px 18px',background:'#fff0ea',color:'#8c3d24',borderBottom:'1px solid #edc7b8',fontSize:12}}><span>{saveError}</span>{saveConflict&&onReloadLatest&&<button type="button" onClick={onReloadLatest} style={{padding:'7px 10px',borderRadius:8,background:'#fff',border:'1px solid #d6a18d',fontWeight:700}}>Reload latest (discard local edits)</button>}</div>}
      {deliveryOpen&&<section aria-label="Revision delivery center" style={{padding:'13px 18px',borderBottom:`1px solid ${D.border}`,background:'#f7f9fb'}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',marginBottom:9}}>
          <div><strong style={{fontSize:12,color:'#17354a'}}>Revision-bound Delivery Center</strong><div style={{fontSize:10,color:D.muted,marginTop:2}}>Every channel is evaluated against revision {deliveryRevision || '—'} and its verified snapshot hash.</div></div>
          <button type="button" disabled={deliveryLoading} onClick={loadDeliveryManifest} style={{padding:'7px 10px',borderRadius:8,border:`1px solid ${D.border}`,background:'#fff',fontSize:10,fontWeight:700,color:D.silver,cursor:deliveryLoading?'wait':'pointer'}}>{deliveryLoading?'Verifying…':'Recheck'}</button>
        </div>
        {deliveryError&&<div role="alert" style={{padding:'9px 10px',border:'1px solid #ecc7b6',borderRadius:9,background:'#fff1eb',color:'#813b18',fontSize:10}}>{deliveryError}</div>}
        {!deliveryError&&deliveryLoading&&<div role="status" style={{fontSize:10,color:D.muted}}>Verifying immutable revision and output capabilities…</div>}
        {deliveryData&&<div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:9}}>
            <span style={{padding:'5px 8px',borderRadius:999,background:'#e8eef3',color:'#0b2c4d',fontSize:9,fontWeight:800}}>Rev {deliveryData.revision}</span>
            <span style={{padding:'5px 8px',borderRadius:999,background:deliveryData.isCurrent?'#e4f3ed':'#f3eee2',color:deliveryData.isCurrent?'#1e6b4f':'#7a6330',fontSize:9,fontWeight:800}}>{deliveryData.isCurrent?'Current revision':'Historical revision'}</span>
            <span title={deliveryData.deliveryKey} style={{padding:'5px 8px',borderRadius:999,background:'#f0f2f4',color:'#617482',fontSize:9}}>Key {String(deliveryData.deliveryKey||'').slice(0,10)}…</span>
          </div>
          {deliveryData.nativePresentation&&<div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) auto',gap:10,alignItems:'center',marginBottom:9,padding:'9px 10px',border:'1px solid #d8e2e8',borderRadius:10,background:'#fbfcfd'}}>
            <div><strong style={{display:'block',fontSize:9,color:'#294a60',letterSpacing:'.08em'}}>SOURCE-NATIVE RENDER POLICY</strong><span style={{display:'block',marginTop:3,fontSize:9,color:'#6b7f8d',lineHeight:1.45}}>{deliveryData.nativePresentation.renderer||'Native renderer'} · {String(deliveryData.nativePresentation.renderPolicy||'').replaceAll('_',' ')}</span></div>
            <span style={{padding:'5px 8px',borderRadius:999,background:deliveryData.nativePresentation.cutoverReady?'#e4f3ed':'#f3eee2',color:deliveryData.nativePresentation.cutoverReady?'#1e6b4f':'#7a6330',fontSize:8,fontWeight:850}}>{deliveryData.nativePresentation.cutoverReady?'GOLDEN APPROVED':'GOLDEN APPROVAL PENDING'}</span>
          </div>}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:8}}>
            {[['Preview','preview'],['Print','print'],['PDF','pdf'],['Word','word'],['Online Test','onlineTest']].map(([label,key])=>{const channel=deliveryData.channels?.[key]||{};const available=String(channel.state||'').startsWith('available');return <div key={key} style={{padding:'10px 11px',border:'1px solid #dce4e9',borderRadius:10,background:'#fff'}}><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}><strong style={{fontSize:10,color:'#25475d'}}>{label}</strong><span style={{fontSize:8,fontWeight:850,letterSpacing:'.08em',color:available?'#247054':'#9a5537'}}>{available?'AVAILABLE':'BLOCKED'}</span></div><div style={{fontSize:9,color:'#748692',lineHeight:1.45,marginTop:5}}>{channel.reason?String(channel.reason).replaceAll('_',' '):available?'Verified compatibility preview for this exact revision.':'Not available for this revision.'}</div>{key==='onlineTest'&&channel.content&&<div style={{fontSize:8,color:'#647986',marginTop:5}}>{channel.content.totalQuestions} questions · {channel.content.autoGradableQuestions} auto · {channel.content.manualReviewQuestions} manual · {channel.content.unsupportedQuestions} unsupported</div>}</div>})}
          </div>
          <div style={{marginTop:9,fontSize:9,color:'#70828f'}}>This panel does not grant canonical print or publish authority. Blocked channels stay disabled until the shared SaaS renderer/delivery adapter is independently verified.</div>
        </div>}
      </section>}
      {historyOpen&&<section aria-label="Revision history" style={{padding:'12px 18px',background:'#f8fafb',borderBottom:`1px solid ${D.border}`}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',marginBottom:8}}><strong style={{fontSize:12,color:'#17354a'}}>Immutable revision history</strong>{historyData?.currentRevision&&<small style={{color:D.muted}}>Current revision {historyData.currentRevision}</small>}</div>
        {historyLoading&&<div role="status" style={{fontSize:11,color:D.muted}}>Loading verified history…</div>}
        {historyError&&<div role="alert" style={{fontSize:11,color:'#8c3d24'}}>{historyError}</div>}
        {!historyLoading&&!historyError&&historyData&&<div style={{display:'grid',gap:6}}>{(historyData.history||[]).length?(historyData.history||[]).map(item=><div key={item.revision} style={{display:'grid',gridTemplateColumns:'70px minmax(0,1fr) auto',gap:10,alignItems:'center',padding:'8px 10px',border:'1px solid #dfe6eb',borderRadius:9,background:'#fff'}}><strong style={{fontSize:11,color:'#0b2c4d'}}>Rev {item.revision}</strong><span style={{fontSize:10,color:'#5f7584'}}>{item.event==='baseline_capture'?'Original captured snapshot':'Protected teacher edit'}{item.actorUserId?` · actor ${item.actorUserId}`:''}</span><time style={{fontSize:9,color:'#7b8d99'}}>{item.createdAt?new Date(item.createdAt).toLocaleString():''}</time></div>):<div style={{fontSize:11,color:D.muted}}>No revision journal entries yet. The first successful edit captures the baseline and new revision atomically.</div>}</div>}
      </section>}
      {bridgeError && <div role="alert" style={{padding:'12px 18px',background:'#fff2e7',color:'#813b18',borderBottom:'1px solid #ebc6ac',fontSize:12}}>{bridgeError}</div>}
      {!isMobile && activeEditor && <div style={{ padding:'9px 18px',fontSize:11,color:D.silver,borderBottom:`1px solid ${D.border}` }}>Plain bilingual question editing is enabled. Rich formatting requires the canonical renderer.</div>}

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '280px 1fr', gap: 0, minHeight: 0 }}>
        {!isMobile && (
          <aside style={{ borderRight: `1px solid ${D.border}`, padding: 16, overflowY: 'auto', background: '#edf2f6' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: D.muted, marginBottom: 10 }}>Document</div>
            <input
              value={meta.schoolName || ''}
              readOnly title="School identity is protected by SaaS"
              placeholder="School name"
              style={{ width: '100%', marginBottom: 8, padding: '8px 10px', borderRadius: 8, border: `1px solid ${D.border}`, background: '#fff', color: D.silver }}
            />
            <input
              value={meta.subject || ''}
              readOnly title="Subject follows the signed teacher assignment"
              placeholder="Subject"
              style={{ width: '100%', marginBottom: 8, padding: '8px 10px', borderRadius: 8, border: `1px solid ${D.border}`, background: '#fff', color: D.silver }}
            />
            <input
              value={meta.classLevel || ''}
              readOnly title="Class follows the signed teacher assignment"
              placeholder="Class"
              style={{ width: '100%', marginBottom: 8, padding: '8px 10px', borderRadius: 8, border: `1px solid ${D.border}`, background: '#fff', color: D.silver }}
            />
            <input
              value={meta.address || ''}
              readOnly title="School address is protected by SaaS"
              placeholder="School address"
              style={{ width: '100%', marginBottom: 8, padding: '8px 10px', borderRadius: 8, border: `1px solid ${D.border}`, background: '#fff', color: D.silver }}
            />
            <div style={{ fontSize: 11, color: D.muted, margin: '12px 0 8px' }}>Source question order (locked for compatibility)</div>
            <div style={{ display: 'grid', gap: 6 }}>
              {(doc.blocks || []).map(b => (
                <button
                  key={b.id}
                  type="button"
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => e.preventDefault()}
                  onClick={() => setActiveBlockId(b.id)}
                  style={{
                    textAlign: 'left',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: `1px solid ${activeBlockId === b.id ? 'rgba(200,153,26,0.5)' : dragOverId === b.id ? 'rgba(10,132,255,0.45)' : D.border}`,
                    background: activeBlockId === b.id ? 'rgba(200,153,26,0.12)' : 'rgba(7,22,40,0.5)',
                    color: activeBlockId === b.id ? D.gold : D.silver,
                    cursor: 'default',
                    fontSize: 13,
                  }}
                >
                  Q{b.questionNo} · {b.marks}m
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
                    allowReorder={false}
                    allowMarksEdit={block.marksScope==='item'||typeCounts[block.sourceType]===1}
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
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, padding: '8px 10px calc(8px + env(safe-area-inset-bottom))', background: '#f8fafb', borderTop: `1px solid ${D.border}` }}>
          <span style={{fontSize:11,color:D.silver}}>Plain-text compatibility mode · rich formatting pending canonical renderer</span>
        </div>
      )}
    </div>
  )
}
