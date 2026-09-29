import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CalendarRange } from 'lucide-react';
import type { Event } from '../../../models/Event';
import type { GroupPlanning, MemberProfile } from '../../../models/Group';
import { useAvailabilityScores } from '../../../hooks/useAvailabilityScores';
import { AvailabilityHeatmapCell } from './AvailabilityHeatmapCell';
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
  onLockDate: (dateStr: string) => void;
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

  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const todayStr = getTodayDateStr();

  // Sélectionne par défaut la date #1 si disponible
  useEffect(() => {
    if (topDates.length > 0 && !selectedDateStr) {
      setSelectedDateStr(topDates[0].date);
    }
  }, [topDates, selectedDateStr]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthLabel = currentMonth.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  const calendarDays = getDaysInMonthGrid(year, month);

  const handleSelectPodiumDate = (dateStr: string) => {
    setSelectedDateStr(dateStr);
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
        {/* Navigation du mois */}
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={goToPreviousMonth}
            aria-label="Mois précédent"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="font-bold text-white capitalize text-sm sm:text-base tracking-wide">
            {monthLabel}
          </h3>
          <button
            type="button"
            onClick={goToNextMonth}
            aria-label="Mois suivant"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* En-têtes des jours de la semaine */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1.5 text-center">
          {WEEK_DAYS.map((day) => (
            <div
              key={day}
              className="text-[11px] sm:text-xs font-semibold text-slate-400 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Grille des jours */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map((dayInfo, idx) => {
            if (!dayInfo) {
              return <div key={`empty-${idx}`} className="min-h-[46px] sm:min-h-[58px]" />;
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
                isInRange={inRange}
                isSelected={isSelected}
                isToday={isToday}
                onClick={() => inRange && setSelectedDateStr(dateStr)}
              />
            );
          })}
        </div>

        {/* Légende Heatmap & Podium */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>Disponibilités :</span>
            <span className="w-2.5 h-2.5 rounded bg-slate-800 border border-slate-700" title="0 dispo" />
            <span className="w-2.5 h-2.5 rounded bg-emerald-950/60 border border-emerald-900/40" title="Faible" />
            <span className="w-2.5 h-2.5 rounded bg-emerald-800/60 border border-emerald-700/50" title="Moyenne" />
            <span className="w-2.5 h-2.5 rounded bg-emerald-600/70 border border-emerald-500/50" title="Forte" />
            <span className="w-2.5 h-2.5 rounded bg-emerald-500 text-white font-bold" title="100% disponible" />
            <span className="text-slate-300 font-medium ml-1">100%</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Podium :</span>
            <span>🥇 Or</span>
            <span>🥈 Argent</span>
            <span>🥉 Bronze</span>
          </div>
        </div>
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
          onLockDate={onLockDate}
        />
      )}
    </div>
  );
};
