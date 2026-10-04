/* Focused P3 trust regression: faculty assignments, schedule and report cards. */
import fs from 'node:fs';import path from 'node:path';
const read=p=>fs.readFileSync(path.resolve('src/app',p,'page.tsx'),'utf8');
const teachers=read('admin/teachers'),classes=read('teacher/classes'),reports=read('teacher/assessments/report-cards');
const checks=[
 ['Teacher assignments do not silently fall back to fake empty data', teachers.includes('Promise.allSettled')&&!teachers.includes(".catch(() => ({ data: { data: [] } }))")],
 ['Unverified teacher assignments block writes', teachers.includes('assignmentLoadError')&&teachers.includes('if(assignmentLoadError)')],
 ['Assignment add/remove requires backend success', teachers.includes('if(!assignmentResponse.data?.success)')&&teachers.includes('if(!result.data?.success)')],
 ['Teacher delete does not remove row without server confirmation', teachers.includes('if(!deleted.data?.success)')&&!teachers.includes('setTeachers(prev => prev.filter(t => t.id !== id))')],
 ['Teacher online class scheduling requires backend success',classes.includes('if(!response.data?.success)')],
 ['Teacher scheduling uses school-local day',classes.includes('class_date: schoolDateISO()')],
 ['Live class API failure is visible, not zero',classes.includes('classesError')&&classes.includes('onlineError')&&classes.includes('timetableError')],
 ['Report-card requests validate server response and array',reports.includes('if(!res.data?.success||!Array.isArray(res.data?.data))')],
 ['Report card load error differs from legitimate no results',reports.includes('setResultsError')&&reports.includes('rosterError')],
 ['Print available only for verified saved results',reports.includes('if(resultsLoading||resultsError||!results.length)return')],
 ['Three modules use architectural heading', ['PortalModuleHeading'].every(s=>[teachers,classes,reports].every(x=>x.includes(s)))],
];let failures=0;for(const [title,pass] of checks){console.log(`${pass?'PASS':'FAIL'} ${title}`);if(!pass)failures++}console.log(`P3_INTEGRITY_GATE ${checks.length-failures}/${checks.length} ${failures?'FAILED':'PASS'}`);if(failures)process.exitCode=1;
