import { describe, it, expect, vi } from 'vitest';
import {
  isUserPlanningCompleted,
  processEventParticipation,
} from './eventParticipationService';
import type { GroupPlanning } from '../models/Group';

describe('eventParticipationService', () => {
  describe('isUserPlanningCompleted', () => {
    it('returns false when plannings list is empty', () => {
      expect(isUserPlanningCompleted([], 'user1')).toBe(false);
    });

    it('returns false when user is not found in plannings', () => {
      const plannings: GroupPlanning[] = [
        { userId: 'user2', updatedAt: Date.now(), dates: { '2026-10-01': 'available' } },
      ];
      expect(isUserPlanningCompleted(plannings, 'user1')).toBe(false);
    });

    it('returns false when user has planning with empty dates', () => {
      const plannings: GroupPlanning[] = [
        { userId: 'user1', updatedAt: Date.now(), dates: {} },
      ];
      expect(isUserPlanningCompleted(plannings, 'user1')).toBe(false);
    });

    it('returns false safely when user planning dates is undefined or null', () => {
      const plannings = [
        { userId: 'user1', updatedAt: Date.now(), dates: undefined as any },
      ];
      expect(isUserPlanningCompleted(plannings, 'user1')).toBe(false);
    });

    it('returns true when user has at least one date set', () => {
      const plannings: GroupPlanning[] = [
        { userId: 'user1', updatedAt: Date.now(), dates: { '2026-10-01': 'available' } },
      ];
      expect(isUserPlanningCompleted(plannings, 'user1')).toBe(true);
    });
  });

  describe('processEventParticipation (liste et détail)', () => {
    it('Gère le cas "calendrier vide depuis la liste" en initialisant le planning à la volée et en enregistrant la participation', async () => {
      const updateParticipationFn = vi.fn().mockResolvedValue(undefined);
      const updatePlanningFn = vi.fn().mockResolvedValue(undefined);

      // Aucun planning existant pour l'utilisateur
      const plannings: GroupPlanning[] = [];

      const result = await processEventParticipation({
        groupId: 'group-123',
        eventId: 'event-456',
        userId: 'user-new',
        participation: 'participating',
        plannings,
        updateParticipationFn,
        updatePlanningFn,
      });

      // 1. Initialisation à la volée du planning vide dans le groupe
      expect(updatePlanningFn).toHaveBeenCalledTimes(1);
      expect(updatePlanningFn).toHaveBeenCalledWith('group-123', 'user-new', {});

      // 2. Enregistrement systématique de la participation
      expect(updateParticipationFn).toHaveBeenCalledTimes(1);
      expect(updateParticipationFn).toHaveBeenCalledWith('event-456', 'user-new', 'participating');

      // 3. Résultat cohérent
      expect(result).toEqual({
        success: true,
        initializedPlanning: true,
        hasFilledPlanning: false,
      });
    });

    it('Gère le cas "calendrier non vide depuis la liste" sans écraser le planning existant', async () => {
      const updateParticipationFn = vi.fn().mockResolvedValue(undefined);
      const updatePlanningFn = vi.fn().mockResolvedValue(undefined);

      const plannings: GroupPlanning[] = [
        {
          userId: 'user-existing',
          updatedAt: Date.now(),
          dates: { '2026-10-05': 'available', '2026-10-06': 'maybe' },
        },
      ];

      const result = await processEventParticipation({
        groupId: 'group-123',
        eventId: 'event-456',
        userId: 'user-existing',
        participation: 'participating',
        plannings,
        updateParticipationFn,
        updatePlanningFn,
      });

      // Le planning ne doit PAS être réinitialisé
      expect(updatePlanningFn).not.toHaveBeenCalled();

      // La participation est enregistrée
      expect(updateParticipationFn).toHaveBeenCalledTimes(1);
      expect(updateParticipationFn).toHaveBeenCalledWith('event-456', 'user-existing', 'participating');

      expect(result).toEqual({
        success: true,
        initializedPlanning: false,
        hasFilledPlanning: true,
      });
    });

    it('Gère le cas "calendrier vide depuis la page de détail" avec le même comportement et résultat', async () => {
      const updateParticipationFn = vi.fn().mockResolvedValue(undefined);
      const updatePlanningFn = vi.fn().mockResolvedValue(undefined);

      // Utilisateur sans entrée de planning
      const plannings: GroupPlanning[] = [];

      const result = await processEventParticipation({
        groupId: 'group-123',
        eventId: 'event-456',
        userId: 'user-detail',
        participation: 'not_participating',
        plannings,
        updateParticipationFn,
        updatePlanningFn,
      });

      expect(updatePlanningFn).toHaveBeenCalledWith('group-123', 'user-detail', {});
      expect(updateParticipationFn).toHaveBeenCalledWith('event-456', 'user-detail', 'not_participating');
      expect(result.success).toBe(true);
      expect(result.initializedPlanning).toBe(true);
      expect(result.hasFilledPlanning).toBe(false);
    });

    it('Gère le cas "calendrier non vide depuis la page de détail"', async () => {
      const updateParticipationFn = vi.fn().mockResolvedValue(undefined);
      const updatePlanningFn = vi.fn().mockResolvedValue(undefined);

      const plannings: GroupPlanning[] = [
        {
          userId: 'user-detail',
          updatedAt: Date.now(),
          dates: { '2026-11-01': 'available' },
        },
      ];

      const result = await processEventParticipation({
        groupId: 'group-123',
        eventId: 'event-456',
        userId: 'user-detail',
        participation: 'participating',
        plannings,
        updateParticipationFn,
        updatePlanningFn,
      });

      expect(updatePlanningFn).not.toHaveBeenCalled();
      expect(updateParticipationFn).toHaveBeenCalledWith('event-456', 'user-detail', 'participating');
      expect(result.success).toBe(true);
      expect(result.initializedPlanning).toBe(false);
      expect(result.hasFilledPlanning).toBe(true);
    });

    it('Ne lève pas d\'erreur si userPlanning existe avec des dates null ou undefined', async () => {
      const updateParticipationFn = vi.fn().mockResolvedValue(undefined);
      const updatePlanningFn = vi.fn().mockResolvedValue(undefined);

      const plannings = [
        {
          userId: 'user-corrupted',
          updatedAt: Date.now(),
          dates: null as any,
        },
      ];

      const result = await processEventParticipation({
        groupId: 'group-123',
        eventId: 'event-456',
        userId: 'user-corrupted',
        participation: 'participating',
        plannings,
        updateParticipationFn,
        updatePlanningFn,
      });

      expect(result.success).toBe(true);
      expect(result.hasFilledPlanning).toBe(false);
      expect(updateParticipationFn).toHaveBeenCalledWith('event-456', 'user-corrupted', 'participating');
    });
  });
});
