import type { Group, CreateGroupDTO, UpdateGroupDTO } from "../../models/Group";

export interface IGroupService {
  /** Récupère la liste des groupes dont l'utilisateur fait partie */
  getUserGroups(userId: string): Promise<Group[]>;
  
  /** S'abonne aux changements des groupes de l'utilisateur en temps réel */
  subscribeToUserGroups(userId: string, callback: (groups: Group[]) => void): () => void;
  
  /** Crée un nouveau groupe et y ajoute le créateur comme membre */
  createGroup(userId: string, data: CreateGroupDTO): Promise<Group>;
  
  /** Rejoint un groupe à l'aide d'un code d'invitation */
  joinGroup(userId: string, inviteCode: string): Promise<Group>;
  
  /** Récupère les détails d'un groupe spécifique */
  getGroupById(groupId: string): Promise<Group | null>;

  /** Supprime un groupe (seulement pour le gérant) */
  deleteGroup(groupId: string, userId: string): Promise<void>;

  /** Transfère la propriété du groupe (seulement pour le gérant) */
  transferOwnership(groupId: string, currentOwnerId: string, newOwnerId: string): Promise<void>;

  /** Met à jour les informations du groupe (seulement pour le gérant) */
  updateGroup(groupId: string, data: UpdateGroupDTO, userId: string): Promise<void>;
}
