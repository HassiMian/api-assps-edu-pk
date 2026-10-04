export const URDU_CATEGORY_LABELS = [
  'واحد جمع',
  'مترادف',
  'متضاد',
  'مذکر مؤنث',
  'جملوں کی درستی',
  'محاورات',
  'ضرب الامثال',
  'تشریح',
  'خلاصہ',
  'مرکزی خیال',
  'سوالات کے مختصر جوابات',
  'درخواست',
  'خط',
  'مضمون',
  'عبارت فہمی',
  'خالی جگہیں پُر کریں',
  'درست جواب کا انتخاب کریں',
  'درست / غلط',
  'الفاظ کے معنی',
  'اشعار کی تشریح',
  'سبق کا خلاصہ',
]

const boardHeader = {
  classLevel: '9',
  board: 'Punjab / Gujranwala Board',
  paperType: 'Board Pattern Paper',
  objectiveTime: '20 minutes',
  objectiveMarks: 15,
  subjectiveTime: '2 hours 10 minutes',
  subjectiveMarks: 60,
  layoutDirection: 'ltr',
  exportRules: ['A4', 'separate-objective-subjective', 'roll-number-header', 'clean-page-breaks'],
}

export const UNIFIED_PATTERN_LIBRARY = [
  {
    id: 'pb-9-biology-guj-2024',
    name: '9th Biology Board Pattern',
    classLevel: '9',
    subject: 'Biology',
    medium: 'English',
    ...boardHeader,
    sections: [
      { id: 'obj', title: 'Objective Paper', questionNo: 1, type: 'MCQ', totalQuestions: 15, attemptRequired: 15, marksEach: 1, marks: 15, allowedCategories: ['Concept MCQ', 'Diagram MCQ', 'SLO MCQ'] },
      { id: 'short-a', title: 'Short Questions Section A', questionNo: 2, type: 'Short Question', totalQuestions: 8, attemptRequired: 5, marksEach: 2, marks: 10, allowedCategories: ['Conceptual', 'Definitions', 'Diagram-based'] },
      { id: 'short-b', title: 'Short Questions Section B', questionNo: 3, type: 'Short Question', totalQuestions: 8, attemptRequired: 5, marksEach: 2, marks: 10, allowedCategories: ['SLO Based', 'Reasoning', 'Examples'] },
      { id: 'short-c', title: 'Short Questions Section C', questionNo: 4, type: 'Short Question', totalQuestions: 8, attemptRequired: 5, marksEach: 2, marks: 10, allowedCategories: ['Chapter Review', 'Functions', 'Differences'] },
      { id: 'long', title: 'Long Questions', questionNo: 5, type: 'Long Question', totalQuestions: 3, attemptRequired: 2, marksEach: 7.5, marks: 15, allowedCategories: ['Explanation', 'Diagram', 'Process'] },
    ],
    instructions: ['Attempt required questions only.', 'Draw diagrams where needed.', 'Marks are shown against each section.'],
  },
  {
    id: 'pb-9-physics-guj-2024',
    name: '9th Physics Board Pattern',
    classLevel: '9',
    subject: 'Physics',
    medium: 'English',
    ...boardHeader,
    sections: [
      { id: 'obj', title: 'Objective Paper', questionNo: 1, type: 'MCQ', totalQuestions: 15, attemptRequired: 15, marksEach: 1, marks: 15, allowedCategories: ['Concept MCQ', 'Numerical MCQ', 'Formula MCQ', 'SLO MCQ'] },
      { id: 'short-a', title: 'Short Questions Section A', questionNo: 2, type: 'Short Question', totalQuestions: 8, attemptRequired: 5, marksEach: 2, marks: 10, allowedCategories: ['Conceptual', 'Definitions', 'Units and Measurements'] },
      { id: 'short-b', title: 'Short Questions Section B', questionNo: 3, type: 'Short Question', totalQuestions: 8, attemptRequired: 5, marksEach: 2, marks: 10, allowedCategories: ['SLO Based', 'Reasoning', 'Formula-based'] },
      { id: 'short-c', title: 'Short Questions Section C', questionNo: 4, type: 'Short Question', totalQuestions: 8, attemptRequired: 5, marksEach: 2, marks: 10, allowedCategories: ['Numerical', 'Graph', 'Examples'] },
      { id: 'long', title: 'Long Questions', questionNo: 5, type: 'Long Question', totalQuestions: 3, attemptRequired: 2, marksEach: 7.5, marks: 15, allowedCategories: ['Derivation', 'Numerical', 'Explanation', 'Diagram'] },
    ],
    instructions: ['Attempt required questions only.', 'Show formula and units in numerical questions.', 'Draw diagrams/graphs where needed.', 'Marks are shown against each section.'],
  },
  {
    id: 'pb-9-chemistry-guj-2024',
    name: '9th Chemistry Board Pattern',
    classLevel: '9',
    subject: 'Chemistry',
    medium: 'English',
    ...boardHeader,
    sections: [
      { id: 'obj', title: 'Objective Paper', questionNo: 1, type: 'MCQ', totalQuestions: 15, attemptRequired: 15, marksEach: 1, marks: 15, allowedCategories: ['Concept MCQ', 'Reaction MCQ', 'Formula MCQ', 'SLO MCQ'] },
      { id: 'short-a', title: 'Short Questions Section A', questionNo: 2, type: 'Short Question', totalQuestions: 8, attemptRequired: 5, marksEach: 2, marks: 10, allowedCategories: ['Conceptual', 'Definitions', 'Formula-based'] },
      { id: 'short-b', title: 'Short Questions Section B', questionNo: 3, type: 'Short Question', totalQuestions: 8, attemptRequired: 5, marksEach: 2, marks: 10, allowedCategories: ['SLO Based', 'Reasoning', 'Examples'] },
      { id: 'short-c', title: 'Short Questions Section C', questionNo: 4, type: 'Short Question', totalQuestions: 8, attemptRequired: 5, marksEach: 2, marks: 10, allowedCategories: ['Reactions', 'Equations', 'Differences'] },
      { id: 'long', title: 'Long Questions', questionNo: 5, type: 'Long Question', totalQuestions: 3, attemptRequired: 2, marksEach: 7.5, marks: 15, allowedCategories: ['Explanation', 'Chemical Equation', 'Process', 'Diagram'] },
    ],
    instructions: ['Attempt required questions only.', 'Balance chemical equations where needed.', 'Draw diagrams where needed.', 'Marks are shown against each section.'],
  },
  {
    id: 'pb-9-math-guj-2024',
    name: '9th Mathematics Board Pattern',
    classLevel: '9',
    subject: 'Mathematics',
    medium: 'English',
    ...boardHeader,
    sections: [
      { id: 'obj', title: 'Objective Paper', questionNo: 1, type: 'MCQ', totalQuestions: 15, attemptRequired: 15, marksEach: 1, marks: 15, allowedCategories: ['Concept MCQ', 'Formula MCQ'] },
      { id: 'short', title: 'Short Computational Questions', questionNo: 2, type: 'Short Question', totalQuestions: 15, attemptRequired: 10, marksEach: 2, marks: 20, allowedCategories: ['Exercise', 'Formula', 'Numerical'] },
      { id: 'theorem', title: 'Theorems / Construction', questionNo: 3, type: 'Theorem', totalQuestions: 4, attemptRequired: 2, marksEach: 5, marks: 10, allowedCategories: ['Theorem', 'Construction', 'Diagram'] },
      { id: 'long', title: 'Long Questions', questionNo: 4, type: 'Long Question', totalQuestions: 5, attemptRequired: 3, marksEach: 5, marks: 15, allowedCategories: ['Algebra', 'Geometry', 'Trigonometry'] },
    ],
    instructions: ['Use proper mathematical steps.', 'Rough work should be clean.', 'Diagrams must be labeled.'],
  },
  {
    id: 'pb-9-urdu-guj-2024',
    name: '9th Urdu Board Pattern',
    classLevel: '9',
    subject: 'Urdu',
    medium: 'Urdu',
    ...boardHeader,
    layoutDirection: 'rtl',
    languageDirection: 'rtl',
    sections: [
      { id: 'obj', title: 'درست جواب کا انتخاب کریں', questionNo: 1, type: 'MCQ', totalQuestions: 15, attemptRequired: 15, marksEach: 1, marks: 15, allowedCategories: ['درست جواب کا انتخاب کریں'] },
      { id: 'short', title: 'سوالات کے مختصر جوابات', questionNo: 2, type: 'Short Question', totalQuestions: 10, attemptRequired: 7, marksEach: 2, marks: 14, allowedCategories: ['سوالات کے مختصر جوابات'] },
      { id: 'prose', title: 'تشریح', questionNo: 3, type: 'Explanation', totalQuestions: 3, attemptRequired: 1, marksEach: 10, marks: 10, allowedCategories: ['تشریح'] },
      { id: 'poetry', title: 'اشعار کی تشریح', questionNo: 4, type: 'Explanation', totalQuestions: 3, attemptRequired: 1, marksEach: 10, marks: 10, allowedCategories: ['اشعار کی تشریح'] },
      { id: 'grammar', title: 'قواعد', questionNo: 5, type: 'Grammar', totalQuestions: 10, attemptRequired: 8, marksEach: 1, marks: 8, allowedCategories: URDU_CATEGORY_LABELS },
      { id: 'writing', title: 'تحریری حصہ', questionNo: 6, type: 'Essay', totalQuestions: 3, attemptRequired: 1, marksEach: 8, marks: 8, allowedCategories: ['درخواست', 'خط', 'مضمون', 'خلاصہ', 'مرکزی خیال', 'عبارت فہمی'] },
    ],
    instructions: ['تمام سوالات غور سے پڑھیں۔', 'اردو متن دائیں سے بائیں لکھیں۔', 'رومن اردو استعمال نہ کریں۔'],
  },
  {
    id: 'pb-9-english-guj-2024',
    name: '9th English Board Pattern',
    classLevel: '9',
    subject: 'English',
    medium: 'English',
    ...boardHeader,
    sections: [
      { id: 'obj', title: 'Objective Grammar and Vocabulary', questionNo: 1, type: 'MCQ', totalQuestions: 19, attemptRequired: 19, marksEach: 1, marks: 19, allowedCategories: ['Grammar', 'Vocabulary', 'Correct Option'] },
      { id: 'short', title: 'Short Questions', questionNo: 2, type: 'Short Question', totalQuestions: 12, attemptRequired: 8, marksEach: 2, marks: 16, allowedCategories: ['Textbook', 'Poem', 'Lesson'] },
      { id: 'translation-urdu', title: 'Translation into Urdu', questionNo: 3, type: 'Translation', totalQuestions: 5, attemptRequired: 3, marksEach: 2, marks: 6, allowedCategories: ['Translation into Urdu'] },
      { id: 'writing', title: 'Writing and Grammar', questionNo: 4, type: 'Grammar', totalQuestions: 6, attemptRequired: 4, marksEach: 5, marks: 20, allowedCategories: ['Letter', 'Story', 'Dialogue', 'Comprehension', 'Change the Voice', 'Idioms'] },
    ],
    instructions: ['Write neat answers.', 'Follow question instructions.', 'Use correct grammar.'],
  },
  {
    id: 'pb-9-computer-guj-2024',
    name: '9th Computer Science Board Pattern',
    classLevel: '9',
    subject: 'Computer Science',
    medium: 'English',
    ...boardHeader,
    sections: [
      { id: 'obj', title: 'Objective Paper', questionNo: 1, type: 'MCQ', totalQuestions: 15, attemptRequired: 15, marksEach: 1, marks: 15, allowedCategories: ['Concept MCQ', 'Terminology', 'Output'] },
      { id: 'short-a', title: 'Short Questions', questionNo: 2, type: 'Short Question', totalQuestions: 10, attemptRequired: 7, marksEach: 2, marks: 14, allowedCategories: ['Definition', 'Concept', 'Command'] },
      { id: 'short-b', title: 'Applied Short Questions', questionNo: 3, type: 'Short Question', totalQuestions: 8, attemptRequired: 5, marksEach: 2, marks: 10, allowedCategories: ['Program Logic', 'Reasoning', 'Examples'] },
      { id: 'long', title: 'Long Questions', questionNo: 4, type: 'Long Question', totalQuestions: 4, attemptRequired: 3, marksEach: 7, marks: 21, allowedCategories: ['Explanation', 'Program', 'Diagram'] },
    ],
    instructions: ['Write commands/programs clearly.', 'Use examples where needed.'],
  },
  {
    id: 'pb-9-pakstudies-guj-2024',
    name: '9th Pakistan Studies Board Pattern',
    classLevel: '9',
    subject: 'Pakistan Studies',
    medium: 'Urdu',
    ...boardHeader,
    layoutDirection: 'rtl',
    languageDirection: 'rtl',
    sections: [
      { id: 'obj', title: 'درست جواب کا انتخاب کریں', questionNo: 1, type: 'MCQ', totalQuestions: 15, attemptRequired: 15, marksEach: 1, marks: 15, allowedCategories: ['درست جواب کا انتخاب کریں'] },
      { id: 'short', title: 'مختصر سوالات', questionNo: 2, type: 'Short Question', totalQuestions: 12, attemptRequired: 8, marksEach: 2, marks: 16, allowedCategories: ['مختصر سوالات', 'تعریفات', 'وجوہات'] },
      { id: 'notes', title: 'نوٹ / تفصیلی سوالات', questionNo: 3, type: 'Long Question', totalQuestions: 5, attemptRequired: 3, marksEach: 8, marks: 24, allowedCategories: ['نوٹ', 'تفصیلی سوالات', 'اہم واقعات'] },
    ],
    instructions: ['جوابات واضح اور مختصر لکھیں۔', 'نقشہ یا خاکہ ہو تو صاف بنائیں۔'],
  },
  {
    id: 'pb-9-islamiyat-guj-2024',
    name: '9th Islamiyat Board Pattern',
    classLevel: '9',
    subject: 'Islamiyat',
    medium: 'Urdu',
    ...boardHeader,
    layoutDirection: 'rtl',
    languageDirection: 'rtl',
    sections: [
      { id: 'obj', title: 'درست جواب کا انتخاب کریں', questionNo: 1, type: 'MCQ', totalQuestions: 15, attemptRequired: 15, marksEach: 1, marks: 15, allowedCategories: ['درست جواب کا انتخاب کریں'] },
      { id: 'short', title: 'مختصر سوالات', questionNo: 2, type: 'Short Question', totalQuestions: 10, attemptRequired: 7, marksEach: 2, marks: 14, allowedCategories: ['مختصر سوالات'] },
      { id: 'ayat', title: 'آیات / احادیث کی تشریح', questionNo: 3, type: 'Explanation', totalQuestions: 4, attemptRequired: 2, marksEach: 7, marks: 14, allowedCategories: ['آیات کی تشریح', 'احادیث کی تشریح'] },
      { id: 'long', title: 'تفصیلی سوالات', questionNo: 4, type: 'Long Question', totalQuestions: 4, attemptRequired: 3, marksEach: 9, marks: 27, allowedCategories: ['تفصیلی سوالات', 'سیرت', 'عبادات'] },
    ],
    instructions: ['آیات و احادیث احتیاط سے لکھیں۔', 'غیر واضح جواب کو دوبارہ چیک کریں۔'],
  },
  {
    id: 'pb-9-tarjama-guj-2024',
    name: '9th Tarjuma-tul-Quran Board Pattern',
    classLevel: '9',
    subject: 'Tarjuma-tul-Quran',
    medium: 'Urdu',
    ...boardHeader,
    layoutDirection: 'rtl',
    languageDirection: 'rtl',
    sections: [
      { id: 'obj', title: 'درست جواب کا انتخاب کریں', questionNo: 1, type: 'MCQ', totalQuestions: 15, attemptRequired: 15, marksEach: 1, marks: 15, allowedCategories: ['درست جواب کا انتخاب کریں'] },
      { id: 'words', title: 'الفاظ کے معنی', questionNo: 2, type: 'Quranic Words Meaning', totalQuestions: 10, attemptRequired: 8, marksEach: 1, marks: 8, allowedCategories: ['الفاظ کے معنی'] },
      { id: 'translation', title: 'ترجمہ', questionNo: 3, type: 'Idiomatic Translation', totalQuestions: 6, attemptRequired: 4, marksEach: 4, marks: 16, allowedCategories: ['ترجمہ', 'بامحاورہ ترجمہ'] },
      { id: 'notes', title: 'نوٹس', questionNo: 4, type: 'Long Question', totalQuestions: 5, attemptRequired: 3, marksEach: 7, marks: 21, allowedCategories: ['نوٹس', 'خلاصہ', 'مرکزی خیال'] },
    ],
    instructions: ['قرآنی الفاظ کی اعراب اور معنی کا خیال رکھیں۔', 'ترجمہ بامحاورہ ہو۔'],
  },
]

