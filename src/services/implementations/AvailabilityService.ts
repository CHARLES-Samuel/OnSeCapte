import type {
  AvailabilityCalculationParams,
  DateAvailabilityScore,
  HeatmapIntensity,
} from '../../models/Availability';
import type { IAvailabilityService } from '../interfaces/IAvailabilityService';
import { isDateInRange } from '../../utils/dateUtils';
import { DAY_SLOTS } from '../../utils/timeSlotUtils';
import {
  getDatesToEvaluate,
  calculateSlotScore,
  calculateDayAggregatedScore,
  assignPodiumRanks,
} from './availabilityScorer';

export class AvailabilityService implements IAvailabilityService {
  calculateAvailability(params: AvailabilityCalculationParams): Map<string, DateAvailabilityScore> {
    const {
      dateMode = 'any',
      startDate,
      endDate,
      plannings,
      participations = {},
      allMemberIds,
      calendarMonth,
    } = params;

    const candidateUserIds = allMemberIds.filter(
      (uid) => participations[uid] !== 'not_participating'
    );
    const totalTarget = candidateUserIds.length > 0 ? candidateUserIds.length : allMemberIds.length;

    const datesToEvaluate = getDatesToEvaluate(dateMode, startDate, endDate, plannings, calendarMonth);
    const scoresList: DateAvailabilityScore[] = [];

    datesToEvaluate.forEach((dateStr) => {
      if (dateMode === 'range' && !isDateInRange(dateStr, startDate, endDate)) {
        return;
      }

      // Calcul pour chaque créneau individuel (morning, afternoon, evening)
      const morningScore = calculateSlotScore(dateStr, 'morning', allMemberIds, plannings, participations, totalTarget);
      const afternoonScore = calculateSlotScore(dateStr, 'afternoon', allMemberIds, plannings, participations, totalTarget);
      const eveningScore = calculateSlotScore(dateStr, 'evening', allMemberIds, plannings, participations, totalTarget);

      // Calcul pour la journée agrégée (disponible si disponible sur au moins 1 créneau)
      const dayScore = calculateDayAggregatedScore(
        dateStr,
        allMemberIds,
        plannings,
        participations,
        totalTarget,
        { morning: morningScore, afternoon: afternoonScore, evening: eveningScore }
      );

      scoresList.push(dayScore);
    });

    // Attribution du Podium Top 3 par (date, créneau)
    assignPodiumRanks(scoresList);

    const resultMap = new Map<string, DateAvailabilityScore>();
    scoresList.forEach((item) => {
      resultMap.set(item.date, item);
    });

    return resultMap;
  }

  getTopSlots(
    scores: Map<string, DateAvailabilityScore> | DateAvailabilityScore[],
    limit = 3
  ): DateAvailabilityScore[] {
    const list = scores instanceof Map ? Array.from(scores.values()) : scores;
    const allSlots: DateAvailabilityScore[] = [];

    list.forEach((day) => {
      if (day.slots) {
        DAY_SLOTS.forEach((s) => {
          if (day.slots![s].rank !== undefined) {
            allSlots.push(day.slots![s]);
          }
        });
      }
    });

    return allSlots.sort((a, b) => (a.rank || 99) - (b.rank || 99)).slice(0, limit);
  }

  getTopDates(
    scores: Map<string, DateAvailabilityScore> | DateAvailabilityScore[],
    limit = 3
  ): DateAvailabilityScore[] {
    const topSlots = this.getTopSlots(scores, limit);
    if (topSlots.length > 0) {
      return topSlots;
    }

    const list = scores instanceof Map ? Array.from(scores.values()) : scores;
    return list
      .filter((s) => s.rank !== undefined)
      .sort((a, b) => (a.rank || 99) - (b.rank || 99))
      .slice(0, limit);
  }

  getIntensityLevel(availableRatio: number, availableCount: number): HeatmapIntensity {
    if (availableCount === 0 || availableRatio <= 0) return 'none';
    if (availableRatio > 0.75) return 'full';
    if (availableRatio > 0.5) return 'high';
    if (availableRatio > 0.25) return 'medium';
    return 'low';
  }
}

export const availabilityService = new AvailabilityService();
