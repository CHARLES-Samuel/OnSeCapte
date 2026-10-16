import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DayMemberChip } from './DayMemberChip';

describe('DayMemberChip', () => {
  it('truncates long names and displays full name in title attribute', () => {
    const longName = 'Lucas Maximilien De La Tour Du Pin';
    render(
      <DayMemberChip
        uid="user-1"
        profile={{ uid: 'user-1', displayName: longName }}
        isMe={false}
        status="available"
      />
    );

    const nameEl = screen.getByText(longName);
    expect(nameEl).toHaveClass('truncate');
    
    // Le conteneur du chip doit avoir un title complet
    const chipContainer = nameEl.closest('div');
    expect(chipContainer).toHaveAttribute('title', longName);
  });

  it('renders a distinct badge for current user instead of concatenating inside the name', () => {
    render(
      <DayMemberChip
        uid="user-me"
        profile={{ uid: 'user-me', displayName: 'Lucas Martinati' }}
        isMe={true}
        status="available"
      />
    );

    // Le nom est affiché seul
    expect(screen.getByText('Lucas Martinati')).toBeInTheDocument();
    
    // Le badge "Moi" est un élément séparé avec style distinct
    const badge = screen.getByText('Moi');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-primary-500/25');
  });

  it('includes accessible status label and appropriate styling for unavailable status', () => {
    render(
      <DayMemberChip
        uid="user-3"
        profile={{ uid: 'user-3', displayName: 'Thomas' }}
        isMe={false}
        status="unavailable"
      />
    );

    expect(screen.getByText(/Indisponible/i)).toBeInTheDocument();
    const container = screen.getByText('Thomas').closest('div');
    expect(container).toHaveClass('border-slate-600');
  });
});
