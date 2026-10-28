import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { Assessment, TestAttempt, Question } from '../../types/index.ts';
import { Modal } from '../../components/common/Modal.tsx';
import {
  Clock,
  Flag,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Send,
  HelpCircle,
  FileCheck,
} from 'lucide-react';

export function TestTakingPage({
  attemptId,
  assessment,
  onNavigate,
}: {
  attemptId: string;
  assessment: Assessment;
  onNavigate: (tab: string, state?: any) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<string[]>([]);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(assessment.durationMinutes * 60);
  const [saving, setSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();
  const questions: Question[] = assessment.questions || [];
  const currentQuestion = questions[currentIndex];

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attemptId]);

  const handleAutoSubmit = async () => {
    showToast('Time expired! Auto-submitting assessment...', 'info');
    await doSubmit();
  };

  const handleSelectAnswer = async (questionId: string, answerValue: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerValue }));
    setSaving(true);
    try {
      await api.saveAnswer(attemptId, questionId, answerValue, flagged.includes(questionId));
    } catch (e) {
      console.warn('Auto-save answer failed:', e);
    } finally {
      setTimeout(() => setSaving(false), 400);
    }
  };

  const handleToggleFlag = async (questionId: string) => {
    const isNowFlagged = !flagged.includes(questionId);
    const updated = isNowFlagged ? [...flagged, questionId] : flagged.filter(id => id !== questionId);
    setFlagged(updated);
    try {
      await api.saveAnswer(attemptId, questionId, answers[questionId] || '', isNowFlagged);
    } catch (e) {
      console.warn('Auto-save flag status failed:', e);
    }
  };

  const doSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.submitAttempt(assessment.id, attemptId);
      showToast('Assessment submitted and scored successfully!', 'success');
      onNavigate('test-results', { result: res.result });
    } catch (err: any) {
      showToast(err.message || 'Error submitting test', 'error');
      setSubmitting(false);
    }
  };

  // Format mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).filter(k => answers[k]?.trim()).length;
  const isTimeCritical = secondsRemaining < 120; // under 2 mins

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Top Test Header Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-18 z-30">
        <div>
          <span className="text-[11px] font-mono font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded">
            {assessment.subjectName}
          </span>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
            {assessment.title}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Countdown timer */}
          <div
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-extrabold ${
              isTimeCritical
                ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                : 'bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          {/* Submit button */}
          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-4 py-2 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" /> Submit Test
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Question Card (3 Cols) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[480px]">
          <div>
            {/* Question Header Meta */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-[#6D28D9] bg-violet-50 px-2.5 py-1 rounded-lg">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {currentQuestion?.type} · {currentQuestion?.difficulty}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {saving && (
                  <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Saving...
                  </span>
                )}
                <button
                  onClick={() => handleToggleFlag(currentQuestion.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    flagged.includes(currentQuestion.id)
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  {flagged.includes(currentQuestion.id) ? 'Flagged' : 'Flag for Review'}
                </button>
              </div>
            </div>

            {/* Prompt */}
            <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed mb-6">
              {currentQuestion?.prompt}
            </div>

            {/* Question Answer Inputs */}
            {currentQuestion?.type === 'MCQ' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map(opt => {
                  const isSelected = answers[currentQuestion.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectAnswer(currentQuestion.id, opt.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? 'border-[#6D28D9] bg-violet-50/70 text-slate-900 shadow-xs ring-1 ring-violet-400'
                          : 'border-slate-200 hover:border-violet-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-[#6D28D9] text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {opt.label}
                      </div>
                      <div className="text-sm font-medium leading-relaxed pt-0.5">
                        {opt.text}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {currentQuestion?.type === 'FILL_IN_BLANK' && (
              <div className="mt-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Your Answer:
                </label>
                <input
                  type="text"
                  value={answers[currentQuestion.id] || ''}
                  onChange={e => handleSelectAnswer(currentQuestion.id, e.target.value)}
                  placeholder="Type the exact word or phrase..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base font-medium focus:outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-violet-100 text-slate-900 bg-white"
                />
              </div>
            )}

            {(currentQuestion?.type === 'SHORT_ANSWER' || currentQuestion?.type === 'CODING') && (
              <div className="mt-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Write Your Technical Explanation or Code:
                </label>
                <textarea
                  rows={6}
                  value={answers[currentQuestion.id] || ''}
                  onChange={e => handleSelectAnswer(currentQuestion.id, e.target.value)}
                  placeholder="Explain the theoretical principles, algorithmic invariants, or pseudo-code..."
                  className="w-full p-4 rounded-xl border border-slate-300 text-sm font-mono leading-relaxed focus:outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-violet-100 text-slate-900 bg-white"
                />
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="px-5 py-2.5 rounded-xl bg-violet-50 hover:bg-[#6D28D9] text-[#6D28D9] hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                Next Question <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="px-5 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-extrabold transition-all shadow-xs flex items-center gap-1.5"
              >
                Review & Submit <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Question Navigation Palette (1 Col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
            <h4 className="font-bold text-slate-900 text-sm mb-3">Question Palette</h4>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = Boolean(answers[q.id]?.trim());
                const isFlagged = flagged.includes(q.id);

                let bg = 'bg-slate-100 text-slate-600 hover:bg-slate-200';
                if (isCurrent) {
                  bg = 'ring-2 ring-[#6D28D9] bg-violet-100 text-[#6D28D9] font-bold';
                } else if (isFlagged) {
                  bg = 'bg-amber-100 text-amber-800 font-bold';
                } else if (isAnswered) {
                  bg = 'bg-violet-600 text-white font-bold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl text-xs flex items-center justify-center transition-all ${bg}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-violet-600" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
                <span>Flagged for Review ({flagged.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-100" />
                <span>Unanswered ({questions.length - answeredCount})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Submit Examination?"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Are you sure you want to finalize your submission? Once submitted, your answers will be
            graded immediately on the server.
          </p>

          <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Answered Questions:</span>
              <strong className="text-slate-900">{answeredCount} of {questions.length}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Unanswered Questions:</span>
              <strong className="text-amber-600">{questions.length - answeredCount}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Flagged Questions:</span>
              <strong className="text-slate-900">{flagged.length}</strong>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Continue Test
            </button>
            <button
              onClick={doSubmit}
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-extrabold shadow-xs transition-colors disabled:opacity-50"
            >
              {submitting ? 'Scoring...' : 'Confirm & Score Now'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
