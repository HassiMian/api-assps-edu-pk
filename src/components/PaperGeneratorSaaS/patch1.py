import re

file_path = r'c:\projects\My SAas\super-app\src\components\PaperGeneratorSaaS\DailyDiaryFeature.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update StyleSettings type
content = re.sub(
    r'type StyleSettings = \{[\s\S]*?\};',
    '''type StyleSettings = {
  radius: number;
  headerFontSize: number;
  bodyFontSize: number;
  fontFamily: string;
  bodyLineHeight: number;
  bodyWordSpacing: number;
  headerLetterSpacing: number;
  showWatermark: boolean;
};''',
    content
)

# 2. Update defaultRows to not hardcode fontSize globally
content = re.sub(
    r'const defaultRows: SubjectRow\[\] = \[([\s\S]*?)\];',
    '''const defaultRows: SubjectRow[] = [
  { id: 'eng', subject: 'ENGLISH', diary: 'Page 21 - Reading and writing practice', fontFamily: FONT_OPTIONS[0], textColor: '#1f2937' },
  { id: 'urdu', subject: 'URDU', diary: 'Page 25 - Writing practice', isUrdu: true, fontFamily: URDU_FONT, textColor: '#1f2937' },
  { id: 'math', subject: 'MATH', diary: 'Count and draw 5 medals', fontFamily: FONT_OPTIONS[0], textColor: '#1f2937' },
  { id: 'gk', subject: 'G.K.', diary: 'Write 4 lines about myself', fontFamily: FONT_OPTIONS[0], textColor: '#1f2937' },
];''',
    content
)

# 3. Update renderSlipMarkup arguments
content = re.sub(
    r'function renderSlipMarkup\(\{\s*template,[^}]*showWatermark,\s*\}\s*:\s*\{[\s\S]*?showWatermark:\s*boolean;\s*\}\)',
    '''function renderSlipMarkup({
  template,
  schoolName,
  tagline,
  logoUrl,
  classLabel,
  date,
  rows,
  footerText,
  footerIsUrdu,
  slipsPerPage,
  fontFamily,
  radius,
  headerFontSize,
  bodyFontSize,
  bodyLineHeight,
  bodyWordSpacing,
  headerLetterSpacing,
  textColor,
  showWatermark,
}: {
  template: Template;
  schoolName: string;
  tagline: string;
  logoUrl: string;
  classLabel: string;
  date: string;
  rows: SubjectRow[];
  footerText: string;
  footerIsUrdu: boolean;
  slipsPerPage: number;
  fontFamily: string;
  radius: number;
  headerFontSize: number;
  bodyFontSize: number;
  bodyLineHeight: number;
  bodyWordSpacing: number;
  headerLetterSpacing: number;
  textColor: string;
  showWatermark: boolean;
})''',
    content
)

# Inside renderSlipMarkup, update variables
content = re.sub(
    r'const rowFontSize = row\.fontSize \|\| fontSize;\s*const rowLineHeight = row\.lineHeight \|\| lineHeight;',
    '''const rowFontSize = row.fontSize ? `${row.fontSize}px` : 'var(--diary-body-font-size)';
      const rowLineHeight = row.lineHeight || 'var(--diary-body-line-height)';''',
    content
)

# Replace the inner html return in renderSlipMarkup
content = re.sub(
    r'return `<div class="diary-card template-\$\{template\.headerStyle \|\| \'classic\'\}\$\{slipDensityClass\(slipsPerPage\)\}" style="border-radius:\$\{radius\}px;font-size:\$\{fontSize\}px;line-height:\$\{lineHeight\};word-spacing:\$\{wordSpacing\}px;letter-spacing:\$\{letterSpacing\}px;font-family:\$\{fontFamily\};--accent:\$\{template\.accent \|\| template\.head\}">[\s\S]*?</div>`;',
    '''return `<div class="diary-card template-${template.headerStyle || 'classic'}${slipDensityClass(slipsPerPage)}" style="border-radius:${radius}px;font-family:${fontFamily};--diary-header-font-size:${headerFontSize}px;--diary-body-font-size:${bodyFontSize}px;--diary-body-line-height:${bodyLineHeight};--diary-body-word-spacing:${bodyWordSpacing}px;--diary-header-letter-spacing:${headerLetterSpacing}px;--accent:${template.accent || template.head}">
    <div class="hero" style="background:${template.hero};letter-spacing:var(--diary-header-letter-spacing)">
      ${template.motif ? `<div class="motif-badge">${escapeHtml(template.motif)}</div>` : ''}
      <div class="logo-box">${logoUrl ? `<img src="${escapeHtml(logoUrl)}" alt="School logo" />` : '<span>ASS</span>'}</div>
      <div class="school-info">
        <div class="school-name" style="font-size:var(--diary-header-font-size)">${escapeHtml(schoolName)}</div>
        <div class="tagline">${escapeHtml(tagline)}</div>
      </div>
      <div class="date-box"><b>${escapeHtml(formatDateLabel(date))}</b><span>CLASS: ${escapeHtml(classLabel)}</span></div>
    </div>
    <div class="diary-table">
      <div class="table-head">
        <div style="background:${template.head}">SUBJECT</div>
        <div style="background:${template.head}">HOME TASK / DIARY</div>
      </div>
      ${rowMarkup}
    </div>
    <div class="${footerIsUrdu ? 'footer-note urdu-text' : 'footer-note'}" style="background:${template.footer}">${escapeHtml(footerText)}</div>
    ${showWatermark ? '<div class="watermark">ASS</div>' : ''}
  </div>`;''',
    content
)

