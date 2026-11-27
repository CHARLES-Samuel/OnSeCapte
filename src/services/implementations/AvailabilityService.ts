import type {
  AvailabilityCalculationParams,
  DateAvailabilityScore,
  HeatmapIntensity,
} from '../../models/Availability';
import type { IAvailabilityService } from '../interfaces/IAvailabilityService';
import { isDateInRange } from '../../utils/dateUtils';
import { DAY_SLOTS } from '../../utils/timeSlotUtils';
import {
  buildBusyMembersByDate,
  extractBusyReasonsForMembers,
} from '../../utils/eventConflictUtils';
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
      timePreference,
      plannings,
      participations = {},
      allMemberIds,
      calendarMonth,
      currentEventId,
      existingEvents = [],
    } = params;

    const candidateUserIds = allMemberIds.filter(
      (uid) => participations[uid] !== 'not_participating'
    );
    const totalTarget = candidateUserIds.length > 0 ? candidateUserIds.length : allMemberIds.length;
    const busyByDate = buildBusyMembersByDate(existingEvents, currentEventId);

    const datesToEvaluate = getDatesToEvaluate(dateMode, startDate, endDate, plannings, calendarMonth);
    const scoresList: DateAvailabilityScore[] = [];

    datesToEvaluate.forEach((dateStr) => {
      if (dateMode === 'range' && !isDateInRange(dateStr, startDate, endDate)) {
        return;
      }

      const busyOnDate = busyByDate.get(dateStr);
      const busyReasons = extractBusyReasonsForMembers(busyOnDate, allMemberIds);

      // Calcul pour chaque créneau individuel (morning, afternoon, evening)
      const morningScore = calculateSlotScore(dateStr, 'morning', allMemberIds, plannings, participations, totalTarget, busyOnDate, busyReasons);
      const afternoonScore = calculateSlotScore(dateStr, 'afternoon', allMemberIds, plannings, participations, totalTarget, busyOnDate, busyReasons);
      const eveningScore = calculateSlotScore(dateStr, 'evening', allMemberIds, plannings, participations, totalTarget, busyOnDate, busyReasons);

      // Calcul pour la journée agrégée (filtré sur timePreference si défini, sinon tous les créneaux)
      const dayScore = calculateDayAggregatedScore(
        dateStr,
        allMemberIds,
        plannings,
        participations,
        totalTarget,
        { morning: morningScore, afternoon: afternoonScore, evening: eveningScore },
        timePreference,
        busyOnDate,
        busyReasons
      );

      scoresList.push(dayScore);
    });

    // Attribution du Podium Top 3 par (date, créneau) en respectant timePreference
    assignPodiumRanks(scoresList, timePreference);

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
