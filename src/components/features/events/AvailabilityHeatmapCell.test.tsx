import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AvailabilityHeatmapCell } from './AvailabilityHeatmapCell';
import type { DateAvailabilityScore } from '../../../models/Availability';

describe('AvailabilityHeatmapCell', () => {
  const baseScore: DateAvailabilityScore = {
    date: '2026-10-15',
    timeSlot: 'Toute la journée',
    available: ['u1', 'u2', 'u3'],
    maybe: [],
    unavailable: ['u4', 'u5'],
    score: 6,
    availableRatio: 0.6,
    count: 3,
    totalMembers: 5,
  };

  it('renders day number and availability ratio in format "X/Y" without truncated words', () => {
    render(
      <AvailabilityHeatmapCell
        dayNumber={15}
        dateStr="2026-10-15"
        score={baseScore}
        totalMembers={5}
        isInRange={true}
        isSelected={false}
        isToday={false}
        onClick={vi.fn()}
      />
    );

    expect(screen.getByText('15')).toBeInTheDocument();
    // Doit afficher "3/5", sans aucun texte tronqué "3 di..."
    expect(screen.getByText('3/5')).toBeInTheDocument();
    expect(screen.queryByText(/dispo/i)).not.toBeInTheDocument();
  });

  it('renders "0/5" clearly when 0 members are available', () => {
    const zeroScore: DateAvailabilityScore = {
      ...baseScore,
      available: [],
      availableRatio: 0,
      count: 0,
    };

    render(
      <AvailabilityHeatmapCell
        dayNumber={16}
        dateStr="2026-10-16"
        score={zeroScore}
        totalMembers={5}
        isInRange={true}
        isSelected={false}
        isToday={false}
        onClick={vi.fn()}
      />
    );

    expect(screen.getByText('16')).toBeInTheDocument();
    expect(screen.getByText('0/5')).toBeInTheDocument();
  });

  it('displays podium badge with medal and numeric rank (1, 2, 3) for colorblind users', () => {
    const podiumScore: DateAvailabilityScore = {
      ...baseScore,
      rank: 1,
    };

    render(
      <AvailabilityHeatmapCell
        dayNumber={15}
        dateStr="2026-10-15"
        score={podiumScore}
        totalMembers={5}
        isInRange={true}
        isSelected={false}
        isToday={false}
        onClick={vi.fn()}
      />
    );

    // Vérifie la présence de la médaille et du chiffre 1
    const podiumBadge = screen.getByLabelText(/Top #1/i);
    expect(podiumBadge).toBeInTheDocument();
    expect(podiumBadge).toHaveTextContent('🥇');
    expect(podiumBadge).toHaveTextContent('1');
  });

  it('renders distinct selection ring when isSelected is true without interfering with podium', () => {
    const { container } = render(
      <AvailabilityHeatmapCell
        dayNumber={15}
        dateStr="2026-10-15"
        score={baseScore}
        totalMembers={5}
        isInRange={true}
        isSelected={true}
        isToday={false}
        onClick={vi.fn()}
      />
    );

    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
    expect(button?.className).toContain('ring-2');
    expect(button?.className).toContain('ring-primary-400');
    expect(button?.className).toContain('ring-offset-2');
  });

  it('shows an indicator when isToday is true', () => {
    render(
      <AvailabilityHeatmapCell
        dayNumber={1}
        dateStr="2026-10-01"
        score={baseScore}
        totalMembers={5}
        isInRange={true}
        isSelected={false}
        isToday={true}
        onClick={vi.fn()}
      />
    );

    const todayIndicator = screen.getByLabelText(/Aujourd'hui/i);
    expect(todayIndicator).toBeInTheDocument();
  });

  it('calls onClick when in range and clicked', () => {
    const handleClick = vi.fn();
    render(
      <AvailabilityHeatmapCell
        dayNumber={15}
        dateStr="2026-10-15"
        score={baseScore}
        totalMembers={5}
        isInRange={true}
        isSelected={false}
        isToday={false}
        onClick={handleClick}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders a disabled placeholder when out of range', () => {
    render(
      <AvailabilityHeatmapCell
        dayNumber={24}
        dateStr="2026-10-24"
        score={baseScore}
        totalMembers={5}
        isInRange={false}
        isSelected={false}
        isToday={false}
        onClick={vi.fn()}
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByTitle('Hors de la plage de recherche')).toBeInTheDocument();
  });
});
