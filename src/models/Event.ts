export type EventCategory = 'Restaurant' | 'Jeux de rôle' | 'Soirée' | 'Repas' | 'Sport' | 'Gaming';

export interface Event {
  id: string;
  groupId: string;
  title: string;
  description: string;
  category: EventCategory;
  price: number; // 0 means Free
  createdBy: string;
  createdAt: number;
}

export interface CreateEventDTO {
  groupId: string;
  title: string;
  description: string;
  category: EventCategory;
  price: number;
}
