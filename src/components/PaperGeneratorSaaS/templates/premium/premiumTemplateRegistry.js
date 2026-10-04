/**
 * AL SIDDIQUE SCHOLARS — Premium Question Paper Template System
 * Design brief + registry for 10 world-class A4 templates.
 * Replace generic letterheads; palette-based, print-first, B&W safe.
 */

export const SCHOOL_BRAND = {
  name: 'AL SIDDIQUE SCHOLARS PUBLIC SCHOOL',
  address: 'Sharif Chowk, Rayya Khas, Narowal',
  website: 'assps.edu.pk',
  contact: '03XX-XXXXXXX',
  logoPath: '/apex-logo.svg',
  logoFallbackText: 'ASSPS',
}

export const STUDENT_DETAIL_FIELDS = [
  { key: 'studentName', label: 'Student Name', labelUrdu: 'نام' },
  { key: 'fatherName', label: "Father's Name", labelUrdu: 'والد کا نام' },
  { key: 'class', label: 'Class', labelUrdu: 'جماعت' },
  { key: 'section', label: 'Section', labelUrdu: 'سیکشن' },
  { key: 'rollNo', label: 'Roll No.', labelUrdu: 'رول نمبر' },
  { key: 'subject', label: 'Subject', labelUrdu: 'مضمون' },
  { key: 'date', label: 'Date', labelUrdu: 'تاریخ' },
  { key: 'timeAllowed', label: 'Time Allowed', labelUrdu: 'مہلت' },
  { key: 'totalMarks', label: 'Total Marks', labelUrdu: 'کل نمبر' },
  { key: 'obtainedMarks', label: 'Obtained Marks', labelUrdu: 'حاصل شدہ نمبر' },
  { key: 'signature', label: 'Invigilator Signature', labelUrdu: 'دستخط' },
]

export const SAMPLE_SECTIONS = [
  { id: 'a', title: 'SECTION A — OBJECTIVE TYPE', marks: 10, instruction: 'Choose the correct option.', sample: 'Q1. Choose the correct option.' },
  { id: 'b', title: 'SECTION B — SHORT QUESTIONS', marks: 20, instruction: 'Attempt any five questions.', sample: 'Q2. Answer the following short questions.' },
  { id: 'c', title: 'SECTION C — LONG QUESTIONS', marks: 20, instruction: 'Attempt any two questions.', sample: 'Q3. Write detailed answers.' },
]

