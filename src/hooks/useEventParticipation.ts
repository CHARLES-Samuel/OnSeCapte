import { useState, useCallback } from 'react';
import type { EventParticipation } from '../models/Event';
import type { GroupPlanning } from '../models/Group';
import { useAuth } from './useAuth';
import {
  processEventParticipation,
  type ProcessParticipationResult,
} from '../services/eventParticipationService';

interface UseEventParticipationOptions {
  groupId?: string;
  plannings?: GroupPlanning[];
  onSuccess?: (eventId: string, participation: EventParticipation) => void;
}

export function useEventParticipation({
  groupId,
  plannings = [],
  onSuccess,
}: UseEventParticipationOptions) {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toastConfig, setToastConfig] = useState<{
    isOpen: boolean;
    message: string;
    variant: 'success' | 'error' | 'info';
  }>({
    isOpen: false,
    message: '',
    variant: 'success',
  });

  const closeToast = useCallback(() => {
    setToastConfig((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const submitParticipation = useCallback(
    async (
      eventId: string,
      participation: EventParticipation
    ): Promise<ProcessParticipationResult | null> => {
      if (!user || !groupId) return null;

      setIsSaving(true);
      setSaveError(null);

      try {
        const result = await processEventParticipation({
          groupId,
          eventId,
          userId: user.uid,
          participation,
          plannings,
        });

        if (participation === 'not_participating') {
          setToastConfig({
            isOpen: true,
            message: 'Votre indisponibilité a été prise en compte.',
            variant: 'success',
          });
        } else if (!result.hasFilledPlanning) {
          setToastConfig({
            isOpen: true,
            message: 'Participation enregistrée ! Pensez à renseigner votre planning.',
            variant: 'info',
          });
        } else {
          setToastConfig({
            isOpen: true,
            message: 'Votre participation a bien été enregistrée ✓',
            variant: 'success',
          });
        }

        onSuccess?.(eventId, participation);
        return result;
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Impossible d’enregistrer votre disponibilité.';
        setSaveError(msg);
        setToastConfig({
          isOpen: true,
          message: msg,
          variant: 'error',
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [user, groupId, plannings, onSuccess]
  );

  return {
    isSaving,
    saveError,
    toastConfig,
    closeToast,
    submitParticipation,
  };
}