export const SCHOOL_ASSESSMENT_TYPES = [
  'Daily Test',
  'Weekly Test',
  'Chapter Test',
  'Monthly Test',
  'Mid Term',
  'Final Term',
  'Worksheet',
  'Practice Sheet',
  'Revision Test',
  'SLO Based Test',
  'Oral Test Sheet',
]

export const LOWER_CLASS_TYPES = [
  'MCQ',
  'Fill in the Blanks',
  'Match the Columns',
  'True/False',
  'Circle the Correct Answer',
  'Picture-based Question',
  'Dictation Words',
  'Reading Comprehension',
  'Counting',
  'Tables',
  'Short Answers',
  'Draw and Label',
  'Color/Identify',
  'Urdu Letters/Words/Sentences',
  'English Phonics/Spellings',
  'Basic Grammar',
]

const SUBJECT_ALIASES = {
  bio: 'biology',
  biology: 'biology',
  phy: 'physics',
  physics: 'physics',
  chem: 'chemistry',
  chemistry: 'chemistry',
  math: 'mathematics',
  maths: 'mathematics',
  mathematics: 'mathematics',
  'computer science': 'computer science',
  cs: 'computer science',
  'pak studies': 'pakistan studies',
  'pakistan studies': 'pakistan studies',
  islamiat: 'islamiyat',
  islamiyat: 'islamiyat',
  'tarjama-tul-quran': 'tarjuma-tul-quran',
  science: 'science',
  english: 'english',
  urdu: 'urdu',
}

