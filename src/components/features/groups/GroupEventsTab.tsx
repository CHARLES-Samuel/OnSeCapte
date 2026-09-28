import React from 'react';
import {
  Plus, Sparkles, Utensils, Dices, PartyPopper, Pizza, Dumbbell, Gamepad2, MoreHorizontal
} from 'lucide-react';
import type { Event, EventCategory } from '../../../models/Event';
import { EventCard } from '../events/EventCard';

const categoryIcons: Record<EventCategory, React.ElementType> = {
  'Restaurant': Utensils,
  'Jeux de rôle': Dices,
  'Soirée': PartyPopper,
  'Repas': Pizza,
  'Sport': Dumbbell,
  'Gaming': Gamepad2,
  'Autres': MoreHorizontal,
};

export type EventFilterState = 'Tous' | 'En recherche' | 'À venir' | 'Passés';

interface GroupEventsTabProps {
  events: Event[];
  filteredEvents: Event[];
  eventsLoading: boolean;
  categories: (EventCategory | 'Toutes')[];
  activeCategory: EventCategory | 'Toutes';
  onSelectCategory: (category: EventCategory | 'Toutes') => void;
  activeState: EventFilterState;
  onSelectState: (state: EventFilterState) => void;
  sortOrder: 'asc' | 'desc';
  onToggleSortOrder: () => void;
  onCreateEvent: () => void;
  groupId: string;
  currentUserId?: string;
  isOwner: boolean;
  getCreatorName: (event: Event) => string;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (event: Event) => void;
}

export const GroupEventsTab: React.FC<GroupEventsTabProps> = ({
  events,
  filteredEvents,
  eventsLoading,
  categories,
  activeCategory,
  onSelectCategory,
  activeState,
  onSelectState,
  sortOrder,
  onToggleSortOrder,
  onCreateEvent,
  groupId,
  currentUserId,
  isOwner,
  getCreatorName,
  onEditEvent,
  onDeleteEvent,
}) => {
  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center bg-slate-800/40 border border-slate-800 p-3 sm:p-4 rounded-2xl gap-4">
        <div className="flex flex-col gap-3 w-full min-w-0 md:w-auto">
          {/* Filtres par état */}
          <div className="flex space-x-2 overflow-x-auto pb-1.5 scrollbar-thin touch-pan-x -mx-1 px-1">
            {(['Tous', 'En recherche', 'À venir', 'Passés'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => onSelectState(st)}
                aria-pressed={activeState === st}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border shrink-0 ${
                  activeState === st
                    ? 'bg-slate-700 border-slate-600 text-white shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Filtres par catégorie */}
          <div className="flex space-x-2 overflow-x-auto pb-1.5 scrollbar-thin touch-pan-x -mx-1 px-1">
            {categories.map((cat) => {
              const Icon = cat !== 'Toutes' ? categoryIcons[cat] : Sparkles;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onSelectCategory(cat)}
                  aria-pressed={activeCategory === cat}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition border shrink-0 min-h-[36px] ${
                    activeCategory === cat
                      ? 'bg-primary-600 border-primary-500 text-white shadow-md shadow-primary-600/20'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Boutons d'action (Tri & Création) */}
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-between sm:justify-end shrink-0">
          <button
            type="button"
            onClick={onToggleSortOrder}
            aria-label={`Trier par prix ${sortOrder === 'asc' ? 'décroissant' : 'croissant'}`}
            className="inline-flex items-center justify-center min-w-[145px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs font-medium whitespace-nowrap transition shrink-0 select-none shadow-sm"
          >
            <span>Prix : {sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}</span>
            <span className="text-primary-400 font-bold ml-1.5">{sortOrder === 'asc' ? '↑' : '↓'}</span>
          </button>
          <button
            type="button"
            onClick={onCreateEvent}
            aria-label="Créer un nouvel événement"
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-600/20 transition text-xs sm:text-sm font-medium whitespace-nowrap min-h-[36px]"
          >
            <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Créer événement</span>
          </button>
        </div>
      </div>

      {/* Liste des événements */}
      {eventsLoading && events.length === 0 ? (
        <div className="text-center py-12 text-slate-500">Chargement des événements...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/20 rounded-2xl border border-slate-800/50">
          <p className="text-slate-400">Aucun événement ne correspond à tes filtres.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              groupId={groupId}
              canEditOrDelete={isOwner || event.createdBy === currentUserId}
              creatorName={getCreatorName(event)}
              onEdit={(e) => onEditEvent(e)}
              onDelete={(e) => onDeleteEvent(e)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
