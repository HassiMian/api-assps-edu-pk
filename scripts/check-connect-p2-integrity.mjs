/* Source regression checks for family/student data trust and unavailable integrations. */
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('src');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const finance=read('app/parent/finance/page.tsx');
const reports=read('app/parent/reports/page.tsx');
const exams=read('app/student/exams/page.tsx');
const quiz=read('app/student/quiz/page.tsx');
const homework=read('app/student/homework/page.tsx');
const examService=read('lib/onlineExamService.ts');
const checks=[
 ['Parent fee data consumes the unwrapped hook array', finance.includes('Array.isArray(feePayload)') && !finance.includes('feesData?.data || EMPTY_FEES')],
 ['Unconfigured payment UI cannot submit screenshots', !finance.includes('handleSubmit') && !finance.includes('upload-proof') && finance.includes('not configured yet')],
 ['Parent finance separates loading, errors and empty state', finance.includes('DataError') && finance.includes('DataEmpty') && finance.includes('!validShape')],
 ['Parent reports never fabricate zero attendance without saved records', reports.includes('recordedCount>0') && !reports.includes('Number(stats.attPct || 0)')],
 ['Parent result inbox failure has distinct error state', reports.includes('setNoticeError') && reports.includes('DataError')],
 ['Student exams do not invent a 30-minute fallback', !exams.includes('exam.duration || 30') && exams.includes('See exam instructions')],
 ['Student available-exam API validates success and shape', examService.includes('!res.data?.success') && examService.includes('Array.isArray(res.data?.data)')],
 ['Missing Student Exams service is explicit, not empty exams', examService.includes('Online exam publishing is not yet connected')],
 ['Student Homework contains no fake assignments or delayed bot', !homework.includes('setTimeout') && !homework.includes('ASSIGNMENTS:') && !homework.includes('handleSend')],
 ['Student quiz uses only approved-question availability language', quiz.includes('approved') && quiz.includes('Question Bank') && !quiz.includes('onClick={undefined}')],
 ['All five module screens use shared architecture', ['parent/finance','parent/reports','student/exams','student/quiz','student/homework'].every(p=>read(`app/${p}/page.tsx`).includes('PortalModuleHeading'))],
];
let fail=0;for(const [label,okay] of checks){console.log(`${okay?'PASS':'FAIL'} ${label}`);if(!okay)fail++}console.log(`P2_INTEGRITY_GATE ${checks.length-fail}/${checks.length} ${fail?'FAILED':'PASS'}`);if(fail)process.exitCode=1;
