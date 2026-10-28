import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ message = 'Loading...', size = 'md' }: { message?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3 text-slate-500">
      <Loader2 className={`${sizeMap[size]} animate-spin text-[#6D28D9]`} />
      {message && <p className="text-sm font-medium text-slate-600">{message}</p>}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionText,
  onAction,
  icon: Icon,
}: {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: any;
}) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center flex flex-col items-center justify-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-violet-50 text-[#6D28D9] flex items-center justify-center mb-4">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mt-1 mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
