import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AvailabilityService } from './AvailabilityService';
import type { GroupPlanning } from '../../models/Group';

describe('AvailabilityService', () => {
  const service = new AvailabilityService();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

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

    it('filters podium and day heatmap score according to event timePreference', () => {
      const plannings: GroupPlanning[] = [
        {
          userId: 'user1',
          dates: {
            // Le 20 oct : tout le monde dispo le MATIN uniquement, personne le soir
            '2026-10-20': { morning: 'available', afternoon: 'unavailable', evening: 'unavailable' },
            // Le 21 oct : dispo en SOIRÉE
            '2026-10-21': { morning: 'unavailable', afternoon: 'unavailable', evening: 'available' },
          },
          updatedAt: Date.now(),
        },
        {
          userId: 'user2',
          dates: {
            '2026-10-20': { morning: 'available', afternoon: 'unavailable', evening: 'unavailable' },
            '2026-10-21': { morning: 'unavailable', afternoon: 'maybe', evening: 'available' },
          },
          updatedAt: Date.now(),
        },
        {
          userId: 'user3',
          dates: {
            '2026-10-20': { morning: 'available', afternoon: 'unavailable', evening: 'unavailable' },
            '2026-10-21': { morning: 'unavailable', afternoon: 'available', evening: 'unavailable' },
          },
          updatedAt: Date.now(),
        },
      ];

      // Préférence : uniquement en Soirée
      const eveningScores = service.calculateAvailability({
        plannings,
        allMemberIds: ['user1', 'user2', 'user3'],
        dateMode: 'any',
        timePreference: ['evening'],
      });

      // Le 20 oct (matin seulement) a 0 disponible pour une sortie en soirée et aucun rang au podium
      expect(eveningScores.get('2026-10-20')?.available.length).toBe(0);
      expect(eveningScores.get('2026-10-20')?.rank).toBeUndefined();

      // Le 21 oct soir (2 dispos) décroche la 1ère place du podium
      expect(eveningScores.get('2026-10-21')?.available.length).toBe(2);
      expect(eveningScores.get('2026-10-21')?.rank).toBe(1);

      const topEvening = service.getTopSlots(eveningScores, 3);
      expect(topEvening).toHaveLength(1);
      expect(topEvening[0].date).toBe('2026-10-21');
      expect(topEvening[0].slot).toBe('evening');
      expect(topEvening[0].rank).toBe(1);

      // Préférence multi-sélection : Après-midi + Soirée
      const afternoonEveningScores = service.calculateAvailability({
        plannings,
        allMemberIds: ['user1', 'user2', 'user3'],
        dateMode: 'any',
        timePreference: ['afternoon', 'evening'],
      });

      // Le 21 oct cumule user1, user2 (soir) et user3 (après-midi) => 3 disponibles sur les créneaux souhaités
      expect(afternoonEveningScores.get('2026-10-21')?.available.length).toBe(3);
      const topMulti = service.getTopSlots(afternoonEveningScores, 3);
      expect(topMulti.every((s) => s.slot === 'afternoon' || s.slot === 'evening')).toBe(true);
    });

    it('decrements availability across the whole date when a member participates in a fixed or confirmed event (e.g. Nouvel An on the 31st)', () => {
      const plannings: GroupPlanning[] = [
        {
          userId: 'user1',
          dates: {
            '2026-12-30': { morning: 'available', afternoon: 'available', evening: 'available' },
            '2026-12-31': { morning: 'available', afternoon: 'available', evening: 'available' },
          },
          updatedAt: Date.now(),
        },
        {
          userId: 'user2',
          dates: {
            '2026-12-30': { morning: 'available', afternoon: 'available', evening: 'available' },
            '2026-12-31': { morning: 'available', afternoon: 'available', evening: 'available' },
          },
          updatedAt: Date.now(),
        },
        {
          userId: 'user3',
          dates: {
            '2026-12-30': 'unavailable',
            '2026-12-31': 'available',
          },
          updatedAt: Date.now(),
        },
      ];

      const nouvelAnFixedEvent = {
        id: 'evt-nouvel-an',
        groupId: 'grp-1',
        title: 'Nouvel An',
        description: 'Réveillon du 31',
        category: 'Soirée' as const,
        price: 0,
        createdBy: 'user1',
        createdAt: Date.now(),
        state: 'planifie' as const,
        dateMode: 'fixed' as const,
        finalDate: '2026-12-31',
        finalTimeSlot: 'Soirée' as const,
        participations: {
          user1: 'participating' as const,
          user2: 'participating' as const,
          user3: 'not_participating' as const, // user3 ne va pas au Nouvel An => reste dispo le 31 !
        },
      };

      const scoresForOtherEvent = service.calculateAvailability({
        currentEventId: 'evt-other',
        existingEvents: [nouvelAnFixedEvent],
        plannings,
        allMemberIds: ['user1', 'user2', 'user3'],
        dateMode: 'any',
      });

      const dec31 = scoresForOtherEvent.get('2026-12-31');
      expect(dec31).toBeDefined();
      // user1 et user2 participent au Nouvel An le 31 => décomptés sur toute la journée du 31 !
      // Seul user3 reste disponible (1/3 au lieu de 3/3)
      expect(dec31?.available).toEqual(['user3']);
      expect(dec31?.unavailable).toEqual(['user1', 'user2']);
      expect(dec31?.slots?.morning.available).toEqual(['user3']);
      expect(dec31?.slots?.afternoon.available).toEqual(['user3']);
      expect(dec31?.slots?.evening.available).toEqual(['user3']);
      expect(dec31?.busyReasons).toEqual({
        user1: ['Nouvel An'],
        user2: ['Nouvel An'],
      });

      // Le 30 décembre (2 dispos : user1 et user2) passe devant le 31 décembre (1 dispo) au Podium !
      expect(scoresForOtherEvent.get('2026-12-30')?.rank).toBe(1);
      expect(dec31?.rank).toBe(2);
    });

    it('decrements availability when another poll event has been confirmed (state: planifie), but NOT when still in sondage', () => {
      const plannings: GroupPlanning[] = [
        { userId: 'u1', dates: { '2026-10-25': 'available' }, updatedAt: 0 },
        { userId: 'u2', dates: { '2026-10-25': 'maybe' }, updatedAt: 0 },
      ];

      const confirmedEvent = {
        id: 'evt-confirmed',
        groupId: 'grp-1',
        title: 'Resto Confirmé',
        description: '',
        category: 'Restaurant' as const,
        price: 25,
        createdBy: 'u1',
        createdAt: 0,
        state: 'planifie' as const,
        dateMode: 'any' as const,
        finalDate: '2026-10-25',
        finalTimeSlot: 'Soirée' as const,
        participations: {
          u1: 'participating' as const,
          u2: 'participating' as const,
        },
      };

      const scoresWithConfirmed = service.calculateAvailability({
        currentEventId: 'evt-second',
        existingEvents: [confirmedEvent],
        plannings,
        allMemberIds: ['u1', 'u2'],
        dateMode: 'any',
      });

      const oct25 = scoresWithConfirmed.get('2026-10-25');
      expect(oct25?.available).toEqual([]);
      expect(oct25?.maybe).toEqual([]);
      expect(oct25?.unavailable).toEqual(['u1', 'u2']);
      expect(oct25?.count).toBe(0);
    });
  });
});

