import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, MapPin, Check, X } from 'lucide-react';
import type { Event, EventParticipation } from '../../../models/Event';
import { CategoryBadge } from '../../ui/CategoryBadge';
import { EventParticipationBadge } from './EventParticipationBadge';
import { EventListDateBadge } from './EventListDateBadge';
import { EventListDescription } from './EventListDescription';
import { formatPrice } from '../../../utils/format';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const userParticipation = currentUserId ? event.participations?.[currentUserId] : undefined;

  const handleParticipation = (e: React.MouseEvent, status: EventParticipation) => {
    e.stopPropagation();
    if (onUpdateParticipation) {
      onUpdateParticipation(event, status);
    }
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  return (
    <div
      onClick={() => navigate(`/groups/${groupId}/events/${event.id}`)}
      className={`bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 hover:border-primary-500/40 p-3 sm:p-4 rounded-xl transition duration-150 cursor-pointer flex flex-col md:flex-row ${
        isExpanded ? 'md:items-start' : 'md:items-center'
      } justify-between gap-3 group shadow-sm hover:shadow-lg hover:shadow-primary-950/20`}
    >
      {/* Informations principales (Date, Titre, Catégorie, Lieu, Description) */}
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* Colonne Date ou Statut */}
        <EventListDateBadge event={event} />

        {/* Bloc central à 2 niveaux : Titre & Métadonnées + Description */}
        <div className="min-w-0 flex-1 space-y-1">
          {/* Première ligne : Titre, Catégorie, Prix, Lieu */}
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-primary-400 transition truncate min-w-0 max-w-full sm:max-w-md">
              {event.title}
            </h3>
            <CategoryBadge category={event.category} size="sm" />
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 shrink-0">
              {formatPrice(event.price)}
            </span>
            {event.location && (
              <span
                className="inline-flex items-center gap-1 text-xs text-slate-400 shrink-0 max-w-[150px] sm:max-w-[200px]"
                title={event.location}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500" aria-hidden="true" />
                <span className="truncate">{event.location}</span>
              </span>
            )}
          </div>

          {/* Deuxième ligne : Description courte avec aperçu tronqué ou déplié */}
          <EventListDescription
            description={event.description}
            isExpanded={isExpanded}
            onToggleExpand={handleToggleExpand}
          />
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
