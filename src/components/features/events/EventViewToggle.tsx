import React from 'react';
import { LayoutGrid, List } from 'lucide-react';
import type { EventsViewMode } from '../../../hooks/useEventsViewMode';

interface EventViewToggleProps {
  viewMode: EventsViewMode;
  onChange: (mode: EventsViewMode) => void;
  className?: string;
}

export const EventViewToggle: React.FC<EventViewToggleProps> = ({
  viewMode,
  onChange,
  className = '',
}) => {
  return (
    <div
      role="group"
      aria-label="Mode d'affichage des événements"
      className={`inline-flex items-center bg-slate-900/80 border border-slate-800 rounded-xl p-1 shrink-0 ${className}`}
    >
      <button
        type="button"
        onClick={() => onChange('grid')}
        aria-pressed={viewMode === 'grid'}
        title="Vue en grille (cartes)"
        className={`p-1.5 sm:px-2 sm:py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 min-h-[32px] ${
          viewMode === 'grid'
            ? 'bg-slate-700 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <LayoutGrid className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline">Grille</span>
      </button>

      <button
        type="button"
        onClick={() => onChange('list')}
        aria-pressed={viewMode === 'list'}
        title="Vue en liste compacte"
        className={`p-1.5 sm:px-2 sm:py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 min-h-[32px] ${
          viewMode === 'list'
            ? 'bg-slate-700 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <List className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline">Liste</span>
      </button>
    </div>
  );
};
