import React, { useState, useEffect } from 'react';
import type { TimeSlot, EventAvailability, EventState } from '../../../models/Event';
import { CheckCircle, XCircle, Users, Lock, Unlock, Award } from 'lucide-react';

interface EventSynthesisProps {
  respondedMembers: number;
  totalMembers: number;
  bestDates: { date: string; timeSlot: TimeSlot; count: number }[];
  availabilities: Record<string, EventAvailability>;
  memberProfiles?: Record<string, string>;
  currentUserId?: string;
  canLock: boolean;
  eventState?: EventState;
  onLock: (date: string, timeSlot: TimeSlot) => Promise<void>;
  onUnlock?: () => Promise<void> | void;
}

const formatDateShort = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
};

const formatDateLong = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
};

export const EventSynthesis: React.FC<EventSynthesisProps> = ({
  respondedMembers,
  totalMembers,
  bestDates,
  availabilities,
  memberProfiles = {},
  currentUserId,
  canLock,
  eventState = 'sondage',
  onLock,
  onUnlock,
}) => {
  const memberList = Object.values(availabilities);
  const top3Dates = bestDates.slice(0, 3);

  const [selectedTopIndex, setSelectedTopIndex] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedTopIndex >= top3Dates.length) {
      setSelectedTopIndex(0);
    }
  }, [top3Dates.length, selectedTopIndex]);

  const handleConfirmLock = async () => {
    if (top3Dates.length === 0 || !top3Dates[selectedTopIndex]) return;
    setIsSubmitting(true);
    try {
      const selected = top3Dates[selectedTopIndex];
      await onLock(selected.date, selected.timeSlot);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLocked = eventState === 'planifie';

  return (
    <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl space-y-8 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold mb-1 text-white">Synthèse</h2>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-slate-400">Progression des votes</span>
            <span
              className={`font-bold ${
                respondedMembers === totalMembers ? 'text-emerald-400' : 'text-primary-400'
              }`}
            >
              {respondedMembers} / {totalMembers} membres
            </span>
          </div>
          <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out ${
                respondedMembers === totalMembers ? 'bg-emerald-500' : 'bg-primary-500'
              }`}
              style={{
                width: `${(respondedMembers / Math.max(totalMembers, 1)) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Top 3 Best Dates */}
        <div className="mt-8">
          <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" /> Meilleures dates (Top 3)
          </h3>
          {top3Dates.length > 0 ? (
            <div className="space-y-3">
              {top3Dates.map((bd, i) => {
                const isSelectedForLock = canLock && !isLocked && selectedTopIndex === i;
                return (
                  <div
                    key={`${bd.date}-${bd.timeSlot}`}
                    onClick={() => canLock && !isLocked && setSelectedTopIndex(i)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      canLock && !isLocked ? 'cursor-pointer' : ''
                    } ${
                      isSelectedForLock
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-slate-900 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          i === 0
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : i === 1
                            ? 'bg-slate-300/10 text-slate-300 border border-slate-400/30'
                            : 'bg-amber-700/10 text-amber-600 border border-amber-700/30'
                        }`}
                      >
                        #{i + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200 capitalize">
                          {formatDateShort(bd.date)}
                        </div>
                        <div className="text-xs text-slate-400">{bd.timeSlot}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 text-xs sm:text-sm">
                        {bd.count} dispo(s)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 bg-slate-900/50 rounded-xl border border-slate-800 text-slate-500 text-sm">
              Pas encore de dates communes
            </div>
          )}
        </div>

        {/* Members responses */}
        <div className="mt-8">
          <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" /> Réponses des membres
          </h3>
          {memberList.length > 0 ? (
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2 scrollbar-none">
              {memberList.map((avail) => (
                <div
                  key={avail.userId}
                  className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800 text-sm"
                >
                  <span className="font-medium text-slate-300">
                    {memberProfiles[avail.userId] || avail.userName || 'Un membre'} {avail.userId === currentUserId && '(Moi)'}
                  </span>
                  {avail.isAvailable ? (
                    <span className="text-emerald-400 flex items-center gap-1 text-xs font-medium">
                      <CheckCircle className="w-3 h-3" /> Dispo ({avail.availableDates.length} j.)
                    </span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-1 text-xs font-medium">
                      <XCircle className="w-3 h-3" /> Pas dispo
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 bg-slate-900/50 rounded-xl border border-slate-800 text-slate-500 text-xs">
              Aucune réponse pour le moment
            </div>
          )}
        </div>
      </div>

      {/* Lock Status or Action */}
      {isLocked ? (
        <div className="mt-8 pt-6 border-t border-slate-700/50 space-y-3">
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl text-center text-xs text-emerald-300 font-medium flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> Événement verrouillé
          </div>
          {canLock && onUnlock && (
            <button
              type="button"
              onClick={onUnlock}
              className="w-full py-2.5 px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl transition text-xs font-semibold flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4 text-amber-400" />
              <span>Rouvrir le sondage (Imprévu)</span>
            </button>
          )}
        </div>
      ) : (
        canLock && (
          <div className="mt-8 pt-6 border-t border-slate-700/50 space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                Verrouiller la date définitive
              </h3>
            </div>

            {top3Dates.length > 0 ? (
              <div className="space-y-3">
                <label className="block text-xs text-slate-400">
                  Sélectionne l'une des 3 meilleures options du sondage :
                </label>

                <select
                  value={selectedTopIndex}
                  onChange={(e) => setSelectedTopIndex(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700/80 hover:border-amber-500/50 rounded-xl px-4 py-3 text-sm text-slate-100 font-medium outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition shadow-sm cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23f59e0b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-10 capitalize"
                >
                  {top3Dates.map((item, idx) => (
                    <option key={`${item.date}-${item.timeSlot}`} value={idx} className="bg-slate-900 text-slate-100 py-2">
                      #{idx + 1} • {formatDateLong(item.date)} ({item.timeSlot}) — {item.count} vote(s)
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleConfirmLock}
                  disabled={isSubmitting}
                  className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition shadow-lg shadow-amber-600/20"
                >
                  {isSubmitting
                    ? 'Verrouillage en cours...'
                    : `Valider l'option #${selectedTopIndex + 1}`}
                </button>
              </div>
            ) : (
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-400 text-center">
                Attends que les membres votent pour débloquer le choix parmi les meilleures dates.
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};
