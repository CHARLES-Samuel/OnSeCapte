import React from 'react';
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { EventParticipation } from '../../../models/Event';
import type { MemberProfile } from '../../../models/Group';
import { UserAvatar } from '../../ui/UserAvatar';

interface EventFixedParticipantsListProps {
  participations: Record<string, EventParticipation>;
  memberProfiles: Record<string, MemberProfile>;
  currentUserId?: string;
  totalMembers: number;
}

export const EventFixedParticipantsList: React.FC<EventFixedParticipantsListProps> = ({
  participations,
  memberProfiles,
  currentUserId,
  totalMembers,
}) => {
  const memberList = Object.entries(participations).map(([userId, status]) => ({
    userId,
    status,
  }));

  const participatingList = memberList.filter((m) => m.status === 'participating');
  const notParticipatingList = memberList.filter((m) => m.status === 'not_participating');
  const pendingCount = Math.max(0, totalMembers - memberList.length);

  return (
    <div className="bg-slate-800/40 border border-slate-800 p-4 sm:p-6 rounded-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-400" aria-hidden="true" />
            <span>Participants ({participatingList.length})</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Membres ayant confirmé leur présence pour cette date
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
          {participatingList.length} / {totalMembers} confirmés
        </span>
      </div>

      {/* Liste des participants confirmés */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Présents ({participatingList.length})</span>
        </h3>

        {participatingList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {participatingList.map(({ userId }) => {
              const profile = memberProfiles[userId];
              const isCurrentUser = userId === currentUserId;
              return (
                <div
                  key={userId}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80"
                >
                  <UserAvatar
                    photoUrl={profile?.photoURL}
                    name={profile?.displayName || 'Membre'}
                    size="sm"
                    className="!w-7 !h-7 !text-xs shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-200 truncate">
                      {profile?.displayName || 'Membre'}{' '}
                      {isCurrentUser && <span className="text-primary-400 font-semibold">(Moi)</span>}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 shrink-0">
                    Inscrit
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 bg-slate-900/40 rounded-xl border border-slate-800/60 text-slate-400 text-xs">
            Aucun participant confirmé pour le moment.
          </div>
        )}
      </div>

      {/* Liste des indisponibles */}
      {notParticipatingList.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-slate-800/60">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Indisponibles ({notParticipatingList.length})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {notParticipatingList.map(({ userId }) => {
              const profile = memberProfiles[userId];
              const isCurrentUser = userId === currentUserId;
              return (
                <div
                  key={userId}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/40 border border-slate-800/60 opacity-80"
                >
                  <UserAvatar
                    photoUrl={profile?.photoURL}
                    name={profile?.displayName || 'Membre'}
                    size="sm"
                    className="!w-6 !h-6 !text-[10px] shrink-0"
                  />
                  <span className="text-xs text-slate-400 truncate flex-1">
                    {profile?.displayName || 'Membre'}{' '}
                    {isCurrentUser && <span className="text-red-400">(Moi)</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* En attente */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-800/60">
          <Clock className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <span>{pendingCount} membre(s) du groupe n’ont pas encore confirmé leur présence.</span>
        </div>
      )}
    </div>
  );
};
