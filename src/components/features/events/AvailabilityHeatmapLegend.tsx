import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface AvailabilityHeatmapLegendProps {
  className?: string;
  defaultExpanded?: boolean;
}

export const AvailabilityHeatmapLegend: React.FC<AvailabilityHeatmapLegendProps> = ({
  className = '',
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div
      className={`bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 sm:p-3 text-xs text-slate-300 transition-all ${className}`}
    >
      {/* En-tête avec bouton de repli pour mobile */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-semibold text-slate-200 text-xs">
          <HelpCircle className="w-3.5 h-3.5 text-primary-400 shrink-0" />
          <span>Légende du calendrier</span>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition px-1.5 py-0.5 rounded hover:bg-slate-800"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Masquer la légende' : 'Afficher la légende'}
        >
          <span>{isExpanded ? 'Réduire' : 'Détails'}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Contenu de la légende unifiée */}
      {isExpanded && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 space-y-2.5 animate-fade-in">
          {/* Paliers d'intensité */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Taux de présence du groupe :
            </span>
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {/* 0% */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-full h-5 rounded-md bg-slate-900/80 border border-slate-800 flex items-center justify-center text-[10px] text-slate-500 font-medium"
                  title="0% disponible"
                >
                  0
                </div>
                <span className="text-[10px] text-slate-400">0%</span>
              </div>

              {/* 25% */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-full h-5 rounded-md bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-[10px] text-emerald-300 font-semibold"
                  title="1% à 25% disponible"
                >
                  25
                </div>
                <span className="text-[10px] text-slate-400">25%</span>
              </div>

              {/* 50% */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-full h-5 rounded-md bg-emerald-900 border border-emerald-600/80 flex items-center justify-center text-[10px] text-emerald-100 font-bold"
                  title="26% à 50% disponible"
                >
                  50
                </div>
                <span className="text-[10px] text-slate-400">50%</span>
              </div>

              {/* 75% */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-full h-5 rounded-md bg-emerald-700 border border-emerald-500 flex items-center justify-center text-[10px] text-white font-bold"
                  title="51% à 75% disponible"
                >
                  75
                </div>
                <span className="text-[10px] text-slate-400">75%</span>
              </div>

              {/* 100% */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-full h-5 rounded-md bg-emerald-400 border border-emerald-200 flex items-center justify-center text-[10px] text-slate-950 font-black shadow-sm"
                  title="76% à 100% disponible"
                >
                  100
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">100%</span>
              </div>
            </div>
          </div>

          {/* Indicateurs complémentaires */}
          <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-y-2 gap-x-3 text-[11px] text-slate-400">
            {/* Podium */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-300">Podium :</span>
              <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 shadow-sm">
                🥇 1er
              </span>
              <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-950 shadow-sm">
                🥈 2e
              </span>
              <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[10px] font-bold bg-amber-700 text-amber-50 shadow-sm">
                🥉 3e
              </span>
            </div>

            {/* Sélection & Aujourd'hui */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-slate-800 ring-2 ring-primary-400 ring-offset-1 ring-offset-slate-900 inline-block shrink-0" />
                <span>Sélectionné</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400 ring-2 ring-sky-400/30 inline-block shrink-0" />
                <span>Aujourd'hui</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
