// seedData.js â€” Pakistan SNC Curriculum Sample Questions
// Injected once into localStorage when question bank is empty.

const NOW = '2026-01-01T00:00:00.000Z'

// â”€â”€ Subjects â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const SEED_SUBJECTS = [
  { id: 'ss_math5',  name: 'Mathematics', nameUrdu: 'Ø±ÛŒØ§Ø¶ÛŒ',          publisher: 'SNC', classLevel: '5',  cover: null, createdAt: NOW },
  { id: 'ss_eng5',   name: 'English',     nameUrdu: 'Ø§Ù†Ú¯Ø±ÛŒØ²ÛŒ',         publisher: 'SNC', classLevel: '5',  cover: null, createdAt: NOW },
  { id: 'ss_sci5',   name: 'Science',     nameUrdu: 'Ø³Ø§Ø¦Ù†Ø³',           publisher: 'SNC', classLevel: '5',  cover: null, createdAt: NOW },
  { id: 'ss_urdu5',  name: 'Urdu',        nameUrdu: 'Ø§Ø±Ø¯Ùˆ',            publisher: 'SNC', classLevel: '5',  cover: null, createdAt: NOW },
  { id: 'ss_math8',  name: 'Mathematics', nameUrdu: 'Ø±ÛŒØ§Ø¶ÛŒ',          publisher: 'SNC', classLevel: '8',  cover: null, createdAt: NOW },
  { id: 'ss_eng8',   name: 'English',     nameUrdu: 'Ø§Ù†Ú¯Ø±ÛŒØ²ÛŒ',         publisher: 'SNC', classLevel: '8',  cover: null, createdAt: NOW },
  { id: 'ss_math10', name: 'Mathematics', nameUrdu: 'Ø±ÛŒØ§Ø¶ÛŒ',          publisher: 'SNC', classLevel: '10', cover: null, createdAt: NOW },
  { id: 'ss_phy10',  name: 'Physics',     nameUrdu: 'Ø·Ø¨ÛŒØ¹ÛŒØ§Øª',         publisher: 'SNC', classLevel: '10', cover: null, createdAt: NOW },
  { id: 'ss_isl5',   name: 'Islamic Studies', nameUrdu: 'Ø§Ø³Ù„Ø§Ù…ÛŒØ§Øª',   publisher: 'SNC', classLevel: '5',  cover: null, createdAt: NOW },
]

// â”€â”€ Questions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let _id = 1
const q = (subjectId, type, text, textUrdu, opts, answer, marks, chapter, priority = 'exercise') => ({
  id: `qs_${_id++}`,
  subjectId, type, text, textUrdu,
  options: opts || [],
  answer: answer || '',
  marks: Number(marks) || 1,
  chapter, priority,
  createdAt: NOW,
})
const mcq = (sid, text, textUrdu, a, b, c, d, ans, chap, pri) => q(sid, 'mcq', text, textUrdu, [
  { label: 'A', text: a, textUrdu: '' },
  { label: 'B', text: b, textUrdu: '' },
  { label: 'C', text: c, textUrdu: '' },
  { label: 'D', text: d, textUrdu: '' },
], ans, 1, chap, pri)
const short = (sid, text, textUrdu, chap, marks = 2, pri = 'exercise') => q(sid, 'short', text, textUrdu, [], '', marks, chap, pri)
const long  = (sid, text, textUrdu, chap, marks = 5, pri = 'exercise') => q(sid, 'long',  text, textUrdu, [], '', marks, chap, pri)

