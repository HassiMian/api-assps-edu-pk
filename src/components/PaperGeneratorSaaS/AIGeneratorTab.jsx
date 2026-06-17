'use client'
// AIGeneratorTab.jsx â€” Al Siddique Smart School OS
import { useEffect, useState, useMemo } from 'react'
import { usePaperStore } from './usePaperStore'
import { useAcademicStore } from '../../services/useAcademicStore'
import { useAuth } from '@/context/AuthContext'
import { DEFAULT_MODEL } from './geminiService'
import { PUNJAB_BOARD_PATTERNS } from './boardPatterns'
import api from '@/utils/api'

const C = {
  card: 'rgba(8,24,43,0.96)', gold: '#C8991A', goldL: '#e8b420',
  silver: '#E2E8F0', muted: '#94A3B8', green: '#30D158',
  red: '#FF375F', blue: '#0A84FF', purple: '#BF5AF2',
  border: 'rgba(148,163,184,0.18)',
}

const EXAM_TYPES = [
  'Mid Term', 'Final Term', 'Monthly Test', 'Weekly Test', 'Unit Test', 'Assessment',
  ...Object.keys(PUNJAB_BOARD_PATTERNS)
]

const PRIORITIES = [
  { v: 'all',      l: 'All Questions'   },
  { v: 'exercise', l: 'Exercise Only'   },
  { v: 'past',     l: 'Past Papers'     },
  { v: 'additional', l: 'Additional'    },
]

// Dual medium only for 9th and 10th
const isDual = (cls) => ['9','10'].includes(String(cls))

// Standard Pakistan curriculum paper templates
const PAPER_TEMPLATES = {
  'Mid Term':     { mcq: 10, short: 5,  long: 2, mcqM: 1, shortM: 2, longM: 5 },
  'Final Term':   { mcq: 20, short: 8,  long: 3, mcqM: 1, shortM: 2, longM: 5 },
  'Monthly Test': { mcq: 10, short: 5,  long: 1, mcqM: 1, shortM: 2, longM: 5 },
  'Weekly Test':  { mcq: 10, short: 0,  long: 0, mcqM: 1, shortM: 2, longM: 5 },
  'Unit Test':    { mcq: 10, short: 5,  long: 2, mcqM: 1, shortM: 2, longM: 5 },
  'Assessment':   { mcq: 5,  short: 5,  long: 2, mcqM: 1, shortM: 2, longM: 5 },
  ...PUNJAB_BOARD_PATTERNS
}

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5)

function Inp({ label, style = {}, ...p }) {
  return (
    <div>
      {label && <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 5, letterSpacing: '0.05em' }}>{label}</div>}
      <input {...p} style={{ width: '100%', background: 'rgba(8,24,43,0.95)', border: `1px solid ${C.border}`, borderRadius: 10, color: C.silver, padding: '9px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box', ...style }} />
    </div>
  )
}

function Sel({ label, children, ...p }) {
  return (
    <div>
      {label && <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 5, letterSpacing: '0.05em' }}>{label}</div>}
      <select {...p} style={{ width: '100%', background: 'rgba(8,24,43,0.95)', border: `1px solid ${C.border}`, borderRadius: 10, color: C.silver, padding: '9px 12px', fontSize: 13, outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}>
        {children}
      </select>
    </div>
  )
}

function Num({ label, value, onChange, min = 0, max = 50, ...props }) {
  return (
    <div>
      {label && <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 5 }}>{label}</div>}
      <input type="number" value={value} onChange={onChange} min={min} max={max} {...props}
        style={{ width: '100%', background: 'rgba(8,24,43,0.95)', border: `1px solid ${C.border}`, borderRadius: 10, color: C.gold, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontWeight: 700 }} />
    </div>
  )
}

function SectionCard({ title, icon, children }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, marginBottom: 14 }}>
      <div style={{ color: C.gold, fontWeight: 700, fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
        <span>{icon}</span>{title}
      </div>
      {children}
    </div>
  )
}

