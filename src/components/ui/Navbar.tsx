import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Menu } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { EditPseudoModal } from "../features/auth/EditPseudoModal";
import { Logo } from "./Logo";
import { UserAvatar } from "./UserAvatar";
import { NavDesktopLinks } from "./navbar/NavDesktopLinks";
import { NavUserMenu } from "./navbar/NavUserMenu";
import { NavMobileDrawer } from "./navbar/NavMobileDrawer";
import { GoogleSignInButton } from "./navbar/GoogleSignInButton";

export const Navbar = () => {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [isEditPseudoModalOpen, setIsEditPseudoModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Logo gauche — toujours à la même place */}
          <Link
            to={user ? "/dashboard" : "/"}
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-xl p-1 -m-1 select-none"
            aria-label={user ? "OnSeCapte - Aller au tableau de bord" : "OnSeCapte - Aller à l'accueil"}
          >
            <Logo size="md" withContainer alt="" />
            <span className="font-bold tracking-tight text-white text-lg sm:text-xl">
              On<span className="text-primary-500">SeCapte</span>
            </span>
          </Link>

          {/* Navigation & actions Desktop */}
          <div className="hidden md:flex items-center gap-5">
            <NavDesktopLinks isAuthenticated={!!user} />

            {loading ? (
              <div className="w-10 h-10 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" aria-hidden="true" />
              </div>
            ) : user ? (
              <NavUserMenu
                user={user}
                onEditPseudo={() => setIsEditPseudoModalOpen(true)}
                onSignOut={signOut}
              />
            ) : (
              <GoogleSignInButton onClick={signInWithGoogle} />
            )}
          </div>

          {/* Actions Mobile */}
          <div className="flex md:hidden items-center gap-2">
            {loading ? (
              <div className="w-10 h-10 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" aria-hidden="true" />
              </div>
            ) : user ? (
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl border border-slate-700/80 bg-slate-800/60 hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 h-10 cursor-pointer"
                aria-label="Ouvrir le menu utilisateur"
              >
                <UserAvatar
                  photoUrl={user.photoURL}
                  name={user.displayName || "User"}
                  size="sm"
                  className="border border-slate-700"
                />
                <Menu className="w-4 h-4 text-slate-400" aria-hidden="true" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <GoogleSignInButton
                  onClick={signInWithGoogle}
                  size="sm"
                  label="Connexion"
                />
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl border border-slate-700/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 h-9 w-9 flex items-center justify-center cursor-pointer"
                  aria-label="Ouvrir le menu de navigation"
                >
                  <Menu className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Drawer mobile unifié */}
      <NavMobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        signInWithGoogle={signInWithGoogle}
        signOut={signOut}
        onEditPseudo={() => setIsEditPseudoModalOpen(true)}
      />

      {/* Modale d'édition du pseudo */}
      <EditPseudoModal
        isOpen={isEditPseudoModalOpen}
        onClose={() => setIsEditPseudoModalOpen(false)}
      />
    </>
  );
};
