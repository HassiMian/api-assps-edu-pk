"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { Check, X, Eye, Search, CreditCard, X as XIcon, Receipt, RefreshCw, AlertCircle, CheckCircle2, FilePlus, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import api from '@/utils/api';

interface Submission {
  id: number;
  name: string;
  gr_number: string;
  class: string;
  challan_no: string;
  month: string;
  year: string;
  amount: number;
  proof_amount: number;
  proof_method: string;
  proof_image: string;
  proof_submitted_at: string;
  proof_status: 'pending' | 'approved' | 'rejected';
}

export default function AdminFinance() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [allFees, setAllFees]         = useState<any[]>([]);
  const [feeStats, setFeeStats]       = useState({ paid: 0, pending: 0, pendingCount: 0 });
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [viewProof, setViewProof]     = useState<Submission | null>(null);
  const [acting, setActing]           = useState<number | null>(null);
  const [alert, setAlert]             = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Bulk Generation State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkData, setBulkData] = useState({ class: 'Starter', month: new Date().toLocaleString('default', { month: 'long' }), year: new Date().getFullYear().toString(), due_date: '' });
  const [bulkLoading, setBulkLoading] = useState(false);

  const showAlert = (type: 'success' | 'error', msg: string) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [proofRes, statsRes] = await Promise.all([
        api.get('/fees/pending-proofs').catch(() => ({ data: { data: [] } })),
        api.get('/fees').catch(() => ({ data: { data: [] } })),
      ]);
      setSubmissions(proofRes.data?.data || []);
      const fees = statsRes.data?.data || [];
      setAllFees(fees);
      const paid    = fees.filter((f: any) => f.status === 'paid').reduce((s: number, f: any) => s + Number(f.amount || 0), 0);
      const pending = fees.filter((f: any) => f.status !== 'paid').reduce((s: number, f: any) => s + Number(f.amount || 0), 0);
      setFeeStats({ paid, pending, pendingCount: fees.filter((f: any) => f.status !== 'paid').length });
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    setActing(id);
    try {
      await api.put(`/fees/${id}/approve-proof`, { action });
      showAlert('success', action === 'approve' ? 'Fee approved and marked as paid!' : 'Proof rejected.');
      setViewProof(null);
      load();
    } catch (e: any) {
      showAlert('error', e?.response?.data?.message || 'Action failed');
    }
    setActing(null);
  };

  const handleBulkGenerate = async () => {
    setBulkLoading(true);
    try {
      const res = await api.post('/fees/bulk', bulkData);
      showAlert('success', res.data?.message || 'Bulk challans generated successfully.');
      setShowBulkModal(false);
      load(); // Reload stats
    } catch (e: any) {
      showAlert('error', e?.response?.data?.message || 'Bulk generation failed.');
    }
    setBulkLoading(false);
  };

  const filtered = submissions.filter(s =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.gr_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout role="admin" title="Finance & Fee Approvals">
      {alert && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl border flex items-center gap-2
          ${alert.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
          {alert.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {alert.msg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="glass-card p-6 border-l-4 border-l-amber-500">
          <p className="text-slate-400 text-sm">Pending Proof Approvals</p>
          <h3 className="text-3xl font-bold text-white mt-1">{submissions.length}</h3>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-emerald-500">
          <p className="text-slate-400 text-sm">Total Collected (Rs)</p>
          <h3 className="text-3xl font-bold text-white mt-1">{feeStats.paid.toLocaleString()}</h3>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-red-500">
          <p className="text-slate-400 text-sm">Total Pending (Rs)</p>
          <h3 className="text-3xl font-bold text-white mt-1">{feeStats.pending.toLocaleString()}</h3>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-slate-700/50 flex flex-wrap justify-between items-center gap-3">
          <h3 className="text-xl font-bold text-white">Fee Proof Submissions</h3>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowBulkModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-semibold">
              <FilePlus className="w-4 h-4" /> Bulk Generate
            </button>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search student..." value={search} onChange={e => setSearch(e.target.value)}
                className="bg-slate-800/50 border border-slate-700 text-sm rounded-lg pl-9 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={load} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="text-slate-400">No pending proof submissions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 font-medium">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Month</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-6 py-4">Screenshot</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filtered.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{sub.name}</div>
                      <div className="text-xs text-slate-400">{sub.gr_number} · Class {sub.class}</div>
                    </td>
                    <td className="px-6 py-4">{sub.month} {sub.year}</td>
                    <td className="px-6 py-4 font-medium">Rs {Number(sub.proof_amount || sub.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-slate-400" />{sub.proof_method || '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {sub.proof_submitted_at ? new Date(sub.proof_submitted_at).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {sub.proof_image ? (
                        <button onClick={() => setViewProof(sub)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-blue-400 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      ) : <span className="text-slate-600 text-xs">No image</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleAction(sub.id, 'reject')} disabled={acting === sub.id}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors disabled:opacity-40">
                          <X className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleAction(sub.id, 'approve')} disabled={acting === sub.id}
                          className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors disabled:opacity-40">
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Defaulter Analytics */}
      <div className="glass-card overflow-hidden mt-8">
        <div className="p-6 border-b border-slate-700/50">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" /> Defaulter Analytics
          </h3>
          <p className="text-sm text-slate-400 mt-1">Students with unpaid or partial fee challans.</p>
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-medium sticky top-0 backdrop-blur-md z-10">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Month/Year</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Balance Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {allFees.filter(f => f.status !== 'paid').map(f => (
                <tr key={f.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{f.name}</div>
                    <div className="text-xs text-slate-400">{f.gr_number} · Class {f.class}</div>
                  </td>
                  <td className="px-6 py-4">{f.month} {f.year}</td>
                  <td className="px-6 py-4 text-xs">
                    {f.due_date ? new Date(f.due_date).toLocaleDateString('en-GB') : '—'}
                    {f.due_date && new Date(f.due_date) < new Date() && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400">Overdue</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                      f.status === 'partial' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {f.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-red-400">
                    Rs {Number(f.remaining_balance || f.amount).toLocaleString()}
                  </td>
                </tr>
              ))}
              {allFees.filter(f => f.status !== 'paid').length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No defaulters found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof Modal */}
      {viewProof && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md p-6 relative border-slate-600/50">
            <button onClick={() => setViewProof(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <XIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-blue-500/20 rounded-xl"><Receipt className="w-6 h-6 text-blue-400" /></div>
              <div>
                <h3 className="text-lg font-bold text-white">Payment Proof</h3>
                <p className="text-slate-400 text-sm">{viewProof.name} · {viewProof.month} {viewProof.year}</p>
              </div>
            </div>
            <div className="space-y-2 p-4 bg-slate-900/50 rounded-xl border border-slate-700 text-sm mb-4">
              <div className="flex justify-between"><span className="text-slate-400">Amount</span><span className="text-white font-bold">Rs {Number(viewProof.proof_amount || viewProof.amount).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Method</span><span className="text-white">{viewProof.proof_method || '—'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Submitted</span><span className="text-white">{viewProof.proof_submitted_at ? new Date(viewProof.proof_submitted_at).toLocaleDateString('en-GB') : '—'}</span></div>
            </div>
            {viewProof.proof_image ? (
              <img src={viewProof.proof_image} alt="Proof" className="w-full rounded-xl border border-slate-700 max-h-64 object-contain bg-slate-900 mb-4" />
            ) : (
              <div className="p-8 bg-slate-800/50 rounded-xl border border-dashed border-slate-600 flex flex-col items-center text-slate-500 mb-4">
                <Receipt className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">No screenshot attached</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => handleAction(viewProof.id, 'reject')} disabled={acting === viewProof.id}
                className="flex-1 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold transition-colors disabled:opacity-40">
                ✗ Reject
              </button>
              <button onClick={() => handleAction(viewProof.id, 'approve')} disabled={acting === viewProof.id}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold transition-colors disabled:opacity-40">
                ✓ Approve & Mark Paid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Generate Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md p-6 relative border-slate-600/50">
            <button onClick={() => setShowBulkModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <XIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-emerald-500/20 rounded-xl"><FilePlus className="w-6 h-6 text-emerald-400" /></div>
              <div>
                <h3 className="text-lg font-bold text-white">Bulk Generate Challans</h3>
                <p className="text-slate-400 text-sm">Generate challans for entire class</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Class</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={bulkData.class} onChange={e => setBulkData({...bulkData, class: e.target.value})}
                >
                  {['Starter', 'Mover', 'Flyer', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Pre Nine', 'Hifaz Class'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Month</label>
                  <select 
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={bulkData.month} onChange={e => setBulkData({...bulkData, month: e.target.value})}
                  >
                    {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Year</label>
                  <input type="number" 
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={bulkData.year} onChange={e => setBulkData({...bulkData, year: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Due Date</label>
                <input type="date" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={bulkData.due_date} onChange={e => setBulkData({...bulkData, due_date: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowBulkModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors">
                Cancel
              </button>
              <button onClick={handleBulkGenerate} disabled={bulkLoading}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {bulkLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
