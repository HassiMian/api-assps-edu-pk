"use client";

import DashboardLayout from '@/components/DashboardLayout';
import {PortalModuleHeading, PortalSubheading, PortalSupportNote} from '@/components/PortalModulePrimitives';
import {DataEmpty, DataError} from '@/components/PortalDashboardPrimitives';
import {useApiData} from '@/hooks/useApiData';
import {CheckCircle2, Clock3, CreditCard, RefreshCw, ShieldCheck, AlertCircle, ReceiptText} from 'lucide-react';

type FeeRecord={id:number;month?:string;year?:string|number;challan_no?:string;amount?:number|string;balance_due?:number|string|null;status?:string;proof_status?:string;paid_date?:string};
const PROOF_LABEL:Record<string,string>={pending:'Payment proof under review',approved:'Proof approved',rejected:'Proof rejected'};
const numberAmount=(value:unknown)=>{
  if(value===null||value===undefined||value==='')return 'Amount unavailable';
  const n=Number(value);
  return Number.isFinite(n)&&n>=0?`Rs ${new Intl.NumberFormat('en-PK',{maximumFractionDigits:2}).format(n)}`:'Amount unavailable';
};

export default function ParentFinance(){
  const {data:feePayload,loading,error,refetch}=useApiData<unknown>('/fees',[]);
  const validShape=Array.isArray(feePayload);
  const fees:FeeRecord[]=validShape?feePayload as FeeRecord[]:[];
  const unpaid=fees.filter(f=>String(f.status||'').toLowerCase()!=='paid');
  const inReview=fees.filter(f=>String(f.proof_status||'').toLowerCase()==='pending').length;
  return <DashboardLayout role="parent" title="Family finances">
    <PortalModuleHeading eyebrow="FAMILY FINANCIAL RECORD" title="Fee overview" description="Your household's linked school challans, review status and payment history—shown directly from verified records."
      actions={<button type="button" onClick={refetch} className="cw-module-secondary"><RefreshCw size={15}/> Refresh records</button>}/>
    <div className="mb-6"><PortalSupportNote>In-app payment instructions and proof submission are not configured yet. Please obtain the school's verified payment details directly from the school office. This page does not accept or confirm a transfer.</PortalSupportNote></div>
    {error&&<div className="mb-5"><DataError message={error} onRetry={refetch}/></div>}
    {!loading&&!error&&!validShape&&<div className="mb-5"><DataError message="Fee records returned an unexpected response; no balances will be inferred." onRetry={refetch}/></div>}
    <section className="grid grid-cols-2 gap-3 md:grid-cols-3" aria-label="Household fee summary">
      {[
        {label:'FEE RECORDS',value:loading||error||!validShape?'—':fees.length,icon:ReceiptText},
        {label:'AWAITING PAYMENT',value:loading||error||!validShape?'—':unpaid.length,icon:Clock3},
        {label:'PROOFS UNDER REVIEW',value:loading||error||!validShape?'—':inReview,icon:ShieldCheck},
      ].map(item=><article key={item.label} className="cw-metric"><div className="flex items-start justify-between gap-2"><span className="cw-metric-label">{item.label}</span><span className="cw-action-icon"><item.icon size={18}/></span></div><div className="cw-metric-value mt-3 tabular-nums">{item.value}</div><p className="cw-metric-note mt-1">Only this linked household</p></article>)}
    </section>
    <section className="cw-card mt-6" aria-label="Household challans">
      <PortalSubheading eyebrow="CHALLAN HISTORY" title="School fee records" description="Use the official challan reference when discussing a payment with the school administration."/>
      {loading?<div className="space-y-3" aria-label="Loading fee records" role="status">{[1,2,3].map(x=><div key={x} className="h-[95px] animate-pulse rounded-xl bg-[#f1f4ef]"/>)}</div>:
      error||!validShape?<div className="cw-empty"><AlertCircle size={23} color="var(--cw-warning)"/><strong>Records temporarily unavailable</strong><p>Please retry. A failed server response must never be presented as an empty ledger.</p></div>:
      !fees.length?<DataEmpty title="No linked fee records yet" description="Verified challans will appear here once the school associates them with your family account."/>:
      <div className="space-y-3">{fees.map((fee,index)=>{
        const isPaid=String(fee.status||'').toLowerCase()==='paid';
        const pendingReview=String(fee.proof_status||'').toLowerCase()==='pending';
        const rejected=String(fee.proof_status||'').toLowerCase()==='rejected';
        return <article key={fee.id||`fee-${index}`} className="flex flex-col gap-3 rounded-[14px] border border-[#e4e9e2] bg-[#fcfdfa] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{background:isPaid?'#e9f4ec':'#f8efe3',color:isPaid?'#27694b':'#986326'}}>{isPaid?<CheckCircle2 size={19}/>:<CreditCard size={19}/>}</span><div className="min-w-0"><h3 className="text-[13px] font-bold text-[#304438]">{fee.month||'School fee'} {fee.year||''}</h3><p className="mt-1 break-all text-[11px] text-[#596d5f]">Challan: {fee.challan_no||'Reference unavailable'}</p>{fee.proof_status&&PROOF_LABEL[fee.proof_status]&&<p className={`mt-2 text-[11px] font-semibold ${rejected?'text-[#963d39]':pendingReview?'text-[#875725]':'text-[#286e4b]'}`}>{PROOF_LABEL[fee.proof_status]}</p>}</div></div>
          <div className="text-left sm:text-right"><strong className="block font-serif text-[19px] text-[#293b30]">{numberAmount(fee.amount)}</strong><span className="mt-1 inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide" style={{background:isPaid?'#e9f4ec':'#fff2e2',color:isPaid?'#246544':'#885727'}}>{isPaid?'Paid':fee.status||'Payment status pending'}</span>{fee.paid_date&&<p className="mt-2 text-[10px] text-[#697d6f]">Recorded: {new Date(fee.paid_date).toLocaleDateString('en-GB')}</p>}</div>
        </article>;
      })}<p className="pt-1 text-[11px] leading-5 text-[#5a6d60]">Amounts above are the recorded challan amounts. For partial payments, confirm the outstanding balance with the school office.</p></div>}
    </section>
    <div className="mt-6 rounded-[16px] border border-[#d8e7e2] bg-[#f5fbf9] p-5"><div className="flex items-start gap-3"><ShieldCheck size={20} className="mt-0.5 shrink-0 text-[#28746d]"/><div><strong className="text-[13px] text-[#2f5750]">Your family record stays private</strong><p className="mt-1 text-[12px] leading-6 text-[#506d65]">Financial information is requested through your authenticated household session. The page does not ask you to upload sensitive payment screenshots until the school activates its verified submission workflow.</p></div></div></div>
  </DashboardLayout>;
}
