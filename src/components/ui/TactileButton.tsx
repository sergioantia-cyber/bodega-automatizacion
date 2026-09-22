import React from 'react';

interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'lime' | 'coral' | 'secondary' | 'dark' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  children,
  ...props
}) => {
  const baseClasses =
    'relative inline-flex items-center justify-center font-bold tracking-tight select-none touch-manipulation transition-all duration-75 rounded-xl border-2 border-slate-900 focus:outline-none';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs shadow-tactile-sm active:translate-y-[2px] active:translate-x-[1px] active:shadow-none',
    md: 'px-4 py-2.5 text-sm shadow-tactile active:translate-y-1 active:translate-x-0.5 active:shadow-none',
    lg: 'px-6 py-3.5 text-base shadow-tactile-lg active:translate-y-1.5 active:translate-x-1 active:shadow-none',
    icon: 'p-2.5 aspect-square shadow-tactile active:translate-y-1 active:translate-x-0.5 active:shadow-none'
  };

  const variantClasses = {
    primary: 'bg-bogad-yellow text-slate-950 hover:bg-yellow-300',
    lime: 'bg-bogad-lime text-slate-950 hover:bg-lime-300',
    coral: 'bg-bogad-coral text-white hover:bg-rose-500',
    secondary: 'bg-white text-slate-950 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100',
    dark: 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900',
    outline: 'bg-transparent text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
  };

  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed shadow-none active:translate-y-0 active:translate-x-0'
    : 'cursor-pointer';

  return (
    <button
      disabled={disabled}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabledClasses}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
