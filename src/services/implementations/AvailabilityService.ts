import type {
  AvailabilityCalculationParams,
  DateAvailabilityScore,
  HeatmapIntensity,
  PodiumRank,
} from '../../models/Availability';
import type { IAvailabilityService } from '../interfaces/IAvailabilityService';
import {
  getDateRangeDays,
  formatDateStr,
  isDateInRange,
  getTodayDateStr,
} from '../../utils/dateUtils';

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

    // Utilisateurs cibles : tous les membres qui n'ont pas décliné l'événement
    const candidateUserIds = allMemberIds.filter(
      (uid) => participations[uid] !== 'not_participating'
    );
    const totalTarget = candidateUserIds.length > 0 ? candidateUserIds.length : allMemberIds.length;

    // Détermination de l'ensemble des dates à évaluer
    const datesToEvaluate = new Set<string>();

    if (dateMode === 'range' && startDate && endDate) {
      // Restriction stricte aux dates de l'intervalle
      const rangeDays = getDateRangeDays(startDate, endDate);
      rangeDays.forEach((d) => datesToEvaluate.add(d));
    } else {
      // Sans restriction : dates des plannings + mois visualisé si fourni
      plannings.forEach((p) => {
        if (p.dates) {
          Object.keys(p.dates).forEach((d) => datesToEvaluate.add(d));
        }
      });

      if (calendarMonth) {
        const year = calendarMonth.getFullYear();
        const month = calendarMonth.getMonth();
        const lastDay = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= lastDay; day++) {
          datesToEvaluate.add(formatDateStr(new Date(year, month, day)));
        }
      }
    }

    // Évaluation pour chaque date
    const scoresList: DateAvailabilityScore[] = [];

    datesToEvaluate.forEach((dateStr) => {
      // Si une plage est définie, ne jamais évaluer en dehors
      if (dateMode === 'range' && !isDateInRange(dateStr, startDate, endDate)) {
        return;
      }

      const available: string[] = [];
      const maybe: string[] = [];
      const unavailable: string[] = [];

      allMemberIds.forEach((uid) => {
        // Si la personne a refusé l'événement, elle est indisponible
        if (participations[uid] === 'not_participating') {
          unavailable.push(uid);
          return;
        }

        const userPlanning = plannings.find((p) => p.userId === uid);
        const status = userPlanning?.dates?.[dateStr];

        if (status === 'available') {
          available.push(uid);
        } else if (status === 'maybe') {
          maybe.push(uid);
        } else {
          unavailable.push(uid);
        }
      });

      const score = available.length * 2 + maybe.length;
      const availableRatio = totalTarget > 0 ? available.length / totalTarget : 0;

      scoresList.push({
        date: dateStr,
        timeSlot: 'Toute la journée',
        available,
        maybe,
        unavailable,
        score,
        availableRatio,
        count: available.length + maybe.length,
      });
    });

    // Attribution du Podium (Top 3)
    // Ne qualifier que les dates futures où au moins 1 personne est dispo ou peut-être
    const todayStr = getTodayDateStr();
    const qualifyingDates = scoresList
      .filter((s) => s.date >= todayStr && (s.available.length > 0 || s.maybe.length > 0))
      .sort((a, b) => {
        if (b.available.length !== a.available.length) {
          return b.available.length - a.available.length;
        }
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.date.localeCompare(b.date);
      });

    const rankMap = new Map<string, PodiumRank>();
    qualifyingDates.slice(0, 3).forEach((item, index) => {
      rankMap.set(item.date, (index + 1) as PodiumRank);
    });

    const resultMap = new Map<string, DateAvailabilityScore>();
    scoresList.forEach((item) => {
      const rank = rankMap.get(item.date);
      resultMap.set(item.date, {
        ...item,
        rank,
      });
    });

    return resultMap;
  }

  getTopDates(
    scores: Map<string, DateAvailabilityScore> | DateAvailabilityScore[],
    limit = 3
  ): DateAvailabilityScore[] {
    const list = scores instanceof Map ? Array.from(scores.values()) : scores;
    return list
      .filter((s) => s.rank !== undefined)
      .sort((a, b) => (a.rank || 99) - (b.rank || 99))
      .slice(0, limit);
  }

  getIntensityLevel(availableRatio: number, availableCount: number): HeatmapIntensity {
    if (availableCount === 0 || availableRatio <= 0) return 'none';
    if (availableRatio >= 1.0) return 'full';
    if (availableRatio >= 0.6) return 'high';
    if (availableRatio >= 0.25) return 'medium';
    return 'low';
  }
}

export const availabilityService = new AvailabilityService();
