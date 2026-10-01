import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AvailabilityHeatmapLegend } from './AvailabilityHeatmapLegend';

describe('AvailabilityHeatmapLegend', () => {
  it('renders all 5 availability percentage tiers (0%, 25%, 50%, 75%, 100%)', () => {
    render(<AvailabilityHeatmapLegend />);

    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders podium ranks (1er, 2e, 3e), selection and today indicators', () => {
    render(<AvailabilityHeatmapLegend />);

    expect(screen.getByText(/1er/i)).toBeInTheDocument();
    expect(screen.getByText(/2e/i)).toBeInTheDocument();
    expect(screen.getByText(/3e/i)).toBeInTheDocument();
    expect(screen.getByText(/Sélectionné/i)).toBeInTheDocument();
    expect(screen.getByText(/Aujourd'hui/i)).toBeInTheDocument();
  });

  it('toggles visibility when accordion button is clicked', () => {
    render(<AvailabilityHeatmapLegend defaultExpanded={true} />);

    expect(screen.getByText('0%')).toBeInTheDocument();

    const toggleButton = screen.getByRole('button', { name: /Masquer la légende/i });
    fireEvent.click(toggleButton);

    expect(screen.queryByText('0%')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Afficher la légende/i }));
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});
