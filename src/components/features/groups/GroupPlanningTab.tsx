import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { GroupPlanning, AvailabilityStatus, MemberProfile } from '../../../models/Group';
import type { Event } from '../../../models/Event';
import { GroupPlanningHeader } from './GroupPlanningHeader';
import { GroupPlanningDayCell } from './GroupPlanningDayCell';
import { GroupPlanningLegend } from './GroupPlanningLegend';
import { DayEventsModal } from '../events/DayEventsModal';
import { groupEventsByDate } from '../../../utils/calendarEventUtils';
import { getTodayDateStr } from '../../../utils/dateUtils';

interface GroupPlanningTabProps {
  groupId: string;
  currentUserId: string;
  plannings: GroupPlanning[];
  onUpdatePlanning: (userId: string, dates: Record<string, AvailabilityStatus>) => Promise<boolean>;
  events?: Event[];
  totalMembers?: number;
  memberProfiles?: Record<string, MemberProfile>;
}

const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export const GroupPlanningTab: React.FC<GroupPlanningTabProps> = ({
  groupId,
  currentUserId,
  plannings,
  onUpdatePlanning,
  events = [],
  totalMembers = 0,
}) => {
  const EMPTY_PLANNING: Record<string, AvailabilityStatus> = useMemo(() => ({}), []);
  const myPlanning = useMemo(
    () => plannings.find((p) => p.userId === currentUserId)?.dates || EMPTY_PLANNING,
    [plannings, currentUserId, EMPTY_PLANNING]
  );

  const [pendingDates, setPendingDates] = useState<Record<string, AvailabilityStatus> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showEvents, setShowEvents] = useState(true);
  const [hidePastEvents, setHidePastEvents] = useState(false);
  const [modalDateStr, setModalDateStr] = useState<string | null>(null);

  const displayDates = useMemo(() => pendingDates ?? myPlanning, [myPlanning, pendingDates]);
  const todayDateStr = useMemo(() => getTodayDateStr(), []);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaveRef = useRef<Record<string, AvailabilityStatus> | null>(null);

  const saveDates = (newDates: Record<string, AvailabilityStatus>) => {
    setPendingDates(newDates);
    pendingSaveRef.current = newDates;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsSaving(true);

    timeoutRef.current = setTimeout(async () => {
      const datesToSave = pendingSaveRef.current;
      if (!datesToSave) return;

      const success = await onUpdatePlanning(currentUserId, datesToSave);

      if (!success) {
        alert('Erreur lors de la sauvegarde du planning. Veuillez réessayer.');
        if (pendingSaveRef.current === datesToSave) {
          pendingSaveRef.current = null;
          setPendingDates(null);
          setIsSaving(false);
        }
        return;
      }

      if (pendingSaveRef.current === datesToSave) {
        pendingSaveRef.current = null;
        setTimeout(() => {
          setPendingDates((current) => (current === datesToSave ? null : current));
          setIsSaving(false);
        }, 300);
      }
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (pendingSaveRef.current) {
        onUpdatePlanning(currentUserId, pendingSaveRef.current);
      }
    };
  }, [currentUserId, onUpdatePlanning]);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const days: ({ date: Date; dateStr: string; dayOfWeek: number } | null)[] = [];

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      const dateStr = [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, '0'),
        String(d.getDate()).padStart(2, '0'),
      ].join('-');
      days.push({ date: d, dateStr, dayOfWeek: d.getDay() });
    }

    return days;
  }, [currentMonth]);

  const toggleStatus = (currentStatus: AvailabilityStatus | undefined): AvailabilityStatus => {
    if (!currentStatus || currentStatus === 'unavailable') return 'available';
    if (currentStatus === 'available') return 'maybe';
    return 'unavailable';
  };

  const handleToggleDate = (dateStr: string) => {
    const currentStatus = displayDates[dateStr] || 'unavailable';
    const nextStatus = toggleStatus(currentStatus);
    saveDates({ ...displayDates, [dateStr]: nextStatus });
  };

  const handleHeaderClick = (dayIndex: number) => {
    const jsDay = dayIndex === 6 ? 0 : dayIndex + 1;
    const monthDays = daysInMonth.filter((d) => d !== null && d.dayOfWeek === jsDay) as { dateStr: string }[];
    if (monthDays.length === 0) return;

    const firstStatus = displayDates[monthDays[0].dateStr] || 'unavailable';
    const nextStatus = toggleStatus(firstStatus);
    const newDates = { ...displayDates };
    monthDays.forEach((d) => {
      newDates[d.dateStr] = nextStatus;
    });
    saveDates(newDates);
  };

  // Regroupement optimisé des événements par date
  const eventsByDate = useMemo(() => {
    return groupEventsByDate(events, { hidePast: hidePastEvents });
  }, [events, hidePastEvents]);

  const isPrevDisabled = useMemo(() => {
    const now = new Date();
    return currentMonth.getFullYear() === now.getFullYear() && currentMonth.getMonth() === now.getMonth();
  }, [currentMonth]);

  const isNextDisabled = useMemo(() => {
    const now = new Date();
    now.setMonth(now.getMonth() + 3);
    return currentMonth.getFullYear() === now.getFullYear() && currentMonth.getMonth() === now.getMonth();
  }, [currentMonth]);

  const monthLabel = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-3 sm:p-6 shadow-xl backdrop-blur-sm">
        <GroupPlanningHeader
          monthLabel={monthLabel}
          isSaving={isSaving}
          hasPendingChanges={pendingDates !== null}
          onPrevMonth={() => setCurrentMonth((p) => new Date(p.getFullYear(), p.getMonth() - 1, 1))}
          onNextMonth={() => setCurrentMonth((p) => new Date(p.getFullYear(), p.getMonth() + 1, 1))}
          isPrevDisabled={isPrevDisabled}
          isNextDisabled={isNextDisabled}
          showEvents={showEvents}
          onToggleShowEvents={() => setShowEvents((prev) => !prev)}
          hidePastEvents={hidePastEvents}
          onToggleHidePastEvents={() => setHidePastEvents((prev) => !prev)}
        />

        {/* Grille du calendrier */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2.5">
          {WEEK_DAYS.map((day, idx) => (
            <div
              key={day}
              onClick={() => handleHeaderClick(idx)}
              title={`Basculer tous les ${day} de ce mois`}
              className="text-center text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider py-1.5 sm:py-2 cursor-pointer hover:text-white transition bg-slate-900/40 rounded-lg border border-slate-800/50 hover:bg-slate-700 select-none active:scale-95"
            >
              {day}
            </div>
          ))}

          {daysInMonth.map((dayObj, idx) => {
            if (!dayObj) {
              return <div key={`empty-${idx}`} className="p-1 sm:p-2 rounded-xl" />;
            }
            const dateStr = dayObj.dateStr;
            const status = displayDates[dateStr];
            const isPast = dateStr < todayDateStr;
            const isToday = dateStr === todayDateStr;
            const dayEvents = eventsByDate.get(dateStr) || [];

            return (
              <GroupPlanningDayCell
                key={dateStr}
                date={dayObj.date}
                dateStr={dateStr}
                status={status}
                isPast={isPast}
                isToday={isToday}
                events={dayEvents}
                showEvents={showEvents}
                groupId={groupId}
                plannings={plannings}
                totalMembers={totalMembers}
                onToggleDate={handleToggleDate}
                onOpenDayModal={(d) => setModalDateStr(d)}
              />
            );
          })}
        </div>

        <GroupPlanningLegend showEvents={showEvents} />

        {/* Panneau / Modale du jour sélectionné */}
        {modalDateStr && (
          <DayEventsModal
            isOpen={Boolean(modalDateStr)}
            onClose={() => setModalDateStr(null)}
            dateStr={modalDateStr}
            events={eventsByDate.get(modalDateStr) || []}
            groupId={groupId}
            userAvailability={displayDates[modalDateStr]}
            onUpdateAvailability={(d, st) => {
              saveDates({ ...displayDates, [d]: st });
            }}
            plannings={plannings}
            totalMembers={totalMembers}
            isPast={modalDateStr < todayDateStr}
          />
        )}
      </div>
    </div>
  );
};