function normalizeSubjectKey(subject = '') {
  const key = String(subject || '').toLowerCase().trim()
  return SUBJECT_ALIASES[key] || key
}

function ordinalLabel(classLevel = '9') {
  const map = {
    1: '1st', 2: '2nd', 3: '3rd', 4: '4th', 5: '5th',
    6: '6th', 7: '7th', 8: '8th', 9: '9th', 10: '10th', 11: '11th', 12: '12th',
  }
  return map[Number(classLevel)] || `${classLevel}th`
}

export function getClassTier(classLevel = '9') {
  const level = Number(classLevel)
  if (!Number.isFinite(level) || level <= 5) return 'primary'
  if (level <= 8) return 'middle'
  if (level <= 10) return 'matric'
  return 'inter'
}

function cloneSections(sections = []) {
  return sections.map(section => ({ ...section }))
}

function scalePatternForMiddle(base, classLevel) {
  const cls = String(classLevel)
  const isUrdu = base.layoutDirection === 'rtl'
  const mcqSection = base.sections.find(section => section.type === 'MCQ')
  const shortSection = base.sections.find(section => ['Short Question', 'Grammar', 'Quranic Words Meaning'].includes(section.type))
  const longSection = base.sections.find(section => ['Long Question', 'Explanation', 'Essay', 'Theorem', 'Idiomatic Translation'].includes(section.type))
  const sections = []
  let questionNo = 1

  if (mcqSection) {
    sections.push({
      ...mcqSection,
      id: `${mcqSection.id}-mid`,
      questionNo: questionNo++,
      totalQuestions: 10,
      attemptRequired: 10,
      marksEach: 1,
      marks: 10,
    })
  }
  if (shortSection) {
    sections.push({
      ...shortSection,
      id: `${shortSection.id}-mid`,
      questionNo: questionNo++,
      totalQuestions: 8,
      attemptRequired: 5,
      marksEach: 2,
      marks: 10,
    })
  }
  if (longSection) {
    sections.push({
      ...longSection,
      id: `${longSection.id}-mid`,
      questionNo: questionNo++,
      totalQuestions: 3,
      attemptRequired: 1,
      marksEach: 5,
      marks: 5,
    })
  }

  return {
    ...base,
    id: `mid-${cls}-${base.id}`,
    name: `${ordinalLabel(cls)} ${base.subject} Chapter Test`,
    classLevel: cls,
    subject: base.subject,
    medium: base.medium,
    board: 'School Assessment',
    paperType: 'Chapter Test',
    objectiveTime: '15 minutes',
    objectiveMarks: sections[0]?.marks || 10,
    subjectiveTime: '1 hour',
    subjectiveMarks: sections.slice(1).reduce((sum, section) => sum + Number(section.marks || 0), 0),
    layoutDirection: base.layoutDirection,
    languageDirection: base.languageDirection,
    exportRules: ['A4', 'chapter-test', 'clean-page-breaks'],
    sections,
    instructions: isUrdu
      ? ['ضروری سوالات حل کریں۔', 'جوابات صاف لکھیں۔']
      : ['Attempt required questions only.', 'Write answers clearly.'],
  }
}

