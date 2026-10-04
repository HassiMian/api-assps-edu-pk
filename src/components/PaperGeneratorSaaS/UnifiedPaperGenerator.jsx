'use client'
import { useEffect, useMemo, useState } from 'react'
import { usePaperStore } from './usePaperStore'
import { extractQuestionsFromFile, generateWithGemini, generateGapFillWithGemini, generateModelAnswers } from './geminiService'
import PTSPaperGenerator from './PTSPaperGenerator'
import PaperDocumentEditor from './editor/PaperDocumentEditor'
import SavedPaperLibraryPanel from './SavedPaperLibraryPanel'
import PaperAiJobsPanel from './PaperAiJobsPanel'
import { normalizeSavedPaperForLoad, consumeQueuedSavedPaper } from './savedPaperUtils'
import {
  exportPaperAsDocx,
  exportAnswerKeyAsDocx,
  printAnswerKeyDocument,
  generatePaperSets,
  describePaperSetStrategy,
  printPaperSets,
  printMarkingSchemeDocument,
  exportMarkingSchemeAsDocx,
  sharePaperViaWhatsApp,
  sharePaperAsPdf,
  sharePaperPackage,
  mergeAiAnswersIntoReviewItems,
} from './paperExportUtils'
import {
  LOWER_CLASS_TYPES,
  SCHOOL_ASSESSMENT_TYPES,
  UNIFIED_PATTERN_LIBRARY,
  EXTENDED_PATTERN_LIBRARY,
  URDU_CATEGORY_LABELS,
  findUnifiedPattern,
  buildNumberedQuestionPattern,
  listPatternsForSelection,
  getClassTier,
} from './unifiedPatternLibrary'

const C = {
  bg: '#071e34',
  panel: 'rgba(11,44,77,0.82)',
  panel2: 'rgba(15,23,42,0.58)',
  gold: '#C8991A',
  gold2: '#b8860b',
  silver: '#d8e2f0',
  muted: '#94A3B8',
  border: 'rgba(148,163,184,0.2)',
  red: '#FF375F',
  green: '#30D158',
  blue: '#0A84FF',
}

function confidencePct(value) {
  return Math.round(Math.max(0, Math.min(Number(value || 0), 1)) * 100)
}

function confidenceColor(value) {
  const n = Number(value || 0)
  if (n >= 0.85) return C.green
  if (n >= 0.7) return '#FFB84D'
  return C.red
}

function isReviewReady(item) {
  return item?.reviewStatus === 'Ready' || item?.reviewStatus === 'Approved'
}

const PAPER_INTENTS = ['Board Pattern Paper', 'School Assessment', 'Chapter Test', 'Monthly Test', 'Term Paper', 'Worksheet', 'Revision Paper', 'Custom Paper']
const QUESTION_SOURCES = ['Question Bank', 'AI Generate', 'Manual Paste', 'Mixed Source', 'Uploaded Content Review']
const CLASSES = Array.from({ length: 12 }, (_, i) => String(i + 1))
const SUBJECTS = ['Biology', 'Physics', 'Chemistry', 'Mathematics', 'Urdu', 'English', 'Computer Science', 'Pakistan Studies', 'Islamiyat', 'Tarjuma-tul-Quran', 'Science', 'General Knowledge']
const MEDIUMS = ['English', 'Urdu', 'Dual Medium']
const DRAFT_KEY = 'assps_unified_paper_generator_drafts'

function safeId(prefix = 'upg') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function duplicateHash(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

function isUrduText(text = '') {
  return /[\u0600-\u06ff]/.test(String(text))
}

function normalizeType(line = '') {
  const t = String(line).toLowerCase()
  if (/mcq|objective|درست جواب|انتخاب/.test(t)) return 'MCQ'
  if (/fill|blank|خالی/.test(t)) return 'Fill in the Blanks'
  if (/true|false|درست\s*\/\s*غلط|غلط/.test(t)) return 'True/False'
  if (/match|columns|ملائیں/.test(t)) return 'Match the Columns'
  if (/translate|translation|ترجمہ/.test(t)) return isUrduText(line) ? 'Idiomatic Translation' : 'Translation'
  if (/essay|مضمون/.test(t)) return 'Essay'
  if (/letter|خط/.test(t)) return 'Letter'
  if (/application|درخواست/.test(t)) return 'Application'
  if (/story/.test(t)) return 'Story'
  if (/dialogue/.test(t)) return 'Dialogue'
  if (/comprehension|عبارت/.test(t)) return 'Comprehension'
  if (/diagram|label/.test(t)) return 'Diagram'
  if (/numerical|calculate|solve|unit|formula|equation|balance|derive|graph/.test(t)) return 'Short Question'
  if (/theorem/.test(t)) return 'Theorem'
  if (/تشریح|اشعار/.test(t)) return 'Explanation'
  if (/long|تفصیلی/.test(t)) return 'Long Question'
  return 'Short Question'
}

function guessCategory(text = '', subject = '') {
  const line = String(text)
  if (isUrduText(line)) {
    const match = URDU_CATEGORY_LABELS.find(label => line.includes(label))
    if (match) return match
    if (/تشریح|وضاحت/.test(line)) return 'تشریح'
    if (/خلاصہ/.test(line)) return 'خلاصہ'
    if (/معنی/.test(line)) return 'الفاظ کے معنی'
    if (/درخواست/.test(line)) return 'درخواست'
    if (/خط/.test(line)) return 'خط'
    if (/مضمون/.test(line)) return 'مضمون'
    return subject === 'Urdu' ? 'سوالات کے مختصر جوابات' : 'مختصر سوالات'
  }
  const type = normalizeType(line)
  const lower = line.toLowerCase()
  if (type === 'MCQ') return 'Objective'
  if (/write the meanings?|meanings? of|word meanings?|vocabulary/.test(lower)) return 'Grammar'
  if (/complete each of the sentences|complete the sentences|fill in the blanks?/.test(lower)) return 'Fill in the Blanks'
  if (/translate into urdu|translate into english|translation/.test(lower)) return 'Translation'
  if (type === 'Diagram') return 'Diagram-based'
  if (/numerical|calculate|solve/.test(lower)) return 'Numerical'
  if (/formula|unit|derive|graph/.test(lower)) return 'Formula-based'
  if (/equation|reaction|balance/.test(lower)) return 'Chemical Equation'
  if (/define|definition|what is/.test(lower)) return 'Short Question'
  if (type === 'Theorem') return 'Theorem'
  if (type === 'Translation') return 'Translation'
  return type
}

function normalizeIndicDigits(value = '') {
  const maps = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
  }
  return String(value || '').replace(/[۰-۹٠-٩]/g, digit => maps[digit] || digit)
}

function parseQuestionNumber(value = '') {
  const text = normalizeIndicDigits(value)
  const match = text.match(/(?:^|\n)\s*(?:q(?:uestion)?\.?|سوال(?:\s*نمبر)?|س)\s*[:.\-]?\s*(\d{1,2})/i)
  return match ? Number(match[1]) : 0
}

function sanitizePasteText(value = '') {
  return normalizeIndicDigits(String(value || ''))
    .replace(/\r/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/[•●▪◦]/g, '\n- ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function stripLeadingQuestionMarker(text = '') {
  return String(text || '')
    .replace(/^\s*(?:q(?:uestion)?\.?\s*\d+|سوال(?:\s*نمبر)?\s*\d+|\d+\s*[.)-])\s*/i, '')
    .trim()
}

const TOP_LEVEL_QUESTION_LINE_RE = /^\s*(\d{1,2})\s*[.)]\s+(.+)$/
const SUBPART_LINE_RE = /^\s*((?:i{1,3}|iv|v|vi{0,3}|ix|x)|[a-d])\s*[-.)]\s+(.+)$/i

function isAssessmentHeaderLine(text = '') {
  const line = String(text || '').trim()
  if (!line) return false
  if (/^ass(?:essment)?\s*#?\s*\d+/i.test(line)) return true
  if (/^total\s*marks?\s*:/i.test(line)) return true
  if (/^\d{1,2}(?:st|nd|rd|th)\s+(english|urdu|math(?:ematics)?|science|biology|physics|chemistry|computer(?:\s*science)?|islamiyat|pakistan\s*studies)/i.test(line)) return true
  return false
}

function extractPromptAndMarks(headerText = '') {
  const text = String(headerText || '').trim()
  const instructional = /answer|make|find|think|translate|write|define|explain|complete|fill|choose|solve|attempt|read|list|give|name|state|circle|match|turn|change|rewrite|use/i
  const markPatterns = [
    /^(.+?)[\s.:–-]+\[(\d{1,3})\]\s*$/,
    /^(.+?)[\s.:–-]+\((\d{1,3})\s*marks?\)\s*$/i,
    /^(.+?)[\s.:–-]+(\d{1,3})\s*marks?\s*$/i,
    /^(.+?)[\s.:–-]+(\d{1,3})\s*$/,
  ]
  for (let index = 0; index < markPatterns.length; index += 1) {
    const match = text.match(markPatterns[index])
    if (!match) continue
    const prompt = match[1].replace(/[.\s:–-]+$/, '').trim()
    const strictSuffix = index === markPatterns.length - 1
    if (!strictSuffix || instructional.test(prompt)) {
      return { prompt, marks: Number(match[2]) }
    }
  }
  return { prompt: text.replace(/[.\s]+\d{1,3}\s*marks?\s*$/i, '').replace(/[.\s]+\d{1,3}\s*$/, '').trim(), marks: null }
}

function formatPassageBlock(lines = []) {
  const cleaned = lines.map(line => String(line || '').trim()).filter(Boolean)
  if (!cleaned.length) return ''
  cleaned[0] = cleaned[0].replace(/^["“'']+/, '')
  cleaned[cleaned.length - 1] = cleaned[cleaned.length - 1].replace(/["”''],?\s*$/, '')

  const englishLines = []
  const urduLines = []
  cleaned.forEach(line => {
    if (isUrduText(line)) urduLines.push(line)
    else englishLines.push(line)
  })
  if (englishLines.length && urduLines.length) {
    return `${englishLines.join('\n')}\n\n${urduLines.join('\n')}`
  }
  return cleaned.join('\n').trim()
}

function inferTypeFromAssessmentPrompt(prompt = '') {
  const value = String(prompt || '').toLowerCase()
  if (/mcq|choose the correct|objective|circle the correct/.test(value)) return 'MCQ'
  if (/translate/.test(value)) return 'Translation'
  if (/make adjectives|adjectives|opposite meaning|antonym|synonym|suitable adjectives|grammar|fill in the blank|true\s*\/\s*false|meanings? of/.test(value)) return 'Grammar'
  if (/essay|paragraph|story|letter|application|summary|central idea/.test(value)) return 'Long Question'
  return 'Short Question'
}

function formatGroupedQuestionText(block = {}) {
  const lines = []
  const subparts = []
  const extras = []
  let passageLines = []
  const flushPassage = () => {
    if (!passageLines.length) return
    const passage = formatPassageBlock(passageLines)
    if (passage) extras.push(passage)
    passageLines = []
  }

  for (const line of block.bodyLines || []) {
    const trimmed = String(line || '').trim()
    if (!trimmed) {
      if (passageLines.length) passageLines.push('')
      continue
    }
    const subpart = trimmed.match(SUBPART_LINE_RE)
    if (subpart) {
      flushPassage()
      subparts.push({ marker: subpart[1].toLowerCase(), text: subpart[2].trim() })
      continue
    }
    const looksLikePassage = passageLines.length > 0
      || /^["“'']/.test(trimmed)
      || /(?:poem|passage|stanza|translate|paragraph)/i.test(block.prompt || '')
    if (looksLikePassage && !subparts.length) passageLines.push(trimmed)
    else {
      flushPassage()
      extras.push(trimmed)
    }
  }
  flushPassage()

  subparts.forEach(part => lines.push(`(${part.marker}) ${part.text}`))
  if (extras.length) {
    if (lines.length) lines.push('')
    extras.forEach(line => lines.push(line))
  }
  return lines.join('\n').trim()
}

function stripPromptFromQuestionBody(prompt = '', text = '') {
  const body = String(text || '').trim()
  const heading = String(prompt || '').trim()
  if (!body) return ''
  if (!heading) return body
  const lines = body.split('\n').map(line => line.trim()).filter(Boolean)
  const filtered = lines.filter(line => line.toLowerCase() !== heading.toLowerCase())
  let normalized = (filtered.length ? filtered.join('\n') : body)
  if (normalized.toLowerCase().startsWith(heading.toLowerCase())) {
    normalized = normalized.slice(heading.length).trim().replace(/^[\s:.\-]+/, '').trim()
  }
  normalized = normalized.replace(/\s+(?=\([ivx]+\)\s)/gi, '\n')
  return normalized.trim()
}

function splitNumberedQuestionBlocks(rawText = '') {
  const lines = String(rawText || '').split('\n')
  const blocks = []
  let current = null

  const pushCurrent = () => {
    if (!current) return
    blocks.push(current)
    current = null
  }

  lines.forEach(line => {
    const trimmed = line.trim()
    if (!trimmed) {
      if (current) current.bodyLines.push('')
      return
    }
    if (isAssessmentHeaderLine(trimmed) || isLikelyMetadataLine(trimmed)) return

    const topLevel = trimmed.match(TOP_LEVEL_QUESTION_LINE_RE)
    if (topLevel) {
      pushCurrent()
      const { prompt, marks } = extractPromptAndMarks(topLevel[2])
      current = {
        number: Number(topLevel[1]),
        prompt,
        marks,
        bodyLines: [],
      }
      return
    }

    if (current) current.bodyLines.push(trimmed)
  })

  pushCurrent()
  return blocks
}

function isNumberedAssessmentPaste(rawText = '') {
  const blocks = splitNumberedQuestionBlocks(rawText)
  if (blocks.length >= 2) return true
  if (blocks.length >= 1 && /ass(?:essment)?\s*#|total\s*marks?\s*:/i.test(String(rawText || ''))) return true
  return false
}

function parseNumberedSchoolAssessment(rawText = '', config = {}) {
  const blocks = splitNumberedQuestionBlocks(rawText)
  if (!isNumberedAssessmentPaste(rawText) || !blocks.length) {
    return { questions: [], totalMarks: 0, assessmentTitle: '' }
  }

  const totalMarksMatch = String(rawText || '').match(/total\s*marks?\s*:\s*(\d+)/i)
  const assessmentMatch = String(rawText || '').match(/ass(?:essment)?\s*#?\s*(\d+)/i)
  const totalMarks = totalMarksMatch ? Number(totalMarksMatch[1]) : blocks.reduce((sum, block) => sum + Number(block.marks || 2), 0)
  const assessmentTitle = assessmentMatch
    ? `Assessment ${assessmentMatch[1]}`
    : `${config.classLevel || ''} ${config.subject || ''} Assessment`.trim()

  const questions = blocks.map(block => {
    const type = inferTypeFromAssessmentPrompt(block.prompt)
    const category = guessCategory(block.prompt, config.subject)
    return {
      number: block.number,
      prompt: block.prompt,
      text: formatGroupedQuestionText(block),
      type,
      category: type === 'Grammar' ? 'Grammar' : category,
      marks: Number(block.marks || (type === 'Translation' ? 5 : type === 'Long Question' ? 5 : type === 'MCQ' ? 1 : 2)),
    }
  })

  return { questions, totalMarks, assessmentTitle }
}

function extractInlineMcqOptions(text = '') {
  const source = String(text || '').trim()
  if (!source) return { stem: '', options: [] }

  const parenMatches = [...source.matchAll(/\(([a-dA-D])\)\s*([^()]+?)(?=\s*\([a-dA-D]\)|$)/g)]
  if (parenMatches.length >= 2) {
    return {
      stem: source.split(/\([a-dA-D]\)/)[0].trim().replace(/[:\-]\s*$/, '').trim(),
      options: parenMatches.map((match, index) => ({
        key: match[1].toUpperCase(),
        label: match[1].toUpperCase(),
        text: match[2].trim(),
        order: index + 1,
      })),
    }
  }

  const lineMatches = source
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => line.match(/^\(?([a-dA-D])\)?[.)]?\s+(.+)$/))
    .filter(Boolean)

  if (lineMatches.length >= 2) {
    const firstOptionIndex = source.search(/\n\s*\(?[a-dA-D]\)?[.)]?\s+/)
    return {
      stem: firstOptionIndex > -1 ? source.slice(0, firstOptionIndex).trim() : '',
      options: lineMatches.map((match, index) => ({
        key: match[1].toUpperCase(),
        label: match[1].toUpperCase(),
        text: match[2].trim(),
        order: index + 1,
      })),
    }
  }

  return { stem: source, options: [] }
}

function detectLooseSectionType(title = '', body = '') {
  const text = `${title}\n${body}`.toLowerCase()
  if (/mcq|mcqs|objective|multiple choice|choose the correct option|choose the correct answer|درست جواب|انتخاب/.test(text)) return 'MCQ'
  if (/true\s*false|true\/false|درست\s*\/\s*غلط/.test(text)) return 'True/False'
  if (/fill(?:\s+in)?\s+the\s+blanks?|blanks?|خالی جگہ/.test(text)) return 'Fill in the Blanks'
  if (/match(?:\s+the)?\s+columns?|matching|ملائیں/.test(text)) return 'Match the Columns'
  if (/long\s+question|long\s+questions|detailed|detail|descriptive|answer in detail|essay|تفصیلی|تشریحی/.test(text)) return 'Long Question'
  if (/short\s+question|short\s+questions|very short|briefly|definition|define|what is|differentiate|answer briefly|مختصر|وجوہات/.test(text)) return 'Short Question'
  return ''
}

function splitLooseQuestions(rawText = '') {
  const raw = sanitizePasteText(rawText)
  if (!raw) return []
  if (isNumberedAssessmentPaste(raw)) {
    return splitNumberedQuestionBlocks(raw).map(block => `${block.number}) ${formatGroupedQuestionText(block)}`)
  }
  const blocks = raw
    .split(/(?=\n?\s*(?:q(?:uestion)?\.?\s*\d+|سوال(?:\s*نمبر)?\s*\d+|\d+\s*[.)-]))/i)
    .map(text => text.trim())
    .filter(Boolean)
  if (blocks.length > 1) return blocks
  return raw
    .split(/\n{2,}/)
    .map(text => text.trim())
    .filter(Boolean)
}

function isLikelyMetadataLine(text = '') {
  const line = String(text || '').trim()
  if (!line) return true
  if (isAssessmentHeaderLine(line)) return true
  const lower = line.toLowerCase()
  if (/^(english|urdu|math|mathematics|biology|physics|chemistry|computer(?: science)?|pak(?:istan)? studies|islamiyat)\s+\d{1,2}(?:st|nd|rd|th)?$/i.test(line)) return true
  if (/^\d{1,2}(?:st|nd|rd|th)\s+(english|urdu|math|mathematics|biology|physics|chemistry|computer(?: science)?|science|pak(?:istan)? studies|islamiyat)$/i.test(line)) return true
  if(/^class\s*\d{1,2}(?:st|nd|rd|th)?\s+(english|urdu|math|mathematics|biology|physics|chemistry|computer(?: science)?|pak(?:istan)? studies|islamiyat)$/i.test(line)) return true
  if (/^(english|urdu|math|mathematics|biology|physics|chemistry|computer|pakistan studies|islamiyat)\s+\d{1,2}(st|nd|rd|th)?\b/.test(lower) && /total marks|time allowed|paper code/.test(lower)) return true
  if (/^(class|subject|paper code|paper marks|total marks|time allowed|exam date|roll no|student name|board|session)\b/.test(lower)) return true
  if (/^assessment\s*:/i.test(line)) return true
  if (/^(annual|supplementary|assessment|unit test|mid term|final term)\b/.test(lower) && !/[?.:]/.test(lower)) return true
  if (/^\d+\s*(marks?|minutes?|hours?)$/i.test(line)) return true
  return false
}

function trimLeadingCountToken(text = '') {
  return String(text || '')
    .replace(/^\s*\d{1,2}\s+(?=(?:i{1,3}|iv|v|vi{0,3}|ix|x|[a-d])\s*[-.)])/i, '')
    .trim()
}

function splitInlineSubparts(text = '', typeHint = '') {
  const raw = trimLeadingCountToken(String(text || '').trim())
  if (!raw) return []
  const partRe = /(?:^|\s)((?:[ivxlcdm]{1,5}|[a-dA-D]))\s*[-.)]\s+/gi
  const matches = [...raw.matchAll(partRe)]
  if (matches.length < 2) return [raw]

  const first = matches[0]
  const prompt = raw.slice(0, first.index || 0).trim().replace(/[:\-]\s*$/, '').trim()
  const promptLower = prompt.toLowerCase()
  const typeLower = String(typeHint || '').toLowerCase()
  const items = matches.map((match, index) => {
    const start = (match.index || 0) + match[0].length
    const end = matches[index + 1]?.index ?? raw.length
    const body = raw.slice(start, end).trim().replace(/[:\-]\s*$/, '').trim()
    return { marker: match[1], body }
  }).filter(item => item.body)

  if (!items.length) return [raw]

  const promptLooksInstructional = !!prompt && (
    /answer the following|make adjectives|find words|opposite meaning|suitable adjectives|translate|write the meanings?|meanings? of|complete each|complete the sentences?|fill in the blanks?|write short note|short note|differentiate|define|what is|state whether|solve the following|attempt any|attempt the following|think of|circle the correct|match the|rewrite|change into|turn into|read the|give the|name the|list the/i.test(promptLower)
    || /short question|long question|translation|fill in the blanks|true\/false|match the columns|grammar/i.test(typeLower)
  )
  const listStyleSubparts = items.every(item => item.body.split(/\s+/).length <= 8)
  const shouldKeepGrouped = (items.length >= 2 && promptLooksInstructional)
    || (items.length >= 2 && listStyleSubparts && prompt.length > 8)
    || (!!prompt && (
      /answer the following questions?|answer briefly|answer in detail|attempt any|attempt the following|write the meanings?|meanings? of|translate(?: into [a-z]+)?|translation|complete each|complete the sentences?|fill in the blanks?|write short note|short note|differentiate|define|what is|state whether|solve the following/.test(promptLower)
      || /short question|long question|translation|fill in the blanks|true\/false|match the columns/.test(typeLower)
    ))

  if (shouldKeepGrouped) return [raw]

  const genericPrompt = /^(answer the following questions?|attempt any|question|questions?)$/i.test(prompt)
  return items.map(item => {
    if (!prompt || genericPrompt) return item.body
    if (/translate/i.test(prompt)) return `${prompt}: ${item.body}`
    if (/complete/i.test(prompt)) return `${prompt}: ${item.body}`
    if (/write the meanings?|meanings? of/i.test(prompt)) return `${prompt}: ${item.body}`
    if (/write short note|short note|differentiate|define|what is/i.test(prompt)) return `${prompt}: ${item.body}`
    return `${prompt} ${item.body}`.trim()
  })
}

function cleanLooseChunkText(text = '') {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/\s*[:\-]\s*$/, '')
    .trim()
}

function isTopLevelQuestionLine(text = '') {
  return /^\s*\d{1,2}\s*[.)-]\s+/.test(String(text || ''))
}

