import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Event } from '../../../models/Event';
import { getCategoryTheme } from '../../../utils/categoryTheme';
import { getEventChipAriaLabel } from '../../../utils/calendarEventUtils';

export interface CalendarEventChipProps {
  event: Event;
  groupId: string;
  dateStr: string;
  consensusText?: string;
  consensusShortText?: string;
  isPastDate?: boolean;
  onSelectEvent?: (event: Event) => void;
  className?: string;
}

export const CalendarEventChip: React.FC<CalendarEventChipProps> = ({
  event,
  groupId,
  dateStr,
  consensusText,
  consensusShortText,
  isPastDate = false,
  onSelectEvent,
  className = '',
}) => {
  const navigate = useNavigate();
  const categoryTheme = getCategoryTheme(event.category);

  const isPlanifie = event.state === 'planifie';
  const isPasse = event.state === 'passe' || isPastDate;
  const isSondage = event.state === 'sondage' && !isPasse;

  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (onSelectEvent) {
      onSelectEvent(event);
    } else {
      navigate(`/groups/${groupId}/events/${event.id}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  const ariaLabel = getEventChipAriaLabel(event, dateStr, consensusText);

  // Définition des variantes visuelles : Plein (validé), Atténué/Pointillé (sondage), Grisé (passé)
  const getStyleClasses = () => {
    if (isPasse) {
      return 'bg-slate-800/80 border-slate-700/60 text-slate-400 opacity-60 hover:opacity-100 hover:border-slate-500';
    }
    if (isPlanifie) {
      return `${categoryTheme.badgeClasses} shadow-sm border font-semibold hover:brightness-110 active:scale-95`;
    }
    // Sondage : style atténué avec bordure pointillée
    return `${categoryTheme.badgeClasses} bg-opacity-40 border-dashed hover:bg-opacity-60 active:scale-95`;
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      title={ariaLabel}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`group/chip w-full flex items-center justify-between gap-1 px-1.5 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs transition-all cursor-pointer select-none overflow-hidden border ${getStyleClasses()} ${className}`}
    >
      <div className="flex items-center gap-1 min-w-0 flex-1">
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            isPasse ? 'bg-slate-500' : categoryTheme.dotColor
          }`}
          aria-hidden="true"
        />
        <span className="truncate font-medium leading-tight">
          {event.title}
        </span>
      </div>

      {/* Consensus discret pour événement en sondage */}
      {isSondage && consensusShortText && (
        <span
          className="text-[9px] font-bold opacity-80 shrink-0 bg-slate-900/60 px-1 rounded"
          aria-hidden="true"
        >
          {consensusShortText}
        </span>
      )}
    </div>
  );
};
