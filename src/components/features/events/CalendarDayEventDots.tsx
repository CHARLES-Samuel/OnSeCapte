import React from 'react';
import type { Event } from '../../../models/Event';
import { getCategoryTheme } from '../../../utils/categoryTheme';

interface CalendarDayEventDotsProps {
  events: Event[];
  className?: string;
}

export const CalendarDayEventDots: React.FC<CalendarDayEventDotsProps> = ({
  events,
  className = '',
}) => {
  if (!events || events.length === 0) return null;

  const maxDots = 3;
  const visibleEvents = events.slice(0, maxDots);
  const overflowCount = events.length - 2;
  const showOverflowBadge = events.length > maxDots;

  return (
    <div
      className={`flex items-center justify-center gap-1 mt-1 ${className}`}
      aria-label={`${events.length} sortie(s) ce jour`}
    >
      {showOverflowBadge ? (
        <>
          {events.slice(0, 2).map((evt) => {
            const theme = getCategoryTheme(evt.category);
            return (
              <span
                key={evt.id}
                className={`w-1.5 h-1.5 rounded-full ${theme.dotColor}`}
                title={evt.title}
              />
            );
          })}
          <span className="text-[9px] font-bold text-slate-300 leading-none">
            +{overflowCount}
          </span>
        </>
      ) : (
        visibleEvents.map((evt) => {
          const theme = getCategoryTheme(evt.category);
          return (
            <span
              key={evt.id}
              className={`w-1.5 h-1.5 rounded-full ${theme.dotColor}`}
              title={evt.title}
            />
          );
        })
      )}
    </div>
  );
};