function clonePatternForMatric(base, classLevel) {
  const cls = String(classLevel)
  if (String(base.classLevel) === cls) {
    return { ...base, sections: cloneSections(base.sections) }
  }
  return {
    ...base,
    id: base.id.replace('-9-', `-${cls}-`).replace('pb-9-', `pb-${cls}-`),
    name: base.name.replace('9th', ordinalLabel(cls)),
    classLevel: cls,
    board: 'Punjab / BISE Gujranwala (Matric)',
    objectiveTime: base.objectiveTime || '20 minutes',
    subjectiveTime: cls === '10' ? '2 hours 30 minutes' : base.subjectiveTime,
    sections: cloneSections(base.sections),
    instructions: [...(base.instructions || [])],
  }
}

function scalePatternForInter(base, classLevel) {
  const cls = String(classLevel)
  const sections = cloneSections(base.sections).map(section => {
    if (section.type === 'MCQ') {
      return {
        ...section,
        totalQuestions: 17,
        attemptRequired: 17,
        marksEach: 1,
        marks: 17,
      }
    }
    if (['Long Question', 'Explanation', 'Essay', 'Theorem'].includes(section.type)) {
      const attemptRequired = Number(section.attemptRequired || 2)
      const marksEach = section.type === 'Theorem' ? 6 : 8
      return {
        ...section,
        marksEach,
        marks: attemptRequired * marksEach,
      }
    }
    return section
  })
  const objectiveMarks = sections.filter(section => section.type === 'MCQ').reduce((sum, section) => sum + Number(section.marks || 0), 0)
  const subjectiveMarks = sections.filter(section => section.type !== 'MCQ').reduce((sum, section) => sum + Number(section.marks || 0), 0)

  return {
    ...base,
    id: base.id.replace('pb-9-', `pb-${cls}-`).replace('-9-', `-${cls}-`),
    name: base.name.replace('9th', ordinalLabel(cls)).replace('Board Pattern', 'Inter Board Pattern'),
    classLevel: cls,
    board: 'Punjab / BISE Gujranwala (Intermediate)',
    paperType: 'Board Pattern Paper',
    objectiveTime: '20 minutes',
    subjectiveTime: '3 hours',
    objectiveMarks,
    subjectiveMarks,
    sections,
    instructions: [...(base.instructions || [])],
  }
}

