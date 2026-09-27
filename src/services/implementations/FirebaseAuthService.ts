import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
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
    
    // Sync to Firestore
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      }, { merge: true });
    } catch (e) {
      console.error("Erreur de synchro utilisateur", e);
    }
    
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

  async updatePseudo(pseudo: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("Aucun utilisateur connecté.");
    await updateProfile(user, { displayName: pseudo });
    
    // Update in Firestore
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { displayName: pseudo }, { merge: true });
    } catch (e) {
      console.error("Erreur de mise à jour Firestore", e);
    }
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return firebaseOnAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        callback({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        });
      } else {
        callback(null);
      }
    });
  }
}

// Export a singleton instance for simple use cases, though a DI container is better in larger apps
export const authService = new FirebaseAuthService();
