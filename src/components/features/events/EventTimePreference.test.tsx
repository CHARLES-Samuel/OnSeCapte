import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useState } from 'react';
import { EventDateModeSelector } from './EventDateModeSelector';
import { EventCard } from './EventCard';
import { EventListItem } from './EventListItem';
import { EventTimePreferenceBadge } from './EventTimePreferenceBadge';
import type { Event, EventDateMode, TimeSlot } from '../../../models/Event';
import type { DaySlot } from '../../../models/Group';

const SelectorHarness = ({ initialMode = 'any' as EventDateMode }) => {
  const [mode, setMode] = useState<EventDateMode>(initialMode);
  const [pref, setPref] = useState<DaySlot[]>([]);
  const [slot, setSlot] = useState<TimeSlot>('Soirée');

  return (
    <EventDateModeSelector
      dateMode={mode}
      onDateModeChange={setMode}
      startDate="2026-12-10"
      onStartDateChange={vi.fn()}
      endDate="2026-12-20"
      onEndDateChange={vi.fn()}
      finalDate=""
      onFinalDateChange={vi.fn()}
      finalTimeSlot={slot}
      onFinalTimeSlotChange={setSlot}
      timePreference={pref}
      onTimePreferenceChange={setPref}
    />
  );
};

describe('EventTimePreference (Selector & Badges)', () => {
  it('shows Moment de la journée souhaité in any and range modes, hides in fixed mode, and supports multi-selection', () => {
    render(<SelectorHarness initialMode="any" />);

    expect(screen.getByText('Moment de la journée souhaité')).toBeInTheDocument();
    const anyBtn = screen.getByRole('button', { name: /Peu importe/i });
    const morningBtn = screen.getByRole('button', { name: /Matin/i });
    const afternoonBtn = screen.getByRole('button', { name: /Après-midi/i });
    const eveningBtn = screen.getByRole('button', { name: /Soirée/i });

    // Défaut : Peu importe sélectionné
    expect(anyBtn).toHaveAttribute('aria-pressed', 'true');
    expect(eveningBtn).toHaveAttribute('aria-pressed', 'false');

    // Sélection Soirée + Après-midi
    fireEvent.click(eveningBtn);
    expect(anyBtn).toHaveAttribute('aria-pressed', 'false');
    expect(eveningBtn).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(afternoonBtn);
    expect(afternoonBtn).toHaveAttribute('aria-pressed', 'true');
    expect(eveningBtn).toHaveAttribute('aria-pressed', 'true');

    // Sélectionner le 3e (Matin) ramène automatiquement à Peu importe
    fireEvent.click(morningBtn);
    expect(anyBtn).toHaveAttribute('aria-pressed', 'true');
    expect(morningBtn).toHaveAttribute('aria-pressed', 'false');

    // Toujours présent en mode Plage de dates
    fireEvent.click(screen.getByRole('button', { name: /Plage de dates/i }));
    expect(screen.getByText('Moment de la journée souhaité')).toBeInTheDocument();

    // Masqué en mode Date fixe (qui porte son propre sélecteur d'heure fixe)
    fireEvent.click(screen.getByRole('button', { name: /Date fixe/i }));
    expect(screen.queryByText('Moment de la journée souhaité')).not.toBeInTheDocument();
  });

  it('displays timePreference badge on EventCard, EventListItem, and Header when set, and hides when Peu importe', () => {
    const baseEvent: Event = {
      id: 'ev-1',
      groupId: 'grp-1',
      title: 'Dîner Ramen',
      description: 'Miam',
      category: 'Restaurant',
      price: 20,
      createdBy: 'u-1',
      createdAt: Date.now(),
      state: 'sondage',
      dateMode: 'range',
      startDate: '2026-12-10',
      endDate: '2026-12-20',
    };

    // Événement existant sans timePreference (= Peu importe) => aucun badge
    const { unmount } = render(
      <MemoryRouter>
        <EventCard
          event={baseEvent}
          groupId="grp-1"
          canEditOrDelete={false}
          creator={{ name: 'Samuel' }}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(screen.queryByTitle(/Moment souhaité/i)).not.toBeInTheDocument();
    unmount();

    // Événement avec préférence Après-midi + Soirée => badge affiché sur carte, ligne et header
    const eventWithPref: Event = {
      ...baseEvent,
      timePreference: ['afternoon', 'evening'],
    };

    render(
      <MemoryRouter>
        <EventCard
          event={eventWithPref}
          groupId="grp-1"
          canEditOrDelete={false}
          creator={{ name: 'Samuel' }}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
        <EventListItem
          event={eventWithPref}
          groupId="grp-1"
          canEditOrDelete={false}
          creator={{ name: 'Samuel' }}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
        <EventTimePreferenceBadge event={eventWithPref} variant="header" hideWhenLocked={false} />
      </MemoryRouter>
    );

    const badges = screen.getAllByText('Après-midi • Soirée');
    expect(badges).toHaveLength(3);
  });
});

