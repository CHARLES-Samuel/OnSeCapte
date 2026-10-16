import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DayAvailabilityDetails } from './DayAvailabilityDetails';
import type { DateAvailabilityScore } from '../../../models/Availability';
import type { MemberProfile } from '../../../models/Group';

describe('DayAvailabilityDetails', () => {
  const mockProfiles: Record<string, MemberProfile> = {
    'u-1': { uid: 'u-1', displayName: 'Lucas Martinati' },
    'u-2': { uid: 'u-2', displayName: 'Alice Dupont Très Long Nom De Famille' },
    'u-3': { uid: 'u-3', displayName: 'Bob' },
    'u-4': { uid: 'u-4', displayName: 'Charlie' },
    'u-5': { uid: 'u-5', displayName: 'David' },
    'u-6': { uid: 'u-6', displayName: 'Emma' },
    'u-7': { uid: 'u-7', displayName: 'Fabien' },
  };

  const mockScore: DateAvailabilityScore = {
    date: '2026-10-12',
    timeSlot: 'Toute la journée',
    available: ['u-1', 'u-2', 'u-3', 'u-4'],
    maybe: ['u-5'],
    unavailable: ['u-6', 'u-7'],
    score: 8.5,
    availableRatio: 0.4,
    count: 5,
    rank: 1,
  };

  it('renders event title, formatted date, consensus summary and clean rank badge without duplicate emoji', () => {
    render(
      <DayAvailabilityDetails
        dateStr="2026-10-12"
        score={mockScore}
        memberProfiles={mockProfiles}
        currentUserId="u-1"
        canLock={true}
        isLocked={false}
        eventTitle="Grand Tournoi Mario Kart"
        totalMembers={10}
      />
    );

    // Titre de l'événement et date
    expect(screen.getByText('Grand Tournoi Mario Kart')).toBeInTheDocument();
    expect(screen.getByText(/lundi 12 octobre 2026/i)).toBeInTheDocument();

    // Consensus résumé
    expect(screen.getByText(/4\/10 membres/)).toBeInTheDocument();
    expect(screen.getByText(/dispos/i)).toBeInTheDocument();

    // Badge 1ère place : pas d'emoji 🥇 en double, mais le texte clair avec title explicatif
    const rankBadge = screen.getByTitle('Date avec le plus de disponibilités pour le groupe');
    expect(rankBadge).toBeInTheDocument();
    expect(rankBadge).toHaveTextContent('1ère place (Meilleur choix)');
    expect(screen.queryByText(/🥇/)).not.toBeInTheDocument();
  });

  it('renders member chips with truncated long names and separate Moi badge', () => {
    render(
      <DayAvailabilityDetails
        dateStr="2026-10-12"
        score={mockScore}
        memberProfiles={mockProfiles}
        currentUserId="u-1"
        canLock={true}
        isLocked={false}
      />
    );

    // Lucas Martinati est l'utilisateur connecté -> badge "Moi" séparé
    expect(screen.getByText('Lucas Martinati')).toBeInTheDocument();
    expect(screen.getByText('Moi')).toBeInTheDocument();

    // Nom long d'Alice a la classe truncate et le title complet
    const aliceEl = screen.getByText('Alice Dupont Très Long Nom De Famille');
    expect(aliceEl).toHaveClass('truncate');
    expect(aliceEl.closest('div')).toHaveAttribute(
      'title',
      'Alice Dupont Très Long Nom De Famille'
    );
  });

  it('handles lock flow: opens confirmation modal with warnings and confirms', () => {
    const onLockDate = vi.fn();

    render(
      <DayAvailabilityDetails
        dateStr="2026-10-25"
        score={mockScore}
        memberProfiles={mockProfiles}
        currentUserId="u-1"
        canLock={true}
        isLocked={false}
        onLockDate={onLockDate}
        eventTitle="Grand Tournoi Mario Kart"
        totalMembers={10}
      />
    );

    // Le bouton de verrouillage est présent dans le footer
    const lockBtn = screen.getByRole('button', { name: /Choisir & Verrouiller/i });
    expect(lockBtn).toBeInTheDocument();

    // Clic pour ouvrir la modale de confirmation
    fireEvent.click(lockBtn);

    // La modale s'affiche avec le récapitulatif
    expect(screen.getByText('Verrouiller cette date ?')).toBeInTheDocument();
    expect(screen.getAllByText(/Grand Tournoi Mario Kart/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/Attention :/i)).toBeInTheDocument(); // Car 2 indispos et 1 incertain
    expect(screen.getByText(/2 membres sont indisponibles et 1 incertain/i)).toBeInTheDocument();

    // Clic sur confirmation définitive
    const confirmBtn = screen.getByRole('button', { name: /Confirmer & Verrouiller/i });
    fireEvent.click(confirmBtn);

    expect(onLockDate).toHaveBeenCalledTimes(1);
    expect(onLockDate).toHaveBeenCalledWith('2026-10-25', 'Toute la journée');
  });

  it('shows permission notice and hides lock button when canLock is false', () => {
    render(
      <DayAvailabilityDetails
        dateStr="2026-10-25"
        score={mockScore}
        memberProfiles={mockProfiles}
        currentUserId="u-2"
        canLock={false}
        isLocked={false}
      />
    );

    expect(screen.queryByRole('button', { name: /Choisir & Verrouiller/i })).not.toBeInTheDocument();
    expect(
      screen.getByText(/Seul l'organisateur de l'événement peut verrouiller/i)
    ).toBeInTheDocument();
  });

  it('shows past date warning when date is in the past', () => {
    render(
      <DayAvailabilityDetails
        dateStr="2026-10-10"
        score={mockScore}
        memberProfiles={mockProfiles}
        currentUserId="u-1"
        canLock={true}
        isLocked={false}
      />
    );

    expect(screen.queryByRole('button', { name: /Choisir & Verrouiller/i })).not.toBeInTheDocument();
    expect(
      screen.getByText(/Cette date est déjà passée/i)
    ).toBeInTheDocument();
  });

  it('shows +X button when list of members exceeds 8 and expands on click', () => {
    const manyAvailable = Array.from({ length: 12 }, (_, i) => `user-${i + 1}`);
    const manyProfiles: Record<string, MemberProfile> = {};
    manyAvailable.forEach((id, i) => {
      manyProfiles[id] = { uid: id, displayName: `Membre ${i + 1}` };
    });

    const largeScore: DateAvailabilityScore = {
      date: '2026-10-12',
      timeSlot: 'Toute la journée',
      available: manyAvailable,
      maybe: [],
      unavailable: [],
      score: 12,
      availableRatio: 1,
      count: 12,
    };

    render(
      <DayAvailabilityDetails
        dateStr="2026-10-12"
        score={largeScore}
        memberProfiles={manyProfiles}
        canLock={false}
        isLocked={false}
      />
    );

    // Initialement, les 8 premiers sont affichés, et le bouton +4 autres membres est présent
    expect(screen.getByText('Membre 1')).toBeInTheDocument();
    expect(screen.getByText('Membre 8')).toBeInTheDocument();
    expect(screen.queryByText('Membre 9')).not.toBeInTheDocument();

    const expandBtn = screen.getByRole('button', { name: /\+4 autres membres/i });
    expect(expandBtn).toBeInTheDocument();

    // Clic pour déplier
    fireEvent.click(expandBtn);
    expect(screen.getByText('Membre 9')).toBeInTheDocument();
    expect(screen.getByText('Membre 12')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Voir moins/i })).toBeInTheDocument();
  });
});
