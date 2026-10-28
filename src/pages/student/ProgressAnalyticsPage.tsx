import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { ProgressOverview, TopicPerformance } from '../../types/index.ts';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.tsx';
import { LearningLevelBadge } from '../../components/common/Badge.tsx';
import {
  TrendingUp,
  BrainCircuit,
  Award,
  Layers,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldAlert,
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
  Legend,
} from 'recharts';

export function ProgressAnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<ProgressOverview | null>(null);
  const [daily, setDaily] = useState<any[]>([]);
  const [weekly, setWeekly] = useState<any[]>([]);
  const [monthly, setMonthly] = useState<any[]>([]);
  const [topics, setTopics] = useState<TopicPerformance[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [ovRes, dRes, wRes, mRes, topRes] = await Promise.all([
          api.getProgressOverview(),
          api.getDailyProgress(),
          api.getWeeklyProgress(),
          api.getMonthlyProgress(),
          api.getTopicProgress(),
        ]);
        setOverview(ovRes.overview);
        setDaily(dRes.daily || []);
        setWeekly(wRes.weekly || []);
        setMonthly(mRes.monthly || []);
        setTopics(topRes.topics || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (loading) {
    return <LoadingSpinner message="Calculating dynamic performance trajectories..." />;
  }

  const currentLevel = overview?.currentLevel || 'Advanced';
  const overallScore = overview?.overallScore || 82.4;

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Progress & Learning Trajectory Analytics
        </h1>
        <p className="text-sm text-slate-500">
          Transparent multi-factor analytics computed using deterministic server-side mathematical models.
        </p>
      </div>

      {/* Weighted Math Breakdown Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#6D28D9]">
              Core Formula Specification
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
              50/25/15/10 Multi-Metric Performance Model
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-[#6D28D9]">{overallScore}%</span>
            <LearningLevelBadge level={currentLevel} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-violet-50/60 border border-violet-100">
            <div className="flex items-center justify-between text-xs font-bold text-[#6D28D9] mb-1">
              <span>Assessment Tests</span>
              <span>50% Weight</span>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {overview?.componentScores.assessmentScore}%
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Mean score across all completed online examination attempts.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
            <div className="flex items-center justify-between text-xs font-bold text-blue-700 mb-1">
              <span>Topic Mastery</span>
              <span>25% Weight</span>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {overview?.componentScores.masteryScore}%
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Aggregated concept accuracy across individual curriculum topics.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
            <div className="flex items-center justify-between text-xs font-bold text-amber-700 mb-1">
              <span>Consistency</span>
              <span>15% Weight</span>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {overview?.componentScores.consistencyScore}%
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Consecutive daily active study streak ({overview?.consistencyStreak} days active).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-700 mb-1">
              <span>Improvement</span>
              <span>10% Weight</span>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {overview?.componentScores.improvementScore}%
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Positive gradient comparison between initial and recent test performances.
            </p>
          </div>
        </div>
      </div>

      {/* Two Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Study Consistency */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Daily Practice Habit</h3>
              <p className="text-xs text-slate-500">Minutes invested each day over 14 days</p>
            </div>
            <span className="text-xs font-bold text-[#6D28D9] bg-violet-50 px-2.5 py-1 rounded-lg">
              Consistency Index
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6D28D9" stopOpacity={0.3} />
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
                  formatter={(val: any) => [`${val} min`, 'Study Time']}
                />
                <Area type="monotone" dataKey="studyMinutes" stroke="#6D28D9" strokeWidth={2.5} fill="url(#areaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Score Progression */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Weekly Assessment Trajectory</h3>
              <p className="text-xs text-slate-500">Chronological score trend across weeks</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              Upward Growth
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  formatter={(val: any) => [`${val}%`, 'Test Score']}
                />
                <Bar dataKey="score" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Curriculum Topic Mastery Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <h3 className="font-bold text-slate-900 text-lg mb-2">Curriculum Topic Mastery</h3>
        <p className="text-xs text-slate-500 mb-6">
          Detailed accuracy rates across concepts evaluated through automated questions.
        </p>

        <div className="space-y-4">
          {topics.map(tp => (
            <div key={tp.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-500 mr-2">
                    {tp.subjectName}
                  </span>
                  <strong className="text-sm text-slate-900">{tp.topicName}</strong>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">
                    {tp.correctCount}/{tp.attemptsCount} Correct
                  </span>
                  <LearningLevelBadge level={tp.currentLevel} />
                  <span className="text-sm font-extrabold text-slate-900 w-12 text-right">
                    {tp.masteryPercentage}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${tp.masteryPercentage}%`,
                    backgroundColor:
                      tp.masteryPercentage >= 80
                        ? '#10B981'
                        : tp.masteryPercentage >= 65
                        ? '#8B5CF6'
                        : '#F59E0B',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
