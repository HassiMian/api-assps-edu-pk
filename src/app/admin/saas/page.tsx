"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { Server, Settings, RefreshCw, BrainCircuit, FileText, MapPin, BarChart3, Megaphone, BookOpen, MessageSquare, GraduationCap, Building, Upload, Save, ImageIcon, ClipboardCheck, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import SchoolHero from '@/components/SchoolHero';
import { resolveAssetUrl } from '@/utils/media';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_URL || '/api';

const moduleIcons: Record<string, any> = {
  'paper-gen': FileText,
  'quiz-engine': BrainCircuit,
  'attendance': MapPin,
  'analytics': BarChart3,
  'announcements': Megaphone,
  'homework': BookOpen,
  'messaging': MessageSquare,
  'admissions': GraduationCap,
};

type DemoRequest = {
  id: number;
  school_name: string;
  contact_name: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  students_count?: string | null;
  message?: string | null;
  status: 'pending_approval' | 'approved' | 'rejected';
  created_at?: string;
};

export default function AdminSaaSControl() {
  const { user } = useAuth();
  const [modules, setModules] = useState([
    { id: 'paper-gen', name: 'Paper Studio', enabled: true },
    { id: 'quiz-engine', name: 'Quiz Engine', enabled: true },
    { id: 'attendance', name: 'Presence Matrix', enabled: true },
    { id: 'analytics', name: 'Intelligence Board', enabled: false },
    { id: 'announcements', name: 'Alert Center', enabled: true },
    { id: 'homework', name: 'Homework Assistant', enabled: true },
    { id: 'messaging', name: 'Comms Hub', enabled: true },
    { id: 'admissions', name: 'Admissions Control', enabled: false },
  ]);

  const toggleModule = (id: string) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  const activeCount = modules.filter(m => m.enabled).length;
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');
  const [schoolName, setSchoolName] = useState('Al Siddique Scholars Public School');
  const [schoolCode, setSchoolCode] = useState<string | null>(null);
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#C8991A');
  const [typography, setTypography] = useState('inter');
  const [darkMode, setDarkMode] = useState(true);
  const [glassEffect, setGlassEffect] = useState(true);
  const [loginBackground, setLoginBackground] = useState<string | null>(null);
  const loginBgInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [demoRequests, setDemoRequests] = useState<DemoRequest[]>([]);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoAction, setDemoAction] = useState<string | null>(null);

  const loadDemoRequests = useCallback(async () => {
    setDemoLoading(true);
    try {
      const res = await api.get('/demo-requests?status=all');
      setDemoRequests(res.data?.data || []);
    } catch (error) {
      console.error('Failed to load demo requests:', error);
      setDemoRequests([]);
    } finally {
      setDemoLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDemoRequests();
  }, [loadDemoRequests]);

  const updateDemoRequest = async (id: number, status: DemoRequest['status']) => {
    setDemoAction(`${id}_${status}`);
    try {
      await api.patch(`/demo-requests/${id}/status`, { status });
      await loadDemoRequests();
    } catch (error) {
      console.error('Failed to update demo request:', error);
      alert('Failed to update demo request. Please try again.');
    } finally {
      setDemoAction(null);
    }
  };

  useEffect(() => {
    const publicParams = user?.school_code
      ? { school_code: user.school_code }
      : user?.school_id
        ? { school_id: user.school_id }
        : undefined;

    api.get('/settings/public', { params: publicParams })
      .then((res) => {
        const data = res.data?.data || {};
        if (data.school_name) setSchoolName(data.school_name);
        if (data.school_code) setSchoolCode(data.school_code);
        if (data.school_logo) setSchoolLogo(resolveAssetUrl(data.school_logo));
        if (data.branding_config) {
            setPrimaryColor(data.branding_config.primaryColor || '#C8991A');
            setTypography(data.branding_config.typography || 'inter');
            setDarkMode(data.branding_config.darkMode ?? true);
            setGlassEffect(data.branding_config.glassEffect ?? true);
            setLoginBackground(data.branding_config.loginBackground || null);
        }
      })
      .catch(() => {});
  }, [user?.school_code, user?.school_id]);

  const testConnection = useCallback(async () => {
    setTestStatus('testing');
    try {
      await api.get('/health'.replace('/api', ''));
      setTestStatus('ok');
    } catch {
      try { await api.get('/students?limit=1'); setTestStatus('ok'); }
      catch { setTestStatus('fail'); }
    }
    setTimeout(() => setTestStatus('idle'), 4000);
  }, []);

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSchoolLogo(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };


  const handleLoginBgSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLoginBackground(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBranding = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await api.patch('/settings/logo', {
        school_logo: schoolLogo,
        school_name: schoolName,
        school_code: schoolCode,
        branding_config: { primaryColor, typography, darkMode, glassEffect, loginBackground }
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save branding. Please try again.');
    }
    setSaving(false);
  };

  return (
    <DashboardLayout role="admin" title="SaaS Control Center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6 md:p-8 xl:p-10 mt-6"
      >
        <div className="flex items-center gap-3 mb-6 border-b border-slate-700/50 pb-4">
          <Building className="w-6 h-6 text-[#C8991A]" />
          <h2 className="text-xl font-bold text-white tracking-tight">Apex Connect Branding & Identity</h2>
        </div>
        
        <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1.05fr)_minmax(560px,0.95fr)] gap-8 xl:gap-10 items-start">
          <div className="space-y-6">
            <div className="p-4 md:p-5 bg-slate-800/30 border border-slate-700/50 rounded-2xl space-y-4">
                <h3 className="text-white font-bold mb-2">General Info</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">School Name</label>
                  <input 
                    type="text" 
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="e.g. Al Siddique Scholars Public School" 
                    className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">School Logo</label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-slate-900/80 border-2 border-dashed border-slate-600 flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
                      {schoolLogo ? (
                        <img src={resolveAssetUrl(schoolLogo)} alt="School Logo" className="w-full h-full object-contain p-2" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-600" />
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => setSchoolLogo(null)} className="text-[10px] font-bold text-red-400 bg-red-500/20 px-2 py-1 rounded">Clear</button>
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-3 w-full">
                      <button onClick={() => fileInputRef.current?.click()} className="bg-slate-700 hover:bg-slate-600 w-full text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm">
                        <Upload className="w-4 h-4" /> Upload Logo
                      </button>
                      <input type="file" ref={fileInputRef} onChange={handleLogoSelect} accept="image/*" className="hidden" />
                    </div>
                  </div>
                </div>
            </div>

            <div className="p-4 md:p-5 bg-slate-800/30 border border-slate-700/50 rounded-2xl space-y-4">
                <h3 className="text-white font-bold mb-2">Advanced Branding & Theming</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Primary Brand Color</label>
                  <div className="flex gap-4">
                    <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer bg-slate-900 border border-slate-700" />
                    <input type="text" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="flex-1 bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 focus:outline-none uppercase font-mono" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Typography</label>
                  <select value={typography} onChange={e => setTypography(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none">
                    <option value="inter">Inter (Modern & Clean)</option>
                    <option value="outfit">Outfit (Geometric & Tech)</option>
                    <option value="playfair">Playfair Display (Elegant)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 border border-slate-700 p-3 rounded-xl flex items-center justify-between">
                        <span className="text-sm text-slate-300">Dark Mode</span>
                        <button onClick={() => setDarkMode(!darkMode)} className={`w-10 h-5 rounded-full relative transition-colors ${darkMode ? 'bg-amber-500' : 'bg-slate-600'}`}>
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0'}`}></span>
                        </button>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-700 p-3 rounded-xl flex items-center justify-between">
                        <span className="text-sm text-slate-300">Glassmorphism</span>
                        <button onClick={() => setGlassEffect(!glassEffect)} className={`w-10 h-5 rounded-full relative transition-colors ${glassEffect ? 'bg-amber-500' : 'bg-slate-600'}`}>
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${glassEffect ? 'translate-x-5' : 'translate-x-0'}`}></span>
                        </button>
                    </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mt-2 mb-2">Login Background Image</label>
                  <div className="flex items-center gap-4">
                      {loginBackground && (
                          <div className="w-16 h-10 bg-cover bg-center rounded-lg border border-slate-700" style={{ backgroundImage: `url(${resolveAssetUrl(loginBackground)})` }}></div>
                      )}
                      <button onClick={() => loginBgInputRef.current?.click()} className="bg-slate-700 hover:bg-slate-600 flex-1 text-white text-sm font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" /> Upload BG
                      </button>
                      {loginBackground && (
                         <button onClick={() => setLoginBackground(null)} className="bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm font-bold hover:bg-red-500/30">Clear</button>
                      )}
                      <input type="file" ref={loginBgInputRef} onChange={handleLoginBgSelect} accept="image/*" className="hidden" />
                  </div>
                </div>
            </div>
            
            <div className="pt-4 flex items-center justify-between gap-4 flex-wrap">
              <div>
                {success && (
                  <span className="text-emerald-400 text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Branding saved!
                  </span>
                )}
              </div>
              <button 
                onClick={handleSaveBranding}
                disabled={saving}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold py-2.5 px-6 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Sync Enterprise Configurations
              </button>
            </div>
          </div>
          
          <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-6 md:p-8 flex flex-col justify-center items-center text-center overflow-hidden relative min-h-[46rem]">
             <div className="mb-4 z-10 p-6 rounded-2xl shadow-xl w-full flex-1" style={{ background: glassEffect ? 'rgba(15,23,42,0.6)' : '#0f172a', backdropFilter: glassEffect ? 'blur(16px)' : 'none', border: `1px solid ${primaryColor}40` }}>
                <SchoolHero schoolName={schoolName} schoolLogo={schoolLogo} compact />
                <div className="mt-6 w-full h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-lg" style={{ background: primaryColor }}>
                    Sample Primary Button
                </div>
             </div>
             <p className="text-xs text-slate-400 mt-2 z-10">
               Live preview of Identity Rules.
             </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card p-6 md:p-8 mt-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-700/50 pb-4">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="w-6 h-6 text-[#C8991A]" />
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Apex Gateway Demo Requests</h2>
              <p className="text-sm text-slate-400">Controlled demo access requests from the APEX gateway.</p>
            </div>
          </div>
          <button onClick={loadDemoRequests} disabled={demoLoading} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold">
            <RefreshCw className={`w-4 h-4 ${demoLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {demoLoading && demoRequests.length === 0 ? (
          <div className="text-slate-400 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading demo requests...
          </div>
        ) : demoRequests.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-5 text-slate-400">
            No demo requests yet.
          </div>
        ) : (
          <div className="grid gap-3">
            {demoRequests.map((request) => (
              <div key={request.id} className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-white font-bold">{request.school_name}</h3>
                    <span className={`text-[11px] uppercase font-bold px-2 py-1 rounded-full border ${
                      request.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                        : request.status === 'rejected'
                          ? 'bg-red-500/10 text-red-300 border-red-500/20'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                    }`}>
                      {request.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">
                    {request.contact_name} · {request.phone}
                    {request.email ? ` · ${request.email}` : ''}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {request.city || 'City not provided'} · {request.students_count || 'Students count not provided'}
                  </p>
                  {request.message && <p className="text-sm text-slate-400 mt-2 line-clamp-2">{request.message}</p>}
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    onClick={() => updateDemoRequest(request.id, 'approved')}
                    disabled={!!demoAction || request.status === 'approved'}
                    className="px-3 py-2 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 text-sm font-bold flex items-center gap-2 disabled:opacity-50"
                  >
                    {demoAction === `${request.id}_approved` ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Approve
                  </button>
                  <button
                    onClick={() => updateDemoRequest(request.id, 'rejected')}
                    disabled={!!demoAction || request.status === 'rejected'}
                    className="px-3 py-2 rounded-xl bg-red-500/15 text-red-300 border border-red-500/20 text-sm font-bold flex items-center gap-2 disabled:opacity-50"
                  >
                    {demoAction === `${request.id}_rejected` ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-slate-800/80 text-[#C8991A] rounded-xl border border-slate-700/50">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Backend Connection</h3>
              <p className="text-slate-400 text-sm">Status of Al-Siddique OS</p>
            </div>
          </div>
          
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700 font-mono text-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400">Endpoint:</span>
              <span className="text-slate-300">{API_ENDPOINT}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400">Latency:</span>
              <span className="text-emerald-400">24ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Status:</span>
              <span className="flex items-center gap-2 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Connected
              </span>
            </div>
          </div>
          
          <button onClick={testConnection} disabled={testStatus === 'testing'} className={`w-full mt-4 py-2 rounded-xl transition-colors flex items-center justify-center gap-2 ${testStatus === 'ok' ? 'bg-emerald-500/20 text-emerald-400' : testStatus === 'fail' ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}>
            <RefreshCw className={`w-4 h-4 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
            {testStatus === 'testing' ? 'Testing…' : testStatus === 'ok' ? '✓ Backend Responding' : testStatus === 'fail' ? '✗ Connection Failed' : 'Test Connection'}
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-slate-800/80 text-[#C8991A] rounded-xl border border-slate-700/50">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Module Management</h3>
              <p className="text-slate-400 text-sm">{activeCount} of {modules.length} modules active</p>
            </div>
          </div>

          <div className="space-y-2">
            {modules.map(module => {
              const Icon = moduleIcons[module.id] || Settings;
              return (
                <div key={module.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${module.enabled ? 'bg-slate-800/70 text-emerald-400 border border-slate-700/50' : 'bg-slate-700/50 text-slate-500'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className={`text-sm font-medium block ${module.enabled ? 'text-white' : 'text-slate-500'}`}>{module.name}</span>
                      <span className={`text-xs ${module.enabled ? 'text-emerald-400' : 'text-slate-600'}`}>{module.enabled ? 'Active' : 'Disabled'}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleModule(module.id)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      module.enabled ? 'bg-emerald-500' : 'bg-slate-600'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                      module.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}></span>
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      

      
    </DashboardLayout>
  );
}
