import { useState, useEffect } from 'react';
import type { Event, CreateEventDTO } from '../models/Event';
import { eventService } from '../services/implementations/FirestoreEventService';
import { useAuth } from './useAuth';

export function useEvents(groupId: string | undefined, isGroupOwner: boolean) {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = eventService.subscribeToGroupEvents(groupId, (fetchedEvents) => {
      setEvents(fetchedEvents);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [groupId]);

  const createEvent = async (data: Omit<CreateEventDTO, 'groupId'>) => {
    if (!user || !groupId) return;
    try {
      setError(null);
      await eventService.createEvent(user.uid, { ...data, groupId });
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!user) return;
    try {
      setError(null);
      await eventService.deleteEvent(eventId, user.uid, isGroupOwner);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  return { events, loading, error, createEvent, deleteEvent };
}
