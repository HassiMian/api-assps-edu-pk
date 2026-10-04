import fs from 'node:fs';import path from 'node:path';
const read=p=>fs.readFileSync(path.resolve('src',p),'utf8');
const admin=read('app/admin/page.tsx'),paper=read('app/teacher/paper-generator/page.tsx'),css=read('app/globals.css'),store=read('components/PaperGeneratorSaaS/usePaperStore.js');
const checks=[
 ['Admin dashboard fetches live dashboard/students/employees/assignments', ['/dashboard/stats','/students?active=true','/employees?active=true','/portal/teacher-assignments'].every(x=>admin.includes(x))],
 ['Admin renders Students Teachers Classes academic directory', ['ACADEMIC DIRECTORY','Active learners','Faculty','Academic groups'].every(x=>admin.includes(x))],
 ['Directory distinguishes unavailable data from verified empty state', admin.includes('directoryError')&&admin.includes('Live ${problems.join')],
 ['Paper Studio is V5 Connect workspace',paper.includes('paper-studio-v4 paper-studio-v5')&&paper.includes('ASSESSMENT WORKSPACE V5')],
 ['Teacher ownership policy is explicit',paper.includes('Private teacher vault')&&paper.includes('Other teachers’ saved papers are neither listed nor editable here.')],
 ['Question Bank assignment scope is explicit',paper.includes('Scoped Question Bank')&&paper.includes('assigned classes and subjects')],
 ['Admin governance remains distinct',paper.includes('Admin governed')&&paper.includes('Admin/Principal')],
 ['ASSPS master brand uses navy silver pearl',css.includes('APEX CONNECT V5 — ASSPS master brand chrome')&&css.includes('--cw-accent:#0B2C4D')&&css.includes('--ps-silver:#bcc7d1')],
 ['Old SaaS paper chrome receives scoped Connect normalization',css.includes('Normalize inherited SaaS module chrome')&&css.includes('.paper-studio-v5 .paper-studio-v4-engine')],
 ['Printable paper surface stays white and independent',css.includes('.paper-studio-v5 .paper-studio-v4-engine .ppe-paper{background:#fff!important;color:#111!important}')],
 ['Saved papers are never persisted into browser store',store.includes('JSON.stringify({ ...data, savedPapers: [] })')],
];let f=0;for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${n}`);if(!ok)f++}console.log(`V5_ACADEMIC_GATE ${checks.length-f}/${checks.length} ${f?'FAIL':'PASS'}`);if(f)process.exitCode=1;
