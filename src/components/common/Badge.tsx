import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'neutral', size = 'md' }: BadgeProps) {
  const styles = {
    primary: 'bg-violet-50 text-violet-700 border-violet-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-md border ${styles[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
}

export function LearningLevelBadge({ level }: { level: string }) {
  const configs: Record<string, { bg: string; text: string; border: string }> = {
    Beginner: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
    Basic: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    Intermediate: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    Advanced: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
    Proficient: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  };

  const config = configs[level] || configs.Beginner;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {level}
    </span>
  );
}
