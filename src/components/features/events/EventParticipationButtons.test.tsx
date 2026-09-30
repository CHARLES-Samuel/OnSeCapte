import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventParticipationButtons } from './EventParticipationButtons';

describe('EventParticipationButtons', () => {
  it('Renders "compact" variant (used by EventListItem) and handles selection', () => {
    const handleSelect = vi.fn();

    render(
      <EventParticipationButtons
        variant="compact"
        currentParticipation={undefined}
        onSelect={handleSelect}
      />
    );

    const participateBtn = screen.getByTitle('Je participe');
    const declineBtn = screen.getByTitle('Pas disponible');

    expect(participateBtn).toBeInTheDocument();
    expect(declineBtn).toBeInTheDocument();

    fireEvent.click(participateBtn);
    expect(handleSelect).toHaveBeenCalledWith('participating');

    fireEvent.click(declineBtn);
    expect(handleSelect).toHaveBeenCalledWith('not_participating');
  });

  it('Stops click propagation in compact variant so parent click does not trigger navigation', () => {
    const handleSelect = vi.fn();
    const handleParentClick = vi.fn();

    render(
      <div onClick={handleParentClick}>
        <EventParticipationButtons
          variant="compact"
          onSelect={handleSelect}
        />
      </div>
    );

    const btn = screen.getByTitle('Je participe');
    fireEvent.click(btn);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleParentClick).not.toHaveBeenCalled();
  });

  it('Renders "card" variant (used by EventCard)', () => {
    const handleSelect = vi.fn();

    render(
      <EventParticipationButtons
        variant="card"
        currentParticipation="participating"
        onSelect={handleSelect}
      />
    );

    const participateBtn = screen.getByRole('button', { name: /je participe/i });
    expect(participateBtn).toHaveAttribute('aria-pressed', 'true');

    const declineBtn = screen.getByRole('button', { name: /pas dispo/i });
    expect(declineBtn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(declineBtn);
    expect(handleSelect).toHaveBeenCalledWith('not_participating');
  });

  it('Renders "full" variant (used by UserAvailabilityForm / detail page)', () => {
    const handleSelect = vi.fn();

    render(
      <EventParticipationButtons
        variant="full"
        currentParticipation="not_participating"
        onSelect={handleSelect}
      />
    );

    const declineBtn = screen.getByRole('button', { name: /pas dispo/i });
    expect(declineBtn).toHaveAttribute('aria-pressed', 'true');

    const participateBtn = screen.getByRole('button', { name: /je participe/i });
    expect(participateBtn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(participateBtn);
    expect(handleSelect).toHaveBeenCalledWith('participating');
  });

  it('Disables buttons when isLoading is true', () => {
    const handleSelect = vi.fn();

    render(
      <EventParticipationButtons
        variant="full"
        isLoading={true}
        onSelect={handleSelect}
      />
    );

    const participateBtn = screen.getByRole('button', { name: /je participe/i });
    expect(participateBtn).toBeDisabled();

    fireEvent.click(participateBtn);
    expect(handleSelect).not.toHaveBeenCalled();
  });
});
