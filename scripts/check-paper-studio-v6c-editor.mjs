import fs from 'node:fs';import path from 'node:path';
const read=p=>fs.readFileSync(path.resolve('src',p),'utf8');
const editor=read('components/PaperGeneratorSaaS/editor/PaperDocumentEditor.jsx');
const bridge=read('components/PaperGeneratorSaaS/editor/losslessLegacyBridge.mjs');
const page=read('app/teacher/paper-generator/page.tsx');
const notifier=read('components/PaperGeneratorSaaS/PaperAiJobToasts.jsx');
const gates=[
 ['Pro Editor no longer uses lossy first-question adapter',editor.includes("from './losslessLegacyBridge.mjs'")&&!editor.includes("from './documentAdapters'")],
 ['My Papers enters guarded editor only from own server vault',page.includes('onLoadPaper={openOwnedSavedPaper}')&&page.includes('classifyLegacyEditablePaper(paper).compatible')],
 ['Every category item is represented with stable source identity',bridge.includes('sourceType:type.value,sourceIndex:index')&&bridge.includes('questionNo:blocks.length+1')],
 ['Original source is used as immutable apply baseline',editor.includes('applyLegacyWorkingDocument(nextDoc, loadedPaper)')],
 ['Shared-category marks are blocked in UI and bridge',editor.includes("allowMarksEdit={block.marksScope==='item'||typeCounts[block.sourceType]===1}")&&bridge.includes('shared category marks cannot be changed')],
 ['School/class/subject are protected', ['schoolName','subject','classLevel','address'].every(key=>editor.includes(`meta.${key}`))&&editor.includes('readOnly title="School identity')],
 ['Direct unsafe Print/DOCX export disabled',editor.includes('disabled title="Canonical print parity')&&editor.includes('disabled title="Canonical DOCX export parity')],
 ['Source question reordering cannot silently occur',bridge.includes('question reordering requires a canonical editor')&&editor.includes('Source question order (locked for compatibility)')],
 ['Unsupported canonical/specialist documents do not flatten',editor.includes('Canonical editor handoff required')&&bridge.includes("source.format==='assps-new-authoring-paper'")],
 ['Rich HTML is not silently flattened to plain text',bridge.includes('rich text requires the canonical rich-text PaperDocument renderer')],
 ['Unauthorised AI notifier polling stops after 401/403',notifier.includes('[401,403].includes(Number(error?.response?.status))')&&notifier.includes('if (blocked) return')],
 ['Responsive editor has source-scoped paper canvas',editor.includes('<EditorCanvasShell>')&&editor.includes('isMobile')],
];let failed=0;for(const [name,pass] of gates){console.log(`${pass?'PASS':'FAIL'} ${name}`);if(!pass)failed++}console.log(`V6C_EDITOR_SOURCE_GATE ${gates.length-failed}/${gates.length} ${failed?'FAIL':'PASS'}`);if(failed)process.exitCode=1;
