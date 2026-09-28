import React from 'react';
import { UserAvatar } from '../../ui/UserAvatar';

export interface MemberRowProps {
  uid: string;
  name: string;
  photoUrl?: string | null;
  badge?: string;
  badgeClass?: string;
  isCurrentUser: boolean;
  actions?: React.ReactNode;
}

export const MemberRow: React.FC<MemberRowProps> = ({
  name,
  photoUrl,
  badge,
  badgeClass,
  isCurrentUser,
  actions,
}) => {


  return (
    <li className="flex items-center justify-between py-2.5 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <UserAvatar
          photoUrl={photoUrl}
          name={name}
          size="sm"
          className="shrink-0"
        />
        <span className="text-sm font-medium text-slate-200 truncate">
          {name}
          {isCurrentUser && <span className="text-slate-500 ml-1 text-xs">(vous)</span>}
        </span>
        {badge && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0 ${badgeClass}`}>
            {badge}
          </span>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </li>
  );
};
