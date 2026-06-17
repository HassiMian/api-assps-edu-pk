import api from '@/utils/api'

export const MODEL_OPTIONS = [
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Stable)', free: true },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', free: false },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', free: true },
  { id: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite (Free & Fast)', free: true },
]

export const DEFAULT_MODEL = 'gemini-2.5-flash'

export function normalizePreferredModel(model) {
  const value = String(model || '').trim()
  return MODEL_OPTIONS.some(option => option.id === value) ? value : DEFAULT_MODEL
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

function normalizeQuestionItem(q = {}, fallbackType = 'short') {
  return {
    ...q,
    id: q.id || `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type: q.type || fallbackType,
    text: q.text || q.question || q.en || '',
    textUrdu: q.textUrdu || q.ur || '',
    options: Array.isArray(q.options) ? q.options.map(o => ({
      label: o.label || o.key || '',
      text: o.text || o.en || '',
      textUrdu: o.textUrdu || o.ur || '',
    })) : [],
    answer: q.answer || '',
    marks: Number(q.marks || (fallbackType === 'mcq' ? 1 : fallbackType === 'short' ? 2 : 5)),
    chapter: q.chapter || q.chapter_name || '',
    priority: q.priority || 'exercise',
    difficulty: q.difficulty || 'medium',
    language: q.language || 'mixed',
    sourcePage: q.sourcePage || '',
    confidence: Number.isFinite(Number(q.confidence)) ? Number(q.confidence) : 0,
  }
}

function normalizeQuestionList(list = []) {
  return Array.isArray(list) ? list.map(q => normalizeQuestionItem(q, q.type || 'short')) : []
}

function normalizeScannerResult(result = {}) {
  const sections = Array.isArray(result.sections) ? result.sections : []
  const legacy = { mcq: [], short: [], long: [] }

  sections.forEach(section => {
    const bucket = section.type === 'mcq' ? 'mcq' : section.type === 'long' ? 'long' : 'short'
    ;(section.questions || []).forEach(q => {
      legacy[bucket].push(normalizeQuestionItem(q, bucket))
    })
  })

  if (!sections.length) {
    legacy.mcq = normalizeQuestionList(result.mcq || [])
    legacy.short = normalizeQuestionList(result.short || [])
    legacy.long = normalizeQuestionList(result.long || [])
  }

  return {
    ...result,
    sections,
    warnings: Array.isArray(result.warnings) ? result.warnings : [],
    mcq: legacy.mcq,
    short: legacy.short,
    long: legacy.long,
  }
}

function toFormData(fields = {}, files = []) {
  const form = new FormData()
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    form.append(key, String(value))
  })
  ;(Array.isArray(files) ? files : [files]).filter(Boolean).forEach(file => {
    form.append('files', file, file.name || 'upload')
  })
  return form
}

async function waitForJob(jobId, onProgress, timeoutMs = 10 * 60 * 1000) {
  const startedAt = Date.now()
  let delay = 900

  while (Date.now() - startedAt < timeoutMs) {
    const { data } = await api.get(`/paper/jobs/${jobId}`)
    const job = data?.job || data

    if (job?.status === 'completed') return job
    if (job?.status === 'failed') {
      const errorMessage = typeof job.error === 'string'
        ? job.error
        : job.error?.message || job.message || 'AI job failed.'
      throw new Error(errorMessage)
    }

    onProgress?.(job?.message || 'Processing...', Number(job?.progress || 0))
    await sleep(delay)
    delay = Math.min(Math.round(delay * 1.25), 2500)
  }

  throw new Error('AI job timed out. Please retry.')
}

export async function scanHandwrittenPaper(_apiKey, config, imageFiles, onProgress, preferredModel = DEFAULT_MODEL) {
  const model = normalizePreferredModel(preferredModel)
  onProgress?.('Uploading pages to the secure AI queue...', 10)

  const form = toFormData({
    classLevel: config?.classLevel || '',
    class: config?.classLevel || '',
    subject: config?.subject || '',
    examType: config?.examType || '',
    language: config?.language || 'mixed',
    paperTitle: config?.paperTitle || '',
    chapterNumber: config?.chapterNumber || '',
    chapterName: config?.chapterName || '',
    preferredModel: model,
    model,
  }, imageFiles)

  const { data } = await api.post('/paper/scan-handwritten', form)
  if (data?.jobId) {
    const job = await waitForJob(data.jobId, onProgress)
    return normalizeScannerResult(job?.result || {})
  }

  return normalizeScannerResult(data?.job?.result || data?.result || data || {})
}

export async function extractQuestionsFromFile(_apiKey, config, file, pastedText, onProgress, preferredModel = DEFAULT_MODEL) {
  const model = normalizePreferredModel(preferredModel)
  const body = {
    subject: config?.subject || '',
    classLevel: config?.classLevel || '',
    medium: config?.medium || 'english',
    chapterNumber: config?.chapterNumber || config?.chapterNo || '',
    chapterName: config?.chapterName || '',
    structureMode: config?.structureMode || 'standard',
    preferredModel: model,
    model,
  }

  if (file && String(file.name || '').toLowerCase().endsWith('.txt')) {
    const text = await file.text()
    return extractQuestionsFromFile(null, config, null, text, onProgress, model)
  }

  if (file) {
    onProgress?.('Uploading file to the secure AI queue...', 10)
    const { data } = await api.post('/paper/extract-questions', toFormData(body, file))
    if (data?.jobId) {
      const job = await waitForJob(data.jobId, onProgress)
      return normalizeQuestionList(job?.result?.questions || job?.result || [])
    }
    return normalizeQuestionList(data?.job?.result?.questions || data?.result?.questions || data?.questions || [])
  }

  if (pastedText && String(pastedText).trim()) {
    onProgress?.('Submitting pasted text to the secure AI queue...', 10)
    const { data } = await api.post('/paper/extract-questions', {
      ...body,
      text: String(pastedText).trim(),
    })
    if (data?.jobId) {
      const job = await waitForJob(data.jobId, onProgress)
      return normalizeQuestionList(job?.result?.questions || job?.result || [])
    }
    return normalizeQuestionList(data?.job?.result?.questions || data?.result?.questions || data?.questions || [])
  }

  return []
}

export async function generateWithGemini(_apiKey, config, preferredModel = DEFAULT_MODEL) {
  const model = normalizePreferredModel(preferredModel)
  const { data } = await api.post('/paper/generate', {
    class: config?.classLevel || '',
    subject: config?.subject || '',
    chapters: config?.chapters || [],
    mcqCount: Number(config?.mcqCount || 0),
    shortCount: Number(config?.shortCount || 0),
    longCount: Number(config?.longCount || 0),
    language: config?.medium || 'english',
    preferredModel: model,
  })

  return {
    result: {
      mcq: normalizeQuestionList(data?.mcq || data?.result?.mcq || []),
      short: normalizeQuestionList(data?.short || data?.result?.short || []),
      long: normalizeQuestionList(data?.long || data?.result?.long || []),
    },
    model: data?.model || model,
  }
}

export async function getAiConfig() {
  const { data } = await api.get('/paper/ai/config')
  return data
}

export async function testAiConnection(_apiKey, preferredModel = DEFAULT_MODEL) {
  const { data } = await api.post('/paper/ai/test-key', {
    preferredModel: normalizePreferredModel(preferredModel),
  })
  return {
    success: true,
    message: data?.message || 'Connected successfully!',
    model: data?.model || normalizePreferredModel(preferredModel),
  }
}
