import React from 'react';
import type { DateAvailabilityScore } from '../../../models/Availability';
import { availabilityService } from '../../../services/implementations/AvailabilityService';
import { isDatePast, formatDateLongFr } from '../../../utils/dateUtils';

interface AvailabilityHeatmapCellProps {
  dayNumber: number;
  dateStr: string;
  score?: DateAvailabilityScore;
  totalMembers?: number;
  isInRange: boolean;
  isSelected: boolean;
  isToday: boolean;
  onClick: () => void;
}

export const AvailabilityHeatmapCell: React.FC<AvailabilityHeatmapCellProps> = ({
  dayNumber,
  dateStr,
  score,
  totalMembers = 1,
  isInRange,
  isSelected,
  isToday,
  onClick,
}) => {
  if (!isInRange) {
    return (
      <div
        data-date={dateStr}
        className="min-h-[48px] sm:min-h-[58px] p-1 sm:p-1.5 rounded-xl border border-dashed border-slate-900/80 bg-slate-950/20 text-slate-700 opacity-25 flex flex-col justify-between cursor-not-allowed select-none"
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
  const resolvedTotal = score?.totalMembers ?? totalMembers ?? 1;

  // Échelle séquentielle à fort contraste (WCAG AA validé)
  let bgAndBorderClass =
    'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700';
  let counterColorClass = 'text-slate-500 font-medium';
  let dayNumberColorClass = 'text-slate-200';

  if (isPast) {
    bgAndBorderClass =
      'bg-slate-950/40 border-slate-900/60 text-slate-500 opacity-50 hover:opacity-75 hover:bg-slate-900/40';
    counterColorClass = 'text-slate-600';
    dayNumberColorClass = 'text-slate-400';
  } else if (intensity === 'low') {
    bgAndBorderClass =
      'bg-emerald-950/80 border-emerald-800/80 text-emerald-200 hover:bg-emerald-950 hover:border-emerald-600';
    counterColorClass = 'text-emerald-400/90 font-semibold';
    dayNumberColorClass = 'text-emerald-200 font-semibold';
  } else if (intensity === 'medium') {
    bgAndBorderClass =
      'bg-emerald-900 border-emerald-600/80 text-emerald-100 hover:bg-emerald-800';
    counterColorClass = 'text-emerald-200 font-bold';
    dayNumberColorClass = 'text-emerald-100 font-bold';
  } else if (intensity === 'high') {
    bgAndBorderClass =
      'bg-emerald-700 border-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-900/30';
    counterColorClass = 'text-emerald-100 font-bold';
    dayNumberColorClass = 'text-white font-bold';
  } else if (intensity === 'full') {
    bgAndBorderClass =
      'bg-emerald-400 border-emerald-200 text-slate-950 hover:bg-emerald-300 shadow-md shadow-emerald-500/20';
    counterColorClass = 'text-slate-950 font-black';
    dayNumberColorClass = 'text-slate-950 font-black';
  }

  // Anneau de sélection distinctif avec décalage pour éliminer toute confusion
  const selectedClass = isSelected
    ? 'ring-2 ring-primary-400 ring-offset-2 ring-offset-slate-950 scale-[1.03] z-10 shadow-lg shadow-primary-500/25'
    : '';

  // Tooltip descriptif complet et accessible pour le desktop
  const formattedDate = formatDateLongFr(dateStr);
  const percentStr = `${Math.round(ratio * 100)}%`;
  const tooltipText = `${formattedDate} : ${availableCount}/${resolvedTotal} disponible(s) (${percentStr})${
    rank ? ` • #${rank} au podium` : ''
  }${isToday ? " • Aujourd'hui" : ''}${isPast ? ' • Passé' : ''}`;

  const ariaDescription = `${dayNumber}, ${availableCount} sur ${resolvedTotal} disponible(s)${
    rank ? `, #${rank} au podium` : ''
  }${isToday ? ', aujourd’hui' : ''}`;

  return (
    <button
      type="button"
      data-date={dateStr}
      onClick={onClick}
      aria-label={ariaDescription}
      aria-pressed={isSelected}
      title={tooltipText}
      className={`min-h-[48px] sm:min-h-[58px] p-1 sm:p-1.5 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer relative group ${bgAndBorderClass} ${selectedClass}`}
    >
      {/* Ligne haute : Numéro du jour + Point Aujourd'hui + Badge Podium distinct */}
      <div className="flex items-center justify-between w-full gap-0.5">
        <div className="flex items-center gap-1">
          <span className={`text-xs sm:text-sm ${dayNumberColorClass}`}>
            {dayNumber}
          </span>
          {isToday && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-sky-400 ring-2 ring-sky-400/40 shrink-0 inline-block"
              title="Aujourd'hui"
              aria-label="Aujourd'hui"
            />
          )}
        </div>

        {/* Podium : Médaille ET Chiffre pour les personnes daltoniennes, sans bordure de case */}
        {rank && !isPast && (
          <span
            className={`inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[10px] sm:text-xs font-black shrink-0 leading-none shadow-sm ${
              rank === 1
                ? 'bg-amber-400 text-slate-950'
                : rank === 2
                ? 'bg-slate-200 text-slate-950'
                : 'bg-amber-700 text-amber-50'
            }`}
            title={`Top #${rank} au podium`}
            aria-label={`Top #${rank}`}
          >
            <span>{rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}</span>
            <span>{rank}</span>
          </span>
        )}
      </div>

      {/* Ligne basse : Ratio court "X/Y" sans mot coupé */}
      <div className="w-full flex items-center justify-between mt-1">
        <span className={`text-[10px] sm:text-xs ${counterColorClass}`}>
          {isPast ? (
            <span className="text-[10px] opacity-70">passé</span>
          ) : (
            `${availableCount}/${resolvedTotal}`
          )}
        </span>
      </div>
    </button>
  );
};
