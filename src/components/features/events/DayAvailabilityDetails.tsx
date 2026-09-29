import React from 'react';
import { CheckCircle, HelpCircle, XCircle, Lock, Award, Calendar, AlertTriangle, Clock } from 'lucide-react';
import type { DateAvailabilityScore } from '../../../models/Availability';
import type { MemberProfile } from '../../../models/Group';
import { UserAvatar } from '../../ui/UserAvatar';
import { formatDateLongFr, isDatePast } from '../../../utils/dateUtils';

interface DayAvailabilityDetailsProps {
  dateStr: string;
  score?: DateAvailabilityScore;
  memberProfiles: Record<string, MemberProfile>;
  currentUserId?: string;
  canLock: boolean;
  isLocked: boolean;
  isInRange?: boolean;
  onLockDate?: (dateStr: string) => void;
}

export const DayAvailabilityDetails: React.FC<DayAvailabilityDetailsProps> = ({
  dateStr,
  score,
  memberProfiles,
  currentUserId,
  canLock,
  isLocked,
  isInRange = true,
  onLockDate,
}) => {
  const isPast = isDatePast(dateStr);
  const available = score?.available || [];
  const maybe = score?.maybe || [];
  const unavailable = score?.unavailable || [];
  const rank = score?.rank;

  const renderMemberList = (
    userIds: string[],
    emptyMessage: string,
    badgeColor: string
  ) => {
    if (userIds.length === 0) {
      return (
        <p className="text-xs text-slate-500 italic py-1">{emptyMessage}</p>
      );
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
      {/* En-tête : Date sélectionnée et rang au podium */}
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
              {rank === 1 ? '🥇 1ère place (Meilleur choix)' : rank === 2 ? '🥈 2ème place' : '🥉 3ème place'}
            </span>
          </span>
        )}
      </div>

      {/* 3 listes : Disponibles, À confirmer, Absents */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Disponibles */}
        <div className="bg-slate-800/40 border border-slate-800 p-3 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Disponibles ({available.length})</span>
          </div>
          {renderMemberList(
            available,
            'Aucun membre disponible',
            'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
          )}
        </div>

        {/* À confirmer */}
        <div className="bg-slate-800/40 border border-slate-800 p-3 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <HelpCircle className="w-3.5 h-3.5 shrink-0" />
            <span>À confirmer ({maybe.length})</span>
          </div>
          {renderMemberList(
            maybe,
            'Aucun membre incertain',
            'bg-amber-500/10 text-amber-300 border-amber-500/30'
          )}
        </div>

        {/* Absents */}
        <div className="bg-slate-800/40 border border-slate-800 p-3 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <XCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Indisponibles ({unavailable.length})</span>
          </div>
          {renderMemberList(
            unavailable,
            'Aucun membre indisponible',
            'bg-slate-800 text-slate-400 border-slate-700'
          )}
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

      {/* Action de verrouillage si canLock et date valide */}
      {canLock && !isLocked && !isPast && isInRange && onLockDate && (
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => onLockDate(dateStr)}
            className="w-full sm:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20"
          >
            <Lock className="w-4 h-4" />
            <span>Choisir & Verrouiller cette date</span>
          </button>
        </div>
      )}
    </div>
  );
};
