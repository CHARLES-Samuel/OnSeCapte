import React from 'react';
import { Plus, Archive } from 'lucide-react';
import type { Event, EventParticipation } from '../../../models/Event';
import { EventCard } from '../events/EventCard';
import { EventListItem } from '../events/EventListItem';
import { CategoryDropdown } from '../events/CategoryDropdown';
import { EventSortDropdown } from '../events/EventSortDropdown';
import { EventViewToggle } from '../events/EventViewToggle';
import type { CategoryFilterValue } from '../../../utils/categoryTheme';
import type { EventSortOption } from '../../../utils/eventSortUtils';
import type { EventsViewMode } from '../../../hooks/useEventsViewMode';

export type EventFilterState = 'Tous' | 'En recherche' | 'À venir' | 'Passés';

interface GroupEventsTabProps {
  events: Event[];
  filteredEvents: Event[];
  eventsLoading: boolean;
  categories: CategoryFilterValue[];
  activeCategory: CategoryFilterValue;
  onSelectCategory: (category: CategoryFilterValue) => void;
  activeState: EventFilterState;
  onSelectState: (state: EventFilterState) => void;
  stateCounts?: Record<EventFilterState, number>;
  sortOption: EventSortOption;
  onSelectSortOption: (option: EventSortOption) => void;
  viewMode: EventsViewMode;
  onSelectViewMode: (mode: EventsViewMode) => void;
  onCreateEvent: () => void;
  groupId: string;
  currentUserId?: string;
  isOwner: boolean;
  getCreatorProfile: (event: Event) => { name: string; photoUrl?: string | null };
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (event: Event) => void;
  onUpdateParticipation?: (event: Event, participation: EventParticipation) => void;
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
  stateCounts,
  sortOption,
  onSelectSortOption,
  viewMode,
  onSelectViewMode,
  onCreateEvent,
  groupId,
  currentUserId,
  isOwner,
  getCreatorProfile,
  onEditEvent,
  onDeleteEvent,
  onUpdateParticipation,
}) => {
  return (
    <div className="space-y-6">
      {/* Filtres & Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center bg-slate-800/40 border border-slate-800 p-3 sm:p-4 rounded-2xl gap-3 sm:gap-4">
        {/* Filtres : États + Dropdown Catégories */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full min-w-0 lg:w-auto">
          {/* Filtres par état avec compteurs dynamiques */}
          <div className="flex space-x-1.5 sm:space-x-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin touch-pan-x -mx-1 px-1 sm:mx-0 sm:px-0">
            {(['Tous', 'En recherche', 'À venir', 'Passés'] as const).map((st) => {
              const count = stateCounts ? stateCounts[st] : undefined;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => onSelectState(st)}
                  aria-pressed={activeState === st}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border shrink-0 min-h-[36px] flex items-center gap-1.5 ${
                    activeState === st
                      ? 'bg-slate-700 border-slate-600 text-white shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <span>{st}</span>
                  {count !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        activeState === st
                          ? 'bg-slate-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Filtre par catégorie : Sélecteur déroulant stylisé */}
          <CategoryDropdown
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={onSelectCategory}
            className="w-full sm:w-auto shrink-0"
          />
        </div>

        {/* Boutons d'action (Tri, Bascule Grille/Liste & Création) */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 w-full lg:w-auto justify-between sm:justify-end shrink-0 pt-2 lg:pt-0 border-t border-slate-800/60 lg:border-t-0">
          {/* Sélecteur de tri par date */}
          <EventSortDropdown
            sortOption={sortOption}
            onSelectSortOption={onSelectSortOption}
            className="flex-1 sm:flex-none"
          />

          {/* Bascule Grille / Liste */}
          <EventViewToggle
            viewMode={viewMode}
            onChange={onSelectViewMode}
          />

          {/* Bouton Nouvel Événement */}
          <button
            type="button"
            onClick={onCreateEvent}
            aria-label="Créer un nouvel événement"
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-600/20 transition text-xs sm:text-sm font-medium whitespace-nowrap min-h-[38px]"
          >
            <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Créer</span>
            <span className="hidden sm:inline">événement</span>
          </button>
        </div>
      </div>

      {/* Liste des événements */}
      {eventsLoading && events.length === 0 ? (
        <div className="text-center py-12 text-slate-500">Chargement des événements...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/20 rounded-2xl border border-slate-800/50 space-y-3">
          <p className="text-slate-400 font-medium">
            {activeState === 'Passés'
              ? 'Aucun événement passé pour le moment.'
              : activeState === 'En recherche'
              ? 'Aucun événement en recherche de date.'
              : activeState === 'À venir'
              ? 'Aucun événement planifié à venir.'
              : 'Aucun événement actif en cours.'}
          </p>
          {activeState === 'Tous' && (stateCounts?.['Passés'] || 0) > 0 && (
            <button
              type="button"
              onClick={() => onSelectState('Passés')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            >
              <Archive className="w-3.5 h-3.5 text-slate-400" />
              <span>Consulter les événements passés ({stateCounts?.['Passés']})</span>
            </button>
          )}
        </div>
      ) : viewMode === 'list' ? (
        /* Vue en Liste Compacte */
        <div className="space-y-2.5">
          {filteredEvents.map((event) => (
            <EventListItem
              key={event.id}
              event={event}
              groupId={groupId}
              canEditOrDelete={isOwner || event.createdBy === currentUserId}
              creator={getCreatorProfile(event)}
              currentUserId={currentUserId}
              onEdit={onEditEvent}
              onDelete={onDeleteEvent}
              onUpdateParticipation={onUpdateParticipation}
            />
          ))}
        </div>
      ) : (
        /* Vue en Grille de Cartes */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              groupId={groupId}
              canEditOrDelete={isOwner || event.createdBy === currentUserId}
              creator={getCreatorProfile(event)}
              currentUserId={currentUserId}
              onEdit={onEditEvent}
              onDelete={onDeleteEvent}
              onUpdateParticipation={onUpdateParticipation}
            />
          ))}
        </div>
      )}

      {/* Raccourci vers les archives quand on est sur "Tous" et qu'il y a des événements passés */}
      {activeState === 'Tous' && filteredEvents.length > 0 && (stateCounts?.['Passés'] || 0) > 0 && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <Archive className="w-4 h-4 text-slate-500 shrink-0 hidden sm:block" />
            <span>
              <strong>{stateCounts?.['Passés']} événement{(stateCounts?.['Passés'] || 0) > 1 ? 's' : ''} passé{(stateCounts?.['Passés'] || 0) > 1 ? 's' : ''}</strong> archivé{(stateCounts?.['Passés'] || 0) > 1 ? 's' : ''} pour alléger l'affichage.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelectState('Passés')}
            className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold transition border border-slate-700 text-center"
          >
            Voir les passés ({stateCounts?.['Passés']})
          </button>
        </div>
      )}
    </div>
  );
};
