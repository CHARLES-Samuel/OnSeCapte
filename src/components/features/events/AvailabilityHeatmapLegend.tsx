import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { getIntensityStyles } from '../../../utils/heatmapStyleUtils';
import type { HeatmapIntensity } from '../../../models/Availability';

interface AvailabilityHeatmapLegendProps {
  className?: string;
  defaultExpanded?: boolean;
}

interface LegendTier {
  intensity: HeatmapIntensity;
  label: string;
  badgeValue: string;
  description: string;
}

const HEATMAP_TIERS: LegendTier[] = [
  { intensity: 'none', label: '0%', badgeValue: '0', description: '0% disponible' },
  { intensity: 'low', label: '25%', badgeValue: '25', description: '1% à 25% disponible' },
  { intensity: 'medium', label: '50%', badgeValue: '50', description: '26% à 50% disponible' },
  { intensity: 'high', label: '75%', badgeValue: '75', description: '51% à 75% disponible' },
  { intensity: 'full', label: '100%', badgeValue: '100', description: '76% à 100% disponible' },
];

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
        <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 space-y-3 animate-fade-in">
          {/* Paliers d'intensité */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Taux de présence du groupe :
            </span>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2 text-center">
              {HEATMAP_TIERS.map((tier) => {
                const style = getIntensityStyles(tier.intensity, false);
                return (
                  <div key={tier.intensity} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-full h-6 rounded-md flex items-center justify-center text-[10px] font-bold border transition ${style.bgAndBorder}`}
                      title={tier.description}
                    >
                      <span className={style.counter}>{tier.badgeValue}</span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-slate-300 font-semibold">{tier.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Indicateurs complémentaires */}
          <div className="pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-y-2.5 gap-x-3 text-[11px] text-slate-400">
            {/* Podium */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-300">Podium :</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-amber-400/80 bg-amber-500/20 text-[10px] font-bold text-amber-300 shadow-sm">
                <span>🥇</span> 1er
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-300/80 bg-slate-200/20 text-[10px] font-bold text-slate-200 shadow-sm">
                <span>🥈</span> 2e
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-amber-600/80 bg-amber-700/25 text-[10px] font-bold text-amber-400 shadow-sm">
                <span>🥉</span> 3e
              </span>
            </div>

            {/* Sélection & Aujourd'hui */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-slate-800 ring-2 ring-primary-400 ring-offset-2 ring-offset-slate-900 inline-block shrink-0" />
                <span className="font-medium text-slate-300">Sélectionné</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400 ring-2 ring-sky-400/40 inline-block shrink-0" />
                <span className="font-medium text-slate-300">Aujourd'hui</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded border border-dashed border-slate-700 bg-slate-950/40 opacity-50 inline-block shrink-0" />
                <span className="font-medium text-slate-400">Inactif / Passé</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
