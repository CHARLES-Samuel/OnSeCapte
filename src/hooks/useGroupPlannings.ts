import { useState, useEffect, useCallback } from 'react';
import { groupService } from '../services/implementations/FirestoreGroupService';
import type { GroupPlanning, AvailabilityStatus } from '../models/Group';

export function useGroupPlannings(groupId: string | undefined) {
  const [plannings, setPlannings] = useState<GroupPlanning[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = groupService.subscribeToGroupPlannings(groupId, (fetched) => {
      setPlannings(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [groupId]);

  const updatePlanning = useCallback(async (userId: string, dates: Record<string, AvailabilityStatus>) => {
    if (!groupId) return false;
    try {
      await groupService.updateGroupPlanning(groupId, userId, dates);
      return true;
    } catch (err: any) {
      console.error(err);
      alert("Firestore Error: " + (err?.message || "Unknown error"));
      return false;
    }
  }, [groupId]);

  return { plannings, loading, updatePlanning };
}
