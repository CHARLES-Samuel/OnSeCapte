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
  });
});
