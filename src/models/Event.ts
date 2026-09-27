export type EventCategory = 'Restaurant' | 'Jeux de rôle' | 'Soirée' | 'Repas' | 'Sport' | 'Gaming' | 'Autres';
export type EventState = 'sondage' | 'planifie' | 'passe';
export type TimeSlot = 'Matin' | 'Après-midi' | 'Soirée' | 'Toute la journée';

export interface EventAvailability {
  userId: string;
  userName?: string; // Ajout pour afficher le nom sans refetch
  isAvailable: boolean;
  availableDates: {
    date: string; // 'YYYY-MM-DD'
    timeSlots: TimeSlot[];
  }[];
  updatedAt: number;
}

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
  availabilities?: Record<string, EventAvailability>;
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
