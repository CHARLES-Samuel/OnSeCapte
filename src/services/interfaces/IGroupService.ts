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

  /** S'abonne aux changements d'un groupe spécifique en temps réel */
  subscribeToGroupById(groupId: string, callback: (group: Group | null) => void): () => void;

  /** Supprime un groupe (seulement pour le gérant) */
  deleteGroup(groupId: string, userId: string): Promise<void>;

  /** Transfère la propriété du groupe (seulement pour le gérant) */
  transferOwnership(groupId: string, currentOwnerId: string, newOwnerId: string): Promise<void>;

  /** Met à jour les informations du groupe (seulement pour le gérant) */
  updateGroup(groupId: string, data: UpdateGroupDTO, userId: string): Promise<void>;

  /**
   * Exclut temporairement un membre du groupe (Kick).
   * Le membre peut rejoindre à nouveau via le code d'invitation.
   */
  kickMember(groupId: string, ownerId: string, targetUserId: string): Promise<void>;

  /**
   * Bannit définitivement un membre du groupe.
   * Le membre est retiré de `members` et ajouté à `bannedMemberIds`.
   */
  banMember(groupId: string, ownerId: string, targetUserId: string): Promise<void>;

  /**
   * Lève le bannissement d'un membre.
   * Retire l'UID de `bannedMemberIds` sans le ré-ajouter aux membres.
   */
  unbanMember(groupId: string, ownerId: string, targetUserId: string): Promise<void>;

  /**
   * Permet à un membre de quitter volontairement le groupe.
   * Le gérant ne peut pas quitter s'il est le seul propriétaire.
   */
  leaveGroup(groupId: string, userId: string): Promise<void>;

  /**
   * Récupère les profils publics (displayName) d'une liste de membres par leurs UIDs.
   */
  getMemberProfiles(memberIds: string[]): Promise<Record<string, string>>;

  /** Récupère les plannings du groupe */
  getGroupPlannings(groupId: string): Promise<import("../../models/Group").GroupPlanning[]>;

  /** S'abonne aux plannings du groupe */
  subscribeToGroupPlannings(groupId: string, callback: (plannings: import("../../models/Group").GroupPlanning[]) => void): () => void;

  /** Met à jour le planning du groupe pour un membre */
  updateGroupPlanning(groupId: string, userId: string, dates: Record<string, import("../../models/Group").AvailabilityStatus>): Promise<void>;
}
