"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {useCallback,useEffect,useMemo,useRef,useState,type ComponentType} from "react";
import {
  ArrowRight,BookOpenCheck,BrainCircuit,ChevronRight,FileStack,FileText,
  GraduationCap,LibraryBig,ScanLine,ShieldCheck,Sparkles,Upload,UsersRound,
  WandSparkles,LayoutTemplate,RefreshCw,School,Layers3,
} from "lucide-react";
import dynamic from "next/dynamic";
import {classifyLegacyEditablePaper} from "@/components/PaperGeneratorSaaS/editor/losslessLegacyBridge.mjs";
import PTSPaperGenerator from "@/components/PaperGeneratorSaaS/PTSPaperGenerator";
const ProtectedLegacyEditor:any=dynamic(()=>import("@/components/PaperGeneratorSaaS/editor/PaperDocumentEditor"),{ssr:false});
const PaperGenerator:any=PTSPaperGenerator;
import QuestionBankBrowser from "@/components/PaperGeneratorSaaS/QuestionBankBrowser";
import SavedPapersTab from "@/components/PaperGeneratorSaaS/SavedPapersTab";
import AIGeneratorTab from "@/components/PaperGeneratorSaaS/AIGeneratorTab";
import AIImportTab from "@/components/PaperGeneratorSaaS/AIImportTab";
import HandwrittenScannerTab from "@/components/PaperGeneratorSaaS/HandwrittenScannerTab";
import BoardPaperGenerator from "@/components/PaperGeneratorSaaS/BoardPaperGenerator";
import PaperAiJobToasts from "@/components/PaperGeneratorSaaS/PaperAiJobToasts";
import {createBlankPaperDraft,BASIC_PAPER_CLASS_LEVELS} from "@/components/PaperGeneratorSaaS/paperCreationDraft";
import api from "@/utils/api";
import {fetchProtectedPaperRevisions} from "@/components/PaperGeneratorSaaS/paperVaultService";

type RevisionGuard={revision:number;hash:string};
type Workspace="home"|"create"|"qbank"|"papers";
type CreateSource="start"|"blank"|"bank"|"editor"|"ai"|"import"|"scan"|"board";
type Assignment={className:string;section?:string;subjects:string[]};
type ProjectedPaper={id:string;name:string;className?:string;subjectName?:string;updatedAt?:string};
type WorkspaceNav={id:Workspace;label:string;description:string;icon:ComponentType<{size?:number}>};

const WORKSPACES:WorkspaceNav[]=[
  {id:"home",label:"Studio Home",description:"Your paper work at a glance",icon:Sparkles},
  {id:"create",label:"Create Paper",description:"One canonical authoring flow",icon:FileText},
  {id:"qbank",label:"Question Bank",description:"Approved assigned questions",icon:LibraryBig},
  {id:"papers",label:"My Papers",description:"Only papers created by you",icon:FileStack},
];

const SOURCE_CARDS=[
  {id:"blank",title:"Blank Paper",detail:"Type questions yourself. Question Bank is not required.",tag:"01",icon:FileText},
  {id:"bank",title:"Build from Question Bank",detail:"Select approved questions from your assigned academic scope.",tag:"02",icon:LibraryBig},
  {id:"papers",title:"Duplicate / Edit My Paper",detail:"Reopen or duplicate only papers owned by your account.",tag:"03",icon:FileStack},
  {id:"ai",title:"AI-assisted Draft",detail:"Generate a draft, then review it before it enters the document.",tag:"ASSIST",icon:WandSparkles},
  {id:"import",title:"Import PDF",detail:"Extract candidate questions with review before commit.",tag:"INGEST",icon:Upload},
  {id:"scan",title:"Scan Handwritten",detail:"Convert handwritten source material into reviewable content.",tag:"INGEST",icon:ScanLine},
  {id:"board",title:"Board / Pattern Template",detail:"Apply a paper pattern inside the same authoring pipeline.",tag:"LAYOUT",icon:LayoutTemplate},
] as const;

