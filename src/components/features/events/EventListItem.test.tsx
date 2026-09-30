import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EventListItem } from './EventListItem';
import type { Event } from '../../../models/Event';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('EventListItem', () => {
  const sampleEvent: Event = {
    id: 'ev-123',
    groupId: 'group-abc',
    title: 'Super Soirée Pizza & Jeux de Société',
    description: 'Une description détaillée pour passer une bonne soirée.',
    category: 'Soirée',
    price: 15,
    createdBy: 'user-creator',
    createdAt: Date.now(),
    state: 'planifie',
    finalDate: '2026-10-15',
    location: 'Chez Samuel',
    participations: {
      'user-creator': 'participating',
    },
  };

  const creator = { name: 'Samuel', photoUrl: null };

  it('renders line 1 with price and category before title, with fixed width columns', () => {
    render(
      <MemoryRouter>
        <EventListItem
          event={sampleEvent}
          groupId="group-abc"
          canEditOrDelete={true}
          creator={creator}
          currentUserId="user-creator"
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      </MemoryRouter>
    );

    // Price
    const priceElement = screen.getByText('15 €');
    expect(priceElement).toBeDefined();
    expect(priceElement.className).toContain('w-14');
    expect(priceElement.className).toContain('shrink-0');
    expect(priceElement.className).toContain('text-center');

    // Category container
    const categoryBadge = screen.getByText('Soirée');
    expect(categoryBadge).toBeDefined();
    const categoryContainer = categoryBadge.closest('.shrink-0');
    expect(categoryContainer?.className).toContain('w-24');

    // Title
    const titleElement = screen.getByRole('heading', { level: 3 });
    expect(titleElement.textContent).toBe('Super Soirée Pizza & Jeux de Société');
    expect(titleElement.className).toContain('truncate');
    expect(titleElement.className).toContain('flex-1');
    expect(titleElement.className).toContain('min-w-0');

    // Actions menu button
    const menuButton = screen.getByRole('button', { name: "Options de l'événement" });
    expect(menuButton).toBeDefined();
  });

  it('renders line 2 with date badge, location, and participation stats', () => {
    render(
      <MemoryRouter>
        <EventListItem
          event={sampleEvent}
          groupId="group-abc"
          canEditOrDelete={false}
          creator={creator}
          currentUserId="user-other"
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      </MemoryRouter>
    );

    // Date badge
    expect(screen.getByText('15/10/2026')).toBeDefined();

    // Location
    expect(screen.getByText('Chez Samuel')).toBeDefined();

    // Participation badge
    expect(screen.getByText(/1 part\./i)).toBeDefined();

    // Action menu should NOT be rendered when canEditOrDelete is false
    expect(screen.queryByRole('button', { name: "Options de l'événement" })).toBeNull();
  });

  it('navigates to event details when the row is clicked', () => {
    render(
      <MemoryRouter>
        <EventListItem
          event={sampleEvent}
          groupId="group-abc"
          canEditOrDelete={false}
          creator={creator}
          currentUserId="user-other"
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      </MemoryRouter>
    );

    const titleElement = screen.getByRole('heading', { level: 3 });
    fireEvent.click(titleElement);
    expect(mockNavigate).toHaveBeenCalledWith('/groups/group-abc/events/ev-123');
  });
});
