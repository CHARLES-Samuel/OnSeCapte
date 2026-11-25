import React from 'react';
import { Clock } from 'lucide-react';
import type { Event } from '../../../models/Event';
import { formatTimePreferenceLabel } from '../../../utils/timeSlotUtils';

export interface EventTimePreferenceBadgeProps {
  event: Pick<Event, 'dateMode' | 'state' | 'timePreference'>;
  variant?: 'card' | 'list' | 'header';
  hideWhenLocked?: boolean;
  className?: string;
}

export const EventTimePreferenceBadge: React.FC<EventTimePreferenceBadgeProps> = ({
  event,
  variant = 'card',
  hideWhenLocked = true,
  className = '',
}) => {
  if (event.dateMode === 'fixed' || event.state === 'passe') {
    return null;
  }

  if (hideWhenLocked && event.state === 'planifie') {
    return null;
  }

  const label = formatTimePreferenceLabel(event.timePreference);
  if (!label) {
    return null;
  }

  const shapeClasses =
    variant === 'header'
      ? 'px-2.5 py-0.5 rounded-full font-medium'
      : variant === 'list'
      ? 'px-2 py-0.5 rounded-md font-semibold'
      : 'px-2.5 py-1 rounded-lg font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs text-violet-300 bg-violet-500/10 border border-violet-500/30 shrink-0 ${shapeClasses} ${className}`}
      title={`Moment souhaité : ${label}`}
    >
      <Clock className="w-3 h-3 text-violet-400 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};

