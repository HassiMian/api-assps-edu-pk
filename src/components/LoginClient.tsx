"use client";

import { useState, useEffect } from 'react';
import { BrainCircuit, Lock, Mail, ArrowRight, ShieldAlert, Eye, EyeOff, ArrowLeft, Shield, Users, GraduationCap, User, Building, MonitorPlay } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import PremiumLogo from '@/components/PremiumLogo';
import { useAuth } from '@/context/AuthContext';
import { resolveAssetUrl } from '@/utils/media';
import { coerceConnectRedirect, getConnectPortalPath } from '@/lib/connectPortal';
import { shouldAttachSchoolScope } from '@/lib/platform';
import { normalizeRoleKey } from '@/lib/roleRoutes';

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

const roles = [
  { id: 'admin', name: 'School Admin Login', icon: Shield, color: 'from-blue-600 to-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-300', ring: 'focus:ring-cyan-500', gradient: 'from-blue-600 to-cyan-500', shadow: 'shadow-cyan-500/20', placeholder: 'admin@school.com' },
  { id: 'teacher', name: 'Teacher Login', icon: Users, color: 'from-emerald-500 to-teal-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', ring: 'focus:ring-emerald-500', gradient: 'from-emerald-600 to-teal-500', shadow: 'shadow-emerald-500/20', placeholder: 'T-001 or teacher email' },
  { id: 'student', name: 'Student Login', icon: GraduationCap, color: 'from-sky-500 to-blue-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', text: 'text-sky-300', ring: 'focus:ring-sky-500', gradient: 'from-sky-600 to-blue-500', shadow: 'shadow-sky-500/20', placeholder: 'MIG26-005' },
  { id: 'parent', name: 'Parent Login', icon: User, color: 'from-amber-500 to-orange-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', ring: 'focus:ring-amber-500', gradient: 'from-amber-600 to-orange-500', shadow: 'shadow-amber-500/20', placeholder: 'P-005 or parent phone' },
];

