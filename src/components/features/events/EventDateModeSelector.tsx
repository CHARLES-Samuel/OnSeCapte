import React from 'react';
import { CalendarRange, CalendarCheck, Sparkles } from 'lucide-react';
import type { EventDateMode, TimeSlot } from '../../../models/Event';
import { getTodayDateStr } from '../../../utils/dateUtils';

interface EventDateModeSelectorProps {
  dateMode: EventDateMode;
  onDateModeChange: (mode: EventDateMode) => void;
  startDate: string;
  onStartDateChange: (val: string) => void;
  endDate: string;
  onEndDateChange: (val: string) => void;
  finalDate: string;
  onFinalDateChange: (val: string) => void;
  finalTimeSlot: TimeSlot;
  onFinalTimeSlotChange: (slot: TimeSlot) => void;
  disabled?: boolean;
}

const TIME_SLOTS: TimeSlot[] = ['Matin', 'Après-midi', 'Soirée', 'Toute la journée'];

export const EventDateModeSelector: React.FC<EventDateModeSelectorProps> = ({
  dateMode,
  onDateModeChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  finalDate,
  onFinalDateChange,
  finalTimeSlot,
  onFinalTimeSlotChange,
  disabled = false,
}) => {
  // Normaliser 'poll' vers 'any' pour affichage uniforme
  const activeMode = dateMode === 'poll' ? 'any' : dateMode;

  const todayStr = getTodayDateStr();

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Choix de la date
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Option 1: Sans restriction */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => onDateModeChange('any')}
            className={`p-3 rounded-xl border text-left transition flex flex-col justify-between min-h-[76px] ${
              activeMode === 'any'
                ? 'bg-primary-500/15 border-primary-500 text-white ring-1 ring-primary-500/40 shadow-sm'
                : 'bg-slate-900/80 border-slate-700/80 text-slate-400 hover:border-slate-600 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm text-slate-200">
              <Sparkles className="w-4 h-4 text-primary-400 shrink-0" />
              <span>Sans restriction</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-tight">
              Cherche sur tout le planning glissant
            </p>
          </button>

          {/* Option 2: Plage de dates */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => onDateModeChange('range')}
            className={`p-3 rounded-xl border text-left transition flex flex-col justify-between min-h-[76px] ${
              activeMode === 'range'
                ? 'bg-blue-500/15 border-blue-500 text-white ring-1 ring-blue-500/40 shadow-sm'
                : 'bg-slate-900/80 border-slate-700/80 text-slate-400 hover:border-slate-600 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm text-slate-200">
              <CalendarRange className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Plage de dates</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-tight">
              Période restreinte (ex: entre le 10 et le 25)
            </p>
          </button>

          {/* Option 3: Date fixe */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => onDateModeChange('fixed')}
            className={`p-3 rounded-xl border text-left transition flex flex-col justify-between min-h-[76px] ${
              activeMode === 'fixed'
                ? 'bg-amber-500/15 border-amber-500 text-white ring-1 ring-amber-500/40 shadow-sm'
                : 'bg-slate-900/80 border-slate-700/80 text-slate-400 hover:border-slate-600 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm text-slate-200">
              <CalendarCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Date fixe</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-tight">
              Jour et heure précis déjà fixés
            </p>
          </button>
        </div>
      </div>

      {/* Champs pour Plage de dates */}
      {activeMode === 'range' && (
        <div className="bg-slate-900/90 border border-blue-500/30 p-3.5 rounded-xl space-y-3">
          <div className="text-xs font-medium text-blue-300 flex items-center gap-1.5">
            <CalendarRange className="w-3.5 h-3.5 text-blue-400" />
            <span>Fenêtre de recherche (intervalle inclusif)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Date de début *
              </label>
              <input
                type="date"
                value={startDate}
                min={todayStr}
                onChange={(e) => onStartDateChange(e.target.value)}
                disabled={disabled}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                required={activeMode === 'range'}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Date de fin *
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate || todayStr}
                onChange={(e) => onEndDateChange(e.target.value)}
                disabled={disabled}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                required={activeMode === 'range'}
              />
            </div>
          </div>
        </div>
      )}

      {/* Champs pour Date fixe */}
      {activeMode === 'fixed' && (
        <div className="bg-slate-900/90 border border-amber-500/30 p-3.5 rounded-xl space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={finalDate}
                min={todayStr}
                onChange={(e) => onFinalDateChange(e.target.value)}
                disabled={disabled}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-amber-500 outline-none"
                required={activeMode === 'fixed'}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Moment de la journée
              </label>
              <select
                value={finalTimeSlot}
                onChange={(e) => onFinalTimeSlotChange(e.target.value as TimeSlot)}
                disabled={disabled}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-amber-500 outline-none"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
