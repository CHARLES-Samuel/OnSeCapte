import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Sparkles, Utensils, Dices, PartyPopper, Pizza, Dumbbell, Gamepad2, MoreHorizontal } from 'lucide-react';
import type { Event, EventCategory } from '../../../models/Event';
import { MarkdownView } from '../../ui/MarkdownView';
import { formatPrice, formatDateShort } from '../../../utils/format';

const categoryIcons: Record<EventCategory, any> = {
  'Restaurant': Utensils,
  'Jeux de rôle': Dices,
  'Soirée': PartyPopper,
  'Repas': Pizza,
  'Sport': Dumbbell,
  'Gaming': Gamepad2,
  'Autres': MoreHorizontal,
};

interface EventCardProps {
  event: Event;
  groupId: string;
  canEditOrDelete: boolean;
  creatorName: string;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
}

export const EventCard = ({ event, groupId, canEditOrDelete, creatorName, onEdit, onDelete }: EventCardProps) => {
  const navigate = useNavigate();
  const Icon = categoryIcons[event.category] || Sparkles;

  return (
    <div 
      onClick={() => navigate(`/groups/${groupId}/events/${event.id}`)}
      className="bg-slate-800/40 border border-slate-800 hover:border-primary-500/50 p-6 rounded-2xl transition duration-200 cursor-pointer flex flex-col justify-between group hover:shadow-xl hover:shadow-primary-950/20"
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium text-slate-300">
            <Icon className="w-3.5 h-3.5 text-primary-400" />
            <span>{event.category}</span>
          </span>
          <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            {formatPrice(event.price)}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-400 transition">{event.title}</h3>
        
        {event.state === 'planifie' && event.finalDate && (
          <div className="mb-3 text-sm text-amber-300 font-medium bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 inline-block">
            📅 {formatDateShort(event.finalDate)} {event.finalTimeSlot ? `- ${event.finalTimeSlot}` : ''}
          </div>
        )}
        
        <div className="mb-4 line-clamp-3">
          <MarkdownView content={event.description || "Pas de description"} />
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-700/50">
        <span className="text-xs text-slate-500">Par {creatorName}</span>
        {canEditOrDelete && (
          <div className="flex items-center gap-1">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(event);
              }} 
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700/50 transition"
              title="Modifier l'événement"
            >
              <Edit className="w-4 h-4 text-primary-400" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(event);
              }} 
              className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition"
              title="Supprimer l'événement"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
