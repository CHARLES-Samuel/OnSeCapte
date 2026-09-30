import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  Timestamp,
  deleteDoc,
  documentId,
  writeBatch,
  deleteField,
  setDoc
} from "firebase/firestore";
import { db } from "../../config/firebase";
import type { IGroupService } from "../interfaces/IGroupService";
import type { Group, CreateGroupDTO } from "../../models/Group";

const GROUPS_COLLECTION = "groups";

export class FirestoreGroupService implements IGroupService {

  // Structure mémoire pour le rate-limiting (tentatives d'adhésion par utilisateur)
  private joinAttempts: Map<string, { count: number; lastAttempt: number }> = new Map();

  // Génère un code d'invitation aléatoire de 8 caractères (lettres majuscules et chiffres)
  private generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclut O, 0, I, 1 pour éviter la confusion
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Helper pour vérifier le Rate-Limiting sur les adhésions de groupe
  private checkRateLimit(userId: string): void {
    const now = Date.now();
    const windowMs = 5 * 60 * 1000; // Fenêtre de 5 minutes
    const maxAttempts = 5;

    const userRecord = this.joinAttempts.get(userId);

    if (!userRecord) return;

    if (now - userRecord.lastAttempt > windowMs) {
      this.joinAttempts.set(userId, { count: 0, lastAttempt: now });
      return;
    }

    if (userRecord.count >= maxAttempts) {
      const remainingMinutes = Math.ceil((windowMs - (now - userRecord.lastAttempt)) / 60000);
      throw new Error(`Trop de tentatives échouées. Veuillez réessayer dans ${remainingMinutes} minute(s).`);
    }
  }

  private recordFailedAttempt(userId: string): void {
    const now = Date.now();
    const userRecord = this.joinAttempts.get(userId);
    const count = userRecord ? userRecord.count + 1 : 1;
    this.joinAttempts.set(userId, { count, lastAttempt: now });
  }

  private resetFailedAttempts(userId: string): void {
    this.joinAttempts.delete(userId);
  }

  // Helper pour convertir le document Firestore en objet métier
  private mapDocToGroup(docId: string, data: import("firebase/firestore").DocumentData): Group {
    return {
      id: docId,
      name: data.name,
      description: data.description,
      photoUrl: data.photoUrl,
      bannerUrl: data.bannerUrl,
      createdBy: data.createdBy,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
      members: data.members || [],
      inviteCode: data.inviteCode,
      bannedMemberIds: data.bannedMemberIds || [],
    };
  }

  async getUserGroups(userId: string): Promise<Group[]> {
    const q = query(
      collection(db, GROUPS_COLLECTION),
      where("members", "array-contains", userId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => this.mapDocToGroup(doc.id, doc.data()));
  }

  subscribeToUserGroups(userId: string, callback: (groups: Group[]) => void): () => void {
    const q = query(
      collection(db, GROUPS_COLLECTION),
      where("members", "array-contains", userId)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const groups = querySnapshot.docs.map(doc => this.mapDocToGroup(doc.id, doc.data()));
      callback(groups);
    }, (error) => {
      console.error("Erreur lors de l'écoute des groupes :", error);
    });

    return unsubscribe;
  }

  async createGroup(userId: string, data: CreateGroupDTO): Promise<Group> {
    const createdQuery = query(
      collection(db, GROUPS_COLLECTION),
      where("createdBy", "==", userId)
    );
    const createdSnap = await getDocs(createdQuery);
    if (createdSnap.size >= 3) {
      throw new Error("Vous avez atteint la limite de 3 groupes créés.");
    }

    const inviteCode = this.generateInviteCode();

    const inviteSnap = await getDoc(doc(db, "inviteCodes", inviteCode));
    if (inviteSnap.exists()) {
      return this.createGroup(userId, data);
    }

    const groupData = {
      name: data.name,
      description: data.description || "",
      createdBy: userId,
      createdAt: serverTimestamp(),
      members: [userId],
      inviteCode: inviteCode,
      bannedMemberIds: [],
    };

    const docRef = await addDoc(collection(db, GROUPS_COLLECTION), groupData);

    // Enregistrer le code d'invitation dans le registre sécurisé
    await setDoc(doc(db, "inviteCodes", inviteCode), {
      groupId: docRef.id,
      createdBy: userId,
      createdAt: serverTimestamp(),
    });

    return {
      id: docRef.id,
      name: groupData.name,
      description: groupData.description,
      createdBy: groupData.createdBy,
      createdAt: Date.now(),
      members: groupData.members,
      inviteCode: groupData.inviteCode,
      bannedMemberIds: [],
    };
  }

