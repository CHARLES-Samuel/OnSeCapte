import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getEventDates,
  groupEventsByDate,
  getEventConsensus,
  getEventChipAriaLabel,
} from './calendarEventUtils';
import type { Event } from '../models/Event';
import type { GroupPlanning } from '../models/Group';

describe('calendarEventUtils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-10T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createBaseEvent = (overrides: Partial<Event> = {}): Event => ({
    id: 'evt-1',
    groupId: 'grp-1',
    title: 'Campagne D&D',
    description: 'Session JdR',
    category: 'Jeux de rôle',
    price: 0,
    createdBy: 'user-1',
    createdAt: Date.now(),
    state: 'sondage',
    ...overrides,
  });

  describe('getEventDates', () => {
    it('returns exactly 1 date for an event with a fixed finalDate', () => {
      const event = createBaseEvent({
        state: 'planifie',
        finalDate: '2026-10-25',
      });
      const dates = getEventDates(event);
      expect(dates).toEqual(['2026-10-25']);
      expect(dates.length).toBe(1);
    });

    it('returns exactly N dates for an event with N arbitrary dates', () => {
      const arbitraryDates = ['2026-10-18', '2026-10-22', '2026-10-29'];
      const event = createBaseEvent({
        state: 'sondage',
        dates: arbitraryDates,
      });
      const dates = getEventDates(event);
      expect(dates).toEqual(arbitraryDates);
      expect(dates.length).toBe(3);
    });

    it('returns all days in a date range for range mode', () => {
      const event = createBaseEvent({
        state: 'sondage',
        dateMode: 'range',
        startDate: '2026-10-15',
        endDate: '2026-10-18',
      });
      const dates = getEventDates(event);
      expect(dates).toEqual([
        '2026-10-15',
        '2026-10-16',
        '2026-10-17',
        '2026-10-18',
      ]);
      expect(dates.length).toBe(4);
    });

    it('returns empty array when event has no dates', () => {
      const event = createBaseEvent({
        state: 'sondage',
        dateMode: 'any',
      });
      const dates = getEventDates(event);
      expect(dates).toEqual([]);
    });
  });

  describe('groupEventsByDate', () => {
    it('groups multiple events by their respective days and duplicates an N-dates event on N days', () => {
      const event1 = createBaseEvent({
        id: 'evt-1',
        title: 'Sortie Resto',
        state: 'planifie',
        finalDate: '2026-10-20',
      });
      const event2 = createBaseEvent({
        id: 'evt-2',
        title: 'Festival Jeux',
        state: 'sondage',
        dates: ['2026-10-20', '2026-10-21'],
      });

      const grouped = groupEventsByDate([event1, event2]);

      expect(grouped.get('2026-10-20')?.map((e) => e.id)).toEqual(['evt-1', 'evt-2']);
      expect(grouped.get('2026-10-21')?.map((e) => e.id)).toEqual(['evt-2']);
      expect(grouped.get('2026-10-22')).toBeUndefined();
    });

    it('filters out past events when hidePast is true', () => {
      // Fake time is 2026-10-10
      const pastEvent = createBaseEvent({
        id: 'evt-past',
        finalDate: '2026-10-05',
        state: 'passe',
      });
      const futureEvent = createBaseEvent({
        id: 'evt-future',
        finalDate: '2026-10-15',
        state: 'planifie',
      });

      const grouped = groupEventsByDate([pastEvent, futureEvent], { hidePast: true });
      expect(grouped.get('2026-10-05')).toBeUndefined();
      expect(grouped.get('2026-10-15')?.length).toBe(1);
    });
  });

  describe('getEventConsensus', () => {
    it('calculates availableCount, ratio and text correctly', () => {
      const plannings: GroupPlanning[] = [
        { userId: 'u1', dates: { '2026-10-20': 'available' }, updatedAt: 0 },
        { userId: 'u2', dates: { '2026-10-20': 'available' }, updatedAt: 0 },
        { userId: 'u3', dates: { '2026-10-20': 'available' }, updatedAt: 0 },
        { userId: 'u4', dates: { '2026-10-20': 'available' }, updatedAt: 0 },
        { userId: 'u5', dates: { '2026-10-20': 'unavailable' }, updatedAt: 0 },
      ];

      const consensus = getEventConsensus('2026-10-20', plannings, 5);
      expect(consensus.availableCount).toBe(4);
      expect(consensus.totalMembers).toBe(5);
      expect(consensus.ratio).toBe(0.8);
      expect(consensus.shortText).toBe('4/5');
      expect(consensus.text).toBe('4 sur 5 disponibles');
    });
  });

  describe('getEventChipAriaLabel', () => {
    it('formats an accessible aria label with date, consensus and status', () => {
      const event = createBaseEvent({
        title: 'D&D',
        state: 'sondage',
      });

      const label = getEventChipAriaLabel(event, '2026-10-20', '4 sur 5 disponibles');
      expect(label).toContain('D&D');
      expect(label).toContain('4 sur 5 disponibles');
      expect(label).toContain('en sondage');
    });
  });
});
