import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { UserRole } from '../../types/index.ts';
import { GraduationCap, Sparkles, UserCheck, Shield, ChevronDown, Menu } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export function Navbar({ onToggleSidebar, currentTab, onNavigate }: NavbarProps) {
  const { user, switchDemoRole } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6D28D9] to-[#8B5CF6] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 tracking-tight text-lg leading-tight flex items-center gap-1.5">
                EduPulse
                <span className="text-[10px] font-bold uppercase tracking-wider bg-violet-100 text-[#6D28D9] px-1.5 py-0.5 rounded">
                  AI
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Academic Progress & Assessment Engine
              </div>
            </div>
          </button>
        </div>

        {/* Center / Right: Demo Role Quick-Switcher */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl text-xs font-semibold">
            <span className="text-slate-500 px-2 py-1 text-[11px] uppercase tracking-wider font-bold">
              Demo Switcher:
            </span>
            <button
              onClick={() => {
                switchDemoRole('STUDENT');
                onNavigate('dashboard');
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                user?.role === 'STUDENT'
                  ? 'bg-white text-[#6D28D9] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Student (Alex)
            </button>

            <button
              onClick={() => {
                switchDemoRole('FACULTY');
                onNavigate('faculty-dashboard');
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                user?.role === 'FACULTY'
                  ? 'bg-white text-[#6D28D9] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Faculty (Dr. Sarah)
            </button>

            <button
              onClick={() => {
                switchDemoRole('ADMIN');
                onNavigate('admin-dashboard');
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                user?.role === 'ADMIN'
                  ? 'bg-white text-[#6D28D9] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin (Eleanor)
            </button>
          </div>

          {/* User Profile Pill */}
          {user && (
            <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-200">
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-violet-200"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">{user.name}</div>
                <div className="text-[10px] font-semibold text-[#6D28D9] uppercase tracking-wider">
                  {user.role}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
