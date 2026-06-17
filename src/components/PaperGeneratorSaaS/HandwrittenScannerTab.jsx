'use client'
// HandwrittenScannerTab.jsx â€” Server-side scanning
import { useState, useMemo, useRef } from 'react'
import { usePaperStore } from './usePaperStore'
import { useAcademicStore } from '@/services/useAcademicStore'
import { DEFAULT_MODEL } from './geminiService'
import api from '@/utils/api'

const C = {
  card:'rgba(8,24,43,0.96)', gold:'#C8991A', goldL:'#e8b420',
  silver:'#E2E8F0', muted:'#94A3B8', green:'#30D158',
  red:'#FF375F', blue:'#0A84FF', purple:'#BF5AF2',
  border:'rgba(148,163,184,0.18)',
}
const EXAM_TYPES = ['Mid Term','Final Term','Monthly Test','Weekly Test','Unit Test','Assessment']

const normalize = (q, marks) => ({
  ...q,
  id: q.id || `q_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
  en: q.text || '', ur: q.textUrdu || q.text || '',
  marks: q.marks || marks, subjectId: 'ai-scanned', chapter: q.chapter || '',
  options: (q.options||[]).map(o=>({...o, en:o.text||'', ur:o.textUrdu||o.text||''}))
})

function Inp({ label, style={}, ...p }) {
  return (
    <div>
      {label && <div style={{fontSize:11,color:C.muted,fontWeight:600,marginBottom:5}}>{label}</div>}
      <input {...p} style={{width:'100%',background:'rgba(8,24,43,0.95)',border:`1px solid ${C.border}`,borderRadius:10,color:C.silver,padding:'9px 12px',fontSize:13,outline:'none',boxSizing:'border-box',...style}} />
    </div>
  )
}

function Sel({ label, children, ...p }) {
  return (
    <div>
      {label && <div style={{fontSize:11,color:C.muted,fontWeight:600,marginBottom:5}}>{label}</div>}
      <select {...p} style={{width:'100%',background:'rgba(8,24,43,0.95)',border:`1px solid ${C.border}`,borderRadius:10,color:C.silver,padding:'9px 12px',fontSize:13,outline:'none',cursor:'pointer',boxSizing:'border-box'}}>{children}</select>
    </div>
  )
}

export default function HandwrittenScannerTab({ onProceedToPreview }) {
  const { paperSettings } = usePaperStore()
  const { activeClasses, subjectsForClass } = useAcademicStore()

  const [images, setImages]         = useState([])
  const [classLevel, setClassLevel] = useState('')
  const [subject, setSubject]       = useState('')
  const [examType, setExamType]     = useState('Assessment')
  const [scanning, setScanning]     = useState(false)
  const [progressMsg, setProgressMsg] = useState('')
  const [aiError, setAiError]       = useState('')
  const [scannedData, setScannedData] = useState(null)
  const fileRef = useRef(null)

  const availableSubjects = useMemo(() => {
    return subjectsForClass ? subjectsForClass(classLevel) : []
  }, [classLevel, subjectsForClass])

  const addImages = (files) => {
    const imgs = Array.from(files).filter(f => f.type.startsWith('image/'))
    setImages(prev => [...prev, ...imgs.map((f,i) => ({ file:f, id:`img_${Date.now()}_${i}`, name:f.name }))])
  }

  const removeImage = (id) => setImages(p => p.filter(x => x.id !== id))

  const moveImage = (id, dir) => {
    setImages(prev => {
      const idx = prev.findIndex(x => x.id === id)
      if (idx < 0) return prev
      const n = [...prev]
      const to = idx + dir
      if (to < 0 || to >= n.length) return prev
      ;[n[idx], n[to]] = [n[to], n[idx]]
      return n
    })
  }

  const handleScan = async () => {
    if (!images.length) return

    setScanning(true); setAiError(''); setProgressMsg('Starting AI scan on server...')
    
    // 1. Try backend API first
    try {
      const formData = new FormData()
      images.forEach(img => {
        formData.append('files', img.file)
      })
      formData.append('classLevel', classLevel)
      formData.append('subject', subject)
      formData.append('examType', examType)
      formData.append('language', 'mixed')
      formData.append('preferredModel', paperSettings.geminiModel || DEFAULT_MODEL)

      const resData = await api.post('/paper/scan-handwritten', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (resData.data && resData.data.success && resData.data.jobId) {
        const jobId = resData.data.jobId
        let pollCount = 0
        const maxPolls = 150 // 5 minutes limit
        
        const poll = async () => {
          if (pollCount >= maxPolls) {
            throw new Error('Scanning timed out on server. Please try again or use client fallback.')
          }
          pollCount++
          setProgressMsg(`Scanning on server (attempt ${pollCount})...`)
          
          const jobRes = await api.get(`/paper/jobs/${jobId}`)
          const job = jobRes.data?.job
          if (!job) throw new Error('Failed to retrieve job status.')
          
          if (job.status === 'completed') {
            return job.result
          } else if (job.status === 'failed') {
            throw new Error(job.error || 'Server scan job failed.')
          } else {
            // Wait 2 seconds and poll again
            await new Promise(resolve => setTimeout(resolve, 2000))
            return poll()
          }
        }
        
        const result = await poll()
        setScannedData({
          selectedMCQ:   (result.mcq   || []).map(q => normalize(q, 1)),
          selectedShort: (result.short || []).map(q => normalize(q, 2)),
          selectedLong:  (result.long  || []).map(q => normalize(q, 5)),
          fromScan: true,
        })
        setScanning(false)
        return
      }
    } catch (backendError) {
      console.warn('Backend AI scan failed:', backendError)
      setScanning(false)
      setAiError(backendError?.response?.data?.message || backendError?.message || 'AI scan failed on the server.')
      return
    }
  }

  const handleProceed = () => {
    if (!scannedData) return
    onProceedToPreview?.({
      ...scannedData,
      config: { classLevel, subject, examType, medium: 'english', title: `${subject} Scanned Paper` }
    })
  }

  // Drag-n-drop
  const onDrop = (e) => {
    e.preventDefault()
    addImages(e.dataTransfer.files)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, minHeight: '70vh' }}>

      {/* â€” LEFT: Controls â€” */}
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

        {/* Config */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
          <div style={{ color:C.gold, fontWeight:800, fontSize:14, marginBottom:14 }}>PAPER Configuration</div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <Sel label="Class" value={classLevel} onChange={e => setClassLevel(e.target.value)}>
              <option value="">Select Class (optional)</option>
              {activeClasses.length > 0
                ? activeClasses.map(c => <option key={c.level} value={c.level}>{c.name || `Class ${c.level}`}</option>)
                : ['1','2','3','4','5','6','7','8','9','10'].map(n => <option key={n} value={n}>Class {n}</option>)
              }
            </Sel>
            <Inp label="Subject (optional)" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Mathematics" />
            <Sel label="Exam Type" value={examType} onChange={e => setExamType(e.target.value)}>
              {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </Sel>
          </div>
        </div>

        {/* Upload */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
          <div style={{ color:C.gold, fontWeight:800, fontSize:14, marginBottom:14 }}>UPLOAD Handwritten Paper</div>
          <div
            onDrop={onDrop} onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            style={{ border:`2px dashed ${C.border}`, borderRadius:12, padding:'24px 16px', textAlign:'center', cursor:'pointer', background:'rgba(255,255,255,0.02)', transition:'border-color 0.2s' }}
          >
            <div style={{ fontSize:32, marginBottom:8 }}>DOC</div>
            <div style={{ color:C.silver, fontSize:13, fontWeight:600 }}>Click or drag images here</div>
            <div style={{ color:C.muted, fontSize:11, marginTop:4 }}>JPG, PNG, WEBP - any number of pages</div>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:'none' }}
              onChange={e => addImages(e.target.files)} />
          </div>

          {images.length > 0 && (
            <div style={{ marginTop:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ color:C.silver, fontSize:12, fontWeight:700 }}>Pages ({images.length})</span>
                <span style={{ color:C.muted, fontSize:11 }}>Drag Up/Down to reorder</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:6, maxHeight:200, overflowY:'auto' }}>
                {images.map((img, i) => (
                  <div key={img.id} style={{ display:'flex', gap:8, alignItems:'center', padding:'8px 10px', background:'rgba(255,255,255,0.03)', borderRadius:8, border:`1px solid ${C.border}` }}>
                    <div style={{ width:22, height:22, borderRadius:6, background:C.gold, display:'grid', placeItems:'center', color:'#071e34', fontWeight:800, fontSize:11, flexShrink:0 }}>{i+1}</div>
                    <div style={{ flex:1, overflow:'hidden' }}>
                      <div style={{ color:C.silver, fontSize:12, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{img.name}</div>
                    </div>
                    <button onClick={() => moveImage(img.id, -1)} disabled={i===0} style={{ background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:14, opacity:i===0?0.3:1 }}>Up</button>
                    <button onClick={() => moveImage(img.id, 1)} disabled={i===images.length-1} style={{ background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:14, opacity:i===images.length-1?0.3:1 }}>Down</button>
                    <button onClick={() => removeImage(img.id)} style={{ background:'none', border:'none', color:C.red, cursor:'pointer', fontSize:16 }}>Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Server AI Status */}
        <div style={{ display:'flex', gap:10, alignItems:'center', padding:'10px 14px',
          background: 'rgba(48,209,88,0.06)',
          border: `1px solid rgba(48,209,88,0.25)`, borderRadius:10 }}>
          <span style={{ fontSize:18 }}>READY</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, color: C.green, fontWeight:700 }}>
              AI Scanner Active
            </div>
            <div style={{ fontSize:11, color:C.muted }}>
              Using server-side secure AI configuration
            </div>
          </div>
        </div>

        {/* Error */}
        {aiError && (
          <div style={{ padding:'12px 14px', background:'rgba(255,55,95,0.08)', border:'1px solid rgba(255,55,95,0.3)', borderRadius:10, color:C.red, fontSize:13 }}>
            Warning: {aiError}
          </div>
        )}

        {/* Progress */}
        {scanning && (
          <div style={{ padding:'12px 14px', background:'rgba(10,132,255,0.08)', border:'1px solid rgba(10,132,255,0.3)', borderRadius:10, color:C.blue, fontSize:13 }}>
            Scanning... {progressMsg}
          </div>
        )}

        {/* Scan Button */}
        <button onClick={handleScan} disabled={scanning || !images.length}
          style={{ background: images.length && !scanning ? `linear-gradient(135deg,${C.blue},#0055cc)` : 'rgba(10,132,255,0.15)',
            color: images.length && !scanning ? '#fff' : C.muted,
            border:'none', borderRadius:14, padding:'14px 0', fontWeight:800, fontSize:15,
            cursor: images.length && !scanning ? 'pointer' : 'not-allowed', transition:'all 0.2s' }}>
          {scanning ? `Scanning... ${progressMsg || ''}` : 'Scan with Gemini AI'}
        </button>

        {/* Proceed Button */}
        {scannedData && (
          <button onClick={handleProceed}
            style={{ background:`linear-gradient(135deg,${C.gold},${C.goldL})`, color:'#071e34', border:'none', borderRadius:14, padding:'14px 0', fontWeight:800, fontSize:15, cursor:'pointer' }}>
            Proceed to Preview ({(scannedData.selectedMCQ?.length||0)+(scannedData.selectedShort?.length||0)+(scannedData.selectedLong?.length||0)} questions)
          </button>
        )}
      </div>

      {/* â€” RIGHT: Info + Results â€” */}
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {scannedData ? (
          <div style={{ background:C.card, border:`1px solid rgba(48,209,88,0.3)`, borderRadius:16, padding:24 }}>
            <div style={{ color:C.green, fontWeight:800, fontSize:18, marginBottom:16 }}>Scan Complete!</div>
            {[['MCQ', scannedData.selectedMCQ, C.blue], ['Short', scannedData.selectedShort, C.gold], ['Long', scannedData.selectedLong, C.purple]].map(([label, qs, color]) => (
              <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`1px solid ${C.border}` }}>
                <span style={{ color:C.muted, fontSize:13 }}>{label} Questions</span>
                <span style={{ color, fontWeight:700, fontSize:13 }}>{qs?.length || 0}</span>
              </div>
            ))}
            <div style={{ marginTop:14, color:C.muted, fontSize:12 }}>
              Review in the Preview Editor before printing.
            </div>
          </div>
        ) : (
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:32, flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, textAlign:'center' }}>
            <div style={{ fontSize:56 }}>EDIT</div>
            <div style={{ color:'#fff', fontWeight:800, fontSize:20 }}>Handwritten AI Scanner</div>
            <div style={{ color:C.muted, fontSize:13, maxWidth:320, lineHeight:1.7 }}>
              Upload photos of any handwritten or poorly printed paper.<br/>
              <strong style={{ color:C.green }}>Gemini AI</strong> reads messy handwriting, extracts Urdu, and structures everything for editing!
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, width:'100%' }}>
              {[['Multi-Page','Upload pages in sequence - unlimited'],['Urdu OCR','Reads Nastaliq & messy handwriting'],['Auto-Classify','Sorts into MCQ, Short & Long'],['Fully Editable','Edit everything in the preview editor']].map(([t,d])=>(
                <div key={t} style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${C.border}`, borderRadius:10, padding:12 }}>
                  <div style={{ color:C.silver, fontWeight:700, fontSize:12 }}>{t}</div>
                  <div style={{ color:C.muted, fontSize:11, marginTop:3 }}>{d}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
