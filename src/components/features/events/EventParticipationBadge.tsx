import React from 'react';
import { Users, Clock } from 'lucide-react';
import type { Event } from '../../../models/Event';
import { getEventParticipationStats } from '../../../utils/eventParticipationUtils';

interface EventParticipationBadgeProps {
  event: Event;
  compact?: boolean;
  className?: string;
  showPending?: boolean;
}

export const EventParticipationBadge: React.FC<EventParticipationBadgeProps> = ({
  event,
  compact = false,
  className = '',
  showPending = true,
}) => {
  const { participatingCount, pendingCount } = getEventParticipationStats(event);

  const participantLabel = compact
    ? `${participatingCount} part.`
    : participatingCount <= 1
    ? `${participatingCount} participant`
    : `${participatingCount} participants`;

  const pendingLabel = compact
    ? `${pendingCount} att.`
    : pendingCount <= 1
    ? `${pendingCount} en attente`
    : `${pendingCount} en attente`;

  return (
    <div className={`inline-flex items-center gap-1.5 flex-wrap ${className}`}>
      {/* Badge participants confirmés */}
      <span
        title={`${participatingCount} membre(s) participant(s)`}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
          participatingCount > 0
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-sm shadow-emerald-950/20'
            : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
        }`}
      >
        <Users className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{participantLabel}</span>
      </span>

      {/* Badge réponses en attente (optionnel si > 0) */}
      {showPending && pendingCount > 0 && (
        <span
          title={`${pendingCount} membre(s) en attente de réponse`}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border bg-amber-500/10 border-amber-500/25 text-amber-300/90"
        >
          <Clock className="w-3 h-3 shrink-0 text-amber-400" aria-hidden="true" />
          <span>{pendingLabel}</span>
        </span>
      )}
    </div>
  );
};
