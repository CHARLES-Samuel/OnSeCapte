import React, { useState } from 'react';
import type { TimeSlot, EventParticipation, EventState, Event } from '../../../models/Event';
import type { GroupPlanning, MemberProfile } from '../../../models/Group';
import { Unlock } from 'lucide-react';
import { AvailabilityHeatmapCalendar } from './AvailabilityHeatmapCalendar';
import { EventVotingProgressBar } from './EventVotingProgressBar';
import { ForceLockWarning } from './ForceLockWarning';
import { validateEventDateSelection } from '../../../utils/dateUtils';

interface EventSynthesisProps {
  event: Event;
  allEvents?: Event[];
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
  allEvents,
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
    <div className="bg-slate-800/40 border border-slate-800 p-4 sm:p-6 rounded-2xl space-y-6 min-w-0 h-fit">
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
          allEvents={allEvents}
          plannings={plannings}
          memberProfiles={memberProfiles}
          memberIds={memberIds.length > 0 ? memberIds : Object.keys(memberProfiles)}
          currentUserId={currentUserId}
          canLock={canLock}
          isLocked={isLocked}
          onLockDate={handleRequestLock}
        />
      )}

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