function buildPrimarySchoolPattern({ classLevel, subject, medium }) {
  const cls = String(classLevel)
  const normalizedSubject = subject || 'Science'
  const normalizedMedium = medium || (['Urdu', 'Islamiyat'].includes(normalizedSubject) ? 'Urdu' : 'English')
  const isUrdu = normalizedMedium.toLowerCase() === 'urdu' || ['Urdu', 'Islamiyat'].includes(normalizedSubject)

  return {
    id: `primary-${cls}-${normalizeSubjectKey(normalizedSubject).replace(/\s+/g, '-')}`,
    name: `Class ${cls} ${normalizedSubject} Worksheet`,
    classLevel: cls,
    subject: normalizedSubject,
    medium: normalizedMedium,
    board: 'School Worksheet',
    paperType: 'Worksheet',
    objectiveTime: '10 minutes',
    objectiveMarks: 5,
    subjectiveTime: '40 minutes',
    subjectiveMarks: 15,
    layoutDirection: isUrdu ? 'rtl' : 'ltr',
    languageDirection: isUrdu ? 'rtl' : 'ltr',
    exportRules: ['A4', 'primary-worksheet', 'clean-page-breaks'],
    sections: [
      { id: 'mcq', title: isUrdu ? 'درست جواب منتخب کریں' : 'Circle the Correct Answer', questionNo: 1, type: 'MCQ', totalQuestions: 5, attemptRequired: 5, marksEach: 1, marks: 5, allowedCategories: ['Objective', 'Circle the Correct Answer'] },
      { id: 'fill', title: isUrdu ? 'خالی جگہیں پُر کریں' : 'Fill in the Blanks', questionNo: 2, type: 'Fill in the Blanks', totalQuestions: 5, attemptRequired: 5, marksEach: 1, marks: 5, allowedCategories: ['Fill in the Blanks', 'Basic Grammar'] },
      { id: 'short', title: isUrdu ? 'مختصر جوابات' : 'Short Answers', questionNo: 3, type: 'Short Question', totalQuestions: 5, attemptRequired: 5, marksEach: 2, marks: 10, allowedCategories: ['Short Answers', 'Reading Comprehension'] },
    ],
    instructions: isUrdu
      ? ['تمام سوالات حل کریں۔', 'لکھائی صاف ہو۔']
      : ['Attempt all questions.', 'Write neatly.'],
  }
}

