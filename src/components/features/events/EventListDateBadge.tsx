import React from 'react';
import { Calendar, Clock, Archive } from 'lucide-react';
import type { Event } from '../../../models/Event';
import { formatDateShort } from '../../../utils/format';

interface EventListDateBadgeProps {
  event: Event;
  className?: string;
}

export const EventListDateBadge: React.FC<EventListDateBadgeProps> = ({ event, className = '' }) => {
  if (event.state === 'planifie' && event.finalDate) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-500/10 border border-amber-500/25 text-amber-300 shrink-0 ${className}`}
        title={`Date fixée : ${formatDateShort(event.finalDate)}${event.finalTimeSlot ? ` (${event.finalTimeSlot})` : ''}`}
      >
        <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
        <span>
          {formatDateShort(event.finalDate)}
          {event.finalTimeSlot ? ` • ${event.finalTimeSlot}` : ''}
        </span>
      </span>
    );
  }

  if (event.state === 'passe') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-400 shrink-0 ${className}`}
        title="Événement passé"
      >
        <Archive className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />
        <span>Passé</span>
      </span>
    );
  }

  if (event.dateMode === 'range' && event.startDate && event.endDate) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-500/10 border border-blue-500/25 text-blue-300 shrink-0 ${className}`}
        title={`Plage de dates : du ${formatDateShort(event.startDate)} au ${formatDateShort(event.endDate)}`}
      >
        <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" aria-hidden="true" />
        <span>
          {formatDateShort(event.startDate)} - {formatDateShort(event.endDate)}
        </span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-primary-500/10 border border-primary-500/25 text-primary-300 shrink-0 ${className}`}
      title="Sondage de dates en cours"
    >
      <Clock className="w-3.5 h-3.5 text-primary-400 shrink-0" aria-hidden="true" />
      <span>Sondage</span>
    </span>
  );
};
