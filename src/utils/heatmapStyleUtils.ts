import type { HeatmapIntensity } from '../models/Availability';

export interface IntensityStyles {
  bgAndBorder: string;
  counter: string;
  dayNumber: string;
}

export function getIntensityStyles(intensity: HeatmapIntensity, isPast: boolean): IntensityStyles {
  if (isPast) {
    return {
      bgAndBorder: 'bg-slate-950/40 border-slate-900/80 text-slate-500 opacity-45',
      counter: 'text-slate-600',
      dayNumber: 'text-slate-500 font-normal',
    };
  }
  if (intensity === 'low') {
    return {
      bgAndBorder: 'bg-emerald-950/70 border-emerald-800/90 text-emerald-200 hover:bg-emerald-900/70 hover:border-emerald-600',
      counter: 'text-emerald-400 font-semibold',
      dayNumber: 'text-emerald-300 font-semibold',
    };
  }
  if (intensity === 'medium') {
    return {
      bgAndBorder: 'bg-emerald-800/80 border-emerald-600 text-white hover:bg-emerald-700 hover:border-emerald-500 shadow-sm shadow-emerald-950/40',
      counter: 'text-emerald-100 font-bold',
      dayNumber: 'text-white font-bold',
    };
  }
  if (intensity === 'high') {
    return {
      bgAndBorder: 'bg-emerald-600 border-emerald-400 text-white hover:bg-emerald-500 hover:border-emerald-300 shadow-sm shadow-emerald-900/40',
      counter: 'text-emerald-50 font-extrabold',
      dayNumber: 'text-white font-extrabold',
    };
  }
  if (intensity === 'full') {
    return {
      bgAndBorder: 'bg-emerald-400 border-emerald-200 text-slate-950 hover:bg-emerald-300 hover:border-white shadow-md shadow-emerald-400/30',
      counter: 'text-slate-950 font-black',
      dayNumber: 'text-slate-950 font-black',
    };
  }
  return {
    bgAndBorder: 'bg-slate-900/50 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700',
    counter: 'text-slate-500 font-medium',
    dayNumber: 'text-slate-300 font-semibold',
  };
}
