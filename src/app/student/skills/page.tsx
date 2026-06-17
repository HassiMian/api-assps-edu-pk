"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { Award, TrendingUp, Target, Shield, Zap, BookOpen } from 'lucide-react';

export default function StudentSkills() {
  const subjects = [
    { name: "Mathematics", score: 85, trend: "+5%", status: "excellent" },
    { name: "Physics", score: 62, trend: "-2%", status: "needs-work" },
    { name: "Chemistry", score: 78, trend: "+1%", status: "good" },
    { name: "English", score: 92, trend: "+8%", status: "excellent" },
  ];

  const badges = [
    { name: "Quiz Master", icon: Shield, color: "text-purple-400", bg: "bg-purple-500/20", desc: "Scored 100% in 5 quizzes" },
    { name: "Fast Learner", icon: Zap, color: "text-amber-400", bg: "bg-amber-500/20", desc: "Completed 10 HW tasks early" },
    { name: "Consistent", icon: Target, color: "text-blue-400", bg: "bg-blue-500/20", desc: "14 day learning streak" },
  ];

  const weakTopics = [
    { subject: "Physics", topic: "Thermodynamics", score: "45%" },
    { subject: "Mathematics", topic: "Calculus Limits", score: "52%" },
  ];

  return (
    <DashboardLayout role="student" title="Skill Mastery Dashboard">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass-card p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" /> Subject Overview
          </h3>
          <div className="space-y-6">
            {subjects.map((sub, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <span className="text-white font-medium">{sub.name}</span>
                    <span className={`ml-3 text-xs font-bold ${
                      sub.status === 'excellent' ? 'text-emerald-400' :
                      sub.status === 'good' ? 'text-blue-400' : 'text-amber-400'
                    }`}>
                      {sub.trend}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono">{sub.score}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700/50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${sub.score}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className={`h-full relative overflow-hidden ${
                      sub.status === 'excellent' ? 'bg-emerald-500' :
                      sub.status === 'good' ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                  >
                    <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 translate-x-full"></div>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 flex flex-col"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" /> Focus Areas
          </h3>
          <p className="text-sm text-slate-400 mb-4">AI-identified topics requiring attention:</p>
          
          <div className="space-y-4 flex-1">
            {weakTopics.map((topic, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-white font-medium">{topic.topic}</h4>
                  <span className="text-amber-400 font-bold text-sm">{topic.score}</span>
                </div>
                <p className="text-xs text-slate-400">{topic.subject}</p>
                <button className="mt-3 text-xs w-full py-2 bg-slate-700/30 text-slate-500 rounded-lg border border-slate-700/50 font-medium flex justify-center items-center gap-1 cursor-not-allowed opacity-50" title="Coming soon">
                  <BookOpen className="w-3 h-3" /> Review Material
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" /> Achievement Badges
          </h3>
          <span className="text-sm text-slate-400">Level 8 • 4,520 XP</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {badges.map((badge, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 flex items-center gap-4 hover:bg-slate-800/60 transition-colors cursor-pointer group">
              <div className={`p-3 rounded-xl ${badge.bg} ${badge.color} group-hover:scale-110 transition-transform`}>
                <badge.icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold">{badge.name}</h4>
                <p className="text-xs text-slate-400 mt-1">{badge.desc}</p>
              </div>
            </div>
          ))}
          
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 border-dashed flex items-center justify-center text-slate-500 gap-2 cursor-pointer hover:bg-slate-800/30 transition-colors">
            <Award className="w-5 h-5" />
            <span className="text-sm font-medium">3 Locked Badges</span>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
