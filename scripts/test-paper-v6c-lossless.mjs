import test from 'node:test'
import assert from 'node:assert/strict'
import {classifyLegacyEditablePaper,legacyPaperToWorkingDocument,applyLegacyWorkingDocument} from '../src/components/PaperGeneratorSaaS/editor/losslessLegacyBridge.mjs'

function fixture(){return {
  name:'Test Papier',documentFormat:'pts-native-v13',schemaVersion:1,
  config:{classLevel:'Seven',className:'Seven',section:'A',subject:'Science',subjectName:'Science',language:'dual',targetMarks:50},
  manualPreviewSettings:{schoolName:'AL SIDDIQUE SCHOLARS PUBLIC SCHOOL',address:'Rayya Khas'},
  numberedQuestionTypes:[
    {value:'mcq',questionNo:1,label:'MCQs',labelUrdu:'معروضی سوالات',marks:1,layout:'table'},
    {value:'short',questionNo:2,label:'Short Questions',marks:2,layout:'two-column'},
    {value:'long',questionNo:3,label:'Long Questions',marks:5,layout:'block'},
  ],
  mcq_marks:1,short_marks:2,long_marks:5,
  mcq:[
    {id:'mcq1',en:'Who? & why?',ur:'سوال نمبر ایک؟',answer:'B',options:[{id:'a',label:'A',text:'first'},{id:'b',label:'B',text:'second'}],bankRevision:4},
    {id:'mcq2',text:'Another question?',textUrdu:'دوسرا سوال؟',answer:'A',options:[{id:'a2',label:'A',text:'واحد'}],sourceLedger:{hash:'important'},marks:1},
  ],
  short:[
    {id:'s1',en:'Name the process',ur:'عمل کا نام لکھیں',answer:'Photosynthesis',answerLines:2},
    {id:'s2',en:'Explain once',ur:'وضاحت کریں۔',answer:'second',answerLines:3,extensions:{verified:true}},
    {id:'s3',en:'Third line',ur:'تیسری سطر',answer:'third',answerLines:2},
  ],
  long:[{id:'l1',en:'Describe?',ur:'بیان کریں۔',answer:'Detailed',marks:5,markingNotes:'rubric 2026'}],
  official_section:[{id:'legacy',title:'سیکشن الف',unknown:{spacing:'1.3'}}],
  selectedQuestions:{official_section:{questions:[],marks:0}},
  privateUnknown:{nested:['keep',42],extra:true},
}}

test('all six questions are represented, not merely first question per type',()=>{
 const doc=legacyPaperToWorkingDocument(fixture())
 assert.equal(doc.blocks.length,6)
 assert.deepEqual(doc.blocks.map(x=>x.id),['mcq::0','mcq::1','short::0','short::1','short::2','long::0'])
 assert.equal(doc.authority,'LEGACY_COMPATIBILITY_ONLY')
 assert.equal(doc.canonicalWriteAllowed,false)
 assert.equal(doc.printApproved,false)
})

test('no-op round trip is lossless for Urdu, options, metadata, provenance and unknown fields',()=>{
 const input=fixture(),original=JSON.stringify(input)
 const doc=legacyPaperToWorkingDocument(input)
 const restored=applyLegacyWorkingDocument(doc,input)
 assert.deepEqual(restored,input)
 assert.equal(JSON.stringify(input),original)
})

test('edit a second MCQ without clobbering first or options/answer/source revision',()=>{
 const source=fixture(),doc=legacyPaperToWorkingDocument(source)
 const edited=structuredClone(doc)
 edited.blocks[1].contentHtml='<p>Changed second &amp; improved?</p>'
 edited.blocks[1].contentUrduHtml='<p>درست سوال نمبر دو؟</p>'
 const result=applyLegacyWorkingDocument(edited,source)
 assert.equal(result.mcq[1].text,'Changed second & improved?')
 assert.equal(result.mcq[1].textUrdu,'درست سوال نمبر دو؟')
 assert.deepEqual(result.mcq[0],source.mcq[0])
 assert.deepEqual(result.mcq[1].options,source.mcq[1].options)
 assert.deepEqual(result.mcq[1].sourceLedger,source.mcq[1].sourceLedger)
 assert.deepEqual(result.short,source.short)
 assert.deepEqual(result.privateUnknown,source.privateUnknown)
})

test('per-item marks can change only if marks are represented per-item in source',()=>{
 const source=fixture(),doc=legacyPaperToWorkingDocument(source),edited=structuredClone(doc)
 edited.blocks[1].marks=2
 const result=applyLegacyWorkingDocument(edited,source)
 assert.equal(result.mcq[1].marks,2)
 assert.equal(result.mcq_marks,1)
 assert.equal(result.mcq[0].marks,undefined)
 const unsafe=structuredClone(doc);unsafe.blocks[2].marks=4
 assert.throws(()=>applyLegacyWorkingDocument(unsafe,source),/shared category marks/)
})

test('single-item long type marks and title remain compatible with legacy engine',()=>{
 const source=fixture(),doc=legacyPaperToWorkingDocument(source),edited=structuredClone(doc)
 edited.blocks.at(-1).marks=6
 edited.blocks.at(-1).label='Essay question'
 const result=applyLegacyWorkingDocument(edited,source)
 assert.equal(result.long[0].marks,6)
 assert.equal(result.numberedQuestionTypes[2].label,'Essay question')
 assert.equal(source.numberedQuestionTypes[2].label,'Long Questions')
})

test('reordering, dropping or fabricating blocks is fail-closed',()=>{
 const source=fixture(),doc=legacyPaperToWorkingDocument(source)
 const omit=structuredClone(doc);omit.blocks.pop();assert.throws(()=>applyLegacyWorkingDocument(omit,source),/added\/removed/)
 const duplicate=structuredClone(doc);duplicate.blocks[1].id=duplicate.blocks[0].id;assert.throws(()=>applyLegacyWorkingDocument(duplicate,source),/reordering/)
 const reorder=structuredClone(doc);[reorder.blocks[0],reorder.blocks[1]]=[reorder.blocks[1],reorder.blocks[0]];assert.throws(()=>applyLegacyWorkingDocument(reorder,source),/reordering/)
 const hijack=structuredClone(doc);hijack.blocks[0].sourceType='short';assert.throws(()=>applyLegacyWorkingDocument(hijack,source),/protected source binding/)
 const incomplete=structuredClone(doc);delete incomplete.blocks[0].contentUrduHtml;assert.throws(()=>applyLegacyWorkingDocument(incomplete,source),/missing editable field/)
 const metadata=structuredClone(doc);metadata.meta.classLevel='Nine';assert.throws(()=>applyLegacyWorkingDocument(metadata,source),/metadata and institution/)
})

test('unsupported specialist and official document families are NOT silently flattened',()=>{
 for(const source of [null,[],{format:'assps-canonical-paper',numberedQuestionTypes:[]},{format:'assps-new-authoring-paper',numberedQuestionTypes:[]},{numberedQuestionTypes:[{value:'mcq'},{value:'mcq'}],mcq:[]},{documentFormat:'canonical-v2',numberedQuestionTypes:[]},{numberedQuestionTypes:[{value:'mcq'}]}]){
   assert.equal(classifyLegacyEditablePaper(source).compatible,false)
   assert.throws(()=>legacyPaperToWorkingDocument(source),/V6-C legacy bridge refused/)
 }
})
