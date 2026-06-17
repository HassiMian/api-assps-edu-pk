"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { CreditCard, Upload, CheckCircle2, Clock, X, AlertCircle, ImageIcon } from 'lucide-react';
import { useState, useRef } from 'react';
import { useApiData } from '@/hooks/useApiData';
import api from '@/utils/api';

const STATUS_STYLE: Record<string, string> = {
  paid: 'text-emerald-400',
  pending: 'text-amber-400',
  unpaid: 'text-red-400',
  partial: 'text-blue-400',
};

const PROOF_LABEL: Record<string, string> = {
  none: '',
  pending: 'Proof under review',
  approved: 'Approved',
  rejected: 'Proof rejected',
};

const EMPTY_FEES: any[] = [];

export default function ParentFinance() {
  const [paymentMethod, setPaymentMethod] = useState<'jazzcash' | 'easypaisa' | 'bank'>('jazzcash');
  const [selectedChallan, setSelectedChallan] = useState<any>(null);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [amount, setAmount] = useState('0');
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: feesData, loading, refetch } = useApiData<any>('/fees', { data: EMPTY_FEES });
  const fees = feesData?.data || EMPTY_FEES;
  const unpaidFees = fees.filter((f: any) => f.status !== 'paid');

  function showAlert(type: 'success' | 'error', msg: string) {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 5000);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showAlert('error', 'Image too large. Max 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setProofImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedChallan) { showAlert('error', 'Select a live fee month first.'); return; }
    if (!proofImage) { showAlert('error', 'Please upload your payment screenshot.'); return; }
    setUploading(true);
    try {
      await api.post(`/fees/${selectedChallan.id}/upload-proof`, {
        proof_image: proofImage,
        proof_amount: parseFloat(amount) || null,
        proof_method: paymentMethod,
      });
      showAlert('success', 'Proof submitted. Admin will verify it shortly.');
      setProofImage(null);
      setSelectedChallan(null);
      if (fileRef.current) fileRef.current.value = '';
      refetch();
    } catch (err: any) {
      showAlert('error', err?.response?.data?.message || 'Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <DashboardLayout role="parent" title="Finances & Fee Payment">
      {alert && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl border flex items-center gap-2 ${alert.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
          {alert.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {alert.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Submit Payment Proof</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Which month are you paying?</label>
              <div className="space-y-2">
                {unpaidFees.length === 0 && <p className="text-slate-500 text-sm">No live challans available right now.</p>}
                {unpaidFees.map((f: any) => (
                  <div
                    key={f.id}
                    onClick={() => setSelectedChallan(f)}
                    className={`cursor-pointer p-3 rounded-xl border transition-all flex items-center justify-between ${selectedChallan?.id === f.id ? 'bg-blue-500/10 border-blue-500/50 text-blue-300' : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                  >
                    <span className="font-medium">{f.month} {f.year} — Rs {Number(f.amount).toLocaleString()}</span>
                    {f.proof_status === 'pending' && <span className="text-xs text-amber-400">Under Review</span>}
                    {f.proof_status === 'rejected' && <span className="text-xs text-red-400">Proof Rejected</span>}
                    {selectedChallan?.id === f.id && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'jazzcash', label: 'JazzCash', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
                  { id: 'easypaisa', label: 'EasyPaisa', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
                  { id: 'bank', label: 'Bank Transfer', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
                ].map(m => (
                  <div
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`cursor-pointer rounded-xl border p-3 text-center text-sm font-bold transition-all ${paymentMethod === m.id ? m.color + ' border-[2px]' : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                  >
                    {m.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm">
              <p className="text-slate-400 mb-1 text-xs">Send payment to:</p>
              {paymentMethod === 'jazzcash' && <p className="text-white font-mono font-bold">0300-1234567 (Al-Siddique)</p>}
              {paymentMethod === 'easypaisa' && <p className="text-white font-mono font-bold">0345-7654321 (Al-Siddique)</p>}
              {paymentMethod === 'bank' && <p className="text-white font-mono font-bold">Meezan Bank — 0123456789</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Amount Paid (Rs)</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Upload Screenshot (Proof)</label>
              {proofImage ? (
                <div className="relative rounded-xl overflow-hidden border border-blue-500/40">
                  <img src={proofImage} alt="Proof" className="w-full max-h-48 object-contain bg-slate-900" />
                  <button type="button" onClick={() => { setProofImage(null); if (fileRef.current) fileRef.current.value = ''; }}
                    className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-red-500/80 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="block border-2 border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-blue-500/50 transition-colors cursor-pointer bg-slate-800/20">
                  <ImageIcon className="w-8 h-8 text-blue-400 mb-2" />
                  <p className="text-sm font-medium text-white">Click to select screenshot</p>
                  <p className="text-xs text-slate-500 mt-1">JPG, PNG — max 5MB</p>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading || unpaidFees.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              {uploading
                ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</>
                : <><Upload className="w-5 h-5" /> Submit for Approval</>}
            </button>
          </form>
        </div>

        <div className="glass-card flex flex-col">
          <div className="p-6 border-b border-slate-700/50">
            <h3 className="text-xl font-semibold text-white">Fee History</h3>
          </div>
          <div className="flex-1 p-6 space-y-3">
            {loading && <p className="text-slate-500 text-sm">Loading live fee data...</p>}
            {!loading && fees.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/30 p-6 text-center">
                <p className="text-white font-semibold mb-1">No fee history available</p>
                <p className="text-slate-400 text-sm">Live challans will appear here once the backend sends them.</p>
              </div>
            )}
            {fees.map((f: any, idx: number) => (
              <div key={f.id || idx} className="flex justify-between items-center p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${f.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {f.status === 'paid' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{f.month} {f.year}</h4>
                    {f.paid_date && <p className="text-slate-400 text-xs mt-0.5">{new Date(f.paid_date).toLocaleDateString('en-GB')}</p>}
                    {f.proof_status && f.proof_status !== 'none' && (
                      <p className="text-xs mt-0.5 font-medium">{PROOF_LABEL[f.proof_status]}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold font-mono">Rs {Number(f.amount).toLocaleString()}</p>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLE[f.status] || 'text-slate-400'}`}>
                    {f.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
