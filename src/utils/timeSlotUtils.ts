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
 * Normalise la préférence de moment de la journée sur un événement.
 * Un tableau vide, absent ou contenant les 3 créneaux équivaut à « Peu importe » ([]).
 */
export function normalizeTimePreference(raw?: readonly DaySlot[] | null): DaySlot[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [];
  }
  const canonical = DAY_SLOTS.filter((slot) => raw.includes(slot));
  if (canonical.length === 0 || canonical.length === DAY_SLOTS.length) {
    return [];
  }
  return canonical;
}

/**
 * Bascule un créneau dans la multi-sélection « Moment de la journée souhaité ».
 * Cliquer sur 'any' ou sélectionner les 3 créneaux ou tout décocher revient à « Peu importe » ([]).
 */
export function toggleTimePreferenceSlot(
  current: readonly DaySlot[] | undefined,
  target: DaySlot | 'any'
): DaySlot[] {
  if (target === 'any') {
    return [];
  }
  const normalized = normalizeTimePreference(current);
  const next = normalized.includes(target)
    ? normalized.filter((s) => s !== target)
    : [...normalized, target];

  return normalizeTimePreference(next);
}

/**
 * Retourne les créneaux effectifs à évaluer (tous les créneaux si « Peu importe »).
 */
export function getEffectiveDaySlots(timePreference?: readonly DaySlot[] | null): DaySlot[] {
  const normalized = normalizeTimePreference(timePreference);
  return normalized.length > 0 ? normalized : DAY_SLOTS;
}

/**
 * Formate l'étiquette du badge de préférence horaire, ou null si « Peu importe ».
 */
export function formatTimePreferenceLabel(
  timePreference?: readonly DaySlot[] | null
): string | null {
  const normalized = normalizeTimePreference(timePreference);
  if (normalized.length === 0) {
    return null;
  }
  return normalized.map((slot) => SLOT_DEFINITIONS[slot].shortLabel).join(' • ');
}

/**
 * Agrège les créneaux pour déterminer le statut d'un membre à l'échelle de la journée (ou des créneaux souhaités).
 * Règle retenue : Un membre est considéré comme 'available' s'il l'est sur au moins un créneau ciblé,
 * sinon 'maybe' s'il a au moins un 'maybe', sinon 'unavailable'.
 */
export function aggregateDayStatus(
  slots: DaySlotsAvailability,
  targetSlots: readonly DaySlot[] = DAY_SLOTS
): AvailabilityStatus {
  const effectiveSlots = targetSlots.length > 0 ? targetSlots : DAY_SLOTS;
  if (effectiveSlots.some((slot) => slots[slot] === 'available')) {
    return 'available';
  }
  if (effectiveSlots.some((slot) => slots[slot] === 'maybe')) {
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
