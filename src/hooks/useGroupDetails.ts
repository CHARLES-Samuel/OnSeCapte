import { useState, useEffect } from 'react';
import type { Group } from '../models/Group';
import { groupService } from '../services/implementations/FirestoreGroupService';
import { storageService } from '../services/implementations/FirebaseStorageService';
import { useAuth } from './useAuth';
import type { UpdateGroupDTO } from '../models/Group';

export function useGroupDetails(groupId: string | undefined) {
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [memberProfiles, setMemberProfiles] = useState<Record<string, import('../models/Group').MemberProfile>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = groupService.subscribeToGroupById(groupId, async (data) => {
      setGroup(data);
      setLoading(false);

      if (data) {
        // Inclure les membres actifs ET les membres bannis pour afficher correctement leurs pseudos
        const allMemberIds = Array.from(new Set([...data.members, ...(data.bannedMemberIds || [])]));
        if (allMemberIds.length > 0) {
          try {
            const profiles = await groupService.getMemberProfiles(allMemberIds);
            setMemberProfiles(profiles);
          } catch (profileErr) {
            console.error("Erreur chargement profils membres :", profileErr);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [groupId]);

  const deleteGroup = async (): Promise<boolean> => {
    if (!groupId || !user) return false;
    try {
      await groupService.deleteGroup(groupId, user.uid);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(message);
      return false;
    }
  };

  const transferOwnership = async (newOwnerId: string): Promise<boolean> => {
    if (!groupId || !user) return false;
    try {
      await groupService.transferOwnership(groupId, user.uid, newOwnerId);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(message);
      return false;
    }
  };

  const updateGroupDetails = async (data: UpdateGroupDTO, photoFile?: File, bannerFile?: File): Promise<boolean> => {
    if (!groupId || !user) return false;
    try {
      let finalData = { ...data };
      const uploadTasks: Promise<void>[] = [];

      if (photoFile) {
        uploadTasks.push(
          storageService.uploadGroupPhoto(groupId, photoFile).then(url => {
            finalData.photoUrl = url;
          })
        );
      }
      if (bannerFile) {
        uploadTasks.push(
          storageService.uploadGroupBanner(groupId, bannerFile).then(url => {
            finalData.bannerUrl = url;
          })
        );
      }

      await Promise.all(uploadTasks);
      await groupService.updateGroup(groupId, finalData, user.uid);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(message);
      return false;
    }
  };

  /** Rafraîchissement manuel optionnel (la synchro principale est désormais temps réel) */
  const refreshGroup = async () => {};

  return {
    group,
    memberProfiles,
    loading,
    error,
    deleteGroup,
    transferOwnership,
    updateGroupDetails,
    refreshGroup,
    setError,
  };
}
