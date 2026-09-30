import React from 'react';
import type { EventParticipation } from '../../../models/Event';
import { Check, X, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export interface EventParticipationButtonsProps {
  currentParticipation?: EventParticipation;
  onSelect: (participation: EventParticipation) => Promise<void> | void;
  disabled?: boolean;
  isLoading?: boolean;
  pendingStatus?: EventParticipation | null;
  variant?: 'compact' | 'card' | 'full';
  className?: string;
}

export const EventParticipationButtons: React.FC<EventParticipationButtonsProps> = ({
  currentParticipation,
  onSelect,
  disabled = false,
  isLoading = false,
  pendingStatus = null,
  variant = 'compact',
  className = '',
}) => {
  const handleClick = (e: React.MouseEvent, status: EventParticipation) => {
    e.stopPropagation();
    if (disabled || isLoading) return;
    onSelect(status);
  };

  const isParticipating = currentParticipation === 'participating';
  const isNotParticipating = currentParticipation === 'not_participating';

  const isCurrentLoading = (status: EventParticipation) => {
    return isLoading && pendingStatus === status;
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <button
          type="button"
          disabled={disabled || isLoading}
          onClick={(e) => handleClick(e, 'participating')}
          aria-pressed={isParticipating}
          title={isParticipating ? 'Tu participes déjà' : 'Je participe'}
          className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 border min-h-[32px] ${
            isParticipating
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-300 border-slate-700'
          } ${disabled || isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isCurrentLoading('participating') ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          <span className="text-xs hidden lg:inline">Présent</span>
        </button>

        <button
          type="button"
          disabled={disabled || isLoading}
          onClick={(e) => handleClick(e, 'not_participating')}
          aria-pressed={isNotParticipating}
          title={isNotParticipating ? 'Tu es noté indisponible' : 'Pas disponible'}
          className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 border min-h-[32px] ${
            isNotParticipating
              ? 'bg-red-500/20 text-red-300 border-red-500/40 shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:bg-red-500/10 hover:text-red-300 border-slate-700'
          } ${disabled || isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isCurrentLoading('not_participating') ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          <span className="text-xs hidden lg:inline">Pas dispo</span>
        </button>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          type="button"
          disabled={disabled || isLoading}
          onClick={(e) => handleClick(e, 'participating')}
          aria-pressed={isParticipating}
          title={isParticipating ? 'Tu participes déjà' : 'Je participe'}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1.5 border min-h-[38px] ${
            isParticipating
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white border-transparent'
          } ${disabled || isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isCurrentLoading('participating') ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <Check className="w-4 h-4" aria-hidden="true" />
          )}
          <span>Je participe</span>
        </button>

        <button
          type="button"
          disabled={disabled || isLoading}
          onClick={(e) => handleClick(e, 'not_participating')}
          aria-pressed={isNotParticipating}
          title={isNotParticipating ? 'Tu es noté indisponible' : 'Pas disponible'}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1.5 border min-h-[38px] ${
            isNotParticipating
              ? 'bg-red-500/20 text-red-400 border-red-500/30'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white border-transparent'
          } ${disabled || isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isCurrentLoading('not_participating') ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <X className="w-4 h-4" aria-hidden="true" />
          )}
          <span>Pas dispo</span>
        </button>
      </div>
    );
  }

  // variant === 'full' (page détail / UserAvailabilityForm)
  return (
    <div className={`flex gap-3 sm:gap-4 ${className}`}>
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={(e) => handleClick(e, 'participating')}
        aria-pressed={isParticipating}
        className={`flex-1 py-3 px-3 rounded-xl font-medium border flex items-center justify-center gap-2 transition text-xs sm:text-sm min-h-[44px] ${
          isParticipating
            ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-600/20'
            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'
        } ${disabled || isLoading ? 'cursor-not-allowed opacity-75' : ''}`}
      >
        {isCurrentLoading('participating') ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
        ) : (
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" aria-hidden="true" />
        )}
        <span>Je participe</span>
      </button>

      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={(e) => handleClick(e, 'not_participating')}
        aria-pressed={isNotParticipating}
        className={`flex-1 py-3 px-3 rounded-xl font-medium border flex items-center justify-center gap-2 transition text-xs sm:text-sm min-h-[44px] ${
          isNotParticipating
            ? 'bg-red-500/20 border-red-500 text-red-400'
            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'
        } ${disabled || isLoading ? 'cursor-not-allowed opacity-75' : ''}`}
      >
        {isCurrentLoading('not_participating') ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
        ) : (
          <XCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" aria-hidden="true" />
        )}
        <span>Pas dispo</span>
      </button>
    </div>
  );
};
