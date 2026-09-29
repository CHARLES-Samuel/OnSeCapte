import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, MapPin, Calendar, Check, X } from 'lucide-react';
import type { Event, EventParticipation } from '../../../models/Event';
import { CategoryBadge } from '../../ui/CategoryBadge';
import { EventParticipationBadge } from './EventParticipationBadge';
import { formatPrice, formatDateShort } from '../../../utils/format';

interface EventListItemProps {
  event: Event;
  groupId: string;
  canEditOrDelete: boolean;
  creator: { name: string; photoUrl?: string | null };
  currentUserId?: string;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
  onUpdateParticipation?: (event: Event, participation: EventParticipation) => void;
}

export const EventListItem: React.FC<EventListItemProps> = ({
  event,
  groupId,
  canEditOrDelete,
  currentUserId,
  onEdit,
  onDelete,
  onUpdateParticipation,
}) => {
  const navigate = useNavigate();
  const userParticipation = currentUserId ? event.participations?.[currentUserId] : undefined;

  const handleParticipation = (e: React.MouseEvent, status: EventParticipation) => {
    e.stopPropagation();
    if (onUpdateParticipation) {
      onUpdateParticipation(event, status);
    }
  };

  return (
    <div
      onClick={() => navigate(`/groups/${groupId}/events/${event.id}`)}
      className="bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 hover:border-primary-500/40 p-3 sm:p-4 rounded-xl transition duration-150 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 group shadow-sm hover:shadow-lg hover:shadow-primary-950/20"
    >
      {/* Informations principales (Date, Titre, Catégorie, Lieu) */}
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        {/* Date ou Statut */}
        <div className="shrink-0">
          {event.state === 'planifie' && event.finalDate ? (
            <div className="flex sm:flex-col items-center justify-center bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-semibold min-w-[76px] text-center gap-1 sm:gap-0">
              <Calendar className="w-3.5 h-3.5 sm:mb-0.5 text-amber-400" aria-hidden="true" />
              <span>{formatDateShort(event.finalDate)}</span>
            </div>
          ) : event.state === 'passe' ? (
            <div className="flex sm:flex-col items-center justify-center bg-slate-800 border border-slate-700 text-slate-400 px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-semibold min-w-[76px] text-center">
              <span>Passé</span>
            </div>
          ) : event.dateMode === 'range' && event.startDate && event.endDate ? (
            <div
              className="flex sm:flex-col items-center justify-center bg-blue-500/10 border border-blue-500/20 text-blue-300 px-2 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold min-w-[76px] text-center gap-1 sm:gap-0"
              title={`Du ${formatDateShort(event.startDate)} au ${formatDateShort(event.endDate)}`}
            >
              <Calendar className="w-3.5 h-3.5 sm:mb-0.5 text-blue-400 shrink-0" aria-hidden="true" />
              <span className="truncate">{formatDateShort(event.startDate)} - {formatDateShort(event.endDate)}</span>
            </div>
          ) : (
            <div className="flex sm:flex-col items-center justify-center bg-primary-500/10 border border-primary-500/20 text-primary-300 px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-semibold min-w-[76px] text-center">
              <span>Sondage</span>
            </div>
          )}
        </div>

        {/* Titre & Métadonnées */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-primary-400 transition truncate">
              {event.title}
            </h3>
            <CategoryBadge category={event.category} size="sm" />
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              {formatPrice(event.price)}
            </span>
          </div>

          {event.location && (
            <div className="flex items-center gap-1 text-xs text-slate-400 truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500" aria-hidden="true" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bloc droit : Participants & Actions Rapides */}
      <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t border-slate-800/60 md:border-t-0">
        {/* Résumé des participants */}
        <EventParticipationBadge event={event} />

        {/* Actions de participation rapide */}
        {currentUserId && onUpdateParticipation && event.state !== 'passe' && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => handleParticipation(e, 'participating')}
              title={userParticipation === 'participating' ? 'Tu participes déjà' : 'Je participe'}
              className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 border min-h-[32px] ${
                userParticipation === 'participating'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-300 border-slate-700'
              }`}
            >
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="text-xs hidden lg:inline">Présent</span>
            </button>
            <button
              type="button"
              onClick={(e) => handleParticipation(e, 'not_participating')}
              title={userParticipation === 'not_participating' ? 'Tu es noté indisponible' : 'Pas disponible'}
              className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 border min-h-[32px] ${
                userParticipation === 'not_participating'
                  ? 'bg-red-500/20 text-red-300 border-red-500/40 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-red-500/10 hover:text-red-300 border-slate-700'
              }`}
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="text-xs hidden lg:inline">Pas dispo</span>
            </button>
          </div>
        )}

        {/* Actions Modifier / Supprimer */}
        {canEditOrDelete && (
          <div className="flex items-center gap-1 pl-1 border-l border-slate-700/60">
            {event.state !== 'passe' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(event);
                }}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700/50 transition min-w-[32px] min-h-[32px] flex items-center justify-center"
                title="Modifier l'événement"
                aria-label="Modifier l'événement"
              >
                <Edit className="w-3.5 h-3.5 text-primary-400" aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(event);
              }}
              className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition min-w-[32px] min-h-[32px] flex items-center justify-center"
              title="Supprimer l'événement"
              aria-label="Supprimer l'événement"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
