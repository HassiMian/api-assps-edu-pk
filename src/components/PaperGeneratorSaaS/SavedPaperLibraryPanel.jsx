import { useMemo, useState } from 'react'
import { usePaperStore } from './usePaperStore'
import {
  filterSavedPapers,
  getSavedPaperStats,
  isUnifiedSavedPaper,
  printSavedPapers,
} from './savedPaperUtils'
import { exportPaperAsDocx, printAnswerKeyDocument, printMarkingSchemeDocument, sharePaperViaWhatsApp } from './paperExportUtils'

const C = {
  card: 'rgba(11,44,77,0.92)',
  gold: '#C8991A',
  goldL: '#e8b420',
  silver: '#C0C8D8',
  muted: '#8892A4',
  green: '#30D158',
  red: '#FF375F',
  border: 'rgba(148,163,184,0.18)',
}

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function SavedPaperLibraryPanel({
  onLoadPaper,
  sourceFilter = 'all',
  title = 'Saved Papers',
  subtitle = 'Search, reopen, or bulk print saved papers.',
  showBulkActions = true,
  deliveryGoverned = false,
}) {
  const { savedPapers, deleteSavedPaper, renameSavedPaper, paperSettings } = usePaperStore()
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [renaming, setRenaming] = useState(null)
  const [renameVal, setRenameVal] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [vaultError, setVaultError] = useState('')
  const [mutating, setMutating] = useState(false)

  const classOptions = useMemo(() => [...new Set(savedPapers.map(p => p.config?.classLevel || p.config?.className).filter(Boolean))].sort(), [savedPapers])
  const subjectOptions = useMemo(() => [...new Set(savedPapers.map(p => p.config?.subject || p.config?.subjectName).filter(Boolean))].sort(), [savedPapers])

  const filtered = useMemo(() => filterSavedPapers(savedPapers, {
    search,
    source: sourceFilter,
    classLevel: classFilter,
    subject: subjectFilter,
  }), [savedPapers, search, sourceFilter, classFilter, subjectFilter])

  const selectedPapers = filtered.filter(paper => selectedIds.has(paper.id))

  function toggleSelected(id) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(filtered.map(paper => paper.id)))
  }

  function startRename(paper) {
    setRenaming(paper.id)
    setRenameVal(paper.name)
  }

  async function submitRename() {
    if (!renameVal.trim()) return setRenaming(null)
    setMutating(true); setVaultError('')
    try { await renameSavedPaper(renaming, renameVal.trim()); setRenaming(null) }
    catch (err) { setVaultError(err?.message || 'Paper rename failed.') }
    finally { setMutating(false) }
  }

  function handleBulkPrint() {
    if (!selectedPapers.length) return
    printSavedPapers(selectedPapers, paperSettings)
  }

  async function handleBulkDelete() {
    if (!selectedPapers.length || mutating) return
    setMutating(true); setVaultError('')
    try {
      for (const paper of selectedPapers) await deleteSavedPaper(paper.id)
      setSelectedIds(new Set())
    } catch (err) {
      setVaultError(err?.message || 'One or more papers could not be deleted.')
    } finally { setMutating(false) }
  }

  return (
    <div>
      {vaultError && <div role="alert" style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 12, background: '#fff1f0', border: '1px solid #efc8c3', color: '#8f342d', fontSize: 12, fontWeight: 700 }}>{vaultError}</div>}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: '18px 24px', marginBottom: 20, display: 'grid', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 20 }}>{title}</div>
            <div style={{ color: C.muted, fontSize: 13 }}>{subtitle}</div>
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, subject, class, assessment..."
            style={{ background: 'rgba(11,44,77,0.6)', border: `1px solid ${C.border}`, borderRadius: 12, color: C.silver, padding: '10px 16px', fontSize: 13, outline: 'none', width: 260 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={classFilter} onChange={e => setClassFilter(e.target.value)} style={{ background: 'rgba(11,44,77,0.6)', border: `1px solid ${C.border}`, borderRadius: 10, color: C.silver, padding: '8px 12px', fontSize: 12 }}>
            <option value="">All classes</option>
            {classOptions.map(item => <option key={item} value={item}>Class {item}</option>)}
          </select>
          <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} style={{ background: 'rgba(11,44,77,0.6)', border: `1px solid ${C.border}`, borderRadius: 10, color: C.silver, padding: '8px 12px', fontSize: 12 }}>
            <option value="">All subjects</option>
            {subjectOptions.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
          <span style={{ color: C.muted, fontSize: 12 }}>{filtered.length} of {savedPapers.length} papers</span>
          {showBulkActions && !deliveryGoverned && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={toggleSelectAll} style={{ background: 'rgba(15,23,42,0.46)', border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 12px', color: C.silver, fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>
                {selectedIds.size === filtered.length && filtered.length ? 'Clear selection' : 'Select all'}
              </button>
              <button onClick={handleBulkPrint} disabled={!selectedPapers.length} style={{ background: selectedPapers.length ? `linear-gradient(135deg, ${C.gold}, ${C.goldL})` : 'rgba(15,23,42,0.46)', border: 'none', borderRadius: 10, padding: '8px 14px', color: selectedPapers.length ? '#071e34' : C.muted, fontWeight: 700, cursor: selectedPapers.length ? 'pointer' : 'not-allowed', fontSize: 12 }}>
                Bulk Print ({selectedPapers.length})
              </button>
              <button onClick={handleBulkDelete} disabled={!selectedPapers.length} style={{ background: 'rgba(255,55,95,0.12)', border: '1px solid rgba(255,55,95,0.25)', borderRadius: 10, padding: '8px 14px', color: C.red, fontWeight: 700, cursor: selectedPapers.length ? 'pointer' : 'not-allowed', fontSize: 12 }}>
                Delete selected
              </button>
            </div>
          )}
        </div>
      </div>

      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#071e34', border: `1px solid ${C.border}`, borderRadius: 18, padding: 28, width: 360, textAlign: 'center' }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Delete Paper?</div>
            <div style={{ color: C.muted, fontSize: 13, marginBottom: 24 }}>"{confirmDelete.name}" will be permanently deleted.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, background: 'rgba(15,23,42,0.46)', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 0', color: C.silver, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button disabled={mutating} onClick={async () => { setMutating(true); setVaultError(''); try { await deleteSavedPaper(confirmDelete.id); setConfirmDelete(null); setSelectedIds(prev => { const next = new Set(prev); next.delete(confirmDelete.id); return next }) } catch (err) { setVaultError(err?.message || 'Paper could not be deleted.'); setConfirmDelete(null) } finally { setMutating(false) } }} style={{ flex: 1, background: 'rgba(255,55,95,0.2)', border: '1px solid rgba(255,55,95,0.4)', borderRadius: 10, padding: '10px 0', color: C.red, fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 60, textAlign: 'center' }}>
          <div style={{ color: C.silver, fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
            {savedPapers.length === 0 ? 'No saved papers yet' : 'No papers match your filters'}
          </div>
          <div style={{ color: C.muted, fontSize: 14 }}>
            {savedPapers.length === 0 ? 'Generate a paper and click Save Paper in preview.' : 'Try a different search or filter.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(paper => {
            const stats = getSavedPaperStats(paper)
            const selected = selectedIds.has(paper.id)
            return (
              <div key={paper.id} style={{ background: C.card, border: `1px solid ${selected ? C.gold : C.border}`, borderRadius: 18, overflow: 'hidden' }}>
                <div style={{ height: 4, background: `linear-gradient(90deg, ${C.gold}, ${C.goldL})` }} />
                <div style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                    {showBulkActions && (
                      <input type="checkbox" checked={selected} onChange={() => toggleSelected(paper.id)} style={{ width: 16, height: 16, marginTop: 4, accentColor: C.gold }} />
                    )}
                    <div style={{ flex: 1 }}>
                      {renaming === paper.id ? (
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                          <input value={renameVal} onChange={e => setRenameVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitRename()} autoFocus style={{ flex: 1, background: 'rgba(11,44,77,0.7)', border: `1px solid ${C.gold}`, borderRadius: 8, color: '#fff', padding: '6px 10px', fontSize: 14, outline: 'none' }} />
                          <button onClick={submitRename} style={{ background: C.gold, border: 'none', borderRadius: 8, padding: '6px 12px', color: '#071e34', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Save</button>
                        </div>
                      ) : (
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 8 }} onDoubleClick={() => startRename(paper)}>{paper.name}</div>
                      )}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                        {(paper.config?.classLevel || paper.config?.className) && (
                          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(148,163,184,0.18)', color: C.gold, border: '1px solid rgba(200,153,26,0.3)', fontWeight: 600 }}>
                            Class {paper.config.classLevel || paper.config.className}
                          </span>
                        )}
                        {(paper.config?.subject || paper.config?.subjectName) && (
                          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(10,132,255,0.1)', color: '#0A84FF', border: '1px solid rgba(10,132,255,0.2)', fontWeight: 600 }}>
                            {paper.config.subject || paper.config.subjectName}
                          </span>
                        )}
                        {isUnifiedSavedPaper(paper) && (
                          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(48,209,88,0.12)', color: C.green, border: '1px solid rgba(48,209,88,0.25)', fontWeight: 600 }}>
                            Unified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 14 }}>
                    {[
                      ['Questions', stats.totalQuestions, '#0A84FF'],
                      ['Marks', stats.totalMarks, C.gold],
                      ['Sections', stats.types.length, '#30D158'],
                    ].map(([label, count, color]) => (
                      <div key={label} style={{ background: 'rgba(7,30,52,0.5)', borderRadius: 8, padding: '8px 6px', textAlign: 'center' }}>
                        <div style={{ color, fontWeight: 800, fontSize: 16 }}>{count}</div>
                        <div style={{ color: C.muted, fontSize: 10 }}>{label}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 14 }}>{fmtDate(paper.createdAt)}</div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => onLoadPaper?.(paper)} style={{ flex: 1, background: `linear-gradient(135deg, ${C.gold}, ${C.goldL})`, border: 'none', borderRadius: 10, padding: '9px 0', color: '#071e34', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                      Reopen
                    </button>
                    {!deliveryGoverned && <>
                    <button onClick={() => printAnswerKeyDocument(paper, stats.types, paperSettings, paper.config)} style={{ background: 'rgba(15,23,42,0.46)', border: `1px solid ${C.border}`, borderRadius: 10, padding: '9px 10px', color: C.silver, fontWeight: 600, cursor: 'pointer', fontSize: 11 }}>Key</button>
                    <button onClick={() => printMarkingSchemeDocument(paper, stats.types, paperSettings, paper.config)} style={{ background: 'rgba(15,23,42,0.46)', border: `1px solid ${C.border}`, borderRadius: 10, padding: '9px 10px', color: C.silver, fontWeight: 600, cursor: 'pointer', fontSize: 11 }}>Scheme</button>
                    <button onClick={() => sharePaperViaWhatsApp(paper, paperSettings)} style={{ background: 'rgba(15,23,42,0.46)', border: `1px solid ${C.border}`, borderRadius: 10, padding: '9px 10px', color: C.silver, fontWeight: 600, cursor: 'pointer', fontSize: 11 }}>WA</button>
                    <button onClick={() => exportPaperAsDocx(paper, paperSettings)} style={{ background: 'rgba(15,23,42,0.46)', border: `1px solid ${C.border}`, borderRadius: 10, padding: '9px 10px', color: C.silver, fontWeight: 600, cursor: 'pointer', fontSize: 11 }}>DOCX</button>
                    <button onClick={() => printSavedPapers([paper], paperSettings)} style={{ background: 'rgba(15,23,42,0.46)', border: `1px solid ${C.border}`, borderRadius: 10, padding: '9px 10px', color: C.silver, fontWeight: 600, cursor: 'pointer', fontSize: 11 }}>Print</button>
                    </>}
                    <button onClick={() => setConfirmDelete(paper)} style={{ background: 'rgba(255,55,95,0.1)', border: '1px solid rgba(255,55,95,0.25)', borderRadius: 10, padding: '9px 10px', color: C.red, fontWeight: 600, cursor: 'pointer', fontSize: 11 }}>
                      Del
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
