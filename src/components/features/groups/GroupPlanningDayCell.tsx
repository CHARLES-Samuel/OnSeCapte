import React from 'react';
import type { GroupPlanning, UserDayAvailability, DaySlot } from '../../../models/Group';
import type { Event } from '../../../models/Event';
import { CalendarEventChip } from '../events/CalendarEventChip';
import { CalendarDayEventDots } from '../events/CalendarDayEventDots';
import { getEventConsensus } from '../../../utils/calendarEventUtils';
import { normalizeSlotsAvailability, aggregateDayStatus, DAY_SLOTS, SLOT_DEFINITIONS } from '../../../utils/timeSlotUtils';

interface GroupPlanningDayCellProps {
  date: Date;
  dateStr: string;
  userAvailability?: UserDayAvailability;
  isPast: boolean;
  isToday: boolean;
  events: Event[];
  showEvents: boolean;
  groupId: string;
  plannings: GroupPlanning[];
  totalMembers: number;
  onToggleSlot: (dateStr: string, slot: DaySlot) => void;
  onToggleAllDay: (dateStr: string) => void;
  onOpenDayModal: (dateStr: string) => void;
  onSelectEvent?: (event: Event) => void;
}

export const GroupPlanningDayCell: React.FC<GroupPlanningDayCellProps> = ({
  date,
  dateStr,
  userAvailability,
  isPast,
  isToday,
  events,
  showEvents,
  groupId,
  plannings,
  totalMembers,
  onToggleSlot,
  onToggleAllDay,
  onOpenDayModal,
  onSelectEvent,
}) => {
  const dayNumber = date.getDate();
  const slots = normalizeSlotsAvailability(userAvailability);
  const dayStatus = aggregateDayStatus(slots);

  const getStatusClasses = () => {
    if (isPast) {
      return 'bg-slate-950/40 border-slate-900/60 text-slate-600 opacity-60 cursor-not-allowed';
    }
    if (dayStatus === 'available') {
      return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/20';
    }
    if (dayStatus === 'maybe') {
      return 'bg-amber-500/10 text-amber-300 border-amber-500/40 hover:bg-amber-500/20';
    }
    return 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200';
  };

  const handleCellClick = () => {
    if (isPast) return;
    // Sur mobile ou si des événements existent, ouvrir la modale détaillée
    if (window.innerWidth < 640 || events.length > 0) {
      onOpenDayModal(dateStr);
    } else {
      onToggleAllDay(dateStr);
    }
  };

  const getSlotPillClass = (slot: DaySlot) => {
    const status = slots[slot];
    if (status === 'available') {
      return 'bg-emerald-500/25 border-emerald-500 text-emerald-300 hover:bg-emerald-500/40 font-bold';
    }
    if (status === 'maybe') {
      return 'bg-amber-500/25 border-amber-500 text-amber-300 hover:bg-amber-500/40 font-bold';
    }
    return 'bg-slate-800/80 border-slate-700/60 text-slate-500 hover:text-slate-300 hover:bg-slate-700/50';
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
      {/* En-tête de la case : Numéro du jour & pastilles desktop */}
      <div className="flex items-center justify-between w-full gap-1">
        <span className={`text-xs sm:text-sm font-bold ${isToday ? 'text-primary-300 font-extrabold' : ''}`}>
          {dayNumber}
        </span>

        {/* 3 pastilles cliquables sur Desktop uniquement */}
        {!isPast && (
          <div className="hidden sm:flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {DAY_SLOTS.map((slotKey) => {
              const def = SLOT_DEFINITIONS[slotKey];
              return (
                <button
                  key={slotKey}
                  type="button"
                  onClick={() => onToggleSlot(dateStr, slotKey)}
                  title={`${def.fullLabel} : ${slots[slotKey] || 'Indisponible'} (cliquer pour basculer)`}
                  className={`w-5 h-5 text-[10px] rounded-md border flex items-center justify-center transition active:scale-90 ${getSlotPillClass(
                    slotKey
                  )}`}
                >
                  {def.badgeLetter}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Indicateur visuel 3 créneaux sur Mobile (aucune surcharge ni débordement) */}
      {!isPast && (
        <div className="sm:hidden flex items-center gap-0.5 w-full my-auto px-0.5 py-1">
          {DAY_SLOTS.map((slotKey) => {
            const status = slots[slotKey];
            const barColor =
              status === 'available'
                ? 'bg-emerald-400 shadow-sm shadow-emerald-400/30'
                : status === 'maybe'
                ? 'bg-amber-400'
                : 'bg-slate-700/60';
            return (
              <span
                key={slotKey}
                className={`h-1.5 flex-1 rounded-full transition-colors ${barColor}`}
                title={`${SLOT_DEFINITIONS[slotKey].label} : ${status || 'Indispo'}`}
              />
            );
          })}
        </div>
      )}

      {/* Événements : Affichage Mobile (Points discrets) */}
      {showEvents && events.length > 0 && (
        <div className="sm:hidden w-full flex justify-center mt-0.5">
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
