import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle, HelpCircle, XCircle, ArrowRight, Calendar, Users } from 'lucide-react';
import type { Event } from '../../../models/Event';
import type { AvailabilityStatus, GroupPlanning } from '../../../models/Group';
import { formatDateLongFr } from '../../../utils/dateUtils';
import { getCategoryTheme } from '../../../utils/categoryTheme';
import { getEventConsensus } from '../../../utils/calendarEventUtils';

interface DayEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  events: Event[];
  groupId: string;
  userAvailability?: AvailabilityStatus;
  onUpdateAvailability?: (dateStr: string, status: AvailabilityStatus) => void;
  plannings?: GroupPlanning[];
  totalMembers?: number;
  isPast?: boolean;
}

export const DayEventsModal: React.FC<DayEventsModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  events,
  groupId,
  userAvailability = 'unavailable',
  onUpdateAvailability,
  plannings = [],
  totalMembers = 0,
  isPast = false,
}) => {
  const navigate = useNavigate();

  // Gestion de la touche Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formattedDate = formatDateLongFr(dateStr);

  const handleSelectAvailability = (status: AvailabilityStatus) => {
    if (isPast) return;
    onUpdateAvailability?.(dateStr, status);
  };

  const handleGoToEvent = (eventId: string) => {
    onClose();
    navigate(`/groups/${groupId}/events/${eventId}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="day-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-primary-400" />
            </div>
            <div className="min-w-0">
              <h3 id="day-modal-title" className="text-base sm:text-lg font-bold text-white capitalize truncate">
                {formattedDate}
              </h3>
              <p className="text-xs text-slate-400">
                {events.length} sortie{events.length > 1 ? 's' : ''} au planning
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {/* Saisie rapide de disponibilité */}
          {!isPast && (
            <div className="bg-slate-800/50 border border-slate-700/60 p-3.5 rounded-xl space-y-2">
              <span className="text-xs font-semibold text-slate-300">
                Ta disponibilité pour ce jour :
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectAvailability('available')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold border transition ${
                    userAvailability === 'available'
                      ? 'bg-emerald-500/25 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/40'
                      : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Dispo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectAvailability('maybe')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold border transition ${
                    userAvailability === 'maybe'
                      ? 'bg-amber-500/25 border-amber-500 text-amber-300 ring-1 ring-amber-500/40'
                      : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>À confirmer</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectAvailability('unavailable')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold border transition ${
                    userAvailability === 'unavailable'
                      ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 ring-1 ring-rose-500/40'
                      : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>Indispo</span>
                </button>
              </div>
            </div>
          )}

          {/* Liste des événements du jour */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Sorties prévues ({events.length})
            </h4>

            {events.length === 0 ? (
              <p className="text-sm text-slate-500 italic py-4 text-center">
                Aucune sortie prévue pour ce jour.
              </p>
            ) : (
              <div className="space-y-2.5">
                {events.map((event) => {
                  const theme = getCategoryTheme(event.category);
                  const consensus = getEventConsensus(dateStr, plannings, totalMembers);

                  return (
                    <div
                      key={event.id}
                      onClick={() => handleGoToEvent(event.id)}
                      className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl hover:border-slate-700 hover:bg-slate-800/70 transition flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${theme.badgeClasses}`}>
                            {event.category}
                          </span>
                          {event.state === 'planifie' ? (
                            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                              Validé
                            </span>
                          ) : event.state === 'passe' ? (
                            <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                              Passé
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                              En sondage
                            </span>
                          )}
                        </div>
                        <h5 className="font-semibold text-sm text-white truncate group-hover:text-primary-300 transition">
                          {event.title}
                        </h5>
                        {event.state === 'sondage' && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            <span>{consensus.text}</span>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGoToEvent(event.id);
                        }}
                        className="p-2 rounded-lg bg-slate-700/60 hover:bg-primary-600 text-slate-300 hover:text-white transition shrink-0"
                        title="Ouvrir le détail de l'événement"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
