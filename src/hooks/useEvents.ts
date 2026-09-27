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
      const userName = user.displayName || user.email?.split('@')[0] || 'Un membre';
      await eventService.createEvent(user.uid, userName, { ...data, groupId });
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const updateEvent = async (eventId: string, data: Partial<CreateEventDTO>) => {
    if (!user) return false;
    try {
      setError(null);
      await eventService.updateEvent(eventId, user.uid, data, isGroupOwner);
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

  const updateAvailability = async (eventId: string, availability: Omit<import('../models/Event').EventAvailability, 'userId' | 'updatedAt' | 'userName'>) => {
    if (!user) return;
    try {
      setError(null);
      await eventService.updateAvailability(eventId, user.uid, {
        ...availability,
        userId: user.uid,
        userName: user.displayName || 'Un membre',
        updatedAt: Date.now()
      });
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const lockEventDate = async (eventId: string, date: string, timeSlot: import('../models/Event').TimeSlot) => {
    if (!user) return;
    try {
      setError(null);
      await eventService.lockEventDate(eventId, user.uid, isGroupOwner, date, timeSlot);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  return { events, loading, error, createEvent, updateEvent, deleteEvent, updateAvailability, lockEventDate };
}