function findMatricBasePattern(subject, medium) {
  const subjectKey = normalizeSubjectKey(subject)
  const normalizedMedium = String(medium || '').toLowerCase()
  return UNIFIED_PATTERN_LIBRARY.find(pattern =>
    String(pattern.classLevel) === '9' &&
    normalizeSubjectKey(pattern.subject) === subjectKey &&
    (!medium || String(pattern.medium || '').toLowerCase() === normalizedMedium || normalizedMedium === 'dual medium')
  ) || UNIFIED_PATTERN_LIBRARY.find(pattern => normalizeSubjectKey(pattern.subject) === subjectKey)
}

function buildExtendedPatternLibrary() {
  const seen = new Set()
  const patterns = []

  const push = (pattern) => {
    if (!pattern?.id || seen.has(pattern.id)) return
    seen.add(pattern.id)
    patterns.push(pattern)
  }

  UNIFIED_PATTERN_LIBRARY.forEach(push)
  UNIFIED_PATTERN_LIBRARY.forEach(base => {
    ;['6', '7', '8'].forEach(classLevel => push(scalePatternForMiddle(base, classLevel)))
    push(clonePatternForMatric(base, '10'))
    ;['11', '12'].forEach(classLevel => push(scalePatternForInter(base, classLevel)))
  })
  ;['1', '2', '3', '4', '5'].forEach(classLevel => {
    ;['Science', 'Mathematics', 'Urdu', 'English'].forEach(subject => {
      push(buildPrimarySchoolPattern({
        classLevel,
        subject,
        medium: subject === 'Urdu' ? 'Urdu' : 'English',
      }))
    })
  })

  return patterns
}

