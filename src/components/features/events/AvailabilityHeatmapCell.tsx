import type { DateAvailabilityScore } from '../../../models/Availability';
import type { DaySlot } from '../../../models/Group';
import { availabilityService } from '../../../services/implementations/AvailabilityService';
import { isDatePast, formatDateLongFr } from '../../../utils/dateUtils';
import { DAY_SLOTS, SLOT_DEFINITIONS } from '../../../utils/timeSlotUtils';

interface AvailabilityHeatmapCellProps {
  dayNumber: number;
  dateStr: string;
  score?: DateAvailabilityScore;
  totalMembers?: number;
  isInRange: boolean;
  isSelected: boolean;
  isToday: boolean;
  viewMode?: 'day' | 'slots';
  selectedSlot?: DaySlot | null;
  onClick: () => void;
  onSelectSlot?: (slot: DaySlot) => void;
}

import { getIntensityStyles } from '../../../utils/heatmapStyleUtils';

export const AvailabilityHeatmapCell: React.FC<AvailabilityHeatmapCellProps> = ({
  dayNumber,
  dateStr,
  score,
  totalMembers = 1,
  isInRange,
  isSelected,
  isToday,
  viewMode = 'day',
  selectedSlot,
  onClick,
  onSelectSlot,
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

  const style = getIntensityStyles(intensity, isPast);
  const selectedClass = isSelected
    ? 'ring-2 ring-primary-400 ring-offset-2 ring-offset-slate-950 scale-[1.03] z-10 shadow-lg shadow-primary-500/25'
    : '';

  const formattedDate = formatDateLongFr(dateStr);
  const percentStr = `${Math.round(ratio * 100)}%`;
  const tooltipText = `${formattedDate} : ${availableCount}/${resolvedTotal} disponible(s) (${percentStr})${
    rank ? ` • #${rank} au podium` : ''
  }${isToday ? " • Aujourd'hui" : ''}${isPast ? ' • Passé' : ''}`;

  return (
    <button
      type="button"
      data-date={dateStr}
      onClick={onClick}
      aria-pressed={isSelected}
      title={tooltipText}
      className={`min-h-[48px] sm:min-h-[58px] p-1 sm:p-1.5 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer relative group ${
        viewMode === 'slots'
          ? `bg-slate-900/90 border-slate-800 ${selectedClass}`
          : `${style.bgAndBorder} ${selectedClass}`
      }`}
    >
      {/* Ligne haute : Numéro du jour & Médaille Podium */}
      <div className="flex items-center justify-between w-full gap-0.5">
        <div className="flex items-center gap-1">
          <span className={`text-xs sm:text-sm font-semibold ${viewMode === 'slots' ? 'text-slate-200' : style.dayNumber}`}>
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


      {/* Corps : Soit vue Journée (ratio unique), soit vue Créneaux (3 segments scindés) */}
      {viewMode === 'slots' && score?.slots ? (
        <div className="flex flex-col sm:grid sm:grid-cols-3 gap-0.5 w-full mt-1">
          {DAY_SLOTS.map((slotKey) => {
            const slotScore = score.slots![slotKey];
            const sAvail = slotScore?.available.length || 0;
            const sRatio = slotScore?.availableRatio || 0;
            const sIntensity = availabilityService.getIntensityLevel(sRatio, sAvail);
            const slotStyle = getIntensityStyles(sIntensity, isPast);
            const def = SLOT_DEFINITIONS[slotKey];
            const isSlotActive = isSelected && selectedSlot === slotKey;

            return (
              <div
                key={slotKey}
                onClick={(e) => {
                  if (onSelectSlot) {
                    e.stopPropagation();
                    onSelectSlot(slotKey);
                  }
                  onClick();
                }}
                title={`${def.fullLabel} : ${sAvail}/${resolvedTotal} disponible(s)`}
                className={`flex items-center justify-between sm:flex-col sm:items-center sm:justify-center px-1 sm:px-0 py-0.5 rounded text-[8px] sm:text-[9px] border transition ${slotStyle.bgAndBorder} ${
                  isSlotActive ? 'ring-1 ring-white shadow-sm' : ''
                }`}
              >
                <span className="font-bold leading-tight">{def.badgeLetter}</span>
                <span className="font-semibold sm:font-normal leading-tight opacity-90">{sAvail}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full flex items-center justify-between mt-1">
          <span className={`text-[10px] sm:text-xs ${style.counter}`}>
            {isPast ? <span className="opacity-70">passé</span> : `${availableCount}/${resolvedTotal}`}
          </span>
        </div>
      )}
    </button>
  );
};
