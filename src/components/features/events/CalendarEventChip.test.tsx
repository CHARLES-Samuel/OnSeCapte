import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CalendarEventChip } from './CalendarEventChip';
import type { Event } from '../../../models/Event';

describe('CalendarEventChip', () => {
  const baseEvent: Event = {
    id: 'evt-101',
    groupId: 'grp-test',
    title: 'Soirée Pizzas & Jeux',
    description: 'Venez nombreux',
    category: 'Repas',
    price: 15,
    createdBy: 'user-1',
    createdAt: Date.now(),
    state: 'planifie',
    finalDate: '2026-10-25',
  };

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  it('renders event title and correct accessibility aria-label', () => {
    renderWithRouter(
      <CalendarEventChip
        event={baseEvent}
        groupId="grp-test"
        dateStr="2026-10-25"
      />
    );

    expect(screen.getByText('Soirée Pizzas & Jeux')).toBeInTheDocument();
    const chip = screen.getByRole('button');
    expect(chip).toHaveAttribute('aria-label');
    expect(chip.getAttribute('aria-label')).toContain('Soirée Pizzas & Jeux');
    expect(chip.getAttribute('aria-label')).toContain('validé');
  });

  it('renders attenuated style with consensus for poll state', () => {
    const pollEvent: Event = {
      ...baseEvent,
      state: 'sondage',
    };

    renderWithRouter(
      <CalendarEventChip
        event={pollEvent}
        groupId="grp-test"
        dateStr="2026-10-25"
        consensusText="4 sur 5 disponibles"
        consensusShortText="4/5"
      />
    );

    const chip = screen.getByRole('button');
    expect(chip.className).toContain('border-dashed');
    expect(screen.getByText('4/5')).toBeInTheDocument();
    expect(chip.getAttribute('aria-label')).toContain('4 sur 5 disponibles');
    expect(chip.getAttribute('aria-label')).toContain('en sondage');
  });

  it('renders dimmed/grayed out style for past events', () => {
    const pastEvent: Event = {
      ...baseEvent,
      state: 'passe',
    };

    renderWithRouter(
      <CalendarEventChip
        event={pastEvent}
        groupId="grp-test"
        dateStr="2026-10-01"
        isPastDate={true}
      />
    );

    const chip = screen.getByRole('button');
    expect(chip.className).toContain('opacity-60');
    expect(chip.getAttribute('aria-label')).toContain('passé');
  });

  it('triggers onSelectEvent and stops click propagation', () => {
    const onSelect = vi.fn();
    const parentClick = vi.fn();

    renderWithRouter(
      <div onClick={parentClick}>
        <CalendarEventChip
          event={baseEvent}
          groupId="grp-test"
          dateStr="2026-10-25"
          onSelectEvent={onSelect}
        />
      </div>
    );

    const chip = screen.getByRole('button');
    fireEvent.click(chip);

    expect(onSelect).toHaveBeenCalledWith(baseEvent);
    expect(parentClick).not.toHaveBeenCalled();
  });

  it('supports keyboard navigation via Enter and Space keys', () => {
    const onSelect = vi.fn();

    renderWithRouter(
      <CalendarEventChip
        event={baseEvent}
        groupId="grp-test"
        dateStr="2026-10-25"
        onSelectEvent={onSelect}
      />
    );

    const chip = screen.getByRole('button');
    fireEvent.keyDown(chip, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(chip, { key: ' ' });
    expect(onSelect).toHaveBeenCalledTimes(2);
  });
});
