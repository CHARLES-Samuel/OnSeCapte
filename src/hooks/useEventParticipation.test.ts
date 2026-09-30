import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEventParticipation } from './useEventParticipation';
import * as eventParticipationService from '../services/eventParticipationService';

// Mock useAuth
vi.mock('./useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'user-123', displayName: 'Samuel' },
  }),
}));

describe('useEventParticipation hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('appelle processEventParticipation et met à jour le toast pour un calendrier vide', async () => {
    const processSpy = vi.spyOn(eventParticipationService, 'processEventParticipation').mockResolvedValue({
      success: true,
      initializedPlanning: true,
      hasFilledPlanning: false,
    });

    const { result } = renderHook(() =>
      useEventParticipation({
        groupId: 'group-1',
        plannings: [],
      })
    );

    await act(async () => {
      const res = await result.current.submitParticipation('event-1', 'participating');
      expect(res?.success).toBe(true);
      expect(res?.initializedPlanning).toBe(true);
    });

    expect(processSpy).toHaveBeenCalledWith({
      groupId: 'group-1',
      eventId: 'event-1',
      userId: 'user-123',
      participation: 'participating',
      plannings: [],
    });

    expect(result.current.toastConfig.isOpen).toBe(true);
    expect(result.current.toastConfig.message).toContain('Pensez à renseigner votre planning');
    expect(result.current.toastConfig.variant).toBe('info');
  });

  it('appelle processEventParticipation pour un calendrier non vide avec message de succès', async () => {
    vi.spyOn(eventParticipationService, 'processEventParticipation').mockResolvedValue({
      success: true,
      initializedPlanning: false,
      hasFilledPlanning: true,
    });

    const { result } = renderHook(() =>
      useEventParticipation({
        groupId: 'group-1',
        plannings: [{ userId: 'user-123', updatedAt: Date.now(), dates: { '2026-10-10': 'available' } }],
      })
    );

    await act(async () => {
      await result.current.submitParticipation('event-1', 'participating');
    });

    expect(result.current.toastConfig.isOpen).toBe(true);
    expect(result.current.toastConfig.message).toContain('Votre participation a bien été enregistrée');
    expect(result.current.toastConfig.variant).toBe('success');
  });

  it('enregistre l\'indisponibilité ("Pas dispo") et affiche le message adapté', async () => {
    vi.spyOn(eventParticipationService, 'processEventParticipation').mockResolvedValue({
      success: true,
      initializedPlanning: true,
      hasFilledPlanning: false,
    });

    const { result } = renderHook(() =>
      useEventParticipation({
        groupId: 'group-1',
        plannings: [],
      })
    );

    await act(async () => {
      await result.current.submitParticipation('event-1', 'not_participating');
    });

    expect(result.current.toastConfig.isOpen).toBe(true);
    expect(result.current.toastConfig.message).toBe('Votre indisponibilité a été prise en compte.');
  });
});
