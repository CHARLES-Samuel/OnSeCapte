import React from 'react';

export interface MemberRowProps {
  uid: string;
  name: string;
  badge?: string;
  badgeClass?: string;
  isCurrentUser: boolean;
  actions?: React.ReactNode;
}

export const MemberRow: React.FC<MemberRowProps> = ({
  name,
  badge,
  badgeClass,
  isCurrentUser,
  actions,
}) => {
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <li className="flex items-center justify-between py-2.5 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div
          aria-hidden="true"
          className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white text-xs font-bold shrink-0"
        >
          {initials}
        </div>
        <span className="text-sm font-medium text-slate-200 truncate">
          {name}
          {isCurrentUser && <span className="text-slate-500 ml-1 text-xs">(vous)</span>}
        </span>
        {badge && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${badgeClass}`}>
            {badge}
          </span>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </li>
  );
};
