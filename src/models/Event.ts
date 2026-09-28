export type EventCategory = 'Restaurant' | 'Jeux de rôle' | 'Soirée' | 'Repas' | 'Sport' | 'Gaming' | 'Autres';
export type EventState = 'sondage' | 'planifie' | 'passe';
export type TimeSlot = 'Matin' | 'Après-midi' | 'Soirée' | 'Toute la journée';

export type EventParticipation = 'participating' | 'not_participating' | 'pending';

export interface Event {
  id: string;
  groupId: string;
  title: string;
  description: string;
  category: EventCategory;
  price: number; // 0 means Free
  createdBy: string;
  createdByName?: string; // Nom du créateur de l'événement
  createdAt: number;
  state: EventState;
  participations?: Record<string, EventParticipation>;
  finalDate?: string; // 'YYYY-MM-DD'
  finalTimeSlot?: TimeSlot;
}

export interface CreateEventDTO {
  groupId: string;
  title: string;
  description: string;
  category: EventCategory;
  price: number;
}
