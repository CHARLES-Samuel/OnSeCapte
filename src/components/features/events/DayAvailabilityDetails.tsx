import React, { useState, useEffect } from 'react';
import { CheckCircle, HelpCircle, XCircle, Lock, Award, Calendar, AlertTriangle, Clock } from 'lucide-react';
import type { DateAvailabilityScore } from '../../../models/Availability';
import type { TimeSlot } from '../../../models/Event';
import type { MemberProfile, DaySlot } from '../../../models/Group';
import { UserAvatar } from '../../ui/UserAvatar';
import { formatDateLongFr, isDatePast } from '../../../utils/dateUtils';
import { DAY_SLOTS, SLOT_DEFINITIONS, daySlotToTimeSlot } from '../../../utils/timeSlotUtils';

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
}) => {
  const isPast = isDatePast(dateStr);
  const [activeSlot, setActiveSlot] = useState<DaySlot | 'all'>(selectedSlot || 'all');
  const [lockTimeSlot, setLockTimeSlot] = useState<TimeSlot>(
    selectedSlot ? daySlotToTimeSlot(selectedSlot) : 'Toute la journée'
  );

  useEffect(() => {
    if (selectedSlot) {
      setActiveSlot(selectedSlot);
      setLockTimeSlot(daySlotToTimeSlot(selectedSlot));
    }
  }, [selectedSlot]);

  const displayedScore = activeSlot === 'all' ? score : score?.slots?.[activeSlot];
  const available = displayedScore?.available || [];
  const maybe = displayedScore?.maybe || [];
  const unavailable = displayedScore?.unavailable || [];
  const rank = displayedScore?.rank;

  const renderMemberList = (userIds: string[], emptyMessage: string, badgeColor: string) => {
    if (userIds.length === 0) {
      return <p className="text-xs text-slate-500 italic py-1">{emptyMessage}</p>;
    }
    return (
      <div className="flex flex-wrap gap-2 pt-1">
        {userIds.map((uid) => {
          const profile = memberProfiles[uid];
          const isMe = uid === currentUserId;
          return (
            <div
              key={uid}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${badgeColor}`}
            >
              <UserAvatar
                photoUrl={profile?.photoURL}
                name={profile?.displayName || 'Membre'}
                size="sm"
                className="!w-5 !h-5 !text-[10px]"
              />
              <span className="truncate max-w-[120px]">
                {profile?.displayName || 'Membre'} {isMe && '(Moi)'}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg transition-all animate-fade-in">
      {/* En-tête : Date sélectionnée et rang */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary-400 shrink-0" />
          <h4 className="font-bold text-white capitalize text-sm sm:text-base">
            {formatDateLongFr(dateStr)}
          </h4>
        </div>

        {rank && (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              rank === 1
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : rank === 2
                ? 'bg-slate-300/20 text-slate-200 border-slate-300/40'
                : 'bg-amber-700/20 text-amber-500 border-amber-700/40'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>
              {rank === 1 ? '🥇 1ère place' : rank === 2 ? '🥈 2ème place' : '🥉 3ème place'}
            </span>
          </span>
        )}
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
          className={`min-h-[44px] sm:min-h-[36px] px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-between sm:justify-start gap-1.5 active:scale-95 ${
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
              className={`min-h-[44px] sm:min-h-[36px] px-2.5 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-between sm:justify-start gap-1.5 active:scale-95 ${
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

      {/* 3 listes : Disponibles, À confirmer, Absents */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-slate-800/40 border border-slate-800 p-3 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Disponibles ({available.length})</span>
          </div>
          {renderMemberList(available, 'Aucun membre disponible', 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30')}
        </div>

        <div className="bg-slate-800/40 border border-slate-800 p-3 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <HelpCircle className="w-3.5 h-3.5 shrink-0" />
            <span>À confirmer ({maybe.length})</span>
          </div>
          {renderMemberList(maybe, 'Aucun membre incertain', 'bg-amber-500/10 text-amber-300 border-amber-500/30')}
        </div>

        <div className="bg-slate-800/40 border border-slate-800 p-3 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <XCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Indisponibles ({unavailable.length})</span>
          </div>
          {renderMemberList(unavailable, 'Aucun membre indisponible', 'bg-slate-800 text-slate-400 border-slate-700')}
        </div>
      </div>

      {/* Messages d'information si la date ne peut pas être fixée */}
      {isPast && (
        <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-xl text-xs text-slate-400 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
          <span>Cette date est déjà passée. Il n'est pas possible de fixer un événement dans le passé.</span>
        </div>
      )}

      {!isInRange && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-xs text-amber-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
          <span>Cette date est en dehors de la plage définie pour l'événement.</span>
        </div>
      )}

      {/* Action de verrouillage : fixation de la date ET du créneau */}
      {canLock && !isLocked && !isPast && isInRange && onLockDate && (
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label htmlFor="lock-slot-select" className="text-xs text-slate-300 font-medium">
              Créneau :
            </label>
            <select
              id="lock-slot-select"
              value={lockTimeSlot}
              onChange={(e) => setLockTimeSlot(e.target.value as TimeSlot)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 sm:py-1.5 text-xs text-white min-h-[44px] sm:min-h-[36px] focus:ring-1 focus:ring-amber-500 outline-none"
            >
              <option value="Matin">Matin (8h - 12h)</option>
              <option value="Après-midi">Après-midi (12h - 18h)</option>
              <option value="Soirée">Soirée (18h - 00h)</option>
              <option value="Toute la journée">Toute la journée</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => onLockDate(dateStr, lockTimeSlot)}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 min-h-[44px] sm:min-h-[36px] bg-amber-600 hover:bg-amber-500 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20"
          >
            <Lock className="w-4 h-4" />
            <span>Valider {lockTimeSlot !== 'Toute la journée' ? `en ${lockTimeSlot}` : 'la journée'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
