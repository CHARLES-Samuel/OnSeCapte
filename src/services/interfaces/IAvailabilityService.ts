import type {
  AvailabilityCalculationParams,
  DateAvailabilityScore,
  HeatmapIntensity,
} from '../../models/Availability';

export interface IAvailabilityService {
  /**
   * Calcule les disponibilités pour chaque date selon les paramètres de l'événement et les plannings du groupe.
   * Retourne une Map indexée par date ('YYYY-MM-DD').
   */
  calculateAvailability(params: AvailabilityCalculationParams): Map<string, DateAvailabilityScore>;

  /**
   * Retourne les N meilleures dates (podium) triées par disponibilité décroissante.
   */
  getTopDates(scores: Map<string, DateAvailabilityScore> | DateAvailabilityScore[], limit?: number): DateAvailabilityScore[];

  /**
   * Retourne les N meilleurs créneaux (podium) triés par (date, créneau) par disponibilité décroissante.
   */
  getTopSlots(scores: Map<string, DateAvailabilityScore> | DateAvailabilityScore[], limit?: number): DateAvailabilityScore[];

  /**
   * Détermine le niveau d'intensité de la heatmap (none, low, medium, high, full).
   */
  getIntensityLevel(availableRatio: number, availableCount: number): HeatmapIntensity;
}