  async joinGroup(userId: string, inviteCode: string): Promise<Group> {
    const cleanCode = inviteCode.trim().toUpperCase();
    // 1. Vérifier le Rate Limit
    this.checkRateLimit(userId);

    // 2. Recherche directe O(1) dans la collection sécurisée inviteCodes
    const inviteRef = doc(db, "inviteCodes", cleanCode);
    const inviteSnap = await getDoc(inviteRef);

    if (!inviteSnap.exists()) {
      this.recordFailedAttempt(userId);
      throw new Error("Code d'invitation invalide ou expiré.");
    }

    const { groupId } = inviteSnap.data();
    const groupRef = doc(db, GROUPS_COLLECTION, groupId);

    // 3. Si déjà membre, getDoc réussit immédiatement
    try {
      const existingSnap = await getDoc(groupRef);
      if (existingSnap.exists()) {
        const data = existingSnap.data();
        if (data.members && data.members.includes(userId)) {
          this.resetFailedAttempts(userId);
          return this.mapDocToGroup(groupId, data);
        }
      }
    } catch {
      // Pas encore membre, la lecture est refusée par la règle (normal et sécurisé)
    }

    // 4. Adhésion sécurisée avec joinCodeAttempt vérifié par Firestore Security Rules
    try {
      await updateDoc(groupRef, {
        members: arrayUnion(userId),
        joinCodeAttempt: cleanCode,
      });
    } catch (err: any) {
      this.recordFailedAttempt(userId);
      throw new Error(err?.message || "Impossible de rejoindre ce groupe (code erroné ou vous en avez été banni).");
    }

    // 5. Désormais membre, la lecture est autorisée
    const updatedSnap = await getDoc(groupRef);
    if (!updatedSnap.exists()) {
      throw new Error("Groupe introuvable.");
    }

    this.resetFailedAttempts(userId);
    return this.mapDocToGroup(groupId, updatedSnap.data());
  }

  async getGroupById(groupId: string): Promise<Group | null> {
    const groupRef = doc(db, GROUPS_COLLECTION, groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
      return null;
    }

    return this.mapDocToGroup(groupSnap.id, groupSnap.data());
  }

  subscribeToGroupById(groupId: string, callback: (group: Group | null) => void): () => void {
    const groupRef = doc(db, GROUPS_COLLECTION, groupId);
    return onSnapshot(groupRef, (docSnap) => {
      if (!docSnap.exists()) {
        callback(null);
        return;
      }
      callback(this.mapDocToGroup(docSnap.id, docSnap.data()));
    }, (error) => {
      console.error("Erreur lors de l'écoute du groupe :", error);
    });
  }

  async deleteGroup(groupId: string, userId: string): Promise<void> {
    const groupRef = doc(db, GROUPS_COLLECTION, groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
      throw new Error("Groupe introuvable.");
    }

    const groupData = groupSnap.data();
    if (groupData.createdBy !== userId) {
      throw new Error("Seul le propriétaire peut supprimer ce groupe.");
    }

    if (groupData.inviteCode) {
      await deleteDoc(doc(db, "inviteCodes", groupData.inviteCode)).catch(() => {});
    }

    await deleteDoc(groupRef);
  }

  async transferOwnership(groupId: string, currentOwnerId: string, newOwnerId: string): Promise<void> {
    const groupRef = doc(db, GROUPS_COLLECTION, groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
      throw new Error("Groupe introuvable.");
    }

    const groupData = groupSnap.data();
    if (groupData.createdBy !== currentOwnerId) {
      throw new Error("Seul le propriétaire actuel peut transférer le groupe.");
    }

    if (!groupData.members.includes(newOwnerId)) {
      throw new Error("Le nouveau propriétaire doit être membre du groupe.");
    }

    const createdQuery = query(
      collection(db, GROUPS_COLLECTION),
      where("createdBy", "==", newOwnerId)
    );
    const createdSnap = await getDocs(createdQuery);
    if (createdSnap.size >= 3) {
      throw new Error("Le membre sélectionné a déjà atteint la limite de 3 groupes créés.");
    }

    await updateDoc(groupRef, {
      createdBy: newOwnerId,
    });
  }

