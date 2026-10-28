import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.tsx';
import {
  BookOpen,
  Sparkles,
  FileUp,
  Check,
  Plus,
  Users,
  GraduationCap,
  Layers,
  Search,
} from 'lucide-react';

export function SubjectManagementPage({ onNavigate }: { onNavigate: (tab: string, state?: any) => void }) {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const res = await api.getSubjects();
      setSubjects(res.subjects || []);
    } catch (err: any) {
      showToast(err.message || 'Error loading subjects', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleToggleEnroll = async (subjectId: string, currentEnrolled: boolean) => {
    try {
      const res = await api.enrollSubject(subjectId);
      showToast(res.message, res.isEnrolled ? 'success' : 'info');
      setSubjects(prev =>
        prev.map(s =>
          s.id === subjectId
            ? { ...s, isEnrolled: res.isEnrolled, enrolledStudentsCount: res.enrolledStudentsCount }
            : s
        )
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to update enrollment', 'error');
    }
  };

  const filtered = subjects.filter(
    s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner message="Fetching academic curriculum..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Academic Course & Subject Management
          </h1>
          <p className="text-sm text-slate-500">
            Enroll in semester modules, view syllabus coverage, and launch AI assessments.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search subject code or name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#6D28D9] bg-white text-slate-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(sub => (
          <div
            key={sub.id}
            className={`bg-white rounded-3xl p-6 border transition-all duration-200 flex flex-col justify-between ${
              sub.isEnrolled
                ? 'border-violet-300 shadow-sm'
                : 'border-slate-200/80 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <span
                  className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg text-white"
                  style={{ backgroundColor: sub.color || '#6D28D9' }}
                >
                  {sub.code}
                </span>

                <button
                  onClick={() => handleToggleEnroll(sub.id, sub.isEnrolled)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    sub.isEnrolled
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-rose-50 hover:text-rose-700'
                      : 'bg-violet-50 text-[#6D28D9] hover:bg-violet-100'
                  }`}
                >
                  {sub.isEnrolled ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Enrolled
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" /> Enroll
                    </>
                  )}
                </button>
              </div>

              <h3 className="font-bold text-slate-900 text-lg mb-1 leading-snug">
                {sub.name}
              </h3>
              <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                {sub.description}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-500 mb-5 pt-3 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  {sub.creditHours} Credits
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-slate-400" />
                  {sub.enrolledStudentsCount} Students
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="w-4 h-4 text-slate-400" />
                  {sub.documentCount || 0} Docs
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => onNavigate('pdf-upload', { subjectId: sub.id })}
                className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors"
              >
                <FileUp className="w-3.5 h-3.5 text-slate-500" />
                Upload PDF
              </button>

              <button
                onClick={() => onNavigate('generate-assessment', { subjectId: sub.id })}
                className="py-2 px-3 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Create Test
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
