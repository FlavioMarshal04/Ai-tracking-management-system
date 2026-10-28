import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { ProgressOverview, LearningLevel } from '../../types/index.ts';
import { StatCard } from '../../components/common/StatCard.tsx';
import { LearningLevelBadge } from '../../components/common/Badge.tsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.tsx';
import {
  Trophy,
  Flame,
  Clock,
  BookOpen,
  ArrowRight,
  BrainCircuit,
  Calendar,
  MessageSquare,
  Sparkles,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export function StudentDashboard({ onNavigate }: { onNavigate: (tab: string, state?: any) => void }) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<ProgressOverview | null>(null);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [overviewRes, dailyRes, weeklyRes, subjectsRes, historyRes] = await Promise.all([
          api.getProgressOverview(),
          api.getDailyProgress(),
          api.getWeeklyProgress(),
          api.getSubjectProgress(),
          api.getTestHistory(),
        ]);
        setOverview(overviewRes.overview);
        setDailyData(dailyRes.daily || []);
        setWeeklyData(weeklyRes.weekly || []);
        setSubjects(subjectsRes.subjects || []);
        setRecentAttempts((historyRes.history || []).slice(0, 3));
      } catch (err) {
        console.error('Failed to load student dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (loading) {
    return <LoadingSpinner message="Loading your academic progress portfolio..." />;
  }

  const currentLevel = overview?.currentLevel || 'Intermediate';
  const overallScore = overview?.overallScore || 82.4;
  const nextLevel = overview?.nextLevel || 'Proficient';
  const pointsToNext = overview?.pointsToNextLevel || 7.6;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Welcome & Learning Level Card */}
      <div className="bg-gradient-to-br from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-violet-900/10 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-purple-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-200 bg-white/15 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                {(profile as any)?.departmentName || 'Computer Science & Engineering'}
              </span>
              <span className="text-xs text-violet-200 font-mono">
                {(profile as any)?.rollNumber || 'CS-2024-042'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Alex'}!
            </h1>
            <p className="mt-1.5 text-violet-100 text-sm leading-relaxed">
              Target:{' '}
              <span className="font-semibold text-white">
                {(profile as any)?.targetExam || 'Placements & Technical Finals 2027'}
              </span>
              . Your current progress places you in the{' '}
              <strong className="text-white underline decoration-violet-300 underline-offset-2">
                {currentLevel} Tier
              </strong>
              .
            </p>
          </div>

          {/* Level Progress Gauge Widget */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl w-full lg:w-80 shrink-0">
            <div className="flex items-center justify-between text-xs font-bold text-violet-200 mb-1.5">
              <span>Current Status</span>
              <span className="text-white bg-white/20 px-2 py-0.5 rounded text-[11px] font-extrabold">
                {currentLevel}
              </span>
            </div>

            <div className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-1">
              {overallScore}%
              <span className="text-xs font-normal text-violet-200">Weighted Score</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-2.5 mt-3 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, overallScore)}%` }}
              />
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-violet-200">
              <span>{nextLevel !== 'Max Level' ? `${pointsToNext}% to ${nextLevel}` : 'Top Tier Achieved'}</span>
              <span>100% Benchmark</span>
            </div>
          </div>
        </div>

        {/* 50/25/15/10 Formula Breakdown Chips */}
        <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5">
            <span className="text-violet-200 block text-[10px] uppercase font-bold tracking-wider">
              Tests (50%)
            </span>
            <span className="text-sm font-bold text-white">
              {overview?.componentScores.assessmentScore || 80}%
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5">
            <span className="text-violet-200 block text-[10px] uppercase font-bold tracking-wider">
              Mastery (25%)
            </span>
            <span className="text-sm font-bold text-white">
              {overview?.componentScores.masteryScore || 77.6}%
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5">
            <span className="text-violet-200 block text-[10px] uppercase font-bold tracking-wider">
              Consistency (15%)
            </span>
            <span className="text-sm font-bold text-white">
              {overview?.componentScores.consistencyScore || 85}%
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5">
            <span className="text-violet-200 block text-[10px] uppercase font-bold tracking-wider">
              Trajectory (10%)
            </span>
            <span className="text-sm font-bold text-white">
              {overview?.componentScores.improvementScore || 88}%
            </span>
          </div>
        </div>
      </div>

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Evaluation"
          value={`${overallScore}%`}
          subtitle="Multi-factor weighted index"
          icon={Trophy}
          trend={{ value: '4.2% this month', isPositive: true }}
          accentColor="#6D28D9"
        />

        <StatCard
          title="Consistency Streak"
          value={`${overview?.consistencyStreak || 12} Days`}
          subtitle="Daily study active streak"
          icon={Flame}
          trend={{ value: 'Active streak', isPositive: true }}
          accentColor="#EA580C"
        />

        <StatCard
          title="Tests Completed"
          value={overview?.totalTestsCompleted || 8}
          subtitle={`${overview?.averagePassRate || 88}% Pass rate`}
          icon={BrainCircuit}
          accentColor="#2563EB"
        />

        <StatCard
          title="Study Time"
          value={`${overview?.studyTimeHours || 17.5} hrs`}
          subtitle="Document reading & tests"
          icon={Clock}
          accentColor="#059669"
        />
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Study Consistency (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Study Consistency Trend</h3>
              <p className="text-xs text-slate-500">Daily study minutes logged over the past 14 days</p>
            </div>
            <span className="text-xs font-bold text-[#6D28D9] bg-violet-50 px-2.5 py-1 rounded-lg">
              14-Day Trajectory
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6D28D9" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6D28D9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} unit="m" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${value} minutes`, 'Study Time']}
                />
                <Area
                  type="monotone"
                  dataKey="studyMinutes"
                  stroke="#6D28D9"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#studyGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Score Progression */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-900 text-base">Weekly Assessment Mean</h3>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                +18 pts
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Average test percentage by academic week</p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="week" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={[50, 100]} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [`${value}%`, 'Score']}
                  />
                  <Bar dataKey="score" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <button
            onClick={() => onNavigate('progress-analytics')}
            className="w-full mt-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors"
          >
            Deep Dive Analytics <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Enrolled Subjects & Quick Assessment Actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Enrolled Subjects</h2>
            <p className="text-xs text-slate-500">Track mastery and launch AI tests for your course modules</p>
          </div>
          <button
            onClick={() => onNavigate('subjects')}
            className="text-xs font-bold text-[#6D28D9] hover:underline flex items-center gap-1"
          >
            Manage Subjects <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjects.map(sub => (
            <div
              key={sub.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-violet-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-xs font-mono font-bold px-2 py-0.5 rounded text-white"
                    style={{ backgroundColor: sub.color || '#6D28D9' }}
                  >
                    {sub.code}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {sub.averageScore}% Avg
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm mb-1 leading-snug">
                  {sub.name}
                </h4>
                <div className="text-xs text-slate-500 mb-4">
                  {sub.totalTopics} Topics · {sub.testsCompleted} tests
                </div>

                {/* Topic Mastery Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span>Topic Mastery</span>
                    <span className="font-semibold text-slate-800">{sub.topicMastery}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${sub.topicMastery}%`,
                        backgroundColor: sub.color || '#6D28D9',
                      }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('generate-assessment', { subjectId: sub.id })}
                className="w-full py-2 rounded-xl bg-violet-50 hover:bg-[#6D28D9] text-[#6D28D9] hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate Test
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Grid: Mentorship Updates & Recent Attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic Mentorship & Meeting */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#6D28D9]" />
              <h3 className="font-bold text-slate-900 text-base">Faculty Mentorship</h3>
            </div>
            <button
              onClick={() => onNavigate('meetings')}
              className="text-xs font-bold text-[#6D28D9] hover:underline"
            >
              View Schedule
            </button>
          </div>

          {/* Upcoming Meeting Box */}
          <div className="p-4 rounded-2xl bg-violet-50/60 border border-violet-100 mb-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D28D9] bg-white px-2 py-0.5 rounded shadow-2xs">
                  Next Scheduled Session
                </span>
                <h4 className="font-bold text-slate-900 text-sm mt-2">
                  Bi-Weekly Academic Progress & Placement Review
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Mentor:{' '}
                  <strong className="text-slate-900">Dr. Sarah Vance</strong> · 30 min session
                </p>
              </div>
              <a
                href="https://meet.google.com/edupulse-adv-alex"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold shrink-0 transition-colors"
              >
                Join Meet
              </a>
            </div>
          </div>

          {/* Recent Private Feedback */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              Latest Private Feedback from Dr. Sarah Vance
            </div>
            <p className="text-xs text-slate-600 italic leading-relaxed">
              "Great execution on the Fibonacci heap derivation and Bellman-Ford passes. Let us discuss Prim's cut property in our upcoming session."
            </p>
          </div>
        </div>

        {/* Recent Test History */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">Recent Test Attempts</h3>
            <button
              onClick={() => onNavigate('test-history')}
              className="text-xs font-bold text-[#6D28D9] hover:underline"
            >
              View All History
            </button>
          </div>

          {recentAttempts.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No test attempts recorded yet. Launch your first AI assessment above!
            </div>
          ) : (
            <div className="space-y-3">
              {recentAttempts.map(att => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-violet-200 hover:bg-slate-50/50 transition-all"
                >
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                      {att.assessmentTitle}
                    </h5>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {att.subjectName} · {att.correctCount}/{att.totalQuestions} Correct
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${
                        att.percentage >= 70
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {att.percentage}%
                    </span>

                    <button
                      onClick={() => onNavigate('test-results', { attemptId: att.id })}
                      className="text-xs font-semibold text-[#6D28D9] hover:underline"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
