import re

file_path = r'c:\projects\My SAas\super-app\src\components\PaperGeneratorSaaS\DailyDiaryFeature.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update State Hooks
content = re.sub(
    r'const \[fontSize, setFontSize\] = useState\(13\);\s*const \[lineHeight, setLineHeight\] = useState\(1\.45\);\s*const \[wordSpacing, setWordSpacing\] = useState\(0\);\s*const \[letterSpacing, setLetterSpacing\] = useState\(0\);',
    '''const [headerFontSize, setHeaderFontSize] = useState(13);
  const [bodyFontSize, setBodyFontSize] = useState(13);
  const [bodyLineHeight, setBodyLineHeight] = useState(1.45);
  const [bodyWordSpacing, setBodyWordSpacing] = useState(0);
  const [headerLetterSpacing, setHeaderLetterSpacing] = useState(0);''',
    content
)

# 2. Update applyGlobal methods and nudgeRowFontSize
content = re.sub(
    r'function applyGlobalFontSize[\s\S]*?\}',
    '',
    content
)
content = re.sub(
    r'function applyGlobalLineHeight[\s\S]*?\}',
    '',
    content
)

content = re.sub(
    r'\(row\.fontSize \|\| fontSize\)',
    '(row.fontSize || bodyFontSize)',
    content
)
content = re.sub(
    r'\{row\.fontSize \|\| fontSize\}px',
    '{row.fontSize || bodyFontSize}px',
    content
)

content = re.sub(
    r'fontSize: fontSize,',
    'fontSize: bodyFontSize,',
    content
)
content = re.sub(
    r'lineHeight: lineHeight,',
    'lineHeight: bodyLineHeight,',
    content
)
content = re.sub(
    r'fontSize,\s*lineHeight,\s*textColor: \'#1f2937\',',
    "fontSize: bodyFontSize,\n      lineHeight: bodyLineHeight,\n      textColor: '#1f2937',",
    content
)

# 3. Update hydrateDiary
content = re.sub(
    r'if \(style\.fontSize !== undefined\) setFontSize\(Number\(style\.fontSize\)\);\s*if \(style\.fontFamily !== undefined\) setFontFamily\(String\(style\.fontFamily\)\);\s*if \(style\.lineHeight !== undefined\) setLineHeight\(Number\(style\.lineHeight\)\);\s*if \(style\.wordSpacing !== undefined\) setWordSpacing\(Number\(style\.wordSpacing\)\);\s*if \(style\.letterSpacing !== undefined\) setLetterSpacing\(Number\(style\.letterSpacing\)\);',
    '''if (style.fontFamily !== undefined) setFontFamily(String(style.fontFamily));
    
    if (style.headerFontSize !== undefined) setHeaderFontSize(Number(style.headerFontSize));
    else if ((style as any).fontSize !== undefined) setHeaderFontSize(Number((style as any).fontSize));
    
    if (style.bodyFontSize !== undefined) setBodyFontSize(Number(style.bodyFontSize));
    else if ((style as any).fontSize !== undefined) setBodyFontSize(Number((style as any).fontSize));
    
    if (style.bodyLineHeight !== undefined) setBodyLineHeight(Number(style.bodyLineHeight));
    else if ((style as any).lineHeight !== undefined) setBodyLineHeight(Number((style as any).lineHeight));
    
    if (style.bodyWordSpacing !== undefined) setBodyWordSpacing(Number(style.bodyWordSpacing));
    else if ((style as any).wordSpacing !== undefined) setBodyWordSpacing(Number((style as any).wordSpacing));
    
    if (style.headerLetterSpacing !== undefined) setHeaderLetterSpacing(Number(style.headerLetterSpacing));
    else if ((style as any).letterSpacing !== undefined) setHeaderLetterSpacing(Number((style as any).letterSpacing));''',
    content
)

# 4. Update saveDailyDiary
content = re.sub(
    r'radius,\s*fontSize,\s*fontFamily,\s*lineHeight,\s*wordSpacing,\s*letterSpacing,\s*showWatermark,',
    '''radius,
        headerFontSize,
        bodyFontSize,
        fontFamily,
        bodyLineHeight,
        bodyWordSpacing,
        headerLetterSpacing,
        showWatermark,''',
    content
)

# 5. Update handlePrintDiary arguments
content = re.sub(
    r'radius,\s*fontSize,\s*lineHeight,\s*wordSpacing,\s*letterSpacing,\s*textColor:',
    '''radius,
      headerFontSize,
      bodyFontSize,
      bodyLineHeight,
      bodyWordSpacing,
      headerLetterSpacing,
      textColor:''',
    content
)

# 6. Update UI Sliders
content = re.sub(
    r'<div className="slider-grid">[\s\S]*?</label>\s*</div>',
    '''<div className="slider-grid">
              <label>Border Radius<input type="range" min="12" max="34" value={radius} onChange={(e) => setRadius(Number(e.target.value))} /></label>
              <label>Header Font<input type="range" min="10" max="24" value={headerFontSize} onChange={(e) => setHeaderFontSize(Number(e.target.value))} /></label>
              <label>Body Font<input type="range" min="8" max="18" value={bodyFontSize} onChange={(e) => setBodyFontSize(Number(e.target.value))} /></label>
              <label>Body Line Space<input type="range" min="0.9" max="1.7" step="0.02" value={bodyLineHeight} onChange={(e) => setBodyLineHeight(Number(e.target.value))} /></label>
              <label>Body Word Space<input type="range" min="-2" max="8" value={bodyWordSpacing} onChange={(e) => setBodyWordSpacing(Number(e.target.value))} /></label>
              <label>Header Letter Space<input type="range" min="-1" max="5" step="0.1" value={headerLetterSpacing} onChange={(e) => setHeaderLetterSpacing(Number(e.target.value))} /></label>
            </div>''',
    content
)

# 7. Add 14 slips warning
content = re.sub(
    r'(<select value=\{slipsPerPage\} onChange=\{\(e\) => setSlipsPerPage\(Number\(e\.target\.value\)\)\}>[\s\S]*?</select>\s*</label>)',
    r'\1\n              {slipsPerPage >= 14 && rows.length > 4 && (\n                <div className="compose-warning" style={{marginTop: "8px"}}>Content is too large for 14 diaries per page. Reduce font size or select fewer diaries per page.</div>\n              )}',
    content
)

# 8. Update grid row calculation
content = re.sub(
    r'const slips = Array\.from\(\{ length: slipsPerPage \}, \(_, i\) => i\);',
    '''const slips = Array.from({ length: slipsPerPage }, (_, i) => i);
  const cols = 2;
  const gridRows = Math.ceil(slipsPerPage / cols);''',
    content
)

content = re.sub(
    r'grid-template-rows:repeat\(\$\{Math\.ceil\(slipsPerPage / 2\)\}',
    r'grid-template-rows:repeat(${gridRows}',
    content
)

content = re.sub(
    r'gridTemplateRows: `repeat\(\$\{Math\.ceil\(slipsPerPage / 2\)\}',
    r'gridTemplateRows: `repeat(${gridRows}',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Phase 2 done')
