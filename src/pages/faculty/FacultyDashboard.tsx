import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { AssignedStudent, FacultyMeeting } from '../../types/index.ts';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.tsx';
import { StatCard } from '../../components/common/StatCard.tsx';
import { LearningLevelBadge } from '../../components/common/Badge.tsx';
import { Modal } from '../../components/common/Modal.tsx';
import {
  Users,
  AlertTriangle,
  Award,
  CalendarCheck,
  FileSpreadsheet,
  Search,
  MessageSquare,
  ArrowRight,
  Send,
  Plus,
} from 'lucide-react';

export function FacultyDashboard({ onNavigate }: { onNavigate: (tab: string, state?: any) => void }) {
  const [metrics, setMetrics] = useState<any>(null);
  const [students, setStudents] = useState<AssignedStudent[]>([]);
  const [meetings, setMeetings] = useState<FacultyMeeting[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [atRiskOnly, setAtRiskOnly] = useState(false);

  // Feedback modal state
  const [feedbackStudent, setFeedbackStudent] = useState<AssignedStudent | null>(null);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const { showToast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getFacultyDashboard();
      setMetrics(res.metrics);
      setStudents(res.assignedStudents || []);
      setMeetings(res.upcomingMeetings || []);
    } catch (err: any) {
      showToast(err.message || 'Error loading faculty dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackStudent) return;
    setSubmittingFeedback(true);
    try {
      await api.sendFacultyFeedback({
        studentId: feedbackStudent.studentId,
        title: feedbackTitle,
        message: feedbackMessage,
      });
      showToast(`Feedback sent to ${feedbackStudent.name}`, 'success');
      setFeedbackStudent(null);
      setFeedbackTitle('');
      setFeedbackMessage('');
    } catch (err: any) {
      showToast(err.message || 'Failed to send feedback', 'error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleExportCsv = () => {
    window.open(api.getFacultyReportCsvUrl(), '_blank');
    showToast('Exporting assigned students CSV report...', 'info');
  };

  if (loading) {
    return <LoadingSpinner message="Loading assigned student roster and analytics..." />;
  }

  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = !levelFilter || s.currentLevel === levelFilter;
    const matchesRisk = !atRiskOnly || s.atRisk;
    return matchesSearch && matchesLevel && matchesRisk;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Faculty Mentorship & Student Roster
          </h1>
          <p className="text-sm text-slate-500">
            Monitor assigned students, track at-risk performance alerts, and manage academic consultations.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all flex items-center gap-2 shadow-2xs self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export CSV Report
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Students"
          value={metrics?.totalAssignedStudents || 3}
          subtitle="Mentorship cohort"
          icon={Users}
          accentColor="#6D28D9"
        />

        <StatCard
          title="At-Risk Alerts"
          value={metrics?.atRiskCount || 1}
          subtitle="Consistency or score deficit"
          icon={AlertTriangle}
          trend={{ value: 'Requires intervention', isPositive: false }}
          accentColor="#E11D48"
        />

        <StatCard
          title="Class Average"
          value={`${metrics?.averageClassScore || 77}%`}
          subtitle="Cohort weighted index"
          icon={Award}
          accentColor="#2563EB"
        />

        <StatCard
          title="Active Meetings"
          value={metrics?.scheduledMeetingsCount || 2}
          subtitle="1-on-1 consultations"
          icon={CalendarCheck}
          accentColor="#059669"
        />
      </div>

      {/* Assigned Students Roster Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Filters Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search student by name, roll #..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#6D28D9] bg-white text-slate-900"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={levelFilter}
              onChange={e => setLevelFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#6D28D9] bg-white text-slate-700"
            >
              <option value="">All Learning Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Basic">Basic</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Proficient">Proficient</option>
            </select>

            <button
              onClick={() => setAtRiskOnly(!atRiskOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                atRiskOnly
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              At-Risk Only ({metrics?.atRiskCount || 1})
            </button>
          </div>
        </div>

        {/* Table Rows */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Student Details</th>
                <th className="px-6 py-3.5">Learning Level</th>
                <th className="px-6 py-3.5">Overall Score</th>
                <th className="px-6 py-3.5">Streak</th>
                <th className="px-6 py-3.5">Identified Weak Spots</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map(s => (
                <tr key={s.studentId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                    <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                      {s.rollNumber} · {s.email}
                    </div>
                    {s.atRisk && (
                      <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        <AlertTriangle className="w-3 h-3" />
                        {s.riskReason || 'At-Risk Alert'}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <LearningLevelBadge level={s.currentLevel} />
                  </td>

                  <td className="px-6 py-4">
                    <span className="font-extrabold text-sm text-slate-900">
                      {s.overallScore}%
                    </span>
                    <div className="text-[10px] text-slate-400">
                      {s.testsCompleted} tests taken
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`font-bold ${
                        s.consistencyStreak <= 2 ? 'text-rose-600' : 'text-slate-700'
                      }`}
                    >
                      {s.consistencyStreak} days
                    </span>
                  </td>

                  <td className="px-6 py-4 max-w-xs">
                    <div className="text-slate-600 line-clamp-2">
                      {s.weakTopics.join(', ')}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => setFeedbackStudent(s)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold transition-colors"
                    >
                      Feedback
                    </button>

                    <button
                      onClick={() =>
                        onNavigate('faculty-student-detail', { studentId: s.studentId })
                      }
                      className="px-3 py-1.5 rounded-xl bg-violet-50 text-[#6D28D9] hover:bg-[#6D28D9] hover:text-white font-bold transition-all"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Scheduled Consultations */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-[#6D28D9]" />
            <h3 className="font-bold text-slate-900 text-base">
              Scheduled 1-on-1 Academic Consultations
            </h3>
          </div>
          <button
            onClick={() => onNavigate('faculty-meetings')}
            className="text-xs font-bold text-[#6D28D9] hover:underline"
          >
            Manage All Meetings
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meetings.map(m => (
            <div
              key={m.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-bold text-slate-700">{m.studentName}</span>
                  <span>{new Date(m.scheduledAt).toLocaleDateString()}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">{m.title}</h4>
                <p className="text-xs text-slate-500 mb-3">{m.agenda}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                <span className="text-[11px] font-semibold text-slate-500">
                  {m.durationMinutes} mins · {m.status}
                </span>
                <a
                  href={m.meetingUrl || 'https://meet.google.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded-lg bg-[#6D28D9] text-white text-xs font-bold hover:bg-[#5B21B6] transition-colors"
                >
                  Join Google Meet
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Private Feedback Modal */}
      {feedbackStudent && (
        <Modal
          isOpen={Boolean(feedbackStudent)}
          onClose={() => setFeedbackStudent(null)}
          title={`Send Academic Feedback to ${feedbackStudent.name}`}
          maxWidth="md"
        >
          <form onSubmit={handleSendFeedback} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Feedback Title / Subject
              </label>
              <input
                type="text"
                required
                value={feedbackTitle}
                onChange={e => setFeedbackTitle(e.target.value)}
                placeholder="e.g. Recommendations on Dynamic Programming"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#6D28D9] text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Private Advisory Message
              </label>
              <textarea
                required
                rows={4}
                value={feedbackMessage}
                onChange={e => setFeedbackMessage(e.target.value)}
                placeholder="Write specific encouraging recommendations or review guidelines..."
                className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#6D28D9] text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFeedbackStudent(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingFeedback}
                className="px-5 py-2 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {submittingFeedback ? 'Sending...' : 'Send Feedback'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
