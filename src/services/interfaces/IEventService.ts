import type { Event, CreateEventDTO, EventParticipation, TimeSlot } from "../../models/Event";

export interface IEventService {
  getGroupEvents(groupId: string): Promise<Event[]>;
  subscribeToGroupEvents(groupId: string, callback: (events: Event[]) => void): () => void;
  createEvent(userId: string, userName: string, data: CreateEventDTO): Promise<Event>;
  updateEvent(eventId: string, userId: string, data: Partial<CreateEventDTO>, isGroupOwner: boolean): Promise<void>;
  deleteEvent(eventId: string, userId: string, isGroupOwner: boolean): Promise<void>;
  updateParticipation(eventId: string, userId: string, participation: EventParticipation): Promise<void>;
  lockEventDate(eventId: string, userId: string, isGroupOwner: boolean, date: string, timeSlot: TimeSlot): Promise<void>;
  unlockEventDate(eventId: string, userId: string, isGroupOwner: boolean): Promise<void>;
}
