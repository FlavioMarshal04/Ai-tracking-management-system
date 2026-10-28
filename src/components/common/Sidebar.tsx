import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  LayoutDashboard,
  BookOpen,
  FileUp,
  BrainCircuit,
  History,
  TrendingUp,
  Users,
  CalendarCheck,
  ShieldCheck,
  Settings,
  FileSpreadsheet,
  LogOut,
  FolderKanban,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ currentTab, onNavigate, isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();

  const studentNavItems = [
    { id: 'dashboard', label: 'Progress Overview', icon: LayoutDashboard },
    { id: 'subjects', label: 'Enrolled Subjects', icon: BookOpen },
    { id: 'pdf-upload', label: 'Upload Course PDF', icon: FileUp },
    { id: 'generate-assessment', label: 'AI Assessment Generator', icon: BrainCircuit },
    { id: 'progress-analytics', label: 'Progress Analytics', icon: TrendingUp },
    { id: 'test-history', label: 'Test History & Reviews', icon: History },
    { id: 'meetings', label: 'Faculty Mentorship', icon: CalendarCheck },
  ];

  const facultyNavItems = [
    { id: 'faculty-dashboard', label: 'Faculty Dashboard', icon: LayoutDashboard },
    { id: 'faculty-students', label: 'Assigned Students', icon: Users },
    { id: 'faculty-meetings', label: 'Academic Meetings', icon: CalendarCheck },
    { id: 'faculty-reports', label: 'Student Reports (CSV)', icon: FileSpreadsheet },
  ];

  const adminNavItems = [
    { id: 'admin-dashboard', label: 'Platform Dashboard', icon: LayoutDashboard },
    { id: 'admin-users', label: 'User Directory', icon: Users },
    { id: 'admin-subjects', label: 'Subjects & Curriculum', icon: FolderKanban },
    { id: 'admin-settings', label: 'System Weights & AI', icon: Settings },
    { id: 'admin-audit', label: 'Audit Logs', icon: ShieldCheck },
  ];

  const getNavItems = () => {
    if (user?.role === 'FACULTY') return facultyNavItems;
    if (user?.role === 'ADMIN') return adminNavItems;
    return studentNavItems;
  };

  const navItems = getNavItems();

  const handleSelect = (tab: string) => {
    onNavigate(tab);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto p-4">
          <div className="px-2 py-3 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {user?.role === 'FACULTY' ? 'Faculty Portal' : user?.role === 'ADMIN' ? 'Administration' : 'Student Portal'}
            </span>
          </div>

          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-violet-50 text-[#6D28D9] font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-[#6D28D9]' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick assessment callout for students */}
          {user?.role === 'STUDENT' && (
            <div className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#6D28D9] mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                AI Test Ready
              </div>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                Generate tailored MCQs & practice sets directly from your uploaded PDF lecture slides.
              </p>
              <button
                onClick={() => handleSelect('generate-assessment')}
                className="w-full py-2 px-3 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold transition-all shadow-xs"
              >
                Create Test
              </button>
            </div>
          )}
        </div>

        {/* Footer with logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => {
              logout();
              onNavigate('landing');
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
