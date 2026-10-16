import React, { useState } from 'react';
import type { TimeSlot, EventParticipation, EventState, Event } from '../../../models/Event';
import type { GroupPlanning, MemberProfile } from '../../../models/Group';
import { CheckCircle, XCircle, Users, Lock, Unlock } from 'lucide-react';
import { AvailabilityHeatmapCalendar } from './AvailabilityHeatmapCalendar';
import { EventVotingProgressBar } from './EventVotingProgressBar';
import { ForceLockWarning } from './ForceLockWarning';
import { validateEventDateSelection } from '../../../utils/dateUtils';

interface EventSynthesisProps {
  event: Event;
  respondedMembers: number;
  totalMembers: number;
  participations?: Record<string, EventParticipation>;
  plannings?: GroupPlanning[];
  memberProfiles?: Record<string, MemberProfile>;
  memberIds?: string[];
  currentUserId?: string;
  canLock: boolean;
  eventState?: EventState;
  onLock: (date: string, timeSlot: TimeSlot) => Promise<void>;
  onUnlock?: () => Promise<void> | void;
}

export const EventSynthesis: React.FC<EventSynthesisProps> = ({
  event,
  respondedMembers,
  totalMembers,
  participations = {},
  plannings = [],
  memberProfiles = {},
  memberIds = [],
  currentUserId,
  canLock,
  eventState = 'sondage',
  onLock,
  onUnlock,
}) => {
  const isLocked = eventState === 'planifie';
  const memberList = Object.entries(participations).map(([userId, status]) => ({ userId, status }));
  const participatingCount = memberList.filter((m) => m.status === 'participating').length;
  const unavailableCount = memberList.filter((m) => m.status === 'not_participating').length;
  const missingResponses = totalMembers - respondedMembers;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForceLockWarning, setShowForceLockWarning] = useState(false);
  const [pendingLockTarget, setPendingLockTarget] = useState<{ date: string; timeSlot: TimeSlot } | null>(null);

  const handleRequestLock = (dateStr: string, timeSlot: TimeSlot = 'Toute la journée') => {
    const validation = validateEventDateSelection(
      dateStr,
      event.dateMode,
      event.startDate,
      event.endDate
    );
    if (!validation.isValid) {
      return;
    }

    setPendingLockTarget({ date: dateStr, timeSlot });
    if (respondedMembers < totalMembers) {
      setShowForceLockWarning(true);
    } else {
      executeLock(dateStr, timeSlot);
    }
  };

  const executeLock = async (dateStr: string, timeSlot: TimeSlot) => {
    setIsSubmitting(true);
    setShowForceLockWarning(false);
    try {
      await onLock(dateStr, timeSlot);
    } finally {
      setIsSubmitting(false);
      setPendingLockTarget(null);
    }
  };


  return (
    <div className="bg-slate-800/40 border border-slate-800 p-4 sm:p-6 rounded-2xl space-y-6">
      {/* En-tête : Titre & Progression */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-white mb-3">
          {isLocked ? 'Synthèse de l\'événement' : 'Disponibilités & Calendrier'}
        </h2>

        <EventVotingProgressBar
          isLocked={isLocked}
          respondedMembers={respondedMembers}
          totalMembers={totalMembers}
          participatingCount={participatingCount}
          unavailableCount={unavailableCount}
          missingResponses={missingResponses}
        />
      </div>

      {/* Avertissement de forçage si membres manquants */}
      {showForceLockWarning && pendingLockTarget && (
        <ForceLockWarning
          isSubmitting={isSubmitting}
          onConfirm={() => executeLock(pendingLockTarget.date, pendingLockTarget.timeSlot)}
          onCancel={() => setShowForceLockWarning(false)}
        />
      )}

      {/* Calendrier Heatmap Choroplèthe avec Podium */}
      {!isLocked && (
        <AvailabilityHeatmapCalendar
          event={event}
          plannings={plannings}
          memberProfiles={memberProfiles}
          memberIds={memberIds.length > 0 ? memberIds : Object.keys(memberProfiles)}
          currentUserId={currentUserId}
          canLock={canLock}
          isLocked={isLocked}
          onLockDate={handleRequestLock}
        />
      )}

      {/* Réponses individuelles des membres */}
      <div className="pt-2 border-t border-slate-800">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span>Statut des membres ({memberList.length})</span>
        </h3>
        <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 scrollbar-none">
          {memberList.map((m) => (
            <div
              key={m.userId}
              className="flex justify-between items-center bg-slate-900/70 px-3 py-2 rounded-lg border border-slate-800/80 text-xs"
            >
              <span className="font-medium text-slate-300">
                {memberProfiles[m.userId]?.displayName || 'Un membre'}{' '}
                {m.userId === currentUserId && '(Moi)'}
              </span>
              {m.status === 'participating' ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Participe
                </span>
              ) : m.status === 'not_participating' ? (
                <span className="text-red-400 font-semibold flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Absent(e)
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> En attente
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Déverrouillage si le sondage est clos */}
      {isLocked && canLock && onUnlock && (
        <button
          type="button"
          onClick={onUnlock}
          className="w-full py-2.5 px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl transition text-xs font-semibold flex items-center justify-center gap-2"
        >
          <Unlock className="w-4 h-4 text-amber-400" />
          <span>Rouvrir le sondage (Imprévu)</span>
        </button>
      )}

    </div>
  );
};
