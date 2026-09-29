import {
  Utensils,
  Dices,
  PartyPopper,
  Pizza,
  Dumbbell,
  Gamepad2,
  MoreHorizontal,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { EventCategory } from '../models/Event';

export type CategoryFilterValue = EventCategory | 'Toutes';

export interface CategoryThemeConfig {
  label: string;
  icon: LucideIcon;
  dotColor: string;
  badgeClasses: string;
  activeItemClasses: string;
}

export const CATEGORY_THEME_MAP: Record<EventCategory, CategoryThemeConfig> = {
  Restaurant: {
    label: 'Restaurant',
    icon: Utensils,
    dotColor: 'bg-orange-400',
    badgeClasses: 'bg-orange-500/15 border-orange-500/30 text-orange-300',
    activeItemClasses: 'bg-orange-500/20 text-orange-200 border-orange-500/40',
  },
  'Jeux de rôle': {
    label: 'Jeux de rôle',
    icon: Dices,
    dotColor: 'bg-purple-400',
    badgeClasses: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
    activeItemClasses: 'bg-purple-500/20 text-purple-200 border-purple-500/40',
  },
  Soirée: {
    label: 'Soirée',
    icon: PartyPopper,
    dotColor: 'bg-pink-400',
    badgeClasses: 'bg-pink-500/15 border-pink-500/30 text-pink-300',
    activeItemClasses: 'bg-pink-500/20 text-pink-200 border-pink-500/40',
  },
  Repas: {
    label: 'Repas',
    icon: Pizza,
    dotColor: 'bg-amber-400',
    badgeClasses: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
    activeItemClasses: 'bg-amber-500/20 text-amber-200 border-amber-500/40',
  },
  Sport: {
    label: 'Sport',
    icon: Dumbbell,
    dotColor: 'bg-emerald-400',
    badgeClasses: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
    activeItemClasses: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40',
  },
  Gaming: {
    label: 'Gaming',
    icon: Gamepad2,
    dotColor: 'bg-cyan-400',
    badgeClasses: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
    activeItemClasses: 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40',
  },
  Autres: {
    label: 'Autres',
    icon: MoreHorizontal,
    dotColor: 'bg-slate-400',
    badgeClasses: 'bg-slate-700/50 border-slate-600/40 text-slate-300',
    activeItemClasses: 'bg-slate-700 text-slate-200 border-slate-600',
  },
};

export const ALL_CATEGORIES_CONFIG: CategoryThemeConfig = {
  label: 'Toutes les catégories',
  icon: Sparkles,
  dotColor: 'bg-primary-400',
  badgeClasses: 'bg-primary-500/15 border-primary-500/30 text-primary-300',
  activeItemClasses: 'bg-primary-500/20 text-primary-200 border-primary-500/40',
};

export const getCategoryTheme = (category: CategoryFilterValue): CategoryThemeConfig => {
  if (category === 'Toutes') {
    return ALL_CATEGORIES_CONFIG;
  }
  return CATEGORY_THEME_MAP[category] ?? CATEGORY_THEME_MAP.Autres;
};
