import fs from 'node:fs';import path from 'node:path';
const read=p=>fs.readFileSync(path.resolve('src',p),'utf8');
const page=read('app/teacher/paper-generator/page.tsx'),css=read('app/globals.css'),draft=read('components/PaperGeneratorSaaS/paperCreationDraft.js'),pts=read('components/PaperGeneratorSaaS/PTSPaperGenerator.jsx');
const checks=[
 ['Exactly four primary workspaces',['home','create','qbank','papers'].every(x=>page.includes(`id:\"${x}\"`))&&page.includes('WORKSPACES')],
 ['Legacy teaching tools are not Paper Studio destinations',!page.includes('Online Test')&&!page.includes('Notes Maker')&&!page.includes('Daily Diary')&&!page.includes('Lesson Plans')],
 ['Context and own papers use V6 projection facade',page.includes("/portal/paper-studio/context")&&page.includes("/portal/paper-studio/papers")],
 ['Create funnel has canonical source methods',['Blank Paper','Build from Question Bank','Duplicate / Edit My Paper','AI-assisted Draft','Import PDF','Scan Handwritten','Board / Pattern Template'].every(x=>page.includes(x))],
 ['Blank creation remains independent of Question Bank',draft.includes("creationMethod:'blank'")&&!/import .*question/i.test(draft)&&!draft.includes('fetchQuestionsFromServer')],
 ['Teacher assignment absence blocks new creation',page.includes('Teacher assignment required')&&page.includes('disabled={!contextLoading&&!contextError&&!assignments.length}')],
 ['Blank setup only derives class options from assignments',page.includes('const classOptions=assignments.map')&&!page.includes('BASIC_PAPER_CLASS_LEVELS.map')],
 ['My Papers language is own-only',page.includes('Your private teacher vault')&&page.includes("never exposes another teacher's saved-paper library")],
 ['Loaded/blank document does not auto-open legacy question modal',pts.includes('const [modalOpen, setModalOpen] = useState(() => !loadedPaper)')],
 ['V6 responsive workspace styles exist',css.includes('PAPER STUDIO V6')&&css.includes('@media(max-width:760px)')&&css.includes('.ps6-nav')],
 ['SaaS canonical ownership is explicit',page.includes('SaaS is the source of truth')&&page.includes('same academic and paper pipeline')],
];let f=0;for(const [n,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${n}`);if(!ok)f++}console.log(`PAPER_STUDIO_V6_SOURCE_GATE ${checks.length-f}/${checks.length} ${f?'FAIL':'PASS'}`);if(f)process.exitCode=1;
