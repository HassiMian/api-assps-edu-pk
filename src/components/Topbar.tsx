"use client";

import type { ComponentType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, CheckCircle, AlertCircle, Info, Clock, Inbox, CheckCheck } from 'lucide-react';
import { useState, useEffect, memo, useCallback } from 'react';
import api from '@/utils/api';
import { useSchoolBranding } from '@/hooks/useSchoolBranding';
import LogoutButton from './auth/LogoutButton';
import GlobalSearch from './GlobalSearch';

type NotificationItem = {
  id: number | string;
  type?: string;
  title?: string;
  message?: string;
  time?: string;
  unread?: boolean;
};

function Topbar({ title }: { title: string }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { schoolName } = useSchoolBranding();

  const syncNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/notify/inbox');
      const items = Array.isArray(res.data?.data) ? res.data.data : [];
      setNotifications(items);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncNotifications();
    const handleFocus = () => syncNotifications();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [syncNotifications]);

  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
    if (!showNotifications) syncNotifications();
  }, [showNotifications, syncNotifications]);

  const markAllAsRead = async () => {
    try {
      await api.put('/notify/read-all');
      syncNotifications();
    } catch {}
  };

  return (
    <header className="min-h-16 md:h-20 glass-panel border-x-0 border-t-0 relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 px-4 sm:px-6 md:px-8 py-3 md:py-0 bg-slate-900/60">
      <div>
        <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight">{title}</h2>
        <p className="hidden sm:block text-sm text-slate-400">{schoolName}</p>
      </div>
      
      <div className="flex items-center gap-3 sm:gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end">
        <GlobalSearch />

        
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleNotifications}
            className="relative p-2 rounded-full bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 transition-colors"
          >
            <Bell className="w-5 h-5 text-slate-300" />
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-12 w-[min(24rem,92vw)] glass-card border border-slate-700/50 rounded-2xl overflow-hidden z-[60] shadow-2xl"
                >
                  <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Inbox className="w-4 h-4 text-blue-400" />
                      <h3 className="text-white font-semibold">Notifications</h3>
                    </div>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                      {notifications.filter(n => n.unread).length} new
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {loading ? (
                      <div className="p-4 text-sm text-slate-400">Loading notifications...</div>
                    ) : notifications.length ? (
                      notifications.map((notif) => {
                        const icons: Record<string, ComponentType<{ className?: string }>> = {
                          success: CheckCircle,
                          warning: AlertCircle,
                          info: Info,
                          alert: AlertCircle,
                          online_class: Clock,
                        };
                        const colors: Record<string, string> = {
                          success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                          warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                          info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                          alert: 'bg-red-500/10 text-red-400 border-red-500/20',
                          online_class: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
                        };
                        const Icon = icons[notif.type || 'info'] || Info;
                        return (
                          <div key={notif.id} className={`p-4 border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors cursor-pointer ${notif.unread ? 'bg-slate-800/20' : ''}`}>
                            <div className="flex gap-3">
                              <div className={`p-2 rounded-lg border ${colors[notif.type || 'info'] || colors.info} flex-shrink-0`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium">{notif.title || 'Notification'}</p>
                                <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{notif.message || ''}</p>
                                <div className="flex items-center gap-1 mt-2 text-slate-500 text-xs">
                                  <Clock className="w-3 h-3" />
                                  {notif.time || ''}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-6 text-center text-slate-400">
                        <div className="mx-auto w-10 h-10 rounded-full bg-slate-800/60 border border-slate-700 flex items-center justify-center mb-3">
                          <Inbox className="w-5 h-5 text-slate-500" />
                        </div>
                        <p className="text-sm font-medium text-slate-300">No notifications yet</p>
                        <p className="text-xs mt-1">Real alerts will appear here when teachers, admins, or the system send them.</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t border-slate-700/50">
                    <button
                      onClick={markAllAsRead}
                      className="w-full py-2 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCheck className="w-4 h-4" />
                      Mark all as read
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <LogoutButton />
      </div>
    </header>
  );
}

export default memo(Topbar);

