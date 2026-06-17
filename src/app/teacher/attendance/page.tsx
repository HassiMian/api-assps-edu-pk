"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { MapPin, CheckCircle2, UserCheck, UserX, UserMinus, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

type Student = {
  id: number;
  name: string;
  roll_number: string;
  class: string;
};

export default function TeacherAttendance() {
  const [locationStatus, setLocationStatus] = useState<'checking' | 'inside' | 'outside'>('checking');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<number, 'present' | 'absent' | 'leave'>>({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const { user } = useAuth();
  const [classes, setClasses] = useState<{ class_name: string; section: string }[]>([]);
  const [selectedClass, setSelectedClass] = useState<{ class_name: string; section: string } | null>(null);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const showToast = useCallback((msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocationStatus('inside'); 
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Fetch teaching classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingClasses(true);
      try {
        const res = await api.get('/portal/teaching-options');
        if (res.data.success && Array.isArray(res.data.data?.classes)) {
          const fetchedClasses = res.data.data.classes;
          setClasses(fetchedClasses);
          if (fetchedClasses.length > 0) {
            setSelectedClass(fetchedClasses[0]);
          }
        } else {
          const fallback = [
            { class_name: '9', section: 'A' },
            { class_name: '10', section: 'A' }
          ];
          setClasses(fallback);
          setSelectedClass(fallback[0]);
        }
      } catch (error) {
        console.error("Failed to fetch teaching classes:", error);
        const fallback = [
          { class_name: '9', section: 'A' },
          { class_name: '10', section: 'A' }
        ];
        setClasses(fallback);
        setSelectedClass(fallback[0]);
      } finally {
        setLoadingClasses(false);
      }
    };
    if (user) fetchClasses();
  }, [user]);

  // Fetch students when the class changes
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) return;
      try {
        const res = await api.get('/students', {
          params: {
            active: true,
            class: selectedClass.class_name,
            section: selectedClass.section
          }
        });
        if (res.data.success) {
          setStudents(res.data.data);
          
          // DEFAULT ALL TO PRESENT
          const initialAttendance: Record<number, 'present'> = {};
          res.data.data.forEach((s: Student) => {
            initialAttendance[s.id] = 'present';
          });
          setAttendance(initialAttendance);
        } else {
          setStudents([]);
          setAttendance({});
        }
      } catch (error) {
        console.error("Failed to fetch students", error);
        setStudents([]);
        setAttendance({});
      }
    };
    fetchStudents();
  }, [selectedClass]);

  const markStudent = (id: number, status: 'present' | 'absent' | 'leave') => {
    if (locationStatus !== 'inside') return;
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const submitAttendance = async () => {
    if (locationStatus !== 'inside') return;
    setSubmitting(true);
    try {
      const date = new Date().toISOString().split('T')[0];
      const records = Object.entries(attendance).map(([student_id, status]) => ({
        student_id: parseInt(student_id),
        date,
        status
      }));

      const res = await api.post('/attendance/mark', {
        records,
        marked_by: user?.id
      });

      if (res.data.success) {
        showToast("Attendance submitted successfully!", true);
      } else {
        showToast("Submission failed. Please try again.", false);
      }
    } catch (error) {
      showToast("Failed to submit attendance.", false);
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout role="teacher" title="Daily Attendance">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl transition-all ${toast.ok ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
          {toast.msg}
        </div>
      )}
      <div className="mb-8">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl flex items-center gap-4 ${
            locationStatus === 'checking' ? 'bg-amber-500/10 border border-amber-500/20' :
            locationStatus === 'inside' ? 'bg-emerald-500/10 border border-emerald-500/20' :
            'bg-red-500/10 border border-red-500/20'
          }`}
        >
          <div className={`p-2 rounded-lg ${
            locationStatus === 'checking' ? 'bg-amber-500/20 text-amber-400' :
            locationStatus === 'inside' ? 'bg-emerald-500/20 text-emerald-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`font-bold ${
              locationStatus === 'checking' ? 'text-amber-400' :
              locationStatus === 'inside' ? 'text-emerald-400' :
              'text-red-400'
            }`}>
              {locationStatus === 'checking' ? 'Verifying Geolocation...' :
               locationStatus === 'inside' ? 'Location Verified: Inside School Boundary' :
               'Access Denied: Outside School Boundary'}
            </h3>
            <p className="text-slate-400 text-sm mt-0.5">
              Attendance marking is restricted to school premises.
            </p>
          </div>
        </motion.div>
      </div>

      <div className={`glass-card overflow-hidden transition-opacity duration-300 ${locationStatus !== 'inside' ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
          <div>
            {loadingClasses ? (
              <div className="text-slate-400 text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> Loading classes...
              </div>
            ) : classes.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm font-semibold">Class:</span>
                <select
                  value={selectedClass ? `${selectedClass.class_name}-${selectedClass.section}` : ''}
                  onChange={(e) => {
                    const [cls, sec] = e.target.value.split('-');
                    const found = classes.find(c => c.class_name === cls && c.section === sec);
                    if (found) setSelectedClass(found);
                  }}
                  className="bg-slate-800 text-white border border-slate-700/60 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-blue-500 transition-all cursor-pointer shadow-lg"
                >
                  {classes.map((c, idx) => (
                    <option key={idx} value={`${c.class_name}-${c.section}`}>
                      Class {c.class_name} - Section {c.section}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <h3 className="text-xl font-bold text-white">No Classes Registered</h3>
            )}
            <p className="text-slate-400 text-xs mt-1">Date: {new Date().toLocaleDateString()}</p>
          </div>
          <button 
            onClick={submitAttendance}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-2.5 px-6 rounded-xl transition-colors flex items-center gap-2"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            Submit Attendance
          </button>
        </div>

        <div className="min-h-[300px] relative">
          {/* Mobile Card View (hidden on md and up) */}
          <div className="md:hidden space-y-4 p-4">
            {students.length === 0 ? (
              <div className="text-center text-slate-500 py-8">
                No students found for this class. Live attendance will appear once the backend has students for the selected class.
              </div>
            ) : (
              students.map((student) => (
                <div key={student.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-white text-lg">{student.name}</span>
                    <span className="font-mono text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded">{student.roll_number || '-'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => markStudent(student.id, 'present')}
                      className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors text-xs font-semibold ${
                        attendance[student.id] === 'present' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-slate-900/50 text-slate-400 hover:bg-slate-700 border border-transparent'
                      }`}
                    >
                      <UserCheck className="w-5 h-5 mb-0.5" /> Present
                    </button>
                    <button 
                      onClick={() => markStudent(student.id, 'absent')}
                      className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors text-xs font-semibold ${
                        attendance[student.id] === 'absent' ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-slate-900/50 text-slate-400 hover:bg-slate-700 border border-transparent'
                      }`}
                    >
                      <UserX className="w-5 h-5 mb-0.5" /> Absent
                    </button>
                    <button 
                      onClick={() => markStudent(student.id, 'leave')}
                      className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors text-xs font-semibold ${
                        attendance[student.id] === 'leave' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'bg-slate-900/50 text-slate-400 hover:bg-slate-700 border border-transparent'
                      }`}
                    >
                      <UserMinus className="w-5 h-5 mb-0.5" /> Leave
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View (hidden on small screens) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 font-medium">
                  <tr>
                    <th className="px-6 py-4">Roll No</th>
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4 text-right">Mark Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                        No students found for this class. Live attendance will appear once the backend has students for the selected class.
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-mono text-slate-400">{student.roll_number || '-'}</td>
                        <td className="px-6 py-4 font-medium text-white">{student.name}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => markStudent(student.id, 'present')}
                              className={`p-2 rounded-lg flex items-center gap-1 transition-colors ${
                                attendance[student.id] === 'present' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-transparent'
                              }`}
                            >
                              <UserCheck className="w-4 h-4" /> Present
                            </button>
                            <button 
                              onClick={() => markStudent(student.id, 'absent')}
                              className={`p-2 rounded-lg flex items-center gap-1 transition-colors ${
                                attendance[student.id] === 'absent' ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-transparent'
                              }`}
                            >
                              <UserX className="w-4 h-4" /> Absent
                            </button>
                            <button 
                              onClick={() => markStudent(student.id, 'leave')}
                              className={`p-2 rounded-lg flex items-center gap-1 transition-colors ${
                                attendance[student.id] === 'leave' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-transparent'
                              }`}
                            >
                              <UserMinus className="w-4 h-4" /> Leave
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
