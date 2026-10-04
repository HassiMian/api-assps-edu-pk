/* Source-level regression gate for known operational UI trust failures.
 * This complements, rather than replaces, API/integration and browser checks. */
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('src/app');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const students=read('admin/students/page.tsx');
const users=read('admin/users/page.tsx');
const finance=read('admin/finance/page.tsx');
const attendance=read('teacher/attendance/page.tsx');
const assessments=read('teacher/assessments/page.tsx');
const checks=[
 ['Student writes require server success', students.includes('if (!res.data?.success) throw new Error') && students.includes('await fetchStudents();')],
 ['No fabricated student IDs/attendance fallbacks', !students.includes('Date.now().toString()') && !students.includes('attendance: 100')],
 ['Finance missing API responses cannot silently become empty data',finance.includes('Promise.allSettled') && finance.includes('setProofReady(false)') && finance.includes('setFeeReady(false)') && !finance.includes(".catch(() => ({ data: { data: [] } }))")],
 ['Finance totals hide unavailable responses',finance.includes("proofReady?submissions.length:'—'") && finance.includes("feeReady?feeStats.paid.toLocaleString():'—'")],
 ['Admin Users directory search is controlled and functional',users.includes('matchingUsers.map((u)') && users.includes('value={search}') && users.includes('setSearch(e.target.value)')],
 ['No placeholder clickable access buttons',!users.includes('onClick={undefined}')],
 ['Teacher attendance uses Pakistan school-local date',attendance.includes("import { schoolDateISO }") && attendance.includes('const date = schoolDateISO()') && !attendance.includes("new Date().toISOString().split('T')[0]")],
 ['Teacher attendance marking is screen-reader discernible', (attendance.match(/aria-pressed=\{/g)||[]).length===6],
 ['Assessment requires assigned class and confirmed result save',assessments.includes('!selectedClass ? []') && assessments.includes('if (!saveResponse.data?.success)') && assessments.includes('start_date: schoolDateISO()')],
 ['Reusable accessible operational headings implemented', ['admin/users','admin/students','admin/finance','teacher/attendance','teacher/assessments'].every(r=>read(`${r}/page.tsx`).includes('PortalModuleHeading'))],
];
let failed=0;
for(const [label,passed] of checks){console.log(`${passed?'PASS':'FAIL'} ${label}`);if(!passed)failed++;}
console.log(`P1_INTEGRITY_GATE ${checks.length-failed}/${checks.length} ${failed?'FAILED':'PASS'}`);
if(failed)process.exitCode=1;
