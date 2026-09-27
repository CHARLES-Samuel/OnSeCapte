import { useState } from 'react';
import { groupService } from '../services/implementations/FirestoreGroupService';
import { useAuth } from './useAuth';

interface UseMemberManagementOptions {
  groupId: string;
  onSuccess?: () => void;
}

/** Hook dédié à la gestion des membres par le gérant (kick, ban, unban) et quitter le groupe */
export function useMemberManagement({ groupId, onSuccess }: UseMemberManagementOptions) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withErrorHandling = async (action: () => Promise<void>): Promise<boolean> => {
    if (!user) return false;
    try {
      setLoading(true);
      setError(null);
      await action();
      onSuccess?.();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue.';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const kickMember = (targetUserId: string) =>
    withErrorHandling(() => groupService.kickMember(groupId, user!.uid, targetUserId));

  const banMember = (targetUserId: string) =>
    withErrorHandling(() => groupService.banMember(groupId, user!.uid, targetUserId));

  const unbanMember = (targetUserId: string) =>
    withErrorHandling(() => groupService.unbanMember(groupId, user!.uid, targetUserId));

  const leaveGroup = () =>
    withErrorHandling(() => groupService.leaveGroup(groupId, user!.uid));

  return { loading, error, kickMember, banMember, unbanMember, leaveGroup, clearError: () => setError(null) };
}
