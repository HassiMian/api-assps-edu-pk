import fs from 'node:fs';
const s=fs.readFileSync('src/app/api/[...path]/route.ts','utf8');
const checks=[
 ['no eager SaaS admin route imports',!/^import .*saas-admin/m.test(s)],
 ['no eager school settings route import',!/^import .*school\/settings/m.test(s)],
 ['school settings loads lazily',s.includes("await import('../school/settings/current/route')")],
 ['subscription list loads lazily',s.includes("await import('../saas-admin/subscription-requests/route')")],
 ['subscription detail loads lazily',s.includes("await import('../saas-admin/subscription-requests/[id]/route')")],
 ['approve/reject load lazily',s.includes("await import('../saas-admin/subscription-requests/[id]/approve/route')")&&s.includes("await import('../saas-admin/subscription-requests/[id]/reject/route')")],
 ['backend proxy path remains unchanged',s.includes("url = `${getBackendApiUrl()}/${targetPath}${searchParams ? `?${searchParams}` : ''}`")],
];let f=0;for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${n}`);if(!ok)f++}console.log(`V6F4_API_PROXY_GATE ${checks.length-f}/${checks.length} ${f?'FAIL':'PASS'}`);if(f)process.exitCode=1;
