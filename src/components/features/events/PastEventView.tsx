import React from 'react';
import { Calendar, Clock, MapPin, ExternalLink, Users, CheckCircle } from 'lucide-react';
import type { Event } from '../../../models/Event';
import type { MemberProfile } from '../../../models/Group';
import { UserAvatar } from '../../ui/UserAvatar';
import { MarkdownView } from '../../ui/MarkdownView';
import { CategoryBadge } from '../../ui/CategoryBadge';
import { formatPrice } from '../../../utils/format';
import { formatDateLongFr } from '../../../utils/dateUtils';

interface PastEventViewProps {
  event: Event;
  memberProfiles: Record<string, MemberProfile>;
  currentUserId?: string;
}

export const PastEventView: React.FC<PastEventViewProps> = ({
  event,
  memberProfiles,
  currentUserId,
}) => {
  const participations = event.participations || {};
  const memberList = Object.entries(participations).map(([userId, status]) => ({
    userId,
    status,
  }));

  const presentMembers = memberList.filter((m) => m.status === 'participating');
  const currentUserResponse = currentUserId ? participations[currentUserId] : undefined;

  const eventDateFormatted = event.finalDate ? formatDateLongFr(event.finalDate) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Bannière de l'événement passé avec la date de réalisation */}
      <div className="bg-slate-800/60 border border-slate-700/80 p-5 sm:p-6 rounded-2xl text-center space-y-2 shadow-lg">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-400 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          <span>Événement Terminé</span>
        </div>

        {eventDateFormatted ? (
          <p className="text-slate-200 text-base sm:text-lg font-medium flex items-center justify-center gap-2 pt-1">
            <Calendar className="w-5 h-5 text-primary-400 shrink-0" aria-hidden="true" />
            <span>
              S'est déroulé le <strong className="text-white capitalize">{eventDateFormatted}</strong>
              {event.finalTimeSlot && ` — ${event.finalTimeSlot}`}
            </span>
          </p>
        ) : (
          <p className="text-slate-400 text-sm">Cet événement est passé.</p>
        )}

        {currentUserResponse === 'participating' && (
          <div className="pt-1 flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
              Tu étais présent(e)
            </span>
          </div>
        )}
      </div>

      {/* Grille principale : Personnes présentes & Description */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Colonne Gauche : Personnes présentes */}
        <div className="bg-slate-800/40 border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" aria-hidden="true" />
              <span>Personnes présentes ({presentMembers.length})</span>
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              {presentMembers.length} participant{presentMembers.length > 1 ? 's' : ''}
            </span>
          </div>

          {presentMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {presentMembers.map(({ userId }) => {
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
                      className="!w-8 !h-8 !text-xs shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-slate-200 truncate">
                        {profile?.displayName || 'Membre'}{' '}
                        {isCurrentUser && <span className="text-emerald-400 font-semibold">(Moi)</span>}
                      </p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-900/40 rounded-xl border border-slate-800/60 text-slate-400 text-xs">
              Aucune personne n'était enregistrée comme présente pour cette sortie.
            </div>
          )}
        </div>

        {/* Colonne Droite : Description & Informations pratiques */}
        <div className="bg-slate-800/40 border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base sm:text-lg font-bold text-white">
              Description de l'événement
            </h2>
            <div className="flex items-center gap-2">
              <CategoryBadge category={event.category} size="sm" />
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                {formatPrice(event.price)}
              </span>
            </div>
          </div>

          {/* Contenu Markdown de la description */}
          <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed">
            <MarkdownView content={event.description || "Aucune description fournie."} />
          </div>

          {/* Lieu & Liens externes éventuels */}
          {(event.location || event.link) && (
            <div className="pt-4 border-t border-slate-800/80 space-y-2 text-xs">
              {event.location && (
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
                  <span className="font-medium">{event.location}</span>
                </div>
              )}
              {event.link && (
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-blue-400 shrink-0" aria-hidden="true" />
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline font-medium truncate"
                  >
                    {event.link}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
