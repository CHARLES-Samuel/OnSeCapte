import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { X, Users, Home, Sparkles, Edit2, LogOut } from 'lucide-react';
import type { User } from '../../../models/User';
import { UserAvatar } from '../UserAvatar';
import { Logo } from '../Logo';
import { GoogleSignInButton } from './GoogleSignInButton';

interface NavMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  signInWithGoogle: () => void;
  signOut: () => void;
  onEditPseudo: () => void;
}

export const NavMobileDrawer: React.FC<NavMobileDrawerProps> = ({
  isOpen,
  onClose,
  user,
  signInWithGoogle,
  signOut,
  onEditPseudo,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Verrouiller le scroll de l'arrière-plan quand le drawer est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Écouteur de touche Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFeaturesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
    if (location.pathname === '/') {
      const el = document.getElementById('fonctionnalites');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', '#fonctionnalites');
      }
    } else {
      navigate('/#fonctionnalites');
    }
  };

  const handleEditPseudoClick = () => {
    onClose();
    onEditPseudo();
  };

  const handleSignOutClick = () => {
    onClose();
    signOut();
  };

  const handleSignInClick = () => {
    onClose();
    signInWithGoogle();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Menu principal">
      {/* Arrière-plan semi-transparent */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panneau latéral */}
      <div className="relative w-full max-w-xs bg-slate-900 border-l border-slate-800 p-5 shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-200 overflow-y-auto">
        <div className="space-y-6">
          {/* En-tête drawer */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <Link
              to={user ? "/dashboard" : "/"}
              onClick={onClose}
              className="flex items-center gap-2.5"
            >
              <Logo size="sm" withContainer alt="" />
              <span className="font-bold tracking-tight text-white text-base">
                On<span className="text-primary-500">SeCapte</span>
              </span>
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Section utilisateur connecté */}
          {user ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
                <UserAvatar
                  photoUrl={user.photoURL}
                  name={user.displayName || "User"}
                  size="md"
                  className="border border-slate-700 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-white truncate">
                    {user.displayName || "Utilisateur"}
                  </div>
                  {user.email && (
                    <div className="text-xs text-slate-400 truncate">{user.email}</div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={handleEditPseudoClick}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors text-left"
                >
                  <Edit2 className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                  <span>Modifier mon pseudo</span>
                </button>

                <Link
                  to="/dashboard"
                  onClick={onClose}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <Users className="w-4 h-4 text-primary-400 shrink-0" aria-hidden="true" />
                  <span>Mes Groupes</span>
                </Link>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleSignOutClick}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-red-400 shrink-0" aria-hidden="true" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            </div>
          ) : (
            /* Section visiteur déconnecté */
            <div className="space-y-4">
              <nav className="space-y-1">
                <Link
                  to="/"
                  onClick={onClose}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <Home className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                  <span>Accueil</span>
                </Link>
                <a
                  href="/#fonctionnalites"
                  onClick={handleFeaturesClick}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-primary-400 shrink-0" aria-hidden="true" />
                  <span>Fonctionnalités</span>
                </a>
              </nav>

              <div className="pt-3 border-t border-slate-800">
                <GoogleSignInButton
                  onClick={handleSignInClick}
                  size="full"
                  label="Se connecter avec Google"
                />
              </div>
            </div>
          )}
        </div>

        {/* Liens légaux en bas de drawer */}
        <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-400 space-y-2">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <Link to="/mentions-legales" onClick={onClose} className="hover:text-slate-200">
              Mentions
            </Link>
            <span>•</span>
            <Link to="/confidentialite" onClick={onClose} className="hover:text-slate-200">
              Confidentialité
            </Link>
            <span>•</span>
            <Link to="/cookies" onClick={onClose} className="hover:text-slate-200">
              Cookies
            </Link>
          </div>
          <div>&copy; {new Date().getFullYear()} OnSeCapte</div>
        </div>
      </div>
    </div>
  );
};
