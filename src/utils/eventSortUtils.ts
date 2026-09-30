import type { Event } from '../models/Event';

export type EventSortOption =
  | 'date-asc'
  | 'date-desc'
  | 'created-desc'
  | 'category-asc'
  | 'price-asc'
  | 'price-desc';

export interface SortOptionConfig {
  value: EventSortOption;
  label: string;
  shortLabel: string;
  icon?: string;
}

export const EVENT_SORT_OPTIONS: SortOptionConfig[] = [
  {
    value: 'date-asc',
    label: 'Date : Prochains événements',
    shortLabel: 'Prochains d’abord',
  },
  {
    value: 'date-desc',
    label: 'Date : Plus lointains d’abord',
    shortLabel: 'Plus lointains',
  },
  {
    value: 'category-asc',
    label: 'Catégorie : Ordre alphabétique',
    shortLabel: 'Catégorie',
  },
  {
    value: 'created-desc',
    label: 'Création : Plus récents d’abord',
    shortLabel: 'Récemment créés',
  },
  {
    value: 'price-asc',
    label: 'Prix : Moins cher d’abord',
    shortLabel: 'Prix croissant',
  },
  {
    value: 'price-desc',
    label: 'Prix : Plus cher d’abord',
    shortLabel: 'Prix décroissant',
  },
];

/**
 * Normalise une date pour la comparaison timestamp.
 * Retourne null si aucune date valide n'est définie.
 */
const getEventDateTimestamp = (event: Event): number | null => {
  if (!event.finalDate) return null;
  const time = new Date(event.finalDate).getTime();
  return isNaN(time) ? null : time;
};

/**
 * Trie une liste d'événements selon l'option choisie.
 * Pour 'date-asc' :
 * 1. Événements avec date à venir (du plus proche au plus lointain)
 * 2. Événements sans date arrêtée (en recherche de date / sondage)
 * 3. Événements dont la date est passée
 */
export const sortEvents = (events: Event[], sortOption: EventSortOption): Event[] => {
  const shallowCopy = [...events];
  const now = new Date();
  // Début de la journée actuelle en timestamp pour comparer les dates de jour
  const todayTimestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  return shallowCopy.sort((a, b) => {
    switch (sortOption) {
      case 'date-asc': {
        const dateA = getEventDateTimestamp(a);
        const dateB = getEventDateTimestamp(b);

        const isPastA = a.state === 'passe' || (dateA !== null && dateA < todayTimestamp);
        const isPastB = b.state === 'passe' || (dateB !== null && dateB < todayTimestamp);

        // Si l'un est passé et pas l'autre, l'événement passé va en toute fin
        if (isPastA !== isPastB) {
          return isPastA ? 1 : -1;
        }

        // Si les deux sont passés, trier du plus récent passé au plus ancien
        if (isPastA && isPastB) {
          if (dateA !== null && dateB !== null) return dateB - dateA;
          return b.createdAt - a.createdAt;
        }

        // Pour les événements futurs / actifs :
        // 1. Événements avec date fixée
        // 2. Événements sans date arrêtée (en cours de sondage)
        const hasDateA = dateA !== null;
        const hasDateB = dateB !== null;

        if (hasDateA && hasDateB) {
          if (dateA !== dateB) return (dateA as number) - (dateB as number);
          return a.createdAt - b.createdAt;
        }

        if (hasDateA && !hasDateB) return -1;
        if (!hasDateA && hasDateB) return 1;

        // Si aucun n'a de date, ordonner par date de création récente
        return b.createdAt - a.createdAt;
      }

      case 'date-desc': {
        const dateA = getEventDateTimestamp(a);
        const dateB = getEventDateTimestamp(b);

        const hasDateA = dateA !== null;
        const hasDateB = dateB !== null;

        if (hasDateA && hasDateB) {
          if (dateA !== dateB) return (dateB as number) - (dateA as number);
          return b.createdAt - a.createdAt;
        }

        if (hasDateA && !hasDateB) return -1;
        if (!hasDateA && hasDateB) return 1;

        return b.createdAt - a.createdAt;
      }

      case 'category-asc': {
        const catComparison = (a.category || '').localeCompare(b.category || '', 'fr', { sensitivity: 'base' });
        if (catComparison !== 0) return catComparison;

        // Tri secondaire : date d'événement la plus proche, sinon création récente
        const dateA = getEventDateTimestamp(a);
        const dateB = getEventDateTimestamp(b);
        if (dateA !== null && dateB !== null) return dateA - dateB;
        if (dateA !== null) return -1;
        if (dateB !== null) return 1;

        return b.createdAt - a.createdAt;
      }

      case 'created-desc':
        return b.createdAt - a.createdAt;

      case 'price-asc':
        if (a.price !== b.price) return a.price - b.price;
        return b.createdAt - a.createdAt;

      case 'price-desc':
        if (a.price !== b.price) return b.price - a.price;
        return b.createdAt - a.createdAt;

      default:
        return 0;
    }
  });
};