function BlankSetup({assignments,onBack,onCreate}:{assignments:Assignment[];onBack:()=>void;onCreate:(paper:any)=>void}){
  const [classKey,setClassKey]=useState(""); const [subject,setSubject]=useState("");
  const [title,setTitle]=useState("First Term Examination"); const [language,setLanguage]=useState("english");
  const [marks,setMarks]=useState(""); const [duration,setDuration]=useState("2 Hours"); const [error,setError]=useState("");
  const classOptions=assignments.map(a=>({value:`${a.className}::${a.section||""}`,label:`${a.className}${a.section?` · ${a.section}`:""}`,assignment:a}));
  const selected=classOptions.find(x=>x.value===classKey)?.assignment;
  const subjects=selected?.subjects||[];
  const submit=(e:React.FormEvent)=>{e.preventDefault();setError("");try{if(!selected)throw new Error("Select an assigned class.");if(assignments.length&&subjects.length&&!subjects.some(x=>x.toLowerCase()===subject.trim().toLowerCase()))throw new Error("Select a subject from your assigned teaching scope.");const paper:any=createBlankPaperDraft({classLevel:selected.className,subjectName:subject,title,language,targetMarks:marks,timeAllowed:duration,session:"2026-2027"});paper.config.section=selected.section||"";onCreate(paper)}catch(err:any){setError(err?.message||"Blank paper could not be created.")}};
  return <form className="ps6-setup" onSubmit={submit}>
    <div className="ps6-step-head"><div><span>CREATE PAPER · BLANK</span><h3>Set the paper context first</h3><p>The document starts empty. No synthetic questions are inserted.</p></div><button type="button" onClick={onBack}>Back</button></div>
    <div className="ps6-form-grid">
      <label>Class / Section<select value={classKey} onChange={e=>{setClassKey(e.target.value);setSubject("")}} required><option value="">Select class</option>{classOptions.map(x=><option value={x.value} key={x.value}>{x.label}</option>)}</select></label>
      <label>Subject{subjects.length?<select value={subject} onChange={e=>setSubject(e.target.value)} required><option value="">Select assigned subject</option>{subjects.map(x=><option key={x}>{x}</option>)}</select>:<input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Subject" required/>}</label>
      <label>Paper title<input value={title} onChange={e=>setTitle(e.target.value)} required/></label>
      <label>Language<select value={language} onChange={e=>setLanguage(e.target.value)}><option value="english">English</option><option value="urdu">Urdu</option><option value="dual">Dual / Bilingual</option></select></label>
      <label>Target marks <small>optional</small><input type="number" min="0" value={marks} onChange={e=>setMarks(e.target.value)} placeholder="Set later if blank"/></label>
      <label>Duration<input value={duration} onChange={e=>setDuration(e.target.value)}/></label>
    </div>
    {error&&<div className="cw-error" role="alert">{error}</div>}
    <div className="ps6-form-actions"><button className="ps6-primary" type="submit">Open empty PaperDocument <ArrowRight size={15}/></button></div>
  </form>
}

export default function TeacherPaperGenerator(){
  const [workspace,setWorkspace]=useState<Workspace>("home");
  const [createSource,setCreateSource]=useState<CreateSource>("start");
  const [loadedPaper,setLoadedPaper]=useState<any>(null);
  const [editedPaper,setEditedPaper]=useState<any>(null);
  const [editorMode,setEditorMode]=useState<"template"|"protected">("template");
  const [saveGuard,setSaveGuard]=useState<RevisionGuard|null>(null);
  const [openingPaper,setOpeningPaper]=useState(false);
  const [saveBusy,setSaveBusy]=useState(false);
  const [saveNotice,setSaveNotice]=useState("");
  const [saveError,setSaveError]=useState("");
  const [saveConflict,setSaveConflict]=useState(false);
  const [editorEpoch,setEditorEpoch]=useState(0);
  const latestOpenRef=useRef(0);
  const [assignments,setAssignments]=useState<Assignment[]>([]);
  const [papers,setPapers]=useState<ProjectedPaper[]>([]);
  const [contextLoading,setContextLoading]=useState(true);
  const [contextError,setContextError]=useState("");

  const loadProjection=useCallback(async()=>{setContextLoading(true);setContextError("");try{const [ctx,list]=await Promise.all([api.get('/portal/paper-studio/context'),api.get('/portal/paper-studio/papers')]);if(!ctx.data?.success||ctx.data?.data?.architectureVersion!=="v6")throw new Error("Paper Studio context is not available.");if(!list.data?.success||!Array.isArray(list.data?.data))throw new Error("My Papers could not be verified.");setAssignments(Array.isArray(ctx.data.data.assignments)?ctx.data.data.assignments:[]);setPapers(list.data.data)}catch(err:any){setAssignments([]);setPapers([]);setContextError(err?.response?.data?.message||err?.message||"Paper Studio context could not be verified.")}finally{setContextLoading(false)}},[]);
  useEffect(()=>{loadProjection()},[loadProjection]);
  useEffect(()=>{if(typeof window==='undefined')return;const tab=new URLSearchParams(window.location.search).get('tab');if(tab==='qbank')setWorkspace('qbank');else if(tab==='saved')setWorkspace('papers');else if(tab==='build'||tab==='unified'||tab==='board'||tab==='ai'||tab==='import'||tab==='scan')setWorkspace('create')},[]);

  const subjects=useMemo(()=>[...new Set(assignments.flatMap(a=>a.subjects||[]).filter(Boolean))],[assignments]);
  const openWorkspace=(id:Workspace)=>{
    if(id!==workspace&&editorMode==='protected'&&editedPaper&&typeof window!=='undefined'&&!window.confirm('Unsaved edits in the protected editor may be lost. Leave this workspace?'))return;
    if(id!==workspace&&editorMode==='protected')setEditedPaper(null);
    setWorkspace(id);if(id==='create'&&!loadedPaper)setCreateSource('start');if(typeof window!=='undefined')window.history.replaceState({},"",`?workspace=${id}`)
  };
  const clearSaveState=()=>{setSaveGuard(null);setEditedPaper(null);setSaveNotice('');setSaveError('');setSaveConflict(false);setEditorEpoch(0)};
  const openSource=(id:string)=>{if(id==='papers'){openWorkspace('papers');return}setWorkspace('create');setLoadedPaper(null);clearSaveState();setEditorMode('template');setCreateSource(id as CreateSource)};
  const openPaper=(paper:any)=>{setLoadedPaper(paper);clearSaveState();setEditorMode('template');setWorkspace('create');setCreateSource('editor')};
  const openOwnedSavedPaper=async(paper:any)=>{
    const id=String(paper?.id||'');const seq=++latestOpenRef.current;
    setOpeningPaper(true);clearSaveState();setWorkspace('create');setCreateSource('editor');setLoadedPaper(null);setEditorMode('template');
    try{
      if(!/^\d+$/.test(id))throw Error('A valid server-owned paper ID is required.');
      const [detail,review]=await Promise.all([
        api.get(`/portal/paper-studio/papers/${encodeURIComponent(id)}`),
        api.get(`/portal/paper-studio/papers/${encodeURIComponent(id)}/document-review`),
      ]);
      if(seq!==latestOpenRef.current)return;
      if(!detail.data?.success||!review.data?.success||String(detail.data.data?.id)!==id||String(review.data.paperId)!==id)throw Error('Paper identity/revision could not be verified.');
      const source={...detail.data.data.document,id,revision:Number(detail.data.data.revision),serverSynced:true};
      setLoadedPaper(source);
      if(review.data.review?.family==='legacy-connect-vault'&&classifyLegacyEditablePaper(source).compatible){
        setSaveGuard({revision:Number(review.data.revision),hash:String(review.data.review.snapshotHash)});
        setEditorEpoch(x=>x+1);
        setEditorMode('protected');
      }else setEditorMode('template');
    }catch(err:any){if(seq===latestOpenRef.current)setSaveError(err?.response?.data?.message||err?.message||'Your saved paper could not be verified.');}
    finally{if(seq===latestOpenRef.current)setOpeningPaper(false)}
  };
  const fromGenerated=(paper:any)=>{setLoadedPaper(paper);clearSaveState();setEditorMode('template');setWorkspace('create');setCreateSource('editor')};
  const saveWorkingDocument=async(workingDocument:any)=>{
    if(!saveGuard||!loadedPaper?.id||saveConflict||saveBusy)return;
    setSaveBusy(true);setSaveError('');setSaveNotice('');
    try{
      const {data}=await api.patch(`/portal/paper-studio/papers/${encodeURIComponent(String(loadedPaper.id))}`,{
        expectedRevision:saveGuard.revision,expectedSnapshotHash:saveGuard.hash,workingDocument,
      });
      if(!data?.success||!data?.data?.snapshotHash)throw Error('Server did not confirm the revision.');
      const confirmed=data.data;
      const read=await api.get(`/portal/paper-studio/papers/${encodeURIComponent(String(loadedPaper.id))}`);
      if(!read.data?.success||Number(read.data.data?.revision)!==Number(confirmed.revision))throw Error('Save committed, but the verified revision could not be reopened. Reload latest before another edit.');
      setLoadedPaper({...read.data.data.document,id:String(read.data.data.id),revision:Number(read.data.data.revision),serverSynced:true});
      setSaveGuard({revision:Number(confirmed.revision),hash:String(confirmed.snapshotHash)});
      setEditedPaper(null);setSaveConflict(false);setEditorEpoch(x=>x+1);
      setSaveNotice(confirmed.unchanged?`No changes to save. Revision ${confirmed.revision} remains current.`:`Saved as revision ${confirmed.revision}; previous snapshot retained on the server.`);
    }catch(err:any){
      if(Number(err?.response?.status)===409){setSaveConflict(true);setSaveError('Conflict: another session changed this paper. Your edits have NOT overwritten it. Reload latest to discard local edits and reopen the current revision.');}
      else setSaveError(err?.response?.data?.message||err?.message||'Save could not be confirmed. Local editor changes remain visible; do not assume they reached the server.');
    }finally{setSaveBusy(false)}
  };
  const reloadLatest=()=>{if(typeof window==='undefined'||window.confirm('Reload latest server revision? This discards any unsaved local edits.'))openOwnedSavedPaper({id:loadedPaper?.id})};
  const loadRevisionHistory=async()=>{if(!loadedPaper?.id)throw new Error('Saved paper identity is missing.');return fetchProtectedPaperRevisions(loadedPaper.id)};

  const createContent=()=>{
    if(!contextLoading&&!contextError&&!assignments.length&&createSource!=='editor')return <div className="ps6-assignment-block"><ShieldCheck size={24}/><h3>Teacher assignment required</h3><p>Paper creation is locked because this portal identity has no active class/subject assignment in the SaaS academic structure. Link the teacher first; My Papers remains available.</p></div>;
    if(createSource==='start')return <div className="ps6-start"><div className="ps6-start-head"><span>ONE AUTHORING PIPELINE</span><h3>How do you want to start?</h3><p>Every method converges into the same paper document, validation and output pipeline.</p></div><div className="ps6-source-grid">{SOURCE_CARDS.map(card=>{const Icon=card.icon;return <button type="button" key={card.id} onClick={()=>openSource(card.id)}><span className="ps6-source-tag">{card.tag}</span><span className="ps6-source-icon"><Icon size={20}/></span><strong>{card.title}</strong><small>{card.detail}</small><span className="ps6-source-arrow">Continue <ChevronRight size={14}/></span></button>})}</div></div>;
    if(createSource==='blank')return <BlankSetup assignments={assignments} onBack={()=>setCreateSource('start')} onCreate={openPaper}/>;
    if(createSource==='bank')return <div className="ps6-engine-wrap"><div className="ps6-engine-note"><strong>Question Bank creation path</strong><span>Select class, subject, chapters and questions. The resulting draft uses the same paper workspace.</span></div><PaperGenerator deliveryLocked={true} onReturnToSource={()=>setCreateSource('start')}/></div>;
    if(createSource==='editor'&&openingPaper)return <div className="ps6-empty" role="status">Verifying your signed paper ownership and current revision…</div>;
    if(createSource==='editor'&&saveError&&!loadedPaper)return <div className="cw-error" role="alert">{saveError}<button type="button" onClick={()=>openWorkspace('papers')}>Return to My Papers</button></div>;
    if(createSource==='editor'&&!loadedPaper)return <div className="ps6-empty">Select a verified paper from My Papers first.</div>;
    if(createSource==='editor')return <div className="ps6-engine-wrap"><div className="ps6-engine-note"><strong>{editorMode==='protected'?'V6-C protected document editor':'PaperDocument workspace'}</strong><span>{editorMode==='protected'?'All original questions and source details are preserved. Unsupported changes and direct Pro print/export remain blocked.':'Editing and saving remain server-authorized by the SaaS teacher assignment.'}</span></div>{editorMode==='protected'?<ProtectedLegacyEditor key={`${String(loadedPaper?.id||'own-paper')}-${saveGuard?.revision??0}-${editorEpoch}`} loadedPaper={loadedPaper} onPaperChange={(paper:any)=>{setEditedPaper(paper);setSaveNotice('');if(!saveConflict)setSaveError('')}} onSaveWorkingDocument={saveWorkingDocument} saveRevision={saveGuard?.revision??null} saving={saveBusy} saveNotice={saveNotice} saveError={saveError} saveConflict={saveConflict} onReloadLatest={reloadLatest} onLoadRevisionHistory={loadRevisionHistory} deliveryRevision={saveGuard?.revision??null} deliverySnapshotHash={saveGuard?.hash??''} language={String(loadedPaper?.config?.language||'dual')} onReturnToSource={()=>{setEditorMode('template');setLoadedPaper(editedPaper||loadedPaper)}} onOpenPrintPreview={(paper:any)=>{setLoadedPaper(paper);setEditedPaper(null);setEditorMode('template')}}/>:<PaperGenerator deliveryLocked={true} key={String((editedPaper||loadedPaper)?.id||'draft')} loadedPaper={editedPaper||loadedPaper} onReturnToSource={()=>{setLoadedPaper(null);clearSaveState();setCreateSource('start')}}/>}</div>;
    if(createSource==='ai')return <AIGeneratorTab onProceedToPreview={fromGenerated}/>;
    if(createSource==='import')return <AIImportTab/>;
    if(createSource==='scan')return <HandwrittenScannerTab onProceedToPreview={fromGenerated}/>;
    if(createSource==='board')return <BoardPaperGenerator loadedPaper={loadedPaper}/>;
    return null;
  };

  return <DashboardLayout role="teacher" title="Paper Studio">
    <PaperAiJobToasts/>
    <div className="paper-studio-v6">
      <section className="ps6-hero"><div className="ps6-crest"><ShieldCheck size={27}/></div><div className="ps6-hero-copy"><span>ASSPS ACADEMIC OS · CANONICAL PAPER PLATFORM</span><h1>Paper Studio <em>V6</em></h1><p>SaaS is the source of truth. Connect gives your signed teacher account a scoped authoring view of the same academic and paper pipeline.</p></div><div className="ps6-hero-metrics"><div><strong>{contextLoading?'…':assignments.length}</strong><small>Assigned groups</small></div><div><strong>{contextLoading?'…':subjects.length}</strong><small>Subjects</small></div><div><strong>{contextLoading?'…':papers.length}</strong><small>My papers</small></div></div></section>
      {contextError&&<div className="cw-error ps6-context-error" role="alert"><span>{contextError}</span><button type="button" onClick={loadProjection}><RefreshCw size={14}/> Retry</button></div>}
      <section className="ps6-scope"><div><School size={17}/><span><strong>Your SaaS teaching projection</strong><small>{contextLoading?'Verifying assignments…':assignments.length?assignments.map(a=>`${a.className}${a.section?`-${a.section}`:''}: ${(a.subjects||[]).join(', ')||'assigned'}`).join(' · '):'No class assignment is linked to this portal identity.'}</small></span></div><div><ShieldCheck size={17}/><span><strong>Own-paper boundary</strong><small>My Papers never exposes another teacher's saved-paper library.</small></span></div></section>
      <div className="ps6-shell"><aside className="ps6-nav">{WORKSPACES.map(item=>{const Icon=item.icon;const active=workspace===item.id;return <button type="button" key={item.id} onClick={()=>openWorkspace(item.id)} className={active?'is-active':''} aria-current={active?'page':undefined}><span><Icon size={18}/></span><div><strong>{item.label}</strong><small>{item.description}</small></div><ChevronRight size={15}/></button>})}<div className="ps6-policy"><BookOpenCheck size={18}/><strong>One paper contract</strong><small>Blank, Bank, Import and AI all converge to the same document/editor pipeline.</small></div></aside>
        <main className="ps6-main">{workspace==='home'&&<div className="ps6-home"><div className="ps6-main-head"><span>STUDIO HOME</span><h2>Start from the work, not from modules.</h2><p>Your live SaaS assignments and own papers determine what is available here.</p></div><div className="ps6-home-actions"><button onClick={()=>openWorkspace('create')} disabled={!contextLoading&&!contextError&&!assignments.length}><FileText size={20}/><strong>Create a paper</strong><small>Blank, Bank, own paper, import or AI.</small><ArrowRight size={16}/></button><button onClick={()=>openWorkspace('qbank')}><LibraryBig size={20}/><strong>Browse Question Bank</strong><small>Approved questions in assigned subjects.</small><ArrowRight size={16}/></button><button onClick={()=>openWorkspace('papers')}><FileStack size={20}/><strong>Continue My Papers</strong><small>{papers.length} own paper{papers.length===1?'':'s'} currently projected.</small><ArrowRight size={16}/></button></div><div className="ps6-recent"><div className="ps6-section-title"><span>RECENT OWN PAPERS</span><strong>Continue where you left off</strong></div>{papers.length?<div className="ps6-recent-grid">{papers.slice(0,4).map(p=><button key={p.id} onClick={()=>openWorkspace('papers')}><span><FileText size={16}/></span><div><strong>{p.name}</strong><small>{p.className||'Class'}{p.subjectName?` · ${p.subjectName}`:''}</small></div><ChevronRight size={14}/></button>)}</div>:<div className="ps6-empty">No saved paper belongs to this teacher account yet.</div>}</div></div>}
          {workspace==='create'&&<>{<div className="ps6-main-head"><span>CREATE PAPER</span><h2>One authoring funnel</h2><p>Choose a source. Every path converges into one structured paper workspace.</p></div>}{createContent()}</>}
          {workspace==='qbank'&&<><div className="ps6-main-head"><span>QUESTION BANK</span><h2>Approved questions for your teaching scope</h2><p>This is a selection library, not a separate paper editor.</p></div><QuestionBankBrowser/></>}
          {workspace==='papers'&&<><div className="ps6-main-head"><span>MY PAPERS</span><h2>Your private teacher vault</h2><p>Only papers owned by your signed-in teacher identity are listed. SaaS Admin/Principal retains school-wide governance.</p></div><SavedPapersTab onLoadPaper={openOwnedSavedPaper}/></>}
        </main></div>
    </div>
  </DashboardLayout>
}
