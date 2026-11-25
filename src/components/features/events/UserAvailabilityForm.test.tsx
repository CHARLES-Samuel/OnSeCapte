import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserAvailabilityForm } from './UserAvailabilityForm';
import type { EventParticipation } from '../../../models/Event';

describe('UserAvailabilityForm', () => {
  const memberProfiles = {
    'me-uid': { uid: 'me-uid', displayName: 'Samuel' },
    'other-uid': { uid: 'other-uid', displayName: 'Claire' },
  };

  it('renders Statut des membres directly below the participation buttons and updates immediately on click', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    const { rerender } = render(
      <MemoryRouter>
        <UserAvailabilityForm
          isLocked={false}
          currentUserResponse="pending"
          onSave={onSave}
          hasCompletedPlanning={true}
          groupId="group-1"
          participations={{ 'other-uid': 'participating' }}
          memberProfiles={memberProfiles}
          currentUserId="me-uid"
          showMemberStatuses={true}
        />
      </MemoryRouter>
    );

    const participateBtn = screen.getByRole('button', { name: /je participe/i });
    const declineBtn = screen.getByRole('button', { name: /pas dispo/i });
    const statusHeading = screen.getByText('Statut des membres (1)');

    // Le bloc Statut des membres est placé juste sous les boutons
    expect(
      declineBtn.compareDocumentPosition(statusHeading) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(screen.getByText('Claire')).toBeInTheDocument();

    // Clic sur "Je participe" : mise à jour optimiste immédiate dans la liste et le compteur
    fireEvent.click(participateBtn);

    expect(screen.getByText('Statut des membres (2)')).toBeInTheDocument();
    expect(screen.getByText('Samuel')).toBeInTheDocument();
    expect(screen.getByText('Moi')).toBeInTheDocument();

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('participating');
    });

    // Réception temps réel d'une mise à jour d'un autre membre
    const updatedParticipations: Record<string, EventParticipation> = {
      'me-uid': 'participating',
      'other-uid': 'not_participating',
    };

    rerender(
      <MemoryRouter>
        <UserAvailabilityForm
          isLocked={false}
          currentUserResponse="participating"
          onSave={onSave}
          hasCompletedPlanning={true}
          groupId="group-1"
          participations={updatedParticipations}
          memberProfiles={memberProfiles}
          currentUserId="me-uid"
          showMemberStatuses={true}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Statut des membres (2)')).toBeInTheDocument();
    expect(screen.getAllByText('Pas dispo').length).toBeGreaterThanOrEqual(2); // Bouton + statut de Claire
  });

  it('hides Statut des membres when showMemberStatuses is false (fixed date event)', () => {
    render(
      <MemoryRouter>
        <UserAvailabilityForm
          isLocked={true}
          currentUserResponse="participating"
          onSave={vi.fn()}
          hasCompletedPlanning={true}
          groupId="group-1"
          participations={{ 'me-uid': 'participating' }}
          memberProfiles={memberProfiles}
          currentUserId="me-uid"
          showMemberStatuses={false}
        />
      </MemoryRouter>
    );

    expect(screen.queryByText(/Statut des membres/i)).not.toBeInTheDocument();
  });
});

