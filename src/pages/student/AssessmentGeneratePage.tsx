import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { Assessment, Subject, StudyDocument, AssessmentType, AssessmentDifficulty } from '../../types/index.ts';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.tsx';
import {
  BrainCircuit,
  Sparkles,
  Clock,
  Play,
  Layers,
  HelpCircle,
  Award,
  ChevronRight,
  Info,
} from 'lucide-react';

export function AssessmentGeneratePage({
  onNavigate,
  initialSubjectId,
  initialDocumentId,
}: {
  onNavigate: (tab: string, state?: any) => void;
  initialSubjectId?: string;
  initialDocumentId?: string;
}) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [existingAssessments, setExistingAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form states
  const [subjectId, setSubjectId] = useState(initialSubjectId || 'sub-dsa');
  const [documentId, setDocumentId] = useState(initialDocumentId || '');
  const [topicName, setTopicName] = useState('');
  const [type, setType] = useState<AssessmentType>('MIXED');
  const [difficulty, setDifficulty] = useState<AssessmentDifficulty>('Medium');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [durationMinutes, setDurationMinutes] = useState<number>(15);

  const { showToast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [subsRes, docsRes, asmtRes] = await Promise.all([
        api.getSubjects(),
        api.getDocuments(),
        api.getAssessments(),
      ]);
      setSubjects(subsRes.subjects || []);
      setDocuments(docsRes.documents || []);
      setExistingAssessments(asmtRes.assessments || []);

      if (initialSubjectId) {
        setSubjectId(initialSubjectId);
      } else if (subsRes.subjects?.length > 0) {
        setSubjectId(subsRes.subjects[0].id);
      }

      if (initialDocumentId) {
        setDocumentId(initialDocumentId);
      }
    } catch (err: any) {
      showToast(err.message || 'Error loading assessment generator parameters', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateAndStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const selectedSub = subjects.find(s => s.id === subjectId);
      const res = await api.generateAssessment({
        subjectId,
        documentId: documentId || undefined,
        topicName: topicName || undefined,
        type,
        difficulty,
        questionCount,
        durationMinutes,
      });

      showToast(
        `Assessment generated via ${res.provider}! Launching test...`,
        'success'
      );

      // Start attempt immediately
      const startRes = await api.startAttempt(res.assessment.id);
      onNavigate('test-taking', {
        attemptId: startRes.attempt.id,
        assessment: startRes.assessment,
      });
    } catch (err: any) {
      showToast(err.message || 'Failed to generate assessment', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleStartExisting = async (assessmentId: string) => {
    try {
      const startRes = await api.startAttempt(assessmentId);
      onNavigate('test-taking', {
        attemptId: startRes.attempt.id,
        assessment: startRes.assessment,
      });
    } catch (err: any) {
      showToast(err.message || 'Failed to start test attempt', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Configuring assessment generator..." />;
  }

  // Filter documents for selected subject
  const subjectDocs = documents.filter(d => d.subjectId === subjectId);

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          AI Assessment Generator
        </h1>
        <p className="text-sm text-slate-500">
          Synthesize customized examinations from course PDFs with real-time countdown timer and server-side validation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Generator Form (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-violet-100 text-[#6D28D9] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-slate-900 text-lg">Create Custom Test</h2>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 bg-violet-50 px-3 py-1 rounded-full border border-violet-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              LLM Schema Grounded
            </div>
          </div>

          <form onSubmit={handleGenerateAndStart} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Subject Module
                </label>
                <select
                  value={subjectId}
                  onChange={e => {
                    setSubjectId(e.target.value);
                    setDocumentId('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#6D28D9] bg-white text-slate-900"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Source Study PDF (Optional)
                </label>
                <select
                  value={documentId}
                  onChange={e => setDocumentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#6D28D9] bg-white text-slate-900"
                >
                  <option value="">-- All Subject Coursework --</option>
                  {subjectDocs.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.title} ({d.topicsExtracted.length} topics)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Specific Topic or Focus Area (Optional)
              </label>
              <input
                type="text"
                value={topicName}
                onChange={e => setTopicName(e.target.value)}
                placeholder="e.g. Dijkstra Invariants, Belady Anomaly, Multi-Head Attention"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#6D28D9] bg-white text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Question Format
                </label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as AssessmentType)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#6D28D9] bg-white text-slate-900"
                >
                  <option value="MIXED">Mixed (MCQ + Blanks + Short)</option>
                  <option value="MCQ">Multiple Choice (MCQ)</option>
                  <option value="FILL_IN_BLANK">Fill In The Blanks</option>
                  <option value="SHORT_ANSWER">Short Conceptual</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as AssessmentDifficulty)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#6D28D9] bg-white text-slate-900"
                >
                  <option value="Easy">Easy (Foundational)</option>
                  <option value="Medium">Medium (Application)</option>
                  <option value="Hard">Hard (Analysis & Proof)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Questions
                </label>
                <select
                  value={questionCount}
                  onChange={e => setQuestionCount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#6D28D9] bg-white text-slate-900"
                >
                  <option value="3">3 Questions (Quick Quiz)</option>
                  <option value="5">5 Questions (Standard)</option>
                  <option value="8">8 Questions (Comprehensive)</option>
                  <option value="10">10 Questions (Mastery Exam)</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-500" />
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Exam Countdown Timer
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Auto-submits if time expires during the session
                  </div>
                </div>
              </div>

              <select
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:border-[#6D28D9] bg-white text-slate-900"
              >
                <option value="5">5 Minutes</option>
                <option value="10">10 Minutes</option>
                <option value="15">15 Minutes</option>
                <option value="20">20 Minutes</option>
                <option value="30">30 Minutes</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {generating ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" />
                  Generating Questions & Scoring Model...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate & Start Online Test
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Ready-to-take Preset Assessments */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Curriculum Tests Ready</h3>
            <span className="text-xs text-slate-400">{existingAssessments.length} Available</span>
          </div>

          <div className="space-y-3">
            {existingAssessments.map(asmt => (
              <div
                key={asmt.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-violet-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                  <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                    {asmt.subjectName}
                  </span>
                  <span>{asmt.durationMinutes} mins</span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm mb-1 leading-snug">
                  {asmt.title}
                </h4>

                <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">
                  {asmt.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-500">
                    {asmt.totalQuestions} Questions · {asmt.difficulty}
                  </span>

                  <button
                    onClick={() => handleStartExisting(asmt.id)}
                    className="px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-[#6D28D9] text-[#6D28D9] hover:text-white text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5" /> Start
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
