import type { Event, CreateEventDTO } from "../../models/Event";

export interface IEventService {
  getGroupEvents(groupId: string): Promise<Event[]>;
  subscribeToGroupEvents(groupId: string, callback: (events: Event[]) => void): () => void;
  createEvent(userId: string, data: CreateEventDTO): Promise<Event>;
  updateEvent(eventId: string, userId: string, data: Partial<CreateEventDTO>, isGroupOwner: boolean): Promise<void>;
  deleteEvent(eventId: string, userId: string, isGroupOwner: boolean): Promise<void>;
}
