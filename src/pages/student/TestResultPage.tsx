import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api.ts';
import { AssessmentResult } from '../../types/index.ts';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.tsx';
import { LearningLevelBadge } from '../../components/common/Badge.tsx';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingUp,
  RotateCcw,
  LayoutDashboard,
  BrainCircuit,
  BookOpen,
} from 'lucide-react';

export function TestResultPage({
  result: initialResult,
  attemptId,
  onNavigate,
}: {
  result?: AssessmentResult;
  attemptId?: string;
  onNavigate: (tab: string, state?: any) => void;
}) {
  const [result, setResult] = useState<AssessmentResult | null>(initialResult || null);
  const [loading, setLoading] = useState(!initialResult && Boolean(attemptId));

  useEffect(() => {
    if (!result && attemptId) {
      api.getAttemptResult(attemptId).then(res => {
        setResult(res.result);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [attemptId]);

  useEffect(() => {
    if (result && result.percentage >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6D28D9', '#8B5CF6', '#10B981', '#F59E0B'],
        });
      } catch (e) {
        // Confetti fallback
      }
    }
  }, [result]);

  if (loading) {
    return <LoadingSpinner message="Calculating server-side examination score..." />;
  }

  if (!result) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800">No Assessment Result Available</h3>
        <button
          onClick={() => onNavigate('dashboard')}
          className="mt-4 px-4 py-2 bg-[#6D28D9] text-white rounded-xl text-xs font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const durationMins = Math.floor(result.durationSeconds / 60);
  const durationSecs = result.durationSeconds % 60;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-200">
      {/* Hero Score Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-mono font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded">
              {result.subjectName}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">
              {result.assessmentTitle}
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span>Time: {durationMins}m {durationSecs}s</span>
              <span>·</span>
              <span>Date: {new Date(result.submittedAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="text-center sm:text-right shrink-0">
            <div className="text-4xl sm:text-5xl font-extrabold text-[#6D28D9] tracking-tight">
              {result.percentage}%
            </div>
            <div className="text-xs font-bold text-slate-500 mt-1">
              Grade {result.grade} · {result.totalScore} / {result.maxScore} Points
            </div>
            <div className="mt-2">
              <LearningLevelBadge level={result.levelAchieved} />
            </div>
          </div>
        </div>

        {/* Strengths & Weak Topics Analysis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Demonstrated Strengths
            </div>
            <ul className="text-xs text-emerald-900 space-y-1">
              {result.strengths.map((s, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 mb-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              Focus Areas for Revision
            </div>
            <ul className="text-xs text-amber-900 space-y-1">
              {result.weakTopics.map((w, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-100 mt-6">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-4 h-4" /> Return to Dashboard
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('progress-analytics')}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              View Updated Analytics
            </button>
            <button
              onClick={() => onNavigate('generate-assessment')}
              className="px-4 py-2 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Take Another Test
            </button>
          </div>
        </div>
      </div>

      {/* Deep Pedagogical Question Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            Detailed Solution & Explanation Breakdown
          </h2>
          <span className="text-xs text-slate-500">
            {result.questionBreakdown.length} Questions Evaluated
          </span>
        </div>

        {result.questionBreakdown.map((item, idx) => (
          <div
            key={idx}
            className={`bg-white rounded-3xl p-6 border transition-all ${
              item.isCorrect ? 'border-slate-200/90 shadow-2xs' : 'border-rose-200 bg-rose-50/10'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <span className="text-xs font-extrabold text-slate-700">
                Question {idx + 1} ({item.question.type})
              </span>
              <span
                className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  item.isCorrect
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {item.isCorrect ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> +{item.points} pts
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" /> 0 pts
                  </>
                )}
              </span>
            </div>

            <div className="font-bold text-slate-900 text-base mb-4 leading-snug">
              {item.question.prompt}
            </div>

            {/* Answers comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Your Answer:
                </span>
                <span className={item.isCorrect ? 'font-bold text-emerald-800' : 'font-bold text-rose-700'}>
                  {item.studentAnswer || '(Blank)'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-violet-50/60 border border-violet-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D28D9] block mb-1">
                  Expected / Correct Answer:
                </span>
                <span className="font-bold text-violet-950">
                  {item.question.correctAnswer}
                </span>
              </div>
            </div>

            {/* Deep Pedagogical Explanation */}
            <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-xs leading-relaxed font-mono">
              <div className="flex items-center gap-1.5 text-violet-300 font-bold mb-1.5 font-sans">
                <HelpCircle className="w-4 h-4" /> AI Pedagogical Analysis:
              </div>
              {item.explanation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
