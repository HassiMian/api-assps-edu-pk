'use client'
// usePaperStore.js — Al Siddique Smart School OS
import { useState, useEffect } from 'react'
import api from '@/utils/api'

const STORE_KEY = 'al_siddique_paper_store'
const STORE_SYNC_EVENT = 'al_siddique_paper_store_updated'

const defaultStore = {
  subjects: [],
  questions: [],
  savedPapers: [],
  publishers: [
    { id: 'pub_1', name: 'PTB', image: null },
    { id: 'pub_2', name: 'Afaq SNC', image: null },
    { id: 'pub_3', name: 'Cambridge', image: null },
    { id: 'pub_4', name: 'Abbasi Publishers', image: null },
    { id: 'pub_5', name: 'AZ Publisher', image: null },
    { id: 'pub_6', name: 'Oxford', image: null },
    { id: 'pub_7', name: 'Gaba', image: null },
    { id: 'pub_8', name: 'Paramount', image: null },
    { id: 'pub_9', name: 'Moonlight', image: null },
    { id: 'pub_10', name: 'Ilm-o-Irfan', image: null },
  ],
  questionCategories: [
    { id: 'mcq', name: 'MCQs', icon: 'MC', defaultMarks: 1 },
    { id: 'short', name: 'Short Questions', icon: 'SQ', defaultMarks: 2 },
    { id: 'long', name: 'Long Questions', icon: 'LQ', defaultMarks: 5 },
    { id: 'poetry', name: 'Poetry Explanation', icon: 'PO', defaultMarks: 10 },
    { id: 'prose', name: 'Prose Explanation', icon: 'PR', defaultMarks: 10 },
    { id: 'grammar', name: 'Grammar / Completion', icon: 'GR', defaultMarks: 5 },
    { id: 'column', name: 'Column Matching', icon: 'CM', defaultMarks: 5 },
    { id: 'summary', name: 'Summary / Central Idea', icon: 'SM', defaultMarks: 5 },
  ],
  paperSettings: {
    schoolName: '',
    schoolUrdu: '',
    address: '',
    logo: null,
    urduFont: 'Noto Nastaliq Urdu',
    examYear: '',
    geminiModel: 'gemini-2.0-flash-lite',
    principalName: '',
    principalSignature: '',
    phone: '',
    email: '',
    schoolCode: '',
    showUrduHeader: true,
  },
}

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) {
      saveStore(defaultStore)
      return defaultStore
    }
    const parsed = JSON.parse(raw)
    const { geminiApiKey: _legacyGeminiKey, ...persistedPaperSettings } = parsed.paperSettings || {}
    return {
      ...defaultStore,
      ...parsed,
      subjects: parsed.subjects || [],
      questions: parsed.questions || [],
      savedPapers: parsed.savedPapers || [],
      publishers: parsed.publishers || defaultStore.publishers,
      questionCategories: parsed.questionCategories || defaultStore.questionCategories,
      paperSettings: { ...defaultStore.paperSettings, ...persistedPaperSettings },
    }
  } catch {
    return defaultStore
  }
}

function saveStore(data) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data))
}

function estimatePrints(classLevel) {
  const counts = { '1': 28, '2': 31, '3': 29, '4': 32, '5': 34, '6': 36, '7': 33, '8': 35, '9': 42, '10': 40 }
  return counts[String(classLevel)] || 30
}

