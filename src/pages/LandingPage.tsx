import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  TrendingUp,
  Users,
  Shield,
  FileCheck2,
  Cpu,
  Layers,
  Database,
  Terminal,
} from 'lucide-react';

export function LandingPage({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { switchDemoRole } = useAuth();

  const handleLaunchRole = async (role: 'STUDENT' | 'FACULTY' | 'ADMIN', destTab: string) => {
    await switchDemoRole(role);
    onNavigate(destTab);
  };

  return (
    <div className="min-h-screen bg-[#F8F7FF] text-slate-900">
      {/* Header */}
      <header className="border-b border-violet-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6D28D9] to-[#8B5CF6] text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">
                EduPulse
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-violet-100 text-[#6D28D9] ml-2 px-1.5 py-0.5 rounded">
                AI Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('login')}
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#6D28D9] px-4 py-2 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="text-xs sm:text-sm font-semibold bg-[#6D28D9] hover:bg-[#5B21B6] text-white px-4 py-2 rounded-xl transition-all shadow-xs"
            >
              Student Register
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 pt-16 pb-20 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100/80 text-[#6D28D9] text-xs font-bold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Autonomous Curriculum Ingestion · Full-Stack Docker & PostgreSQL
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-950 tracking-tight max-w-4xl mx-auto leading-[1.15]">
          AI-Powered Student Progress Tracking &{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6]">
            Server-Side Assessment
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Ingest course PDF lecture slides, synthesize curriculum-grounded examinations, and
          evaluate student trajectories using multi-factor weighted formulas and real-time faculty
          mentorship.
        </p>

        {/* Quick Launch Role Selector */}
        <div className="mt-10 max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-violet-100 shadow-lg shadow-violet-100/50">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Select an account role to explore the live application:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => handleLaunchRole('STUDENT', 'dashboard')}
              className="flex flex-col items-center p-5 rounded-2xl border-2 border-violet-200 hover:border-[#6D28D9] bg-violet-50/40 hover:bg-violet-50 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="font-bold text-slate-900 text-sm">Student Experience</div>
              <div className="text-xs text-slate-500 text-center mt-1">
                Alex Chen (CS-2024-042)
                <span className="block text-[#6D28D9] font-medium mt-0.5">Tests, PDF Uploads & Analytics</span>
              </div>
            </button>

            <button
              onClick={() => handleLaunchRole('FACULTY', 'faculty-dashboard')}
              className="flex flex-col items-center p-5 rounded-2xl border-2 border-slate-200 hover:border-[#6D28D9] bg-slate-50/60 hover:bg-violet-50/40 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#2563EB] text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div className="font-bold text-slate-900 text-sm">Faculty Portal</div>
              <div className="text-xs text-slate-500 text-center mt-1">
                Dr. Sarah Vance (CSE)
                <span className="block text-blue-600 font-medium mt-0.5">At-Risk Matrix & Consultations</span>
              </div>
            </button>

            <button
              onClick={() => handleLaunchRole('ADMIN', 'admin-dashboard')}
              className="flex flex-col items-center p-5 rounded-2xl border-2 border-slate-200 hover:border-[#6D28D9] bg-slate-50/60 hover:bg-violet-50/40 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#0F172A] text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <div className="font-bold text-slate-900 text-sm">Administration</div>
              <div className="text-xs text-slate-500 text-center mt-1">
                Eleanor Ward (Dean)
                <span className="block text-slate-700 font-medium mt-0.5">Weights, Users & Audit Logs</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Feature Architecture Grid */}
      <section className="px-6 py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6D28D9]">
              Engineered Architecture
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              End-to-End Rigor for Academic Institutions
            </h2>
            <p className="text-slate-600 text-sm mt-3">
              Built strictly as an enterprise-grade stack with complete server-side ownership.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-[#6D28D9] flex items-center justify-center mb-4">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Server-Side AI Pipeline</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Extracts raw PDF text, semantic chunks, and topic importance. Generates MCQs,
                fill-in-the-blanks, and deep pedagogical explanations via Gemini 2.5 Flash with a
                failsafe offline sample provider.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">50/25/15/10 Progress Math</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Deterministic calculation combining Assessment Performance (50%), Topic Mastery (25%),
                Practice Consistency (15%), and Improvement Trajectory (10%) mapped across 5 learning
                levels.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Docker & Prisma ORM Ready</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Exportable standalone directory structure with multi-container Docker Compose,
                PostgreSQL schema, database migrations, seed scripts, and Supertest test suites.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        EduPulse Academic Platform · Portable React + Node.js + PostgreSQL + Docker Compose
      </footer>
    </div>
  );
}
