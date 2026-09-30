import type { EventParticipation } from '../models/Event';
import type { GroupPlanning } from '../models/Group';
import { eventService } from './implementations/FirestoreEventService';
import { groupService } from './implementations/FirestoreGroupService';

export interface ProcessParticipationParams {
  groupId: string;
  eventId: string;
  userId: string;
  participation: EventParticipation;
  plannings?: GroupPlanning[];
  updateParticipationFn?: (eventId: string, userId: string, participation: EventParticipation) => Promise<void>;
  updatePlanningFn?: (groupId: string, userId: string, dates: Record<string, import('../models/Group').AvailabilityStatus>) => Promise<void>;
}

export interface ProcessParticipationResult {
  success: boolean;
  initializedPlanning: boolean;
  hasFilledPlanning: boolean;
  error?: string;
}

/**
 * Vérifie si l'utilisateur possède un planning non vide dans le groupe.
 */
export function isUserPlanningCompleted(plannings: GroupPlanning[] = [], userId?: string): boolean {
  if (!userId) return false;
  const userPlanning = plannings.find((p) => p.userId === userId);
  const dates = userPlanning?.dates ?? {};
  return Object.keys(dates).length > 0;
}

/**
 * Traite la saisie de disponibilité de manière unifiée pour la liste et le détail :
 * 1. Initialise le planning à la volée si le calendrier de l'utilisateur est vierge.
 * 2. Enregistre la participation (disponibilité) sur l'événement sans bloquer.
 */
export async function processEventParticipation({
  groupId,
  eventId,
  userId,
  participation,
  plannings = [],
  updateParticipationFn = (eId, uId, part) => eventService.updateParticipation(eId, uId, part),
  updatePlanningFn = (gId, uId, dates) => groupService.updateGroupPlanning(gId, uId, dates),
}: ProcessParticipationParams): Promise<ProcessParticipationResult> {
  const userPlanning = plannings.find((p) => p.userId === userId);
  const dates = userPlanning?.dates ?? {};
  const hasFilledPlanning = Object.keys(dates).length > 0;
  let initializedPlanning = false;

  // Si l'utilisateur n'a aucune entrée de planning dans le groupe, initialisation à la volée d'un calendrier vide
  if (!userPlanning && updatePlanningFn) {
    await updatePlanningFn(groupId, userId, {});
    initializedPlanning = true;
  }

  // Enregistrement systématique de la participation sur l'événement
  await updateParticipationFn(eventId, userId, participation);

  return {
    success: true,
    initializedPlanning,
    hasFilledPlanning,
  };
}
