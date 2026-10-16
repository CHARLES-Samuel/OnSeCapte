import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DayEventsModal } from './DayEventsModal';
import type { Event } from '../../../models/Event';
import type { GroupPlanning } from '../../../models/Group';

describe('DayEventsModal', () => {
  const events: Event[] = [
    {
      id: 'evt-1',
      groupId: 'grp-1',
      title: 'Soirée Poker',
      description: 'Chips et cartes',
      category: 'Gaming',
      price: 0,
      createdBy: 'u1',
      createdAt: Date.now(),
      state: 'planifie',
      finalDate: '2026-10-24',
    },
    {
      id: 'evt-2',
      groupId: 'grp-1',
      title: 'Restaurant Italien',
      description: 'Pizzas et pâtes',
      category: 'Restaurant',
      price: 25,
      createdBy: 'u2',
      createdAt: Date.now(),
      state: 'sondage',
      dates: ['2026-10-24'],
    },
  ];

  const plannings: GroupPlanning[] = [
    { userId: 'u1', dates: { '2026-10-24': 'available' }, updatedAt: 0 },
    { userId: 'u2', dates: { '2026-10-24': 'available' }, updatedAt: 0 },
    { userId: 'u3', dates: { '2026-10-24': 'unavailable' }, updatedAt: 0 },
  ];

  it('renders correctly with date, events list, and allows quick availability selection', () => {
    const handleUpdate = vi.fn();
    const handleClose = vi.fn();

    render(
      <BrowserRouter>
        <DayEventsModal
          isOpen={true}
          onClose={handleClose}
          dateStr="2026-10-24"
          events={events}
          groupId="grp-1"
          userAvailability="maybe"
          onUpdateAvailability={handleUpdate}
          plannings={plannings}
          totalMembers={3}
        />
      </BrowserRouter>
    );

    // Date affichée
    expect(screen.getByText(/24 octobre 2026/i)).toBeInTheDocument();

    // Événements présents
    expect(screen.getByText('Soirée Poker')).toBeInTheDocument();
    expect(screen.getByText('Restaurant Italien')).toBeInTheDocument();
    expect(screen.getByText(/2 sur 3 disponibles/i)).toBeInTheDocument();

    // Boutons de disponibilité
    const dispoBtn = screen.getByRole('button', { name: /^Dispo$/i });
    fireEvent.click(dispoBtn);
    expect(handleUpdate).toHaveBeenCalledWith('2026-10-24', 'available');

    // Fermeture
    const closeBtn = screen.getByRole('button', { name: /Fermer/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
