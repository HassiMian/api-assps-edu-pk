import fs from 'node:fs';import path from 'node:path';
const live='/var/www/apex-connect/src';const read=p=>fs.readFileSync(path.join(live,p),'utf8');
const page=read('app/teacher/paper-generator/page.tsx'),classes=read('app/admin/classes/page.tsx'),vault=read('components/PaperGeneratorSaaS/usePaperStore.js'),service=read('components/PaperGeneratorSaaS/paperVaultService.js'),qbank=read('components/PaperGeneratorSaaS/QuestionBankBrowser.jsx'),css=read('app/globals.css');
const checks=[
 ['Paper Studio V4 uses ASSPS structural shell',page.includes('paper-studio-v4')&&css.includes('--ps-navy:#0b2c4d')&&css.includes('--ps-silver:#c8d2dc')],
 ['Teacher has My Papers not school Saved Papers wording',page.includes('label: "My Papers"')&&!page.includes('label: "Settings"')],
 ['Teacher context consumes assigned classes and scoped students',page.includes('/portal/teaching-options')&&page.includes('/students?active=true')],
 ['Teacher Question Bank management UI is hidden',qbank.includes('Read-only · approved assigned questions')&&qbank.includes('{!isTeacher &&')],
 ['Saved papers are server authoritative',vault.includes('async function savePaper')&&vault.includes('savedPapers: []')&&!vault.includes('mergeVaultPapers(prev.savedPapers')],
 ['Paper vault auth no longer requires localStorage token',!service.includes("localStorage.getItem('token')")&&service.includes("api.get('/paper/vault')")],
 ['Admin Classes is a relational live workspace',classes.includes('/portal/teacher-assignments')&&classes.includes('/students?active=true')&&classes.includes('/employees?active=true')&&classes.includes('STUDENT ROSTER')&&classes.includes('TEACHING TEAM')],
 ['Global structural brand spine is navy/silver/pearl',css.includes('--assps-navy:#0B2C4D')&&css.includes('--assps-silver:#C7D1DB')&&css.includes('--assps-pearl:#F7F9FB')],
 ['Role accents do not own active navigation',css.includes('.cw-shell .tws-nav-active{background:linear-gradient')&&css.includes('color:var(--assps-navy)')],
];let fail=0;for(const [label,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${label}`);if(!ok)fail++}console.log(`PAPER_STUDIO_V4_SOURCE_GATE ${checks.length-fail}/${checks.length} ${fail?'FAILED':'PASS'}`);if(fail)process.exitCode=1;
