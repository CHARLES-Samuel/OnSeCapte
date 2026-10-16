import React from 'react';
import { CheckCircle, HelpCircle, XCircle, Sun, CloudSun, Moon, Sparkles } from 'lucide-react';
import type { DaySlot, AvailabilityStatus, DaySlotsAvailability, UserDayAvailability } from '../../../models/Group';
import { normalizeSlotsAvailability, DAY_SLOTS, SLOT_DEFINITIONS } from '../../../utils/timeSlotUtils';

interface DaySlotAvailabilityPickerProps {
  dateStr: string;
  value?: UserDayAvailability;
  onChange: (dateStr: string, newValue: DaySlotsAvailability) => void;
  disabled?: boolean;
}

export const DaySlotAvailabilityPicker: React.FC<DaySlotAvailabilityPickerProps> = ({
  dateStr,
  value,
  onChange,
  disabled = false,
}) => {
  const slots = normalizeSlotsAvailability(value);

  const handleSlotChange = (slot: DaySlot, status: AvailabilityStatus) => {
    if (disabled) return;
    onChange(dateStr, {
      ...slots,
      [slot]: status,
    });
  };

  const handleAllDay = (status: AvailabilityStatus) => {
    if (disabled) return;
    onChange(dateStr, {
      morning: status,
      afternoon: status,
      evening: status,
    });
  };

  const isAllDayAvailable = slots.morning === 'available' && slots.afternoon === 'available' && slots.evening === 'available';

  const getSlotIcon = (slot: DaySlot) => {
    if (slot === 'morning') return <Sun className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />;
    if (slot === 'afternoon') return <CloudSun className="w-3.5 h-3.5 text-orange-400" aria-hidden="true" />;
    return <Moon className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />;
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl space-y-3">
      <div className="flex items-center justify-between gap-2 border-b border-slate-700/50 pb-2.5">
        <span className="text-xs sm:text-sm font-bold text-slate-200">
          Tes disponibilités par créneau :
        </span>
        <button
          type="button"
          onClick={() => handleAllDay(isAllDayAvailable ? 'unavailable' : 'available')}
          disabled={disabled}
          className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border active:scale-95 ${
            isAllDayAvailable
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
              : 'bg-primary-600/20 border-primary-500/40 text-primary-300 hover:bg-primary-600/30'
          }`}
          title="Définir toute la journée d'un coup"
        >
          <Sparkles className="w-4 h-4 text-primary-300" />
          <span>{isAllDayAvailable ? 'Tout dispo ✓' : 'Toute la journée'}</span>
        </button>
      </div>

      <div className="space-y-3">
        {DAY_SLOTS.map((slotKey) => {
          const def = SLOT_DEFINITIONS[slotKey];
          const currentStatus = slots[slotKey];

          return (
            <div
              key={slotKey}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-7 sm:h-7 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700/60">
                  {getSlotIcon(slotKey)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-white truncate">
                    {def.label}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {def.timeRange}
                  </div>
                </div>
              </div>

              {/* 3 pastilles de vote avec cibles tactiles adaptées aux doigts (44px min sur mobile) */}
              <div className="grid grid-cols-3 gap-2 sm:gap-1.5 sm:w-64 w-full">
                <button
                  type="button"
                  onClick={() => handleSlotChange(slotKey, 'available')}
                  disabled={disabled}
                  className={`flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-[36px] py-2 sm:py-1 px-2 rounded-xl text-xs sm:text-[11px] font-semibold border transition active:scale-95 ${
                    currentStatus === 'available'
                      ? 'bg-emerald-500/25 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/40 shadow-sm shadow-emerald-500/20'
                      : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <CheckCircle className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-emerald-400 shrink-0" />
                  <span>Dispo</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSlotChange(slotKey, 'maybe')}
                  disabled={disabled}
                  className={`flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-[36px] py-2 sm:py-1 px-2 rounded-xl text-xs sm:text-[11px] font-semibold border transition active:scale-95 ${
                    currentStatus === 'maybe'
                      ? 'bg-amber-500/25 border-amber-500 text-amber-300 ring-2 ring-amber-500/40 shadow-sm shadow-amber-500/20'
                      : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
                  <span>Peut-être</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSlotChange(slotKey, 'unavailable')}
                  disabled={disabled}
                  className={`flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-[36px] py-2 sm:py-1 px-2 rounded-xl text-xs sm:text-[11px] font-semibold border transition active:scale-95 ${
                    currentStatus === 'unavailable'
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 ring-2 ring-rose-500/40 shadow-sm shadow-rose-500/20'
                      : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <XCircle className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-rose-400 shrink-0" />
                  <span>Indispo</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
