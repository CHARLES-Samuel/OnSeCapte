import { describe, it, expect } from 'vitest';
import {
  isEventConfirmedOrFixed,
  buildBusyMembersByDate,
  extractBusyReasonsForMembers,
} from './eventConflictUtils';
import type { Event } from '../models/Event';

const makeEvent = (overrides: Partial<Event> = {}): Event => ({
  id: 'evt-default',
  groupId: 'grp-1',
  title: 'Événement test',
  description: '',
  category: 'Soirée',
  price: 0,
  createdBy: 'u1',
  createdAt: 0,
  state: 'sondage',
  ...overrides,
});

describe('eventConflictUtils', () => {
  describe('isEventConfirmedOrFixed', () => {
    it('returns true for fixed-date events and confirmed (planifie/passe) events with finalDate', () => {
      expect(
        isEventConfirmedOrFixed(
          makeEvent({ dateMode: 'fixed', state: 'planifie', finalDate: '2026-12-31' })
        )
      ).toBe(true);
      expect(
        isEventConfirmedOrFixed(
          makeEvent({ dateMode: 'any', state: 'planifie', finalDate: '2026-12-31' })
        )
      ).toBe(true);
      expect(
        isEventConfirmedOrFixed(
          makeEvent({ dateMode: 'poll', state: 'passe', finalDate: '2026-01-01' })
        )
      ).toBe(true);
    });

    it('returns false for unconfirmed poll/range events or events without finalDate', () => {
      expect(
        isEventConfirmedOrFixed(
          makeEvent({ dateMode: 'any', state: 'sondage' })
        )
      ).toBe(false);
      expect(
        isEventConfirmedOrFixed(
          makeEvent({
            dateMode: 'range',
            state: 'sondage',
            startDate: '2026-12-28',
            endDate: '2026-12-31',
          })
        )
      ).toBe(false);
      expect(
        isEventConfirmedOrFixed(
          makeEvent({ dateMode: 'fixed', state: 'planifie', finalDate: undefined })
        )
      ).toBe(false);
    });
  });

  describe('buildBusyMembersByDate & extractBusyReasonsForMembers', () => {
    it('indexes only participating members on fixed or confirmed events and excludes target event', () => {
      const nouvelAn = makeEvent({
        id: 'evt-nye',
        title: 'Nouvel An',
        dateMode: 'fixed',
        state: 'planifie',
        finalDate: '2026-12-31',
        finalTimeSlot: 'Soirée',
        participations: {
          u1: 'participating',
          u2: 'not_participating',
          u3: 'pending',
        },
      });

      const pollEvent = makeEvent({
        id: 'evt-poll',
        title: 'Sortie Ski',
        dateMode: 'range',
        state: 'sondage',
        startDate: '2026-12-30',
        endDate: '2026-12-31',
        participations: {
          u2: 'participating',
        },
      });

      const mapForOther = buildBusyMembersByDate([nouvelAn, pollEvent], 'evt-poll');
      const busyDec31 = mapForOther.get('2026-12-31');

      expect(busyDec31?.get('u1')).toEqual(['Nouvel An']);
      expect(busyDec31?.has('u2')).toBe(false);
      expect(busyDec31?.has('u3')).toBe(false);

      // Exclut l'événement lui-même
      const mapForSelf = buildBusyMembersByDate([nouvelAn], 'evt-nye');
      expect(mapForSelf.get('2026-12-31')).toBeUndefined();

      const reasons = extractBusyReasonsForMembers(busyDec31, ['u1', 'u2', 'u3']);
      expect(reasons).toEqual({ u1: ['Nouvel An'] });
    });
  });
});

