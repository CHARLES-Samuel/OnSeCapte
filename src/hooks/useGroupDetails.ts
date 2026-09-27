import { useState, useEffect } from 'react';
import type { Group } from '../models/Group';
import { groupService } from '../services/implementations/FirestoreGroupService';
import { storageService } from '../services/implementations/FirebaseStorageService';
import { useAuth } from './useAuth';
import type { UpdateGroupDTO } from '../models/Group';
import { collection, getDocs, query, where, documentId } from 'firebase/firestore';
import { db } from '../config/firebase';

export function useGroupDetails(groupId: string | undefined) {
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [memberProfiles, setMemberProfiles] = useState<Record<string, string>>({});
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
        
        if (data && data.members.length > 0) {
          const chunks = [];
          for (let i = 0; i < data.members.length; i += 30) {
            chunks.push(data.members.slice(i, i + 30));
          }
          
          const profiles: Record<string, string> = {};
          for (const chunk of chunks) {
            const q = query(collection(db, 'users'), where(documentId(), 'in', chunk));
            const snap = await getDocs(q);
            snap.forEach(doc => {
              if (doc.data().displayName) {
                profiles[doc.id] = doc.data().displayName;
              }
            });
          }
          setMemberProfiles(profiles);
        }
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

  const updateGroupDetails = async (data: UpdateGroupDTO, photoFile?: File) => {
    if (!groupId || !user) return false;
    try {
      let finalData = { ...data };
      if (photoFile) {
        const photoUrl = await storageService.uploadGroupPhoto(groupId, photoFile);
        finalData.photoUrl = photoUrl;
      }
      await groupService.updateGroup(groupId, finalData, user.uid);
      // Re-fetch to update local state
      const updatedData = await groupService.getGroupById(groupId);
      setGroup(updatedData);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(message);
      return false;
    }
  };

  return { group, memberProfiles, loading, error, deleteGroup, transferOwnership, updateGroupDetails };
}
