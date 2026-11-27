import type { Event } from '../models/Event';

/**
 * Map par date ('YYYY-MM-DD') associant chaque userId occupé
 * à la liste des titres d'événements confirmés ou à date fixe auxquels il participe.
 */
export type BusyMembersByDateMap = Map<string, Map<string, string[]>>;

/**
 * Détermine si un événement possède une date arrêtée (créé à date fixe ou confirmé/verrouillé).
 */
export function isEventConfirmedOrFixed(event: Event): boolean {
  if (!event.finalDate) {
    return false;
  }
  if (event.dateMode === 'fixed') {
    return true;
  }
  return event.state === 'planifie' || event.state === 'passe';
}

/**
 * Construit un index par date ('YYYY-MM-DD') des membres qui participent déjà
 * à au moins un autre événement confirmé ou à date fixe sur cette journée.
 */
export function buildBusyMembersByDate(
  events: readonly Event[] = [],
  excludeEventId?: string
): BusyMembersByDateMap {
  const busyByDate: BusyMembersByDateMap = new Map();

  events.forEach((evt) => {
    if (excludeEventId && evt.id === excludeEventId) {
      return;
    }
    if (!isEventConfirmedOrFixed(evt) || !evt.finalDate || !evt.participations) {
      return;
    }

    const dateStr = evt.finalDate;
    Object.entries(evt.participations).forEach(([userId, status]) => {
      if (status !== 'participating') {
        return;
      }

      let dateUsersMap = busyByDate.get(dateStr);
      if (!dateUsersMap) {
        dateUsersMap = new Map<string, string[]>();
        busyByDate.set(dateStr, dateUsersMap);
      }

      const titles = dateUsersMap.get(userId) ?? [];
      if (!titles.includes(evt.title)) {
        titles.push(evt.title);
      }
      dateUsersMap.set(userId, titles);
    });
  });

  return busyByDate;
}

/**
 * Extrait un dictionnaire sérialisable { [userId]: string[] } des motifs d'occupation
 * pour les membres du groupe sur une date donnée, ou undefined s'il n'y a aucun conflit.
 */
export function extractBusyReasonsForMembers(
  busyOnDate: ReadonlyMap<string, string[]> | undefined,
  memberIds: readonly string[]
): Record<string, string[]> | undefined {
  if (!busyOnDate || busyOnDate.size === 0) {
    return undefined;
  }

  const reasons: Record<string, string[]> = {};
  let hasAny = false;

  memberIds.forEach((uid) => {
    const titles = busyOnDate.get(uid);
    if (titles && titles.length > 0) {
      reasons[uid] = titles;
      hasAny = true;
    }
  });

  return hasAny ? reasons : undefined;
}

