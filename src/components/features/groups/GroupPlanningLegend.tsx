import React from 'react';

interface GroupPlanningLegendProps {
  showEvents: boolean;
  className?: string;
}

export const GroupPlanningLegend: React.FC<GroupPlanningLegendProps> = ({
  showEvents,
  className = '',
}) => {
  return (
    <div
      className={`mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 justify-center sm:justify-start text-xs text-slate-400 font-medium bg-slate-900/40 p-3 rounded-xl border border-slate-800/50 ${className}`}
    >
      <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mr-1">
        Disponibilité :
      </span>
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30 border border-emerald-500" />
        <span>Dispo</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/30 border border-amber-500" />
        <span>À confirmer</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
        <span>Indispo</span>
      </div>

      {showEvents && (
        <>
          <div className="w-px h-3.5 bg-slate-800 mx-1 hidden sm:block" />
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mr-1">
            Sorties :
          </span>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
              Validée
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-800/80 border border-dashed border-slate-600 text-slate-300">
              En sondage
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-900 border border-slate-800 text-slate-500 opacity-60">
              Passée
            </span>
          </div>
        </>
      )}
    </div>
  );
};
