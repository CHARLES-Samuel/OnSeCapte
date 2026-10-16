import React from 'react';
import { ChevronLeft, ChevronRight, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface GroupPlanningHeaderProps {
  monthLabel: string;
  isSaving: boolean;
  hasPendingChanges: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  isPrevDisabled: boolean;
  isNextDisabled: boolean;
  showEvents: boolean;
  onToggleShowEvents: () => void;
  hidePastEvents: boolean;
  onToggleHidePastEvents: () => void;
}

export const GroupPlanningHeader: React.FC<GroupPlanningHeaderProps> = ({
  monthLabel,
  isSaving,
  hasPendingChanges,
  onPrevMonth,
  onNextMonth,
  isPrevDisabled,
  isNextDisabled,
  showEvents,
  onToggleShowEvents,
  hidePastEvents,
  onToggleHidePastEvents,
}) => {
  return (
    <div className="space-y-4 mb-5">
      {/* Titre et indicateur de sauvegarde */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Planning du groupe
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Clique sur un jour pour changer ta dispo. Les sorties prévues s'affichent directement.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium h-8">
          {isSaving ? (
            <span className="text-primary-400 flex items-center gap-1.5 bg-primary-500/10 px-3 py-1.5 rounded-full border border-primary-500/20">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enregistrement...
            </span>
          ) : hasPendingChanges ? (
            <span className="text-slate-400 flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
              En attente...
            </span>
          ) : (
            <span className="text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <CheckCircle className="w-3.5 h-3.5" /> À jour
            </span>
          )}
        </div>
      </div>

      {/* Barre de navigation du mois & Interrupteurs d'affichage */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/50 p-2 sm:p-2.5 rounded-xl border border-slate-800">
        {/* Navigation mois */}
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <button
            type="button"
            onClick={onPrevMonth}
            disabled={isPrevDisabled}
            aria-label="Mois précédent"
            className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-slate-300 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-slate-200 capitalize text-base sm:text-lg tracking-wide min-w-[140px] text-center sm:text-left">
            {monthLabel}
          </span>
          <button
            type="button"
            onClick={onNextMonth}
            disabled={isNextDisabled}
            aria-label="Mois suivant"
            className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-slate-300 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Interrupteurs */}
        <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t border-slate-800 sm:border-t-0 justify-end">
          {/* Interrupteur Afficher les événements */}
          <button
            type="button"
            onClick={onToggleShowEvents}
            aria-pressed={showEvents}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
              showEvents
                ? 'bg-primary-500/15 border-primary-500/40 text-primary-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-300'
            }`}
            title={showEvents ? 'Masquer les sorties sur le calendrier' : 'Afficher les sorties sur le calendrier'}
          >
            {showEvents ? <Eye className="w-3.5 h-3.5 text-primary-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
            <span className="hidden xs:inline">Sorties</span>
          </button>

          {/* Interrupteur Masquer passés */}
          <button
            type="button"
            onClick={onToggleHidePastEvents}
            aria-pressed={hidePastEvents}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
              hidePastEvents
                ? 'bg-slate-700 border-slate-600 text-slate-200'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-300'
            }`}
            title={hidePastEvents ? 'Afficher les sorties passées' : 'Masquer les sorties passées'}
          >
            <span>{hidePastEvents ? 'Passés masqués' : 'Passés visibles'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
