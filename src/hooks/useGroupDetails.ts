import { useState, useEffect } from 'react';
import type { Group } from '../models/Group';
import { groupService } from '../services/implementations/FirestoreGroupService';
import { useAuth } from './useAuth';

export function useGroupDetails(groupId: string | undefined) {
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    const fetchGroup = async () => {
      try {
        setLoading(true);
        const data = await groupService.getGroupById(groupId);
        setGroup(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors du chargement du groupe";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId]);

  const deleteGroup = async () => {
    if (!groupId || !user) return;
    try {
      await groupService.deleteGroup(groupId, user.uid);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(message);
      return false;
    }
  };

  const transferOwnership = async (newOwnerId: string) => {
    if (!groupId || !user) return;
    try {
      await groupService.transferOwnership(groupId, user.uid, newOwnerId);
      // Re-fetch to update local state
      const data = await groupService.getGroupById(groupId);
      setGroup(data);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(message);
      return false;
    }
  };

  return { group, loading, error, deleteGroup, transferOwnership };
}
