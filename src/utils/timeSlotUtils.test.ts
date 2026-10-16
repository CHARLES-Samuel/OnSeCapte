import { describe, it, expect } from 'vitest';
import {
  normalizeSlotsAvailability,
  aggregateDayStatus,
  daySlotToTimeSlot,
  timeSlotToDaySlot,
  formatSlotLabel,
  DAY_SLOTS,
} from './timeSlotUtils';

describe('timeSlotUtils', () => {
  describe('DAY_SLOTS', () => {
    it('contains morning, afternoon, evening in order', () => {
      expect(DAY_SLOTS).toEqual(['morning', 'afternoon', 'evening']);
    });
  });


  describe('normalizeSlotsAvailability', () => {

    it('handles undefined by returning all slots as unavailable', () => {
      expect(normalizeSlotsAvailability(undefined)).toEqual({
        morning: 'unavailable',
        afternoon: 'unavailable',
        evening: 'unavailable',
      });
    });

    it('converts legacy string status into identical 3 slots without breaking backward compatibility', () => {
      expect(normalizeSlotsAvailability('available')).toEqual({
        morning: 'available',
        afternoon: 'available',
        evening: 'available',
      });

      expect(normalizeSlotsAvailability('maybe')).toEqual({
        morning: 'maybe',
        afternoon: 'maybe',
        evening: 'maybe',
      });

      expect(normalizeSlotsAvailability('unavailable')).toEqual({
        morning: 'unavailable',
        afternoon: 'unavailable',
        evening: 'unavailable',
      });
    });

    it('preserves per-slot object values and defaults missing slots to unavailable', () => {
      expect(
        normalizeSlotsAvailability({
          morning: 'available',
          evening: 'maybe',
        })
      ).toEqual({
        morning: 'available',
        afternoon: 'unavailable',
        evening: 'maybe',
      });
    });
  });

  describe('aggregateDayStatus', () => {
    it('considers user as available if available on at least one slot', () => {
      expect(
        aggregateDayStatus({
          morning: 'available',
          afternoon: 'unavailable',
          evening: 'unavailable',
        })
      ).toBe('available');

      expect(
        aggregateDayStatus({
          morning: 'unavailable',
          afternoon: 'unavailable',
          evening: 'available',
        })
      ).toBe('available');
    });

    it('considers user as maybe if not available on any slot but maybe on at least one', () => {
      expect(
        aggregateDayStatus({
          morning: 'unavailable',
          afternoon: 'maybe',
          evening: 'unavailable',
        })
      ).toBe('maybe');
    });

    it('considers user as unavailable if all slots are unavailable', () => {
      expect(
        aggregateDayStatus({
          morning: 'unavailable',
          afternoon: 'unavailable',
          evening: 'unavailable',
        })
      ).toBe('unavailable');
    });
  });

  describe('daySlotToTimeSlot & timeSlotToDaySlot', () => {
    it('converts correctly in both directions', () => {
      expect(daySlotToTimeSlot('morning')).toBe('Matin');
      expect(daySlotToTimeSlot('afternoon')).toBe('Après-midi');
      expect(daySlotToTimeSlot('evening')).toBe('Soirée');

      expect(timeSlotToDaySlot('Matin')).toBe('morning');
      expect(timeSlotToDaySlot('Après-midi')).toBe('afternoon');
      expect(timeSlotToDaySlot('Soirée')).toBe('evening');
      expect(timeSlotToDaySlot('Toute la journée')).toBeNull();
    });
  });

  describe('formatSlotLabel', () => {
    it('formats labels with and without hours', () => {
      expect(formatSlotLabel('morning', true)).toBe('Matin (8h - 12h)');
      expect(formatSlotLabel('morning', false)).toBe('Matin');
      expect(formatSlotLabel('afternoon', true)).toBe('Après-midi (12h - 18h)');
      expect(formatSlotLabel('evening', true)).toBe('Soirée (18h - 00h)');
      expect(formatSlotLabel('Matin', true)).toBe('Matin (8h - 12h)');
      expect(formatSlotLabel('Toute la journée', true)).toBe('Toute la journée');
    });
  });
});
