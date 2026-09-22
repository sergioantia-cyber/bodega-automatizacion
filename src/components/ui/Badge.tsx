import React from 'react';

interface BadgeProps {
  variant?: 'yellow' | 'lime' | 'coral' | 'cyan' | 'dark' | 'outline';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'yellow',
  size = 'sm',
  children,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs'
  };

  const variantClasses = {
    yellow: 'bg-bogad-yellow text-slate-950 border-slate-900',
    lime: 'bg-bogad-lime text-slate-950 border-slate-900',
    coral: 'bg-bogad-coral text-white border-slate-900',
    cyan: 'bg-bogad-cyan text-slate-950 border-slate-900',
    dark: 'bg-slate-900 text-white border-slate-900',
    outline: 'bg-transparent text-slate-800 dark:text-slate-200 border-slate-900 dark:border-slate-600'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-extrabold uppercase tracking-wider rounded-lg border-2 shadow-tactile-sm select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
