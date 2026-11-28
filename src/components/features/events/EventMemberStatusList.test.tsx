import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventMemberStatusList } from './EventMemberStatusList';
import type { EventParticipation } from '../../../models/Event';
import type { MemberProfile } from '../../../models/Group';

describe('EventMemberStatusList', () => {
  const profiles: Record<string, MemberProfile> = {
    'u-1': { uid: 'u-1', displayName: 'Alice' },
    'u-2': { uid: 'u-2', displayName: 'Bob' },
    'u-3': { uid: 'u-3', displayName: 'Charlie' },
    'u-4': { uid: 'u-4', displayName: 'Diane' },
    'u-5': { uid: 'u-5', displayName: 'Émile' },
    'u-6': { uid: 'u-6', displayName: 'Farah' },
    'u-7': { uid: 'u-7', displayName: 'Gabriel' },
  };

  it('displays counter, member pseudos, Moi badge first, and Participe / Je ne sais pas / Pas dispo statuses', () => {
    const participations: Record<string, EventParticipation> = {
      'u-1': 'not_participating',
      'u-2': 'participating',
      'u-3': 'maybe',
    };

    render(
      <EventMemberStatusList
        participations={participations}
        memberProfiles={profiles}
        currentUserId="u-2"
      />
    );

    expect(screen.getByText('Statut des membres (3)')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Moi')).toBeInTheDocument();
    expect(screen.getByText('Participe')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.getByText('Je ne sais pas')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Pas dispo')).toBeInTheDocument();

    // L'utilisateur courant (Bob) apparaît en premier dans la liste
    const bobEl = screen.getByText('Bob');
    const aliceEl = screen.getByText('Alice');
    expect(
      bobEl.compareDocumentPosition(aliceEl) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('truncates lists beyond 5 members with a "Voir tout (+N)" toggle and expands on click', () => {
    const participations: Record<string, EventParticipation> = {
      'u-1': 'participating',
      'u-2': 'not_participating',
      'u-3': 'participating',
      'u-4': 'participating',
      'u-5': 'not_participating',
      'u-6': 'participating',
      'u-7': 'participating',
    };

    render(
      <EventMemberStatusList
        participations={participations}
        memberProfiles={profiles}
        currentUserId="u-7"
      />
    );

    expect(screen.getByText('Statut des membres (7)')).toBeInTheDocument();
    // u-7 (Moi) est remonté en tête et donc visible immédiatement même avant dépliage
    expect(screen.getByText('Gabriel')).toBeInTheDocument();
    expect(screen.getByText('Moi')).toBeInTheDocument();
    // Les 2 derniers (Émile, Farah) sont masqués tant que non déplié
    expect(screen.queryByText('Farah')).not.toBeInTheDocument();

    const toggleBtn = screen.getByRole('button', { name: /Voir tout \(\+2\)/i });
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggleBtn);

    expect(screen.getByText('Farah')).toBeInTheDocument();
    expect(screen.getByText('Émile')).toBeInTheDocument();

    const collapseBtn = screen.getByRole('button', { name: /Voir moins/i });
    expect(collapseBtn).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(collapseBtn);
    expect(screen.queryByText('Farah')).not.toBeInTheDocument();
  });

  it('shows empty state message when nobody has responded yet', () => {
    render(<EventMemberStatusList participations={{}} memberProfiles={profiles} />);
    expect(screen.getByText('Statut des membres (0)')).toBeInTheDocument();
    expect(screen.getByText(/Aucune réponse pour le moment/i)).toBeInTheDocument();
  });
});

