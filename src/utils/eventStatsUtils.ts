import type { Event, EventCategory, EventState } from "../models/Event";

/** Répartition des événements par statut */
export interface EventStateStats {
  sondage: number;
  planifie: number;
  passe: number;
}

/** Répartition des événements par catégorie */
export type EventCategoryStats = Record<EventCategory, number>;

/** Membre actif avec son score de participation */
export interface ActiveMember {
  userId: string;
  displayName: string;
  eventsCreated: number;
  availabilityResponses: number;
}

/** Objet complet des statistiques du groupe */
export interface GroupEventStats {
  totalEvents: number;
  byState: EventStateStats;
  byCategory: EventCategoryStats;
  activeMembers: ActiveMember[];
}

const ALL_CATEGORIES: EventCategory[] = [
  'Restaurant',
  'Jeux de rôle',
  'Soirée',
  'Repas',
  'Sport',
  'Gaming',
  'Autres',
];

/** Calcule les statistiques des événements d'un groupe.
 *  Fonction pure : ne dépend d'aucun service ni état global.
 */
export function computeGroupEventStats(
  events: Event[],
  memberNamesMap: Record<string, string>
): GroupEventStats {
  const totalEvents = events.length;

  // Répartition par état
  const byState: EventStateStats = { sondage: 0, planifie: 0, passe: 0 };
  for (const event of events) {
    const state = event.state as EventState;
    byState[state] = (byState[state] ?? 0) + 1;
  }

  // Répartition par catégorie — initialisation à 0 pour toutes les catégories
  const byCategory = ALL_CATEGORIES.reduce<EventCategoryStats>((acc, cat) => {
    acc[cat] = 0;
    return acc;
  }, {} as EventCategoryStats);

  for (const event of events) {
    byCategory[event.category] = (byCategory[event.category] ?? 0) + 1;
  }

  // Agrégation des membres actifs
  const memberMap = new Map<string, { eventsCreated: number; availabilityResponses: number; displayName: string }>();

  const getOrCreateMember = (userId: string, displayName: string) => {
    if (!memberMap.has(userId)) {
      memberMap.set(userId, { eventsCreated: 0, availabilityResponses: 0, displayName });
    }
    return memberMap.get(userId)!;
  };

  for (const event of events) {
    const creatorName =
      memberNamesMap[event.createdBy] ?? event.createdByName ?? "Membre inconnu";
    const creator = getOrCreateMember(event.createdBy, creatorName);
    creator.eventsCreated += 1;

    if (event.participations) {
      for (const [uid, _] of Object.entries(event.participations)) {
        const name = memberNamesMap[uid] ?? "Membre inconnu";
        const member = getOrCreateMember(uid, name);
        member.availabilityResponses += 1;
      }
    }
  }

  const activeMembers: ActiveMember[] = Array.from(memberMap.entries())
    .map(([userId, data]) => ({
      userId,
      displayName: data.displayName,
      eventsCreated: data.eventsCreated,
      availabilityResponses: data.availabilityResponses,
    }))
    .sort((a, b) => b.eventsCreated - a.eventsCreated || b.availabilityResponses - a.availabilityResponses);

  return { totalEvents, byState, byCategory, activeMembers };
}

/** Calcule l'URL d'invitation à partir du code d'invitation */
export function buildInviteUrl(inviteCode: string): string {
  return `${window.location.origin}/join/${inviteCode}`;
}
