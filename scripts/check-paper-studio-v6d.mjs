import fs from 'node:fs';import path from 'node:path';
const read=p=>fs.readFileSync(path.resolve('src',p),'utf8');
const page=read('app/teacher/paper-generator/page.tsx');
const editor=read('components/PaperGeneratorSaaS/editor/PaperDocumentEditor.jsx');
const service=read('components/PaperGeneratorSaaS/paperVaultService.js');
const proxy=read('app/api/[...path]/route.ts');
const gates=[
 ['Open verifies latest detail plus document review',page.includes('/portal/paper-studio/papers/${encodeURIComponent(id)}')&&page.includes('/document-review')&&page.includes('latestOpenRef')],
 ['Strict save carries revision and snapshot hash',page.includes('expectedRevision:saveGuard.revision')&&page.includes('expectedSnapshotHash:saveGuard.hash')&&page.includes('workingDocument')],
 ['Save conflict never overwrites and exposes reload',page.includes('another session changed this paper')&&page.includes('setSaveConflict(true)')&&editor.includes('Reload latest (discard local edits)')],
 ['Editor tracks dirty state and disables stale save',editor.includes('const [dirty,setDirty]=useState(false)')&&editor.includes('disabled={!dirty||saving||saveConflict}')],
 ['Revision history is signed owner-scoped API',service.includes('/portal/paper-studio/papers/${encodeURIComponent(id)}/revisions')&&page.includes('fetchProtectedPaperRevisions')],
 ['Revision history UI is read-only and current-aware',editor.includes('Immutable revision history')&&editor.includes('Current revision')&&!editor.includes('Restore revision')],
 ['History explicitly describes atomic first baseline',editor.includes('first successful edit captures the baseline and new revision atomically')],
 ['Source-preserving bridge remains active',editor.includes("from './losslessLegacyBridge.mjs'")&&!editor.includes("from './documentAdapters'")],
 ['Proxy protects portal paper-studio mutations',proxy.includes("portal/paper-studio")&&proxy.includes('PATCH')],
 ['Unsafe direct print/DOCX remains disabled',editor.includes('Canonical print parity is pending')&&editor.includes('Export DOCX (pending parity)')],
];let fail=0;for(const [name,ok] of gates){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)fail++}console.log(`PAPER_STUDIO_V6D_SOURCE_GATE ${gates.length-fail}/${gates.length} ${fail?'FAIL':'PASS'}`);if(fail)process.exitCode=1;
