import React from 'react';

interface TactileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  variant?: 'default' | 'yellow' | 'lime' | 'cyan' | 'coral' | 'muted';
  children: React.ReactNode;
}

export const TactileCard: React.FC<TactileCardProps> = ({
  interactive = false,
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  const baseClasses =
    'rounded-2xl border-2 border-slate-900 p-4 transition-all duration-75';

  const shadowClasses = interactive
    ? 'shadow-tactile hover:-translate-y-0.5 active:translate-y-1 active:translate-x-0.5 active:shadow-tactile-sm cursor-pointer select-none touch-manipulation'
    : 'shadow-tactile';

  const variantClasses = {
    default: 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
    yellow: 'bg-bogad-yellow text-slate-950',
    lime: 'bg-bogad-lime text-slate-950',
    cyan: 'bg-bogad-cyan text-slate-950',
    coral: 'bg-bogad-coral text-white',
    muted: 'bg-slate-100 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200'
  };

  return (
    <div
      className={`${baseClasses} ${shadowClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
