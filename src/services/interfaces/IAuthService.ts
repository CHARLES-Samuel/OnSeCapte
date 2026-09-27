import type { User } from "../../models/User";

export interface IAuthService {
  getCurrentUser(): Promise<User | null>;
  signInWithGoogle(): Promise<User>;
  signOut(): Promise<void>;
  updatePseudo(pseudo: string): Promise<void>;
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}