function splitAssessmentNumberedBlocks(rawText = '') {
  const lines = String(rawText || '')
    .split('\n')
    .map(line => line.trimEnd())

  const blocks = []
  let current = []

  const pushCurrent = () => {
    const text = current.join('\n').trim()
    if (text) blocks.push(text)
    current = []
  }

  lines.forEach(line => {
    const trimmed = line.trim()
    if (!trimmed) {
      if (current.length) current.push('')
      return
    }
    if (isTopLevelQuestionLine(trimmed) && current.length) {
      pushCurrent()
    }
    current.push(trimmed)
  })

  pushCurrent()
  return blocks
}

function cleanAssessmentLead(text = '') {
  return String(text || '')
    .replace(/^\s*\d{1,2}\s*[.)-]\s*/, '')
    .replace(/\s+\d{1,2}\s*$/g, '')
    .trim()
}

function shouldUseAssessmentBuckets(config = {}, rawText = '') {
  const joined = `${config.intent || ''} ${config.paperType || ''} ${config.board || ''} ${rawText || ''}`.toLowerCase()
  if (isNumberedAssessmentPaste(rawText)) return false
  return /assessment|school assessment|unit test|mid term|final term|monthly test|ass\s*#/.test(joined)
}

function collapseToAssessmentBucket(type = '', text = '') {
  const joined = `${type} ${text}`.toLowerCase()
  if (/mcq|objective|multiple choice/.test(joined)) return 'MCQ'
  if (/long question|detailed|answer in detail|essay/.test(joined)) return 'Long Question'
  return 'Short Question'
}

function parseLooseManualPaste(rawText = '', config = {}, pattern = null) {
  const raw = sanitizePasteText(rawText)
  if (!raw) return []
  const assessmentBucketsOnly = shouldUseAssessmentBuckets(config, raw)

  const sectionHeadingRe = /^(?:part\s+[a-z]\s*:?.*|mcqs?|objective(?:\s+type)?|multiple choice questions?|short questions?|very short questions?|long questions?|detailed questions?|definitions?|fill in the blanks?|true\/false|match(?:ing)?(?: the)? columns?|choose the correct (?:option|answer)|answer briefly|answer in detail|امتحانی سوالات|مقصدی|مختصر سوالات|طویل سوالات|تفصیلی سوالات|تعریفات|خالی جگہیں|درست\s*\/\s*غلط|ملائیں).*$/i
  const lines = raw.split('\n')
  const sections = []
  let current = { title: '', typeHint: '', lines: [] }

  const pushCurrent = () => {
    const text = current.lines.join('\n').trim()
    if (text) sections.push({ title: current.title, typeHint: current.typeHint, text })
  }

  lines.forEach(line => {
    const trimmed = line.trim()
    if (!trimmed) {
      current.lines.push('')
      return
    }
    if (sectionHeadingRe.test(trimmed)) {
      pushCurrent()
      current = { title: trimmed, typeHint: detectLooseSectionType(trimmed), lines: [] }
      return
    }
    current.lines.push(trimmed)
  })
  pushCurrent()

  const normalizedSections = sections.length ? sections : [{ title: '', typeHint: '', text: raw }]
  const rows = []

  normalizedSections.forEach(sectionBlock => {
    const typeHint = sectionBlock.typeHint || detectLooseSectionType(sectionBlock.title, sectionBlock.text)
    const normalizedBlockText = sectionBlock.text
      .split('\n')
      .map(line => line.trim())
      .filter(line => !isLikelyMetadataLine(line))
      .join('\n')
      .trim()
    if (!normalizedBlockText) return

    const questions = splitLooseQuestions(normalizedBlockText)
    questions.forEach((chunk, index) => {
      const cleaned = cleanLooseChunkText(stripLeadingQuestionMarker(chunk))
      if (!cleaned || isLikelyMetadataLine(cleaned)) return
      const splitItems = assessmentBucketsOnly ? [cleaned] : splitInlineSubparts(cleaned, typeHint)
      splitItems.forEach((piece, pieceIndex) => {
        const finalText = cleanLooseChunkText(piece)
        if (!finalText || isLikelyMetadataLine(finalText)) return
        const parsed = extractInlineMcqOptions(finalText)
        const looseType = typeHint || (parsed.options.length >= 2 ? 'MCQ' : normalizeType(finalText))
        const inferredType = assessmentBucketsOnly ? collapseToAssessmentBucket(looseType, finalText) : looseType
        const questionNo = parseQuestionNumber(chunk)
        const targetSection = sectionForQuestionNo(pattern, questionNo)
        rows.push({
          text: parsed.stem || finalText,
          options: parsed.options,
          type: inferredType,
          category: assessmentBucketsOnly ? inferredType : guessCategory(`${sectionBlock.title}\n${parsed.stem || finalText}`, config.subject),
          marks: inferredType === 'MCQ' ? 1 : inferredType === 'Long Question' ? 5 : 2,
          questionNo,
          section: targetSection,
          source: sectionBlock.title || `Manual Paste Block ${index + 1}.${pieceIndex + 1}`,
        })
      })
    })
  })

  return rows.filter(row => row.text)
}

function sectionForQuestionNo(pattern, questionNo) {
  if (!pattern || !questionNo) return null
  return (pattern.sections || []).find(section => Number(section.questionNo || 0) === Number(questionNo)) || null
}

function splitBoardPaste(rawText = '') {
  const raw = normalizeIndicDigits(String(rawText || '').replace(/\r/g, '').trim())
  if (!raw) return []
  const headerRe = /(?:^|\n)\s*(?:q(?:uestion)?\.?|سوال(?:\s*نمبر)?|س)\s*[:.\-]?\s*\d{1,2}/gi
  const matches = [...raw.matchAll(headerRe)]
  if (!matches.length) return [{ questionNo: 0, text: raw }]
  return matches.map((match, index) => {
    const start = match.index || 0
    const end = matches[index + 1]?.index ?? raw.length
    return {
      questionNo: parseQuestionNumber(match[0]),
      text: raw.slice(start, end).trim(),
    }
  }).filter(block => block.text)
}

function splitSectionItems(blockText = '') {
  const raw = String(blockText || '').trim()
  if (!raw) return []
  const withoutHeader = raw
    .replace(/^\s*(?:q(?:uestion)?\.?|سوال(?:\s*نمبر)?|س)\s*[:.\-]?\s*\d{1,2}\s*/i, '')
    .trim()
  const numbered = withoutHeader
    .split(/(?=\n?\s*(?:\(\s?[ivxlcdm]+\s?\)|[ivxlcdm]{1,6}[.)]|[a-dA-D][.)]|\(\s?[A-D]\s?\)|\d{1,2}\s*[.)-]))/i)
    .map(text => text.trim())
    .filter(Boolean)
  if (numbered.length > 1) return numbered
  return withoutHeader
    .split(/\n{2,}/)
    .map(text => text.trim())
    .filter(Boolean)
}

function inferTypeForTarget(section, text) {
  if (!section) return normalizeType(text)
  const bucket = questionBucket(section.type || section.title)
  if (bucket === 'mcq') return 'MCQ'
  if (bucket === 'long') return section.type || 'Long Question'
  return section.type || normalizeType(text)
}

function splitPartBlocks(rawText = '') {
  const raw = String(rawText || '').replace(/\r/g, '').trim()
  const partRe = /(?:^|\n)\s*Part\s+([A-Z])\s*:\s*([^\n]+)/gi
  const matches = [...raw.matchAll(partRe)]
  if (!matches.length) return []
  return matches.map((match, index) => {
    const start = match.index || 0
    const end = matches[index + 1]?.index ?? raw.length
    return {
      part: match[1].toUpperCase(),
      title: match[2].trim(),
      text: raw.slice(start, end).trim(),
    }
  })
}

function parseAssessmentPart(block, pattern) {
  const lowerTitle = String(block.title || '').toLowerCase()
  const lines = String(block.text || '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .filter(line => !/^part\s+[a-z]\s*:/i.test(line))
    .filter(line => !/^(assessment\s*:|class\s+\d|part\s+[a-z]\s*:|choose the correct option|answer briefly|answer in detail)\b/i.test(line))
    .filter(line => !/^(choose the correct option|answer briefly|answer in detail)\.?$/i.test(line))
  const groupedBlocks = splitAssessmentNumberedBlocks(lines.join('\n'))

  if (block.part === 'A' || lowerTitle.includes('mcq')) {
    const rows = []
    groupedBlocks.forEach(blockText => {
      const blockLines = String(blockText || '')
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
      if (!blockLines.length) return

      const firstLine = cleanAssessmentLead(blockLines[0])
      const row = { text: firstLine, options: [] }

      blockLines.slice(1).forEach(line => {
        const option = line.match(/^\(?([a-dA-D])\)?[.)]?\s+(.+)$/)
        if (option) {
          row.options.push({ key: option[1].toUpperCase(), label: option[1].toUpperCase(), text: option[2].trim() })
        } else if (!row.options.length) {
          row.text = `${row.text} ${line}`.trim()
        }
      })

      rows.push(row)
    })

    return rows
      .map(row => {
        const inlineOptions = [...String(row.text || '').matchAll(/\(([a-dA-D])\)\s*([^()]+?)(?=\s*\([a-dA-D]\)|$)/g)]
        if (!inlineOptions.length) return row
        const stem = String(row.text || '').split(/\([a-dA-D]\)/)[0].trim().replace(/[:\-]\s*$/, '').trim()
        return {
          ...row,
          text: stem || row.text,
          options: inlineOptions.map((match, index) => ({
            key: match[1].toUpperCase(),
            label: match[1].toUpperCase(),
            text: match[2].trim(),
            order: index + 1,
          })),
        }
      })
      .filter(row => row.text && !/^(assessment|class)\b/i.test(row.text))
      .map(row => ({
      text: row.text,
      options: row.options,
      type: 'MCQ',
      category: 'Objective',
      marks: 1,
      questionNo: 1,
      section: sectionForQuestionNo(pattern, 1),
    }))
  }

  const type = block.part === 'C' || lowerTitle.includes('long') ? 'Long Question' : 'Short Question'
  const questionNo = type === 'Long Question' ? 5 : 2
  const marks = type === 'Long Question' ? 5 : 2
  return groupedBlocks
    .map(text => cleanAssessmentLead(text))
    .filter(text => text && !/^(assessment|class|part\s+[a-z]\s*:)/i.test(text))
    .map(text => ({
      text,
      options: [],
      type,
      category: type,
      marks,
      questionNo,
      section: sectionForQuestionNo(pattern, questionNo),
    }))
}