  async updateGroup(groupId: string, data: import("../../models/Group").UpdateGroupDTO, userId: string): Promise<void> {
    const groupRef = doc(db, GROUPS_COLLECTION, groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
      throw new Error("Groupe introuvable.");
    }

    const groupData = groupSnap.data();
    if (groupData.createdBy !== userId) {
      throw new Error("Seul le gérant peut modifier les informations de ce groupe.");
    }

    const updateData: Record<string, string | undefined> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl;
    if (data.bannerUrl !== undefined) updateData.bannerUrl = data.bannerUrl;

    if (Object.keys(updateData).length > 0) {
      await updateDoc(groupRef, updateData);
    }
  }

  async kickMember(groupId: string, ownerId: string, targetUserId: string): Promise<void> {
    const groupRef = doc(db, GROUPS_COLLECTION, groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) throw new Error("Groupe introuvable.");

    const groupData = groupSnap.data();
    if (groupData.createdBy !== ownerId) {
      throw new Error("Seul le gérant peut exclure un membre.");
    }
    if (targetUserId === ownerId) {
      throw new Error("Le gérant ne peut pas s'exclure lui-même.");
    }

    const batch = writeBatch(db);

    batch.update(groupRef, {
      members: arrayRemove(targetUserId),
    });

    await this.cleanupUserEvents(batch, groupId, targetUserId, ownerId);

    await batch.commit();
  }

  async banMember(groupId: string, ownerId: string, targetUserId: string): Promise<void> {
    const groupRef = doc(db, GROUPS_COLLECTION, groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) throw new Error("Groupe introuvable.");

    const groupData = groupSnap.data();
    if (groupData.createdBy !== ownerId) {
      throw new Error("Seul le gérant peut bannir un membre.");
    }
    if (targetUserId === ownerId) {
      throw new Error("Le gérant ne peut pas se bannir lui-même.");
    }

    const batch = writeBatch(db);

    batch.update(groupRef, {
      members: arrayRemove(targetUserId),
      bannedMemberIds: arrayUnion(targetUserId),
    });

    await this.cleanupUserEvents(batch, groupId, targetUserId, ownerId);

    await batch.commit();
  }

  async unbanMember(groupId: string, ownerId: string, targetUserId: string): Promise<void> {
    const groupRef = doc(db, GROUPS_COLLECTION, groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) throw new Error("Groupe introuvable.");

    const groupData = groupSnap.data();
    if (groupData.createdBy !== ownerId) {
      throw new Error("Seul le gérant peut lever un bannissement.");
    }

    await updateDoc(groupRef, {
      bannedMemberIds: arrayRemove(targetUserId),
    });
  }

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    const groupRef = doc(db, GROUPS_COLLECTION, groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) throw new Error("Groupe introuvable.");

    const groupData = groupSnap.data();
    if (groupData.createdBy === userId) {
      throw new Error(
        "En tant que gérant, vous ne pouvez pas quitter le groupe directement. Veuillez d'abord transférer la propriété à un autre membre."
      );
    }

    if (!groupData.members.includes(userId)) {
      throw new Error("Vous n'êtes pas membre de ce groupe.");
    }

    const ownerId = groupData.createdBy;

    const batch = writeBatch(db);

    batch.update(groupRef, {
      members: arrayRemove(userId),
    });

    await this.cleanupUserEvents(batch, groupId, userId, ownerId);

