import React from 'react';
import { Trophy } from 'lucide-react';
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
    <div className="bg-slate-900/70 border border-slate-800 p-2.5 sm:p-3 rounded-2xl">
      <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-slate-300">
        <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>Meilleurs créneaux recommandés :</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {topDates.map((td) => {
          const medal = td.rank === 1 ? '🥇' : td.rank === 2 ? '🥈' : '🥉';
          const isSelected = selectedDateStr === td.date;
          const availableCount = td.available.length;
          const total = td.totalMembers || availableCount;
          const percent = Math.round(td.availableRatio * 100);

          return (
            <button
              key={td.date}
              type="button"
              onClick={() => onSelectDate(td.date)}
              className={`p-2 rounded-xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-500/60 ring-2 ring-primary-400 shadow-md shadow-amber-500/10'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0" aria-hidden="true">
                  {medal}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white capitalize truncate">
                    {formatDateShortFr(td.date)}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Rang #{td.rank}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {availableCount}/{total}
                </span>
                <div className="text-[10px] text-emerald-400/90 font-medium">
                  {percent}%
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
