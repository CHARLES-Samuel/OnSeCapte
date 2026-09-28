import React, { useState, useEffect } from 'react';
import type { EventParticipation } from '../../../models/Event';
import { CheckCircle, XCircle, Loader2, AlertTriangle, CalendarDays, Info } from 'lucide-react';
import { Toast } from '../../ui/Toast';
import { useNavigate } from 'react-router-dom';

interface UserAvailabilityFormProps {
  isLocked: boolean;
  currentUserResponse: EventParticipation;
  onSave: (participation: EventParticipation) => Promise<void>;
  hasCompletedPlanning: boolean;
  groupId: string;
}

export const UserAvailabilityForm: React.FC<UserAvailabilityFormProps> = ({
  isLocked,
  currentUserResponse,
  onSave,
  hasCompletedPlanning,
  groupId,
}) => {
  const navigate = useNavigate();
  const [participation, setParticipation] = useState<EventParticipation>(currentUserResponse);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Votre réponse a été enregistrée ✓');

  useEffect(() => {
    setParticipation(currentUserResponse);
  }, [currentUserResponse]);

  const handleSubmit = async (newParticipation: EventParticipation) => {
    if (isSaving) return;

    setParticipation(newParticipation);
    setSaveError(null);
    setIsSaving(true);

    try {
      await onSave(newParticipation);
      setToastMessage(
        newParticipation === 'not_participating'
          ? 'Votre indisponibilité a été prise en compte.'
          : 'Votre participation a bien été enregistrée ✓'
      );
      setShowToast(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Impossible d’enregistrer votre réponse.';
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-slate-800/40 border border-slate-800 p-4 sm:p-6 rounded-2xl space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-bold mb-1 text-white">Ta participation</h2>
        <p className="text-xs sm:text-sm text-slate-400">
          {isLocked
            ? "La date est fixée. En cas d'imprévu, tu peux modifier ta présence ci-dessous."
            : 'Indique simplement si tu participes. Les dates sont calculées avec ton planning !'}
        </p>
      </div>

      {isLocked && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 border ${
            participation === 'not_participating'
              ? 'bg-red-500/10 border-red-500/30 text-red-300'
              : participation === 'participating'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}
        >
          {participation === 'not_participating' ? (
            <>
              <XCircle className="w-4 h-4 text-red-400 shrink-0" aria-hidden="true" />
              <span>Tu es actuellement noté(e) comme indisponible pour cet événement.</span>
            </>
          ) : participation === 'participating' ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <span>Tu es inscrit(e) à cet événement. Un imprévu ? Clique sur "Pas dispo".</span>
            </>
          ) : (
            <>
              <Info className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
              <span>La date est arrêtée. Indique si tu seras présent(e) ou indisponible.</span>
            </>
          )}
        </div>
      )}

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
          >
            ✕
          </button>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex gap-3 sm:gap-4">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSubmit('participating')}
            aria-pressed={participation === 'participating'}
            className={`flex-1 py-3 px-3 rounded-xl font-medium border flex items-center justify-center gap-2 transition text-xs sm:text-sm min-h-[44px] ${
              participation === 'participating'
                ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-600/20'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
            } ${isSaving ? 'cursor-not-allowed opacity-75' : ''}`}
          >
            {isSaving && participation === 'participating' ? (
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            )}
            <span>Je participe</span>
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSubmit('not_participating')}
            aria-pressed={participation === 'not_participating'}
            className={`flex-1 py-3 px-3 rounded-xl font-medium border flex items-center justify-center gap-2 transition text-xs sm:text-sm min-h-[44px] ${
              participation === 'not_participating'
                ? 'bg-red-500/20 border-red-500 text-red-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
            } ${isSaving ? 'cursor-not-allowed opacity-75' : ''}`}
          >
            {isSaving && participation === 'not_participating' ? (
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            )}
            <span>Pas dispo</span>
          </button>
        </div>

        {!isLocked && participation === 'participating' && !hasCompletedPlanning && (
          <div className="bg-primary-500/10 border border-primary-500/30 p-4 rounded-xl text-primary-300 text-sm font-medium flex flex-col items-center text-center gap-3">
            <CalendarDays className="w-8 h-8 text-primary-400" />
            <p>Indique tes disponibilités dans le planning du groupe en 10 secondes pour calculer les meilleures dates !</p>
            <button
              onClick={() => {
                navigate(`/groups/${groupId}?tab=planning`); 
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg shadow-sm hover:bg-primary-500 transition w-full"
            >
              Aller au planning du groupe
            </button>
          </div>
        )}
      </div>

      <Toast
        isOpen={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        variant="success"
        duration={3500}
      />
    </div>
  );
};
