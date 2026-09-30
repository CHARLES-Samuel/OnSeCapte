import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventViewToggle } from './EventViewToggle';

describe('EventViewToggle', () => {
  it('renders a single icon button without any visible text in grid mode', () => {
    const handleChange = vi.fn();
    render(<EventViewToggle viewMode="grid" onChange={handleChange} />);

    // Should only have 1 button
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);

    const button = buttons[0];
    expect(button.textContent?.trim()).toBe('');
    expect(button).toHaveAttribute('aria-label', 'Passer en affichage liste');
    expect(button).toHaveAttribute('title', 'Passer en affichage liste');

    fireEvent.click(button);
    expect(handleChange).toHaveBeenCalledWith('list');
  });

  it('renders in list mode and triggers switch to grid mode when clicked', () => {
    const handleChange = vi.fn();
    render(<EventViewToggle viewMode="list" onChange={handleChange} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);

    const button = buttons[0];
    expect(button.textContent?.trim()).toBe('');
    expect(button).toHaveAttribute('aria-label', 'Passer en affichage grille');
    expect(button).toHaveAttribute('title', 'Passer en affichage grille');

    fireEvent.click(button);
    expect(handleChange).toHaveBeenCalledWith('grid');
  });
});