    await batch.commit();
  }

  private async cleanupUserEvents(
    batch: import("firebase/firestore").WriteBatch,
    groupId: string,
    userId: string,
    ownerId: string
  ): Promise<void> {
    // Récupérer le profil du propriétaire du groupe pour mettre à jour les métadonnées de l'événement
    let ownerDisplayName = "Gérant";
    let ownerPhotoURL: string | null = null;
    try {
      const ownerDocSnap = await getDoc(doc(db, "users", ownerId));
      if (ownerDocSnap.exists()) {
        const ownerData = ownerDocSnap.data();
        if (ownerData?.displayName) {
          ownerDisplayName = ownerData.displayName;
        }
        if (ownerData?.photoURL !== undefined) {
          ownerPhotoURL = ownerData.photoURL;
        }
      }
    } catch {
      // Conserver les valeurs de repli en cas d'erreur de lecture du profil
    }

    const eventsQuery = query(collection(db, "events"), where("groupId", "==", groupId));
    const eventsSnap = await getDocs(eventsQuery);

    eventsSnap.forEach((eventDoc) => {
      const eventData = eventDoc.data();
      if (eventData.createdBy === userId) {
        // La propriété des événements qu'il a créés est transmise au propriétaire du groupe
        const updatePayload: Record<string, any> = {
          createdBy: ownerId,
          createdByName: ownerDisplayName,
        };
        if (ownerPhotoURL !== undefined) {
          updatePayload.createdByPhoto = ownerPhotoURL;
        }
        // Supprimer la participation du membre sortant de son propre événement
        if (eventData.participations && eventData.participations[userId]) {
          updatePayload[`participations.${userId}`] = deleteField();
        }
        batch.update(eventDoc.ref, updatePayload);
      } else if (eventData.participations && eventData.participations[userId]) {
        // Supprimer la participation de l'utilisateur sur les événements des autres
        batch.update(eventDoc.ref, {
          [`participations.${userId}`]: deleteField()
        });
      }
    });

    // Clean up planning if necessary
    const planningRef = doc(db, GROUPS_COLLECTION, groupId, "plannings", userId);
    batch.delete(planningRef);
  }

  async getMemberProfiles(memberIds: string[]): Promise<Record<string, import("../../models/Group").MemberProfile>> {
    if (!memberIds || memberIds.length === 0) return {};
    const uniqueIds = Array.from(new Set(memberIds.filter(Boolean)));
    if (uniqueIds.length === 0) return {};

    const chunks: string[][] = [];
    for (let i = 0; i < uniqueIds.length; i += 30) {
      chunks.push(uniqueIds.slice(i, i + 30));
    }

    const profiles: Record<string, import("../../models/Group").MemberProfile> = {};
    for (const chunk of chunks) {
      const q = query(collection(db, "users"), where(documentId(), "in", chunk));
      const snap = await getDocs(q);
      snap.forEach((doc) => {
        const data = doc.data();
        if (data?.displayName) {
          profiles[doc.id] = { uid: doc.id, displayName: data.displayName, photoURL: data.photoURL || null };
        }
      });
    }

    return profiles;
  }

  async getGroupPlannings(groupId: string): Promise<import("../../models/Group").GroupPlanning[]> {
    const planningsRef = collection(db, GROUPS_COLLECTION, groupId, "plannings");
    const snap = await getDocs(planningsRef);
    return snap.docs.map(doc => ({
      userId: doc.id,
      updatedAt: doc.data().updatedAt instanceof Timestamp ? doc.data().updatedAt.toMillis() : Date.now(),
      dates: doc.data().dates || {}
    }));
  }

  subscribeToGroupPlannings(groupId: string, callback: (plannings: import("../../models/Group").GroupPlanning[]) => void): () => void {
    const planningsRef = collection(db, GROUPS_COLLECTION, groupId, "plannings");
    return onSnapshot(planningsRef, (snap) => {
      const plannings = snap.docs.map(doc => ({
        userId: doc.id,
        updatedAt: doc.data().updatedAt instanceof Timestamp ? doc.data().updatedAt.toMillis() : Date.now(),
        dates: doc.data().dates || {}
      }));
      callback(plannings);
    });
  }

  async updateGroupPlanning(groupId: string, userId: string, dates: Record<string, import("../../models/Group").AvailabilityStatus>): Promise<void> {
    const planningRef = doc(db, GROUPS_COLLECTION, groupId, "plannings", userId);
    await setDoc(planningRef, {
      updatedAt: serverTimestamp(),
      dates
    }, { merge: true });
  }
}

export const groupService = new FirestoreGroupService();