const normalizeQuestion = (q, marks, chapters = []) => ({
  ...q,
  id: q.id || `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  en: q.text || q.en || '',
  ur: q.textUrdu || q.ur || q.text || '',
  marks,
  subjectId: q.subjectId || 'ai-generated',
  chapter: q.chapter || chapters[0] || '',
  options: (q.options || []).map(o => ({
    ...o,
    en: o.text || o.en || '',
    ur: o.textUrdu || o.ur || o.text || ''
  }))
})

// â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”
export default function AIGeneratorTab({ onProceedToPreview }) {
  const { subjects, questions, paperSettings, getQuestionsForPaper, getChaptersForSubject, questionCategories, addQuestion, savePaper } = usePaperStore()
  const { activeClasses, subjectsForClass } = useAcademicStore()
  const { isTeacher } = useAuth()

  const [classLevel,   setClassLevel]   = useState('')
  const [subject,      setSubject]      = useState('')
  const [chapters,     setChapters]     = useState([])
  const [examType,     setExamType]     = useState('Mid Term')
  const [medium,       setMedium]       = useState('english')
  const [autoBalance,  setAutoBalance]  = useState(true)
  const [priority,     setPriority]     = useState('all')
  const [paperCode,    setPaperCode]    = useState(String(Math.floor(1000 + Math.random() * 9000)))
  const [examDate,     setExamDate]     = useState(new Date().toISOString().slice(0, 10))
  const [instructions, setInstructions] = useState('')

  const [qCounts, setQCounts] = useState({
    mcq: 10,
    short: 5,
    long: 2,
    poetry: 0,
    prose: 0,
    grammar: 0,
    column: 0,
    summary: 0
  })

  const [qMarks, setQMarks] = useState({
    mcq: 1,
    short: 2,
    long: 5,
    poetry: 10,
    prose: 10,
    grammar: 5,
    column: 5,
    summary: 5
  })
  const [activeCategoryId, setActiveCategoryId] = useState('mcq')
  const [categoryPrompts, setCategoryPrompts] = useState({})

  function updateQCount(id, val) {
    const num = Math.max(0, Number(val || 0))
    setQCounts(prev => ({ ...prev, [id]: num }))
  }

  function updateQMark(id, val) {
    const num = Math.max(0, Number(val || 0))
    setQMarks(prev => ({ ...prev, [id]: num }))
  }

  function updateCategoryPrompt(id, val) {
    setCategoryPrompts(prev => ({ ...prev, [id]: val }))
  }

  const categoryPlan = useMemo(() => questionCategories.map(cat => ({
    ...cat,
    count: Number(qCounts[cat.id] || 0),
    marks: Number(qMarks[cat.id] || cat.defaultMarks || 1),
    prompt: categoryPrompts[cat.id] || '',
  })), [questionCategories, qCounts, qMarks, categoryPrompts])

  const activeCategory = categoryPlan.find(cat => cat.id === activeCategoryId) || categoryPlan[0]

  function getGenerationPlan() {
    const template = PAPER_TEMPLATES[examType] || PAPER_TEMPLATES['Mid Term']
    return categoryPlan.map(cat => ({
      ...cat,
      count: autoBalance && ['mcq', 'short', 'long'].includes(cat.id) ? Number(template[cat.id] || 0) : cat.count,
      marks: autoBalance && cat.id === 'mcq' ? Number(template.mcqM || cat.marks)
        : autoBalance && cat.id === 'short' ? Number(template.shortM || cat.marks)
        : autoBalance && cat.id === 'long' ? Number(template.longM || cat.marks)
        : cat.marks,
    }))
  }


  const [generating, setGenerating] = useState(false)
  const [aiLoading,  setAiLoading]  = useState(false)
  const [generated,  setGenerated]  = useState(null)
  const [aiError,    setAiError]    = useState('')

  // Derived â€” subjects from Academic Setup filtered by selected class
  const availableSubjects = useMemo(() => {
    const academicSubs = subjectsForClass(classLevel)
    // also merge any question-bank subjects for this class
    const bankSubs = [...new Set(subjects.filter(s => !classLevel || s.classLevel === classLevel).map(s => s.name))]
    const merged = [...new Set([...academicSubs, ...bankSubs])]
    return merged
  }, [subjects, classLevel, subjectsForClass])

  const availableChapters = useMemo(() =>
    getChaptersForSubject(subject, classLevel),
    [subject, classLevel, questions]
  )

  const [bankQuestions, setBankQuestions] = useState([])
  const [bankStats, setBankStats] = useState({ total: 0 })

  useEffect(() => {
    if (!subject || !classLevel) {
      setBankStats({ total: 0 })
      setBankQuestions([])
      return
    }

    async function fetchBankData() {
      try {
        const params = new URLSearchParams({
          subject,
          classLevel,
          limit: 1000
        })
        if (chapters.length > 0) params.append('chapter', chapters[0])
        // If priority needed, we'd add it here

        const res = await api.get(`/question-bank?${params.toString()}`)
        if (res.data?.success) {
          const pool = res.data.data.map(q => ({
            id: q.id,
            type: q.question_type,
            text: q.question_text,
            textUrdu: q.question_text_urdu,
            options: q.options,
            answer: q.answer || q.correct_option,
            marks: q.marks,
            chapter: q.chapter_name
          }))
          
          setBankQuestions(pool)
          const nextStats = { total: pool.length }
          questionCategories.forEach(cat => { nextStats[cat.id] = pool.filter(q => q.type === cat.id).length })
          setBankStats(nextStats)
        }
      } catch (err) {
        console.error('Failed to fetch bank stats:', err)
      }
    }
    
    fetchBankData()
  }, [subject, classLevel, chapters, priority, questionCategories])

  // When examType changes, update auto-balance counts
  function applyTemplate(et) {
    setExamType(et)
    const t = PAPER_TEMPLATES[et] || PAPER_TEMPLATES['Mid Term']
    setQCounts(prev => ({
      ...prev,
      mcq: t.mcq,
      short: t.short,
      long: t.long
    }))
    setQMarks(prev => ({
      ...prev,
      mcq: t.mcqM,
      short: t.shortM,
      long: t.longM
    }))
  }

  // Smart generation from question bank API
  function generateFromBank() {
    setGenerating(true)
    setGenerated(null)
    setAiError('')
    setTimeout(() => {
      const plan = getGenerationPlan()
      const pool = bankQuestions
      const generatedByType = {}
      plan.forEach(cat => {
        generatedByType[cat.id] = shuffle(pool.filter(q => q.type === cat.id)).slice(0, cat.count).map(q => normalizeQuestion(q, cat.marks, chapters))
      })
      setGenerated({
        ...generatedByType,
        selectedMCQ: generatedByType.mcq || [],
        selectedShort: generatedByType.short || [],
        selectedLong: generatedByType.long || [],
        categoryPlan: plan,
      })
      setGenerating(false)
    }, 600)
  }

  // Gemini AI generation
  async function generateWithAI() {
    setAiLoading(true); setAiError('')
    const plan = getGenerationPlan()
    const legacy = Object.fromEntries(plan.map(cat => [cat.id, cat.count]))
    
    // 1. Try backend server API first
    try {
      const response = await api.post('/paper/generate', {
        class: classLevel,
        subject,
        chapters,
        mcqCount: legacy.mcq || 0,
        shortCount: legacy.short || 0,
        longCount: legacy.long || 0,
        categories: plan.map(cat => ({ id: cat.id, name: cat.name, count: cat.count, marks: cat.marks, prompt: cat.prompt })),
        instructions,
        language: medium,
        preferredModel: paperSettings.geminiModel || DEFAULT_MODEL
      })
      if (response.data && response.data.success) {
        const data = response.data
        const generatedByType = {}
        plan.forEach(cat => {
          const sectionQs = data[cat.id] || (Array.isArray(data.sections) ? data.sections.find(s => s.type === cat.id)?.questions : []) || []
          generatedByType[cat.id] = sectionQs.map(q => normalizeQuestion(q, cat.marks, chapters))
        })
        setGenerated({
          ...generatedByType,
          selectedMCQ: generatedByType.mcq || [],
          selectedShort: generatedByType.short || [],
          selectedLong: generatedByType.long || [],
          fromAI: true,
          model: data.model || 'Server AI',
          categoryPlan: plan,
        })
        setAiLoading(false)
        return
      }
    } catch (backendError) {
      console.warn('Backend AI generation failed:', backendError)
      setAiLoading(false)
      setAiError(backendError?.response?.data?.message || backendError?.message || 'AI generation failed on the server.')
      return
    }
  }

  const totalMarks = generated
    ? (generated.categoryPlan || categoryPlan).reduce((sum, cat) => sum + ((generated[cat.id] || []).length * (cat.marks || qMarks[cat.id] || cat.defaultMarks || 1)), 0)
    : 0


  function handleProceed() {
    if (!generated) return
    onProceedToPreview({
      config: { classLevel, subject, examType, medium, title: `${subject} ${examType}`, paperCode, examDate },
      selectedMCQ:   generated.selectedMCQ   || [],
      selectedShort: generated.selectedShort || [],
      selectedLong:  generated.selectedLong  || [],
      ...Object.fromEntries(questionCategories.map(cat => [cat.id, generated[cat.id] || []])),
      categoryPlan: generated.categoryPlan || categoryPlan,
      fromAI: true,
    })
  }

  function handleSave() {
    if (!generated) return
    savePaper({
      name: `${subject} ${examType} - ${new Date().toLocaleDateString()}`,
      config: { classLevel, subject, examType, medium, title: `${subject} ${examType}`, paperCode, examDate },
      selectedMCQ:   generated.selectedMCQ   || [],
      selectedShort: generated.selectedShort || [],
      selectedLong:  generated.selectedLong  || [],
      ...Object.fromEntries(questionCategories.map(cat => [cat.id, generated[cat.id] || []])),
      categoryPlan: generated.categoryPlan || categoryPlan,
      teacherHidden: isTeacher,
    })
    alert('Paper saved! Admin can access it from the SaaS panel.')
  }

  const canGenerate = subject && classLevel

  return (
    <div className="ai-generator-surface" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20, minHeight: '70vh' }}>
      <style>{`
        .ai-generator-surface select option,
        .ai-generator-surface select optgroup {
          background: #0a1e35;
          color: #e6eef8;
        }
      `}</style>

            {/* â€”â€”â€”â€”â€” LEFT: Configuration â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€” */}
      <div style={{ overflowY: 'auto', paddingRight: 4 }}>

        <SectionCard title="Class & Subject" icon="SUBJECT">
          <div style={{ display: 'grid', gap: 12 }}>
            <Sel label="Class" value={classLevel} onChange={e => { setClassLevel(e.target.value); setSubject(''); setChapters([]) }}>
              <option value="">Select Class</option>
              {activeClasses.length > 0
                ? activeClasses.map(c => <option key={c.level} value={c.level}>{c.name || `Class ${c.level}`}</option>)
                : ['1','2','3','4','5','6','7','8','9','10'].map(n => <option key={n} value={n}>Class {n}</option>)
              }
            </Sel>
            <Sel label="Subject" value={subject} onChange={e => { setSubject(e.target.value); setChapters([]) }}>
              <option value="">{classLevel ? 'Select Subject' : 'Select Class first'}</option>
              {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
            </Sel>

            {/* Chapter selection */}
            {availableChapters.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 6 }}>Chapters (select to filter)</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <button onClick={() => setChapters(chapters.length === availableChapters.length ? [] : [...availableChapters])}
                    style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, border: `1px solid ${C.border}`, background: chapters.length === availableChapters.length ? 'rgba(200,153,26,0.2)' : 'rgba(8,24,43,0.90)', color: C.gold, cursor: 'pointer', fontWeight: 700 }}>
                    All
                  </button>
                  {availableChapters.map(ch => {
                    const sel = chapters.includes(ch)
                    return (
                      <button key={ch} onClick={() => setChapters(sel ? chapters.filter(c => c !== ch) : [...chapters, ch])}
                        style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, border: `1px solid ${sel ? C.gold : C.border}`, background: sel ? 'rgba(200,153,26,0.2)' : 'rgba(8,24,43,0.90)', color: sel ? C.gold : C.silver, cursor: 'pointer' }}>
                        {ch}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Paper Configuration" icon="CONFIG">
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Sel label="Exam Type" value={examType} onChange={e => applyTemplate(e.target.value)}>
                {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </Sel>
              <Sel label="Question Priority" value={priority} onChange={e => setPriority(e.target.value)}>
                {PRIORITIES.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}
              </Sel>
            </div>

            {/* Medium - dual only for 9th/10th */}
            <Sel label={`Medium${!isDual(classLevel) ? ' (Dual available for 9th/10th only)' : ''}`}
              value={medium} onChange={e => setMedium(e.target.value)}
              disabled={!isDual(classLevel)}>
              <option value="english">English Medium</option>
              {isDual(classLevel) && <option value="urdu">Urdu Medium</option>}
              {isDual(classLevel) && <option value="dual">Dual Medium (English + Urdu)</option>}
            </Sel>

            {/* Auto-Balance toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(7,30,52,0.4)', borderRadius: 10 }}>
              <button onClick={() => setAutoBalance(p => !p)}
                style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', position: 'relative',
                  background: autoBalance ? C.gold : 'rgba(255,255,255,0.15)', transition: 'background 0.2s' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, transition: 'left 0.2s', left: autoBalance ? 22 : 3 }} />
              </button>
              <div>
                <div style={{ color: C.silver, fontSize: 13, fontWeight: 600 }}>Auto-Balance</div>
                <div style={{ color: C.muted, fontSize: 11 }}>{autoBalance ? `AI picks optimal counts for ${examType}` : 'Set counts manually below'}</div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Question Counts & Marks" icon="COUNTS">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' }}>
            {questionCategories.map(cat => (
              <div key={cat.id} style={{ display: 'contents' }}>
                <Num 
                  label={`${cat.name} Count`} 
                  value={qCounts[cat.id]} 
                  onChange={e => updateQCount(cat.id, e.target.value)} 
                  disabled={autoBalance && ['mcq','short','long'].includes(cat.id)}
                />
                <Num 
                  label={`${cat.name} Marks`} 
                  value={qMarks[cat.id]} 
                  onChange={e => updateQMark(cat.id, e.target.value)} 
                />
              </div>
            ))}
          </div>
          {autoBalance && (
            <div style={{ marginTop: 12, fontSize: 11, color: C.muted, textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: 8, borderRadius: 8 }}>
              Auto-Balanced for {examType}: MCQs, Short, and Long counts are preset.
            </div>
          )}
        </SectionCard>

        <SectionCard title="Category Builder" icon="FORMAT">
          <div style={{ display: 'grid', gap: 10 }}>
            <Sel label="Select Category" value={activeCategoryId} onChange={e => setActiveCategoryId(e.target.value)}>
              {questionCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </Sel>
            {activeCategory && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <Num label={`${activeCategory.name} Count`} value={qCounts[activeCategory.id] || 0} onChange={e => updateQCount(activeCategory.id, e.target.value)} disabled={autoBalance && ['mcq','short','long'].includes(activeCategory.id)} />
                  <Num label="Marks Each" value={qMarks[activeCategory.id] || activeCategory.defaultMarks || 1} onChange={e => updateQMark(activeCategory.id, e.target.value)} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 5 }}>Category Prompt</div>
                  <textarea
                    value={categoryPrompts[activeCategory.id] || ''}
                    onChange={e => updateCategoryPrompt(activeCategory.id, e.target.value)}
                    placeholder={`Extra instructions for ${activeCategory.name}, e.g. chapter style, difficulty, board pattern, poem/prose passage, grammar focus...`}
                    style={{ width: '100%', minHeight: 82, resize: 'vertical', background: 'rgba(8,24,43,0.95)', border: `1px solid ${C.border}`, borderRadius: 10, color: C.silver, padding: '10px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box', lineHeight: 1.5 }}
                  />
                </div>
              </>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Paper Details" icon="DETAILS">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Inp label="Paper Code" value={paperCode} onChange={e => setPaperCode(e.target.value)} />
            <Inp label="Exam Date" type="date" value={examDate} onChange={e => setExamDate(e.target.value)} />
          </div>
          <div style={{ marginTop: 10 }}>
            <Inp label="Instructions (optional)" value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Attempt all questions..." />
          </div>
        </SectionCard>

        {/* Bank stats */}
        {subject && (
          <div style={{ background: 'rgba(10,132,255,0.08)', border: '1px solid rgba(10,132,255,0.2)', borderRadius: 12, padding: '10px 14px', marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: C.blue, fontWeight: 700, marginBottom: 6 }}>Question Bank Available</div>
            <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
              {questionCategories.slice(0, 5).map(cat => (
                <span key={cat.id} style={{ color: cat.id === 'mcq' ? C.blue : cat.id === 'short' ? C.green : cat.id === 'long' ? C.purple : C.gold }}>{cat.name}: {bankStats[cat.id] || 0}</span>
              ))}
              <span style={{ color: C.muted }}>Total: {bankStats.total}</span>
            </div>
            {bankStats.total === 0 && (
              <div style={{ color: C.red, fontSize: 11, marginTop: 4 }}>Warning: No questions in bank. Use Gemini AI to generate fresh questions.</div>
            )}
          </div>
        )}

        {/* Generate buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={generateFromBank}
            disabled={!canGenerate || generating || bankStats.total === 0}
            style={{
              background: canGenerate && bankStats.total > 0 ? `linear-gradient(135deg, ${C.gold}, ${C.goldL})` : 'rgba(200,153,26,0.2)',
              color: canGenerate && bankStats.total > 0 ? '#071e34' : C.muted,
              border: 'none', borderRadius: 12, padding: '13px 0',
              fontWeight: 700, fontSize: 14, cursor: canGenerate && bankStats.total > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            {generating ? 'FAST Generating...' : 'FAST Generate from Bank'}
          </button>

          <button
            onClick={generateWithAI}
            disabled={!canGenerate || aiLoading}
            style={{
              background: canGenerate ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'rgba(120,60,200,0.2)',
              color: canGenerate ? '#fff' : C.muted,
              border: 'none', borderRadius: 12, padding: '13px 0',
              fontWeight: 700, fontSize: 14, cursor: canGenerate ? 'pointer' : 'not-allowed',
              boxShadow: canGenerate ? '0 4px 16px rgba(124,58,237,0.3)' : 'none',
            }}
          >
            {aiLoading ? 'AI Generating...' : 'AI Generate with Gemini AI'}
          </button>
        </div>

        {aiError && (
          <div style={{ marginTop: 10, background: 'rgba(255,55,95,0.1)', border: '1px solid rgba(255,55,95,0.3)', borderRadius: 10, padding: '8px 14px', color: C.red, fontSize: 12 }}>
            Error: {aiError}
          </div>
        )}
      </div>

      {/* â€”â€”â€”â€”â€” RIGHT: Results â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€”â€” */}
      <div>
        {!generated ? (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 36, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ fontSize: 52 }}>AI</div>
            <div style={{ color: C.gold, fontWeight: 800, fontSize: 20 }}>AI Paper Generator</div>
            <div style={{ color: C.muted, fontSize: 14, textAlign: 'center', maxWidth: 340, lineHeight: 1.6 }}>
              Configure your paper on the left, then click <strong style={{ color: C.gold }}>Generate from Bank</strong> for instant smart selection, or <strong style={{ color: '#a855f7' }}>Generate with Gemini AI</strong> for brand-new AI-created questions.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16, width: '100%', maxWidth: 400 }}>
              {[
                ['FAST Smart Selection', 'Auto-balances questions from your bank by chapter & priority'],
                ['AI Gemini AI', 'Generates fresh questions using AI - never repeats'],
                ['SUBJECT Dual Medium', '9th & 10th class: Urdu + English simultaneously'],
                ['TARGET Auto-Balance', 'Curriculum-standard paper structure by exam type'],
              ].map(([t, d]) => (
                <div key={t} style={{ background: 'rgba(7,30,52,0.5)', border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
                  <div style={{ color: C.silver, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{t}</div>
                  <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.5 }}>{d}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {/* Success banner */}
            <div style={{ background: generated.fromAI ? 'rgba(124,58,237,0.15)' : 'rgba(48,209,88,0.12)', border: `1px solid ${generated.fromAI ? 'rgba(168,85,247,0.4)' : 'rgba(48,209,88,0.3)'}`, borderRadius: 14, padding: '14px 20px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: generated.fromAI ? '#a855f7' : C.green, fontWeight: 800, fontSize: 15 }}>
                  {generated.fromAI ? 'AI Generated Successfully!' : 'FAST Paper Generated!'}
                </div>
                <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>
                  {questionCategories.map(cat => `${(generated[cat.id]||[]).length} ${cat.name}`).join(' + ')} = <strong style={{ color: C.gold }}>{totalMarks} marks</strong>
                </div>
              </div>
              <button onClick={handleProceed}
                style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldL})`, color: '#071e34', border: 'none', borderRadius: 12, padding: '10px 22px', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
                Preview Paper
              </button>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 12, marginBottom: 16 }}>
              {questionCategories.map(cat => {
                const qs = generated[cat.id] || []
                if (qs.length === 0) return null
                const m = qMarks[cat.id] || cat.defaultMarks || 2
                const color = cat.id === 'mcq' ? C.blue : (cat.id === 'short' ? C.green : (cat.id === 'long' ? '#a855f7' : C.gold))
                return (
                  <div key={cat.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ color, fontSize: 24, fontWeight: 900 }}>{qs.length}</div>
                    <div style={{ color: C.silver, fontSize: 12, fontWeight: 600 }}>{cat.name}</div>
                    <div style={{ color: C.muted, fontSize: 11 }}>{qs.length * m} marks</div>
                  </div>
                )
              })}
            </div>

            {/* Question preview */}
            {questionCategories.map(cat => {
              const qs = generated[cat.id] || []
              if (qs.length === 0) return null
              const color = cat.id === 'mcq' ? C.blue : (cat.id === 'short' ? C.green : (cat.id === 'long' ? '#a855f7' : C.gold))
              return (
                <div key={cat.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, marginBottom: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 16px', background: 'rgba(7,30,52,0.5)', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color, fontWeight: 700, fontSize: 13 }}>{cat.name} Questions</span>
                    <span style={{ color: C.muted, fontSize: 12 }}>{qs.length} questions</span>
                  </div>
                  <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {qs.slice(0, 3).map((q, i) => (
                      <div key={i} style={{ fontSize: 13, color: C.silver }}>
                        {i + 1}. {q.text || q.en}
                        {(q.textUrdu || q.ur) && <div style={{ fontFamily: "'Noto Nastaliq Urdu',serif", direction: 'rtl', fontSize: 12, color: C.muted }}>{q.textUrdu || q.ur}</div>}
                      </div>
                    ))}
                    {qs.length > 3 && <div style={{ color: C.muted, fontSize: 12 }}>+{qs.length - 3} more questions...</div>}
                  </div>
                </div>
              )
            })}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={generateFromBank}
                style={{ flex: 1, background: 'rgba(8,24,43,0.90)', border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 0', color: C.silver, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                Refresh Regenerate
              </button>
              <button onClick={handleSave}
                style={{ flex: 1, background: 'rgba(48,209,88,0.12)', border: `1px solid rgba(48,209,88,0.4)`, borderRadius: 12, padding: '12px 0', color: C.green, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                Save Save Paper
              </button>
              <button onClick={handleProceed}
                style={{ flex: 2, background: `linear-gradient(135deg, ${C.gold}, ${C.goldL})`, border: 'none', borderRadius: 12, padding: '12px 0', color: '#071e34', fontWeight: 800, cursor: 'pointer', fontSize: 14 }}>
                Preview and Print Paper
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
