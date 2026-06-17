'use client'
import { useState } from 'react'
import { useAcademicStore } from '../../services/useAcademicStore'
import { usePaperStore } from './usePaperStore'
import api from '@/utils/api'

const C = {
  card: 'rgba(8,24,43,0.96)', gold: '#C8991A', goldL: '#e8b420',
  silver: '#E2E8F0', muted: '#94A3B8', border: 'rgba(148,163,184,0.18)',
  blue: '#0A84FF', green: '#30D158'
}

export default function ManualQuestionEntry() {
  const { activeClasses, subjectsForClass } = useAcademicStore()
  const { syncWithServer } = usePaperStore()
  
  const [mode, setMode] = useState('single') // 'single' or 'bulk'
  
  // Form State
  const [classLevel, setClassLevel] = useState('')
  const [subject, setSubject] = useState('')
  const [chapterNo, setChapterNo] = useState('')
  const [chapterName, setChapterName] = useState('')
  const [topicName, setTopicName] = useState('')
  const [medium, setMedium] = useState('english')
  
  // Single Question State
  const [qType, setQType] = useState('short')
  const [qText, setQText] = useState('')
  const [qTextUrdu, setQTextUrdu] = useState('')
  const [marks, setMarks] = useState(2)
  const [difficulty, setDifficulty] = useState('medium')
  const [options, setOptions] = useState([{ label: 'A', text: '' }, { label: 'B', text: '' }, { label: 'C', text: '' }, { label: 'D', text: '' }])
  const [correctOption, setCorrectOption] = useState('A')
  
  // Bulk State
  const [bulkText, setBulkText] = useState('')
  const [bulkParsed, setBulkParsed] = useState([])
  
  const [saving, setSaving] = useState(false)
  const availableSubjects = classLevel ? subjectsForClass(classLevel) : []

  const inpStyle = { width: '100%', background: 'rgba(8,24,43,0.95)', border: `1px solid ${C.border}`, borderRadius: 10, color: C.silver, padding: '10px 14px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }
  const labelStyle = { fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 6, display: 'block' }

  async function handleSaveSingle() {
    if (!classLevel || !subject || !qText) {
      alert("Please fill required fields (Class, Subject, Question Text)")
      return
    }
    
    setSaving(true)
    try {
      const payload = {
        class_level: classLevel, subject, chapter_no: chapterNo, chapter_name: chapterName, topic_name: topicName, medium,
        question_type: qType, question_text: qText, question_text_urdu: qTextUrdu,
        marks, difficulty, 
        options: qType === 'mcq' ? options : [],
        correct_option: qType === 'mcq' ? correctOption : null
      }
      
      const res = await api.post('/question-bank', payload)
      if (res.data?.success) {
        alert("Question saved to bank!")
        setQText('')
        setQTextUrdu('')
        syncWithServer()
      }
    } catch (err) {
      console.error(err)
      alert("Failed to save question")
    } finally {
      setSaving(false)
    }
  }

  async function handleParseBulk() {
    if (!bulkText.trim()) return
    try {
      const res = await api.post('/question-bank/parse-text', { text: bulkText })
      if (res.data?.success) {
        setBulkParsed(res.data.data)
      }
    } catch (err) {
      console.error(err)
      alert("Failed to parse text")
    }
  }

  async function handleSaveBulk() {
    if (!classLevel || !subject || bulkParsed.length === 0) {
      alert("Please fill Class and Subject, and ensure there are parsed questions.")
      return
    }
    setSaving(true)
    try {
      const formattedQuestions = bulkParsed.map(q => ({
        classLevel, subject, chapterNo, chapterName, medium,
        type: q.type, text: q.text, marks: q.marks,
        options: q.options || []
      }))
      
      const res = await api.post('/question-bank/import/approve', { questions: formattedQuestions })
      if (res.data?.success) {
        alert(`Saved ${res.data.count} questions from bulk text!`)
        setBulkText('')
        setBulkParsed([])
        syncWithServer()
      }
    } catch (err) {
      console.error(err)
      alert("Failed to save bulk questions")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', color: C.silver }}>
      {/* Top Metadata Section */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 20px 0', color: C.gold }}>Taxonomy Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <div>
            <label style={labelStyle}>Class *</label>
            <select value={classLevel} onChange={e => { setClassLevel(e.target.value); setSubject('') }} style={inpStyle}>
              <option value="">Select</option>
              {activeClasses.map(c => <option key={c.level} value={c.level}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Subject *</label>
            <select value={subject} onChange={e => setSubject(e.target.value)} style={inpStyle} disabled={!classLevel}>
              <option value="">Select</option>
              {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Chapter No</label>
            <input value={chapterNo} onChange={e => setChapterNo(e.target.value)} style={inpStyle} />
          </div>
          <div>
            <label style={labelStyle}>Chapter Name</label>
            <input value={chapterName} onChange={e => setChapterName(e.target.value)} style={inpStyle} />
          </div>
        </div>
      </div>

      {/* Mode Switcher */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button 
          onClick={() => setMode('single')}
          style={{ background: mode === 'single' ? 'rgba(200,153,26,0.1)' : 'transparent', border: `1px solid ${mode === 'single' ? C.gold : C.border}`, color: mode === 'single' ? C.gold : C.silver, padding: '8px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer' }}
        >
          Single Question Form
        </button>
        <button 
          onClick={() => setMode('bulk')}
          style={{ background: mode === 'bulk' ? 'rgba(200,153,26,0.1)' : 'transparent', border: `1px solid ${mode === 'bulk' ? C.gold : C.border}`, color: mode === 'bulk' ? C.gold : C.silver, padding: '8px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer' }}
        >
          Bulk Paste & Parse
        </button>
      </div>

      {/* Single Question Form */}
      {mode === 'single' && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
            <div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Question Type</label>
                  <select value={qType} onChange={e => { setQType(e.target.value); setMarks(e.target.value==='mcq'?1:e.target.value==='short'?2:5) }} style={inpStyle}>
                    <option value="mcq">Multiple Choice (MCQ)</option>
                    <option value="short">Short Question</option>
                    <option value="long">Long / Descriptive</option>
                  </select>
                </div>
                <div style={{ width: 100 }}>
                  <label style={labelStyle}>Marks</label>
                  <input type="number" value={marks} onChange={e => setMarks(Number(e.target.value))} style={inpStyle} />
                </div>
              </div>

              <label style={labelStyle}>Question Text (English)</label>
              <textarea value={qText} onChange={e => setQText(e.target.value)} style={{ ...inpStyle, height: 80, marginBottom: 16, resize: 'vertical' }} />

              <label style={labelStyle}>Question Text (Urdu) - Optional</label>
              <textarea value={qTextUrdu} onChange={e => setQTextUrdu(e.target.value)} style={{ ...inpStyle, height: 80, fontFamily: "'Noto Nastaliq Urdu', serif", direction: 'rtl', resize: 'vertical' }} />
            </div>

            <div>
              {qType === 'mcq' && (
                <div>
                  <label style={labelStyle}>MCQ Options</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {options.map((opt, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input type="radio" name="correct" checked={correctOption === opt.label} onChange={() => setCorrectOption(opt.label)} style={{ accentColor: C.gold }} />
                        <span style={{ fontWeight: 700, color: C.gold, width: 20 }}>{opt.label}.</span>
                        <input value={opt.text} onChange={e => {
                          const newOpts = [...options]
                          newOpts[i].text = e.target.value
                          setOptions(newOpts)
                        }} style={inpStyle} placeholder={`Option ${opt.label}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  onClick={handleSaveSingle}
                  disabled={saving || !qText}
                  style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldL})`, color: '#071e34', border: 'none', padding: '12px 24px', borderRadius: 8, fontWeight: 700, cursor: saving || !qText ? 'not-allowed' : 'pointer' }}
                >
                  {saving ? 'Saving...' : 'Save to Question Bank'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Paste Mode */}
      {mode === 'bulk' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 16px 0', color: C.blue }}>Paste Text</h3>
            <p style={{ fontSize: 12, color: C.muted, margin: '0 0 16px 0' }}>Paste unformatted text containing multiple questions. The parser will attempt to detect question types and options automatically.</p>
            <textarea 
              value={bulkText} 
              onChange={e => setBulkText(e.target.value)}
              placeholder="1. What is photosynthesis?&#10;2. Define respiration.&#10;3. Which of the following is a gas?&#10;A. Water&#10;B. Oxygen&#10;C. Gold&#10;D. Iron"
              style={{ ...inpStyle, flex: 1, minHeight: 300, resize: 'none', marginBottom: 16 }}
            />
            <button 
              onClick={handleParseBulk}
              style={{ background: 'rgba(10,132,255,0.1)', color: C.blue, border: `1px solid ${C.blue}`, padding: '10px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
            >
              Parse Text →
            </button>
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: C.gold }}>Parsed Result ({bulkParsed.length})</h3>
              {bulkParsed.length > 0 && (
                <button 
                  onClick={handleSaveBulk}
                  disabled={saving || !classLevel || !subject}
                  style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldL})`, color: '#071e34', border: 'none', padding: '6px 16px', borderRadius: 6, fontWeight: 700, cursor: (saving || !classLevel || !subject) ? 'not-allowed' : 'pointer', fontSize: 12 }}
                >
                  {saving ? 'Saving...' : 'Save All to Bank'}
                </button>
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 400, overflowY: 'auto', paddingRight: 8 }}>
              {bulkParsed.length === 0 ? (
                <div style={{ color: C.muted, fontSize: 13, textAlign: 'center', marginTop: 40 }}>No parsed questions yet. Paste text and click Parse.</div>
              ) : bulkParsed.map((q, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 10, background: 'rgba(200,153,26,0.1)', color: C.gold, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>{q.type}</span>
                    <span style={{ fontSize: 10, color: C.muted }}>{q.marks} Marks</span>
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.4 }}>{q.text}</div>
                  {q.options && q.options.length > 0 && (
                    <div style={{ marginTop: 8, fontSize: 12, color: C.muted }}>
                      {q.options.map((opt, i) => <span key={i} style={{ marginRight: 12 }}><b>{opt.label}.</b> {opt.text}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