export const SEED_QUESTIONS = [

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // MATHEMATICS â€” CLASS 5
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  // Chapter: Fractions
  mcq('ss_math5','What is 1/2 + 1/4?','Â½ + Â¼ = ?','3/4','1/4','1/6','2/3','A','Fractions','exercise'),
  mcq('ss_math5','Which fraction is equivalent to 2/4?','2/4 Ú©Û’ Ø¨Ø±Ø§Ø¨Ø± Ú©ÙˆÙ† Ø³ÛŒ Ú©Ø³Ø± ÛÛ’ØŸ','1/2','1/4','3/4','1/3','A','Fractions','exercise'),
  mcq('ss_math5','What is 3/5 of 25?','25 Ú©Ø§ 3/5 Ú©ÛŒØ§ ÛÛ’ØŸ','15','10','20','12','A','Fractions','exercise'),
  mcq('ss_math5','3/4 - 1/4 = ?','3/4 - 1/4 = ?','1/2','2/4','1','3/8','A','Fractions','exercise'),
  mcq('ss_math5','Which is the largest fraction: 1/2, 1/3, 1/4, 1/6?','Ø³Ø¨ Ø³Û’ Ø¨Ú‘ÛŒ Ú©Ø³Ø± Ú©ÙˆÙ† Ø³ÛŒ ÛÛ’ØŸ','1/2','1/3','1/4','1/6','A','Fractions','exercise'),
  mcq('ss_math5','A proper fraction has numerator:','Ù…Ù†Ø§Ø³Ø¨ Ú©Ø³Ø± Ù…ÛŒÚº ØµÙˆØ±Û ÛÙˆØªØ§ ÛÛ’:','less than denominator','equal to denominator','greater than denominator','zero','A','Fractions','exercise'),
  short('ss_math5','Add 2/5 and 3/10. Write your working.','2/5 Ø§ÙˆØ± 3/10 Ø¬Ù…Ø¹ Ú©Ø±ÛŒÚºÛ” Ø­Ù„ Ù„Ú©Ú¾ÛŒÚºÛ”','Fractions',2,'exercise'),
  short('ss_math5','Arrange these fractions in ascending order: 3/4, 1/2, 2/3, 1/4','Ø§Ù† Ú©Ø³Ø±ÙˆÚº Ú©Ùˆ Ú†Ú¾ÙˆÙ¹Û’ Ø³Û’ Ø¨Ú‘Û’ ØªØ±ØªÛŒØ¨ Ù…ÛŒÚº Ù„Ú©Ú¾ÛŒÚº: 3/4ØŒ 1/2ØŒ 2/3ØŒ 1/4','Fractions',2,'exercise'),
  short('ss_math5','A pizza is cut into 8 equal slices. Ali ate 3 slices. What fraction did he eat?','Ù¾ÛŒØ²Ø§ 8 Ø¨Ø±Ø§Ø¨Ø± Ù¹Ú©Ú‘ÙˆÚº Ù…ÛŒÚº Ú©Ø§Ù¹Ø§ Ú¯ÛŒØ§Û” Ø¹Ù„ÛŒ Ù†Û’ 3 Ù¹Ú©Ú‘Û’ Ú©Ú¾Ø§Ø¦Û’Û” Ø§Ø³ Ù†Û’ Ú©ØªÙ†Ø§ Ø­ØµÛ Ú©Ú¾Ø§ÛŒØ§ØŸ','Fractions',2,'exercise'),
  long('ss_math5','Explain the difference between proper, improper and mixed fractions with two examples each. Then solve: 2Â¼ + 1Â½','ØµØ­ÛŒØ­ØŒ ØºÛŒØ± ØµØ­ÛŒØ­ Ø§ÙˆØ± Ù…Ù„ÛŒ Ú©Ø³Ø± Ú©Ø§ ÙØ±Ù‚ Ø¯Ùˆ Ù…Ø«Ø§Ù„ÙˆÚº Ø³Û’ Ø¨ÛŒØ§Ù† Ú©Ø±ÛŒÚºÛ” Ù¾Ú¾Ø± Ø­Ù„ Ú©Ø±ÛŒÚº: 2Â¼ + 1Â½','Fractions',5,'exercise'),

  // Chapter: Decimals
  mcq('ss_math5','0.5 is equal to:','0.5 Ø¨Ø±Ø§Ø¨Ø± ÛÛ’:','1/2','1/4','1/5','5/100','A','Decimals','exercise'),
  mcq('ss_math5','What is 1.25 + 2.75?','1.25 + 2.75 = ?','4.00','3.00','4.50','3.50','A','Decimals','exercise'),
  mcq('ss_math5','Which decimal is greatest: 0.3, 0.03, 0.30, 0.003?','Ø³Ø¨ Ø³Û’ Ø¨Ú‘Ø§ Ø¹Ø´Ø§Ø±ÛŒÛ Ú©ÙˆÙ† Ø³Ø§ ÛÛ’ØŸ','0.3','0.03','0.003','0.30','A','Decimals','exercise'),
  mcq('ss_math5','5.6 Ã— 10 = ?','5.6 Ã— 10 = ?','56','0.56','5.60','560','A','Decimals','past'),
  short('ss_math5','Convert 3/4 to decimal. Show your method.','3/4 Ú©Ùˆ Ø¹Ø´Ø§Ø±ÛŒÛ Ù…ÛŒÚº Ø¨Ø¯Ù„ÛŒÚºÛ” Ø·Ø±ÛŒÙ‚Û Ù„Ú©Ú¾ÛŒÚºÛ”','Decimals',2,'exercise'),
  short('ss_math5','A shopkeeper sold cloth for Rs. 125.50. He received Rs. 200. Find the change.','Ø¯Ú©Ø§Ù†Ø¯Ø§Ø± Ù†Û’ Ú©Ù¾Ú‘Ø§ 125.50 Ø±ÙˆÙ¾Û’ Ù…ÛŒÚº Ø¨ÛŒÚ†Ø§Û” Ø§Ø³Û’ 200 Ø±ÙˆÙ¾Û’ Ù…Ù„Û’Û” ÙˆØ§Ù¾Ø³ÛŒ Ø±Ù‚Ù… Ù†Ú©Ø§Ù„ÛŒÚºÛ”','Decimals',2,'exercise'),
  long('ss_math5','Solve: (a) 12.5 Ã— 4.2  (b) 36.8 Ã· 8  (c) Round 7.456 to the nearest tenth','Ø­Ù„ Ú©Ø±ÛŒÚº: (a) 12.5 Ã— 4.2  (b) 36.8 Ã· 8  (c) 7.456 Ú©Ùˆ Ù‚Ø±ÛŒØ¨ÛŒ Ø¯Ø³ÙˆØ§Úº Ø­ØµÛ ØªÚ© Ù¾ÙˆØ±Ø§ Ú©Ø±ÛŒÚº','Decimals',5,'exercise'),

  // Chapter: Multiplication & Division
  mcq('ss_math5','456 Ã— 12 = ?','456 Ã— 12 = ?','5472','5270','4572','5742','A','Multiplication','exercise'),
  mcq('ss_math5','840 Ã· 24 = ?','840 Ã· 24 = ?','35','30','40','45','A','Division','exercise'),
  mcq('ss_math5','What is the product of 25 and 40?','25 Ø§ÙˆØ± 40 Ú©Ø§ Ø­Ø§ØµÙ„ Ø¶Ø±Ø¨ Ú©ÛŒØ§ ÛÛ’ØŸ','1000','800','900','1200','A','Multiplication','exercise'),
  mcq('ss_math5','If 7 Ã— __ = 63, what is the missing number?','7 Ã— __ = 63, Ù„Ø§Ù¾ØªÛ Ù†Ù…Ø¨Ø± Ú©ÛŒØ§ ÛÛ’ØŸ','9','7','8','6','A','Multiplication','exercise'),
  short('ss_math5','A school has 48 students in each class. There are 12 classes. How many students are there in total?','Ø§ÛŒÚ© Ø§Ø³Ú©ÙˆÙ„ Ù…ÛŒÚº ÛØ± Ú©Ù„Ø§Ø³ Ù…ÛŒÚº 48 Ø·Ù„Ø¨Û ÛÛŒÚºÛ” 12 Ú©Ù„Ø§Ø³ÛŒÚº ÛÛŒÚºÛ” Ú©Ù„ Ø·Ù„Ø¨Û Ú©ØªÙ†Û’ ÛÛŒÚºØŸ','Multiplication',2,'exercise'),
  short('ss_math5','Divide 1260 equally among 36 students. How much does each get?','1260 Ú©Ùˆ 36 Ø·Ù„Ø¨Û Ù…ÛŒÚº Ø¨Ø±Ø§Ø¨Ø± ØªÙ‚Ø³ÛŒÙ… Ú©Ø±ÛŒÚºÛ” ÛØ± Ø§ÛŒÚ© Ú©Ùˆ Ú©ØªÙ†Ø§ Ù…Ù„Û’ Ú¯Ø§ØŸ','Division',2,'exercise'),
  long('ss_math5','A factory produces 1250 items per day. (a) How many items in 28 days? (b) If packed in boxes of 25, how many boxes needed?','Ø§ÛŒÚ© ÙÛŒÚ©Ù¹Ø±ÛŒ Ø±ÙˆØ²Ø§Ù†Û 1250 Ø§Ø´ÛŒØ§Ø¡ Ø¨Ù†Ø§ØªÛŒ ÛÛ’Û” (a) 28 Ø¯Ù†ÙˆÚº Ù…ÛŒÚº Ú©ØªÙ†ÛŒ Ø§Ø´ÛŒØ§Ø¡ØŸ (b) 25 Ú©Û’ ÚˆØ¨ÙˆÚº Ù…ÛŒÚº Ø¨Ú¾Ø±ÛŒÚº ØªÙˆ Ú©ØªÙ†Û’ ÚˆØ¨Û’ Ú†Ø§ÛØ¦ÛŒÚºØŸ','Multiplication',5,'exercise'),

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // ENGLISH â€” CLASS 5
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  // Chapter: Grammar
  mcq('ss_eng5','Which word is a noun?','Ú©ÙˆÙ† Ø³Ø§ Ù„ÙØ¸ Ø§Ø³Ù… ÛÛ’ØŸ','Happiness','Run','Quickly','Beautiful','A','Grammar','exercise'),
  mcq('ss_eng5','Choose the correct article: __ apple a day keeps the doctor away.','ØµØ­ÛŒØ­ Ø¢Ø±Ù¹ÛŒÚ©Ù„ Ú†Ù†ÛŒÚº:','An','A','The','No article','A','Grammar','exercise'),
  mcq('ss_eng5','The plural of "child" is:','"child" Ú©ÛŒ Ø¬Ù…Ø¹ ÛÛ’:','Children','Childs','Childes','Childrens','A','Grammar','exercise'),
  mcq('ss_eng5','Which sentence is in Past Tense?','Ú©ÙˆÙ† Ø³Ø§ Ø¬Ù…Ù„Û Ù…Ø§Ø¶ÛŒ Ù…ÛŒÚº ÛÛ’ØŸ','She went to school.','She goes to school.','She will go to school.','She is going to school.','A','Grammar','exercise'),
  mcq('ss_eng5','Choose the correct verb: The boys __ playing cricket.','ØµØ­ÛŒØ­ ÙØ¹Ù„ Ú†Ù†ÛŒÚº:','are','is','was','am','A','Grammar','exercise'),
  mcq('ss_eng5','An adjective describes a:','ØµÙØª Ø¨ÛŒØ§Ù† Ú©Ø±ØªÛŒ ÛÛ’:','noun','verb','adverb','conjunction','A','Grammar','exercise'),
  mcq('ss_eng5','The opposite of "beautiful" is:','"beautiful" Ú©ÛŒ Ø¶Ø¯:','ugly','pretty','handsome','fair','A','Grammar','past'),
  short('ss_eng5','Write four sentences using the verb "have" in present, past, future, and present continuous tenses.','ÙØ¹Ù„ "have" Ú©Ùˆ Ø­Ø§Ù„ØŒ Ù…Ø§Ø¶ÛŒØŒ Ù…Ø³ØªÙ‚Ø¨Ù„ Ø§ÙˆØ± Ø¬Ø§Ø±ÛŒ Ø­Ø§Ù„ Ù…ÛŒÚº Ú†Ø§Ø± Ø¬Ù…Ù„ÙˆÚº Ù…ÛŒÚº Ø§Ø³ØªØ¹Ù…Ø§Ù„ Ú©Ø±ÛŒÚºÛ”','Grammar',2,'exercise'),
  short('ss_eng5','Underline the adjectives in these sentences: (a) The tall boy won the prize. (b) She has a beautiful house.','Ø§Ù† Ø¬Ù…Ù„ÙˆÚº Ù…ÛŒÚº ØµÙØ§Øª Ú©Ùˆ Ø®Ø· Ú©Ø´ÛŒ Ú©Ø±ÛŒÚºÛ”','Grammar',2,'exercise'),
  short('ss_eng5','Write the plural of: ox, mouse, leaf, tooth, man','Ø§Ù† Ú©ÛŒ Ø¬Ù…Ø¹ Ù„Ú©Ú¾ÛŒÚº: ox, mouse, leaf, tooth, man','Grammar',2,'exercise'),
  long('ss_eng5','Write a paragraph of 8-10 sentences describing your school. Use at least 5 different adjectives and both past and present tenses.','Ø§Ù¾Ù†Û’ Ø§Ø³Ú©ÙˆÙ„ Ú©Û’ Ø¨Ø§Ø±Û’ Ù…ÛŒÚº 8-10 Ø¬Ù…Ù„ÙˆÚº Ú©Ø§ Ù¾ÛŒØ±Ø§Ú¯Ø±Ø§Ù Ù„Ú©Ú¾ÛŒÚºÛ” Ú©Ù… Ø§Ø² Ú©Ù… 5 ØµÙØ§Øª Ø§ÙˆØ± Ù…Ø§Ø¶ÛŒ Ùˆ Ø­Ø§Ù„ Ø¯ÙˆÙ†ÙˆÚº Ø²Ù…Ø§Ù†Û’ Ø§Ø³ØªØ¹Ù…Ø§Ù„ Ú©Ø±ÛŒÚºÛ”','Grammar',5,'exercise'),

  // Chapter: Comprehension
  mcq('ss_eng5','What does "comprehension" mean?','"comprehension" Ú©Ø§ Ù…Ø·Ù„Ø¨ ÛÛ’:','understanding','writing','speaking','listening','A','Comprehension','exercise'),
  mcq('ss_eng5','A synonym of "brave" is:','"brave" Ú©Ø§ ÛÙ… Ù…Ø¹Ù†ÛŒ:','courageous','coward','weak','fearful','A','Comprehension','exercise'),
  short('ss_eng5','Read the passage and answer: "Pakistan is a country in South Asia. It was founded in 1947. Its capital is Islamabad." â€” When was Pakistan founded?','Ú¯Ø²Ø±Û’ ÛÙˆØ¦Û’ Ø§Ù‚ØªØ¨Ø§Ø³ Ú©Ùˆ Ù¾Ú‘Ú¾ Ú©Ø± Ø¬ÙˆØ§Ø¨ Ø¯ÛŒÚº: Ù¾Ø§Ú©Ø³ØªØ§Ù† Ú©Ø¨ Ø¨Ù†Ø§ØŸ','Comprehension',2,'exercise'),
  long('ss_eng5','Write a story of 10 sentences about a brave student who saved a friend from danger. Use dialogue in your story.','Ø§ÛŒÚ© Ø¨ÛØ§Ø¯Ø± Ø·Ø§Ù„Ø¨ Ø¹Ù„Ù… Ú©Û’ Ø¨Ø§Ø±Û’ Ù…ÛŒÚº 10 Ø¬Ù…Ù„ÙˆÚº Ú©ÛŒ Ú©ÛØ§Ù†ÛŒ Ù„Ú©Ú¾ÛŒÚº Ø¬Ø³ Ù†Û’ Ø¯ÙˆØ³Øª Ú©Ùˆ Ø®Ø·Ø±Û’ Ø³Û’ Ø¨Ú†Ø§ÛŒØ§Û” Ù…Ú©Ø§Ù„Ù…Û Ø§Ø³ØªØ¹Ù…Ø§Ù„ Ú©Ø±ÛŒÚºÛ”','Comprehension',5,'exercise'),

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // SCIENCE â€” CLASS 5
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  mcq('ss_sci5','Which gas do plants absorb during photosynthesis?','Ù¾ÙˆØ¯Û’ ÙÙˆÙ¹Ùˆ Ø³Ù†ØªÚ¾ÛŒØ³Ø² Ù…ÛŒÚº Ú©ÙˆÙ† Ø³ÛŒ Ú¯ÛŒØ³ Ø¬Ø°Ø¨ Ú©Ø±ØªÛ’ ÛÛŒÚºØŸ','Carbon dioxide','Oxygen','Nitrogen','Hydrogen','A','Plants','exercise'),
  mcq('ss_sci5','The process by which plants make their own food is called:','Ù¾ÙˆØ¯Û’ Ø§Ù¾Ù†ÛŒ Ø®ÙˆØ±Ø§Ú© Ø¨Ù†Ø§Ù†Û’ Ú©Ø§ Ø¹Ù…Ù„ Ú©ÛÙ„Ø§ØªØ§ ÛÛ’:','Photosynthesis','Respiration','Digestion','Reproduction','A','Plants','exercise'),
  mcq('ss_sci5','Which part of the plant absorbs water from the soil?','Ù¾ÙˆØ¯Û’ Ú©Ø§ Ú©ÙˆÙ† Ø³Ø§ Ø­ØµÛ Ù…Ù¹ÛŒ Ø³Û’ Ù¾Ø§Ù†ÛŒ Ø¬Ø°Ø¨ Ú©Ø±ØªØ§ ÛÛ’ØŸ','Roots','Leaves','Stem','Flowers','A','Plants','exercise'),
  mcq('ss_sci5','Water boils at:','Ù¾Ø§Ù†ÛŒ Ø§Ø¨Ù„ØªØ§ ÛÛ’:','100Â°C','0Â°C','37Â°C','50Â°C','A','Matter','exercise'),
  mcq('ss_sci5','Which of these is a conductor of electricity?','Ú©ÙˆÙ† Ø³Ø§ Ø¨Ø¬Ù„ÛŒ Ú©Ø§ Ù…ÙˆØµÙ„ ÛÛ’ØŸ','Copper','Wood','Plastic','Rubber','A','Matter','exercise'),
  mcq('ss_sci5','The heart pumps blood to:','Ø¯Ù„ Ø®ÙˆÙ† Ù¾Ù…Ù¾ Ú©Ø±ØªØ§ ÛÛ’:','the whole body','only the brain','only the lungs','only the stomach','A','Animals','exercise'),
  mcq('ss_sci5','Which organ helps in breathing?','Ø³Ø§Ù†Ø³ Ù„ÛŒÙ†Û’ Ù…ÛŒÚº Ú©ÙˆÙ† Ø³Ø§ Ø¹Ø¶Ùˆ Ù…Ø¯Ø¯ Ú©Ø±ØªØ§ ÛÛ’ØŸ','Lungs','Heart','Liver','Kidneys','A','Animals','exercise'),
  mcq('ss_sci5','Sound travels fastest through:','Ø¢ÙˆØ§Ø² Ø³Ø¨ Ø³Û’ ØªÛŒØ² Ø³ÙØ± Ú©Ø±ØªÛŒ ÛÛ’:','Solids','Liquids','Gases','Vacuum','A','Matter','past'),
  short('ss_sci5','What are the three states of matter? Give one example of each.','Ù…Ø§Ø¯Û’ Ú©ÛŒ ØªÛŒÙ† Ø­Ø§Ù„ØªÛŒÚº Ú©ÛŒØ§ ÛÛŒÚºØŸ ÛØ± Ø§ÛŒÚ© Ú©ÛŒ Ù…Ø«Ø§Ù„ Ø¯ÛŒÚºÛ”','Matter',2,'exercise'),
  short('ss_sci5','Explain how a plant makes its food through photosynthesis.','ÙÙˆÙ¹Ùˆ Ø³Ù†ØªÚ¾ÛŒØ³Ø² Ú©Û’ Ø°Ø±ÛŒØ¹Û’ Ù¾ÙˆØ¯Ø§ Ú©ÛŒØ³Û’ Ø®ÙˆØ±Ø§Ú© Ø¨Ù†Ø§ØªØ§ ÛÛ’ØŸ Ø¨ÛŒØ§Ù† Ú©Ø±ÛŒÚºÛ”','Plants',2,'exercise'),
  short('ss_sci5','Name the main organs of the digestive system in order.','Ù†Ø¸Ø§Ù…Ù ÛØ¶Ù… Ú©Û’ Ø§ÛÙ… Ø§Ø¹Ø¶Ø§Ø¡ ØªØ±ØªÛŒØ¨ Ø³Û’ Ù„Ú©Ú¾ÛŒÚºÛ”','Animals',2,'exercise'),
  long('ss_sci5','Describe the water cycle in detail. Draw a labeled diagram and explain each stage: evaporation, condensation, precipitation, and collection.','Ø¢Ø¨ÛŒ Ú†Ú©Ø± Ú©Ùˆ ØªÙØµÛŒÙ„ Ø³Û’ Ø¨ÛŒØ§Ù† Ú©Ø±ÛŒÚºÛ” Ø§ÛŒÚ© Ù„ÛŒØ¨Ù„ Ù„Ú¯Ø§ Ø®Ø§Ú©Û Ø¨Ù†Ø§Ø¦ÛŒÚº Ø§ÙˆØ± ÛØ± Ù…Ø±Ø­Ù„Û Ø³Ù…Ø¬Ú¾Ø§Ø¦ÛŒÚº: Ø¨Ø®Ø§Ø±Ø§ØªØŒ Ú©Ø«Ø§ÙØªØŒ Ø¨Ø§Ø±Ø´ØŒ Ø§ÙˆØ± Ø¬Ù…Ø¹Û”','Matter',5,'exercise'),
  long('ss_sci5','Compare the life cycle of a butterfly and a frog. Write at least 4 stages for each with explanation.','ØªØªÙ„ÛŒ Ø§ÙˆØ± Ù…ÛŒÙ†ÚˆÚ© Ú©Ø§ Ø¬ÛŒÙˆÙ† Ú†Ú©Ø± Ù…ÙˆØ§Ø²Ù†Û Ú©Ø±ÛŒÚºÛ” ÛØ± Ø§ÛŒÚ© Ú©Û’ Ú©Ù… Ø§Ø² Ú©Ù… 4 Ù…Ø±Ø§Ø­Ù„ ÙˆØ¶Ø§Ø­Øª Ú©Û’ Ø³Ø§ØªÚ¾ Ù„Ú©Ú¾ÛŒÚºÛ”','Animals',5,'exercise'),

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // URDU â€” CLASS 5
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  mcq('ss_urdu5','Ø§Ø³Ù… Ú©ÛŒ Ú©ØªÙ†ÛŒ Ø§Ù‚Ø³Ø§Ù… ÛÛŒÚºØŸ','','ØªÛŒÙ†','Ø¯Ùˆ','Ú†Ø§Ø±','Ù¾Ø§Ù†Ú†','A','Ù‚ÙˆØ§Ø¹Ø¯','exercise'),
  mcq('ss_urdu5','ÙØ¹Ù„ Ù…Ø§Ø¶ÛŒ Ú©ÛŒ Ù…Ø«Ø§Ù„ Ú©ÙˆÙ† Ø³ÛŒ ÛÛ’ØŸ','','ÙˆÛ Ú¯ÛŒØ§','ÙˆÛ Ø¬Ø§ØªØ§ ÛÛ’','ÙˆÛ Ø¬Ø§Ø¦Û’ Ú¯Ø§','ÙˆÛ Ø¬Ø§ Ø±ÛØ§ ÛÛ’','A','Ù‚ÙˆØ§Ø¹Ø¯','exercise'),
  mcq('ss_urdu5','"Ø³ÙˆØ±Ø¬" Ú©Ø§ Ù…ØªØ±Ø§Ø¯Ù Ú©ÙˆÙ† Ø³Ø§ ÛÛ’ØŸ','','"Ø¢ÙØªØ§Ø¨"','"Ú†Ø§Ù†Ø¯"','"Ø³ØªØ§Ø±Û"','"Ø¨Ø§Ø¯Ù„"','A','Ø§Ù„ÙØ§Ø¸','exercise'),
  mcq('ss_urdu5','ÙˆØ§Ø­Ø¯ "Ú©ØªØ§Ø¨" Ú©ÛŒ Ø¬Ù…Ø¹ Ú©ÛŒØ§ ÛÛ’ØŸ','','Ú©ØªØ§Ø¨ÛŒÚº','Ú©ØªØ§Ø¨ÙˆÚº','Ú©ØªØ§Ø¨ÛŒÚº','Ú©ØªØ§Ø¨ÛŒ','A','Ù‚ÙˆØ§Ø¹Ø¯','exercise'),
  mcq('ss_urdu5','Ø¶Ù…ÛŒØ± Ú©Ø³Û’ Ú©ÛØªÛ’ ÛÛŒÚºØŸ','','Ø§Ø³Ù… Ú©ÛŒ Ø¬Ú¯Û Ø¢Ù†Û’ ÙˆØ§Ù„Ø§ Ù„ÙØ¸','ÙØ¹Ù„ Ú©ÛŒ Ø¬Ú¯Û Ø¢Ù†Û’ ÙˆØ§Ù„Ø§ Ù„ÙØ¸','ØµÙØª Ú©ÛŒ Ø¬Ú¯Û Ø¢Ù†Û’ ÙˆØ§Ù„Ø§ Ù„ÙØ¸','Ø­Ø±Ù Ú©ÛŒ Ø¬Ú¯Û Ø¢Ù†Û’ ÙˆØ§Ù„Ø§ Ù„ÙØ¸','A','Ù‚ÙˆØ§Ø¹Ø¯','exercise'),
  mcq('ss_urdu5','Ø®Ø· Ú©Ø§ Ø§Ø®ØªØªØ§Ù… Ú©ÛŒØ³Û’ ÛÙˆØªØ§ ÛÛ’ØŸ','','Ø¯Ø³ØªØ®Ø· Ø³Û’','Ø¹Ù†ÙˆØ§Ù† Ø³Û’','ØªØ§Ø±ÛŒØ® Ø³Û’','Ù…ÙˆØ¶ÙˆØ¹ Ø³Û’','A','Ø®Ø· Ù†ÙˆÛŒØ³ÛŒ','exercise'),
  short('ss_urdu5','Ø¯Ø±Ø¬ Ø°ÛŒÙ„ Ø§Ù„ÙØ§Ø¸ Ú©Û’ Ù…ØªØ±Ø§Ø¯Ù Ù„Ú©Ú¾ÛŒÚº: Ù¾Ø§Ù†ÛŒØŒ Ø¢Ú¯ØŒ Ø¯Ù„ØŒ Ú¯Ú¾Ø±','','Ø§Ù„ÙØ§Ø¸',2,'exercise'),
  short('ss_urdu5','Ú©ÙˆØ¦ÛŒ Ù¾Ø§Ù†Ú† Ø¬Ù…Ù„Û’ Ù„Ú©Ú¾ÛŒÚº Ø¬Ù† Ù…ÛŒÚº Ø§Ø³Ù…ØŒ ÙØ¹Ù„ Ø§ÙˆØ± ØµÙØª Ø§Ø³ØªØ¹Ù…Ø§Ù„ ÛÙˆÛ”','','Ù‚ÙˆØ§Ø¹Ø¯',2,'exercise'),
  short('ss_urdu5','Ø§Ù¾Ù†Û’ ÙˆØ§Ù„Ø¯ÛŒÙ† Ú©Ùˆ Ø®Ø· Ù„Ú©Ú¾ÛŒÚº Ø¬Ø³ Ù…ÛŒÚº Ø§Ø³Ú©ÙˆÙ„ Ú©ÛŒ Ø®ÙˆØ´ÛŒÙˆÚº Ú©Ø§ Ø°Ú©Ø± ÛÙˆÛ” (Ù…Ø®ØªØµØ±)','','Ø®Ø· Ù†ÙˆÛŒØ³ÛŒ',3,'exercise'),
  long('ss_urdu5','Ù…ÙˆØ¶ÙˆØ¹ "Ù…ÛŒØ±Ø§ Ù¾ÛŒØ§Ø±Ø§ ÙˆØ·Ù† Ù¾Ø§Ú©Ø³ØªØ§Ù†" Ù¾Ø± 10 Ø¬Ù…Ù„ÙˆÚº Ú©ÛŒ ØªÙ‚Ø±ÛŒØ± Ù„Ú©Ú¾ÛŒÚºÛ” Ù…Ù‚Ø¯Ù…ÛØŒ Ù…ÙˆØ¶ÙˆØ¹ Ø§ÙˆØ± Ø®Ø§ØªÙ…Û Ø¶Ø±ÙˆØ± Ø´Ø§Ù…Ù„ Ú©Ø±ÛŒÚºÛ”','','ØªØ­Ø±ÛŒØ±',5,'exercise'),
  long('ss_urdu5','Ù…Ù†Ø¯Ø±Ø¬Û Ø°ÛŒÙ„ Ù…ÙˆØ¶ÙˆØ¹ Ù¾Ø± Ù…Ø¶Ù…ÙˆÙ† Ù„Ú©Ú¾ÛŒÚº: "Ø³Ø§Ø¯Û Ø²Ù†Ø¯Ú¯ÛŒ Ø¨ÛØªØ±ÛŒÙ† Ø²Ù†Ø¯Ú¯ÛŒ" â€” Ú©Ù… Ø§Ø² Ú©Ù… ØªÛŒÙ† Ù¾ÛŒØ±Ø§Ú¯Ø±Ø§Ù Ù„Ø§Ø²Ù…ÛŒ Ù„Ú©Ú¾ÛŒÚºÛ”','','ØªØ­Ø±ÛŒØ±',5,'exercise'),

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // MATHEMATICS â€” CLASS 8
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  mcq('ss_math8','If x + 5 = 12, then x = ?','','7','17','6','8','A','Algebra','exercise'),
  mcq('ss_math8','2x - 3 = 7, then x = ?','','5','2','4','6','A','Algebra','exercise'),
  mcq('ss_math8','What is the area of a square with side 9 cm?','9 Ø³ÛŒÙ†Ù¹ÛŒ Ù…ÛŒÙ¹Ø± Ø³Ø§Ø¦ÛŒÚˆ Ú©Ø§ Ù…Ø±Ø¨Ø¹ Ú©Ø§ Ø±Ù‚Ø¨ÛØŸ','81 cmÂ²','36 cmÂ²','18 cmÂ²','45 cmÂ²','A','Geometry','exercise'),
  mcq('ss_math8','The sum of angles in a triangle is:','Ù…Ø«Ù„Ø« Ú©Û’ Ø²Ø§ÙˆÛŒÙˆÚº Ú©Ø§ Ù…Ø¬Ù…ÙˆØ¹Û:','180Â°','360Â°','90Â°','270Â°','A','Geometry','exercise'),
  mcq('ss_math8','In a right-angled triangle with legs 3 and 4, the hypotenuse is:','3 Ø§ÙˆØ± 4 ÙˆØ§Ù„Û’ Ù‚Ø§Ø¦Ù… Ø§Ù„Ø²Ø§ÙˆÛŒÛ Ù…Ø«Ù„Ø« Ú©Ø§ ÙˆØªØ±:','5','7','6','8','A','Pythagoras','exercise'),
  mcq('ss_math8','Simplify: 3(x + 4) - 2x','','x + 12','5x + 12','x - 12','x + 4','A','Algebra','exercise'),
  mcq('ss_math8','A circle with radius 7 cm has area: (Ï€ = 22/7)','','154 cmÂ²','44 cmÂ²','49 cmÂ²','22 cmÂ²','A','Geometry','exercise'),
  mcq('ss_math8','LCM of 12 and 18 is:','12 Ø§ÙˆØ± 18 Ú©Ø§ LCM:','36','24','72','18','A','Algebra','exercise'),
  mcq('ss_math8','If 5% of x = 20, then x = ?','','400','100','200','500','A','Percentage','past'),
  mcq('ss_math8','A rectangle has length 8 m and width 5 m. Its perimeter is:','','26 m','40 m','13 m','80 m','A','Geometry','exercise'),
  short('ss_math8','Solve: 3x + 7 = 22. Show all steps.','Ø­Ù„ Ú©Ø±ÛŒÚº: 3x + 7 = 22Û” ØªÙ…Ø§Ù… Ù…Ø±Ø§Ø­Ù„ Ù„Ú©Ú¾ÛŒÚºÛ”','Algebra',2,'exercise'),
  short('ss_math8','Find the area and perimeter of a rectangle with length 15 cm and width 8 cm.','15 Ø³ÛŒÙ†Ù¹ÛŒ Ù…ÛŒÙ¹Ø± Ù„Ù…Ø¨Ø§ Ø§ÙˆØ± 8 Ø³ÛŒÙ†Ù¹ÛŒ Ù…ÛŒÙ¹Ø± Ú†ÙˆÚ‘Ø§ Ù…Ø³ØªØ·ÛŒÙ„ Ú©Ø§ Ø±Ù‚Ø¨Û Ø§ÙˆØ± Ù…Ø­ÛŒØ· Ù†Ú©Ø§Ù„ÛŒÚºÛ”','Geometry',2,'exercise'),
  short('ss_math8','A shopkeeper bought goods for Rs. 4500 and sold for Rs. 5400. Find profit and profit percentage.','Ø¯Ú©Ø§Ù†Ø¯Ø§Ø± Ù†Û’ 4500 Ø±ÙˆÙ¾Û’ Ù…ÛŒÚº Ø®Ø±ÛŒØ¯Ø§ Ø§ÙˆØ± 5400 Ù…ÛŒÚº Ø¨ÛŒÚ†Ø§Û” Ù†ÙØ¹ Ø§ÙˆØ± Ù†ÙØ¹ ÙÛŒØµØ¯ Ù†Ú©Ø§Ù„ÛŒÚºÛ”','Percentage',3,'exercise'),
  short('ss_math8','State Pythagoras theorem and verify it for a triangle with sides 5, 12, 13.','ÙÛŒØ«Ø§ØºÙˆØ±Ø« Ù‚Ø¶ÛŒÛ Ø¨ÛŒØ§Ù† Ú©Ø±ÛŒÚº Ø§ÙˆØ± 5ØŒ 12ØŒ 13 Ø³Ø§Ø¦ÛŒÚˆÙˆÚº ÙˆØ§Ù„Û’ Ù…Ø«Ù„Ø« Ú©Û’ Ù„ÛŒÛ’ Ø«Ø§Ø¨Øª Ú©Ø±ÛŒÚºÛ”','Pythagoras',3,'exercise'),
  long('ss_math8','Solve these simultaneous equations: 2x + 3y = 13 and x - y = 1. Check your answer.','ÛŒÛ Ø¨ÛŒÚ© ÙˆÙ‚Øª Ù…Ø³Ø§ÙˆØ§Øª Ø­Ù„ Ú©Ø±ÛŒÚº: 2x + 3y = 13 Ø§ÙˆØ± x - y = 1Û” Ø¬ÙˆØ§Ø¨ Ø¬Ø§Ù†Ú†ÛŒÚºÛ”','Algebra',5,'exercise'),
  long('ss_math8','The length of a rectangular field is twice its width. Its area is 288 mÂ². Find length, width and perimeter.','Ø§ÛŒÚ© Ù…Ø³ØªØ·ÛŒÙ„ Ú©Ú¾ÛŒØª Ú©ÛŒ Ù„Ù…Ø¨Ø§Ø¦ÛŒ Ú†ÙˆÚ‘Ø§Ø¦ÛŒ Ø³Û’ Ø¯Ú¯Ù†ÛŒ ÛÛ’Û” Ø±Ù‚Ø¨Û 288 Ù…Ø±Ø¨Ø¹ Ù…ÛŒÙ¹Ø± ÛÛ’Û” Ù„Ù…Ø¨Ø§Ø¦ÛŒØŒ Ú†ÙˆÚ‘Ø§Ø¦ÛŒ Ø§ÙˆØ± Ù…Ø­ÛŒØ· Ù†Ú©Ø§Ù„ÛŒÚºÛ”','Geometry',5,'exercise'),
  long('ss_math8','A class of 40 students got these scores in a test (out of 50): 45,42,38,50,35,40,28,48,30,45,42,38,50,35,40,28,48,30,45,40. Calculate mean, median, and mode.','40 Ø·Ù„Ø¨Û Ú©Û’ Ù†Ù…Ø¨Ø±: Ø§ÙˆØ³Ø·ØŒ ÙˆØ³Ø·ÛŒ Ø§ÙˆØ± Ú©Ø«ÛŒØ± Ù†Ú©Ø§Ù„ÛŒÚºÛ”','Statistics',5,'past'),

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // ENGLISH â€” CLASS 8
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  mcq('ss_eng8','The passive voice of "She writes a letter" is:','','A letter is written by her.','A letter was written by her.','A letter will be written by her.','A letter has been written by her.','A','Grammar','exercise'),
  mcq('ss_eng8','Choose the correct form: He has been reading __ two hours.','','for','since','from','during','A','Grammar','exercise'),
  mcq('ss_eng8','A word that joins clauses is called:','','Conjunction','Preposition','Interjection','Adverb','A','Grammar','exercise'),
  mcq('ss_eng8','The synonym of "enormous" is:','','"huge"','"tiny"','"average"','"ordinary"','A','Vocabulary','exercise'),
  mcq('ss_eng8','Which sentence contains a relative clause?','','The man who came yesterday is my uncle.','He is tall and handsome.','She sings and dances.','They ran but could not win.','A','Grammar','exercise'),
  short('ss_eng8','Change these sentences to passive voice: (a) The teacher corrects the papers. (b) They built this bridge in 2010.','Ø§Ù† Ø¬Ù…Ù„ÙˆÚº Ú©Ùˆ Ù…Ø¬ÛÙˆÙ„ Ù…ÛŒÚº Ø¨Ø¯Ù„ÛŒÚºÛ”','Grammar',2,'exercise'),
  short('ss_eng8','Write an application to your Principal requesting three days leave for a family function.','Ø®Ø§Ù†Ø¯Ø§Ù†ÛŒ ØªÙ‚Ø±ÛŒØ¨ Ú©Û’ Ù„ÛŒÛ’ ØªÛŒÙ† Ø¯Ù† Ú©ÛŒ Ú†Ú¾Ù¹ÛŒ Ú©Û’ Ù„ÛŒÛ’ Ù¾Ø±Ù†Ø³Ù¾Ù„ Ú©Ùˆ Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ù„Ú©Ú¾ÛŒÚºÛ”','Writing',3,'exercise'),
  long('ss_eng8','Write a letter to your friend describing your visit to a historical place. Include: where you went, what you saw, what you learned, and your experience (minimum 12 sentences).','Ú©Ø³ÛŒ ØªØ§Ø±ÛŒØ®ÛŒ Ø¬Ú¯Û Ú©Û’ Ø³ÙØ± Ú©Û’ Ø¨Ø§Ø±Û’ Ù…ÛŒÚº Ø¯ÙˆØ³Øª Ú©Ùˆ Ø®Ø· Ù„Ú©Ú¾ÛŒÚºÛ” 12 Ø¬Ù…Ù„Û’ Ù„Ø§Ø²Ù…ÛŒ Ù„Ú©Ú¾ÛŒÚºÛ”','Writing',5,'exercise'),
  long('ss_eng8','Write an essay on "Importance of Education" with introduction, three body paragraphs and conclusion (minimum 15 sentences).','ØªØ¹Ù„ÛŒÙ… Ú©ÛŒ Ø§ÛÙ…ÛŒØª Ù¾Ø± Ù…Ø¶Ù…ÙˆÙ† Ù„Ú©Ú¾ÛŒÚº Ø¬Ø³ Ù…ÛŒÚº Ù…Ù‚Ø¯Ù…ÛØŒ ØªÛŒÙ† Ù¾ÛŒØ±Ø§Ú¯Ø±Ø§Ù Ø§ÙˆØ± Ù†ØªÛŒØ¬Û ÛÙˆÛ” Ú©Ù… Ø§Ø² Ú©Ù… 15 Ø¬Ù…Ù„Û’Û”','Writing',5,'exercise'),

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // MATHEMATICS â€” CLASS 10
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  mcq('ss_math10','The roots of xÂ² - 5x + 6 = 0 are:','xÂ² - 5x + 6 = 0 Ú©ÛŒ Ø¬Ú‘ÛŒÚº:','2 and 3','1 and 6','-2 and -3','4 and 1','A','Quadratic Equations','exercise'),
  mcq('ss_math10','For axÂ² + bx + c = 0, discriminant = 0 means:','Ø¬Ø¬Ø¨Û = 0 Ú©Ø§ Ù…Ø·Ù„Ø¨:','Two equal real roots','No real roots','Two different real roots','Complex roots','A','Quadratic Equations','exercise'),
  mcq('ss_math10','sin 30Â° = ?','sin 30Â° = ?','1/2','âˆš3/2','1/âˆš2','1','A','Trigonometry','exercise'),
  mcq('ss_math10','cos 60Â° = ?','cos 60Â° = ?','1/2','âˆš3/2','0','1','A','Trigonometry','exercise'),
  mcq('ss_math10','If tan Î¸ = 1, then Î¸ = ?','','45Â°','30Â°','60Â°','90Â°','A','Trigonometry','exercise'),
  mcq('ss_math10','sinÂ²Î¸ + cosÂ²Î¸ = ?','','1','0','2','sinÎ¸ cosÎ¸','A','Trigonometry','exercise'),
  mcq('ss_math10','The formula for quadratic roots is:','','x = (-b Â± âˆš(bÂ²-4ac)) / 2a','x = (b Â± âˆš(bÂ²-4ac)) / 2a','x = (-b Â± âˆš(bÂ²+4ac)) / 2a','x = b / 2a','A','Quadratic Equations','exercise'),
  mcq('ss_math10','log 100 = ?','log 100 = ?','2','10','1','100','A','Logarithms','exercise'),
  mcq('ss_math10','log (m Ã— n) = ?','','log m + log n','log m - log n','log m Ã— log n','log m / log n','A','Logarithms','exercise'),
  mcq('ss_math10','A matrix with equal rows and columns is called:','','Square matrix','Row matrix','Column matrix','Zero matrix','A','Matrices','exercise'),
  mcq('ss_math10','If A = [1 2; 3 4], det(A) = ?','','âˆ’2','2','10','0','A','Matrices','exercise'),
  mcq('ss_math10','The value of n! (factorial) for n=5 is:','','120','24','60','720','A','Permutation','past'),
  short('ss_math10','Solve by factorization: xÂ² + 7x + 12 = 0','ÙÛŒÚ©Ù¹Ø±Ø§Ø¦Ø²ÛŒØ´Ù† Ø³Û’ Ø­Ù„ Ú©Ø±ÛŒÚº: xÂ² + 7x + 12 = 0','Quadratic Equations',2,'exercise'),
  short('ss_math10','Prove that sinÂ²Î¸ + cosÂ²Î¸ = 1','Ø«Ø§Ø¨Øª Ú©Ø±ÛŒÚº: sinÂ²Î¸ + cosÂ²Î¸ = 1','Trigonometry',3,'exercise'),
  short('ss_math10','Evaluate: log 8 + log 125 âˆ’ log 10 (without calculator)','Ù„ÙˆÚ¯Ø§Ø±ØªÚ¾Ù…: log 8 + log 125 âˆ’ log 10','Logarithms',3,'exercise'),
  short('ss_math10','Find the value of x: logâ‚‚(x) = 5','Ù„ÙˆÚ¯Ø§Ø±ØªÚ¾Ù… Ø­Ù„ Ú©Ø±ÛŒÚº: logâ‚‚(x) = 5','Logarithms',2,'exercise'),
  short('ss_math10','A ladder 10m long leans against a wall. It makes 60Â° with the ground. Find the height on wall. (sin60Â° = âˆš3/2)','10 Ù…ÛŒÙ¹Ø± Ø³ÛŒÚ‘Ú¾ÛŒ Ø¯ÛŒÙˆØ§Ø± Ø³Û’ 60Â° Ù¾Ø± Ø¬Ú¾Ú©ÛŒ ÛÛ’Û” Ø¯ÛŒÙˆØ§Ø± Ù¾Ø± Ø§ÙˆÙ†Ú†Ø§Ø¦ÛŒ Ù†Ú©Ø§Ù„ÛŒÚºÛ”','Trigonometry',3,'exercise'),
  long('ss_math10','Solve the quadratic equation 2xÂ² âˆ’ 7x + 3 = 0 using (a) factorization (b) quadratic formula. Compare both results.','2xÂ² âˆ’ 7x + 3 = 0 Ú©Ùˆ (a) ÙÛŒÚ©Ù¹Ø±Ø§Ø¦Ø²ÛŒØ´Ù† (b) Ú©ÙˆÚˆØ±ÛŒÙ¹Ú© ÙØ§Ø±Ù…ÙˆÙ„Ø§ Ø³Û’ Ø­Ù„ Ú©Ø±ÛŒÚºÛ” Ù†ØªØ§Ø¦Ø¬ Ù…ÙˆØ§Ø²Ù†Û Ú©Ø±ÛŒÚºÛ”','Quadratic Equations',8,'exercise'),
  long('ss_math10','From a point 50m away from a building, the angle of elevation of its top is 60Â°. Find the height of the building. Also find distance from top of building to observation point. (tan60Â° = âˆš3, sin60Â° = âˆš3/2)','50 Ù…ÛŒÙ¹Ø± Ø¯ÙˆØ± Ø³Û’ Ø¹Ù…Ø§Ø±Øª Ú©Ø§ Ø²Ø§ÙˆÛŒÛ Ø§Ø±ØªÙØ§Ø¹ 60Â° ÛÛ’Û” Ø¹Ù…Ø§Ø±Øª Ú©ÛŒ Ø§ÙˆÙ†Ú†Ø§Ø¦ÛŒ Ù†Ú©Ø§Ù„ÛŒÚºÛ”','Trigonometry',8,'exercise'),
  long('ss_math10','If A = [2 1; 3 4] and B = [1 0; 2 3], find: (a) A + B  (b) A Ã— B  (c) det(A) and det(B)','Ù…ÛŒÙ¹Ø±Ú©Ø³ Ø­Ø³Ø§Ø¨: A + BØŒ A Ã— BØŒ Ø§ÙˆØ± det(A) Ø§ÙˆØ± det(B) Ù†Ú©Ø§Ù„ÛŒÚºÛ”','Matrices',8,'exercise'),

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // PHYSICS â€” CLASS 10
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  mcq('ss_phy10','Newton\'s First Law is also called:','Ù†ÛŒÙˆÙ¹Ù† Ú©Ø§ Ù¾ÛÙ„Ø§ Ù‚Ø§Ù†ÙˆÙ† Ú©ÛÙ„Ø§ØªØ§ ÛÛ’:','Law of Inertia','Law of Momentum','Law of Gravity','Law of Action','A','Newton\'s Laws','exercise'),
  mcq('ss_phy10','F = ma is Newton\'s:','F = ma Ù†ÛŒÙˆÙ¹Ù† Ú©Ø§:','Second Law','First Law','Third Law','Law of Gravity','A','Newton\'s Laws','exercise'),
  mcq('ss_phy10','The SI unit of force is:','Ù‚ÙˆØª Ú©ÛŒ SI Ø§Ú©Ø§Ø¦ÛŒ:','Newton','Joule','Watt','Pascal','A','Newton\'s Laws','exercise'),
  mcq('ss_phy10','Work = Force Ã— ?','','Displacement','Time','Mass','Velocity','A','Work & Energy','exercise'),
  mcq('ss_phy10','The unit of power is:','Ø·Ø§Ù‚Øª Ú©ÛŒ Ø§Ú©Ø§Ø¦ÛŒ:','Watt','Newton','Joule','Pascal','A','Work & Energy','exercise'),
  mcq('ss_phy10','Kinetic energy = ?','','Â½mvÂ²','mv','mgh','mvÂ²','A','Work & Energy','exercise'),
  mcq('ss_phy10','Speed of light in vacuum is approximately:','','3 Ã— 10â¸ m/s','3 Ã— 10â¶ m/s','3 Ã— 10Â¹â° m/s','3 Ã— 10â´ m/s','A','Light','exercise'),
  mcq('ss_phy10','Which of these is not a vector quantity?','','Speed','Velocity','Force','Acceleration','A','Motion','exercise'),
  mcq('ss_phy10','Ohm\'s Law: V = ?','','IR','I/R','IÂ²R','P/I','A','Electricity','exercise'),
  mcq('ss_phy10','The half-life of Carbon-14 is approximately:','','5730 years','1000 years','10000 years','500 years','A','Nuclear Physics','past'),
  short('ss_phy10','State Newton\'s three laws of motion with one example each.','Ù†ÛŒÙˆÙ¹Ù† Ú©Û’ Ø­Ø±Ú©Øª Ú©Û’ ØªÛŒÙ† Ù‚ÙˆØ§Ù†ÛŒÙ† Ù…Ø«Ø§Ù„ Ú©Û’ Ø³Ø§ØªÚ¾ Ø¨ÛŒØ§Ù† Ú©Ø±ÛŒÚºÛ”','Newton\'s Laws',3,'exercise'),
  short('ss_phy10','A 5 kg object is pushed with force 20 N. Find its acceleration. (F = ma)','5 Ú©Ù„Ùˆ Ú¯Ø±Ø§Ù… Ø´Û’ Ù¾Ø± 20 N Ù‚ÙˆØª Ù„Ú¯Ø§Ø¦ÛŒÚºÛ” Ø§Ø³Ø±Ø§Ø¹ Ù†Ú©Ø§Ù„ÛŒÚºÛ”','Newton\'s Laws',2,'exercise'),
  short('ss_phy10','Differentiate between scalar and vector quantities. Give two examples of each.','Ø§Ø³Ú©ÛŒÙ„Ø± Ø§ÙˆØ± ÙˆÛŒÚ©Ù¹Ø± Ù…Ù‚Ø¯Ø§Ø±ÙˆÚº Ù…ÛŒÚº ÙØ±Ù‚ Ø¨ÛŒØ§Ù† Ú©Ø±ÛŒÚºÛ” ÛØ± Ø§ÛŒÚ© Ú©ÛŒ Ø¯Ùˆ Ù…Ø«Ø§Ù„ÛŒÚº Ø¯ÛŒÚºÛ”','Motion',3,'exercise'),
  short('ss_phy10','Define work, energy, and power. Write their SI units.','Ú©Ø§Ù…ØŒ ØªÙˆØ§Ù†Ø§Ø¦ÛŒ Ø§ÙˆØ± Ø·Ø§Ù‚Øª Ú©ÛŒ ØªØ¹Ø±ÛŒÙ Ù„Ú©Ú¾ÛŒÚºÛ” SI Ø§Ú©Ø§Ø¦ÛŒØ§Úº Ù„Ú©Ú¾ÛŒÚºÛ”','Work & Energy',3,'exercise'),
  long('ss_phy10','A ball is thrown vertically upward with velocity 20 m/s. Find: (a) maximum height (b) time to reach max height (c) total time in air. (g = 10 m/sÂ²)','20 m/s Ø³Û’ Ø§ÙˆÙ¾Ø± Ù¾Ú¾ÛŒÙ†Ú©ÛŒ Ú¯Ø¦ÛŒ Ú¯ÛŒÙ†Ø¯ Ú©Û’ Ù„ÛŒÛ’: (a) Ø²ÛŒØ§Ø¯Û Ø³Û’ Ø²ÛŒØ§Ø¯Û Ø§ÙˆÙ†Ú†Ø§Ø¦ÛŒ (b) Ø§ÙˆÙ¾Ø± Ø¬Ø§Ù†Û’ Ú©Ø§ ÙˆÙ‚Øª (c) Ú©Ù„ ÙˆÙ‚Øª Ù†Ú©Ø§Ù„ÛŒÚºÛ”','Motion',8,'exercise'),
  long('ss_phy10','Explain the principle of conservation of energy with a practical example of a falling object. Derive expressions for KE and PE at different heights.','ØªÙˆØ§Ù†Ø§Ø¦ÛŒ Ú©Û’ ØªØ­ÙØ¸ Ú©Û’ Ø§ØµÙˆÙ„ Ú©ÛŒ ÙˆØ¶Ø§Ø­Øª Ú©Ø±ÛŒÚºÛ” Ú¯Ø±ØªÛŒ Ø´Û’ Ú©ÛŒ Ù…Ø«Ø§Ù„ Ø³Û’ KE Ø§ÙˆØ± PE Ù†Ú©Ø§Ù„ÛŒÚºÛ”','Work & Energy',8,'exercise'),

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // ISLAMIC STUDIES â€” CLASS 5
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  mcq('ss_isl5','Ø§Ø³Ù„Ø§Ù… Ú©Û’ Ù¾Ø§Ù†Ú† Ø§Ø±Ú©Ø§Ù† Ù…ÛŒÚº Ù¾ÛÙ„Ø§ Ø±Ú©Ù† Ú©ÙˆÙ† Ø³Ø§ ÛÛ’ØŸ','','Ú©Ù„Ù…Û Ø´ÛØ§Ø¯Øª','Ù†Ù…Ø§Ø²','Ø±ÙˆØ²Û','Ø²Ú©ÙˆÙ°Ûƒ','A','Ø§Ø±Ú©Ø§Ù† Ø§Ø³Ù„Ø§Ù…','exercise'),
  mcq('ss_isl5','Ù†Ù…Ø§Ø² Ø¯Ù† Ù…ÛŒÚº Ú©ØªÙ†ÛŒ Ø¨Ø§Ø± Ù¾Ú‘Ú¾ÛŒ Ø¬Ø§ØªÛŒ ÛÛ’ØŸ','','Ù¾Ø§Ù†Ú†','ØªÛŒÙ†','Ú†Ø§Ø±','Ú†Ú¾','A','Ø¹Ø¨Ø§Ø¯Ø§Øª','exercise'),
  mcq('ss_isl5','Ø±Ù…Ø¶Ø§Ù† Ø§Ù„Ù…Ø¨Ø§Ø±Ú© Ø³Ø§Ù„ Ú©Ø§ Ú©ÙˆÙ† Ø³Ø§ Ù…ÛÛŒÙ†Û ÛÛ’ØŸ','','Ù†ÙˆØ§Úº','Ø¢Ù¹Ú¾ÙˆØ§Úº','Ø¯Ø³ÙˆØ§Úº','Ø³Ø§ØªÙˆØ§Úº','A','Ø¹Ø¨Ø§Ø¯Ø§Øª','exercise'),
  mcq('ss_isl5','Ø³Ø¨ Ø³Û’ Ø¢Ø®Ø±ÛŒ Ù†Ø¨ÛŒ Ú©ÙˆÙ† ÛÛŒÚºØŸ','','Ø­Ø¶Ø±Øª Ù…Ø­Ù…Ø¯ ï·º','Ø­Ø¶Ø±Øª Ø¹ÛŒØ³ÛŒÙ° Ø¹Ù„ÛŒÛ Ø§Ù„Ø³Ù„Ø§Ù…','Ø­Ø¶Ø±Øª Ù…ÙˆØ³ÛŒÙ° Ø¹Ù„ÛŒÛ Ø§Ù„Ø³Ù„Ø§Ù…','Ø­Ø¶Ø±Øª Ø§Ø¨Ø±Ø§ÛÛŒÙ… Ø¹Ù„ÛŒÛ Ø§Ù„Ø³Ù„Ø§Ù…','A','Ø³ÛŒØ±Øª Ø§Ù„Ù†Ø¨ÛŒØ','exercise'),
  mcq('ss_isl5','Ù‚Ø±Ø¢Ù† Ù…Ø¬ÛŒØ¯ Ú©ØªÙ†Û’ Ù¾Ø§Ø±ÙˆÚº Ù…ÛŒÚº ØªÙ‚Ø³ÛŒÙ… ÛÛ’ØŸ','','ØªÛŒØ³','Ù¾Ú†ÛŒØ³','Ø¨ÛŒØ³','Ú†Ø§Ù„ÛŒØ³','A','Ù‚Ø±Ø¢Ù†','exercise'),
  short('ss_isl5','Ù†Ù…Ø§Ø² Ú©ÛŒ Ø§ÛÙ…ÛŒØª Ø§ÙˆØ± Ø§Ø³ Ú©Û’ ÙÙˆØ§Ø¦Ø¯ Ú©Û’ Ø¨Ø§Ø±Û’ Ù…ÛŒÚº Ù¾Ø§Ù†Ú† Ø¬Ù…Ù„Û’ Ù„Ú©Ú¾ÛŒÚºÛ”','','Ø¹Ø¨Ø§Ø¯Ø§Øª',2,'exercise'),
  short('ss_isl5','Ø­Ø¶Ø±Øª Ù…Ø­Ù…Ø¯ ï·º Ú©ÛŒ ÙˆÙ„Ø§Ø¯Øª Ú©Ø¨ Ø§ÙˆØ± Ú©ÛØ§Úº ÛÙˆØ¦ÛŒØŸ Ø§Ù† Ú©Û’ ÙˆØ§Ù„Ø¯ÛŒÙ† Ú©Û’ Ù†Ø§Ù… Ù„Ú©Ú¾ÛŒÚºÛ”','','Ø³ÛŒØ±Øª Ø§Ù„Ù†Ø¨ÛŒØ',3,'exercise'),
  long('ss_isl5','Ø§Ø³Ù„Ø§Ù… Ú©Û’ Ù¾Ø§Ù†Ú† Ø§Ø±Ú©Ø§Ù† ØªÙØµÛŒÙ„ Ø³Û’ Ù„Ú©Ú¾ÛŒÚºÛ” ÛØ± Ø±Ú©Ù† Ú©Ø§ Ù…Ù‚ØµØ¯ Ø§ÙˆØ± Ø§ÛÙ…ÛŒØª Ø¨ÛŒØ§Ù† Ú©Ø±ÛŒÚºÛ”','','Ø§Ø±Ú©Ø§Ù† Ø§Ø³Ù„Ø§Ù…',5,'exercise'),
]

