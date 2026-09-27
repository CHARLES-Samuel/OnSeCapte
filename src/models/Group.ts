export interface Group {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: number; // Timestamp en millisecondes pour simplifier côté front
  members: string[]; // Liste des UIDs des membres
  inviteCode: string; // Code d'invitation unique
}

export interface CreateGroupDTO {
  name: string;
  description?: string;
}
