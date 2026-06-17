"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { Upload, Save, Building, Image as ImageIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import PremiumLogo from '@/components/PremiumLogo';
import { resolveAssetUrl } from '@/utils/media';

export default function AdminSettings() {
  const { user } = useAuth();
  const [logo, setLogo] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState('');
  const [schoolCode, setSchoolCode] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch current public settings
    const publicParams = user?.school_code
      ? { school_code: user.school_code }
      : user?.school_id
        ? { school_id: user.school_id }
        : undefined;

    api.get('/settings/public', { params: publicParams })
      .then(res => {
        if (res.data?.success && res.data?.data) {
          if (res.data.data.school_logo) setLogo(resolveAssetUrl(res.data.data.school_logo));
          if (res.data.data.school_name) setSchoolName(res.data.data.school_name);
          if (res.data.data.school_code) setSchoolCode(res.data.data.school_code);
        }
      })
      .catch(console.error);
  }, [user]);

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogo(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await api.patch('/settings/logo', {
        school_logo: logo,
        school_name: schoolName,
        school_code: schoolCode,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    }
    setSaving(false);
  };

  if (!user) return null;

  return (
    <DashboardLayout role="admin" title="System Settings">
      <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1.15fr)_minmax(560px,0.95fr)] gap-8 xl:gap-10 items-start">
        
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 md:p-8 xl:p-10"
          >
            <div className="flex items-center gap-3 mb-6 border-b border-slate-700/50 pb-4">
              <Building className="w-6 h-6 text-[#C8991A]" />
              <h2 className="text-xl font-bold text-white tracking-tight">School Branding</h2>
            </div>
            
            <div className="space-y-6">
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
                <div className="flex items-center gap-6 p-5 rounded-2xl bg-slate-800/30 border border-slate-700/50">
                  <div className="w-28 h-28 rounded-xl bg-slate-900/80 border-2 border-dashed border-slate-600 flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
                    {logo ? (
                      <img src={resolveAssetUrl(logo)} alt="School Logo" className="w-full h-full object-contain p-2" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-600" />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => setLogo(null)}
                        className="text-xs font-bold text-red-400 bg-red-500/20 px-2 py-1 rounded"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-2.5 px-4 rounded-lg flex items-center gap-2 transition-colors text-sm"
                    >
                      <Upload className="w-4 h-4" />
                      Upload New Logo
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleLogoSelect} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <p className="text-xs text-slate-500">
                      Recommended size: 200x200 pixels. Transparent PNG or SVG.<br/>
                      This logo will appear on Apex OS and Apex Connect login screens.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700/50 flex items-center justify-between">
              <div>
                {success && (
                  <span className="text-emerald-400 text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Branding updated successfully!
                  </span>
                )}
              </div>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold py-2.5 px-6 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Settings
              </button>
            </div>
          </motion.div>
        </div>

        <div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 md:p-8 xl:p-10 h-full min-h-[46rem]"
          >
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Login Preview</h3>
            
            <div className="rounded-2xl bg-slate-900 border border-slate-700/50 p-8 flex-1 flex flex-col items-center justify-center text-center min-h-[34rem]">
              {logo ? (
                <PremiumLogo src={logo} size={88} className="mb-4" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center shadow-lg shadow-black/20 mb-4">
                  <Building className="text-amber-300 w-8 h-8" />
                </div>
              )}
              <h1 className="text-lg font-bold text-white tracking-tight">{schoolName || 'Al Siddique Scholars Public School'}</h1>
              <p className="text-[10px] font-bold tracking-widest mt-1 text-[#C8991A]">APEX OS</p>
            </div>
            
            <p className="text-xs text-slate-500 mt-6 text-center leading-relaxed">
              This preview shows how your logo and school name will appear to users logging into the portals.
            </p>
          </motion.div>
        </div>
        
      </div>
    </DashboardLayout>
  );
}
