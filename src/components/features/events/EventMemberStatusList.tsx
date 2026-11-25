import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, Users, ChevronDown, ChevronUp } from 'lucide-react';
import type { EventParticipation } from '../../../models/Event';
import type { MemberProfile } from '../../../models/Group';

export interface EventMemberStatusListProps {
  participations: Record<string, EventParticipation>;
  memberProfiles?: Record<string, MemberProfile>;
  currentUserId?: string;
  initialVisibleCount?: number;
}

const DEFAULT_VISIBLE_COUNT = 5;

export const EventMemberStatusList: React.FC<EventMemberStatusListProps> = ({
  participations,
  memberProfiles = {},
  currentUserId,
  initialVisibleCount = DEFAULT_VISIBLE_COUNT,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const memberList = Object.entries(participations)
    .filter(([, status]) => status === 'participating' || status === 'not_participating' || status === 'pending')
    .map(([userId, status]) => ({ userId, status }))
    .sort((a, b) => {
      if (a.userId === currentUserId) return -1;
      if (b.userId === currentUserId) return 1;
      return 0;
    });

  const totalResponded = memberList.length;
  const hasOverflow = totalResponded > initialVisibleCount;
  const visibleMembers = isExpanded ? memberList : memberList.slice(0, initialVisibleCount);
  const hiddenCount = totalResponded - initialVisibleCount;

  return (
    <div className="pt-4 border-t border-slate-800/80 min-w-0">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5 min-w-0">
        <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" aria-hidden="true" />
        <span className="truncate">Statut des membres ({totalResponded})</span>
      </h3>

      {totalResponded === 0 ? (
        <p className="text-xs text-slate-500 italic py-2">
          Aucune réponse pour le moment.
        </p>
      ) : (
        <div className="space-y-1.5 min-w-0" aria-live="polite">
          {visibleMembers.map((member) => {
            const displayName = memberProfiles[member.userId]?.displayName || 'Un membre';
            const isMe = member.userId === currentUserId;

            return (
              <div
                key={member.userId}
                className="flex items-center justify-between gap-2 bg-slate-900/70 px-2.5 sm:px-3 py-2 rounded-lg border border-slate-800/80 text-xs min-w-0"
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span
                    className="font-medium text-slate-200 truncate"
                    title={displayName}
                  >
                    {displayName}
                  </span>
                  {isMe && (
                    <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary-500/25 text-primary-300 border border-primary-500/40 leading-none">
                      Moi
                    </span>
                  )}
                </div>

                {member.status === 'participating' ? (
                  <span className="text-emerald-400 font-semibold inline-flex items-center gap-1 shrink-0 whitespace-nowrap">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Participe</span>
                  </span>
                ) : member.status === 'not_participating' ? (
                  <span className="text-red-400 font-semibold inline-flex items-center gap-1 shrink-0 whitespace-nowrap">
                    <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Pas dispo</span>
                  </span>
                ) : (
                  <span className="text-slate-400 inline-flex items-center gap-1 shrink-0 whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>En attente</span>
                  </span>
                )}
              </div>
            );
          })}

          {hasOverflow && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              aria-expanded={isExpanded}
              className="mt-2 w-full py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-primary-400 hover:text-primary-300 transition inline-flex items-center justify-center gap-1.5 min-h-[36px] cursor-pointer"
            >
              {isExpanded ? (
                <>
                  <span>Voir moins</span>
                  <ChevronUp className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </>
              ) : (
                <>
                  <span>Voir tout (+{hiddenCount})</span>
                  <ChevronDown className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

