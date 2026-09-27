export interface Group {
  id: string;
  name: string;
  description?: string;
  photoUrl?: string; // URL de la photo de groupe (profil)
  bannerUrl?: string; // URL de la bannière du groupe
  createdBy: string;
  createdAt: number; // Timestamp en millisecondes pour simplifier côté front
  members: string[]; // Liste des UIDs des membres
  inviteCode: string; // Code d'invitation unique
  bannedMemberIds: string[]; // UIDs des membres bannis définitivement
}

export interface CreateGroupDTO {
  name: string;
  description?: string;
}

export interface UpdateGroupDTO {
  name?: string;
  description?: string;
  photoUrl?: string;
  bannerUrl?: string;
}

/** Profil résumé d'un membre pour l'affichage dans la gestion des membres */
export interface MemberProfile {
  uid: string;
  displayName: string;
}
