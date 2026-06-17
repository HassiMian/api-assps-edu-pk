'use client'
import { useState, useEffect } from 'react'
import { useAcademicStore } from '../../services/useAcademicStore'
import { usePaperStore } from './usePaperStore'
import api from '@/utils/api'

const C = {
  card: 'rgba(8,24,43,0.96)', gold: '#C8991A', goldL: '#e8b420',
  silver: '#E2E8F0', muted: '#94A3B8', border: 'rgba(148,163,184,0.18)',
  blue: '#0A84FF', red: '#FF375F'
}

export default function QuestionBankBrowser() {
  const { activeClasses, subjectsForClass } = useAcademicStore()
  const { addSubject, questionCategories } = usePaperStore()
  
  const [questions, setQuestions] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  
  // Filters
  const [classLevel, setClassLevel] = useState('')
  const [subject, setSubject] = useState('')
  const [chapter, setChapter] = useState('')
  const [topic, setTopic] = useState('')
  const [qType, setQType] = useState('')
  const [page, setPage] = useState(1)
  const [showAddSubject, setShowAddSubject] = useState(false)
  const [newSubject, setNewSubject] = useState({ name: '', nameUrdu: '', publisher: '', classLevel: '' })
  
  const limit = 20
  const availableSubjects = classLevel ? subjectsForClass(classLevel) : []
  const classOptions = activeClasses.length > 0
    ? activeClasses
    : ['1','2','3','4','5','6','7','8','9','10'].map(level => ({ level, name: `Class ${level}` }))

  useEffect(() => {
    fetchQuestions()
  }, [classLevel, subject, chapter, topic, qType, page])

  async function fetchQuestions() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (classLevel) params.append('classLevel', classLevel)
      if (subject) params.append('subject', subject)
      if (chapter) params.append('chapter', chapter)
      if (topic) params.append('topic', topic)
      if (qType) params.append('type', qType)
      params.append('limit', limit)
      params.append('offset', (page - 1) * limit)
      
      const res = await api.get(`/question-bank?${params.toString()}`)
      if (res.data?.success) {
        setQuestions(res.data.data)
        setTotal(res.data.meta.total)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this question from the bank?")) return
    try {
      const res = await api.delete(`/question-bank/${id}`)
      if (res.data?.success) {
        fetchQuestions()
      }
    } catch (err) {
      console.error(err)
      alert("Failed to delete question")
    }
  }

  function handleAddSubject(e) {
    e.preventDefault()
    if (!newSubject.name.trim()) {
      alert('Subject name is required.')
      return
    }
    addSubject(newSubject)
    setNewSubject({ name: '', nameUrdu: '', publisher: '', classLevel: '' })
    setShowAddSubject(false)
  }

  const inpStyle = { width: '100%', background: 'rgba(8,24,43,0.95)', border: `1px solid ${C.border}`, borderRadius: 8, color: C.silver, padding: '8px 12px', fontSize: 13, outline: 'none' }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', color: C.silver }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <h3 style={{ margin: 0, color: C.gold }}>Question Bank</h3>
          <div style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>Filter questions by class, subject, chapter, topic and category.</div>
        </div>
        <button onClick={() => setShowAddSubject(p => !p)} style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldL})`, color: '#071e34', border: 'none', borderRadius: 10, padding: '10px 16px', fontWeight: 800, cursor: 'pointer' }}>
          {showAddSubject ? 'Close' : 'Add Subject'}
        </button>
      </div>

      {showAddSubject && (
        <form onSubmit={handleAddSubject} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <input value={newSubject.name} onChange={e => setNewSubject(prev => ({ ...prev, name: e.target.value }))} placeholder="Subject Name (English)" style={inpStyle} />
          <input value={newSubject.nameUrdu} onChange={e => setNewSubject(prev => ({ ...prev, nameUrdu: e.target.value }))} placeholder="Subject Name (Urdu)" dir="rtl" style={inpStyle} />
          <input value={newSubject.publisher} onChange={e => setNewSubject(prev => ({ ...prev, publisher: e.target.value }))} placeholder="Publisher" style={inpStyle} />
          <select value={newSubject.classLevel} onChange={e => setNewSubject(prev => ({ ...prev, classLevel: e.target.value }))} style={inpStyle}>
            <option value="">All Classes</option>
            {classOptions.map(c => <option key={c.level} value={c.level}>{c.name}</option>)}
          </select>
          <button type="submit" style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldL})`, color: '#071e34', border: 'none', borderRadius: 10, padding: '10px 16px', fontWeight: 800, cursor: 'pointer' }}>
            Save Subject
          </button>
        </form>
      )}

      {/* Filters */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 24, display: 'flex', gap: 16 }}>
        <select value={classLevel} onChange={e => { setClassLevel(e.target.value); setSubject(''); setPage(1) }} style={inpStyle}>
          <option value="">All Classes</option>
          {classOptions.map(c => <option key={c.level} value={c.level}>{c.name}</option>)}
        </select>
        
        <select value={subject} onChange={e => { setSubject(e.target.value); setPage(1) }} style={inpStyle} disabled={!classLevel}>
          <option value="">All Subjects</option>
          {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
          <option value="Biology">Biology</option>
          <option value="Physics">Physics</option>
          <option value="Chemistry">Chemistry</option>
        </select>
        
        <input value={chapter} onChange={e => { setChapter(e.target.value); setPage(1) }} placeholder="Search Chapter" style={inpStyle} />
        <input value={topic} onChange={e => { setTopic(e.target.value); setPage(1) }} placeholder="Search Topic" style={inpStyle} />
        
        <select value={qType} onChange={e => { setQType(e.target.value); setPage(1) }} style={inpStyle}>
          <option value="">All Types</option>
          {questionCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
      </div>

      {/* Results */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0, color: C.gold }}>Found {total} Questions</h3>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.silver, borderRadius: 6, padding: '4px 12px', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>Prev</button>
          <span style={{ fontSize: 13, alignSelf: 'center' }}>Page {page} of {Math.max(1, Math.ceil(total / limit))}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page * limit >= total} style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.silver, borderRadius: 6, padding: '4px 12px', cursor: page * limit >= total ? 'not-allowed' : 'pointer' }}>Next</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: C.muted }}>Loading questions...</div>
        ) : questions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: C.muted, background: C.card, borderRadius: 12 }}>No questions match your filters.</div>
        ) : questions.map(q => (
          <div key={q.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 10, background: 'rgba(200,153,26,0.1)', color: C.gold, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>{q.question_type}</span>
                <span style={{ fontSize: 11, color: C.muted }}>{q.subject} • {q.class_level} {q.chapter_name ? `• ${q.chapter_name}` : ''}</span>
              </div>
              <div style={{ fontSize: 14, color: C.silver, lineHeight: 1.5 }}>{q.question_text}</div>
              {q.question_text_urdu && (
                <div style={{ fontSize: 16, color: C.silver, fontFamily: "'Noto Nastaliq Urdu', serif", direction: 'rtl', marginTop: 8 }}>{q.question_text_urdu}</div>
              )}
              {q.question_type === 'mcq' && q.options && Array.isArray(q.options) && q.options.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                  {q.options.map((opt, i) => (
                    <div key={i} style={{ fontSize: 12, color: C.muted }}><b style={{color: q.correct_option === opt.label ? C.green : C.gold}}>{opt.label}.</b> {opt.text}</div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 80 }}>
              <button onClick={() => alert('Edit feature coming soon')} style={{ background: 'transparent', border: `1px solid ${C.blue}`, color: C.blue, padding: '6px', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>Edit</button>
              <button onClick={() => handleDelete(q.id)} style={{ background: 'transparent', border: `1px solid ${C.red}`, color: C.red, padding: '6px', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
