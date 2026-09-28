import React, { useState, useEffect } from 'react';
import type { TimeSlot, EventAvailability } from '../../../models/Event';
import { CheckCircle, XCircle, Lock, Loader2, AlertTriangle } from 'lucide-react';
import { MonthCalendarPicker } from './MonthCalendarPicker';
import { TimeSlotSelector } from './TimeSlotSelector';
import { Toast } from '../../ui/Toast';

interface UserAvailabilityFormProps {
  isLocked: boolean;
  currentUserResponse: EventAvailability | null;
  onSave: (availability: Omit<EventAvailability, 'userId' | 'updatedAt' | 'userName'>) => Promise<void>;
}

export const UserAvailabilityForm: React.FC<UserAvailabilityFormProps> = ({
  isLocked,
  currentUserResponse,
  onSave,
}) => {
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [selectedDatesMap, setSelectedDatesMap] = useState<Record<string, TimeSlot[]>>({});
  const [hasInitialized, setHasInitialized] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (currentUserResponse && !hasInitialized) {
      setIsAvailable(currentUserResponse.isAvailable);
      const newMap: Record<string, TimeSlot[]> = {};
      currentUserResponse.availableDates.forEach((d) => {
        newMap[d.date] = d.timeSlots;
      });
      setSelectedDatesMap(newMap);
      setHasInitialized(true);
    }
  }, [currentUserResponse, hasInitialized]);

  const toggleDate = (dateStr: string) => {
    if (isLocked || isSaving) return;
    setSelectedDatesMap((prev) => {
      const newMap = { ...prev };
      if (newMap[dateStr]) {
        delete newMap[dateStr];
      } else {
        newMap[dateStr] = ['Toute la journée'];
      }
      return newMap;
    });
  };

  const toggleTimeSlot = (dateStr: string, ts: TimeSlot) => {
    if (isLocked || isSaving) return;
    setSelectedDatesMap((prev) => {
      const currentSlots = prev[dateStr] || [];
      let newSlots: TimeSlot[];
      if (ts === 'Toute la journée') {
        newSlots = ['Toute la journée'];
      } else {
        newSlots = currentSlots.includes(ts)
          ? currentSlots.filter((t) => t !== ts)
          : [...currentSlots.filter((t) => t !== 'Toute la journée'), ts];
      }
      if (newSlots.length === 0) newSlots = ['Toute la journée'];
      return { ...prev, [dateStr]: newSlots };
    });
  };

  const handleSubmit = async () => {
    if (isLocked || isSaving) return;

    setSaveError(null);
    setIsSaving(true);

    try {
      const availableDates = Object.keys(selectedDatesMap).map((dateStr) => ({
        date: dateStr,
        timeSlots: selectedDatesMap[dateStr],
      }));

      const availability: Omit<EventAvailability, 'userId' | 'updatedAt' | 'userName'> = {
        isAvailable,
        availableDates: isAvailable ? availableDates : [],
      };

      await onSave(availability);
      setShowToast(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Impossible d’enregistrer vos disponibilités.';
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-slate-800/40 border border-slate-800 p-4 sm:p-6 rounded-2xl space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-bold mb-1 text-white">Tes disponibilités</h2>
        <p className="text-xs sm:text-sm text-slate-400">
          {isLocked
            ? 'Le sondage est clôturé.'
            : 'Indique si tu seras présent et choisis tes jours.'}
        </p>
      </div>

      {isLocked && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl text-amber-300 text-xs font-medium flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
          <span>Ce sondage est clôturé et verrouillé. Les réponses ne peuvent plus être modifiées.</span>
        </div>
      )}

      {/* Erreur de sauvegarde */}
      {saveError && (
        <div
          role="alert"
          className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-xl text-red-400 text-xs sm:text-sm font-medium flex items-start gap-2.5"
        >
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <p>{saveError}</p>
          </div>
          <button
            type="button"
            onClick={() => setSaveError(null)}
            className="text-red-400 hover:text-red-300 transition"
            aria-label="Fermer le message d'erreur"
          >
            ✕
          </button>
        </div>
      )}

      <div className="space-y-6">
        {/* Choix Global Présent / Absent */}
        <div className="flex gap-3 sm:gap-4">
          <button
            type="button"
            disabled={isLocked || isSaving}
            onClick={() => setIsAvailable(true)}
            aria-pressed={isAvailable}
            className={`flex-1 py-3 px-3 rounded-xl font-medium border flex items-center justify-center gap-2 transition text-xs sm:text-sm min-h-[44px] ${
              isAvailable
                ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-600/20'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
            } ${isLocked || isSaving ? 'cursor-not-allowed opacity-75' : ''}`}
          >
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" aria-hidden="true" />
            <span>Disponible</span>
          </button>
          <button
            type="button"
            disabled={isLocked || isSaving}
            onClick={() => setIsAvailable(false)}
            aria-pressed={!isAvailable}
            className={`flex-1 py-3 px-3 rounded-xl font-medium border flex items-center justify-center gap-2 transition text-xs sm:text-sm min-h-[44px] ${
              !isAvailable
                ? 'bg-red-500/20 border-red-500 text-red-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
            } ${isLocked || isSaving ? 'cursor-not-allowed opacity-75' : ''}`}
          >
            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" aria-hidden="true" />
            <span>Pas dispo</span>
          </button>
        </div>

        {/* Sélection des dates et créneaux si disponible */}
        {isAvailable && (
          <div className="space-y-6 pt-2">
            <MonthCalendarPicker
              selectedDates={Object.keys(selectedDatesMap)}
              onToggleDate={toggleDate}
            />

            <TimeSlotSelector
              selectedDatesMap={selectedDatesMap}
              onToggleTimeSlot={toggleTimeSlot}
            />
          </div>
        )}

        {/* Bouton de validation avec état de chargement */}
        {!isLocked && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            aria-busy={isSaving}
            className={`w-full font-medium py-3 px-4 rounded-xl shadow-lg transition mt-4 flex items-center justify-center gap-2 min-h-[48px] text-sm sm:text-base ${
              isSaving
                ? 'bg-primary-700 text-primary-200 cursor-wait'
                : 'bg-primary-600 hover:bg-primary-500 text-white shadow-primary-600/20'
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin shrink-0" aria-hidden="true" />
                <span>Enregistrement en cours...</span>
              </>
            ) : (
              <span>{currentUserResponse ? 'Mettre à jour ma réponse' : 'Valider ma réponse'}</span>
            )}
          </button>
        )}
      </div>

      {/* Pop-up Toast flottant de confirmation (se supprime tout seul après quelques secondes) */}
      <Toast
        isOpen={showToast}
        onClose={() => setShowToast(false)}
        message="Vos disponibilités ont bien été mises à jour ✓"
        variant="success"
        duration={3500}
      />
    </div>
  );
};