/** @type {import('./types').PremiumTemplateDef[]} */
export const PREMIUM_TEMPLATES = [
  {
    id: 'premium-01-oxford-minimal',
    code: 'Template 01',
    name: 'The Oxford Minimal Academic',
    palette: { primary: '#1a237e', secondary: '#8892a4', surface: '#ffffff', accent: '#1a237e', text: '#1a1a1a' },
    headerStyle: 'logo-left | name uppercase navy | thin double rule | address row | meta grid 4-col',
    detailLayout: 'horizontal label-value grid, 2 rows × 4 cols',
    dividerStyle: '1px navy full-width + 4px accent left bar on sections',
    questionArea: 'generous whitespace, section title small-caps',
    watermark: { opacity: 0.04, scale: 1.1 },
    fonts: { headline: 'Georgia, serif', body: 'Arial, sans-serif' },
  },
  {
    id: 'premium-02-cambridge-ledger',
    code: 'Template 02',
    name: 'The Cambridge Ledger',
    palette: { primary: '#2c3e50', secondary: '#95a5a6', surface: '#faf9f7', accent: '#b8860b', text: '#1a1a1a' },
    headerStyle: 'logo left | ledger top border 3px charcoal | boxed header frame',
    detailLayout: 'boxed student table with ruled cells, exam title centered band',
    dividerStyle: 'ledger horizontal rules between sections',
    questionArea: 'ruled line hints, structured columns',
    watermark: { opacity: 0.035, scale: 1.0 },
    fonts: { headline: 'Times New Roman, serif', body: 'Arial, sans-serif' },
  },
  {
    id: 'premium-03-scholar-grid',
    code: 'Template 03',
    name: 'The Modern Scholar Grid',
    palette: { primary: '#1e3a5f', secondary: '#94a3b8', surface: '#ffffff', accent: '#3b82f6', text: '#0f172a' },
    headerStyle: 'logo left | micro grid corner marks | clean sans headline',
    detailLayout: 'modular card chips for each field, 3×4 grid',
    dividerStyle: 'dotted coordinate markers at section start',
    questionArea: 'light modular grid fade in margins only',
    watermark: { opacity: 0.03, scale: 1.15 },
    fonts: { headline: 'Inter, Arial, sans-serif', body: 'Arial, sans-serif' },
  },
  {
    id: 'premium-04-royal-crest',
    code: 'Template 04',
    name: 'The Royal Crest Academic',
    palette: { primary: '#0d1b3e', secondary: '#c0c8d8', surface: '#ffffff', accent: '#c8991a', text: '#1a1a1a' },
    headerStyle: 'large logo left | crest balance | gold thin rule under name',
    detailLayout: 'exam title in navy band, details in gold-outlined box',
    dividerStyle: 'gold 0.5px + navy 2px stacked rules',
    questionArea: 'formal spacing, section numbers in accent circle',
    watermark: { opacity: 0.045, scale: 1.2 },
    fonts: { headline: 'Georgia, serif', body: 'Arial, sans-serif' },
  },
  {
    id: 'premium-05-editorial',
    code: 'Template 05',
    name: 'The Editorial Education Paper',
    palette: { primary: '#111827', secondary: '#6b7280', surface: '#fffef9', accent: '#1a237e', text: '#111827' },
    headerStyle: 'asymmetric — logo left, name offset right | editorial masthead',
    detailLayout: 'magazine-style two-column meta, exam title oversized',
    dividerStyle: 'thick-thin editorial rules',
    questionArea: 'wide measure body, section labels left-aligned bold',
    watermark: { opacity: 0.03, scale: 1.0 },
    fonts: { headline: 'Playfair Display, Georgia, serif', body: 'Source Sans Pro, Arial, sans-serif' },
  },
  {
    id: 'premium-06-blueprint',
    code: 'Template 06',
    name: 'The Blueprint Scholar',
    palette: { primary: '#1e40af', secondary: '#93c5fd', surface: '#f8fafc', accent: '#2563eb', text: '#0f172a' },
    headerStyle: 'logo left | pale blue structural frame lines | technical title block',
    detailLayout: 'blueprint table with crosshair corners on detail box',
    dividerStyle: 'pale blue 0.5px grid lines in section headers only',
    questionArea: 'clean white center, blueprint margin ticks',
    watermark: { opacity: 0.025, scale: 1.1 },
    fonts: { headline: 'Arial, sans-serif', body: 'Arial, sans-serif' },
  },
  {
    id: 'premium-07-institutional-seal',
    code: 'Template 07',
    name: 'The Institutional Seal',
    palette: { primary: '#1a1a2e', secondary: '#4a5568', surface: '#ffffff', accent: '#1a237e', text: '#1a1a1a' },
    headerStyle: 'circular seal logo left | official minimal ornaments | strong hierarchy',
    detailLayout: 'administrative form rows with underline fields',
    dividerStyle: 'single hairline + section label in small caps',
    questionArea: 'maximum readability, minimal decoration',
    watermark: { opacity: 0.05, scale: 0.9 },
    fonts: { headline: 'Times New Roman, serif', body: 'Arial, sans-serif' },
  },
  {
    id: 'premium-08-soft-modern',
    code: 'Template 08',
    name: 'The Soft Modern Assessment',
    palette: { primary: '#1e3a5f', secondary: '#e2e8f0', surface: '#ffffff', accent: '#1e3a5f', text: '#334155' },
    headerStyle: 'logo left | soft grey header panel | rounded section chips',
    detailLayout: 'detail chips in light grey panels, 2×5 grid',
    dividerStyle: 'rounded pill section labels on grey strip',
    questionArea: 'friendly spacing, clear question numbers',
    watermark: { opacity: 0.035, scale: 1.0 },
    fonts: { headline: 'Arial, sans-serif', body: 'Arial, sans-serif' },
  },
  {
    id: 'premium-09-prestige',
    code: 'Template 09',
    name: 'The Prestige Examination Sheet',
    palette: { primary: '#0f172a', secondary: '#cbd5e1', surface: '#ffffff', accent: '#c8991a', text: '#0f172a' },
    headerStyle: 'logo left | luxury whitespace | gold/navy hairline separators',
    detailLayout: 'elegant sparse meta, wide gutters',
    dividerStyle: 'gold 1px center ornament between sections',
    questionArea: 'premium whitespace, marks column right-aligned',
    watermark: { opacity: 0.04, scale: 1.05 },
    fonts: { headline: 'Georgia, serif', body: 'Arial, sans-serif' },
  },
  {
    id: 'premium-10-future-academy',
    code: 'Template 10',
    name: 'The Future Academy OS',
    palette: { primary: '#071e34', secondary: '#94a3b8', surface: '#ffffff', accent: '#0a84ff', text: '#1a1a1a' },
    headerStyle: 'logo left | OS-style header bar | subtle icon labels',
    detailLayout: 'data-card exam details, UI-inspired field groups',
    dividerStyle: 'clean 1px border cards per section',
    questionArea: 'digital-school identity, minimal icons for section type',
    watermark: { opacity: 0.03, scale: 1.1 },
    fonts: { headline: 'Inter, Arial, sans-serif', body: 'Arial, sans-serif' },
  },
]

