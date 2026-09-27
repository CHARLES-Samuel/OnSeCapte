import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface MonthCalendarPickerProps {
  selectedDates: string[];
  onToggleDate: (dateStr: string) => void;
}

const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const formatDateStr = (year: number, month: number, day: number): string => {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
};

export const MonthCalendarPicker: React.FC<MonthCalendarPickerProps> = ({
  selectedDates,
  onToggleDate,
}) => {
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => new Date());

  const today = new Date();
  const todayStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // JavaScript getDay(): 0 is Sunday, 1 is Monday...
  // Convert to Monday-indexed (0 for Monday, ..., 6 for Sunday)
  const rawFirstDay = new Date(year, month, 1).getDay();
  const firstDayOffset = rawFirstDay === 0 ? 6 : rawFirstDay - 1;

  const monthLabel = currentMonthDate.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  // Determine if previous month is entirely in the past
  const currentMonthStart = new Date(year, month, 1);
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const isPrevDisabled = currentMonthStart <= thisMonthStart;

  const daysGrid = [];
  for (let i = 0; i < firstDayOffset; i++) {
    daysGrid.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysGrid.push(d);
  }

  return (
    <div className="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4 select-none">
      {/* Calendar Navigation Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary-400" />
          <h3 className="font-bold text-slate-100 capitalize text-base sm:text-lg">
            {monthLabel}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={isPrevDisabled}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Mois précédent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Mois suivant"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days of Week Row */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {WEEK_DAYS.map(day => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Grid of Days */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {daysGrid.map((dayNum, index) => {
          if (dayNum === null) {
            return <div key={`empty-${index}`} className="h-10 sm:h-11" />;
          }

          const dateStr = formatDateStr(year, month, dayNum);
          const isSelected = selectedDates.includes(dateStr);
          const isToday = dateStr === todayStr;
          const isPast = dateStr < todayStr;

          if (isPast) {
            return (
              <div
                key={dateStr}
                className="h-10 sm:h-11 rounded-xl flex items-center justify-center text-xs sm:text-sm text-slate-600 bg-slate-900/30 cursor-not-allowed"
              >
                {dayNum}
              </div>
            );
          }

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onToggleDate(dateStr)}
              className={`h-10 sm:h-11 rounded-xl font-medium text-xs sm:text-sm flex flex-col items-center justify-center transition-all duration-150 relative ${
                isSelected
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30 scale-[1.02] border border-primary-400'
                  : isToday
                  ? 'bg-slate-800 text-primary-400 border border-primary-500/50 hover:bg-slate-700'
                  : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700 border border-slate-700/50'
              }`}
            >
              <span>{dayNum}</span>
              {isToday && !isSelected && (
                <span className="w-1 h-1 rounded-full bg-primary-400 absolute bottom-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected dates counter */}
      <div className="text-xs text-slate-400 text-right pt-1">
        {selectedDates.length === 0 ? (
          <span>Aucun jour sélectionné</span>
        ) : (
          <span className="text-primary-300 font-medium">
            {selectedDates.length} jour{selectedDates.length > 1 ? 's' : ''} sélectionné{selectedDates.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
};
