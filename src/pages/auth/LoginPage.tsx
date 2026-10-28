import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { GraduationCap, ArrowRight, Lock, Mail, Sparkles, UserCheck, Shield } from 'lucide-react';

export function LoginPage({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { login, switchDemoRole } = useAuth();
  const [email, setEmail] = useState('alex@edupulse.edu');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'STUDENT' | 'FACULTY' | 'ADMIN') => {
    await switchDemoRole(role);
    if (role === 'FACULTY') onNavigate('faculty-dashboard');
    else if (role === 'ADMIN') onNavigate('admin-dashboard');
    else onNavigate('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F8F7FF] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <button
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-2 mb-4 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6D28D9] to-[#8B5CF6] text-white flex items-center justify-center shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl text-slate-900 tracking-tight">EduPulse</span>
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Sign in to your portal</h2>
        <p className="mt-1 text-sm text-slate-600">
          Enter credentials or select a one-click demo profile below
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-lg shadow-violet-100/50 border border-slate-200/80">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-violet-100 text-slate-900"
                  placeholder="name@edupulse.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-violet-100 text-slate-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-sm shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              One-Click Test Accounts
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('STUDENT')}
                className="p-2 rounded-xl border border-violet-200 hover:bg-violet-50 text-center transition-colors group"
              >
                <Sparkles className="w-4 h-4 text-[#6D28D9] mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-900">Student</div>
                <div className="text-[10px] text-slate-500">Alex Chen</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('FACULTY')}
                className="p-2 rounded-xl border border-blue-200 hover:bg-blue-50 text-center transition-colors group"
              >
                <UserCheck className="w-4 h-4 text-[#2563EB] mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-900">Faculty</div>
                <div className="text-[10px] text-slate-500">Dr. Sarah</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('ADMIN')}
                className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-center transition-colors group"
              >
                <Shield className="w-4 h-4 text-slate-700 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-900">Admin</div>
                <div className="text-[10px] text-slate-500">Eleanor</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="text-[#6D28D9] font-bold hover:underline"
            >
              Register as Student
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
