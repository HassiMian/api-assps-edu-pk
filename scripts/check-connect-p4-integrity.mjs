import fs from 'node:fs';import path from 'node:path';
const get=p=>fs.readFileSync(path.resolve('src/app/admin',p,'page.tsx'),'utf8');
const staff=get('employees'),notices=get('announcements'),settings=get('saas');
const checks=[
 ['Employee list validates success and array',staff.includes('res.data?.success && Array.isArray(res.data?.data)')],
 ['Employee delete requires explicit success',staff.includes('res.data?.success !== true')],
 ['Employee editor uses scoped accessible modal',staff.includes('cw-modal-panel')&&staff.includes('role="dialog"')],
 ['Export is truthfully disabled',staff.includes('Export has not been implemented')&&staff.includes('aria-disabled="true"')],
 ['Notice API error differs from empty list',notices.includes('setAnnouncements([])')&&notices.includes('!loading && !error')],
 ['Notice create/delete server success and refresh',notices.includes('if (!res.data.success)')&&notices.includes('await fetchAnnouncements();')],
 ['Notice modal surfaces server errors',notices.includes('cw-modal-panel')&&notices.includes('cw-error mb-4')],
 ['Setup load is authenticated',settings.includes("api.get('/settings')")&&!settings.includes("api.get('/settings/public'")],
 ['Setup save is persisted and readback verified',settings.includes("api.put('/settings'")&&settings.includes("saved.branding_config")],
 ['Module controls do not fake backend permissions',!settings.includes('toggleModule')&&!settings.includes('setModules(')&&settings.includes('Catalog only')],
 ['Connection status no longer hard-coded',!settings.includes('24ms')&&settings.includes('Not tested')],
 ['Demo review requires backend success',settings.includes('if(!response.data?.success)')&&settings.includes('setDemoError')],
 ['All three screens adopt module headings',[staff,notices,settings].every(s=>s.includes('PortalModuleHeading'))],
];let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++}console.log(`P4_INTEGRITY_GATE ${checks.length-failed}/${checks.length} ${failed?'FAILED':'PASS'}`);if(failed)process.exitCode=1;
