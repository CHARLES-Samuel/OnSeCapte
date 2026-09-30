import React from 'react';
import { Calendar } from 'lucide-react';
import type { Event } from '../../../models/Event';
import { formatDateShort } from '../../../utils/format';

interface EventListDateBadgeProps {
  event: Event;
}

export const EventListDateBadge: React.FC<EventListDateBadgeProps> = ({ event }) => {
  return (
    <div className="shrink-0 pt-0.5">
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
          <span className="truncate">
            {formatDateShort(event.startDate)} - {formatDateShort(event.endDate)}
          </span>
        </div>
      ) : (
        <div className="flex sm:flex-col items-center justify-center bg-primary-500/10 border border-primary-500/20 text-primary-300 px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-semibold min-w-[76px] text-center">
          <span>Sondage</span>
        </div>
      )}
    </div>
  );
};
