import React, { useState, useEffect } from 'react';
import { Award, Calendar } from 'lucide-react';
import type { DateAvailabilityScore } from '../../../models/Availability';
import type { TimeSlot } from '../../../models/Event';
import type { MemberProfile, DaySlot } from '../../../models/Group';
import { formatDateLongFr, isDatePast } from '../../../utils/dateUtils';
import { DAY_SLOTS, SLOT_DEFINITIONS, daySlotToTimeSlot } from '../../../utils/timeSlotUtils';
import { DayStatusAccordion } from './DayStatusAccordion';
import { DayLockFooter } from './DayLockFooter';
import { DayLockConfirmModal } from './DayLockConfirmModal';

interface DayAvailabilityDetailsProps {
  dateStr: string;
  score?: DateAvailabilityScore;
  memberProfiles: Record<string, MemberProfile>;
  currentUserId?: string;
  canLock: boolean;
  isLocked: boolean;
  isInRange?: boolean;
  selectedSlot?: DaySlot | null;
  onSelectSlot?: (slot: DaySlot | null) => void;
  onLockDate?: (dateStr: string, timeSlot: TimeSlot) => void;
  eventTitle?: string;
  totalMembers?: number;
}

export const DayAvailabilityDetails: React.FC<DayAvailabilityDetailsProps> = ({
  dateStr,
  score,
  memberProfiles,
  currentUserId,
  canLock,
  isLocked,
  isInRange = true,
  selectedSlot,
  onSelectSlot,
  onLockDate,
  eventTitle,
  totalMembers,
}) => {
  const isPast = isDatePast(dateStr);
  const [activeSlot, setActiveSlot] = useState<DaySlot | 'all'>(selectedSlot || 'all');
  const [lockTimeSlot, setLockTimeSlot] = useState<TimeSlot>(
    selectedSlot ? daySlotToTimeSlot(selectedSlot) : 'Toute la journée'
  );
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    if (selectedSlot) {
      setActiveSlot(selectedSlot);
      setLockTimeSlot(daySlotToTimeSlot(selectedSlot));
    }
  }, [selectedSlot]);

  const handleTimeSlotChange = (slot: TimeSlot) => {
    setLockTimeSlot(slot);
    if (slot === 'Toute la journée') {
      setActiveSlot('all');
      onSelectSlot?.(null);
    } else if (slot === 'Matin') {
      setActiveSlot('morning');
      onSelectSlot?.('morning');
    } else if (slot === 'Après-midi') {
      setActiveSlot('afternoon');
      onSelectSlot?.('afternoon');
    } else if (slot === 'Soirée') {
      setActiveSlot('evening');
      onSelectSlot?.('evening');
    }
  };

  const displayedScore = activeSlot === 'all' ? score : score?.slots?.[activeSlot];
  const available = displayedScore?.available || [];
  const maybe = displayedScore?.maybe || [];
  const unavailable = displayedScore?.unavailable || [];
  const rank = displayedScore?.rank;

  const totalResponding = available.length + maybe.length + unavailable.length;
  const denominator = totalMembers || totalResponding || 1;
  const availablePct = Math.round((available.length / denominator) * 100);
  const maybePct = Math.round((maybe.length / denominator) * 100);
  const unavailablePct = Math.round((unavailable.length / denominator) * 100);

  const getRankBadge = (rankNum: number) => {
    if (rankNum === 1) {
      return {
        label: '1ère place (Meilleur choix)',
        tooltip: 'Date avec le plus de disponibilités pour le groupe',
        classes: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm',
      };
    }
    if (rankNum === 2) {
      return {
        label: '2ème place',
        tooltip: 'Deuxième date avec le plus grand consensus',
        classes: 'bg-slate-300/20 text-slate-200 border-slate-300/40',
      };
    }
    return {
      label: '3ème place',
      tooltip: 'Troisième date avec le plus grand consensus',
      classes: 'bg-amber-700/20 text-amber-400 border-amber-700/40',
    };
  };

  const rankInfo = rank ? getRankBadge(rank) : null;

  return (
    <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl transition-all animate-fade-in overflow-hidden">
      {/* En-tête : Titre de l'événement, Date sélectionnée, Badge rang et Consensus */}
      <div className="space-y-2 border-b border-slate-800 pb-3">
        {eventTitle && (
          <div className="text-[11px] font-semibold text-primary-400 uppercase tracking-wider">
            {eventTitle}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary-400 shrink-0" aria-hidden="true" />
            <h4 className="font-bold text-white capitalize text-sm sm:text-base">
              {formatDateLongFr(dateStr)}
            </h4>
          </div>

          {rankInfo && (
            <span
              title={rankInfo.tooltip}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border cursor-help ${rankInfo.classes}`}
            >
              <Award className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{rankInfo.label}</span>
            </span>
          )}
        </div>

        {/* Résumé du consensus et mini barre segmentée */}
        <div className="space-y-1.5 pt-1">
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-300 gap-1">
            <span>
              <strong className="text-emerald-400">{available.length}</strong> dispo{available.length > 1 ? 's' : ''} ·{' '}
              <strong className="text-amber-400">{maybe.length}</strong> à confirmer ·{' '}
              <strong className="text-slate-300">{unavailable.length}</strong> indispo{unavailable.length > 1 ? 's' : ''}
            </span>
            {totalMembers && (
              <span className="text-[11px] text-slate-400">
                ({available.length}/{totalMembers} membres)
              </span>
            )}
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex" aria-hidden="true">
            <div style={{ width: `${availablePct}%` }} className="bg-emerald-500 h-full transition-all" />
            <div style={{ width: `${maybePct}%` }} className="bg-amber-500 h-full transition-all" />
            <div style={{ width: `${unavailablePct}%` }} className="bg-slate-600 h-full transition-all" />
          </div>
        </div>
      </div>

      {/* Onglets de ventilation : Journée globale vs Créneaux individuels */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 bg-slate-800/60 p-1.5 rounded-xl border border-slate-700/60">
        <button
          type="button"
          onClick={() => {
            setActiveSlot('all');
            onSelectSlot?.(null);
            setLockTimeSlot('Toute la journée');
          }}
          className={`min-h-[44px] sm:min-h-[36px] px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-between sm:justify-start gap-1.5 active:scale-95 cursor-pointer ${
            activeSlot === 'all'
              ? 'bg-primary-600 text-white shadow-sm ring-1 ring-primary-400'
              : 'text-slate-400 hover:text-white bg-slate-900/40 sm:bg-transparent'
          }`}
        >
          <span>Journée entière</span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              (score?.available.length || 0) > 0
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            {score?.available.length || 0}
          </span>
        </button>

        {DAY_SLOTS.map((s) => {
          const sScore = score?.slots?.[s];
          const def = SLOT_DEFINITIONS[s];
          const isSlotActive = activeSlot === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => {
                setActiveSlot(s);
                onSelectSlot?.(s);
                setLockTimeSlot(def.timeSlot);
              }}
              className={`min-h-[44px] sm:min-h-[36px] px-2.5 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-between sm:justify-start gap-1.5 active:scale-95 cursor-pointer ${
                isSlotActive
                  ? 'bg-primary-600 text-white shadow-sm ring-1 ring-primary-400'
                  : 'text-slate-400 hover:text-white bg-slate-900/40 sm:bg-transparent'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center text-left">
                <span>{def.label}</span>
                <span className="text-[10px] opacity-75 font-normal sm:ml-1">({def.timeRange})</span>
              </div>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  (sScore?.available.length || 0) > 0
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {sScore?.available.length || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Listes de membres en accordéon responsif */}
      <DayStatusAccordion
        available={available}
        maybe={maybe}
        unavailable={unavailable}
        memberProfiles={memberProfiles}
        currentUserId={currentUserId}
      />

      {/* Zone d'action de verrouillage intégrée */}
      <DayLockFooter
        canLock={canLock}
        isLocked={isLocked}
        isPast={isPast}
        isInRange={isInRange}
        lockTimeSlot={lockTimeSlot}
        onChangeTimeSlot={handleTimeSlotChange}
        onOpenConfirmModal={() => setIsConfirmModalOpen(true)}
      />

      {/* Modale de confirmation avant verrouillage */}
      <DayLockConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => onLockDate?.(dateStr, lockTimeSlot)}
        dateStr={dateStr}
        timeSlot={lockTimeSlot}
        availableCount={available.length}
        maybeCount={maybe.length}
        unavailableCount={unavailable.length}
        totalMembers={totalMembers}
        eventTitle={eventTitle}
      />
    </div>
  );
};
