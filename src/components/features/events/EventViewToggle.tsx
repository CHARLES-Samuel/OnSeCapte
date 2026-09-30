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
  const isGrid = viewMode === 'grid';
  const targetMode = isGrid ? 'list' : 'grid';
  const label = isGrid ? 'Passer en affichage liste' : 'Passer en affichage grille';

  return (
    <button
      type="button"
      onClick={() => onChange(targetMode)}
      aria-label={label}
      title={label}
      className={`p-2 bg-slate-800 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 rounded-xl transition shadow-sm shrink-0 min-h-[38px] min-w-[38px] flex items-center justify-center ${className}`}
    >
      {isGrid ? (
        <List className="w-4 h-4 shrink-0 text-primary-400" aria-hidden="true" />
      ) : (
        <LayoutGrid className="w-4 h-4 shrink-0 text-primary-400" aria-hidden="true" />
      )}
    </button>
  );
};
