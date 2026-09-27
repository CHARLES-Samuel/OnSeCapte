import React, { useState, useEffect } from 'react';
import type { TimeSlot } from '../../../models/Event';
import { Clock, CalendarCheck } from 'lucide-react';

interface TimeSlotSelectorProps {
  selectedDatesMap: Record<string, TimeSlot[]>;
  onToggleTimeSlot: (dateStr: string, slot: TimeSlot) => void;
}

const ALL_TIME_SLOTS: TimeSlot[] = ['Toute la journée', 'Matin', 'Après-midi', 'Soirée'];

const formatDateLong = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

export const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  selectedDatesMap,
  onToggleTimeSlot,
}) => {
  const dates = Object.keys(selectedDatesMap).sort();
  const [activeDate, setActiveDate] = useState<string>('');

  useEffect(() => {
    if (dates.length > 0 && (!activeDate || !dates.includes(activeDate))) {
      setActiveDate(dates[0]);
    }
  }, [dates, activeDate]);

  if (dates.length === 0) {
    return (
      <div className="bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-800 text-center py-6">
        <CalendarCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-sm text-slate-400">
          Sélectionne au moins un jour dans le calendrier ci-dessus pour définir tes créneaux horaires.
        </p>
      </div>
    );
  }

  const currentSlots = activeDate ? selectedDatesMap[activeDate] || [] : [];

  return (
    <div className="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-400" />
          <h3 className="font-bold text-slate-100 text-base sm:text-lg">
            Personnaliser les créneaux
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          Chaque jour peut avoir ses propres horaires
        </span>
      </div>

      {/* Select day dropdown */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Choisir le jour à configurer
        </label>
        <select
          value={activeDate}
          onChange={(e) => setActiveDate(e.target.value)}
          className="w-full bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-xl px-4 py-3 text-sm text-slate-100 font-medium outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition shadow-sm cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-10 capitalize"
        >
          {dates.map((dateStr) => (
            <option key={dateStr} value={dateStr} className="bg-slate-900 text-slate-100 py-2">
              📅 {formatDateLong(dateStr)} ({selectedDatesMap[dateStr]?.join(', ') || 'Toute la journée'})
            </option>
          ))}
        </select>
      </div>

      {/* Time slot buttons for activeDate */}
      {activeDate && (
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium capitalize">
              {formatDateLong(activeDate)}
            </span>
            <span className="text-primary-400 font-medium">
              {currentSlots.join(', ')}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ALL_TIME_SLOTS.map((ts) => {
              const isSelected = currentSlots.includes(ts);
              return (
                <button
                  key={ts}
                  type="button"
                  onClick={() => onToggleTimeSlot(activeDate, ts)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-all duration-150 ${
                    isSelected
                      ? 'bg-primary-600/30 border-primary-500 text-primary-200 shadow-sm'
                      : 'bg-slate-900/60 border-slate-700/80 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                  }`}
                >
                  {ts}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
