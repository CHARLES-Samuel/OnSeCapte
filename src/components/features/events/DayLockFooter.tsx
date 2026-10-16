import React from 'react';
import { Lock, Clock, AlertTriangle, ShieldAlert, Info } from 'lucide-react';
import type { TimeSlot } from '../../../models/Event';

export interface DayLockFooterProps {
  canLock: boolean;
  isLocked: boolean;
  isPast: boolean;
  isInRange: boolean;
  lockTimeSlot: TimeSlot;
  onChangeTimeSlot: (slot: TimeSlot) => void;
  onOpenConfirmModal: () => void;
}

export const DayLockFooter: React.FC<DayLockFooterProps> = ({
  canLock,
  isLocked,
  isPast,
  isInRange,
  lockTimeSlot,
  onChangeTimeSlot,
  onOpenConfirmModal,
}) => {
  if (isPast) {
    return (
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3 text-xs text-slate-400 flex items-center gap-2">
        <Clock className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
        <span>Cette date est déjà passée. Il n'est pas possible de fixer un événement dans le passé.</span>
      </div>
    );
  }

  if (!isInRange) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
        <span>Cette date est en dehors de la plage définie pour l'événement.</span>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300 flex items-center gap-2">
        <Lock className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
        <span>Cet événement est déjà verrouillé.</span>
      </div>
    );
  }

  if (!canLock) {
    return (
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3 text-xs text-slate-400 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
        <span>Seul l'organisateur de l'événement peut verrouiller la date définitive.</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700/70 rounded-xl p-3.5 sm:p-4 space-y-3 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Choix du créneau à retenir */}
        <div className="flex items-center gap-2 flex-wrap">
          <label htmlFor="lock-slot-select" className="text-xs text-slate-300 font-semibold shrink-0">
            Créneau à retenir :
          </label>
          <select
            id="lock-slot-select"
            value={lockTimeSlot}
            onChange={(e) => onChangeTimeSlot(e.target.value as TimeSlot)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-semibold focus:ring-1 focus:ring-amber-500 outline-none cursor-pointer min-h-[36px]"
          >
            <option value="Toute la journée">Toute la journée</option>
            <option value="Matin">Matin (8h - 12h)</option>
            <option value="Après-midi">Après-midi (12h - 18h)</option>
            <option value="Soirée">Soirée (18h - 00h)</option>
          </select>
        </div>

        {/* Bouton de verrouillage */}
        <button
          type="button"
          onClick={onOpenConfirmModal}
          className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] bg-amber-600 hover:bg-amber-500 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 cursor-pointer shrink-0"
        >
          <Lock className="w-4 h-4" aria-hidden="true" />
          <span>Choisir & Verrouiller cette date</span>
        </button>
      </div>

      {/* Explication contextuelle intégrée */}
      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 border-t border-slate-700/40 pt-2">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
        <span>
          Les membres seront notifiés et la date ne pourra plus changer sans rouvrir le sondage.
        </span>
      </div>
    </div>
  );
};