export const EXTENDED_PATTERN_LIBRARY = buildExtendedPatternLibrary()

export function listPatternsForSelection({ classLevel, subject, medium } = {}) {
  const subjectKey = normalizeSubjectKey(subject)
  const cls = String(classLevel || '')
  const normalizedMedium = String(medium || '').toLowerCase()

  return EXTENDED_PATTERN_LIBRARY.filter(pattern => {
    const classMatch = !cls || String(pattern.classLevel) === cls
    const subjectMatch = !subjectKey || normalizeSubjectKey(pattern.subject) === subjectKey
    const mediumMatch = !normalizedMedium
      || String(pattern.medium || '').toLowerCase() === normalizedMedium
      || normalizedMedium === 'dual medium'
    return classMatch && subjectMatch && mediumMatch
  })
}

export function buildNumberedQuestionPattern({
  classLevel,
  subject,
  medium,
  questions = [],
  totalMarks,
  assessmentTitle,
}) {
  const normalizedMedium = String(medium || 'English')
  const isUrdu = normalizedMedium.toLowerCase() === 'urdu'
  const sectionMarks = questions.reduce((sum, question) => sum + Number(question.marks || 2), 0)
  return {
    id: `numbered-assessment-${String(classLevel || '9')}-${String(subject || 'generic').toLowerCase().replace(/\s+/g, '-')}`,
    name: assessmentTitle || `${classLevel || 'Class'} ${subject || 'Subject'} Assessment`,
    classLevel: String(classLevel || '9'),
    subject: subject || 'Assessment',
    medium: normalizedMedium,
    board: 'School Assessment',
    paperType: 'Assessment',
    structureMode: 'numbered',
    totalMarks: Number(totalMarks || sectionMarks || 0),
    layoutDirection: isUrdu ? 'rtl' : 'ltr',
    languageDirection: isUrdu ? 'rtl' : 'ltr',
    exportRules: ['A4', 'numbered-assessment', 'clean-page-breaks'],
    sections: questions.map((question, index) => ({
      id: `nq-${question.number || index + 1}`,
      title: question.prompt || `Question ${question.number || index + 1}`,
      questionNo: Number(question.number || index + 1),
      type: question.type || 'Short Question',
      totalQuestions: 1,
      attemptRequired: 1,
      marksEach: Number(question.marks || 2),
      marks: Number(question.marks || 2),
      allowedCategories: [question.category || question.type || 'Short Question'],
    })),
    instructions: isUrdu
      ? ['تمام سوالات حل کریں۔', 'جوابات واضح لکھیں۔']
      : ['Attempt all questions.', 'Write answers clearly and neatly.'],
  }
}

