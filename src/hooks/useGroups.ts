import { useState, useEffect } from "react";
import type { Group, CreateGroupDTO } from "../models/Group";
import { groupService } from "../services/implementations/FirestoreGroupService";

export const useGroups = (userId: string | undefined) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setGroups([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // S'abonne aux changements des groupes
    const unsubscribe = groupService.subscribeToUserGroups(userId, (fetchedGroups) => {
      setGroups(fetchedGroups);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const createGroup = async (data: CreateGroupDTO): Promise<Group> => {
    if (!userId) throw new Error("Utilisateur non connecté");
    
    setError(null);
    try {
      return await groupService.createGroup(userId, data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la création du groupe.";
      setError(msg);
      throw err;
    }
  };

  const joinGroup = async (inviteCode: string): Promise<Group> => {
    if (!userId) throw new Error("Utilisateur non connecté");
    
    setError(null);
    try {
      return await groupService.joinGroup(userId, inviteCode);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'ajout au groupe.";
      setError(msg);
      throw err;
    }
  };

  return {
    groups,
    loading,
    error,
    createGroup,
    joinGroup
  };
};
