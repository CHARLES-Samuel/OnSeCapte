import type { Group, CreateGroupDTO } from "../../models/Group";

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
}
