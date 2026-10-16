import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { GroupPlanningTab } from './GroupPlanningTab';
import type { Event } from '../../../models/Event';
import type { GroupPlanning } from '../../../models/Group';

describe('GroupPlanningTab - Event Visualization', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const basePlannings: GroupPlanning[] = [
    {
      userId: 'user-me',
      dates: { '2026-10-15': 'available' },
      updatedAt: 0,
    },
  ];

  it('renders events on their target days and shows overflow button for >2 events', () => {
    const events: Event[] = [
      {
        id: 'e1',
        groupId: 'grp-test',
        title: 'Resto Burger',
        description: '',
        category: 'Restaurant',
        price: 20,
        createdBy: 'u1',
        createdAt: 0,
        state: 'planifie',
        finalDate: '2026-10-15',
      },
      {
        id: 'e2',
        groupId: 'grp-test',
        title: 'Session D&D',
        description: '',
        category: 'Jeux de rôle',
        price: 0,
        createdBy: 'u1',
        createdAt: 0,
        state: 'sondage',
        dates: ['2026-10-15', '2026-10-20'],
      },
      {
        id: 'e3',
        groupId: 'grp-test',
        title: 'Tournoi Smash',
        description: '',
        category: 'Gaming',
        price: 0,
        createdBy: 'u2',
        createdAt: 0,
        state: 'planifie',
        finalDate: '2026-10-15',
      },
    ];

    render(
      <BrowserRouter>
        <GroupPlanningTab
          groupId="grp-test"
          currentUserId="user-me"
          plannings={basePlannings}
          onUpdatePlanning={vi.fn().mockResolvedValue(true)}
          events={events}
          totalMembers={3}
        />
      </BrowserRouter>
    );

    // Les deux premiers événements sont affichés sur le 15
    expect(screen.getByText('Resto Burger')).toBeInTheDocument();
    expect(screen.getAllByText('Session D&D').length).toBe(2); // Présent le 15 et le 20 !

    // Le troisième déclenche le bouton d'overflow "+1 autre"
    const overflowButton = screen.getByRole('button', { name: /\+1 autre/i });
    expect(overflowButton).toBeInTheDocument();

    // Cliquer sur le débordement ouvre la modale DayEventsModal
    fireEvent.click(overflowButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Tournoi Smash')).toBeInTheDocument();
  });

  it('an event with 2 dates appears on both days of the calendar', () => {
    const multiDateEvent: Event = {
      id: 'e-multi',
      groupId: 'grp-test',
      title: 'LAN Party',
      description: '',
      category: 'Gaming',
      price: 0,
      createdBy: 'u1',
      createdAt: 0,
      state: 'sondage',
      dates: ['2026-10-18', '2026-10-25'],
    };

    render(
      <BrowserRouter>
        <GroupPlanningTab
          groupId="grp-test"
          currentUserId="user-me"
          plannings={basePlannings}
          onUpdatePlanning={vi.fn().mockResolvedValue(true)}
          events={[multiDateEvent]}
          totalMembers={3}
        />
      </BrowserRouter>
    );

    // Vérifie la présence des pastilles sur les deux jours
    const day18 = screen.getByTestId('planning-day-2026-10-18');
    const day25 = screen.getByTestId('planning-day-2026-10-25');

    expect(day18).toHaveTextContent('LAN Party');
    expect(day25).toHaveTextContent('LAN Party');
  });

  it('toggles visibility of events when clicking the Sorties switch', () => {
    const singleEvent: Event = {
      id: 'e-single',
      groupId: 'grp-test',
      title: 'Cinéma Batman',
      description: '',
      category: 'Autres',
      price: 12,
      createdBy: 'u1',
      createdAt: 0,
      state: 'planifie',
      finalDate: '2026-10-22',
    };

    render(
      <BrowserRouter>
        <GroupPlanningTab
          groupId="grp-test"
          currentUserId="user-me"
          plannings={basePlannings}
          onUpdatePlanning={vi.fn().mockResolvedValue(true)}
          events={[singleEvent]}
          totalMembers={3}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Cinéma Batman')).toBeInTheDocument();

    // Clic sur l'interrupteur Sorties
    const toggleBtn = screen.getByTitle(/Masquer les sorties sur le calendrier/i);
    fireEvent.click(toggleBtn);

    // Les événements sont maintenant masqués
    expect(screen.queryByText('Cinéma Batman')).not.toBeInTheDocument();
  });
});
