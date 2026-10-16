import type { TimeSlot } from '../models/Event';
import type { DaySlot, AvailabilityStatus, DaySlotsAvailability, UserDayAvailability } from '../models/Group';

export const DAY_SLOTS: DaySlot[] = ['morning', 'afternoon', 'evening'];

export interface SlotDefinition {
  id: DaySlot;
  timeSlot: TimeSlot;
  label: string;
  timeRange: string;
  fullLabel: string;
  shortLabel: string;
  badgeLetter: string;
}

export const SLOT_DEFINITIONS: Record<DaySlot, SlotDefinition> = {
  morning: {
    id: 'morning',
    timeSlot: 'Matin',
    label: 'Matin',
    timeRange: '8h - 12h',
    fullLabel: 'Matin (8h - 12h)',
    shortLabel: 'Matin',
    badgeLetter: 'M',
  },
  afternoon: {
    id: 'afternoon',
    timeSlot: 'Après-midi',
    label: 'Après-midi',
    timeRange: '12h - 18h',
    fullLabel: 'Après-midi (12h - 18h)',
    shortLabel: 'Après-midi',
    badgeLetter: 'A',
  },
  evening: {
    id: 'evening',
    timeSlot: 'Soirée',
    label: 'Soirée',
    timeRange: '18h - 00h',
    fullLabel: 'Soirée (18h - 00h)',
    shortLabel: 'Soirée',
    badgeLetter: 'S',
  },
};

/**
 * Normalise la disponibilité d'une journée en structure 3 créneaux.
 * Les anciens votes jour entier (string simple) sont convertis en les 3 créneaux identiques.
 */
export function normalizeSlotsAvailability(
  raw?: UserDayAvailability
): DaySlotsAvailability {
  if (!raw) {
    return {
      morning: 'unavailable',
      afternoon: 'unavailable',
      evening: 'unavailable',
    };
  }

  // Ancien format rétrocompatible : chaîne directe 'available' | 'maybe' | 'unavailable'
  if (typeof raw === 'string') {
    return {
      morning: raw,
      afternoon: raw,
      evening: raw,
    };
  }

  // Nouveau format par créneau
  return {
    morning: raw.morning || 'unavailable',
    afternoon: raw.afternoon || 'unavailable',
    evening: raw.evening || 'unavailable',
  };
}

/**
 * Agrège les créneaux pour déterminer le statut d'un membre à l'échelle de la journée.
 * Règle retenue : Un membre est considéré comme 'available' s'il l'est sur au moins un créneau,
 * sinon 'maybe' s'il a au moins un 'maybe', sinon 'unavailable'.
 */
export function aggregateDayStatus(slots: DaySlotsAvailability): AvailabilityStatus {
  if (slots.morning === 'available' || slots.afternoon === 'available' || slots.evening === 'available') {
    return 'available';
  }
  if (slots.morning === 'maybe' || slots.afternoon === 'maybe' || slots.evening === 'maybe') {
    return 'maybe';
  }
  return 'unavailable';
}

/**
 * Convertit un identifiant technique de créneau (DaySlot) vers le TimeSlot correspondant.
 */
export function daySlotToTimeSlot(slot: DaySlot): TimeSlot {
  return SLOT_DEFINITIONS[slot]?.timeSlot || 'Matin';
}

/**
 * Convertit un TimeSlot vers son DaySlot technique (ou null si 'Toute la journée').
 */
export function timeSlotToDaySlot(timeSlot: TimeSlot): DaySlot | null {
  if (timeSlot === 'Matin') return 'morning';
  if (timeSlot === 'Après-midi') return 'afternoon';
  if (timeSlot === 'Soirée') return 'evening';
  return null;
}

/**
 * Retourne le libellé formaté d'un créneau, avec ou sans horaires.
 */
export function formatSlotLabel(slotOrTimeSlot: DaySlot | TimeSlot, withHours = true): string {
  const daySlot = typeof slotOrTimeSlot === 'string' && (slotOrTimeSlot === 'morning' || slotOrTimeSlot === 'afternoon' || slotOrTimeSlot === 'evening')
    ? slotOrTimeSlot
    : timeSlotToDaySlot(slotOrTimeSlot as TimeSlot);

  if (!daySlot) {
    return slotOrTimeSlot;
  }

  const def = SLOT_DEFINITIONS[daySlot];
  return withHours ? def.fullLabel : def.label;
}
