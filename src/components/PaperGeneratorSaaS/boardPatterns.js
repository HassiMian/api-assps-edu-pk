// boardPatterns.js
// Punjab Board specific paper pattern templates

export const PUNJAB_BOARD_PATTERNS = {
  '9th_Science': {
    name: '9th Science Subjects (Physics, Chem, Bio, CS)',
    totalMarks: 60,
    mcq: 12,
    short: 15, // Answer 15 out of 24 (grouped in 3 parts of 8, attempt 5 each)
    long: 2,   // Answer 2 out of 3
    mcqM: 1,
    shortM: 2,
    longM: 9,  // Typically 9 marks each (split into a=4, b=5)
  },
  '10th_Science': {
    name: '10th Science Subjects',
    totalMarks: 60,
    mcq: 12,
    short: 15,
    long: 2,
    mcqM: 1,
    shortM: 2,
    longM: 9,
  },
  '9th_Maths': {
    name: '9th Mathematics',
    totalMarks: 75,
    mcq: 15,
    short: 18, // Answer 18 out of 27
    long: 3,   // Answer 3 out of 5 (Q9 is compulsory theorem)
    mcqM: 1,
    shortM: 2,
    longM: 8,
  },
  '10th_Maths': {
    name: '10th Mathematics',
    totalMarks: 75,
    mcq: 15,
    short: 18,
    long: 3,
    mcqM: 1,
    shortM: 2,
    longM: 8,
  },
  'Pak_Studies': {
    name: 'Pak Studies (9th/10th)',
    totalMarks: 50,
    mcq: 10,
    short: 12, // Answer 12 out of 18 (2 parts of 9, attempt 6)
    long: 2,   // Answer 2 out of 3
    mcqM: 1,
    shortM: 2,
    longM: 8,
  },
  'Islamiyat': {
    name: 'Islamiyat Compulsory',
    totalMarks: 50,
    mcq: 10,
    short: 12,
    long: 2,
    mcqM: 1,
    shortM: 2,
    longM: 8,
  }
}
