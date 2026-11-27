import type { Event, TimeSlot, EventDateMode, EventParticipation } from './Event';
import type { GroupPlanning, DaySlot } from './Group';

export type PodiumRank = 1 | 2 | 3;

export interface DateAvailabilityScore {
  date: string; // 'YYYY-MM-DD'
  timeSlot: TimeSlot;
  slot?: DaySlot;
  available: string[];
  maybe: string[];
  unavailable: string[];
  score: number;
  availableRatio: number; // 0 to 1
  count: number; // available.length + maybe.length
  rank?: PodiumRank;
  totalMembers?: number;
  slots?: Record<DaySlot, DateAvailabilityScore>;
  busyReasons?: Record<string, string[]>; // userId => titres des événements fixes/confirmés ce jour-là
}


export interface AvailabilityCalculationParams {
  dateMode?: EventDateMode;
  startDate?: string;
  endDate?: string;
  timePreference?: DaySlot[];
  plannings: GroupPlanning[];
  participations?: Record<string, EventParticipation>;
  allMemberIds: string[];
  calendarMonth?: Date;
  currentEventId?: string;
  existingEvents?: Event[];
}

export type HeatmapIntensity = 'none' | 'low' | 'medium' | 'high' | 'full';
