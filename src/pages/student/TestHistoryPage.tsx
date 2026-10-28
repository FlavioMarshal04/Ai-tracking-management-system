import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import { TestAttempt } from '../../types/index.ts';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.tsx';
import {
  History,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Search,
  Filter,
} from 'lucide-react';

export function TestHistoryPage({ onNavigate }: { onNavigate: (tab: string, state?: any) => void }) {
  const [history, setHistory] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        const res = await api.getTestHistory();
        setHistory(res.history || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Retrieving examination records..." />;
  }

  const filtered = history.filter(
    h =>
      h.assessmentTitle.toLowerCase().includes(search.toLowerCase()) ||
      h.subjectName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Examination History & Submissions
          </h1>
          <p className="text-sm text-slate-500">
            Audit your past attempts, review solution explanations, and inspect mistakes.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search test or subject..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#6D28D9] bg-white text-slate-900"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <History className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <div className="font-bold text-slate-800">No test attempts found</div>
            <p className="text-xs text-slate-500 mt-1">
              Start an assessment from the AI Assessment Generator tab.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(att => {
              const mins = Math.floor(att.durationSeconds / 60);
              const secs = att.durationSeconds % 60;
              return (
                <div
                  key={att.id}
                  className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {att.subjectName}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          att.passed
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {att.passed ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" /> Below Benchmark
                          </>
                        )}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base">{att.assessmentTitle}</h3>

                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      <span>Submitted: {new Date(att.startedAt).toLocaleDateString()}</span>
                      <span>·</span>
                      <span>Duration: {mins}m {secs}s</span>
                      <span>·</span>
                      <span>
                        Accuracy: {att.correctCount} / {att.totalQuestions}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-2xl font-black text-slate-900">
                        {att.percentage}%
                      </div>
                      <div className="text-[11px] text-slate-400 font-semibold">
                        Score: {att.score} pts
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate('test-results', { attemptId: att.id })}
                      className="px-4 py-2 rounded-xl bg-violet-50 hover:bg-[#6D28D9] text-[#6D28D9] hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                    >
                      Review Explanations <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