export function usePaperStore() {
  const [store, setStore] = useState(defaultStore)

  useEffect(() => {
    // Hydrate client state from localStorage
    setStore(loadStore())

    const handler = () => setStore(loadStore())
    window.addEventListener('storage', handler)
    window.addEventListener(STORE_SYNC_EVENT, handler)
    return () => {
      window.removeEventListener('storage', handler)
      window.removeEventListener(STORE_SYNC_EVENT, handler)
    }
  }, [])

  function update(updater) {
    setStore(prev => {
      const next = updater(prev)
      saveStore(next)
      window.dispatchEvent(new Event(STORE_SYNC_EVENT))
      return next
    })
  }

  function addSubject({ name, nameUrdu = '', publisher = '', cover = null, classLevel = '' }) {
    const subject = { id: `subj_${Date.now()}`, name, nameUrdu, publisher, cover, classLevel, createdAt: new Date().toISOString() }
    update(s => ({ ...s, subjects: [...s.subjects, subject] }))
    return subject
  }

  function editSubject(id, changes) {
    update(s => ({ ...s, subjects: s.subjects.map(sub => sub.id === id ? { ...sub, ...changes } : sub) }))
  }

  function deleteSubject(id) {
    update(s => ({ ...s, subjects: s.subjects.filter(sub => sub.id !== id), questions: s.questions.filter(q => q.subjectId !== id) }))
  }

  function addPublisher({ name, image = null }) {
    const pub = { id: `pub_${Date.now()}`, name, image }
    update(s => ({ ...s, publishers: [...s.publishers, pub] }))
    return pub
  }

  function deletePublisher(id) {
    update(s => ({ ...s, publishers: s.publishers.filter(p => p.id !== id) }))
  }

  function updateQuestionCategories(categories) {
    update(s => ({ ...s, questionCategories: categories }))
  }

  function addQuestion({ subjectId, type, medium = 'english', text, textUrdu = '', options = [], answer = '', marks = 1, chapter = '', priority = 'all' }) {
    const q = {
      id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      subjectId, type, medium, text, textUrdu, options, answer,
      marks: Number(marks), chapter, priority,
      createdAt: new Date().toISOString(),
    }
    update(s => ({ ...s, questions: [...s.questions, q] }))
    return q
  }

  function editQuestion(id, changes) {
    update(s => ({ ...s, questions: s.questions.map(q => q.id === id ? { ...q, ...changes } : q) }))
  }

  function deleteQuestion(id) {
    update(s => ({ ...s, questions: s.questions.filter(q => q.id !== id) }))
  }

  function bulkImportQuestions(subjectId, rawText, type = 'mcq', chapter = '', medium = 'english') {
    const blocks = rawText.split('---').map(b => b.trim()).filter(Boolean)
    const imported = []
    blocks.forEach(block => {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean)
      const get = (prefix) => {
        const line = lines.find(l => l.startsWith(prefix + ':'))
        return line ? line.slice(prefix.length + 1).trim() : ''
      }
      const text = get('Q')
      if (!text) return
      imported.push({
        id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        subjectId, type,
        medium: get('MEDIUM') || medium,
        text,
        textUrdu: get('UR'),
        marks: Number(get('MARKS')) || 1,
        answer: get('ANS'),
        chapter: get('CHAP') || chapter,
        priority: get('PRI') || 'all',
        options: type === 'mcq'
          ? ['A', 'B', 'C', 'D'].map(label => ({ label, text: get(label), textUrdu: get(`UR${label}`) })).filter(o => o.text || o.textUrdu)
          : [],
        createdAt: new Date().toISOString(),
      })
    })
    update(s => ({ ...s, questions: [...s.questions, ...imported] }))
    return imported.length
  }

  function savePaper({ name, config, selectedMCQ, selectedShort, selectedLong, ...rest }) {
    const paper = {
      id: `paper_${Date.now()}`,
      name: name || `Paper ${new Date().toLocaleDateString('en-GB')}`,
      config, selectedMCQ, selectedShort, selectedLong,
      ...rest,
      createdAt: new Date().toISOString(),
    }
    update(s => ({ ...s, savedPapers: [paper, ...s.savedPapers] }))
    void api.post('/paper-generator/saved-papers', paper).catch(() => {})
    return paper
  }

  function deleteSavedPaper(id) {
    update(s => ({ ...s, savedPapers: s.savedPapers.filter(p => p.id !== id) }))
  }

  function renameSavedPaper(id, name) {
    update(s => ({ ...s, savedPapers: s.savedPapers.map(p => p.id === id ? { ...p, name } : p) }))
  }

  function updatePaperSettings(changes) {
    update(s => ({ ...s, paperSettings: { ...s.paperSettings, ...changes } }))
  }

  function getQuestionsForPaper({ subjectName, classLevel, type, chapters = [], priority = 'all' }) {
    return store.questions.filter(q => {
      const sub = store.subjects.find(s => s.id === q.subjectId)
      if (!sub) return false
      const nameMatch = sub.name.toLowerCase() === subjectName?.toLowerCase()
      const classMatch = !classLevel || !sub.classLevel || sub.classLevel === classLevel
      const typeMatch = !type || q.type === type
      const chapterMatch = !chapters.length || chapters.includes(q.chapter) || !q.chapter

      const priMatch = priority === 'all' || !q.priority || q.priority === 'all' || q.priority === priority
      return nameMatch && classMatch && typeMatch && chapterMatch && priMatch
    })
  }

  function getChaptersForSubject(subjectName, classLevel) {
    return [...new Set(
      store.questions
        .filter(q => {
          const sub = store.subjects.find(s => s.id === q.subjectId)
          return sub &&
            sub.name.toLowerCase() === subjectName?.toLowerCase() &&
            (!classLevel || sub.classLevel === classLevel) &&
            q.chapter
        })
        .map(q => q.chapter)
    )].filter(Boolean).sort()
  }

  function loadSampleData() {
    update(s => ({ ...s }))
  }

  async function syncWithServer() {
    try {
      window.dispatchEvent(new Event(STORE_SYNC_EVENT))
    } catch (err) {
      console.error('Failed to sync with server:', err)
    }
  }

  return {
    subjects: store.subjects,
    questions: store.questions,
    savedPapers: store.savedPapers,
    publishers: store.publishers,
    questionCategories: store.questionCategories,
    paperSettings: store.paperSettings,
    addSubject, editSubject, deleteSubject,
    addPublisher, deletePublisher,
    updateQuestionCategories,
    addQuestion, editQuestion, deleteQuestion, bulkImportQuestions,
    savePaper, deleteSavedPaper, renameSavedPaper,
    updatePaperSettings,
    getQuestionsForPaper,
    getChaptersForSubject,
    loadSampleData,
    syncWithServer,
  }
}
