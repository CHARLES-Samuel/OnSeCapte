import React from 'react';
import { Clock } from 'lucide-react';
import type { DaySlot } from '../../../models/Group';
import {
  DAY_SLOTS,
  SLOT_DEFINITIONS,
  normalizeTimePreference,
  toggleTimePreferenceSlot,
} from '../../../utils/timeSlotUtils';

export interface EventTimePreferencePickerProps {
  value?: DaySlot[];
  onChange: (next: DaySlot[]) => void;
  disabled?: boolean;
}

export const EventTimePreferencePicker: React.FC<EventTimePreferencePickerProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const normalized = normalizeTimePreference(value);
  const isAnySelected = normalized.length === 0;

  return (
    <div className="bg-slate-900/70 border border-slate-700/70 p-3.5 rounded-xl space-y-2.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-violet-400 shrink-0" aria-hidden="true" />
          <span>Moment de la journée souhaité</span>
        </span>
        <span className="text-[11px] text-slate-400">Choix multiple possible</span>
      </div>

      <div
        role="group"
        aria-label="Moment de la journée souhaité"
        className="grid grid-cols-2 sm:grid-cols-4 gap-2"
      >
        <button
          type="button"
          disabled={disabled}
          aria-pressed={isAnySelected}
          onClick={() => onChange(toggleTimePreferenceSlot(normalized, 'any'))}
          className={`px-2.5 py-2 rounded-lg border text-xs font-semibold transition min-h-[42px] flex flex-col items-center justify-center text-center cursor-pointer ${
            isAnySelected
              ? 'bg-violet-500/20 border-violet-500 text-violet-200 ring-1 ring-violet-500/40 shadow-sm'
              : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <span>Peu importe</span>
          <span className="text-[10px] font-normal opacity-75">Tous créneaux</span>
        </button>

        {DAY_SLOTS.map((slot) => {
          const def = SLOT_DEFINITIONS[slot];
          const isSelected = normalized.includes(slot);
          return (
            <button
              key={slot}
              type="button"
              disabled={disabled}
              aria-pressed={isSelected}
              onClick={() => onChange(toggleTimePreferenceSlot(normalized, slot))}
              className={`px-2.5 py-2 rounded-lg border text-xs font-semibold transition min-h-[42px] flex flex-col items-center justify-center text-center cursor-pointer ${
                isSelected
                  ? 'bg-violet-500/20 border-violet-500 text-violet-200 ring-1 ring-violet-500/40 shadow-sm'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <span>{def.shortLabel}</span>
              <span className="text-[10px] font-normal opacity-75">{def.timeRange}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