export default function LoginClient() {
  const router = useRouter();
  const { user, loading: authLoading, login: contextLogin } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [schoolCode, setSchoolCode] = useState<string | null>(null);
  const [schoolCodeInput, setSchoolCodeInput] = useState('');
  const [findingSchool, setFindingSchool] = useState(false);
  const [schoolName, setSchoolName] = useState('Al Siddique Scholars Public School');
  const [resetOpen, setResetOpen] = useState(false);
  const [resetStep, setResetStep] = useState<'request' | 'confirm'>('request');
  const [resetLogin, setResetLogin] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    if (!params) return
    if (params.get('choose') === '1') return
    if (params.get('logout') === '1') {
      fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).finally(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        localStorage.removeItem('loginAt')
        localStorage.removeItem('al_siddique_token')
        localStorage.removeItem('al_siddique_refresh_token')
        localStorage.removeItem('al_siddique_user')
        window.location.replace('/login?cleared=1')
      })
      return
    }
    if (params.get('cleared') === '1' || params.get('force') === '1') return
    const next = params.get("next") || "";
    const safeNext =
      next === "/dashboard" || next.startsWith("/dashboard/") ? "/admin" : next;
    if (!authLoading && user?.role) {
      const normalizedRole = normalizeRoleKey(user.role);
      if (normalizedRole === "saas_admin" || normalizedRole === "super_admin") {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        localStorage.removeItem('loginAt')
        localStorage.removeItem('al_siddique_token')
        localStorage.removeItem('al_siddique_refresh_token')
        localStorage.removeItem('al_siddique_user')
        window.location.replace('/login?cleared=1')
        return
      }
      const dest = safeNext
        ? coerceConnectRedirect(safeNext, user.role)
        : getConnectPortalPath(user.role);
      if (dest.startsWith("http")) {
        window.location.replace(dest);
      } else {
        router.replace(dest);
      }
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    const selectedSchoolId = params?.get('school_id') || params?.get('schoolId') || null
    const selectedSchoolCode = params?.get('school_code') || params?.get('schoolCode') || null
    const selectedRoleParam = params?.get('role')?.toLowerCase() || null
    if (params?.get('choose') === '1') {
      setSchoolId('default')
      setSchoolCode('DEFAULT')
      setSchoolName('APEX AI School OS')
      setSchoolLogo(null)
      setSelectedRole(null)
      return
    }
    setSchoolId(selectedSchoolId)
    setSchoolCode(selectedSchoolCode)
    if (selectedRoleParam && roles.some(r => r.id === selectedRoleParam)) {
      setSelectedRole(selectedRoleParam)
    }
    api.get('/settings/public', {
      params: selectedSchoolId ? { school_id: selectedSchoolId } : selectedSchoolCode ? { school_code: selectedSchoolCode } : undefined,
    })
      .then((r) => { 
        if (r.data?.data?.school_id) setSchoolId(String(r.data.data.school_id));
        if (r.data?.data?.school_code) setSchoolCode(r.data.data.school_code);
        if (r.data?.data?.school_logo) setSchoolLogo(r.data.data.school_logo); 
        if (r.data?.data?.school_name) setSchoolName(r.data.data.school_name);
        if (r.data?.data?.branding_config?.loginBackground) {
          document.documentElement.style.setProperty("--login-bg", `url(${resolveAssetUrl(r.data.data.branding_config.loginBackground)})`);
        } else {
          document.documentElement.style.removeProperty("--login-bg");
        }
      })
      .catch(() => {});
  }, []);

  const handleFindSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolCodeInput.trim()) return;
    setError('');
    setFindingSchool(true);
    try {
      const res = await api.get('/settings/public', { params: { school_code: schoolCodeInput.trim() } });
      const data = res.data;
      if (data?.success && data?.data) {
        setSchoolId(data.data.school_id ? String(data.data.school_id) : null);
        setSchoolCode(data.data.school_code || null);
        if (data.data.school_logo) setSchoolLogo(data.data.school_logo);
        if (data.data.school_name) setSchoolName(data.data.school_name);
        if (data.data.branding_config?.loginBackground) {
          document.documentElement.style.setProperty("--login-bg", `url(${resolveAssetUrl(data.data.branding_config.loginBackground)})`);
        } else {
          document.documentElement.style.removeProperty("--login-bg");
        }
      } else {
        setSchoolId(null);
        setSchoolCode(null);
        setSchoolLogo(null);
        setSchoolName('Al Siddique Scholars Public School');
        setError('School code not found. Continuing with the default portal.');
      }
    } catch {
      setSchoolId(null);
      setSchoolCode(null);
      setSchoolLogo(null);
      setSchoolName('Al Siddique Scholars Public School');
      setError('Unable to verify school code. Continuing with the default portal.');
    }
    setFindingSchool(false);
  };

  const activeRole = roles.find((r) => r.id === selectedRole);
  const selectedBrand = "APEX CONNECT";

  const openDefaultSelector = () => {
    setError('');
    setSchoolId('default');
    setSchoolCode('DEFAULT');
    setSchoolName('APEX AI School OS');
    setSchoolLogo(null);
    setSelectedRole(null);
  };

  const openDemoAccess = () => {
    setError('');
    setSchoolId('demo');
    setSchoolCode('DEMO');
    setSchoolName('APEX Demo Tenant');
    setSchoolLogo(null);
    setSelectedRole('admin');
    setEmail('demo@apex.assps.edu.pk');
  };

  const openSuperAdmin = () => {
    setError('');
    setSchoolId('super-admin');
    setSchoolCode('APEX');
    setSchoolName('APEX Super Admin');
    setSchoolLogo(null);
    setSelectedRole('admin');
    setEmail('superadmin@apex.assps.edu.pk');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!selectedRole) {
      setError('Please select a portal role before logging in.');
      setLoading(false);
      return;
    }

    try {
      const body: Record<string, unknown> = { email, password };
      if (selectedRole) body.role = selectedRole;
      if (shouldAttachSchoolScope(schoolId, schoolCode)) {
        if (schoolCode) body.school_code = schoolCode;
        else if (schoolId) body.school_id = schoolId;
      }

      const loginRes = await fetchWithTimeout("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      }, 15000);
      const data = await loginRes.json().catch(() => ({}));
      if (!loginRes.ok && !data?.success) {
        setError(data?.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      if (data.success) {
        contextLogin(data.token, data.refreshToken || null, data.user);
        if (data.token) {
          try {
            await fetchWithTimeout("/api/auth/sync-session", {
              method: "POST",
              headers: { Authorization: `Bearer ${data.token}` },
              credentials: "include",
            }, 6000);
          } catch {
            /* client redirect still works via localStorage */
          }
        }
        if (data.mustChangePassword && data.redirectTo) {
          window.location.replace(
            coerceConnectRedirect(String(data.redirectTo), data.user?.role, selectedRole || undefined)
          );
          return;
        }
        const portal = getConnectPortalPath(
          data.user?.role || selectedRole || "admin",
          selectedRole || undefined
        );
        if (portal.startsWith("http")) {
          window.location.replace(portal);
        } else {
          window.location.replace(new URL(portal, window.location.origin).href);
        }
        return;
      }

      setError(data.message || 'Invalid email or password.');
    } catch (error) {
      console.error('Login request failed:', error);
      setError('Login request timed out or the authentication service is unreachable. Please try again.');
    }

    setLoading(false);
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage('');
    setError('');
    try {
      const res = await api.post('/auth/password-reset/request', {
        loginId: resetLogin || email,
        role: selectedRole,
        school_id: schoolId,
        school_code: schoolCode,
      });
      setResetToken(res.data?.resetToken || '');
      setResetStep('confirm');
      setResetMessage(res.data?.message || 'OTP sent to the registered phone number.');
    } catch (err: any) {
      setResetMessage(err?.response?.data?.message || 'Unable to send OTP right now.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage('');
    try {
      const res = await api.post('/auth/password-reset/confirm', {
        resetToken,
        otp: resetOtp,
        newPassword: resetPassword,
      });
      setResetMessage(res.data?.message || 'Password updated. Please login with the new password.');
      setPassword('');
      setResetOtp('');
      setResetPassword('');
      setTimeout(() => setResetOpen(false), 1200);
    } catch (err: any) {
      setResetMessage(err?.response?.data?.message || 'Unable to reset password.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-3 sm:p-4" style={{ background: "var(--login-bg, var(--color-background, #0f172a))", backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="w-full max-w-5xl">
        <div className="bg-card/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-5 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>

          {!schoolId && !schoolCode ? (
            <div className="space-y-8 sm:space-y-10">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
                  <Building className="text-white w-8 h-8" />
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight text-center">Find Your School</h1>
                <p className="text-slate-400 text-sm mt-2 text-center">Enter a school code, choose demo access, or open the APEX portal selector.</p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleFindSchool} className="space-y-4 max-w-sm mx-auto">
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      required
                      value={schoolCodeInput}
                      onChange={(e) => setSchoolCodeInput(e.target.value)}
                      className={`w-full bg-black/20 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                      placeholder="********"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={findingSchool}
                  className="w-full mt-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  {findingSchool ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      Continue <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mx-auto grid max-w-2xl gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={openDefaultSelector}
                  className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-left transition hover:border-cyan-300/40"
                >
                  <Building className="h-5 w-5 text-cyan-200" />
                  <div className="mt-3 text-sm font-bold text-white">Login Selector</div>
                  <div className="mt-1 text-xs text-slate-400">Admin, teacher, parent, student</div>
                </button>
                <button
                  type="button"
                  onClick={openDemoAccess}
                  className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-left transition hover:border-emerald-300/40"
                >
                  <MonitorPlay className="h-5 w-5 text-emerald-200" />
                  <div className="mt-3 text-sm font-bold text-white">Demo Access</div>
                  <div className="mt-1 text-xs text-slate-400">Uses demo tenant only</div>
                </button>
                <button
                  type="button"
                  onClick={openSuperAdmin}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-left transition hover:border-cyan-300/40"
                >
                  <Shield className="h-5 w-5 text-cyan-200" />
                  <div className="mt-3 text-sm font-bold text-white">Super Admin Login</div>
                  <div className="mt-1 text-xs text-slate-400">Subscription verification</div>
                </button>
              </div>
            </div>
          ) : !selectedRole ? (
            <div className="space-y-8 sm:space-y-10">
              <div className="flex flex-col items-center">
                {schoolLogo ? (
                  <PremiumLogo src={schoolLogo} size={88} className="mb-4" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
                    <BrainCircuit className="text-white w-8 h-8" />
                  </div>
                )}
                <h1 className="text-xl font-bold text-white tracking-tight text-center">{schoolName}</h1>
                <p className="text-xs font-bold tracking-widest mt-1 mb-2" style={{ color: '#C8991A' }}>SUPER APP · api.assps.edu.pk</p>
                <p className="text-slate-400 text-sm">Select your portal to continue</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => { setError(''); setSelectedRole(role.id); }}
                    className={`p-4 sm:p-6 rounded-2xl border ${role.border} ${role.bg} hover:bg-opacity-20 transition-all text-left group`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-4 shadow-lg ${role.shadow}`}>
                      <role.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">{role.name}</h3>
                    <p className="text-slate-400 text-sm">Secure access for {role.id}s</p>
                  </button>
                ))}
              </div>
              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => { setSchoolId(null); setSchoolCode(null); setError(''); }}
                  className="text-slate-400 hover:text-white text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Change School
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-center">
              <div className="flex flex-col items-center justify-center py-4 sm:py-6 border-b md:border-b-0 md:border-r border-slate-700/50 pb-6 md:pb-0 md:pr-8">
                {schoolLogo ? (
                  <PremiumLogo src={schoolLogo} size={104} className="mb-6" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg mb-5">
                    <BrainCircuit className="text-white w-10 h-10" />
                  </div>
                )}
                <h2 className="text-lg font-bold text-white text-center tracking-tight">{schoolName}</h2>
                <p className="text-xs font-bold tracking-widest mt-1 mb-5" style={{ color: '#C8991A' }}>{selectedBrand}</p>
                {activeRole && (
                  <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl ${activeRole.bg} border ${activeRole.border}`}>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeRole.color} flex items-center justify-center flex-shrink-0`}>
                      <activeRole.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className={`font-bold text-sm ${activeRole.text}`}>{activeRole.name}</p>
                      <p className="text-slate-400 text-xs">Secure access portal</p>
                    </div>
                  </div>
                )}
                <p className="mt-5 text-slate-500 text-xs italic text-center">"Shaping Minds · Building Futures"</p>
              </div>

              <div>
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}



                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Login ID</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-500" />
                      </div>
                      <input
                        type="text"
                        autoComplete="username"
                        inputMode={selectedRole === 'admin' ? 'email' : 'text'}
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full bg-black/20 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 ${activeRole?.ring} transition-all`}
                        placeholder={activeRole?.placeholder}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-500" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full bg-black/20 border border-slate-700 text-white rounded-xl pl-10 pr-12 py-3 focus:outline-none focus:ring-2 ${activeRole?.ring} transition-all`}
                        placeholder="********"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full mt-1 bg-gradient-to-r ${activeRole?.gradient} text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg ${activeRole?.shadow}`}
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        Secure Login <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-3 text-right">
                  <button
                    type="button"
                    onClick={() => { setResetOpen(true); setResetStep('request'); setResetLogin(email); setResetMessage(''); }}
                    className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    Forgot / Reset Password?
                  </button>
                </div>

                <div className="mt-5 text-center">
                  <button
                    type="button"
                    onClick={() => { setSelectedRole(null); setError(''); setEmail(''); setPassword(''); }}
                    className="text-slate-400 hover:text-white text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Portal Selection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {selectedRole && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setSelectedRole(null)}
            className="text-slate-400 hover:text-white text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Change Portal
          </button>
        </div>
      )}
      {resetOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-[#101b31] p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Reset Password</h3>
                <p className="mt-1 text-sm text-slate-400">OTP will be sent to the official registered phone number.</p>
              </div>
              <button type="button" onClick={() => setResetOpen(false)} className="rounded-xl border border-slate-700 px-3 py-2 text-slate-300 hover:text-white">Close</button>
            </div>
            {resetMessage && <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-200">{resetMessage}</div>}
            {resetStep === 'request' ? (
              <form onSubmit={handleResetRequest} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm text-slate-400">Login ID</label>
                  <input value={resetLogin} onChange={e => setResetLogin(e.target.value)} required className="w-full rounded-xl border border-slate-700 bg-black/20 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder={activeRole?.placeholder || 'Login ID'} />
                </div>
                <button disabled={resetLoading} className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3 font-bold text-white disabled:opacity-60">
                  {resetLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetConfirm} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm text-slate-400">OTP</label>
                  <input value={resetOtp} onChange={e => setResetOtp(e.target.value)} required maxLength={6} className="w-full rounded-xl border border-slate-700 bg-black/20 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="6 digit OTP" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-slate-400">New Password</label>
                  <input type="password" value={resetPassword} onChange={e => setResetPassword(e.target.value)} required minLength={8} className="w-full rounded-xl border border-slate-700 bg-black/20 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Minimum 8 characters" />
                </div>
                <button disabled={resetLoading} className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 py-3 font-bold text-white disabled:opacity-60">
                  {resetLoading ? 'Updating...' : 'Verify OTP & Change Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
