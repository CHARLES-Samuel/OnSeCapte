import React, { useState } from 'react';
import type { TimeSlot, EventParticipation, EventState, Event } from '../../../models/Event';
import type { GroupPlanning, MemberProfile } from '../../../models/Group';
import { CheckCircle, XCircle, Users, Lock, Unlock, AlertCircle } from 'lucide-react';
import { AvailabilityHeatmapCalendar } from './AvailabilityHeatmapCalendar';
import { EventVotingProgressBar } from './EventVotingProgressBar';
import { ForceLockWarning } from './ForceLockWarning';
import { validateEventDateSelection, getEffectiveMinDate, formatDateShortFr } from '../../../utils/dateUtils';

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
  const [pendingLockDate, setPendingLockDate] = useState<string | null>(null);
  const [manualDate, setManualDate] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);

  const effectiveMinDate = getEffectiveMinDate(event.dateMode, event.startDate);
  const effectiveMaxDate = event.dateMode === 'range' ? event.endDate : undefined;

  const handleRequestLock = (dateStr: string) => {
    const validation = validateEventDateSelection(
      dateStr,
      event.dateMode,
      event.startDate,
      event.endDate
    );
    if (!validation.isValid) {
      setManualError(validation.errorMessage || 'Date non autorisée.');
      return;
    }

    setManualError(null);
    setPendingLockDate(dateStr);
    if (respondedMembers < totalMembers) {
      setShowForceLockWarning(true);
    } else {
      executeLock(dateStr);
    }
  };

  const executeLock = async (dateStr: string) => {
    setIsSubmitting(true);
    setShowForceLockWarning(false);
    try {
      await onLock(dateStr, 'Toute la journée');
    } finally {
      setIsSubmitting(false);
      setPendingLockDate(null);
    }
  };

  const handleManualLock = async () => {
    if (!manualDate) return;
    const validation = validateEventDateSelection(
      manualDate,
      event.dateMode,
      event.startDate,
      event.endDate
    );
    if (!validation.isValid) {
      setManualError(validation.errorMessage || 'Date invalide.');
      return;
    }
    setManualError(null);
    await executeLock(manualDate);
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
      {showForceLockWarning && pendingLockDate && (
        <ForceLockWarning
          isSubmitting={isSubmitting}
          onConfirm={() => executeLock(pendingLockDate)}
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

      {/* Déverrouillage ou Forçage manuel si besoin */}
      {isLocked ? (
        canLock && onUnlock && (
          <button
            type="button"
            onClick={onUnlock}
            className="w-full py-2.5 px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl transition text-xs font-semibold flex items-center justify-center gap-2"
          >
            <Unlock className="w-4 h-4 text-amber-400" />
            <span>Rouvrir le sondage (Imprévu)</span>
          </button>
        )
      ) : (
        canLock && (
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <details className="text-xs text-slate-400">
              <summary className="cursor-pointer hover:text-slate-300 font-medium">
                Définir une date manuellement hors sondage...
              </summary>
              <div className="space-y-2 mt-2">
                {event.dateMode === 'range' && event.startDate && event.endDate && (
                  <p className="text-[11px] text-blue-300">
                    Plage autorisée : du {formatDateShortFr(event.startDate)} au {formatDateShortFr(event.endDate)}
                  </p>
                )}
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={manualDate}
                    min={effectiveMinDate}
                    max={effectiveMaxDate}
                    onChange={(e) => {
                      setManualDate(e.target.value);
                      setManualError(null);
                    }}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:ring-1 focus:ring-primary-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleManualLock}
                    disabled={!manualDate || isSubmitting}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition"
                  >
                    Valider
                  </button>
                </div>
                {manualError && (
                  <div className="flex items-center gap-1.5 text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded-lg">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{manualError}</span>
                  </div>
                )}
              </div>
            </details>
          </div>
        )
      )}
    </div>
  );
};