# Fix subject-pill and task-pill in renderSlipMarkup string
content = re.sub(
    r'<div class="subject-pill" style="([^"]*?)font-size:\$\{fontSize\}px;line-height:\$\{lineHeight\}">',
    r'<div class="subject-pill" style="\1font-size:var(--diary-body-font-size);line-height:var(--diary-body-line-height);word-spacing:var(--diary-body-word-spacing)">',
    content
)
content = re.sub(
    r'<div class="\$\{row\.isUrdu \? \'task-pill urdu-text\' : \'task-pill\'\}" style="([^"]*?)font-size:\$\{rowFontSize\}px;line-height:\$\{rowLineHeight\}">',
    r'<div class="${row.isUrdu ? \'task-pill urdu-text\' : \'task-pill\'}" style="\1font-size:${rowFontSize};line-height:${rowLineHeight};word-spacing:var(--diary-body-word-spacing)">',
    content
)

# 4. DiarySlip component update
content = re.sub(
    r'function DiarySlip\(\{[\s\S]*?showWatermark,\s*\}\s*:\s*\{[\s\S]*?showWatermark:\s*boolean;\s*\}\)',
    '''function DiarySlip({
  template,
  schoolName,
  tagline,
  logoUrl,
  classLabel,
  date,
  rows,
  footerText,
  footerIsUrdu,
  slipsPerPage,
  fontFamily,
  radius,
  headerFontSize,
  bodyFontSize,
  bodyLineHeight,
  bodyWordSpacing,
  headerLetterSpacing,
  textColor,
  showWatermark,
}: {
  template: Template;
  schoolName: string;
  tagline: string;
  logoUrl: string;
  classLabel: string;
  date: string;
  rows: SubjectRow[];
  footerText: string;
  footerIsUrdu: boolean;
  slipsPerPage: number;
  fontFamily: string;
  radius: number;
  headerFontSize: number;
  bodyFontSize: number;
  bodyLineHeight: number;
  bodyWordSpacing: number;
  headerLetterSpacing: number;
  textColor: string;
  showWatermark: boolean;
})''',
    content
)

content = re.sub(
    r'<div\s+className={`diary-card template-\$\{template\.headerStyle \|\| \'classic\'\}\$\{slipDensityClass\(slipsPerPage\)\}`}\s+style=\{\{[\s\S]*?\[\'--accent\'\s*as\s*string\]:\s*template\.accent\s*\|\|\s*template\.head,\s*\}\}',
    '''<div
      className={`diary-card template-${template.headerStyle || 'classic'}${slipDensityClass(slipsPerPage)}`}
      style={{
        borderRadius: radius,
        fontFamily,
        ['--diary-header-font-size' as string]: `${headerFontSize}px`,
        ['--diary-body-font-size' as string]: `${bodyFontSize}px`,
        ['--diary-body-line-height' as string]: bodyLineHeight,
        ['--diary-body-word-spacing' as string]: `${bodyWordSpacing}px`,
        ['--diary-header-letter-spacing' as string]: `${headerLetterSpacing}px`,
        ['--accent' as string]: template.accent || template.head,
      }}''',
    content
)

# DiarySlip inner divs
content = re.sub(
    r'<div className="hero" style=\{\{ background: template\.hero \}\}>',
    r'<div className="hero" style={{ background: template.hero, letterSpacing: "var(--diary-header-letter-spacing)" }}>',
    content
)
content = re.sub(
    r'<div className="school-name">\{schoolName\}</div>',
    r'<div className="school-name" style={{ fontSize: "var(--diary-header-font-size)" }}>{schoolName}</div>',
    content
)

content = re.sub(
    r'<div\s+className="subject-pill"\s+style=\{\{\s*background: index % 2 \? template\.even : \'#ffffff\',\s*fontFamily,\s*fontSize: `\$\{fontSize\}px`,\s*lineHeight,\s*color: row\.textColor \|\| textColor,\s*\}\}',
    '''<div
              className="subject-pill"
              style={{
                background: index % 2 ? template.even : '#ffffff',
                fontFamily,
                fontSize: 'var(--diary-body-font-size)',
                lineHeight: 'var(--diary-body-line-height)',
                wordSpacing: 'var(--diary-body-word-spacing)',
                color: row.textColor || textColor,
              }}''',
    content
)

content = re.sub(
    r'<div\s+className=\{row\.isUrdu \? \'task-pill urdu-text\' : \'task-pill\'\}\s+style=\{\{\s*background: index % 2 \? template\.even : \'#ffffff\',\s*fontFamily: row\.fontFamily \|\| fontFamily,\s*fontSize: `\$\{row\.fontSize \|\| fontSize\}px`,\s*lineHeight: row\.lineHeight \|\| lineHeight,\s*color: row\.textColor \|\| textColor,\s*\}\}',
    '''<div
              className={row.isUrdu ? 'task-pill urdu-text' : 'task-pill'}
              style={{
                background: index % 2 ? template.even : '#ffffff',
                fontFamily: row.fontFamily || fontFamily,
                fontSize: row.fontSize ? `${row.fontSize}px` : 'var(--diary-body-font-size)',
                lineHeight: row.lineHeight || 'var(--diary-body-line-height)',
                wordSpacing: 'var(--diary-body-word-spacing)',
                color: row.textColor || textColor,
              }}''',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Phase 1 done')
