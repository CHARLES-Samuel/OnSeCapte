import { useState, useMemo, useEffect } from 'react';
import type { Event } from '../models/Event';
import type { GroupPlanning } from '../models/Group';
import type { DateAvailabilityScore } from '../models/Availability';
import { availabilityService } from '../services/implementations/AvailabilityService';
import { parseLocalDate, isDateInRange } from '../utils/dateUtils';

interface UseAvailabilityScoresParams {
  event?: Event | null;
  plannings: GroupPlanning[];
  memberIds: string[];
}

export const useAvailabilityScores = ({
  event,
  plannings,
  memberIds,
}: UseAvailabilityScoresParams) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    if (event?.startDate) {
      const d = parseLocalDate(event.startDate);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    const now = new Date();
    now.setDate(1);
    now.setHours(0, 0, 0, 0);
    return now;
  });

  // Si l'événement change et a une startDate, aligner le mois
  useEffect(() => {
    if (event?.startDate) {
      const d = parseLocalDate(event.startDate);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      setCurrentMonth(d);
    }
  }, [event?.id, event?.startDate]);

  const dateScoresMap = useMemo(() => {
    if (!event || event.dateMode === 'fixed') {
      return new Map<string, DateAvailabilityScore>();
    }

    return availabilityService.calculateAvailability({
      dateMode: event.dateMode,
      startDate: event.startDate,
      endDate: event.endDate,
      plannings,
      participations: event.participations,
      allMemberIds: memberIds,
      calendarMonth: currentMonth,
    });
  }, [event, plannings, memberIds, currentMonth]);

  const topDates = useMemo(() => {
    return availabilityService.getTopDates(dateScoresMap, 3);
  }, [dateScoresMap]);

  const checkDateInRange = (dateStr: string): boolean => {
    if (event?.dateMode === 'range') {
      return isDateInRange(dateStr, event.startDate, event.endDate);
    }
    return true;
  };

  const getDayScore = (dateStr: string): DateAvailabilityScore | undefined => {
    return dateScoresMap.get(dateStr);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToDateMonth = (dateStr: string) => {
    const d = parseLocalDate(dateStr);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    setCurrentMonth(d);
  };

  return {
    currentMonth,
    setCurrentMonth,
    dateScoresMap,
    topDates,
    checkDateInRange,
    getDayScore,
    goToPreviousMonth,
    goToNextMonth,
    goToDateMonth,
  };
};
