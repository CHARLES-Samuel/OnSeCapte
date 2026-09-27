import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../models/User";
import { authService } from "../services/implementations/FirebaseAuthService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updatePseudo: (pseudo: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // S'abonner aux changements d'état d'authentification
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Nettoyage de l'abonnement
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await authService.signInWithGoogle();
    } catch (error) {
      console.error("Erreur lors de la connexion avec Google", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error("Erreur lors de la déconnexion", error);
      throw error;
    }
  };

  const updatePseudo = async (pseudo: string) => {
    try {
      await authService.updatePseudo(pseudo);
      // Force refresh the user state by fetching the current user again
      const updatedUser = await authService.getCurrentUser();
      if (updatedUser) {
        setUser(updatedUser);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du pseudo", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, updatePseudo }}>
      {children}
    </AuthContext.Provider>
  );
};
