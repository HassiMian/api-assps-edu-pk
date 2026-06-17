'use client'
import { useState, useEffect, useRef } from 'react'
import { useAcademicStore } from '../../services/useAcademicStore'
import { usePaperStore } from './usePaperStore'
import { extractQuestionsFromFile } from './geminiService'

const C = {
  card: 'rgba(8,24,43,0.96)', gold: '#C8991A', goldL: '#e8b420',
  silver: '#E2E8F0', muted: '#94A3B8', green: '#30D158',
  red: '#FF375F', blue: '#0A84FF', purple: '#BF5AF2',
  border: 'rgba(148,163,184,0.18)'
}

export default function AIImportTab() {
  const { activeClasses, subjectsForClass } = useAcademicStore()
  const { paperSettings, questionCategories, addQuestion, syncWithServer } = usePaperStore()
  
  // Form State
  const [importMode, setImportMode] = useState('text') // 'text' or 'pdf'
  const [file, setFile] = useState(null)
  const [pastedText, setPastedText] = useState('')
  const [classLevel, setClassLevel] = useState('')
  const [subject, setSubject] = useState('')
  const [chapterNo, setChapterNo] = useState('')
  const [chapterName, setChapterName] = useState('')
  const [medium, setMedium] = useState('english')
  const [defaultCategory, setDefaultCategory] = useState('short')
  
  // Job State
  const [jobStatus, setJobStatus] = useState(null)
  const [jobProgress, setJobProgress] = useState(0)
  const [jobMessage, setJobMessage] = useState('')
  const [jobError, setJobError] = useState(null)
  
  // Review State
  const [reviewMode, setReviewMode] = useState(false)
  const [extractedQuestions, setExtractedQuestions] = useState([])
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [saving, setSaving] = useState(false)

  const availableSubjects = classLevel ? subjectsForClass(classLevel) : []

  function handleFileChange(e) {
    const selected = e.target.files[0]
    if (!selected) return
    if (selected.size > 50 * 1024 * 1024) {
      alert("File is too large. Maximum size is 50MB.")
      return
    }
    setFile(selected)
  }

  async function handleExtract(e) {
    e.preventDefault()
    if ((importMode === 'pdf' && !file) || (importMode === 'text' && !pastedText.trim())) return;
    if (!subject || !classLevel) return;

    setJobError(null)
    setJobStatus('running')
    setJobProgress(10)
    setJobMessage('Initializing AI Extraction...')
    
    try {
      const selectedCategory = questionCategories.find(c => c.id === defaultCategory)
      const config = {
        subject,
        classLevel,
        chapterNo,
        chapterName,
        medium,
        defaultCategory,
        questionCategories: questionCategories.map(c => ({ id: c.id, name: c.name, defaultMarks: c.defaultMarks })),
        prompt: selectedCategory ? `Prefer extracting ${selectedCategory.name} questions when the type is unclear.` : '',
      }
      const onProgress = (msg, prog) => {
        setJobMessage(msg)
        setJobProgress(prog)
      }
      
      const questions = await extractQuestionsFromFile(
        null,
        config,
        importMode === 'pdf' ? file : null,
        importMode === 'text' ? pastedText : null,
        onProgress,
        paperSettings.geminiModel || 'gemini-2.5-flash'
      )
      
      setJobProgress(100)
      setJobStatus('completed')
      
      if (questions && questions.length > 0) {
        const normalized = questions.map(q => ({
          ...q,
          id: q.id || `ext_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          selected: true
        }))
        setExtractedQuestions(normalized)
        setSelectedIds(new Set(normalized.map(q => q.id || q.question || q.text)))
        setReviewMode(true)
      } else {
        setJobError('Processing completed but no questions were found in the document/text.')
      }
    } catch (err) {
      console.error(err)
      setJobStatus('failed')
      setJobError(err.message || 'AI Extraction failed')
    }
  }

  async function handleSaveQuestions() {
    if (selectedIds.size === 0) return
    
    const toSave = extractedQuestions.filter(q => selectedIds.has(q.id || q.question || q.text))
    
    setSaving(true)
    try {
      // Save directly to the local Question Bank (usePaperStore)
      const subId = `subj_${subject.toLowerCase()}` // Dummy subject mapping or actual ID if matched
      
      toSave.forEach(q => {
        addQuestion({
          subjectId: subId, // Note: In a real app we'd map subject name to subjectId
          type: q.type || defaultCategory,
          medium: medium,
          text: q.text || q.en || q.question,
          textUrdu: q.textUrdu || q.ur || '',
          options: q.options || [],
          answer: q.answer || '',
          marks: q.marks || questionCategories.find(c => c.id === (q.type || defaultCategory))?.defaultMarks || 2,
          chapter: chapterName || chapterNo || q.chapter || '',
          priority: 'all'
        });
      })
      
      alert(`Successfully saved ${toSave.length} questions to the Question Bank!`)
      syncWithServer() // Refresh the store UI
      resetForm()
    } catch (err) {
      console.error(err)
      alert(`Error saving questions: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  function resetForm() {
    setFile(null)
    setPastedText('')
    setJobStatus(null)
    setJobProgress(0)
    setJobMessage('')
    setJobError(null)
    setReviewMode(false)
    setExtractedQuestions([])
    setSelectedIds(new Set())
  }

  function toggleSelection(id) {
    const newSel = new Set(selectedIds)
    if (newSel.has(id)) newSel.delete(id)
    else newSel.add(id)
    setSelectedIds(newSel)
  }

  function updateExtractedQuestion(id, changes) {
    setExtractedQuestions(prev => prev.map(q => ((q.id || q.question || q.text) === id ? { ...q, ...changes } : q)))
  }

  // Styles
  const inpStyle = { width: '100%', background: 'rgba(8,24,43,0.95)', border: `1px solid ${C.border}`, borderRadius: 10, color: C.silver, padding: '9px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }
  const labelStyle = { fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 5, display: 'block' }
  const btnStyle = (active) => ({ flex: 1, padding: '10px', borderRadius: 8, border: active ? `1px solid ${C.gold}` : `1px solid ${C.border}`, background: active ? 'rgba(200,153,26,0.1)' : 'transparent', color: active ? C.gold : C.muted, cursor: 'pointer', fontWeight: 600 })

  return (
    <div style={{ color: C.silver, maxWidth: 1000, margin: '0 auto' }}>
      
      {!reviewMode ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* LEFT: FORM */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
            <h2 style={{ color: C.gold, marginTop: 0, marginBottom: 20 }}>1. Import Source</h2>
            
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <button onClick={() => setImportMode('text')} style={btnStyle(importMode === 'text')}>Paste Text</button>
              <button onClick={() => setImportMode('pdf')} style={btnStyle(importMode === 'pdf')}>Upload PDF</button>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              {importMode === 'text' ? (
                <div>
                  <label style={labelStyle}>Paste Raw Text from PDF, Word, or Web</label>
                  <textarea 
                    value={pastedText} 
                    onChange={e => setPastedText(e.target.value)} 
                    placeholder="Paste chapter text, exercises, or old papers here..." 
                    style={{ ...inpStyle, minHeight: 120, resize: 'vertical' }} 
                  />
                </div>
              ) : (
                <div>
                  <label style={labelStyle}>Upload PDF</label>
                  <input type="file" accept=".pdf" onChange={handleFileChange} style={inpStyle} />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Class</label>
                  <select value={classLevel} onChange={e => { setClassLevel(e.target.value); setSubject('') }} style={inpStyle}>
                    <option value="">Select Class</option>
                    {activeClasses.map(c => <option key={c.level} value={c.level}>{c.name}</option>)}
                    <option value="9">Class 9</option>
                    <option value="10">Class 10</option>
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Subject</label>
                  <select value={subject} onChange={e => setSubject(e.target.value)} style={inpStyle} disabled={!classLevel}>
                    <option value="">Select Subject</option>
                    {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                    <option value="Biology">Biology</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Chapter No</label>
                  <input value={chapterNo} onChange={e => setChapterNo(e.target.value)} placeholder="e.g. 7" style={inpStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Chapter Name</label>
                  <input value={chapterName} onChange={e => setChapterName(e.target.value)} placeholder="e.g. Bioenergetics" style={inpStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Medium</label>
                <select value={medium} onChange={e => setMedium(e.target.value)} style={inpStyle}>
                  <option value="english">English Medium</option>
                  <option value="urdu">Urdu Medium</option>
                  <option value="dual">Dual Medium</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Default Category</label>
                <select value={defaultCategory} onChange={e => setDefaultCategory(e.target.value)} style={inpStyle}>
                  {questionCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              <button 
                onClick={handleExtract} 
                disabled={(!file && !pastedText) || !subject || !classLevel || jobStatus === 'running'}
                style={{
                  background: `linear-gradient(135deg, ${C.gold}, ${C.goldL})`,
                  color: '#071e34', border: 'none', borderRadius: 10, padding: '12px',
                  fontWeight: 800, fontSize: 14, cursor: ((!file && !pastedText) || !subject || !classLevel) ? 'not-allowed' : 'pointer',
                  opacity: ((!file && !pastedText) || !subject || !classLevel) ? 0.5 : 1,
                  marginTop: 10
                }}
              >
                Extract Questions with AI
              </button>
            </div>
          </div>

          {/* RIGHT: JOB STATUS */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ color: C.blue, marginTop: 0, marginBottom: 20 }}>2. AI Processing Status</h2>
            
            {!jobStatus ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: C.muted, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📄</div>
                <p>Paste text or upload a PDF to start.</p>
                <p style={{ fontSize: 12 }}>Gemini AI will read the text, identify MCQs, short, and long questions, and understand board/school patterns based on the Class level.</p>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, color: jobStatus === 'failed' ? C.red : C.gold }}>
                      {jobStatus.toUpperCase()}
                    </span>
                    <span style={{ color: C.muted }}>{jobProgress}%</span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      background: jobStatus === 'failed' ? C.red : (jobStatus === 'completed' ? C.green : C.blue), 
                      width: `${jobProgress}%`,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <div style={{ marginTop: 8, fontSize: 13, color: C.silver }}>{jobMessage}</div>
                </div>

                {jobError && (
                  <div style={{ padding: 16, background: 'rgba(255,55,95,0.1)', border: `1px solid ${C.red}`, borderRadius: 8, marginTop: 16 }}>
                    <h4 style={{ margin: '0 0 8px 0', color: C.red }}>Error</h4>
                    <p style={{ margin: 0, fontSize: 13 }}>{jobError}</p>
                    
                    <button onClick={resetForm} style={{ marginTop: 16, background: 'transparent', border: `1px solid ${C.red}`, color: C.red, padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* REVIEW SCREEN */
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ color: C.gold, margin: 0 }}>3. Review & Approve</h2>
              <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
                {selectedIds.size} of {extractedQuestions.length} questions selected for {subject} {classLevel ? `(Class ${classLevel})` : ''}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={resetForm} style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.silver, padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>
                Cancel
              </button>
              <button 
                onClick={handleSaveQuestions}
                disabled={selectedIds.size === 0 || saving}
                style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldL})`, color: '#071e34', border: 'none', padding: '8px 20px', borderRadius: 8, fontWeight: 700, cursor: selectedIds.size === 0 ? 'not-allowed' : 'pointer' }}
              >
                {saving ? 'Saving...' : `Save to Question Bank (${selectedIds.size})`}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <button onClick={() => setSelectedIds(new Set(extractedQuestions.map(q => q.id || q.question || q.text)))} style={{ background: 'transparent', border: 'none', color: C.blue, cursor: 'pointer', fontSize: 13, padding: 0 }}>Select All</button>
            <button onClick={() => setSelectedIds(new Set())} style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 13, padding: 0 }}>Deselect All</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {extractedQuestions.map((q, idx) => {
              const id = q.id || q.question || q.text
              const isSelected = selectedIds.has(id)
              return (
                <div key={id || idx} style={{ 
                  border: `1px solid ${isSelected ? C.gold : C.border}`, 
                  borderRadius: 12, 
                  padding: 16,
                  background: isSelected ? 'rgba(200,153,26,0.05)' : 'transparent',
                  display: 'flex', gap: 16
                }}>
                  <div style={{ pt: 2 }}>
                    <input 
                      type="checkbox" 
                      checked={isSelected} 
                      onChange={() => toggleSelection(id)}
                      style={{ width: 18, height: 18, accentColor: C.gold, cursor: 'pointer' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <select
                          value={q.type || defaultCategory}
                          onChange={e => updateExtractedQuestion(id, { type: e.target.value, marks: questionCategories.find(c => c.id === e.target.value)?.defaultMarks || q.marks || 2 })}
                          style={{ background: 'rgba(255,255,255,0.1)', border: `1px solid ${C.border}`, color: C.silver, borderRadius: 4, fontSize: 11, fontWeight: 600, padding: '2px 8px', textTransform: 'uppercase' }}
                        >
                          {questionCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                        {q.chapter && <span style={{ background: 'rgba(10,132,255,0.15)', color: C.blue, padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>{q.chapter}</span>}
                      </div>
                      <span style={{ color: C.muted, fontSize: 11 }}>{q.marks || 1} Marks</span>
                    </div>
                    
                    <div style={{ fontSize: 14, color: C.silver, lineHeight: 1.5 }}>{q.text || q.en || q.question}</div>
                    {(q.textUrdu || q.ur) && (
                      <div style={{ fontSize: 16, color: C.silver, fontFamily: "'Noto Nastaliq Urdu', serif", direction: 'rtl', marginTop: 8 }}>{q.textUrdu || q.ur}</div>
                    )}
                    
                    {q.options && q.options.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                        {q.options.map((opt, i) => (
                          <div key={i} style={{ fontSize: 13, background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: 6, display: 'flex', gap: 8 }}>
                            <span style={{ fontWeight: 700, color: C.gold }}>{opt.label || opt.key}.</span>
                            <span>{opt.text || opt.en}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
