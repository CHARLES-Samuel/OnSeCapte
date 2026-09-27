import type { Group } from '../models/Group';
import type { Event } from '../models/Event';
import { useAuth } from './useAuth';

export const useRoles = (group?: Group | null, event?: Event | null) => {
  const { user } = useAuth();
  const userId = user?.uid;

  const isGroupOwner = Boolean(group && userId && group.createdBy === userId);
  const isEventOwner = Boolean(event && userId && event.createdBy === userId);
  const canManageEvent = isGroupOwner || isEventOwner;

  return { isGroupOwner, isEventOwner, canManageEvent };
};
