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
  serverTimestamp,
  Timestamp,
  deleteDoc
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

    if (userRecord) {
      // Réinitialiser la fenêtre si elle est dépassée
      if (now - userRecord.lastAttempt > windowMs) {
        this.joinAttempts.set(userId, { count: 0, lastAttempt: now });
        return;
      }

      if (userRecord.count >= maxAttempts) {
        const remainingMinutes = Math.ceil((windowMs - (now - userRecord.lastAttempt)) / 60000);
        throw new Error(`Trop de tentatives échouées. Veuillez réespayer dans ${remainingMinutes} minute(s).`);
      }
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
  private mapDocToGroup(docId: string, data: any): Group {
    return {
      id: docId,
      name: data.name,
      description: data.description,
      createdBy: data.createdBy,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
      members: data.members || [],
      inviteCode: data.inviteCode
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
    // Vérifier combien de groupes l'utilisateur a déjà créés
    const createdQuery = query(
      collection(db, GROUPS_COLLECTION),
      where("createdBy", "==", userId)
    );
    const createdSnap = await getDocs(createdQuery);
    if (createdSnap.size >= 3) {
      throw new Error("Vous avez atteint la limite de 3 groupes créés.");
    }

    const inviteCode = this.generateInviteCode();
    
    // Vérifier que le code n'existe pas déjà (très peu probable mais bonne pratique)
    const q = query(collection(db, GROUPS_COLLECTION), where("inviteCode", "==", inviteCode));
    const existSnap = await getDocs(q);
    if (!existSnap.empty) {
      // S'il existe, on relance la fonction (récursion)
      return this.createGroup(userId, data);
    }

    const groupData = {
      name: data.name,
      description: data.description || "",
      createdBy: userId,
      createdAt: serverTimestamp(),
      members: [userId],
      inviteCode: inviteCode
    };

    const docRef = await addDoc(collection(db, GROUPS_COLLECTION), groupData);
    
    // On retourne l'objet formaté (createdAt est estimé localement)
    return {
      id: docRef.id,
      name: groupData.name,
      description: groupData.description,
      createdBy: groupData.createdBy,
      createdAt: Date.now(),
      members: groupData.members,
      inviteCode: groupData.inviteCode
    };
  }

  async joinGroup(userId: string, inviteCode: string): Promise<Group> {
    // 1. Vérifier le Rate Limit
    this.checkRateLimit(userId);

    const q = query(
      collection(db, GROUPS_COLLECTION),
      where("inviteCode", "==", inviteCode.toUpperCase())
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      this.recordFailedAttempt(userId);
      throw new Error("Code d'invitation invalide ou expiré.");
    }

    const groupDoc = querySnapshot.docs[0];
    const groupRef = doc(db, GROUPS_COLLECTION, groupDoc.id);
    
    const groupData = groupDoc.data();
    if (groupData.members.includes(userId)) {
      throw new Error("Vous êtes déjà membre de ce groupe.");
    }

    // Ajout de l'utilisateur au tableau members
    await updateDoc(groupRef, {
      members: arrayUnion(userId)
    });

    // Réinitialiser les tentatives échouées sur succès
    this.resetFailedAttempts(userId);

    return this.mapDocToGroup(groupDoc.id, {
      ...groupData,
      members: [...groupData.members, userId]
    });
  }

  async getGroupById(groupId: string): Promise<Group | null> {
    const groupRef = doc(db, GROUPS_COLLECTION, groupId);
    const groupSnap = await getDoc(groupRef);
    
    if (!groupSnap.exists()) {
      return null;
    }
    
    return this.mapDocToGroup(groupSnap.id, groupSnap.data());
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

    // Vérifier combien de groupes le nouveau propriétaire a déjà créés
    const createdQuery = query(
      collection(db, GROUPS_COLLECTION),
      where("createdBy", "==", newOwnerId)
    );
    const createdSnap = await getDocs(createdQuery);
    if (createdSnap.size >= 3) {
      throw new Error("Le membre sélectionné a déjà atteint la limite de 3 groupes créés.");
    }
    
    await updateDoc(groupRef, {
      createdBy: newOwnerId
    });
  }
}

export const groupService = new FirestoreGroupService();