function buildSchoolAssessmentPattern({ classLevel, subject, medium }) {
  const normalizedMedium = String(medium || 'English')
  const isUrdu = normalizedMedium.toLowerCase() === 'urdu'
  return {
    id: `assessment-${String(classLevel || '9')}-${String(subject || 'generic').toLowerCase().replace(/\s+/g, '-')}`,
    name: `${classLevel || 'Class'} ${subject || 'Subject'} School Assessment`,
    classLevel: String(classLevel || '9'),
    subject: subject || 'Assessment',
    medium: normalizedMedium,
    board: 'School Assessment',
    paperType: 'Assessment',
    objectiveTime: '15 minutes',
    objectiveMarks: 5,
    subjectiveTime: '1 hour 30 minutes',
    subjectiveMarks: 20,
    layoutDirection: isUrdu ? 'rtl' : 'ltr',
    languageDirection: isUrdu ? 'rtl' : 'ltr',
    exportRules: ['A4', 'sectioned-assessment', 'clean-page-breaks'],
    sections: [
      { id: 'part-a', title: isUrdu ? 'درست جواب کا انتخاب کریں' : 'Part A: MCQs', questionNo: 1, type: 'MCQ', totalQuestions: 5, attemptRequired: 5, marksEach: 1, marks: 5, allowedCategories: ['Objective', 'Concept MCQ', 'Reaction MCQ', 'Formula MCQ', 'Vocabulary'] },
      { id: 'part-b', title: isUrdu ? 'مختصر سوالات' : 'Part B: Short Questions', questionNo: 2, type: 'Short Question', totalQuestions: 5, attemptRequired: 5, marksEach: 2, marks: 10, allowedCategories: ['Definitions', 'Conceptual', 'Reasoning', 'Examples', 'Numerical'] },
      { id: 'part-c', title: isUrdu ? 'تفصیلی سوالات' : 'Part C: Long Questions', questionNo: 3, type: 'Long Question', totalQuestions: 2, attemptRequired: 2, marksEach: 5, marks: 10, allowedCategories: ['Explanation', 'Comparison', 'Process', 'Diagram', 'Derivation'] },
    ],
    instructions: isUrdu
      ? ['تمام حصے حل کریں۔', 'سوالات کو واضح اور مختصر لکھیں۔']
      : ['Attempt all parts.', 'Write answers clearly and neatly.'],
  }
}

export function findUnifiedPattern(opts = {}) {
  const {
    classLevel,
    subject,
    medium,
    intent,
    paperType,
  } = opts || {}

  const normalizedSubject = String(subject || '').toLowerCase().trim()
  const normalizedMedium = String(medium || '').toLowerCase()
  const normalizedIntent = String(intent || '').toLowerCase()
  const normalizedPaperType = String(paperType || '').toLowerCase()
  const subjectKey = normalizeSubjectKey(normalizedSubject)
  const tier = getClassTier(classLevel)

  if (normalizedIntent.includes('assessment') || normalizedPaperType.includes('assessment')) {
    return buildSchoolAssessmentPattern({ classLevel, subject, medium })
  }

  const exact = EXTENDED_PATTERN_LIBRARY.find(pattern =>
    String(pattern.classLevel) === String(classLevel || '') &&
    normalizeSubjectKey(pattern.subject) === subjectKey &&
    (!medium || String(pattern.medium || '').toLowerCase() === normalizedMedium || normalizedMedium === 'dual medium')
  )
  if (exact) return exact

  const matricBase = findMatricBasePattern(subject, medium)
  if (tier === 'primary') {
    return buildPrimarySchoolPattern({ classLevel, subject, medium })
  }
  if (tier === 'middle' && matricBase) {
    return scalePatternForMiddle(matricBase, classLevel)
  }
  if (tier === 'matric' && matricBase) {
    return clonePatternForMatric(matricBase, classLevel || '9')
  }
  if (tier === 'inter' && matricBase) {
    return scalePatternForInter(matricBase, classLevel || '12')
  }

  return EXTENDED_PATTERN_LIBRARY.find(pattern => normalizeSubjectKey(pattern.subject) === subjectKey)
    || UNIFIED_PATTERN_LIBRARY[0]
}
