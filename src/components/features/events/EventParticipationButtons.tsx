import React from 'react';
import type { EventParticipation } from '../../../models/Event';
import { Check, HelpCircle, X, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export interface EventParticipationButtonsProps {
  currentParticipation?: EventParticipation;
  onSelect: (participation: EventParticipation) => Promise<void> | void;
  disabled?: boolean;
  isLoading?: boolean;
  pendingStatus?: EventParticipation | null;
  variant?: 'compact' | 'card' | 'full';
  className?: string;
}

interface ParticipationOptionConfig {
  status: Exclude<EventParticipation, 'pending'>;
  compactLabel: string;
  label: string;
  activeTitle: string;
  inactiveTitle: string;
  compactActiveClass: string;
  compactInactiveClass: string;
  cardActiveClass: string;
  fullActiveClass: string;
  CompactIcon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  FullIcon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
}

const PARTICIPATION_OPTIONS: ParticipationOptionConfig[] = [
  {
    status: 'participating',
    compactLabel: 'Présent',
    label: 'Je participe',
    activeTitle: 'Tu participes déjà',
    inactiveTitle: 'Je participe',
    compactActiveClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm',
    compactInactiveClass: 'bg-slate-800 text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-300 border-slate-700',
    cardActiveClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    fullActiveClass: 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-600/20',
    CompactIcon: Check,
    FullIcon: CheckCircle,
  },
  {
    status: 'maybe',
    compactLabel: 'Je ne sais pas',
    label: 'Je ne sais pas',
    activeTitle: 'Tu as indiqué ne pas savoir',
    inactiveTitle: 'Je ne sais pas',
    compactActiveClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm',
    compactInactiveClass: 'bg-slate-800 text-slate-300 hover:bg-amber-500/10 hover:text-amber-300 border-slate-700',
    cardActiveClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    fullActiveClass: 'bg-amber-500/20 border-amber-500 text-amber-300',
    CompactIcon: HelpCircle,
    FullIcon: HelpCircle,
  },
  {
    status: 'not_participating',
    compactLabel: 'Pas dispo',
    label: 'Pas dispo',
    activeTitle: 'Tu es noté indisponible',
    inactiveTitle: 'Pas disponible',
    compactActiveClass: 'bg-red-500/20 text-red-300 border-red-500/40 shadow-sm',
    compactInactiveClass: 'bg-slate-800 text-slate-300 hover:bg-red-500/10 hover:text-red-300 border-slate-700',
    cardActiveClass: 'bg-red-500/20 text-red-400 border-red-500/30',
    fullActiveClass: 'bg-red-500/20 border-red-500 text-red-400',
    CompactIcon: X,
    FullIcon: XCircle,
  },
];

export const EventParticipationButtons: React.FC<EventParticipationButtonsProps> = ({
  currentParticipation,
  onSelect,
  disabled = false,
  isLoading = false,
  pendingStatus = null,
  variant = 'compact',
  className = '',
}) => {
  const isDisabled = disabled || isLoading;

  const handleClick = (e: React.MouseEvent, status: EventParticipation) => {
    e.stopPropagation();
    if (isDisabled) return;
    onSelect(status);
  };

  const isCurrentLoading = (status: EventParticipation) => isLoading && pendingStatus === status;

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {PARTICIPATION_OPTIONS.map((opt) => {
          const isSelected = currentParticipation === opt.status;
          const Icon = opt.CompactIcon;
          return (
            <button
              key={opt.status}
              type="button"
              disabled={isDisabled}
              onClick={(e) => handleClick(e, opt.status)}
              aria-pressed={isSelected}
              title={isSelected ? opt.activeTitle : opt.inactiveTitle}
              className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 border min-h-[32px] ${
                isSelected ? opt.compactActiveClass : opt.compactInactiveClass
              } ${isDisabled ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isCurrentLoading(opt.status) ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden={true} />
              ) : (
                <Icon className="w-3.5 h-3.5" aria-hidden={true} />
              )}
              <span className="text-xs hidden lg:inline">{opt.compactLabel}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`grid grid-cols-3 gap-1.5 sm:gap-2 ${className}`}>
        {PARTICIPATION_OPTIONS.map((opt) => {
          const isSelected = currentParticipation === opt.status;
          const Icon = opt.CompactIcon;
          return (
            <button
              key={opt.status}
              type="button"
              disabled={isDisabled}
              onClick={(e) => handleClick(e, opt.status)}
              aria-pressed={isSelected}
              title={isSelected ? opt.activeTitle : opt.inactiveTitle}
              className={`py-2 px-2 rounded-lg text-xs sm:text-sm font-medium transition flex items-center justify-center gap-1 border min-h-[38px] min-w-0 ${
                isSelected
                  ? opt.cardActiveClass
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white border-transparent'
              } ${isDisabled ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isCurrentLoading(opt.status) ? (
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin shrink-0" aria-hidden={true} />
              ) : (
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" aria-hidden={true} />
              )}
              <span className="truncate">{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // variant === 'full' (page détail / UserAvailabilityForm)
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 min-w-0 ${className}`}>
      {PARTICIPATION_OPTIONS.map((opt) => {
        const isSelected = currentParticipation === opt.status;
        const Icon = opt.FullIcon;
        return (
          <button
            key={opt.status}
            type="button"
            disabled={isDisabled}
            onClick={(e) => handleClick(e, opt.status)}
            aria-pressed={isSelected}
            className={`min-w-0 py-3 px-2.5 sm:px-3 rounded-xl font-medium border flex items-center justify-center gap-1.5 sm:gap-2 transition text-xs sm:text-sm min-h-[44px] ${
              isSelected
                ? opt.fullActiveClass
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'
            } ${isDisabled ? 'cursor-not-allowed opacity-75' : ''}`}
          >
            {isCurrentLoading(opt.status) ? (
              <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden={true} />
            ) : (
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" aria-hidden={true} />
            )}
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
