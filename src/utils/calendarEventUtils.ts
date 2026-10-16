import type { Event } from '../models/Event';
import type { GroupPlanning } from '../models/Group';
import { getDateRangeDays, isDatePast, formatDateLongFr } from './dateUtils';

/**
 * Retourne la liste dédoublée et ordonnée de toutes les dates (YYYY-MM-DD) associées à un événement.
 * - Si validé ou passé avec finalDate : date unique fixée (ou dates multiples confirmées).
 * - Si en sondage : dates candidates (dates arbitraires, ou plage de dates startDate..endDate, ou finalDate).
 * Garantit qu'un événement avec N dates produit exactement N jours dans le calendrier.
 */
export const getEventDates = (event: Event): string[] => {
  const resultDates = new Set<string>();

  if (event.state === 'planifie' || event.state === 'passe') {
    if (event.finalDate) {
      resultDates.add(event.finalDate);
    } else if (event.dates && event.dates.length > 0) {
      event.dates.forEach((d) => d && resultDates.add(d));
    } else if (event.startDate && event.endDate) {
      const days = getDateRangeDays(event.startDate, event.endDate);
      days.forEach((d) => resultDates.add(d));
    }
  } else {
    // Événement en sondage
    if (event.dates && event.dates.length > 0) {
      event.dates.forEach((d) => d && resultDates.add(d));
    } else if (event.dateMode === 'range' && event.startDate && event.endDate) {
      const days = getDateRangeDays(event.startDate, event.endDate);
      days.forEach((d) => resultDates.add(d));
    } else if (event.finalDate) {
      resultDates.add(event.finalDate);
    }
  }

  return Array.from(resultDates).sort();
};

export interface GroupEventsOptions {
  hidePast?: boolean;
}

/**
 * Regroupe les événements par date au format 'YYYY-MM-DD'.
 */
export const groupEventsByDate = (
  events: Event[],
  options: GroupEventsOptions = {}
): Map<string, Event[]> => {
  const map = new Map<string, Event[]>();

  events.forEach((event) => {
    const dates = getEventDates(event);

    dates.forEach((dateStr) => {
      if (options.hidePast && isDatePast(dateStr)) {
        return;
      }

      const list = map.get(dateStr) ?? [];
      list.push(event);
      map.set(dateStr, list);
    });
  });

  return map;
};

export interface EventConsensusInfo {
  availableCount: number;
  totalMembers: number;
  ratio: number;
  text: string;
  shortText: string;
}

/**
 * Calcule le consensus de disponibilité des membres sur une date donnée.
 */
export const getEventConsensus = (
  dateStr: string,
  plannings: GroupPlanning[],
  totalMembers: number
): EventConsensusInfo => {
  const availableCount = plannings.filter(
    (p) => p.dates && p.dates[dateStr] === 'available'
  ).length;

  const validTotal = totalMembers > 0 ? totalMembers : plannings.length;
  const ratio = validTotal > 0 ? availableCount / validTotal : 0;

  return {
    availableCount,
    totalMembers: validTotal,
    ratio,
    text: `${availableCount} sur ${validTotal} disponible${availableCount > 1 ? 's' : ''}`,
    shortText: `${availableCount}/${validTotal}`,
  };
};

/**
 * Génère un aria-label accessible et explicite pour une pastille d'événement.
 * Exemple: "D&D, 20 septembre 2026, 4 sur 5 disponibles, en sondage"
 */
export const getEventChipAriaLabel = (
  event: Event,
  dateStr: string,
  consensusText?: string
): string => {
  const formattedDate = formatDateLongFr(dateStr);
  const stateLabel =
    event.state === 'planifie'
      ? 'validé'
      : event.state === 'passe'
      ? 'passé'
      : 'en sondage';

  const parts = [event.title, formattedDate];
  if (event.state === 'sondage' && consensusText) {
    parts.push(consensusText);
  }
  parts.push(stateLabel);

  return parts.join(', ');
};
