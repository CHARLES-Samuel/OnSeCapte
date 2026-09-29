import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ForceLockWarningProps {
  isSubmitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ForceLockWarning: React.FC<ForceLockWarningProps> = ({
  isSubmitting,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-xl text-red-300 text-xs space-y-2">
      <div className="flex items-center gap-1.5 font-bold text-red-400">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>Attention : membres inactifs</span>
      </div>
      <p>
        Certains membres n'ont pas encore répondu au sondage. Voulez-vous tout de même verrouiller
        cette date pour l'événement ?
      </p>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium flex-1"
        >
          {isSubmitting ? 'Verrouillage...' : 'Forcer la validation'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex-1"
        >
          Annuler
        </button>
      </div>
    </div>
  );
};
