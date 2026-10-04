'use client'
// usePaperStore.js — Al Siddique Smart School OS
import { useState, useEffect } from 'react'
import {
  deletePaperOnServer,
  fetchSavedPapersFromServer,
  isPaperVaultAvailable,
  mergeVaultPapers,
  renamePaperOnServer,
  savePaperToServer,
  notifyAdminPaperSaved,
} from './paperVaultService'
import {
  bulkApproveQuestionsToServer,
  deleteQuestionOnServer,
  fetchQuestionsFromServer,
  isQuestionBankAvailable,
  mapServerRowToLocal,
  mergeQuestionBank,
  postQuestionToServer,
  subjectKey,
  updateQuestionOnServer,
} from './questionBankService'

const STORE_KEY = 'al_siddique_paper_store'
const STORE_SYNC_EVENT = 'al_siddique_paper_store_updated'

const SUBJECT_CATEGORY_MAP = {
  urdu: ['mcq', 'wahid_jama', 'mutradif', 'mutzad', 'sentence_correction', 'sentence_usage', 'alfaz_maani', 'comprehension', 'essay', 'letter', 'muhawara', 'grammar'],
  english: ['mcq', 'true_false', 'fill', 'translation', 'essay', 'letter', 'comprehension', 'sentence_correction', 'sentence_usage', 'grammar'],
  default: ['mcq', 'short', 'long', 'diagram', 'numerical', 'definition', 'columns', 'true_false', 'fill'],
}

function getFilteredTypes(subjectName, allTypes) {
  if (!subjectName) return allTypes
  const s = String(subjectName).toLowerCase().trim()
  let keys = SUBJECT_CATEGORY_MAP.default
  if (s.includes('urdu')) keys = SUBJECT_CATEGORY_MAP.urdu
  else if (s.includes('english')) keys = SUBJECT_CATEGORY_MAP.english
  return allTypes.filter(t => keys.includes(t.value))
}

