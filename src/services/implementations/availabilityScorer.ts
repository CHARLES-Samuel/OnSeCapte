import type {
  AvailabilityCalculationParams,
  DateAvailabilityScore,
  PodiumRank,
} from '../../models/Availability';
import type { DaySlot } from '../../models/Group';
import {
  getDateRangeDays,
  formatDateStr,
  getTodayDateStr,
} from '../../utils/dateUtils';
import {
  normalizeSlotsAvailability,
  aggregateDayStatus,
  daySlotToTimeSlot,
  getEffectiveDaySlots,
} from '../../utils/timeSlotUtils';

export function getDatesToEvaluate(
  dateMode: string,
  startDate?: string,
  endDate?: string,
  plannings: AvailabilityCalculationParams['plannings'] = [],
  calendarMonth?: Date
): Set<string> {
  const dates = new Set<string>();
  if (dateMode === 'range' && startDate && endDate) {
    getDateRangeDays(startDate, endDate).forEach((d) => dates.add(d));
  } else {
    plannings.forEach((p) => {
      if (p.dates) {
        Object.keys(p.dates).forEach((d) => dates.add(d));
      }
    });
    if (calendarMonth) {
      const year = calendarMonth.getFullYear();
      const month = calendarMonth.getMonth();
      const lastDay = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= lastDay; day++) {
        dates.add(formatDateStr(new Date(year, month, day)));
      }
    }
  }
  return dates;
}

export function calculateSlotScore(
  dateStr: string,
  slot: DaySlot,
  allMemberIds: string[],
  plannings: AvailabilityCalculationParams['plannings'],
  participations: Record<string, string>,
  totalTarget: number,
  busyOnDate?: ReadonlyMap<string, string[]>,
  busyReasons?: Record<string, string[]>
): DateAvailabilityScore {
  const available: string[] = [];
  const maybe: string[] = [];
  const unavailable: string[] = [];

  allMemberIds.forEach((uid) => {
    if (participations[uid] === 'not_participating' || busyOnDate?.has(uid)) {
      unavailable.push(uid);
      return;
    }

    const userPlanning = plannings.find((p) => p.userId === uid);
    const status = normalizeSlotsAvailability(userPlanning?.dates?.[dateStr])[slot];

    if (status === 'available') {
      if (participations[uid] === 'maybe') {
        maybe.push(uid);
      } else {
        available.push(uid);
      }
    } else if (status === 'maybe') {
      maybe.push(uid);
    } else {
      unavailable.push(uid);
    }
  });

  return {
    date: dateStr,
    slot,
    timeSlot: daySlotToTimeSlot(slot),
    available,
    maybe,
    unavailable,
    score: available.length * 2 + maybe.length,
    availableRatio: totalTarget > 0 ? available.length / totalTarget : 0,
    count: available.length + maybe.length,
    totalMembers: totalTarget,
    ...(busyReasons ? { busyReasons } : {}),
  };
}

export function calculateDayAggregatedScore(
  dateStr: string,
  allMemberIds: string[],
  plannings: AvailabilityCalculationParams['plannings'],
  participations: Record<string, string>,
  totalTarget: number,
  slots: Record<DaySlot, DateAvailabilityScore>,
  timePreference?: DaySlot[],
  busyOnDate?: ReadonlyMap<string, string[]>,
  busyReasons?: Record<string, string[]>
): DateAvailabilityScore {
  const available: string[] = [];
  const maybe: string[] = [];
  const unavailable: string[] = [];
  const targetSlots = getEffectiveDaySlots(timePreference);

  allMemberIds.forEach((uid) => {
    if (participations[uid] === 'not_participating' || busyOnDate?.has(uid)) {
      unavailable.push(uid);
      return;
    }

    const userPlanning = plannings.find((p) => p.userId === uid);
    const normalizedSlots = normalizeSlotsAvailability(userPlanning?.dates?.[dateStr]);
    const dayStatus = aggregateDayStatus(normalizedSlots, targetSlots);

    if (dayStatus === 'available') {
      if (participations[uid] === 'maybe') {
        maybe.push(uid);
      } else {
        available.push(uid);
      }
    } else if (dayStatus === 'maybe') {
      maybe.push(uid);
    } else {
      unavailable.push(uid);
    }
  });

  return {
    date: dateStr,
    timeSlot: 'Toute la journée',
    available,
    maybe,
    unavailable,
    score: available.length * 2 + maybe.length,
    availableRatio: totalTarget > 0 ? available.length / totalTarget : 0,
    count: available.length + maybe.length,
    totalMembers: totalTarget,
    slots,
    ...(busyReasons ? { busyReasons } : {}),
  };
}

export function assignPodiumRanks(
  scoresList: DateAvailabilityScore[],
  timePreference?: DaySlot[]
): void {
  const todayStr = getTodayDateStr();
  const candidateSlots: DateAvailabilityScore[] = [];
  const targetSlots = getEffectiveDaySlots(timePreference);

  scoresList.forEach((dayScore) => {
    if (dayScore.date >= todayStr && dayScore.slots) {
      targetSlots.forEach((slotKey) => {
        const slotScore = dayScore.slots![slotKey];
        if (slotScore.available.length > 0 || slotScore.maybe.length > 0) {
          candidateSlots.push(slotScore);
        }
      });
    }
  });

  candidateSlots.sort((a, b) => {
    if (b.available.length !== a.available.length) return b.available.length - a.available.length;
    if (b.score !== a.score) return b.score - a.score;
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    const order: Record<DaySlot, number> = { morning: 1, afternoon: 2, evening: 3 };
    return (order[a.slot || 'morning'] || 0) - (order[b.slot || 'morning'] || 0);
  });

  const selectedSlots: DateAvailabilityScore[] = [];
  const usedDates = new Set<string>();

  for (const slot of candidateSlots) {
    if (!usedDates.has(slot.date)) {
      selectedSlots.push(slot);
      usedDates.add(slot.date);
      if (selectedSlots.length === 3) break;
    }
  }

  if (selectedSlots.length < 3) {
    for (const slot of candidateSlots) {
      if (!selectedSlots.includes(slot)) {
        selectedSlots.push(slot);
        if (selectedSlots.length === 3) break;
      }
    }
  }

  selectedSlots.forEach((item, index) => {
    item.rank = (index + 1) as PodiumRank;
  });

  scoresList.forEach((dayScore) => {
    if (dayScore.slots) {
      const ranks = targetSlots
        .map((s) => dayScore.slots![s].rank)
        .filter((r): r is PodiumRank => r !== undefined);
      if (ranks.length > 0) {
        dayScore.rank = Math.min(...ranks) as PodiumRank;
      }
    }
  });
}
