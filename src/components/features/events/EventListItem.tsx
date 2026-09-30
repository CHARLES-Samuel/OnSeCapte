import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import type { Event, EventParticipation } from '../../../models/Event';
import { CategoryBadge } from '../../ui/CategoryBadge';
import { EventParticipationBadge } from './EventParticipationBadge';
import { EventListDateBadge } from './EventListDateBadge';
import { EventListDescription } from './EventListDescription';
import { EventParticipationButtons } from './EventParticipationButtons';
import { EventActionsMenu } from './EventActionsMenu';
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

  const handleParticipation = (status: EventParticipation) => {
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
      className="bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 hover:border-primary-500/40 p-3 sm:p-3.5 rounded-xl transition duration-150 cursor-pointer flex flex-col gap-2 group shadow-sm hover:shadow-lg hover:shadow-primary-950/20 min-w-0"
    >
      {/* Niveau 1 : Colonnes Prix + Catégorie (largeurs fixes pour aligner les titres) + Titre + Menu ⋯ */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 w-full">
        {/* Colonne 1 : Prix (largeur fixe) */}
        <span
          className="w-14 sm:w-16 shrink-0 text-center text-xs font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20 truncate"
          title={formatPrice(event.price)}
        >
          {formatPrice(event.price)}
        </span>

        {/* Colonne 2 : Catégorie (largeur fixe) */}
        <div className="w-24 sm:w-28 shrink-0">
          <CategoryBadge
            category={event.category}
            size="sm"
            className="w-full justify-center text-center px-1.5 py-0.5 text-[11px] sm:text-xs truncate"
          />
        </div>

        {/* Colonne 3 : Titre (prend tout l'espace restant et tronqué avec ellipsis) */}
        <h3
          className="flex-1 min-w-0 text-sm sm:text-base font-bold text-white group-hover:text-primary-400 transition truncate"
          title={event.title}
        >
          {event.title}
        </h3>

        {/* Actions secondaires regroupées dans le menu « ⋯ » */}
        {canEditOrDelete && (
          <EventActionsMenu
            canEdit={event.state !== 'passe'}
            onEdit={() => onEdit(event)}
            onDelete={() => onDelete(event)}
          />
        )}
      </div>

      {/* Niveau 2 : Statut / Date / Consensus, Lieu, Participants & Boutons d'action */}
      <div className="flex flex-wrap items-center justify-between gap-y-1.5 gap-x-2 pt-1.5 border-t border-slate-800/60 text-xs text-slate-400 min-w-0">
        {/* Statut / Date et Lieu */}
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <EventListDateBadge event={event} />
          {event.location && (
            <span
              className="inline-flex items-center gap-1 text-xs text-slate-400 shrink-0 max-w-[130px] sm:max-w-[200px]"
              title={event.location}
            >
              <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500" aria-hidden="true" />
              <span className="truncate">{event.location}</span>
            </span>
          )}
        </div>

        {/* Participants & Participation rapide */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <EventParticipationBadge event={event} compact={true} />

          {currentUserId && onUpdateParticipation && event.state !== 'passe' && (
            <EventParticipationButtons
              currentParticipation={userParticipation}
              onSelect={handleParticipation}
              variant="compact"
            />
          )}
        </div>
      </div>

      {/* Description courte avec aperçu tronqué ou déplié (si renseignée) */}
      {event.description?.trim() && (
        <EventListDescription
          description={event.description}
          isExpanded={isExpanded}
          onToggleExpand={handleToggleExpand}
        />
      )}
    </div>
  );
};