function mergeQuestionTypes(parsedTypes) {
  const parsed = Array.isArray(parsedTypes) ? parsedTypes.filter(t => t?.value) : []
  const seen = new Set(parsed.map(t => t.value))
  const merged = [...parsed]
  for (const t of defaultStore.questionTypes) {
    if (!seen.has(t.value)) merged.push(t)
  }
  merged.forEach(t => {
    if (!t.labelUrdu) {
      const def = defaultStore.questionTypes.find(d => d.value === t.value)
      if (def?.labelUrdu) t.labelUrdu = def.labelUrdu
    }
  })
  return merged
}

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
  questionTypes: [
    { value: 'mcq', label: 'MCQ', labelUrdu: 'کثیر الانتخاب', marks: 1 },
    { value: 'true_false', label: 'True / False', labelUrdu: 'درست / غلط', marks: 1 },
    { value: 'fill', label: 'Fill in Blanks', labelUrdu: 'خالی جگہ پُر کریں', marks: 1 },
    { value: 'columns', label: 'Match Columns', labelUrdu: 'کالم ملائیں', marks: 3 },
    { value: 'short', label: 'Short Question', labelUrdu: 'مختصر سوالات', marks: 2 },
    { value: 'long', label: 'Long Question', labelUrdu: 'تفصیلی سوالات', marks: 5 },
    { value: 'definition', label: 'Definition', labelUrdu: 'تعریف', marks: 2 },
    { value: 'numerical', label: 'Numerical', labelUrdu: 'عددی سوال', marks: 3 },
    { value: 'diagram', label: 'Diagram / Drawing', labelUrdu: 'خاکہ', marks: 5 },
    { value: 'wahid_jama', label: 'Wahid / Jama', labelUrdu: 'واحد جمع', marks: 3 },
    { value: 'mutradif', label: 'Mutradif (Synonym)', labelUrdu: 'مترادف', marks: 2 },
    { value: 'mutzad', label: 'Mutzad (Antonym)', labelUrdu: 'متضاد', marks: 2 },
    { value: 'alfaz_maani', label: "Alfaz ke Ma'ani", labelUrdu: 'الفاظ کے معنی', marks: 2 },
    { value: 'sentence_correction', label: 'Sentence Correction', labelUrdu: 'جملوں کی درستگی', marks: 2 },
    { value: 'sentence_usage', label: 'Sentence Usage', labelUrdu: 'جملوں کا استعمال', marks: 3 },
    { value: 'comprehension', label: 'Comprehension (Tafheem)', labelUrdu: 'تفہیم', marks: 10 },
    { value: 'translation', label: 'Translation', labelUrdu: 'ترجمہ', marks: 3 },
    { value: 'essay', label: 'Essay (Mazmoon)', labelUrdu: 'مضمون', marks: 15 },
    { value: 'letter', label: 'Letter / Application', labelUrdu: 'خط / درخواست', marks: 10 },
    { value: 'muhawara', label: 'Muhawara / Zarb ul Misal', labelUrdu: 'محاورے / ضرب الامثال', marks: 3 },
    { value: 'grammar', label: 'Grammar', labelUrdu: 'قواعد', marks: 2 },
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
      questionTypes: mergeQuestionTypes(parsed.questionTypes),
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

function normalizeSubjectKey({ name = '', classLevel = '', publisher = '' }) {
  return subjectKey(name, classLevel) + (publisher ? `::${String(publisher).trim().toLowerCase()}` : '')
}

let questionBankHydrationPromise = null

async function hydrateQuestionBank(update) {
  if (!isQuestionBankAvailable()) return null
  if (questionBankHydrationPromise) return questionBankHydrationPromise

  questionBankHydrationPromise = (async () => {
    try {
      const serverRows = await fetchQuestionsFromServer()
      if (!Array.isArray(serverRows)) return null
      let mergedSnapshot = null
      update(s => {
        const workingSubjects = [...s.subjects]
        const ensureSubject = ({ name, classLevel = '', publisher = '' }) => {
          const key = subjectKey(name, classLevel)
          let subject = workingSubjects.find(item => subjectKey(item.name, item.classLevel) === key)
          if (!subject) {
            subject = {
              id: `subj_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              name,
              classLevel,
              publisher,
              cover: null,
              createdAt: new Date().toISOString(),
            }
            workingSubjects.push(subject)
          }
          return subject
        }
        const merged = mergeQuestionBank(s.questions, serverRows, workingSubjects, ensureSubject)
        mergedSnapshot = merged
        return { ...s, subjects: merged.subjects, questions: merged.questions }
      })
      return mergedSnapshot
    } catch (err) {
      console.warn('Question bank sync skipped:', err?.message || err)
      return null
    } finally {
      questionBankHydrationPromise = null
    }
  })()

  return questionBankHydrationPromise
}

function syncQuestionToServer(question, subject, update) {
  if (!isQuestionBankAvailable() || !question) return
  const run = question.serverSynced
    ? updateQuestionOnServer(question.id, question, subject)
    : postQuestionToServer(question, subject)

  run
    .then((row) => {
      if (!row?.id) return
      update(s => ({
        ...s,
        questions: s.questions.map(q => q.id === question.id
          ? { ...mapServerRowToLocal(row, subject?.id || q.subjectId), serverSynced: true }
          : q),
      }))
    })
    .catch((err) => console.warn('Question bank save failed:', err?.message || err))
}

export function usePaperStore() {
  const [store, setStore] = useState(defaultStore)

  useEffect(() => {
    // Hydrate client state from localStorage
    setStore(loadStore())

    if (isPaperVaultAvailable()) {
      fetchSavedPapersFromServer()
        .then((serverPapers) => {
          if (!Array.isArray(serverPapers)) return
          setStore(prev => {
            const merged = mergeVaultPapers(prev.savedPapers || [], serverPapers)
            const next = { ...prev, savedPapers: merged }
            saveStore(next)
            return next
          })
        })
        .catch((err) => console.warn('Paper vault sync skipped:', err?.message || err))
    }

    hydrateQuestionBank((updater) => {
      setStore(prev => {
        const next = updater(prev)
        saveStore(next)
        return next
      })
    }).catch(() => {})

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

  function findSubjectByIdentity({ name = '', classLevel = '', publisher = '' }) {
    const targetKey = normalizeSubjectKey({ name, classLevel, publisher })
    return store.subjects.find(sub => normalizeSubjectKey({
      name: sub.name,
      classLevel: sub.classLevel,
      publisher: sub.publisher,
    }) === targetKey) || null
  }

  function ensureSubject({ name, nameUrdu = '', publisher = '', cover = null, classLevel = '' }) {
    const existing = findSubjectByIdentity({ name, classLevel, publisher })
    if (existing) return existing
    return addSubject({ name, nameUrdu, publisher, cover, classLevel })
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
    const subject = store.subjects.find(s => s.id === subjectId)
    syncQuestionToServer(q, subject, update)
    return q
  }

  function editQuestion(id, changes) {
    const question = store.questions.find(q => q.id === id)
    if (!question) return
    const nextQuestion = { ...question, ...changes }
    const subject = store.subjects.find(s => s.id === nextQuestion.subjectId)
    update(s => ({ ...s, questions: s.questions.map(q => q.id === id ? { ...q, ...changes, updatedAt: new Date().toISOString() } : q) }))
    syncQuestionToServer(nextQuestion, subject, update)
  }

  function deleteQuestion(id) {
    const question = store.questions.find(q => q.id === id)
    update(s => ({ ...s, questions: s.questions.filter(q => q.id !== id) }))
    if (question?.serverSynced && isQuestionBankAvailable()) {
      deleteQuestionOnServer(id).catch((err) => console.warn('Question bank delete failed:', err?.message || err))
    }
  }

  function importPaperQuestionsToBank({
    subjectId = '',
    subjectMeta = {},
    selectedMCQ = [],
    selectedShort = [],
    selectedLong = [],
    selectedQuestions = {},
    medium = 'english',
    chapter = '',
    source = 'paper',
    priority = 'exercise',
  } = {}) {
    const subject = subjectId
      ? store.subjects.find(sub => sub.id === subjectId) || null
      : ensureSubject(subjectMeta)
    const resolvedSubjectId = subject?.id || subjectId || null
    if (!resolvedSubjectId) return { total: 0, mcq: 0, short: 0, long: 0, subject: null }

    const buckets = [
      { type: 'mcq', list: selectedMCQ, defaultMarks: 1 },
      { type: 'short', list: selectedShort, defaultMarks: 2 },
      { type: 'long', list: selectedLong, defaultMarks: 5 },
    ]
    Object.entries(selectedQuestions || {}).forEach(([type, payload]) => {
      const questions = Array.isArray(payload) ? payload : (Array.isArray(payload?.questions) ? payload.questions : [])
      if (!questions.length) return
      buckets.push({ type, list: questions, defaultMarks: Number(payload?.marks) || 2 })
    })

    const imported = []
    buckets.forEach(({ type, list, defaultMarks }) => {
      ;(list || []).forEach(item => {
        const text = item?.text || item?.en || item?.question || ''
        const textUrdu = item?.textUrdu || item?.ur || item?.urdu || ''
        if (!text && !textUrdu) return
        imported.push({
          id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          subjectId: resolvedSubjectId,
          type,
          medium: item?.medium || medium,
          text,
          textUrdu,
          options: Array.isArray(item?.options) ? item.options : [],
          answer: item?.answer || '',
          marks: Number(item?.marks) || defaultMarks,
          chapter: item?.chapter || chapter || '',
          priority: item?.priority || priority,
          source,
          createdAt: new Date().toISOString(),
        })
      })
    })

    if (!imported.length) return { total: 0, mcq: 0, short: 0, long: 0, subject }

    update(s => ({ ...s, questions: [...s.questions, ...imported] }))
    if (isQuestionBankAvailable()) {
      bulkApproveQuestionsToServer(imported, subject)
        .then((rows) => {
          if (!Array.isArray(rows) || !rows.length) return
          update(s => ({
            ...s,
            questions: s.questions.map((q) => {
              const index = imported.findIndex(item => item.id === q.id)
              if (index < 0) return q
              const row = rows[index]
              if (!row) return q
              return { ...mapServerRowToLocal(row, resolvedSubjectId), serverSynced: true }
            }),
          }))
        })
        .catch((err) => console.warn('Question bank bulk sync failed:', err?.message || err))
    }

    return {
      total: imported.length,
      mcq: imported.filter(q => q.type === 'mcq').length,
      short: imported.filter(q => q.type === 'short').length,
      long: imported.filter(q => q.type === 'long').length,
      subject,
    }
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
    if (isQuestionBankAvailable()) {
      const subject = store.subjects.find(s => s.id === subjectId)
      bulkApproveQuestionsToServer(imported, subject || { name: '', classLevel: '' })
        .then((rows) => {
          if (!Array.isArray(rows) || !rows.length) return
          update(s => ({
            ...s,
            questions: s.questions.map((q) => {
              const index = imported.findIndex(item => item.id === q.id)
              if (index < 0) return q
              const row = rows[index]
              if (!row) return q
              return { ...mapServerRowToLocal(row, subjectId), serverSynced: true }
            }),
          }))
        })
        .catch((err) => console.warn('Question bank bulk sync failed:', err?.message || err))
    }
    return imported.length
  }

  function savePaper({ name, config, selectedMCQ, selectedShort, selectedLong, ...rest }) {
    const paper = {
      id: `paper_${Date.now()}`,
      name: name || `Paper ${new Date().toLocaleDateString('en-GB')}`,
      config, selectedMCQ, selectedShort, selectedLong,
      ...rest,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    update(s => ({ ...s, savedPapers: [paper, ...s.savedPapers] }))
    if (isPaperVaultAvailable()) {
      savePaperToServer(paper)
        .then((saved) => {
          if (!saved?.id) return
          update(s => ({
            ...s,
            savedPapers: s.savedPapers.map(p => p.id === paper.id ? { ...p, ...saved, serverSynced: true } : p),
          }))
          notifyAdminPaperSaved(saved).catch(() => {})
        })
        .catch((err) => console.warn('Paper vault save failed:', err?.message || err))
    }
    return paper
  }

  function deleteSavedPaper(id) {
    update(s => ({ ...s, savedPapers: s.savedPapers.filter(p => p.id !== id) }))
    if (isPaperVaultAvailable()) {
      deletePaperOnServer(id).catch((err) => console.warn('Paper vault delete failed:', err?.message || err))
    }
  }

  function renameSavedPaper(id, name) {
    update(s => ({ ...s, savedPapers: s.savedPapers.map(p => p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p) }))
    if (isPaperVaultAvailable()) {
      renamePaperOnServer(id, name).catch((err) => console.warn('Paper vault rename failed:', err?.message || err))
    }
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
      await hydrateQuestionBank(update)
      window.dispatchEvent(new Event(STORE_SYNC_EVENT))
    } catch (err) {
      console.error('Failed to sync with server:', err)
    }
  }

  function getFilteredQuestionTypes(subjectName) {
    const allTypes = store.questionTypes || defaultStore.questionTypes
    return getFilteredTypes(subjectName, allTypes)
  }

  return {
    subjects: store.subjects,
    questions: store.questions,
    savedPapers: store.savedPapers,
    publishers: store.publishers,
    questionCategories: store.questionCategories,
    questionTypes: store.questionTypes || defaultStore.questionTypes,
    paperSettings: store.paperSettings,
    addSubject, editSubject, deleteSubject,
    ensureSubject, findSubjectByIdentity,
    addPublisher, deletePublisher,
    updateQuestionCategories,
    addQuestion, editQuestion, deleteQuestion, bulkImportQuestions,
    importPaperQuestionsToBank,
    savePaper, deleteSavedPaper, renameSavedPaper,
    updatePaperSettings,
    getQuestionsForPaper,
    getChaptersForSubject,
    getFilteredQuestionTypes,
    loadSampleData,
    syncWithServer,
  }
}
