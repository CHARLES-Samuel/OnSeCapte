import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, MapPin } from 'lucide-react';
import type { Event, EventParticipation } from '../../../models/Event';
import { MarkdownView } from '../../ui/MarkdownView';
import { UserAvatar } from '../../ui/UserAvatar';
import { CategoryBadge } from '../../ui/CategoryBadge';
import { EventParticipationBadge } from './EventParticipationBadge';
import { formatPrice, formatDateShort } from '../../../utils/format';

interface EventCardProps {
  event: Event;
  groupId: string;
  canEditOrDelete: boolean;
  creator: { name: string; photoUrl?: string | null };
  currentUserId?: string;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
  onUpdateParticipation?: (event: Event, participation: EventParticipation) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, groupId, canEditOrDelete, creator, currentUserId, onEdit, onDelete, onUpdateParticipation }) => {
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
      className="bg-slate-800/40 border border-slate-800 hover:border-primary-500/50 p-4 sm:p-6 rounded-2xl transition duration-200 cursor-pointer flex flex-col justify-between group hover:shadow-xl hover:shadow-primary-950/20"
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <CategoryBadge category={event.category} />
          <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            {formatPrice(event.price)}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-400 transition">{event.title}</h3>

        {event.location && (
          <div className="flex items-center gap-1.5 text-sm text-slate-400 mb-3">
            <MapPin className="w-4 h-4 shrink-0 text-slate-500" aria-hidden="true" />
            <span className="truncate">{event.location}</span>
          </div>
        )}
        
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {event.state === 'planifie' && event.finalDate ? (
            <div className="text-xs text-amber-300 font-medium bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 inline-flex items-center gap-1.5">
              <span>📅 {formatDateShort(event.finalDate)} {event.finalTimeSlot ? `- ${event.finalTimeSlot}` : ''}</span>
            </div>
          ) : event.state === 'passe' ? (
            <div className="text-xs text-slate-400 font-medium bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 inline-flex items-center">
              <span>Passé</span>
            </div>
          ) : (
            <div className="text-xs text-primary-300 font-medium bg-primary-500/10 px-2.5 py-1 rounded-lg border border-primary-500/20 inline-flex items-center">
              <span>Sondage de dates</span>
            </div>
          )}
          
          <EventParticipationBadge event={event} />
        </div>
        
        <div className="mb-4 line-clamp-3">
          <MarkdownView content={event.description || "Pas de description"} />
        </div>
        
        {currentUserId && onUpdateParticipation && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-700/50">
            <button
              onClick={(e) => handleParticipation(e, 'participating')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                userParticipation === 'participating'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white border border-transparent'
              }`}
            >
              Je participe
            </button>
            <button
              onClick={(e) => handleParticipation(e, 'not_participating')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                userParticipation === 'not_participating'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white border border-transparent'
              }`}
            >
              Je ne viens pas
            </button>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-700/50">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <UserAvatar
            photoUrl={creator.photoUrl}
            name={creator.name}
            size="sm"
            className="!w-5 !h-5 !text-[10px]"
          />
          <span>Par {creator.name}</span>
        </div>
        {canEditOrDelete && (
          <div className="flex items-center gap-1">
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(event);
              }} 
              className="text-slate-400 hover:text-white p-2 sm:p-1.5 rounded-lg hover:bg-slate-700/50 transition min-w-[36px] min-h-[36px] flex items-center justify-center"
              title="Modifier l'événement"
              aria-label="Modifier l'événement"
            >
              <Edit className="w-4 h-4 text-primary-400" aria-hidden="true" />
            </button>
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(event);
              }} 
              className="text-red-400 hover:text-red-300 p-2 sm:p-1.5 rounded-lg hover:bg-red-500/10 transition min-w-[36px] min-h-[36px] flex items-center justify-center"
              title="Supprimer l'événement"
              aria-label="Supprimer l'événement"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
