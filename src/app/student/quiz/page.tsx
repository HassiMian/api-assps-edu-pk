"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { BrainCircuit, Clock, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Zap, RotateCcw } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import api from '@/utils/api';

const SUBJECTS = ['Physics', 'Mathematics', 'Chemistry', 'Biology', 'English', 'Computer Science'];
const TOPICS: Record<string, string[]> = {
  Physics: ['Kinematics', 'Dynamics', 'Work & Energy', 'Waves', 'Optics', 'Electricity'],
  Mathematics: ['Algebra', 'Geometry', 'Trigonometry', 'Calculus', 'Statistics', 'Sets'],
  Chemistry: ['Periodic Table', 'Bonding', 'Acids & Bases', 'Organic Chemistry', 'Reactions'],
  Biology: ['Cell Biology', 'Genetics', 'Ecosystems', 'Human Body', 'Photosynthesis'],
  English: ['Grammar', 'Comprehension', 'Vocabulary', 'Writing Skills'],
  'Computer Science': ['Programming', 'Algorithms', 'Networking', 'Databases', 'Operating Systems'],
};
const COUNTS = [5, 10, 15, 20];

const GRADES = [
  { min: 90, label: 'Excellent!', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  { min: 75, label: 'Great job!', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  { min: 60, label: 'Good effort', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  { min: 0, label: 'Keep practising', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
];
const getGrade = (pct: number) => GRADES.find(g => pct >= g.min)!;

type QuizQuestion = {
  question: string;
  options: Record<string, string>;
  answer: string;
  marks?: number;
  topic?: string;
  text?: string;
};

export default function StudentAIQuiz() {
  const [phase, setPhase] = useState<'setup' | 'loading' | 'playing' | 'results'>('setup');
  const [subject, setSubject] = useState('Physics');
  const [topic, setTopic] = useState(TOPICS['Physics'][0]);
  const [count, setCount] = useState(10);
  const [questions, setQs] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTopic(TOPICS[subject][0]);
  }, [subject]);

  const finish = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('results');
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          finish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, finish]);

  async function startQuiz() {
    setPhase('loading');
    setError(null);
    setAnswers({});
    setCurrent(0);
    setQs([]);

    try {
      const res = await api.post('/paper/generate', {
        class: '10',
        subject,
        topic,
        questionType: 'MCQs',
        count,
        language: 'english',
      });

      const qs = res.data?.questions || [];
      if (!qs.length) {
        throw new Error('No questions returned');
      }

      setQs(qs.map((q: any) => ({ ...q, id: q.id || q.question_id || q._id })));
      setTimeLeft(count * 30);
      setPhase('playing');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Live quiz generation is currently unavailable.');
      setPhase('setup');
    }
  }

  function handleAnswer(opt: string) {
    setAnswers(prev => ({ ...prev, [current]: opt }));
  }

  function next() {
    if (current < questions.length - 1) setCurrent(c => c + 1);
    else finish();
  }

  if (phase === 'setup') {
    return (
      <DashboardLayout role="student" title="AI Quiz">
        <div className="max-w-xl mx-auto glass-card p-8">
          <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-semibold text-white text-center mb-2">AI Quiz Generator</h2>
          <p className="text-slate-400 text-center text-sm mb-8">Questions are generated from live backend data.</p>

          {error && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none">
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Topic</label>
              <select value={topic} onChange={e => setTopic(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none">
                {(TOPICS[subject] || []).map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Number of Questions</label>
              <div className="grid grid-cols-4 gap-2">
                {COUNTS.map(n => (
                  <button key={n} onClick={() => setCount(n)}
                    className={`py-2 rounded-xl font-semibold text-sm transition-all ${count === n ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={startQuiz}
            className="w-full mt-8 bg-gradient-to-r from-purple-600 to-indigo-500 hover:opacity-90 text-white font-semibold py-4 rounded-xl shadow-lg shadow-purple-500/25 transition-all active:scale-95 flex items-center justify-center gap-2">
            <Zap className="w-5 h-5" /> Generate & Start Quiz
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (phase === 'loading') {
    return (
      <DashboardLayout role="student" title="AI Quiz">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <p className="text-white font-semibold text-xl">Generating your quiz...</p>
            <p className="text-slate-400 text-sm mt-1">AI is crafting {count} questions on {topic}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (phase === 'playing') {
    const q = questions[current];
    const opts = q?.options || {};
    const urgent = timeLeft < 60;

    return (
      <DashboardLayout role="student" title="AI Quiz">
        <div className="flex items-center justify-between mb-6 glass-card px-5 py-3">
          <span className="text-white font-medium">{subject} — {topic}</span>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm">{current + 1}/{questions.length}</span>
            <div className={`flex items-center gap-1.5 font-mono font-semibold ${urgent ? 'text-red-400 animate-pulse' : 'text-purple-400'}`}>
              <Clock className="w-4 h-4" />
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        <div className="h-1.5 bg-slate-800 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all"
            style={{ width: `${((current) / questions.length) * 100}%` }} />
        </div>

        <div className="glass-card p-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Question {current + 1}</span>
            <span className="text-xs text-slate-500">{q?.marks || 1} mark</span>
          </div>
          <p className="text-xl text-white font-medium leading-relaxed mb-8">
            {q?.question || q?.text}
          </p>

          <div className="space-y-3">
            {Object.entries(opts).map(([letter, text]: [string, any]) => {
              const selected = answers[current] === letter;
              return (
                <button key={letter} onClick={() => handleAnswer(letter)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 ${selected ? 'bg-purple-500/20 border-purple-500 text-white' : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-500'}`}>
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0 ${selected ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-400'}`}>{letter}</span>
                  {text as string}
                </button>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700/50 flex justify-end">
            <button onClick={next} disabled={!answers[current]}
              className="bg-blue-600 disabled:opacity-40 hover:bg-blue-500 text-white font-semibold py-3 px-8 rounded-xl flex items-center gap-2 transition-colors">
              {current === questions.length - 1 ? 'Finish' : 'Next'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (phase === 'results') {
    const correct = questions.filter((q, i) => answers[i] === q.answer).length;
    const pct = Math.round((correct / questions.length) * 100);
    const grade = getGrade(pct);
    const wrongTopics = questions
      .filter((q, i) => answers[i] !== q.answer)
      .map(q => q.topic || topic)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 3);

    return (
      <DashboardLayout role="student" title="Quiz Results">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className={`glass-card p-8 text-center border ${grade.bg}`}>
            <div className={`text-6xl font-black mb-2 ${grade.color}`}>{pct}%</div>
            <p className={`font-semibold text-xl mb-1 ${grade.color}`}>{grade.label}</p>
            <p className="text-slate-400 text-sm">{subject} — {topic}</p>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="text-2xl font-semibold text-emerald-400">{correct}</div>
                <div className="text-slate-400 text-xs mt-1">Correct</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="text-2xl font-semibold text-red-400">{questions.length - correct}</div>
                <div className="text-slate-400 text-xs mt-1">Wrong</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="text-2xl font-semibold text-blue-400">{questions.length}</div>
                <div className="text-slate-400 text-xs mt-1">Total</div>
              </div>
            </div>
          </div>

          {pct < 80 && (
            <div className="glass-card p-5 border-l-4 border-l-amber-500 flex gap-4 items-start">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-semibold mb-1">AI Suggestion</p>
                <p className="text-slate-400 text-sm">
                  {pct < 50
                    ? `You scored below 50%. Focus on the fundamentals of ${topic} before retaking.`
                    : `Good attempt! Review ${wrongTopics.join(', ') || topic} concepts to improve your score.`}
                </p>
              </div>
            </div>
          )}

          <div className="glass-card p-6">
            <h3 className="text-white font-semibold mb-4">Answer Review</h3>
            <div className="space-y-3">
              {questions.map((q, i) => {
                const isCorrect = answers[i] === q.answer;
                return (
                  <div key={i} className={`p-4 rounded-xl border ${isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                    <div className="flex items-start gap-3">
                      {isCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
                      <div>
                        <p className="text-white text-sm font-medium">{i + 1}. {q.question || q.text}</p>
                        {!isCorrect && (
                          <>
                            <p className="text-red-400 text-xs mt-1">Your answer: {answers[i] ? `${answers[i]}. ${(q.options || {})[answers[i]]}` : 'Not answered'}</p>
                            <p className="text-emerald-400 text-xs">Correct: {q.answer}. {(q.options || {})[q.answer]}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button onClick={() => { setPhase('setup'); setAnswers({}); setCurrent(0); setError(null); }}
            className="w-full glass-card py-4 text-white font-semibold rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
            <RotateCcw className="w-5 h-5" /> Try Another Quiz
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return null;
}
