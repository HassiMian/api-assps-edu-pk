"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { UserPlus, Shield, Search, Lock, X, Eye, EyeOff, KeyRound, UsersRound, RefreshCw } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { PortalModuleHeading, PortalSubheading, PortalSupportNote } from '@/components/PortalModulePrimitives';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

type UserData = {
  id: string | number;
  name: string;
  role: string;
  email: string;
  status: string;
};

type MissingIdentity = {
  id: number;
  name: string;
  login_reference: string;
  missing_student?: boolean;
  missing_parent?: boolean;
  requires_guardian_contact?: boolean;
  requires_guardian_review?: boolean;
};
type IssuedIdentity = {
  kind: string;
  loginId: string;
  email: string;
  created: boolean;
  temporaryPassword: string | null;
};

type ActivationRecord = { id: number; user_id: number; portal_role: string; state: string; name: string; login_id: string; must_change_password: boolean };
type ActivationCredential = { id: number; role: string; loginId: string; temporaryPassword: string };

export default function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState('');
  const [userLoadError, setUserLoadError] = useState('');
  const { user } = useAuth();
  const [missing, setMissing] = useState<{students: MissingIdentity[]; teachers: MissingIdentity[]}>({ students: [], teachers: [] });
  const [issued, setIssued] = useState<IssuedIdentity[] | null>(null);
  const [repairing, setRepairing] = useState<string | null>(null);
  const [repairError, setRepairError] = useState('');
  const [activations, setActivations] = useState<ActivationRecord[]>([]);
  const [activationCredential, setActivationCredential] = useState<ActivationCredential | null>(null);
  const [verifiedRecipients, setVerifiedRecipients] = useState<Record<number,boolean>>({});
  const [activationBusy, setActivationBusy] = useState<number | null>(null);
  const [activationReason, setActivationReason] = useState<Record<number,string>>({});
  const loadActivations = async () => {
    try {
      const response = await api.get('/auth/users/pending-activation');
      if (response.data?.success) setActivations(response.data.data || []);
    } catch {
      setRepairError('Unable to load pending credential handoffs.');
    }
  };
  const issueActivation = async (record:ActivationRecord) => {
    setActivationBusy(record.id); setRepairError('');
    try {
      const response = await api.post(`/auth/users/pending-activation/${record.id}/issue`, {
        recipientVerified: verifiedRecipients[record.id] === true,
        ...(record.state === 'issued' ? { reissue:true,reissueReason:activationReason[record.id]||'' } : {}),
      });
      if(response.data?.success){setActivationCredential(response.data.data);await loadActivations();}
    } catch(err:any){setRepairError(err?.response?.data?.message || 'Credential issuance failed.');}
    finally{setActivationBusy(null);}
  };
  const confirmActivation = async () => {
    if(!activationCredential)return;
    setActivationBusy(activationCredential.id);setRepairError('');
    try {
      await api.post(`/auth/users/pending-activation/${activationCredential.id}/confirm`, {deliveredPrivately:true});
      setActivationCredential(null);await loadActivations();
    }catch(err:any){setRepairError(err?.response?.data?.message||'Private handoff confirmation failed.');}
    finally{setActivationBusy(null);}
  };

  const [guardianPhones, setGuardianPhones] = useState<Record<number, string>>({});
  const [guardianVerified, setGuardianVerified] = useState<Record<number, boolean>>({});
  const [savingGuardian, setSavingGuardian] = useState<number | null>(null);
  const [distinctGuardianNames, setDistinctGuardianNames] = useState<Record<number,string>>({});
  const [distinctVerified, setDistinctVerified] = useState<Record<number,boolean>>({});
  const saveDistinctGuardian = async (studentId:number) => {
    setSavingGuardian(studentId);setRepairError('');
    try {
      await api.post('/auth/users/resolve-distinct-guardian', {
        studentId, verifiedGuardianName:distinctGuardianNames[studentId]||'',
        distinctGuardianVerified:distinctVerified[studentId]===true,
      });
      setDistinctGuardianNames(prev=>({...prev,[studentId]:''}));
      setDistinctVerified(prev=>({...prev,[studentId]:false}));
      await Promise.all([loadMissing(),loadActivations(),fetchAllUsers()]);
    }catch(err:any){setRepairError(err?.response?.data?.message||'Guardian identity could not be resolved.');}
    finally{setSavingGuardian(null);}
  };

  const saveGuardianContact = async (studentId: number) => {
    setSavingGuardian(studentId);
    setRepairError('');
    try {
      await api.patch('/auth/users/guardian-contact', {
        studentId,
        phone: guardianPhones[studentId] || '',
        verified: guardianVerified[studentId] === true,
      });
      setGuardianPhones(prev => ({ ...prev, [studentId]: '' }));
      setGuardianVerified(prev => ({ ...prev, [studentId]: false }));
      await loadMissing();
    } catch (err: any) {
      setRepairError(err?.response?.data?.message || 'Verified guardian contact could not be saved.');
    } finally {
      setSavingGuardian(null);
    }
  };

  const loadMissing = async () => {
    try {
      const response = await api.get('/auth/users/missing-portal-links');
      if (response.data?.success) setMissing(response.data.data);
    } catch {
      setRepairError('Could not load portal identity reconciliation.');
    }
  };
  const repairOne = async (kind: 'student' | 'teacher', entityId: number) => {
    setRepairing(`${kind}-${entityId}`);
    setRepairError('');
    setIssued(null);
    try {
      const response = await api.post('/auth/users/provision-one', { kind, entityId });
      if (response.data?.success) {
        setIssued(response.data.issued || []);
        await Promise.all([loadMissing(), fetchAllUsers()]);
      }
    } catch (err: any) {
      setRepairError(err?.response?.data?.message || 'Identity issuance was not completed.');
    } finally {
      setRepairing(null);
    }
  };


  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState<string | null>(null);
  
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'admin', designation: 'Administrator' });
  const [newPassword, setNewPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAllUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      const rows = res.data?.success && Array.isArray(res.data?.data) ? res.data.data : [];
      const identities: UserData[] = rows.map((u: any) => ({
        id: u.id,
        name: u.name || u.username || 'User',
        role: u.role || 'user',
        email: u.email || u.username || '',
        status: u.is_active ? 'Active' : 'Inactive',
      }));
      setUsers(identities);
      setUserLoadError('');
    } catch (error) {
      console.error("Failed to fetch users", error);
      setUserLoadError('Unable to load school users. Please retry.');
    }
  };

  useEffect(() => {
    if (user) { fetchAllUsers(); loadMissing(); loadActivations(); }
  }, [user]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await api.post('/auth/users', newUser);
      if (res.data.success) {
        setSuccess('User created successfully!');
        setNewUser({ name: '', email: '', password: '', role: 'admin', designation: 'Administrator' });
        setTimeout(() => setShowAddModal(false), 1500);
        fetchAllUsers();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPasswordModal) return;
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await api.put('/auth/users/password', { email: showPasswordModal, newPassword });
      if (res.data.success) {
        setSuccess('Password updated successfully!');
        setNewPassword('');
        setTimeout(() => setShowPasswordModal(null), 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update password');
    }
    setLoading(false);
  };

  const matchingUsers = useMemo(() => users.filter(u => [u.name,u.email,u.role,u.status].some(value => String(value||'').toLowerCase().includes(search.trim().toLowerCase()))), [users,search]);
  const activeUsers = useMemo(() => users.filter(u => u.status === 'Active').length, [users]);
  if (!user) return null;

  return (
    <DashboardLayout role="admin" title="User Management">
      <PortalModuleHeading eyebrow="IDENTITY & TRUST" title="People and access" description="A clear view of the school's portal users, linked identities and verified private credential handoffs."
        actions={<button type="button" onClick={() => { setShowAddModal(true); setError(''); setSuccess(''); }} className="cw-module-primary"><UserPlus size={17}/> Add administrator</button>}>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold text-[#56695b]"><span className="rounded-full border border-[#d9e6d8] bg-white px-3 py-1.5">{users.length} total users</span><span className="rounded-full border border-[#d9e6d8] bg-white px-3 py-1.5">{activeUsers} active</span><span className="rounded-full border border-[#e9dcbf] bg-[#fffaf0] px-3 py-1.5">{activations.filter(a => a.state !== 'delivered').length} handoffs to review</span></div>
      </PortalModuleHeading>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-[#e4e8e1] bg-white p-3 sm:p-4">
        <label className="relative flex-1 min-w-[180px] max-w-xl"><span className="sr-only">Search portal users</span><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#708476]"/><input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, login, role or status" className="cw-field w-full pl-10" /></label>
        <button type="button" onClick={()=>{fetchAllUsers(); loadMissing(); loadActivations();}} className="cw-module-secondary"><RefreshCw size={15}/> Refresh records</button>
      </div>
      {userLoadError&&<p role="alert" className="cw-error mb-5">{userLoadError}</p>}

      <section className="glass-card p-5 mb-6 space-y-4" aria-label="Missing portal identities">
        <PortalSubheading eyebrow="ACCOUNT RECONCILIATION" title="Unlinked school identities" description="Repair only verified student, parent or teacher records. Never assume guardians share accounts because their contact numbers match."/>
        {repairError && <p role="alert" className="text-sm text-red-400">{repairError}</p>}
        <p className="text-sm text-slate-300">Students needing repair: {missing.students.length} · Teachers needing repair: {missing.teachers.length}</p>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {missing.students.map(item => (
            <div key={`student-${item.id}`} className="flex flex-wrap items-center justify-between gap-3 border border-slate-700 rounded-lg p-3 text-sm">
              <div><span className="text-white">{item.name}</span> <span className="text-slate-400">({item.login_reference})</span>
                <p className="text-xs text-amber-300">{item.missing_student ? 'Student login missing' : ''}{item.missing_student && item.missing_parent ? ' · ' : ''}{item.missing_parent ? 'Parent login missing' : ''}</p>
              </div>
              {item.requires_guardian_contact ? (
                <div className="space-y-2 w-full md:max-w-sm">
                  <p className="text-xs text-amber-300">Guardian mobile is missing. Verify it from the admission record or directly with the guardian before issuing a parent login.</p>
                  <input value={guardianPhones[item.id] || ''}
                    onChange={e => setGuardianPhones(prev => ({ ...prev, [item.id]: e.target.value }))}
                    placeholder="Verified guardian mobile (03XXXXXXXXX)" inputMode="tel"
                    className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white" />
                  <label className="flex gap-2 text-xs text-slate-300 items-start">
                    <input type="checkbox" checked={guardianVerified[item.id] === true}
                      onChange={e => setGuardianVerified(prev => ({ ...prev, [item.id]: e.target.checked }))} />
                    I verified this guardian number against the school's records or directly with the guardian.
                  </label>
                  <button type="button" disabled={!guardianVerified[item.id] || savingGuardian !== null}
                    onClick={() => saveGuardianContact(item.id)}
                    className="rounded-lg border border-amber-500/40 px-3 py-2 text-white disabled:opacity-40">
                    {savingGuardian === item.id ? 'Saving...' : 'Save verified guardian contact'}
                  </button>
                </div>
              ) : item.requires_guardian_review ? (
                <div className="space-y-2 w-full md:max-w-sm">
                  <p className="text-xs text-amber-300">The contact number appears against different guardian names. Verify whether this is a spelling issue or separate households. For a spelling error, correct the underlying student record first. For independently verified separate guardians, create an isolated parent identity below.</p>
                  <input type="text" value={distinctGuardianNames[item.id]||''} onChange={e=>setDistinctGuardianNames(prev=>({...prev,[item.id]:e.target.value}))} placeholder="Independently verified guardian name" className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white" />
                  <label className="flex gap-2 items-start text-xs text-slate-300"><input type="checkbox" checked={distinctVerified[item.id]===true} onChange={e=>setDistinctVerified(prev=>({...prev,[item.id]:e.target.checked}))} />I checked this particular student's actual guardian and verified that an isolated parent login is required.</label>
                  <button type="button" disabled={!distinctVerified[item.id]||(distinctGuardianNames[item.id]||'').trim().length<3||savingGuardian!==null} onClick={()=>saveDistinctGuardian(item.id)} className="rounded-lg border border-amber-500/40 px-3 py-2 text-white disabled:opacity-40">{savingGuardian===item.id?'Resolving...':'Create verified separate guardian'}</button>
                </div>
              ) : <button type="button" disabled={repairing !== null || issued !== null} onClick={() => repairOne('student', item.id)} className="rounded-lg bg-blue-600 px-3 py-2 text-white disabled:opacity-40">{repairing === `student-${item.id}` ? 'Repairing...' : 'Issue linked login'}</button>}
            </div>
          ))}
          {missing.teachers.map(item => (
            <div key={`teacher-${item.id}`} className="flex items-center justify-between gap-3 border border-slate-700 rounded-lg p-3 text-sm">
              <div className="text-white">{item.name} <span className="text-slate-400">({item.login_reference})</span> · Teacher login missing</div>
              <button type="button" disabled={repairing !== null || issued !== null} onClick={() => repairOne('teacher', item.id)} className="rounded-lg bg-blue-600 px-3 py-2 text-white disabled:opacity-40">{repairing === `teacher-${item.id}` ? 'Repairing...' : 'Issue linked login'}</button>
            </div>
          ))}
        </div>
        {issued && <div className="rounded-xl border border-amber-500/30 bg-slate-900 p-4 space-y-3">
          <h3 className="font-semibold text-amber-300">One-time credential handoff</h3>
          <p className="text-xs text-slate-400">Do not screenshot or publish these credentials. Existing linked account passwords have not been changed. Closing this section clears the credentials from the page.</p>
          {issued.map((item, i) => <div key={`${item.kind}-${i}`} className="border-t border-slate-700 pt-2 text-sm space-y-1">
            <p className="text-white">{item.kind}: {item.loginId}</p>
            <p className="text-slate-400">{item.created ? 'Newly created' : 'Existing link preserved'}</p>
            {item.temporaryPassword && <p className="text-amber-200 break-all">Temporary password: {item.temporaryPassword}</p>}
          </div>)}
          <button type="button" onClick={() => setIssued(null)} className="rounded-lg border border-slate-600 px-4 py-2 text-white">I have securely handed over the credentials — clear display</button>
        </div>}
      </section>

      <section className="glass-card p-5 mb-6 space-y-4" aria-label="Pending portal activation">
        <PortalSubheading eyebrow="SECURE ACTIVATION" title="Verified credential handoff" description="Prepared accounts have unknown random passwords until you verify each recipient. Deliver one-time credentials privately, never in school-wide groups."/>
        <p className="text-sm text-slate-300">Pending: {activations.filter(a=>a.state==='pending').length} · Issued, not confirmed: {activations.filter(a=>a.state==='issued').length} · Delivered: {activations.filter(a=>a.state==='delivered').length}</p>
        {activationCredential && <div className="border border-amber-500/40 rounded-xl p-4 bg-slate-900 space-y-2">
          <p className="font-semibold text-amber-300">One-time credential — private handoff only</p>
          <p className="text-white">{activationCredential.role}: {activationCredential.loginId}</p>
          <p className="break-all text-amber-200">Temporary password: {activationCredential.temporaryPassword}</p>
          <p className="text-xs text-slate-400">The recipient must change this password on first sign-in. Only confirm delivery once the correct recipient has it. Clearing this screen cannot retrieve the previous password.</p>
          <button type="button" disabled={activationBusy!==null} onClick={confirmActivation} className="rounded-lg bg-emerald-700 px-4 py-2 text-white">Confirmed privately delivered — clear credential</button>
          <button type="button" onClick={()=>setActivationCredential(null)} className="ml-2 rounded-lg border border-slate-600 px-3 py-2 text-white">Clear without confirming (requires reissue)</button>
        </div>}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {activations.filter(a=>a.state!=='delivered').map(record=><div key={record.id} className="rounded-lg border border-slate-700 p-3 text-sm space-y-2">
            <p className="text-white">{record.name} · {record.portal_role} <span className="text-slate-400">{record.login_id} · {record.state}</span></p>
            <label className="flex items-start gap-2 text-xs text-slate-300"><input type="checkbox" checked={verifiedRecipients[record.id]===true} onChange={e=>setVerifiedRecipients(prev=>({...prev,[record.id]:e.target.checked}))}/>
              I independently verified the recipient from school records or in person and can hand them the credential privately.</label>
            {record.state==='issued' && <input type="text" value={activationReason[record.id]||''} onChange={e=>setActivationReason(prev=>({...prev,[record.id]:e.target.value}))} placeholder="Reason a lost credential needs reissue" className="w-full rounded-lg bg-slate-900 border border-slate-600 p-2 text-white"/>}
            <button type="button" disabled={!verifiedRecipients[record.id]||activationBusy!==null||activationCredential!==null||(record.state==='issued'&&(activationReason[record.id]||'').trim().length<8)} onClick={()=>issueActivation(record)} className="rounded-lg bg-blue-600 px-3 py-2 text-white disabled:opacity-40">{activationBusy===record.id?'Issuing...':record.state==='issued'?'Reissue after verification':'Issue one-time credential'}</button>
          </div>)}
        </div>
      </section>

      <section className="glass-card overflow-hidden" aria-label="School user directory">
        <div className="p-5 sm:p-6 border-b border-[#e7eae3]"><PortalSubheading eyebrow="DIRECTORY" title="School portal users" description={`${matchingUsers.length} matching users. Role permissions are enforced by the server, not this visual table.`}/></div>
        <div className="overflow-x-auto relative min-h-[250px]">
          <table className="cw-data-table">
              <thead>
                <tr>
                  <th className="px-6 py-4">Name & Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Access Control</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {matchingUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      {search.trim() ? 'No users match this search.' : 'No linked portal users were returned.'}
                    </td>
                  </tr>
                ) : (
                  matchingUsers.map((u) => (
                    <motion.tr 
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{u.name}</div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full border border-[#dbe4dc] bg-[#f1f5ef] px-3 py-1 text-[11px] font-semibold capitalize text-[#465a4b]">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="cw-status" data-status={u.status==='Active'?'active':'inactive'}>{u.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span title="Actual permissions are enforced by the role-scoped API" className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#466754]"><Shield size={15} aria-hidden="true"/> Role-based</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            title="Set a new password" aria-label={`Set password for ${u.name}`} 
                            onClick={() => { setShowPasswordModal(u.email); setError(''); setSuccess(''); }} 
                            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                          >
                            <Lock className="w-4 h-4" />
                          </button>

                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
          </table>
        </div>
      </section>

      {showAddModal && (
        <div className="cw-modal-backdrop" role="presentation">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="cw-modal-panel max-w-md" role="dialog" aria-modal="true" aria-label="Create administrator">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Issue Login Credentials</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm border border-red-500/20">{error}</div>}
            {success && <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm border border-emerald-500/20">{success}</div>}
            
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Email / Login ID</label>
                <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Role</label>
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="admin">Admin</option>
                </select>
                <p className="mt-1 text-xs text-slate-500">Teacher, student, and parent identities are provisioned from their linked records.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
                <div className="relative">
                  <input required type={showPwd ? "text" : "password"} value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500 outline-none" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button disabled={loading} type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50">
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {showPasswordModal && (
        <div className="cw-modal-backdrop" role="presentation">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="cw-modal-panel max-w-sm" role="dialog" aria-modal="true" aria-label="Set user password">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Reset Password</h3>
              <button onClick={() => setShowPasswordModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-slate-400 mb-4">Set a new password for <strong className="text-white">{showPasswordModal}</strong>.</p>
            
            {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm border border-red-500/20">{error}</div>}
            {success && <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm border border-emerald-500/20">{success}</div>}
            
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">New Password</label>
                <div className="relative">
                  <input required type={showPwd ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500 outline-none" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button disabled={loading} type="submit" className="w-full mt-4 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50">
                {loading ? 'Updating...' : 'Set Password'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
