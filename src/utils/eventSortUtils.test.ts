import { describe, it, expect } from 'vitest';
import { sortEvents, EVENT_SORT_OPTIONS } from './eventSortUtils';
import type { Event } from '../models/Event';

describe('eventSortUtils', () => {
  const createMockEvent = (partial: Partial<Event>): Event => ({
    id: 'e1',
    groupId: 'g1',
    title: 'Test Event',
    description: '',
    category: 'Autres',
    price: 0,
    createdBy: 'u1',
    createdAt: 1000,
    state: 'sondage',
    ...partial,
  });

  it('contains category-asc in EVENT_SORT_OPTIONS', () => {
    const categoryOption = EVENT_SORT_OPTIONS.find((opt) => opt.value === 'category-asc');
    expect(categoryOption).toBeDefined();
    expect(categoryOption?.label).toBe('Catégorie : Ordre alphabétique');
    expect(categoryOption?.shortLabel).toBe('Catégorie');
  });

  describe('sortEvents with category-asc', () => {
    it('sorts events alphabetically by category in French', () => {
      const events: Event[] = [
        createMockEvent({ id: '1', title: 'Sport Event', category: 'Sport' }),
        createMockEvent({ id: '2', title: 'Resto Event', category: 'Restaurant' }),
        createMockEvent({ id: '3', title: 'Autres Event', category: 'Autres' }),
        createMockEvent({ id: '4', title: 'JDR Event', category: 'Jeux de rôle' }),
      ];

      const sorted = sortEvents(events, 'category-asc');
      expect(sorted.map((e) => e.category)).toEqual([
        'Autres',
        'Jeux de rôle',
        'Restaurant',
        'Sport',
      ]);
    });

    it('uses upcoming date as secondary sort when categories are identical', () => {
      const events: Event[] = [
        createMockEvent({
          id: '1',
          category: 'Restaurant',
          finalDate: '2026-10-15',
          createdAt: 100,
        }),
        createMockEvent({
          id: '2',
          category: 'Restaurant',
          finalDate: '2026-10-05',
          createdAt: 200,
        }),
      ];

      const sorted = sortEvents(events, 'category-asc');
      expect(sorted[0].id).toBe('2'); // earlier date 2026-10-05
      expect(sorted[1].id).toBe('1'); // later date 2026-10-15
    });

    it('uses createdAt as fallback secondary sort when neither has date', () => {
      const events: Event[] = [
        createMockEvent({
          id: 'older',
          category: 'Gaming',
          createdAt: 100,
        }),
        createMockEvent({
          id: 'newer',
          category: 'Gaming',
          createdAt: 200,
        }),
      ];

      const sorted = sortEvents(events, 'category-asc');
      expect(sorted[0].id).toBe('newer');
      expect(sorted[1].id).toBe('older');
    });
  });

  describe('sortEvents with price sorts', () => {
    it('sorts events by price ascending', () => {
      const events: Event[] = [
        createMockEvent({ id: '1', price: 25 }),
        createMockEvent({ id: '2', price: 0 }),
        createMockEvent({ id: '3', price: 10 }),
      ];

      const sorted = sortEvents(events, 'price-asc');
      expect(sorted.map((e) => e.price)).toEqual([0, 10, 25]);
    });

    it('sorts events by price descending', () => {
      const events: Event[] = [
        createMockEvent({ id: '1', price: 25 }),
        createMockEvent({ id: '2', price: 0 }),
        createMockEvent({ id: '3', price: 10 }),
      ];

      const sorted = sortEvents(events, 'price-desc');
      expect(sorted.map((e) => e.price)).toEqual([25, 10, 0]);
    });
  });
});
