import fs from 'node:fs';import path from 'node:path';
const read=p=>fs.readFileSync(path.resolve(p),'utf8');
const pts=read('src/components/PaperGeneratorSaaS/PTSPaperGenerator.jsx');
const helper=read('src/components/PaperGeneratorSaaS/printDocumentRenderer.mjs');
const prov=read('scripts/write-build-provenance.mjs');
const golden=read('scripts/paper-v6f3-golden-evidence.cjs');
const contract=read('scripts/test-paper-v6f3-print-renderer.mjs');
const page=read('src/app/teacher/paper-generator/page.tsx');
const route=read('src/app/build-provenance/route.ts');
const checks=[
 ['Runtime print calls shared pure helper',pts.includes("import { buildPrintHtml } from './printDocumentRenderer.mjs'")&&pts.includes('doc.write(buildPrintHtml(canvas, {')&&!pts.includes('function buildPrintHtml(canvas')],
 ['Pure helper carries A4/source-native wrapper',helper.includes('buildPrintHtmlFromCanvasHtml')&&helper.includes('@page{size:A4 portrait;margin:4mm}')&&helper.includes('Noto+Nastaliq+Urdu')],
 ['Build provenance attests print helper',prov.includes("'src/components/PaperGeneratorSaaS/printDocumentRenderer.mjs'")&&prov.includes("architectureVersion:'v6-f3-renderer-provenance-3'")],
 ['Public provenance route is outside backend API namespace',route.includes('BUILD_PROVENANCE')&&route.includes('buildId:currentBuildId()')],
 ['Teacher source renderer remains delivery locked',page.includes('<PaperGenerator deliveryLocked={true}')&&pts.includes('Print locked')],
 ['Golden evidence cannot self-approve renderer',golden.includes('approvalClaim:false')&&golden.includes('evidenceOnly:true')&&!golden.includes('PAPER_CANONICAL_RENDERER_PARITY_APPROVED=true')],
 ['Golden evidence covers English Urdu and Dual',golden.includes("id:'english'")&&golden.includes("id:'urdu'")&&golden.includes("id:'dual'")],
 ['Golden evidence consumes shared print helper',golden.includes('buildPrintHtmlFromCanvasHtml')&&golden.includes("${UI}/build-provenance")],
 ['Print helper deterministic contract hash is pinned',contract.includes('d39993fa2e7109c5324faae32d4ac6b9671f40b81338d62d4ce741af8c9980bb')],
];let fail=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)fail++}console.log(`PAPER_V6F3_SOURCE_GATE ${checks.length-fail}/${checks.length} ${fail?'FAIL':'PASS'}`);if(fail)process.exitCode=1;
