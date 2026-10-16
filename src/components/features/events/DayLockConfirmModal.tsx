import React, { useEffect } from 'react';
import { Lock, AlertTriangle, CheckCircle, HelpCircle, XCircle, X } from 'lucide-react';
import type { TimeSlot } from '../../../models/Event';
import { formatDateLongFr } from '../../../utils/dateUtils';
import { formatSlotLabel } from '../../../utils/timeSlotUtils';

export interface DayLockConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  dateStr: string;
  timeSlot: TimeSlot;
  availableCount: number;
  maybeCount: number;
  unavailableCount: number;
  totalMembers?: number;
  eventTitle?: string;
}

export const DayLockConfirmModal: React.FC<DayLockConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  dateStr,
  timeSlot,
  availableCount,
  maybeCount,
  unavailableCount,
  totalMembers,
  eventTitle,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasIssues = unavailableCount > 0 || maybeCount > 0;
  const slotText = formatSlotLabel(timeSlot);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-fade-in">
      <div className="bg-slate-800 border border-slate-700/80 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl text-slate-100 relative max-h-[92vh] overflow-y-auto scrollbar-stable">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la boîte de dialogue"
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700 transition min-w-[32px] min-h-[32px] flex items-center justify-center"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="flex items-start gap-3 sm:gap-4 pr-6">
          <div className="p-3 rounded-xl border bg-amber-500/10 border-amber-500/30 text-amber-400 shrink-0">
            <Lock className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
              Verrouiller cette date ?
            </h3>
            {eventTitle && (
              <p className="text-xs text-primary-300 font-medium truncate">{eventTitle}</p>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {/* Récapitulatif Date & Créneau */}
          <div className="bg-slate-900/70 border border-slate-700/60 p-3 rounded-xl space-y-1.5">
            <div className="text-sm font-semibold text-white capitalize">
              📅 {formatDateLongFr(dateStr)}
            </div>
            <div className="text-xs text-slate-300">
              ⏰ Créneau : <strong className="text-white">{slotText}</strong>
            </div>
            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle className="w-3.5 h-3.5" /> {availableCount} dispo{availableCount > 1 ? 's' : ''}
              </span>
              <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                <HelpCircle className="w-3.5 h-3.5" /> {maybeCount} incertain{maybeCount > 1 ? 's' : ''}
              </span>
              <span className="inline-flex items-center gap-1 text-slate-300 font-medium">
                <XCircle className="w-3.5 h-3.5 text-slate-400" /> {unavailableCount} indispo{unavailableCount > 1 ? 's' : ''}
              </span>
              {totalMembers && (
                <span className="text-slate-400 font-normal">
                  ({availableCount}/{totalMembers} au total)
                </span>
              )}
            </div>
          </div>

          {/* Avertissement membres indisponibles / incertains */}
          {hasIssues && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-xs text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <strong>Attention :</strong> {unavailableCount > 0 && `${unavailableCount} membre${unavailableCount > 1 ? 's sont' : ' est'} indisponible${unavailableCount > 1 ? 's' : ''}`}
                {unavailableCount > 0 && maybeCount > 0 && ' et '}
                {maybeCount > 0 && `${maybeCount} incertain${maybeCount > 1 ? 's' : ''}`} sur cette option.
              </div>
            </div>
          )}

          {/* Conséquences & Réversibilité */}
          <div className="text-xs text-slate-300 bg-slate-850 p-2.5 rounded-xl border border-slate-800 space-y-1">
            <p className="text-slate-200 font-medium">Ce que cela implique :</p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-400">
              <li>L'événement passera en statut <strong className="text-emerald-400 font-medium">Planifié</strong>.</li>
              <li>Les membres du groupe seront notifiés de la date retenue.</li>
              <li>En cas d'imprévu, vous pourrez réouvrir le sondage à tout moment.</li>
            </ul>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-2 sm:gap-3 pt-5 mt-4 border-t border-slate-700/60">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs sm:text-sm font-medium transition min-h-[42px]"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold transition shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 min-h-[42px]"
          >
            <Lock className="w-4 h-4" />
            <span>Confirmer & Verrouiller</span>
          </button>
        </div>
      </div>
    </div>
  );
};
