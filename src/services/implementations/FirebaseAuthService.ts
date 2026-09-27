import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut 
} from "firebase/auth";
import { auth } from "../../config/firebase";
import type { IAuthService } from "../interfaces/IAuthService";
import type { User } from "../../models/User";

export class FirebaseAuthService implements IAuthService {
  async getCurrentUser(): Promise<User | null> {
    const user = auth.currentUser;
    if (!user) return null;
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
  }

  async signInWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }
}

// Export a singleton instance for simple use cases, though a DI container is better in larger apps
export const authService = new FirebaseAuthService();
