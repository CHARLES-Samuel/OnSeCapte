import type { TimeSlot, EventDateMode, EventParticipation } from './Event';
import type { GroupPlanning } from './Group';

export type PodiumRank = 1 | 2 | 3;

export interface DateAvailabilityScore {
  date: string; // 'YYYY-MM-DD'
  timeSlot: TimeSlot;
  available: string[];
  maybe: string[];
  unavailable: string[];
  score: number;
  availableRatio: number; // 0 to 1
  count: number; // available.length + maybe.length
  rank?: PodiumRank;
  totalMembers?: number;
}

export interface AvailabilityCalculationParams {
  dateMode?: EventDateMode;
  startDate?: string;
  endDate?: string;
  plannings: GroupPlanning[];
  participations?: Record<string, EventParticipation>;
  allMemberIds: string[];
  calendarMonth?: Date;
}

export type HeatmapIntensity = 'none' | 'low' | 'medium' | 'high' | 'full';
