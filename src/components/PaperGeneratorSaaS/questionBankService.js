import api from '@/utils/api'

function hasAuth() {
  try {
    return Boolean(typeof window !== 'undefined' && (localStorage.getItem('token') || localStorage.getItem('al_siddique_token')))
  } catch {
    return false
  }
}

export function isQuestionBankAvailable() {
  return hasAuth()
}

function parseOptions(options) {
  if (Array.isArray(options)) return options
  if (typeof options === 'string') {
    try {
      const parsed = JSON.parse(options)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

function norm(value = '') {
  return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase()
}

export function normalizeQuestionType(type = '') {
  const value = String(type || '').toLowerCase()
  if (['mcq', 'short', 'long'].includes(value)) return value
  if (value.includes('mcq') || value === 'objective') return 'mcq'
  if (value.includes('long') || value === 'essay') return 'long'
  if (value.includes('short')) return 'short'
  return value || 'short'
}

export function mapServerRowToLocal(row, subjectId = '') {
  return {
    id: row.id,
    subjectId,
    subject: row.subject || '',
    classLevel: row.class_level || '',
    type: normalizeQuestionType(row.question_type),
    medium: row.medium || 'english',
    text: row.question_text || '',
    textUrdu: row.question_text_urdu || '',
    en: row.question_text || '',
    ur: row.question_text_urdu || '',
    options: parseOptions(row.options),
    answer: row.answer || row.correct_option || '',
    marks: Number(row.marks) || 1,
    chapter: row.chapter_name || '',
    topic: row.topic_name || '',
    priority: row.priority || 'all',
    difficulty: row.difficulty || 'medium',
    serverSynced: true,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || row.created_at || row.created_at,
  }
}

export function mapLocalToServerPayload(question = {}, subject = {}) {
  return {
    class_level: subject.classLevel || question.classLevel || '',
    subject: subject.name || question.subject || '',
    medium: question.medium || 'english',
    board: subject.publisher || question.board || 'Punjab Board',
    chapter_name: question.chapter || '',
    topic_name: question.topic || '',
    question_type: question.type || 'short',
    question_text: question.text || question.en || '',
    question_text_urdu: question.textUrdu || question.ur || '',
    options: question.options || [],
    correct_option: question.answer || '',
    answer: question.answer || '',
    marks: Number(question.marks) || 1,
    priority: question.priority || 'exercise',
    is_approved: true,
  }
}

export async function fetchQuestionsFromServer() {
  if (!hasAuth()) return null
  const all = []
  let offset = 0
  const limit = 200

  while (true) {
    const { data } = await api.get(`/question-bank?limit=${limit}&offset=${offset}&approved=true`)
    if (!data?.success) throw new Error(data?.message || 'Could not load question bank')
    const batch = Array.isArray(data.data) ? data.data : []
    all.push(...batch)
    const total = Number(data.meta?.total || batch.length)
    offset += batch.length
    if (!batch.length || offset >= total) break
    if (offset >= 5000) break
  }

  return all
}

export async function postQuestionToServer(question, subject = {}) {
  if (!hasAuth()) return null
  const { data } = await api.post('/question-bank', mapLocalToServerPayload(question, subject))
  if (!data?.success) throw new Error(data?.message || 'Could not save question')
  return data.data
}

export async function updateQuestionOnServer(id, question, subject = {}) {
  if (!hasAuth()) return null
  const { data } = await api.put(`/question-bank/${encodeURIComponent(id)}`, mapLocalToServerPayload(question, subject))
  if (!data?.success) throw new Error(data?.message || 'Could not update question')
  return data.data
}

export async function deleteQuestionOnServer(id) {
  if (!hasAuth()) return false
  const { data } = await api.delete(`/question-bank/${encodeURIComponent(id)}`)
  if (!data?.success) throw new Error(data?.message || 'Could not delete question')
  return true
}

export async function bulkApproveQuestionsToServer(questions = [], subject = {}) {
  if (!hasAuth() || !questions.length) return null
  const payload = questions.map(question => ({
    ...mapLocalToServerPayload(question, subject),
    classLevel: subject.classLevel || question.classLevel,
    chapter: question.chapter,
    chapterName: question.chapter,
    type: question.type,
    en: question.text,
    ur: question.textUrdu,
    text: question.text,
    textUrdu: question.textUrdu,
  }))
  const { data } = await api.post('/question-bank/import/approve', { questions: payload })
  if (!data?.success) throw new Error(data?.message || 'Could not sync questions')
  return Array.isArray(data.data) ? data.data : []
}

export function subjectKey(name = '', classLevel = '') {
  return `${norm(name)}::${norm(classLevel)}`
}

export function mergeQuestionBank(localQuestions = [], serverRows = [], subjects = [], ensureSubject) {
  const nextSubjects = [...subjects]
  const keyMap = new Map(nextSubjects.map(sub => [subjectKey(sub.name, sub.classLevel), sub]))

  const resolveSubjectId = (row) => {
    const key = subjectKey(row.subject, row.class_level)
    if (keyMap.has(key)) return keyMap.get(key).id
    if (!ensureSubject) return ''
    const created = ensureSubject({
      name: row.subject,
      classLevel: row.class_level,
      subjects: nextSubjects,
      keyMap,
    })
    if (created?.id) {
      if (!keyMap.has(key)) {
        nextSubjects.push(created)
        keyMap.set(key, created)
      }
      return created.id
    }
    return ''
  }

  const map = new Map()
  for (const question of localQuestions) {
    if (!question?.id) continue
    map.set(String(question.id), { ...question, serverSynced: Boolean(question.serverSynced) })
  }

  for (const row of serverRows) {
    const subjectId = resolveSubjectId(row)
    const mapped = mapServerRowToLocal(row, subjectId)
    const key = String(mapped.id)
    const existing = map.get(key)
    const serverTime = Date.parse(mapped.updatedAt || mapped.createdAt || 0)
    const localTime = Date.parse(existing?.updatedAt || existing?.createdAt || 0)
    map.set(
      key,
      serverTime >= localTime
        ? { ...existing, ...mapped, serverSynced: true }
        : { ...mapped, ...existing, serverSynced: Boolean(existing?.serverSynced) },
    )
  }

  return {
    subjects: nextSubjects,
    questions: Array.from(map.values()).sort(
      (a, b) => Date.parse(b.updatedAt || b.createdAt || 0) - Date.parse(a.updatedAt || a.createdAt || 0),
    ),
  }
}
