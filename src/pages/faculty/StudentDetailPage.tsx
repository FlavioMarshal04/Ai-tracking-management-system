import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.tsx';
import { LearningLevelBadge } from '../../components/common/Badge.tsx';
import {
  ArrowLeft,
  User,
  Award,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  MessageSquare,
  Send,
} from 'lucide-react';

export function StudentDetailPage({
  studentId,
  onNavigate,
}: {
  studentId: string;
  onNavigate: (tab: string, state?: any) => void;
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const { showToast } = useToast();

  const loadStudent = async () => {
    try {
      setLoading(true);
      const res = await api.getFacultyStudentDetail(studentId);
      setData(res);
    } catch (err: any) {
      showToast(err.message || 'Error loading student details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudent();
  }, [studentId]);

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      await api.sendFacultyFeedback({
        studentId,
        title: feedbackTitle,
        message: feedbackMessage,
      });
      showToast('Feedback recorded and sent to student', 'success');
      setFeedbackTitle('');
      setFeedbackMessage('');
      await loadStudent();
    } catch (err: any) {
      showToast(err.message || 'Error sending feedback', 'error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving student academic portfolio..." />;
  }

  if (!data || !data.student) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <h3 className="font-bold text-slate-800">Student Record Not Found or Access Restricted</h3>
        <button
          onClick={() => onNavigate('faculty-dashboard')}
          className="mt-4 px-4 py-2 rounded-xl bg-[#6D28D9] text-white text-xs font-bold"
        >
          Back to Roster
        </button>
      </div>
    );
  }

  const { student, overview, attempts = [], topics = [], feedback = [], meetings = [] } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-150 pb-12">
      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('faculty-dashboard')}
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {student.name}
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            {student.rollNumber} · {student.departmentName} · {student.email}
          </p>
        </div>
      </div>

      {/* Student Profile & Overview Hero */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Academic Target
            </div>
            <div className="text-base font-bold text-slate-900">
              {student.targetExam || 'General Placements'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Active Streak: <strong className="text-[#6D28D9]">{student.streak} consecutive days</strong>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-3xl font-black text-[#6D28D9]">
                {overview?.overallScore || 0}%
              </div>
              <div className="text-xs text-slate-500 font-medium">Weighted Average</div>
            </div>
            <LearningLevelBadge level={student.currentLevel} />
          </div>
        </div>

        {/* 50/25/15/10 breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-3 rounded-xl bg-slate-50">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Tests (50%)</span>
            <span className="text-base font-bold text-slate-900">{overview?.componentScores?.assessmentScore}%</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Mastery (25%)</span>
            <span className="text-base font-bold text-slate-900">{overview?.componentScores?.masteryScore}%</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Consistency (15%)</span>
            <span className="text-base font-bold text-slate-900">{overview?.componentScores?.consistencyScore}%</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Trajectory (10%)</span>
            <span className="text-base font-bold text-slate-900">{overview?.componentScores?.improvementScore}%</span>
          </div>
        </div>
      </div>

      {/* Grid: Topics & Past Attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Mastery */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <h3 className="font-bold text-slate-900 text-base mb-4">Curriculum Topic Mastery</h3>
          <div className="space-y-3">
            {topics.map((tp: any) => (
              <div key={tp.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-800">{tp.topicName}</span>
                  <span className="font-extrabold text-slate-900">{tp.masteryPercentage}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${tp.masteryPercentage}%`,
                      backgroundColor: tp.masteryPercentage >= 75 ? '#10B981' : '#F59E0B',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Examination Attempts */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <h3 className="font-bold text-slate-900 text-base mb-4">Examination History</h3>
          {attempts.length === 0 ? (
            <div className="text-xs text-slate-400 py-6 text-center">No tests completed yet.</div>
          ) : (
            <div className="space-y-3">
              {attempts.map((att: any) => (
                <div key={att.id} className="p-3.5 rounded-xl bg-slate-50 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">{att.assessmentTitle}</h5>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {att.subjectName} · {new Date(att.startedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    {att.percentage}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Faculty Private Feedback Form & Past Messages */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <h3 className="font-bold text-slate-900 text-base mb-2">Send Private Faculty Guidance</h3>
        <p className="text-xs text-slate-500 mb-6">
          Provide encouragement, recommend targeted study strategies, or flag topics needing review.
        </p>

        <form onSubmit={handleSendFeedback} className="space-y-4 mb-8">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Subject Line
            </label>
            <input
              type="text"
              required
              value={feedbackTitle}
              onChange={e => setFeedbackTitle(e.target.value)}
              placeholder="e.g. Graph Algorithms Practice Recommendation"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#6D28D9] text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Encouragement / Actionable Advisory Message
            </label>
            <textarea
              required
              rows={3}
              value={feedbackMessage}
              onChange={e => setFeedbackMessage(e.target.value)}
              placeholder="Write detailed recommendations..."
              className="w-full p-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#6D28D9] text-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={submittingFeedback}
            className="px-5 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {submittingFeedback ? 'Posting...' : 'Post Private Guidance'}
          </button>
        </form>

        {/* Feedback History */}
        {feedback.length > 0 && (
          <div className="pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Past Mentorship Notes Exchanged:
            </h4>
            <div className="space-y-3">
              {feedback.map((fb: any) => (
                <div key={fb.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="font-bold text-slate-800">{fb.title}</span>
                    <span>{new Date(fb.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed italic">{fb.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
