import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EventSynthesis } from './EventSynthesis';
import type { Event } from '../../../models/Event';

describe('EventSynthesis', () => {
  const mockEvent: Event = {
    id: 'event-1',
    groupId: 'group-1',
    title: 'Soirée Jeux',
    description: 'Une petite soirée sympa',
    category: 'Gaming',
    price: 0,
    createdBy: 'user-1',
    createdAt: Date.now(),
    state: 'sondage',
    dateMode: 'poll',
    participations: {
      'user-1': 'participating',
      'user-2': 'not_participating',
    },
  };

  const mockMemberProfiles = {
    'user-1': { uid: 'user-1', displayName: 'Alice' },
    'user-2': { uid: 'user-2', displayName: 'Bob' },
  };

  it('renders correctly and does NOT display any manual date picker option', () => {
    const onLock = vi.fn();

    render(
      <EventSynthesis
        event={mockEvent}
        respondedMembers={2}
        totalMembers={2}
        participations={mockEvent.participations}
        memberProfiles={mockMemberProfiles}
        memberIds={['user-1', 'user-2']}
        currentUserId="user-1"
        canLock={true}
        eventState="sondage"
        onLock={onLock}
      />
    );

    // Titre et statuts
    expect(screen.getByText('Disponibilités & Calendrier')).toBeInTheDocument();
    expect(screen.getByText('Alice (Moi)')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();

    // Vérifier l'absence formelle de l'option manuelle supprimée
    expect(screen.queryByText(/manuellement hors sondage/i)).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('Soirée')).not.toBeInTheDocument();
  });

  it('renders reopen poll button when event is locked', () => {
    const onLock = vi.fn();
    const onUnlock = vi.fn();

    const lockedEvent: Event = {
      ...mockEvent,
      state: 'planifie',
      finalDate: '2026-10-25',
      finalTimeSlot: 'Soirée',
    };

    render(
      <EventSynthesis
        event={lockedEvent}
        respondedMembers={2}
        totalMembers={2}
        participations={lockedEvent.participations}
        memberProfiles={mockMemberProfiles}
        memberIds={['user-1', 'user-2']}
        currentUserId="user-1"
        canLock={true}
        eventState="planifie"
        onLock={onLock}
        onUnlock={onUnlock}
      />
    );

    expect(screen.getByText("Synthèse de l'événement")).toBeInTheDocument();
    expect(screen.getByText(/Rouvrir le sondage \(Imprévu\)/i)).toBeInTheDocument();
    expect(screen.queryByText(/manuellement hors sondage/i)).not.toBeInTheDocument();
  });
});
