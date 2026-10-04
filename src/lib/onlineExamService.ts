import api from '@/utils/api'

export type OnlineQuestion = {
  id: number
  text: string
  type: 'mcq' | 'short'
  options?: string[]
  correct: string
  marks: number
}

export type OnlineExam = {
  id: number | string
  title: string
  subject?: string
  class?: string
  duration: number
  total_marks: number
  status?: string
  questions: OnlineQuestion[]
}

function normalizeOptions(options: unknown[] = []) {
  return (options || [])
    .map((o) => {
      if (typeof o === 'string') return o
      if (o && typeof o === 'object') {
        const row = o as { text?: string; label?: string; value?: string }
        return row.text || row.label || row.value || ''
      }
      return String(o || '')
    })
    .filter(Boolean)
}

export function buildOnlineQuestions(
  selectedMCQ: Array<Record<string, unknown>> = [],
  selectedShort: Array<Record<string, unknown>> = [],
  selectedLong: Array<Record<string, unknown>> = [],
) {
  let id = 1
  const questions: OnlineQuestion[] = []

  for (const q of selectedMCQ) {
    const options = normalizeOptions((q.options as unknown[]) || [])
    const answer = String(q.answer || q.correctAnswer || '').trim()
    const correct =
      answer.length === 1 && /^[a-d]$/i.test(answer) && options.length
        ? options[answer.toUpperCase().charCodeAt(0) - 65] || answer
        : answer

    questions.push({
      id: id++,
      text: String(q.text || q.textUrdu || ''),
      type: 'mcq',
      options,
      correct,
      marks: Number(q.marks) || 1,
    })
  }

  for (const q of selectedShort) {
    questions.push({
      id: id++,
      text: String(q.text || q.textUrdu || ''),
      type: 'short',
      correct: String(q.answer || '').trim(),
      marks: Number(q.marks) || 2,
    })
  }

  for (const q of selectedLong) {
    questions.push({
      id: id++,
      text: String(q.text || q.textUrdu || ''),
      type: 'short',
      correct: String(q.answer || '').trim(),
      marks: Number(q.marks) || 5,
    })
  }

  return questions
}

export async function publishOnlineExam({
  config,
  selectedMCQ,
  selectedShort,
  selectedLong,
}: {
  config: { title?: string; subject?: string; classLevel?: string; duration?: number }
  selectedMCQ: Array<Record<string, unknown>>
  selectedShort: Array<Record<string, unknown>>
  selectedLong: Array<Record<string, unknown>>
}) {
  const questions = buildOnlineQuestions(selectedMCQ, selectedShort, selectedLong)
  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0)
  const res = await api.post('/exams/online/publish', {
    title: config.title || 'Online Exam',
    subject: config.subject || '',
    class: config.classLevel ? `Class ${config.classLevel}` : '',
    duration: Number(config.duration) || 30,
    total_marks: totalMarks,
    questions,
  })
  return res.data?.data
}

export async function fetchOnlineExam(examId: string | number) {
  const res = await api.get(`/exams/${examId}`)
  return res.data?.data as OnlineExam
}

export async function fetchAvailableOnlineExams() {
  const res = await api.get('/exams/online/available')
  return { exams: res.data?.data || [], meta: res.data?.meta || {} }
}

export async function fetchOnlineExamList() {
  const res = await api.get('/exams/online/list')
  return res.data?.data || []
}

export async function fetchOnlineExamAttempts(examId: string | number) {
  const res = await api.get(`/exams/online/${examId}/attempts`)
  return res.data?.data
}

export async function closeOnlineExam(examId: string | number) {
  const res = await api.patch(`/exams/online/${examId}/close`)
  return res.data?.data
}

export async function submitOnlineExamAttempt(
  examId: string | number,
  payload: { score: number; total_marks: number; pct: number; answers: Record<string | number, string> },
) {
  const res = await api.post(`/exams/online/${examId}/submit`, payload)
  return res.data?.data
}
