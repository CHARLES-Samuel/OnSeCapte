import React from 'react';
import { Award } from 'lucide-react';
import type { DateAvailabilityScore } from '../../../models/Availability';
import { formatDateShortFr } from '../../../utils/dateUtils';

interface PodiumShortcutsProps {
  topDates: DateAvailabilityScore[];
  selectedDateStr: string | null;
  onSelectDate: (dateStr: string) => void;
}

export const PodiumShortcuts: React.FC<PodiumShortcutsProps> = ({
  topDates,
  selectedDateStr,
  onSelectDate,
}) => {
  if (topDates.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      <span className="text-xs font-semibold text-slate-400 shrink-0 flex items-center gap-1">
        <Award className="w-3.5 h-3.5 text-amber-400" /> Podium :
      </span>
      <div className="flex items-center gap-2">
        {topDates.map((td) => {
          const medal = td.rank === 1 ? '🥇' : td.rank === 2 ? '🥈' : '🥉';
          const isSelected = selectedDateStr === td.date;
          return (
            <button
              key={td.date}
              type="button"
              onClick={() => onSelectDate(td.date)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 ring-1 ring-amber-500/40'
                  : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:border-slate-500'
              }`}
            >
              <span>{medal}</span>
              <span className="capitalize">{formatDateShortFr(td.date)}</span>
              <span className="text-[10px] text-emerald-400 font-bold">
                ({td.available.length} dispo)
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
