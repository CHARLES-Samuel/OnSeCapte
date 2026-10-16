import type { HeatmapIntensity } from '../models/Availability';

export interface IntensityStyles {
  bgAndBorder: string;
  counter: string;
  dayNumber: string;
}

export function getIntensityStyles(intensity: HeatmapIntensity, isPast: boolean): IntensityStyles {
  if (isPast) {
    return {
      bgAndBorder: 'bg-slate-950/40 border-slate-900/60 text-slate-500 opacity-50',
      counter: 'text-slate-600',
      dayNumber: 'text-slate-400',
    };
  }
  if (intensity === 'low') {
    return {
      bgAndBorder: 'bg-emerald-950/80 border-emerald-800/80 text-emerald-200 hover:bg-emerald-950 hover:border-emerald-600',
      counter: 'text-emerald-400/90 font-semibold',
      dayNumber: 'text-emerald-200 font-semibold',
    };
  }
  if (intensity === 'medium') {
    return {
      bgAndBorder: 'bg-emerald-900 border-emerald-600/80 text-emerald-100 hover:bg-emerald-800',
      counter: 'text-emerald-200 font-bold',
      dayNumber: 'text-emerald-100 font-bold',
    };
  }
  if (intensity === 'high') {
    return {
      bgAndBorder: 'bg-emerald-700 border-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-900/30',
      counter: 'text-emerald-100 font-bold',
      dayNumber: 'text-white font-bold',
    };
  }
  if (intensity === 'full') {
    return {
      bgAndBorder: 'bg-emerald-400 border-emerald-200 text-slate-950 hover:bg-emerald-300 shadow-md shadow-emerald-500/20',
      counter: 'text-slate-950 font-black',
      dayNumber: 'text-slate-950 font-black',
    };
  }
  return {
    bgAndBorder: 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700',
    counter: 'text-slate-500 font-medium',
    dayNumber: 'text-slate-200',
  };
}
