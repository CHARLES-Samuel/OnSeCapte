import type { Event, EventParticipation } from '../models/Event';

export interface EventParticipationStats {
  participatingCount: number;
  notParticipatingCount: number;
  pendingCount: number;
  totalResponses: number;
}

/**
 * Calcule les statistiques de participation pour un événement donné.
 */
export const getEventParticipationStats = (event: Event): EventParticipationStats => {
  const participations = event.participations || {};
  let participatingCount = 0;
  let notParticipatingCount = 0;
  let pendingCount = 0;

  Object.values(participations).forEach((status) => {
    if (status === 'participating') participatingCount++;
    else if (status === 'not_participating') notParticipatingCount++;
    else if (status === 'pending') pendingCount++;
  });

  return {
    participatingCount,
    notParticipatingCount,
    pendingCount,
    totalResponses: participatingCount + notParticipatingCount + pendingCount,
  };
};

/**
 * Récupère le statut de participation de l'utilisateur actuel pour un événement.
 */
export const getUserParticipation = (
  event: Event,
  userId?: string
): EventParticipation | undefined => {
  if (!userId || !event.participations) return undefined;
  return event.participations[userId];
};
