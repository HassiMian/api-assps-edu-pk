"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { BrainCircuit, Shield, GraduationCap, Users, User, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const portals = [
    { name: "Admin Portal", role: "admin", icon: Shield, path: "/admin", color: "text-red-400", bg: "bg-red-500/20", border: "hover:border-red-500/50 hover:shadow-red-500/20" },
    { name: "Teacher Portal", role: "teacher", icon: Users, path: "/teacher", color: "text-blue-400", bg: "bg-blue-500/20", border: "hover:border-blue-500/50 hover:shadow-blue-500/20" },
    { name: "Student Portal", role: "student", icon: GraduationCap, path: "/student", color: "text-purple-400", bg: "bg-purple-500/20", border: "hover:border-purple-500/50 hover:shadow-purple-500/20" },
    { name: "Parent Portal", role: "parent", icon: User, path: "/parent", color: "text-emerald-400", bg: "bg-emerald-500/20", border: "hover:border-emerald-500/50 hover:shadow-emerald-500/20" },
  ];

  const handleNavigation = (path: string) => {
    if (!user) {
      router.push('/login');
    } else {
      router.push(path);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center z-10 mb-16 relative w-full px-4"
      >
        {/* Top Right Auth Controls */}
        <div className="absolute -top-12 md:-top-20 right-4 md:right-8 flex gap-4">
          {user ? (
            <button onClick={logout} className="flex items-center gap-2 text-sm font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-xl transition-colors border border-red-500/20">
              Logout
            </button>
          ) : (
            <button onClick={() => router.push('/login')} className="flex items-center gap-2 text-sm font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-2 rounded-xl transition-colors border border-blue-500/20">
              <LogIn className="w-4 h-4" /> Sign In
            </button>
          )}
        </div>

        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/30">
          <BrainCircuit className="text-white w-12 h-12" />
        </div>
        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
          Al-Siddique OS <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Super App</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          The next-generation AI-Powered School Community Platform. 
          Select a portal below to experience the future of education.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl px-6 z-10">
        {portals.map((portal, idx) => (
          <motion.div 
            key={portal.role}
            onClick={() => handleNavigation(portal.path)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`glass-card p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 border border-slate-700/50 hover:shadow-2xl ${portal.border}`}
          >
            <div className={`w-16 h-16 rounded-2xl ${portal.bg} flex items-center justify-center mb-6`}>
              <portal.icon className={`w-8 h-8 ${portal.color}`} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{portal.name}</h2>
            <p className="text-slate-400 text-sm">Enter the {portal.role} experience</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
