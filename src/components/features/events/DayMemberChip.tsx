import React from 'react';
import { CheckCircle, HelpCircle, XCircle } from 'lucide-react';
import type { MemberProfile } from '../../../models/Group';
import { UserAvatar } from '../../ui/UserAvatar';

export interface DayMemberChipProps {
  uid: string;
  profile?: MemberProfile;
  isMe: boolean;
  status: 'available' | 'maybe' | 'unavailable';
}

export const DayMemberChip: React.FC<DayMemberChipProps> = ({
  profile,
  isMe,
  status,
}) => {
  const displayName = profile?.displayName || 'Membre';
  const fullTooltip = isMe ? `${displayName} (Vous)` : displayName;

  const statusConfig = {
    available: {
      container: 'bg-emerald-500/10 text-emerald-200 border-emerald-500/30 hover:border-emerald-500/50',
      icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />,
      srLabel: 'Disponible',
    },
    maybe: {
      container: 'bg-amber-500/10 text-amber-200 border-amber-500/30 hover:border-amber-500/50',
      icon: <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />,
      srLabel: 'À confirmer',
    },
    unavailable: {
      container: 'bg-slate-800/90 text-slate-200 border-slate-600 hover:border-slate-500',
      icon: <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />,
      srLabel: 'Indisponible',
    },
  }[status];

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border max-w-full min-w-0 transition-colors shadow-sm ${statusConfig.container}`}
      title={fullTooltip}
    >
      <span className="sr-only">{statusConfig.srLabel} : </span>
      {statusConfig.icon}

      <UserAvatar
        photoUrl={profile?.photoURL}
        name={displayName}
        size="sm"
        className="!w-6 !h-6 !text-[11px] shrink-0"
      />

      <span className="truncate max-w-[110px] sm:max-w-[150px] font-medium">
        {displayName}
      </span>

      {isMe && (
        <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary-500/25 text-primary-300 border border-primary-500/40">
          Moi
        </span>
      )}
    </div>
  );
};
