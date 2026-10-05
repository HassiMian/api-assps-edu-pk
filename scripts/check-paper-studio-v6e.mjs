import fs from 'node:fs';import path from 'node:path';
const read=p=>fs.readFileSync(path.resolve('src',p),'utf8');
const svc=read('components/PaperGeneratorSaaS/paperVaultService.js'),editor=read('components/PaperGeneratorSaaS/editor/PaperDocumentEditor.jsx'),page=read('app/teacher/paper-generator/page.tsx');
const checks=[
 ['Delivery manifest API helper exists and sends revision+snapshot hash',svc.includes('fetchPaperDeliveryManifest')&&svc.includes('revision,')&&svc.includes('snapshotHash,')&&svc.includes('/delivery-manifest')],
 ['Editor receives immutable delivery guard',editor.includes('deliveryRevision = null')&&editor.includes("deliverySnapshotHash = ''")],
 ['Delivery Center is contextual inside editor',editor.includes('Revision-bound Delivery Center')&&editor.includes('toggleDelivery')&&editor.includes('aria-label="Revision delivery center"')],
 ['Manifest is reloaded when revision guard changes',editor.includes('[deliveryRevision, deliverySnapshotHash, loadedPaper?.id]')],
 ['Print PDF Word Online Test states are shown without enabling blocked actions',['Preview','Print','PDF','Word','Online Test'].every(x=>editor.includes(`'${x}'`))&&editor.includes("channel.state")],
 ['UI explicitly disclaims print/publish authority',editor.includes('does not grant canonical print or publish authority')],
 ['Parent passes live V6-D revision and hash',page.includes('deliveryRevision={saveGuard?.revision??null}')&&page.includes("deliverySnapshotHash={saveGuard?.hash??''}")],
 ['Four primary workspace architecture remains intact',['Studio Home','Create Paper','Question Bank','My Papers'].every(x=>page.includes(x))],
 ['Legacy direct print remains disabled',editor.includes('Canonical print parity is pending')&&editor.includes('<button type="button" disabled title="Canonical print parity is pending')],
 ['Legacy DOCX remains disabled pending renderer parity',editor.includes('Export DOCX (pending parity)')],
];let fail=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)fail++}console.log(`PAPER_STUDIO_V6E_SOURCE_GATE ${checks.length-fail}/${checks.length} ${fail?'FAIL':'PASS'}`);if(fail)process.exitCode=1;