function parseAssessmentPaste(rawText = '', pattern) {
  const blocks = splitPartBlocks(rawText)
  if (!blocks.length) return []
  return blocks.flatMap(block => parseAssessmentPart(block, pattern))
}

function inferConfigFromPaste(rawText = '', currentConfig = {}) {
  const raw = String(rawText || '')
  const next = { ...currentConfig }
  const subject = SUBJECTS.find(subject => new RegExp(`\\b${subject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(raw))
  const classMatch = raw.match(/\bclass\s*(\d{1,2})(?:st|nd|rd|th)?\b/i)
  const ordinalClassMatch = raw.match(/\b(\d{1,2})(?:st|nd|rd|th)\s+(english|urdu|mathematics|math|science|biology|physics|chemistry|computer(?:\s*science)?|islamiyat|pakistan\s*studies)/i)
  const titleMatch = raw.match(/Assessment\s*:\s*([^\n]+)/i)
  const assMatch = raw.match(/ass(?:essment)?\s*#?\s*(\d+)/i)
  const totalMarksMatch = raw.match(/total\s*marks?\s*:\s*(\d+)/i)
  if (/\b(1st|first)\s*year\b|\binter[\s-]?i\b|\bf\.?\s*sc\b|\bics\b|\bfa\b|\bclass\s*11\b/i.test(raw)) next.classLevel = '11'
  if (/\b(2nd|second)\s*year\b|\binter[\s-]?ii\b|\bclass\s*12\b/i.test(raw)) next.classLevel = '12'
  if (!next.classLevel && /\bmatric\b|\b10th\b|\bssc\b|\bclass\s*10\b/i.test(raw)) next.classLevel = '10'
  const middleClassMatch = raw.match(/\bclass\s*([6-8])\b/i)
  if (!next.classLevel && middleClassMatch) next.classLevel = middleClassMatch[1]
  if (subject) next.subject = subject
  if (classMatch) next.classLevel = classMatch[1]
  if (ordinalClassMatch) {
    next.classLevel = ordinalClassMatch[1]
    const subjectName = ordinalClassMatch[2].replace(/\s+/g, ' ').trim()
    const subjectAliases = {
      math: 'Mathematics',
      mathematics: 'Mathematics',
      'computer science': 'Computer Science',
      'pakistan studies': 'Pakistan Studies',
    }
    next.subject = SUBJECTS.find(item => item.toLowerCase() === subjectName.toLowerCase())
      || subjectAliases[subjectName.toLowerCase()]
      || subjectName.replace(/\b\w/g, char => char.toUpperCase())
  }
  if (/assessment|unit\s*\d+|part\s+a\s*:|ass\s*#?\s*\d+/i.test(raw)) {
    next.intent = 'School Assessment'
    next.paperType = 'Assessment'
    next.board = 'School Assessment'
  }
  if (/board\s*pattern|annual\s*examination|bise\b|objective\s*paper|subjective\s*paper/i.test(raw)) {
    next.intent = 'Board Pattern Paper'
    next.paperType = 'Annual'
    next.board = next.board || 'Punjab / Gujranwala Board'
  }
  if (titleMatch) next.chapters = titleMatch[1].trim()
  if (assMatch) next.chapters = `Assessment ${assMatch[1]}`
  if (totalMarksMatch) next.totalMarks = Number(totalMarksMatch[1])
  const subjectHint = String(next.subject || ordinalClassMatch?.[2] || '').toLowerCase()
  if (subjectHint.includes('urdu') || subjectHint.includes('islamiyat')) next.medium = 'Urdu'
  else if (subjectHint.includes('english')) next.medium = 'English'
  else if (/urdu|اردو/i.test(raw) && !/english/i.test(raw)) next.medium = 'Urdu'
  else if (/english/i.test(raw) && !/urdu/i.test(raw)) next.medium = 'English'
  else if (/english/i.test(raw) && /urdu/i.test(raw)) next.medium = 'Dual Medium'
  return next
}

function resolveTemplatePreset(config = {}) {
  const subject = String(config.subject || '').toLowerCase()
  const medium = String(config.medium || '').toLowerCase()
  if (medium === 'urdu' || subject.includes('urdu') || subject.includes('islamiyat')) return 'board'
  if (subject.includes('english')) return 'oxford'
  if (['mathematics', 'math', 'physics', 'chemistry', 'biology', 'science', 'computer'].some(item => subject.includes(item))) return 'cambridge'
  if (config.paperType === 'Assessment' || config.intent === 'School Assessment') return 'institutional'
  return 'classic'
}

function numberedRowsToReviewItems(numberedResult, inferredConfig, pattern) {
  return numberedResult.questions.map((question, index) => {
    const targetSection = sectionForQuestionNo(pattern, question.number)
    return {
      id: safeId('review'),
      text: question.text,
      answer: '',
      type: question.type,
      category: question.category,
      marks: Number(question.marks || targetSection?.marksEach || 2),
      options: [],
      chapter: inferredConfig.chapters || '',
      topic: '',
      source: `Manual Paste Q${question.number}`,
      confidence: 0.94,
      reviewStatus: 'Ready',
      duplicateHash: duplicateHash(question.text),
      language: isUrduText(question.text) ? 'urdu' : 'english',
      medium: inferredConfig.medium,
      classLevel: inferredConfig.classLevel,
      subject: inferredConfig.subject,
      board: inferredConfig.board,
      targetQuestionNo: Number(question.number || 0),
      targetSectionId: targetSection?.id || `nq-${question.number}`,
      createdAt: new Date().toISOString(),
      order: index + 1,
    }
  })
}

function parseSmartPasteV2(rawText, config) {
  const raw = sanitizePasteText(rawText)
  if (!raw) return { items: [], patternOverride: null, summary: '' }
  const inferredConfig = inferConfigFromPaste(raw, config)
  const numberedResult = parseNumberedSchoolAssessment(raw, inferredConfig)

  if (numberedResult.questions.length) {
    const patternOverride = buildNumberedQuestionPattern({
      classLevel: inferredConfig.classLevel,
      subject: inferredConfig.subject,
      medium: inferredConfig.medium,
      questions: numberedResult.questions,
      totalMarks: numberedResult.totalMarks || inferredConfig.totalMarks,
      assessmentTitle: numberedResult.assessmentTitle,
    })
    const items = numberedRowsToReviewItems(numberedResult, inferredConfig, patternOverride)
    const marksTotal = numberedResult.totalMarks || items.reduce((sum, item) => sum + Number(item.marks || 0), 0)
    return {
      items,
      patternOverride,
      summary: `Detected ${items.length} main question(s) with grouped sub-parts · ${marksTotal} marks total · Template: ${resolveTemplatePreset(inferredConfig).replace(/-/g, ' ')}`,
    }
  }

  const pattern = findUnifiedPattern(inferredConfig)
  const assessmentRows = parseAssessmentPaste(raw, pattern)
  const looseRows = parseLooseManualPaste(raw, inferredConfig, pattern)
  const blocks = splitBoardPaste(raw)
  const rows = blocks.flatMap(block => {
    const section = sectionForQuestionNo(pattern, block.questionNo)
    const parts = splitSectionItems(block.text)
    const items = parts.length ? parts : [block.text]
    return items.map(text => ({ text, questionNo: block.questionNo, section }))
  })
  const fallback = raw
    .split(/\n{2,}|(?=\n?\s*(?:Q\.?\s*\d+|Question\s*\d+|\d+\s*[.)]))/i)
    .map(text => text.trim())
    .filter(Boolean)
    .map(text => ({ text, questionNo: parseQuestionNumber(text), section: null }))
  const parsedRows = assessmentRows.length ? assessmentRows : looseRows.length ? looseRows : rows.length ? rows : fallback

  const items = parsedRows.map((row, index) => {
    const text = row.text
    const type = row.type || inferTypeForTarget(row.section, text)
    const targetSection = row.section || sectionForQuestionNo(pattern, row.questionNo)
    const confidence = targetSection
      ? 0.82
      : /[?؟]|(?:^|\n)\s*(?:[A-D]\)|\(A\)|الف|ب|ج|د)/.test(text) ? 0.78 : 0.52
    return {
      id: safeId('review'),
      text,
      answer: '',
      type,
      category: row.category || targetSection?.allowedCategories?.[0] || guessCategory(text, inferredConfig.subject),
      marks: Number(row.marks || targetSection?.marksEach || (type === 'MCQ' ? 1 : type === 'Long Question' || type === 'Essay' ? 5 : 2)),
      options: row.options || [],
      chapter: '',
      topic: '',
      source: row.questionNo ? `Manual Paste Q${row.questionNo}` : 'Manual Paste',
      confidence,
      reviewStatus: confidence >= 0.7 ? 'Ready' : 'Needs Review',
      duplicateHash: duplicateHash(text),
      language: isUrduText(text) ? 'urdu' : 'english',
      medium: inferredConfig.medium,
      classLevel: inferredConfig.classLevel,
      subject: inferredConfig.subject,
      board: inferredConfig.board,
      targetQuestionNo: Number(row.questionNo || targetSection?.questionNo || 0),
      targetSectionId: targetSection?.id || '',
      createdAt: new Date().toISOString(),
      order: index + 1,
    }
  })

  return {
    items,
    patternOverride: null,
    summary: items.length ? `Parsed ${items.length} item(s) from pasted content` : 'No questions detected',
    inferredConfig,
  }
}

function parseSmartPaste(rawText, config) {
  const raw = String(rawText || '').replace(/\r/g, '').trim()
  if (!raw) return []
  const chunks = raw
    .split(/\n{2,}|(?=\n?\s*(?:Q\.?\s*\d+|سوال\s*\d+|\d+\s*[.)]))/i)
    .map(x => x.trim())
    .filter(Boolean)
  const items = chunks.length ? chunks : [raw]
  return items.map((text, index) => {
    const type = normalizeType(text)
    const confidence = /[?؟]|(?:^|\n)\s*(?:[A-D]\)|\(A\)|الف|ب|ج|د)/.test(text) ? 0.78 : 0.48
    return {
      id: safeId('review'),
      text,
      answer: '',
      type,
      category: guessCategory(text, config.subject),
      marks: type === 'MCQ' ? 1 : type === 'Long Question' || type === 'Essay' ? 5 : 2,
      chapter: '',
      topic: '',
      source: 'Manual Paste',
      confidence,
      reviewStatus: confidence >= 0.7 ? 'Ready' : 'Needs Review',
      duplicateHash: duplicateHash(text),
      language: isUrduText(text) ? 'urdu' : 'english',
      medium: config.medium,
      classLevel: config.classLevel,
      subject: config.subject,
      board: config.board,
      createdAt: new Date().toISOString(),
      order: index + 1,
    }
  })
}

function itemQuestionText(item = {}) {
  return String(item.text || item.en || item.ur || item.question || '').trim()
}

function questionBucket(value = '') {
  const type = String(value || '').toLowerCase()
  if (type.includes('mcq') || type.includes('objective')) return 'mcq'
  if (type.includes('long') || type.includes('essay') || type.includes('letter') || type.includes('application') || type.includes('explanation') || type.includes('comprehension') || type.includes('theorem')) return 'long'
  return 'short'
}

function bankTypeFromUnified(type = '', category = '') {
  const value = `${type} ${category}`.toLowerCase()
  if (value.includes('mcq') || value.includes('objective')) return 'mcq'
  if (value.includes('essay')) return 'essay'
  if (value.includes('letter') || value.includes('application')) return 'letter'
  if (value.includes('translation')) return 'translation'
  if (value.includes('grammar')) return 'grammar'
  if (value.includes('diagram')) return 'diagram'
  if (value.includes('numerical')) return 'numerical'
  if (questionBucket(value) === 'long') return 'long'
  return 'short'
}

function sectionKeywordScore(section, item) {
  const text = `${itemQuestionText(item)} ${item.category || ''} ${item.type || ''}`.toLowerCase()
  const sectionText = `${section.id || ''} ${section.title || ''} ${section.type || ''} ${(section.allowedCategories || []).join(' ')}`.toLowerCase()
  let score = 0
  const hits = [
    [/define|definition|what is|term|terminology/, /definition|conceptual|terminology|terms/],
    [/diagram|label|draw|graph/, /diagram|graph|label/],
    [/numerical|calculate|solve|formula|unit|measurement/, /numerical|formula|unit|measurement|graph/],
    [/equation|reaction|balance|chemical/, /equation|reaction|chemical/],
    [/why|reason|reasoning|example|differentiate|difference|compare/, /reasoning|example|difference|slo/],
    [/function|process|explain|describe|derive|derivation/, /function|process|explanation|derive|derivation|long/],
  ]
  hits.forEach(([questionRe, sectionRe]) => {
    if (questionRe.test(text) && sectionRe.test(sectionText)) score += 14
  })
  return score
}

function scoreItemForSection(section, item) {
  const itemType = String(item.type || '').toLowerCase()
  const sectionType = String(section.type || '').toLowerCase()
  const itemCategory = String(item.category || '').toLowerCase()
  const sectionCategories = (section.allowedCategories || []).map(c => String(c || '').toLowerCase())
  const itemBucket = questionBucket(item.type || item.category)
  const sectionBucket = questionBucket(section.type || section.title)
  let score = 0

  if (item.targetSectionId && item.targetSectionId === section.id) score += 120
  if (item.targetQuestionNo && Number(item.targetQuestionNo) === Number(section.questionNo || 0)) score += 90
  if (item.targetQuestionNo && Number(item.targetQuestionNo) !== Number(section.questionNo || 0)) score -= 25

  if (itemBucket === 'mcq' && sectionBucket !== 'mcq') return -100
  if (itemBucket !== 'mcq' && sectionBucket === 'mcq') return -100
  if (itemBucket === 'long' && sectionBucket !== 'long') score -= 12
  if (itemBucket !== 'long' && sectionBucket === 'long') score -= 10

  if (itemType && itemType === sectionType) score += 24
  if (itemBucket === sectionBucket) score += 16
  if (itemCategory && sectionCategories.includes(itemCategory)) score += 36
  if (itemCategory && sectionCategories.some(c => c.includes(itemCategory) || itemCategory.includes(c))) score += 18
  score += sectionKeywordScore(section, item)
  return score
}

function buildSectionsFromPattern(pattern, config, bankItems = [], reviewItems = []) {
  const allItems = [...bankItems, ...reviewItems]
  const assigned = new Map(pattern.sections.map(section => [section.id, []]))

  allItems.forEach(item => {
    const ranked = pattern.sections
      .map(section => ({ section, score: scoreItemForSection(section, item), count: assigned.get(section.id)?.length || 0 }))
      .filter(row => row.score > -50)
      .sort((a, b) => (b.score - a.score) || (a.count - b.count) || (Number(a.section.questionNo || 0) - Number(b.section.questionNo || 0)))
    const best = ranked[0]?.section
    if (best && ranked[0].score > 0) assigned.get(best.id).push(item)
  })

  return pattern.sections.map(section => {
    const matching = assigned.get(section.id) || []
    const count = Math.max(section.totalQuestions || section.attemptRequired || 1, matching.length, 1)
    const questions = Array.from({ length: count }, (_, i) => {
      const item = matching[i]
      return {
        id: item?.id || safeId('q'),
        text: itemQuestionText(item),
        textUrdu: item?.textUrdu || item?.ur || '',
        answer: item?.answer || '',
        markingNotes: item?.markingNotes || '',
        category: item?.category || section.allowedCategories?.[0] || section.type,
        type: item?.type || section.type,
        marks: Number(item?.marks || section.marksEach || 1),
        options: Array.isArray(item?.options) ? item.options.map((option, optionIndex) => ({
          key: option?.key || option?.label || String.fromCharCode(65 + optionIndex),
          label: option?.label || option?.key || String.fromCharCode(65 + optionIndex),
          text: option?.text || option?.en || '',
          textUrdu: option?.textUrdu || option?.ur || '',
        })) : [],
        source: item?.source || (config.source === 'AI Generate' ? 'AI Pending' : 'Empty Slot'),
        reviewStatus: item?.reviewStatus || (item ? 'Ready' : 'Needs Content'),
        duplicateHash: item?.duplicateHash || duplicateHash(item?.text || item?.en || item?.ur || ''),
        confidence: item?.confidence ?? (item ? 0.8 : 0),
        targetQuestionNo: item?.targetQuestionNo || null,
        targetSectionId: item?.targetSectionId || '',
      }
    })
    return { ...section, questions }
  })
}

function validatePaper(config, pattern, sections, reviewItems) {
  const warnings = []
  const sectionMarks = sections.reduce((sum, section) => sum + Number(section.marks || 0), 0)
  if (Number(config.totalMarks) && Math.abs(sectionMarks - Number(config.totalMarks)) > 0.1) {
    warnings.push(`Pattern marks are ${sectionMarks}, selected total marks are ${config.totalMarks}. Adjust total marks or section schema.`)
  }
  sections.forEach(section => {
    const filled = section.questions.filter(q => String(q.text || '').trim()).length
    if (filled < Number(section.attemptRequired || 0)) {
      warnings.push(`Q${section.questionNo} requires ${section.attemptRequired} questions, but only ${filled} are filled. Add manually, select from bank, or AI-generate missing questions.`)
    }
  })
  const seen = new Set()
  sections.flatMap(s => s.questions).forEach(q => {
    const hash = String(q.text || '').trim().toLowerCase()
    if (hash && seen.has(hash)) warnings.push('Duplicate question detected. Review repeated content before export.')
    if (hash) seen.add(hash)
  })
  if (config.medium !== 'English' && pattern.languageDirection === 'rtl') {
    const romanUrdu = sections.flatMap(s => s.questions).some(q => /\b(wahid|jama|mutradif|mutzad|tashreeh|khulasa)\b/i.test(q.text || q.category || ''))
    if (romanUrdu) warnings.push('Urdu categories must be in Urdu script, not Roman Urdu.')
  }
  if (reviewItems.some(i => i.reviewStatus !== 'Ready' && i.reviewStatus !== 'Approved')) {
    warnings.push('Some imported/manual items are still in review. Approve or edit them before final export.')
  }
  if (!warnings.length) warnings.push('Validation passed. Teacher can review and export.')
  return warnings
}

function missingSlots(sections) {
  return sections.flatMap(section => {
    const required = Number(section.attemptRequired || 0)
    const filled = section.questions.filter(q => String(q.text || '').trim()).length
    const missing = Math.max(0, required - filled)
    return Array.from({ length: missing }, (_, index) => ({ section, index }))
  })
}

function createAiDraftsForMissing(sections, config, pattern) {
  const existingTexts = sections
    .flatMap(section => section.questions || [])
    .map(q => String(q.text || '').trim())
    .filter(Boolean)

  return missingSlots(sections).map(({ section, index }) => {
    const category = section.allowedCategories?.[index % Math.max(1, section.allowedCategories.length)] || section.type
    const avoid = existingTexts.slice(0, 12).join(' | ')
    const prompt = [
      `Create one ${section.type} for Class ${config.classLevel} ${config.subject}.`,
      `Medium: ${config.medium}. Board/School: ${config.board}.`,
      `Pattern: ${pattern.name}. Section: Q${section.questionNo} ${section.title}.`,
      `Category: ${category}. Marks: ${section.marksEach}.`,
      config.chapters ? `Chapters: ${config.chapters}.` : '',
      config.topics ? `Topics/SLOs: ${config.topics}.` : '',
      avoid ? `Avoid repeating: ${avoid}.` : '',
      'Teacher must review before approval.',
    ].filter(Boolean).join(' ')
    const slotId = safeId('ai_slot')
    return {
      id: slotId,
      slotId,
      text: '',
      answer: '',
      type: section.type,
      category,
      marks: Number(section.marksEach || 1),
      chapter: config.chapters || '',
      topic: config.topics || '',
      source: 'AI Draft Request',
      confidence: 0,
      reviewStatus: 'Needs Review',
      prompt,
      duplicateHash: '',
      language: config.medium === 'Urdu' ? 'urdu' : config.medium === 'Dual Medium' ? 'mixed' : 'english',
      medium: config.medium,
      classLevel: config.classLevel,
      subject: config.subject,
      board: config.board,
      targetQuestionNo: Number(section.questionNo || 0),
      targetSectionId: section.id || '',
      sectionTitle: section.title || '',
      slotIndex: index,
      createdAt: new Date().toISOString(),
    }
  })
}

function bucketForType(type = '') {
  const value = String(type).toLowerCase()
  if (value.includes('mcq') || value.includes('objective')) return 'mcq'
  if (value.includes('long') || value.includes('essay') || value.includes('letter') || value.includes('application') || value.includes('explanation')) return 'long'
  return 'short'
}

function textFromAiQuestion(question = {}, fallbackCategory = '') {
  const base = question.text || question.question || question.en || question.textUrdu || question.ur || ''
  const options = Array.isArray(question.options) && question.options.length
    ? '\n' + question.options.map((option, index) => `${option.label || String.fromCharCode(65 + index)}. ${option.text || option.en || option.textUrdu || option.ur || ''}`).join('\n')
    : ''
  return String(base || fallbackCategory || '').trim() + options
}

async function callUnifiedGapFillAi(config, missingDrafts, sections = []) {
  const gapSlots = missingDrafts.map((draft, index) => ({
    slotId: draft.slotId || draft.id || `slot_${index + 1}`,
    targetQuestionNo: draft.targetQuestionNo,
    targetSectionId: draft.targetSectionId,
    sectionNo: draft.targetQuestionNo,
    sectionTitle: draft.sectionTitle,
    type: draft.type,
    category: draft.category,
    marks: draft.marks,
    chapter: draft.chapter,
    topic: draft.topic,
    prompt: draft.prompt,
  }))
  const existingQuestions = sections
    .flatMap(section => section.questions || [])
    .map(q => String(q.text || '').trim())
    .filter(Boolean)
    .slice(0, 30)
  const medium = config.medium === 'Dual Medium'
    ? 'dual'
    : String(config.medium || 'english').toLowerCase()

  const response = await generateGapFillWithGemini({
    classLevel: config.classLevel,
    subject: config.subject,
    medium,
    chapters: String(config.chapters || '').split(/[,\n]+/).map(x => x.trim()).filter(Boolean),
    gapSlots,
    existingQuestions,
    instructions: [
      `Follow ${config.board || 'school'} controlled paper pattern.`,
      `Difficulty: ${config.difficulty}.`,
      config.topics ? `Topics/SLOs: ${config.topics}.` : '',
      medium === 'dual' ? 'Provide English in text and Urdu in textUrdu for every question and MCQ option.' : '',
      'Generate exactly one unique question per slotId. Match section category and marks.',
    ].filter(Boolean).join(' '),
  }, null)

  return response?.questions || []
}

async function callUnifiedAiGenerate(config, missingDrafts) {
  const counts = missingDrafts.reduce((acc, item) => {
    acc[bucketForType(item.type)] += 1
    return acc
  }, { mcq: 0, short: 0, long: 0 })
  const aiConfig = {
    classLevel: config.classLevel,
    subject: config.subject,
    medium: config.medium,
    chapters: String(config.chapters || '').split(/[,\n]+/).map(x => x.trim()).filter(Boolean),
    mcqCount: counts.mcq,
    shortCount: counts.short,
    longCount: counts.long,
    categories: missingDrafts.map(item => ({ id: bucketForType(item.type), value: item.category, label: item.category, type: item.type })),
    instructions: [
      `Follow ${config.board || 'school'} controlled paper pattern.`,
      `Difficulty: ${config.difficulty}.`,
      config.topics ? `Topics/SLOs: ${config.topics}.` : '',
      'Return clean questions only. Teacher approval is required before final paper.',
    ].filter(Boolean).join(' '),
  }
  const response = generateWithGemini.length >= 2
    ? await generateWithGemini(null, aiConfig)
    : await generateWithGemini(aiConfig)
  const result = response?.result || response || {}
  return [
    ...(result.mcq || []),
    ...(result.short || []),
    ...(result.long || []),
  ]
}

async function callUnifiedExtract(config, file, rawText, onProgress) {
  const extractConfig = {
    classLevel: config.classLevel,
    subject: config.subject,
    medium: config.medium,
    chapterName: config.chapters,
    defaultCategory: config.subject,
    structureMode: 'unified_review',
  }
  return extractQuestionsFromFile.length >= 5
    ? await extractQuestionsFromFile(null, extractConfig, file, rawText, onProgress)
    : await extractQuestionsFromFile(extractConfig, file, rawText, onProgress)
}

function aiQuestionToReviewItem(question, draft, config) {
  const text = textFromAiQuestion(question, draft.category)
  return {
    ...draft,
    id: safeId('ai_review'),
    slotId: question.slotId || draft.slotId || draft.id,
    text,
    answer: question.answer || draft.answer || '',
    type: question.type || draft.type,
    category: question.category || draft.category,
    marks: Number(question.marks || draft.marks || 1),
    source: 'AI Generated Review',
    confidence: Number(question.confidence || 0.86),
    reviewStatus: 'Needs Review',
    duplicateHash: duplicateHash(text),
    language: question.language || (isUrduText(text) ? 'urdu' : config.medium === 'Urdu' ? 'urdu' : config.medium === 'Dual Medium' ? 'mixed' : 'english'),
    targetQuestionNo: Number(question.targetQuestionNo || draft.targetQuestionNo || 0),
    targetSectionId: question.targetSectionId || draft.targetSectionId || '',
    createdAt: new Date().toISOString(),
  }
}

function normalizeExtractedQuestions(result) {
  if (Array.isArray(result)) return result
  const payload = result?.result || result?.job?.result || result || {}
  const flat = [
    ...(payload.questions || []),
    ...(payload.mcq || []),
    ...(payload.short || []),
    ...(payload.long || []),
  ]
  if (Array.isArray(payload.sections)) {
    payload.sections.forEach(section => {
      ;(section.questions || []).forEach(question => {
        flat.push({
          ...question,
          type: question.type || section.type || section.title,
          category: question.category || section.category || section.title,
          marks: question.marks || section.marksEach || 1,
        })
      })
    })
  }
  return flat
}

function extractedQuestionToReviewItem(question, source, config) {
  const text = textFromAiQuestion(question, question.category || config.subject)
  const type = question.type || normalizeType(text)
  const targetQuestionNo = Number(question.targetQuestionNo || question.questionNo || question.sectionQuestionNo || parseQuestionNumber(text) || 0)
  const targetSection = sectionForQuestionNo(findUnifiedPattern(config), targetQuestionNo)
  return {
    id: safeId('extract_review'),
    text,
    answer: question.answer || '',
    type,
    category: question.category || guessCategory(text, config.subject),
    marks: Number(question.marks || (type === 'MCQ' ? 1 : type === 'Long Question' ? 5 : 2)),
    chapter: question.chapter || question.chapterName || config.chapters || '',
    topic: question.topic || '',
    source,
    confidence: Number(question.confidence || 0.65),
    reviewStatus: 'Needs Review',
    duplicateHash: duplicateHash(text),
    language: question.language || (isUrduText(text) ? 'urdu' : config.medium === 'Urdu' ? 'urdu' : 'english'),
    medium: config.medium,
    classLevel: config.classLevel,
    subject: config.subject,
    board: config.board,
    targetQuestionNo,
    targetSectionId: question.targetSectionId || question.sectionId || targetSection?.id || '',
    createdAt: new Date().toISOString(),
  }
}

function parseDurationMinutes(value) {
  const text = String(value || '').toLowerCase()
  const hourMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:hour|hr|h)/)
  const minuteMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:minute|min|m)/)
  if (hourMatch || minuteMatch) {
    return Math.round(Number(hourMatch?.[1] || 0) * 60 + Number(minuteMatch?.[1] || 0))
  }
  const numeric = Number(text.replace(/[^\d.]/g, ''))
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 120
}

function normalizeLegacyOptions(text = '') {
  const lines = String(text || '').split('\n')
  const optionLines = lines.filter(line => /^\s*(?:[A-D][.)]|\([A-D]\))\s*/i.test(line))
  return optionLines.map((line, index) => {
    const clean = line.replace(/^\s*(?:[A-D][.)]|\([A-D]\))\s*/i, '').trim()
    return { key: String.fromCharCode(65 + index), label: String.fromCharCode(65 + index), text: clean }
  })
}

function legacyBucketForQuestion(question = {}) {
  const type = String(question.type || question.category || '').toLowerCase()
  if (type.includes('mcq') || type.includes('objective') || type.includes('correct answer')) return 'mcq'
  if (type.includes('long') || type.includes('essay') || type.includes('letter') || type.includes('application') || type.includes('explanation') || type.includes('comprehension')) return 'long'
  return 'short'
}

function mapUnifiedQuestionType(question = {}) {
  const text = `${question.type || ''} ${question.category || ''} ${question.text || ''}`.toLowerCase()
  if (text.includes('mcq') || text.includes('objective') || Array.isArray(question.options) && question.options.length) return 'mcq'
  if (text.includes('true false')) return 'true_false'
  if (text.includes('fill')) return 'fill'
  if (text.includes('match')) return 'columns'
  if (text.includes('numerical') || text.includes('calculate') || text.includes('solve')) return 'numerical'
  if (text.includes('diagram') || text.includes('draw') || text.includes('label')) return 'diagram'
  if (text.includes('definition') || text.includes('define') || text.includes('what is')) return 'short'
  if (text.includes('essay') || text.includes('mazmoon')) return 'essay'
  if (text.includes('letter') || text.includes('application') || text.includes('درخواست') || text.includes('خط')) return 'letter'
  if (text.includes('comprehension') || text.includes('tafheem') || text.includes('تفہیم')) return 'comprehension'
  if (text.includes('translation') || text.includes('ترجم')) return 'translation'
  if (text.includes('long') || text.includes('explanation') || text.includes('تشریح')) return 'long'
  return 'short'
}

function adaptUnifiedForPaperStudio(config, sections) {
  const selectedMCQ = []
  const selectedShort = []
  const selectedLong = []
  sections.forEach(section => {
    ;(section.questions || []).filter(q => String(q.text || '').trim()).forEach((q, index) => {
      const item = {
        id: q.id || safeId('legacy_q'),
        text: q.text || '',
        textUrdu: isUrduText(q.text) ? q.text : '',
        answer: q.answer || '',
        marks: Number(q.marks || section.marksEach || 1),
        options: Array.isArray(q.options) && q.options.length ? q.options : normalizeLegacyOptions(q.text),
        type: q.type || section.type,
        category: q.category || section.title,
        chapter: q.chapter || '',
        source: q.source || 'Unified Paper Generator',
        order: index + 1,
      }
      const bucket = legacyBucketForQuestion(item)
      if (bucket === 'mcq') selectedMCQ.push(item)
      else if (bucket === 'long') selectedLong.push(item)
      else selectedShort.push(item)
    })
  })
  const language = config.medium === 'Urdu' ? 'urdu' : config.medium === 'Dual Medium' ? 'mixed' : 'english'
  return {
    config: {
      title: `${config.subject || 'Paper'} ${config.paperType || ''}`.trim(),
      classLevel: config.classLevel,
      subject: config.subject,
      examType: config.paperType || config.intent || 'Paper',
      duration: parseDurationMinutes(config.time),
      totalMarks: config.totalMarks,
      language,
      instructions: sections?.[0]?.instructions || '',
      paperCode: '',
      examDate: new Date().toISOString().slice(0, 10),
    },
    selectedMCQ,
    selectedShort,
    selectedLong,
    selectedChapters: String(config.chapters || '').split(/[,\n]+/).map(x => x.trim()).filter(Boolean),
  }
}

function isNumberedAssessmentPattern(pattern, sections = []) {
  if (pattern?.structureMode === 'numbered') return true
  if (!Array.isArray(sections) || sections.length < 2) return false
  return sections.every(section => Number(section.attemptRequired || section.totalQuestions || 0) <= 1)
    && sections.some(section => String(section.id || '').startsWith('nq-'))
}

function adaptUnifiedForPTS(config, sections, pattern = null, reviewItems = []) {
  const activePattern = pattern || null
  if (isNumberedAssessmentPattern(activePattern, sections)) {
    const grouped = {}
    const marksByType = {}
    const numberedQuestionTypes = []

    const appendNumberedQuestion = (sectionLike, question, index) => {
      const questionNo = Number(sectionLike?.questionNo || question?.targetQuestionNo || index + 1)
      const typeId = `nq_${questionNo}`
      if (grouped[typeId]?.length) return
      const prompt = sectionLike?.title || sectionLike?.prompt || `Question ${questionNo}`
      const medium = config.medium === 'Urdu' ? 'urdu' : config.medium === 'Dual Medium' ? 'dual' : 'english'
      const rawText = String(question?.text || question?.en || '').trim()
      const en = stripPromptFromQuestionBody(prompt, rawText)
      if (!en && !rawText && !prompt) return
      const ur = question?.textUrdu || question?.ur || (isUrduText(en) ? en : '')
      grouped[typeId] = [{
        id: question?.id || safeId(typeId),
        type: typeId,
        medium,
        en,
        ur,
        text: en,
        textUrdu: ur,
        answer: question?.answer || '',
        markingNotes: question?.markingNotes || '',
        priority: 'all',
        chapterId: question?.chapter || config.chapters || '',
        chapter: question?.chapter || config.chapters || '',
        options: Array.isArray(question?.options) ? question.options : [],
      }]
      marksByType[typeId] = Number(question?.marks || sectionLike?.marksEach || sectionLike?.marks || 2)
      numberedQuestionTypes.push({
        value: typeId,
        questionNo,
        label: prompt,
        labelUrdu: prompt,
        marks: marksByType[typeId],
        layout: 'block',
      })
    }

    sections.forEach((section, index) => {
      const question = (section.questions || []).find(item => String(item.text || item.en || '').trim())
      if (question) appendNumberedQuestion(section, question, index)
    })

    if (!numberedQuestionTypes.length) {
      const readyItems = (reviewItems || []).filter(item => String(item.text || '').trim() && (item.reviewStatus === 'Ready' || item.reviewStatus === 'Approved'))
      const patternSections = activePattern?.sections || []
      readyItems.forEach((item, index) => {
        const sectionLike = patternSections.find(section => Number(section.questionNo) === Number(item.targetQuestionNo))
          || patternSections[index]
          || { questionNo: item.targetQuestionNo || index + 1, title: `Question ${item.targetQuestionNo || index + 1}`, marksEach: item.marks }
        appendNumberedQuestion(sectionLike, item, index)
      })
    }

    if (numberedQuestionTypes.length) {
      numberedQuestionTypes.sort((a, b) => Number(a.questionNo || 0) - Number(b.questionNo || 0))
      const templatePreset = resolveTemplatePreset(config)
      return {
        name: `${config.subject || 'Paper'} ${config.paperType || config.intent || ''}`.trim(),
        sourceTab: 'unified',
        structureMode: 'numbered_assessment',
        paperSource: 'unified-paper-generator',
        importToQuestionBank: false,
        numberedQuestionTypes,
        printPrefs: { tmpl: templatePreset },
        templatePreset,
        config: {
          subjectName: config.subject,
          subject: config.subject,
          className: config.classLevel,
          classLevel: config.classLevel,
          paperCode: config.paperCode || String(Math.floor(1000 + Math.random() * 9000)),
          timeAllowed: config.time || '2 hours',
          examDate: config.examDate || new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
          language: config.medium === 'Urdu' ? 'urdu' : config.medium === 'Dual Medium' ? 'dual' : 'english',
          publisher: config.board || '',
          paperType: config.paperType || config.intent || 'Paper',
          totalMarks: Number(config.totalMarks || Object.values(marksByType).reduce((sum, mark) => sum + Number(mark || 0), 0)),
        },
        selectedQuestions: Object.fromEntries(Object.entries(grouped).map(([type, questions]) => [
          type,
          { questions, marks: marksByType[type] || 2 },
        ])),
        selectedMCQ: [],
        selectedShort: [],
        selectedLong: [],
        ...Object.fromEntries(Object.entries(grouped).map(([type, questions]) => [type, questions])),
        ...Object.fromEntries(Object.entries(marksByType).map(([type, marks]) => [`${type}_marks`, marks])),
      }
    }
  }

  const grouped = {}
  const marksByType = {}
  sections.forEach(section => {
    ;(section.questions || []).filter(q => String(q.text || '').trim()).forEach((q, index) => {
      const typeId = mapUnifiedQuestionType(q)
      const medium = config.medium === 'Urdu' ? 'urdu' : config.medium === 'Dual Medium' ? 'dual' : 'english'
      const en = q.text || ''
      const ur = q.textUrdu || (isUrduText(q.text) ? q.text : '')
      const options = Array.isArray(q.options) ? q.options.map((opt, optIndex) => ({
        key: opt.key || opt.label || String.fromCharCode(65 + optIndex),
        label: opt.label || opt.key || String.fromCharCode(65 + optIndex),
        en: opt.text || opt.en || '',
        ur: opt.textUrdu || opt.ur || opt.text || opt.en || '',
        correct: String(q.answer || '').toUpperCase() === String(opt.label || opt.key || '').toUpperCase(),
      })) : []
      const item = {
        id: q.id || safeId(typeId),
        type: typeId,
        medium,
        en,
        ur,
        text: en,
        textUrdu: ur,
        answer: q.answer || '',
        priority: 'all',
        chapterId: q.chapter || config.chapters || '',
        chapter: q.chapter || config.chapters || '',
        options,
      }
      grouped[typeId] = [...(grouped[typeId] || []), item]
      if (!marksByType[typeId]) marksByType[typeId] = Number(q.marks || section.marksEach || 1)
    })
  })

  return {
    name: `${config.subject || 'Paper'} ${config.paperType || config.intent || ''}`.trim(),
    sourceTab: 'unified',
    structureMode: 'paper_studio_unified',
    paperSource: 'unified-paper-generator',
    importToQuestionBank: false,
    config: {
      subjectName: config.subject,
      subject: config.subject,
      className: config.classLevel,
      classLevel: config.classLevel,
      paperCode: config.paperCode || '',
      timeAllowed: config.time || '2 hours',
      examDate: config.examDate || new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      language: config.medium === 'Urdu' ? 'urdu' : config.medium === 'Dual Medium' ? 'dual' : 'english',
      publisher: config.board || '',
      paperType: config.paperType || config.intent || 'Paper',
    },
    selectedQuestions: Object.fromEntries(Object.entries(grouped).map(([type, questions]) => [
      type,
      { questions, marks: marksByType[type] || (type === 'mcq' ? 1 : type === 'long' ? 5 : 2) },
    ])),
    selectedMCQ: grouped.mcq || [],
    selectedShort: grouped.short || [],
    selectedLong: grouped.long || [],
    ...Object.fromEntries(Object.entries(grouped).map(([type, questions]) => [type, questions])),
    ...Object.fromEntries(Object.entries(marksByType).map(([type, marks]) => [`${type}_marks`, marks])),
  }
}

function readDrafts() {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || '[]') } catch { return [] }
}

function writeDraft(draft) {
  const drafts = readDrafts().filter(x => x.id !== draft.id)
  localStorage.setItem(DRAFT_KEY, JSON.stringify([draft, ...drafts].slice(0, 20)))
}

function Field({ label, children }) {
  return <label style={{ display:'grid', gap:6, color:C.muted, fontSize:12, fontWeight:700 }}>{label}{children}</label>
}

function Select({ value, onChange, children }) {
  return <select value={value} onChange={e => onChange(e.target.value)} style={{ width:'100%', background:'rgba(7,22,40,0.9)', color:C.silver, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 12px' }}>{children}</select>
}

function Input(props) {
  return <input {...props} style={{ width:'100%', background:'rgba(7,22,40,0.9)', color:C.silver, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 12px', boxSizing:'border-box' }} />
}

function Btn({ children, variant = 'dark', ...props }) {
  const isGold = variant === 'gold'
  return <button {...props} style={{ background:isGold ? `linear-gradient(135deg,${C.gold2},${C.gold})` : 'rgba(8,24,43,0.96)', color:isGold ? '#071e34' : C.silver, border:isGold ? 'none' : `1px solid ${C.border}`, borderRadius:12, padding:'10px 14px', fontWeight:800, cursor:'pointer', ...(props.style || {}) }}>{children}</button>
}

function PaperSheet({ config, pattern, sections, setSections }) {
  const rtl = config.medium !== 'English' || pattern.languageDirection === 'rtl'
  const updateQuestion = (sectionIndex, questionIndex, patch) => {
    setSections(prev => prev.map((section, sIdx) => sIdx !== sectionIndex ? section : {
      ...section,
      questions: section.questions.map((q, qIdx) => qIdx !== questionIndex ? q : { ...q, ...patch, reviewStatus:'Ready' })
    }))
  }
  return (
    <div style={{ background:'#fff', color:'#111827', width:'100%', maxWidth:820, minHeight:1120, margin:'0 auto', padding:34, boxShadow:'0 20px 60px rgba(0,0,0,0.35)', direction:rtl ? 'rtl' : 'ltr', fontFamily:rtl ? "'Noto Nastaliq Urdu','Noto Naskh Arabic',serif" : 'Georgia, serif' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', alignItems:'start', gap:12, borderBottom:'2px solid #111827', paddingBottom:12 }}>
        <div style={{ textAlign:rtl ? 'right' : 'left', fontSize:13 }}>Roll No. __________________</div>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontWeight:900, fontSize:20 }}>{config.subject || 'Subject'} - Class {config.classLevel}</div>
          <div style={{ fontSize:13 }}>{config.board || 'School'} | {config.paperType}</div>
          <div style={{ fontSize:13 }}>Time: {config.time} | Marks: {config.totalMarks}</div>
        </div>
        <div style={{ textAlign:rtl ? 'left' : 'right', fontSize:13 }}>{new Date().getFullYear()}</div>
      </div>
      <div style={{ marginTop:12, fontSize:12, lineHeight:1.8 }}>
        {(pattern.instructions || []).map((ins, i) => <div key={i}>{i + 1}. {ins}</div>)}
      </div>
      {sections.map((section, sectionIndex) => (
        <section key={section.id} style={{ marginTop:22, breakInside:'avoid' }}>
          <div style={{ display:'flex', justifyContent:'space-between', gap:12, borderBottom:'1px solid #d1d5db', paddingBottom:6 }}>
            <strong>Q{section.questionNo}. {section.title}</strong>
            <span>{section.marks} marks</span>
          </div>
          <div style={{ fontSize:12, color:'#374151', marginTop:4 }}>Attempt {section.attemptRequired} of {section.totalQuestions}. Each {section.marksEach} mark(s).</div>
          <div style={{ display:'grid', gap:10, marginTop:12 }}>
            {section.questions.map((q, questionIndex) => (
              <div key={q.id} style={{ display:'grid', gap:6 }}>
                <textarea
                  value={q.text}
                  placeholder={`Question ${questionIndex + 1} - ${q.category}`}
                  onChange={e => updateQuestion(sectionIndex, questionIndex, { text:e.target.value })}
                  style={{ width:'100%', minHeight:52, border:'1px solid #d1d5db', borderRadius:8, padding:10, fontSize:14, direction:isUrduText(q.text) || rtl ? 'rtl' : 'ltr', fontFamily:'inherit', resize:'vertical', boxSizing:'border-box' }}
                />
                <div style={{ display:'grid', gridTemplateColumns:'1fr 100px 130px', gap:8 }}>
                  <input value={q.category} onChange={e => updateQuestion(sectionIndex, questionIndex, { category:e.target.value })} style={{ border:'1px solid #d1d5db', borderRadius:8, padding:8 }} />
                  <input type="number" value={q.marks} onChange={e => updateQuestion(sectionIndex, questionIndex, { marks:Number(e.target.value) })} style={{ border:'1px solid #d1d5db', borderRadius:8, padding:8 }} />
                  <span style={{ fontSize:11, alignSelf:'center', color:q.reviewStatus === 'Ready' ? '#047857' : '#b45309' }}>{q.reviewStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export default function UnifiedPaperGenerator() {
  const { subjects = [], questions = [], paperSettings = {}, importPaperQuestionsToBank, savedPapers = [] } = usePaperStore()
  const [active, setActive] = useState('Create Paper')
  const [manualText, setManualText] = useState('')
  const [reviewItems, setReviewItems] = useState([])
  const [reviewFilter, setReviewFilter] = useState('all')
  const [selectedBankIds, setSelectedBankIds] = useState([])
  const [importQueue, setImportQueue] = useState([])
  const [aiStatus, setAiStatus] = useState('')
  const [extractingId, setExtractingId] = useState('')
  const [layoutEngine, setLayoutEngine] = useState('paper-studio')
  const [proPaperOverride, setProPaperOverride] = useState(null)
  const [drafts, setDrafts] = useState(() => readDrafts())
  const [patternOverride, setPatternOverride] = useState(null)
  const [ptsSessionKey, setPtsSessionKey] = useState(0)
  const [reopenedSavedPaper, setReopenedSavedPaper] = useState(null)
  const [config, setConfig] = useState({
    intent:'Board Pattern Paper',
    classLevel:'9',
    subject:'Biology',
    medium:'English',
    board:'Punjab / Gujranwala Board',
    paperType:'Annual',
    totalMarks:75,
    time:'2 hours 30 minutes',
    chapters:'',
    topics:'',
    difficulty:'Balanced',
    source:'Mixed Source',
    answerKey:true,
    markingScheme:true,
    sets:3,
  })

  const pattern = useMemo(() => patternOverride || findUnifiedPattern(config), [config, patternOverride])
  const visiblePatterns = useMemo(
    () => listPatternsForSelection(config),
    [config.classLevel, config.subject, config.medium],
  )
  const classTier = useMemo(() => getClassTier(config.classLevel), [config.classLevel])
  const patternKey = `${config.classLevel}|${config.subject}|${config.medium}|${config.intent}`
  const bankItems = useMemo(() => {
    const ids = new Set(selectedBankIds)
    return questions.filter(q => ids.has(q.id)).map(q => ({
      id:q.id,
      text:q.en || q.ur || q.question || q.text || '',
      answer:q.answer || '',
      type:q.type || q.question_type || 'Short Question',
      category:q.category || q.type || 'Question Bank',
      marks:q.marks || 2,
      source:'Question Bank',
      reviewStatus:'Ready',
      duplicateHash: duplicateHash(q.en || q.ur || q.question || q.text || ''),
      confidence: 1,
      language: q.language || (isUrduText(q.ur || q.question || q.text || '') ? 'urdu' : 'english'),
      medium: config.medium,
      classLevel: q.classLevel || q.class_level || config.classLevel,
      subject: q.subject || q.subjectName || config.subject,
      board: q.board || config.board,
    }))
  }, [questions, selectedBankIds])
  const [sections, setSections] = useState(() => buildSectionsFromPattern(findUnifiedPattern({ classLevel:'9', subject:'Biology', medium:'English' }), config))
  const warnings = useMemo(() => validatePaper(config, pattern, sections, reviewItems), [config, pattern, sections, reviewItems])
  const paperStudioPreview = useMemo(() => adaptUnifiedForPaperStudio(config, sections), [config, sections])
  const ptsLoadedPaper = useMemo(
    () => adaptUnifiedForPTS(config, sections, patternOverride || pattern, reviewItems),
    [config, sections, pattern, patternOverride, reviewItems],
  )
  const effectivePtsPaper = useMemo(
    () => (proPaperOverride ? { ...ptsLoadedPaper, ...proPaperOverride } : ptsLoadedPaper),
    [ptsLoadedPaper, proPaperOverride],
  )
  const questionBankMatches = useMemo(() => questions.filter(q => {
    const subject = String(q.subject || q.subjectName || '').toLowerCase()
    const classLevel = String(q.classLevel || q.class_level || '')
    return (!subject || subject.includes(config.subject.toLowerCase())) && (!classLevel || classLevel === String(config.classLevel))
  }).slice(0, 80), [questions, config.subject, config.classLevel])

  const approvedReviewItems = (items = reviewItems) => items.filter(i => i.reviewStatus === 'Ready' || i.reviewStatus === 'Approved')

  const reviewStats = useMemo(() => {
    const withText = reviewItems.filter(item => String(item.text || '').trim())
    return {
      total: withText.length,
      ready: withText.filter(isReviewReady).length,
      needsReview: withText.filter(item => !isReviewReady(item)).length,
      lowConfidence: withText.filter(item => Number(item.confidence || 0) > 0 && Number(item.confidence || 0) < 0.7).length,
      highConfidencePending: withText.filter(item => !isReviewReady(item) && Number(item.confidence || 0) >= 0.85).length,
    }
  }, [reviewItems])

  const filteredReviewItems = useMemo(() => {
    const items = reviewItems.filter(item => {
      const confidence = Number(item.confidence ?? 0)
      if (reviewFilter === 'ready') return isReviewReady(item)
      if (reviewFilter === 'needs_review') return !isReviewReady(item)
      if (reviewFilter === 'low') return confidence > 0 && confidence < 0.7
      return true
    })
    return [...items].sort((a, b) => Number(a.confidence ?? 0) - Number(b.confidence ?? 0))
  }, [reviewItems, reviewFilter])

  useEffect(() => {
    if (patternOverride) return
    const activePattern = findUnifiedPattern(config)
    const computedMarks = Number(activePattern.objectiveMarks || 0) + Number(activePattern.subjectiveMarks || 0)
    setConfig(prev => ({
      ...prev,
      board: prev.intent === 'Board Pattern Paper' ? (activePattern.board || prev.board) : prev.board,
      totalMarks: computedMarks || prev.totalMarks,
      time: activePattern.subjectiveTime || prev.time,
    }))
    setSections(buildSectionsFromPattern(activePattern, config, bankItems, approvedReviewItems(reviewItems)))
  }, [patternKey, patternOverride])

  const rebuild = (items = reviewItems, nextActive = null) => {
    setSections(buildSectionsFromPattern(pattern, config, bankItems, approvedReviewItems(items)))
    if (nextActive) setActive(nextActive)
  }
  const updateConfig = (key, value) => setConfig(prev => ({ ...prev, [key]: value }))
  const parsePaste = () => {
    const inferred = inferConfigFromPaste(manualText, config)
    const mergedConfig = { ...config, ...inferred }
    const { items: parsed, patternOverride: nextPattern, summary } = parseSmartPasteV2(manualText, mergedConfig)
    setConfig(mergedConfig)
    if (nextPattern) setPatternOverride(nextPattern)
    setReviewItems(prev => [...parsed, ...prev.filter(item => !String(item.source || '').startsWith('Manual Paste'))])
    setAiStatus(summary || `Sent ${parsed.length} item(s) to review.`)
    setActive('Import Review Queue')
  }
  const pasteAndBuildPaper = () => {
    const inferred = inferConfigFromPaste(manualText, config)
    const mergedConfig = { ...config, ...inferred }
    const { items: parsed, patternOverride: nextPattern, summary } = parseSmartPasteV2(manualText, mergedConfig)
    if (!parsed.length) {
      setAiStatus('No questions detected. Check the paste format and try again.')
      return
    }
    setConfig(mergedConfig)
    setPatternOverride(nextPattern)
    const nextItems = parsed.map(item => ({
      ...item,
      reviewStatus: Number(item.confidence || 0) >= 0.85 ? 'Ready' : 'Needs Review',
    }))
    setReviewItems(nextItems)
    const activePattern = nextPattern || findUnifiedPattern(mergedConfig)
    setSections(buildSectionsFromPattern(activePattern, mergedConfig, bankItems, approvedReviewItems(nextItems)))
    setPtsSessionKey(key => key + 1)
    setProPaperOverride(null)
    setLayoutEngine('paper-studio-pro')
    setAiStatus(summary || `Built paper with ${nextItems.length} question(s).`)
    setActive('Paper Preview')
  }
  const approveAllAndBuildPaper = () => {
    const nextItems = reviewItems.map(item => item.text ? { ...item, reviewStatus:'Ready' } : item)
    setReviewItems(nextItems)
    setSections(buildSectionsFromPattern(pattern, config, bankItems, approvedReviewItems(nextItems)))
    setActive('Paper Preview')
  }
  const approveHighConfidence = () => {
    const nextItems = reviewItems.map(item => (
      item.text && Number(item.confidence || 0) >= 0.85
        ? { ...item, reviewStatus: 'Ready' }
        : item
    ))
    setReviewItems(nextItems)
    setAiStatus(`Approved ${nextItems.filter(item => item.text && isReviewReady(item)).length} high-confidence item(s).`)
  }
  const saveApprovedToBank = () => {
    const selectedQuestions = {}
    approvedReviewItems().filter(item => String(item.text || '').trim()).forEach(item => {
      const type = bankTypeFromUnified(item.type, item.category)
      selectedQuestions[type] = selectedQuestions[type] || { marks:Number(item.marks || 1), questions:[] }
      selectedQuestions[type].questions.push({
        text:isUrduText(item.text) ? '' : item.text,
        textUrdu:isUrduText(item.text) ? item.text : '',
        answer:item.answer || '',
        marks:Number(item.marks || selectedQuestions[type].marks || 1),
        chapter:item.chapter || '',
        topic:item.topic || '',
        medium:item.medium || config.medium,
        priority:'all',
      })
    })
    const result = importPaperQuestionsToBank?.({
      subjectMeta:{ name:config.subject, classLevel:config.classLevel, publisher:config.board },
      selectedQuestions,
      medium:String(config.medium || 'english').toLowerCase(),
      chapter:config.chapters || '',
      source:'unified-paper-generator',
      priority:'all',
    })
    setAiStatus(result?.total ? `${result.total} approved question(s) saved to Question Bank.` : 'No new approved questions were added to Question Bank.')
  }
  const generateMissingQuestions = async () => {
    const drafts = createAiDraftsForMissing(sections, config, pattern)
    if (!drafts.length) {
      setAiStatus('No missing question slots found. Rebuild/validate the paper if you expected gaps.')
      setActive('Import Review Queue')
      return
    }
    setAiStatus(`Generating ${drafts.length} missing question(s) with AI...`)
    try {
      const generated = await callUnifiedGapFillAi(config, drafts, sections)
      const draftBySlot = Object.fromEntries(drafts.map(draft => [draft.slotId || draft.id, draft]))
      const items = generated
        .map((question, index) => {
          const draft = draftBySlot[question.slotId] || drafts[index] || drafts[0]
          return aiQuestionToReviewItem(question, draft, config)
        })
        .filter(item => item.text)
      if (items.length) {
        setReviewItems(prev => [...items, ...prev])
        setSections(buildSectionsFromPattern(pattern, config, bankItems, approvedReviewItems([...items, ...reviewItems])))
        setAiStatus(`Generated ${items.length} slot-matched question(s). Review and approve before export.`)
      } else {
        setReviewItems(prev => [...drafts, ...prev])
        setAiStatus('AI returned no structured questions. Draft requests were created for manual completion.')
      }
    } catch (error) {
      setReviewItems(prev => [...drafts, ...prev])
      setAiStatus(`AI fill failed safely. Draft requests were created instead. ${error?.message || ''}`.trim())
    }
    setActive('Import Review Queue')
  }
  const segmentImportText = (item) => {
    const mergedConfig = { ...config }
    const { items: parsed, patternOverride: nextPattern, summary } = parseSmartPasteV2(item.rawText || item.text || '', mergedConfig)
    if (nextPattern) setPatternOverride(nextPattern)
    setReviewItems(prev => [
      ...parsed.map(row => ({ ...row, source: `Imported Review: ${item.name || 'Upload'}` })),
      ...prev.filter(row => !String(row.source || '').startsWith('Manual Paste')),
    ])
    setImportQueue(prev => prev.map(row => row.id === item.id ? { ...row, status:'Segmented for teacher review', confidence:0.85 } : row))
    if (summary) setAiStatus(summary)
  }
  const saveDraft = () => {
    const draft = {
      id: safeId('draft'),
      config,
      sections,
      reviewItems,
      layoutEngine,
      patternOverride,
      savedAt: new Date().toISOString(),
    }
    writeDraft(draft)
    setDrafts(readDrafts())
    setAiStatus('Draft snapshot saved on this device.')
  }
  const exportPrint = () => {
    if (layoutEngine === 'paper-studio') {
      setActive('Paper Preview')
      setTimeout(() => window.print(), 80)
      return
    }
    const html = document.getElementById('unified-paper-print-area')?.innerHTML || ''
    const win = window.open('', '_blank', 'width=980,height=900')
    if (!win) return
    win.document.write(`<!doctype html><html><head><title>${config.subject} Paper</title><style>@page{size:A4;margin:12mm}body{margin:0;background:#fff}.toolbar{position:sticky;top:0;background:#111827;color:#fff;padding:10px;font-family:Arial}.toolbar button{padding:8px 14px;border:0;border-radius:8px;font-weight:700}@media print{.toolbar{display:none} textarea,input{border:0!important;resize:none}}</style></head><body><div class="toolbar"><button onclick="window.print()">Print / Save PDF</button></div>${html}</body></html>`)
    win.document.close()
    win.focus()
  }

  const buildExportPayload = () => {
    const base = reopenedSavedPaper || effectivePtsPaper || {}
    return {
      ...base,
      name: base.name || `${config.subject} Class ${config.classLevel}`,
      config: {
        ...(base.config || {}),
        subjectName: config.subject,
        subject: config.subject,
        className: config.classLevel,
        classLevel: config.classLevel,
        paperCode: base.config?.paperCode || config.paperCode || String(Math.floor(1000 + Math.random() * 9000)),
        timeAllowed: config.time || base.config?.timeAllowed || '2 hours',
        examDate: config.examDate || base.config?.examDate || new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
        language: config.medium === 'Urdu' ? 'urdu' : config.medium === 'Dual Medium' ? 'dual' : 'english',
        totalMarks: config.totalMarks || base.config?.totalMarks,
        chapters: config.chapters || base.config?.chapters,
      },
      paperSource: base.paperSource || 'unified-paper-generator',
      sourceTab: base.sourceTab || 'unified',
      structureMode: base.structureMode || 'numbered_assessment',
    }
  }

  const exportDocx = () => {
    exportPaperAsDocx(buildExportPayload(), paperSettings, `${config.subject}_Class${config.classLevel}`)
    setAiStatus('DOCX downloaded — open in Microsoft Word.')
  }

  const exportAnswerKey = () => {
    const payload = buildExportPayload()
    const types = payload.numberedQuestionTypes || []
    if (config.answerKey === false) {
      setAiStatus('Answer key export is disabled in paper settings.')
      return
    }
    printAnswerKeyDocument(payload, types, paperSettings, payload.config)
    setAiStatus('Answer key sent to printer.')
  }

  const exportAnswerKeyDocx = () => {
    const payload = buildExportPayload()
    const types = payload.numberedQuestionTypes || []
    exportAnswerKeyAsDocx(payload, types, paperSettings, payload.config)
    setAiStatus('Answer key DOCX downloaded.')
  }

  const exportPaperSets = () => {
    const setCount = Math.max(1, Math.min(Number(config.sets) || 3, 5))
    const sets = generatePaperSets(buildExportPayload(), setCount)
    printPaperSets(sets, paperSettings)
    setAiStatus(`Generated ${sets.length} paper set(s) — unique codes, shuffled MCQ options, and shuffled short/long order.`)
  }

  const exportMarkingScheme = () => {
    if (config.markingScheme === false) {
      setAiStatus('Marking scheme export is disabled in paper settings.')
      return
    }
    const payload = buildExportPayload()
    printMarkingSchemeDocument(payload, payload.numberedQuestionTypes || [], paperSettings, payload.config)
    setAiStatus('Marking scheme sent to printer.')
  }

  const exportMarkingSchemeDocx = () => {
    const payload = buildExportPayload()
    exportMarkingSchemeAsDocx(payload, payload.numberedQuestionTypes || [], paperSettings, payload.config)
    setAiStatus('Marking scheme DOCX downloaded.')
  }

  const shareWhatsapp = () => {
    sharePaperViaWhatsApp(buildExportPayload(), paperSettings)
    setAiStatus('WhatsApp share opened — attach the downloaded DOCX if needed.')
  }

  const sharePdf = () => {
    sharePaperAsPdf(buildExportPayload(), paperSettings)
    setAiStatus('PDF export opened — choose Save as PDF in the print dialog.')
  }

  const shareFullPackage = async () => {
    const payload = buildExportPayload()
    const result = await sharePaperPackage(payload, paperSettings, payload.numberedQuestionTypes || [])
    setAiStatus(result.mode === 'native' ? 'Paper shared via device share sheet.' : 'DOCX + Answer Key downloaded. WhatsApp message opened.')
  }

  const fillModelAnswersWithAI = async () => {
    const payload = buildExportPayload()
    const types = payload.numberedQuestionTypes || pattern?.sections?.map(section => ({
      questionNo: section.questionNo,
      label: section.title,
      marks: section.marksEach,
    })) || []
    const questionRows = types.map(type => {
      const review = reviewItems.find(item => Number(item.targetQuestionNo) === Number(type.questionNo))
        || reviewItems.find(item => String(item.source || '').includes(`Q${type.questionNo}`))
      const section = sections.find(s => Number(s.questionNo) === Number(type.questionNo))
      const sectionQ = section?.questions?.[0]
      return {
        id: review?.id || sectionQ?.id || `nq_${type.questionNo}`,
        questionNo: type.questionNo,
        prompt: type.label || section?.title || '',
        text: review?.text || sectionQ?.text || '',
        marks: type.marks || section?.marksEach || 2,
        type: sectionQ?.type || 'Short Question',
        answer: review?.answer || sectionQ?.answer || '',
      }
    }).filter(row => String(row.text || row.prompt || '').trim())

    const pending = questionRows.filter(row => !String(row.answer || '').trim())
    if (!pending.length) {
      setAiStatus('All questions already have model answers.')
      return
    }

    setAiStatus(`Generating model answers for ${pending.length} question(s) with AI...`)
    try {
      const { answers } = await generateModelAnswers(config, pending)
      if (!answers.length) {
        setAiStatus('AI did not return model answers. Try again or add answers manually.')
        return
      }
      const nextReview = mergeAiAnswersIntoReviewItems(reviewItems, answers)
      setReviewItems(nextReview)
      setSections(buildSectionsFromPattern(patternOverride || pattern, config, bankItems, approvedReviewItems(nextReview)))
      setPtsSessionKey(key => key + 1)
      setAiStatus(`AI filled ${answers.length} model answer(s). Export Answer Key or Marking Scheme now.`)
    } catch (error) {
      setAiStatus(`AI answer fill failed: ${error?.response?.data?.message || error?.message || 'Unknown error'}`)
    }
  }

  const handleReopenSavedPaper = (paper) => {
    const normalized = normalizeSavedPaperForLoad(paper)
    setReopenedSavedPaper(normalized)
    setLayoutEngine('paper-studio')
    setPtsSessionKey(key => key + 1)
    setActive('Paper Preview')
    setAiStatus(`Reopened "${normalized.name}" from saved library.`)
  }

  useEffect(() => {
    const queued = consumeQueuedSavedPaper(savedPapers)
    if (!queued) return
    const normalized = normalizeSavedPaperForLoad(queued)
    setReopenedSavedPaper(normalized)
    setLayoutEngine('paper-studio')
    setPtsSessionKey(key => key + 1)
    setActive('Paper Preview')
    setAiStatus(`Reopened "${normalized.name}" from saved library.`)
  }, [savedPapers])

  if (active === 'Paper Preview' && layoutEngine === 'paper-studio-pro') {
    return (
      <PaperDocumentEditor
        key={ptsSessionKey}
        loadedPaper={reopenedSavedPaper || effectivePtsPaper}
        paperSettings={paperSettings}
        language={config.medium === 'Urdu' ? 'urdu' : config.medium === 'Dual Medium' ? 'dual' : 'english'}
        onPaperChange={setProPaperOverride}
        onOpenPrintPreview={(paper) => {
          setProPaperOverride(paper)
          setLayoutEngine('paper-studio')
          setPtsSessionKey(key => key + 1)
        }}
        onReturnToSource={() => {
          setReopenedSavedPaper(null)
          setActive('Create Paper')
        }}
      />
    )
  }

  if (active === 'Paper Preview' && layoutEngine === 'paper-studio') {
    return (
      <PTSPaperGenerator
        key={ptsSessionKey}
        loadedPaper={reopenedSavedPaper || effectivePtsPaper}
        onReturnToSource={() => {
          setReopenedSavedPaper(null)
          setActive('Create Paper')
        }}
      />
    )
  }
  const addImportFiles = async (files) => {
    const rows = await Promise.all(Array.from(files || []).map(async (file) => {
      const isText = /\.(txt|md|csv)$/i.test(file.name || '')
      const rawText = isText ? await file.text().catch(() => '') : ''
      return {
        id:safeId('upload'),
        name:file.name,
        status:isText ? 'Raw text loaded. Segment for review.' : 'Uploaded. Paste extracted/raw text or run OCR later.',
        rawText,
        file,
        confidence:isText && rawText ? 0.65 : 0,
        fileType:file.type || '',
        createdAt:new Date().toISOString(),
      }
    }))
    setImportQueue(prev => [...rows, ...prev])
    setActive('Import Review Queue')
  }
  const runSafeExtraction = async (item) => {
    if (!item.file && !String(item.rawText || '').trim()) {
      setAiStatus('Add a file or paste raw text before running extraction.')
      return
    }
    setExtractingId(item.id)
    setAiStatus(`Extracting ${item.name || 'raw text'} for teacher review...`)
    setImportQueue(prev => prev.map(row => row.id === item.id ? { ...row, status:'Extracting with AI...' } : row))
    try {
      const result = await callUnifiedExtract(config, item.file || null, item.rawText || '', (message, progress) => {
        setImportQueue(prev => prev.map(row => row.id === item.id ? { ...row, status:`${message}${progress ? ` (${progress}%)` : ''}` } : row))
      })
      const source = `AI Extracted Review: ${item.name || 'Raw Text'}`
      const parsed = normalizeExtractedQuestions(result)
        .map(question => extractedQuestionToReviewItem(question, source, config))
        .filter(row => row.text)
      if (parsed.length) {
        setReviewItems(prev => [...parsed, ...prev])
        setImportQueue(prev => prev.map(row => row.id === item.id ? { ...row, status:`Extracted ${parsed.length} item(s) for review.`, confidence:0.65 } : row))
        setAiStatus(`Extracted ${parsed.length} item(s). Nothing is final until teacher approval.`)
      } else {
        setImportQueue(prev => prev.map(row => row.id === item.id ? { ...row, status:'Extraction returned no structured questions. Raw text remains available for segmentation.' } : row))
        setAiStatus('Extraction returned no structured questions. Use Segment Raw Text or paste corrected text.')
      }
    } catch (error) {
      setImportQueue(prev => prev.map(row => row.id === item.id ? { ...row, status:'Extraction failed safely. Raw text/manual correction remains available.' } : row))
      setAiStatus(`Extraction failed safely. ${error?.message || 'Manual review flow is still available.'}`)
    } finally {
      setExtractingId('')
    }
  }

  const tabs = ['Create Paper', 'Board Pattern Builder', 'School Assessment Builder', 'Smart Manual Paste', 'Question Bank Selector', 'Import Review Queue', 'Pattern Library', 'Paper Preview', 'Export Center', 'Saved Library']
  const lowerClassMode = Number(config.classLevel) <= 5

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.silver, padding:24, fontFamily:'Inter, system-ui, sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', gap:16, alignItems:'center', marginBottom:18 }}>
        <div>
          <h1 style={{ margin:0, color:'#fff', fontSize:28 }}>Unified Paper Generator</h1>
          <p style={{ margin:'6px 0 0', color:C.muted }}>Separate controlled builder. Existing Paper Preview and old modules are not modified.</p>
          {aiStatus && <p style={{ margin:'6px 0 0', color:C.gold, fontWeight:800 }}>{aiStatus}</p>}
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <Btn onClick={saveDraft}>Save Draft</Btn>
          <Btn variant="gold" onClick={() => { rebuild(); setActive('Paper Preview') }}>Preview Paper</Btn>
          <Btn onClick={fillModelAnswersWithAI}>AI Model Answers</Btn>
          <Btn onClick={generateMissingQuestions}>Generate Missing Questions</Btn>
          <Btn onClick={() => setActive('Export Center')}>Export Center</Btn>
        </div>
      </div>

      <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:12, marginBottom:16 }}>
        {tabs.map(tab => <Btn key={tab} variant={active === tab ? 'gold' : 'dark'} onClick={() => setActive(tab)}>{tab}</Btn>)}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'minmax(280px, 380px) 1fr', gap:18 }}>
        <aside style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:16, padding:18, alignSelf:'start', position:'sticky', top:12 }}>
          <h2 style={{ margin:'0 0 14px', color:C.gold, fontSize:18 }}>Paper Controls</h2>
            <div style={{ display:'grid', gap:12 }}>
            <Field label="Preview Layout Engine"><Select value={layoutEngine} onChange={setLayoutEngine}><option value="paper-studio">Paper Studio (Print Templates)</option><option value="paper-studio-pro">Paper Studio Pro (Word Editor)</option><option value="unified">Unified Editable Sheet</option></Select></Field>
            <Field label="What do you want to create?"><Select value={config.intent} onChange={v => updateConfig('intent', v)}>{PAPER_INTENTS.map(x => <option key={x}>{x}</option>)}</Select></Field>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <Field label="Class"><Select value={config.classLevel} onChange={v => updateConfig('classLevel', v)}>{CLASSES.map(x => <option key={x}>{x}</option>)}</Select></Field>
              <Field label="Medium"><Select value={config.medium} onChange={v => updateConfig('medium', v)}>{MEDIUMS.map(x => <option key={x}>{x}</option>)}</Select></Field>
            </div>
            <Field label="Subject"><Select value={config.subject} onChange={v => updateConfig('subject', v)}>{[...new Set([...SUBJECTS, ...subjects.map(s => s.name).filter(Boolean)])].map(x => <option key={x}>{x}</option>)}</Select></Field>
            <div style={{ fontSize:11, color:C.muted, letterSpacing:'0.06em', textTransform:'uppercase' }}>
              Pattern tier: <strong style={{ color:C.gold }}>{classTier}</strong> · {visiblePatterns.length} match(es)
            </div>
            <Field label="Board / School"><Input value={config.board} onChange={e => updateConfig('board', e.target.value)} /></Field>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <Field label="Total Marks"><Input type="number" value={config.totalMarks} onChange={e => updateConfig('totalMarks', Number(e.target.value))} /></Field>
              <Field label="Time"><Input value={config.time} onChange={e => updateConfig('time', e.target.value)} /></Field>
            </div>
            <Field label="Question Source"><Select value={config.source} onChange={v => updateConfig('source', v)}>{QUESTION_SOURCES.map(x => <option key={x}>{x}</option>)}</Select></Field>
            <Field label="Chapters"><Input value={config.chapters} placeholder="e.g. 1, 2, 3" onChange={e => updateConfig('chapters', e.target.value)} /></Field>
            <Field label="Topics / SLOs"><Input value={config.topics} placeholder="Optional topics" onChange={e => updateConfig('topics', e.target.value)} /></Field>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <label style={{ color:C.muted, fontSize:12 }}><input type="checkbox" checked={config.answerKey} onChange={e => updateConfig('answerKey', e.target.checked)} /> Answer key</label>
              <label style={{ color:C.muted, fontSize:12 }}><input type="checkbox" checked={config.markingScheme} onChange={e => updateConfig('markingScheme', e.target.checked)} /> Marking scheme</label>
            </div>
            {!paperSettings?.logo && (
              <div style={{ padding:'10px 12px', borderRadius:12, border:`1px solid rgba(200,153,26,0.35)`, background:'rgba(200,153,26,0.08)', fontSize:12, color:C.silver, lineHeight:1.5 }}>
                <strong style={{ color:C.gold }}>School logo missing.</strong> Paper templates will use a default mark until you upload your logo in Question Bank settings.
                <div style={{ marginTop:8 }}><a href="/teacher/question-bank" style={{ color:C.gold, fontWeight:800, textDecoration:'none' }}>Open Question Bank → Upload Logo</a></div>
              </div>
            )}
          </div>
        </aside>

        <main style={{ display:'grid', gap:18 }}>
          {active === 'Create Paper' && (
            <section style={{ background:C.panel2, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
              <h2 style={{ marginTop:0, color:C.gold }}>Create Paper</h2>
              <p style={{ color:C.muted }}>Start with controlled setup. The selected pattern is loaded before questions are generated or pasted content is mapped.</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,minmax(140px,1fr))', gap:12 }}>
                {PAPER_INTENTS.map(intent => <button key={intent} onClick={() => updateConfig('intent', intent)} style={{ minHeight:86, borderRadius:14, border:`1px solid ${config.intent === intent ? C.gold : C.border}`, background:config.intent === intent ? 'rgba(200,153,26,0.16)' : 'rgba(7,22,40,0.7)', color:C.silver, fontWeight:800, cursor:'pointer' }}>{intent}</button>)}
              </div>
            </section>
          )}

          {active === 'Board Pattern Builder' && (
            <section style={{ background:C.panel2, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
              <h2 style={{ marginTop:0, color:C.gold }}>Board Pattern Builder</h2>
              <p style={{ color:C.muted }}>Loaded schema: {pattern.name}. Formats are schema-driven, not hard-coded in preview UI.</p>
              <div style={{ display:'grid', gap:10 }}>{pattern.sections.map(section => (
                <div key={section.id} style={{ background:'rgba(7,22,40,0.72)', border:`1px solid ${C.border}`, borderRadius:12, padding:14 }}>
                  <strong>Q{section.questionNo}. {section.title}</strong>
                  <div style={{ color:C.muted, fontSize:12, marginTop:4 }}>{section.type} | total {section.totalQuestions} | attempt {section.attemptRequired} | {section.marks} marks</div>
                  <div style={{ color:C.gold, fontSize:12, marginTop:6 }}>{(section.allowedCategories || []).slice(0, 10).join(' | ')}</div>
                </div>
              ))}</div>
            </section>
          )}

          {active === 'School Assessment Builder' && (
            <section style={{ background:C.panel2, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
              <h2 style={{ marginTop:0, color:C.gold }}>School Assessment Builder</h2>
              <p style={{ color:C.muted }}>Lower classes are not forced into board pattern. Select worksheet/test categories as needed.</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:10 }}>
                {(lowerClassMode ? LOWER_CLASS_TYPES : SCHOOL_ASSESSMENT_TYPES).map(x => <div key={x} style={{ padding:12, borderRadius:12, background:'rgba(7,22,40,0.72)', border:`1px solid ${C.border}` }}>{x}</div>)}
              </div>
            </section>
          )}

          {active === 'Smart Manual Paste' && (
            <section style={{ background:C.panel2, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
              <h2 style={{ marginTop:0, color:C.gold }}>Smart Manual Paste</h2>
              <p style={{ color:C.muted }}>Paste anything. Content is accepted, segmented, and moved to review instead of being rejected.</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))', gap:10, marginBottom:14 }}>
                {[
                  { title:'1. Paste Content', text:'Paste a full English paper, mixed draft, chapter exercise, or raw teacher notes into the box below.' },
                  { title:'2. Build Instantly', text:'Click "Paste & Build Paper" if you want the system to detect sections and generate the paper preview immediately.' },
                  { title:'3. Review First', text:'Click "Send to Review" if you want to inspect, approve, or adjust imported questions before building.' }
                ].map(card => (
                  <div key={card.title} style={{ padding:12, borderRadius:12, background:'rgba(7,22,40,0.72)', border:`1px solid ${C.border}` }}>
                    <div style={{ color:C.gold, fontWeight:800, marginBottom:6 }}>{card.title}</div>
                    <div style={{ color:C.muted, fontSize:13, lineHeight:1.6 }}>{card.text}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom:12, padding:12, borderRadius:12, background:'rgba(212,175,55,0.08)', border:`1px solid ${C.border}` }}>
                <div style={{ color:C.gold, fontWeight:800, marginBottom:6 }}>Recommended English Format</div>
                <div style={{ color:C.muted, fontSize:13, lineHeight:1.7 }}>
                  Example: <strong>Ass # 5</strong>, <strong>6th English</strong>, <strong>Total Marks: 25</strong>, then numbered questions like <strong>1) Answer the following question. 06</strong> with sub-parts <strong>i- ii- iii-</strong>. The parser keeps each numbered question as one item and groups all sub-parts inside it.
                </div>
              </div>
              <textarea value={manualText} onChange={e => setManualText(e.target.value)} placeholder="Paste full paper, questions, Urdu/English mixed text, MCQs, grammar, translations, math questions..." style={{ width:'100%', minHeight:260, background:'rgba(7,22,40,0.88)', color:C.silver, border:`1px solid ${C.border}`, borderRadius:14, padding:14, resize:'vertical', boxSizing:'border-box' }} />
              <div style={{ display:'flex', gap:10, marginTop:12, flexWrap:'wrap' }}>
                <Btn variant="gold" onClick={pasteAndBuildPaper} disabled={!manualText.trim()}>Paste & Build Paper</Btn>
                <Btn onClick={parsePaste} disabled={!manualText.trim()}>Send to Review</Btn>
                <Btn onClick={() => setManualText('')}>Clear</Btn>
              </div>
            </section>
          )}

          {active === 'Question Bank Selector' && (
            <section style={{ background:C.panel2, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
              <h2 style={{ marginTop:0, color:C.gold }}>Question Bank Selector</h2>
              <p style={{ color:C.muted }}>Reads existing question bank safely. It does not overwrite old question data.</p>
              <div style={{ marginBottom:14, padding:12, borderRadius:12, background:'rgba(7,22,40,0.72)', border:`1px solid ${C.border}` }}>
                <div style={{ color:C.gold, fontWeight:800, marginBottom:6 }}>How this works</div>
                <div style={{ color:C.muted, fontSize:13, lineHeight:1.7 }}>
                  First choose class, medium, and subject from the controls. Then select any visible questions from the bank and click <strong>Build Paper from Selected</strong>. This uses existing stored questions only and keeps current bank records unchanged.
                </div>
              </div>
              <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap' }}>
                <Btn variant="gold" onClick={() => rebuild(reviewItems, 'Paper Preview')} disabled={!selectedBankIds.length}>Build Paper from Selected</Btn>
                <Btn onClick={() => setSelectedBankIds(questionBankMatches.map(q => q.id))} disabled={!questionBankMatches.length}>Select All Visible</Btn>
                <Btn onClick={() => setSelectedBankIds([])}>Clear Selection</Btn>
              </div>
              <div style={{ display:'grid', gap:8 }}>
                {questionBankMatches.length === 0 && <div style={{ color:C.muted }}>No matching question bank records found for this class/subject.</div>}
                {questionBankMatches.map(q => {
                  const checked = selectedBankIds.includes(q.id)
                  return <label key={q.id} style={{ display:'grid', gridTemplateColumns:'auto 1fr auto', gap:10, alignItems:'start', padding:12, border:`1px solid ${checked ? C.gold : C.border}`, borderRadius:12, background:'rgba(7,22,40,0.72)' }}>
                    <input type="checkbox" checked={checked} onChange={e => setSelectedBankIds(prev => e.target.checked ? [...prev, q.id] : prev.filter(id => id !== q.id))} />
                    <span>{q.en || q.ur || q.question || q.text || 'Untitled question'}</span>
                    <small style={{ color:C.gold }}>{q.type || q.question_type || 'Question'}</small>
                  </label>
                })}
              </div>
            </section>
          )}

          {active === 'Import Review Queue' && (
            <section style={{ background:C.panel2, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
              <h2 style={{ marginTop:0, color:C.gold }}>Import Review Queue</h2>
              <p style={{ color:C.muted }}>Upload, paste raw extraction text, segment into review items, then approve. Low-confidence content never goes directly into the final bank.</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))', gap:10, marginBottom:14 }}>
                {[
                  { title:'Upload or Paste', text:'Add PDF, image, TXT, or OCR text. English section labels such as Part A, Part B, and Part C are supported here too.' },
                  { title:'Approve Items', text:'Review extracted questions one by one or approve everything together if the import already looks correct.' },
                  { title:'Choose Final Action', text:'Build a paper preview, or save approved items into the question bank for future reuse.' }
                ].map(card => (
                  <div key={card.title} style={{ padding:12, borderRadius:12, background:'rgba(7,22,40,0.72)', border:`1px solid ${C.border}` }}>
                    <div style={{ color:C.gold, fontWeight:800, marginBottom:6 }}>{card.title}</div>
                    <div style={{ color:C.muted, fontSize:13, lineHeight:1.6 }}>{card.text}</div>
                  </div>
                ))}
              </div>
              {aiStatus && <div style={{ marginBottom:12, color:C.gold, fontWeight:800 }}>{aiStatus}</div>}
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:14 }}>
                {[
                  ['Total', reviewStats.total, C.gold],
                  ['Ready', reviewStats.ready, C.green],
                  ['Needs review', reviewStats.needsReview, C.red],
                  ['Low confidence', reviewStats.lowConfidence, '#FFB84D'],
                ].map(([label, value, color]) => (
                  <span key={label} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'7px 12px', borderRadius:999, background:'rgba(255,255,255,0.04)', border:`1px solid ${C.border}`, color:C.silver, fontSize:12, fontWeight:700 }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', background:color }} />
                    {label}: {value}
                  </span>
                ))}
              </div>
              <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
                {[
                  ['all', 'All'],
                  ['ready', 'Ready'],
                  ['needs_review', 'Needs Review'],
                  ['low', 'Low Confidence'],
                ].map(([id, label]) => (
                  <Btn key={id} onClick={() => setReviewFilter(id)} style={{ opacity: reviewFilter === id ? 1 : 0.72, borderColor: reviewFilter === id ? 'rgba(200,153,26,0.55)' : C.border }}>{label}</Btn>
                ))}
              </div>
              <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap' }}>
                <Btn variant="gold" onClick={approveAllAndBuildPaper} disabled={!reviewItems.some(item => item.text)}>Approve All & Build Paper</Btn>
                <Btn onClick={approveHighConfidence} disabled={!reviewStats.highConfidencePending}>Approve Ready (≥85%)</Btn>
                <Btn onClick={saveApprovedToBank} disabled={!approvedReviewItems().length}>Save Approved to Question Bank</Btn>
                <Btn onClick={() => rebuild(reviewItems, 'Paper Preview')}>Rebuild Preview</Btn>
              </div>
              <input type="file" multiple accept=".pdf,image/*,.txt,.md,.csv" onChange={e => addImportFiles(e.target.files)} style={{ marginBottom:14 }} />
              <div style={{ display:'grid', gap:10 }}>
                {importQueue.map(item => (
                  <div key={item.id} style={{ display:'grid', gap:8, background:'rgba(7,22,40,0.72)', border:`1px solid ${C.border}`, borderRadius:12, padding:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', gap:10 }}><strong>{item.name || item.type}</strong><span style={{ color:item.reviewStatus === 'Needs Review' ? C.red : C.green }}>{item.reviewStatus || item.status}</span></div>
                    {item.prompt && <div style={{ color:C.gold, fontSize:12, lineHeight:1.6 }}>AI draft prompt: {item.prompt}</div>}
                    {item.name && (
                      <>
                        <textarea
                          value={item.rawText || ''}
                          onChange={e => setImportQueue(prev => prev.map(x => x.id === item.id ? { ...x, rawText:e.target.value, status:'Raw text ready for segmentation' } : x))}
                          placeholder="Paste OCR/PDF extracted raw text here if automatic extraction is unavailable."
                          style={{ width:'100%', minHeight:90, background:'rgba(15,23,42,0.9)', color:C.silver, border:`1px solid ${C.border}`, borderRadius:10, padding:10 }}
                        />
                        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                          <Btn onClick={() => runSafeExtraction(item)} disabled={extractingId === item.id}>{extractingId === item.id ? 'Extracting...' : 'Run Safe Extraction'}</Btn>
                          <Btn onClick={() => segmentImportText(item)} style={{ opacity:item.rawText ? 1 : 0.55 }} disabled={!item.rawText}>Segment Raw Text</Btn>
                          <Btn onClick={() => setImportQueue(prev => prev.filter(x => x.id !== item.id))}>Remove Upload</Btn>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {filteredReviewItems.map(item => (
                  <div key={item.id} style={{ display:'grid', gap:8, background:'rgba(7,22,40,0.72)', border:`1px solid ${isReviewReady(item) ? 'rgba(48,209,88,0.28)' : (Number(item.confidence || 0) < 0.7 ? 'rgba(255,55,95,0.28)' : C.border)}`, borderRadius:12, padding:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', gap:10, flexWrap:'wrap' }}>
                      <strong>{item.source || item.type || 'Review item'}</strong>
                      <span style={{ color:isReviewReady(item) ? C.green : C.red, fontWeight:700 }}>{item.reviewStatus || 'Needs Review'}</span>
                    </div>
                    {Number(item.confidence) > 0 && (
                      <div style={{ display:'grid', gap:4 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:C.muted }}>
                          <span>AI confidence</span>
                          <span style={{ color:confidenceColor(item.confidence), fontWeight:800 }}>{confidencePct(item.confidence)}%</span>
                        </div>
                        <div style={{ height:6, borderRadius:999, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
                          <div style={{ width:`${confidencePct(item.confidence)}%`, height:'100%', background:confidenceColor(item.confidence), transition:'width 0.25s ease-out' }} />
                        </div>
                      </div>
                    )}
                    {item.text && <textarea value={item.text} onChange={e => setReviewItems(prev => prev.map(x => x.id === item.id ? { ...x, text:e.target.value } : x))} style={{ width:'100%', minHeight:70, background:'rgba(15,23,42,0.9)', color:C.silver, border:`1px solid ${C.border}`, borderRadius:10, padding:10 }} />}
                    {item.text && <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 100px auto', gap:8 }}><Input value={item.category} onChange={e => setReviewItems(prev => prev.map(x => x.id === item.id ? { ...x, category:e.target.value } : x))} /><Input value={item.type} onChange={e => setReviewItems(prev => prev.map(x => x.id === item.id ? { ...x, type:e.target.value } : x))} /><Input type="number" value={item.marks} onChange={e => setReviewItems(prev => prev.map(x => x.id === item.id ? { ...x, marks:Number(e.target.value) } : x))} /><Btn onClick={() => setReviewItems(prev => prev.map(x => x.id === item.id ? { ...x, reviewStatus:'Ready' } : x))}>Approve</Btn></div>}
                    {!item.text && item.source === 'AI Draft Request' && (
                      <textarea
                        value={item.text}
                        onChange={e => setReviewItems(prev => prev.map(x => x.id === item.id ? { ...x, text:e.target.value, duplicateHash:duplicateHash(e.target.value) } : x))}
                        placeholder="Paste or type the AI-generated question here, then approve."
                        style={{ width:'100%', minHeight:70, background:'rgba(15,23,42,0.9)', color:C.silver, border:`1px solid ${C.border}`, borderRadius:10, padding:10 }}
                      />
                    )}
                    {!item.text && item.source === 'AI Draft Request' && <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 100px auto', gap:8 }}><Input value={item.category} onChange={e => setReviewItems(prev => prev.map(x => x.id === item.id ? { ...x, category:e.target.value } : x))} /><Input value={item.type} onChange={e => setReviewItems(prev => prev.map(x => x.id === item.id ? { ...x, type:e.target.value } : x))} /><Input type="number" value={item.marks} onChange={e => setReviewItems(prev => prev.map(x => x.id === item.id ? { ...x, marks:Number(e.target.value) } : x))} /><Btn onClick={() => setReviewItems(prev => prev.map(x => x.id === item.id ? { ...x, reviewStatus:x.text ? 'Ready' : 'Needs Review' } : x))}>Approve</Btn></div>}
                  </div>
                ))}
                {!importQueue.length && !reviewItems.length && <div style={{ color:C.muted }}>No imported or pasted content yet.</div>}
                {!filteredReviewItems.length && reviewItems.length > 0 && <div style={{ color:C.muted }}>No review items match this filter.</div>}
              </div>
              <div style={{ marginTop:18 }}>
                <PaperAiJobsPanel title="AI Import & Scan Jobs" />
              </div>
            </section>
          )}

          {active === 'Pattern Library' && (
            <section style={{ background:C.panel2, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
              <h2 style={{ marginTop:0, color:C.gold }}>Pattern Library</h2>
              <p style={{ color:C.muted, marginTop:0 }}>Class {config.classLevel} · {config.subject} · {config.medium} — {visiblePatterns.length} pattern(s)</p>
              <div style={{ display:'grid', gap:12 }}>
                {(visiblePatterns.length ? visiblePatterns : EXTENDED_PATTERN_LIBRARY.slice(0, 12)).map(p => (
                  <details key={p.id} open={p.id === pattern.id} style={{ background:'rgba(7,22,40,0.72)', border:`1px solid ${p.id === pattern.id ? 'rgba(200,153,26,0.55)' : C.border}`, borderRadius:12, padding:12 }}>
                    <summary style={{ cursor:'pointer', fontWeight:900 }}>
                      {p.name} <span style={{ color:C.muted, fontWeight:600 }}>· Class {p.classLevel} · {Number(p.objectiveMarks || 0) + Number(p.subjectiveMarks || 0)} marks</span>
                    </summary>
                    <div style={{ display:'grid', gap:8, marginTop:10 }}>
                      {p.sections.map(section => (
                        <div key={section.id} style={{ fontSize:12, color:C.silver, padding:'8px 10px', borderRadius:8, background:'rgba(15,23,42,0.45)' }}>
                          <strong>Q{section.questionNo}</strong> {section.title} — {section.attemptRequired}/{section.totalQuestions} · {section.marks} marks
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {active === 'Paper Preview' && (
            <section style={{ display:'grid', gap:14 }}>
              <div style={{ background:C.panel2, border:`1px solid ${C.border}`, borderRadius:16, padding:16 }}>
                <h2 style={{ margin:'0 0 8px', color:C.gold }}>Paper Preview</h2>
                <p style={{ margin:0, color:C.muted }}>{layoutEngine === 'paper-studio-pro' ? 'Word-class TipTap editor with undo, formatting ribbon, and mobile zoom.' : layoutEngine === 'paper-studio' ? 'Using existing Paper Studio layout templates through a safe adapter.' : 'Separate Unified preview/editor sheet.'}</p>
              </div>
              {layoutEngine === 'paper-studio' ? (
                <div style={{ color:C.muted }}>Loading Paper Studio editor...</div>
              ) : (
                <div id="unified-paper-print-area"><PaperSheet config={config} pattern={pattern} sections={sections} setSections={setSections} /></div>
              )}
            </section>
          )}

          {active === 'Export Center' && (
            <section style={{ background:C.panel2, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
              <h2 style={{ marginTop:0, color:C.gold }}>Export Center</h2>
              <p style={{ margin:'0 0 14px', color:C.muted, fontSize:13, lineHeight:1.6 }}>
                Export, share, and teacher resources: print, Word, answer keys, marking scheme, WhatsApp/PDF share, and parallel sets.
              </p>
              <div style={{ display:'grid', gap:8, marginBottom:14 }}>{warnings.map((w, i) => <div key={i} style={{ padding:10, borderRadius:10, background:w.includes('passed') ? 'rgba(48,209,88,0.12)' : 'rgba(255,159,10,0.12)', color:w.includes('passed') ? C.green : '#fbbf24' }}>{w}</div>)}</div>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                <Btn onClick={() => rebuild()}>Validate Paper</Btn>
                <Btn variant="gold" onClick={fillModelAnswersWithAI}>AI Model Answers</Btn>
                <Btn variant="gold" onClick={() => { setLayoutEngine('paper-studio'); setActive('Paper Preview') }}>Open Print Preview</Btn>
                <Btn onClick={() => { setLayoutEngine('paper-studio-pro'); setActive('Paper Preview') }}>Open Pro Editor</Btn>
                <Btn onClick={exportPrint}>Quick Print</Btn>
                <Btn onClick={exportDocx}>Export DOCX</Btn>
                <Btn onClick={exportAnswerKey}>Print Answer Key</Btn>
                <Btn onClick={exportAnswerKeyDocx}>Answer Key DOCX</Btn>
                <Btn onClick={exportMarkingScheme}>Marking Scheme</Btn>
                <Btn onClick={exportMarkingSchemeDocx}>Scheme DOCX</Btn>
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'0 4px' }}>
                  <span style={{ fontSize:12, color:C.muted, fontWeight:600 }}>Sets</span>
                  <select
                    value={String(config.sets || 3)}
                    onChange={e => setConfig(prev => ({ ...prev, sets: Number(e.target.value) }))}
                    style={{ background:'rgba(15,23,42,0.9)', color:C.silver, border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 10px', fontSize:12 }}
                  >
                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <Btn onClick={exportPaperSets}>Print Sets</Btn>
                </div>
                <Btn onClick={sharePdf}>Share PDF</Btn>
                <Btn onClick={shareWhatsapp}>WhatsApp</Btn>
                <Btn onClick={shareFullPackage}>Share Package</Btn>
              </div>
              <p style={{ margin:'10px 0 0', color:C.muted, fontSize:12, lineHeight:1.6 }}>{describePaperSetStrategy()}</p>
              <div style={{ marginTop:14, display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:10 }}>
                {[
                  ['AI Answers', 'Auto-fill teacher model answers'],
                  ['Answer Key', 'Confidential teacher copy'],
                  ['Marking Scheme', 'Marks split + rubric notes'],
                  ['Share Package', 'DOCX + WhatsApp / native share'],
                  ['Sets A–E', 'Unique codes + shuffled MCQ/short/long'],
                ].map(([title, text]) => (
                  <div key={title} style={{ padding:12, borderRadius:12, background:'rgba(7,22,40,0.72)', border:`1px solid ${C.border}` }}>
                    <div style={{ color:C.gold, fontWeight:800, marginBottom:4 }}>{title}</div>
                    <div style={{ color:C.muted, fontSize:12, lineHeight:1.5 }}>{text}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {active === 'Saved Library' && (
            <section style={{ display:'grid', gap:16 }}>
              <SavedPaperLibraryPanel
                onLoadPaper={handleReopenSavedPaper}
                sourceFilter="unified"
                title="Saved Paper Library"
                subtitle="Reopen unified assessments or bulk print multiple saved papers."
              />
              <div style={{ background:C.panel2, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
                <h2 style={{ marginTop:0, color:C.gold }}>Local Draft Snapshots</h2>
                <p style={{ margin:'0 0 12px', color:C.muted, fontSize:13 }}>Quick restore points saved on this device before final Save Paper.</p>
                <div style={{ display:'grid', gap:10 }}>
                  {drafts.map(d => (
                    <button
                      key={d.id}
                      onClick={() => {
                        setPatternOverride(d.patternOverride || null)
                        setConfig(d.config)
                        setSections(d.sections)
                        setReviewItems(d.reviewItems || [])
                        setReopenedSavedPaper(null)
                        setLayoutEngine(d.layoutEngine || 'paper-studio')
                        setPtsSessionKey(key => key + 1)
                        setActive('Paper Preview')
                      }}
                      style={{ textAlign:'left', padding:12, borderRadius:12, border:`1px solid ${C.border}`, background:'rgba(7,22,40,0.72)', color:C.silver, cursor:'pointer' }}
                    >
                      {d.config.subject} Class {d.config.classLevel} — {new Date(d.savedAt).toLocaleString()}
                    </button>
                  ))}
                  {!drafts.length && <div style={{ color:C.muted }}>No local draft snapshots yet. Use Save Draft while building a paper.</div>}
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
