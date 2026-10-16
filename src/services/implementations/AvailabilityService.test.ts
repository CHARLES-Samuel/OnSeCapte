import { describe, it, expect } from 'vitest';
import { AvailabilityService } from './AvailabilityService';
import type { GroupPlanning } from '../../models/Group';

describe('AvailabilityService', () => {
  const service = new AvailabilityService();

  describe('getIntensityLevel', () => {
    it('returns "none" if availableCount is 0 or availableRatio is 0', () => {
      expect(service.getIntensityLevel(0, 0)).toBe('none');
      expect(service.getIntensityLevel(0.5, 0)).toBe('none');
      expect(service.getIntensityLevel(0, 2)).toBe('none');
    });

    it('returns "low" for ratio between 1% and 25%', () => {
      expect(service.getIntensityLevel(0.2, 1)).toBe('low');
      expect(service.getIntensityLevel(0.25, 1)).toBe('low');
    });

    it('returns "medium" for ratio between 26% and 50%', () => {
      expect(service.getIntensityLevel(0.26, 2)).toBe('medium');
      expect(service.getIntensityLevel(0.5, 2)).toBe('medium');
    });

    it('returns "high" for ratio between 51% and 75%', () => {
      expect(service.getIntensityLevel(0.51, 3)).toBe('high');
      expect(service.getIntensityLevel(0.75, 3)).toBe('high');
    });

    it('returns "full" for ratio above 75%', () => {
      expect(service.getIntensityLevel(0.76, 4)).toBe('full');
      expect(service.getIntensityLevel(0.8, 4)).toBe('full');
      expect(service.getIntensityLevel(1.0, 5)).toBe('full');
    });
  });

  describe('calculateAvailability', () => {
    it('calculates availableRatio relative to target members and includes totalMembers', () => {
      const plannings: GroupPlanning[] = [
        {
          userId: 'user1',
          dates: {
            '2026-10-15': 'available',
          },
          updatedAt: Date.now(),
        },
        {
          userId: 'user2',
          dates: {
            '2026-10-15': 'available',
          },
          updatedAt: Date.now(),
        },
        {
          userId: 'user3',
          dates: {
            '2026-10-15': 'unavailable',
          },
          updatedAt: Date.now(),
        },
        {
          userId: 'user4',
          dates: {
            '2026-10-15': 'unavailable',
          },
          updatedAt: Date.now(),
        },
      ];

      const allMemberIds = ['user1', 'user2', 'user3', 'user4'];

      const scoresMap = service.calculateAvailability({
        plannings,
        allMemberIds,
        dateMode: 'any',
      });

      const scoreOct15 = scoresMap.get('2026-10-15');
      expect(scoreOct15).toBeDefined();
      expect(scoreOct15?.available.length).toBe(2);
      expect(scoreOct15?.totalMembers).toBe(4);
      expect(scoreOct15?.availableRatio).toBe(0.5); // 2/4 = 50%
      expect(service.getIntensityLevel(scoreOct15!.availableRatio, scoreOct15!.available.length)).toBe('medium');
    });

    it('assigns podium ranks (1, 2, 3) to top dates with available members in future', () => {
      const plannings: GroupPlanning[] = [
        {
          userId: 'user1',
          dates: {
            '2026-10-20': 'available',
            '2026-10-21': 'available',
            '2026-10-22': 'available',
          },
          updatedAt: Date.now(),
        },
        {
          userId: 'user2',
          dates: {
            '2026-10-20': 'available',
            '2026-10-21': 'available',
          },
          updatedAt: Date.now(),
        },
        {
          userId: 'user3',
          dates: {
            '2026-10-20': 'available',
          },
          updatedAt: Date.now(),
        },
      ];

      const allMemberIds = ['user1', 'user2', 'user3'];

      const scoresMap = service.calculateAvailability({
        plannings,
        allMemberIds,
        dateMode: 'any',
      });

      // Oct 20 has 3 available -> rank 1
      // Oct 21 has 2 available -> rank 2
      // Oct 22 has 1 available -> rank 3
      expect(scoresMap.get('2026-10-20')?.rank).toBe(1);
      expect(scoresMap.get('2026-10-21')?.rank).toBe(2);
      expect(scoresMap.get('2026-10-22')?.rank).toBe(3);

      const topDates = service.getTopDates(scoresMap, 3);
      expect(topDates.length).toBe(3);
      expect(topDates[0].date).toBe('2026-10-20');
      expect(topDates[0].rank).toBe(1);
    });

    it('calculates availability per slot (morning, afternoon, evening) and handles legacy votes seamlessly', () => {
      const plannings: GroupPlanning[] = [
        {
          userId: 'user1',
          // Ancien format (string)
          dates: {
            '2026-10-25': 'available',
          },
          updatedAt: Date.now(),
        },
        {
          userId: 'user2',
          // Nouveau format (objet par créneau)
          dates: {
            '2026-10-25': {
              morning: 'available',
              afternoon: 'maybe',
              evening: 'unavailable',
            },
          },
          updatedAt: Date.now(),
        },
        {
          userId: 'user3',
          dates: {
            '2026-10-25': {
              morning: 'unavailable',
              afternoon: 'unavailable',
              evening: 'available',
            },
          },
          updatedAt: Date.now(),
        },
      ];

      const allMemberIds = ['user1', 'user2', 'user3'];

      const scoresMap = service.calculateAvailability({
        plannings,
        allMemberIds,
        dateMode: 'any',
      });

      const dayScore = scoresMap.get('2026-10-25');
      expect(dayScore).toBeDefined();

      // Vue jour globale : user1 (3 créneaux dispo), user2 (matin dispo), user3 (soirée dispo)
      // Chacun a au moins 1 créneau dispo => 3 membres disponibles au global
      expect(dayScore?.available.length).toBe(3);
      expect(dayScore?.availableRatio).toBe(1);

      // Détails créneau Matin : user1 (dispo via legacy), user2 (dispo), user3 (indispo)
      const morning = dayScore?.slots?.morning;
      expect(morning?.available).toEqual(['user1', 'user2']);
      expect(morning?.unavailable).toEqual(['user3']);
      expect(morning?.timeSlot).toBe('Matin');

      // Détails créneau Après-midi : user1 (dispo), user2 (maybe), user3 (indispo)
      const afternoon = dayScore?.slots?.afternoon;
      expect(afternoon?.available).toEqual(['user1']);
      expect(afternoon?.maybe).toEqual(['user2']);
      expect(afternoon?.unavailable).toEqual(['user3']);

      // Détails créneau Soirée : user1 (dispo), user2 (indispo), user3 (dispo)
      const evening = dayScore?.slots?.evening;
      expect(evening?.available).toEqual(['user1', 'user3']);
      expect(evening?.unavailable).toEqual(['user2']);
    });

    it('ranks top 3 podium by (date, créneau) accurately', () => {
      const plannings: GroupPlanning[] = [
        {
          userId: 'user1',
          dates: {
            '2026-10-28': { morning: 'available', afternoon: 'available', evening: 'available' },
            '2026-10-29': { evening: 'available' },
          },
          updatedAt: Date.now(),
        },
        {
          userId: 'user2',
          dates: {
            '2026-10-28': { evening: 'available' },
            '2026-10-29': { evening: 'available' },
          },
          updatedAt: Date.now(),
        },
      ];

      const scoresMap = service.calculateAvailability({
        plannings,
        allMemberIds: ['user1', 'user2'],
        dateMode: 'any',
      });

      const topSlots = service.getTopSlots(scoresMap, 3);
      expect(topSlots.length).toBe(3);

      // 2026-10-28 Soirée has 2 available -> rank 1
      // 2026-10-29 Soirée has 2 available -> rank 2
      // 2026-10-28 Matin has 1 available -> rank 3
      expect(topSlots[0].date).toBe('2026-10-28');
      expect(topSlots[0].slot).toBe('evening');
      expect(topSlots[0].rank).toBe(1);

      expect(topSlots[1].date).toBe('2026-10-29');
      expect(topSlots[1].slot).toBe('evening');
      expect(topSlots[1].rank).toBe(2);

      expect(topSlots[2].date).toBe('2026-10-28');
      expect(topSlots[2].slot).toBe('morning');
      expect(topSlots[2].rank).toBe(3);
    });
  });
});