export const PREMIUM_TEMPLATE_MAP = Object.fromEntries(
  PREMIUM_TEMPLATES.map(t => [t.id, t]),
)

/** Mini preview tokens for template picker thumbnails */
export const PREMIUM_THUMB_PRESETS = {
  'premium-01-oxford-minimal': { paper: '#ffffff', header: '#1a237e', accent: '#1a237e', logo: 'left', headerBand: true },
  'premium-02-cambridge-ledger': { paper: '#faf9f7', header: '#2c3e50', accent: '#b8860b', logo: 'left', frame: true, goldRule: true },
  'premium-03-scholar-grid': { paper: '#ffffff', header: '#1e3a5f', accent: '#3b82f6', logo: 'left', grid: true },
  'premium-04-royal-crest': { paper: '#ffffff', header: '#0d1b3e', accent: '#c8991a', logo: 'crest', goldRule: true },
  'premium-05-editorial': { paper: '#fffef9', header: '#111827', accent: '#1a237e', logo: 'left', masthead: true },
  'premium-06-blueprint': { paper: '#f8fafc', header: '#1e40af', accent: '#2563eb', logo: 'left', grid: true, frame: true },
  'premium-07-institutional-seal': { paper: '#ffffff', header: '#1a1a2e', accent: '#1a237e', logo: 'seal', bar: true },
  'premium-08-soft-modern': { paper: '#ffffff', header: '#e2e8f0', accent: '#1e3a5f', logo: 'left', chip: true, headerBand: true },
  'premium-09-prestige': { paper: '#ffffff', header: '#0f172a', accent: '#c8991a', logo: 'left', goldRule: true, chip: true },
  'premium-10-future-academy': { paper: '#ffffff', header: '#071e34', accent: '#0a84ff', logo: 'left', headerBand: true, card: true },
}

/** Shared header height budget — max ~28% of first page */
export const HEADER_CONSTRAINTS = {
  maxHeightMm: 74,
  logoWidthMm: 18,
  logoHeightMm: 18,
  marginMm: { top: 10, right: 12, bottom: 12, left: 12 },
  pageWidthMm: 210,
  pageHeightMm: 297,
}

export const PRINT_RULES = {
  noHeavyGradients: true,
  bwSafe: true,
  minBodyFontPt: 10,
  minContrastRatio: 4.5,
  watermarkMaxOpacity: 0.05,
}
