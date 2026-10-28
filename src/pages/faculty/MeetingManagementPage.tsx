import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { FacultyMeeting, AssignedStudent } from '../../types/index.ts';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.tsx';
import { Modal } from '../../components/common/Modal.tsx';
import {
  CalendarCheck,
  Plus,
  Video,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
} from 'lucide-react';

export function MeetingManagementPage() {
  const [meetings, setMeetings] = useState<FacultyMeeting[]>([]);
  const [students, setStudents] = useState<AssignedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New meeting form
  const [studentId, setStudentId] = useState('');
  const [title, setTitle] = useState('');
  const [agenda, setAgenda] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [meetingUrl, setMeetingUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashRes, stuRes] = await Promise.all([
        api.getFacultyDashboard(),
        api.getFacultyStudents(),
      ]);
      setMeetings(dashRes.upcomingMeetings || []);
      setStudents(stuRes.students || []);
      if (stuRes.students?.length > 0) {
        setStudentId(stuRes.students[0].studentId);
      }
    } catch (err: any) {
      showToast(err.message || 'Error loading meetings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.scheduleFacultyMeeting({
        studentId,
        title,
        agenda,
        scheduledAt: scheduledAt || new Date(Date.now() + 86400000).toISOString(),
        durationMinutes,
        meetingUrl,
      });
      showToast('Academic consultation meeting scheduled!', 'success');
      setIsModalOpen(false);
      setTitle('');
      setAgenda('');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to schedule meeting', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (meetingId: string, newStatus: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED') => {
    try {
      await api.updateFacultyMeeting(meetingId, { status: newStatus });
      showToast(`Meeting status marked as ${newStatus}`, 'info');
      setMeetings(prev =>
        prev.map(m => (m.id === meetingId ? { ...m, status: newStatus } : m))
      );
    } catch (err: any) {
      showToast(err.message || 'Error updating meeting status', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading academic consultation schedule..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Academic Review & Consultation Meetings
          </h1>
          <p className="text-sm text-slate-500">
            Schedule 1-on-1 progress reviews, track advisory notes, and sync video meeting links.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Schedule Consultation
        </button>
      </div>

      {/* Meetings List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {meetings.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CalendarCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <div className="font-bold text-slate-800">No consultations scheduled</div>
            <p className="text-xs text-slate-500 mt-1">
              Click the button above to schedule an academic session with an assigned student.
            </p>
          </div>
        ) : (
          meetings.map(m => (
            <div
              key={m.id}
              className="p-6 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-md">
                    {m.studentName}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      m.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : m.status === 'CANCELLED'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {m.status}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(m.scheduledAt).toLocaleString()} ({m.durationMinutes} mins)
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{m.title}</h3>
                <p className="text-xs text-slate-600 max-w-xl leading-relaxed">{m.agenda}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <a
                  href={m.meetingUrl || 'https://meet.google.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-violet-50 text-[#6D28D9] hover:bg-[#6D28D9] hover:text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Video className="w-4 h-4" /> Join Video Call
                </a>

                <select
                  value={m.status}
                  onChange={e => handleUpdateStatus(m.id, e.target.value as any)}
                  className="px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-700 focus:outline-none"
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Schedule Consultation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Academic Consultation"
        maxWidth="md"
      >
        <form onSubmit={handleCreateMeeting} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Assigned Student
            </label>
            <select
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#6D28D9] bg-white text-slate-900"
            >
              {students.map(s => (
                <option key={s.studentId} value={s.studentId}>
                  {s.name} ({s.rollNumber} - {s.currentLevel})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Consultation Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Midterm Progress & Exam Preparation Strategy"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#6D28D9] text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Agenda & Focus Topics
            </label>
            <textarea
              rows={3}
              value={agenda}
              onChange={e => setAgenda(e.target.value)}
              placeholder="Discuss graph algorithms test score, review dynamic programming hurdles..."
              className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#6D28D9] text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={e => setScheduledAt(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#6D28D9] text-slate-900 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Duration
              </label>
              <select
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#6D28D9] text-slate-900 bg-white"
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="45">45 Minutes</option>
                <option value="60">60 Minutes</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold disabled:opacity-50"
            >
              {submitting ? 'Scheduling...' : 'Save & Schedule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
