import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarRange } from 'lucide-react';
import type { Event, TimeSlot } from '../../../models/Event';
import type { GroupPlanning, MemberProfile, DaySlot } from '../../../models/Group';
import { useAvailabilityScores } from '../../../hooks/useAvailabilityScores';
import { AvailabilityHeatmapCell } from './AvailabilityHeatmapCell';
import { AvailabilityHeatmapLegend } from './AvailabilityHeatmapLegend';
import { DayAvailabilityDetails } from './DayAvailabilityDetails';
import { PodiumShortcuts } from './PodiumShortcuts';
import {
  getDaysInMonthGrid,
  getTodayDateStr,
  formatDateShortFr,
} from '../../../utils/dateUtils';

interface AvailabilityHeatmapCalendarProps {
  event: Event;
  plannings: GroupPlanning[];
  memberProfiles: Record<string, MemberProfile>;
  memberIds: string[];
  currentUserId?: string;
  canLock: boolean;
  isLocked: boolean;
  onLockDate: (dateStr: string, timeSlot: TimeSlot) => void;
}

const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export const AvailabilityHeatmapCalendar: React.FC<AvailabilityHeatmapCalendarProps> = ({
  event,
  plannings,
  memberProfiles,
  memberIds,
  currentUserId,
  canLock,
  isLocked,
  onLockDate,
}) => {
  const {
    currentMonth,
    topDates,
    checkDateInRange,
    getDayScore,
    goToPreviousMonth,
    goToNextMonth,
    goToDateMonth,
  } = useAvailabilityScores({ event, plannings, memberIds });

  const [viewMode, setViewMode] = useState<'day' | 'slots'>('day');
  const [selectedSlot, setSelectedSlot] = useState<DaySlot | null>(null);
  const [userSelectedDateStr, setUserSelectedDateStr] = useState<string | null>(null);

  const selectedDateStr = userSelectedDateStr ?? (topDates.length > 0 ? topDates[0].date : null);
  const todayStr = getTodayDateStr();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthLabel = currentMonth.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  const calendarDays = getDaysInMonthGrid(year, month);
  const totalMembersCount = memberIds.length > 0 ? memberIds.length : Object.keys(memberProfiles).length;

  const handleSelectPodiumDate = (dateStr: string, slot?: DaySlot) => {
    setUserSelectedDateStr(dateStr);
    if (slot) {
      setSelectedSlot(slot);
      setViewMode('slots');
    }
    goToDateMonth(dateStr);
  };

  return (
    <div className="space-y-4">
      {/* Badge de plage restreinte si applicable */}
      {event.dateMode === 'range' && event.startDate && event.endDate && (
        <div className="bg-blue-500/10 border border-blue-500/30 p-2.5 sm:p-3 rounded-xl text-xs text-blue-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CalendarRange className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              Fenêtre de recherche : du <strong>{formatDateShortFr(event.startDate)}</strong> au{' '}
              <strong>{formatDateShortFr(event.endDate)}</strong>
            </span>
          </div>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-blue-500/20 text-[10px] font-semibold">
            Intervalle verrouillé
          </span>
        </div>
      )}

      {/* Raccourcis Podium Top 3 */}
      <PodiumShortcuts
        topDates={topDates}
        selectedDateStr={selectedDateStr}
        onSelectDate={handleSelectPodiumDate}
      />

      {/* Calendrier Heatmap */}
      <div className="bg-slate-900/60 border border-slate-800 p-3 sm:p-4 rounded-2xl shadow-inner">
        {/* Navigation du mois et Bascule Vue Jour / Créneaux */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
          <div className="flex items-center justify-between sm:justify-start gap-1">
            <button
              type="button"
              onClick={goToPreviousMonth}
              aria-label="Mois précédent"
              className="p-2 sm:p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition min-w-[36px] min-h-[36px] flex items-center justify-center active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-white capitalize text-sm sm:text-base tracking-wide px-1">
              {monthLabel}
            </h3>
            <button
              type="button"
              onClick={goToNextMonth}
              aria-label="Mois suivant"
              className="p-2 sm:p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition min-w-[36px] min-h-[36px] flex items-center justify-center active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Bascule Vue Jour / Créneaux */}
          <div className="grid grid-cols-2 sm:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 min-h-[38px] sm:min-h-[32px] rounded-lg text-xs font-semibold transition active:scale-95 flex items-center justify-center ${
                viewMode === 'day' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Vue Jour
            </button>
            <button
              type="button"
              onClick={() => setViewMode('slots')}
              className={`px-3 py-1.5 min-h-[38px] sm:min-h-[32px] rounded-lg text-xs font-semibold transition active:scale-95 flex items-center justify-center ${
                viewMode === 'slots' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Vue Créneaux
            </button>
          </div>
        </div>

        {/* En-têtes des jours de la semaine */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1.5 text-center">
          {WEEK_DAYS.map((day) => (
            <div key={day} className="text-[11px] sm:text-xs font-semibold text-slate-400 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Grille des jours */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map((dayInfo, idx) => {
            if (!dayInfo) {
              return <div key={`empty-${idx}`} className="min-h-[48px] sm:min-h-[58px]" />;
            }

            const { dateStr, dayOfMonth } = dayInfo;
            const inRange = checkDateInRange(dateStr);
            const score = getDayScore(dateStr);
            const isSelected = selectedDateStr === dateStr;
            const isToday = dateStr === todayStr;

            return (
              <AvailabilityHeatmapCell
                key={dateStr}
                dayNumber={dayOfMonth}
                dateStr={dateStr}
                score={score}
                totalMembers={totalMembersCount}
                isInRange={inRange}
                isSelected={isSelected}
                isToday={isToday}
                viewMode={viewMode}
                selectedSlot={selectedSlot}
                onClick={() => inRange && setUserSelectedDateStr(dateStr)}
                onSelectSlot={(slot) => setSelectedSlot(slot)}
              />
            );
          })}
        </div>

        {/* Légende Heatmap & Indicateurs unifiée */}
        <AvailabilityHeatmapLegend className="mt-4" />
      </div>

      {/* Détails du jour sélectionné */}
      {selectedDateStr && (
        <DayAvailabilityDetails
          dateStr={selectedDateStr}
          score={getDayScore(selectedDateStr)}
          memberProfiles={memberProfiles}
          currentUserId={currentUserId}
          canLock={canLock}
          isLocked={isLocked}
          isInRange={checkDateInRange(selectedDateStr)}
          selectedSlot={selectedSlot}
          onSelectSlot={(s) => setSelectedSlot(s)}
          onLockDate={onLockDate}
          eventTitle={event.title}
          totalMembers={totalMembersCount}
        />
      )}
    </div>
  );
};
