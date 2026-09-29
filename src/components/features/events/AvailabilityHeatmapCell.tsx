import React from 'react';
import type { DateAvailabilityScore } from '../../../models/Availability';
import { availabilityService } from '../../../services/implementations/AvailabilityService';
import { isDatePast } from '../../../utils/dateUtils';

interface AvailabilityHeatmapCellProps {
  dayNumber: number;
  dateStr: string;
  score?: DateAvailabilityScore;
  isInRange: boolean;
  isSelected: boolean;
  isToday: boolean;
  onClick: () => void;
}

export const AvailabilityHeatmapCell: React.FC<AvailabilityHeatmapCellProps> = ({
  dayNumber,
  dateStr,
  score,
  isInRange,
  isSelected,
  isToday,
  onClick,
}) => {
  if (!isInRange) {
    return (
      <div
        data-date={dateStr}
        className="min-h-[46px] sm:min-h-[58px] p-1.5 sm:p-2 rounded-xl border border-slate-900 bg-slate-950/40 text-slate-600 opacity-25 flex flex-col justify-between cursor-not-allowed select-none"
        title="Hors de la plage de recherche"
        aria-disabled="true"
      >
        <span className="text-xs font-semibold">{dayNumber}</span>
      </div>
    );
  }

  const isPast = isDatePast(dateStr);
  const availableCount = score?.available.length || 0;
  const ratio = score?.availableRatio || 0;
  const intensity = availabilityService.getIntensityLevel(ratio, availableCount);
  const rank = score?.rank;

  // Couleurs dynamiques selon l'intensité (0 dispo -> 100% dispo) ou jour passé
  let bgAndBorderClass = 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900/90';
  if (isPast) {
    bgAndBorderClass = 'bg-slate-950/50 border-slate-900/80 text-slate-500 opacity-60 hover:opacity-80 hover:bg-slate-900/40';
  } else if (intensity === 'low') {
    bgAndBorderClass = 'bg-emerald-950/30 border-emerald-900/40 text-emerald-300 hover:bg-emerald-950/50';
  } else if (intensity === 'medium') {
    bgAndBorderClass = 'bg-emerald-900/40 border-emerald-700/50 text-emerald-200 hover:bg-emerald-900/60';
  } else if (intensity === 'high') {
    bgAndBorderClass = 'bg-emerald-700/40 border-emerald-600/50 text-emerald-100 hover:bg-emerald-700/60';
  } else if (intensity === 'full') {
    bgAndBorderClass = 'bg-emerald-600/80 border-emerald-400 text-white font-bold shadow-md shadow-emerald-600/25 hover:bg-emerald-500';
  }

  // Décoration Podium (Top 3)
  let podiumClass = '';
  let medalIcon: string | null = null;
  if (rank === 1) {
    podiumClass = 'border-2 border-amber-400 ring-2 ring-amber-400/80 shadow-[0_0_14px_rgba(251,191,36,0.35)]';
    medalIcon = '🥇';
  } else if (rank === 2) {
    podiumClass = 'border-2 border-slate-300 ring-2 ring-slate-300/70 shadow-[0_0_10px_rgba(203,213,225,0.25)]';
    medalIcon = '🥈';
  } else if (rank === 3) {
    podiumClass = 'border-2 border-amber-700 ring-2 ring-amber-700/70 shadow-[0_0_8px_rgba(180,83,9,0.25)]';
    medalIcon = '🥉';
  }

  const selectedClass = isSelected
    ? 'ring-2 ring-white scale-[1.02] z-10 shadow-lg'
    : '';

  const ariaDescription = `${dayNumber}, ${availableCount} disponible(s)${
    rank ? `, #${rank} au podium` : ''
  }`;

  return (
    <button
      type="button"
      data-date={dateStr}
      onClick={onClick}
      aria-label={ariaDescription}
      aria-pressed={isSelected}
      className={`min-h-[46px] sm:min-h-[58px] p-1.5 sm:p-2 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer relative group ${bgAndBorderClass} ${podiumClass} ${selectedClass}`}
    >
      {/* Ligne haute : Numéro du jour + Médaille */}
      <div className="flex items-center justify-between w-full">
        <span
          className={`text-xs sm:text-sm font-bold ${
            isToday
              ? 'w-5 h-5 rounded-full bg-primary-500 text-white flex items-center justify-center -ml-0.5'
              : ''
          }`}
        >
          {dayNumber}
        </span>
        {medalIcon && (
          <span
            className="text-xs sm:text-sm leading-none shrink-0"
            title={`Top #${rank}`}
            aria-hidden="true"
          >
            {medalIcon}
          </span>
        )}
      </div>

      {/* Ligne basse : Nombre de disponibles */}
      <div className="w-full flex items-center justify-between mt-1">
        {availableCount > 0 ? (
          <span className="text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 truncate">
            {availableCount} dispo{availableCount > 1 ? 's' : ''}
          </span>
        ) : (
          <span className="text-[10px] text-slate-500 opacity-60">0</span>
        )}
      </div>
    </button>
  );
};
