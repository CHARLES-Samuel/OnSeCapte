import React from 'react';
import { CheckCircle, HelpCircle, XCircle } from 'lucide-react';
import type { AvailabilityStatus, GroupPlanning } from '../../../models/Group';
import type { Event } from '../../../models/Event';
import { CalendarEventChip } from '../events/CalendarEventChip';
import { CalendarDayEventDots } from '../events/CalendarDayEventDots';
import { getEventConsensus } from '../../../utils/calendarEventUtils';

interface GroupPlanningDayCellProps {
  date: Date;
  dateStr: string;
  status: AvailabilityStatus | undefined;
  isPast: boolean;
  isToday: boolean;
  events: Event[];
  showEvents: boolean;
  groupId: string;
  plannings: GroupPlanning[];
  totalMembers: number;
  onToggleDate: (dateStr: string) => void;
  onOpenDayModal: (dateStr: string) => void;
  onSelectEvent?: (event: Event) => void;
}

export const GroupPlanningDayCell: React.FC<GroupPlanningDayCellProps> = ({
  date,
  dateStr,
  status,
  isPast,
  isToday,
  events,
  showEvents,
  groupId,
  plannings,
  totalMembers,
  onToggleDate,
  onOpenDayModal,
  onSelectEvent,
}) => {
  const dayNumber = date.getDate();

  const getStatusClasses = () => {
    if (isPast) {
      return 'bg-slate-950/40 border-slate-900/60 text-slate-600 opacity-60 cursor-not-allowed';
    }
    if (status === 'available') {
      return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/20';
    }
    if (status === 'maybe') {
      return 'bg-amber-500/10 text-amber-300 border-amber-500/40 hover:bg-amber-500/20';
    }
    return 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200';
  };

  const getStatusIcon = () => {
    if (status === 'available') return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
    if (status === 'maybe') return <HelpCircle className="w-3.5 h-3.5 text-amber-400" />;
    return <XCircle className="w-3.5 h-3.5 text-slate-600" />;
  };

  const handleCellClick = () => {
    if (isPast) return;
    // Sur mobile si le jour a des sorties, ouvrir le panneau du jour pour consulter et voter
    if (window.innerWidth < 640 && events.length > 0) {
      onOpenDayModal(dateStr);
    } else {
      onToggleDate(dateStr);
    }
  };

  const visibleEvents = events.slice(0, 2);
  const overflowCount = events.length - 2;

  return (
    <div
      onClick={handleCellClick}
      data-testid={`planning-day-${dateStr}`}
      className={`relative min-h-[70px] sm:min-h-[112px] p-1 sm:p-2 rounded-xl border flex flex-col justify-between transition-all select-none ${
        isPast ? 'cursor-not-allowed' : 'cursor-pointer'
      } ${isToday ? 'ring-2 ring-primary-500/70 shadow-lg' : ''} ${getStatusClasses()}`}
    >
      {/* En-tête de la case : Numéro du jour & Statut */}
      <div className="flex items-center justify-between w-full">
        <span className={`text-xs sm:text-sm font-bold ${isToday ? 'text-primary-300 font-extrabold' : ''}`}>
          {dayNumber}
        </span>
        <div className="flex items-center gap-1" title={`Disponibilité : ${status || 'Non renseigné'}`}>
          <span className="opacity-80 scale-90 sm:scale-100">
            {getStatusIcon()}
          </span>
        </div>
      </div>

      {/* Événements : Affichage Mobile (Points discrets) */}
      {showEvents && events.length > 0 && (
        <div className="sm:hidden w-full flex justify-center">
          <CalendarDayEventDots events={events} />
        </div>
      )}

      {/* Événements : Affichage Desktop (Pastilles tronquées avec débordement +N) */}
      {showEvents && (
        <div className="hidden sm:flex flex-col gap-1 mt-1 w-full flex-1 justify-start overflow-hidden">
          {visibleEvents.map((evt) => {
            const consensus = getEventConsensus(dateStr, plannings, totalMembers);
            return (
              <CalendarEventChip
                key={`${evt.id}-${dateStr}`}
                event={evt}
                groupId={groupId}
                dateStr={dateStr}
                consensusText={consensus.text}
                consensusShortText={consensus.shortText}
                isPastDate={isPast}
                onSelectEvent={onSelectEvent}
              />
            );
          })}

          {overflowCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDayModal(dateStr);
              }}
              className="text-[10px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/90 rounded px-1.5 py-0.5 w-full text-center font-medium transition truncate border border-slate-700/60"
              title={`Voir les ${events.length} sorties de ce jour`}
            >
              +{overflowCount} autre{overflowCount > 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
