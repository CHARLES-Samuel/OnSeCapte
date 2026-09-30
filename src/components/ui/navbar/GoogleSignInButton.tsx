import React from 'react';

interface GoogleSignInButtonProps {
  onClick: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'full';
  label?: string;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onClick,
  className = '',
  size = 'md',
  label,
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs h-9',
    md: 'px-4 py-2 text-sm h-10',
    full: 'w-full px-4 py-2.5 text-sm h-11 justify-center',
  };

  const defaultLabel = size === 'sm' ? 'Connexion' : 'Connexion avec Google';
  const displayLabel = label ?? defaultLabel;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 font-semibold text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-xl shadow-sm hover:shadow transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 shrink-0 ${sizeClasses[size]} ${className}`}
      aria-label="Se connecter avec un compte Google"
    >
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
        />
      </svg>
      <span className="truncate">{displayLabel}</span>
    </button>
  );
};
